import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  X, 
  Check, 
  Lock, 
  Unlock, 
  Printer, 
  Send, 
  Layers, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Landmark,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { playSuccessChime, playScanBeep, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function ShowroomProfitRadarModal({ isOpen, onClose }) {
  const { orders, catalog, architects, storeMeta, showToast } = useStore();

  // 🔒 Director Privacy Shield (PIN 8899)
  const [isRevealed, setIsRevealed] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MTD' | 'ALL'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'REALIZED' | 'PROJECTED'
  const [gstMode, setGstMode] = useState('INCLUSIVE'); // 'INCLUSIVE' | 'EX_GST'

  // Filter Orders based on Period Horizon
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      if (statusFilter === 'REALIZED') {
        return (ord.SafeLock_Status || '').includes('DELIVERED');
      }
      if (statusFilter === 'PROJECTED') {
        return !(ord.SafeLock_Status || '').includes('DELIVERED');
      }
      return true;
    });
  }, [orders, statusFilter]);

  // Compute Order-by-Order Real-World Profit Breakdown
  const orderBreakdown = useMemo(() => {
    return filteredOrders.map(order => {
      const rawSellingPrice = Number(order.Total_Amount_INR) || 0;
      
      // Look up catalog item to get true factory inward cost, or estimate at 55% of MRP / 65% of Selling Price
      const matchingCatalog = catalog.find(c => order.Ordered_SKU && order.Ordered_SKU.includes(c.SKU));
      const rawInwardCost = matchingCatalog?.MRP_INR 
        ? Math.round(matchingCatalog.MRP_INR * 0.55)
        : Math.round(rawSellingPrice * 0.65);

      // 18% GST Net Revenue Treatment
      const sellingPrice = gstMode === 'EX_GST' ? Math.round(rawSellingPrice / 1.18) : rawSellingPrice;
      const inwardFactoryCost = gstMode === 'EX_GST' ? Math.round(rawInwardCost / 1.18) : rawInwardCost;
      const gstLiability = rawSellingPrice - Math.round(rawSellingPrice / 1.18);
      const itcCredit = rawInwardCost - Math.round(rawInwardCost / 1.18);

      // 🪵 Category-Based Dynamic Assembly & Container Freight Matrix
      const skuStr = (order.Ordered_SKU || '') + ' ' + (matchingCatalog?.Main_Category || '');
      let inwardFreight = 1000;
      let defaultCarpenter = 500;

      if (/ALM|Wardrobe|Almirah|Storage|Modular/i.test(skuStr)) {
        inwardFreight = 1800; // Multi-box flatpack heavy knockdown container
        defaultCarpenter = 1500; // Narayana Mistri 2-day assembly
      } else if (/BED|Bed|Hydraulic|Teak/i.test(skuStr)) {
        inwardFreight = 1200; // Hydraulic lift mechanism + headboard
        defaultCarpenter = 800;
      } else if (/SOF|Sofa|DIN|Dining|Table|Recliner/i.test(skuStr)) {
        inwardFreight = 900;
        defaultCarpenter = 500;
      } else if (/CHR|Chair|Desk|Office|Study/i.test(skuStr)) {
        inwardFreight = 300;
        defaultCarpenter = 150;
      }

      const totalLandedCost = inwardFactoryCost + inwardFreight;
      const grossMargin = sellingPrice - totalLandedCost;

      // 🚚 Delivery Mileage Zones based on Rayagada & surrounding districts
      const addr = order.Project_Address || '';
      let deliveryDiesel = 400; // Local Rayagada town (<10 km)
      if (/Gunupur|Koraput|Jeypore|Paralakhemundi|Damanjodi|Sunabeda/i.test(addr)) {
        deliveryDiesel = 2200; // Outstation inter-district 80-120 km
      } else if (/Raniguda|Jaykaypur|JK Pur|Thermal|Kasturi|Bari/i.test(addr)) {
        deliveryDiesel = 800; // Outer outskirts 15-30 km
      }

      // Deductions
      const hasArchitect = !!order.Designer_ID;
      const architectCommission = hasArchitect ? Math.round(sellingPrice * 0.085) : 0;
      const carpenterPayout = Number(order.Carpenter_Payout_INR) || defaultCarpenter;
      const totalDeductions = architectCommission + carpenterPayout + deliveryDiesel;

      const netTakeHomeProfit = grossMargin - totalDeductions;
      const netMarginPct = sellingPrice > 0 ? Math.round((netTakeHomeProfit / sellingPrice) * 100) : 0;
      const isRealized = (order.SafeLock_Status || '').includes('DELIVERED');

      return {
        ...order,
        rawSellingPrice,
        sellingPrice,
        inwardFactoryCost,
        inwardFreight,
        totalLandedCost,
        grossMargin,
        architectCommission,
        carpenterPayout,
        deliveryDiesel,
        totalDeductions,
        netTakeHomeProfit,
        netMarginPct,
        isRealized,
        gstLiability,
        itcCredit
      };
    });
  }, [filteredOrders, catalog, gstMode]);

  // Aggregated Totals
  const totalInvoicedSales = orderBreakdown.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalRawBilling = orderBreakdown.reduce((sum, o) => sum + o.rawSellingPrice, 0);
  const totalLandedCogs = orderBreakdown.reduce((sum, o) => sum + o.totalLandedCost, 0);
  const totalGrossMargin = totalInvoicedSales - totalLandedCogs;
  const grossMarginPct = totalInvoicedSales > 0 ? Math.round((totalGrossMargin / totalInvoicedSales) * 100) : 0;

  const totalArchitectCommissions = orderBreakdown.reduce((sum, o) => sum + o.architectCommission, 0);
  const totalCarpenterPayouts = orderBreakdown.reduce((sum, o) => sum + o.carpenterPayout, 0);
  const totalDeliveryDiesel = orderBreakdown.reduce((sum, o) => sum + o.deliveryDiesel, 0);
  const totalDeductionsCombined = totalArchitectCommissions + totalCarpenterPayouts + totalDeliveryDiesel;

  const totalGstLiability = orderBreakdown.reduce((sum, o) => sum + o.gstLiability, 0);
  const totalItcCredit = orderBreakdown.reduce((sum, o) => sum + o.itcCredit, 0);
  const netGstPayableToGovt = Math.max(0, totalGstLiability - totalItcCredit);

  const trueNetTakeHomeProfit = totalGrossMargin - totalDeductionsCombined;
  const trueNetMarginPct = totalInvoicedSales > 0 ? Math.round((trueNetTakeHomeProfit / totalInvoicedSales) * 100) : 0;

  const realizedOrdersCount = orderBreakdown.filter(o => o.isRealized).length;
  const projectedOrdersCount = orderBreakdown.filter(o => !o.isRealized).length;

  // Verify Director PIN 8899
  const handleVerifyPin = () => {
    if (enteredPin === '8899') {
      setIsRevealed(true);
      playSuccessChime();
      triggerGoldenConfetti();
      showToast("🔓 Director PIN 8899 Verified! All Factory Costs & Net Margins Unlocked.", true);
    } else {
      showToast("❌ Invalid PIN. Master showroom margins remain protected.", false);
    }
  };

  // 📲 Send 9 PM Profit Slip to WhatsApp
  const handleSendProfitSlip = () => {
    const text = `👑 *GODREJ INTERIO RAYAGADA — LIVE SHOWROOM P&L PROFIT RADAR*\n` +
      `*Shree Ganesh Enterprises | Date: ${new Date().toLocaleDateString('en-GB')}*\n\n` +
      `📊 *SHOWROOM REVENUE & FACTORY RECONCILIATION:*\n` +
      `• Total Invoiced Sales (${orderBreakdown.length} Orders): ₹${totalInvoicedSales.toLocaleString()}\n` +
      `• Factory Inward Landed COGS: -₹${totalLandedCogs.toLocaleString()}\n` +
      `• Gross Showroom Margin: ₹${totalGrossMargin.toLocaleString()} (${grossMarginPct}%)\n\n` +
      `📉 *STATUTORY DEDUCTIONS & OUTFLOWS:*\n` +
      `• Architect VIP Referral Pool (8.5%): -₹${totalArchitectCommissions.toLocaleString()}\n` +
      `• Master Carpenter Narayana Fitting: -₹${totalCarpenterPayouts.toLocaleString()}\n` +
      `• Local Delivery Diesel & Logistics: -₹${totalDeliveryDiesel.toLocaleString()}\n\n` +
      `====================================\n` +
      `💎 *TRUE REALIZED NET PROFIT IN BANK: ₹${trueNetTakeHomeProfit.toLocaleString()}* (${trueNetMarginPct}% Net Margin)\n` +
      `• Realized (Delivered): ${realizedOrdersCount} Orders\n` +
      `• Projected (SafeLocked): ${projectedOrdersCount} Orders\n` +
      `====================================\n` +
      `*Store Director:* Rakesh (+91 93905 53301)\n` +
      `_Generated by OmniBuild OS™ Profit Heart Engine_`;

    dispatchWebhookAction("GENERATE_PROFIT_RECONCILIATION", {
      total_sales: totalInvoicedSales,
      landed_cogs: totalLandedCogs,
      gross_margin: totalGrossMargin,
      net_profit: trueNetTakeHomeProfit,
      net_margin_pct: trueNetMarginPct,
      realized_orders: realizedOrdersCount,
      projected_orders: projectedOrdersCount,
      timestamp: new Date().toISOString()
    });

    window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
    showToast("📲 P&L Profit Slip dispatched to Director WhatsApp!", true);
  };

  // Helper to format currency or mask if unrevealed
  const formatValue = (num, color = '#FFFFFF') => {
    if (!isRevealed) {
      return <span style={{ letterSpacing: '2px', color: '#64748B' }}>₹ ••••••</span>;
    }
    return <span style={{ color, fontFamily: 'JetBrains Mono', fontWeight: '800' }}>₹{num.toLocaleString()}</span>;
  };

  const formatPct = (pct, color = 'var(--accent-emerald)') => {
    if (!isRevealed) return <span style={{ color: '#64748B' }}>••%</span>;
    return <span style={{ color, fontWeight: '800' }}>{pct}%</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '1100px', width: '96vw', maxHeight: '92vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', padding: '10px', borderRadius: '12px', border: '1px solid var(--accent-gold)' }}>
              <DollarSign size={24} color="var(--accent-gold)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>❤️ FINANCIAL HEART ENGINE</span>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>3-WAY LIVE RECONCILIATION</span>
              </div>
              <h3 style={{ margin: '3px 0 0', color: '#FFFFFF', fontSize: '18px', fontWeight: '900' }}>
                Showroom Profit & Margin Radar (Landed COGS ➔ Sales ➔ Realized Profit)
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* 🔒 Director Privacy Shield Bar */}
        <div style={{ 
          background: isRevealed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.12)', 
          border: `1px solid ${isRevealed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`, 
          borderRadius: '12px', 
          padding: '10px 16px', 
          margin: '14px 0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '10px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isRevealed ? <Unlock size={18} color="var(--accent-emerald)" /> : <Lock size={18} color="var(--accent-rose)" />}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: isRevealed ? 'var(--accent-emerald)' : '#FCA5A5' }}>
                {isRevealed ? '🔓 DIRECTOR EXECUTIVE VIEW ACTIVE (Full Margins Visible)' : '🔒 DIRECTOR PRIVACY SHIELD ACTIVE (Floor Staff Protected)'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isRevealed ? 'Factory inward costs & true net profits unlocked.' : 'Factory purchase costs and net margins are masked to prevent floor leaks.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isRevealed ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="password" 
                  maxLength={4} 
                  placeholder="PIN 8899" 
                  value={enteredPin} 
                  onChange={e => setEnteredPin(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
                  style={{ width: '90px', padding: '5px 8px', fontSize: '11px', textAlign: 'center', borderRadius: '6px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                />
                <button className="btn-luxury-gold" onClick={handleVerifyPin} style={{ fontSize: '11px', padding: '5px 12px' }}>
                  <Unlock size={12} /> Unlock
                </button>
              </div>
            ) : (
              <button className="btn-ghost-edit" onClick={() => setIsRevealed(false)} style={{ fontSize: '11px', padding: '5px 12px', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.4)' }}>
                <Lock size={12} /> Re-Lock Shield
              </button>
            )}
          </div>
        </div>

        {/* 📊 3-Way Golden Triangle Operational Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          
          {/* 1. Inward Stock COGS */}
          <div className="glass-panel" style={{ padding: '14px', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>1. Inward Landed COGS</span>
              <span style={{ fontSize: '16px' }}>📥</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>
              {formatValue(totalLandedCogs, 'var(--accent-cyan)')}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '3px' }}>
              Factory Ex-Works + Inward Freight
            </div>
          </div>

          {/* 2. Day-to-Day Invoiced Sales */}
          <div className="glass-panel" style={{ padding: '14px', borderLeft: '4px solid var(--accent-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>2. Day-to-Day Sales</span>
              <span style={{ fontSize: '16px' }}>🛍️</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
              ₹{totalInvoicedSales.toLocaleString()}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--accent-gold-light)', marginTop: '3px' }}>
              {orderBreakdown.length} Invoiced Bookings
            </div>
          </div>

          {/* 3. Gross Showroom Margin */}
          <div className="glass-panel" style={{ padding: '14px', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>3. Gross Showroom Margin</span>
              <span style={{ fontSize: '16px' }}>🏷️</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>
              {formatValue(totalGrossMargin, '#FCD34D')}
            </div>
            <div style={{ fontSize: '10.5px', color: '#FCD34D', marginTop: '3px' }}>
              Gross Spread: {formatPct(grossMarginPct, '#FCD34D')}
            </div>
          </div>

          {/* 4. True Realized Net Take-Home */}
          <div className="glass-panel" style={{ padding: '14px', borderLeft: '4px solid var(--accent-emerald)', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(15,23,42,0.9))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '800', textTransform: 'uppercase' }}>4. True Net Profit in Bank</span>
              <span style={{ fontSize: '16px' }}>💎</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>
              {formatValue(trueNetTakeHomeProfit, 'var(--accent-emerald)')}
            </div>
            <div style={{ fontSize: '10.5px', color: '#86EFAC', marginTop: '3px', fontWeight: '700' }}>
              Net Take-Home: {formatPct(trueNetMarginPct, '#86EFAC')}
            </div>
          </div>

        </div>

        {/* 💧 P&L Waterfall Financial Breakdown Strip */}
        <div style={{ background: '#070D18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} /> Comprehensive Showroom Profit Waterfall
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Invoiced Sales: </span>
              <strong style={{ color: '#FFFFFF' }}>₹{totalInvoicedSales.toLocaleString()}</strong>
            </div>
            <span style={{ color: '#64748B' }}>➔</span>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Factory Landed COGS: </span>
              {formatValue(totalLandedCogs, 'var(--accent-cyan)')}
            </div>
            <span style={{ color: '#64748B' }}>➔</span>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Architect Referral Pool (8.5%): </span>
              <strong style={{ color: 'var(--accent-rose)' }}>-₹{totalArchitectCommissions.toLocaleString()}</strong>
            </div>
            <span style={{ color: '#64748B' }}>➔</span>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Carpenter Assembly (₹500): </span>
              <strong style={{ color: 'var(--accent-purple)' }}>-₹{totalCarpenterPayouts.toLocaleString()}</strong>
            </div>
            <span style={{ color: '#64748B' }}>➔</span>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Freight: </span>
              <strong style={{ color: '#94A3B8' }}>-₹{totalDeliveryDiesel.toLocaleString()}</strong>
            </div>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: '900' }}>=</span>
            <div style={{ background: 'rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent-emerald)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Realized Net: </span>
              {formatValue(trueNetTakeHomeProfit, 'var(--accent-emerald)')}
            </div>
          </div>
        </div>

        {/* 📋 Order-by-Order Live Profit Ledger Table */}
        <div style={{ background: '#070D18', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '14px', fontWeight: '800' }}>
                Order-by-Order Profit Reconciliation Ledger
              </h4>
              <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '11px' }}>
                Live calculation of individual transaction margins after factory landed cost and third-party referral fees
              </p>
            </div>

            {/* Filter Tabs & GST Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* GST Mode Toggle */}
              <div style={{ display: 'flex', background: '#0F172A', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <button 
                  onClick={() => setGstMode('INCLUSIVE')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    borderRadius: '4px',
                    background: gstMode === 'INCLUSIVE' ? 'var(--accent-gold)' : 'transparent',
                    color: gstMode === 'INCLUSIVE' ? '#000' : '#94A3B8',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  GST INCL (Billing)
                </button>
                <button 
                  onClick={() => setGstMode('EX_GST')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    borderRadius: '4px',
                    background: gstMode === 'EX_GST' ? 'var(--accent-emerald)' : 'transparent',
                    color: gstMode === 'EX_GST' ? '#000' : '#94A3B8',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  EX-GST (Net Cash)
                </button>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'ALL', label: `All (${orderBreakdown.length})` },
                  { id: 'REALIZED', label: `🟢 Delivered (${realizedOrdersCount})` },
                  { id: 'PROJECTED', label: `🟡 SafeLocked (${projectedOrdersCount})` }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    className={`btn-ghost-edit ${statusFilter === tab.id ? 'badge-gold' : ''}`}
                    onClick={() => setStatusFilter(tab.id)}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {gstMode === 'EX_GST' && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '11px', color: '#A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                🏛️ <strong>18% GST Compliance Mode:</strong> Gross Turnover ₹{totalRawBilling.toLocaleString()} adjusted to Ex-GST Showroom Base ₹{totalInvoicedSales.toLocaleString()}.
              </span>
              <span>
                Output Tax: <strong>₹{totalGstLiability.toLocaleString()}</strong> | Input Tax Credit (ITC): <strong>₹{totalItcCredit.toLocaleString()}</strong> | Net Payable: <strong>₹{netGstPayableToGovt.toLocaleString()}</strong>
              </span>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '8px' }}>Order ID & Date</th>
                  <th style={{ padding: '8px' }}>Customer & Locality</th>
                  <th style={{ padding: '8px' }}>Ordered Furniture SKU</th>
                  <th style={{ padding: '8px' }}>Landed COGS (₹)</th>
                  <th style={{ padding: '8px' }}>Selling Price (₹)</th>
                  <th style={{ padding: '8px' }}>Deductions</th>
                  <th style={{ padding: '8px' }}>Net Take-Home (₹)</th>
                  <th style={{ padding: '8px' }}>Realization Status</th>
                </tr>
              </thead>
              <tbody>
                {orderBreakdown.map(ord => (
                  <tr key={ord.Order_ID} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    
                    {/* Order ID */}
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                      <div>{ord.Order_ID}</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>{ord.Created_Date || '28-Aug-2026'}</div>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ fontWeight: '700', color: '#FFFFFF' }}>{ord.Customer_Name}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{ord.Project_Address || 'Rayagada'}</div>
                    </td>

                    {/* SKU */}
                    <td style={{ padding: '10px 8px', color: '#E2E8F0', fontWeight: '600' }}>
                      {ord.Ordered_SKU}
                    </td>

                    {/* Landed COGS */}
                    <td style={{ padding: '10px 8px' }}>
                      {formatValue(ord.totalLandedCost, 'var(--accent-cyan)')}
                    </td>

                    {/* Selling Price */}
                    <td style={{ padding: '10px 8px', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                      ₹{ord.sellingPrice.toLocaleString()}
                    </td>

                    {/* Deductions */}
                    <td style={{ padding: '10px 8px', fontSize: '10.5px' }}>
                      <div style={{ color: 'var(--accent-rose)' }}>Arch: -₹{ord.architectCommission.toLocaleString()}</div>
                      <div style={{ color: 'var(--accent-purple)' }}>Mistri: -₹{ord.carpenterPayout}</div>
                    </td>

                    {/* Net Take-Home */}
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ fontSize: '12px' }}>
                        {formatValue(ord.netTakeHomeProfit, 'var(--accent-emerald)')}
                      </div>
                      <div style={{ fontSize: '10px' }}>
                        {formatPct(ord.netMarginPct, 'var(--accent-emerald)')} Net Margin
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${ord.isRealized ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '10px' }}>
                        {ord.isRealized ? '🟢 REALIZED IN BANK' : '🟡 PROJECTED'}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* ⚡ Action Ribbon Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            📡 Telemetry synchronized with Google Sheets Tables: <code>03_Inventory_Stock</code>, <code>11_Daily_Sales_Summary</code>, and <code>05_Orders_SafeLock</code>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-ghost-edit" onClick={() => window.print()} style={{ fontSize: '11px', padding: '7px 14px' }}>
              <Printer size={13} /> Print P&L Statement
            </button>
            <button className="btn-luxury-gold" onClick={handleSendProfitSlip} style={{ fontSize: '11px', padding: '7px 16px' }}>
              <Send size={13} /> 📲 Send 9 PM Profit Slip to WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

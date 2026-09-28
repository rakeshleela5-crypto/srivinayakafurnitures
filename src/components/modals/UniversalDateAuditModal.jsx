// ==============================================================================
// OmniBuild OS™ — Universal Date Filter Audit & Daybook Pop-Up Modal
// Pops up across all screens on "Display" click with complete date-range data
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Calendar, 
  Search, 
  Printer, 
  Download, 
  RefreshCw, 
  X, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  FileText, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  Building2, 
  ArrowUpRight, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { formatDisplayDate } from '../common/UniversalAuditWindowBar';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export function UniversalDateAuditModal({ isOpen, onClose, data = {} }) {
  const { 
    auditDateWindow, 
    updateAuditWindow, 
    orders = [], 
    inquiries = [], 
    tallyVouchers = [], 
    bankTransactions = [], 
    supplierInvoices = [], 
    routeStops = [], 
    activeTab, 
    showToast 
  } = useStore();

  // Internal interactive date window states
  const [fromDate, setFromDate] = useState(data.fromDate || auditDateWindow?.fromDate || '2026-09-28');
  const [toDate, setToDate] = useState(data.toDate || auditDateWindow?.toDate || '2026-09-28');
  const [activePreset, setActivePreset] = useState(auditDateWindow?.activePreset || 'Today');
  
  // Search and Tab controls
  const [searchTerm, setSearchTerm] = useState('');
  
  // Determine initial active sub-tab based on caller's context
  const initialSubTab = useMemo(() => {
    const callerTab = data.context || activeTab;
    if (callerTab === 'tally_gst_desk') return 'tally_vouchers';
    if (callerTab === 'autoprocure') return 'procurement';
    if (callerTab === 'logistics_epod' || callerTab === 'autonomous_fleet') return 'logistics';
    if (callerTab === 'bank_ledger' || callerTab === 'bank_statement') return 'bank';
    if (callerTab === 'crm') return 'inquiries';
    return 'all_daybook';
  }, [data.context, activeTab]);

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  if (!isOpen) return null;

  // Preset Application inside the Modal
  const handleApplyPreset = (presetName) => {
    playScanBeep();
    const baseToday = new Date('2026-09-28T00:00:00');
    let s = '2026-09-28';
    let e = '2026-09-28';

    if (presetName === 'Today') {
      s = '2026-09-28';
      e = '2026-09-28';
    } else if (presetName === 'Yesterday') {
      s = '2026-09-27';
      e = '2026-09-27';
    } else if (presetName === 'Last 7 Days') {
      s = '2026-09-22';
      e = '2026-09-28';
    } else if (presetName === 'This Month') {
      s = '2026-09-01';
      e = '2026-09-30';
    } else if (presetName === 'FY Year') {
      s = '2026-04-01';
      e = '2027-03-31';
    }

    setFromDate(s);
    setToDate(e);
    setActivePreset(presetName);

    updateAuditWindow({
      fromDate: s,
      toDate: e,
      appliedFrom: s,
      appliedTo: e,
      activePreset: presetName
    });

    showToast(`📅 Filter synced to: ${presetName} (${formatDisplayDate(s)} to ${formatDisplayDate(e)})`);
  };

  // Manual Date Range Submit inside Modal
  const handleApplyCustomRange = (e) => {
    if (e) e.preventDefault();
    if (fromDate > toDate) {
      showToast('⚠️ Start Date cannot be after End Date!', false);
      return;
    }
    playScanBeep();
    setActivePreset('Custom Range');
    updateAuditWindow({
      fromDate,
      toDate,
      appliedFrom: fromDate,
      appliedTo: toDate,
      activePreset: 'Custom Range'
    });
    showToast(`⚡ Recalculated Audit Range: ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}`);
  };

  // Helper date checker
  const isDateBetween = (dateStr) => {
    if (!dateStr) return true;
    let iso = '';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      iso = dateStr.slice(0, 10);
    } else {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        iso = d.toISOString().slice(0, 10);
      } else {
        return true;
      }
    }
    return iso >= fromDate && iso <= toDate;
  };

  // 1. Filtered Orders (Sales)
  const filteredOrders = orders.filter(o => {
    const inDate = isDateBetween(o.Created_At || o.Order_Date || '2026-09-28');
    if (!inDate) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (o.Customer_Name || '').toLowerCase().includes(term) ||
      (o.Order_ID || '').toLowerCase().includes(term) ||
      (o.Customer_Phone || '').includes(term) ||
      (o.Ordered_SKU || '').toLowerCase().includes(term)
    );
  });

  // 2. Filtered Tally Vouchers
  const filteredVouchers = tallyVouchers.filter(v => {
    const inDate = isDateBetween(v.voucher_date || '2026-09-28');
    if (!inDate) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (v.voucher_no || '').toLowerCase().includes(term) ||
      (v.party_ledger || '').toLowerCase().includes(term) ||
      (v.narration || '').toLowerCase().includes(term) ||
      (v.voucher_type || '').toLowerCase().includes(term)
    );
  });

  // 3. Filtered Inquiries (CRM Leads)
  const filteredInquiries = inquiries.filter(iq => {
    const inDate = isDateBetween(iq.inquiry_date || iq.created_at || '2026-09-28');
    if (!inDate) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (iq.customer_name || '').toLowerCase().includes(term) ||
      (iq.phone || '').includes(term) ||
      (iq.category || '').toLowerCase().includes(term) ||
      (iq.status || '').toLowerCase().includes(term)
    );
  });

  // 4. Filtered Bank Transactions
  const filteredBankTxns = bankTransactions.filter(bt => {
    const inDate = isDateBetween(bt.Date || bt.txn_date || '2026-09-28');
    if (!inDate) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (bt.Description || '').toLowerCase().includes(term) ||
      (bt.Reference_No || '').toLowerCase().includes(term) ||
      (bt.Category || '').toLowerCase().includes(term)
    );
  });

  // 5. Filtered Logistics Dispatches / Route Stops
  const filteredRouteStops = routeStops.filter(rs => {
    const inDate = isDateBetween(rs.scheduledDate || rs.dispatchDate || '2026-09-28');
    if (!inDate) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (rs.customerName || '').toLowerCase().includes(term) ||
      (rs.address || '').toLowerCase().includes(term) ||
      (rs.driverName || '').toLowerCase().includes(term) ||
      (rs.sku || '').toLowerCase().includes(term)
    );
  });

  // 6. Master Unified Daybook Aggregate
  const masterDaybook = useMemo(() => {
    const list = [];

    // Map Orders as Sales Entries
    filteredOrders.forEach(o => {
      list.push({
        id: o.Order_ID || `ORD-${Math.random()}`,
        time: o.Created_At ? o.Created_At.slice(11, 16) : '10:30',
        date: o.Created_At ? o.Created_At.slice(0, 10) : fromDate,
        type: 'SALE_ORDER',
        typeLabel: 'Retail / Commercial Order',
        party: o.Customer_Name || 'Walk-In Customer',
        phone: o.Customer_Phone || '—',
        details: o.Ordered_SKU || 'Teak / Modular Furniture',
        inflow: Number(o.Advance_Paid_INR || o.Total_Amount_INR || 0),
        outflow: 0,
        status: o.SafeLock_Status || 'CONFIRMED',
        badgeColor: '#10B981',
        raw: o
      });
    });

    // Map Tally Vouchers
    filteredVouchers.forEach(v => {
      const isReceiptOrSale = v.voucher_type === 'RECEIPT' || v.voucher_type === 'SALES';
      list.push({
        id: v.voucher_no || v.voucher_id,
        time: '12:00',
        date: v.voucher_date || fromDate,
        type: 'TALLY_VOUCHER',
        typeLabel: `Tally ${v.voucher_type}`,
        party: v.party_ledger || 'General Ledger',
        phone: 'Accounts Desk',
        details: v.narration || `${v.voucher_type} Entry`,
        inflow: isReceiptOrSale ? Number(v.amount_inr || 0) : 0,
        outflow: !isReceiptOrSale ? Number(v.amount_inr || 0) : 0,
        status: v.status || 'POSTED',
        badgeColor: '#F59E0B',
        raw: v
      });
    });

    // Map Bank Txns
    filteredBankTxns.forEach(bt => {
      list.push({
        id: bt.Reference_No || `BNK-${Math.random()}`,
        time: '14:15',
        date: bt.Date || fromDate,
        type: 'BANK_TXN',
        typeLabel: bt.Type === 'CR' ? 'Bank Credit (Inward)' : 'Bank Debit (Outward)',
        party: bt.Description || 'Bank Account Movement',
        phone: bt.Category || 'RTGS / NEFT / UPI',
        details: `Txn Ref: ${bt.Reference_No || 'N/A'}`,
        inflow: bt.Type === 'CR' ? Number(bt.Amount_INR || 0) : 0,
        outflow: bt.Type === 'DR' ? Number(bt.Amount_INR || 0) : 0,
        status: 'SETTLED',
        badgeColor: bt.Type === 'CR' ? '#38BDF8' : '#F43F5E',
        raw: bt
      });
    });

    // Sort descending by date
    return list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [filteredOrders, filteredVouchers, filteredBankTxns, fromDate]);

  // Aggregate Metrics in Date Horizon
  const metrics = useMemo(() => {
    const grossRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.Total_Amount_INR) || 0), 0);
    const advanceCollected = filteredOrders.reduce((sum, o) => sum + (Number(o.Advance_Paid_INR) || 0), 0);
    const voucherInflow = filteredVouchers
      .filter(v => v.voucher_type === 'SALES' || v.voucher_type === 'RECEIPT')
      .reduce((sum, v) => sum + (Number(v.amount_inr) || 0), 0);
    const voucherOutflow = filteredVouchers
      .filter(v => v.voucher_type === 'PAYMENT' || v.voucher_type === 'PURCHASE')
      .reduce((sum, v) => sum + (Number(v.amount_inr) || 0), 0);
    
    const totalInflow = Math.max(grossRevenue, voucherInflow);
    const estimatedGst18 = Math.round(totalInflow * 0.18 / 1.18);
    const netMarginEstimate = Math.round(totalInflow * 0.32);

    return {
      totalInflow,
      advanceCollected,
      totalOutflow: voucherOutflow,
      estimatedGst18,
      netMarginEstimate,
      ordersCount: filteredOrders.length,
      vouchersCount: filteredVouchers.length,
      inquiriesCount: filteredInquiries.length,
      dispatchesCount: filteredRouteStops.length
    };
  }, [filteredOrders, filteredVouchers, filteredInquiries, filteredRouteStops]);

  // Print Audit Daybook Slip
  const handlePrintAudit = () => {
    playScanBeep();
    window.print();
  };

  // Export to CSV
  const handleExportCsv = () => {
    playSuccessChime();
    const rows = [
      ['Date', 'Type', 'Reference ID', 'Party / Ledger', 'Details / SKU', 'Inflow (INR)', 'Outflow (INR)', 'Status'],
      ...masterDaybook.map(d => [
        d.date,
        d.typeLabel,
        d.id,
        `"${(d.party || '').replace(/"/g, '""')}"`,
        `"${(d.details || '').replace(/"/g, '""')}"`,
        d.inflow || 0,
        d.outflow || 0,
        d.status
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniBuild_Audit_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerGoldenConfetti();
    showToast(`📥 Exported Daybook CSV for ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}!`, true);
  };

  // Tally Prime XML Sync Simulation
  const handleTallyXmlSync = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`⚡ ${filteredVouchers.length} Vouchers & Daybook Records Synced with Tally Prime 9 Gateway!`, true);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-card modal-xl" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '1180px',
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #070B16 0%, #0B132B 100%)',
          border: '2px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15)',
          borderRadius: '16px',
          padding: '20px 24px',
          overflow: 'hidden'
        }}
      >
        {/* ================= HEADER ================= */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(34, 197, 94, 0.2) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              🏛️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
                  OMNIBUILD OS™ UNIVERSAL AUDIT POP-UP
                </span>
                <span style={{ 
                  background: '#22C55E', 
                  color: '#FFFFFF', 
                  padding: '1px 8px', 
                  borderRadius: '12px', 
                  fontSize: '9.5px', 
                  fontWeight: '900',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)'
                }}>
                  DISPLAY ACTIVE
                </span>
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Statutory Daybook & Revenue Audit</span>
                <span style={{ color: '#F59E0B', fontSize: '15px', fontWeight: '700' }}>
                  ({formatDisplayDate(fromDate)} ➔ {formatDisplayDate(toDate)})
                </span>
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handlePrintAudit} 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Print Voucher Daybook Report"
            >
              <Printer size={13} /> Print Slip
            </button>
            <button 
              onClick={handleExportCsv} 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              title="Download Daybook CSV"
            >
              <Download size={13} /> Export CSV
            </button>
            <button 
              className="btn-close-modal" 
              onClick={onClose}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '6px', color: '#FFF', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= INTERACTIVE DATE CONTROLS BAR ================= */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px'
        }}>
          {/* Left Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {/* From Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B' }}>From :</span>
              <input 
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  background: '#0B132B',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* To Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B' }}>To :</span>
              <input 
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{
                  background: '#0B132B',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Recalculate Green Display Button */}
            <button
              onClick={handleApplyCustomRange}
              style={{
                background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: '1px solid #4ADE80',
                borderRadius: '6px',
                padding: '4px 14px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.35)'
              }}
            >
              <RefreshCw size={12} /> Recalculate
            </button>

            {/* Quick Chips */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
              {['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'FY Year'].map(preset => {
                const isActive = activePreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      background: isActive ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#F59E0B' : '#94A3B8',
                      border: isActive ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: isActive ? '800' : '600',
                      cursor: 'pointer'
                    }}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search within Results */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Search party, voucher, order..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#0B132B',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '5px 10px 5px 30px',
                fontSize: '11.5px',
                color: '#FFF',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* ================= 5-PILLAR FINANCIAL METRICS BAR ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '10px',
          marginBottom: '14px'
        }}>
          {/* Card 1: Gross Inflow / Sales */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '10px', color: '#86EFAC', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>💰 Gross Inflow / Sales</span>
              <TrendingUp size={12} color="#22C55E" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
              ₹{metrics.totalInflow.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
              {metrics.ordersCount} Retail & B2B Orders
            </div>
          </div>

          {/* Card 2: Advance Collected */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '10px', color: '#7DD3FC', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>⚡ Liquid Cash / UPI</span>
              <CreditCard size={12} color="#38BDF8" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#38BDF8', marginTop: '4px' }}>
              ₹{metrics.advanceCollected.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
              Instant Token Advance Settled
            </div>
          </div>

          {/* Card 3: Outflow / Expenses */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '10px', color: '#FDA4AF', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📦 Outflow / Procurement</span>
              <TrendingDown size={12} color="#F43F5E" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#F43F5E', marginTop: '4px' }}>
              ₹{metrics.totalOutflow.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
              Supplier Vouchers & Payments
            </div>
          </div>

          {/* Card 4: Estimated 18% GST */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '10px', color: '#FCD34D', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🏛️ Statutory GST (18%)</span>
              <FileText size={12} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#F59E0B', marginTop: '4px' }}>
              ₹{metrics.estimatedGst18.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
              CGST + SGST Output Tax Pool
            </div>
          </div>

          {/* Card 5: Est. Net Margin */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '10px', color: '#D8B4FE', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>👑 Est. Net Margin</span>
              <Building2 size={12} color="#A855F7" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#D8B4FE', marginTop: '4px' }}>
              ₹{metrics.netMarginEstimate.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
              ~32% Showroom Gross Profit
            </div>
          </div>
        </div>

        {/* ================= TABS NAVIGATION ================= */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '8px',
          marginBottom: '12px'
        }}>
          {[
            { id: 'all_daybook', label: `Master Daybook (${masterDaybook.length})`, icon: Layers },
            { id: 'sales_orders', label: `Orders & POS (${filteredOrders.length})`, icon: ShoppingBag },
            { id: 'tally_vouchers', label: `Tally Vouchers (${filteredVouchers.length})`, icon: FileText },
            { id: 'bank', label: `Bank & RTGS (${filteredBankTxns.length})`, icon: CreditCard },
            { id: 'inquiries', label: `CRM Leads (${filteredInquiries.length})`, icon: Building2 },
            { id: 'logistics', label: `Fleet ePOD (${filteredRouteStops.length})`, icon: Truck }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playScanBeep();
                  setActiveSubTab(tab.id);
                }}
                style={{
                  background: isTabActive ? 'rgba(212, 175, 55, 0.22)' : 'transparent',
                  color: isTabActive ? '#FFFFFF' : '#94A3B8',
                  border: isTabActive ? '1px solid #D4AF37' : '1px solid transparent',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: isTabActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={13} color={isTabActive ? '#D4AF37' : '#94A3B8'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= TAB CONTENT (SCROLLABLE TABLE) ================= */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '260px' }}>
          
          {/* TAB 1: MASTER DAYBOOK */}
          {activeSubTab === 'all_daybook' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Date & Time</th>
                  <th style={{ padding: '8px 10px' }}>Voucher / Ref ID</th>
                  <th style={{ padding: '8px 10px' }}>Classification</th>
                  <th style={{ padding: '8px 10px' }}>Party / Client Ledger</th>
                  <th style={{ padding: '8px 10px' }}>Narration / Particulars</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Inflow (₹ Cr)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Outflow (₹ Dr)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {masterDaybook.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      No transactions recorded between {formatDisplayDate(fromDate)} and {formatDisplayDate(toDate)}.
                    </td>
                  </tr>
                ) : (
                  masterDaybook.map((row, idx) => (
                    <tr 
                      key={row.id + idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>
                        {formatDisplayDate(row.date)} <span style={{ color: '#64748B' }}>{row.time}</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#F59E0B' }}>
                        {row.id}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          background: `${row.badgeColor}22`,
                          color: row.badgeColor,
                          border: `1px solid ${row.badgeColor}55`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}>
                          {row.typeLabel}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}>
                        {row.party}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.details}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: row.inflow ? '#22C55E' : '#475569' }}>
                        {row.inflow ? `+₹${row.inflow.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: row.outflow ? '#F43F5E' : '#475569' }}>
                        {row.outflow ? `-₹${row.outflow.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                          ✓ {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: SALES & ORDERS */}
          {activeSubTab === 'sales_orders' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Customer Name</th>
                  <th style={{ padding: '8px 10px' }}>Phone</th>
                  <th style={{ padding: '8px 10px' }}>Ordered Items / SKU</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Value</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Advance Paid</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>SafeLock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No orders found in selected range.</td></tr>
                ) : (
                  filteredOrders.map(o => (
                    <tr key={o.Order_ID} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{o.Order_ID}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate((o.Created_At || '').slice(0, 10) || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}>{o.Customer_Name}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{o.Customer_Phone}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{o.Ordered_SKU}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(o.Total_Amount_INR || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#22C55E' }}>₹{Number(o.Advance_Paid_INR || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-gold" style={{ fontSize: '9px' }}>{o.SafeLock_Status || 'SAFELOCKED'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: TALLY VOUCHERS */}
          {activeSubTab === 'tally_vouchers' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Voucher No</th>
                  <th style={{ padding: '8px 10px' }}>Type</th>
                  <th style={{ padding: '8px 10px' }}>Voucher Date</th>
                  <th style={{ padding: '8px 10px' }}>Party Ledger</th>
                  <th style={{ padding: '8px 10px' }}>Narration</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Tally Sync Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No Tally vouchers found in selected range.</td></tr>
                ) : (
                  filteredVouchers.map(v => (
                    <tr key={v.voucher_no || v.voucher_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{v.voucher_no}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ 
                          background: v.voucher_type === 'SALES' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: v.voucher_type === 'SALES' ? '#4ADE80' : '#38BDF8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '800'
                        }}>
                          {v.voucher_type}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(v.voucher_date)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{v.party_ledger}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{v.narration}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(v.amount_inr || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '9px' }}>✓ {v.status || 'POSTED'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: BANK & RTGS */}
          {activeSubTab === 'bank' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Ref / UTR No</th>
                  <th style={{ padding: '8px 10px' }}>Description / Narrative</th>
                  <th style={{ padding: '8px 10px' }}>Category</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Credit (+₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Debit (-₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredBankTxns.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No bank settlements found in selected range.</td></tr>
                ) : (
                  filteredBankTxns.map((bt, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(bt.Date)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#38BDF8' }}>{bt.Reference_No}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '600', color: '#FFF' }}>{bt.Description}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{bt.Category}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: bt.Type === 'CR' ? '#22C55E' : '#475569' }}>
                        {bt.Type === 'CR' ? `+₹${Number(bt.Amount_INR).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: bt.Type === 'DR' ? '#F43F5E' : '#475569' }}>
                        {bt.Type === 'DR' ? `-₹${Number(bt.Amount_INR).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#D4AF37' }}>
                        ₹{Number(bt.Balance_INR || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 5: CRM INQUIRIES */}
          {activeSubTab === 'inquiries' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Lead ID</th>
                  <th style={{ padding: '8px 10px' }}>Inquiry Date</th>
                  <th style={{ padding: '8px 10px' }}>Customer Name</th>
                  <th style={{ padding: '8px 10px' }}>Phone</th>
                  <th style={{ padding: '8px 10px' }}>Interested Category</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Budget / Deal (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Funnel Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No CRM leads recorded in selected range.</td></tr>
                ) : (
                  filteredInquiries.map(iq => (
                    <tr key={iq.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{iq.id}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(iq.inquiry_date || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{iq.customer_name}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{iq.phone}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{iq.category}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(iq.estimated_value || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-purple" style={{ fontSize: '9px' }}>{iq.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 6: LOGISTICS & EPOD */}
          {activeSubTab === 'logistics' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Stop ID</th>
                  <th style={{ padding: '8px 10px' }}>Scheduled Date</th>
                  <th style={{ padding: '8px 10px' }}>Customer Name</th>
                  <th style={{ padding: '8px 10px' }}>Delivery Address</th>
                  <th style={{ padding: '8px 10px' }}>Assigned Driver</th>
                  <th style={{ padding: '8px 10px' }}>Item / SKU</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>ePOD OTP Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRouteStops.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No delivery dispatches in selected range.</td></tr>
                ) : (
                  filteredRouteStops.map(rs => (
                    <tr key={rs.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{rs.id}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(rs.scheduledDate || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{rs.customerName}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{rs.address}</td>
                      <td style={{ padding: '8px 10px', color: '#38BDF8', fontWeight: '600' }}>{rs.driverName || 'Tophan Gouda'}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{rs.sku}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className={`badge ${rs.status === 'DELIVERED' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '9px' }}>
                          {rs.status === 'DELIVERED' ? '✓ ePOD SIGNED' : 'IN TRANSIT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= FOOTER ACTIONS ================= */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '14px',
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94A3B8' }}>
            <span>⚡ Audit Horizon:</span>
            <strong style={{ color: '#F59E0B' }}>{formatDisplayDate(fromDate)}</strong>
            <span>to</span>
            <strong style={{ color: '#F59E0B' }}>{formatDisplayDate(toDate)}</strong>
            <span>•</span>
            <span>Total Records: <strong style={{ color: '#FFFFFF' }}>{masterDaybook.length}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleTallyXmlSync}
              className="btn-ghost-edit"
              style={{ fontSize: '11.5px', padding: '6px 14px', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              ⚡ Push to Tally XML
            </button>
            <button
              onClick={handleExportCsv}
              className="btn-ghost-edit"
              style={{ fontSize: '11.5px', padding: '6px 14px' }}
            >
              📥 Download CSV
            </button>
            <button
              onClick={onClose}
              className="btn-luxury-gold"
              style={{ fontSize: '11.5px', padding: '6px 20px' }}
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UniversalDateAuditModal;

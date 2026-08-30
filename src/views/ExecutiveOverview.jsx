import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  Users, 
  DollarSign, 
  Clock, 
  FileText, 
  Zap, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  QrCode,
  Lock,
  Sun,
  Award
} from 'lucide-react';

export function ExecutiveOverview() {
  const { 
    orders, 
    inventory, 
    inquiries, 
    architects, 
    targets, 
    eodSummary, 
    openModal, 
    syncWithGoogleSheets, 
    isSyncing,
    setActiveTab
  } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.Total_Amount_INR) || 0), 0);
  const totalAdvances = orders.reduce((sum, o) => sum + (Number(o.Advance_Paid_INR) || 0), 0);
  const activeSafeLocks = orders.filter(o => o.SafeLock_Status.includes('SAFELOCKED')).length;
  const pendingDeliveries = orders.filter(o => !o.SafeLock_Status.includes('DELIVERED')).length;
  const hotLeadsCount = inquiries.filter(i => i.Status === 'HOT_LEAD').length;
  const architectBalance = architects.reduce((sum, a) => sum + (a.Balance_Due_INR || 0), 0);

  const targetProgress = Math.min(100, Math.round((targets.currentAchievedINR / targets.monthlyTargetINR) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Real-time KPI Bar */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label"><DollarSign size={14} color="var(--accent-gold)" /> Gross Revenue (Aug 2026)</div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold-light)' }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> ₹{totalAdvances.toLocaleString()} Token Advances Collected
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><ShieldCheck size={14} color="var(--accent-cyan)" /> Active SafeLocks</div>
          <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{activeSafeLocks} Suites</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Atomic Stock Reserved</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><Truck size={14} color="var(--accent-amber)" /> Pending Deliveries</div>
          <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{pendingDeliveries} Orders</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>2 Fleet Trucks Dispatched</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><Users size={14} color="var(--accent-purple)" /> Showroom Hot Leads</div>
          <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>{hotLeadsCount} Leads</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-rose)' }}>94% Buying Probability</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><Award size={14} color="var(--accent-emerald)" /> Architect Commission Due</div>
          <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>₹{architectBalance.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Instant UPI Ready</div>
        </div>
      </div>

      {/* Main Grid: Target Dial + Quick Actions Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Monthly Target Pace Card */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-gold">GODREJ INTERIO RAYAGADA TARGET PACER</span>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginTop: '4px' }}>Monthly Sales Pace: {targetProgress}% Achieved</h3>
            </div>
            <button className="btn-ghost-edit" onClick={() => syncWithGoogleSheets()}>
              <RefreshCw size={13} className={isSyncing ? 'spin-anim' : ''} /> 2-Way Sync
            </button>
          </div>

          <div style={{ background: '#030712', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span>Achieved: <strong style={{ color: 'var(--accent-gold-light)' }}>₹{targets.currentAchievedINR.toLocaleString()}</strong></span>
              <span>Target: <strong style={{ color: '#FFFFFF' }}>₹{targets.monthlyTargetINR.toLocaleString()}</strong></span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${targetProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-cyan))', borderRadius: '6px' }} />
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Today's Showroom Walk-Ins: <b>14 Customers</b></span>
              <span style={{ color: 'var(--accent-emerald)' }}>Today's Sales: <b>₹{targets.todayAchievedINR.toLocaleString()}</b> ✓</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-luxury-gold" onClick={() => openModal('new_inquiry')}>
              ➕ Log Walk-In Lead
            </button>
            <button className="btn-cyan" onClick={() => setActiveTab('voice_pos')}>
              🎙️ Showroom POS Co-Pilot
            </button>
            <button className="btn-emerald" onClick={() => {
              const text = `🎉 *DIWALI UTSAV 2026 — EXCLUSIVE SHOWROOM PREVIEW*\n` +
                `*Godrej Interio Rayagada (Shree Ganesh Enterprises)*\n\n` +
                `Dear Valued Customer, upgrade your home this festive season with:\n` +
                `✨ Flat 10% Suite Savings on Solid Teak Beds & Sectional Sofas\n` +
                `✨ Free Ortho Memory Foam Pillows (₹3,600 Value)\n` +
                `✨ Free Master Carpenter Fitting & Doorstep Delivery\n\n` +
                `👉 *Explore 115-Model Digital Catalog:* https://shreeganesh-godrej.web.app/#concierge\n` +
                `📞 *Showroom Desk:* +91 9390553301 | Main Road, Rayagada`;
              window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
            }}>
              📢 1-Click Festive Broadcast
            </button>
            <button className="btn-purple" onClick={() => openModal('carpenter_dispatch')}>
              🪚 Carpenter Dispatch (₹500)
            </button>
            <button className="btn-ghost-edit" onClick={() => openModal('eod_reconciliation')}>
              🔒 9 PM Cash Lock ({eodSummary.status === 'LOCKED_REGISTER_CLOSED' ? 'Locked ✓' : 'Open'})
            </button>
          </div>
        </div>

        {/* Executive Quick Hub */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>⚡ Executive Showroom Tools</h3>
            <span className="badge badge-emerald">FLAGSHIP LIVE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button className="btn-ghost-edit" style={{ padding: '12px', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }} onClick={() => openModal('barcode_studio')}>
              <span style={{ fontSize: '15px' }}>🏷️</span>
              <strong style={{ color: '#FFFFFF', fontSize: '12px' }}>Barcode Studio</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Carton stickers & standees</span>
            </button>

            <button className="btn-ghost-edit" style={{ padding: '12px', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }} onClick={() => openModal('warehouse_wall_poster')}>
              <span style={{ fontSize: '15px' }}>🖨️</span>
              <strong style={{ color: '#FFFFFF', fontSize: '12px' }}>Wall QR Poster</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Printable dock poster</span>
            </button>

            <button className="btn-ghost-edit" style={{ padding: '12px', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }} onClick={() => openModal('register_architect')}>
              <span style={{ fontSize: '15px' }}>🏛️</span>
              <strong style={{ color: '#FFFFFF', fontSize: '12px' }}>Register Architect</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Tiered 8.5% slab</span>
            </button>

            <button className="btn-ghost-edit" style={{ padding: '12px', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }} onClick={() => openModal('universal_payment', { amount: 78247, orderId: 'ORD-8921' })}>
              <span style={{ fontSize: '15px' }}>💰</span>
              <strong style={{ color: '#FFFFFF', fontSize: '12px' }}>UPI Dynamic QR</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>POS counter scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Orders SafeLock Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>📦 Active SafeLock Orders & Dispatch Status</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Real-time 2-way reflection from Orders_SafeLock sheet</span>
          </div>
          <button className="btn-cyan" onClick={() => setActiveTab('safelock')}>
            View 115-SKU Stock Matrix ➔
          </button>
        </div>

        <div className="data-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer & Address</th>
                <th>Ordered Furniture Model</th>
                <th>Total / Advance</th>
                <th>SafeLock Status</th>
                <th>Driver / Carpenter</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.Order_ID}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)' }}>{order.Order_ID}</td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{order.Customer_Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.Project_Address} • 📞 {order.Customer_Phone}</div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{order.Ordered_SKU}</td>
                  <td>
                    <div style={{ fontWeight: '800', color: 'var(--accent-gold-light)' }}>₹{order.Total_Amount_INR.toLocaleString()}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-emerald)' }}>Adv: ₹{(order.Advance_Paid_INR || 0).toLocaleString()}</div>
                  </td>
                  <td>
                    <span className={`badge ${order.SafeLock_Status.includes('DELIVERED') ? 'badge-emerald' : 'badge-gold'}`}>
                      {order.SafeLock_Status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '11.5px', color: '#FFFFFF' }}>🚚 {order.Assigned_Driver}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-purple)' }}>🪚 {order.Carpenter_Assigned} (₹{order.Carpenter_Payout_INR})</div>
                  </td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{order.Delivery_Schedule}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn-ghost-edit" onClick={() => openModal('manage_order', { order })}>
                        ✏️ Edit
                      </button>
                      <button className="btn-ghost-edit" onClick={() => openModal('order_invoice', { order })}>
                        🧾 Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

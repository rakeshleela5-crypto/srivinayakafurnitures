import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Truck, 
  MapPin, 
  Check, 
  Phone, 
  Smartphone, 
  QrCode, 
  MessageSquare, 
  UserCheck, 
  FileCheck,
  Plus,
  Send,
  Navigation,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { playScanBeep, playSuccessChime } from '../utils/audioUtils';

export function LogisticsEpodView() {
  const { drivers, orders, openModal, showToast, updateOrderStatus } = useStore();

  const [driverMobileMode, setDriverMobileMode] = useState(false);
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('ALL');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('ALL');

  // Dynamically compute live route stops from active SafeLock orders
  const activeManifestStops = orders.map((order, idx) => {
    const isDelivered = (order.SafeLock_Status || '').includes('DELIVERED');
    const isTransit = (order.SafeLock_Status || '').includes('TRANSIT');
    const isStaged = (order.SafeLock_Status || '').includes('STAGED');
    
    let statusBadge = 'SAFELOCKED (STAGING PENDING)';
    if (isDelivered) statusBadge = 'DELIVERED_COMPLETE';
    else if (isTransit) statusBadge = 'ON_ROUTE (TRANSIT)';
    else if (isStaged) statusBadge = 'READY_AT_DOCK (GATEPASS ISSUED ✓)';

    return {
      Stop_No: idx + 1,
      Order_ID: order.Order_ID,
      Customer_Name: order.Customer_Name,
      Address: order.Project_Address || "Rayagada District",
      Customer_Phone: order.Customer_Phone || "9390553301",
      Time_Slot: order.Delivery_Schedule || "Today, 04:30 PM",
      Items: order.Ordered_SKU || order.Item_Names || "Furniture Model",
      Amount_Due: Number(order.Balance_Due_INR) || 0,
      Payment_Mode: Number(order.Balance_Due_INR) > 0 ? "DYNAMIC_UPI_QR" : "100% PRE-PAID",
      Status: statusBadge,
      Driver: order.Assigned_Driver || "Tophan Gouda (Tata Ace OD-18-A-1234)",
      Carpenter: order.Carpenter_Assigned || "Narayana Mistri",
      OTP_Code: order.OTP_Code || "8899",
      RawOrder: order
    };
  });

  const filteredStops = activeManifestStops.filter(s => {
    const matchesDriver = selectedDriverFilter === 'ALL' || s.Driver.includes(selectedDriverFilter);
    const matchesCustomer = selectedCustomerFilter === 'ALL' || s.Order_ID === selectedCustomerFilter;
    return matchesDriver && matchesCustomer;
  });

  const handleMarkInTransit = (orderId, driverName) => {
    playScanBeep();
    updateOrderStatus(orderId, `DISPATCHED_IN_TRANSIT (${driverName || 'Tata Ace OD-18-A-1234'})`);
    showToast(`🚚 Order #${orderId} marked IN-TRANSIT on Tata Ace! OTP dispatched to customer.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">🚚 LIVE LOGISTICS FLEET & DIGITAL ePOD</span>
          <button className="btn-luxury-gold" onClick={() => openModal('edit_fleet_driver', {})}>
            ➕ Add Fleet Driver
          </button>
          <button className="btn-ghost-edit" onClick={() => setDriverMobileMode(!driverMobileMode)}>
            <Smartphone size={14} /> {driverMobileMode ? 'Switch to Desktop Cockpit' : '📱 Driver Mobile Viewport'}
          </button>
          <button 
            className="btn-cyan"
            onClick={() => {
              const text = `📋 *GODREJ INTERIO RAYAGADA — DAILY DRIVER DISPATCH TRIP SHEET*\n\n` +
                filteredStops.map(s => `• Stop #${s.Stop_No}: ${s.Customer_Name} (${s.Time_Slot})\n  📍 ${s.Address}\n  📦 ${s.Items}\n  💰 Balance Due: ₹${s.Amount_Due.toLocaleString()} (OTP: ${s.OTP_Code})\n`).join('\n') +
                `\n📞 Store Hotline: +91 9390553301`;
              window.open(`https://wa.me/919437155667?text=${encodeURIComponent(text)}`, '_blank');
              showToast("📲 Trip Sheet sent to Driver Tophan Gouda via WhatsApp!", true);
            }}
          >
            <Send size={13} /> 📲 Send WhatsApp Trip Sheet
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">GPS GEO-LOCK ACTIVE</span>
          <span className="badge badge-purple">{filteredStops.length} Active Delivery Stops</span>
        </div>
      </div>

      {/* Fleet Driver Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {drivers.map(driver => {
          const driverStopsCount = activeManifestStops.filter(s => s.Driver.includes(driver.Name)).length;
          return (
            <div key={driver.Driver_ID} className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-cyan">{driver.Driver_ID}</span>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '4px' }}>{driver.Name}</h4>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {driver.Phone}</div>
                </div>
                <span className={`badge ${driver.Status === 'ON_ROUTE' ? 'badge-amber' : 'badge-emerald'}`}>
                  {driver.Status} ({driverStopsCount} Stops)
                </span>
              </div>

              <div style={{ background: '#030712', borderRadius: '10px', padding: '10px', margin: '10px 0', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><b>Vehicle:</b> {driver.Vehicle}</div>
                <div><b>Assigned Route:</b> {driver.Route}</div>
                <div style={{ color: 'var(--accent-gold-light)' }}><b>Performance:</b> {driver.CSAT} Rating • {driver.Capacity_KG}</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn-ghost-edit" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openModal('edit_fleet_driver', { driver })}>
                  ✏️ Edit Driver
                </button>
                <button 
                  className="btn-emerald" 
                  style={{ flex: 1, justifyContent: 'center' }} 
                  onClick={() => {
                    const text = `📋 *DAILY DISPATCH MANIFEST FOR ${driver.Name.toUpperCase()}*\nVehicle: ${driver.Vehicle}\n\n` +
                      activeManifestStops.filter(s => s.Driver.includes(driver.Name)).map(s => `• Stop #${s.Stop_No}: ${s.Customer_Name} | ${s.Time_Slot}\n  📍 ${s.Address}\n  📦 ${s.Items}\n  💰 Due: ₹${s.Amount_Due.toLocaleString()}\n`).join('\n');
                    window.open(`https://wa.me/91${driver.Phone}?text=${encodeURIComponent(text)}`, '_blank');
                    showToast(`📲 Trip Sheet dispatched to ${driver.Name}!`, true);
                  }}
                >
                  Send Trip Sheet
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Manifest & Route Stops Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>🗺️ Live Delivery Manifest & Doorstep ePOD Verification</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Connected to SafeLock Engine • Customer OTP, Signature Pad & GPS Geotag Lock
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#030712', padding: '4px 10px', borderRadius: '8px', border: '1.5px solid var(--accent-gold)' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '800' }}>🔍 Spotlight Customer:</span>
              <select
                value={selectedCustomerFilter}
                onChange={e => setSelectedCustomerFilter(e.target.value)}
                style={{
                  background: '#0B132B',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
              >
                <option value="ALL">All Customers ({activeManifestStops.length} Stops)</option>
                {orders.map(o => (
                  <option key={o.Order_ID} value={o.Order_ID}>
                    #{o.Order_ID} — {o.Customer_Name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Driver:</span>
              <select
                value={selectedDriverFilter}
                onChange={e => setSelectedDriverFilter(e.target.value)}
                style={{
                  background: '#0B132B',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px'
                }}
              >
                <option value="ALL">All Drivers</option>
                {drivers.map(d => (
                  <option key={d.Driver_ID} value={d.Name}>{d.Name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Stop #</th>
                <th>Order Ref</th>
                <th>Customer & Address</th>
                <th>Delivery Time Slot</th>
                <th>Items in Vehicle</th>
                <th>Balance Due</th>
                <th>Delivery Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStops.map(stop => (
                <tr key={stop.Order_ID || stop.Stop_No}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '900', color: 'var(--accent-gold)' }}>#{stop.Stop_No}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)' }}>{stop.Order_ID}</td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{stop.Customer_Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {stop.Address} • 📞 {stop.Customer_Phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>⏰ {stop.Time_Slot}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Driver: {stop.Driver.split(' ')[0]}</div>
                  </td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-primary)', maxWidth: '220px' }}>
                    <b>{stop.Items}</b>
                    <div style={{ fontSize: '10px', color: 'var(--accent-purple)' }}>🪚 {stop.Carpenter}</div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                      ₹{stop.Amount_Due.toLocaleString()}
                    </strong>
                    <div style={{ fontSize: '9.5px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                      {stop.Payment_Mode}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${stop.Status === 'DELIVERED_COMPLETE' ? 'badge-emerald' : stop.Status.includes('TRANSIT') ? 'badge-cyan' : stop.Status.includes('GATEPASS') ? 'badge-purple' : 'badge-amber'}`} style={{ fontSize: '9.5px', fontWeight: '800' }}>
                      {stop.Status === 'DELIVERED_COMPLETE' ? 'DELIVERED ✓' : stop.Status.includes('TRANSIT') ? '🚚 IN TRANSIT' : stop.Status.includes('GATEPASS') ? '📦 DOCK 1 READY' : '🔒 SAFELOCKED'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-luxury-gold" 
                        style={{ fontSize: '10px', padding: '3px 7px' }} 
                        onClick={() => openModal('digital_epod', { stop })}
                        title="Capture Digital Signature, OTP & GPS Geotag"
                      >
                        ✍️ ePOD
                      </button>
                      <button 
                        className="btn-ghost-edit" 
                        style={{ fontSize: '10px', padding: '3px 7px', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }} 
                        onClick={() => openModal('sms_dispatch', { stop })}
                        title="Send OTP & Live Tracking SMS"
                      >
                        📲 OTP SMS
                      </button>
                      {stop.Amount_Due > 0 && (
                        <button 
                          className="btn-emerald" 
                          style={{ fontSize: '10px', padding: '3px 7px' }} 
                          onClick={() => openModal('universal_payment', { amount: stop.Amount_Due, orderId: stop.Order_ID })}
                          title="Generate Dynamic UPI QR Code for Doorstep Collection"
                        >
                          💳 UPI QR
                        </button>
                      )}
                      {!stop.Status.includes('TRANSIT') && stop.Status !== 'DELIVERED_COMPLETE' && (
                        <button 
                          className="btn-ghost-edit" 
                          style={{ fontSize: '10px', padding: '3px 6px', color: 'var(--accent-emerald)' }} 
                          onClick={() => handleMarkInTransit(stop.Order_ID, stop.Driver)}
                          title="Mark Vehicle Outward Dispatched"
                        >
                          🚚 Dispatch
                        </button>
                      )}
                      <button 
                        className="btn-ghost-edit" 
                        style={{ fontSize: '10px', padding: '3px 6px' }} 
                        onClick={() => openModal('order_rescheduler', { order: stop.RawOrder })}
                        title="Reschedule Time Slot"
                      >
                        📅
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


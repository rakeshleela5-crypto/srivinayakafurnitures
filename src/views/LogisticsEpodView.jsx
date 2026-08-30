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
  Plus
} from 'lucide-react';

export function LogisticsEpodView() {
  const { drivers, routeStops, openModal, showToast } = useStore();

  const [driverMobileMode, setDriverMobileMode] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">🚚 SMART LOGISTICS FLEET & DIGITAL ePOD</span>
          <button className="btn-luxury-gold" onClick={() => openModal('edit_fleet_driver', {})}>
            ➕ Add Fleet Driver
          </button>
          <button className="btn-ghost-edit" onClick={() => setDriverMobileMode(!driverMobileMode)}>
            <Smartphone size={14} /> {driverMobileMode ? 'Switch to Desktop Cockpit' : '📱 Driver Mobile Viewport'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">GPS GEO-LOCK ACTIVE</span>
        </div>
      </div>

      {/* Fleet Driver Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {drivers.map(driver => (
          <div key={driver.Driver_ID} className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-cyan">{driver.Driver_ID}</span>
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '4px' }}>{driver.Name}</h4>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {driver.Phone}</div>
              </div>
              <span className={`badge ${driver.Status === 'ON_ROUTE' ? 'badge-amber' : 'badge-emerald'}`}>
                {driver.Status}
              </span>
            </div>

            <div style={{ background: '#030712', borderRadius: '10px', padding: '10px', margin: '10px 0', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><b>Vehicle:</b> {driver.Vehicle}</div>
              <div><b>Route:</b> {driver.Route}</div>
              <div style={{ color: 'var(--accent-gold-light)' }}><b>Performance:</b> {driver.CSAT} Rating</div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-ghost-edit" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openModal('edit_fleet_driver', { driver })}>
                ✏️ Edit Driver
              </button>
              <button className="btn-emerald" style={{ flex: 1, justifyContent: 'center' }} onClick={() => showToast(`📲 Trip Sheet sent to ${driver.Name} via WhatsApp!`, true)}>
                Send Trip Sheet
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Manifest & Route Stops Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>🗺️ Live Delivery Manifest & Doorstep ePOD Verification</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OTP Verification, Customer Signature Pad & GPS Geotag Lock</span>
          </div>
          <span className="badge badge-purple">{routeStops.length} Active Route Stops</span>
        </div>

        <div className="data-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Stop #</th>
                <th>Order Ref</th>
                <th>Customer & Address</th>
                <th>Time Slot</th>
                <th>Items in Vehicle</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routeStops.map(stop => (
                <tr key={stop.Stop_No}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '900', color: 'var(--accent-gold)' }}>#{stop.Stop_No}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)' }}>{stop.Order_ID}</td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{stop.Customer_Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {stop.Address}</div>
                  </td>
                  <td style={{ fontSize: '12px' }}>{stop.Time_Slot}</td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>{stop.Items}</td>
                  <td>
                    <strong style={{ color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>₹{stop.Amount_Due.toLocaleString()}</strong>
                    <div style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>{stop.Payment_Mode}</div>
                  </td>
                  <td>
                    <span className={`badge ${stop.Status === 'DELIVERED_COMPLETE' ? 'badge-emerald' : 'badge-amber'}`}>
                      {stop.Status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button className="btn-luxury-gold" style={{ fontSize: '10.5px', padding: '3px 6px' }} onClick={() => openModal('digital_epod', { stop })}>
                        ✍️ ePOD
                      </button>
                      <button className="btn-emerald" style={{ fontSize: '10.5px', padding: '3px 6px' }} onClick={() => openModal('mistri_qc_warranty', { stop })}>
                        🛡️ QC Warranty
                      </button>
                      <button className="btn-cyan" style={{ fontSize: '10.5px', padding: '3px 6px' }} onClick={() => openModal('order_rescheduler', { order: { Order_ID: stop.Order_ID, Customer_Name: stop.Customer_Name, Project_Address: stop.Address, Delivery_Schedule: stop.Time_Slot, Balance_Due_INR: stop.Amount_Due } })}>
                        📅 Reschedule
                      </button>
                      <button className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '3px 6px', color: '#F43F5E' }} onClick={() => openModal('box_damage_claim', { stop })}>
                        📦 Damage
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

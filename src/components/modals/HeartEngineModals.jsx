import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Tag, 
  DollarSign, 
  Lock, 
  Calendar, 
  Clock, 
  MapPin, 
  Truck, 
  UserCheck, 
  Building, 
  CreditCard, 
  Save, 
  Send, 
  Percent, 
  Sliders,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

// ==============================================================================================
// ❤️ HEART ENGINE 1: 3-TIER PRICING & PROFIT MARGIN MATRIX MODAL
// ==============================================================================================
export function TierPricingModal({ isOpen, onClose, sku = 'BED-MOD-001' }) {
  const { catalog, showToast } = useStore();
  const item = catalog.find(c => c.SKU === sku) || catalog[0];

  const [mrp, setMrp] = useState(item?.MRP_INR || 98000);
  const [festivePrice, setFestivePrice] = useState(item?.Selling_Price_INR || 78247);
  const [architectRate, setArchitectRate] = useState(Math.round((item?.Selling_Price_INR || 78247) * 0.915)); // 8.5% discount
  const [floorPrice, setFloorPrice] = useState(Math.round((item?.Selling_Price_INR || 78247) * 0.88));
  const [factoryCost, setFactoryCost] = useState(Math.round((item?.MRP_INR || 98000) * 0.55));
  const [managerPin, setManagerPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    if (item) {
      setMrp(item.MRP_INR || 98000);
      setFestivePrice(item.Selling_Price_INR || 78247);
      setArchitectRate(Math.round((item.Selling_Price_INR || 78247) * 0.915));
      setFloorPrice(Math.round((item.Selling_Price_INR || 78247) * 0.88));
      setFactoryCost(Math.round((item.MRP_INR || 98000) * 0.55));
    }
  }, [sku, item]);

  if (!isOpen) return null;

  const handleVerifyPin = () => {
    if (managerPin === '8899') {
      setPinVerified(true);
      playSuccessChime();
      showToast("🔓 Director PIN 8899 Verified! Floor Price unlocked for editing.", true);
    } else {
      showToast("❌ Invalid Director PIN. Floor price protected.", false);
    }
  };

  const handleSave = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('SAVE_TIER_PRICING', {
      sku: item.SKU,
      product_name: item.Product_Name,
      mrp: Number(mrp),
      festive_price: Number(festivePrice),
      architect_net_rate: Number(architectRate),
      floor_price: Number(floorPrice),
      factory_cost: Number(factoryCost),
      updated_by: "Director Rakesh (PIN 8899)",
      timestamp: new Date().toISOString()
    });

    showToast(`🏷️ 3-Tier Pricing & Profit Margin Matrix saved for ${item.SKU}! Synced to Google Sheets & WhatsApp Bots.`, true);
    onClose();
  };

  const grossMargin = festivePrice - factoryCost;
  const marginPct = Math.round((grossMargin / festivePrice) * 100);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '620px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">❤️ FINANCIAL HEART ENGINE 1</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🏷️ 3-Tier Pricing & Profit Margin Matrix
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
              {item.SKU} — {item.Product_Name} ({item.Material_Spec})
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '14px 0' }}>
          
          {/* Tier 1: Showroom MRP */}
          <div className="form-field">
            <label style={{ color: '#94A3B8' }}>1. Showroom List MRP (₹)</label>
            <input type="number" value={mrp} onChange={e => setMrp(Number(e.target.value))} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>Printed on Catalog & Carton Labels</span>
          </div>

          {/* Tier 2: Festive Walk-in Price */}
          <div className="form-field">
            <label style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>2. 🏬 Showroom Festive Price (₹)</label>
            <input type="number" value={festivePrice} onChange={e => setFestivePrice(Number(e.target.value))} style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', fontWeight: '800' }} />
            <span style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>Displayed on Standee QR & POS</span>
          </div>

          {/* Tier 3: VIP Architect Net Price */}
          <div className="form-field">
            <label style={{ color: 'var(--accent-cyan)', fontWeight: '800' }}>3. 🏛️ VIP Architect Net Price (₹)</label>
            <input type="number" value={architectRate} onChange={e => setArchitectRate(Number(e.target.value))} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>8.5% Commission Slashed / Payout</span>
          </div>

          {/* Tier 4: Bottom Floor Price */}
          <div className="form-field">
            <label style={{ color: '#F43F5E', fontWeight: '800' }}>4. 🛡️ Absolute Bottom Floor Price (₹)</label>
            <input 
              type="number" 
              value={floorPrice} 
              disabled={!pinVerified}
              onChange={e => setFloorPrice(Number(e.target.value))} 
              style={{ borderColor: pinVerified ? '#F43F5E' : 'rgba(255,255,255,0.1)', opacity: pinVerified ? 1 : 0.6 }}
            />
            {!pinVerified ? (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <input 
                  type="password" 
                  maxLength={4} 
                  placeholder="PIN 8899" 
                  value={managerPin} 
                  onChange={e => setManagerPin(e.target.value)} 
                  style={{ width: '80px', padding: '3px 6px', fontSize: '10.5px', textAlign: 'center' }} 
                />
                <button className="btn-ghost-edit" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={handleVerifyPin}>
                  Unlock Floor
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '10px', color: '#34D399' }}>✓ Unlocked with PIN 8899</span>
            )}
          </div>

          {/* Internal Hidden Cost */}
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label style={{ color: '#64748B' }}>🏭 Factory Inward Cost + Transport Freight (₹ Hidden from Staff & Customer)</label>
            <input type="number" value={factoryCost} onChange={e => setFactoryCost(Number(e.target.value))} style={{ background: '#030712' }} />
          </div>

        </div>

        {/* Live Profit Margin Telemetry Strip */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Showroom Net Profit Margin:</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: marginPct >= 25 ? '#34D399' : '#FBBF24' }}>
              ₹{grossMargin.toLocaleString()} ({marginPct}% Gross Margin)
            </div>
          </div>
          <span className={`badge ${marginPct >= 25 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
            {marginPct >= 25 ? 'HEALTHY MARGIN ✓' : 'LOW MARGIN ALERT'}
          </span>
        </div>

        <button className="btn-luxury-gold" onClick={handleSave} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '14px' }}>
          <Save size={16} /> Save 3-Tier Price Matrix & Push to Google Sheets
        </button>

      </div>
    </div>
  );
}

// ==============================================================================================
// ❤️ HEART ENGINE 2: MASTER ORDER LIFECYCLE & DELIVERY RESCHEDULER MODAL
// ==============================================================================================
export function OrderReschedulerModal({ isOpen, onClose, order = {} }) {
  const { updateOrderStatus, showToast } = useStore();

  const [orderId, setOrderId] = useState(order.Order_ID || 'ORD-8921');
  const [customerName, setCustomerName] = useState(order.Customer_Name || 'Dr. Subhashish Jena');
  const [customerPhone, setCustomerPhone] = useState(order.Customer_Phone || '9437188291');
  const [address, setAddress] = useState(order.Project_Address || 'Gayatri Nagar Villa, Rayagada');
  const [schedule, setSchedule] = useState(order.Delivery_Schedule || 'Today, 04:30 PM Express');
  const [driver, setDriver] = useState(order.Assigned_Driver || 'Tophan Gouda (Tata Ace OD-18-A-1234)');
  const [carpenter, setCarpenter] = useState(order.Carpenter_Assigned || 'Narayana Mistri');
  const [balanceDue, setBalanceDue] = useState(order.Balance_Due_INR || 78247);
  const [landmarkNotes, setLandmarkNotes] = useState('Ground Floor Double Door Entry • Call 15 mins before arrival');

  useEffect(() => {
    if (order.Order_ID) {
      setOrderId(order.Order_ID);
      setCustomerName(order.Customer_Name || 'Dr. Subhashish Jena');
      setCustomerPhone(order.Customer_Phone || '9437188291');
      setAddress(order.Project_Address || 'Gayatri Nagar Villa, Rayagada');
      setSchedule(order.Delivery_Schedule || 'Today, 04:30 PM Express');
      setDriver(order.Assigned_Driver || 'Tophan Gouda (Tata Ace OD-18-A-1234)');
      setCarpenter(order.Carpenter_Assigned || 'Narayana Mistri');
      setBalanceDue(order.Balance_Due_INR || 78247);
    }
  }, [order]);

  if (!isOpen) return null;

  const handleSaveAndNotify = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    // 1. Update central state
    updateOrderStatus(orderId, `RESCHEDULED (${schedule})`);

    // 2. Dispatch Webhook to Google Sheets
    dispatchWebhookAction('RESCHEDULE_ORDER_DELIVERY', {
      order_id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: address,
      delivery_schedule: schedule,
      assigned_driver: driver,
      assigned_carpenter: carpenter,
      balance_due_inr: Number(balanceDue),
      landmark_notes: landmarkNotes,
      rescheduled_by: "Store Manager (Rayagada Showroom)",
      timestamp: new Date().toISOString()
    });

    // 3. 1-Click WhatsApp Trigger to Customer
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const text = `🚚 *GODREJ INTERIO RAYAGADA — DELIVERY & ASSEMBLY UPDATE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear ${customerName}, your delivery schedule for Order *#${orderId}* has been updated:\n\n` +
      `📅 *New Delivery Slot:* ${schedule}\n` +
      `📍 *Destination:* ${address}\n` +
      `🚚 *Assigned Fleet Driver:* ${driver}\n` +
      `🪚 *Master Carpenter (Fitting):* ${carpenter}\n` +
      `💰 *Doorstep Balance Due:* ₹${Number(balanceDue).toLocaleString()} (Pay via Dynamic UPI QR/Cash)\n` +
      `📝 *Notes:* ${landmarkNotes}\n\n` +
      `👉 *Live Driver GPS & Gate Pass:* https://shreeganesh-godrej.web.app/#outward\n` +
      `📞 *Showroom Hotline:* +91 9390553301`;

    window.open(`https://wa.me/91${cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`🚀 Order #${orderId} rescheduled & updated WhatsApp sent to ${customerName}!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', background: '#0B132B', border: '2px solid #38BDF8' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-cyan">❤️ OPERATIONAL HEART ENGINE 2</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              📅 Master Order Lifecycle & Delivery Rescheduler
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}>
              Order #{orderId} — {customerName}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid" style={{ margin: '14px 0' }}>
          
          <div className="form-field">
            <label>Customer Full Name</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Customer WhatsApp Phone</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Delivery Site Address & Villa Details</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="form-field">
            <label>📅 Delivery Date & Slot</label>
            <input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="e.g. Sunday, 31-Aug 04:30 PM Express" />
          </div>

          <div className="form-field">
            <label>🚚 Assigned Fleet Driver & Vehicle</label>
            <select value={driver} onChange={e => setDriver(e.target.value)}>
              <option value="Tophan Gouda (Tata Ace OD-18-A-1234)">Tophan Gouda (Tata Ace OD-18-A-1234)</option>
              <option value="Rajesh Gouda (Bolero Pickup OD-18-B-5566)">Rajesh Gouda (Bolero Pickup OD-18-B-5566)</option>
              <option value="Santosh Nayak (Eicher Pro OD-18-C-9900)">Santosh Nayak (Eicher Pro OD-18-C-9900)</option>
            </select>
          </div>

          <div className="form-field">
            <label>🪚 Assigned Master Carpenter (Mistri)</label>
            <select value={carpenter} onChange={e => setCarpenter(e.target.value)}>
              <option value="Narayana Mistri">Narayana Mistri (+91 94371 88200)</option>
              <option value="Kailash Mistri">Kailash Mistri (+91 94371 88201)</option>
              <option value="Bikram Mistri">Bikram Mistri (+91 94371 88202)</option>
            </select>
          </div>

          <div className="form-field">
            <label>💰 Doorstep Balance Due (₹)</label>
            <input type="number" value={balanceDue} onChange={e => setBalanceDue(Number(e.target.value))} />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Driver Landmark / Unloading Instructions</label>
            <input value={landmarkNotes} onChange={e => setLandmarkNotes(e.target.value)} />
          </div>

        </div>

        <button className="btn-cyan" onClick={handleSaveAndNotify} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Send size={16} /> Save Rescheduled Slot & Send Customer WhatsApp Alert
        </button>

      </div>
    </div>
  );
}

// ==============================================================================================
// ❤️ HEART ENGINE 3: STORE IDENTITY, GST & UPI VPA CONFIGURATOR MODAL
// ==============================================================================================
export function StoreSettingsModal({ isOpen, onClose }) {
  const { storeMeta, showToast } = useStore();

  const [storeName, setStoreName] = useState(storeMeta?.storeName || 'Godrej Interio Rayagada (Shree Ganesh Enterprises)');
  const [gstin, setGstin] = useState(storeMeta?.gstin || '21AAAAA0000A1Z5');
  const [pan, setPan] = useState(storeMeta?.pan || 'AAAAA0000A');
  const [address, setAddress] = useState(storeMeta?.address || 'Main Road, Near Overbridge, Rayagada, Odisha 765001');
  const [phone, setPhone] = useState(storeMeta?.phone || '+91 93905 53301');
  const [upiVpa, setUpiVpa] = useState(storeMeta?.upiVpa || '9390553301@ybl');
  const [directorPin, setDirectorPin] = useState('8899');
  const [hours, setHours] = useState('09:30 AM to 09:00 PM IST (Mon–Sun)');

  if (!isOpen) return null;

  const handleSave = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('SAVE_COMPANY_IDENTITY', {
      store_name: storeName,
      gstin: gstin,
      pan: pan,
      showroom_address: address,
      director_phone: phone,
      merchant_upi_vpa: upiVpa,
      director_pin: directorPin,
      showroom_hours: hours,
      updated_timestamp: new Date().toISOString()
    });

    showToast("⚙️ Showroom Commercial Identity & UPI VPA updated across all 16 tabs & invoices!", true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', background: '#0B132B', border: '2px solid var(--accent-emerald)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-emerald">❤️ COMMERCIAL IDENTITY HEART ENGINE 3</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              ⚙️ Showroom Identity, GST & UPI VPA Configurator
            </h3>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              White-label configuration powering all invoices, tax certificates & dynamic QR codes
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid" style={{ margin: '14px 0' }}>
          
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Showroom Legal Name & Entity</label>
            <input value={storeName} onChange={e => setStoreName(e.target.value)} />
          </div>

          <div className="form-field">
            <label>GSTIN / Tax ID</label>
            <input value={gstin} onChange={e => setGstin(e.target.value)} />
          </div>

          <div className="form-field">
            <label>PAN Number</label>
            <input value={pan} onChange={e => setPan(e.target.value)} />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Physical Showroom Address & PIN</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Director Contact & WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Merchant UPI VPA (Doorstep QR Collection)</label>
            <input value={upiVpa} onChange={e => setUpiVpa(e.target.value)} style={{ color: 'var(--accent-emerald)', fontWeight: '800' }} />
          </div>

          <div className="form-field">
            <label>Director Master PIN (Spot Overrides)</label>
            <input type="text" maxLength={4} value={directorPin} onChange={e => setDirectorPin(e.target.value)} style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: '800' }} />
          </div>

          <div className="form-field">
            <label>Showroom Operating Hours</label>
            <input value={hours} onChange={e => setHours(e.target.value)} />
          </div>

        </div>

        <button className="btn-emerald" onClick={handleSave} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Save size={16} /> Save Showroom Configuration & Apply Everywhere
        </button>

      </div>
    </div>
  );
}

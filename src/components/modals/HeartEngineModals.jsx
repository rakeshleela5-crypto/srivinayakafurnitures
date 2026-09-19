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
  AlertCircle,
  Award,
  Crown,
  Heart,
  Palette,
  Camera,
  Layers,
  Wrench,
  FileText,
  Printer,
  ShoppingBag,
  Zap,
  Cpu,
  Smartphone,
  MessageSquare,
  Wifi,
  QrCode
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';
import { getAiProviderKeys, saveAiProviderKey } from '../../services/aiRouterService';
import { 
  getWhatsAppGatewayConfig, 
  saveWhatsAppGatewayConfig, 
  checkGatewayConnection 
} from '../../services/whatsappGatewayService';

// ==============================================================================================
// ❤️ HEART ENGINE 1: 3-TIER PRICING & PROFIT MARGIN MATRIX MODAL
// ==============================================================================================
export function TierPricingModal({ isOpen, onClose, sku = 'BED-MOD-001' }) {
  const { catalog, showToast } = useStore();
  const item = catalog.find(c => c.SKU === sku) || catalog[0];

  const [mrp, setMrp] = useState(item?.MRP_INR || 98000);
  const [festivePrice, setFestivePrice] = useState(item?.Selling_Price_INR || 78247);
  const [architectRate, setArchitectRate] = useState(Math.round((item?.Selling_Price_INR || 78247) * 0.915));
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
          <div className="form-field">
            <label style={{ color: '#94A3B8' }}>1. Showroom List MRP (₹)</label>
            <input type="number" value={mrp} onChange={e => setMrp(Number(e.target.value))} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>Printed on Catalog & Carton Labels</span>
          </div>

          <div className="form-field">
            <label style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>2. 🏬 Showroom Festive Price (₹)</label>
            <input type="number" value={festivePrice} onChange={e => setFestivePrice(Number(e.target.value))} style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', fontWeight: '800' }} />
            <span style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>Displayed on Standee QR & POS</span>
          </div>

          <div className="form-field">
            <label style={{ color: 'var(--accent-cyan)', fontWeight: '800' }}>3. 🏛️ VIP Architect Net Price (₹)</label>
            <input type="number" value={architectRate} onChange={e => setArchitectRate(Number(e.target.value))} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>8.5% Commission Slashed / Payout</span>
          </div>

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

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label style={{ color: '#64748B' }}>🏭 Factory Inward Cost + Transport Freight (₹ Hidden from Staff & Customer)</label>
            <input type="number" value={factoryCost} onChange={e => setFactoryCost(Number(e.target.value))} style={{ background: '#030712' }} />
          </div>
        </div>

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

    updateOrderStatus(orderId, `RESCHEDULED (${schedule})`);

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

    const cleanPhone = String(customerPhone || '').replace(/[^0-9]/g, '');
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

  // Multi-LLM Smart Router Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');

  // 📱 WhatsApp Automation Gateway State
  const [waDispatchMode, setWaDispatchMode] = useState('DEEP_LINK');
  const [waGatewayUrl, setWaGatewayUrl] = useState('');
  const [waGatewayApiKey, setWaGatewayApiKey] = useState('');
  const [waInstanceName, setWaInstanceName] = useState('srivinayaka_showroom');
  const [waStatusMsg, setWaStatusMsg] = useState(null);
  const [isTestingWa, setIsTestingWa] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKeys = getAiProviderKeys();
      setGeminiKey(currentKeys.geminiKey || '');
      setGroqKey(currentKeys.groqKey || '');
      setCustomEndpoint(currentKeys.customEndpoint || '');

      const waCfg = getWhatsAppGatewayConfig();
      setWaDispatchMode(waCfg.dispatchMode || 'DEEP_LINK');
      setWaGatewayUrl(waCfg.gatewayUrl || '');
      setWaGatewayApiKey(waCfg.gatewayApiKey || '');
      setWaInstanceName(waCfg.instanceName || 'srivinayaka_showroom');
      setWaStatusMsg(waCfg.isPaired ? '🟢 Connected & Paired' : null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestWa = async () => {
    setIsTestingWa(true);
    setWaStatusMsg('Connecting to gateway...');
    try {
      const res = await checkGatewayConnection({
        gatewayUrl: waGatewayUrl,
        gatewayApiKey: waGatewayApiKey,
        instanceName: waInstanceName
      });
      setWaStatusMsg(res.message);
      if (res.connected) {
        playSuccessChime();
        showToast("🟢 WhatsApp Gateway Connected & Paired!", true);
      } else {
        showToast(res.message, false);
      }
    } catch (e) {
      setWaStatusMsg(`🔴 Test failed: ${e.message}`);
    } finally {
      setIsTestingWa(false);
    }
  };

  const handleSave = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    // Save AI provider keys into secure storage
    saveAiProviderKey('gemini', geminiKey);
    saveAiProviderKey('groq', groqKey);
    saveAiProviderKey('customEndpoint', customEndpoint);

    // Save WhatsApp Gateway configuration
    saveWhatsAppGatewayConfig({
      dispatchMode: waDispatchMode,
      gatewayUrl: waGatewayUrl,
      gatewayApiKey: waGatewayApiKey,
      instanceName: waInstanceName
    });

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

    showToast("⚙️ Showroom Identity, UPI, AI & WhatsApp Gateway settings updated successfully!", true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', background: '#0B132B', border: '2px solid var(--accent-emerald)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-emerald">❤️ COMMERCIAL IDENTITY & AI HEART ENGINE</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              ⚙️ Showroom Identity, GST, AI & WhatsApp Settings
            </h3>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              White-label configuration powering invoices, UPI VPAs, Multi-LLM failover, and WhatsApp dispatch
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

        {/* 🧠 Multi-LLM Smart AI Provider Keys Vault */}
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Cpu size={15} color="var(--accent-gold)" />
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>
              Multi-LLM Smart Failover Provider Keys
            </div>
            <span className="badge badge-gold" style={{ fontSize: '9px' }}>FREE TIER ROUTER</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Powers 24/7 AI Concierge, Voice POS, and Ask My Showroom with automatic failover (Gemini ➡️ Groq LLaMA 3.3 ➡️ Local).
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                Google Gemini API Key (Primary)
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                Groq Cloud API Key (LLaMA 3.3 70B Fast Failover)
              </label>
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={e => setGroqKey(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                Custom FreeLLMAPI Endpoint (Optional)
              </label>
              <input
                type="text"
                placeholder="http://localhost:3001 or https://custom-proxy.com"
                value={customEndpoint}
                onChange={e => setCustomEndpoint(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* 📱 WhatsApp Dispatch & Automation Engine */}
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={15} color="var(--accent-emerald)" />
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>
                WhatsApp Dispatch & Automation Engine
              </div>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
              {waDispatchMode === 'DEEP_LINK' ? '1-CLICK WA.ME (ACTIVE)' : 'SELF-HOSTED GATEWAY'}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Select how OmniBuild OS dispatches invoices, delivery OTPs, factory indents, and 29 automated bots.
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => setWaDispatchMode('DEEP_LINK')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: waDispatchMode === 'DEEP_LINK' ? '2px solid var(--accent-emerald)' : '1px solid rgba(255,255,255,0.15)',
                background: waDispatchMode === 'DEEP_LINK' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                color: waDispatchMode === 'DEEP_LINK' ? 'var(--accent-emerald)' : '#94A3B8',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>◉ Mode 1: Universal 1-Click</div>
              <div style={{ fontSize: '9.5px', fontWeight: 'normal', marginTop: '2px', opacity: 0.85 }}>
                ₹0 Cost • Zero Setup • 100% Safe (Recommended)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setWaDispatchMode('SELF_HOSTED_GATEWAY')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: waDispatchMode === 'SELF_HOSTED_GATEWAY' ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.15)',
                background: waDispatchMode === 'SELF_HOSTED_GATEWAY' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                color: waDispatchMode === 'SELF_HOSTED_GATEWAY' ? 'var(--accent-gold)' : '#94A3B8',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>○ Mode 2: Self-Hosted QR Gateway</div>
              <div style={{ fontSize: '9.5px', fontWeight: 'normal', marginTop: '2px', opacity: 0.85 }}>
                Evolution API / Baileys • Headless Auto-Send
              </div>
            </button>
          </div>

          {/* Mode 1 Explainer */}
          {waDispatchMode === 'DEEP_LINK' && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#A7F3D0', lineHeight: '1.5' }}>
              ✅ <strong>Active & Ready:</strong> Staff clicks "Send on WhatsApp", and pre-formatted messages open directly in WhatsApp Web/Mobile.
              <br />• <strong>₹0 API Bills:</strong> Zero monthly charges from Meta.
              <br />• <strong>Zero Risk:</strong> No phone number bans, and staff can review before sending.
            </div>
          )}

          {/* Mode 2 Gateway Settings */}
          {waDispatchMode === 'SELF_HOSTED_GATEWAY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                  Gateway Server Endpoint URL (e.g. Railway / Render / Localhost)
                </label>
                <input
                  type="text"
                  placeholder="https://my-evolution-api.up.railway.app or http://localhost:8080"
                  value={waGatewayUrl}
                  onChange={e => setWaGatewayUrl(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Instance Name
                  </label>
                  <input
                    type="text"
                    placeholder="srivinayaka_showroom"
                    value={waInstanceName}
                    onChange={e => setWaInstanceName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Gateway API Key / Token
                  </label>
                  <input
                    type="password"
                    placeholder="Global API key..."
                    value={waGatewayApiKey}
                    onChange={e => setWaGatewayApiKey(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTestWa}
                  disabled={isTestingWa}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'rgba(212,175,55,0.2)',
                    border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold)',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Wifi size={13} /> {isTestingWa ? 'Testing Connection...' : 'Test Connection & Pair Status'}
                </button>

                {waStatusMsg && (
                  <div style={{ fontSize: '11px', color: waStatusMsg.includes('🟢') ? '#34D399' : '#FBBF24' }}>
                    {waStatusMsg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="btn-emerald" onClick={handleSave} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Save size={16} /> Save Showroom Configuration & Apply Everywhere
        </button>
      </div>
    </div>
  );
}

// ==============================================================================================
// 👑 HEART ENGINE 4: MULTI-ROOM WEDDING & VILLA FULL-HOME SUITE BUILDER
// ==============================================================================================
export function WeddingSuiteModal({ isOpen, onClose }) {
  const { showToast } = useStore();
  const [tier, setTier] = useState('GOLD');
  const [coupleName, setCoupleName] = useState('Priyanka & Rahul');
  const [phone, setPhone] = useState('9437188291');
  const [weddingDate, setWeddingDate] = useState('25-Nov-2026');
  const [freeGifts, setFreeGifts] = useState(true);

  if (!isOpen) return null;

  const packages = {
    SILVER: { price: 249000, rooms: '3 Rooms (8 Items)', discount: '15% Off (Save ₹44,000)' },
    GOLD: { price: 489000, rooms: '4 Rooms (14 Items)', discount: '20% Off (Save ₹1,22,000)' },
    DIAMOND: { price: 849000, rooms: '5 Rooms Villa (21 Items)', discount: '25% Off (Save ₹2,83,000)' }
  };

  const currentPkg = packages[tier];

  const handleGenerateBrochure = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('GENERATE_WEDDING_SUITE_PACKAGE', {
      tier,
      couple_name: coupleName,
      phone,
      wedding_date: weddingDate,
      package_price_inr: currentPkg.price,
      timestamp: new Date().toISOString()
    });

    const text = `👑 *ROYAL WEDDING SUITE PROPOSAL — GODREJ INTERIO RAYAGADA*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Warmest Congratulations to *${coupleName}* on your upcoming wedding on ${weddingDate}!\n\n` +
      `✨ *Selected Package:* ${tier} Grand Suite (${currentPkg.rooms})\n` +
      `💰 *Special Wedding Package Price:* ₹${(Number(currentPkg?.price) || 0).toLocaleString()} (${currentPkg.discount})\n` +
      `🎁 *Complimentary Festive Inclusions:* 2x Ortho Memory Foam Pillows + Mattress Protector + Free Master Fitting\n\n` +
      `👉 *View Full 3D Room Suite Renders:* https://shreeganesh-godrej.web.app/#concierge\n` +
      `📞 *Director VIP Desk:* +91 9390553301 | Main Road, Rayagada`;

    window.open(`https://wa.me/91${String(phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`👑 ${tier} Wedding Suite Brochure dispatched to ${coupleName}!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '680px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">👑 HIGH-TICKET HEART ENGINE 4</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              👑 Multi-Room Wedding & Villa Suite Builder
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}>
              High-Ticket Multi-Room Suite Bundler (₹2.5L to ₹8.5L Packages)
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tier Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '14px 0' }}>
          {[
            { id: 'SILVER', title: '🥉 Silver Starter', price: '₹2.49 Lakh', subtitle: '3 Rooms • 8 Items' },
            { id: 'GOLD', title: '🥈 Gold Royal Teak', price: '₹4.89 Lakh', subtitle: '4 Rooms • 14 Items' },
            { id: 'DIAMOND', title: '👑 Diamond Villa', price: '₹8.49 Lakh', subtitle: '5 Rooms • 21 Items' }
          ].map(p => (
            <div 
              key={p.id}
              onClick={() => setTier(p.id)}
              style={{
                background: tier === p.id ? 'rgba(212,175,55,0.15)' : '#030712',
                border: tier === p.id ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: tier === p.id ? 'var(--accent-gold-light)' : '#FFFFFF' }}>{p.title}</div>
              <div style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: '4px 0' }}>{p.price}</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{p.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Bride & Groom / Family Name</label>
            <input value={coupleName} onChange={e => setCoupleName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Customer WhatsApp Contact</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Wedding / Griha Pravesh Date</label>
            <input value={weddingDate} onChange={e => setWeddingDate(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Phased Delivery Phasing</label>
            <select>
              <option>Phase 1: Master Bed + Wardrobe (Pre-Wedding)</option>
              <option>Phase 2: Full Home Complete (Post-Wedding)</option>
            </select>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleGenerateBrochure} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '14px' }}>
          <Sparkles size={16} /> 👑 Generate Luxury Wedding Brochure & WhatsApp PDF (₹{(Number(currentPkg?.price) || 0).toLocaleString()})
        </button>
      </div>
    </div>
  );
}

// ==============================================================================================
// 🛡️ HEART ENGINE 5: POST-ASSEMBLY QC & 5-YEAR DIGITAL WARRANTY ENGINE
// ==============================================================================================
export function MistriQcWarrantyModal({ isOpen, onClose, stop = {} }) {
  const { showToast } = useStore();
  const [checks, setChecks] = useState({
    hydraulic: true,
    hinges: true,
    polish: true,
    glass: true,
    csat: true
  });
  const [customerPhone, setCustomerPhone] = useState(stop.Customer_Phone || '9437188291');

  if (!isOpen) return null;

  const toggleCheck = (k) => setChecks(prev => ({ ...prev, [k]: !prev[k] }));

  const handleIssueWarranty = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const certId = "WAR-GODREJ-" + Utilities?.getUuid ? Utilities.getUuid().substring(0, 6).toUpperCase() : Math.floor(100000 + Math.random() * 900000);

    dispatchWebhookAction('ISSUE_DIGITAL_WARRANTY_QC', {
      order_id: stop.Order_ID || 'ORD-8921',
      customer_name: stop.Customer_Name || 'Dr. Subhashish Jena',
      customer_phone: customerPhone,
      warranty_cert_no: certId,
      qc_passed: true,
      timestamp: new Date().toISOString()
    });

    const text = `🛡️ *OFFICIAL GODREJ INTERIO 5-YEAR WARRANTY CERTIFICATE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear ${stop.Customer_Name || 'Customer'}, your solid furniture assembly has passed our 5-Point Quality Control (QC) inspection!\n\n` +
      `📜 *Warranty Certificate #:* ${certId}\n` +
      `🗓️ *Coverage Period:* 2026 to 2031 (5 Full Years Comprehensive)\n` +
      `🪚 *Master Fitter:* Narayana Mistri (Sign-Off Verified ✓)\n` +
      `🎁 *Bonus Service:* Includes 2x Free Annual Polish & Hydraulic Tune-Up Reminders\n\n` +
      `👉 *Download Certificate PDF:* https://shreeganesh-godrej.web.app/#documents\n` +
      `📞 *Customer Care Desk:* +91 9390553301`;

    window.open(`https://wa.me/91${String(customerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`🛡️ 5-Year Warranty Certificate #${certId} dispatched to ${stop.Customer_Name || 'Customer'}!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid var(--accent-emerald)' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-emerald">🛡️ QUALITY HEART ENGINE 5</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🛡️ Post-Assembly QC & 5-Year Digital Warranty
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
              Order #{stop.Order_ID || 'ORD-8921'} — {stop.Customer_Name || 'Dr. Subhashish Jena'}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 5-Point QC Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
          {[
            { id: 'hydraulic', label: '1. Hydraulic Shock Absorbers & Lift-Up Test (Passed Smoothly ✓)' },
            { id: 'hinges', label: '2. Wardrobe Soft-Close Hinges & Drawer Channels (100% Aligned ✓)' },
            { id: 'polish', label: '3. Solid Teak Polish & Edge-Banding (Zero Scratches Verified ✓)' },
            { id: 'glass', label: '4. Toughened Glass Top & Leveling Buffers (Firmly Sealed ✓)' },
            { id: 'csat', label: '5. Customer 5-Star Experience & Clean Workspace Handover ✓' }
          ].map(item => (
            <label 
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                background: checks[item.id] ? 'rgba(16,185,129,0.12)' : '#030712',
                border: checks[item.id] ? '1px solid var(--accent-emerald)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '12px',
                color: checks[item.id] ? '#34D399' : '#94A3B8'
              }}
            >
              <input type="checkbox" checked={checks[item.id]} onChange={() => {}} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <button className="btn-emerald" onClick={handleIssueWarranty} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Check size={16} /> 🛡️ Issue Official Godrej 5-Year Digital Warranty Card
        </button>
      </div>
    </div>
  );
}

// ==============================================================================================
// 📉 HEART ENGINE 6: AGING STOCK CLEARANCE & LIQUIDITY RADAR MODAL
// ==============================================================================================
export function AgingStockModal({ isOpen, onClose }) {
  const { inventory, showToast } = useStore();
  const [discountPct, setDiscountPct] = useState(20);

  if (!isOpen) return null;

  const agingItems = [
    { sku: 'BED-MOD-001', name: 'Solid King Bed (Hydraulic)', days: 112, bay: 'Bay 3', stock: 3, mrp: 98000, price: 78247 },
    { sku: 'SOF-MOD-015', name: 'Royal Velvet 3+1+1 Sofa', days: 104, bay: 'Bay 2', stock: 2, mrp: 85000, price: 68000 },
    { sku: 'DIN-MOD-004', name: 'Solid Teak 6-Seater Dining Table', days: 96, bay: 'Bay 4', stock: 1, mrp: 62000, price: 49500 }
  ];

  const handleLaunchFlashSale = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('LAUNCH_AGING_STOCK_FLASH_SALE', {
      discount_pct: discountPct,
      items_count: agingItems.length,
      timestamp: new Date().toISOString()
    });

    const text = `⚡ *GODREJ INTERIO RAYAGADA — 48-HOUR FLASH FLOOR CLEARANCE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Exclusive VIP Preview: Clear space for fresh factory arrivals with *Flat ${discountPct}% Clearance Markdowns*!\n\n` +
      `🛏️ *Solid King Bed (Hydraulic):* ₹${Math.round(78247 * (1 - discountPct/100)).toLocaleString()} (Save ₹${Math.round(78247 * (discountPct/100)).toLocaleString()})\n` +
      `🛋️ *Royal Velvet Sofa Set:* ₹${Math.round(68000 * (1 - discountPct/100)).toLocaleString()}\n` +
      `🪑 *Teak 6-Seater Dining:* ₹${Math.round(49500 * (1 - discountPct/100)).toLocaleString()}\n\n` +
      `👉 *Claim Clearance Piece:* https://shreeganesh-godrej.web.app/#safelock\n` +
      `📞 *Showroom Desk:* +91 9390553301 | Main Road, Rayagada`;

    window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`⚡ 48-Hour Flash Clearance Flyer dispatched to past leads!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', background: '#0B132B', border: '2px solid #F43F5E' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-rose">📉 LIQUIDITY HEART ENGINE 6</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              📉 Aging Stock Clearance & Liquidity Radar
            </h3>
            <div style={{ fontSize: '11px', color: '#FDA4AF' }}>
              {agingItems.length} Models Aging 90+ Days (₹3.4L Working Capital Locked)
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
          {agingItems.map(item => (
            <div key={item.sku} style={{ background: '#030712', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(244,63,94,0.3)' }}>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.sku} • {item.bay} • <b>{item.stock} Units left</b></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-rose" style={{ fontSize: '10px' }}>{item.days} DAYS IN STORE</span>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginTop: '2px' }}>₹{(Number(item?.price) || 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-field" style={{ marginBottom: '14px' }}>
          <label>Clearance Markdown Discount ({discountPct}%)</label>
          <input type="range" min={10} max={35} step={5} value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} />
        </div>

        <button className="btn-luxury-gold" onClick={handleLaunchFlashSale} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Zap size={16} /> ⚡ Launch 48-Hour Flash Markdown & WhatsApp Flyer
        </button>
      </div>
    </div>
  );
}

// ==============================================================================================
// 🧵 HEART ENGINE 8: FABRIC SWATCH, WOOD POLISH & CUSTOM FINISH ENGINE
// ==============================================================================================
export function CustomFinishModal({ isOpen, onClose, sku = 'SOF-MOD-015' }) {
  const { showToast } = useStore();
  const [finishStep, setFinishStep] = useState(1);
  const [fabric, setFabric] = useState('Royal Navy Velvet (Pantone 19-4052)');
  const [polish, setPolish] = useState('Dark Walnut PU Matte');
  const [hardware, setHardware] = useState('Brushed Gold Brass Accents');
  const [notes, setNotes] = useState('Double stitching on headboard cushions • 4-inch high-resilience foam padding');

  if (!isOpen) return null;

  const handleSaveFinish = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('SAVE_CUSTOM_FINISH_SPEC', {
      sku,
      fabric,
      polish,
      hardware,
      notes,
      timestamp: new Date().toISOString()
    });

    showToast(`🧵 Custom Finishes attached to ${sku}! Factory Job Card updated.`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card glass-panel" style={{ maxWidth: '580px', width: '95%', background: '#0B132B', border: '2px solid var(--accent-gold)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', padding: '24px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '12px', marginBottom: '14px' }}>
          <div>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>BESPOKE FACTORY JOB CARD</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0 0' }}>
              🧵 Custom Fabric, Polish & Finish Spec Studio
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              SKU: <b>{sku}</b> • Godrej Interio Rayagada Factory Order Card
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 3-Step Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 🧵 Fabric & Velvet' },
            { step: 2, label: '2. 🪵 Polish & Metal' },
            { step: 3, label: '3. 📋 Factory Job Card' }
          ].map(s => {
            const isActive = finishStep === s.step;
            const isDone = finishStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setFinishStep(s.step);
                  playScanBeep();
                }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: isActive ? '900' : '700',
                  background: isActive 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                    : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                  border: isActive ? '1px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>

        {/* STEP 1 */}
        {finishStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                1. Upholstery Fabric / Leatherette Selection:
              </label>
              <select value={fabric} onChange={e => setFabric(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="Royal Navy Velvet (Pantone 19-4052)">Royal Navy Velvet (Pantone 19-4052) • 450 GSM</option>
                <option value="Emerald Green Velvet (Pantone 19-5420)">Emerald Green Velvet (Pantone 19-5420) • Luxury Suede</option>
                <option value="Tan Italian Leatherette (Breathable Microfibre)">Tan Italian Leatherette (Breathable Microfibre)</option>
                <option value="Tuscan Terracotta Textured Linen">Tuscan Terracotta Textured Linen (Water-Repellent)</option>
                <option value="Slate Grey Poly-Viscose Chenille">Slate Grey Poly-Viscose Chenille (Anti-Stain)</option>
              </select>
            </div>

            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#94A3B8' }}>
              ℹ️ All custom upholstery options are factory-treated with <b>Scotchgard™ Stain & Water Shield</b>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setFinishStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Wood Polish & Hardware ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {finishStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                2. Solid Wood Polish Tone & Finish:
              </label>
              <select value={polish} onChange={e => setPolish(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="Dark Walnut PU Matte">Dark Walnut PU Matte (Scratch-Resistant Italian Coating)</option>
                <option value="Natural Teak Satin Lustre">Natural Teak Satin Lustre (Golden Grain Highlight)</option>
                <option value="Smoked Charcoal Oak">Smoked Charcoal Oak (Nordic Contemporary)</option>
                <option value="Gloss Mahogany Polyurethane">Gloss Mahogany Polyurethane (Classic Heritage)</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                3. Metal Hardware & Foot Caps Finish:
              </label>
              <select value={hardware} onChange={e => setHardware(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="Brushed Gold Brass Accents">Brushed Gold Brass Accents (PVD Coated • Anti-Tarnish)</option>
                <option value="Matte Black Anodized Aluminium">Matte Black Anodized Aluminium</option>
                <option value="Antique Rose Gold Copper">Antique Rose Gold Copper</option>
                <option value="Mirror Polished Chrome">Mirror Polished Chrome Stainless Steel 304</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setFinishStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Fabric
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setFinishStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Factory Production Card ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {finishStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                Special Factory Carpenter Instructions:
              </label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3} 
                style={{ padding: '10px', fontSize: '12px', lineHeight: '1.4' }}
              />
            </div>

            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(212,175,55,0.3)', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--accent-gold-light)' }}>📋 Production Job Card Summary:</strong><br />
              • Fabric: <b>{fabric}</b><br />
              • Polish: <b>{polish}</b><br />
              • Hardware: <b>{hardware}</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setFinishStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-luxury-gold" onClick={handleSaveFinish} style={{ flex: 1, marginLeft: '10px', justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
                <Check size={16} /> 🧵 Attach Custom Finishes to Job Card
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function BoxDamageClaimModal({ isOpen, onClose, stop = {} }) {
  const { showToast } = useStore();
  const [damagedBox, setDamagedBox] = useState('Box A: Headboard & Lift Frame (42 KG)');
  const [damageType, setDamageType] = useState('Corner Dented in Transport Transit');
  const [actionChoice, setActionChoice] = useState('SWAP_FROM_BUFFER');

  if (!isOpen) return null;

  const handleFileClaim = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const claimId = "CLM-BOX-" + Math.floor(100000 + Math.random() * 900000);

    dispatchWebhookAction('FILE_TRANSIT_DAMAGE_CLAIM', {
      claim_id: claimId,
      order_id: stop.Order_ID || 'ORD-8921',
      customer_name: stop.Customer_Name || 'Dr. Subhashish Jena',
      damaged_box: damagedBox,
      damage_type: damageType,
      action_choice: actionChoice,
      timestamp: new Date().toISOString()
    });

    showToast(`📦 Claim #${claimId} logged! Emergency single-box replacement dispatched from Warehouse Bay 1.`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid #F43F5E' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-rose">📦 TRANSIT SHIELD HEART ENGINE 9</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              📦 1-Box Rapid Replacement & Damage Shield
            </h3>
            <div style={{ fontSize: '11px', color: '#FDA4AF' }}>
              Order #{stop.Order_ID || 'ORD-8921'} — {stop.Customer_Name || 'Dr. Subhashish Jena'}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid" style={{ margin: '14px 0' }}>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Damaged Component Box (5-Box Knockdown)</label>
            <select value={damagedBox} onChange={e => setDamagedBox(e.target.value)}>
              <option value="Box A: Headboard & Lift Frame (42 KG)">Box A: Headboard & Lift Frame (42 KG)</option>
              <option value="Box B: Solid Teak Side Rails & Footboard (28 KG)">Box B: Solid Teak Side Rails & Footboard (28 KG)</option>
              <option value="Box C: Heavy Metal Slats & Frame Grid (24.5 KG)">Box C: Heavy Metal Slats & Frame Grid (24.5 KG)</option>
              <option value="Box D: Gas-Lift Shock Absorbers & Hardware (18 KG)">Box D: Gas-Lift Shock Absorbers & Hardware (18 KG)</option>
              <option value="Box E: Assembly Screws & Brackets (16 KG)">Box E: Assembly Screws & Brackets (16 KG)</option>
            </select>
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Damage Severity & Inspection Notes</label>
            <input value={damageType} onChange={e => setDamageType(e.target.value)} />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Emergency Resolution Action</label>
            <select value={actionChoice} onChange={e => setActionChoice(e.target.value)}>
              <option value="SWAP_FROM_BUFFER">⚡ 24-Hour Buffer Swap (Dispatch ONLY Damaged Box)</option>
              <option value="FACTORY_AIR_EXPRESS">✈️ Factory Emergency Air Courier</option>
              <option value="LOCAL_POLISH_RETOUCH">🪚 On-Site Carpenter Polish Re-Touch</option>
            </select>
          </div>
        </div>

        <button className="btn-rose" onClick={handleFileClaim} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <AlertCircle size={16} /> File Insurance Claim & Dispatch Replacement Box
        </button>
      </div>
    </div>
  );
}

// ==============================================================================================
// 🧼 HEART ENGINE 10: GODREJ CARE™ ANNUAL AMC & DEEP-CLEANING SUBSCRIPTION
// ==============================================================================================
export function GodrejCareAmcModal({ isOpen, onClose, customer = {} }) {
  const { showToast } = useStore();
  const [amcStep, setAmcStep] = useState(1);
  const [plan, setPlan] = useState('GOLD_AMC');
  const [customerName, setCustomerName] = useState(customer.Customer_Name || 'Dr. Subhashish Jena');
  const [phone, setPhone] = useState(customer.Phone || '9437188291');

  if (!isOpen) return null;

  const handleEnrollAmc = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const amcId = "AMC-" + Math.floor(100000 + Math.random() * 900000);

    dispatchWebhookAction('ENROLL_AMC_SUBSCRIPTION', {
      amc_id: amcId,
      customer_name: customerName,
      phone,
      plan,
      price: plan === 'GOLD_AMC' ? 2999 : 4999,
      timestamp: new Date().toISOString()
    });

    const text = `🧼 *GODREJ CARE™ ANNUAL AMC MEMBERSHIP ACTIVATED*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear ${customerName}, welcome to Godrej Care™ AMC Protection for your home furniture!\n\n` +
      `📋 *Membership ID:* ${amcId}\n` +
      `🛡️ *Plan Tier:* ${plan === 'GOLD_AMC' ? 'Gold Annual Protection (₹2,999/yr)' : 'Platinum Villa Complete (₹4,999/yr)'}\n` +
      `✨ *Included Services:*\n` +
      `• 2x Free Annual Deep Steam Foam Cleaning\n` +
      `• 4x Mechanical Hardware & Hydraulic Tightening\n` +
      `• Zero-Cost Replacement for Hinges & Drawer Channels\n` +
      `• 24-Hour Priority Mistri Breakdown Visit\n\n` +
      `📍 *Godrej Interio Rayagada Hotline:* +91 93905 53301`;

    const waUrl = `https://wa.me/91${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    showToast(`🧼 Godrej Care™ AMC Activated for ${customerName}! WhatsApp Welcome Kit dispatched.`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card glass-panel" style={{ maxWidth: '580px', width: '95%', background: '#0B132B', border: '2px solid var(--accent-cyan)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', padding: '24px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '12px', marginBottom: '14px' }}>
          <div>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>ANNUAL WARRANTY & CARE</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0 0' }}>
              🧼 Godrej Care™ Annual Maintenance Contract (AMC)
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Keep high-ticket teak and hydraulic beds in 100% pristine showroom condition
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 3-Step Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 👤 Customer' },
            { step: 2, label: '2. 🛡️ Plan Tier' },
            { step: 3, label: '3. 💳 WhatsApp Kit' }
          ].map(s => {
            const isActive = amcStep === s.step;
            const isDone = amcStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setAmcStep(s.step);
                  playScanBeep();
                }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: isActive ? '900' : '700',
                  background: isActive 
                    ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' 
                    : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#FFFFFF' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                  border: isActive ? '1px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>

        {/* STEP 1 */}
        {amcStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                1. Customer Full Name:
              </label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ padding: '10px' }} />
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                2. WhatsApp Mobile Number:
              </label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-cyan" 
                onClick={() => {
                  setAmcStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Select AMC Protection Tier ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {amcStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div 
                onClick={() => setPlan('GOLD_AMC')} 
                style={{
                  background: plan === 'GOLD_AMC' ? 'rgba(212,175,55,0.18)' : '#030712',
                  border: plan === 'GOLD_AMC' ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>Gold Protection</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: '4px 0' }}>₹2,999 <span style={{ fontSize: '11px', color: '#94A3B8' }}>/ year</span></div>
                <div style={{ fontSize: '10.5px', color: '#CBD5E1', lineHeight: '1.4' }}>
                  • 2x Steam Deep Clean<br />
                  • 4x Hardware Check<br />
                  • 24-hr Service Callout
                </div>
              </div>

              <div 
                onClick={() => setPlan('PLATINUM_VILLA_AMC')} 
                style={{
                  background: plan === 'PLATINUM_VILLA_AMC' ? 'rgba(56,189,248,0.18)' : '#030712',
                  border: plan === 'PLATINUM_VILLA_AMC' ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-cyan)' }}>Platinum Villa</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: '4px 0' }}>₹4,999 <span style={{ fontSize: '11px', color: '#94A3B8' }}>/ year</span></div>
                <div style={{ fontSize: '10.5px', color: '#CBD5E1', lineHeight: '1.4' }}>
                  • Complete Home Furniture<br />
                  • Unlimited Free Mistri Calls<br />
                  • Zero-Cost Hinge Replacement
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setAmcStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Customer
              </button>
              <button 
                type="button" 
                className="btn-cyan" 
                onClick={() => {
                  setAmcStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Payment & Activation ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {amcStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(56,189,248,0.3)', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>✓ Subscription Summary:</strong><br />
              • Member: <b>{customerName}</b> ({phone})<br />
              • Plan: <b>{plan === 'GOLD_AMC' ? 'Gold Annual Protection' : 'Platinum Villa Complete'}</b><br />
              • Fee: <b>₹{plan === 'GOLD_AMC' ? '2,999' : '4,999'} / year</b> (Auto-synced to Sheets)
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setAmcStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-cyan" onClick={handleEnrollAmc} style={{ flex: 1, marginLeft: '10px', justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
                <Check size={16} /> 🧼 Activate AMC & Send WhatsApp Pass
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function B2bTurnkeyModal({ isOpen, onClose }) {
  const { showToast } = useStore();
  const [b2bStep, setB2bStep] = useState(1);
  const [pkg, setPkg] = useState('OFFICE_50');
  const [orgName, setOrgName] = useState('Odisha Mineral Development Corp (OMDC)');
  const [contactPerson, setContactPerson] = useState('Shri B. K. Mohapatra (GM Admin)');
  const [phone, setPhone] = useState('9437188291');
  const [gstin, setGstin] = useState('21AAAC0000A1Z5');

  if (!isOpen) return null;

  const packages = {
    OFFICE_50: { title: '50-Seater Modern Corporate Office Fitout', price: 1480000, desc: '50 Ergonomic Mesh Chairs + 12 Workstation Pods + 1 Boardroom Table + 2 Executive Cabins' },
    BANK_BRANCH: { title: 'Commercial Bank Branch Turnkey Package', price: 1850000, desc: 'Manager Cabin + 4 Cashier Enclosures + 3 Customer Lounge Sofas + 10 Heavy Steel Cupboards' },
    HOSPITAL_SUITE: { title: 'Hospital & Clinic Turnkey Package', price: 1120000, desc: 'Doctor Consultation Desks + 30 Waiting Room Chairs + Reception Counter + 4 Examination Couches' }
  };

  const selected = packages[pkg];

  const handleGenerateQuote = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const quoteId = "B2B-QUOTE-" + Math.floor(10000 + Math.random() * 90000);

    dispatchWebhookAction('GENERATE_B2B_TURNKEY_PROPOSAL', {
      quote_id: quoteId,
      organization: orgName,
      contact: contactPerson,
      phone,
      gstin,
      package_title: selected.title,
      package_price: selected.price,
      timestamp: new Date().toISOString()
    });

    const text = `🏛️ *GODREJ INTERIO B2B INSTITUTIONAL TURNKEY PROPOSAL*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear ${contactPerson} (${orgName}),\n\n` +
      `We are pleased to submit the official turnkey commercial proposal:\n` +
      `📄 *Proposal Ref:* ${quoteId}\n` +
      `📦 *Project Scope:* ${selected.title}\n` +
      `✨ *Included BIFMA Certified Items:* ${selected.desc}\n\n` +
      `💰 *Institutional Commercial Value:* ₹${(Number(selected?.price) || 0).toLocaleString()} + 18% GST\n` +
      `💳 *Payment Milestones:* 40% Mobilization Advance • 40% On Delivery • 20% Sign-Off\n` +
      `🛡️ *Warranty:* 5-Year Comprehensive On-Site Godrej Commercial Warranty\n\n` +
      `🏢 *Godrej Interio Commercial Projects Division, Rayagada*\n` +
      `📞 *Director Hotline:* +91 93905 53301`;

    const waUrl = `https://wa.me/91${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    showToast(`🏛️ B2B Proposal ${quoteId} generated & dispatched to ${orgName} on WhatsApp!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card glass-panel" style={{ maxWidth: '620px', width: '95%', background: '#0B132B', border: '2px solid var(--accent-gold)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', padding: '24px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '12px', marginBottom: '14px' }}>
          <div>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>COMMERCIAL B2B TURNKEY</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0 0' }}>
              🏛️ Institutional Tender & Turnkey Quote Generator
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              OMDC • Vedanta • JK Paper • Banks • Hospitals & Govt Institutions
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 3-Step Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 🏛️ Client Profile' },
            { step: 2, label: '2. 📦 BIFMA Package' },
            { step: 3, label: '3. 💳 Tender Mandate' }
          ].map(s => {
            const isActive = b2bStep === s.step;
            const isDone = b2bStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setB2bStep(s.step);
                  playScanBeep();
                }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: isActive ? '900' : '700',
                  background: isActive 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                    : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                  border: isActive ? '1px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>

        {/* STEP 1 */}
        {b2bStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>Organization / Company Name</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} style={{ padding: '8px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label style={{ fontSize: '11px' }}>Officer / Contact Person</label>
                <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} style={{ padding: '8px' }} />
              </div>
              <div className="form-field">
                <label style={{ fontSize: '11px' }}>WhatsApp Mobile</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '8px' }} />
              </div>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Institutional GSTIN / PAN</label>
              <input value={gstin} onChange={e => setGstin(e.target.value)} style={{ padding: '8px', fontFamily: 'JetBrains Mono' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setB2bStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Select Package & BIFMA Specs ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {b2bStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>Select Institutional Package:</label>
              <select value={pkg} onChange={e => setPkg(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="OFFICE_50">50-Seater Modern Corporate Office Fitout (₹14,80,000)</option>
                <option value="BANK_BRANCH">Commercial Bank Branch Turnkey Package (₹18,50,000)</option>
                <option value="HOSPITAL_SUITE">Hospital & Clinic Turnkey Package (₹11,20,000)</option>
              </select>
            </div>

            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(212,175,55,0.25)', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--accent-emerald)' }}>📦 Package Scope & BIFMA Level 3 Compliance:</strong><br />
              {selected.desc}<br />
              <strong style={{ color: 'var(--accent-gold-light)' }}>Base Cost: ₹{(Number(selected?.price) || 0).toLocaleString()} (+ 18% GST)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setB2bStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Client
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setB2bStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Milestone Terms & WhatsApp ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {b2bStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(212,175,55,0.3)', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--accent-gold-light)' }}>📋 Institutional Proposal Mandate:</strong><br />
              • Client: <b>{orgName}</b> ({contactPerson})<br />
              • Package: <b>{selected.title}</b><br />
              • Total: <b>₹{(Number(selected?.price) || 0).toLocaleString()} + GST</b><br />
              • Milestone Terms: <b>40% Advance • 40% Delivery • 20% Sign-Off</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setB2bStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-luxury-gold" onClick={handleGenerateQuote} style={{ flex: 1, marginLeft: '10px', justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
                <Send size={16} /> 🏛️ Dispatch Formal B2B Quotation (WhatsApp)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

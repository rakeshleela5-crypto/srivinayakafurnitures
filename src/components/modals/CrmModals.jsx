import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Check, Calculator, Sparkles } from 'lucide-react';
import { dispatchWebhookAction } from '../../services/webhookService';

export function ShowroomAdvanceModal({ isOpen, onClose, data = {} }) {
  const { triggerSafeLockOrder, storeMeta } = useStore();
  const [customerName, setCustomerName] = useState(data.customerName || "Dr. Subhashish Jena");
  const [phone, setPhone] = useState(data.phone || "9437188291");
  const [address, setAddress] = useState(data.address || "Gayatri Nagar Villa, Rayagada");
  const [items, setItems] = useState(data.items || "Solid King Bed + 4D Wardrobe");
  const [totalAmount, setTotalAmount] = useState(data.totalAmount || 156494);
  const [discountPct, setDiscountPct] = useState(5);
  const [advancePct, setAdvancePct] = useState(50);

  if (!isOpen) return null;

  const discountedTotal = Math.round(totalAmount * (1 - discountPct / 100));
  const advanceAmount = Math.round(discountedTotal * (advancePct / 100));
  const balanceDue = discountedTotal - advanceAmount;

  const handleConfirmAdvance = () => {
    triggerSafeLockOrder({
      customerName,
      phone,
      address,
      items,
      totalAmount: discountedTotal,
      advancePaid: advanceAmount,
      balanceDue,
      paymentMode: "50% Advance Cash/UPI"
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3><Calculator size={18} color="var(--accent-gold)" /> 💵 Record Showroom Booking Advance</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Customer Name</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>WhatsApp / Mobile Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Delivery Site / Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Selected Furniture Packages</label>
            <input value={items} onChange={e => setItems(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Standard MRP Total (₹)</label>
            <input type="number" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Spot Discount (%)</label>
            <input type="number" value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Advance Deposit Ratio (%)</label>
            <input type="number" value={advancePct} onChange={e => setAdvancePct(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Calculated Advance (₹)</label>
            <input type="text" value={`₹${advanceAmount.toLocaleString()}`} disabled style={{ fontWeight: 'bold', color: 'var(--accent-green)' }} />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Final Quoted Price:</span>
            <strong>₹{discountedTotal.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Advance Received:</span>
            <strong style={{ color: 'var(--accent-green)' }}>₹{advanceAmount.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Doorstep Balance Due:</span>
            <strong style={{ color: 'var(--accent-gold)' }}>₹{balanceDue.toLocaleString()}</strong>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleConfirmAdvance} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Check size={16} /> Save & SafeLock Booking (50% Advance)
        </button>
      </div>
    </div>
  );
}

export function NewInquiryModal({ isOpen, onClose }) {
  const { inquiries, setInquiries, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Gayatri Nagar, Rayagada');
  const [category, setCategory] = useState('Solid Teak Hydraulic King Bed');
  const [budget, setBudget] = useState(85000);
  const [score, setScore] = useState(88);
  const [staff, setStaff] = useState('Rakesh (Store Manager)');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const inqId = `INQ-2026-${Math.floor(900 + Math.random() * 99)}`;
    const newInq = {
      Inquiry_ID: inqId,
      Inquiry_Date: "Today, Just Now",
      Customer_Name: name || "Walk-In Visitor",
      Customer_Phone: phone || "9437100000",
      Address: address,
      Category_Models: category,
      Budget_INR: Number(budget),
      AI_Intent_Score: Number(score),
      Intent_Badge: Number(score) >= 80 ? "HOT_LEAD 🔥" : "WARM_LEAD ⚡",
      Follow_Up_Date: "Tomorrow",
      Status: "HOT_LEAD",
      Assigned_Staff: staff
    };

    setInquiries([newInq, ...inquiries]);

    dispatchWebhookAction('LOG_WALKIN_LEAD', {
      inquiry_id: inqId,
      customer_name: newInq.Customer_Name,
      customer_phone: newInq.Customer_Phone,
      address: address,
      category_models: category,
      budget_inr: Number(budget),
      ai_intent_score: Number(score),
      intent_badge: newInq.Intent_Badge,
      assigned_staff: staff,
      timestamp: new Date().toISOString()
    });

    showToast(`➕ New Showroom Lead logged for ${newInq.Customer_Name} (AI Score: ${score}%) & synced to Google Sheets!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3><Sparkles size={18} color="var(--accent-cyan)" /> ➕ Log Showroom Footfall Walk-In Lead</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Customer Full Name</label>
            <input placeholder="e.g. Dr. Subhashish Jena" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>WhatsApp / Mobile Phone</label>
            <input placeholder="e.g. 9437188291" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Rayagada Locality / Site</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Furniture Category & Models of Interest</label>
            <input value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Estimated Budget (₹)</label>
            <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>AI Intent Buying Score ({score}%)</label>
            <select value={score} onChange={e => setScore(Number(e.target.value))}>
              <option value="94">94% (Hot - Ready to Buy Today)</option>
              <option value="85">85% (Hot - Comparing Models)</option>
              <option value="70">70% (Warm - House Under Construction)</option>
              <option value="50">50% (Cold - General Inquiry)</option>
            </select>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assigned Showroom Executive</label>
            <select value={staff} onChange={e => setStaff(e.target.value)}>
              <option value="Rakesh (Store Manager)">Rakesh (Store Manager)</option>
              <option value="Sunil (Senior Sales Rep)">Sunil (Senior Sales Rep)</option>
              <option value="Pooja (Interior Specialist)">Pooja (Interior Specialist)</option>
            </select>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Check size={16} /> Save Lead to Inquiries_Log Sheet
        </button>
      </div>
    </div>
  );
}

export function ScheduleMistriVisitModal({ isOpen, onClose, lead = {} }) {
  const { inquiries, setInquiries, showToast } = useStore();
  const [mistri, setMistri] = useState("Narayana Mistri (Master Carpenter)");
  const [slot, setSlot] = useState("Tomorrow 04:30 PM");
  const [serviceType, setServiceType] = useState("FREE_ROOM_MEASUREMENT_VISIT");
  const [remarks, setRemarks] = useState("Bring Solid Teak Swatches & Laser Room Meter");

  if (!isOpen) return null;

  const handleConfirmVisit = () => {
    const woId = `WO-MISTRI-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update local lead state
    setInquiries(prev => prev.map(item => {
      if (item.Inquiry_ID === lead.Inquiry_ID) {
        return {
          ...item,
          Follow_Up_Date: `Mistri: ${slot}`,
          Status: "MISTRI_VISIT_SCHEDULED"
        };
      }
      return item;
    }));

    // Webhook dispatch to Google Sheets Carpenter_Work_Orders + Inquiries_Log
    dispatchWebhookAction("SCHEDULE_MISTRI_VISIT", {
      inquiry_id: lead.Inquiry_ID,
      customer_name: lead.Customer_Name,
      customer_phone: lead.Customer_Phone,
      address: lead.Address || lead.Locality_Address || "Rayagada Town",
      service_type: serviceType,
      assigned_mistri: mistri,
      scheduled_time: slot,
      remarks: remarks,
      timestamp: new Date().toISOString()
    });

    playSuccessChime();
    showToast(`📐 Free Mistri Home Visit #${woId} booked with ${mistri} for ${lead.Customer_Name}!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid var(--accent-purple)' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(168,85,247,0.2)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
              📐 Schedule Free Mistri Room Measurement
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Dispatch Godrej certified carpenter to {lead.Customer_Name}'s site for 3D room laser mapping
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '14px 0' }}>
          <div className="form-field">
            <label style={{ fontSize: '11px', color: 'var(--accent-purple)' }}>Customer Name</label>
            <input value={lead.Customer_Name || ''} disabled style={{ opacity: 0.8 }} />
          </div>
          <div className="form-field">
            <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Contact Phone</label>
            <input value={lead.Customer_Phone || ''} disabled style={{ opacity: 0.8 }} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Site Address / Locality</label>
            <input value={lead.Address || lead.Locality_Address || 'Rayagada Town'} disabled style={{ opacity: 0.8 }} />
          </div>
          <div className="form-field">
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Assigned Master Carpenter</label>
            <select value={mistri} onChange={e => setMistri(e.target.value)}>
              <option value="Narayana Mistri (Master Carpenter)">Narayana Mistri (15 Yrs Exp)</option>
              <option value="Bishnu Mistri (Modular Specialist)">Bishnu Mistri (Modular Specialist)</option>
              <option value="Tophan Gouda (Installation Tech)">Tophan Gouda (Installation Tech)</option>
            </select>
          </div>
          <div className="form-field">
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Home Visit Date & Time</label>
            <input value={slot} onChange={e => setSlot(e.target.value)} placeholder="e.g. Tomorrow 04:30 PM" />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Service Type</label>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
              <option value="FREE_ROOM_MEASUREMENT_VISIT">Free 3D Room Laser Measurement & Site Survey</option>
              <option value="WALL_STRENGTH_CHECK">Modular Kitchen Wall Strength & Plumbing Inspection</option>
              <option value="EXCHANGE_FURNITURE_EVALUATION">Old Furniture Buyback Physical Evaluation</option>
            </select>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Special Instructions</label>
            <input value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(168,85,247,0.2)', paddingTop: '12px' }}>
          <button className="btn-ghost-edit" onClick={onClose}>Cancel</button>
          <button className="btn-purple" onClick={handleConfirmVisit} style={{ padding: '8px 22px' }}>
            <Check size={16} /> Confirm & Dispatch Carpenter Work Order
          </button>
        </div>
      </div>
    </div>
  );
}

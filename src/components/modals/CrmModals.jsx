import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Check, Calculator, Sparkles } from 'lucide-react';

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

  const handleConfirm = () => {
    triggerSafeLockOrder({
      Customer_Name: customerName,
      Customer_Phone: phone,
      Project_Address: address,
      Ordered_SKU: items,
      Total_Amount_INR: discountedTotal,
      Advance_Paid_INR: advanceAmount,
      Balance_Due_INR: balanceDue,
      Delivery_Schedule: "Today, Express 04:30 PM"
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3><Calculator size={18} color="var(--accent-gold)" /> Edit Quotation & 50% Advance Token</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Customer Full Name</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>WhatsApp Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Project / Delivery Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Quoted Furniture Models</label>
            <input value={items} onChange={e => setItems(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Showroom MRP (₹)</label>
            <input type="number" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Showroom Discount ({discountPct}%)</label>
            <select value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))}>
              <option value="0">0% (Standard MRP)</option>
              <option value="5">5% (Spot Deal)</option>
              <option value="8">8% (VIP Suite Combo)</option>
              <option value="10">10% (Festive Offer)</option>
              <option value="12">12% (Bulk Project)</option>
              <option value="15">15% (Store Manager Approved)</option>
            </select>
          </div>
        </div>

        <div style={{ background: '#030712', padding: '14px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.25)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>Final Negotiated Price:</span>
            <strong style={{ color: 'var(--accent-gold-light)', fontSize: '15px' }}>₹{discountedTotal.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>50% Advance Token (Dynamic UPI QR):</span>
            <strong style={{ color: 'var(--accent-emerald)', fontSize: '15px' }}>₹{advanceAmount.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Balance on Doorstep ePOD:</span>
            <span>₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleConfirm} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Check size={16} /> Confirm & Lock SafeLock Stock (₹{advanceAmount.toLocaleString()} Token)
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
    const newInq = {
      Inquiry_ID: `INQ-2026-${Math.floor(900 + Math.random() * 99)}`,
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
    showToast(`➕ New Showroom Lead logged for ${newInq.Customer_Name} (AI Score: ${score}%)!`, true);
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

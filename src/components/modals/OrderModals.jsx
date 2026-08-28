import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Check, ArrowRight, ShieldCheck, Tag, Percent, RefreshCw } from 'lucide-react';

export function EditInquiryModal({ isOpen, onClose, inquiry = {} }) {
  const { inquiries, setInquiries, showToast } = useStore();
  const [status, setStatus] = useState(inquiry.Status || "HOT_LEAD");
  const [budget, setBudget] = useState(inquiry.Budget_INR || 85000);
  const [followUp, setFollowUp] = useState(inquiry.Follow_Up_Date || "Tomorrow");
  const [staff, setStaff] = useState(inquiry.Assigned_Staff || "Rakesh (Store Manager)");
  const [notes, setNotes] = useState(inquiry.Category_Models || "");

  if (!isOpen) return null;

  const handleSave = () => {
    setInquiries(prev => prev.map(item => {
      if (item.Inquiry_ID === inquiry.Inquiry_ID) {
        return {
          ...item,
          Status: status,
          Budget_INR: Number(budget),
          Follow_Up_Date: followUp,
          Assigned_Staff: staff,
          Category_Models: notes
        };
      }
      return item;
    }));
    showToast(`Lead #${inquiry.Inquiry_ID} updated successfully!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>✏️ Edit Inquiry Lead #{inquiry.Inquiry_ID}</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Customer Name</label>
            <input value={inquiry.Customer_Name || ''} disabled style={{ opacity: 0.7 }} />
          </div>
          <div className="form-field">
            <label>Lead Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="HOT_LEAD">HOT LEAD 🔥 (Ready to Book)</option>
              <option value="WARM_LEAD">WARM LEAD ⚡ (Needs Room Matcher)</option>
              <option value="FOLLOW_UP">FOLLOW UP 📅 (Call Scheduled)</option>
              <option value="COLD_LEAD">COLD LEAD ❄️ (Future Reference)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Budget (₹)</label>
            <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Follow-Up Schedule</label>
            <input value={followUp} onChange={e => setFollowUp(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assigned Showroom Executive</label>
            <input value={staff} onChange={e => setStaff(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Requirement Notes / Models</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Save Lead Updates
        </button>
      </div>
    </div>
  );
}

export function ConvertInquiryModal({ isOpen, onClose, inquiry = {} }) {
  const { convertInquiryToOrder } = useStore();
  const [driver, setDriver] = useState("Tophan Gouda (Tata Ace OD-18-A-1234)");
  const [slot, setSlot] = useState("Today, Express 04:30 PM");
  const [advanceAmt, setAdvanceAmt] = useState(Math.round((inquiry.Budget_INR || 150000) * 0.5));
  const [carpenter, setCarpenter] = useState("Narayana Mistri");

  if (!isOpen) return null;

  const totalAmt = inquiry.Budget_INR || 150000;

  const handleConvert = () => {
    convertInquiryToOrder(inquiry.Inquiry_ID, {
      Assigned_Driver: driver,
      Delivery_Schedule: slot,
      Carpenter_Assigned: carpenter,
      advanceAmount: Number(advanceAmt),
      totalAmount: totalAmt
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>⚡ 1-Click Convert Lead #{inquiry.Inquiry_ID} to SafeLock Order</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid var(--accent-cyan)', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{inquiry.Customer_Name} ({inquiry.Customer_Phone})</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{inquiry.Address} • {inquiry.Category_Models}</div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Total Order Amount (₹)</label>
            <input value={totalAmt.toLocaleString()} disabled style={{ opacity: 0.7 }} />
          </div>
          <div className="form-field">
            <label>Advance 50% Token Collected (₹)</label>
            <input type="number" value={advanceAmt} onChange={e => setAdvanceAmt(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Assigned Delivery Driver</label>
            <select value={driver} onChange={e => setDriver(e.target.value)}>
              <option value="Tophan Gouda (Tata Ace OD-18-A-1234)">Tophan Gouda (Tata Ace OD-18-A-1234)</option>
              <option value="Bikram Sahu (Bolero OD-18-B-5678)">Bikram Sahu (Bolero OD-18-B-5678)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Delivery Time Slot</label>
            <input value={slot} onChange={e => setSlot(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assigned Master Carpenter (₹500 Payout)</label>
            <select value={carpenter} onChange={e => setCarpenter(e.target.value)}>
              <option value="Narayana Mistri">Narayana Mistri (Teak Bed & Hydraulic Specialist)</option>
              <option value="Kailash Mistri">Kailash Mistri (Modular Wardrobe & Sofa Specialist)</option>
            </select>
          </div>
        </div>

        <button className="btn-emerald" onClick={handleConvert} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <ShieldCheck size={16} /> ⚡ Confirm SafeLock Stock & Reserve Order
        </button>
      </div>
    </div>
  );
}

export function ManageOrderModal({ isOpen, onClose, order = {} }) {
  const { orders, setOrders, showToast } = useStore();
  const [driver, setDriver] = useState(order.Assigned_Driver || "Tophan Gouda (Tata Ace OD-18-A-1234)");
  const [schedule, setSchedule] = useState(order.Delivery_Schedule || "Today, 04:30 PM");
  const [carpenter, setCarpenter] = useState(order.Carpenter_Assigned || "Narayana Mistri");
  const [status, setStatus] = useState(order.SafeLock_Status || "SAFELOCKED (RESERVED)");
  const [payout, setPayout] = useState(order.Carpenter_Payout_INR || 500);

  if (!isOpen) return null;

  const handleSave = () => {
    setOrders(prev => prev.map(o => {
      if (o.Order_ID === order.Order_ID) {
        return {
          ...o,
          Assigned_Driver: driver,
          Delivery_Schedule: schedule,
          Carpenter_Assigned: carpenter,
          SafeLock_Status: status,
          Carpenter_Payout_INR: Number(payout)
        };
      }
      return o;
    }));
    showToast(`Order #${order.Order_ID} updated in Orders_SafeLock!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>📦 Manage Order #{order.Order_ID} — {order.Customer_Name}</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>SafeLock Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="SAFELOCKED (RESERVED)">SAFELOCKED (RESERVED)</option>
              <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED (ePOD VERIFIED ✓)">DELIVERED (ePOD VERIFIED ✓)</option>
              <option value="ASSEMBLY COMPLETED ✓">ASSEMBLY COMPLETED ✓</option>
            </select>
          </div>
          <div className="form-field">
            <label>Delivery Schedule Slot</label>
            <input value={schedule} onChange={e => setSchedule(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Assigned Delivery Driver</label>
            <select value={driver} onChange={e => setDriver(e.target.value)}>
              <option value="Tophan Gouda (Tata Ace OD-18-A-1234)">Tophan Gouda (Tata Ace OD-18-A-1234)</option>
              <option value="Bikram Sahu (Bolero OD-18-B-5678)">Bikram Sahu (Bolero OD-18-B-5678)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Assigned Carpenter</label>
            <select value={carpenter} onChange={e => setCarpenter(e.target.value)}>
              <option value="Narayana Mistri">Narayana Mistri</option>
              <option value="Kailash Mistri">Kailash Mistri</option>
            </select>
          </div>
          <div className="form-field">
            <label>Carpenter Installation Payout (₹)</label>
            <input type="number" value={payout} onChange={e => setPayout(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Customer Phone / WhatsApp</label>
            <input value={order.Customer_Phone || ''} disabled style={{ opacity: 0.7 }} />
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Save Order Configuration
        </button>
      </div>
    </div>
  );
}

export function StockOverrideModal({ isOpen, onClose, sku = "BED-MOD-001" }) {
  const { adjustStock } = useStore();
  const [changeWh, setChangeWh] = useState(1);
  const [changeRes, setChangeRes] = useState(0);
  const [reason, setReason] = useState("Manual Warehouse Physical Count Adjustment");

  if (!isOpen) return null;

  const handleApply = () => {
    adjustStock(sku, Number(changeWh), Number(changeRes), reason);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🔒 Emergency SafeLock Stock Override ({sku})</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Warehouse Available Quantity Δ</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost-edit" onClick={() => setChangeWh(prev => prev - 1)}>-1</button>
              <input type="number" value={changeWh} onChange={e => setChangeWh(Number(e.target.value))} style={{ textAlign: 'center' }} />
              <button className="btn-ghost-edit" onClick={() => setChangeWh(prev => prev + 1)}>+1</button>
            </div>
          </div>
          <div className="form-field">
            <label>Reserved SafeLock Quantity Δ</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost-edit" onClick={() => setChangeRes(prev => prev - 1)}>-1</button>
              <input type="number" value={changeRes} onChange={e => setChangeRes(Number(e.target.value))} style={{ textAlign: 'center' }} />
              <button className="btn-ghost-edit" onClick={() => setChangeRes(prev => prev + 1)}>+1</button>
            </div>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Adjustment Audit Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)}>
              <option value="Manual Warehouse Physical Count Adjustment">Manual Warehouse Physical Count Adjustment</option>
              <option value="Damaged Carton Replaced">Damaged Carton Replaced</option>
              <option value="Showroom Floor Display Transfer">Showroom Floor Display Transfer</option>
              <option value="Direct Supplier Inward Verification">Direct Supplier Inward Verification</option>
            </select>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleApply} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Apply Atomic Stock Override
        </button>
      </div>
    </div>
  );
}

export function EmiCalculatorModal({ isOpen, onClose, amount = 150000 }) {
  const [tenure, setTenure] = useState(6);
  const [bank, setBank] = useState("Bajaj Finserv No-Cost EMI");

  if (!isOpen) return null;

  const monthlyEmi = Math.round(amount / tenure);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>💳 0% No-Cost EMI Financing Calculator</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Quoted Furniture Amount (₹)</label>
            <input value={`₹${amount.toLocaleString()}`} disabled style={{ opacity: 0.8, fontWeight: '800' }} />
          </div>
          <div className="form-field">
            <label>Financing Partner</label>
            <select value={bank} onChange={e => setBank(e.target.value)}>
              <option value="Bajaj Finserv No-Cost EMI">Bajaj Finserv (0% Interest)</option>
              <option value="HDFC Bank EasyEMI">HDFC Bank EasyEMI (0% Interest)</option>
              <option value="ICICI Bank Cardless EMI">ICICI Bank Cardless EMI</option>
              <option value="SBI QuickCredit EMI">SBI QuickCredit EMI</option>
            </select>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Repayment Tenure Months ({tenure} Months)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[3, 6, 9, 12].map(m => (
                <button key={m} className={`btn-ghost-edit ${tenure === m ? 'badge-gold' : ''}`} style={{ flex: 1, padding: '10px' }} onClick={() => setTenure(m)}>
                  {m} Months
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#030712', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--accent-emerald)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Instant Monthly EMI Installment</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
            ₹{monthlyEmi.toLocaleString()} / month
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            0% Interest • Zero Downpayment • Instant In-Store Approval in 2 Mins
          </div>
        </div>

        <button className="btn-emerald" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Attach EMI Financing to Quotation
        </button>
      </div>
    </div>
  );
}

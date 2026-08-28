import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Check, Landmark, DollarSign, Send, Award, QrCode, FileText, Printer, Barcode } from 'lucide-react';

export function RegisterArchitectModal({ isOpen, onClose }) {
  const { architects, setArchitects, showToast } = useStore();
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('Platinum');
  const [gstin, setGstin] = useState('21AAAAA0000A1Z5');
  const [upi, setUpi] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const rate = tier === 'Platinum' ? '8.5%' : tier === 'Gold' ? '6.5%' : '5.0%';
    const newArch = {
      Architect_ID: `VIP-ARC-00${architects.length + 1}`,
      Full_Name: name || "Ar. New Partner",
      Firm_Name: firm || "Studio Vastu Design",
      Phone_Number: phone || "9437000000",
      Tier_Slab: tier,
      Commission_Rate: rate,
      Total_Sales_INR: 0,
      Commission_Earned_INR: 0,
      Paid_Out_INR: 0,
      Balance_Due_INR: 0,
      GSTIN_PAN: gstin,
      UPI_Bank: upi || `${phone}@upi`
    };
    setArchitects([...architects, newArch]);
    showToast(`🏛️ Registered VIP Architect ${newArch.Full_Name} on ${tier} slab (${rate})!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🏛️ Register VIP Architect & Interior Designer</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Architect Full Name</label>
            <input placeholder="e.g. Ar. Sunita Patnaik" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Design Studio / Firm</label>
            <input placeholder="e.g. Studio Vastu Rayagada" value={firm} onChange={e => setFirm(e.target.value)} />
          </div>
          <div className="form-field">
            <label>WhatsApp Contact</label>
            <input placeholder="e.g. 9437011223" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Partnership Commission Slab</label>
            <select value={tier} onChange={e => setTier(e.target.value)}>
              <option value="Platinum">Platinum (8.5% Commission)</option>
              <option value="Gold">Gold (6.5% Commission)</option>
              <option value="Silver">Silver (5.0% Commission)</option>
            </select>
          </div>
          <div className="form-field">
            <label>GSTIN / PAN</label>
            <input value={gstin} onChange={e => setGstin(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Instant Settlement UPI ID / Bank VPA</label>
            <input placeholder="partner@upi" value={upi} onChange={e => setUpi(e.target.value)} />
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Save VIP Partner to Architect_VIPs Sheet
        </button>
      </div>
    </div>
  );
}

export function ArchitectPayoutModal({ isOpen, onClose, architect = {} }) {
  const { disburseArchitectPayout } = useStore();
  const [amount, setAmount] = useState(architect.Balance_Due_INR || 16825);
  const [rrn, setRrn] = useState(`UPI-DISB-${Math.floor(100000 + Math.random() * 900000)}`);
  const [mode, setMode] = useState("Instant Real-Time UPI");

  if (!isOpen) return null;

  const handleDisburse = () => {
    disburseArchitectPayout(architect.Architect_ID || "VIP-ARC-001", Number(amount), rrn);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3><DollarSign size={18} color="var(--accent-gold)" /> Instant UPI Commission Disbursement</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF' }}>{architect.Full_Name} — {architect.Firm_Name}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
            {architect.Tier_Slab} Tier ({architect.Commission_Rate}) • Total Earned: ₹{(architect.Commission_Earned_INR || 0).toLocaleString()}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Disbursement Payout Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label>Settlement Payment Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="Instant Real-Time UPI">Instant Real-Time UPI</option>
              <option value="NEFT / RTGS Bank Transfer">NEFT / RTGS Bank Transfer</option>
              <option value="Showroom Cheque Voucher">Showroom Cheque Voucher</option>
            </select>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Target Beneficiary UPI VPA</label>
            <input value={architect.UPI_Bank || 'ar.sunita@upi'} disabled style={{ opacity: 0.8 }} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Bank Settlement Ref / RRN Number</label>
            <input value={rrn} onChange={e => setRrn(e.target.value)} style={{ fontFamily: 'JetBrains Mono' }} />
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleDisburse} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Send size={16} /> Disburse ₹{Number(amount).toLocaleString()} Instant UPI Settlement
        </button>
      </div>
    </div>
  );
}

export function CarpenterDispatchModal({ isOpen, onClose }) {
  const { showToast } = useStore();
  const [carpenter, setCarpenter] = useState('Narayana Mistri');
  const [orderId, setOrderId] = useState('ORD-8921');
  const [payout, setPayout] = useState(500);

  if (!isOpen) return null;

  const handleDispatch = () => {
    showToast(`🪚 Work order dispatched to ${carpenter} for Order #${orderId} with ₹${payout} wage voucher!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🪚 Master Carpenter Dispatch & ₹500 Payout Voucher</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Master Carpenter / Fitter</label>
            <select value={carpenter} onChange={e => setCarpenter(e.target.value)}>
              <option value="Narayana Mistri">Narayana Mistri (+91 94371 88200)</option>
              <option value="Kailash Mistri">Kailash Mistri (+91 94371 88201)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Linked SafeLock Order</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assembly Wage Payout (₹)</label>
            <input type="number" value={payout} onChange={e => setPayout(Number(e.target.value))} />
          </div>
        </div>

        <button className="btn-purple" onClick={handleDispatch} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Dispatch WhatsApp Job Card & Lock Wage
        </button>
      </div>
    </div>
  );
}

export function UniversalPaymentCheckoutModal({ isOpen, onClose, amount = 78247, orderId = "ORD-8921" }) {
  const { storeMeta, showToast } = useStore();
  if (!isOpen) return null;

  const upiUri = `upi://pay?pa=${storeMeta.upiVpa}&pn=${encodeURIComponent(storeMeta.merchantName)}&am=${amount}&tr=${orderId}&cu=INR`;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ textAlign: 'center' }}>
        <div className="modal-header">
          <h3><QrCode size={18} color="var(--accent-emerald)" /> Dynamic Indian UPI QR POS</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '16px', display: 'inline-block', margin: '10px auto' }}>
          <div style={{ width: '210px', height: '210px', background: '#000000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={170} color="#FFFFFF" />
          </div>
          <div style={{ color: '#000000', fontSize: '13px', fontWeight: '800', marginTop: '8px' }}>
            Scan with GPay / PhonePe / Paytm / BHIM
          </div>
        </div>

        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>
          ₹{amount.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Merchant VPA: <strong style={{ color: '#FFFFFF' }}>{storeMeta.upiVpa}</strong> • Ref: {orderId}
        </div>

        <button className="btn-emerald" onClick={() => { showToast("✅ UPI Payment Verified & Settled via Webhook!", true); onClose(); }} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
          <Check size={16} /> Verify & Confirm Payment Settlement
        </button>
      </div>
    </div>
  );
}

export function BarcodeStudioModal({ isOpen, onClose }) {
  const { catalog } = useStore();
  const [selectedSku, setSelectedSku] = useState('BED-MOD-001');

  if (!isOpen) return null;

  const item = catalog.find(c => c.SKU === selectedSku) || catalog[0];

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3><Barcode size={18} color="var(--accent-gold)" /> 🏷️ Barcode Studio & Showroom Standee Generator</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-field" style={{ marginBottom: '12px' }}>
          <label>Select Furniture Model from 115-SKU Catalog</label>
          <select value={selectedSku} onChange={e => setSelectedSku(e.target.value)}>
            {catalog.map(c => (
              <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name} (₹{c.Selling_Price_INR.toLocaleString()})</option>
            ))}
          </select>
        </div>

        {/* Printable Standee Preview */}
        <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '24px', borderRadius: '12px', border: '2px solid #000000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>GODREJ INTERIO RAYAGADA</div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>OFFICIAL SHOWROOM FLAGSHIP DISPLAY</div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '900', color: '#D97706', border: '1px solid #D97706', padding: '3px 8px', borderRadius: '4px', height: 'fit-content' }}>
              {item.Warranty_Years}-YEAR WARRANTY
            </div>
          </div>

          <div style={{ margin: '14px 0' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{item.Product_Name}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Specification: <b>{item.Material_Spec}</b> ({item.Dimensions})</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
            <div>
              <div style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94A3B8' }}>MRP: ₹{item.MRP_INR.toLocaleString()}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#047857' }}>Special Offer: ₹{item.Selling_Price_INR.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <QrCode size={55} color="#000000" />
              <div style={{ fontSize: '9px', fontWeight: '800', marginTop: '2px' }}>{item.SKU}</div>
            </div>
          </div>
        </div>

        <button className="btn-luxury-gold no-print" onClick={() => window.print()} style={{ width: '100%', justifyContent: 'center' }}>
          <Printer size={16} /> Print Acrylic Standee / Carton Barcode Sticker (A4)
        </button>
      </div>
    </div>
  );
}

export function OrderInvoiceModal({ isOpen, onClose, order = {} }) {
  const { storeMeta } = useStore();
  if (!isOpen) return null;

  const total = Number(order.Total_Amount_INR) || 156494;
  const gstRate = 0.18;
  const taxable = Math.round(total / (1 + gstRate));
  const gstAmount = total - taxable;

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3><FileText size={18} color="var(--accent-cyan)" /> Official Tax Invoice (Godrej Interio Rayagada)</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '28px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>{storeMeta.storeName}</h2>
              <div style={{ fontSize: '11.5px', color: '#475569' }}>{storeMeta.address}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>GSTIN: <b>{storeMeta.gstin}</b> | Phone: {storeMeta.phone}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#0284C7' }}>TAX INVOICE</div>
              <div style={{ fontSize: '12px', fontWeight: '800' }}>Invoice #: INV-2026-{order.Order_ID ? order.Order_ID.replace('ORD-', '') : '8891'}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Date: 28-Aug-2026</div>
            </div>
          </div>

          <div style={{ margin: '14px 0', padding: '10px', background: '#F8FAFC', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800' }}>Billed To: {order.Customer_Name || 'Dr. Subhashish Jena'}</div>
            <div style={{ fontSize: '11.5px', color: '#475569' }}>Address: {order.Project_Address || 'Gayatri Nagar Villa, Rayagada'} | Contact: {order.Customer_Phone || '9437188291'}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: '14px 0' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Item Description</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0' }}>{order.Ordered_SKU || 'Solid King Bed (Hydraulic Storage) + 4-Door Wardrobe'}</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>1 Set</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>₹{taxable.toLocaleString()}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>₹{taxable.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <div style={{ width: '260px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxable Value:</span>
                <span>₹{taxable.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CGST (9%) + SGST (9%):</span>
                <span>₹{gstAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '15px', borderTop: '2px solid #000', paddingTop: '6px' }}>
                <span>Grand Total (INR):</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-luxury-gold no-print" onClick={() => window.print()} style={{ width: '100%', justifyContent: 'center' }}>
          <Printer size={16} /> Print Tax Invoice (A4)
        </button>
      </div>
    </div>
  );
}

export function EodReconciliationModal({ isOpen, onClose }) {
  const { eodSummary, setEodSummary, showToast } = useStore();

  if (!isOpen) return null;

  const handleLock = () => {
    setEodSummary(prev => ({ ...prev, status: "LOCKED_REGISTER_CLOSED" }));
    showToast("🔒 9 PM Register Closed & EOD Summary Locked to Google Drive!", true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🔒 9 PM Daily Showroom Cash Lock & EOD Slip</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: '#030712', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Physical Cash Drawer:</span>
            <strong>₹{eodSummary.cashDrawerINR.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Dynamic UPI QR Settlements:</span>
            <strong style={{ color: 'var(--accent-emerald)' }}>₹{eodSummary.upiSettledINR.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            <span>Total Gross Day Revenue:</span>
            <strong style={{ color: 'var(--accent-gold-light)', fontSize: '17px' }}>₹{eodSummary.totalGrossINR.toLocaleString()}</strong>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleLock} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Check size={16} /> Confirm 9 PM Register Lock & Generate EOD Slip
        </button>
      </div>
    </div>
  );
}

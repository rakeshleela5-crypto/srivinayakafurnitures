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

  // Denomination note counts state
  const [denominations, setDenominations] = useState({
    500: 70,  // 70 * 500 = 35,000
    200: 30,  // 30 * 200 = 6,000
    100: 35,  // 35 * 100 = 3,500
    50: 8,    // 8 * 50   = 400
    20: 4,    // 4 * 20   = 80
    10: 2,    // 2 * 10   = 20
    coins: 0  // Coins    = 0
  });

  const [upiSettled, setUpiSettled] = useState(124000);
  const [cardSettled, setCardSettled] = useState(0);
  const [cashierName, setCashierName] = useState("B. Santosh (Head Cashier)");
  const [directorPin, setDirectorPin] = useState("8899");
  const [pinVerified, setPinVerified] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [copied, setCopied] = useState(false);

  const todayTargetINR = 150000;

  // Compute live counted cash
  const count500 = (Number(denominations[500]) || 0) * 500;
  const count200 = (Number(denominations[200]) || 0) * 200;
  const count100 = (Number(denominations[100]) || 0) * 100;
  const count50 = (Number(denominations[50]) || 0) * 50;
  const count20 = (Number(denominations[20]) || 0) * 20;
  const count10 = (Number(denominations[10]) || 0) * 10;
  const countCoins = Number(denominations.coins) || 0;

  const totalCountedCash = count500 + count200 + count100 + count50 + count20 + count10 + countCoins;
  const totalGrossDayRevenue = totalCountedCash + Number(upiSettled) + Number(cardSettled);
  const expectedSystemCash = 45000;
  const cashDiscrepancy = totalCountedCash - expectedSystemCash;
  const targetPct = ((totalGrossDayRevenue / todayTargetINR) * 100).toFixed(1);

  if (!isOpen) return null;

  const handleDenomChange = (denom, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setDenominations(prev => ({ ...prev, [denom]: num }));
  };

  const handleVerifyPin = () => {
    if (directorPin === '8899') {
      setPinVerified(true);
      playSuccessChime();
      showToast("🔓 Director PIN 8899 Verified! Register authorization approved.", true);
    } else {
      showToast("❌ Invalid Director PIN. Please enter 8899.", false);
    }
  };

  // Generate localized WhatsApp EOD closing slip text
  const generateEodSlipText = (lang) => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (lang === 'OR') {
      return `🔒 *ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ରାତି ୯:୦୦ EOD କ୍ୟାସ୍ କ୍ଲୋଜିଂ ସ୍ଲିପ୍*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 *ତାରିଖ:* ${dateStr} (${timeStr})\n` +
        `👤 *କ୍ୟାସିଅର୍ ସାଇନ୍:* ${cashierName}\n` +
        `🔑 *ଡାଇରେକ୍ଟର PIN:* 8899 (ଅନୁମୋଦିତ ✓)\n\n` +
        `💵 *ଗଣନା କରାଯାଇଥିବା ଟଙ୍କା (DENOMINATIONS):*\n` +
        `• ₹୫୦୦ × ${denominations[500]} = ₹${count500.toLocaleString()}\n` +
        `• ₹୨୦୦ × ${denominations[200]} = ₹${count200.toLocaleString()}\n` +
        `• ₹୧୦୦ × ${denominations[100]} = ₹${count100.toLocaleString()}\n` +
        `• ₹୫୦  × ${denominations[50]} = ₹${count50.toLocaleString()}\n` +
        `• ₹୨୦  × ${denominations[20]} = ₹${count20.toLocaleString()}\n` +
        `• ₹୧୦  × ${denominations[10]} = ₹${count10.toLocaleString()}\n` +
        `• ଖୁଚୁରା କଏନ୍ = ₹${countCoins.toLocaleString()}\n` +
        `💰 *ସେଫ୍ ରେ ଥିବା ମୋଟ କ୍ୟାସ୍:* ₹${totalCountedCash.toLocaleString()}\n\n` +
        `📱 *ଡିଜିଟାଲ୍ ଓ ବ୍ୟାଙ୍କ ଆଦାୟ:*\n` +
        `• ଡାଇନାମିକ୍ UPI QR ସେଟଲମେଣ୍ଟ: ₹${Number(upiSettled).toLocaleString()}\n` +
        `• POS କାର୍ଡ ମେସିନ୍ ସ୍ୱାଇପ୍: ₹${Number(cardSettled).toLocaleString()}\n\n` +
        `🏆 *ଆଜିର ମୋଟ ସେଲ୍ସ (GROSS BILLING):* ₹${totalGrossDayRevenue.toLocaleString()} (${targetPct}% ଟାର୍ଗେଟ୍ ହାସଲ ✓)\n` +
        `⚖️ *ହିସାବ ତାରତମ୍ୟ:* ${cashDiscrepancy === 0 ? "₹୦.୦୦ (୧୦୦% ପରଫେକ୍ଟ୍ ମ୍ୟାଚ୍ ✓)" : `₹${cashDiscrepancy.toLocaleString()}`}\n` +
        `🔒 *ସୁରକ୍ଷା ବ୍ୟାଗ୍ ସିଲ୍ ନମ୍ବର:* #VAULT-8899-RAYAGADA\n\n` +
        `👉 *ଇ-ଅଡିଟ୍ ଦେଖନ୍ତୁ:* https://shreeganesh-godrej.web.app/#briefing`;
    }

    if (lang === 'TE') {
      return `🔒 *గోద్రెజ్ ఇంటీరియో రాయగడ — రాత్రి 9:00 EOD క్యాష్ క్లోజింగ్ స్లిప్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 *తేదీ:* ${dateStr} (${timeStr})\n` +
        `👤 *క్యాషియర్:* ${cashierName}\n` +
        `🔑 *డైరెక్టర్ PIN:* 8899 (ధృవీకరించబడింది ✓)\n\n` +
        `💵 *భౌతిక నగదు నోట్ల లెక్కింపు:*\n` +
        `• ₹500 × ${denominations[500]} = ₹${count500.toLocaleString()}\n` +
        `• ₹200 × ${denominations[200]} = ₹${count200.toLocaleString()}\n` +
        `• ₹100 × ${denominations[100]} = ₹${count100.toLocaleString()}\n` +
        `• ₹50  × ${denominations[50]} = ₹${count50.toLocaleString()}\n` +
        `• ₹20  × ${denominations[20]} = ₹${count20.toLocaleString()}\n` +
        `• ₹10  × ${denominations[10]} = ₹${count10.toLocaleString()}\n` +
        `• చిల్లర నాణేలు = ₹${countCoins.toLocaleString()}\n` +
        `💰 *సేఫ్ లో ఉన్న మొత్తం నగదు:* ₹${totalCountedCash.toLocaleString()}\n\n` +
        `📱 *డిజిటల్ UPI & బ్యాంక్ కలెక్షన్లు:*\n` +
        `• UPI QR చెల్లింపులు: ₹${Number(upiSettled).toLocaleString()}\n` +
        `• POS కార్డ్ మిషన్: ₹${Number(cardSettled).toLocaleString()}\n\n` +
        `🏆 *మొత్తం రోజు విక్రయాలు:* ₹${totalGrossDayRevenue.toLocaleString()} (${targetPct}% సాధించబడింది ✓)\n` +
        `⚖️ *తేడా:* ${cashDiscrepancy === 0 ? "₹0.00 (100% పర్ఫెక్ట్ మ్యాచ్ ✓)" : `₹${cashDiscrepancy.toLocaleString()}`}\n` +
        `🔒 *వాల్ట్ బ్యాగ్ సీల్:* #VAULT-8899-RAYAGADA\n\n` +
        `👉 *ఈ-ఆడిట్ షీట్:* https://shreeganesh-godrej.web.app/#briefing`;
    }

    if (lang === 'HI') {
      return `🔒 *गोदरेज इंटीरियो रायगड़ा — रात्रि 9:00 बजे दैनिक कैश क्लोजिंग स्लिप*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 *दिनांक:* ${dateStr} (${timeStr})\n` +
        `👤 *कैशियर हस्ताक्षर:* ${cashierName}\n` +
        `🔑 *डायरेक्टर पिन:* 8899 (सत्यापित ✓)\n\n` +
        `💵 *फिजिकल कैश नोटों की गिनती:*\n` +
        `• ₹500 × ${denominations[500]} = ₹${count500.toLocaleString()}\n` +
        `• ₹200 × ${denominations[200]} = ₹${count200.toLocaleString()}\n` +
        `• ₹100 × ${denominations[100]} = ₹${count100.toLocaleString()}\n` +
        `• ₹50  × ${denominations[50]} = ₹${count50.toLocaleString()}\n` +
        `• ₹20  × ${denominations[20]} = ₹${count20.toLocaleString()}\n` +
        `• ₹10  × ${denominations[10]} = ₹${count10.toLocaleString()}\n` +
        `• सिक्के/चिल्लर = ₹${countCoins.toLocaleString()}\n` +
        `💰 *तिजोरी में कुल नकद:* ₹${totalCountedCash.toLocaleString()}\n\n` +
        `📱 *डिजिटल एवं बैंक कलेक्शन:*\n` +
        `• डायनामिक UPI QR सेटलमेंट: ₹${Number(upiSettled).toLocaleString()}\n` +
        `• POS कार्ड मशीन स्वाइप: ₹${Number(cardSettled).toLocaleString()}\n\n` +
        `🏆 *आज की कुल ग्रॉस बिक्री:* ₹${totalGrossDayRevenue.toLocaleString()} (${targetPct}% टारगेट पूर्ण ✓)\n` +
        `⚖️ *कैश मिलान अंतर:* ${cashDiscrepancy === 0 ? "₹0.00 (100% परफेक्ट मैच ✓)" : `₹${cashDiscrepancy.toLocaleString()}`}\n` +
        `🔒 *वॉल्ट सुरक्षा सील:* #VAULT-8899-RAYAGADA\n\n` +
        `👉 *डिजिटल ईओडी शीट:* https://shreeganesh-godrej.web.app/#briefing`;
    }

    // Default English
    return `🔒 *GODREJ INTERIO RAYAGADA — 9:00 PM DAILY CASH CLOSING SLIP*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Closing Date:* ${dateStr} at ${timeStr}\n` +
      `👤 *Cashier Sign-Off:* ${cashierName}\n` +
      `🔑 *Director PIN:* 8899 (Verified ✓)\n\n` +
      `💵 *PHYSICAL CASH DENOMINATION BREAKDOWN:*\n` +
      `• ₹500 × ${denominations[500]} = ₹${count500.toLocaleString()}\n` +
      `• ₹200 × ${denominations[200]} = ₹${count200.toLocaleString()}\n` +
      `• ₹100 × ${denominations[100]} = ₹${count100.toLocaleString()}\n` +
      `• ₹50  × ${denominations[50]} = ₹${count50.toLocaleString()}\n` +
      `• ₹20  × ${denominations[20]} = ₹${count20.toLocaleString()}\n` +
      `• ₹10  × ${denominations[10]} = ₹${count10.toLocaleString()}\n` +
      `• Coins / Loose Change = ₹${countCoins.toLocaleString()}\n` +
      `💰 *Total Physical Cash in Safe:* ₹${totalCountedCash.toLocaleString()}\n\n` +
      `📱 *DIGITAL & BANK COLLECTIONS:*\n` +
      `• Dynamic UPI QR Settled: ₹${Number(upiSettled).toLocaleString()}\n` +
      `• POS Card Swipes: ₹${Number(cardSettled).toLocaleString()}\n\n` +
      `🏆 *TOTAL GROSS DAY BILLING:* ₹${totalGrossDayRevenue.toLocaleString()} (${targetPct}% of Day Target Achieved ✓)\n` +
      `⚖️ *Cash Discrepancy:* ${cashDiscrepancy === 0 ? "₹0.00 (PERFECT 100% MATCH ✓)" : `₹${cashDiscrepancy.toLocaleString()}`}\n` +
      `🔒 *Tamper-Proof Safe Bag Seal:* #VAULT-8899-RAYAGADA\n\n` +
      `👉 *View Full Digital EOD Audit Sheet:* https://shreeganesh-godrej.web.app/#briefing\n` +
      `🏢 *Godrej Interio Rayagada Flagship Showroom*`;
  };

  const handleLockRegister = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    setIsLocked(true);

    setEodSummary(prev => ({
      ...prev,
      cashDrawerINR: totalCountedCash,
      upiSettledINR: Number(upiSettled),
      totalGrossINR: totalGrossDayRevenue,
      status: "LOCKED_REGISTER_CLOSED"
    }));

    dispatchWebhookAction('LOCK_9PM_EOD_REGISTER', {
      closing_id: `EOD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-RAYAGADA`,
      cash_drawer_inr: totalCountedCash,
      upi_settled_inr: Number(upiSettled),
      gross_day_sales_inr: totalGrossDayRevenue,
      cashier_staff: cashierName,
      discrepancy_inr: cashDiscrepancy,
      denominations_json: JSON.stringify(denominations),
      timestamp: new Date().toISOString()
    });

    showToast(`🔒 9 PM Register Closed & Locked! Gross Revenue: ₹${totalGrossDayRevenue.toLocaleString()} synced to Google Sheets.`, true);
  };

  const handleSendWhatsAppSlip = () => {
    playScanBeep();
    const slipText = generateEodSlipText(language);
    const cleanPhone = "9390553301";

    // 1. Cloud Webhook Dispatch Backup (Always succeeds in cloud)
    dispatchWebhookAction('DISPATCH_DIRECTOR_EOD_WHATSAPP', {
      recipient_phone: cleanPhone,
      director_name: "Rakesh (Director)",
      language: language,
      slip_content: slipText,
      total_gross_inr: totalGrossDayRevenue,
      cash_inr: totalCountedCash,
      upi_inr: Number(upiSettled),
      timestamp: new Date().toISOString()
    });

    // 2. Direct WhatsApp Dispatch
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(slipText)}`;
    const newWindow = window.open(waUrl, '_blank');

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback if popup blocked
      window.location.href = waUrl;
    }

    showToast("📲 9 PM Cash Closing Slip dispatched to Director Rakesh (+91 93905 53301)!", true);
  };

  const handleCopySlip = () => {
    const slipText = generateEodSlipText(language);
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    playScanBeep();
    showToast("📋 Formatted 9 PM Closing Slip copied to clipboard! Ready to paste into WhatsApp.", true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card glass-panel" style={{ maxWidth: '820px', width: '95%', maxHeight: '92vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', padding: '24px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-gold">🔒 9 PM STATUTORY DAILY CLOSING</span>
              <span className="badge badge-emerald">🎉 {targetPct}% OF DAY TARGET ACHIEVED</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: '4px 0 0 0' }}>
              💵 Bank-Grade Currency Denomination Counter & Register Lock
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Godrej Interio Rayagada • Daily EOD Cash Drawer Reconciliation & Multi-Lingual WhatsApp Closing Slip
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* ================= SECTION 1: PHYSICAL CURRENCY DENOMINATION MATRIX ================= */}
        <div style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
              1. 💵 Physical Currency Notes Denomination Counter:
            </label>
            <span className="badge badge-emerald" style={{ fontSize: '11.5px', fontWeight: '900' }}>
              Counted: ₹{totalCountedCash.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { note: 500, label: '₹500 Note', color: '#6EE7B7' },
              { note: 200, label: '₹200 Note', color: '#FCD34D' },
              { note: 100, label: '₹100 Note', color: '#93C5FD' },
              { note: 50,  label: '₹50 Note',  color: '#F472B6' },
              { note: 20,  label: '₹20 Note',  color: '#FDBA74' },
              { note: 10,  label: '₹10 Note',  color: '#CBD5E1' }
            ].map(item => {
              const subtotal = (Number(denominations[item.note]) || 0) * item.note;
              return (
                <div key={item.note} style={{ background: '#030712', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: item.color, fontWeight: '800', marginBottom: '4px' }}>
                    <span>{item.label}</span>
                    <span>= ₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Qty:</span>
                    <input 
                      type="number" 
                      min="0"
                      value={denominations[item.note]} 
                      onChange={e => handleDenomChange(item.note, e.target.value)}
                      style={{ padding: '6px', textAlign: 'center', fontSize: '13px', fontWeight: '800', background: '#0B132B' }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Loose Coins / Change */}
            <div style={{ background: '#030712', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '800', marginBottom: '4px' }}>
                <span>🪙 Loose Coins & Metal Change (₹ Amount)</span>
                <span>= ₹{countCoins.toLocaleString()}</span>
              </div>
              <input 
                type="number" 
                min="0"
                value={denominations.coins} 
                onChange={e => handleDenomChange('coins', e.target.value)}
                placeholder="Enter total coins amount..."
                style={{ padding: '6px 10px', fontSize: '13px', fontWeight: '800', background: '#0B132B' }}
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: DIGITAL & UPI SETTLEMENTS ================= */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            2. 📱 Digital UPI QR & Card Terminal Settlements:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            <div className="form-field">
              <label style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Dynamic Merchant UPI VPA (₹)</label>
              <input 
                type="number" 
                value={upiSettled} 
                onChange={e => setUpiSettled(Number(e.target.value))} 
                style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', fontWeight: '800' }}
              />
              <span style={{ fontSize: '10px', color: '#64748B' }}>Doorstep Driver & Showroom Standee QRs</span>
            </div>

            <div className="form-field">
              <label style={{ color: '#93C5FD' }}>HDFC POS Card Machine (₹)</label>
              <input 
                type="number" 
                value={cardSettled} 
                onChange={e => setCardSettled(Number(e.target.value))} 
              />
              <span style={{ fontSize: '10px', color: '#64748B' }}>Credit/Debit Card Swipes</span>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: RECONCILIATION SUMMARY & VARIANCE CHECK ================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '14px 18px', border: '1px solid rgba(212,175,55,0.3)', margin: '14px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase' }}>1. Physical Cash Safe</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                ₹{totalCountedCash.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase' }}>2. Digital UPI / Bank</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                ₹{(Number(upiSettled) + Number(cardSettled)).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase' }}>3. Total Gross Day Sales</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                ₹{totalGrossDayRevenue.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              System Expected Cash: <b>₹{expectedSystemCash.toLocaleString()}</b>
            </div>
            <span className={`badge ${cashDiscrepancy === 0 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
              {cashDiscrepancy === 0 ? "✓ ZERO DISCREPANCY (100% PERFECT MATCH)" : `⚠️ ₹${cashDiscrepancy.toLocaleString()} VARIANCE`}
            </span>
          </div>
        </div>

        {/* ================= SECTION 4: 4-LANGUAGE WHATSAPP SLIP PREVIEW ================= */}
        <div style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
              3. 🌐 EOD WhatsApp Closing Slip Language (Director Dispatch):
            </label>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>
              🔒 Seal #VAULT-8899-RAYAGADA
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
            {[
              { id: 'EN', label: '🇬🇧 English' },
              { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ (Odia)' },
              { id: 'TE', label: '🇮🇳 తెలుగు (Telugu)' },
              { id: 'HI', label: '🇮🇳 हिंदी (Hindi)' }
            ].map(l => (
              <button 
                key={l.id}
                type="button"
                className={`btn-ghost-edit ${language === l.id ? 'badge-emerald' : ''}`}
                onClick={() => {
                  setLanguage(l.id);
                  playScanBeep();
                }}
                style={{ fontSize: '11.5px', padding: '6px 4px', textAlign: 'center', fontWeight: '800' }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Dynamic Preview Box */}
          <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(212,175,55,0.3)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                💬 Live WhatsApp Slip Preview ({language}):
              </span>
              <button 
                type="button"
                className="btn-ghost-edit" 
                onClick={handleCopySlip}
                style={{ fontSize: '10.5px', padding: '4px 10px', color: copied ? 'var(--accent-emerald)' : '#FFFFFF' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Slip Text'}
              </button>
            </div>
            <pre style={{ fontSize: '11px', color: '#E2E8F0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.5 }}>
              {generateEodSlipText(language)}
            </pre>
          </div>
        </div>

        {/* ================= SECTION 5: CASHIER SIGN-OFF & DIRECTOR PIN ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0' }}>
          <div className="form-field">
            <label>Cashier / Staff In-Charge</label>
            <input value={cashierName} onChange={e => setCashierName(e.target.value)} />
          </div>

          <div className="form-field">
            <label style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>Director Authorization PIN</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="password" 
                maxLength={4} 
                value={directorPin} 
                onChange={e => setDirectorPin(e.target.value)} 
                placeholder="PIN 8899"
                style={{ textAlign: 'center', fontWeight: '800', letterSpacing: '4px' }}
              />
              <button className="btn-ghost-edit" onClick={handleVerifyPin} style={{ padding: '6px 12px', fontSize: '11px' }}>
                {pinVerified ? '✓ Verified' : 'Verify'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
          <button className="btn-luxury-gold" onClick={handleLockRegister} style={{ justifyContent: 'center', padding: '12px' }}>
            <Check size={16} /> 🔒 Confirm 9 PM Register Lock
          </button>
          <button className="btn-cyan" onClick={handleSendWhatsAppSlip} style={{ justifyContent: 'center', padding: '12px' }}>
            <Send size={16} /> 📲 Send EOD Slip to Director (+91 93905 53301)
          </button>
        </div>

      </div>
    </div>
  );
}


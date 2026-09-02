import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DynamicQrCode } from '../../utils/qrcodeGenerator';
import { 
  X, 
  Check, 
  Landmark, 
  DollarSign, 
  Send, 
  Award, 
  QrCode, 
  FileText, 
  Printer, 
  Phone, 
  Building, 
  Share2, 
  Sparkles, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

// =========================================================================
// 1. ✏️ EDIT ARCHITECT PROFILE & COMMISSION SLAB MODAL
// =========================================================================
export function EditArchitectModal({ isOpen, onClose, architect = {} }) {
  const { architects, setArchitects, showToast } = useStore();

  const [name, setName] = useState(architect.Full_Name || '');
  const [firm, setFirm] = useState(architect.Firm_Name || '');
  const [phone, setPhone] = useState(architect.Phone_Number || '');
  const [tier, setTier] = useState(architect.Tier_Slab || 'Platinum');
  const [customRate, setCustomRate] = useState(architect.Commission_Rate || '8.5%');
  const [gstin, setGstin] = useState(architect.GSTIN_PAN || '21AAAAA0000A1Z5');
  const [upi, setUpi] = useState(architect.UPI_Bank || '');

  if (!isOpen) return null;

  const handleTierChange = (newTier) => {
    setTier(newTier);
    if (newTier === 'Platinum') setCustomRate('8.5%');
    else if (newTier === 'Gold') setCustomRate('6.5%');
    else if (newTier === 'Silver') setCustomRate('5.0%');
  };

  const handleSave = () => {
    const updatedArchitect = {
      ...architect,
      Full_Name: name,
      Firm_Name: firm,
      Phone_Number: phone,
      Tier_Slab: tier,
      Commission_Rate: customRate,
      GSTIN_PAN: gstin,
      UPI_Bank: upi
    };

    const updatedList = architects.map(a => 
      a.Architect_ID === architect.Architect_ID ? updatedArchitect : a
    );
    setArchitects(updatedList);

    playSuccessChime();
    showToast(`💾 Updated VIP Architect ${name} profile & commission tier (${customRate})!`, true);

    dispatchWebhookAction('UPDATE_ARCHITECT_PROFILE', {
      architect_id: architect.Architect_ID,
      full_name: name,
      firm_name: firm,
      phone: phone,
      tier: tier,
      commission_rate: customRate,
      gstin: gstin,
      upi: upi
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel" style={{ maxWidth: '550px', width: '95%', border: '2px solid var(--accent-gold)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold">VIP PARTNER PROFILE</span>
            <h3 style={{ margin: 0, fontSize: '17px' }}>✏️ Edit Architect & Commission Tier</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid" style={{ marginTop: '12px' }}>
          <div className="form-field">
            <label>Architect Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Design Studio / Firm</label>
            <input value={firm} onChange={e => setFirm(e.target.value)} />
          </div>
          <div className="form-field">
            <label>WhatsApp Contact Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Partnership Commission Slab</label>
            <select value={tier} onChange={e => handleTierChange(e.target.value)}>
              <option value="Platinum">Platinum (8.5% Commission)</option>
              <option value="Gold">Gold (6.5% Commission)</option>
              <option value="Silver">Silver (5.0% Commission)</option>
              <option value="Custom">Custom Negotiated Rate</option>
            </select>
          </div>
          <div className="form-field">
            <label>Commission Rate (%)</label>
            <input value={customRate} onChange={e => setCustomRate(e.target.value)} />
          </div>
          <div className="form-field">
            <label>GSTIN / PAN</label>
            <input value={gstin} onChange={e => setGstin(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Instant Settlement UPI VPA / Bank ID</label>
            <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="partner@okhdfcbank" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn-ghost-edit" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-luxury-gold" onClick={handleSave} style={{ flex: 2, justifyContent: 'center' }}>
            <Save size={14} /> Save Changes & Sync to Google Sheets
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. 🪪 ARCHITECT CLIENT VIP REFERRAL PASS & QR TOKEN MODAL
// =========================================================================
export function ArchitectPassModal({ isOpen, onClose, architect = {} }) {
  const { storeMeta, showToast } = useStore();

  if (!isOpen) return null;

  const referralCode = `GI-VIP-${architect.Architect_ID || 'ARC-01'}`;
  const referralPayload = `https://godrejinterio.com/rayagada/vip-referral?ref=${referralCode}&architect=${encodeURIComponent(architect.Full_Name || '')}`;

  const handleShareWhatsApp = () => {
    const text = `🏛️ *VIP ARCHITECT SHOWROOM PASS — GODREJ INTERIO RAYAGADA*\n\n` +
      `Dear Client,\n` +
      `You are exclusively invited by *${architect.Full_Name} (${architect.Firm_Name})* to visit the Godrej Interio Rayagada Flagship Showroom with *VIP Concierge Benefits*.\n\n` +
      `🎟️ *Your Referral Pass Code:* ${referralCode}\n` +
      `📍 *Showroom Location:* Main Road, Near New Bus Stand, Rayagada\n` +
      `🎁 *Privilege Benefit:* 8% Showroom Combo Suite Savings + Free White-Glove Truck Delivery!\n\n` +
      `Please present this pass or scan the QR token at the front reception counter.`;

    const url = `https://api.whatsapp.com/send?phone=${architect.Phone_Number || ''}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    playSuccessChime();
    showToast(`📲 VIP Referral Pass sent to ${architect.Full_Name} on WhatsApp!`, true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel" style={{ maxWidth: '440px', width: '95%', border: '2px solid var(--accent-gold)', textAlign: 'center', padding: '24px' }}>
        <div className="modal-header" style={{ border: 'none', padding: 0, justifyContent: 'flex-end' }}>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Printable Pass Card */}
        <div 
          className="printable-area"
          style={{ 
            background: '#0F172A', 
            color: '#FFFFFF', 
            borderRadius: '16px', 
            padding: '20px', 
            border: '2px solid var(--accent-gold)', 
            boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
            marginBottom: '16px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            GODREJ INTERIO RAYAGADA
          </div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: '4px 0' }}>
            CLIENT VIP REFERRAL PASS
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
            Referred by: <b>{architect.Full_Name}</b> ({architect.Firm_Name})
          </div>

          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '12px', display: 'inline-block', margin: '14px 0' }}>
            <DynamicQrCode value={referralPayload} size={140} fgColor="#0F172A" />
          </div>

          <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
            {referralCode}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
            Scan at front reception counter for automatic project attribution & 8% combo savings
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-emerald" onClick={handleShareWhatsApp} style={{ flex: 1, justifyContent: 'center' }}>
            <Send size={14} /> 📲 Send Pass on WhatsApp
          </button>
          <button className="btn-cyan" onClick={handlePrint} style={{ flex: 1, justifyContent: 'center' }}>
            <Printer size={14} /> 🖨️ Print Card
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. 📜 EMPANELED DESIGN PARTNER CERTIFICATE MODAL
// =========================================================================
export function ArchitectCertificateModal({ isOpen, onClose, architect = {} }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel" style={{ maxWidth: '720px', width: '95%', border: '2px solid var(--accent-gold)', padding: '24px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold">OFFICIAL RECOGNITION</span>
            <h3 style={{ margin: 0, fontSize: '17px' }}>📜 Empaneled Design Partner Certificate</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Printable Framed Certificate Canvas */}
        <div 
          className="printable-area"
          style={{ 
            background: '#FFFFFF', 
            color: '#000000', 
            borderRadius: '16px', 
            padding: '32px', 
            border: '6px double #B45309', 
            boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
            textAlign: 'center',
            fontFamily: "'Times New Roman', serif",
            margin: '12px 0'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '2px', color: '#B45309', textTransform: 'uppercase', marginBottom: '6px' }}>
            GODREJ INTERIO RAYAGADA FLAGSHIP
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '4px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
            CERTIFICATE OF EMPANELMENT
          </h1>
          <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748B', marginBottom: '16px' }}>
            This certificate is proudly awarded in recognition of distinguished interior design excellence to
          </div>

          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', borderBottom: '2px solid #D4AF37', display: 'inline-block', paddingBottom: '4px', margin: '6px 0 10px 0' }}>
            {architect.Full_Name}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#334155' }}>
            {architect.Firm_Name}
          </div>

          <div style={{ fontSize: '12px', lineHeight: '1.7', color: '#475569', margin: '16px 0', textAlign: 'center', maxWidth: '520px', margin: '14px auto' }}>
            Recognized as a <b>{architect.Tier_Slab || 'Platinum'} Empaneled Interior Architecture Partner</b> with authorized design advisory privileges for Godrej Interio residential and commercial projects.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #CBD5E1' }}>
            <div style={{ textAlign: 'left', fontSize: '11px', color: '#64748B' }}>
              <div>Partner ID: <b>{architect.Architect_ID}</b></div>
              <div>Commission Slab: <b>{architect.Tier_Slab} ({architect.Commission_Rate})</b></div>
              <div>GSTIN: <b>21AAAAA0000A1Z5</b></div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '65px', height: '65px', border: '2px solid #B45309', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px auto' }}>
                <div style={{ fontSize: '7px', fontWeight: '900' }}>GODREJ</div>
                <div style={{ fontSize: '6px' }}>INTERIO</div>
                <div style={{ fontSize: '6px', fontWeight: '900' }}>RAYAGADA</div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: '900' }}>Rakesh (Store Director)</div>
            </div>
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handlePrint} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
          <Printer size={16} /> 🖨️ 1-Click Print Official Framed Certificate (for Architect Studio)
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 4. 📱 1-CLICK WHATSAPP COMMISSION LEDGER & STATEMENT MODAL
// =========================================================================
export function ArchitectLedgerStatementModal({ isOpen, onClose, architect = {} }) {
  const { storeMeta, showToast } = useStore();

  if (!isOpen) return null;

  const totalSales = architect.Total_Sales_INR || 156494;
  const earned = architect.Commission_Earned_INR || 13301;
  const paid = architect.Paid_Out_INR || 0;
  const due = architect.Balance_Due_INR || 13301;

  const handleSendStatement = () => {
    const text = `🏛️ *VIP ARCHITECT COMMISSION STATEMENT — GODREJ INTERIO RAYAGADA*\n\n` +
      `Dear *${architect.Full_Name}* (${architect.Firm_Name}),\n` +
      `Here is your updated referral commission ledger statement:\n\n` +
      `📊 *Partnership Slab:* ${architect.Tier_Slab} (${architect.Commission_Rate})\n` +
      `💰 *Total Referred Sales:* ₹${totalSales.toLocaleString()}\n` +
      `🏆 *Total Commission Earned:* ₹${earned.toLocaleString()}\n` +
      `✅ *Total Paid Out:* ₹${paid.toLocaleString()}\n` +
      `⏳ *Outstanding Balance Due:* *₹${due.toLocaleString()}*\n\n` +
      `💳 *Settlement UPI ID:* ${architect.UPI_Bank || 'Registered VPA'}\n\n` +
      `Thank you for your ongoing partnership with Godrej Interio Rayagada! For any instant settlement queries, contact Rakesh (+91 9390553301).`;

    const url = `https://api.whatsapp.com/send?phone=${architect.Phone_Number || ''}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    playSuccessChime();
    showToast(`📲 Statement dispatched to ${architect.Full_Name} on WhatsApp!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel" style={{ maxWidth: '500px', width: '95%', border: '2px solid var(--accent-emerald)', padding: '24px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">WHATSAPP DISPATCH</span>
            <h3 style={{ margin: 0, fontSize: '17px' }}>📲 Dispatch Commission Statement</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', margin: '14px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>{architect.Full_Name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🏛️ {architect.Firm_Name} • 📞 {architect.Phone_Number}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Referred Sales</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>₹{totalSales.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Commission ({architect.Commission_Rate})</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>₹{earned.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Paid Out</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-emerald)' }}>₹{paid.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Pending Balance</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-rose)' }}>₹{due.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <button className="btn-emerald" onClick={handleSendStatement} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
          <Send size={16} /> 📲 Send Statement to {architect.Full_Name}'s WhatsApp Now
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 5. ➕ REGISTER NEW ARCHITECT / INTERIOR DESIGNER MODAL
// =========================================================================
export function RegisterArchitectModal({ isOpen, onClose }) {
  const { architects, setArchitects, showToast } = useStore();

  const [name, setName] = useState('');
  const [firm, setFirm] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('Platinum');
  const [customRate, setCustomRate] = useState('10.0%');
  const [gstin, setGstin] = useState('21AAAAA0000A1Z5');
  const [upi, setUpi] = useState('partner@okhdfcbank');

  if (!isOpen) return null;

  const handleTierChange = (newTier) => {
    setTier(newTier);
    if (newTier === 'Platinum') setCustomRate('12.0%');
    else if (newTier === 'Gold') setCustomRate('10.0%');
    else if (newTier === 'Silver') setCustomRate('8.0%');
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      showToast("⚠️ Please enter Architect Name and WhatsApp Number.", false);
      return;
    }

    const newArchId = `ARC-${Math.floor(100 + Math.random() * 900)}`;
    const newPartner = {
      Architect_ID: newArchId,
      Full_Name: name.trim(),
      Firm_Name: firm.trim() || 'Independent Studio',
      Phone_Number: phone.trim(),
      Tier_Slab: tier,
      Commission_Rate: customRate,
      Commission_Earned_INR: 0,
      Total_Sales_INR: 0,
      Paid_Out_INR: 0,
      Balance_Due_INR: 0,
      GSTIN_PAN: gstin.trim(),
      UPI_Bank: upi.trim()
    };

    setArchitects([newPartner, ...architects]);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🏛️ Onboarded VIP Architect ${name} (${tier} Tier - ${customRate})!`, true);

    dispatchWebhookAction('REGISTER_ARCHITECT_PARTNER', {
      name: name.trim(),
      firm: firm.trim() || 'Independent Studio',
      phone: phone.trim(),
      commission_pct: parseFloat(customRate) || 10,
      tier: tier,
      bank_upi: upi.trim()
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel" style={{ maxWidth: '560px', width: '95%', border: '2px solid var(--accent-purple)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-purple">VIP PARTNER ONBOARDING</span>
            <h3 style={{ margin: 0, fontSize: '17px' }}>➕ Register VIP Architect / Designer</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid" style={{ marginTop: '12px' }}>
          <div className="form-field">
            <label>Architect / Designer Full Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ar. Pradeep Mohapatra" />
          </div>
          <div className="form-field">
            <label>Architecture Studio / Firm Name</label>
            <input value={firm} onChange={e => setFirm(e.target.value)} placeholder="e.g. Rayagada Design Studio" />
          </div>
          <div className="form-field">
            <label>WhatsApp Contact Number *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9861011223" />
          </div>
          <div className="form-field">
            <label>Partnership Tier Slab</label>
            <select value={tier} onChange={e => handleTierChange(e.target.value)}>
              <option value="Platinum">Platinum (12.0% Commission)</option>
              <option value="Gold">Gold (10.0% Commission)</option>
              <option value="Silver">Silver (8.0% Commission)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Commission Rate (%)</label>
            <input value={customRate} onChange={e => setCustomRate(e.target.value)} />
          </div>
          <div className="form-field">
            <label>GSTIN / PAN</label>
            <input value={gstin} onChange={e => setGstin(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Instant Settlement UPI VPA / Bank RTGS ID</label>
            <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="e.g. partner@okhdfcbank" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn-ghost-edit" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-purple" onClick={handleSave} style={{ flex: 2, justifyContent: 'center' }}>
            <Save size={14} /> ➕ Onboard Partner & Sync to Google Sheets
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. 💳 COMMISSION PAYOUT VOUCHER & TDS SETTLEMENT MODAL
// =========================================================================
export function ArchitectPayoutModal({ isOpen, onClose, architect = {} }) {
  const { architects, setArchitects, showToast } = useStore();

  const [payoutAmount, setPayoutAmount] = useState(architect.Balance_Due_INR || 15000);
  const [paymentMode, setPaymentMode] = useState('RTGS_NEFT_ONLINE');
  const [txnRef, setTxnRef] = useState(`RTGS-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!isOpen) return null;

  const grossAmount = Number(payoutAmount) || 0;
  const tdsDeduction = Math.round(grossAmount * 0.05); // 5% TDS under Section 194H
  const netDisbursed = grossAmount - tdsDeduction;

  const handleDisburse = () => {
    if (grossAmount <= 0) {
      showToast("⚠️ Please enter a valid payout amount.", false);
      return;
    }

    const updatedList = architects.map(a => {
      if (a.Architect_ID === architect.Architect_ID) {
        const currentPaid = a.Paid_Out_INR || 0;
        const currentDue = a.Balance_Due_INR || 0;
        return {
          ...a,
          Paid_Out_INR: currentPaid + grossAmount,
          Balance_Due_INR: Math.max(0, currentDue - grossAmount)
        };
      }
      return a;
    });

    setArchitects(updatedList);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`💳 Disbursed ₹${netDisbursed.toLocaleString()} (₹${tdsDeduction.toLocaleString()} 5% TDS) to ${architect.Full_Name}!`, true);

    dispatchWebhookAction('LOG_ARCHITECT_COMMISSION_PAYOUT', {
      architect_id: architect.Architect_ID,
      architect_name: architect.Full_Name,
      gross_amount: grossAmount,
      payment_mode: paymentMode,
      txn_ref: txnRef
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel" style={{ maxWidth: '520px', width: '95%', border: '2px solid var(--accent-emerald)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">COMMISSION DISBURSEMENT</span>
            <h3 style={{ margin: 0, fontSize: '17px' }}>💳 Issue Commission Payout Voucher</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>{architect.Full_Name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🏛️ {architect.Firm_Name} • 📞 {architect.Phone_Number} • 💳 {architect.UPI_Bank || 'HDFC Bank RTGS'}</div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Gross Commission Amount (₹)</label>
            <input 
              type="number" 
              value={payoutAmount} 
              onChange={e => setPayoutAmount(e.target.value)} 
            />
          </div>

          <div className="form-field">
            <label>Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
              <option value="RTGS_NEFT_ONLINE">Bank RTGS / NEFT Transfer</option>
              <option value="UPI_INSTANT">Instant Merchant UPI</option>
              <option value="CHEQUE_HDFC">Account Payee Cheque (HDFC)</option>
            </select>
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Transaction UTR / Cheque Ref #</label>
            <input value={txnRef} onChange={e => setTxnRef(e.target.value)} />
          </div>
        </div>

        {/* Financial Breakdown Card */}
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.4)', borderRadius: '12px', padding: '14px', margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '6px' }}>
            <span>Gross Commission:</span>
            <span style={{ fontWeight: '800', color: '#FFFFFF' }}>₹{grossAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-amber)', marginBottom: '6px' }}>
            <span>TDS Deduction (5% Sec 194H):</span>
            <span style={{ fontWeight: '800' }}>- ₹{tdsDeduction.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', color: 'var(--accent-emerald)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            <span>Net Disbursed to Bank:</span>
            <span>₹{netDisbursed.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost-edit" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-emerald" onClick={handleDisburse} style={{ flex: 2, justifyContent: 'center' }}>
            <DollarSign size={14} /> Disburse ₹{netDisbursed.toLocaleString()} & Log Voucher
          </button>
        </div>
      </div>
    </div>
  );
}

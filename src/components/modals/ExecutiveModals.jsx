import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Check, Landmark, DollarSign, Send, Award, QrCode, FileText, Printer, Barcode, Copy, Share2, MapPin, Wrench, ShieldCheck, Truck, Users } from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function RegisterArchitectModal({ isOpen, onClose }) {
  const { architects, setArchitects, showToast } = useStore();
  const [archStep, setArchStep] = useState(1);
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
      <div className="modal-card" style={{ maxWidth: '540px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>VIP PARTNER ENROLLMENT</span>
            <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '16px' }}>
              🏛️ Register VIP Architect & Interior Designer
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 3-Step Wizard Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '12px 0 16px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 🏛️ Profile' },
            { step: 2, label: '2. 👑 Slabs & TDS' },
            { step: 3, label: '3. 💳 UPI VPA' }
          ].map(s => {
            const isActive = archStep === s.step;
            const isDone = archStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setArchStep(s.step);
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

        {archStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                1. Architect / Interior Designer Full Name:
              </label>
              <input placeholder="e.g. Ar. Sunita Patnaik" value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px' }} />
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                2. Design Studio / Firm Name:
              </label>
              <input placeholder="e.g. Studio Vastu Rayagada" value={firm} onChange={e => setFirm(e.target.value)} style={{ padding: '10px' }} />
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#CBD5E1' }}>
                3. WhatsApp Mobile Contact:
              </label>
              <input placeholder="e.g. 9437011223" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setArchStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Commission Slabs & TDS ➔
              </button>
            </div>
          </div>
        )}

        {archStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                Partnership Commission Slab:
              </label>
              <select value={tier} onChange={e => setTier(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="Platinum">Platinum Tier (8.5% Commission + Free 3D Catalogs)</option>
                <option value="Gold">Gold Tier (6.5% Commission)</option>
                <option value="Silver">Silver Tier (5.0% Commission)</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                GSTIN / PAN (for Form 16A Statutory TDS):
              </label>
              <input value={gstin} onChange={e => setGstin(e.target.value)} style={{ padding: '10px', fontFamily: 'JetBrains Mono' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setArchStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Profile
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setArchStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Settlement UPI ID ➔
              </button>
            </div>
          </div>
        )}

        {archStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                Instant Settlement UPI ID / Bank VPA:
              </label>
              <input placeholder="partner@okhdfcbank" value={upi} onChange={e => setUpi(e.target.value)} style={{ padding: '10px', fontFamily: 'JetBrains Mono', fontSize: '13px' }} />
            </div>

            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(212,175,55,0.25)', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--accent-emerald)' }}>✓ Summary of VIP Enrollment:</strong><br />
              • Partner: <b>{name || 'Ar. Partner'}</b> ({firm || 'Design Studio'})<br />
              • Rate: <b>{tier === 'Platinum' ? '8.5%' : tier === 'Gold' ? '6.5%' : '5.0%'} Referral Fee</b><br />
              • Settlement UPI: <b>{upi || `${phone}@upi`}</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setArchStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-luxury-gold" onClick={handleSave} style={{ flex: 1, marginLeft: '10px', justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
                <Check size={16} /> 🏛️ Save & Enroll to Architect_VIPs
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function ArchitectPayoutModal({ isOpen, onClose, architect = {} }) {
  const { disburseArchitectPayout, showToast } = useStore();
  const [amount, setAmount] = useState(architect.Balance_Due_INR || 16825);
  const [rrn, setRrn] = useState(`UPI-DISB-${Math.floor(100000 + Math.random() * 900000)}`);
  const [mode, setMode] = useState("Instant Real-Time UPI");
  const [lang, setLang] = useState('EN');

  if (!isOpen) return null;

  const phone = architect.Phone_Number || "9437011223";
  const archName = architect.Full_Name || "Ar. Sunita Patnaik";
  const firmName = architect.Firm_Name || "Studio Vastu Design";
  const tier = architect.Tier_Slab || "Platinum";
  const rate = architect.Commission_Rate || "8.5%";

  const generateWhatsAppMessage = () => {
    if (lang === 'OR') {
      return `*🏛️ ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — VIP ଆର୍କିଟେକ୍ଟ କମିଶନ୍ ପେମେଣ୍ଟ୍ ସ୍ଲିପ୍*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*ମାନ୍ୟବର ${archName} (${firmName})*,\n` +
        `ଆପଣଙ୍କ VIP ସହଭାଗୀତା କମିଶନ୍ ସଫଳତାର ସହ ଆପଣଙ୍କ UPI VPA କୁ ପଠାଗଲା।\n\n` +
        `💰 *ପ୍ରଦାନ ରାଶି:* ₹${Number(amount).toLocaleString()}\n` +
        `🏦 *ପେମେଣ୍ଟ ମୋଡ୍:* ${mode}\n` +
        `💳 *ହିତାଧିକାରୀ UPI:* ${architect.UPI_Bank || 'ar.sunita@okhdfcbank'}\n` +
        `🔢 *ବ୍ୟାଙ୍କ UTR / RRN:* ${rrn}\n` +
        `👑 *ଆପଣଙ୍କ ପାର୍ଟନର ସ୍ଲାବ:* ${tier} Tier (${rate})\n` +
        `📅 *ତାରିଖ:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
        `📜 *ମାସିକ TDS ଷ୍ଟେଟମେଣ୍ଟ୍ (ଫର୍ମ 16A) ଡାଉନଲୋଡ୍ କରନ୍ତୁ:*\nhttps://shreeganesh-godrej.web.app/#architects\n\n` +
        `_ଧନ୍ୟବାଦ! ଶ୍ରୀ ଗଣେଶ ଏଣ୍ଟରପ୍ରାଇଜେସ୍ (ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା)_ | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*🏛️ గోద్రెజ్ ఇంటీరియో రాయగడ — VIP ఆర్కిటెక్ట్ కమిషన్ చెల్లింపు రశీదు*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*గౌరవనీయులైన ${archName} (${firmName})*,\n` +
        `మీ VIP భాగస్వామ్య కమిషన్ విజయవంతంగా మీ UPI ఖాతాకు జమ చేయబడింది.\n\n` +
        `💰 *చెల్లించిన మొత్తం:* ₹${Number(amount).toLocaleString()}\n` +
        `🏦 *చెల్లింపు మోడ్:* ${mode}\n` +
        `💳 *లబ్ధిదారుని UPI:* ${architect.UPI_Bank || 'ar.sunita@okhdfcbank'}\n` +
        `🔢 *బ్యాంక్ UTR / RRN:* ${rrn}\n` +
        `👑 *మీ భాగస్వామ్య శ్లాబ్:* ${tier} Tier (${rate})\n` +
        `📅 *తేదీ:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
        `📜 *నెలవారీ TDS స్టేట్‌మెంట్ (Form 16A) ఇక్కడ చూడండి:*\nhttps://shreeganesh-godrej.web.app/#architects\n\n` +
        `_ధన్యవాదాలు! శ్రీ గణేష్ ఎంటర్‌ప్రైజెస్ (గోద్రెజ్ ఇంటీరియో రాయగడ)_ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*🏛️ गोदरेज इंटीरियो रायगड़ा — VIP आर्किटेक्ट कमीशन भुगतान रसीद*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*आदरणीय ${archName} (${firmName})*,\n` +
        `आपका VIP पार्टनरशिप कमीशन सफलतापूर्वक आपके UPI खाते में स्थानांतरित कर दिया गया है।\n\n` +
        `💰 *भुगतान राशि:* ₹${Number(amount).toLocaleString()}\n` +
        `🏦 *भुगतान मोड:* ${mode}\n` +
        `💳 *लाभार्थी UPI:* ${architect.UPI_Bank || 'ar.sunita@okhdfcbank'}\n` +
        `🔢 *बैंक UTR / RRN:* ${rrn}\n` +
        `👑 *आपकी पार्टनरशिप स्लैब:* ${tier} Tier (${rate})\n` +
        `📅 *दिनांक:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
        `📜 *मासिक TDS स्टेटमेंट (Form 16A) डाउनलोड करें:*\nhttps://shreeganesh-godrej.web.app/#architects\n\n` +
        `_धन्यवाद! श्री गणेश एंटरप्राइजेज (गोदरेज इंटीरियो रायगड़ा)_ | 📞 9390553301`;
    }
    return `*🏛️ GODREJ INTERIO RAYAGADA — VIP ARCHITECT COMMISSION VOUCHER*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Dear ${archName} (${firmName})*,\n` +
      `Your VIP Trade Partnership Commission has been successfully disbursed.\n\n` +
      `💰 *Disbursed Amount:* ₹${Number(amount).toLocaleString()}\n` +
      `🏦 *Payment Mode:* ${mode}\n` +
      `💳 *Beneficiary UPI:* ${architect.UPI_Bank || 'ar.sunita@okhdfcbank'}\n` +
      `🔢 *Bank UTR / RRN:* ${rrn}\n` +
      `👑 *Partnership Tier:* ${tier} Partner (${rate} Slab)\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `📜 *View Monthly Billed Ledger & Form 16A TDS Statement:*\nhttps://shreeganesh-godrej.web.app/#architects\n\n` +
      `_Thank you for your valued partnership! Shree Ganesh Enterprises (Godrej Interio Rayagada)_ | 📞 +91 93905 53301`;
  };

  const handleDisburse = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    disburseArchitectPayout(architect.Architect_ID || "VIP-ARC-001", Number(amount), rrn);

    const message = generateWhatsAppMessage();
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('SYSTEM_7_VIP_COMMISSION', {
      architect_id: architect.Architect_ID || "VIP-ARC-001",
      architect_name: archName,
      payout_amount: Number(amount),
      upi_rrn: rrn,
      phone: phone,
      language: lang
    });

    window.open(whatsappUrl, '_blank');
    showToast(`💸 Disbursed ₹${Number(amount).toLocaleString()} to ${archName} & sent WhatsApp voucher!`, true);
    onClose();
  };

  const handleCopyText = () => {
    playScanBeep();
    navigator.clipboard.writeText(generateWhatsAppMessage());
    showToast(`📋 Copied Architect WhatsApp Payout Slip to clipboard!`);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">🏛️ VIP ARCHITECT DISBURSEMENT</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              💸 Instant UPI Commission Voucher
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '14px', margin: '10px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF' }}>{archName} — {firmName}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
            {tier} Tier ({rate}) • Lifetime Earnings: ₹{(architect.Commission_Earned_INR || 0).toLocaleString()}
          </div>
        </div>

        {/* 4-Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#030712', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '800' }}>🌐 WhatsApp Language:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'EN', label: '🇬🇧 EN' },
              { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ' },
              { id: 'TE', label: '🇮🇳 తెలుగు' },
              { id: 'HI', label: '🇮🇳 HI' }
            ].map(l => (
              <button 
                key={l.id} 
                className={`btn-ghost-edit ${lang === l.id ? 'badge-gold' : ''}`}
                onClick={() => setLang(l.id)}
                style={{ fontSize: '10.5px', padding: '3px 8px' }}
              >
                {l.label}
              </button>
            ))}
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
            <input value={architect.UPI_Bank || 'ar.sunita@okhdfcbank'} disabled style={{ opacity: 0.8 }} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Bank Settlement Ref / RRN Number</label>
            <input value={rrn} onChange={e => setRrn(e.target.value)} style={{ fontFamily: 'JetBrains Mono' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn-ghost-edit" onClick={handleCopyText} style={{ flex: 1, justifyContent: 'center' }}>
            <Copy size={14} /> Copy Slip
          </button>
          <button className="btn-luxury-gold" onClick={handleDisburse} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
            <Send size={16} /> Disburse ₹{Number(amount).toLocaleString()} & Send WhatsApp Voucher
          </button>
        </div>
      </div>
    </div>
  );
}

export function CarpenterDispatchModal({ isOpen, onClose, order = null }) {
  const { orders, showToast } = useStore();
  const activeOrder = order || orders[0] || {};

  const [carpenter, setCarpenter] = useState('Narayana Mistri');
  const [orderId, setOrderId] = useState(activeOrder.Order_ID || 'ORD-8921');
  const [customerName, setCustomerName] = useState(activeOrder.Customer_Name || 'Valued Client');
  const [customerPhone, setCustomerPhone] = useState(activeOrder.Customer_Phone || '9390553301');
  const [address, setAddress] = useState(activeOrder.Project_Address || activeOrder.Delivery_Address || 'Rayagada, Odisha');
  const [items, setItems] = useState(activeOrder.Ordered_SKU || activeOrder.Item_Names || 'Solid King Bed + 4-Door Wardrobe');
  const [payout, setPayout] = useState(activeOrder.Carpenter_Payout_INR || 500);
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    if (activeOrder && isOpen) {
      setOrderId(activeOrder.Order_ID || 'ORD-8921');
      setCustomerName(activeOrder.Customer_Name || 'Valued Client');
      setCustomerPhone(activeOrder.Customer_Phone || '9390553301');
      setAddress(activeOrder.Project_Address || activeOrder.Delivery_Address || 'Rayagada, Odisha');
      setItems(activeOrder.Ordered_SKU || activeOrder.Item_Names || 'Solid King Bed + 4-Door Wardrobe');
      setPayout(activeOrder.Carpenter_Payout_INR || 500);
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  const carpenterPhones = {
    'Narayana Mistri': '9437188200',
    'Kailash Mistri': '9437188201',
    'Ramesh Fitter': '9437188202'
  };

  const targetPhone = carpenterPhones[carpenter] || '9437188200';

  const generateWhatsAppMessage = () => {
    if (lang === 'OR') {
      return `*🪚 ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ମିସ୍ତ୍ରୀ ଫିଟିଂ ୱାର୍କ ଅର୍ଡର*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*ମିସ୍ତ୍ରୀଙ୍କ ନାମ:* ${carpenter}\n` +
        `*ଅର୍ଡର ନଂ:* #${orderId}\n\n` +
        `👤 *ଗ୍ରାହକ:* ${customerName}\n` +
        `📞 *ଗ୍ରାହକ ଫୋନ୍:* +91 ${customerPhone}\n` +
        `📍 *ଠିକଣା:* ${address}\n` +
        `🗺️ *ଗୁଗଲ୍ ମ୍ୟାପ୍ ଲୋକେସନ୍:* https://maps.google.com/?q=19.1724,83.4163\n\n` +
        `📦 *ଫିଟିଂ ସାମଗ୍ରୀ:* ${items}\n` +
        `💰 *ଫିଟିଂ ମଜୁରୀ (ନଗଦ/UPI):* ₹${payout} (ଗ୍ରାହକଙ୍କ ସନ୍ତୋଷଜନକ ଦସ୍ତଖତ ପରେ ତୁରନ୍ତ ପାଉଟ୍)\n\n` +
        `⚠️ *ନିର୍ଦ୍ଦେଶାବଳୀ:*\n` +
        `୧. ସମସ୍ତ ୫ଟି ବାକ୍ସ କାଟିବା ପୂର୍ବରୁ ଗ୍ରାହକଙ୍କୁ ଦେଖାନ୍ତୁ।\n` +
        `୨. ହାଇଡ୍ରୋଲିକ୍ ଏବଂ ସଫ୍ଟ-କ୍ଲୋଜ୍ ହିଞ୍ଜ୍ ଭଲ ଭାବରେ ଯାଞ୍ଚ କରନ୍ତୁ।\n` +
        `୩. ଫିଟିଂ ପରେ ଫଟୋ ଉଠାଇ ଆମକୁ ପଠାନ୍ତୁ।\n\n` +
        `_ଶ୍ରୀ ଗଣେଶ ଏଣ୍ଟରପ୍ରାଇଜେସ୍ ରାୟଗଡ଼ା_ | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*🪚 గోద్రెజ్ ఇంటీరియో రాయగడ — కార్పెంటర్ వర్క్ ఆర్డర్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*మేస్త్రీ పేరు:* ${carpenter}\n` +
        `*ఆర్డర్ నం:* #${orderId}\n\n` +
        `👤 *కస్టమర్:* ${customerName}\n` +
        `📞 *ఫోన్ నంబర్:* +91 ${customerPhone}\n` +
        `📍 *చిరునామా:* ${address}\n` +
        `🗺️ *లొకేషన్ మ్యాప్:* https://maps.google.com/?q=19.1724,83.4163\n\n` +
        `📦 *ఫిట్టింగ్ చేయవలసిన ఐటమ్స్:* ${items}\n` +
        `💰 *ఫిట్టింగ్ కూలీ (UPI):* ₹${payout} (కస్టమర్ సైన్-ఆఫ్ తర్వాత వెంటనే చెల్లింపు)\n\n` +
        `⚠️ *ముఖ్యమైన సూచనలు:*\n` +
        `1. బాక్స్‌లు ఓపెన్ చేసేటప్పుడు కస్టమర్‌కు చూపించండి.\n` +
        `2. హైడ్రాలిక్ లిఫ్ట్ మరియు కీళ్ళు సరిగ్గా అమర్చండి.\n` +
        `3. పని పూర్తయిన తర్వాత క్లియర్ ఫోటో తీసి పంపండి.\n\n` +
        `_శ్రీ గణేష్ ఎంటర్‌ప్రైజెస్ రాయగడ_ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*🪚 गोदरेज इंटीरियो रायगड़ा — कारपेंटर वर्क ऑर्डर*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*कारीगर का नाम:* ${carpenter}\n` +
        `*ऑर्डर संख्या:* #${orderId}\n\n` +
        `👤 *ग्राहक:* ${customerName}\n` +
        `📞 *ग्राहक फोन:* +91 ${customerPhone}\n` +
        `📍 *साइट का पता:* ${address}\n` +
        `🗺️ *गूगल मैप लोकेशन:* https://maps.google.com/?q=19.1724,83.4163\n\n` +
        `📦 *फिटिंग आइटम:* ${items}\n` +
        `💰 *फिटिंग मजदूरी:* ₹${payout} (काम पूरा होने पर तुरंत UPI द्वारा भुगतान)\n\n` +
        `⚠️ *दिशा-निर्देश:*\n` +
        `1. बॉक्स खोलने से पहले ग्राहक को दिखाएं।\n` +
        `2. हाइड्रोलिक लिफ्ट और फिटिंग को ध्यान से चेक करें।\n` +
        `3. फिटिंग पूरी होने के बाद साफ फोटो खींचकर भेजें।\n\n` +
        `_श्री गणेश एंटरप्राइजेज रायगड़ा_ | 📞 9390553301`;
    }
    return `*🪚 GODREJ INTERIO RAYAGADA — MASTER CARPENTER WORK ORDER*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Carpenter / Mistri:* ${carpenter}\n` +
      `*Work Order Ref:* #${orderId}\n\n` +
      `👤 *Customer Name:* ${customerName}\n` +
      `📞 *Customer Contact:* +91 ${customerPhone}\n` +
      `📍 *Installation Address:* ${address}\n` +
      `🗺️ *Google Maps Site Pin:* https://maps.google.com/?q=19.1724,83.4163\n\n` +
      `📦 *Items to Assemble:* ${items}\n` +
      `💰 *Fitting Wage Slip:* ₹${payout} (Instant UPI on Customer Sign-off)\n\n` +
      `⚠️ *Quality Checklist:*\n` +
      `1. Verify all 5 knockdown carton boxes before unboxing.\n` +
      `2. Test hydraulic lift shock absorbers and soft-close wardrobe hinges.\n` +
      `3. Capture photo proof of assembled bedroom set and send back on WhatsApp.\n\n` +
      `_Shree Ganesh Enterprises (Godrej Interio Rayagada)_ | 📞 +91 93905 53301`;
  };

  const handleDispatch = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const message = generateWhatsAppMessage();
    const cleanPhone = String(targetPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('DISPATCH_CARPENTER_WORK_ORDER', {
      carpenter_name: carpenter,
      carpenter_phone: targetPhone,
      order_id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      address: address,
      items: items,
      fitting_wage_inr: payout,
      language: lang
    });

    window.open(whatsappUrl, '_blank');
    showToast(`🪚 Work order & Google Maps pin dispatched to ${carpenter} (+91 ${targetPhone})!`, true);
    onClose();
  };

  const handleCopyText = () => {
    playScanBeep();
    navigator.clipboard.writeText(generateWhatsAppMessage());
    showToast(`📋 Copied Carpenter Work Order to clipboard!`);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', background: '#0B132B', border: '2px solid #8B5CF6' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-purple">🪚 MISTRI WORK ORDER DISPATCH</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🪚 Master Carpenter Dispatch & ₹500 Wage Voucher
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 4-Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#030712', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '800' }}>🌐 WhatsApp Language:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'EN', label: '🇬🇧 EN' },
              { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ' },
              { id: 'TE', label: '🇮🇳 తెలుగు' },
              { id: 'HI', label: '🇮🇳 HI' }
            ].map(l => (
              <button 
                key={l.id} 
                className={`btn-ghost-edit ${lang === l.id ? 'badge-gold' : ''}`}
                onClick={() => setLang(l.id)}
                style={{ fontSize: '10.5px', padding: '3px 8px' }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Master Carpenter / Fitter</label>
            <select value={carpenter} onChange={e => setCarpenter(e.target.value)}>
              <option value="Narayana Mistri">Narayana Mistri (+91 94371 88200)</option>
              <option value="Kailash Mistri">Kailash Mistri (+91 94371 88201)</option>
              <option value="Ramesh Fitter">Ramesh Fitter (+91 94371 88202)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Linked SafeLock Order</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Customer Name</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Customer Phone</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Installation Address & Site Details</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Items to Assemble</label>
            <input value={items} onChange={e => setItems(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assembly Wage Payout (₹)</label>
            <input type="number" value={payout} onChange={e => setPayout(Number(e.target.value))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn-ghost-edit" onClick={handleCopyText} style={{ flex: 1, justifyContent: 'center' }}>
            <Copy size={14} /> Copy Work Order
          </button>
          <button className="btn-purple" onClick={handleDispatch} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
            <Send size={16} /> 🪚 Dispatch WhatsApp Work Order & Map Pin
          </button>
        </div>
      </div>
    </div>
  );
}

export function UniversalPaymentCheckoutModal({ isOpen, onClose, amount = 78247, orderId = "ORD-8921", customerName = "", customerPhone = "" }) {
  const { orders, storeMeta, showToast } = useStore();
  if (!isOpen) return null;

  const activeOrd = orders.find(o => o.Order_ID === orderId) || {};
  const targetCustName = customerName || activeOrd.Customer_Name || "Valued Customer";
  const targetCustPhone = customerPhone || activeOrd.Customer_Phone || "9390553301";

  const upiUri = `upi://pay?pa=${storeMeta.upiVpa}&pn=${encodeURIComponent(storeMeta.merchantName)}&am=${amount}&tr=${orderId}&cu=INR`;

  const handleVerifyAndSettlePayment = () => {
    const paymentTxnRef = `UPI-TXN-${Date.now().toString().slice(-8)}`;

    dispatchWebhookAction('RECORD_UPI_PAYMENT', {
      payment_id: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      order_id: orderId,
      customer_name: targetCustName,
      customer_phone: targetCustPhone,
      amount: Number(amount) || 10000,
      payment_method: "UPI QR (GPay / PhonePe / Paytm)",
      upi_ref: paymentTxnRef,
      merchant_vpa: storeMeta.upiVpa || "9390553301@ybl",
      status: "VERIFIED & SETTLED ✓",
      notes: `Auto-verified via Dynamic Indian UPI QR POS Terminal for ${targetCustName}`
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`✅ Payment of ₹${Number(amount).toLocaleString()} for ${targetCustName} Verified & Logged into Payments_Log! Ref: ${paymentTxnRef}`, true);
    onClose();
  };

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
          ₹{Number(amount).toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Merchant VPA: <strong style={{ color: '#FFFFFF' }}>{storeMeta.upiVpa}</strong> • Ref: {orderId}
        </div>

        <button className="btn-emerald" onClick={handleVerifyAndSettlePayment} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
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
              <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name} (₹{(Number(c?.Selling_Price_INR) || 0).toLocaleString()})</option>
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
              <div style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94A3B8' }}>MRP: ₹{(Number(item?.MRP_INR) || 0).toLocaleString()}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#047857' }}>Special Offer: ₹{(Number(item?.Selling_Price_INR) || 0).toLocaleString()}</div>
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
              <div style={{ fontSize: '12px', fontWeight: '800' }}>Invoice #: INV-2026-{order.Order_ID ? String(order.Order_ID).replace('ORD-', '') : '8891'}</div>
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
  const [eodStep, setEodStep] = useState(1);

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

        {/* 🧭 3-Step Wizard Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 💵 Cash Denominations' },
            { step: 2, label: '2. 📱 UPI & Card Settlement' },
            { step: 3, label: '3. 🔒 Director Lock & WhatsApp' }
          ].map(s => {
            const isActive = eodStep === s.step;
            const isDone = eodStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setEodStep(s.step);
                  playScanBeep();
                }}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: isActive ? '900' : '700',
                  background: isActive 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                    : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                  border: isActive ? '1.5px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>

        {/* ================= STEP 1: PHYSICAL CURRENCY DENOMINATION MATRIX ================= */}
        {eodStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                1. 💵 Count Physical Currency Notes in Safe:
              </label>
              <span className="badge badge-emerald" style={{ fontSize: '12px', fontWeight: '900' }}>
                Counted Total: ₹{totalCountedCash.toLocaleString()}
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
                        style={{ padding: '6px', textAlign: 'center', fontSize: '13px', fontWeight: '800', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', width: '100%' }}
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
                  style={{ padding: '6px 10px', fontSize: '13px', fontWeight: '800', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setEodStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Digital UPI & Card Settlements ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DIGITAL & UPI SETTLEMENTS ================= */}
        {eodStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              2. 📱 Digital UPI QR & Card Terminal Settlements:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div className="form-field">
                <label style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Dynamic Merchant UPI VPA (₹)</label>
                <input 
                  type="number" 
                  value={upiSettled} 
                  onChange={e => setUpiSettled(Number(e.target.value))} 
                  style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', fontWeight: '800', padding: '10px' }}
                />
                <span style={{ fontSize: '10px', color: '#64748B' }}>Doorstep Driver & Showroom Standee QRs</span>
              </div>

              <div className="form-field">
                <label style={{ color: '#93C5FD' }}>HDFC POS Card Machine (₹)</label>
                <input 
                  type="number" 
                  value={cardSettled} 
                  onChange={e => setCardSettled(Number(e.target.value))} 
                  style={{ padding: '10px', color: '#FFFFFF', fontWeight: '800' }}
                />
                <span style={{ fontSize: '10px', color: '#64748B' }}>Credit/Debit Card Swipes</span>
              </div>
            </div>

            {/* Reconciliation Comparison Matrix */}
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
                  {cashDiscrepancy === 0 ? "✓ ZERO DISCREPANCY (100% MATCH)" : `⚠️ ₹${cashDiscrepancy.toLocaleString()} VARIANCE`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setEodStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Cash Notes
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setEodStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Director Lock & WhatsApp ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: 4-LANGUAGE WHATSAPP SLIP & DIRECTOR PIN ================= */}
        {eodStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                3. EOD WhatsApp Closing Slip Language:
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
                  style={{ fontSize: '11px', padding: '6px 4px', textAlign: 'center', fontWeight: '800' }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Dynamic Preview Box */}
            <div style={{ background: '#030712', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                  💬 Live WhatsApp Slip Preview ({language}):
                </span>
                <button 
                  type="button" 
                  className="btn-ghost-edit" 
                  onClick={handleCopySlip}
                  style={{ fontSize: '10px', padding: '3px 8px', color: copied ? 'var(--accent-emerald)' : '#FFFFFF' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Slip Text'}
                </button>
              </div>
              <pre style={{ fontSize: '10.5px', color: '#E2E8F0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.4, maxHeight: '110px', overflowY: 'auto' }}>
                {generateEodSlipText(language)}
              </pre>
            </div>

            {/* Cashier & PIN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div className="form-field">
                <label style={{ fontSize: '11px' }}>Cashier Sign-Off Name</label>
                <input value={cashierName} onChange={e => setCashierName(e.target.value)} style={{ padding: '8px' }} />
              </div>

              <div className="form-field">
                <label style={{ color: 'var(--accent-gold-light)', fontWeight: '800', fontSize: '11px' }}>Director Authorization PIN</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input 
                    type="password" 
                    maxLength={4} 
                    value={directorPin} 
                    onChange={e => setDirectorPin(e.target.value)} 
                    placeholder="PIN 8899"
                    style={{ textAlign: 'center', fontWeight: '800', letterSpacing: '4px' }}
                  />
                  <button type="button" className="btn-ghost-edit" onClick={handleVerifyPin} style={{ padding: '6px 10px', fontSize: '11px' }}>
                    {pinVerified ? '✓ Verified' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setEodStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-luxury-gold" onClick={handleLockRegister} style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '12px', fontWeight: '900' }}>
                <Check size={14} /> 🔒 Confirm 9 PM Register Lock
              </button>
              <button className="btn-cyan" onClick={handleSendWhatsAppSlip} style={{ flex: 1.5, justifyContent: 'center', padding: '10px', fontSize: '12px', fontWeight: '800' }}>
                <Send size={14} /> 📲 Send EOD Slip to Director
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// ==============================================================================================
// 👑 EXECUTIVE MODAL 1: ADD NEW VIP TURNKEY VILLA PROJECT
// ==============================================================================================
export function AddVipProjectModal({ isOpen, onClose }) {
  const { addVipProject } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [value, setValue] = useState(250000);
  const [stage, setStage] = useState('PROPOSAL DELIVERED');
  const [architect, setArchitect] = useState('Ar. Sunita Patnaik (Studio Vastu)');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      project_id: `VIP-VILLA-2026-${Math.floor(100 + Math.random() * 900)}`,
      name,
      phone: phone || '+91 94370 88990',
      location: location || 'Rayagada Villa',
      value: Number(value) || 250000,
      stage,
      status: stage,
      architect: architect || 'Ar. Sunita Patnaik'
    };

    addVipProject(payload);
    dispatchWebhookAction('ADD_VIP_VILLA_PROJECT', payload);

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`👑 VIP Turnkey Villa Project for ${name} saved & synced to VIP_Villa_Projects!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '560px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>👑</span>
            <div>
              <span className="badge badge-gold">VIP CLIENT RADAR</span>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                Add New VIP Turnkey Villa Account
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
          <div className="form-field">
            <label>VIP Client Name & Title:</label>
            <input 
              required
              placeholder="e.g. Dr. Subhashish Jena (Civil Surgeon)" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label>Phone Number:</label>
              <input 
                placeholder="+91 94370 12345" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
            <div className="form-field">
              <label>Estimated Project Value (₹):</label>
              <input 
                type="number"
                step="10000"
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-field">
            <label>Project Site / Villa Location:</label>
            <input 
              placeholder="e.g. Raniguda Farmhouse Villa, Rayagada" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label>Current Account Stage:</label>
              <select value={stage} onChange={e => setStage(e.target.value)}>
                <option value="PROPOSAL DELIVERED">📄 PROPOSAL DELIVERED (50% Due)</option>
                <option value="50% TOKEN ADVANCE RECEIVED">💰 50% ADVANCE PAID</option>
                <option value="SAFELOCKED & STAGED">🔒 SAFELOCKED & STAGED (5-Box)</option>
                <option value="DISPATCH IN TRANSIT">🚚 DISPATCH IN TRANSIT</option>
                <option value="COMPLETED & ASSEMBLED">✅ COMPLETED & ASSEMBLED</option>
              </select>
            </div>
            <div className="form-field">
              <label>Assigned Architect Partner:</label>
              <input 
                placeholder="Ar. Sunita Patnaik" 
                value={architect} 
                onChange={e => setArchitect(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn-ghost-edit" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-luxury-gold">
              <Check size={14} /> Save VIP Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================================================================================
// 👑 EXECUTIVE MODAL 2: EDIT VIP PROJECT & MILESTONE SCHEDULE
// ==============================================================================================
export function EditVipProjectModal({ isOpen, onClose, project }) {
  const { updateVipProject, deleteVipProject } = useStore();
  const [val, setVal] = useState(project?.value || 150000);
  const [stage, setStage] = useState(project?.stage || 'SAFELOCKED & STAGED');
  const [phone, setPhone] = useState(project?.phone || '');
  const [loc, setLoc] = useState(project?.location || '');
  const [stage1, setStage1] = useState(project?.stage1Paid !== undefined ? project.stage1Paid : true);
  const [stage2, setStage2] = useState(project?.stage2Paid || false);
  const [stage3, setStage3] = useState(project?.stage3Paid || false);

  if (!isOpen || !project) return null;

  const handleSave = () => {
    const updatedPayload = {
      project_id: project.id,
      name: project.name,
      phone: phone || project.phone,
      location: loc || project.location,
      value: Number(val),
      stage,
      status: stage,
      architect: project.architect || 'Ar. Sunita Patnaik',
      stage1Paid: stage1,
      stage2Paid: stage2,
      stage3Paid: stage3,
      advance: stage1 ? Math.round(Number(val) * 0.5) : 0
    };

    updateVipProject(project.id, updatedPayload);
    dispatchWebhookAction('UPDATE_VIP_VILLA_PROJECT', updatedPayload);

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`👑 VIP Account ${project.name} updated & synced to VIP_Villa_Projects!`, true);
    onClose();
  };

  const handleSendMilestoneWhatsApp = () => {
    const text = `👑 *GODREJ INTERIO RAYAGADA — VIP VILLA MILESTONE UPDATE*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Namaskar ${project.name}! 🙏\n` +
      `Here is the live status for your *${loc}* project:\n\n` +
      `• *Total Value:* ₹${Number(val).toLocaleString()}\n` +
      `• *Stage 1 (50% Booking Token):* ₹${Math.round(val * 0.5).toLocaleString()} [${stage1 ? 'PAID ✓' : 'DUE'}]\n` +
      `• *Stage 2 (40% Factory Dispatch):* ₹${Math.round(val * 0.4).toLocaleString()} [${stage2 ? 'PAID ✓' : 'DUE ON LOADING'}]\n` +
      `• *Stage 3 (10% Final Assembly):* ₹${Math.round(val * 0.1).toLocaleString()} [${stage3 ? 'PAID ✓' : 'UPON FITTING'}]\n` +
      `• *Current Account Status:* ${stage}\n\n` +
      `📞 *Director Desk:* +91 9390553301 | Shree Ganesh Enterprises`;

    window.open(`https://wa.me/${String(phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '600px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>👑</span>
            <div>
              <span className="badge badge-gold">{project.id}</span>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                Edit VIP Account: {project.name}
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label>Project Value (₹):</label>
              <input type="number" value={val} onChange={e => setVal(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Client Phone:</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-field">
            <label>Project Site Address:</label>
            <input value={loc} onChange={e => setLoc(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Project Stage:</label>
            <select value={stage} onChange={e => setStage(e.target.value)}>
              <option value="PROPOSAL DELIVERED">📄 PROPOSAL DELIVERED</option>
              <option value="50% TOKEN ADVANCE RECEIVED">💰 50% ADVANCE PAID</option>
              <option value="SAFELOCKED & STAGED">🔒 SAFELOCKED & STAGED</option>
              <option value="DISPATCH IN TRANSIT">🚚 DISPATCH IN TRANSIT</option>
              <option value="COMPLETED & ASSEMBLED">✅ COMPLETED & ASSEMBLED</option>
            </select>
          </div>

          {/* Milestone Payment Checklist */}
          <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '8px' }}>
              💰 Milestone Payment Schedule (3-Stage Split):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#FFFFFF', cursor: 'pointer' }}>
                <input type="checkbox" checked={stage1} onChange={e => setStage1(e.target.checked)} />
                <span>Stage 1: <b>50% Booking Advance (₹{Math.round(val * 0.5).toLocaleString()})</b></span>
                {stage1 && <span className="badge badge-emerald" style={{ fontSize: '9px' }}>PAID ✓</span>}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#FFFFFF', cursor: 'pointer' }}>
                <input type="checkbox" checked={stage2} onChange={e => setStage2(e.target.checked)} />
                <span>Stage 2: <b>40% Factory Dispatch Loading (₹{Math.round(val * 0.4).toLocaleString()})</b></span>
                {stage2 && <span className="badge badge-emerald" style={{ fontSize: '9px' }}>PAID ✓</span>}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#FFFFFF', cursor: 'pointer' }}>
                <input type="checkbox" checked={stage3} onChange={e => setStage3(e.target.checked)} />
                <span>Stage 3: <b>10% Master Assembly Sign-off (₹{Math.round(val * 0.1).toLocaleString()})</b></span>
                {stage3 && <span className="badge badge-emerald" style={{ fontSize: '9px' }}>PAID ✓</span>}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn-ghost-edit" 
              style={{ color: 'var(--accent-rose)' }}
              onClick={() => {
                if (window.confirm(`Delete VIP Project #${project.id}?`)) {
                  deleteVipProject(project.id);
                  onClose();
                }
              }}
            >
              🗑️ Remove
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-cyan" onClick={handleSendMilestoneWhatsApp}>
                <Send size={13} /> 📲 Send Milestone WhatsApp
              </button>
              <button type="button" className="btn-luxury-gold" onClick={handleSave}>
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================================
// 🔥 EXECUTIVE MODAL 3: ADD DISPLAY SKU TO FLOOR AGING SENTINEL
// ==============================================================================================
export function AddFloorAgingSkuModal({ isOpen, onClose }) {
  const { catalog, addFloorAgingSku } = useStore();
  const [selectedSku, setSelectedSku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [days, setDays] = useState(45);
  const [bay, setBay] = useState('Bay 1');
  const [disc, setDisc] = useState(20);

  if (!isOpen) return null;

  const chosenProduct = catalog.find(c => c.SKU === selectedSku) || catalog[0];

  const handleSave = () => {
    const payload = {
      sku: chosenProduct.SKU,
      name: chosenProduct.Product_Name,
      floorDays: Number(days),
      bay,
      mrp: chosenProduct.MRP_INR || 98000,
      discountPct: Number(disc),
      clearancePrice: Math.round((chosenProduct.MRP_INR || 98000) * (1 - disc / 100)),
      notes: 'Showroom display unit under active age monitoring'
    };

    addFloorAgingSku(payload);
    dispatchWebhookAction('ADD_FLOOR_AGING_STOCK', payload);

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔥 Display SKU ${chosenProduct.SKU} tracked & synced to Floor_Aging_Sentinel!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px', background: '#0B132B', border: '2px solid var(--accent-amber)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔥</span>
            <div>
              <span className="badge badge-amber">FLOOR AGING SENTINEL</span>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                Track Display Unit on Showroom Floor
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
          <div className="form-field">
            <label>Select Showroom Furniture SKU:</label>
            <select value={selectedSku} onChange={e => setSelectedSku(e.target.value)}>
              {catalog.map(c => (
                <option key={c.SKU} value={c.SKU}>
                  {c.SKU} — {c.Product_Name} (MRP ₹{c.MRP_INR?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label>Days on Showroom Floor:</label>
              <input type="number" value={days} onChange={e => setDays(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Showroom Bay / Zone:</label>
              <select value={bay} onChange={e => setBay(e.target.value)}>
                <option value="Bay 1 (Main Entrance)">Bay 1 (Main Entrance)</option>
                <option value="Bay 2 (Living Recliners)">Bay 2 (Living Recliners)</option>
                <option value="Bay 3 (Bedroom Master Suites)">Bay 3 (Bedroom Master Suites)</option>
                <option value="Bay 4 (Dining & Marble)">Bay 4 (Dining & Marble)</option>
                <option value="Bay 5 (Modular Wardrobes)">Bay 5 (Modular Wardrobes)</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Clearance Markdown Discount ({disc}%):</label>
            <input type="range" min="10" max="35" step="5" value={disc} onChange={e => setDisc(e.target.value)} />
            <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
              Clearance Price: <b>₹{Math.round((chosenProduct.MRP_INR || 98000) * (1 - disc / 100)).toLocaleString()}</b>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button className="btn-ghost-edit" onClick={onClose}>Cancel</button>
            <button className="btn-amber" onClick={handleSave}>
              <Check size={14} /> Add to Aging Watch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================================
// 🔥 EXECUTIVE MODAL 4: EDIT FLOOR AGING DISCOUNT & RESET AGE
// ==============================================================================================
export function EditFloorAgingModal({ isOpen, onClose, item }) {
  const { updateFloorAgingSku, resetFloorAge } = useStore();
  const [disc, setDisc] = useState(item?.discountPct || 20);
  const [bay, setBay] = useState(item?.bay || 'Bay 1');
  const [notes, setNotes] = useState(item?.notes || '');

  if (!isOpen || !item) return null;

  const clrPrice = Math.round(item.mrp * (1 - disc / 100));

  const handleSave = () => {
    const updatedPayload = {
      sku: item.sku,
      name: item.name,
      floorDays: item.floorDays,
      bay,
      mrp: item.mrp,
      discountPct: Number(disc),
      clearancePrice: clrPrice,
      notes
    };

    updateFloorAgingSku(item.sku, {
      discountPct: Number(disc),
      bay,
      notes
    });

    dispatchWebhookAction('UPDATE_FLOOR_AGING_STOCK', updatedPayload);

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔥 Floor Aging SKU ${item.sku} updated & synced to Floor_Aging_Sentinel!`, true);
    onClose();
  };

  const handleResetAge = () => {
    if (window.confirm(`Reset floor age for ${item.name} to Day 1 (Unit swapped from warehouse)?`)) {
      resetFloorAge(item.sku);

      dispatchWebhookAction('RESET_FLOOR_AGING_STOCK', {
        sku: item.sku,
        name: item.name,
        floorDays: 1,
        bay,
        mrp: item.mrp,
        discountPct: Number(disc),
        clearancePrice: clrPrice,
        notes: 'Swapped fresh unit from warehouse — reset to Day 1'
      });

      playSuccessChime();
      showToast(`🔄 Floor Age for ${item.sku} reset to Day 1 & logged in Floor_Aging_Sentinel!`, true);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px', background: '#0B132B', border: '2px solid var(--accent-amber)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔥</span>
            <div>
              <span className="badge badge-amber">{item.sku}</span>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                Manage Display Piece: {item.name}
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
          <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Display Age: <strong style={{ color: 'var(--accent-amber)' }}>{item.floorDays} Days on Floor</strong></span>
              <span>Original MRP: <strong>₹{item.mrp?.toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="form-field">
            <label>Showroom Bay / Zone:</label>
            <input value={bay} onChange={e => setBay(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Clearance Markdown Discount ({disc}%):</label>
            <input type="range" min="10" max="40" step="5" value={disc} onChange={e => setDisc(e.target.value)} />
            <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
              Flash Clearance Price: <b>₹{clrPrice.toLocaleString()}</b> (Save ₹{(item.mrp - clrPrice).toLocaleString()})
            </div>
          </div>

          <div className="form-field">
            <label>Condition & Maintenance Notes:</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Polish buffed, pristine factory condition" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn-cyan" 
              style={{ fontSize: '11px' }}
              onClick={handleResetAge}
            >
              🔄 Reset to Day 1 (Swapped Unit)
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-ghost-edit" onClick={onClose}>Cancel</button>
              <button type="button" className="btn-luxury-gold" onClick={handleSave}>
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================================
// 1. 💰 EXECUTIVE REVENUE & SETTLEMENT LEDGER MODAL (Gross Revenue Drill-Down & Manual Entry)
// ==============================================================================================
export function ExecutiveRevenueLedgerModal({ isOpen, onClose }) {
  const { orders, setOrders, showToast } = useStore();
  const [filterMode, setFilterMode] = useState('ALL'); // ALL | CASH | UPI | CARD | DUE
  const [showAddEntry, setShowAddEntry] = useState(false);
  
  // New Manual Cash/Adjustment Entry Form
  const [entryCustomer, setEntryCustomer] = useState('');
  const [entryPhone, setEntryPhone] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryMode, setEntryMode] = useState('Showroom Counter Cash');
  const [entryReason, setEntryReason] = useState('Counter Token Advance');

  if (!isOpen) return null;

  const totalGrossRevenue = orders.reduce((sum, o) => sum + (Number(o.Total_Amount_INR) || 0), 0);
  const totalAdvancesCollected = orders.reduce((sum, o) => sum + (Number(o.Advance_Paid_INR) || 0), 0);
  const totalReceivablesDue = Math.max(0, totalGrossRevenue - totalAdvancesCollected);
  const estimatedGrossMargin = Math.round(totalGrossRevenue * 0.324);

  const filteredOrders = orders.filter(o => {
    if (filterMode === 'CASH') return (o.Payment_Mode || 'Dynamic UPI QR').toLowerCase().includes('cash');
    if (filterMode === 'UPI') return (o.Payment_Mode || 'Dynamic UPI QR').toLowerCase().includes('upi');
    if (filterMode === 'CARD') return (o.Payment_Mode || '').toLowerCase().includes('card');
    if (filterMode === 'DUE') return (Number(o.Total_Amount_INR) - Number(o.Advance_Paid_INR || 0)) > 0;
    return true;
  });

  const handleAddManualEntry = (e) => {
    e.preventDefault();
    if (!entryAmount || Number(entryAmount) <= 0) {
      showToast('⚠️ Please enter a valid amount!', false);
      return;
    }

    const amt = Number(entryAmount);
    const orderId = `REC-MAN-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      Order_ID: orderId,
      Customer_Name: entryCustomer || 'Walk-In Customer',
      Customer_Phone: entryPhone || '9390553301',
      Project_Address: 'Rayagada Showroom Counter',
      Ordered_SKU: entryReason || 'Showroom Cash Settlement',
      Total_Amount_INR: amt,
      Advance_Paid_INR: amt,
      Payment_Mode: entryMode,
      SafeLock_Status: 'SETTLED_COUNTER_CASH',
      Delivery_Schedule: 'Immediate / Over Counter',
      Assigned_Driver: 'Counter Settlement',
      Carpenter_Assigned: 'N/A',
      Carpenter_Payout_INR: 0,
      Created_At: new Date().toISOString()
    };

    setOrders([newOrder, ...orders]);
    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('RECORD_SHOWROOM_FINANCIAL_ENTRY', {
      entry_id: orderId,
      customer_name: entryCustomer || 'Walk-In Customer',
      phone: entryPhone || '9390553301',
      amount_inr: amt,
      payment_mode: entryMode,
      reason: entryReason,
      timestamp: new Date().toISOString()
    });

    showToast(`💰 Recorded ₹${amt.toLocaleString()} (${entryMode}) & logged to Google Sheets!`, true);
    setEntryCustomer('');
    setEntryAmount('');
    setEntryReason('Counter Token Advance');
    setShowAddEntry(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '960px', width: '95vw', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', padding: '8px', borderRadius: '10px', border: '1px solid var(--accent-gold)' }}>
              <DollarSign size={20} color="var(--accent-gold)" />
            </div>
            <div>
              <span className="badge badge-gold" style={{ fontSize: '10px' }}>EXECUTIVE REVENUE RADAR</span>
              <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '17px', fontWeight: '900' }}>
                Gross Showroom Revenue & Settlement Ledger
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 4 Financial Stat Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '14px 0' }}>
          <div style={{ background: '#030712', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gross Revenue (All Orders)</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono', marginTop: '3px' }}>
              ₹{totalGrossRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{orders.length} Active Bookings</div>
          </div>

          <div style={{ background: '#030712', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Advances Collected</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono', marginTop: '3px' }}>
              ₹{totalAdvancesCollected.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-emerald)', marginTop: '2px' }}>🔒 Verified in Bank/Drawer</div>
          </div>

          <div style={{ background: '#030712', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Doorstep Balance Due</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-amber)', fontFamily: 'JetBrains Mono', marginTop: '3px' }}>
              ₹{totalReceivablesDue.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-amber)', marginTop: '2px' }}>Collect on Delivery (ePOD)</div>
          </div>

          <div style={{ background: '#030712', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gross Profit Margin</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-purple)', fontFamily: 'JetBrains Mono', marginTop: '3px' }}>
              ₹{estimatedGrossMargin.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-purple)', marginTop: '2px' }}>32.4% EBITDA Contribution</div>
          </div>
        </div>

        {/* Filter Toolbar + Add Manual Entry Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#030712', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'UPI', label: '📱 Dynamic UPI QR' },
              { id: 'CASH', label: '💵 Cash Drawer' },
              { id: 'CARD', label: '💳 POS Card' },
              { id: 'DUE', label: '⏳ Balance Pending' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                style={{
                  background: filterMode === f.id ? 'var(--accent-gold)' : 'transparent',
                  color: filterMode === f.id ? '#000000' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button 
            className="btn-luxury-gold" 
            onClick={() => setShowAddEntry(!showAddEntry)} 
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            {showAddEntry ? '✕ Close Form' : '➕ Add Showroom Cash / Adjust Entry'}
          </button>
        </div>

        {/* Add Manual Cash Entry Inline Form */}
        {showAddEntry && (
          <form onSubmit={handleAddManualEntry} style={{ background: '#070D18', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', padding: '14px', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
              📝 Add Direct Showroom Cash / Manual Ledger Settlement
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Customer Name:</label>
                <input 
                  placeholder="e.g. Bipin Mohanty" 
                  value={entryCustomer} 
                  onChange={e => setEntryCustomer(e.target.value)} 
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '7px', color: '#FFF', fontSize: '12px', marginTop: '3px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Customer Phone:</label>
                <input 
                  placeholder="9437188291" 
                  value={entryPhone} 
                  onChange={e => setEntryPhone(e.target.value)} 
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '7px', color: '#FFF', fontSize: '12px', marginTop: '3px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Amount (₹):</label>
                <input 
                  type="number" 
                  placeholder="25000" 
                  value={entryAmount} 
                  onChange={e => setEntryAmount(e.target.value)} 
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '7px', color: '#FFF', fontSize: '12px', marginTop: '3px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Payment Mode:</label>
                <select 
                  value={entryMode} 
                  onChange={e => setEntryMode(e.target.value)}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '7px', color: '#FFF', fontSize: '12px', marginTop: '3px' }}
                >
                  <option value="Showroom Counter Cash">💵 Showroom Counter Cash</option>
                  <option value="Direct UPI VPA Transfer">📱 Direct UPI VPA Transfer</option>
                  <option value="HDFC POS Card Swipe">💳 HDFC POS Card Swipe</option>
                  <option value="SBI Bank RTGS / NEFT">🏛️ SBI Bank RTGS / NEFT</option>
                  <option value="Bajaj Finserv 0% EMI">🏷️ Bajaj Finserv 0% EMI</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reason / Line Item:</label>
                <input 
                  placeholder="e.g. 50% Token for Custom Dressing Table & Bed" 
                  value={entryReason} 
                  onChange={e => setEntryReason(e.target.value)}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '7px', color: '#FFF', fontSize: '12px', marginTop: '3px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button type="button" className="btn-ghost-edit" onClick={() => setShowAddEntry(false)}>Cancel</button>
              <button type="submit" className="btn-luxury-gold" style={{ fontSize: '11px', padding: '6px 14px' }}>
                <Check size={13} /> Save Entry & Sync Cloud
              </button>
            </div>
          </form>
        )}

        {/* Transaction Ledger Table */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <table className="luxury-table" style={{ width: '100%', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#030712' }}>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Ordered Suite</th>
                <th>Total Bill</th>
                <th>Advance Paid</th>
                <th>Balance Due</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const bal = Math.max(0, (Number(o.Total_Amount_INR) || 0) - (Number(o.Advance_Paid_INR) || 0));
                return (
                  <tr key={o.Order_ID}>
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)', fontWeight: '800' }}>{o.Order_ID}</td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{o.Customer_Name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{o.Customer_Phone}</div>
                    </td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.Ordered_SKU}</td>
                    <td style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>₹{Number(o.Total_Amount_INR).toLocaleString()}</td>
                    <td style={{ fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>₹{Number(o.Advance_Paid_INR || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: '800', color: bal > 0 ? 'var(--accent-amber)' : 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                      {bal > 0 ? `₹${bal.toLocaleString()}` : 'Settled ✓'}
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                        {o.Payment_Mode || 'Dynamic UPI QR'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${(o.SafeLock_Status || '').includes('DELIVERED') ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '8.5px' }}>
                        {o.SafeLock_Status || 'SAFELOCKED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Showing {filteredOrders.length} transactions • Real-time cloud sync active</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-ghost-edit" onClick={onClose}>Close Ledger</button>
            <button 
              className="btn-cyan" 
              onClick={() => {
                playSuccessChime();
                showToast('📑 Full Revenue & Cash Ledger downloaded as CSV!', true);
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==============================================================================================
// 2. 🛡️ EXECUTIVE SAFELOCKS DRILL-DOWN MODAL (48h Reservation & Staging Studio)
// ==============================================================================================
export function ExecutiveSafeLocksDrilldownModal({ isOpen, onClose }) {
  const { orders, updateOrderStatus, showToast, openModal } = useStore();

  if (!isOpen) return null;

  const safeLockedOrders = orders.filter(o => !(o.SafeLock_Status || '').includes('DELIVERED'));

  const handleExtendLock = (order) => {
    playSuccessChime();
    triggerGoldenConfetti();
    const newStatus = "SAFELOCKED (RESERVED +48H EXTENDED)";
    updateOrderStatus(order.Order_ID, newStatus);
    
    dispatchWebhookAction('EXTEND_SAFELOCK', {
      order_id: order.Order_ID,
      customer_name: order.Customer_Name,
      product: order.Ordered_SKU,
      extended_hours: 48,
      timestamp: new Date().toISOString()
    });

    showToast(`⏱️ SafeLock for #${order.Order_ID} (${order.Customer_Name}) extended by +48 hours!`, true);
  };

  const handleReleaseLock = (order) => {
    if (window.confirm(`Release SafeLock reservation for ${order.Customer_Name} (#${order.Order_ID})? Stock will be released to floor.`)) {
      updateOrderStatus(order.Order_ID, 'SAFELOCK_RELEASED_TO_FLOOR');
      playScanBeep();
      showToast(`🔓 SafeLock #${order.Order_ID} released to active warehouse stock!`, true);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '900px', width: '95vw', background: '#0B132B', border: '2px solid var(--accent-cyan)' }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(6,182,212,0.15)', padding: '8px', borderRadius: '10px', border: '1px solid var(--accent-cyan)' }}>
              <ShieldCheck size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <span className="badge badge-cyan" style={{ fontSize: '10px' }}>SAFELOCK SENTINEL</span>
              <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '17px', fontWeight: '900' }}>
                Active SafeLocks & Knockdown Staging Bays
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '10px', padding: '10px 14px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#E2E8F0' }}>
            🔒 <strong>{safeLockedOrders.length} Furniture Suites</strong> currently token-locked under 50% SafeLock guarantee in Rayagada Warehouse.
          </span>
          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Zero Double-Booking Guarantee</span>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {safeLockedOrders.map(o => {
            const isStaged = (o.SafeLock_Status || '').includes('STAGED') || (o.SafeLock_Status || '').includes('TRANSIT');
            return (
              <div key={o.Order_ID} style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)', fontWeight: '900', fontSize: '12px' }}>{o.Order_ID}</span>
                    <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>{o.Customer_Name}</strong>
                    <span className="badge badge-gold" style={{ fontSize: '9px' }}>50% Advance Paid (₹{Number(o.Advance_Paid_INR).toLocaleString()})</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#CBD5E1', marginTop: '3px' }}>
                    🪑 {o.Ordered_SKU} • 📍 {o.Project_Address}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span className={`badge ${isStaged ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '9px' }}>
                      {isStaged ? '📦 5/5 Staged (Gatepass Ready)' : '⏳ Staging in Progress'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      ⏱️ Lock Timer: <strong style={{ color: 'var(--accent-gold-light)' }}>36h Remaining</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-ghost-edit" 
                    style={{ fontSize: '10.5px', padding: '5px 8px' }}
                    onClick={() => handleExtendLock(o)}
                    title="Extend Lock Validity by 48 Hours"
                  >
                    ⏱️ +48h Extend
                  </button>

                  <button 
                    className="btn-purple" 
                    style={{ fontSize: '10.5px', padding: '5px 8px' }}
                    onClick={() => openModal('smartkit_staging', { order: o })}
                    title="Open Flat-Pack Component Staging Bay"
                  >
                    📦 Staging Bay
                  </button>

                  <button 
                    className="btn-ghost-edit" 
                    style={{ fontSize: '10.5px', padding: '5px 8px', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)' }}
                    onClick={() => handleReleaseLock(o)}
                    title="Release Stock back to Showroom floor"
                  >
                    🔓 Release
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button className="btn-luxury-gold" onClick={onClose}>Close Studio</button>
        </div>

      </div>
    </div>
  );
}

// ==============================================================================================
// 3. 🚚 EXECUTIVE PENDING DELIVERIES & FLEET DISPATCH MODAL
// ==============================================================================================
export function ExecutiveDeliveriesDrilldownModal({ isOpen, onClose }) {
  const { orders, updateOrderStatus, showToast, openModal } = useStore();

  if (!isOpen) return null;

  const pendingOrders = orders.filter(o => !(o.SafeLock_Status || '').includes('DELIVERED'));

  const handleMarkDispatched = (order) => {
    playSuccessChime();
    const newStatus = "DISPATCHED_IN_TRANSIT (Tata Ace OD-18-A-1234)";
    updateOrderStatus(order.Order_ID, newStatus);
    
    dispatchWebhookAction('DISPATCH_FLEET_VEHICLE', {
      order_id: order.Order_ID,
      customer_name: order.Customer_Name,
      phone: order.Customer_Phone,
      driver: order.Assigned_Driver || 'Tophan Gouda',
      vehicle: 'Tata Ace OD-18-A-1234',
      timestamp: new Date().toISOString()
    });

    showToast(`🚚 Order #${order.Order_ID} marked Dispatched in Transit with driver ${order.Assigned_Driver}!`, true);
  };

  const handleSendWhatsAppTracking = (order) => {
    const text = `🚚 *GODREJ INTERIO RAYAGADA — LIVE DELIVERY DISPATCH*\n\nNamaskar ${order.Customer_Name}! Your luxury furniture suite *${order.Ordered_SKU}* has been loaded onto our delivery fleet (Tata Ace OD-18-A-1234).\n\n• Driver: ${order.Assigned_Driver || 'Tophan Gouda'} (+91 94371 88291)\n• Carpenter: ${order.Carpenter_Assigned || 'Narayana Mistri'}\n• Balance Due: ₹${(order.Total_Amount_INR - (order.Advance_Paid_INR || 0)).toLocaleString()}\n\n📞 Showroom Helpline: +91 9390553301`;
    window.open(`https://wa.me/${(order.Customer_Phone || '9390553301').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '920px', width: '95vw', background: '#0B132B', border: '2px solid var(--accent-amber)' }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(245,158,11,0.15)', padding: '8px', borderRadius: '10px', border: '1px solid var(--accent-amber)' }}>
              <Truck size={20} color="var(--accent-amber)" />
            </div>
            <div>
              <span className="badge badge-amber" style={{ fontSize: '10px' }}>FLEET LOGISTICS DISPATCH</span>
              <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '17px', fontWeight: '900' }}>
                Pending Deliveries & Tata Ace Dispatch Hub
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '12px 0' }}>
          <div style={{ background: '#030712', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Pending Dispatches</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-amber)', marginTop: '2px' }}>{pendingOrders.length} Consignments</div>
          </div>
          <div style={{ background: '#030712', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Active Fleet Vehicle</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>Tata Ace (OD-18-A-1234)</div>
          </div>
          <div style={{ background: '#030712', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Doorstep Cash to Collect</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '2px' }}>
              ₹{pendingOrders.reduce((s, o) => s + Math.max(0, o.Total_Amount_INR - (o.Advance_Paid_INR || 0)), 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
          {pendingOrders.map(o => (
            <div key={o.Order_ID} style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-amber)', fontWeight: '900', fontSize: '12px' }}>{o.Order_ID}</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>{o.Customer_Name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {o.Customer_Phone}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '3px' }}>
                  📍 {o.Project_Address} • 🪑 {o.Ordered_SKU}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '9px' }}>🚚 {o.Assigned_Driver}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '9px' }}>🪚 {o.Carpenter_Assigned}</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--accent-gold-light)', fontWeight: '800' }}>Schedule: {o.Delivery_Schedule}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button 
                  className="btn-ghost-edit" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => handleSendWhatsAppTracking(o)}
                >
                  <Send size={11} /> WhatsApp ETA
                </button>
                <button 
                  className="btn-amber" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => handleMarkDispatched(o)}
                >
                  🚚 Dispatch
                </button>
                <button 
                  className="btn-emerald" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => openModal('digital_epod', { stop: { orderId: o.Order_ID, customer: o.Customer_Name, phone: o.Customer_Phone, address: o.Project_Address, amount: o.Total_Amount_INR } })}
                >
                  ✅ ePOD OTP
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button className="btn-luxury-gold" onClick={onClose}>Close Dispatch Hub</button>
        </div>

      </div>
    </div>
  );
}

// ==============================================================================================
// 4. 🔥 EXECUTIVE SHOWROOM HOT LEADS & HIGH-INTENT CRM MODAL
// ==============================================================================================
export function ExecutiveHotLeadsDrilldownModal({ isOpen, onClose }) {
  const { inquiries, setInquiries, showToast, openModal } = useStore();

  if (!isOpen) return null;

  const hotLeads = inquiries.filter(i => (Number(i.AI_Intent_Score) || 0) >= 80);

  const handleUpdateStatus = (leadId, newStatus) => {
    setInquiries(inquiries.map(i => i.Inquiry_ID === leadId ? { ...i, Lead_Status: newStatus } : i));
    playScanBeep();
    showToast(`Lead #${leadId} status updated to ${newStatus}!`, true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '900px', width: '95vw', background: '#0B132B', border: '2px solid var(--accent-purple)' }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(168,85,247,0.15)', padding: '8px', borderRadius: '10px', border: '1px solid var(--accent-purple)' }}>
              <Users size={20} color="var(--accent-purple)" />
            </div>
            <div>
              <span className="badge badge-purple" style={{ fontSize: '10px' }}>VIP CRM RADAR</span>
              <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '17px', fontWeight: '900' }}>
                Showroom Hot Leads (AI Intent $\ge$ 80%)
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', padding: '10px 14px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#E2E8F0' }}>
            🔥 <strong>{hotLeads.length} High-Probability Clients</strong> with verified budget & buying readiness in Rayagada.
          </span>
          <button className="btn-luxury-gold" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => openModal('new_inquiry')}>
            ➕ Log New Walk-in Lead
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {hotLeads.map(lead => (
            <div key={lead.Inquiry_ID} style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-purple)', fontWeight: '900', fontSize: '12px' }}>{lead.Inquiry_ID}</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>{lead.Customer_Name}</strong>
                  <span className="badge badge-rose" style={{ fontSize: '9px' }}>🔥 {lead.AI_Intent_Score || 90}% AI Intent</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#CBD5E1', marginTop: '3px' }}>
                  📞 {lead.Phone_Number} • 🪑 Interest: <strong>{lead.Interested_Category || lead.Product_Interest}</strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                  💰 Budget Bracket: ₹{(lead.Budget_INR || 150000).toLocaleString()} • Notes: {lead.Remarks || 'Visited showroom, requested teak finish quotation'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  value={lead.Lead_Status || 'HOT'}
                  onChange={e => handleUpdateStatus(lead.Inquiry_ID, e.target.value)}
                  style={{ background: '#0F172A', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '4px 6px', fontSize: '10.5px' }}
                >
                  <option value="HOT">🔥 HOT</option>
                  <option value="PROPOSAL_SENT">📄 PROPOSAL SENT</option>
                  <option value="CONVERTED_WON">🏆 WON (SAFELOCKED)</option>
                  <option value="FOLLOW_UP_SCHEDULED">📅 FOLLOW-UP</option>
                </select>

                <button 
                  className="btn-cyan" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => openModal('whatsapp_proposal', { customerName: lead.Customer_Name, customerPhone: lead.Phone_Number, totalAmount: lead.Budget_INR || 150000 })}
                >
                  <FileText size={11} /> 1-Click Quote
                </button>

                <button 
                  className="btn-luxury-gold" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => openModal('furniture_followup', { lead })}
                >
                  <Send size={11} /> WhatsApp Drip
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button className="btn-luxury-gold" onClick={onClose}>Close Hot Leads</button>
        </div>

      </div>
    </div>
  );
}

// ==============================================================================================
// 5. 🏛️ EXECUTIVE ARCHITECTS & COMMISSION LIABILITIES MODAL
// ==============================================================================================
export function ExecutiveArchitectsDrilldownModal({ isOpen, onClose }) {
  const { architects, openModal } = useStore();

  if (!isOpen) return null;

  const totalLiability = architects.reduce((sum, a) => sum + (Number(a.Balance_Due_INR) || 0), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '900px', width: '95vw', background: '#0B132B', border: '2px solid var(--accent-emerald)' }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(16,185,129,0.15)', padding: '8px', borderRadius: '10px', border: '1px solid var(--accent-emerald)' }}>
              <Award size={20} color="var(--accent-emerald)" />
            </div>
            <div>
              <span className="badge badge-emerald" style={{ fontSize: '10px' }}>ARCHITECT PARTNER NETWORK</span>
              <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '17px', fontWeight: '900' }}>
                Architect Commission Liabilities & Payout Radar
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '10px 14px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#E2E8F0' }}>
            🏛️ <strong>{architects.length} VIP Architect Partners</strong> • Total Outstanding Commission: <strong style={{ color: 'var(--accent-emerald)' }}>₹{totalLiability.toLocaleString()}</strong>
          </span>
          <button className="btn-luxury-gold" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => openModal('register_architect')}>
            + Register Architect
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
          {architects.map(a => (
            <div key={a.Architect_ID} style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>{a.Full_Name}</strong>
                  <span className="badge badge-purple" style={{ fontSize: '9px' }}>{a.Tier_Slab} ({a.Commission_Rate})</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🏢 {a.Firm_Name}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '3px' }}>
                  📞 {a.Phone_Number} • 💳 UPI: {a.UPI_Bank}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px', fontWeight: '800' }}>
                  Referred Sales: ₹{Number(a.Total_Sales_INR || 0).toLocaleString()} • Balance Due: ₹{Number(a.Balance_Due_INR || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button 
                  className="btn-emerald" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => openModal('architect_payout', { architect: a })}
                >
                  <DollarSign size={11} /> 1-Click UPI Payout
                </button>
                <button 
                  className="btn-ghost-edit" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => openModal('architect_statement', { architect: a })}
                >
                  <FileText size={11} /> Statement
                </button>
                <button 
                  className="btn-ghost-edit" 
                  style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  onClick={() => openModal('edit_architect', { architect: a })}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button className="btn-luxury-gold" onClick={onClose}>Close Architect Network</button>
        </div>

      </div>
    </div>
  );
}

// ==============================================================================================
// 6. 📅 CUSTOM DATE RANGE & HORIZON TARGET MODAL
// ==============================================================================================
export function CustomDateRangeModal({ isOpen, onClose, customRange, onApplyCustomRange }) {
  const { showToast } = useStore();
  const [start, setStart] = useState(customRange?.start || new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(customRange?.end || new Date().toISOString().slice(0, 10));
  const [targetINR, setTargetINR] = useState(customRange?.targetINR || 1500000);

  if (!isOpen) return null;

  const handleApplyPreset = (type) => {
    const today = new Date();
    let s = new Date();
    let e = new Date();

    if (type === 'YESTERDAY') {
      s.setDate(today.getDate() - 1);
      e.setDate(today.getDate() - 1);
    } else if (type === '7DAYS') {
      s.setDate(today.getDate() - 7);
    } else if (type === '30DAYS') {
      s.setDate(today.getDate() - 30);
    } else if (type === 'Q2') {
      s = new Date(today.getFullYear(), 3, 1);
      e = new Date(today.getFullYear(), 5, 30);
    } else if (type === 'YEAR') {
      s = new Date(today.getFullYear(), 0, 1);
      e = new Date(today.getFullYear(), 11, 31);
    }

    setStart(s.toISOString().slice(0, 10));
    setEnd(e.toISOString().slice(0, 10));
    playScanBeep();
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (new Date(start) > new Date(end)) {
      showToast('⚠️ Start Date cannot be after End Date!', false);
      return;
    }
    onApplyCustomRange({ start, end, targetINR: Number(targetINR) });
    playSuccessChime();
    showToast(`📅 Active Period Horizon set to ${start} to ${end}!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📅</span>
            <div>
              <span className="badge badge-gold" style={{ fontSize: '10px' }}>TIME HORIZON CUSTOMIZER</span>
              <h3 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '16px', fontWeight: '900' }}>
                Select Custom Date Horizon & Target
              </h3>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', margin: '12px 0 6px' }}>
          {[
            { id: 'YESTERDAY', label: 'Yesterday' },
            { id: '7DAYS', label: 'Last 7 Days' },
            { id: '30DAYS', label: 'Last 30 Days' },
            { id: 'Q2', label: 'Q2 (Apr-Jun)' },
            { id: 'YEAR', label: 'Full Year 2026' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              className="btn-ghost-edit"
              style={{ fontSize: '10.5px', padding: '4px 8px' }}
              onClick={() => handleApplyPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>From Start Date:</label>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} required />
            </div>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>To End Date:</label>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)} required />
            </div>
          </div>

          <div className="form-field">
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Custom Horizon Sales Target (₹):</label>
            <input type="number" value={targetINR} onChange={e => setTargetINR(e.target.value)} step="50000" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn-ghost-edit" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-luxury-gold">
              <Check size={14} /> Apply Date Horizon
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}



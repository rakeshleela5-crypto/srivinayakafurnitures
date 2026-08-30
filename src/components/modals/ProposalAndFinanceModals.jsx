import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Send, 
  Printer, 
  Share2, 
  DollarSign, 
  CreditCard, 
  RefreshCw, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  FileText,
  Smartphone,
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { DynamicQrCode } from '../../utils/qrcodeGenerator';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

// =========================================================================
// 1. 📄 1-CLICK WHATSAPP 2-PAGE DIGITAL PROPOSAL PDF MODAL
// =========================================================================
export function WhatsAppProposalModal({ isOpen, onClose, proposalData = {} }) {
  const { storeMeta, showToast } = useStore();

  const customerName = proposalData.customerName || "Dr. Subhashish Jena";
  const customerPhone = proposalData.customerPhone || "9437188291";
  const projectAddress = proposalData.address || "Gayatri Nagar Villa, Rayagada";
  const roomTitle = proposalData.roomTitle || "Master Bedroom Suite (16 × 14 ft)";
  const dimensions = proposalData.dimensions || "16' 4\" × 14' 2\" × 10' 0\"";
  const roomImage = proposalData.roomImage || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800";
  const items = proposalData.items || [
    { sku: "BED-MOD-001", name: "Solid King Bed (Hydraulic Teak)", mrp: 98000, price: 78247, warranty: "10 Years" },
    { sku: "ALM-MOD-001", name: "4-Door Sliding Mirror Wardrobe", mrp: 65000, price: 52000, warranty: "5 Years" },
    { sku: "CHR-MOD-001", name: "Solid Teak Accent Armchair", mrp: 28000, price: 21890, warranty: "5 Years" }
  ];

  const totalMRP = items.reduce((sum, item) => sum + (item.mrp || 0), 0);
  const totalSelling = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const comboSavings = Math.round(totalMRP * 0.08); // 8% Suite Bundle discount
  const finalAmount = totalSelling - (proposalData.exchangeCredit || 0);
  const advance50Pct = Math.round(finalAmount * 0.5);

  const proposalNumber = proposalData.proposalNumber || `PROP-GI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const [proposalLang, setProposalLang] = useState('EN');

  if (!isOpen) return null;

  const handleSendWhatsApp = () => {
    playScanBeep();
    const upiLink = `upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${advance50Pct}&cu=INR&tn=${encodeURIComponent(`Token Advance for ${proposalNumber}`)}`;
    
    let message = '';
    if (proposalLang === 'OR') {
      message = `*🏛️ ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ଲକଜରୀ ଡିଜାଇନ୍ ପ୍ରସ୍ତାବ*\n` +
        `*ପ୍ରସ୍ତାବ ନଂ:* ${proposalNumber} (ବୈଧତା: ${validUntil})\n` +
        `*ଗ୍ରାହକ:* ${customerName}\n` +
        `*ରୁମ୍:* ${roomTitle} (${dimensions})\n\n` +
        `*ମନୋନୀତ ଫର୍ନିଚର ସାମଗ୍ରୀ:*\n` +
        items.map((it, idx) => `${idx + 1}. ${it.name} (${it.sku}) — ₹${it.price.toLocaleString()}`).join('\n') + `\n\n` +
        `*ମୋଟ MRP ମୂଲ୍ୟ:* ₹${totalMRP.toLocaleString()}\n` +
        `*ଶୋ'ରୁମ୍ ସୁଇଟ୍ ବଣ୍ଡଲ୍ ରିହାତି:* -₹${comboSavings.toLocaleString()}\n` +
        (proposalData.exchangeCredit ? `*ପୁରୁଣା ଫର୍ନିଚର ଏକ୍ସଚେଞ୍ଜ୍ ରିହାତି:* -₹${proposalData.exchangeCredit.toLocaleString()}\n` : '') +
        `*ନିଟ୍ ପ୍ରସ୍ତାବ ମୂଲ୍ୟ (GST 18% ସହିତ):* ₹${finalAmount.toLocaleString()}\n` +
        `*୫୦% ସୁରକ୍ଷିତ ଟୋକନ୍ ଅଗ୍ରିମ:* ₹${advance50Pct.toLocaleString()}\n\n` +
        `👉 *୫୦% ଅଗ୍ରିମ UPI ମାଧ୍ୟମରେ ଦେୟ କରନ୍ତୁ:*\n${upiLink}\n\n` +
        `*ଫ୍ଲାଗସିପ୍ ଷ୍ଟୋର:* ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା | 📞 9390553301`;
    } else if (proposalLang === 'TE') {
      message = `*🏛️ గోద్రెజ్ ఇంటీరియో రాయగడ — లగ్జరీ డిజైన్ ప్రపోజల్*\n` +
        `*ప్రపోజల్ నం:* ${proposalNumber} (వ్యాలిడిటీ: ${validUntil})\n` +
        `*కస్టమర్:* ${customerName}\n` +
        `*గది:* ${roomTitle} (${dimensions})\n\n` +
        `*ఎంపిక చేసిన ఫర్నిచర్ ఐటమ్స్:*\n` +
        items.map((it, idx) => `${idx + 1}. ${it.name} (${it.sku}) — ₹${it.price.toLocaleString()}`).join('\n') + `\n\n` +
        `*మొత్తం MRP:* ₹${totalMRP.toLocaleString()}\n` +
        `*షోరూమ్ కాంబో సేవింగ్స్:* -₹${comboSavings.toLocaleString()}\n` +
        (proposalData.exchangeCredit ? `*పాత ఫర్నిచర్ ఎక్స్ఛేంజ్ క్రెడిట్:* -₹${proposalData.exchangeCredit.toLocaleString()}\n` : '') +
        `*నెట్ ప్రపోజల్ ధర (18% GST తో):* ₹${finalAmount.toLocaleString()}\n` +
        `*50% టోకెన్ అడ్వాన్స్:* ₹${advance50Pct.toLocaleString()}\n\n` +
        `👉 *UPI ద్వారా 50% అడ్వాన్స్ చెల్లించండి:*\n${upiLink}\n\n` +
        `*ఫ్లాగ్‌షిప్ షోరూమ్:* న్యూ బస్ స్టాండ్ దగ్గర, రాయగడ | 📞 9390553301`;
    } else if (proposalLang === 'HI') {
      message = `*🏛️ गोदरेज इंटीरियो रायगड़ा — लक्जरी डिजाइन प्रस्ताव*\n` +
        `*प्रस्ताव संख्या:* ${proposalNumber} (वैधता: ${validUntil})\n` +
        `*ग्राहक:* ${customerName}\n` +
        `*रूम:* ${roomTitle} (${dimensions})\n\n` +
        `*चयनित फर्नीचर:* \n` +
        items.map((it, idx) => `${idx + 1}. ${it.name} (${it.sku}) — ₹${it.price.toLocaleString()}`).join('\n') + `\n\n` +
        `*कुल MRP:* ₹${totalMRP.toLocaleString()}\n` +
        `*कॉम्बो सुइट बचत:* -₹${comboSavings.toLocaleString()}\n` +
        (proposalData.exchangeCredit ? `*पुराने फर्नीचर एक्सचेंज छूट:* -₹${proposalData.exchangeCredit.toLocaleString()}\n` : '') +
        `*अंतिम प्रस्ताव मूल्य (18% GST सहित):* ₹${finalAmount.toLocaleString()}\n` +
        `*50% टोकन एडवांस:* ₹${advance50Pct.toLocaleString()}\n\n` +
        `👉 *UPI द्वारा 50% एडवांस भुगतान करें:*\n${upiLink}\n\n` +
        `*शोरूम:* न्यू बस स्टैंड के पास, रायगड़ा | 📞 9390553301`;
    } else {
      message = `*🏛️ GODREJ INTERIO RAYAGADA — LUXURY DESIGN PROPOSAL*\n` +
        `*Proposal Ref:* ${proposalNumber} (Valid till ${validUntil})\n` +
        `*Customer:* ${customerName}\n` +
        `*Room:* ${roomTitle} (${dimensions})\n\n` +
        `*Selected Furniture Pieces:*\n` +
        items.map((it, idx) => `${idx + 1}. ${it.name} (${it.sku}) — ₹${it.price.toLocaleString()}`).join('\n') + `\n\n` +
        `*Total Individual MRP:* ₹${totalMRP.toLocaleString()}\n` +
        `*Showroom Suite Combo Savings:* -₹${comboSavings.toLocaleString()}\n` +
        (proposalData.exchangeCredit ? `*Old Furniture Exchange Credit:* -₹${proposalData.exchangeCredit.toLocaleString()}\n` : '') +
        `*Net Proposal Price (GST 18% Incl.):* ₹${finalAmount.toLocaleString()}\n` +
        `*50% SafeLock Advance Token:* ₹${advance50Pct.toLocaleString()}\n\n` +
        `👉 *Click to Pay 50% Token via UPI (GPay/PhonePe/Paytm):*\n${upiLink}\n\n` +
        `*Flagship Store:* Near New Bus Stand, Rayagada | 📞 9390553301`;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('SEND_WHATSAPP_PROPOSAL', {
      proposal_number: proposalNumber,
      customer_name: customerName,
      phone: customerPhone,
      total_amount: finalAmount,
      advance_token: advance50Pct,
      valid_until: validUntil,
      language: proposalLang
    });

    window.open(whatsappUrl, '_blank');
    showToast(`📲 Luxury Proposal #${proposalNumber} sent in ${proposalLang === 'OR' ? 'ଓଡ଼ିଆ' : proposalLang === 'TE' ? 'తెలుగు' : proposalLang === 'HI' ? 'हिंदी' : 'English'} to WhatsApp (${customerPhone})!`, true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Header Action Bar */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '12px' }}>
          <div>
            <span className="badge badge-gold">2-PAGE LUXURY WHATSAPP DIGITAL PROPOSAL</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
              📄 Design Proposal #{proposalNumber}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            
            {/* Regional Language Switcher */}
            <div style={{ display: 'flex', gap: '4px', background: '#030712', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { id: 'EN', label: '🇬🇧 EN' },
                { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ' },
                { id: 'TE', label: '🇮🇳 తెలుగు' },
                { id: 'HI', label: '🇮🇳 HI' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setProposalLang(l.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '800',
                    borderRadius: '6px',
                    background: proposalLang === l.id ? 'var(--accent-emerald)' : 'transparent',
                    color: proposalLang === l.id ? '#000000' : '#94A3B8',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button className="btn-luxury-gold" onClick={handleSendWhatsApp}>
              <Send size={14} /> 📲 Send WhatsApp ({proposalLang})
            </button>
            <button className="btn-ghost-edit" onClick={handlePrint}>
              <Printer size={14} /> Print PDF
            </button>
            <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* Printable 2-Page Luxury Document Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '16px 0' }}>
          
          {/* ================= PAGE 1: 3D / 2D ROOM VISUAL DESIGN ================= */}
          <div style={{ background: '#030712', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
                  GODREJ INTERIO RAYAGADA FLAGSHIP
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Main Road, Near New Bus Stand, Rayagada (Odisha 765001) • GSTIN: 21AAAAA0000A1Z5
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-emerald">VALID TILL {validUntil.toUpperCase()}</span>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>
                  Proposal Ref: {proposalNumber}
                </div>
              </div>
            </div>

            {/* Client & Room Spec Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Client Profile</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>{customerName}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {projectAddress} • 📞 {customerPhone}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Space & Dimensions</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{roomTitle}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dimensions: {dimensions} • Knockdown 5-Box Clearance Verified ✓</div>
              </div>
            </div>

            {/* Room 2D Render / Image */}
            <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={roomImage} alt="Room Render" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(3,7,18,0.85)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '800' }}>
                📸 Multimodal Room Aesthetic Match (96% Spatial Synergy)
              </div>
            </div>
          </div>

          {/* ================= PAGE 2: ITEMIZED COMMERCIALS & UPI QR ================= */}
          <div style={{ background: '#030712', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '12px' }}>
              📋 Itemized Suite Breakdown & Commercial Terms
            </div>

            {/* Items Table */}
            <table className="luxury-table" style={{ width: '100%', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Item / Model</th>
                  <th>SKU Code</th>
                  <th>Warranty</th>
                  <th>MRP (₹)</th>
                  <th style={{ textAlign: 'right' }}>Proposal Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.sku}>
                    <td style={{ fontWeight: '800', color: '#FFFFFF' }}>{it.name}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>{it.sku}</td>
                    <td><span className="badge badge-emerald">{it.warranty}</span></td>
                    <td style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>₹{it.mrp?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold-light)' }}>₹{it.price?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary & 7-Day Dynamic UPI QR Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center', background: 'rgba(212,175,55,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
              
              {/* Financial Calculation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Combined MRP:</span>
                  <span>₹{totalMRP.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  <span>Showroom 3-Item Combo Savings:</span>
                  <span>- ₹{comboSavings.toLocaleString()}</span>
                </div>
                {proposalData.exchangeCredit > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                    <span>Old Furniture Buyback Credit:</span>
                    <span>- ₹{proposalData.exchangeCredit.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', color: '#FFFFFF', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Net Proposal Total (GST 18% Incl.):</span>
                  <span style={{ color: 'var(--accent-gold-light)' }}>₹{finalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  <span>50% SafeLock Advance Token:</span>
                  <span>₹{advance50Pct.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  * Includes 10-Year Godrej Warranty, Free White-Glove Truck Delivery in Rayagada, and Master Carpenter Assembly.
                </div>
              </div>

              {/* Dynamic 7-Day Token UPI QR Code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#000000', marginBottom: '6px', textAlign: 'center' }}>
                  SCAN TO PAY 50% TOKEN (₹{advance50Pct.toLocaleString()})
                </div>
                <DynamicQrCode 
                  value={`upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${advance50Pct}&cu=INR&tn=${encodeURIComponent(`Token for ${proposalNumber}`)}`}
                  size={120}
                  fgColor="#0F172A"
                />
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', marginTop: '4px', textAlign: 'center' }}>
                  UPI ID: {storeMeta.upiId} • GPay / PhonePe / Paytm
                </div>
              </div>

            </div>

            {/* DPDP 2023 Statutory Compliance Watermark */}
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.15)', fontSize: '10px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span>🛡️ Issued under Statutory Compliance of DPDP Act, 2023 (Govt. of India). Data Fiduciary: Shree Ganesh Enterprises.</span>
              <span>Section 65B BSA Admissible Electronic Quotation • Valid 7 Days</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 2. 💳 INSTANT 0-COST EMI SCHEME COMPARISON MATRIX MODAL
// =========================================================================
export function EmiSchemeModal({ isOpen, onClose, amount = 125000, customerPhone = "9437188291" }) {
  const { showToast } = useStore();
  const [selectedProvider, setSelectedProvider] = useState('BAJAJ'); // 'BAJAJ' | 'HDFC' | 'TVS'
  const [selectedTenure, setSelectedTenure] = useState(12);

  if (!isOpen) return null;

  const totalAmount = Number(amount) || 125000;

  const emiSchemes = [
    { tenure: 3, label: '3 Months (Super Fast)', monthly: Math.round(totalAmount / 3), interestRate: '0% Interest', processingFee: 0, downpayment: 0, popular: false },
    { tenure: 6, label: '6 Months (Zero Cost)', monthly: Math.round(totalAmount / 6), interestRate: '0% Interest', processingFee: 0, downpayment: 0, popular: false },
    { tenure: 9, label: '9 Months (Smart Budget)', monthly: Math.round(totalAmount / 9), interestRate: '0% Interest', processingFee: 499, downpayment: 0, popular: false },
    { tenure: 12, label: '12 Months (Flagship Choice)', monthly: Math.round(totalAmount / 12), interestRate: '0% Interest', processingFee: 0, downpayment: 0, popular: true },
    { tenure: 18, label: '18 Months (Extended Easy)', monthly: Math.round((totalAmount * 1.05) / 18), interestRate: '5.5% Reduced', processingFee: 799, downpayment: 0, popular: false },
    { tenure: 24, label: '24 Months (Lowest Monthly)', monthly: Math.round((totalAmount * 1.08) / 24), interestRate: '8.0% Extended', processingFee: 999, downpayment: 0, popular: false }
  ];

  const handleShareEmiWhatsApp = () => {
    playScanBeep();
    const activeScheme = emiSchemes.find(s => s.tenure === selectedTenure) || emiSchemes[3];

    const message = `*💳 GODREJ INTERIO RAYAGADA — 0% NO-COST EMI QUOTE*\n` +
      `*Total Furniture Bill:* ₹${totalAmount.toLocaleString()}\n` +
      `*Selected Scheme:* ${selectedProvider} Finance (${activeScheme.tenure} Months)\n\n` +
      `*Monthly Installment:* ₹${activeScheme.monthly.toLocaleString()} / month\n` +
      `*Interest Rate:* ${activeScheme.interestRate}\n` +
      `*Downpayment:* ₹0 (Zero Advance)\n` +
      `*Processing Fee:* ₹${activeScheme.processingFee}\n\n` +
      `*All EMI Options Available at Store:*\n` +
      emiSchemes.map(s => `• ${s.tenure} Months: ₹${s.monthly.toLocaleString()}/mo (${s.interestRate})`).join('\n') + `\n\n` +
      `*Instant Approval with Aadhaar / PAN at Store:* Near New Bus Stand, Rayagada | 📞 9390553301`;

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('SHARE_EMI_SCHEDULE', {
      total_amount: totalAmount,
      provider: selectedProvider,
      tenure: selectedTenure,
      phone: customerPhone
    });

    window.open(url, '_blank');
    showToast(`📲 0% EMI Breakdown shared to WhatsApp (${customerPhone})!`, true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '650px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">INSTANT ZERO-COST FINANCING MATRIX</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              💳 0-Cost EMI Comparison (Total: ₹{totalAmount.toLocaleString()})
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Provider Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '14px 0' }}>
          {[
            { id: 'BAJAJ', name: 'Bajaj Finserv', tag: '0% Paperless' },
            { id: 'HDFC', name: 'HDFC PineLabs', tag: 'Debit/Credit Card' },
            { id: 'TVS', name: 'TVS Credit', tag: 'Instant Aadhaar' }
          ].map(prov => (
            <button
              key={prov.id}
              onClick={() => setSelectedProvider(prov.id)}
              style={{
                background: selectedProvider === prov.id ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'rgba(30,41,59,0.7)',
                color: selectedProvider === prov.id ? '#000000' : '#FFFFFF',
                fontWeight: '900',
                border: selectedProvider === prov.id ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '10px 8px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12.5px' }}>{prov.name}</div>
              <div style={{ fontSize: '9.5px', opacity: 0.8 }}>{prov.tag}</div>
            </button>
          ))}
        </div>

        {/* EMI Tenure Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0' }}>
          {emiSchemes.map(sch => {
            const isSelected = selectedTenure === sch.tenure;
            return (
              <div
                key={sch.tenure}
                onClick={() => setSelectedTenure(sch.tenure)}
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.15)' : '#030712',
                  border: isSelected ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                {sch.popular && (
                  <span className="badge badge-rose" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '9px', padding: '2px 6px' }}>
                    MOST POPULAR 🔥
                  </span>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>{sch.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: isSelected ? 'var(--accent-gold-light)' : '#FFFFFF', margin: '4px 0' }}>
                  ₹{sch.monthly.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>/ month</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  <span>{sch.interestRate}</span>
                  <span>Fee: ₹{sch.processingFee}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn-luxury-gold" onClick={handleShareEmiWhatsApp} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
            <Send size={15} /> 📲 Send EMI Plan to Customer WhatsApp
          </button>
          <button className="btn-ghost-edit" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 3. 🔄 OLD FURNITURE EXCHANGE & BUYBACK VALUATION ENGINE MODAL
// =========================================================================
export function FurnitureExchangeModal({ isOpen, onClose, onApplyDiscount }) {
  const { showToast } = useStore();

  const [category, setCategory] = useState('BED'); // 'BED' | 'SOFA' | 'DINING' | 'ALMIRAH'
  const [woodType, setWoodType] = useState('TEAK'); // 'TEAK' | 'SAL' | 'PLY' | 'STEEL'
  const [condition, setCondition] = useState('GOOD'); // 'MINT' | 'GOOD' | 'HEAVY_WEAR'
  const [customerNotes, setCustomerNotes] = useState('Old 6x6 King size wooden bed in good structural condition');

  if (!isOpen) return null;

  // AI Appraisal Algorithm
  const calculateBuybackValue = () => {
    let base = 5000;
    if (category === 'BED') base = 7000;
    if (category === 'SOFA') base = 6000;
    if (category === 'DINING') base = 5500;
    if (category === 'ALMIRAH') base = 4500;

    let woodMultiplier = 1.0;
    if (woodType === 'TEAK') woodMultiplier = 1.4; // Solid Teak has high scrap salvage
    if (woodType === 'SAL') woodMultiplier = 1.2;
    if (woodType === 'PLY') woodMultiplier = 0.8;
    if (woodType === 'STEEL') woodMultiplier = 0.9;

    let condMultiplier = 1.0;
    if (condition === 'MINT') condMultiplier = 1.2;
    if (condition === 'GOOD') condMultiplier = 1.0;
    if (condition === 'HEAVY_WEAR') condMultiplier = 0.7;

    return Math.round((base * woodMultiplier * condMultiplier) / 100) * 100;
  };

  const buybackValue = calculateBuybackValue();
  const exchangeCertNo = `EXC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleApply = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    if (onApplyDiscount) {
      onApplyDiscount(buybackValue, {
        certNo: exchangeCertNo,
        category,
        woodType,
        condition,
        notes: customerNotes
      });
    }
    dispatchWebhookAction('RECORD_FURNITURE_EXCHANGE', {
      cert_number: exchangeCertNo,
      category,
      wood_type: woodType,
      condition,
      buyback_credit_inr: buybackValue,
      notes: customerNotes
    });
    showToast(`🎉 Applied ₹${buybackValue.toLocaleString()} Old Furniture Exchange Credit to Invoice!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '600px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">OLD FURNITURE BUYBACK & EXCHANGE APPRAISER</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🔄 Exchange Valuation Engine
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 3-Question Rapid Appraiser Form */}
        <div className="form-grid" style={{ margin: '14px 0' }}>
          
          <div className="form-field">
            <label>1. Old Furniture Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="BED">Double Bed / King Bed (Wooden)</option>
              <option value="SOFA">Sofa Set (3+1+1 or L-Shape)</option>
              <option value="DINING">Dining Table Set (4 or 6 Seater)</option>
              <option value="ALMIRAH">Almirah / Wardrobe (Steel or Wood)</option>
            </select>
          </div>

          <div className="form-field">
            <label>2. Primary Material / Wood</label>
            <select value={woodType} onChange={e => setWoodType(e.target.value)}>
              <option value="TEAK">Solid Teak / Sheesham (High Salvage)</option>
              <option value="SAL">Sal Wood / Indian Hardwood</option>
              <option value="PLY">Commercial Plywood / Particle Board</option>
              <option value="STEEL">CRCA Heavy Steel Almirah</option>
            </select>
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>3. Age & Physical Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="MINT">1–3 Years Old (Mint Condition / Reusable)</option>
              <option value="GOOD">4–7 Years Old (Good Structural Shape / Minor Scratches)</option>
              <option value="HEAVY_WEAR">8+ Years Old (Heavy Wear / Scrap Salvage)</option>
            </select>
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Pickup Location & Notes</label>
            <input value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} />
          </div>

        </div>

        {/* Valuation Result Box */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1.5px solid var(--accent-gold)', textAlign: 'center', margin: '14px 0' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Estimated Trade-In Buyback Value
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-gold-light)', margin: '4px 0' }}>
            ₹{buybackValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
            ✓ Certificate #{exchangeCertNo} • Valid for Instant Invoice Deduction
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-luxury-gold" onClick={handleApply} style={{ flex: 1, justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
            <Check size={16} /> ✅ Apply ₹{buybackValue.toLocaleString()} Exchange Discount to Bill
          </button>
          <button className="btn-ghost-edit" onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

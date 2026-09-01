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
  TrendingDown,
  Copy
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

    const cleanPhone = String(customerPhone || '').replace(/[^0-9]/g, '');
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
        <div className="printable-area" style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '16px 0' }}>
          
          {/* ================= PAGE 1: 3D / 2D ROOM VISUAL DESIGN ================= */}
          <div className="print-page-break-avoid" style={{ background: '#030712', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
          <div className="print-page-break-avoid" style={{ background: '#030712', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
  const [lang, setLang] = useState('EN');

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

  const activeScheme = emiSchemes.find(s => s.tenure === selectedTenure) || emiSchemes[3];

  const generateEmiMessage = () => {
    if (lang === 'OR') {
      return `*💳 ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ୦% ବିନା ସୁଧ EMI ଯୋଜନା*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*ମୋଟ ଫର୍ନିଚର ମୂଲ୍ୟ:* ₹${totalAmount.toLocaleString()}\n` +
        `*ମନୋନୀତ ଫାଇନାନ୍ସ:* ${selectedProvider} Finance (${activeScheme.tenure} ମାସ)\n\n` +
        `💰 *ମାସିକ କିସ୍ତି (EMI):* ₹${activeScheme.monthly.toLocaleString()} / ମାସ\n` +
        `🏷️ *ସୁଧ ହାର:* ${activeScheme.interestRate}\n` +
        `💵 *ଡାଉନ୍ ପେମେଣ୍ଟ:* ₹0 (ଜିରୋ ଅଗ୍ରିମ)\n` +
        `📄 *ପ୍ରୋସେସିଂ ଫି:* ₹${activeScheme.processingFee}\n\n` +
        `📋 *ଅନ୍ୟ ସମସ୍ତ EMI ବିକଳ୍ପ:*\n` +
        emiSchemes.map(s => `• ${s.tenure} ମାସ: ₹${s.monthly.toLocaleString()}/ମାସ (${s.interestRate})`).join('\n') + `\n\n` +
        `👉 *ଆଧାର କାର୍ଡ ଏବଂ PAN ସହିତ ଷ୍ଟୋରରେ ତୁରନ୍ତ ୫ ମିନିଟରେ ଅନୁମୋଦନ!*\n` +
        `*ଶୋ'ରୁମ୍:* ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*💳 గోద్రెజ్ ఇంటీరియో రాయగడ — 0% వడ్డీ లేని EMI కొటేషన్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*మొత్తం ఫర్నిచర్ బిల్లు:* ₹${totalAmount.toLocaleString()}\n` +
        `*ఎంచుకున్న ఫైనాన్స్:* ${selectedProvider} Finance (${activeScheme.tenure} నెలలు)\n\n` +
        `💰 *నెలవారీ వాయిదా (EMI):* ₹${activeScheme.monthly.toLocaleString()} / నెలకు\n` +
        `🏷️ *వడ్డీ రేటు:* ${activeScheme.interestRate}\n` +
        `💵 *డౌన్‌పేమెంట్:* ₹0 (జీరో అడ్వాన్స్)\n` +
        `📄 *ప్రాసెసింగ్ ఫీజు:* ₹${activeScheme.processingFee}\n\n` +
        `📋 *అందుబాటులో ఉన్న EMI ప్లాన్స్:*\n` +
        emiSchemes.map(s => `• ${s.tenure} నెలలు: ₹${s.monthly.toLocaleString()}/నెలకు (${s.interestRate})`).join('\n') + `\n\n` +
        `👉 *ఆధార్ / పాన్ కార్డ్‌తో కేవలం 5 నిమిషాల్లో తక్షణ అనుమతి!*\n` +
        `*షోరూమ్:* న్యూ బస్ స్టాండ్ దగ్గర, రాయగడ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*💳 गोदरेज इंटीरियो रायगड़ा — 0% नो-कॉस्ट EMI कोटेशन*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*कुल फर्नीचर बिल:* ₹${totalAmount.toLocaleString()}\n` +
        `*चयनित फाइनेंस:* ${selectedProvider} Finance (${activeScheme.tenure} महीने)\n\n` +
        `💰 *मासिक किस्त (EMI):* ₹${activeScheme.monthly.toLocaleString()} / महीना\n` +
        `🏷️ *ब्याज दर:* ${activeScheme.interestRate}\n` +
        `💵 *डाउन पेमेंट:* ₹0 (जीरो एडवांस)\n` +
        `📄 *प्रोसेसिंग फीस:* ₹${activeScheme.processingFee}\n\n` +
        `📋 *उपलब्ध EMI विकल्प:*\n` +
        emiSchemes.map(s => `• ${s.tenure} महीने: ₹${s.monthly.toLocaleString()}/माह (${s.interestRate})`).join('\n') + `\n\n` +
        `👉 *आधार और पैन कार्ड के साथ स्टोर पर 5 मिनट में तुरंत अप्रूवल!*\n` +
        `*शोरूम:* न्यू बस स्टैंड के पास, रायगड़ा | 📞 9390553301`;
    }
    return `*💳 GODREJ INTERIO RAYAGADA — 0% NO-COST EMI QUOTE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Total Furniture Bill:* ₹${totalAmount.toLocaleString()}\n` +
      `*Selected Scheme:* ${selectedProvider} Finance (${activeScheme.tenure} Months)\n\n` +
      `💰 *Monthly Installment:* ₹${activeScheme.monthly.toLocaleString()} / month\n` +
      `🏷️ *Interest Rate:* ${activeScheme.interestRate}\n` +
      `💵 *Downpayment:* ₹0 (Zero Advance)\n` +
      `📄 *Processing Fee:* ₹${activeScheme.processingFee}\n\n` +
      `📋 *All EMI Options Available at Store:*\n` +
      emiSchemes.map(s => `• ${s.tenure} Months: ₹${s.monthly.toLocaleString()}/mo (${s.interestRate})`).join('\n') + `\n\n` +
      `👉 *Instant Approval with Aadhaar / PAN at Store (5-Min Paperless)*\n` +
      `*Flagship Store:* Near New Bus Stand, Rayagada | 📞 +91 93905 53301`;
  };

  const handleShareEmiWhatsApp = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    const message = generateEmiMessage();
    const cleanPhone = String(customerPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('SHARE_EMI_SCHEDULE', {
      total_amount: totalAmount,
      provider: selectedProvider,
      tenure: selectedTenure,
      phone: customerPhone,
      language: lang
    });

    window.open(url, '_blank');
    showToast(`📲 0% EMI Breakdown shared to WhatsApp (${customerPhone})!`, true);
  };

  const handleCopyEmi = () => {
    playScanBeep();
    navigator.clipboard.writeText(generateEmiMessage());
    showToast(`📋 Copied 0% EMI Breakdown to clipboard!`);
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

        {/* Provider Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '10px 0' }}>
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
          <button className="btn-ghost-edit" onClick={handleCopyEmi} style={{ flex: 1, justifyContent: 'center' }}>
            <Copy size={14} /> Copy
          </button>
          <button className="btn-luxury-gold" onClick={handleShareEmiWhatsApp} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
            <Send size={15} /> 📲 Send EMI Plan to Customer WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 3. 🔄 OLD FURNITURE EXCHANGE & BUYBACK VALUATION ENGINE MODAL
// =========================================================================
export function FurnitureExchangeModal({ isOpen, onClose, onApplyDiscount, customerPhone = "9437188291", customerName = "Dr. Subhashish Jena" }) {
  const { showToast } = useStore();
  const [exchangeStep, setExchangeStep] = useState(1); // 1: Category & Wood, 2: Condition & Notes, 3: Valuation & Voucher

  const [category, setCategory] = useState('BED'); // 'BED' | 'SOFA' | 'DINING' | 'ALMIRAH'
  const [woodType, setWoodType] = useState('TEAK'); // 'TEAK' | 'SAL' | 'PLY' | 'STEEL'
  const [condition, setCondition] = useState('GOOD'); // 'MINT' | 'GOOD' | 'HEAVY_WEAR'
  const [customerNotes, setCustomerNotes] = useState('Old 6x6 King size wooden bed in good structural condition');
  const [phone, setPhone] = useState(customerPhone);
  const [lang, setLang] = useState('EN');

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

  const generateBuybackMessage = () => {
    if (lang === 'OR') {
      return `*🔄 ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ପୁରୁଣା ଫର୍ନିଚର ଏକ୍ସଚେଞ୍ଜ୍ ସାର୍ଟିଫିକେଟ୍*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*ମାନ୍ୟବର ${customerName}*,\n` +
        `ଆପଣଙ୍କ ପୁରୁଣା ଫର୍ନିଚର ମୂଲ୍ୟାୟନ ସଫଳ ହୋଇଛି ଏବଂ ଆପଣଙ୍କୁ ନୂଆ ଗୋଦ୍ରେଜ୍ ଫର୍ନିଚର କ୍ରୟ ପାଇଁ ଏକ୍ସଚେଞ୍ଜ୍ କ୍ରେଡିଟ୍ ପ୍ରଦାନ କରାଗଲା।\n\n` +
        `📜 *ସାର୍ଟିଫିକେଟ୍ ନଂ:* #${exchangeCertNo}\n` +
        `🪵 *ପୁରୁଣା ସାମଗ୍ରୀ:* ${category === 'BED' ? 'Double Bed (Wooden)' : category === 'SOFA' ? 'Sofa Set' : category === 'DINING' ? 'Dining Table' : 'Almirah'} (${woodType})\n` +
        `🔍 *କଣ୍ଡିସନ୍:* ${condition}\n` +
        `💰 *ଏକ୍ସଚେଞ୍ଜ୍ ରିହାତି ମୂଲ୍ୟ:* *₹${buybackValue.toLocaleString()}*\n\n` +
        `✨ *ଏହି ରିହାତି ଆପଣଙ୍କ ନୂଆ ଗୋଦ୍ରେଜ୍ ମାଷ୍ଟର ସୁଇଟ୍ ବିଲ୍ ରୁ ସିଧାସଳଖ କଟାଯିବ।*\n` +
        `*ଶୋ'ରୁମ୍:* ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*🔄 గోద్రెజ్ ఇంటీరియో రాయగడ — పాత ఫర్నిచర్ ఎక్స్ఛేంజ్ సర్టిఫికేట్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*గౌరవనీయులైన ${customerName}*,\n` +
        `మీ పాత ఫర్నిచర్ ఎక్స్ఛేంజ్ క్రెడిట్ విలువ విజయవంతంగా నిర్ధారించబడింది.\n\n` +
        `📜 *సర్టిఫికేట్ నం:* #${exchangeCertNo}\n` +
        `🪵 *పాత ఫర్నిచర్:* ${category} (${woodType})\n` +
        `🔍 *కండిషన్:* ${condition}\n` +
        `💰 *ఎక్స్ఛేంజ్ డిస్కౌంట్ విలువ:* *₹${buybackValue.toLocaleString()}*\n\n` +
        `✨ *ఈ తగ్గింపు మీ కొత్త గోద్రెజ్ మాస్టర్ బెడ్‌రూమ్ సూట్ బిల్లుపై తక్షణమే వర్తిస్తుంది.*\n` +
        `*షోరూమ్:* న్యూ బస్ స్టాండ్ దగ్గర, రాయగడ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*🔄 गोदरेज इंटीरियो रायगड़ा — पुराना फर्नीचर एक्सचेंज सर्टिफिकेट*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*आदरणीय ${customerName}*,\n` +
        `आपके पुराने फर्नीचर का मूल्यांकन सफलतापूर्वक हो गया है।\n\n` +
        `📜 *सर्टिफिकेट संख्या:* #${exchangeCertNo}\n` +
        `🪵 *पुराना फर्नीचर:* ${category} (${woodType})\n` +
        `🔍 *कंडीशन:* ${condition}\n` +
        `💰 *एक्सचेंज डिस्काउंट वैल्यू:* *₹${buybackValue.toLocaleString()}*\n\n` +
        `✨ *यह छूट आपके नए गोदरेज मास्टर सुइट के बिल से तुरंत घटा दी जाएगी।*\n` +
        `*शोरूम:* न्यू बस स्टैंड के पास, रायगड़ा | 📞 9390553301`;
    }
    return `*🔄 GODREJ INTERIO RAYAGADA — OLD FURNITURE BUYBACK CERTIFICATE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Dear ${customerName}*,\n` +
      `Your old furniture has been appraised and approved for instant trade-in credit.\n\n` +
      `📜 *Certificate Ref:* #${exchangeCertNo}\n` +
      `🪵 *Item Category:* ${category} (${woodType} Material)\n` +
      `🔍 *Physical Condition:* ${condition}\n` +
      `💰 *Instant Buyback Credit Value:* *₹${buybackValue.toLocaleString()}*\n\n` +
      `✨ *This credit will be directly deducted from your new Godrej Master Bedroom Suite Invoice.*\n` +
      `*Flagship Store:* Near New Bus Stand, Rayagada | 📞 +91 93905 53301`;
  };

  const handleApply = (sendWhatsApp = false) => {
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
      notes: customerNotes,
      phone: phone,
      language: lang
    });

    if (sendWhatsApp) {
      const message = generateBuybackMessage();
      const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }

    showToast(`🎉 Applied ₹${buybackValue.toLocaleString()} Old Furniture Exchange Credit to Invoice!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>TRADE-IN APPRAISAL WIZARD</span>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🔄 Old Furniture Exchange Appraiser
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 🧭 LUXURY 3-STEP WIZARD PROGRESS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '12px 0 16px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 🪵 Type & Wood' },
            { step: 2, label: '2. 🔍 Wear & Pick' },
            { step: 3, label: '3. 💰 Certificate' }
          ].map(s => {
            const isActive = exchangeStep === s.step;
            const isDone = exchangeStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setExchangeStep(s.step);
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

        {/* ========================================================================= */}
        {/* 🪵 STEP 1: CATEGORY & MATERIAL SELECTION */}
        {/* ========================================================================= */}
        {exchangeStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                1. Select Old Furniture Category:
              </label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="BED">Double Bed / King Bed (Wooden)</option>
                <option value="SOFA">Sofa Set (3+1+1 or L-Shape)</option>
                <option value="DINING">Dining Table Set (4 or 6 Seater)</option>
                <option value="ALMIRAH">Almirah / Wardrobe (Steel or Wood)</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                2. Select Primary Wood / Core Material:
              </label>
              <select value={woodType} onChange={e => setWoodType(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="TEAK">Solid Teak / Sheesham (High Scrap Salvage)</option>
                <option value="SAL">Sal Wood / Indian Hardwood</option>
                <option value="PLY">Commercial Plywood / Particle Board</option>
                <option value="STEEL">CRCA Heavy Steel Almirah</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setExchangeStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Condition & Pickup ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🔍 STEP 2: WEAR CONDITION & PICKUP ADDRESS */}
        {/* ========================================================================= */}
        {exchangeStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                3. Age & Physical Wear Condition:
              </label>
              <select value={condition} onChange={e => setCondition(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="MINT">1–3 Years Old (Mint Condition / Reusable)</option>
                <option value="GOOD">4–7 Years Old (Good Structural Shape / Minor Scratches)</option>
                <option value="HEAVY_WEAR">8+ Years Old (Heavy Wear / Scrap Salvage)</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                Customer WhatsApp Mobile Number:
              </label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px', fontSize: '13px' }} />
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#CBD5E1' }}>
                Old Furniture Pickup Location & Notes:
              </label>
              <input value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} style={{ padding: '10px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setExchangeStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Type & Wood
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setExchangeStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: View Valuation & Certificate ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 💰 STEP 3: VALUATION CERTIFICATE & WHATSAPP VOUCHER */}
        {/* ========================================================================= */}
        {exchangeStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 4-Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#030712', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                    type="button"
                    className={`btn-ghost-edit ${lang === l.id ? 'badge-gold' : ''}`}
                    onClick={() => setLang(l.id)}
                    style={{ fontSize: '10.5px', padding: '3px 8px' }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Valuation Result Box */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1.5px solid var(--accent-gold)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Estimated Trade-In Buyback Credit Value
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-gold-light)', margin: '4px 0' }}>
                ₹{buybackValue.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                ✓ Certified Certificate #{exchangeCertNo} • Instant Deduction Ready
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button 
                type="button"
                className="btn-ghost-edit" 
                onClick={() => {
                  setExchangeStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-ghost-edit" onClick={() => handleApply(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Apply Discount
              </button>
              <button className="btn-luxury-gold" onClick={() => handleApply(true)} style={{ flex: 1.8, justifyContent: 'center', padding: '10px', fontWeight: '900' }}>
                <Check size={16} /> 📲 Apply & Send WhatsApp
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}


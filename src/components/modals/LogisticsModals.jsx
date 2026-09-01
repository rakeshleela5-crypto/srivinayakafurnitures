import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DynamicQrCode } from '../../utils/qrcodeGenerator';
import { X, Check, Truck, Navigation, Star, Camera, MessageSquare, AlertTriangle, QrCode, Printer, Copy, Send, Share2 } from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function DigitalEpodModal({ isOpen, onClose, stop = {} }) {
  const { submitEpodDelivery, showToast } = useStore();
  const [epodStep, setEpodStep] = useState(1); // 1: OTP & Geotag, 2: Doorstep UPI Settlement, 3: CSAT & Signature Pad
  const [csat, setCsat] = useState(5);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [otpCode, setOtpCode] = useState(stop.Order_ID ? String(stop.Order_ID).replace('ORD-', '') : '8921');
  const [amountCollected, setAmountCollected] = useState(stop.Amount_Due || 78247);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDrawn(false);
    }
  };

  const handleCanvasDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setSignatureDrawn(true);
  };

  const handleSubmit = (sendReceipt = false) => {
    playSuccessChime();
    triggerGoldenConfetti();
    submitEpodDelivery(stop.Order_ID || "ORD-8921", {
      customerName: stop.Customer_Name || "Customer",
      driverName: "Tophan Gouda",
      vehicle: "Tata Ace OD-18-A-1234",
      csat: `${csat}.0 ⭐`,
      geotag: "19.1724° N, 83.4163° E (Rayagada)",
      amountCollected: Number(amountCollected)
    });

    if (sendReceipt && stop.Customer_Phone) {
      const receiptText = `*🏛️ GODREJ INTERIO RAYAGADA — OFFICIAL ePOD DELIVERY RECEIPT*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Dear *${stop.Customer_Name || 'Valued Customer'}*,\n` +
        `Your luxury furniture delivery for Order *#${stop.Order_ID || 'ORD-8921'}* is successfully completed and verified!\n\n` +
        `📦 *Delivered Items:* ${stop.Items || 'Royal Teak Master Suite'}\n` +
        `🚚 *Delivered By:* Tophan Gouda (Tata Ace OD-18-A-1234)\n` +
        `💰 *Doorstep Settlement:* ₹${Number(amountCollected).toLocaleString()} (Settled ✓)\n` +
        `⭐ *Your Rating:* ${csat}.0 / 5.0 Stars\n` +
        `🛡️ *5-Year Digital Warranty:* #WAR-GI-${String(stop.Order_ID || '8921').replace(/[^0-9]/g, '')}\n\n` +
        `👉 *Download Digital Tax Invoice & Warranty Card:*\nhttps://shreeganesh-godrej.web.app/#documents\n\n` +
        `_Thank you for choosing Godrej Interio Rayagada!_ | 📞 +91 93905 53301`;

      const cleanPhone = String(stop.Customer_Phone || '').replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(receiptText)}`, '_blank');
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="badge badge-gold" style={{ fontSize: '10px' }}>
              <Truck size={12} /> DRIVER FIELD DESK
            </div>
            <h3 style={{ margin: '4px 0 0', color: 'var(--accent-gold-light)' }}>
              🚚 Digital ePOD & Delivery Sign-Off ({stop.Order_ID || 'ORD-8921'})
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 🧭 LUXURY 3-STEP WIZARD PROGRESS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '10px 0 14px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 🔒 OTP' },
            { step: 2, label: '2. 📱 UPI QR' },
            { step: 3, label: '3. ✍️ Sign & Bill' }
          ].map(s => {
            const isActive = epodStep === s.step;
            const isDone = epodStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setEpodStep(s.step);
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
        {/* 🔒 STEP 1: OTP & GEOTAG VERIFICATION */}
        {/* ========================================================================= */}
        {epodStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--accent-emerald)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{stop.Customer_Name || 'Dr. Subhashish Jena'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stop.Address || 'Gayatri Nagar Villa, Rayagada'}</div>
                </div>
                <span className="badge badge-emerald">GPS LOCKED 📍</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-emerald)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                🛰️ GeoTag: 19.1724° N, 83.4163° E • Items: {stop.Items || 'Royal Teak Master Suite'}
              </div>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                Enter Customer's 4-Digit Delivery OTP:
              </label>
              <input 
                type="text" 
                value={otpCode} 
                onChange={e => setOtpCode(e.target.value)} 
                style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '18px', letterSpacing: '6px', fontWeight: '900', color: 'var(--accent-gold-light)', padding: '10px' }} 
              />
              <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px', textAlign: 'center' }}>
                (Ask customer to read the 4-digit code from their WhatsApp message)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setEpodStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Doorstep Payment ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📱 STEP 2: DOORSTEP UPI QR SETTLEMENT */}
        {/* ========================================================================= */}
        {epodStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Remaining Doorstep Balance (₹):
              </label>
              <input 
                type="number" 
                value={amountCollected} 
                onChange={e => setAmountCollected(Number(e.target.value))} 
                style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)' }}
              />
            </div>

            {/* 📱 1-Tap Doorstep Dynamic UPI QR Code */}
            <div style={{ background: '#030712', border: '1.5px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  📱 Doorstep Dynamic UPI Collection
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                  ₹{Number(amountCollected).toLocaleString()}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
                  Customer can scan with GPay / PhonePe / Paytm to settle balance instantly.
                </div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DynamicQrCode 
                  value={`upi://pay?pa=9390553301@ybl&pn=Godrej%20Interio%20Rayagada&am=${amountCollected}&cu=INR&tn=Doorstep%20Balance%20${stop.Order_ID || 'ORD-8921'}`}
                  size={64}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setEpodStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: OTP
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setEpodStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Signature & Finish ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ✍️ STEP 3: CSAT RATING & DIGITAL SIGNATURE */}
        {/* ========================================================================= */}
        {epodStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Customer Experience Rating (CSAT):
              </label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', background: '#030712', padding: '8px', borderRadius: '10px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setCsat(star)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                  >
                    {star <= csat ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                  Customer Digital Signature Pad:
                </label>
                <button type="button" onClick={handleClearSignature} style={{ fontSize: '10px', background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontWeight: '700' }}>
                  Clear Signature
                </button>
              </div>
              <canvas 
                ref={canvasRef}
                width={480}
                height={100}
                onMouseDown={(e) => {
                  const ctx = canvasRef.current.getContext('2d');
                  ctx.beginPath();
                  handleCanvasDraw(e);
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleCanvasDraw(e);
                }}
                onTouchMove={handleCanvasDraw}
                style={{ width: '100%', height: '100px', background: '#030712', border: '1.5px dashed rgba(212,175,55,0.4)', borderRadius: '10px', touchAction: 'none' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button 
                type="button"
                className="btn-ghost-edit" 
                onClick={() => {
                  setEpodStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px', fontSize: '11.5px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-emerald" onClick={() => handleSubmit(false)} style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '12px' }}>
                <Check size={14} /> Complete
              </button>
              <button className="btn-luxury-gold" onClick={() => handleSubmit(true)} style={{ flex: 1.8, justifyContent: 'center', padding: '10px', fontSize: '12px', fontWeight: '900' }}>
                <Send size={14} /> 📲 Submit & WhatsApp
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function SmsDispatchModal({ isOpen, onClose, stop = {} }) {
  const { showToast } = useStore();
  const [phone, setPhone] = useState(stop.Customer_Phone || "9390553301");
  const [otp, setOtp] = useState(stop.OTP_Code || "8899");
  const [driver, setDriver] = useState(stop.Driver || "Tophan Gouda (+91 94371 88291)");
  const [vehicle, setVehicle] = useState("Tata Ace (OD-18-A-1234)");
  const [lang, setLang] = useState('EN');

  // Synchronize state dynamically whenever a new customer stop is selected
  useEffect(() => {
    if (isOpen && stop) {
      if (stop.Customer_Phone) setPhone(stop.Customer_Phone);
      if (stop.OTP_Code) setOtp(stop.OTP_Code);
      if (stop.Driver) setDriver(stop.Driver);
    }
  }, [isOpen, stop]);

  if (!isOpen) return null;

  const getCleanWhatsAppPhone = () => {
    let clean = String(phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (clean.startsWith('91') && clean.length > 10) {
      return clean;
    }
    if (clean.length === 10) {
      return `91${clean}`;
    }
    return clean || '919390553301';
  };

  const generateWhatsAppMessage = () => {
    if (lang === 'OR') {
      return `*🚚 ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ଡେଲିଭରୀ ଟ୍ରାକର ଏବଂ OTP*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `ନମସ୍କାର *${stop.Customer_Name || 'ମାନ୍ୟବର ଗ୍ରାହକ'}*!\n` +
        `ଆପଣଙ୍କ ଗୋଦ୍ରେଜ୍ ଫର୍ନିଚର ଅର୍ଡର (#${stop.Order_ID || 'ORD-8921'}) ଆମ ଡ୍ରାଇଭରଙ୍କ ସହ ଡେଲିଭରୀ ପାଇଁ ବାହାରି ସାରିଛି।\n\n` +
        `🚚 *ଡ୍ରାଇଭର:* ${driver}\n` +
        `🚛 *ଗାଡ଼ି:* ${vehicle}\n` +
        `📦 *ସାମଗ୍ରୀ:* ${stop.Items || 'Royal Teak Master Suite'}\n` +
        `🔒 *ଆପଣଙ୍କ ୪-ଡିଜିଟ୍ ଡେଲିଭରୀ OTP:* *${otp}*\n\n` +
        `⚠️ *ବାକ୍ସଗୁଡ଼ିକ ଠିକ୍ ଭାବରେ ଯାଞ୍ଚ କରିବା ପରେ ହିଁ ଡ୍ରାଇଭରଙ୍କ ସହ OTP ସେୟାର କରନ୍ତୁ।*\n\n` +
        `📍 *ଲାଇଭ୍ ଟ୍ରାକିଂ:* https://shreeganesh-godrej.web.app/#logistics\n` +
        `_ଶ୍ରୀ ଗଣେଶ ଏଣ୍ଟରପ୍ରାଇଜେସ୍ ରାୟଗଡ଼ା_ | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*🚚 గోద్రెజ్ ఇంటీరియో రాయగడ — డెలివరీ ట్రాకర్ & OTP*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `నమస్కారం *${stop.Customer_Name || 'గౌరవనీయ కస్టమర్'}*!\n` +
        `మీ గోద్రెజ్ ఫర్నిచర్ ఆర్డర్ (#${stop.Order_ID || 'ORD-8921'}) మా డ్రైవర్‌తో డెలివరీ కోసం బయలుదేరింది.\n\n` +
        `🚚 *డ్రైవర్:* ${driver}\n` +
        `🚛 *వాహనం:* ${vehicle}\n` +
        `📦 *ఐటమ్స్:* ${stop.Items || 'Royal Teak Master Suite'}\n` +
        `🔒 *మీ 4-అంకెల డెలివరీ OTP:* *${otp}*\n\n` +
        `⚠️ *అన్ని బాక్స్‌లు సరిగ్గా ఉన్నాయని నిర్ధారించుకున్న తర్వాత మాత్రమే డ్రైవర్‌కు OTP చెప్పండి.*\n\n` +
        `📍 *లైవ్ ట్రాకింగ్:* https://shreeganesh-godrej.web.app/#logistics\n` +
        `_శ్రీ గణేష్ ఎంటర్‌ప్రైజెస్ రాయగడ_ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*🚚 गोदरेज इंटीरियो रायगड़ा — डिलीवरी ट्रैकर और OTP*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `नमस्ते *${stop.Customer_Name || 'आदरणीय ग्राहक'}*!\n` +
        `आपका गोदरेज फर्नीचर ऑर्डर (#${stop.Order_ID || 'ORD-8921'}) हमारे ड्राइवर के साथ डिलीवरी के लिए निकल चुका है।\n\n` +
        `🚚 *ड्राइवर:* ${driver}\n` +
        `🚛 *गाड़ी:* ${vehicle}\n` +
        `📦 *सामान:* ${stop.Items || 'Royal Teak Master Suite'}\n` +
        `🔒 *आपका 4-अंकीय डिलीवरी OTP:* *${otp}*\n\n` +
        `⚠️ *कृपया सभी कार्टन बॉक्स की जांच करने के बाद ही ड्राइवर को OTP बताएं।*\n\n` +
        `📍 *लाइव ट्रैकिंग:* https://shreeganesh-godrej.web.app/#logistics\n` +
        `_श्री गणेश एंटरप्राइजेज रायगड़ा_ | 📞 9390553301`;
    }
    return `*🚚 GODREJ INTERIO RAYAGADA — LIVE DELIVERY TRACKER & OTP*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Namaste *${stop.Customer_Name || 'Valued Customer'}*!\n` +
      `Your Godrej furniture order (#${stop.Order_ID || 'ORD-8921'}) is out for delivery with our fleet driver.\n\n` +
      `🚚 *Driver:* ${driver}\n` +
      `🚛 *Vehicle:* ${vehicle}\n` +
      `📦 *Scheduled Items:* ${stop.Items || 'Royal Teak Master Suite'}\n` +
      `🔒 *Your 4-Digit Delivery Verification OTP:* *${otp}*\n\n` +
      `⚠️ *Please share this OTP with the driver ONLY after physically inspecting all carton boxes at your doorstep.*\n\n` +
      `📍 *Live Delivery Status:* https://shreeganesh-godrej.web.app/#logistics\n` +
      `_Shree Ganesh Enterprises (Godrej Interio Rayagada)_ | 📞 +91 93905 53301`;
  };

  const handleSendWhatsApp = (e) => {
    playSuccessChime();
    triggerGoldenConfetti();

    const message = generateWhatsAppMessage();
    const formattedPhone = getCleanWhatsAppPhone();
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('DISPATCH_DELIVERY_OTP', {
      order_id: stop.Order_ID || "ORD-8921",
      customer_name: stop.Customer_Name || "Customer",
      phone: formattedPhone,
      otp_code: otp,
      driver: driver,
      vehicle: vehicle,
      channel: 'WHATSAPP_LIVE',
      language: lang
    });

    try {
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = whatsappUrl;
      }
    } catch (err) {
      window.location.href = whatsappUrl;
    }

    showToast(`📲 Dispatched Live WhatsApp Delivery OTP to +${formattedPhone}!`, true);
    onClose();
  };

  const handleCopyText = () => {
    playScanBeep();
    navigator.clipboard.writeText(generateWhatsAppMessage());
    showToast(`📋 Copied Delivery OTP Message to clipboard!`);
  };

  const targetWhatsAppUrl = `https://wa.me/${getCleanWhatsAppPhone()}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid #25D366' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-emerald">📲 WHATSAPP DELIVERY DISPATCH</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🚚 Dispatch Live Tracking & 4-Digit OTP
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
            <label>Customer WhatsApp Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Secure 4-Digit Delivery OTP</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} style={{ fontFamily: 'JetBrains Mono', fontWeight: '900', textAlign: 'center', fontSize: '16px', letterSpacing: '4px', color: 'var(--accent-gold-light)' }} />
          </div>
          <div className="form-field">
            <label>Assigned Fleet Driver</label>
            <input value={driver} onChange={e => setDriver(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Vehicle Plate No</label>
            <input value={vehicle} onChange={e => setVehicle(e.target.value)} />
          </div>
        </div>

        <div style={{ background: '#030712', padding: '12px 14px', borderRadius: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '10px 0', border: '1px solid rgba(37,211,102,0.2)' }}>
          <strong style={{ color: '#25D366' }}>💬 Live WhatsApp Message Preview:</strong>
          <div style={{ marginTop: '4px', color: '#E2E8F0', whiteSpace: 'pre-line' }}>
            {generateWhatsAppMessage().substring(0, 180)}...
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost-edit" onClick={handleCopyText} style={{ flex: 1, justifyContent: 'center' }}>
            <Copy size={14} /> Copy
          </button>
          <a 
            href={targetWhatsAppUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleSendWhatsApp} 
            className="btn-emerald" 
            style={{ flex: 2, justifyContent: 'center', padding: '12px', textDecoration: 'none', color: '#FFFFFF', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={16} /> 📲 Send WhatsApp Live OTP & Tracker
          </a>
        </div>
      </div>
    </div>
  );
}


export function EditFleetDriverModal({ isOpen, onClose, driver = {} }) {
  const { drivers, setDrivers, showToast } = useStore();
  const [name, setName] = useState(driver.Name || '');
  const [phone, setPhone] = useState(driver.Phone || '');
  const [vehicle, setVehicle] = useState(driver.Vehicle || 'Tata Ace (OD-18-A-1234)');
  const [route, setRoute] = useState(driver.Route || 'Rayagada Town & Gayatri Nagar');

  if (!isOpen) return null;

  const handleSave = () => {
    if (driver.Driver_ID) {
      setDrivers(prev => prev.map(d => d.Driver_ID === driver.Driver_ID ? { ...d, Name: name, Phone: phone, Vehicle: vehicle, Route: route } : d));
    } else {
      const newD = {
        Driver_ID: `DRV-0${drivers.length + 1}`,
        Name: name || "New Driver",
        Phone: phone || "9437000000",
        Vehicle: vehicle,
        Route: route,
        Capacity_KG: "1200 kg",
        Status: "AVAILABLE_DOCK",
        CSAT: "5.0 ⭐"
      };
      setDrivers([...drivers, newD]);
    }
    showToast(`Driver profile updated!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🚚 {driver.Driver_ID ? `Edit Driver ${driver.Name}` : '➕ Add New Fleet Driver'}</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Driver Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tophan Gouda" />
          </div>
          <div className="form-field">
            <label>Driver Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9437155667" />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Vehicle Make & Plate Number</label>
            <input value={vehicle} onChange={e => setVehicle(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assigned Delivery Route Sector</label>
            <input value={route} onChange={e => setRoute(e.target.value)} />
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Save Driver Record
        </button>
      </div>
    </div>
  );
}

export function WarehouseWallPosterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3><Printer size={18} color="var(--accent-gold)" /> Warehouse Inward Wall Poster (Printable QR)</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            GODREJ INTERIO RAYAGADA FLAGSHIP
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '4px' }}>
            CENTRAL WAREHOUSE INWARD UNLOADING DOCK
          </div>
          
          <div style={{ display: 'inline-block', padding: '20px', background: '#F8FAFC', border: '3px dashed #000000', borderRadius: '16px', margin: '24px 0' }}>
            <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '12px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DynamicQrCode value="https://shreeganesh-godrej.web.app/#inward" size={180} fgColor="#000000" />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', marginTop: '12px', color: '#000000' }}>
              SCAN TO LAUNCH DOCK INWARD SCANNER APP
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#334155', maxWidth: '440px', margin: '0 auto', lineHeight: '1.4' }}>
            Staff Instruction: Scan this wall poster with your phone camera upon factory truck arrival. Inspect all 5 component boxes before signing gate-pass.
          </div>
        </div>

        <button className="btn-luxury-gold no-print" onClick={() => window.print()} style={{ width: '100%', justifyContent: 'center' }}>
          <Printer size={16} /> Print Wall Poster (A4 Sheet)
        </button>
      </div>
    </div>
  );
}

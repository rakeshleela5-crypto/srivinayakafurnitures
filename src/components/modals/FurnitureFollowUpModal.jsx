import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Send, 
  Clock, 
  Gift, 
  Calendar, 
  ShieldCheck, 
  Globe, 
  DollarSign, 
  Check, 
  Lock, 
  Smartphone, 
  HelpCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function FurnitureFollowUpModal({ isOpen, onClose, lead = {} }) {
  const { showToast } = useStore();

  const customerName = lead.Customer_Name || "Dr. Subhashish Jena";
  const customerPhone = lead.Customer_Phone || "9437188291";
  const sku = lead.Interested_SKU || "BED-MOD-001";
  const productName = lead.Product_Name || "Solid Teak King Bed (Hydraulic)";
  const listMrp = lead.Budget_INR || 111000;
  const standardFestivePrice = Math.round(listMrp * 0.81);

  // 1. Hesitation Reason
  const [hesitationReason, setHesitationReason] = useState('FAMILY_CONSULT');
  
  // 2. Free Gift Add-ons
  const [freePillows, setFreePillows] = useState(true);
  const [freeProtector, setFreeProtector] = useState(true);
  const [freeFitting, setFreeFitting] = useState(true);
  const [freeCoffeeTable, setFreeCoffeeTable] = useState(false);

  // 3. Delay Timer
  const [delayDays, setDelayDays] = useState(2);
  const [customDate, setCustomDate] = useState('02-Sep-2026');

  // 4. Director Spot Discount
  const [extraSpotDiscount, setExtraSpotDiscount] = useState(3000);
  const [directorPin, setDirectorPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  // 5. Regional Language Switcher
  const [language, setLanguage] = useState('EN');

  if (!isOpen) return null;

  const floorPrice = Math.round(listMrp * 0.70); // Absolute floor 30% off
  const finalDiscountedPrice = standardFestivePrice - (pinVerified ? extraSpotDiscount : 0);
  const totalSavings = listMrp - finalDiscountedPrice;

  const handleVerifyPin = () => {
    if (directorPin === '8899') {
      setPinVerified(true);
      playSuccessChime();
      showToast("🔓 Director PIN 8899 Verified! Spot discount applied.", true);
    } else {
      showToast("❌ Invalid Director PIN. Enter 8899.", false);
    }
  };

  // Multilingual dynamic message generator
  const getFollowUpMessage = (lang) => {
    let giftsText = [];
    if (freePillows) giftsText.push("2x Ortho Memory Foam Pillows (₹3,600 Value - FREE)");
    if (freeProtector) giftsText.push("Waterproof Mattress Protector (₹2,200 Value - FREE)");
    if (freeFitting) giftsText.push("Free Master Mistri Hydraulic Assembly (₹1,500 Value - FREE)");
    if (freeCoffeeTable) giftsText.push("Solid Teak Coffee Table (FREE)");
    const giftsJoined = giftsText.join(' + ');

    switch(lang) {
      case 'OR': // Odia
        return `🙏 *ନମସ୍କାର ${customerName}! ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା ପକ୍ଷରୁ ସ୍ୱାଗତ!*\n` +
          `✨ ଆପଣ ଦେଖିଥିବା *${productName} (${sku})* ପାଇଁ ସ୍ୱତନ୍ତ୍ର ୪୮-ଘଣ୍ଟା ଫେଷ୍ଟିଭ୍ ଅଫର:\n\n` +
          `💰 *ଲିଷ୍ଟ୍ MRP:* ₹${listMrp.toLocaleString()}\n` +
          `⚡ *ସ୍ୱତନ୍ତ୍ର ଅଫର ମୂଲ୍ୟ:* ₹${finalDiscountedPrice.toLocaleString()} (ସଞ୍ଚୟ: ₹${totalSavings.toLocaleString()})\n` +
          (giftsJoined ? `🎁 *ମାଗଣା ଉପହାର:* ${giftsJoined}\n` : '') +
          `🛡️ *ୱାରେଣ୍ଟି:* ୧୦ ବର୍ଷ ସୁରକ୍ଷିତ ଗୋଦ୍ରେଜ୍ ୱାରେଣ୍ଟି + ମାଗଣା ଡେଲିଭରୀ!\n\n` +
          `👉 *୩D କ୍ୟାଟାଲଗ୍ ଓ ୫୦% ଅଗ୍ରିମ ବୁକିଂ:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *ଶୋ'ରୁମ୍ ହଟଲାଇନ୍:* +91 9390553301 | ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା`;

      case 'TE': // Telugu
        return `🙏 *నమస్కారం ${customerName}! గోద్రెజ్ ఇంటీరియో రాయగడ స్వాగతం!*\n` +
          `✨ మీరు చూసిన *${productName} (${sku})* పై ప్రత్యేక 48-గంటల ఆఫర్:\n\n` +
          `💰 *లిస్ట్ MRP:* ₹${listMrp.toLocaleString()}\n` +
          `⚡ *స్పెషల్ ఫెస్టివ్ ధర:* ₹${finalDiscountedPrice.toLocaleString()} (ఆదా: ₹${totalSavings.toLocaleString()})\n` +
          (giftsJoined ? `🎁 *ఉచిత బహుమతులు:* ${giftsJoined}\n` : '') +
          `🛡️ *వారంటీ:* 10 సంవత్సరాల వారంటీ + ఉచిత ఫిట్టింగ్ & డెలివరీ!\n\n` +
          `👉 *3D రూమ్ రెండర్స్ చూడండి:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *డైరెక్టర్ డెస్క్:* +91 9390553301 | రాయగడ మెయిన్ రోడ్`;

      case 'HI': // Hindi
        return `🙏 *नमस्ते ${customerName}! गोदरेज इंटीरियो रायगड़ा में आपका स्वागत है!*\n` +
          `✨ आपके पसंदीदा *${productName} (${sku})* पर विशेष 48-घंटे का फेस्टिव ऑफर:\n\n` +
          `💰 *MRP:* ₹${listMrp.toLocaleString()}\n` +
          `⚡ *फेस्टिव ऑफर मूल्य:* ₹${finalDiscountedPrice.toLocaleString()} (कुल बचत: ₹${totalSavings.toLocaleString()})\n` +
          (giftsJoined ? `🎁 *मुफ्त उपहार:* ${giftsJoined}\n` : '') +
          `🛡️ *वारंटी:* 10 वर्ष की पूर्ण गोदरेज वारंटी + फ्री फिटिंग!\n\n` +
          `👉 *3D कैटलॉग और टोकन बुकिंग:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *शोरूम:* +91 9390553301 | न्यू बस स्टैंड के पास, रायगड़ा`;

      default: // English
        return `✨ *GODREJ INTERIO RAYAGADA — 48-HOUR EXCLUSIVE VIP OFFER*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Dear *${customerName}*, thank you for visiting our flagship showroom!\n\n` +
          `🛋️ *Product:* ${productName} (${sku})\n` +
          `💰 *List MRP:* ₹${listMrp.toLocaleString()}\n` +
          `⚡ *Special Festive Price:* ₹${finalDiscountedPrice.toLocaleString()} (Save ₹${totalSavings.toLocaleString()})\n` +
          (giftsJoined ? `🎁 *Complimentary Bonus Gifts:* ${giftsJoined}\n` : '') +
          `🛡️ *Coverage:* 10-Year Comprehensive Warranty + Free Hydraulic Master Fitting\n\n` +
          `👉 *View 3D Room Suite Renders & Lock Token:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *Director VIP Desk:* +91 9390553301 | Main Road, Rayagada`;
    }
  };

  const handleScheduleDrip = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const scheduleDate = delayDays === 'CUSTOM' ? customDate : `${delayDays} Days Later`;

    dispatchWebhookAction('SCHEDULE_SMART_FURNITURE_FOLLOWUP', {
      customer_name: customerName,
      customer_phone: customerPhone,
      sku: sku,
      product_name: productName,
      hesitation_reason: hesitationReason,
      delay_days: delayDays,
      scheduled_date: scheduleDate,
      free_gifts: {
        pillows: freePillows,
        protector: freeProtector,
        fitting: freeFitting,
        table: freeCoffeeTable
      },
      spot_discount_inr: pinVerified ? extraSpotDiscount : 0,
      final_offer_price: finalDiscountedPrice,
      language: language,
      auto_cancel_on_token: true,
      timestamp: new Date().toISOString()
    });

    showToast(`⏳ 48-Hour Smart Follow-Up scheduled for ${customerName} in ${language === 'OR' ? 'ଓଡ଼ିଆ' : language === 'TE' ? 'తెలుగు' : language === 'HI' ? 'हिंदी' : 'English'}! Auto-cancels if token is paid.`, true);
    onClose();
  };

  const handleSendDirectorTest = () => {
    playScanBeep();
    const cleanPhone = "9390553301";
    const msg = getFollowUpMessage(language);
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast(`🧪 Test follow-up message in ${language} dispatched to Director Rakesh (+91 93905 53301)!`, true);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">🛋️ SMART FURNITURE FOLLOW-UP ENGINE</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              ⏳ 48-Hour High-Conversion Furniture Drip Manager
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
              Target: <b>{customerName}</b> ({customerPhone}) • Interested In: <b>{productName}</b> ({sku})
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 1. Hesitation Reason */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
            1. 🎯 Why did the customer not purchase today? (Auto-tailors Day 2 pitch):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' }}>
            {[
              { id: 'MEASURING_ROOM', title: '📐 Needs Room Measurement', desc: 'Sends 3D dimensions & doorway fitment guide' },
              { id: 'FAMILY_CONSULT', title: '👨‍👩‍👧 Consulting Family / Wife', desc: 'Sends 3D room renders & teak wood polish HD photos' },
              { id: 'BUDGET_EMI', title: '💳 Budget / EMI Hesitation', desc: 'Sends 0% No-Cost EMI calculator & Old Bed exchange credit' },
              { id: 'WEDDING_GRIHA', title: '👑 Wedding / Griha Pravesh Planning', desc: 'Sends 5-room suite bundler & free gift pillows' }
            ].map(r => (
              <div 
                key={r.id}
                onClick={() => setHesitationReason(r.id)}
                style={{
                  background: hesitationReason === r.id ? 'rgba(212,175,55,0.15)' : '#030712',
                  border: hesitationReason === r.id ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: hesitationReason === r.id ? 'var(--accent-gold-light)' : '#FFFFFF' }}>{r.title}</div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Free Gift Sweeteners */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            2. 🎁 Complimentary Free Gifts & Add-Ons (Sweetens the Deal):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#030712', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={freePillows} onChange={e => setFreePillows(e.target.checked)} />
              <span>2x Ortho Memory Foam Pillows (₹3,600 - <b>FREE</b>)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#030712', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={freeProtector} onChange={e => setFreeProtector(e.target.checked)} />
              <span>Waterproof Mattress Protector (₹2,200 - <b>FREE</b>)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#030712', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={freeFitting} onChange={e => setFreeFitting(e.target.checked)} />
              <span>Master Mistri Hydraulic Fitting (₹1,500 - <b>FREE</b>)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#030712', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={freeCoffeeTable} onChange={e => setFreeCoffeeTable(e.target.checked)} />
              <span>Solid Teak Coffee Table (<b>FREE with Suite</b>)</span>
            </label>
          </div>
        </div>

        {/* 3. Delay Timer & 4. Spot Discount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '14px 0' }}>
          <div className="form-field">
            <label style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>3. ⏳ Follow-Up Delay Window</label>
            <select value={delayDays} onChange={e => setDelayDays(e.target.value)}>
              <option value={1}>24 Hours (Next Day 6:00 PM Evening Walk-In)</option>
              <option value={2}>48 Hours (2 Days — Standard Follow-Up)</option>
              <option value={5}>5 Days (Weekend Closing Push)</option>
              <option value="CUSTOM">Custom Date (Pre-Griha Pravesh)</option>
            </select>
          </div>

          <div className="form-field">
            <label style={{ color: '#F43F5E', fontWeight: '800' }}>4. 🏷️ Extra Spot Discount (PIN 8899 Protected)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="number" 
                value={extraSpotDiscount} 
                disabled={!pinVerified}
                onChange={e => setExtraSpotDiscount(Number(e.target.value))} 
                style={{ opacity: pinVerified ? 1 : 0.6 }}
              />
              {!pinVerified ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="password" 
                    maxLength={4} 
                    placeholder="PIN 8899" 
                    value={directorPin} 
                    onChange={e => setDirectorPin(e.target.value)} 
                    style={{ width: '75px', textAlign: 'center' }} 
                  />
                  <button className="btn-ghost-edit" onClick={handleVerifyPin} style={{ padding: '4px 8px', fontSize: '10.5px' }}>
                    Unlock
                  </button>
                </div>
              ) : (
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>✓ Unlocked</span>
              )}
            </div>
          </div>
        </div>

        {/* 5. Language Switcher */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
            5. 🌐 Customer Regional Language (Odia / Telugu / Hindi / English):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
            {[
              { id: 'EN', label: '🇬🇧 English' },
              { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ (Odia)' },
              { id: 'TE', label: '🇮🇳 తెలుగు (Telugu)' },
              { id: 'HI', label: '🇮🇳 हिंदी (Hindi)' }
            ].map(l => (
              <button 
                key={l.id}
                className={`btn-ghost-edit ${language === l.id ? 'badge-emerald' : ''}`}
                onClick={() => setLanguage(l.id)}
                style={{ fontSize: '11.5px', padding: '8px 6px', textAlign: 'center', fontWeight: '800' }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Message Preview */}
        <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(212,175,55,0.3)', margin: '14px 0' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '4px' }}>
            💬 Live WhatsApp Message Preview ({language}):
          </div>
          <pre style={{ fontSize: '11.5px', color: '#E2E8F0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.5 }}>
            {getFollowUpMessage(language)}
          </pre>
        </div>

        {/* Auto-Cancel Assurance Badge */}
        <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>
            <b>7. 🛑 Smart Auto-Cancel Active:</b> If {customerName} pays a 50% advance token on Day 1 or Day 2, all pending messages are automatically cancelled!
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-cyan" onClick={handleSendDirectorTest} style={{ justifyContent: 'center', padding: '12px' }}>
            <Smartphone size={16} /> 🧪 Send Test to Director (+91 93905 53301)
          </button>
          <button className="btn-luxury-gold" onClick={handleScheduleDrip} style={{ justifyContent: 'center', padding: '12px' }}>
            <Send size={16} /> 🚀 Schedule 48h Smart Drip ({language})
          </button>
        </div>

      </div>
    </div>
  );
}

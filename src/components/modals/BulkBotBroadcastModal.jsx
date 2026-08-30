import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Send, 
  Users, 
  Sparkles, 
  Bot, 
  Globe, 
  Calendar, 
  Clock, 
  Check, 
  FileText, 
  Upload, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function BulkBotBroadcastModal({ isOpen, onClose }) {
  const { inquiries, orders, architects, showToast } = useStore();

  const [selectedSegment, setSelectedSegment] = useState('HOT_LEADS');
  const [selectedBotId, setSelectedBotId] = useState('BOT-07');
  const [language, setLanguage] = useState('EN');
  const [enableDrip, setEnableDrip] = useState(true);
  const [customCsvFile, setCustomCsvFile] = useState(null);
  const [customCount, setCustomCount] = useState(500);

  if (!isOpen) return null;

  const bots = [
    { id: 'BOT-07', name: 'Bot 07: 📢 Festive WhatsApp VIP Broadcast Bot', desc: 'Dispatches Diwali festive markdown & free pillow gift bundles' },
    { id: 'BOT-12', name: 'Bot 12: 🧼 Godrej Care™ 6-Month AMC Deep-Clean Reminder', desc: 'Triggers automated sofa foam vacuuming & teak polish booking' },
    { id: 'BOT-05', name: 'Bot 05: 🚚 Morning Delivery Window & Driver Gate Pass', desc: 'Sends live driver GPS, truck plate & delivery time slot' },
    { id: 'BOT-14', name: 'Bot 14: 📉 48-Hour Floor Clearance Markdown Flash Alert', desc: 'Broadcasts 20% to 35% flash markdowns on >90 day inventory' },
    { id: 'BOT-08', name: 'Bot 08: 🛡️ Post-Assembly CSAT & 5-Year Digital Warranty', desc: 'Issues official Godrej warranty card after mistri QC sign-off' },
    { id: 'BOT-03', name: 'Bot 03: ⏳ 48-Hour Token Hold Expiry Warning Bot', desc: 'Alerts customer that item reservations expire in 12 hours' }
  ];

  const segments = {
    HOT_LEADS: { name: '🔥 Hot Walk-In Leads (90%+ Intent)', count: 124, source: 'Inquiries_Log' },
    WEDDING_VILLAS: { name: '👑 Wedding & Villa Suite Inquiries', count: 48, source: 'Inquiries_Log' },
    ACTIVE_DELIVERIES: { name: '🚚 Active Delivery Orders (Today)', count: 18, source: 'Orders_SafeLock' },
    VIP_ARCHITECTS: { name: '🏛️ VIP Architects & Interior Designers', count: 28, source: 'Architect_VIPs' },
    CSV_UPLOAD: { name: '📁 Custom CSV / Excel Upload List', count: customCount, source: 'Uploaded Spreadsheet' }
  };

  const currentSegment = segments[selectedSegment];
  const currentBot = bots.find(b => b.id === selectedBotId) || bots[0];

  // Multilingual dynamic message preview
  const getMessageTemplate = (lang) => {
    switch(lang) {
      case 'OR': // Odia
        return `🙏 *ନମସ୍କାର {Customer_Name}! ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା ପକ୍ଷରୁ ସ୍ୱାଗତ!*\n` +
          `✨ ଆପଣଙ୍କ ପାଇଁ ଏକ୍ସକ୍ଲୁସିଭ୍ ଫେଷ୍ଟିଭ୍ ଅଫର:\n` +
          `🛋️ *ସଲିଡ୍ ଟିକ୍ ଖଟ ଓ ସୋଫା ସେଟ୍ ଉପରେ ସ୍ୱତନ୍ତ୍ର ରିହାତି!*\n` +
          `🎁 ସହିତ ପାଆନ୍ତୁ ୨ଟି ଅର୍ଥୋ ମେମୋରୀ ଫୋମ୍ ତକିଆ (ମାଗଣା - ₹୩,୬୦୦ ମୂଲ୍ୟ) + ମାଗଣା ଫିଟିଙ୍ଗ୍!\n\n` +
          `👉 *୩D କ୍ୟାଟାଲଗ୍ ଓ ଇନଭଏସ୍ ଦେଖନ୍ତୁ:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *ଦୋକାନ ହଟଲାଇନ୍:* +91 9390553301 | ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା`;
      case 'TE': // Telugu
        return `🙏 *నమస్కారం {Customer_Name}! గోద్రెజ్ ఇంటీరియో రాయగడ స్వాగతం!*\n` +
          `✨ మీ కోసం ప్రత్యేక పండుగ ఆఫర్లు:\n` +
          `🛋️ *సాలిడ్ టేకు బెడ్ & సోఫా సెట్‌లపై స్పెషల్ డిస్కౌంట్!*\n` +
          `🎁 ఉచితంగా 2 ఆర్థో మెమరీ ఫోమ్ పిల్లోస్ (రూ. 3,600 విలువ - ఉచితం) + ఉచిత ఫిట్టింగ్!\n\n` +
          `👉 *3D క్యాటలాగ్ చూడండి:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *ఫోన్ నంబర్:* +91 9390553301 | రాయగడ మెయిన్ రోడ్`;
      case 'HI': // Hindi
        return `🙏 *नमस्ते {Customer_Name}! गोदरेज इंटीरियो रायगड़ा में आपका स्वागत है!*\n` +
          `✨ आपके घर के लिए विशेष फेस्टिव ऑफर्स:\n` +
          `🛋️ *सॉलिड टीक बेड और सोफा सेट्स पर फ्लैट फेस्टिव डिस्काउंट!*\n` +
          `🎁 साथ ही पाएं 2 ऑर्थो मेमोरी फोम तकिए (₹3,600 मूल्य - बिल्कुल मुफ्त) + फ्री डिलीवरी!\n\n` +
          `👉 *3D रूम कैटलॉग और इनवॉइस देखें:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *शोरूम संपर्क:* +91 9390553301 | न्यू बस स्टैंड के पास, रायगड़ा`;
      default: // English
        return `✨ *GODREJ INTERIO RAYAGADA — VIP CUSTOMER ALERT*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Dear *{Customer_Name}*, thank you for choosing Godrej Interio Rayagada!\n\n` +
          `🛋️ *Exclusive Showcase:* Explore our Solid CP Teak Furniture & Smart Modular Wardrobes.\n` +
          `🎁 *Festive Inclusions:* Complimentary 2x Ortho Memory Foam Pillows (₹3,600 Value - Free) + 10-Year SafeLock Warranty!\n\n` +
          `👉 *View Your 3D Room Suite Renders & Instant Invoice:* https://shreeganesh-godrej.web.app/#concierge\n` +
          `📞 *Director VIP Desk:* +91 9390553301 | Main Road, Rayagada`;
    }
  };

  const handleLaunchBroadcast = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const campaignId = "CAMP-BULK-" + Math.floor(100000 + Math.random() * 900000);

    dispatchWebhookAction('DISPATCH_BULK_BOT_CAMPAIGN', {
      campaign_id: campaignId,
      bot_id: selectedBotId,
      bot_name: currentBot.name,
      target_segment: selectedSegment,
      total_recipients: currentSegment.count,
      language: language,
      enable_drip_scheduler: enableDrip,
      timestamp: new Date().toISOString()
    });

    const sampleUrl = `https://wa.me/919390553301?text=${encodeURIComponent(getMessageTemplate(language).replace('{Customer_Name}', 'Dr. Subhashish Jena'))}`;
    window.open(sampleUrl, '_blank');

    showToast(`🚀 ${currentBot.name} triggered for ${currentSegment.count} customers in ${language === 'OR' ? 'ଓଡ଼ିଆ (Odia)' : language === 'TE' ? 'తెలుగు (Telugu)' : language === 'HI' ? 'हिंदी (Hindi)' : 'English'}! Logged in Google Sheets.`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">📢 AUTONOMOUS BULK BOT DISPATCHER</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              📢 500-Customer Multi-Language Bot Broadcast Engine
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
              Triggers any of the 20 AppSheet Bots across 500+ contacts with dynamic variable interpolation
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Step 1: Select Audience Segment */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
            1. 🎯 Select Target Customer Audience ({currentSegment.count} Recipients):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
            {Object.keys(segments).map(k => (
              <button 
                key={k}
                className={`btn-ghost-edit ${selectedSegment === k ? 'badge-gold' : ''}`}
                onClick={() => setSelectedSegment(k)}
                style={{ fontSize: '11px', padding: '8px 10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <b>{segments[k].name}</b>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>{segments[k].count} Contacts • {segments[k].source}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Target Bot */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            2. 🤖 Select Target Cloud Bot from the 20 AppSheet Bots:
          </label>
          <select 
            value={selectedBotId} 
            onChange={e => setSelectedBotId(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#FFFFFF', marginTop: '6px' }}
          >
            {bots.map(b => (
              <option key={b.id} value={b.id}>{b.name} — {b.desc}</option>
            ))}
          </select>
        </div>

        {/* Step 3: Multi-Language Switcher */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
            3. 🌐 Select Customer Regional Language (Rayagada Multi-Lingual Engine):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
            {[
              { id: 'EN', label: '🇬🇧 English (Standard)' },
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

        {/* Dynamic Template Message Preview */}
        <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(212,175,55,0.3)', margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
              💬 Live Message Template Preview ({language}):
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Dynamic Tags: {'{Customer_Name}'}, {'{SKU}'}, {'{Slot}'}</span>
          </div>
          <pre style={{ fontSize: '11.5px', color: '#E2E8F0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.5 }}>
            {getMessageTemplate(language)}
          </pre>
        </div>

        {/* Step 4: 3-Stage Drip Follow-Up Scheduler Toggle */}
        <div style={{ background: 'rgba(56,189,248,0.08)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(56,189,248,0.3)', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={enableDrip} onChange={e => setEnableDrip(e.target.checked)} />
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                ⏳ Enable Automated 3-Stage WhatsApp Drip Follow-Up Sequence:
              </div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
                Stage 1 (Day 1: Brochure PDF) ➔ Stage 2 (Day 3: 0% EMI Matrix) ➔ Stage 3 (Day 7: Free Pillows Urgency Close)
              </div>
            </div>
          </label>
        </div>

        {/* Action Button */}
        <button className="btn-luxury-gold" onClick={handleLaunchBroadcast} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px' }}>
          <Send size={18} /> 🚀 Launch {currentSegment.count}-Customer Automated Bot Broadcast ({language})
        </button>

      </div>
    </div>
  );
}

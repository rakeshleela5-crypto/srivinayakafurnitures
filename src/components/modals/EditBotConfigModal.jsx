import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Bot, 
  Check, 
  Save, 
  Zap, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  Sliders, 
  Sparkles,
  ShieldCheck,
  Send,
  Truck,
  DollarSign,
  Gift,
  Star,
  FileText,
  Lock,
  Layers,
  Award,
  RefreshCw,
  Percent,
  Building,
  Wrench,
  Package,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function EditBotConfigModal({ isOpen, onClose, bot = {} }) {
  const { updateBotConfig, showToast } = useStore();

  const [botName, setBotName] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [trigger, setTrigger] = useState('');
  const [schedule, setSchedule] = useState('');
  const [targetChannel, setTargetChannel] = useState('');
  const [threshold, setThreshold] = useState('');
  const [language, setLanguage] = useState('EN');

  // Domain controls states
  // 1. Dispatch & Fleet (BOT-01, BOT-03, BOT-04, BOT-05)
  const [vehiclePlate, setVehiclePlate] = useState('Tata Ace (OD-18-A-1234)');
  const [driverAssign, setDriverAssign] = useState('Tophan Gouda (+91 94371 88291)');
  const [loadingBay, setLoadingBay] = useState('Bay 1 (Heavy Solid Teak Dock)');
  const [rainShield, setRainShield] = useState(true);
  const [otpProtection, setOtpProtection] = useState(true);
  const [geotagRadiusKm, setGeotagRadiusKm] = useState(3);

  // 2. Financial & Architect (BOT-06, BOT-07, BOT-14, BOT-20)
  const [tokenPercent, setTokenPercent] = useState(50);
  const [merchantVpa, setMerchantVpa] = useState('9390553301@ybl');
  const [splitTokenLakh, setSplitTokenLakh] = useState(true);
  const [commissionSlab, setCommissionSlab] = useState(8.5);
  const [deductTds, setDeductTds] = useState(true);
  const [payoutMode, setPayoutMode] = useState('INSTANT_UPI');
  const [emiFinancier, setEmiFinancier] = useState('Bajaj Finserv No-Cost 0% EMI');
  const [emiTenureMonths, setEmiTenureMonths] = useState(6);

  // 3. Assembly & Work Order (BOT-09, BOT-13, BOT-15)
  const [carpenterAssign, setCarpenterAssign] = useState('Narayana Mistri (+91 98612 34567)');
  const [assemblyPayout, setAssemblyPayout] = useState(500);
  const [toolChecklist, setToolChecklist] = useState(true);
  const [assemblySlot, setAssemblySlot] = useState('Morning 10:30 AM (Brahma Muhurat)');
  const [staircaseFloor, setStaircaseFloor] = useState('1st Floor (Wide Staircase)');
  const [extraPortersNeeded, setExtraPortersNeeded] = useState(false);
  const [warrantyHologramSerial, setWarrantyHologramSerial] = useState('GODREJ-WARR-2026-8899');
  const [warrantyYears, setWarrantyYears] = useState(10);

  // 4. Inventory, Reorder & Aging (BOT-02, BOT-08, BOT-10, BOT-18)
  const [bufferUnits, setBufferUnits] = useState(2);
  const [factoryPlant, setFactoryPlant] = useState('Godrej Khalapur Main Plant (Maharashtra)');
  const [autoPoQty, setAutoPoQty] = useState(10);
  const [exchangeCategory, setExchangeCategory] = useState('Old Wooden Bed (Teak/Sal)');
  const [buybackCreditAmt, setBuybackCreditAmt] = useState(12000);
  const [inwardQcPassingGrade, setInwardQcPassingGrade] = useState('GRADE_A_PREMIUM');

  // 5. Marketing, CRM, 9 PM Lock & Telemetry (BOT-11, BOT-12, BOT-16, BOT-17, BOT-19)
  const [promoCode, setPromoCode] = useState('RAYAGADA5000');
  const [audienceSegment, setAudienceSegment] = useState('HOT_LEADS');
  const [freePillowsSweetener, setFreePillowsSweetener] = useState(true);
  const [eodCashDrawerTarget, setEodCashDrawerTarget] = useState(45000);
  const [directorPin, setDirectorPin] = useState('8899');
  const [pinVerified, setPinVerified] = useState(false);
  const [hotLeadThresholdScore, setHotLeadThresholdScore] = useState(85);
  const [followUpDelayHours, setFollowUpDelayHours] = useState(48);
  const [monthlyTargetSalesINR, setMonthlyTargetSalesINR] = useState(4500000);

  useEffect(() => {
    if (isOpen && bot) {
      setBotName(bot.name || '');
      setStatus(bot.status || 'ACTIVE');
      setTrigger(bot.trigger || 'On Event');
      setSchedule(bot.schedule || 'Instant Real-Time Webhook');
      setTargetChannel(bot.target || 'WhatsApp Business API + Google Sheets');
      setThreshold(bot.threshold || 'Default Standard Rule');
    }
  }, [isOpen, bot]);

  if (!isOpen || !bot) return null;

  const currentBotId = bot.botId || 'BOT-01';
  const nameLower = (bot.name || '').toLowerCase();

  // Robust domain category resolver (Checks Bot ID and Name keywords)
  const isOrderOrDispatchBot = currentBotId === 'BOT-01' || currentBotId === 'BOT-03' || currentBotId === 'BOT-04' || currentBotId === 'BOT-05' || nameLower.includes('dispatch') || nameLower.includes('order') || nameLower.includes('staging') || nameLower.includes('driver') || nameLower.includes('epod');
  const isArchitectOrFinanceBot = currentBotId === 'BOT-06' || currentBotId === 'BOT-07' || currentBotId === 'BOT-14' || currentBotId === 'BOT-20' || nameLower.includes('architect') || nameLower.includes('commission') || nameLower.includes('upi') || nameLower.includes('emi') || nameLower.includes('finance') || nameLower.includes('settlement');
  const isAssemblyOrWarrantyBot = currentBotId === 'BOT-09' || currentBotId === 'BOT-13' || currentBotId === 'BOT-15' || nameLower.includes('carpenter') || nameLower.includes('mistri') || nameLower.includes('warranty') || nameLower.includes('clearance') || nameLower.includes('stairway') || nameLower.includes('fitment');
  const isInventoryOrReorderBot = currentBotId === 'BOT-02' || currentBotId === 'BOT-08' || currentBotId === 'BOT-10' || currentBotId === 'BOT-18' || nameLower.includes('stock') || nameLower.includes('inventory') || nameLower.includes('autoprocure') || nameLower.includes('buyback') || nameLower.includes('exchange') || nameLower.includes('inward') || nameLower.includes('supplier');
  const isMarketingOrCrmBot = currentBotId === 'BOT-11' || currentBotId === 'BOT-12' || currentBotId === 'BOT-16' || currentBotId === 'BOT-17' || currentBotId === 'BOT-19' || nameLower.includes('festive') || nameLower.includes('broadcast') || nameLower.includes('cash lock') || nameLower.includes('hot lead') || nameLower.includes('target') || nameLower.includes('deduplication');

  const handleVerifyPin = () => {
    if (directorPin === '8899') {
      setPinVerified(true);
      playSuccessChime();
      showToast("🔓 Director PIN 8899 Verified! Settings unlocked.", true);
    } else {
      showToast("❌ Invalid Director PIN. Enter 8899.", false);
    }
  };

  // Generate localized WhatsApp message preview
  const getLocalizedBotPreview = (lang) => {
    if (isArchitectOrFinanceBot) {
      if (nameLower.includes('architect') || currentBotId === 'BOT-07') {
        return lang === 'OR'
          ? `🏛️ *ନମସ୍କାର ଆର୍କିଟେକ୍ଟ୍!* ଆପଣଙ୍କ ରେଫରାଲ୍ କମିଶନ ₹୧୪,୨୦୦ (${commissionSlab}%) ସେକ୍ସନ 194H ୫% TDS କଟି ଆପଣଙ୍କ UPI କୁ କ୍ରେଡିଟ୍ ହୋଇଛି। ଫର୍ମ 16A ରେଡ଼ି ଅଛି।`
          : lang === 'TE'
          ? `🏛️ *నమస్కారం ఆర్కిటెక్ట్!* మీ రిఫెరల్ కమిషన్ ₹14,200 (${commissionSlab}%) 5% TDS తగ్గింపుతో మీ UPI కి జమ చేయబడింది. ఫారం 16A సిద్ధంగా ఉంది.`
          : `🏛️ *VIP ARCHITECT INSTANT PAYOUT — GODREJ INTERIO RAYAGADA*\nCommission: ₹14,200 (${commissionSlab}%) credited via ${payoutMode}. 5% TDS under Sec 194H deducted. Form 16A generated.`;
      }
      if (nameLower.includes('emi') || currentBotId === 'BOT-14') {
        return `💳 *0% NO-COST EMI SCHEME APPROVED*\nFinancier: ${emiFinancier} | Tenure: ${emiTenureMonths} Months | Zero Down Payment | Monthly EMI: ₹6,520.`;
      }
      return `📱 *GODREJ INTERIO 50% ADVANCE TOKEN INVOICE*\nCustomer: Dr. Subhashish Jena | Payable: ₹45,000 (${tokenPercent}% Token)\nUPI VPA: ${merchantVpa} | Zero Gateway Fee ✓`;
    }

    if (isAssemblyOrWarrantyBot) {
      if (nameLower.includes('warranty') || currentBotId === 'BOT-15') {
        return `🛡️ *OFFICIAL ${warrantyYears}-YEAR GODREJ DIGITAL WARRANTY CERTIFICATE*\nHologram Serial: ${warrantyHologramSerial} | 5-Point Assembly QC Verified by Master Mistri ✓.`;
      }
      if (nameLower.includes('carpenter') || currentBotId === 'BOT-09') {
        return `🪚 *MASTER MISTRI ASSEMBLY DISPATCH*\nCarpenter: ${carpenterAssign} | Slot: ${assemblySlot}\nWork Order: 5-Box Solid Teak Bed Hydraulic Assembly. Payout Token: ₹${assemblyPayout} (Cash on QC Sign-off).`;
      }
      return `📐 *ROOM FITMENT & STAIRWAY CLEARANCE PASS*\nDelivery Floor: ${staircaseFloor} | 100% Knockdown 5-Box Assembly Guarantee Verified.`;
    }

    if (isInventoryOrReorderBot) {
      if (nameLower.includes('buyback') || currentBotId === 'BOT-10') {
        return `🔄 *OLD FURNITURE TRADE-IN CERTIFICATE*\nCategory: ${exchangeCategory} | Buyback Credit: ₹${buybackCreditAmt.toLocaleString()} applied to your new bill + Free Doorstep Scrap Disposal!`;
      }
      return `⚠️ *AUTOPROCURE FACTORY REORDER ALERT*\nSKU: BED-MOD-001 at ${bufferUnits} Units (Below Safe Buffer). Auto-PO generated for ${autoPoQty} Units from ${factoryPlant}.`;
    }

    if (isMarketingOrCrmBot) {
      if (nameLower.includes('cash lock') || currentBotId === 'BOT-12') {
        return `🔒 *GODREJ INTERIO RAYAGADA — 9:00 PM DAILY CASH CLOSING SLIP*\nTotal Gross Sales: ₹1,69,000 | Cash in Safe: ₹45,000 | UPI Settled: ₹1,24,000 | Zero Discrepancy ✓ | Director PIN: 8899.`;
      }
      if (nameLower.includes('festive') || currentBotId === 'BOT-11') {
        return lang === 'OR'
          ? `✨ *ରାୟଗଡ଼ା ଗୋଦ୍ରେଜ୍ ଫେଷ୍ଟିଭ୍ ଧମାକା!* ପ୍ରୋମୋ କୋଡ୍ ${promoCode} ବ୍ୟବହାର କରି ପାଆନ୍ତୁ ଫ୍ଲାଟ୍ ₹୫,୦୦୦ ରିହାତି + ୨ଟି ଅର୍ଥୋ ପିଲୋ ମାଗଣା!`
          : `✨ *FESTIVE TEAK UTSAV — GODREJ INTERIO RAYAGADA*\nUse Promo Code *${promoCode}* for instant flat discount + 2x Free Ortho Memory Foam Pillows!`;
      }
      return `🔥 *HOT LEAD 48-HOUR FOLLOW-UP ALERT*\nCustomer: Dr. Subhashish Jena | AI Intent Score: ${hotLeadThresholdScore}% | Follow-Up Delay: ${followUpDelayHours}h.`;
    }

    // Default Order / Dispatch
    return lang === 'OR' 
      ? `🚚 *ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ଅର୍ଡର ଡେଲିଭରୀ ବାହାରିଲା*\nଅର୍ଡର #ORD-101 ର ୫/୫ ବକ୍ସ ${vehiclePlate} ରେ ଲୋଡ୍ ହୋଇଛି। ଡ୍ରାଇଭର: ${driverAssign}। ୱାଟରପ୍ରୁଫ୍ ସିଲ୍ ସୁରକ୍ଷିତ ✓।`
      : lang === 'TE'
      ? `🚚 *గోద్రెజ్ ఇంటీరియో రాయగడ — డెలివరీ బయలుదేరింది*\nఆర్డర్ #ORD-101 యొక్క 5/5 బాక్సులు ${vehiclePlate} లో లోడ్ అయ్యాయి. డ్రైవర్: ${driverAssign}।`
      : `🚚 *GODREJ INTERIO RAYAGADA — OUT FOR DELIVERY*\nOrder #ORD-101 (5/5 Boxes Staged) is loaded into ${vehiclePlate}. Driver: ${driverAssign}. Loading Bay: ${loadingBay}.`;
  };

  const handleSave = () => {
    const updated = {
      ...bot,
      name: botName,
      status: status,
      trigger: trigger,
      schedule: schedule,
      targetChannel: targetChannel,
      threshold: threshold,
      domainConfig: {
        language,
        vehiclePlate,
        driverAssign,
        commissionSlab,
        assemblyPayout,
        bufferUnits,
        tokenPercent,
        promoCode,
        merchantVpa,
        emiFinancier
      }
    };

    if (updateBotConfig) {
      updateBotConfig(currentBotId, updated);
    }

    playSuccessChime();
    triggerGoldenConfetti();

    dispatchWebhookAction('UPDATE_BOT_CONFIG', {
      bot_id: currentBotId,
      name: botName,
      status: status,
      trigger: trigger,
      schedule: schedule,
      channel: targetChannel,
      threshold: threshold,
      preview_sample: getLocalizedBotPreview(language),
      updated_by: "Store Director (PIN 8899)",
      timestamp: new Date().toISOString()
    });

    showToast(`⚙️ Successfully updated and synchronized Domain Controls for ${currentBotId} (${botName})!`, true);
    onClose();
  };

  const handleSendDirectorTest = () => {
    playScanBeep();
    const cleanPhone = "9390553301";
    const msg = getLocalizedBotPreview(language);
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast(`🧪 Test payload for ${currentBotId} in ${language} dispatched to Director Rakesh (+91 93905 53301)!`, true);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-card glass-panel" 
        style={{ 
          maxWidth: '780px', 
          width: '95%', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          border: '2px solid var(--accent-gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
          padding: '24px',
          background: '#0B132B'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', border: '1.5px solid var(--accent-gold)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={28} style={{ color: 'var(--accent-gold-light)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold">{currentBotId}</span>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  {botName || bot.name}
                </h2>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--accent-cyan)', margin: '4px 0 0 0' }}>
                ⚡ <b>Trigger:</b> {trigger} • ⏱️ <b>Schedule:</b> {schedule}
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Master Status Switcher */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>Bot Automation Operational Status</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Toggle this bot active or pause automation temporarily</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setStatus('ACTIVE')}
              className={`badge ${status === 'ACTIVE' ? 'badge-emerald' : ''}`}
              style={{ padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: '900' }}
            >
              🟢 ACTIVE
            </button>
            <button
              type="button"
              onClick={() => setStatus('PAUSED')}
              className={`badge ${status === 'PAUSED' ? 'badge-amber' : ''}`}
              style={{ padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: '900' }}
            >
              ⏸️ PAUSED
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DYNAMIC DOMAIN CONTROLS SECTION (100% GUARANTEED MATCH)                     */}
        {/* ========================================================================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sliders size={14} /> Specialized Furniture Retail Domain Controls:
          </label>

          {/* 1. DISPATCH, FLEET & EPOD BOTS */}
          {isOrderOrDispatchBot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Assigned Delivery Vehicle</label>
                <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)}>
                  <option value="Tata Ace (OD-18-A-1234)">Tata Ace (OD-18-A-1234) — 1.5 Ton</option>
                  <option value="Mahindra Bolero Pickup (OD-18-B-5678)">Mahindra Bolero (OD-18-B-5678) — 2.0 Ton</option>
                </select>
              </div>
              <div className="form-field">
                <label>Driver & Contact Phone</label>
                <input value={driverAssign} onChange={e => setDriverAssign(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Loading Dock Bay</label>
                <select value={loadingBay} onChange={e => setLoadingBay(e.target.value)}>
                  <option value="Bay 1 (Heavy Solid Teak Dock)">Bay 1 (Heavy Solid Teak Dock)</option>
                  <option value="Bay 2 (Modular Wardrobe Flatpack)">Bay 2 (Modular Wardrobe Flatpack)</option>
                  <option value="Bay 3 (Express Same-Day Drops)">Bay 3 (Express Same-Day Drops)</option>
                </select>
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <input type="checkbox" checked={rainShield} onChange={e => setRainShield(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: '#93C5FD' }}>🌧️ Heavy Rain / Monsoon Weather Wrap Active</span>
              </div>
            </div>
          )}

          {/* 2. ARCHITECT, COMMISSION & FINANCE BOTS */}
          {isArchitectOrFinanceBot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Architect Commission Slab: <b>{commissionSlab}%</b></label>
                <input type="range" min="5.0" max="15.0" step="0.5" value={commissionSlab} onChange={e => setCommissionSlab(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Payout Settlement Channel</label>
                <select value={payoutMode} onChange={e => setPayoutMode(e.target.value)}>
                  <option value="INSTANT_UPI">Instant IMPS / UPI to Architect VPA</option>
                  <option value="NEFT_BANK_TRANSFER">NEFT Commercial Bank Account</option>
                </select>
              </div>
              <div className="form-field">
                <label>Merchant UPI VPA</label>
                <input value={merchantVpa} onChange={e => setMerchantVpa(e.target.value)} />
              </div>
              <div className="form-field">
                <label>0% EMI Financing Partner</label>
                <select value={emiFinancier} onChange={e => setEmiFinancier(e.target.value)}>
                  <option value="Bajaj Finserv No-Cost 0% EMI">Bajaj Finserv (Instant Approval)</option>
                  <option value="HDFC Bank EasyEMI">HDFC Bank EasyEMI</option>
                  <option value="IDFC First Bank Consumer Finance">IDFC First Bank</option>
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={deductTds} onChange={e => setDeductTds(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>Mandatory 5% TDS under Section 194H + Form 16A Digital Tax Invoice</span>
              </div>
            </div>
          )}

          {/* 3. ASSEMBLY, MISTRI & WARRANTY BOTS */}
          {isAssemblyOrWarrantyBot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Assigned Master Carpenter</label>
                <input value={carpenterAssign} onChange={e => setCarpenterAssign(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Assembly Payout Rate (₹): <b>₹{assemblyPayout}</b></label>
                <input type="number" step="100" value={assemblyPayout} onChange={e => setAssemblyPayout(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Preferred Assembly Slot</label>
                <select value={assemblySlot} onChange={e => setAssemblySlot(e.target.value)}>
                  <option value="Morning 10:30 AM (Brahma Muhurat)">Morning 10:30 AM (Brahma Muhurat)</option>
                  <option value="Afternoon 03:00 PM">Afternoon 03:00 PM</option>
                  <option value="Evening 06:30 PM">Evening 06:30 PM</option>
                </select>
              </div>
              <div className="form-field">
                <label>Warranty Coverage: <b>{warrantyYears} Years</b></label>
                <input type="range" min="5" max="15" step="1" value={warrantyYears} onChange={e => setWarrantyYears(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={toolChecklist} onChange={e => setToolChecklist(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: '#CBD5E1' }}>Hydraulic Allen Key & Spirit Level Tool Kit Verified ✓ (Mistri QC Certified)</span>
              </div>
            </div>
          )}

          {/* 4. INVENTORY, REORDER & BUYBACK BOTS */}
          {isInventoryOrReorderBot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Minimum Safe Buffer Threshold: <b>{bufferUnits} Units</b></label>
                <input type="range" min="1" max="10" value={bufferUnits} onChange={e => setBufferUnits(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Factory Source Plant</label>
                <select value={factoryPlant} onChange={e => setFactoryPlant(e.target.value)}>
                  <option value="Godrej Khalapur Main Plant (Maharashtra)">Godrej Khalapur Main Plant</option>
                  <option value="Godrej Bhagwanpur Plant (Roorkee)">Godrej Bhagwanpur Plant</option>
                  <option value="Godrej Shirwal Plant (Pune)">Godrej Shirwal Plant</option>
                </select>
              </div>
              <div className="form-field">
                <label>Old Item Trade-In Category</label>
                <select value={exchangeCategory} onChange={e => setExchangeCategory(e.target.value)}>
                  <option value="Old Wooden Bed (Teak/Sal)">Old Wooden Bed (Teak / Sal)</option>
                  <option value="Old 3+1+1 Sofa Set">Old 3+1+1 Sofa Set</option>
                  <option value="Old Steel Almirah">Old Steel Almirah</option>
                </select>
              </div>
              <div className="form-field">
                <label>Buyback Credit Allowance (₹)</label>
                <input type="number" value={buybackCreditAmt} onChange={e => setBuybackCreditAmt(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* 5. MARKETING, CRM, 9 PM CASH LOCK & TELEMETRY BOTS */}
          {isMarketingOrCrmBot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Festive Promo Code</label>
                <input value={promoCode} onChange={e => setPromoCode(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Audience Target Segment</label>
                <select value={audienceSegment} onChange={e => setAudienceSegment(e.target.value)}>
                  <option value="HOT_LEADS">🔥 124 Hot Walk-In Leads (90%+ Intent)</option>
                  <option value="WEDDING_VILLAS">👑 48 Wedding & Villa Couples</option>
                  <option value="VIP_ARCHITECTS">🏛️ 28 Registered VIP Designers</option>
                  <option value="500_CSV">📁 500 Offline Customer Phonebook</option>
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>Director Authorization PIN (To Unlock Sub-MRP / Register Locks)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="password" maxLength={4} value={directorPin} onChange={e => setDirectorPin(e.target.value)} placeholder="PIN 8899" style={{ width: '120px', textAlign: 'center' }} />
                  <button type="button" className="btn-ghost-edit" onClick={handleVerifyPin}>{pinVerified ? '✓ Verified' : 'Verify PIN'}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4-LANGUAGE SWITCHER & DYNAMIC WHATSAPP PREVIEW                            */}
        {/* ========================================================================= */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            🌐 Customer Regional Language Preview (Odia / Telugu / Hindi / English):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
                onClick={() => setLanguage(l.id)}
                style={{ fontSize: '11.5px', padding: '6px 4px', textAlign: 'center', fontWeight: '800' }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic WhatsApp Preview Panel */}
        <div style={{ background: '#030712', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '4px' }}>
            💬 Live WhatsApp Message Preview ({language}):
          </div>
          <pre style={{ fontSize: '11.5px', color: '#E2E8F0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.5 }}>
            {getLocalizedBotPreview(language)}
          </pre>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button 
            type="button"
            className="btn-cyan" 
            onClick={handleSendDirectorTest}
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            <Smartphone size={16} /> 🧪 Send Test to Director (+91 93905 53301)
          </button>
          
          <button 
            type="button"
            className="btn-luxury-gold" 
            onClick={handleSave}
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            <Save size={16} /> 💾 Save & Sync to Google Sheets
          </button>
        </div>

      </div>
    </div>
  );
}

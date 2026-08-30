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
  Building
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

  // Domain-specific state variables
  // BOT-01 (SafeLock Dispatch)
  const [vehiclePlate, setVehiclePlate] = useState('Tata Ace (OD-18-A-1234)');
  const [driverAssign, setDriverAssign] = useState('Tophan Gouda (+91 94371 88291)');
  const [loadingBay, setLoadingBay] = useState('Bay 1 (Heavy Solid Teak Dock)');
  const [rainShield, setRainShield] = useState(true);

  // BOT-03 (VIP Architect)
  const [commissionSlab, setCommissionSlab] = useState(8.5);
  const [deductTds, setDeductTds] = useState(true);
  const [payoutMode, setPayoutMode] = useState('INSTANT_UPI');

  // BOT-04 (Mistri Assembly)
  const [carpenterAssign, setCarpenterAssign] = useState('Narayana Mistri (+91 98612 34567)');
  const [assemblyPayout, setAssemblyPayout] = useState(500);
  const [toolChecklist, setToolChecklist] = useState(true);
  const [assemblySlot, setAssemblySlot] = useState('Morning 10:30 AM');

  // BOT-05 (Low Stock Reorder)
  const [bufferUnits, setBufferUnits] = useState(2);
  const [factoryPlant, setFactoryPlant] = useState('Godrej Khalapur Main Plant');
  const [autoPoQty, setAutoPoQty] = useState(10);

  // BOT-06 (Doorstep UPI Token)
  const [tokenPercent, setTokenPercent] = useState(50);
  const [splitTokenLakh, setSplitTokenLakh] = useState(true);
  const [merchantVpa, setMerchantVpa] = useState('9390553301@ybl');

  // BOT-07 (Festive VIP Broadcast)
  const [promoCode, setPromoCode] = useState('RAYAGADA5000');
  const [audienceSegment, setAudienceSegment] = useState('HOT_LEADS');
  const [freePillowsSweetener, setFreePillowsSweetener] = useState(true);

  // BOT-08 (5-Star CSAT)
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://g.page/r/godrej-interio-rayagada/review');
  const [rewardVoucherAmt, setRewardVoucherAmt] = useState(500);
  const [alertDirectorLowRating, setAlertDirectorLowRating] = useState(true);

  // BOT-09 (DPDP Privacy)
  const [retentionYears, setRetentionYears] = useState(7);
  const [allowOneClickDelete, setAllowOneClickDelete] = useState(true);

  // BOT-10 (GPS Live ETA)
  const [proximityAlertKm, setProximityAlertKm] = useState(5);
  const [includeDriverCall, setIncludeDriverCall] = useState(true);

  // BOT-11 (Abandoned 3D Cart)
  const [abandonDelayHours, setAbandonDelayHours] = useState(24);
  const [freeSweetenerItem, setFreeSweetenerItem] = useState('Solid Teak Side Stool (₹2,500 - FREE)');

  // BOT-12 (Godrej Care AMC)
  const [amcPlanPrice, setAmcPlanPrice] = useState(2999);
  const [amcVisitsCount, setAmcVisitsCount] = useState(3);

  // BOT-13 (1-Box Replacement)
  const [damagedBoxNo, setDamagedBoxNo] = useState('Box 3/5 (Headboard & Hydraulic Cylinder)');
  const [claimPolicy, setClaimPolicy] = useState('ZERO_COST_RAPID_DISPATCH');

  // BOT-14 (Aging Stock Flash)
  const [agingDaysThreshold, setAgingDaysThreshold] = useState(90);
  const [flashDiscountPct, setFlashDiscountPct] = useState(35);
  const [directorPin, setDirectorPin] = useState('8899');
  const [pinVerified, setPinVerified] = useState(false);

  // BOT-15 (Wedding Suite Concierge)
  const [weddingSuiteTier, setWeddingSuiteTier] = useState('Gold Royal Teak (₹4.89 Lakhs)');
  const [muhuratHour, setMuhuratHour] = useState('06:30 AM (Brahma Muhurat)');

  // BOT-17 (Exchange Buyback)
  const [exchangeCategory, setExchangeCategory] = useState('Old Wooden Bed (Teak/Sal)');
  const [buybackCreditAmt, setBuybackCreditAmt] = useState(12000);

  // BOT-18 (B2B Turnkey)
  const [b2bClientName, setB2bClientName] = useState('State Bank of India — Rayagada Zonal Office');
  const [b2bVolumeDiscount, setB2bVolumeDiscount] = useState(18);

  // BOT-19 (5-Yr Warranty)
  const [warrantyHologramSerial, setWarrantyHologramSerial] = useState('GODREJ-WARR-2026-8899');

  // BOT-20 (0% No-Cost EMI)
  const [emiFinancier, setEmiFinancier] = useState('Bajaj Finserv No-Cost 0% EMI');
  const [emiTenureMonths, setEmiTenureMonths] = useState(6);

  useEffect(() => {
    if (isOpen && bot) {
      setBotName(bot.name || '');
      setStatus(bot.status || 'ACTIVE');
      setTrigger(bot.trigger || 'On New Order');
      setSchedule(bot.schedule || 'Instant Real-Time Webhook');
      setTargetChannel(bot.target || 'WhatsApp Business API + Google Sheets');
      setThreshold(bot.threshold || 'Buffer <= 2 Units');
    }
  }, [isOpen, bot]);

  if (!isOpen || !bot || !bot.botId) return null;

  const currentBotId = bot.botId;

  const handleVerifyPin = () => {
    if (directorPin === '8899') {
      setPinVerified(true);
      playSuccessChime();
      showToast("🔓 Director PIN 8899 Verified! Flash markdown unlocked.", true);
    } else {
      showToast("❌ Invalid Director PIN. Enter 8899.", false);
    }
  };

  // Generate localized WhatsApp message preview based on active bot and language
  const getLocalizedBotPreview = (lang) => {
    switch (currentBotId) {
      case 'BOT-01':
        return lang === 'OR' 
          ? `🚚 *ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ଅର୍ଡର ଡେଲିଭରୀ ବାହାରିଲା*\nଅର୍ଡର #ORD-101 ର ୫/୫ ବକ୍ସ ${vehiclePlate} ରେ ଲୋଡ୍ ହୋଇଛି। ଡ୍ରାଇଭର: ${driverAssign}। ୱାଟରପ୍ରୁଫ୍ ସିଲ୍ ସୁରକ୍ଷିତ ✓।`
          : lang === 'TE'
          ? `🚚 *గోద్రెజ్ ఇంటీరియో రాయగడ — డెలివరీ బయలుదేరింది*\nఆర్డర్ #ORD-101 యొక్క 5/5 బాక్సులు ${vehiclePlate} లో లోడ్ అయ్యాయి. డ్రైవర్: ${driverAssign}।`
          : lang === 'HI'
          ? `🚚 *गोदरेज इंटीरियो रायगड़ा — डिलीवरी डिस्पैच*\nऑर्डर #ORD-101 के सभी 5/5 बॉक्स ${vehiclePlate} में लोड हो चुके हैं। ड्राइवर: ${driverAssign}।`
          : `🚚 *GODREJ INTERIO RAYAGADA — OUT FOR DELIVERY*\nOrder #ORD-101 (5/5 Boxes Staged) is loaded into ${vehiclePlate}. Driver: ${driverAssign}. Loading Bay: ${loadingBay}.`;

      case 'BOT-03':
        return lang === 'OR'
          ? `🏛️ *ନମସ୍କାର ଆର୍କିଟେକ୍ଟ୍!* ଆପଣଙ୍କ ରେଫରାଲ୍ କମିଶନ ₹୧୪,୨୦୦ (${commissionSlab}%) ସେକ୍ସନ 194H ୫% TDS କଟି ଆପଣଙ୍କ UPI କୁ କ୍ରେଡିଟ୍ ହୋଇଛି। ଫର୍ମ 16A ରେଡ଼ି ଅଛି।`
          : `🏛️ *VIP ARCHITECT INSTANT PAYOUT — GODREJ INTERIO RAYAGADA*\nCommission: ₹14,200 (${commissionSlab}%) credited via ${payoutMode}. 5% TDS Form 16A generated.`;

      case 'BOT-04':
        return `🪚 *MASTER MISTRI ASSEMBLY DISPATCH*\nCarpenter: ${carpenterAssign} | Slot: ${assemblySlot}\nWork Order: 5-Box Solid Teak King Bed Hydraulic Assembly. Payout Token: ₹${assemblyPayout} (Cash on QC Sign-off).`;

      case 'BOT-05':
        return `⚠️ *FACTORY REORDER ALERT — STOCK BUFFER DEFICIT*\nSKU: BED-MOD-001 at ${bufferUnits} Units (Below Safe Buffer). Auto-PO generated for ${autoPoQty} Units from ${factoryPlant}.`;

      case 'BOT-06':
        return `📱 *GODREJ INTERIO 50% ADVANCE TOKEN INVOICE*\nCustomer: Dr. Subhashish Jena | Payable: ₹45,000 (50% Token)\nUPI VPA: ${merchantVpa} | Zero Transaction Fee ✓`;

      case 'BOT-07':
        return lang === 'OR'
          ? `✨ *ରାୟଗଡ଼ା ଗୋଦ୍ରେଜ୍ ଫେଷ୍ଟିଭ୍ ଧମାକା!* ପ୍ରୋମୋ କୋଡ୍ ${promoCode} ବ୍ୟବହାର କରି ପାଆନ୍ତୁ ଫ୍ଲାଟ୍ ₹୫,୦୦୦ ରିହାତି + ୨ଟି ଅର୍ଥୋ ପିଲୋ ମାଗଣା!`
          : `✨ *FESTIVE TEAK UTSAV — GODREJ INTERIO RAYAGADA*\nUse Promo Code *${promoCode}* for instant flat discount + 2x Free Ortho Memory Foam Pillows!`;

      case 'BOT-08':
        return `⭐ *HOW WAS YOUR GODREJ INTERIO DELIVERY?*\nRate your 5-Star experience on Google Maps (${googleMapsUrl}) & get an instant ₹${rewardVoucherAmt} Showroom Gift Voucher!`;

      case 'BOT-10':
        return `🚚 *LIVE DELIVERY ETA ALERT*\nYour delivery truck ${vehiclePlate} is within ${proximityAlertKm} KM of your address! Driver: ${driverAssign}. Please keep room pathway clear.`;

      case 'BOT-11':
        return `🛋️ *YOUR 3D ROOM SUITE IS RESERVED!*\nComplete your booking within ${abandonDelayHours} hours and receive a ${freeSweetenerItem}!`;

      case 'BOT-12':
        return `🧼 *GODREJ CARE™ ANNUAL AMC INSPECTION DUE*\nPlan: ₹${amcPlanPrice}/yr (${amcVisitsCount} Deep-Cleaning & Teak Wax Polish Visits). Book your free quarterly slot today!`;

      case 'BOT-13':
        return `📦 *1-BOX RAPID REPLACEMENT APPROVED*\nCarton: ${damagedBoxNo} marked damaged in transit. Express replacement dispatched at zero cost under Godrej Transit Shield!`;

      case 'BOT-14':
        return `📉 *SHOWROOM DISPLAY MODEL FLASH CLEARANCE (>90 DAYS)*\nExclusive ${flashDiscountPct}% Off on showroom display teak units! Director PIN Authorized. Only 2 units remaining.`;

      case 'BOT-15':
        return `👑 *ROYAL WEDDING & VILLA SUITE VIP CONCIERGE*\nPackage: ${weddingSuiteTier} reserved. Auspicious Muhurat Delivery locked for ${muhuratHour} with Priority Master Mistri team!`;

      case 'BOT-17':
        return `🔄 *OLD FURNITURE TRADE-IN CERTIFICATE*\nCategory: ${exchangeCategory} | Buyback Credit: ₹${buybackCreditAmt.toLocaleString()} applied to your new bill + Free Doorstep Scrap Disposal!`;

      case 'BOT-18':
        return `🏢 *INSTITUTIONAL B2B TURNKEY TENDER PROPOSAL*\nClient: ${b2bClientName} | Volume Discount: ${b2bVolumeDiscount}% with 18% GST Input Credit E-Invoice.`;

      case 'BOT-19':
        return `🛡️ *OFFICIAL 5-YEAR GODREJ DIGITAL WARRANTY CERTIFICATE*\nHologram Serial: ${warrantyHologramSerial} | 5-Point Assembly QC Verified by Master Mistri ✓.`;

      case 'BOT-20':
        return `💳 *0% NO-COST EMI FINANCING APPROVED*\nFinancier: ${emiFinancier} | Tenure: ${emiTenureMonths} Months | Zero Down Payment | EMI: ₹6,520/month.`;

      default:
        return `🤖 *${bot.name || 'Godrej Interio Autonomous Bot'}*\nTrigger: ${trigger} | Channel: ${targetChannel} | Threshold: ${threshold}`;
    }
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
        rewardVoucherAmt,
        proximityAlertKm,
        amcPlanPrice,
        flashDiscountPct,
        weddingSuiteTier,
        buybackCreditAmt,
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
                ⚡ <b>Trigger:</b> {trigger} • ⏱️ <b>Timing:</b> {schedule}
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Master Status Switcher */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>Bot Operational State</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Toggle automation execution active or pause temporarily</div>
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
        {/* DYNAMIC DOMAIN CONTROLS BASED ON BOT ID                                    */}
        {/* ========================================================================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sliders size={14} /> Specialized Furniture Domain Controls ({currentBotId}):
          </label>

          {/* BOT-01: SafeLock Dispatch */}
          {currentBotId === 'BOT-01' && (
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

          {/* BOT-03: VIP Architect */}
          {currentBotId === 'BOT-03' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Architect Commission Slab: <b>{commissionSlab}%</b></label>
                <input type="range" min="5.0" max="15.0" step="0.5" value={commissionSlab} onChange={e => setCommissionSlab(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Payout Settlement Mode</label>
                <select value={payoutMode} onChange={e => setPayoutMode(e.target.value)}>
                  <option value="INSTANT_UPI">Instant IMPS / UPI to Architect VPA</option>
                  <option value="NEFT_BANK_TRANSFER">NEFT Commercial Bank Account</option>
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={deductTds} onChange={e => setDeductTds(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>Mandatory 5% TDS under Section 194H + Form 16A Auto-Tax Invoice</span>
              </div>
            </div>
          )}

          {/* BOT-04: Mistri Assembly */}
          {currentBotId === 'BOT-04' && (
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
                  <option value="Morning 10:30 AM">Morning 10:30 AM (Brahma Muhurat)</option>
                  <option value="Afternoon 03:00 PM">Afternoon 03:00 PM</option>
                  <option value="Evening 06:30 PM">Evening 06:30 PM</option>
                </select>
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <input type="checkbox" checked={toolChecklist} onChange={e => setToolChecklist(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: '#CBD5E1' }}>Hydraulic Allen Key & Spirit Level Tool Kit Verified ✓</span>
              </div>
            </div>
          )}

          {/* BOT-05: Factory Reorder */}
          {currentBotId === 'BOT-05' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Minimum Safe Buffer Threshold: <b>{bufferUnits} Units</b></label>
                <input type="range" min="1" max="10" value={bufferUnits} onChange={e => setBufferUnits(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Factory Source Plant</label>
                <select value={factoryPlant} onChange={e => setFactoryPlant(e.target.value)}>
                  <option value="Godrej Khalapur Main Plant">Godrej Khalapur Main Plant (Maharashtra)</option>
                  <option value="Godrej Bhagwanpur Plant">Godrej Bhagwanpur Plant (Roorkee)</option>
                  <option value="Godrej Shirwal Plant">Godrej Shirwal Plant (Pune)</option>
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Auto-PO Reorder Batch Quantity: <b>{autoPoQty} Units</b></label>
                <input type="range" min="5" max="50" step="5" value={autoPoQty} onChange={e => setAutoPoQty(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* BOT-06: UPI Token */}
          {currentBotId === 'BOT-06' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Token Requirement: <b>{tokenPercent}% Advance</b></label>
                <input type="range" min="20" max="100" step="10" value={tokenPercent} onChange={e => setTokenPercent(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Merchant UPI VPA</label>
                <input value={merchantVpa} onChange={e => setMerchantVpa(e.target.value)} />
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={splitTokenLakh} onChange={e => setSplitTokenLakh(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>Split into two 50/50 payment links if amount exceeds ₹1,00,000 (Bypasses Bank Daily Limits)</span>
              </div>
            </div>
          )}

          {/* BOT-07: Festive Broadcast */}
          {currentBotId === 'BOT-07' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Festive Promo Code</label>
                <input value={promoCode} onChange={e => setPromoCode(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Target Audience Segment</label>
                <select value={audienceSegment} onChange={e => setAudienceSegment(e.target.value)}>
                  <option value="HOT_LEADS">🔥 124 Hot Walk-In Leads (90%+ Intent)</option>
                  <option value="WEDDING_VILLAS">👑 48 Wedding & Villa Couples</option>
                  <option value="VIP_ARCHITECTS">🏛️ 28 Registered VIP Designers</option>
                  <option value="500_CSV">📁 500 Offline Customer Phonebook</option>
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={freePillowsSweetener} onChange={e => setFreePillowsSweetener(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-gold-light)' }}>Include 2x Free Ortho Memory Foam Pillows (₹3,600 Value) in campaign headline</span>
              </div>
            </div>
          )}

          {/* BOT-08: 5-Star CSAT */}
          {currentBotId === 'BOT-08' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Google Maps Showroom Review URL</label>
                <input value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} />
              </div>
              <div className="form-field">
                <label>5-Star Review Reward Voucher (₹)</label>
                <input type="number" value={rewardVoucherAmt} onChange={e => setRewardVoucherAmt(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <input type="checkbox" checked={alertDirectorLowRating} onChange={e => setAlertDirectorLowRating(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: '#F43F5E' }}>Instant Director SMS alert if rating &lt; 4 Stars</span>
              </div>
            </div>
          )}

          {/* BOT-10: GPS Live ETA */}
          {currentBotId === 'BOT-10' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Proximity Proactive Alert Distance: <b>{proximityAlertKm} KM</b></label>
                <input type="range" min="1" max="15" value={proximityAlertKm} onChange={e => setProximityAlertKm(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <input type="checkbox" checked={includeDriverCall} onChange={e => setIncludeDriverCall(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-cyan)' }}>Include Driver Direct WhatsApp Call Button</span>
              </div>
            </div>
          )}

          {/* BOT-11: Abandoned Cart */}
          {currentBotId === 'BOT-11' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Abandonment Delay Trigger: <b>{abandonDelayHours} Hours</b></label>
                <input type="range" min="12" max="72" step="12" value={abandonDelayHours} onChange={e => setAbandonDelayHours(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Sweetener Gift Item</label>
                <input value={freeSweetenerItem} onChange={e => setFreeSweetenerItem(e.target.value)} />
              </div>
            </div>
          )}

          {/* BOT-12: Godrej Care AMC */}
          {currentBotId === 'BOT-12' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Annual AMC Plan Price (₹)</label>
                <input type="number" value={amcPlanPrice} onChange={e => setAmcPlanPrice(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Annual Service Visits</label>
                <select value={amcVisitsCount} onChange={e => setAmcVisitsCount(Number(e.target.value))}>
                  <option value={3}>3 Quarterly Visits (Deep-Clean + Wax Polish)</option>
                  <option value={4}>4 Quarterly Visits (Full Hydraulic Servicing)</option>
                </select>
              </div>
            </div>
          )}

          {/* BOT-13: 1-Box Replacement */}
          {currentBotId === 'BOT-13' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Damaged Box Selector</label>
                <select value={damagedBoxNo} onChange={e => setDamagedBoxNo(e.target.value)}>
                  <option value="Box 1/5 (Base Plank)">Box 1/5 (Base Plank & Footboard)</option>
                  <option value="Box 2/5 (Side Rails)">Box 2/5 (Solid Teak Side Rails)</option>
                  <option value="Box 3/5 (Headboard & Hydraulic Cylinder)">Box 3/5 (Headboard & Hydraulic Cylinder)</option>
                  <option value="Box 4/5 (Slats & Hardware)">Box 4/5 (Slats & Hardware)</option>
                  <option value="Box 5/5 (Mattress & Cushion)">Box 5/5 (Mattress & Cushion)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Claim Insurance Policy</label>
                <select value={claimPolicy} onChange={e => setClaimPolicy(e.target.value)}>
                  <option value="ZERO_COST_RAPID_DISPATCH">Zero-Cost Rapid Dispatch (24 Hours)</option>
                  <option value="FACTORY_TRANSIT_CLAIM">Factory Transit Insurance Claim</option>
                </select>
              </div>
            </div>
          )}

          {/* BOT-14: Aging Stock Flash */}
          {currentBotId === 'BOT-14' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Showroom Aging Threshold: <b>{agingDaysThreshold} Days</b></label>
                <input type="range" min="60" max="180" step="15" value={agingDaysThreshold} onChange={e => setAgingDaysThreshold(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Flash Markdown Discount: <b>{flashDiscountPct}% Off</b></label>
                <input type="range" min="20" max="50" step="5" value={flashDiscountPct} onChange={e => setFlashDiscountPct(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>Director Authorization PIN (To Unlock Sub-MRP Markdown)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="password" maxLength={4} value={directorPin} onChange={e => setDirectorPin(e.target.value)} placeholder="PIN 8899" style={{ width: '120px', textAlign: 'center' }} />
                  <button className="btn-ghost-edit" onClick={handleVerifyPin}>{pinVerified ? '✓ Verified' : 'Verify PIN'}</button>
                </div>
              </div>
            </div>
          )}

          {/* BOT-15: Wedding Suite */}
          {currentBotId === 'BOT-15' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Suite Package Tier</label>
                <select value={weddingSuiteTier} onChange={e => setWeddingSuiteTier(e.target.value)}>
                  <option value="Silver 3-Room Package (₹2.49 Lakhs)">Silver 3-Room Package (₹2.49 Lakhs)</option>
                  <option value="Gold Royal Teak (₹4.89 Lakhs)">Gold Royal Teak 5-Room Suite (₹4.89 Lakhs)</option>
                  <option value="Diamond Villa Luxury (₹8.49 Lakhs)">Diamond Villa Luxury (₹8.49 Lakhs)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Auspicious Muhurat Delivery Lock</label>
                <input value={muhuratHour} onChange={e => setMuhuratHour(e.target.value)} />
              </div>
            </div>
          )}

          {/* BOT-17: Exchange Buyback */}
          {currentBotId === 'BOT-17' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Old Item Trade-In Category</label>
                <select value={exchangeCategory} onChange={e => setExchangeCategory(e.target.value)}>
                  <option value="Old Wooden Bed (Teak/Sal)">Old Wooden Bed (Teak / Sal)</option>
                  <option value="Old 3+1+1 Sofa Set">Old 3+1+1 Sofa Set</option>
                  <option value="Old Steel Almirah">Old Steel Almirah</option>
                </select>
              </div>
              <div className="form-field">
                <label>Instant Buyback Credit (₹)</label>
                <input type="number" value={buybackCreditAmt} onChange={e => setBuybackCreditAmt(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* BOT-18: B2B Commercial */}
          {currentBotId === 'BOT-18' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Institutional Client Name & Branch</label>
                <input value={b2bClientName} onChange={e => setB2bClientName(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Volume Tender Discount: <b>{b2bVolumeDiscount}%</b></label>
                <input type="range" min="10" max="30" value={b2bVolumeDiscount} onChange={e => setB2bVolumeDiscount(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-emerald">18% GST Input Credit Auto-Invoice Active</span>
              </div>
            </div>
          )}

          {/* BOT-19: 5-Year Warranty */}
          {currentBotId === 'BOT-19' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Digital Warranty Hologram Serial Prefix</label>
                <input value={warrantyHologramSerial} onChange={e => setWarrantyHologramSerial(e.target.value)} />
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-cyan">5-Point Assembly QC Checklist & Mistri Digital Stamp Verified ✓</span>
              </div>
            </div>
          )}

          {/* BOT-20: 0% No-Cost EMI */}
          {currentBotId === 'BOT-20' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Financing Partner</label>
                <select value={emiFinancier} onChange={e => setEmiFinancier(e.target.value)}>
                  <option value="Bajaj Finserv No-Cost 0% EMI">Bajaj Finserv (Instant Approval)</option>
                  <option value="HDFC Bank EasyEMI">HDFC Bank EasyEMI (Debit/Credit)</option>
                  <option value="IDFC First Bank Consumer Finance">IDFC First Bank</option>
                </select>
              </div>
              <div className="form-field">
                <label>No-Cost Tenure: <b>{emiTenureMonths} Months</b></label>
                <select value={emiTenureMonths} onChange={e => setEmiTenureMonths(Number(e.target.value))}>
                  <option value={3}>3 Months (0% Interest)</option>
                  <option value={6}>6 Months (0% Interest)</option>
                  <option value={9}>9 Months (0% Interest)</option>
                  <option value={12}>12 Months (0% Interest)</option>
                </select>
              </div>
            </div>
          )}

          {/* BOT-02 or BOT-09 or Default */}
          {(currentBotId === 'BOT-02' || currentBotId === 'BOT-09') && (
            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
              Statutory 21-Table Telemetry & DPDP 2023 Tamper-Proof Audit Lock Active.
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4-LANGUAGE SWITCHER & DYNAMIC WHATSAPP PREVIEW                            */}
        {/* ========================================================================= */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            🌐 Customer Language Preview (Odia / Telugu / Hindi / English):
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

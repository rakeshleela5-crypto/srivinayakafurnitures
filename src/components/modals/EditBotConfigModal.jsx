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
  AlertTriangle,
  Database,
  Target
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

  // Domain states
  const [vehiclePlate, setVehiclePlate] = useState('Tata Ace (OD-18-A-1234)');
  const [driverAssign, setDriverAssign] = useState('Tophan Gouda (+91 94371 88291)');
  const [loadingBay, setLoadingBay] = useState('Bay 1 (Heavy Solid Teak Dock)');
  const [rainShield, setRainShield] = useState(true);
  const [otpProtection, setOtpProtection] = useState(true);
  const [geotagRadiusKm, setGeotagRadiusKm] = useState(3);

  const [tokenPercent, setTokenPercent] = useState(50);
  const [merchantVpa, setMerchantVpa] = useState('9390553301@ybl');
  const [splitTokenLakh, setSplitTokenLakh] = useState(true);
  const [commissionSlab, setCommissionSlab] = useState(8.5);
  const [deductTds, setDeductTds] = useState(true);
  const [payoutMode, setPayoutMode] = useState('INSTANT_UPI');
  const [emiFinancier, setEmiFinancier] = useState('Bajaj Finserv No-Cost 0% EMI');
  const [emiTenureMonths, setEmiTenureMonths] = useState(6);

  const [carpenterAssign, setCarpenterAssign] = useState('Narayana Mistri (+91 98612 34567)');
  const [assemblyPayout, setAssemblyPayout] = useState(500);
  const [toolChecklist, setToolChecklist] = useState(true);
  const [assemblySlot, setAssemblySlot] = useState('Morning 10:30 AM (Brahma Muhurat)');
  const [staircaseFloor, setStaircaseFloor] = useState('1st Floor (Wide Staircase)');
  const [warrantyHologramSerial, setWarrantyHologramSerial] = useState('GODREJ-WARR-2026-8899');
  const [warrantyYears, setWarrantyYears] = useState(10);

  const [bufferUnits, setBufferUnits] = useState(2);
  const [factoryPlant, setFactoryPlant] = useState('Godrej Khalapur Main Plant (Maharashtra)');
  const [autoPoQty, setAutoPoQty] = useState(10);
  const [exchangeCategory, setExchangeCategory] = useState('Old Wooden Bed (Teak/Sal)');
  const [buybackCreditAmt, setBuybackCreditAmt] = useState(12000);
  const [inwardPassingGrade, setInwardPassingGrade] = useState('GRADE_A_PREMIUM');

  const [promoCode, setPromoCode] = useState('RAYAGADA5000');
  const [audienceSegment, setAudienceSegment] = useState('HOT_LEADS');
  const [freePillowsSweetener, setFreePillowsSweetener] = useState(true);
  const [directorPin, setDirectorPin] = useState('8899');
  const [pinVerified, setPinVerified] = useState(false);
  const [hesitationReason, setHesitationReason] = useState('FAMILY_CONSULT');
  const [delayDays, setDelayDays] = useState(2);
  const [monthlyTargetINR, setMonthlyTargetINR] = useState(4500000);

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
    switch (currentBotId) {
      case 'BOT-01':
        return lang === 'OR'
          ? `🔒 *ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ଅର୍ଡର ସୁରକ୍ଷିତ ବୁକିଂ*\nଅର୍ଡର #ORD-101 (Solid Teak King Bed) ସଫଳତାର ସହ SafeLock ହୋଇଛି। ଅଗ୍ରିମ ଟୋକନ୍: ₹୪୫,୦୦୦ (${tokenPercent}%)। ଡେଲିଭରୀ ତାରିଖ: ଆଜି ସନ୍ଧ୍ୟା ୦୪:୩୦।`
          : `🔒 *GODREJ INTERIO RAYAGADA — SAFELOCK ORDER CONFIRMED*\nOrder #ORD-101 (Solid Teak King Bed) is SAFELOCKED. Advance Token: ₹45,000 (${tokenPercent}%). Est Delivery: Today 04:30 PM. Helpline: +91 93905 53301.`;

      case 'BOT-02':
        return `🛡️ *ATOMIC INVENTORY STOCK HOLD ACTIVE*\nSKU: BED-MOD-001 locked for Order #ORD-101. Available Stock decremented to 2 Units. Minimum Buffer: ${bufferUnits} Units.`;

      case 'BOT-03':
        return `📦 *SMARTKIT 5-BOX STAGING GATEPASS*\nLoading Bay: ${loadingBay} | 5/5 Boxes Staged ✓. Monsoon Weather Seal: ${rainShield ? 'ACTIVE ✓' : 'OFF'}. Gatepass Generated.`;

      case 'BOT-04':
        return `🚚 *DELIVERY DRIVER ASSIGNMENT & OTP DISPATCH*\nVehicle: ${vehiclePlate} | Driver: ${driverAssign}\nCustomer Delivery OTP: 8892 | SafeLock Dispatch Validated ✓.`;

      case 'BOT-05':
        return `📍 *DIGITAL ePOD & GPS GEOTAG LOCK*\nGeotag Radius: ${geotagRadiusKm} KM | Customer Signature Captured | Proof uploaded to Google Drive folder 'ePOD_Signatures_2026'.`;

      case 'BOT-06':
        return `📱 *DOORSTEP DYNAMIC UPI QR INVOICE*\nPayable Balance: ₹45,000 (${tokenPercent}% Token) | VPA: ${merchantVpa} | Zero Transaction Fee ✓ | Auto-dispatches instant receipt.`;

      case 'BOT-07':
        return lang === 'OR'
          ? `🏛️ *ନମସ୍କାର ଆର୍କିଟେକ୍ଟ୍!* ଆପଣଙ୍କ ରେଫରାଲ୍ କମିଶନ ₹୧୪,୨୦୦ (${commissionSlab}%) ସେକ୍ସନ 194H ୫% TDS କଟି ଆପଣଙ୍କ UPI କୁ କ୍ରେଡିଟ୍ ହୋଇଛି। ଫର୍ମ 16A ରେଡ଼ି ଅଛି।`
          : `🏛️ *VIP ARCHITECT COMMISSION SETTLED*\nCommission: ₹14,200 (${commissionSlab}%) credited via ${payoutMode}. 5% TDS under Sec 194H deducted. Form 16A generated.`;

      case 'BOT-08':
        return `🏭 *AUTOPROCURE PREDICTIVE LOW-STOCK PO*\nSKU: BED-MOD-001 at ${bufferUnits} Units (Below Safe Buffer). Auto-PO generated for ${autoPoQty} Units from ${factoryPlant}.`;

      case 'BOT-09':
        return `🪚 *MASTER MISTRI ASSEMBLY WORK ORDER*\nCarpenter: ${carpenterAssign} | Slot: ${assemblySlot}\nWork Order: 5-Box Solid Teak Bed Hydraulic Assembly. Payout Token: ₹${assemblyPayout} (Cash on QC Sign-off).`;

      case 'BOT-10':
        return `🔄 *OLD FURNITURE TRADE-IN CERTIFICATE*\nCategory: ${exchangeCategory} | Buyback Credit: ₹${buybackCreditAmt.toLocaleString()} applied to your new bill + Free Doorstep Scrap Disposal!`;

      case 'BOT-11':
        return lang === 'OR'
          ? `✨ *ରାୟଗଡ଼ା ଗୋଦ୍ରେଜ୍ ଫେଷ୍ଟିଭ୍ ଧମାକା!* ପ୍ରୋମୋ କୋଡ୍ ${promoCode} ବ୍ୟବହାର କରି ପାଆନ୍ତୁ ଫ୍ଲାଟ୍ ₹୫,୦୦୦ ରିହାତି + ୨ଟି ଅର୍ଥୋ ପିଲୋ ମାଗଣା!`
          : `✨ *FESTIVE TEAK UTSAV — GODREJ INTERIO RAYAGADA*\nUse Promo Code *${promoCode}* for instant flat discount + 2x Free Ortho Memory Foam Pillows! Target: ${audienceSegment}.`;

      case 'BOT-12':
        return `🔒 *GODREJ INTERIO RAYAGADA — 9:00 PM DAILY CASH CLOSING SLIP*\nTotal Gross Sales: ₹1,69,000 | Cash in Safe: ₹45,000 | UPI Settled: ₹1,24,000 | Zero Discrepancy ✓ | Director PIN: 8899.`;

      case 'BOT-13':
        return `📐 *ROOM FITMENT & STAIRWAY CLEARANCE PASS*\nDelivery Floor: ${staircaseFloor} | 100% Knockdown 5-Box Assembly Guarantee Verified by Master Mistri.`;

      case 'BOT-14':
        return `💳 *0% NO-COST EMI FINANCING APPROVED*\nFinancier: ${emiFinancier} | Tenure: ${emiTenureMonths} Months | Zero Down Payment | Monthly EMI: ₹6,520.`;

      case 'BOT-15':
        return `🛡️ *OFFICIAL ${warrantyYears}-YEAR GODREJ DIGITAL WARRANTY CERTIFICATE*\nHologram Serial: ${warrantyHologramSerial} | 5-Point Assembly QC Verified by Master Mistri ✓.`;

      case 'BOT-16':
        return `🔥 *HOT LEAD 48-HOUR SMART FURNITURE DRIP*\nCustomer: Dr. Subhashish Jena | Hesitation Reason: ${hesitationReason} | Follow-Up Delay: ${delayDays} Days (48 Hours) | Auto-cancels on advance token.`;

      case 'BOT-17':
        return `⚙️ *UNIVERSAL 21-TABLE DEDUPLICATION BOT*\nHourly Cron Active | Deduplicated Primary Keys across Orders_SafeLock, Inventory_Stock, Inquiries_Log. Zero collisions.`;

      case 'BOT-18':
        return `📦 *SUPPLIER SHIPMENT INWARD QC GATEPASS*\nInspection Result: ${inwardPassingGrade} ✓ | 50 Units Solid Teak Staged to Warehouse Inward Dock.`;

      case 'BOT-19':
        return `📊 *SHOWROOM MONTHLY SALES PACER*\nTarget: ₹${(monthlyTargetINR / 100000).toFixed(1)} Lakhs | Achieved: ₹38.45 Lakhs (85.4% on track) | Projected: ₹46.2 Lakhs.`;

      case 'BOT-20':
        return `⚡ *MASTER GOOGLE APPS SCRIPT 2-WAY SYNC*\nStatus: HTTP 200 OK | Sub-100ms Push-Pull Synchronization active across all 22 Google Sheets tables.`;

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
        merchantVpa,
        emiFinancier,
        warrantyYears,
        buybackCreditAmt,
        monthlyTargetINR
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
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>Bot Operational Status</div>
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
        {/* EXACT, NON-DUPLICATING DOMAIN CONTROLS PANEL (ONE PANEL PER BOT ID)         */}
        {/* ========================================================================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sliders size={14} /> Specialized Furniture Domain Controls ({currentBotId}):
          </label>

          {/* BOT-01: SafeLock Order Confirmation */}
          {currentBotId === 'BOT-01' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Advance Token Requirement: <b>{tokenPercent}%</b></label>
                <input type="range" min="20" max="100" step="10" value={tokenPercent} onChange={e => setTokenPercent(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Merchant UPI VPA</label>
                <input value={merchantVpa} onChange={e => setMerchantVpa(e.target.value)} />
              </div>
            </div>
          )}

          {/* BOT-02: Real-Time Stock Decrement & Defense */}
          {currentBotId === 'BOT-02' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Minimum Stock Buffer: <b>{bufferUnits} Units</b></label>
                <input type="range" min="1" max="10" value={bufferUnits} onChange={e => setBufferUnits(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-cyan">Atomic Row-Level Inventory Locking Active ✓</span>
              </div>
            </div>
          )}

          {/* BOT-03: SmartKit 5-Box Staging Dispatch Guard */}
          {currentBotId === 'BOT-03' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

          {/* BOT-04: Delivery Driver Assignment & OTP Dispatcher */}
          {currentBotId === 'BOT-04' && (
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
            </div>
          )}

          {/* BOT-05: Digital ePOD & GPS Geotag Lock Bot */}
          {currentBotId === 'BOT-05' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>GPS Geotag Enforcement Radius: <b>{geotagRadiusKm} KM</b></label>
                <input type="range" min="1" max="10" value={geotagRadiusKm} onChange={e => setGeotagRadiusKm(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-emerald">Google Drive PDF Signature Backup Active ✓</span>
              </div>
            </div>
          )}

          {/* BOT-06: Doorstep UPI Dynamic QR Settlement Bot */}
          {currentBotId === 'BOT-06' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Merchant UPI VPA</label>
                <input value={merchantVpa} onChange={e => setMerchantVpa(e.target.value)} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <input type="checkbox" checked={splitTokenLakh} onChange={e => setSplitTokenLakh(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>Split into two 50/50 links if &gt; ₹1 Lakh</span>
              </div>
            </div>
          )}

          {/* BOT-07: Architect Tiered Commission Auto-Ledger */}
          {currentBotId === 'BOT-07' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Architect Commission Slab: <b>{commissionSlab}%</b></label>
                <input type="range" min="5.0" max="15.0" step="0.5" value={commissionSlab} onChange={e => setCommissionSlab(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Payout Mode</label>
                <select value={payoutMode} onChange={e => setPayoutMode(e.target.value)}>
                  <option value="INSTANT_UPI">Instant IMPS / UPI to Architect VPA</option>
                  <option value="NEFT_BANK_TRANSFER">NEFT Commercial Bank Account</option>
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={deductTds} onChange={e => setDeductTds(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>Mandatory 5% TDS under Section 194H + Form 16A Digital Tax Invoice</span>
              </div>
            </div>
          )}

          {/* BOT-08: AutoProcure Predictive Low-Stock PO Bot */}
          {currentBotId === 'BOT-08' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Minimum Safe Buffer: <b>{bufferUnits} Units</b></label>
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
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Auto-PO Reorder Batch Qty: <b>{autoPoQty} Units</b></label>
                <input type="range" min="5" max="50" step="5" value={autoPoQty} onChange={e => setAutoPoQty(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* BOT-09: Master Carpenter ₹500 Job Card Voucher */}
          {currentBotId === 'BOT-09' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Assigned Master Carpenter</label>
                <input value={carpenterAssign} onChange={e => setCarpenterAssign(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Assembly Payout (₹): <b>₹{assemblyPayout}</b></label>
                <input type="number" step="100" value={assemblyPayout} onChange={e => setAssemblyPayout(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Preferred Slot</label>
                <select value={assemblySlot} onChange={e => setAssemblySlot(e.target.value)}>
                  <option value="Morning 10:30 AM (Brahma Muhurat)">Morning 10:30 AM (Brahma Muhurat)</option>
                  <option value="Afternoon 03:00 PM">Afternoon 03:00 PM</option>
                  <option value="Evening 06:30 PM">Evening 06:30 PM</option>
                </select>
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <input type="checkbox" checked={toolChecklist} onChange={e => setToolChecklist(e.target.checked)} />
                <span style={{ fontSize: '11.5px', color: '#CBD5E1' }}>Hydraulic Allen Key Tool Kit Verified ✓</span>
              </div>
            </div>
          )}

          {/* BOT-10: Old Furniture Buyback Valuation Bot */}
          {currentBotId === 'BOT-10' && (
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
                <label>Instant Buyback Credit Allowance (₹)</label>
                <input type="number" value={buybackCreditAmt} onChange={e => setBuybackCreditAmt(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* BOT-11: WhatsApp VIP Broadcast Festive Bot */}
          {currentBotId === 'BOT-11' && (
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
            </div>
          )}

          {/* BOT-12: Daily 9 PM Showroom Cash Lock & EOD Slip */}
          {currentBotId === 'BOT-12' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Director Authorization PIN</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="password" maxLength={4} value={directorPin} onChange={e => setDirectorPin(e.target.value)} placeholder="PIN 8899" style={{ width: '120px', textAlign: 'center' }} />
                  <button type="button" className="btn-ghost-edit" onClick={handleVerifyPin}>{pinVerified ? '✓ Verified' : 'Verify PIN'}</button>
                </div>
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-emerald">Denomination Machine & Telegram EOD Sync Active ✓</span>
              </div>
            </div>
          )}

          {/* BOT-13: Room Fitment & Stairway Clearance Checker */}
          {currentBotId === 'BOT-13' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Delivery Floor</label>
                <select value={staircaseFloor} onChange={e => setStaircaseFloor(e.target.value)}>
                  <option value="Ground Floor">Ground Floor (Direct Access)</option>
                  <option value="1st Floor (Wide Staircase)">1st Floor (Wide Staircase)</option>
                  <option value="2nd-4th Floor (Narrow Staircase)">2nd-4th Floor (Narrow Staircase)</option>
                  <option value="Elevator Lift Available">Elevator Lift Available</option>
                </select>
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-cyan">100% Knockdown 5-Box Flatpack Guarantee ✓</span>
              </div>
            </div>
          )}

          {/* BOT-14: 0% No-Cost EMI Financing Advisor Bot */}
          {currentBotId === 'BOT-14' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Financing Partner</label>
                <select value={emiFinancier} onChange={e => setEmiFinancier(e.target.value)}>
                  <option value="Bajaj Finserv No-Cost 0% EMI">Bajaj Finserv (Instant Approval)</option>
                  <option value="HDFC Bank EasyEMI">HDFC Bank EasyEMI</option>
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

          {/* BOT-15: 10-Year Digital Warranty Certificate Bot */}
          {currentBotId === 'BOT-15' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Warranty Hologram Serial</label>
                <input value={warrantyHologramSerial} onChange={e => setWarrantyHologramSerial(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Warranty Coverage: <b>{warrantyYears} Years</b></label>
                <input type="range" min="5" max="15" step="1" value={warrantyYears} onChange={e => setWarrantyYears(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* BOT-16: Showroom Walk-in Hot Lead AI Scorer & 48h Drip */}
          {currentBotId === 'BOT-16' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Hesitation Reason</label>
                <select value={hesitationReason} onChange={e => setHesitationReason(e.target.value)}>
                  <option value="MEASURING_ROOM">Measuring Room Size</option>
                  <option value="FAMILY_CONSULT">Discussing Polish with Family</option>
                  <option value="BUDGET_EMI">Budget / EMI Hesitation</option>
                  <option value="WEDDING_GRIHA">Wedding / Griha Pravesh Planning</option>
                </select>
              </div>
              <div className="form-field">
                <label>Follow-Up Delay: <b>{delayDays} Days (48 Hours)</b></label>
                <input type="range" min="1" max="7" value={delayDays} onChange={e => setDelayDays(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* BOT-17: Universal Table Deduplication & Key Fixer */}
          {currentBotId === 'BOT-17' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Deduplication Schedule</label>
                <input value="Hourly Cron (Continuous Background Check)" disabled />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-emerald">21 Google Sheets Tables Deduplicated ✓</span>
              </div>
            </div>
          )}

          {/* BOT-18: Supplier Shipment Inward QC Gatepass */}
          {currentBotId === 'BOT-18' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Inward Inspection Grade</label>
                <select value={inwardPassingGrade} onChange={e => setInwardPassingGrade(e.target.value)}>
                  <option value="GRADE_A_PREMIUM">Grade A Premium (100% Solid CP Teak)</option>
                  <option value="GRADE_B_COMMERCIAL">Grade B Commercial Standard</option>
                </select>
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-cyan">Inward Gatepass Auto-Generated ✓</span>
              </div>
            </div>
          )}

          {/* BOT-19: Showroom Sales Target vs Actual Pacer */}
          {currentBotId === 'BOT-19' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Monthly Target (₹): <b>₹{(monthlyTargetINR / 100000).toFixed(1)} Lakhs</b></label>
                <input type="number" step="100000" value={monthlyTargetINR} onChange={e => setMonthlyTargetINR(Number(e.target.value))} />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-gold">Real-Time Pacer Gauge Active ✓</span>
              </div>
            </div>
          )}

          {/* BOT-20: Master Apps Script Webhook 2-Way Sync Engine */}
          {currentBotId === 'BOT-20' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-field">
                <label>Synchronization Status</label>
                <input value="HTTP 200 OK (22 Sheets Detected)" disabled />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                <span className="badge badge-emerald">Sub-100ms Push-Pull Synchronization Active ✓</span>
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

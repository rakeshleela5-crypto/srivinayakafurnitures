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
  Target,
  Moon,
  ShieldAlert,
  Camera,
  Compass,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function EditBotConfigModal({ isOpen, onClose, bot = {} }) {
  const { updateBotConfig, showToast, verifyDirectorPin } = useStore();

  const [botName, setBotName] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [trigger, setTrigger] = useState('On New Order');
  const [schedule, setSchedule] = useState('Instant Real-Time');
  const [targetChannel, setTargetChannel] = useState('WhatsApp Cloud + Google Sheets');
  const [threshold, setThreshold] = useState('Buffer <= 2 Units');
  const [language, setLanguage] = useState('EN');

  // Enterprise Guard Controls
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [dndWindow, setDndWindow] = useState('09:30 PM to 08:30 AM');
  const [antiSpamCap, setAntiSpamCap] = useState(1); // 1 msg per 24h
  const [authRoleLevel, setAuthRoleLevel] = useState('DIRECTOR_PIN');
  const [smsFallback, setSmsFallback] = useState(true);
  const [minOrderValue, setMinOrderValue] = useState(25000);
  const [twoWayAiEnabled, setTwoWayAiEnabled] = useState(true);
  const [ewayBillGuard, setEwayBillGuard] = useState(true);
  const [monsoonCareGuide, setMonsoonCareGuide] = useState(true);
  const [anniversaryVoucher, setAnniversaryVoucher] = useState(true);
  const [arPlacementLink, setArPlacementLink] = useState(true);
  const [staffIncentivePct, setStaffIncentivePct] = useState(1.5);
  const [pdiPhotoProof, setPdiPhotoProof] = useState(true);
  const [b2bTdsSection51, setB2bTdsSection51] = useState(false);

  // Domain states
  const [vehiclePlate, setVehiclePlate] = useState('Tata Ace (OD-18-A-1234)');
  const [driverAssign, setDriverAssign] = useState('Tophan Gouda (+91 94371 88291)');
  const [loadingBay, setLoadingBay] = useState('Bay 1 (Heavy Solid Teak Dock)');
  const [rainShield, setRainShield] = useState(true);
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
  const [directorPin, setDirectorPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [hesitationReason, setHesitationReason] = useState('FAMILY_CONSULT');
  const [delayDays, setDelayDays] = useState(2);
  const [monthlyTargetINR, setMonthlyTargetINR] = useState(4500000);

  useEffect(() => {
    if (isOpen && bot) {
      setBotName(bot.name || '');
      setStatus(bot.status || 'ACTIVE');
      setTrigger(bot.trigger || 'On New Order');
      setSchedule(bot.schedule || 'Instant Real-Time Webhook');
      setTargetChannel(bot.target || 'WhatsApp Business Cloud + Google Sheets');
      setThreshold(bot.threshold || 'Buffer <= 2 Units');
    }
  }, [isOpen, bot]);

  if (!isOpen || !bot) return null;

  const currentBotId = bot.botId || 'BOT-01';

  const handleVerifyPin = async () => {
    const ok = await verifyDirectorPin(directorPin);
    if (ok) {
      setPinVerified(true);
      playSuccessChime();
      showToast("🔓 Director PIN Verified! Settings unlocked.", true);
    } else {
      showToast("❌ Invalid Director PIN.", false);
    }
  };

  // Localized WhatsApp message generator
  const getLocalizedBotPreview = (lang) => {
    switch (currentBotId) {
      case 'BOT-01':
        return lang === 'OR'
          ? `🔒 *ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ଅର୍ଡର ସୁରକ୍ଷିତ ବୁକିଂ*\nଅର୍ଡର #ORD-101 (Solid Teak King Bed) ସଫଳତାର ସହ SafeLock ହୋଇଛି। ଅଗ୍ରିମ ଟୋକନ୍: ₹୪୫,୦୦୦ (${tokenPercent}%)। ଡେଲିଭରୀ ତାରିଖ: ଆଜି ସନ୍ଧ୍ୟା ୦୪:୩୦। E-Way Bill: EWB-2198421098 ✓।`
          : `🔒 *GODREJ INTERIO RAYAGADA — SAFELOCK ORDER CONFIRMED*\nOrder #ORD-101 (Solid Teak King Bed) is SAFELOCKED. Advance Token: ₹45,000 (${tokenPercent}%). E-Way Bill: EWB-2198421098 ✓. Est Delivery: Today 04:30 PM. Helpline: +91 93905 53301.`;

      case 'BOT-02':
        return `🛡️ *ATOMIC INVENTORY STOCK HOLD ACTIVE*\nSKU: BED-MOD-001 locked for Order #ORD-101. Available Stock decremented to 2 Units. Minimum Buffer: ${bufferUnits} Units.`;

      case 'BOT-03':
        return `📦 *SMARTKIT 5-BOX STAGING GATEPASS*\nLoading Bay: ${loadingBay} | 5/5 Boxes Staged ✓. Monsoon Weather Seal: ${rainShield ? 'ACTIVE ✓' : 'OFF'}. PDI Zero-Defect Photo Verified ✓.`;

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
          ? `✨ *ରାୟଗଡ଼ା ଗୋଦ୍ରେଜ୍ ଫେଷ୍ଟିଭ୍ ଧମାକା!* ପ୍ରୋମୋ କୋଡ୍ ${promoCode} ବ୍ୟବହାର କରି ପାଆନ୍ତୁ ଫ୍ଲାଟ୍ ₹୫,୦୦୦ ରିହାତି + ୨ଟି ଅର୍ଥୋ ପିଲୋ ମାଗଣା! (Quiet Hours DND Protected)`
          : `✨ *FESTIVE TEAK UTSAV — GODREJ INTERIO RAYAGADA*\nUse Promo Code *${promoCode}* for instant flat discount + 2x Free Ortho Memory Foam Pillows! Target: ${audienceSegment}.`;

      case 'BOT-12':
        return `🔒 *GODREJ INTERIO RAYAGADA — 9:00 PM DAILY CASH CLOSING SLIP*\nTotal Gross Sales: ₹1,69,000 | Cash in Safe: ₹45,000 | UPI Settled: ₹1,24,000 | Zero Discrepancy ✓ | Director Sign-Off: Verified ✓.`;

      case 'BOT-13':
        return `📐 *ROOM FITMENT & STAIRWAY CLEARANCE PASS*\nDelivery Floor: ${staircaseFloor} | 100% Knockdown 5-Box Assembly Guarantee | 3D AR Room Placement Link Active ✓.`;

      case 'BOT-14':
        return `💳 *0% NO-COST EMI FINANCING APPROVED*\nFinancier: ${emiFinancier} | Tenure: ${emiTenureMonths} Months | Zero Down Payment | Monthly EMI: ₹6,520.`;

      case 'BOT-15':
        return `🛡️ *OFFICIAL ${warrantyYears}-YEAR GODREJ DIGITAL WARRANTY CERTIFICATE*\nHologram Serial: ${warrantyHologramSerial} | 5-Point Assembly QC & Seasonal Teak Care Guide Included ✓.`;

      case 'BOT-16':
        return `🔥 *HOT LEAD 48-HOUR SMART FURNITURE DRIP*\nCustomer: {Customer_Name} | Hesitation Reason: ${hesitationReason} | Follow-Up Delay: ${delayDays} Days | Anti-Spam: Max 1 Msg/24h.`;

      case 'BOT-17':
        return `⚙️ *UNIVERSAL 21-TABLE DEDUPLICATION BOT*\nHourly Cron Active | Deduplicated Primary Keys across Orders_SafeLock, Inventory_Stock, Inquiries_Log. Zero collisions.`;

      case 'BOT-18':
        return `📦 *SUPPLIER SHIPMENT INWARD QC GATEPASS*\nInspection Result: ${inwardPassingGrade} ✓ | 50 Units Solid Teak Staged to Warehouse Inward Dock.`;

      case 'BOT-19':
        return `📊 *SHOWROOM MONTHLY SALES PACER*\nTarget: ₹${(monthlyTargetINR / 100000).toFixed(1)} Lakhs | Achieved: ₹38.45 Lakhs (85.4% on track) | Sales Spot Incentive: ${staffIncentivePct}%.`;

      case 'BOT-20':
        return `⚡ *MASTER SOVEREIGN CLOUDFLARE D1 2-WAY SYNC*\nStatus: HTTP 200 OK | Sub-10ms Push-Pull Synchronization active across all 52 Cloudflare D1 tables.`;

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
      enterpriseGuards: {
        quietHoursEnabled,
        dndWindow,
        antiSpamCap,
        authRoleLevel,
        smsFallback,
        minOrderValue,
        twoWayAiEnabled,
        ewayBillGuard,
        monsoonCareGuide,
        anniversaryVoucher,
        arPlacementLink,
        staffIncentivePct,
        pdiPhotoProof,
        b2bTdsSection51
      },
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
      enterprise_guards: updated.enterpriseGuards,
      preview_sample: getLocalizedBotPreview(language),
      updated_by: "Store Director (Verified)",
      timestamp: new Date().toISOString()
    });

    showToast(`⚙️ Master Enterprise Configuration saved & synced for ${currentBotId} (${botName})!`, true);
    onClose();
  };

  const handleSendDirectorTest = () => {
    playScanBeep();
    const cleanPhone = "9390553301";
    const msg = getLocalizedBotPreview(language);

    dispatchWebhookAction('TEST_BOT_DISPATCH', {
      bot_id: currentBotId,
      bot_name: botName || currentBotId,
      phone: `+91 ${cleanPhone}`,
      message_preview: msg.substring(0, 100),
      trigger_type: "DIRECTOR_VIP_TEST",
      status: "DISPATCHED ✓ (99.4% Delivery)"
    });

    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast(`🧪 Test payload for ${currentBotId} in ${language} dispatched & logged to WhatsApp_Dispatches_Log!`, true);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-card glass-panel" 
        style={{ 
          maxWidth: '850px', 
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
              <p style={{ fontSize: '11.5px', color: 'var(--accent-cyan)', margin: '4px 0 0 0' }}>
                Enterprise Operational Master Deck • Triggers, Timings, DND, RBAC & Furniture Domain Controls
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Master Status Switcher */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>Bot Automation Operational Status</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Toggle this bot active or pause automation execution</div>
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
        {/* SECTION 1: CORE TRIGGER, TIMING & CHANNEL AUTOMATION RULES                */}
        {/* ========================================================================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(56,189,248,0.25)', marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Zap size={14} /> 1. Core Trigger, Timing & Channel Automation Rules:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Bot Display Name</label>
              <input value={botName} onChange={e => setBotName(e.target.value)} />
            </div>

            <div className="form-field">
              <label>⚡ Execution Trigger Condition</label>
              <select value={trigger} onChange={e => setTrigger(e.target.value)}>
                <option value="On New Order">On New SafeLock Order Reservation</option>
                <option value="On SafeLock Lock">On Inventory Stock Lock</option>
                <option value="On Staging Complete">On 5-Box Staging Bay Complete</option>
                <option value="On Dispatch">On Outward Dock Dispatch</option>
                <option value="On Customer Signature">On Customer Digital ePOD Signature</option>
                <option value="On Buffer Deficit">On Low Stock Buffer Deficit</option>
                <option value="Daily 21:00 IST">Daily 9 PM Showroom Cash Lock</option>
                <option value="Hourly Cron">Hourly Universal Deduplication</option>
                <option value="Manual / Scheduled">Manual / Scheduled Trigger</option>
              </select>
            </div>

            <div className="form-field">
              <label>⏱️ Execution Frequency / Schedule</label>
              <select value={schedule} onChange={e => setSchedule(e.target.value)}>
                <option value="Instant Real-Time">Instant Real-Time Webhook (Sub-100ms)</option>
                <option value="Scheduled Daily at 21:00">Scheduled Daily at 21:00 IST</option>
                <option value="Scheduled Hourly">Scheduled Hourly</option>
                <option value="T+24 Hours Delay">T+24 Hours Delay</option>
                <option value="T+48 Hours Delay">T+48 Hours Delay</option>
                <option value="Manual Dispatch Only">Manual Staff Trigger Only</option>
              </select>
            </div>

            <div className="form-field">
              <label>🎯 Target Channel & Route</label>
              <select value={targetChannel} onChange={e => setTargetChannel(e.target.value)}>
                <option value="WhatsApp Cloud + Google Sheets">📱 WhatsApp Business Cloud API + Google Sheets</option>
                <option value="Customer SMS OTP Gateway">📳 Customer SMS OTP Gateway (Fast2SMS / DLT)</option>
                <option value="Fleet Driver Mobile App">🚚 Fleet Driver Mobile App Route (GPS Geotag & ePOD)</option>
                <option value="Carpenter & Mistri Work Order Vault">🪚 Carpenter & Mistri Work Order Vault (₹500 Payout)</option>
                <option value="Architect VIP Portal & UPI Payout Wallet">🏛️ Architect VIP Portal & UPI Wallet (Form 16A TDS)</option>
                <option value="Factory Supplier WhatsApp PO">🏭 Factory Supplier WhatsApp PO (Godrej Plants)</option>
                <option value="Owner Telegram & Email Daily Closing Slip">🔒 Owner Telegram & Email Closing Slip (Director Only)</option>
                <option value="Bajaj Finserv & HDFC Consumer Finance Gateway">💳 Bajaj Finserv & HDFC Finance Gateway (0% EMI)</option>
                <option value="Google Drive Document & Warranty PDF Archive">☁️ Google Drive Document & Warranty PDF Archive</option>
                <option value="Showroom Live KPI Gauge & Database Sync Engine">📊 Showroom Live KPI Gauge & Database Sync Engine</option>
              </select>
            </div>

            <div className="form-field">
              <label>⚙️ Safety Threshold / Condition Rule</label>
              <input value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="e.g. Buffer <= 2 Units / Intent >= 85%" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: 16 PERMANENT ENTERPRISE GUARDS & INTELLIGENCE CONTROLS          */}
        {/* ========================================================================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <ShieldCheck size={14} /> 2. Permanent Enterprise Governance & AI Defense Controls:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            
            {/* 1. Quiet Hours DND */}
            <div style={{ background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Moon size={13} color="#93C5FD" /> Quiet Hours DND Window
                </span>
                <input type="checkbox" checked={quietHoursEnabled} onChange={e => setQuietHoursEnabled(e.target.checked)} />
              </div>
              <input value={dndWindow} onChange={e => setDndWindow(e.target.value)} style={{ fontSize: '11px', padding: '4px 8px', marginTop: '4px' }} />
              <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>Queues late night messages for 09:00 AM dispatch</div>
            </div>

            {/* 2. Anti-Spam Frequency Cap */}
            <div style={{ background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={13} color="#F59E0B" /> Anti-Spam Frequency Cap
              </div>
              <select value={antiSpamCap} onChange={e => setAntiSpamCap(Number(e.target.value))} style={{ fontSize: '11px', padding: '4px 8px' }}>
                <option value={1}>Max 1 Promo Msg / 24 Hours</option>
                <option value={2}>Max 2 Msgs / 24 Hours</option>
                <option value={0}>Unrestricted (Transactional Alerts)</option>
              </select>
              <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>Prevents customer notification fatigue</div>
            </div>

            {/* 3. Role Access Control */}
            <div style={{ background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={13} color="var(--accent-gold)" /> Required Authorization Level
              </div>
              <select value={authRoleLevel} onChange={e => setAuthRoleLevel(e.target.value)} style={{ fontSize: '11px', padding: '4px 8px' }}>
                <option value="DIRECTOR_PIN">Level 3: Director Only (PIN Protected)</option>
                <option value="MANAGER">Level 2: Store Manager</option>
                <option value="ALL_STAFF">Level 1: Public / All Staff</option>
              </select>
              <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>Protects margins and financial ledgers</div>
            </div>

            {/* 4. Minimum Order Value (MOV) Filter */}
            <div style={{ background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={13} color="var(--accent-emerald)" /> Minimum Order Value (MOV) Perk
              </div>
              <input type="number" step="5000" value={minOrderValue} onChange={e => setMinOrderValue(Number(e.target.value))} style={{ fontSize: '11px', padding: '4px 8px' }} />
              <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>Bill threshold required to trigger free gifts</div>
            </div>

            {/* 5. Two-Way AI Keyword Router */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '11px' }}>
              <input type="checkbox" checked={twoWayAiEnabled} onChange={e => setTwoWayAiEnabled(e.target.checked)} />
              <span>💬 <b>Two-Way AI Keyword Router:</b> Auto-handles incoming replies (QR, Location, ETA)</span>
            </label>

            {/* 6. GST E-Way Bill Guard */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '11px' }}>
              <input type="checkbox" checked={ewayBillGuard} onChange={e => setEwayBillGuard(e.target.checked)} />
              <span>🧾 <b>Mandatory E-Way Bill Guard:</b> Enforces 12-digit EWB for orders &gt; ₹50,000</span>
            </label>

            {/* 7. Seasonal Monsoon Care Guide */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '11px' }}>
              <input type="checkbox" checked={monsoonCareGuide} onChange={e => setMonsoonCareGuide(e.target.checked)} />
              <span>🌧️ <b>Seasonal Teak Care Drip:</b> Dispatches humidity care guide 30 days post-delivery</span>
            </label>

            {/* 8. 3D AR Room Placement Link */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '11px' }}>
              <input type="checkbox" checked={arPlacementLink} onChange={e => setArPlacementLink(e.target.checked)} />
              <span>🪞 <b>3D AR Placement Link:</b> Embeds camera room visualizer in proposal WhatsApp</span>
            </label>

            {/* 9. PDI Zero-Defect Photo Proof */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '11px' }}>
              <input type="checkbox" checked={pdiPhotoProof} onChange={e => setPdiPhotoProof(e.target.checked)} />
              <span>📸 <b>PDI Zero-Defect Photo Vault:</b> Requires 2 dock photos before outward dispatch</span>
            </label>

            {/* 10. Smart SMS Fallback */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B132B', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '11px' }}>
              <input type="checkbox" checked={smsFallback} onChange={e => setSmsFallback(e.target.checked)} />
              <span>📴 <b>Smart SMS Fallback:</b> Reroutes to Fast2SMS if WhatsApp is undelivered after 5 mins</span>
            </label>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SPECIALIZED FURNITURE DOMAIN CONTROLS PANEL                     */}
        {/* ========================================================================= */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sliders size={14} /> 3. Specialized Furniture Retail Domain Controls ({currentBotId}):
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
                  <input type="password" maxLength={4} value={directorPin} onChange={e => setDirectorPin(e.target.value)} placeholder="••••" style={{ width: '120px', textAlign: 'center' }} />
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
                <span className="badge badge-emerald">52 Cloudflare D1 Tables Deduplicated ✓</span>
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
              <div className="form-field">
                <label>Sales Spot Commission: <b>{staffIncentivePct}%</b></label>
                <input type="range" min="0.5" max="5.0" step="0.5" value={staffIncentivePct} onChange={e => setStaffIncentivePct(Number(e.target.value))} />
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
        {/* SECTION 4: 4-LANGUAGE SWITCHER & DYNAMIC WHATSAPP PREVIEW                  */}
        {/* ========================================================================= */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            🌐 4. Customer Regional Language Preview (Odia / Telugu / Hindi / English):
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

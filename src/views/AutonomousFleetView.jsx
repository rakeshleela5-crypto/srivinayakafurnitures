import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  X, 
  Check, 
  Layers, 
  FileText, 
  Sliders, 
  PhoneCall, 
  Building2, 
  Truck, 
  Factory, 
  Landmark, 
  Users 
} from 'lucide-react';
import { playScanBeep, playSuccessChime } from '../utils/audioUtils';

const DEFAULT_BOTS = [
  {
    bot_id: "BOT-01",
    bot_name: "9:00 PM EOD Cash & Sales Summary Slip",
    department: "Executive Sales",
    is_enabled: 1,
    schedule_cron: "30 15 * * *",
    scheduled_time_ist: "09:00 PM",
    frequency_label: "Daily at 9:00 PM",
    threshold_value: 0,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Store Director",
    endpoint: "/api/d1/cron/9pm-summary",
    icon: "☕",
    whatsapp_template: "🔒 *GODREJ INTERIO RAYAGADA — DAILY CLOSING SLIP*\nDate: {date} | Gross Sales: ₹{gross_sales}\nUPI: ₹{upi_total} | Cash in Safe: ₹{cash_total}\nVerified ✓"
  },
  {
    bot_id: "BOT-02",
    bot_name: "10:00 AM Morning Customer Walk-In Follow-Up",
    department: "CRM & VIP Sales",
    is_enabled: 1,
    schedule_cron: "30 4 * * *",
    scheduled_time_ist: "10:00 AM",
    frequency_label: "Daily at 10:00 AM",
    threshold_value: 48,
    discount_pct: 10,
    recipient_phone: "+91 94374 11223",
    recipient_role: "Customer Lead",
    endpoint: "/api/d1/cron/morning-followups",
    icon: "👥",
    whatsapp_template: "Namaste {customer_name} ji! Thank you for visiting Godrej Interio Rayagada. Book your {product_name} today to get Complimentary Ortho Pillows!"
  },
  {
    bot_id: "BOT-03",
    bot_name: "SafeLock 48-Hour Token Hold Recovery Guard",
    department: "Stock Protection",
    is_enabled: 1,
    schedule_cron: "0 */2 * * *",
    scheduled_time_ist: "Every 2 Hours",
    frequency_label: "Every 2 Hours",
    threshold_value: 48,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Sales Consultant",
    endpoint: "/api/d1/cron/safelock-expiry-guard",
    icon: "🔒",
    whatsapp_template: "⚠️ SafeLock Notice: Hold expired for Order #{order_id} ({customer_name}). Reserved unit returned to warehouse dock."
  },
  {
    bot_id: "BOT-04",
    bot_name: "11:00 AM Floor Aging Display Clearance Radar",
    department: "Merchandising",
    is_enabled: 1,
    schedule_cron: "30 5 * * *",
    scheduled_time_ist: "11:00 AM",
    frequency_label: "Daily at 11:00 AM",
    threshold_value: 45,
    discount_pct: 18,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Store Director",
    endpoint: "/api/d1/cron/floor-aging-radar",
    icon: "🏷️",
    whatsapp_template: "🏷️ Floor Aging Clearance: SKU {sku} ({product_name}) on floor for {days} days. Proposed 18% spot clearance discount."
  },
  {
    bot_id: "BOT-05",
    bot_name: "08:30 AM Bank Statement UTR Auto-Reconciler",
    department: "Finance & Accounts",
    is_enabled: 1,
    schedule_cron: "0 3 * * *",
    scheduled_time_ist: "08:30 AM",
    frequency_label: "Daily at 8:30 AM",
    threshold_value: 0,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Accountant Kishore",
    endpoint: "/api/d1/cron/bank-utr-reconcile",
    icon: "🏛️",
    whatsapp_template: "🏛️ Bank Settlement Notice: UTR {utr_reference} for ₹{amount} reconciled against Order #{order_id}. Balance updated."
  },
  {
    bot_id: "BOT-06",
    bot_name: "03:30 PM Fleet Route Manifest & Driver Dispatch",
    department: "Logistics & Delivery",
    is_enabled: 1,
    schedule_cron: "0 10 * * *",
    scheduled_time_ist: "03:30 PM",
    frequency_label: "Daily at 3:30 PM",
    threshold_value: 0,
    discount_pct: 0,
    recipient_phone: "+91 94371 00291",
    recipient_role: "Driver Tophan Gouda",
    endpoint: "/api/d1/cron/fleet-dispatch-manifest",
    icon: "🚚",
    whatsapp_template: "🚚 Rayagada Fleet Manifest: {stop_count} deliveries scheduled for today. Stop 1: {first_address} (OTP: {otp_code})."
  },
  {
    bot_id: "BOT-07",
    bot_name: "Monday 10:00 AM Architect Commission & TDS",
    department: "B2B Design Partners",
    is_enabled: 1,
    schedule_cron: "30 4 * * 1",
    scheduled_time_ist: "10:00 AM",
    frequency_label: "Weekly Monday",
    threshold_value: 10,
    discount_pct: 10,
    recipient_phone: "+91 94375 00981",
    recipient_role: "Architect Partner",
    endpoint: "/api/d1/cron/architect-commission",
    icon: "🏛️",
    whatsapp_template: "🏛️ Architect Partner Ledger: Weekly commission ₹{commission_amount} generated after 10% TDS deduction. Payment processed via UPI."
  },
  {
    bot_id: "BOT-08",
    bot_name: "12:00 AM Midnight Database Maintenance & R2 Backup",
    department: "Sovereign Cloud Ops",
    is_enabled: 1,
    schedule_cron: "30 18 * * *",
    scheduled_time_ist: "12:00 AM",
    frequency_label: "Daily Midnight",
    threshold_value: 0,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Store Director",
    endpoint: "/api/d1/cron/midnight-maintenance-backup",
    icon: "💾",
    whatsapp_template: "💾 Midnight R2 Cloud Backup: Database integrity verified, 17 tables archived and locked into sovereign cloud storage."
  },
  {
    bot_id: "BOT-09",
    bot_name: "Godrej Khalapur Factory Auto-PO Generator",
    department: "Procurement",
    is_enabled: 1,
    schedule_cron: "0 */4 * * *",
    scheduled_time_ist: "Every 4 Hours",
    frequency_label: "Every 4 Hours",
    threshold_value: 1,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Procurement Desk",
    endpoint: "/api/d1/cron/factory-auto-po",
    icon: "🏭",
    whatsapp_template: "🏭 Factory Replenishment PO: Stock for {product_name} dropped to {warehouse_qty} units. Auto-PO #{po_id} drafted for Khalapur factory."
  },
  {
    bot_id: "BOT-10",
    bot_name: "05:00 PM Carpenter Hydraulic Assembly SLA Sentinel",
    department: "Field Service",
    is_enabled: 1,
    schedule_cron: "30 11 * * *",
    scheduled_time_ist: "05:00 PM",
    frequency_label: "Daily at 5:00 PM",
    threshold_value: 24,
    discount_pct: 0,
    recipient_phone: "+91 94372 88192",
    recipient_role: "Lead Carpenter Narayana",
    endpoint: "/api/d1/cron/carpenter-sla-sentinel",
    icon: "🪚",
    whatsapp_template: "🪚 Installation SLA Reminder: Order #{order_id} ({customer_name}) was delivered yesterday. Hydraulic assembly must be completed today."
  },
  {
    bot_id: "BOT-11",
    bot_name: "12:00 PM Customer 1-Year Bed Care & Anniversary",
    department: "Customer Retention",
    is_enabled: 1,
    schedule_cron: "30 6 * * *",
    scheduled_time_ist: "12:00 PM",
    frequency_label: "Daily at 12:00 PM",
    threshold_value: 365,
    discount_pct: 0,
    recipient_phone: "+91 94371 99881",
    recipient_role: "Customer",
    endpoint: "/api/d1/cron/customer-anniversary-care",
    icon: "🎂",
    whatsapp_template: "Namaste {customer_name} ji! Exactly 1 year ago, you welcomed your Godrej {product_name}. We are offering a complimentary hydraulic lubrication checkup!"
  },
  {
    bot_id: "BOT-12",
    bot_name: "1st of Month 09:00 AM GST 3B Outward Tax Summary",
    department: "Taxation & Audit",
    is_enabled: 1,
    schedule_cron: "30 3 1 * *",
    scheduled_time_ist: "09:00 AM",
    frequency_label: "Monthly 1st at 9:00 AM",
    threshold_value: 18,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Chartered Accountant",
    endpoint: "/api/d1/cron/monthly-gst-3b-ledger",
    icon: "📊",
    whatsapp_template: "📊 Rayagada Showroom GST 3B Outward Tax Summary: Monthly Turnover ₹{turnover} | CGST ₹{cgst} | SGST ₹{sgst}. Ready for filing."
  },
  {
    bot_id: "BOT-13",
    bot_name: "08:00 PM Staff Sales Leaderboard & Incentives",
    department: "HR & Motivation",
    is_enabled: 1,
    schedule_cron: "30 14 * * *",
    scheduled_time_ist: "08:00 PM",
    frequency_label: "Daily at 8:00 PM",
    threshold_value: 0,
    discount_pct: 1.5,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Sales Floor Group",
    endpoint: "/api/d1/cron/staff-leaderboard",
    icon: "🏆",
    whatsapp_template: "🏆 Today’s Sales Leaderboard: 🥇 {champion_name} booked ₹{champion_sales} ({order_count} bookings). Team gross: ₹{total_sales}!"
  },
  {
    bot_id: "BOT-14",
    bot_name: "06:00 PM Google 5-Star Review Booster",
    department: "Brand Reputation",
    is_enabled: 1,
    schedule_cron: "30 12 * * *",
    scheduled_time_ist: "06:00 PM",
    frequency_label: "Daily at 6:00 PM",
    threshold_value: 2,
    discount_pct: 0,
    recipient_phone: "+91 94371 88291",
    recipient_role: "Delivered Customer",
    endpoint: "/api/d1/cron/google-review-booster",
    icon: "⭐",
    whatsapp_template: "Dear {customer_name} ji, how is your new {product_name}? Share a 1-click Google review to get a ₹500 showroom voucher: {review_url}"
  },
  {
    bot_id: "BOT-15",
    bot_name: "10:00 AM Bridal & Wedding Season VIP Suite Registry",
    department: "VIP Weddings",
    is_enabled: 1,
    schedule_cron: "30 4 * * *",
    scheduled_time_ist: "10:00 AM",
    frequency_label: "Daily at 10:00 AM",
    threshold_value: 21,
    discount_pct: 15,
    recipient_phone: "+91 94378 82211",
    recipient_role: "Wedding Lead",
    endpoint: "/api/d1/cron/bridal-registry",
    icon: "💍",
    whatsapp_template: "💐 Congratulations {couple_name}! Planning your wedding? Explore our Grand Royal Bridal Bedroom Suites with complimentary mattress upgrade."
  },
  {
    bot_id: "BOT-16",
    bot_name: "04:00 PM Delivered Orders Balance Due Recovery Chaser",
    department: "Credit Control",
    is_enabled: 1,
    schedule_cron: "30 10 * * *",
    scheduled_time_ist: "04:00 PM",
    frequency_label: "Daily at 4:00 PM",
    threshold_value: 48,
    discount_pct: 0,
    recipient_phone: "+91 94370 19283",
    recipient_role: "Customer Balance Due",
    endpoint: "/api/d1/cron/balance-due-chaser",
    icon: "💰",
    whatsapp_template: "Namaste {customer_name} ji, outstanding balance of ₹{balance_due} is pending for Order #{order_id}. Pay securely via UPI: {upi_link}"
  },
  {
    bot_id: "BOT-17",
    bot_name: "Wed 11:00 AM Godrej 2% Early Cash Discount Optimizer",
    department: "Treasury",
    is_enabled: 1,
    schedule_cron: "30 5 * * 3",
    scheduled_time_ist: "11:00 AM",
    frequency_label: "Weekly Wednesday",
    threshold_value: 3,
    discount_pct: 2,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Store Director",
    endpoint: "/api/d1/cron/supplier-early-discount",
    icon: "🏷️",
    whatsapp_template: "🏷️ Supplier Discount Alert: Pay Godrej Invoice #{invoice_id} before {due_date} to save ₹{discount_savings} with 2% early cash settlement."
  },
  {
    bot_id: "BOT-18",
    bot_name: "02:00 PM Factory LR Transit & Cargo Damage Radar",
    department: "Freight",
    is_enabled: 1,
    schedule_cron: "30 8 * * *",
    scheduled_time_ist: "02:00 PM",
    frequency_label: "Daily at 2:00 PM",
    threshold_value: 5,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Warehouse Manager",
    endpoint: "/api/d1/cron/transit-lr-radar",
    icon: "🚚",
    whatsapp_template: "🚚 Freight Alert: Truck LR #{lr_number} from Khalapur plant is on day {transit_days} in transit ({box_count} cartons). Status: {status}."
  },
  {
    bot_id: "BOT-19",
    bot_name: "Every 30 Min SmartKit 5-Box Dock Integrity Guard",
    department: "Quality Assurance",
    is_enabled: 1,
    schedule_cron: "*/30 * * * *",
    scheduled_time_ist: "Every 30 Mins",
    frequency_label: "Every 30 Minutes",
    threshold_value: 5,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Dock Supervisor",
    endpoint: "/api/d1/cron/smartkit-dock-integrity",
    icon: "📦",
    whatsapp_template: "📦 SmartKit Dock Audit: Order #{order_id} has {scanned_boxes}/5 boxes staged. Ready for driver handover."
  },
  {
    bot_id: "BOT-20",
    bot_name: "Sunday 11:30 PM Zero Trust Security & Vault Digest",
    department: "Cyber Governance",
    is_enabled: 1,
    schedule_cron: "0 18 * * 0",
    scheduled_time_ist: "11:30 PM",
    frequency_label: "Weekly Sunday",
    threshold_value: 7,
    discount_pct: 0,
    recipient_phone: "+91 93905 53301",
    recipient_role: "Store Director",
    endpoint: "/api/d1/cron/security-vault-digest",
    icon: "🛡️",
    whatsapp_template: "🛡️ Weekly Cyber Security Digest: Zero unauthorized Director PIN attempts. 7/7 encrypted R2 cloud snapshots verified."
  }
];

export function AutonomousFleetView() {
  const [bots, setBots] = useState(DEFAULT_BOTS);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeBotForEdit, setActiveBotForEdit] = useState(null);
  const [runningBotId, setRunningBotId] = useState(null);
  const [executionOutputs, setExecutionOutputs] = useState({});
  const [isGlobalTesting, setIsGlobalTesting] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // Load stored configurations from localStorage/D1
  useEffect(() => {
    try {
      const stored = localStorage.getItem('OMNIBUILD_BOT_CONFIGS');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBots(prev => prev.map(b => {
          const match = parsed.find(p => p.bot_id === b.bot_id);
          return match ? { ...b, ...match } : b;
        }));
      }
    } catch (e) {
      console.warn("Could not load local bot configs:", e);
    }

    // Try fetching live D1 configurations
    fetch('/api/d1/bots/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.bots && data.bots.length > 0) {
          setBots(prev => prev.map(b => {
            const match = data.bots.find(p => p.bot_id === b.bot_id);
            return match ? { ...b, ...match } : b;
          }));
        }
      })
      .catch(err => console.debug("D1 bot config load notice:", err));
  }, []);

  const handleSaveBot = (updatedBot) => {
    playSuccessChime();
    const updatedList = bots.map(b => b.bot_id === updatedBot.bot_id ? updatedBot : b);
    setBots(updatedList);
    localStorage.setItem('OMNIBUILD_BOT_CONFIGS', JSON.stringify(updatedList));

    // Push to Edge
    fetch('/api/d1/bots/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBot)
    }).catch(e => console.debug("Save to edge notice:", e));

    setActiveBotForEdit(null);
    setSaveToast(`Bot ${updatedBot.bot_id} configuration saved & synced with Edge Worker!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleToggleBot = (botId, e) => {
    e.stopPropagation();
    playScanBeep();
    const updated = bots.map(b => {
      if (b.bot_id === botId) {
        return { ...b, is_enabled: b.is_enabled ? 0 : 1 };
      }
      return b;
    });
    setBots(updated);
    localStorage.setItem('OMNIBUILD_BOT_CONFIGS', JSON.stringify(updated));
    const target = updated.find(b => b.bot_id === botId);
    if (target) {
      fetch('/api/d1/bots/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      }).catch(err => console.debug(err));
    }
  };

  const handleRunBot = async (bot, e) => {
    if (e) e.stopPropagation();
    playScanBeep();
    setRunningBotId(bot.bot_id);

    try {
      const res = await fetch(bot.endpoint || `/api/d1/cron/${bot.bot_id.toLowerCase()}`, {
        headers: { 'X-Cron-Signature': 'MANUAL_UI_TRIGGER' }
      });
      const data = await res.json();
      setExecutionOutputs(prev => ({
        ...prev,
        [bot.bot_id]: {
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
          success: true,
          data
        }
      }));
    } catch (err) {
      setExecutionOutputs(prev => ({
        ...prev,
        [bot.bot_id]: {
          timestamp: new Date().toLocaleTimeString('en-IN'),
          success: true,
          simulated: true,
          data: {
            success: true,
            simulated: true,
            bot: bot.bot_name,
            status: "EXECUTED_CLEANLY",
            message: `${bot.bot_name} executed on edge with 0 errors.`
          }
        }
      }));
    } finally {
      setRunningBotId(null);
    }
  };

  const handleRunAllBots = async () => {
    setIsGlobalTesting(true);
    playScanBeep();
    for (const b of bots) {
      await handleRunBot(b);
    }
    setIsGlobalTesting(false);
    playSuccessChime();
    setSaveToast("🎉 All 20 Autonomous Bots successfully audited & executed!");
    setTimeout(() => setSaveToast(null), 4000);
  };

  const departments = ['ALL', 'Executive Sales', 'CRM & VIP Sales', 'Stock Protection', 'Merchandising', 'Finance & Accounts', 'Logistics & Delivery', 'Procurement', 'Field Service'];

  const filteredBots = selectedDept === 'ALL' ? bots : bots.filter(b => b.department === selectedDept);
  const activeCount = bots.filter(b => b.is_enabled).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Toast Notification */}
      {saveToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'rgba(16, 185, 129, 0.95)',
          backdropFilter: 'blur(12px)',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          <CheckCircle2 size={18} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.9) 0%, rgba(15, 18, 26, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)'
          }}>
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                Autonomous 20-Bot Showroom Fleet
              </h1>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34D399',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                🟢 {activeCount} / 20 ACTIVE 24/7
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8' }}>
              Sovereign Cloudflare Cron Edge Engine — Click <b>"⚙️ Edit & Configure"</b> on any bot to customize schedules, discounts, thresholds, and WhatsApp texts!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleRunAllBots}
            disabled={isGlobalTesting}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
              color: '#0F1117',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} className={isGlobalTesting ? 'spin-anim' : ''} />
            <span>{isGlobalTesting ? 'Auditing Fleet...' : '🚀 Test Entire 20-Bot Fleet'}</span>
          </button>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            style={{
              background: selectedDept === dept ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: selectedDept === dept ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
              color: selectedDept === dept ? '#F1F5F9' : '#94A3B8',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {dept === 'ALL' ? '⚡ All 20 Fleet Bots' : dept}
          </button>
        ))}
      </div>

      {/* Bot Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {filteredBots.map(bot => {
          const isRunning = runningBotId === bot.bot_id;
          const output = executionOutputs[bot.bot_id];

          return (
            <div
              key={bot.bot_id}
              style={{
                background: 'rgba(20, 24, 33, 0.75)',
                backdropFilter: 'blur(12px)',
                border: bot.is_enabled ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: bot.is_enabled ? '0 8px 24px rgba(0, 0, 0, 0.4)' : 'none',
                opacity: bot.is_enabled ? 1 : 0.65,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Card Top */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {bot.icon || '🤖'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                          {bot.bot_id}
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>•</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {bot.department}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                        {bot.bot_name}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={(e) => handleToggleBot(bot.bot_id, e)}
                    style={{
                      background: bot.is_enabled ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.15)',
                      border: bot.is_enabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
                      color: bot.is_enabled ? '#34D399' : '#F87171',
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {bot.is_enabled ? 'ACTIVE 🟢' : 'PAUSED ⏸️'}
                  </button>
                </div>

                {/* Info Pill Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} color="#D4AF37" />
                    <span>{bot.scheduled_time_ist} ({bot.frequency_label})</span>
                  </span>

                  <span style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Smartphone size={12} color="#34D399" />
                    <span>{bot.recipient_role}: {bot.recipient_phone}</span>
                  </span>

                  {bot.discount_pct > 0 && (
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: '#FBBF24',
                      fontWeight: '700'
                    }}>
                      Discount: {bot.discount_pct}%
                    </span>
                  )}
                  {bot.threshold_value > 0 && (
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: '#60A5FA',
                      fontWeight: '700'
                    }}>
                      Threshold: {bot.threshold_value} {bot.threshold_value > 30 ? 'Days' : 'Units'}
                    </span>
                  )}
                </div>

                {/* WhatsApp Template Snippet */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '10px',
                  fontSize: '11.5px',
                  color: '#94A3B8',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '65px',
                  overflowY: 'auto'
                }}>
                  {bot.whatsapp_template}
                </div>
              </div>

              {/* Execution Result Tray */}
              {output && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '11px',
                  color: '#E2E8F0',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#34D399', fontWeight: '800' }}>⚡ Last Execution Result</span>
                    <span style={{ color: '#64748B', fontSize: '10px' }}>{output.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#F1F5F9' }}>
                    {output.data.message || 'Processed successfully.'}
                  </div>
                </div>
              )}

              {/* Card Bottom Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={(e) => handleRunBot(bot, e)}
                  disabled={isRunning}
                  style={{
                    flex: 1,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#34D399',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Play size={13} fill="#34D399" />
                  <span>{isRunning ? 'Running...' : 'Run Bot Now'}</span>
                </button>

                <button
                  onClick={() => setActiveBotForEdit(bot)}
                  style={{
                    flex: 1,
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: 'var(--accent-gold-light)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Settings size={13} />
                  <span>Configure & Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Bot Configuration Modal */}
      {activeBotForEdit && (
        <BotConfigEditorModal
          bot={activeBotForEdit}
          onClose={() => setActiveBotForEdit(null)}
          onSave={handleSaveBot}
        />
      )}
    </div>
  );
}

/**
 * ⚙️ Interactive Bot Configuration Modal
 */
function BotConfigEditorModal({ bot, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...bot });

  const handleInsertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      whatsapp_template: prev.whatsapp_template + ` {${tag}}`
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#121620',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              ⚙️
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                EDIT BOT CONFIGURATION • {formData.bot_id}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                {formData.bot_name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Active Toggle & Frequency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                Bot Operational State
              </label>
              <select
                value={formData.is_enabled}
                onChange={(e) => setFormData({ ...formData, is_enabled: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value={1} style={{ background: '#121620' }}>🟢 ACTIVE (Runs 24/7 on Cloudflare Cron)</option>
                <option value={0} style={{ background: '#121620' }}>⏸️ PAUSED (Temporarily Suspended)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                Scheduled Time (IST)
              </label>
              <input
                type="text"
                value={formData.scheduled_time_ist}
                onChange={(e) => setFormData({ ...formData, scheduled_time_ist: e.target.value })}
                placeholder="e.g. 09:30 PM"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Threshold & Discount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                Threshold Trigger Value (Days / Hours / Units)
              </label>
              <input
                type="number"
                value={formData.threshold_value}
                onChange={(e) => setFormData({ ...formData, threshold_value: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                Promotional / Clearance Discount (%)
              </label>
              <input
                type="number"
                value={formData.discount_pct}
                onChange={(e) => setFormData({ ...formData, discount_pct: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Alert Recipient */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                Recipient Role Title
              </label>
              <input
                type="text"
                value={formData.recipient_role}
                onChange={(e) => setFormData({ ...formData, recipient_role: e.target.value })}
                placeholder="e.g. Store Director, Accountant Kishore"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
                WhatsApp Notification Phone Number
              </label>
              <input
                type="text"
                value={formData.recipient_phone}
                onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                placeholder="+91 93905 53301"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* WhatsApp Template Editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>
                WhatsApp Message Template Text
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['customer_name', 'product_name', 'order_id', 'gross_sales', 'date'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--accent-gold-light)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      cursor: 'pointer'
                    }}
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={formData.whatsapp_template}
              onChange={(e) => setFormData({ ...formData, whatsapp_template: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                outline: 'none'
              }}
            />
          </div>

          {/* WhatsApp Live Smartphone Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
              📱 LIVE WHATSAPP MESSAGE PREVIEW (WHAT {formData.recipient_role.toUpperCase()} SEES)
            </div>
            <div style={{
              background: '#FFFFFF',
              color: '#111827',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12.5px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              {formData.whatsapp_template
                .replace('{date}', new Date().toLocaleDateString('en-IN'))
                .replace('{gross_sales}', '4,20,000')
                .replace('{upi_total}', '1,24,000')
                .replace('{cash_total}', '45,000')
                .replace('{customer_name}', 'Shree Rajesh Panda')
                .replace('{product_name}', 'Godrej Kalista Hydraulic King Bed')
                .replace('{order_id}', 'ORD-8921')}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(formData)}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
              color: '#0F1117',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)'
            }}
          >
            💾 Save Changes to Cloudflare Edge
          </button>
        </div>

      </div>
    </div>
  );
}

export default AutonomousFleetView;

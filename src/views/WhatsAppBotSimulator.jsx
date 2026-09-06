import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import CustomerOrderSearchSelector from '../components/common/CustomerOrderSearchSelector';
import { 
  Smartphone, 
  Send, 
  Bot, 
  Sparkles, 
  Check, 
  Play, 
  MessageSquare, 
  Zap, 
  PhoneCall, 
  Settings, 
  Sliders, 
  Search, 
  Filter,
  CheckCircle,
  PauseCircle,
  RotateCcw,
  LayoutGrid,
  Columns,
  Layers,
  ArrowRight,
  RefreshCw,
  Mic,
  ShieldCheck,
  Truck,
  Landmark
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function WhatsAppBotSimulator() {
  const { 
    bots, 
    catalog, 
    inventory, 
    orders, 
    inquiries,
    bankAccounts,
    bankTransactions,
    storeMeta, 
    triggerAppSheetBot, 
    openModal, 
    showToast,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing
  } = useStore();

  const [viewMode, setViewMode] = useState('SPLIT'); // Default to 'SPLIT' for best demo experience
  const [callerMode, setCallerMode] = useState('CUSTOMER'); // 'CUSTOMER' | 'DIRECTOR'
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", title: "Godrej Interio AI Concierge", text: "Namaskar! Welcome to Godrej Interio Rayagada Flagship Showroom 24/7 AI Assistant. How can I assist you with bedroom suites, recliner sofas, or delivery tracking today?", time: "10:30 AM" },
    { id: 2, sender: "user", text: "Can you send the quote for the Solid King Bed with Hydraulic Storage?", time: "10:31 AM" },
    { id: 3, sender: "bot", title: "SafeLock Quote Bot (BOT-01)", text: "Here is your VIP Quotation for Solid King Bed (Hydraulic Storage - BED-MOD-001) in 100% Solid CP Teak Wood: MRP ₹1,11,000 ➔ Showroom Price: ₹89,790 (Save ₹21,210). 10-Year Warranty included! Would you like to reserve with 50% advance token?", time: "10:31 AM" }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  // Dual-Brain NLP Intelligence & Security Firewall Engine
  const generateAiReply = (rawQuery, mode) => {
    const q = (rawQuery || '').toLowerCase().trim();

    if (mode === 'DIRECTOR') {
      // 👑 EXECUTIVE DIRECTOR VIP COPILOT (UNRESTRICTED ACCESS)
      // 1. Bank Balances & UTR Transactions
      if (q.includes('bank') || q.includes('utr') || q.includes('hdfc') || q.includes('sbi') || q.includes('account') || q.includes('ledger')) {
        const hdfc = bankAccounts?.find(b => (b.id || '').includes('HDFC'))?.currentBalance || 3842500;
        const sbi = bankAccounts?.find(b => (b.id || '').includes('SBI'))?.currentBalance || 1480000;
        const recentTxns = (bankTransactions || []).slice(0, 3).map(t => 
          `• [${t.flowType === 'INWARD_CREDIT' ? '🟢' : '🔴'}] ${t.partyName}: ₹${Number(t.amount || 0).toLocaleString()} (UTR: ${t.utrNumber})`
        ).join('\n');
        return {
          title: "👑 Executive Bank Ledger Radar (Director Access)",
          text: `Namaskar Director Rakesh! 🏦 Live Dual-Ledger Status:\n• HDFC Operating A/c: ₹${hdfc.toLocaleString()}\n• SBI Commercial A/c: ₹${sbi.toLocaleString()}\n• Total Liquid Cash: ₹${(hdfc + sbi).toLocaleString()}\n\nRecent Transactions:\n${recentTxns || '• All accounts reconciled.'}`
        };
      }

      // 2. Hot Leads & Inquiries
      if (q.includes('lead') || q.includes('inquiry') || q.includes('concierge') || q.includes('hot') || q.includes('walkin') || q.includes('crm')) {
        const inqs = inquiries || [];
        const topLeads = inqs.slice(0, 3).map(i => 
          `• ${i.Customer_Name} (📞 ${i.Customer_Phone}): ${i.Category_Models} | ₹${Number(i.Budget_INR || 0).toLocaleString()} [${i.AI_Intent_Score || '80%'}]`
        ).join('\n');
        return {
          title: "👑 24/7 AI Concierge & Walk-In Radar",
          text: `📊 We have ${inqs.length} total inquiries logged across showroom and mobile.\n\nTop Priority Leads:\n${topLeads || '• No urgent leads.'}\n\n💡 5-Minute hot leads from the AI Concierge are tagged for immediate Director privilege callback.`
        };
      }

      if (q.includes('sale') || q.includes('collection') || q.includes('today') || q.includes('revenue') || q.includes('billing')) {
        const totalSales = orders.reduce((sum, o) => sum + (Number(o.Total_Amount || o.Total_Amount_INR || 0)), 0) || 482500;
        const totalCash = 115000;
        const totalUpi = totalSales - totalCash;
        return {
          title: "👑 Executive BI Copilot (Director Access)",
          text: `Namaskar Director Rakesh! 📊 Today's Total Showroom Billing is ₹${totalSales.toLocaleString()} across ${orders.length || 3} orders.\n• 💵 Cash in Register: ₹${totalCash.toLocaleString()}\n• 💳 HDFC UPI / Card: ₹${totalUpi.toLocaleString()}\n• 📈 Estimated Gross Margin: ₹${Math.round(totalSales * 0.308).toLocaleString()} (30.8%)\n• 🔒 SafeLock Reserved Units: 6 Pieces.`
        };
      }

      if (q.includes('cost') || q.includes('margin') || q.includes('profit') || q.includes('supplier') || q.includes('wholesale')) {
        const bedItem = catalog.find(c => c.SKU === 'BED-MOD-001') || catalog[0] || {};
        const factoryCost = 62000;
        const selling = bedItem.Selling_Price_INR || 89790;
        const margin = selling - factoryCost;
        const marginPct = ((margin / selling) * 100).toFixed(1);
        return {
          title: "👑 Factory Cost & Margin Audit (Director Access)",
          text: `🏭 Supplier Margin Breakdown for ${bedItem.Product_Name || 'King Bed'} (${bedItem.SKU || 'BED-MOD-001'}):\n• Factory Supplier: ${bedItem.Default_Supplier || 'Royal Teak Crafts, Saharanpur (UP)'}\n• Direct Purchase Cost: ₹${factoryCost.toLocaleString()}\n• Showroom Retail Price: ₹${selling.toLocaleString()}\n• Net Gross Margin: ₹${margin.toLocaleString()} (${marginPct}%)\n• Warehouse Stock in Dock-A1: 3 Units available.`
        };
      }

      if (q.includes('stock') || q.includes('inventory') || q.includes('buffer') || q.includes('low stock') || q.includes('warehouse')) {
        const lowItems = inventory.filter(i => i.Warehouse_Qty <= (i.Buffer_Threshold || 2));
        const names = lowItems.map(i => `• ${i.SKU} (${i.Product_Name}): ${i.Warehouse_Qty} left (Buffer: ${i.Buffer_Threshold || 2})`).join('\n');
        return {
          title: "👑 Real-Time Stockout Defense Alert",
          text: `⚠️ Critical Buffer Warning! ${lowItems.length || 3} SKUs require immediate factory replenishment:\n${names || '• BED-MOD-001 (1 unit left)\n• ALM-MOD-001 (1 unit left)\n• DIN-MOD-001 (0 units left)'}\n\nFactory Purchase Order #PO-2026-881 is ready for 1-click dispatch to Saharanpur.`
        };
      }

      if (q.includes('balance') || q.includes('pending') || q.includes('due') || q.includes('receivable') || q.includes('owe')) {
        const pendingOrders = orders.filter(o => {
          const bal = Number(o.Balance_Due_INR || o.Balance_Due || (Number(o.Total_Amount_INR || 0) - Number(o.Advance_Paid_INR || 0)));
          return bal > 0;
        });
        const dueList = pendingOrders.slice(0, 3).map(o => 
          `• ${o.Customer_Name} (${o.Project_Address || o.Address || 'Rayagada'}): ₹${Number(o.Balance_Due_INR || o.Balance_Due || 50000).toLocaleString()} balance (📞 ${o.Customer_Phone || o.Phone || 'N/A'})`
        ).join('\n');
        return {
          title: "👑 Receivables & Customer Dues",
          text: `💰 Outstanding Receivables Summary (${pendingOrders.length} orders):\n${dueList || '• All active orders 100% settled.'}`
        };
      }

      return {
        title: "👑 Executive Director Copilot",
        text: `Namaskar Director Rakesh! 🔓 VIP Executive Mode Active. Full 43-Table Google Sheets telemetry online. You can ask me for today's bank balance, UTR status, hot concierge leads, sales collections, factory purchase costs, profit margins, low stock alerts, or customer balances.`
      };
    }

    // 👤 PUBLIC CUSTOMER FIREWALL MODE (GUARDED)
    // Security Guardrail 1: Cost / Profit / Wholesale Probes
    if (q.includes('cost') || q.includes('purchase price') || q.includes('wholesale') || q.includes('factory price') || q.includes('margin') || q.includes('profit') || q.includes('how much you buy')) {
      return {
        title: "🛡️ AI Security Shield (Brand Statement)",
        text: `Namaskar! As an authorized Godrej Interio flagship showroom, all our luxury solid teak and modular furniture are priced under official factory MRP with exclusive showroom festive discounts and a 10-Year Manufacturer Warranty. How can I assist you with your bedroom or living room decor selection today?`
      };
    }

    // Security Guardrail 2: Customer Privacy / PII Probes
    if (q.includes('who bought') || q.includes('customer phone') || q.includes('customer address') || q.includes('dr. jena') || q.includes('other customer') || q.includes('sales record') || q.includes('invoice list')) {
      return {
        title: "🛡️ Privacy Guard (Confidential Policy)",
        text: `We strictly adhere to enterprise customer data protection policies and cannot disclose private client transactions or contact records. We would be delighted to assist you with your personal home furniture requirements!`
      };
    }

    // Security Guardrail 3: Extreme Bargaining / Unrealistic Discounts
    if (q.includes('40%') || q.includes('50%') || q.includes('cheap') || q.includes('bargain') || q.includes('lowest price') || q.includes('half price')) {
      return {
        title: "🏷️ Showroom Festive Policy",
        text: `Our maximum authorized showroom festive discount for 100% Solid CP Teak luxury suites is up to 8% with complimentary delivery & hydraulic installation in Rayagada. For customized corporate or whole-villa architectural projects, our Showroom Director Mr. Rakesh (+91 93905 53301) can arrange a personalized VIP appointment.`
      };
    }

    // Security Guardrail 4: Prompt Injections & Jailbreaks
    if (q.includes('system prompt') || q.includes('ignore previous') || q.includes('ignore instruction') || q.includes('database password') || q.includes('admin mode') || q.includes('jailbreak')) {
      return {
        title: "🛡️ System Integrity Guardrail",
        text: `Namaskar! I am the Godrej Interio Rayagada AI Assistant. I can only assist you with furniture specifications, bedroom suite combinations, showroom visits, and express delivery tracking.`
      };
    }

    // Product Inquiry Matcher
    const matched = catalog.find(c => 
      q.includes(c.SKU.toLowerCase()) || 
      q.includes(c.Product_Name.toLowerCase()) || 
      (q.includes('bed') && c.Main_Category === 'Bedroom') ||
      (q.includes('wardrobe') && c.Main_Category === 'Storage & Wardrobes') ||
      (q.includes('almirah') && c.Main_Category === 'Storage & Wardrobes') ||
      (q.includes('sofa') && c.Main_Category === 'Living Room') ||
      (q.includes('dining') && c.Main_Category === 'Dining & Study') ||
      (q.includes('chair') && c.Main_Category === 'Living Room')
    );

    if (matched) {
      const mrp = matched.MRP_INR || 111000;
      const sp = matched.Selling_Price_INR || 89790;
      const save = mrp - sp;
      return {
        title: `🛋️ ${matched.Product_Name}`,
        text: `Here is the official quote for ${matched.Product_Name} (${matched.SKU}):\n• Material: ${matched.Material_Spec || '100% Solid CP Teak Wood'}\n• Dimensions: ${matched.Dimensions || 'Standard'}\n• MRP: ₹${mrp.toLocaleString()}\n• ⚡ Showroom Festive Price: ₹${sp.toLocaleString()} (Save ₹${save.toLocaleString()})\n• 🛡️ Warranty: ${matched.Warranty_Years || 10} Years Godrej Warranty.\nWould you like to reserve this unit with a 50% SafeLock token?`
      };
    }

    // Showroom Address & Hours
    if (q.includes('where') || q.includes('address') || q.includes('location') || q.includes('timing') || q.includes('open') || q.includes('hours') || q.includes('contact')) {
      return {
        title: "📍 Showroom Location & Timings",
        text: `📍 Godrej Interio Flagship Showroom (Shree Ganesh Enterprises)\nMain Road, Near New Bus Stand, Rayagada, Odisha 765001.\n\n⏰ Showroom Hours: 10:00 AM – 8:30 PM (Open All 7 Days)\n📞 Contact / WhatsApp: +91 93905 53301 / 94370 12345.\nGoogle Maps: https://maps.google.com/?q=Godrej+Interio+Rayagada`
      };
    }

    // Delivery & Order Tracking
    if (q.includes('delivery') || q.includes('track') || q.includes('order') || q.includes('status') || q.includes('dispatch')) {
      return {
        title: "🚚 Express SafeLock Delivery",
        text: `All showroom SafeLock orders are scheduled for express insured transport with hydraulic assembly technicians. Please share your 4-digit Order ID (e.g., ORD-8921) to view your live GPS delivery ETA!`
      };
    }

    // Fallback Customer Assistance
    return {
      title: "Godrej Interio Assistant",
      text: `Namaskar! Thank you for contacting Godrej Interio Rayagada. Our showroom executive has received your request regarding: "${rawQuery}". We have over 115 luxury bedroom, living room, and modular storage designs ready for express delivery in Rayagada. How can we assist you today?`
    };
  };

  const handleSendChat = (customText = null) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      sender: "user", 
      text: textToSend, 
      time: "Just Now",
      callerRole: callerMode
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMsg('');
    playScanBeep();

    setTimeout(() => {
      const reply = generateAiReply(textToSend, callerMode);
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        title: reply.title,
        text: reply.text,
        time: "Just Now",
        isDirector: callerMode === 'DIRECTOR'
      };
      setChatMessages(prev => [...prev, botReply]);
      playSuccessChime();
    }, 500);
  };

  const handleTestBot = (b) => {
    triggerAppSheetBot(b.botId, b.name);

    // Auto-switch to SPLIT view if in GRID mode so user sees the live phone response immediately!
    if (viewMode === 'GRID') {
      setViewMode('SPLIT');
    }

    // Default rich template mapping for all 20 bots
    // Default rich template mapping with dynamic placeholders for all 22 bots
    const defaultBotTemplates = {
      'BOT-01': "Namaskar {Customer_Name}! 🙏\nYour Godrej Interio order {Order_ID} is SAFELOCKED.\n• Item: {Product_Name} ({SKU})\n• Advance Token: ₹{Advance_Amount}\n• Est Delivery: {Delivery_Date}\nShowroom Helpline: +91 93905 53301.",
      'BOT-02': "⚡ ATOMIC INVENTORY HOLD:\nSKU {SKU} locked in Dock-A1 for order {Order_ID} ({Customer_Name}).\nStock decremented across all 16 terminals in <50ms.",
      'BOT-03': "📦 DOCK-A1 GATEPASS VERIFIED\nOrder: {Order_ID} ({Customer_Name})\nSKU: {SKU} (119.2 KG Total)\n• Box A (Headboard): VERIFIED ✓\n• Box B (Hydraulic): VERIFIED ✓\n• Box C (Rails): VERIFIED ✓\n• Box D (Hardware): VERIFIED ✓\nStatus: APPROVED FOR TRUCK LOADING.",
      'BOT-04': "🚚 OUT FOR DELIVERY!\nNamaskar {Customer_Name}, your order {Order_ID} is on route!\n• Driver: {Driver_Name} ({Driver_Phone})\n• Vehicle: {Vehicle_Number}\n• 🔒 Your Secure Delivery OTP: {OTP}",
      'BOT-05': "📍 DIGITAL ePOD PROOF LOCKED\nOrder: {Order_ID}\nCustomer Signature: Verified ({Customer_Name})\nGeotag: Lat 19.1672, Long 83.4156 (Rayagada)\nProof synced to Google Drive & Sheet 7 ✓",
      'BOT-06': "💳 PAYMENT SETTLEMENT CONFIRMED\nOrder: {Order_ID} ({Customer_Name})\nBalance Amount Paid: ₹{Balance_Amount} via Dynamic UPI\nTransaction: UPI-{Order_ID}-SUCCESS\nOutstanding Due: ₹0.00 (Fully Settled ✓)",
      'BOT-07': "🏛️ VIP ARCHITECT COMMISSION LEDGER\nPartner: {Architect_Name}\nReferred Order: {Order_ID} ({Customer_Name})\nCommission Earned: ₹6,651\nPayout Status: CREDITED TO UPI (partner@upi) ✓",
      'BOT-08': "🏭 AUTOPROCURE REORDER PO #PO-2026-881\nTo: {Supplier_Name}\nItem: {Product_Name} ({SKU})\nQty: 5 Sets (5-Box Kits) | Factory Cost: ₹3,10,000\nPO Logged in Sheet 9 ➔ Supplier Notified ✓",
      'BOT-09': "🔨 CARPENTER WORK ORDER DISPATCH\nCarpenter: Ramesh Mistri\nCustomer: {Customer_Name}, {Address}\nTask: {Product_Name} Hydraulic Assembly (5 Boxes)\nWage Voucher: ₹500 (Credited upon sign-off)",
      'BOT-10': "🔄 FURNITURE EXCHANGE VALUATION\nCustomer: {Customer_Name}\nOld Furniture: Solid Wood Double Bed\nApproved Buyback Voucher: ₹6,500\nApplied against new King Bed booking {Order_ID} ✓",
      'BOT-11': "✨ GODREJ INTERIO RAYAGADA FESTIVE EXCLUSIVE ✨\nNamaskar {Customer_Name}! Upgrade your bedroom this season.\nGet up to ₹21,000 Showroom Savings + Free Hydraulic Installation on Solid Teak Suites!\nShowroom Helpline: +91 93905 53301.",
      'BOT-12': "👑 9:00 PM SHOWROOM EXECUTIVE CLOSING SLIP\nStore: Godrej Interio Rayagada (Shree Ganesh Enterprises)\n• Total Today Billing: ₹4,82,500\n• Cash in Drawer: ₹1,15,000\n• UPI & Bank Collections: ₹3,67,500\n• Gross Profit Margin: 30.8% (₹1,48,610)\nSheet 11 (Daily_Sales_Summary) Locked ✓",
      'BOT-13': "📐 CLEARANCE & FITMENT AUDIT\nOrder: {Order_ID} ({Customer_Name})\nDoorway Clearance: 38\" Verified Safe ✓\nPackaging: 5-Box Flatpack Knockdown Safe for Stairways.",
      'BOT-14': "🎉 0% NO-COST EMI FINANCING OPTIONS\nOrder: {Order_ID} ({Customer_Name} - ₹{Amount})\n• 3 Months: ₹{EMI_3M}/mo\n• 6 Months: ₹{EMI_6M}/mo\n• 9 Months: ₹{EMI_9M}/mo\nZero Down-Payment with Bajaj Finserv at Rayagada Store!",
      'BOT-15': "🛡️ OFFICIAL 10-YEAR WARRANTY CERTIFICATE\nDear {Customer_Name}, congratulations on your new {Product_Name}!\n• Serial No: GI-RAY-2026-881\n• Coverage: 10 Years Comprehensive Godrej Warranty\nPDF Certificate: https://godrejinterio.com/warranty/{Order_ID}",
      'BOT-16': "🔥 WALK-IN HOT LEAD ALERT\nLead: {Customer_Name} ({Address})\nProduct Scanned: {Product_Name} ({SKU})\nAI Interest Score: 94% (Hot Buyer)\nFollow-up Task Assigned to Sales Desk ✓",
      'BOT-17': "🛡️ DATABASE INTEGRITY & DEDUPLICATION\nScanned all 21 Google Sheets tables.\n0 duplicate rows found. Index integrity 100% verified.",
      'BOT-18': "🏭 FACTORY SHIPMENT INWARD QC\nSupplier: {Supplier_Name}\nPO: #PO-2026-881 | Cartons: 10/10 Verified\nZero Transit Damage ➔ Stock Added to Dock-A1 ✓",
      'BOT-19': "📊 STORE TARGET PACING GAUGE\nToday Achieved: ₹1,69,000 (112% of Daily Target)\nMonthly Run-Rate: ₹38.45L / ₹45.00L (85.4% Achieved) ✓",
      'BOT-20': "🔄 MASTER 2-WAY CLOUD WEBHOOK ENGINE\nLive Bi-Directional Webhook Active with Google Apps Script.\nAll 21 tables synchronized in real-time.",
      'BOT-21': "🚨 FLOOR AGING DISPLAY ALERT — GODREJ INTERIO RAYAGADA\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nModel: {Product_Name} ({SKU})\n⏱️ Display Age: 52 Days in Bay 3 (₹78,000 Capital Locked)\n\n⚡ Recommended Action:\n1. Launch 20% Flash Clearance Flyer\n2. Swap display piece with fresh warehouse carton stock.",
      'BOT-22': "👑 VIP TURNKEY VILLA MILESTONE CONFIRMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNamaskar {Customer_Name}! 🙏\nYour {Address} Villa Bedroom Suite is 100% staged!\n\n• Total Project Value: ₹{Amount}\n• Stage 1 (50% Booking Advance): ₹{Advance_Amount} [PAID ✓]\n• Stage 2 (40% Factory Dispatch): ₹{Stage2_Amount} [DUE ON LOADING]\n• Stage 3 (10% Final Assembly): ₹{Stage3_Amount} [UPON MISTRI SIGN-OFF]\n\nShowroom Helpline: +91 93905 53301 | Shree Ganesh Enterprises",
      'BOT-23': "🏭 FACTORY PO & LR BILTY SYNCED\nPO: {PO_Number} ({Manufacturer_Plant})\n• Transporter: {Transporter} | LR Bilty #: {LR_Number}\n• Expected Delivery: {Expected_Delivery} | Status: IN_TRANSIT ✓\nWarehouse receiving dock alerted for carton barcode scanning upon arrival.",
      'BOT-24': "💳 MULTI-TENDER SPLIT SETTLEMENT LEDGER\nOrder: {Order_ID} ({Customer_Name})\n• Cash Drawer: ₹45,000 | Dynamic UPI: ₹33,247\n• Total Settled: ₹78,247 | Balance Due: ₹0.00 ✓\nInstant split receipt dispatched to WhatsApp.",
      'BOT-25': "⭐ POST-ASSEMBLY VIP 5-STAR REVIEW INVITATION\nNamaskar {Customer_Name}! 🙏\nMaster Carpenter Ramesh Mistri has finished your {Product_Name} installation.\nAre you enjoying your new bedroom suite? Tap here to leave a 5-star Google review & receive your Free Wood Care Kit voucher!",
      'BOT-26': "📋 COMMERCIAL VIP QUOTE PRICE-LOCK REMINDER\nNamaskar {Customer_Name}! Your VIP tender quote for {Product_Name} has a 72-hour price-lock guarantee.\nLock in your 18% corporate festive rebate before container allocations close tomorrow!",
      'BOT-27': "🤖 24/7 CONCIERGE FLOOR TOUR RECOVERY\nNamaskar {Customer_Name}! We noticed you loved the Solid Teak Bedroom Suite today at our Rayagada showroom.\nHere is a 360° video walkthrough of the hydraulic storage mechanism. Reply 'DISCOUNT' for a ₹5,000 spot booking token.",
      'BOT-28': "💰 9:30 PM SHOWROOM PROFIT & MARGIN RADAR AUDIT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nStore: Godrej Interio Rayagada (Shree Ganesh Enterprises)\n• Invoiced Turnover: ₹2,56,41,407\n• Landed Factory COGS: ₹1,70,51,536\n• Gross Showroom Margin: ₹85,89,871 (33.5%)\n• Direct Variable Deductions:\n  - Architect Payout (8.5%): ₹5,82,310\n  - Carpenter Assembly (₹500): ₹1,20,000\n  - Delivery Freight & Diesel: ₹2,15,400\n• Pure Realized Net Profit: ₹61,80,351 (24.1% Margin)\nAudit locked to Profit_Radar_Audit_Log & Webhook Verified ✓",
      'BOT-29': "🛡️ DEALER GROSS MARGIN & DISCOUNT GUARD\nOrder: {Order_ID} ({Customer_Name})\nRequested Discount: 8.5% | Approved Floor Margin: 24.1% (Safe ✓)\nMargin Guard rule passed: Dealer net margin remains above mandatory 15% threshold."
    };

    // Resolve the active order dynamically based on the selected customer/order filter
    const activeOrder = (selectedCustomerFilter && selectedCustomerFilter !== 'ALL')
      ? (orders.find(o => o.Order_ID === selectedCustomerFilter || o.Customer_Name === selectedCustomerFilter) || {
          Customer_Name: selectedCustomerFilter,
          Order_ID: "ORD-9988",
          Total_Amount_INR: 156494,
          Advance_Paid_INR: 78247,
          Balance_Due_INR: 78247,
          Ordered_SKU: "Solid King Bed (Hydraulic Storage)",
          SKU: "BED-MOD-001",
          Estimated_Delivery: "Today 04:30 PM",
          Project_Address: "Rayagada, Odisha",
          Assigned_Driver: "Tophan Gouda",
          Driver_Phone: "+91 94371 55667",
          Vehicle_Number: "Tata Ace (OD-18-A-1234)",
          Delivery_OTP: "849201"
        })
      : (orders[0] || {});

    const custName = activeOrder.Customer_Name || 'Valued Client';
    const ordId = activeOrder.Order_ID || 'ORD-8921';
    const totAmount = Number(activeOrder.Total_Amount_INR || activeOrder.Total_Amount || 156494);
    const advAmount = Number(activeOrder.Advance_Paid_INR || activeOrder.Advance_Paid || Math.round(totAmount * 0.5));
    const balAmount = Number(activeOrder.Balance_Due_INR || (totAmount - advAmount));
    const st2Amount = Math.round(totAmount * 0.4);
    const st3Amount = totAmount - advAmount - st2Amount;
    const emi3Val = Math.round(totAmount / 3);
    const emi6Val = Math.round(totAmount / 6);
    const emi9Val = Math.round(totAmount / 9);
    const prodName = activeOrder.Ordered_SKU || activeOrder.Product_Name || activeOrder.Item_Names || 'Solid King Bed (Hydraulic Storage)';
    const skuCode = activeOrder.SKU || 'BED-MOD-001';
    const estDelivery = activeOrder.Estimated_Delivery || activeOrder.Delivery_Schedule || 'Today 04:30 PM';
    const projAddress = activeOrder.Project_Address || activeOrder.Delivery_Address || 'Gayatri Nagar, Rayagada';
    const drvName = activeOrder.Assigned_Driver || 'Tophan Gouda';
    const drvPhone = activeOrder.Driver_Phone || '+91 94371 55667';
    const vehNumber = activeOrder.Vehicle_Number || 'Tata Ace (OD-18-A-1234)';
    const delOtp = activeOrder.Delivery_OTP || activeOrder.OTP_Code || '849201';
    const arcName = activeOrder.Architect_Name || 'Ar. Sunita Patnaik (Studio Vastu)';
    const supName = activeOrder.Supplier || 'Royal Teak Crafts, Saharanpur (UP)';

    let rawTemplate = b.customTemplate || defaultBotTemplates[b.botId] || `⚡ Automated Cloud Trigger Executed for ${b.botId}: Target [${b.target}]. Status: EXECUTED_SUCCESS ✓`;

    let formattedText = rawTemplate
      .replace(/{Customer_Name}/g, custName)
      .replace(/{Order_ID}/g, ordId)
      .replace(/{Product_Name}/g, prodName)
      .replace(/{SKU}/g, skuCode)
      .replace(/{Amount}/g, totAmount.toLocaleString())
      .replace(/{Advance_Amount}/g, advAmount.toLocaleString())
      .replace(/{Balance_Amount}/g, balAmount.toLocaleString())
      .replace(/{Stage2_Amount}/g, st2Amount.toLocaleString())
      .replace(/{Stage3_Amount}/g, st3Amount.toLocaleString())
      .replace(/{EMI_3M}/g, emi3Val.toLocaleString())
      .replace(/{EMI_6M}/g, emi6Val.toLocaleString())
      .replace(/{EMI_9M}/g, emi9Val.toLocaleString())
      .replace(/{Delivery_Date}/g, estDelivery)
      .replace(/{Address}/g, projAddress)
      .replace(/{Driver_Name}/g, drvName)
      .replace(/{Driver_Phone}/g, drvPhone)
      .replace(/{Vehicle_Number}/g, vehNumber)
      .replace(/{OTP}/g, delOtp)
      .replace(/{Architect_Name}/g, arcName)
      .replace(/{Supplier_Name}/g, supName)
      .replace(/{UPI_ID}/g, '9390553301@ybl');

    const newBotMsg = {
      id: Date.now(),
      sender: "bot",
      title: `${b.name} (${b.botId})`,
      text: formattedText,
      time: "Just Now",
      isDirector: ['BOT-08', 'BOT-12', 'BOT-17', 'BOT-19', 'BOT-20', 'BOT-21', 'BOT-22', 'BOT-24'].includes(b.botId)
    };

    setChatMessages(prev => [...prev, newBotMsg]);
    playSuccessChime();

    dispatchWebhookAction('TEST_BOT_DISPATCH', {
      bot_id: b.botId,
      bot_name: b.name,
      phone: "+91 93905 53301",
      message_preview: formattedText.substring(0, 100),
      trigger_type: "MANUAL_TEST_FORCE_RESEND",
      status: "DISPATCHED ✓ (99.4% Delivery)"
    });

    showToast(`⚡ Dispatched webhook for ${b.botId} (${b.name}) & logged to WhatsApp_Dispatches_Log!`, true);
  };

  // Helper to categorize bots
  const getBotCategory = (botId) => {
    const idNum = parseInt(botId.replace('BOT-', ''), 10);
    if ([1, 14, 16, 26, 27].includes(idNum)) return 'SALES';
    if ([2, 3, 13, 18, 21].includes(idNum)) return 'WAREHOUSE';
    if ([4, 5, 6, 9, 25].includes(idNum)) return 'LOGISTICS';
    if ([7, 10, 12, 19, 23, 24].includes(idNum)) return 'FINANCE';
    return 'SYSTEM';
  };

  const filteredBots = bots.filter(b => {
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.botId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.target || '').toLowerCase().includes(searchQuery.toLowerCase());

    const botCat = getBotCategory(b.botId);
    const matchesCategory = 
      categoryFilter === 'ALL' ? true :
      categoryFilter === 'ACTIVE' ? b.status !== 'PAUSED' :
      categoryFilter === 'PAUSED' ? b.status === 'PAUSED' :
      botCat === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald">🤖 WHATSAPP & 22 APPSHEET CLOUD BOTS</span>
          <span className="badge badge-purple">{bots.filter(b => b.status !== 'PAUSED').length}/{bots.length} ACTIVE</span>
          
          <button className="btn-luxury-gold" onClick={() => openModal('bulk_bot_broadcast')} style={{ fontSize: '11px', padding: '5px 10px' }}>
            📢 Bulk 500 Broadcast
          </button>
        </div>

        {/* Center View Mode Switcher */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className={`btn-ghost-edit ${viewMode === 'GRID' ? 'badge-gold' : ''}`}
            onClick={() => setViewMode('GRID')}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <LayoutGrid size={12} /> 🎛️ Control Tower
          </button>
          
          <button 
            className={`btn-ghost-edit ${viewMode === 'SPLIT' ? 'badge-gold' : ''}`}
            onClick={() => setViewMode('SPLIT')}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Columns size={12} /> ⚡ Dual View
          </button>

          <button 
            className={`btn-ghost-edit ${viewMode === 'PHONE' ? 'badge-gold' : ''}`}
            onClick={() => setViewMode('PHONE')}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Smartphone size={12} /> 📱 Phone Simulator
          </button>
        </div>

        {/* Right Cross-Tab Quick Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('voice_pos');
              showToast("🎙️ Switched to Voice POS & Quote Studio!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Mic size={12} /> <span>Voice POS</span>
          </button>

          <button 
            className="btn-emerald" 
            onClick={() => {
              setActiveTab('safelock');
              showToast("🔒 Switched to SafeLock Inventory Terminal!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ShieldCheck size={12} /> <span>SafeLock Stock</span>
          </button>

          <button 
            className="btn-purple" 
            onClick={() => {
              setActiveTab('logistics_epod');
              showToast("🚚 Switched to Logistics Fleet & ePOD!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Truck size={12} /> <span>Fleet & ePOD</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>
        </div>

      </div>

      {/* Global AI Quick-Prompt Demo Control Bar */}
      <div className="glass-panel" style={{ padding: '12px 18px', background: 'linear-gradient(135deg, rgba(11,19,43,0.9), rgba(15,23,42,0.95))', border: '1.5px solid rgba(212,175,55,0.4)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold" style={{ fontSize: '11px', fontWeight: '900', padding: '4px 10px' }}>
              ⚡ 1-CLICK AI QUICK-PROMPT TOOLBAR
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Click any prompt below to fire live AI chat & observe real-time response:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setCallerMode('CUSTOMER');
                if (viewMode === 'GRID') setViewMode('SPLIT');
                showToast("👤 Switched to Public Customer Mode");
              }}
              style={{
                background: callerMode === 'CUSTOMER' ? 'linear-gradient(135deg, #10B981, #047857)' : 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: callerMode === 'CUSTOMER' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              👤 Customer Prompts (Firewall Guarded)
            </button>
            <button
              type="button"
              onClick={() => {
                setCallerMode('DIRECTOR');
                if (viewMode === 'GRID') setViewMode('SPLIT');
                showToast("👑 Switched to Director VIP Mode (PIN: 8899)");
              }}
              style={{
                background: callerMode === 'DIRECTOR' ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'rgba(255,255,255,0.08)',
                color: callerMode === 'DIRECTOR' ? '#000000' : '#FFFFFF',
                border: callerMode === 'DIRECTOR' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              👑 Director VIP Prompts (Unrestricted BI)
            </button>
          </div>
        </div>

        {/* Customer Spotlight Selector for Simulation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', margin: '8px 0 12px 0' }}>
          <CustomerOrderSearchSelector
            selectedOrderId={selectedCustomerFilter === 'ALL' ? '' : selectedCustomerFilter}
            onSelectOrder={(orderId, orderObj) => {
              setSelectedCustomerFilter(orderId || 'ALL');
              if (orderObj) {
                showToast(`👤 Loaded ${orderObj.Customer_Name} (#${orderObj.Order_ID}) into AI Bot Simulator!`);
              }
            }}
            placeholder="🔍 Spotlight Customer for Bot Simulation..."
            allLabel="Generic Client Mode (No Filter)"
            style={{ width: '360px' }}
          />
        </div>

        {/* Interactive Prompt Pills Strip */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedCustomerFilter !== 'ALL' && (() => {
            const activeOrder = orders.find(o => o.Order_ID === selectedCustomerFilter);
            if (!activeOrder) return null;
            return (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === 'GRID') setViewMode('SPLIT');
                    handleSendChat(`Send delivery dispatch OTP for order #${activeOrder.Order_ID} for ${activeOrder.Customer_Name}`);
                  }}
                  style={{
                    background: 'rgba(56,189,248,0.2)',
                    color: 'var(--accent-cyan)',
                    border: '1.5px solid var(--accent-cyan)',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ BOT-04: Dispatch OTP to {activeOrder.Customer_Name.split(' ')[0]}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === 'GRID') setViewMode('SPLIT');
                    handleSendChat(`Send official 10-Year Warranty PDF certificate for order #${activeOrder.Order_ID} (${activeOrder.Customer_Name})`);
                  }}
                  style={{
                    background: 'rgba(212,175,55,0.2)',
                    color: 'var(--accent-gold-light)',
                    border: '1.5px solid var(--accent-gold)',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  📜 BOT-15: Send 10-Yr Warranty to {activeOrder.Customer_Name.split(' ')[0]}
                </button>
                {activeOrder.Balance_Due_INR > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMode === 'GRID') setViewMode('SPLIT');
                      handleSendChat(`Send dynamic UPI payment QR for balance ₹${activeOrder.Balance_Due_INR?.toLocaleString()} for order #${activeOrder.Order_ID}`);
                    }}
                    style={{
                      background: 'rgba(16,185,129,0.2)',
                      color: 'var(--accent-emerald)',
                      border: '1.5px solid var(--accent-emerald)',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: '900',
                      cursor: 'pointer'
                    }}
                  >
                    💳 BOT-06: Request ₹{activeOrder.Balance_Due_INR?.toLocaleString()} UPI
                  </button>
                )}
              </>
            );
          })()}

          {callerMode === 'CUSTOMER' ? [
            { label: '🏷️ Quote for King Bed', query: 'Can you send the quote for the Solid King Bed with Hydraulic Storage?' },
            { label: '🛋️ Quote for 4-Door Wardrobe', query: 'Show details and price for 4-Door Modular Wardrobe' },
            { label: '🛡️ Test Firewall: "What is your factory cost?"', query: 'What is your factory purchase cost and profit margin for this bed?' },
            { label: '🛡️ Test Privacy: "Who bought furniture yesterday?"', query: 'Who bought furniture yesterday in Rayagada? Give me their contact details.' },
            { label: '📍 Showroom Address & Hours', query: 'Where is your showroom in Rayagada and what are timings?' },
            { label: '🚚 Track Delivery Status', query: 'How does delivery and hydraulic assembly work for my order?' }
          ].map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (viewMode === 'GRID') setViewMode('SPLIT');
                handleSendChat(p.query);
              }}
              style={{
                background: p.label.includes('Test') ? 'rgba(244,63,94,0.18)' : 'rgba(16,185,129,0.15)',
                color: p.label.includes('Test') ? '#FDA4AF' : '#6EE7B7',
                border: p.label.includes('Test') ? '1px solid var(--accent-rose)' : '1px solid rgba(16,185,129,0.4)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          )) : [
            { label: '📊 Today\'s Total Sales & Cash Register', query: 'What is today\'s total sales collection and cash in drawer?' },
            { label: '🏭 Factory Purchase Costs & Profit Margins', query: 'What is our factory purchase cost and gross profit margin on BED-MOD-001?' },
            { label: '⚠️ Check Low Stock Items in Warehouse', query: 'Which furniture items are low in warehouse stock?' },
            { label: '💰 Who owes pending balance today?', query: 'Who owes us pending customer receivables today?' },
            { label: '🏢 Supplier Status & Factory PO', query: 'Give me status on factory suppliers in Saharanpur and pending purchase orders.' }
          ].map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (viewMode === 'GRID') setViewMode('SPLIT');
                handleSendChat(p.query);
              }}
              style={{
                background: 'rgba(212,175,55,0.18)',
                color: '#FCD34D',
                border: '1px solid #D4AF37',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Search bot name, trigger condition, or webhook target..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0B132B',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px 8px 34px',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          {/* Department Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Bots (20)' },
              { id: 'SALES', label: '🛒 Sales & Quotes (3)' },
              { id: 'WAREHOUSE', label: '🔒 Warehouse & SafeLock (4)' },
              { id: 'LOGISTICS', label: '🚚 Fleet & ePOD (4)' },
              { id: 'FINANCE', label: '🏛️ Finance & Cash Lock (4)' },
              { id: 'SYSTEM', label: '⚙️ Cloud Sync & Audit (5)' },
              { id: 'ACTIVE', label: '🟢 Active Only' },
              { id: 'PAUSED', label: '⏸️ Paused Only' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`btn-ghost-edit ${categoryFilter === f.id ? 'badge-gold' : ''}`}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* VIEW MODE 1: FULL-WIDTH 20-BOT MASTER CONTROL TOWER (GRID) */}
      {viewMode === 'GRID' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {filteredBots.map((b, idx) => {
            const isPaused = b.status === 'PAUSED';
            const cat = getBotCategory(b.botId);

            return (
              <div 
                key={b.botId || idx}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  borderLeft: `5px solid ${isPaused ? '#64748B' : (b.color || '#D4AF37')}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  opacity: isPaused ? 0.65 : 1,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: '900', color: b.color || 'var(--accent-gold-light)' }}>
                        {b.botId}
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                        {cat}
                      </span>
                    </div>

                    <span className={`badge ${isPaused ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '9px', padding: '3px 8px' }}>
                      {isPaused ? '⏸️ PAUSED' : '🟢 ACTIVE'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    {b.name}
                  </h4>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    ⚡ <b>Trigger Rule:</b> <span style={{ color: '#FFFFFF' }}>{b.trigger}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                    🎯 <b>Target:</b> {b.target}
                  </div>

                  {b.threshold && (
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-gold-light)', marginTop: '4px' }}>
                      ⚙️ <b>Condition:</b> {b.threshold} • {b.schedule || 'Instant Webhook'}
                    </div>
                  )}

                  {/* Enterprise ROI & Health Telemetry Chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#CBD5E1', fontSize: '9px', padding: '2px 6px' }}>
                      📊 Dispatched: {Math.floor(250 + (idx * 17))}
                    </span>
                    <span className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', fontSize: '9px', padding: '2px 6px' }}>
                      🟢 99.4% Delivery
                    </span>
                    <span className="badge" style={{ background: 'rgba(212,175,55,0.12)', color: '#FCD34D', fontSize: '9px', padding: '2px 6px' }}>
                      🛡️ DND & Anti-Spam
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '4px' }}>
                  <button 
                    className="btn-ghost-edit" 
                    onClick={() => openModal('edit_bot_config', { bot: b })}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '8px 12px', color: 'var(--accent-gold-light)' }}
                  >
                    <Settings size={13} /> ⚙️ Configure Bot
                  </button>

                  <button 
                    className="btn-emerald" 
                    onClick={() => handleTestBot(b)}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '8px 12px' }}
                    title="Autonomous execution active. Click to test or manually force resend."
                  >
                    <Play size={13} /> ▶ Test / Force Resend
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: SPLIT DUAL VIEW (PHONE + BOTS LIST) */}
      {viewMode === 'SPLIT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Smartphone Simulator */}
          <div style={{ background: '#0B141B', border: '3.5px solid #334155', borderRadius: '32px', padding: '14px', height: '660px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(37,211,102,0.15)' }}>
            <div style={{ width: '100px', height: '12px', background: '#1E293B', borderRadius: '8px', margin: '0 auto 6px auto' }} />

            {/* Dual-Brain Caller Role Switcher */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', background: '#030712', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => {
                  setCallerMode('CUSTOMER');
                  showToast("👤 Switched to Public Customer View (Firewall Active)");
                }}
                style={{
                  flex: 1,
                  background: callerMode === 'CUSTOMER' ? 'linear-gradient(135deg, #10B981, #047857)' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 4px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                👤 Customer View
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallerMode('DIRECTOR');
                  showToast("👑 Switched to Director VIP Mode (PIN: 8899 Active)");
                }}
                style={{
                  flex: 1,
                  background: callerMode === 'DIRECTOR' ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'transparent',
                  color: callerMode === 'DIRECTOR' ? '#000000' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 4px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                👑 Director VIP (PIN: 8899)
              </button>
            </div>

            {/* WhatsApp Contact Header */}
            <div style={{ background: '#1F2C34', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: callerMode === 'DIRECTOR' ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'linear-gradient(135deg, #10B981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: callerMode === 'DIRECTOR' ? '#000' : '#FFF', fontSize: '12px' }}>
                  {callerMode === 'DIRECTOR' ? '👑' : 'GI'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>
                    {callerMode === 'DIRECTOR' ? 'Director Executive Copilot' : (storeMeta.storeName || 'Godrej Interio Rayagada')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: callerMode === 'DIRECTOR' ? '#F59E0B' : '#25D366' }}>
                    {callerMode === 'DIRECTOR' ? '👑 VIP Unrestricted Telemetry' : `Online • 24/7 AI (${storeMeta.whatsapp || '+91 93905 53301'})`}
                  </div>
                </div>
              </div>
              <button onClick={() => setChatMessages(prev => prev.slice(0, 3))} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} title="Reset Chat Screen">
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Security Shield Banner */}
            <div style={{ 
              background: callerMode === 'DIRECTOR' ? 'rgba(212,175,55,0.12)' : 'rgba(16,185,129,0.12)', 
              border: `1px solid ${callerMode === 'DIRECTOR' ? '#D4AF37' : '#10B981'}`, 
              borderRadius: '8px', 
              padding: '4px 8px', 
              marginBottom: '6px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '9.5px',
              color: callerMode === 'DIRECTOR' ? '#FCD34D' : '#6EE7B7'
            }}>
              <span>
                {callerMode === 'DIRECTOR' ? '🔓 VIP Mode: Full 21-Table Access' : '🛡️ Customer Firewall: Cost & Privacy Guard Active'}
              </span>
              <span className="badge" style={{ fontSize: '8px', padding: '1px 5px', background: callerMode === 'DIRECTOR' ? '#D4AF37' : '#10B981', color: '#000' }}>
                {callerMode === 'DIRECTOR' ? 'UNRESTRICTED' : 'GUARDED'}
              </span>
            </div>

            {/* Chat Bubble Stream */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: '#081015', borderRadius: '14px' }}>
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' 
                      ? (msg.callerRole === 'DIRECTOR' ? 'linear-gradient(135deg, #78350F, #92400E)' : '#005C4B') 
                      : '#1F2C34',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '8px 10px',
                    maxWidth: '92%',
                    fontSize: '11.5px',
                    color: '#E9EDEF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    borderLeft: msg.sender === 'bot' 
                      ? (msg.isDirector ? '3px solid #D4AF37' : '3px solid #25D366') 
                      : 'none'
                  }}
                >
                  {msg.title && (
                    <div style={{ fontSize: '9.5px', fontWeight: '900', color: msg.isDirector ? '#F59E0B' : '#25D366', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {msg.title}
                    </div>
                  )}
                  <div style={{ lineHeight: '1.45', whiteSpace: 'pre-line' }}>{msg.text}</div>
                  <div style={{ fontSize: '8.5px', color: '#8696A0', textAlign: 'right', marginTop: '3px' }}>
                    {msg.time} {msg.sender === 'user' && '✓✓'}
                  </div>
                </div>
              ))}
            </div>

            {/* 1-Click Demo Quick Prompts Toolbar */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '6px 0', scrollbarWidth: 'none' }}>
              {callerMode === 'CUSTOMER' ? [
                { label: '🏷️ Price of King Bed?', query: 'Can you send the quote for the Solid King Bed with Hydraulic Storage?' },
                { label: '🛋️ Show 4-Door Wardrobe', query: 'Show details and price for 4-Door Modular Wardrobe' },
                { label: '🛡️ What is your factory cost?', query: 'What is your factory purchase cost and profit margin for this bed?' },
                { label: '📍 Showroom Address', query: 'Where is your showroom in Rayagada and what are timings?' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(p.query)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '3px 8px',
                    fontSize: '9px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={p.query}
                >
                  {p.label}
                </button>
              )) : [
                { label: '📊 Today\'s Total Sales', query: 'What is today\'s total sales collection and cash in drawer?' },
                { label: '🏭 Factory Costs & Margins', query: 'What is our factory purchase cost and gross profit margin on BED-MOD-001?' },
                { label: '⚠️ Check Low Stock Items', query: 'Which furniture items are low in warehouse stock?' },
                { label: '💰 Who owes pending balance?', query: 'Who owes us pending customer receivables today?' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(p.query)}
                  style={{
                    background: 'rgba(212,175,55,0.18)',
                    color: '#FCD34D',
                    border: '1px solid #D4AF37',
                    borderRadius: '12px',
                    padding: '3px 8px',
                    fontSize: '9px',
                    fontWeight: '800',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={p.query}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', padding: '2px' }}>
              <input 
                placeholder={callerMode === 'CUSTOMER' ? "Ask customer bot: 'Price of sofa'..." : "Ask Director Copilot: 'Today's sales'..."}
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, background: '#1F2C34', border: 'none', borderRadius: '18px', padding: '8px 14px', color: '#FFFFFF', fontSize: '11.5px', outline: 'none' }}
              />
              <button onClick={() => handleSendChat()} style={{ background: callerMode === 'DIRECTOR' ? '#D4AF37' : '#00A884', color: callerMode === 'DIRECTOR' ? '#000' : '#FFF', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={13} />
              </button>
            </div>
          </div>

          {/* Right Column: Scrollable Bots List */}
          <div style={{ maxHeight: '660px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {filteredBots.map((b, idx) => (
              <div 
                key={b.botId || idx}
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  borderLeft: `4px solid ${b.status === 'PAUSED' ? '#64748B' : (b.color || '#D4AF37')}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: '900', color: b.color || 'var(--accent-gold-light)' }}>
                      {b.botId}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>{b.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    ⚡ {b.trigger} ➔ <span style={{ color: 'var(--accent-cyan)' }}>{b.target}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="btn-ghost-edit" 
                    onClick={() => openModal('edit_bot_config', { bot: b })}
                    style={{ fontSize: '10.5px', padding: '6px 10px', color: 'var(--accent-gold-light)' }}
                    title="Configure Bot"
                  >
                    <Settings size={12} /> ⚙️ Config
                  </button>

                  <button 
                    className="btn-emerald" 
                    onClick={() => handleTestBot(b)}
                    style={{ fontSize: '10.5px', padding: '6px 10px' }}
                    title="Autonomous execution active. Click to test or force resend."
                  >
                    <Play size={12} /> ▶ Test / Resend
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* VIEW MODE 3: FULL PHONE FOCUS */}
      {viewMode === 'PHONE' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <div style={{ background: '#0B141B', border: '4px solid #334155', borderRadius: '36px', padding: '16px', width: '440px', height: '680px', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.95), 0 0 50px rgba(37,211,102,0.2)' }}>
            <div style={{ width: '120px', height: '14px', background: '#1E293B', borderRadius: '10px', margin: '0 auto 8px auto' }} />

            {/* Dual-Brain Caller Role Switcher */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', background: '#030712', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => {
                  setCallerMode('CUSTOMER');
                  showToast("👤 Switched to Public Customer View (Firewall Active)");
                }}
                style={{
                  flex: 1,
                  background: callerMode === 'CUSTOMER' ? 'linear-gradient(135deg, #10B981, #047857)' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                👤 Customer View
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallerMode('DIRECTOR');
                  showToast("👑 Switched to Director VIP Mode (PIN: 8899 Active)");
                }}
                style={{
                  flex: 1,
                  background: callerMode === 'DIRECTOR' ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'transparent',
                  color: callerMode === 'DIRECTOR' ? '#000000' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                👑 Director VIP (PIN: 8899)
              </button>
            </div>

            {/* Header */}
            <div style={{ background: '#1F2C34', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: callerMode === 'DIRECTOR' ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'linear-gradient(135deg, #10B981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: callerMode === 'DIRECTOR' ? '#000' : '#FFF', fontSize: '13px' }}>
                {callerMode === 'DIRECTOR' ? '👑' : 'GI'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                  {callerMode === 'DIRECTOR' ? 'Director Executive Copilot' : (storeMeta.storeName || 'Godrej Interio Rayagada')}
                </div>
                <div style={{ fontSize: '10px', color: callerMode === 'DIRECTOR' ? '#F59E0B' : '#25D366' }}>
                  {callerMode === 'DIRECTOR' ? '👑 VIP Unrestricted Telemetry' : `Online • 24/7 AI (${storeMeta.whatsapp || '+91 93905 53301'})`}
                </div>
              </div>
            </div>

            {/* Security Shield Banner */}
            <div style={{ 
              background: callerMode === 'DIRECTOR' ? 'rgba(212,175,55,0.12)' : 'rgba(16,185,129,0.12)', 
              border: `1px solid ${callerMode === 'DIRECTOR' ? '#D4AF37' : '#10B981'}`, 
              borderRadius: '8px', 
              padding: '6px 10px', 
              marginBottom: '8px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '10px',
              color: callerMode === 'DIRECTOR' ? '#FCD34D' : '#6EE7B7'
            }}>
              <span>
                {callerMode === 'DIRECTOR' ? '🔓 VIP Mode: Full 21-Table Access' : '🛡️ Customer Firewall: Cost & Privacy Guard Active'}
              </span>
              <span className="badge" style={{ fontSize: '8px', padding: '2px 6px', background: callerMode === 'DIRECTOR' ? '#D4AF37' : '#10B981', color: '#000' }}>
                {callerMode === 'DIRECTOR' ? 'UNRESTRICTED' : 'GUARDED'}
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#081015', borderRadius: '16px' }}>
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' 
                      ? (msg.callerRole === 'DIRECTOR' ? 'linear-gradient(135deg, #78350F, #92400E)' : '#005C4B') 
                      : '#1F2C34',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '9px 12px',
                    maxWidth: '88%',
                    fontSize: '12px',
                    color: '#E9EDEF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    borderLeft: msg.sender === 'bot' 
                      ? (msg.isDirector ? '3px solid #D4AF37' : '3px solid #25D366') 
                      : 'none'
                  }}
                >
                  {msg.title && (
                    <div style={{ fontSize: '9.5px', fontWeight: '900', color: msg.isDirector ? '#F59E0B' : '#25D366', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {msg.title}
                    </div>
                  )}
                  <div style={{ lineHeight: '1.45', whiteSpace: 'pre-line' }}>{msg.text}</div>
                  <div style={{ fontSize: '9px', color: '#8696A0', textAlign: 'right', marginTop: '3px' }}>
                    {msg.time} {msg.sender === 'user' && '✓✓'}
                  </div>
                </div>
              ))}
            </div>

            {/* 1-Click Demo Quick Prompts Toolbar */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '6px 0', scrollbarWidth: 'none' }}>
              {callerMode === 'CUSTOMER' ? [
                { label: '🏷️ Price of King Bed?', query: 'Can you send the quote for the Solid King Bed with Hydraulic Storage?' },
                { label: '🛋️ Show 4-Door Wardrobe', query: 'Show details and price for 4-Door Modular Wardrobe' },
                { label: '🛡️ What is your factory cost?', query: 'What is your factory purchase cost and profit margin for this bed?' },
                { label: '📍 Showroom Address', query: 'Where is your showroom in Rayagada and what are timings?' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(p.query)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={p.query}
                >
                  {p.label}
                </button>
              )) : [
                { label: '📊 Today\'s Total Sales', query: 'What is today\'s total sales collection and cash in drawer?' },
                { label: '🏭 Factory Costs & Margins', query: 'What is our factory purchase cost and gross profit margin on BED-MOD-001?' },
                { label: '⚠️ Check Low Stock Items', query: 'Which furniture items are low in warehouse stock?' },
                { label: '💰 Who owes pending balance?', query: 'Who owes us pending customer receivables today?' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(p.query)}
                  style={{
                    background: 'rgba(212,175,55,0.18)',
                    color: '#FCD34D',
                    border: '1px solid #D4AF37',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: '800',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={p.query}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input 
                placeholder={callerMode === 'CUSTOMER' ? "Ask customer bot: 'Price of sofa'..." : "Ask Director Copilot: 'Today's sales'..."}
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, background: '#1F2C34', border: 'none', borderRadius: '20px', padding: '10px 16px', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
              />
              <button onClick={() => handleSendChat()} style={{ background: callerMode === 'DIRECTOR' ? '#D4AF37' : '#00A884', color: callerMode === 'DIRECTOR' ? '#000' : '#FFF', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

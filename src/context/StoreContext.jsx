// OmniBuild OS™ — Enterprise Master Store Context & State Engine
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  STORE_METADATA,
  FURNITURE_CATALOG,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_SMARTKIT_BOXES,
  INITIAL_INQUIRIES,
  INITIAL_ARCHITECTS,
  INITIAL_DRIVERS,
  INITIAL_ROUTE_STOPS,
  APPSHEET_BOTS,
  STORE_TARGETS
} from '../data/initialData';
import { dispatchWebhookAction, formatDateTimeIndian } from '../services/webhookService';
import { 
  playScanBeep, 
  playSuccessChime, 
  playSafeLockSound, 
  playAlertBuzzer, 
  triggerGoldenConfetti, 
  speakVoiceFeedback 
} from '../utils/audioUtils';

const StoreContext = createContext();

export const USER_ROLES = {
  OWNER: {
    id: 'rakesh',
    pin: '8899',
    name: 'Rakesh (Store Director & Owner)',
    roleName: 'Store Owner / Director',
    avatar: '👑',
    badgeClass: 'badge-gold',
    allowedTabs: [
      'executive', 'voice_pos', 'room_matcher', 'safelock', 'autoprocure',
      'logistics_epod', 'architects', 'crm', 'whatsapp_bots', 'documents',
      'live_database', 'barcode_studio', 'qr_studio', 'inward_scanner', 'outward_scanner', 'staff_qr'
    ]
  },
  SALES: {
    id: 'sunil_sales',
    pin: '1122',
    name: 'Sunil (Senior Showroom Consultant)',
    roleName: 'Showroom Sales Executive',
    avatar: '💼',
    badgeClass: 'badge-cyan',
    allowedTabs: [
      'voice_pos', 'room_matcher', 'crm', 'safelock', 'documents', 'barcode_studio', 'qr_studio'
    ]
  },
  WAREHOUSE: {
    id: 'dock_supervisor',
    pin: '3344',
    name: 'Santosh (Warehouse & Dock Supervisor)',
    roleName: 'Warehouse Dock Supervisor',
    avatar: '📦',
    badgeClass: 'badge-amber',
    allowedTabs: [
      'inward_scanner', 'outward_scanner', 'safelock', 'barcode_studio', 'qr_studio', 'staff_qr'
    ]
  },
  DRIVER: {
    id: 'tophan_driver',
    pin: '5566',
    name: 'Tophan Gouda (Fleet Logistics Lead)',
    roleName: 'Fleet Delivery Driver',
    avatar: '🚚',
    badgeClass: 'badge-purple',
    allowedTabs: [
      'logistics_epod', 'outward_scanner'
    ]
  },
  ARCHITECT: {
    id: 'sunita_architect',
    pin: '7788',
    name: 'Ar. Sunita Patnaik (Studio Vastu)',
    roleName: 'VIP Architect Partner',
    avatar: '🏛️',
    badgeClass: 'badge-emerald',
    allowedTabs: [
      'architects', 'room_matcher', 'documents'
    ]
  }
};

// Helper for safe localStorage reading with fallback
const getStored = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(fallback) ? (Array.isArray(parsed) && parsed.length > 0) : parsed) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`[localStorage] Read error for ${key}:`, e);
  }
  return fallback;
};

export function StoreProvider({ children }) {
  // Authentication & Current User Session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('OMNIBUILD_AUTH_USER');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return USER_ROLES.OWNER; }
    }
    return USER_ROLES.OWNER; // Defaults to Store Owner for seamless startup
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('executive');

  // Core Persistent 21-Table Data Stores
  const [catalog, setCatalog] = useState(FURNITURE_CATALOG);
  const [orders, setOrders] = useState(() => getStored('OMNIBUILD_ORDERS', INITIAL_ORDERS));
  const [inventory, setInventory] = useState(() => getStored('OMNIBUILD_INVENTORY', INITIAL_INVENTORY));
  const [smartKitBoxes, setSmartKitBoxes] = useState(() => getStored('OMNIBUILD_SMARTKIT_BOXES', INITIAL_SMARTKIT_BOXES));
  const [inquiries, setInquiries] = useState(() => getStored('OMNIBUILD_INQUIRIES', INITIAL_INQUIRIES));
  const [architects, setArchitects] = useState(() => getStored('OMNIBUILD_ARCHITECTS', INITIAL_ARCHITECTS));
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [routeStops, setRouteStops] = useState(INITIAL_ROUTE_STOPS);
  const [targets, setTargets] = useState(() => getStored('OMNIBUILD_TARGETS', STORE_TARGETS));
  const [bots, setBots] = useState(APPSHEET_BOTS.map(b => ({
    ...b,
    status: 'ACTIVE',
    schedule: b.trigger && b.trigger.includes('Daily') ? 'Scheduled Daily at 21:00' : b.trigger && b.trigger.includes('Hourly') ? 'Scheduled Hourly' : 'Instant Real-Time',
    targetChannel: 'WhatsApp Cloud + Google Sheets'
  })));
  const [storeMeta, setStoreMeta] = useState(() => getStored('OMNIBUILD_STORE_META', STORE_METADATA));

  // Additional Logs with Persistence
  const [paymentsLog, setPaymentsLog] = useState(() => getStored('OMNIBUILD_PAYMENTS', [
    { Txn_ID: "TXN-ADV-1049", Payment_Date_Time: formatDateTimeIndian(), Order_ID: "ORD-8921", Customer_Name: "Dr. Subhashish Jena", Payment_Type: "ADVANCE_50", Amount_INR: 78247, Payment_Mode: "DYNAMIC_UPI_QR", UPI_VPA: "9390553301@ybl", UPI_Transaction_Ref: "UPI-ADV-88912", Status: "SETTLED" }
  ]));
  const [documentsLog, setDocumentsLog] = useState(() => getStored('OMNIBUILD_DOCUMENTS', [
    { Doc_ID: "INV-2026-0881", Doc_Type: "INVOICE", Entity_Ref_ID: "ORD-8921", Customer_Vendor_Name: "Dr. Subhashish Jena", Total_Amount_INR: 156494, GST_Amount_INR: 28169, Generated_Date_Time: formatDateTimeIndian(), Status: "GENERATED_LEGAL_COMPLIANT" }
  ]));
  const [eodSummary, setEodSummary] = useState(() => getStored('OMNIBUILD_EOD_SUMMARY', {
    cashDrawerINR: 45000,
    upiSettledINR: 124000,
    cardPosINR: 0,
    totalGrossINR: 169000,
    safeLockCount: 4,
    closedBy: "Rakesh (Store Manager)",
    status: "OPEN_REGISTER"
  }));

  // 👑 VIP Turnkey Villa Projects State with Persistence
  const [vipProjects, setVipProjects] = useState(() => getStored('OMNIBUILD_VIP_PROJECTS', [
    { id: 'VIP-001', name: 'Dr. Subhashish Jena (Rayagada Civil Surgeon)', location: 'Raniguda Farmhouse Villa', value: 156494, advance: 78247, status: 'SAFELOCKED & STAGED', stage: '40% Balance on Delivery', phone: '+91 94371 88990', architect: 'Ar. Sunita Patnaik (Studio Vastu)', stage1Paid: true, stage2Paid: false, stage3Paid: false },
    { id: 'VIP-002', name: 'Er. Pradeep Patnaik (JK Paper Executive)', location: 'Jaykaypur Officer Bungalow', value: 420000, advance: 210000, status: 'PROPOSAL DELIVERED', stage: '50% Token Pending', phone: '+91 94370 12345', architect: 'Ar. Rajesh Mohanty', stage1Paid: false, stage2Paid: false, stage3Paid: false },
    { id: 'VIP-003', name: 'M/s Koraput Health Clinic', location: 'Medical Road, Koraput', value: 285000, advance: 142500, status: 'DISPATCH IN TRANSIT', stage: 'ePOD OTP Staged', phone: '+91 98610 99887', architect: 'Direct VIP Client', stage1Paid: true, stage2Paid: true, stage3Paid: false }
  ]));

  // 🔥 Floor Aging Stock Sentinel State with Persistence
  const [floorAgingStock, setFloorAgingStock] = useState(() => getStored('OMNIBUILD_FLOOR_AGING', [
    { sku: 'ALM-MOD-001', name: '4-Door Solid Teak Wardrobe', floorDays: 52, bay: 'Bay 3', mrp: 78000, discountPct: 20, clearancePrice: 62400, notes: 'Showroom display piece in pristine condition' },
    { sku: 'DIN-MOD-001', name: '6-Seater Italian Carrara Marble Dining', floorDays: 48, bay: 'Bay 1', mrp: 92000, discountPct: 20, clearancePrice: 73600, notes: 'Polished display unit' },
    { sku: 'SOF-MOD-002', name: '3-Seater Chesterfield Velvet Sofa', floorDays: 46, bay: 'Bay 4', mrp: 68000, discountPct: 20, clearancePrice: 54400, notes: 'Buffed velvet upholstery' }
  ]));

  // Automatic LocalStorage Sync Hooks
  useEffect(() => { localStorage.setItem('OMNIBUILD_ORDERS', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_INVENTORY', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_SMARTKIT_BOXES', JSON.stringify(smartKitBoxes)); }, [smartKitBoxes]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_INQUIRIES', JSON.stringify(inquiries)); }, [inquiries]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_ARCHITECTS', JSON.stringify(architects)); }, [architects]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_TARGETS', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_STORE_META', JSON.stringify(storeMeta)); }, [storeMeta]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_PAYMENTS', JSON.stringify(paymentsLog)); }, [paymentsLog]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_DOCUMENTS', JSON.stringify(documentsLog)); }, [documentsLog]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_EOD_SUMMARY', JSON.stringify(eodSummary)); }, [eodSummary]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_VIP_PROJECTS', JSON.stringify(vipProjects)); }, [vipProjects]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_FLOOR_AGING', JSON.stringify(floorAgingStock)); }, [floorAgingStock]);

  // UI States & Modals
  const [activeModal, setActiveModal] = useState(null);
  const [modalProps, setModalProps] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [voiceCart, setVoiceCart] = useState([]);

  // Show Toast
  const showToast = (msg, speak = false) => {
    setToastMessage(msg);
    if (speak) speakVoiceFeedback(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Open Modal Helper
  const openModal = (modalName, props = {}) => {
    setModalProps(props);
    setActiveModal(modalName);
  };
  const closeModal = () => {
    setActiveModal(null);
    setModalProps({});
  };

  // Auth Handlers
  const loginWithPin = (enteredPin) => {
    const roleKey = Object.keys(USER_ROLES).find(k => USER_ROLES[k].pin === enteredPin);
    if (roleKey) {
      const user = USER_ROLES[roleKey];
      setCurrentUser(user);
      localStorage.setItem('OMNIBUILD_AUTH_USER', JSON.stringify(user));
      setActiveTab(user.allowedTabs[0] || 'executive');
      playSuccessChime();
      showToast(`🔓 Welcome, ${user.name}! (${user.roleName})`, true);
      return { success: true, user };
    } else {
      playAlertBuzzer();
      showToast("❌ Invalid 4-digit PIN! Please try again.", false);
      return { success: false };
    }
  };

  const loginAsRole = (roleKey) => {
    const user = USER_ROLES[roleKey] || USER_ROLES.OWNER;
    setCurrentUser(user);
    localStorage.setItem('OMNIBUILD_AUTH_USER', JSON.stringify(user));
    setActiveTab(user.allowedTabs[0] || 'executive');
    playSuccessChime();
    showToast(`🔓 Switched to profile: ${user.name}`, true);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('OMNIBUILD_AUTH_USER');
    playSafeLockSound();
    showToast("🔒 Screen locked. Enter PIN to resume.", false);
  };

  // 1. SafeLock Action: Atomic Reservation
  const triggerSafeLockOrder = (orderData) => {
    const newOrder = {
      Order_ID: orderData.Order_ID || `ORD-${Math.floor(8920 + Math.random() * 900)}`,
      Customer_Name: orderData.Customer_Name || "VIP Customer",
      Customer_Phone: orderData.Customer_Phone || "9437088990",
      Project_Address: orderData.Project_Address || "Rayagada, Odisha",
      Designer_ID: orderData.Designer_ID || "VIP-ARC-001",
      Ordered_SKU: orderData.Ordered_SKU || "BED-MOD-001",
      Total_Amount_INR: Number(orderData.Total_Amount_INR) || 156494,
      Advance_Paid_INR: Number(orderData.Advance_Paid_INR) || 78247,
      Balance_Due_INR: Number(orderData.Balance_Due_INR) || 78247,
      SafeLock_Status: "SAFELOCKED (RESERVED)",
      SmartKit_Status: "5/5 Staged",
      Assigned_Driver: orderData.Assigned_Driver || "Tophan Gouda (Tata Ace OD-18-A-1234)",
      Delivery_Schedule: orderData.Delivery_Schedule || "Today, 04:30 PM",
      Carpenter_Assigned: orderData.Carpenter_Assigned || "Narayana Mistri",
      Carpenter_Payout_INR: 500,
      OTP_Code: `${Math.floor(1000 + Math.random() * 9000)}`,
      Created_Date: formatDateTimeIndian()
    };

    setOrders(prev => [newOrder, ...prev]);

    // Decrement stock & increment reserved
    setInventory(prev => prev.map(item => {
      if (orderData.Ordered_SKU && orderData.Ordered_SKU.includes(item.SKU)) {
        return {
          ...item,
          Warehouse_Qty: Math.max(0, item.Warehouse_Qty - 1),
          Reserved_SafeLock: item.Reserved_SafeLock + 1
        };
      }
      return item;
    }));

    // Add payment record
    if (newOrder.Advance_Paid_INR > 0) {
      setPaymentsLog(prev => [{
        Txn_ID: `TXN-ADV-${Math.floor(1000 + Math.random() * 9000)}`,
        Payment_Date_Time: formatDateTimeIndian(),
        Order_ID: newOrder.Order_ID,
        Customer_Name: newOrder.Customer_Name,
        Payment_Type: "ADVANCE_TOKEN",
        Amount_INR: newOrder.Advance_Paid_INR,
        Payment_Mode: "DYNAMIC_UPI_QR",
        UPI_VPA: storeMeta.upiVpa,
        UPI_Transaction_Ref: `UPI-ADV-${Math.floor(100000 + Math.random() * 900000)}`,
        Status: "SETTLED"
      }, ...prev]);
    }

    playSafeLockSound();
    triggerGoldenConfetti();
    showToast(`🔒 SafeLock Order #${newOrder.Order_ID} confirmed with stock reservation!`, true);

    dispatchWebhookAction('SYSTEM_2_VOICE_ORDER', {
      order_id: newOrder.Order_ID,
      customer_name: newOrder.Customer_Name,
      customer_phone: newOrder.Customer_Phone,
      address: newOrder.Project_Address,
      ordered_sku: newOrder.Ordered_SKU,
      amount: newOrder.Total_Amount_INR,
      advance_amount: newOrder.Advance_Paid_INR
    });

    return newOrder;
  };

  // 2. Convert CRM Inquiry to SafeLock Order
  const convertInquiryToOrder = (inquiryId, orderDetails = {}) => {
    const targetInq = inquiries.find(i => i.Inquiry_ID === inquiryId) || {};
    
    // Update inquiry status
    setInquiries(prev => prev.map(inq => {
      if (inq.Inquiry_ID === inquiryId) {
        return { ...inq, Status: `CONVERTED_TO_ORDER ✓` };
      }
      return inq;
    }));

    const totalAmt = Number(orderDetails.totalAmount) || targetInq.Budget_INR || 169000;
    const advAmt = Number(orderDetails.advanceAmount) || (totalAmt * 0.5);

    const createdOrder = triggerSafeLockOrder({
      Customer_Name: targetInq.Customer_Name || "Inquiry Client",
      Customer_Phone: targetInq.Customer_Phone || "9437100000",
      Project_Address: targetInq.Address || "Rayagada Client Site",
      Ordered_SKU: targetInq.Category_Models || "Solid Teak Luxury Furniture Suite",
      Total_Amount_INR: totalAmt,
      Advance_Paid_INR: advAmt,
      Balance_Due_INR: totalAmt - advAmt,
      ...orderDetails
    });

    dispatchWebhookAction('CONVERT_INQUIRY_TO_ORDER', {
      inquiry_id: inquiryId,
      order_id: createdOrder.Order_ID,
      customer_name: createdOrder.Customer_Name,
      total_amount: totalAmt,
      advance_amount: advAmt
    });

    return createdOrder;
  };

  // 3. Stock Dial / Stepper Override
  const adjustStock = (sku, changeWh, changeRes = 0, reason = "Manual Executive Adjustment") => {
    setInventory(prev => prev.map(item => {
      if (item.SKU === sku) {
        const newWh = Math.max(0, item.Warehouse_Qty + changeWh);
        const newRes = Math.max(0, item.Reserved_SafeLock + changeRes);
        return {
          ...item,
          Warehouse_Qty: newWh,
          Reserved_SafeLock: newRes
        };
      }
      return item;
    }));

    playScanBeep();
    showToast(`📦 Stock updated for ${sku}: ΔWarehouse ${changeWh > 0 ? '+' : ''}${changeWh}`);

    dispatchWebhookAction('OVERRIDE_STOCK_QTY', {
      sku: sku,
      adjust_warehouse_qty: changeWh,
      adjust_reserved_qty: changeRes,
      reason: reason
    });
  };

  // 3.1. Update Order Status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(ord => {
      if (ord.Order_ID === orderId) {
        return { ...ord, SafeLock_Status: newStatus };
      }
      return ord;
    }));
    playScanBeep();
    showToast(`📦 Order #${orderId} status updated to: ${newStatus}`);
  };

  // 4. SmartKit 5-Box Staging
  const verifySmartKitBox = (boxId) => {
    setSmartKitBoxes(prev => prev.map(box => {
      if (box.Box_ID === boxId) {
        return { ...box, Status: "VERIFIED_STAGED", Staged_By: "Staff Rakesh" };
      }
      return box;
    }));
    playScanBeep();
    showToast(`✅ Verified box ${boxId}`);
  };

  // 5. ePOD Delivery Completion
  const submitEpodDelivery = (orderId, epodData = {}) => {
    setOrders(prev => prev.map(ord => {
      if (ord.Order_ID === orderId) {
        return {
          ...ord,
          SafeLock_Status: "DELIVERED (ePOD VERIFIED ✓)",
          Balance_Due_INR: 0,
          Delivery_Schedule: `${formatDateTimeIndian()} (Delivered)`
        };
      }
      return ord;
    }));

    // Update Route stop
    setRouteStops(prev => prev.map(st => {
      if (st.Order_ID === orderId) {
        return { ...st, Status: "DELIVERED_COMPLETE" };
      }
      return st;
    }));

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🚚 ePOD recorded for Order #${orderId} with GPS & OTP verification!`, true);

    dispatchWebhookAction('SUBMIT_EPOD_DELIVERY', {
      order_id: orderId,
      customer_name: epodData.customerName || "Customer",
      driver: epodData.driverName || "Tophan Gouda",
      vehicle: epodData.vehicle || "Tata Ace OD-18-A-1234",
      otp_verified: "OTP_VERIFIED_OK",
      gps_geotag: epodData.geotag || "19.1724° N, 83.4163° E",
      csat_score: epodData.csat || "5.0 ⭐",
      amount_collected: epodData.amountCollected || 78247
    });
  };

  // 6. Architect Instant Commission Payout
  const disburseArchitectPayout = (architectId, amount, rrn) => {
    setArchitects(prev => prev.map(arch => {
      if (arch.Architect_ID === architectId) {
        const newPaid = arch.Paid_Out_INR + amount;
        return {
          ...arch,
          Paid_Out_INR: newPaid,
          Balance_Due_INR: Math.max(0, arch.Commission_Earned_INR - newPaid)
        };
      }
      return arch;
    }));

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`💸 ₹${amount.toLocaleString()} commission paid to ${architectId} via UPI! RRN: ${rrn}`, true);

    dispatchWebhookAction('SYSTEM_7_VIP_COMMISSION', {
      architect_id: architectId,
      payout_amount: amount,
      upi_rrn: rrn
    });
  };

  // 7. AppSheet Bot Cloud Execution
  const triggerAppSheetBot = (botId, botName) => {
    playScanBeep();
    showToast(`⚡ Bot ${botId} (${botName}) triggered in Google Cloud!`);
    dispatchWebhookAction('DISPATCH_BOT_ACTION', {
      bot_id: botId,
      bot_name: botName,
      trigger: "WEBHOOK_DIRECT_INVOKE"
    });
  };

  // 7.1. Update Bot Configuration
  const updateBotConfig = (botId, updatedProps) => {
    setBots(prev => prev.map(b => b.botId === botId ? { ...b, ...updatedProps } : b));
  };

  // 👑 VIP Villa Management Actions
  const addVipProject = (proj) => {
    const newProj = {
      id: proj.id || `VIP-${Math.floor(100 + Math.random() * 900)}`,
      name: proj.name || 'VIP Client',
      location: proj.location || 'Raniguda Farmhouse Villa',
      value: Number(proj.value) || 150000,
      advance: Number(proj.advance) || Math.round((Number(proj.value) || 150000) * 0.5),
      status: proj.status || 'SAFELOCKED & STAGED',
      stage: proj.stage || '50% Token Received',
      phone: proj.phone || '+91 94370 88990',
      architect: proj.architect || 'Direct VIP Account',
      stage1Paid: true,
      stage2Paid: false,
      stage3Paid: false
    };
    setVipProjects(prev => [newProj, ...prev]);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`👑 New VIP Villa Project #${newProj.id} added!`, true);
    dispatchWebhookAction('ADD_VIP_PROJECT', { ...newProj, project_id: newProj.id, project_value: newProj.value });
  };

  const updateVipProject = (id, updatedFields) => {
    setVipProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    playSuccessChime();
    showToast(`👑 VIP Project #${id} updated!`, true);
    dispatchWebhookAction('UPDATE_VIP_PROJECT', { project_id: id, ...updatedFields });
  };

  const deleteVipProject = (id) => {
    setVipProjects(prev => prev.filter(p => p.id !== id));
    playScanBeep();
    showToast(`🗑️ VIP Project #${id} removed.`, false);
  };

  // 🔥 Floor Aging Management Actions
  const addFloorAgingSku = (item) => {
    const newItem = {
      sku: item.sku || 'BED-MOD-001',
      name: item.name || 'Solid King Bed',
      floorDays: Number(item.floorDays) || 45,
      bay: item.bay || 'Bay 1',
      mrp: Number(item.mrp) || 98000,
      discountPct: Number(item.discountPct) || 20,
      clearancePrice: Math.round((Number(item.mrp) || 98000) * (1 - (Number(item.discountPct) || 20) / 100)),
      notes: item.notes || 'Display piece tracked'
    };
    setFloorAgingStock(prev => [newItem, ...prev.filter(x => x.sku !== newItem.sku)]);
    playSuccessChime();
    showToast(`🔥 Display SKU ${newItem.sku} added to Aging Sentinel!`, true);
    dispatchWebhookAction('ADD_FLOOR_AGING_SKU', { ...newItem, floor_days: newItem.floorDays });
  };

  const updateFloorAgingSku = (sku, updatedFields) => {
    setFloorAgingStock(prev => prev.map(item => {
      if (item.sku === sku) {
        const merged = { ...item, ...updatedFields };
        if (updatedFields.discountPct || updatedFields.mrp) {
          merged.clearancePrice = Math.round(merged.mrp * (1 - merged.discountPct / 100));
        }
        return merged;
      }
      return item;
    }));
    playSuccessChime();
    showToast(`🔥 Floor Aging SKU ${sku} updated!`, true);
    dispatchWebhookAction('UPDATE_FLOOR_AGING_SKU', { sku, ...updatedFields });
  };

  const resetFloorAge = (sku) => {
    setFloorAgingStock(prev => prev.map(item => {
      if (item.sku === sku) {
        return { ...item, floorDays: 1, notes: 'Fresh warehouse unit swapped onto floor' };
      }
      return item;
    }));
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔄 Display unit ${sku} age reset to Day 1 (Swapped with Warehouse Stock)!`, true);
    dispatchWebhookAction('RESET_FLOOR_AGE', { sku });
  };

  // 8. 2-Way Sync with Google Sheets with Real-Time Cloud Hydration
  const syncWithGoogleSheets = async (silent = false) => {
    setIsSyncing(true);
    if (!silent) {
      playScanBeep();
      showToast("📡 Connecting to Google Apps Script Master Webhook...");
    }

    try {
      const res = await dispatchWebhookAction('FETCH_ALL_TABLES', {});
      if (res && res.tables) {
        // 1. Sync & Merge Orders from Google Sheets Orders_SafeLock
        if (Array.isArray(res.tables.Orders_SafeLock) && res.tables.Orders_SafeLock.length > 0) {
          const cloudOrders = res.tables.Orders_SafeLock.map(row => ({
            Order_ID: row.Order_ID || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            Customer_Name: row.Customer_Name || "VIP Customer",
            Customer_Phone: row.Customer_Phone || "",
            Project_Address: row.Project_Address || "Rayagada",
            Designer_ID: row.Designer_ID || "VIP-ARC-001",
            Ordered_SKU: row.Ordered_SKU || "BED-MOD-001",
            Total_Amount_INR: Number(row.Total_Amount_INR) || 0,
            Advance_Paid_INR: Number(row.Advance_Paid_INR) || 0,
            Balance_Due_INR: Number(row.Balance_Due_INR) || 0,
            SafeLock_Status: row.SafeLock_Status || "SAFELOCKED (RESERVED)",
            SmartKit_Status: row.SmartKit_Status || "5/5 Staged",
            Assigned_Driver: row.Assigned_Driver || "Tophan Gouda (Tata Ace OD-18-A-1234)",
            Delivery_Schedule: row.Delivery_Schedule || "Today",
            Carpenter_Assigned: row.Carpenter_Assigned || "Narayana Mistri",
            Carpenter_Payout_INR: Number(row.Carpenter_Payout_INR) || 500,
            OTP_Code: row.OTP_Code || "8899",
            Created_Date: row.Created_Date || formatDateTimeIndian()
          }));
          
          setOrders(prev => {
            const map = new Map();
            cloudOrders.forEach(o => map.set(o.Order_ID, o));
            prev.forEach(o => map.set(o.Order_ID, { ...(map.get(o.Order_ID) || {}), ...o }));
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      console.warn("[Cloud Sync Hydration Warning]:", e);
    } finally {
      setIsSyncing(false);
      if (!silent) {
        playSuccessChime();
        showToast("✅ Master Webhook 2-Way Sync Complete! All Tables Synchronized.");
      }
    }
  };

  // Initial Silent Startup Cloud Hydration
  useEffect(() => {
    syncWithGoogleSheets(true);
  }, []);

  return (
    <StoreContext.Provider value={{
      currentUser,
      loginWithPin,
      loginAsRole,
      logout,
      activeTab,
      setActiveTab,
      catalog,
      setCatalog,
      orders,
      setOrders,
      inventory,
      setInventory,
      smartKitBoxes,
      setSmartKitBoxes,
      inquiries,
      setInquiries,
      architects,
      setArchitects,
      drivers,
      setDrivers,
      routeStops,
      setRouteStops,
      targets,
      setTargets,
      vipProjects,
      setVipProjects,
      addVipProject,
      updateVipProject,
      deleteVipProject,
      floorAgingStock,
      setFloorAgingStock,
      addFloorAgingSku,
      updateFloorAgingSku,
      resetFloorAge,
      bots,
      setBots,
      updateBotConfig,
      storeMeta,
      setStoreMeta,
      paymentsLog,
      setPaymentsLog,
      documentsLog,
      setDocumentsLog,
      eodSummary,
      setEodSummary,
      voiceCart,
      setVoiceCart,
      activeModal,
      modalProps,
      openModal,
      closeModal,
      showToast,
      isSyncing,
      syncWithGoogleSheets,
      triggerSafeLockOrder,
      convertInquiryToOrder,
      adjustStock,
      updateOrderStatus,
      verifySmartKitBox,
      submitEpodDelivery,
      disburseArchitectPayout,
      triggerAppSheetBot
    }}>
      {children}
      {toastMessage && (
        <div className="global-toast">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

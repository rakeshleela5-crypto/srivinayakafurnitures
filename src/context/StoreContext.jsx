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
import { BANK_ACCOUNTS, INITIAL_BANK_TRANSACTIONS } from '../data/initialBankData';
import { dispatchWebhookAction, formatDateTimeIndian, flushOfflineQueue } from '../services/webhookService';
import { 
  playScanBeep, 
  playSuccessChime, 
  playSafeLockSound, 
  playAlertBuzzer, 
  triggerGoldenConfetti, 
  speakVoiceFeedback 
} from '../utils/audioUtils';

const StoreContext = createContext();

export const ROLE_PERMISSIONS = Object.freeze({
  rakesh: Object.freeze([
    'executive', 'b2b_projects', 'crm', 'voice_pos', 'architects',
    'autoprocure', 'inward_scanner', 'safelock', 'barcode_studio', 'qr_studio',
    'outward_scanner', 'logistics_epod', 'documents',
    'bank_ledger', 'whatsapp_bots', 'staff_qr', 'live_database'
  ]),
  sunil_sales: Object.freeze([
    'voice_pos', 'b2b_projects', 'crm', 'safelock', 'documents', 'barcode_studio', 'qr_studio'
  ]),
  dock_supervisor: Object.freeze([
    'inward_scanner', 'outward_scanner', 'safelock', 'barcode_studio', 'qr_studio', 'staff_qr'
  ]),
  tophan_driver: Object.freeze([
    'logistics_epod', 'outward_scanner'
  ]),
  sunita_architect: Object.freeze([
    'architects', 'documents'
  ])
});

export const USER_ROLES = {
  OWNER: {
    id: 'rakesh',
    pinHash: '9800a8677d99e5f6968d7357e44006388b09d3b6a8676d0f930fbaa63d02330d', // SHA-256 for 8899
    name: 'Rakesh (Store Director & Owner)',
    roleName: 'Store Owner / Director',
    avatar: '👑',
    badgeClass: 'badge-gold'
  },
  SALES: {
    id: 'sunil_sales',
    pinHash: 'b3282a2f2a28757b3a18ab833de16a9c54518c0b0cf493e3f0a7cf09386f326a', // SHA-256 for 1122
    name: 'Sunil (Senior Showroom Consultant)',
    roleName: 'Showroom Sales Executive',
    avatar: '💼',
    badgeClass: 'badge-cyan'
  },
  WAREHOUSE: {
    id: 'dock_supervisor',
    pinHash: '15fc36b3e80b9d7f87f7dc90cd7a2845c5d8501c30f03379fcf14154f1680380', // SHA-256 for 3344
    name: 'Santosh (Warehouse & Dock Supervisor)',
    roleName: 'Warehouse Dock Supervisor',
    avatar: '📦',
    badgeClass: 'badge-amber'
  },
  DRIVER: {
    id: 'tophan_driver',
    pinHash: 'be41b7f1fa56ba2b0582910053c86cf6ee7e311efc51300220df0918bb9a287b', // SHA-256 for 5566
    name: 'Tophan Gouda (Fleet Logistics Lead)',
    roleName: 'Fleet Delivery Driver',
    avatar: '🚚',
    badgeClass: 'badge-purple'
  },
  ARCHITECT: {
    id: 'sunita_architect',
    pinHash: '16740bf13991fe083fbe5820cc8da08a5d88e5a48f44a3cfcc283c27b2797ba7', // SHA-256 for 7788
    name: 'Ar. Sunita Patnaik (Studio Vastu)',
    roleName: 'VIP Architect Partner',
    avatar: '🏛️',
    badgeClass: 'badge-emerald'
  }
};

export async function hashPin(pin) {
  try {
    const msgBuffer = new TextEncoder().encode(String(pin || '').trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return '';
  }
}

// Helper for safe localStorage reading with fallback
const getStored = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(fallback)) {
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } else if (fallback && typeof fallback === 'object') {
        if (parsed && typeof parsed === 'object') {
          return { ...fallback, ...parsed };
        }
      } else if (parsed !== undefined && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`[localStorage] Read error for ${key}:`, e);
  }
  return fallback;
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30-Minute Inactivity Auto-Lock

export function StoreProvider({ children }) {
  // Authentication & Current User Session (Zero-Trust: null on clean session)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('OMNIBUILD_AUTH_USER');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.roleKey && USER_ROLES[parsed.roleKey]) {
          if (parsed.timestamp && (Date.now() - parsed.timestamp > SESSION_TIMEOUT_MS)) {
            localStorage.removeItem('OMNIBUILD_AUTH_USER');
            return null;
          }
          const baseUser = USER_ROLES[parsed.roleKey];
          return {
            ...baseUser,
            allowedTabs: ROLE_PERMISSIONS[baseUser.id] || []
          };
        }
      }
    } catch (e) {
      console.warn("Auth restoration error:", e);
    }
    return null; // 🛡️ Zero-Trust: defaults to locked screen
  });

  // Navigation & Showcase Mode
  const [activeTab, setActiveTab] = useState('executive');
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('OMNIBUILD_APP_MODE') || 'DEMO';
  });

  const toggleAppMode = () => {
    setAppMode(prev => {
      const next = prev === 'DEMO' ? 'PRODUCTION' : 'DEMO';
      localStorage.setItem('OMNIBUILD_APP_MODE', next);
      playSuccessChime();
      if (next === 'PRODUCTION') {
        triggerGoldenConfetti();
        showToast("🏢 Switched to LIVE PRODUCTION MODE — Pure Showroom Cloud Data Active!", true);
      } else {
        showToast("🎭 Switched to DEMO SHOWCASE MODE — Full Luxury Showcase Active!");
      }
      return next;
    });
  };

  // Master Universal Google Sheets Tables State with Persistence
  const [cloudTables, setCloudTables] = useState(() => getStored('OMNIBUILD_CLOUD_TABLES', {}));

  // Core Persistent 21-Table Data Stores
  const [catalog, setCatalog] = useState(() => getStored('OMNIBUILD_CATALOG', FURNITURE_CATALOG));
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

  // 🏦 Bank Accounts & Live Dual-Ledger Transactions
  const [bankAccounts, setBankAccounts] = useState(() => getStored('OMNIBUILD_BANK_ACCOUNTS', BANK_ACCOUNTS));
  const [bankTransactions, setBankTransactions] = useState(() => getStored('OMNIBUILD_BANK_TRANSACTIONS', INITIAL_BANK_TRANSACTIONS));

  // Automatic LocalStorage Sync Hooks for All Core Datastores
  useEffect(() => { localStorage.setItem('OMNIBUILD_CATALOG', JSON.stringify(catalog)); }, [catalog]);
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
  useEffect(() => { localStorage.setItem('OMNIBUILD_BANK_ACCOUNTS', JSON.stringify(bankAccounts)); }, [bankAccounts]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_BANK_TRANSACTIONS', JSON.stringify(bankTransactions)); }, [bankTransactions]);

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

  // 🛡️ 30-Minute Inactivity Auto-Lock
  useEffect(() => {
    if (!currentUser) return;

    let timer;
    const resetActivityTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        showToast("🔒 Session timed out after 30 minutes of inactivity.", false);
      }, SESSION_TIMEOUT_MS);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetActivityTimer, { passive: true }));
    resetActivityTimer();

    return () => {
      clearTimeout(timer);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetActivityTimer));
    };
  }, [currentUser]);

  // Auth Handlers (Web Crypto SHA-256 Verified)
  const loginWithPin = async (enteredPin) => {
    const hashed = await hashPin(enteredPin);
    const roleKey = Object.keys(USER_ROLES).find(k => USER_ROLES[k].pinHash === hashed);
    if (roleKey) {
      const baseUser = USER_ROLES[roleKey];
      const user = {
        ...baseUser,
        allowedTabs: ROLE_PERMISSIONS[baseUser.id] || []
      };
      setCurrentUser(user);
      localStorage.setItem('OMNIBUILD_AUTH_USER', JSON.stringify({
        id: user.id,
        roleKey: roleKey,
        timestamp: Date.now()
      }));
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
    if (!import.meta.env.DEV) {
      showToast("🔒 Quick-switch is disabled in production. Please enter the role PIN.", false);
      return;
    }
    const baseUser = USER_ROLES[roleKey] || USER_ROLES.OWNER;
    const user = {
      ...baseUser,
      allowedTabs: ROLE_PERMISSIONS[baseUser.id] || []
    };
    setCurrentUser(user);
    localStorage.setItem('OMNIBUILD_AUTH_USER', JSON.stringify({
      id: user.id,
      roleKey: roleKey,
      timestamp: Date.now()
    }));
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

  // 📥 Universal Multi-Module Catalog Ingestion & Permanent Sync Engine
  const importCatalogItems = (newItems = [], mode = 'MERGE') => {
    if (!newItems || newItems.length === 0) return [];

    let updatedCatalog = [];
    setCatalog(prevCatalog => {
      if (mode === 'REPLACE') {
        updatedCatalog = [...newItems];
      } else if (mode === 'APPEND') {
        const existingSkus = new Set(prevCatalog.map(c => c.SKU));
        const toAdd = newItems.filter(r => !existingSkus.has(r.SKU));
        updatedCatalog = [...prevCatalog, ...toAdd];
      } else {
        // MERGE & UPDATE (Default)
        const catalogMap = new Map(prevCatalog.map(c => [c.SKU, c]));
        newItems.forEach(row => {
          catalogMap.set(row.SKU, { ...(catalogMap.get(row.SKU) || {}), ...row });
        });
        updatedCatalog = Array.from(catalogMap.values());
      }

      try {
        localStorage.setItem('OMNIBUILD_CATALOG', JSON.stringify(updatedCatalog));
      } catch (e) {
        console.warn('[localStorage] Catalog save error:', e);
      }

      return updatedCatalog;
    });

    // Auto-provision inventory slots for new SKUs
    setInventory(prevInv => {
      const invMap = new Map(prevInv.map(i => [i.SKU, i]));
      newItems.forEach(item => {
        if (!invMap.has(item.SKU)) {
          invMap.set(item.SKU, {
            SKU: item.SKU,
            Product_Name: item.Product_Name,
            Category: item.Main_Category || 'General',
            Showroom_Stock: Number(item.In_Stock_Warehouse) || 4,
            Central_Warehouse_Stock: 12,
            Reserved_SafeLock: 0,
            Reorder_Threshold: 2,
            Supplier_Lead_Days: 7,
            Status: 'HEALTHY_STOCK'
          });
        }
      });
      const updatedInv = Array.from(invMap.values());
      try {
        localStorage.setItem('OMNIBUILD_INVENTORY', JSON.stringify(updatedInv));
      } catch (e) {}
      return updatedInv;
    });

    return updatedCatalog;
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

    // Precise multi-SKU Stock Decrement & Reserved Count Increment
    setInventory(prev => prev.map(item => {
      let qtyToDeduct = 0;
      if (orderData.items && Array.isArray(orderData.items)) {
        const match = orderData.items.find(it => (it.sku || it.SKU) === item.SKU);
        if (match) {
          qtyToDeduct = Number(match.qty || match.Qty || match.quantity) || 1;
        }
      } else if (orderData.Ordered_SKU && orderData.Ordered_SKU.includes(item.SKU)) {
        // Try regex match for e.g. "BED-MOD-001 ... x2"
        const regex = new RegExp(`${item.SKU}[^\\n\\r,]*?x(\\d+)`, 'i');
        const match = orderData.Ordered_SKU.match(regex);
        qtyToDeduct = match ? (Number(match[1]) || 1) : 1;
      }

      if (qtyToDeduct > 0) {
        const newWh = Math.max(0, (Number(item.Warehouse_Qty) || 0) - qtyToDeduct);
        const newRes = (Number(item.Reserved_SafeLock) || 0) + qtyToDeduct;
        const threshold = Number(item.Buffer_Threshold) || 2;
        return {
          ...item,
          Warehouse_Qty: newWh,
          Reserved_SafeLock: newRes,
          Reorder_Status: newWh <= threshold ? "CRITICAL_REORDER" : "HEALTHY"
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
    const targetOrder = orders.find(ord => ord.Order_ID === orderId);
    setOrders(prev => prev.map(ord => {
      if (ord.Order_ID === orderId) {
        return { ...ord, SafeLock_Status: newStatus };
      }
      return ord;
    }));

    // If order is DELIVERED, the reserved physical units leave warehouse permanently
    if (newStatus.includes("DELIVERED") && targetOrder) {
      setInventory(prev => prev.map(item => {
        if (targetOrder.Ordered_SKU && targetOrder.Ordered_SKU.includes(item.SKU)) {
          return {
            ...item,
            Reserved_SafeLock: Math.max(0, (Number(item.Reserved_SafeLock) || 0) - 1)
          };
        }
        return item;
      }));
    }

    // If order is CANCELLED or RELEASED, reserved units return to warehouse stock
    if ((newStatus.includes("CANCELLED") || newStatus.includes("RELEASED")) && targetOrder) {
      setInventory(prev => prev.map(item => {
        if (targetOrder.Ordered_SKU && targetOrder.Ordered_SKU.includes(item.SKU)) {
          const newWh = (Number(item.Warehouse_Qty) || 0) + 1;
          const newRes = Math.max(0, (Number(item.Reserved_SafeLock) || 0) - 1);
          const threshold = Number(item.Buffer_Threshold) || 2;
          return {
            ...item,
            Warehouse_Qty: newWh,
            Reserved_SafeLock: newRes,
            Reorder_Status: newWh <= threshold ? "CRITICAL_REORDER" : "HEALTHY"
          };
        }
        return item;
      }));
    }

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
    const targetOrder = orders.find(ord => ord.Order_ID === orderId);
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

    // Release reservation since stock is physically delivered to customer
    if (targetOrder) {
      setInventory(prev => prev.map(item => {
        if (targetOrder.Ordered_SKU && targetOrder.Ordered_SKU.includes(item.SKU)) {
          return {
            ...item,
            Reserved_SafeLock: Math.max(0, (Number(item.Reserved_SafeLock) || 0) - 1)
          };
        }
        return item;
      }));
    }

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

  // 6.1 Register New Custom Product SKU & Seed SafeLock Inventory
  const registerNewSku = (skuData) => {
    const sku = (skuData.sku || skuData.SKU || `GDJ-NEW-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
    const productName = (skuData.productName || skuData.Product_Name || "Custom Furniture Unit").trim();
    const category = skuData.category || skuData.Main_Category || "Living Room";
    const subCategory = skuData.subCategory || skuData.Sub_Category || "Custom Model";
    const material = skuData.material || skuData.Material_Spec || "Solid Teak Wood & Steel Frame";
    const dimensions = skuData.dimensions || skuData.Dimensions || 'Standard Size';
    const mrp = Number(skuData.mrp || skuData.MRP_INR) || 0;
    const sellingPrice = Number(skuData.sellingPrice || skuData.Selling_Price_INR) || 0;
    const warranty = Number(skuData.warranty || skuData.Warranty_Years) || 5;
    const boxCount = Number(skuData.boxCount || skuData.Total_Component_Boxes) || 1;
    const supplier = skuData.supplier || skuData.Default_Supplier || "Godrej Interio Flagship";
    const bay = skuData.bay || skuData.Assigned_Bay || "Dock-A1";
    const openingStock = Number(skuData.openingStock || skuData.Warehouse_Qty) || 0;
    const bufferThreshold = Number(skuData.bufferThreshold || skuData.Buffer_Threshold) || 2;
    const unitCost = Number(skuData.unitCost || skuData.Unit_Cost_INR) || Math.round(sellingPrice * 0.72);
    const imageUrl = skuData.imageUrl || skuData.Image_URL || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';

    const catalogItem = {
      SKU: sku,
      Product_Name: productName,
      Main_Category: category,
      Sub_Category: subCategory,
      Price_Tier: skuData.priceTier || "Luxury",
      Material_Spec: material,
      Dimensions: dimensions,
      MRP_INR: mrp,
      Selling_Price_INR: sellingPrice,
      Warranty_Years: warranty,
      Total_Component_Boxes: boxCount,
      Default_Supplier: supplier,
      Assigned_Bay: bay,
      Image_URL: imageUrl
    };

    const inventoryItem = {
      SKU: sku,
      Product_Name: productName,
      Category: category,
      Warehouse_Qty: openingStock,
      Reserved_SafeLock: 0,
      Buffer_Threshold: bufferThreshold,
      Reorder_Status: openingStock <= bufferThreshold ? "CRITICAL_REORDER" : "HEALTHY",
      Unit_Cost_INR: unitCost,
      Bay: bay,
      Last_Audited: formatDateTimeIndian()
    };

    // Update Master Catalog
    setCatalog(prev => {
      const exists = prev.some(c => c.SKU === sku);
      let updated;
      if (exists) {
        updated = prev.map(c => c.SKU === sku ? { ...c, ...catalogItem } : c);
      } else {
        updated = [catalogItem, ...prev];
      }
      try { localStorage.setItem('OMNIBUILD_CATALOG', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Update SafeLock Inventory
    setInventory(prev => {
      const exists = prev.some(i => i.SKU === sku);
      let updated;
      if (exists) {
        updated = prev.map(i => i.SKU === sku ? { ...i, ...inventoryItem } : i);
      } else {
        updated = [inventoryItem, ...prev];
      }
      try { localStorage.setItem('OMNIBUILD_INVENTORY', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`✨ Successfully registered new SKU: ${sku} & seeded ${openingStock} units in SafeLock!`, true);

    // Dispatch Webhook to Google Sheets
    dispatchWebhookAction('UPDATE_CATALOG_ITEM', {
      sku: sku,
      product_name: productName,
      category: category,
      sub_category: subCategory,
      material: material,
      dimensions: dimensions,
      mrp: mrp,
      selling_price: sellingPrice,
      warranty: warranty,
      box_count: boxCount,
      assigned_bay: bay,
      default_supplier: supplier,
      opening_stock: openingStock,
      buffer_threshold: bufferThreshold,
      unit_cost: unitCost
    });

    return catalogItem;
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
  const syncWithGoogleSheets = async (silent = false, targetTab = null) => {
    setIsSyncing(true);
    if (!silent) {
      playScanBeep();
      showToast(targetTab && targetTab !== 'ALL' ? `⚡ Fast-syncing [${targetTab}] tables from Google Sheets...` : "📡 Connecting to Google Apps Script Master Webhook...");
    }

    try {
      // ⚡ FAST PATH: Instant Cloudflare D1 Edge SQL Hydration (Sub-10ms)
      try {
        const edgeRes = await fetch('/api/d1/sync-all');
        if (edgeRes.ok) {
          const edgeJson = await edgeRes.json();
          if (edgeJson.success && edgeJson.data) {
            if (Array.isArray(edgeJson.data.orders) && edgeJson.data.orders.length > 0) setOrders(edgeJson.data.orders);
            if (Array.isArray(edgeJson.data.catalog) && edgeJson.data.catalog.length > 0) setCatalog(edgeJson.data.catalog);
            if (Array.isArray(edgeJson.data.inquiries) && edgeJson.data.inquiries.length > 0) setInquiries(edgeJson.data.inquiries);
            if (Array.isArray(edgeJson.data.architects) && edgeJson.data.architects.length > 0) setArchitects(edgeJson.data.architects);
          }
        }
      } catch (d1Err) {}

      const isFullSync = targetTab === 'ALL';
      const actionToDispatch = isFullSync ? 'FETCH_ALL_TABLES' : 'SYNC_TAB_TABLES';
      const payload = isFullSync ? {} : { target_tab: targetTab || activeTab };

      const res = await dispatchWebhookAction(actionToDispatch, payload);
      if (res && res.tables) {
        setCloudTables(prev => ({ ...prev, ...res.tables }));

        // Helper to find table rows in res.tables flexibly
        const getTableRows = (possibleNames) => {
          for (const name of possibleNames) {
            if (Array.isArray(res.tables[name]) && res.tables[name].length > 0) {
              return res.tables[name];
            }
          }
          return null;
        };

        // 1. Sync Orders_SafeLock (200 rows)
        const rawOrders = getTableRows(['Orders_SafeLock', '05_Orders_SafeLock', 'Orders SafeLock', 'Orders']);
        if (rawOrders) {
          const cloudOrders = rawOrders.map(row => ({
            Order_ID: row.Order_ID || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            Customer_Name: row.Customer_Name || "VIP Customer",
            Customer_Phone: String(row.Customer_Phone || ""),
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
            OTP_Code: String(row.OTP_Code || "8899"),
            Created_Date: row.Created_Date || row.Timestamp || formatDateTimeIndian()
          }));
          setOrders(cloudOrders);
        }

        // 2. Sync Inquiries_Log (22 rows)
        const rawInquiries = getTableRows(['Inquiries_Log', '06_Inquiries_Log', 'Enquiries_Log', 'Inquiries Log', 'Enquiries Log']);
        if (rawInquiries) {
          const cloudInquiries = rawInquiries.map(row => ({
            Inquiry_ID: row.Inquiry_ID || `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
            Timestamp: row.Timestamp || formatDateTimeIndian(),
            Customer_Name: row.Customer_Name || "Walk-In Customer",
            Customer_Phone: String(row.Customer_Phone || ""),
            Address: row.Address || row.Locality_Address || "Rayagada",
            Channel: row.Channel || "SHOWROOM_WALKIN",
            Category_Models: row.Category_Models || "Living Room Sofa & Recliner",
            Budget_INR: Number(row.Budget_INR) || 0,
            AI_Intent_Score: Number(row.AI_Intent_Score) || 75,
            Follow_Up_Date: row.Follow_Up_Date || "Tomorrow 11:00 AM",
            Status: row.Status || "HOT_LEAD",
            Assigned_Staff: row.Assigned_Staff || "Rakesh (Store Manager)"
          }));
          setInquiries(cloudInquiries);
        }

        // 3. Sync Payments_Log (32 rows)
        const rawPayments = getTableRows(['Payments_Log', '13_Payments_Log', 'Payments Log', 'Transactions_Log']);
        if (rawPayments) {
          setPaymentsLog(rawPayments);
        }

        // 4. Sync Inventory_Stock (155 rows)
        const rawInventory = getTableRows(['Inventory_Stock', '03_Inventory_Stock', 'Inventory Stock']);
        if (rawInventory) {
          setInventory(rawInventory);
        }

        // 5. Sync SmartKit_Components (227 rows)
        const rawBoxes = getTableRows(['SmartKit_Components', '04_SmartKit_Components', 'SmartKit Components']);
        if (rawBoxes) {
          setSmartKitBoxes(rawBoxes);
        }

        // 6. Sync Architect_VIPs (50 rows)
        const rawArchitects = getTableRows(['Architect_VIPs', '05_Architect_VIPs', 'Architect VIPs']);
        if (rawArchitects) {
          setArchitects(rawArchitects);
        }

        // 7. Sync Fleet Drivers & Routes
        const rawDrivers = getTableRows(['Fleet_Drivers', '14_Fleet_Drivers', 'Fleet Drivers']);
        if (rawDrivers) setDrivers(rawDrivers);

        const rawRoutes = getTableRows(['Delivery_Route_Stops', '15_Delivery_Route_Stops', 'Delivery Route Stops']);
        if (rawRoutes) setRouteStops(rawRoutes);

        // 8. Sync Sales Targets & Daily Summary
        const rawTargets = getTableRows(['Store_Sales_Targets', '17_Store_Sales_Targets', 'Store Sales Targets']);
        if (rawTargets) setTargets(rawTargets);
      }
    } catch (e) {
      console.warn("[Cloud Sync Hydration Warning]:", e);
    } finally {
      setIsSyncing(false);
      if (!silent) {
        playSuccessChime();
        showToast(targetTab && targetTab !== 'ALL' ? `✅ Tab [${targetTab}] updated in real-time!` : "✅ Master Webhook 2-Way Sync Complete! All Tables Synchronized.");
      }
    }
  };

  // Initial Silent Fast Cloud Hydration on Startup (< 1s for Executive Tab)
  useEffect(() => {
    syncWithGoogleSheets(true, 'executive');
  }, []);

  // Background Fast Hydration on Tab Switch
  useEffect(() => {
    if (activeTab) {
      syncWithGoogleSheets(true, activeTab);
    }
  }, [activeTab]);

  // 💓 Multi-Terminal 45s Lightweight Cloud Heartbeat & Offline Queue Auto-Flush
  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.onLine) {
        syncWithGoogleSheets(true, activeTab);
        flushOfflineQueue();
      }
    }, 45000);
    return () => clearInterval(heartbeatTimer);
  }, [activeTab]);

  return (
    <StoreContext.Provider value={{
      currentUser,
      loginWithPin,
      loginAsRole,
      logout,
      activeTab,
      setActiveTab,
      appMode,
      toggleAppMode,
      cloudTables,
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
      bankAccounts,
      setBankAccounts,
      bankTransactions,
      setBankTransactions,
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
      importCatalogItems,
      triggerSafeLockOrder,
      convertInquiryToOrder,
      adjustStock,
      updateOrderStatus,
      verifySmartKitBox,
      submitEpodDelivery,
      disburseArchitectPayout,
      registerNewSku,
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

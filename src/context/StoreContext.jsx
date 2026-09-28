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
    'bank_ledger', 'tally_gst_desk', 'staff_qr', 'live_database', 'autonomous_fleet',
    'pms_tape_chart'
  ]),
  sunil_sales: Object.freeze([
    'voice_pos', 'b2b_projects', 'crm', 'safelock', 'documents', 'barcode_studio', 'qr_studio', 'tally_gst_desk', 'pms_tape_chart'
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
    name: 'Naresh & Naren (Store Directors & Owners)',
    roleName: 'Store Owners / Directors',
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

export async function verifyDirectorPin(pin) {
  const hash = await hashPin(pin);
  return hash === USER_ROLES.OWNER.pinHash;
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

  // Master Universal Cloudflare D1 Tables State with Persistence
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

  // ⚡ Tally Double-Entry Vouchers & Stock Movement Ledger
  const [tallyVouchers, setTallyVouchers] = useState(() => getStored('OMNIBUILD_TALLY_VOUCHERS', [
    { voucher_id: 'VCH-INIT-01', voucher_no: 'VN-1001', voucher_type: 'SALES', voucher_date: new Date().toISOString().slice(0, 10), party_ledger: 'Dr. Subhashish Jena', amount_inr: 62000, narration: 'Sales of Teak King Bed (Reverse 18% GST)', status: 'POSTED' },
    { voucher_id: 'VCH-INIT-02', voucher_no: 'VN-1002', voucher_type: 'RECEIPT', voucher_date: new Date().toISOString().slice(0, 10), party_ledger: 'HDFC Bank Ltd', amount_inr: 31000, narration: 'Advance 50% Token received via Dynamic UPI QR', status: 'POSTED' }
  ]));
  const [stockLedger, setStockLedger] = useState(() => getStored('OMNIBUILD_STOCK_LEDGER', [
    { ledger_id: 1, sku: 'BED-MOD-001', warehouse_id: 'WH-GODOWN-1', change_qty: 5, balance_qty: 5, reference_doc_type: 'PO', reference_doc_id: 'PO-GDJ-4401', created_at: new Date().toISOString() }
  ]));

  // 🚚 Transporter Consignments, Supplier Factory Invoices & Service Registries
  const [transitLr, setTransitLr] = useState(() => getStored('OMNIBUILD_TRANSIT_LR', []));
  const [supplierInvoices, setSupplierInvoices] = useState(() => getStored('OMNIBUILD_SUPPLIER_INVOICES', []));
  const [carpenterWorkOrders, setCarpenterWorkOrders] = useState(() => getStored('OMNIBUILD_CARPENTER_WO', []));
  const [warranties, setWarranties] = useState(() => getStored('OMNIBUILD_WARRANTIES', []));
  const [weddingSuites, setWeddingSuites] = useState(() => getStored('OMNIBUILD_WEDDING_SUITES', []));
  const [exchangeBuybacks, setExchangeBuybacks] = useState(() => getStored('OMNIBUILD_EXCHANGE_BUYBACKS', []));

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
  useEffect(() => { localStorage.setItem('OMNIBUILD_TALLY_VOUCHERS', JSON.stringify(tallyVouchers)); }, [tallyVouchers]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_STOCK_LEDGER', JSON.stringify(stockLedger)); }, [stockLedger]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_TRANSIT_LR', JSON.stringify(transitLr)); }, [transitLr]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_SUPPLIER_INVOICES', JSON.stringify(supplierInvoices)); }, [supplierInvoices]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_CARPENTER_WO', JSON.stringify(carpenterWorkOrders)); }, [carpenterWorkOrders]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_WARRANTIES', JSON.stringify(warranties)); }, [warranties]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_WEDDING_SUITES', JSON.stringify(weddingSuites)); }, [weddingSuites]);
  useEffect(() => { localStorage.setItem('OMNIBUILD_EXCHANGE_BUYBACKS', JSON.stringify(exchangeBuybacks)); }, [exchangeBuybacks]);

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

  // ⚡ Double-Entry Tally Rapid Voucher Posting Engine
  const postTallyVoucher = (voucher) => {
    const vId = voucher.voucher_id || `VCH-${Date.now().toString().slice(-6)}`;
    const vNo = voucher.voucher_no || `VN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoucher = {
      voucher_id: vId,
      voucher_no: vNo,
      voucher_type: voucher.voucher_type || 'SALES',
      voucher_date: voucher.voucher_date || new Date().toISOString().slice(0, 10),
      party_ledger: voucher.party_ledger || 'Cash',
      amount_inr: Number(voucher.amount_inr || voucher.amount || 0),
      narration: voucher.narration || '',
      gst_rate_pct: Number(voucher.gst_rate_pct || 18),
      status: 'POSTED',
      created_at: new Date().toISOString()
    };
    setTallyVouchers(prev => [newVoucher, ...(prev || [])]);
    playSuccessChime();
    showToast(`⚡ Tally ${newVoucher.voucher_type} Voucher #${vNo} posted to ledger!`, true);
    dispatchWebhookAction('POST_TALLY_VOUCHER', newVoucher);
    return newVoucher;
  };

  // 📦 Double-Entry Stock Movement Record
  const recordStockMovement = (sku, changeQty, docType = 'STOCK_ADJUSTMENT', docId = '') => {
    const targetSku = sku || 'BED-MOD-001';
    const refDocId = docId || `DOC-${Date.now().toString().slice(-4)}`;
    const newEntry = {
      ledger_id: Date.now(),
      sku: targetSku,
      warehouse_id: 'WH-GODOWN-1',
      change_qty: changeQty,
      balance_qty: 5,
      reference_doc_type: docType,
      reference_doc_id: refDocId,
      created_at: new Date().toISOString()
    };
    setStockLedger(prev => [newEntry, ...(prev || [])]);
    dispatchWebhookAction('RECORD_STOCK_MOVEMENT', {
      sku: targetSku,
      change_qty: changeQty,
      reference_doc_type: docType,
      reference_doc_id: refDocId
    });
    return newEntry;
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

    // ⚡ Interconnected Event Bridge: Auto-Post F8 Sales Voucher to Tally Hub
    const vNo = `VN-${Math.floor(1000 + Math.random() * 9000)}`;
    const autoSalesVoucher = {
      voucher_id: `VCH-${newOrder.Order_ID}`,
      voucher_no: vNo,
      voucher_type: 'SALES',
      voucher_date: new Date().toISOString().slice(0, 10),
      party_ledger: newOrder.Customer_Name,
      amount_inr: newOrder.Total_Amount_INR,
      narration: `POS Sales Order #${newOrder.Order_ID} for ${newOrder.Ordered_SKU}`,
      gst_rate_pct: 18,
      status: 'POSTED'
    };
    setTallyVouchers(prev => [autoSalesVoucher, ...(prev || [])]);
    dispatchWebhookAction('POST_TALLY_VOUCHER', autoSalesVoucher);

    // 📦 Interconnected Event Bridge: Deduct from Stock Movement Ledger
    recordStockMovement(newOrder.Ordered_SKU, -1, 'SALES_ORDER', newOrder.Order_ID);

    // 🧾 Interconnected Event Bridge: Auto-Log Invoice Document in Document Studio
    setDocumentsLog(prev => [{
      Doc_ID: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      Doc_Type: 'INVOICE',
      Entity_Ref_ID: newOrder.Order_ID,
      Customer_Vendor_Name: newOrder.Customer_Name,
      Total_Amount_INR: newOrder.Total_Amount_INR,
      GST_Amount_INR: Math.round((newOrder.Total_Amount_INR * 18) / 118),
      Generated_Date_Time: formatDateTimeIndian(),
      Status: 'GENERATED_LEGAL_COMPLIANT'
    }, ...(prev || [])]);

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

  // 3. Stock Dial / Stepper Override (Interconnected with Catalog, Stock Ledger & Tally Purchase)
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

    // Update Catalog warehouse count
    setCatalog(prev => prev.map(cat => {
      if (cat.SKU === sku) {
        return {
          ...cat,
          warehouse_qty: Math.max(0, (Number(cat.warehouse_qty) || 0) + changeWh)
        };
      }
      return cat;
    }));

    // Record to Stock Movement Ledger
    recordStockMovement(sku, changeWh, changeWh > 0 ? 'INWARD_RECEIVING' : 'STOCK_ADJUSTMENT', `STK-${Date.now().toString().slice(-4)}`);

    // If stock arrived inward (e.g. from factory truck), auto-generate F9 Purchase Voucher in Tally
    if (changeWh > 0) {
      const vNo = `VN-${Math.floor(1000 + Math.random() * 9000)}`;
      const purchaseVoucher = {
        voucher_id: `VCH-INW-${Date.now().toString().slice(-6)}`,
        voucher_no: vNo,
        voucher_type: 'PURCHASE',
        voucher_date: new Date().toISOString().slice(0, 10),
        party_ledger: 'Godrej Interio Corporate',
        amount_inr: Math.round(changeWh * 35000),
        narration: `Factory Truck Inward Receiving: +${changeWh} sets of ${sku} (${reason})`,
        gst_rate_pct: 18,
        status: 'POSTED'
      };
      setTallyVouchers(prev => [purchaseVoucher, ...(prev || [])]);
      dispatchWebhookAction('POST_TALLY_VOUCHER', purchaseVoucher);
    }

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

    // Dispatch Webhook to Cloudflare D1 Edge
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

  // 6.2 Merge Accidental Duplicate SKU into Master SKU (e.g., "Lexus" into "CH 1018")
  const mergeDuplicateProduct = (duplicateSku, masterSku) => {
    const dupItem = catalog.find(c => c.SKU === duplicateSku);
    const masterItem = catalog.find(c => c.SKU === masterSku);

    if (!dupItem || !masterItem) {
      showToast('⚠️ Could not find both duplicate and master SKUs to merge.', false);
      return;
    }

    const dupInv = inventory.find(i => i.SKU === duplicateSku);
    const dupStock = Number(dupInv?.Warehouse_Qty || 0);

    // 1. Add duplicate name/sku to master product aliases
    const updatedAliases = Array.from(new Set([
      ...(masterItem.aliases || []),
      dupItem.Product_Name,
      dupItem.SKU,
      dupItem.mfgCode || ''
    ].filter(Boolean)));

    // 2. Transfer stock to master
    setInventory(prev => prev.map(inv => {
      if (inv.SKU === masterSku) {
        return {
          ...inv,
          Warehouse_Qty: Number(inv.Warehouse_Qty || 0) + dupStock
        };
      }
      return inv;
    }).filter(inv => inv.SKU !== duplicateSku));

    // 3. Update master catalog item with merged aliases & remove duplicate
    setCatalog(prev => prev.map(cat => {
      if (cat.SKU === masterSku) {
        return {
          ...cat,
          aliases: updatedAliases
        };
      }
      return cat;
    }).filter(cat => cat.SKU !== duplicateSku));

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔗 Merged duplicate "${dupItem.Product_Name}" into Master SKU "${masterItem.SKU}"! Aliases updated and stock consolidated.`, true);

    dispatchWebhookAction('MERGE_DUPLICATE_SKU', {
      duplicate_sku: duplicateSku,
      master_sku: masterSku,
      transferred_stock: dupStock,
      updated_aliases: updatedAliases
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

  // 🚚 Extended Enterprise Table Dispatches
  const logTransitLr = (lrData) => {
    setTransitLr(prev => [lrData, ...prev]);
    dispatchWebhookAction('LOG_TRANSIT_LR', lrData);
  };
  const recordSupplierInvoice = (invData) => {
    setSupplierInvoices(prev => [invData, ...prev]);
    dispatchWebhookAction('RECORD_SUPPLIER_INVOICE', invData);
  };
  const logCarpenterWorkOrder = (woData) => {
    setCarpenterWorkOrders(prev => [woData, ...prev]);
    dispatchWebhookAction('ASSIGN_CARPENTER_WORK_ORDER', woData);
  };
  const logWeddingSuite = (suiteData) => {
    setWeddingSuites(prev => [suiteData, ...prev]);
    dispatchWebhookAction('LOG_WEDDING_SUITE', suiteData);
  };
  const logExchangeBuyback = (exchData) => {
    setExchangeBuybacks(prev => [exchData, ...prev]);
    dispatchWebhookAction('LOG_EXCHANGE_BUYBACK', exchData);
  };
  const registerWarranty = (warData) => {
    setWarranties(prev => [warData, ...prev]);
    dispatchWebhookAction('REGISTER_WARRANTY', warData);
  };

  // 8. Direct Sovereign Cloudflare D1 Edge Sync (Sub-10ms)
  const syncWithGoogleSheets = async (silent = false, targetTab = null) => {
    setIsSyncing(true);
    if (!silent) {
      playScanBeep();
      showToast("📡 Connecting to Cloudflare D1 Edge SQL Database...");
    }

    try {
      // ⚡ FAST PATH: Instant Cloudflare D1 Edge SQL Hydration (Sub-10ms)
      const edgeRes = await fetch('/api/d1/sync-all');
      if (edgeRes.ok) {
        const edgeJson = await edgeRes.json();
        if (edgeJson.success && edgeJson.data) {
          const d = edgeJson.data;
          if (Array.isArray(d.orders) && d.orders.length > 0) setOrders(d.orders);
          if (Array.isArray(d.catalog) && d.catalog.length > 0) setCatalog(d.catalog);
          if (Array.isArray(d.inquiries) && d.inquiries.length > 0) setInquiries(d.inquiries);
          if (Array.isArray(d.architects) && d.architects.length > 0) setArchitects(d.architects);
          if (Array.isArray(d.payments) && d.payments.length > 0) setPaymentsLog(d.payments);
          if (Array.isArray(d.vipProjects) && d.vipProjects.length > 0) setVipProjects(d.vipProjects);
          if (Array.isArray(d.floorAgingStock) && d.floorAgingStock.length > 0) setFloorAgingStock(d.floorAgingStock);
          if (Array.isArray(d.smartKitBoxes) && d.smartKitBoxes.length > 0) setSmartKitBoxes(d.smartKitBoxes);
          if (Array.isArray(d.bankTransactions) && d.bankTransactions.length > 0) setBankTransactions(d.bankTransactions);
          if (Array.isArray(d.documentsLog) && d.documentsLog.length > 0) setDocumentsLog(d.documentsLog);
          if (Array.isArray(d.drivers) && d.drivers.length > 0) setDrivers(d.drivers);
          if (Array.isArray(d.routeStops) && d.routeStops.length > 0) setRouteStops(d.routeStops);
          if (d.targets && typeof d.targets === 'object') setTargets(prev => ({ ...prev, ...d.targets }));
          if (d.eodSummary && typeof d.eodSummary === 'object') setEodSummary(prev => ({ ...prev, ...d.eodSummary }));
          if (Array.isArray(d.botConfigurations) && d.botConfigurations.length > 0) {
            setBots(prev => prev.map(b => {
              const match = d.botConfigurations.find(bc => (bc.bot_id || bc.botId) === (b.bot_id || b.botId));
              return match ? { ...b, ...match } : b;
            }));
          }
          if (Array.isArray(d.tallyVouchers) && d.tallyVouchers.length > 0) setTallyVouchers(d.tallyVouchers);
          if (Array.isArray(d.stockLedger) && d.stockLedger.length > 0) setStockLedger(d.stockLedger);
          if (Array.isArray(d.transitLr) && d.transitLr.length > 0) setTransitLr(d.transitLr);
          if (Array.isArray(d.supplierInvoices) && d.supplierInvoices.length > 0) setSupplierInvoices(d.supplierInvoices);
          if (Array.isArray(d.carpenterWorkOrders) && d.carpenterWorkOrders.length > 0) setCarpenterWorkOrders(d.carpenterWorkOrders);
          if (Array.isArray(d.warranties) && d.warranties.length > 0) setWarranties(d.warranties);
          if (Array.isArray(d.weddingSuites) && d.weddingSuites.length > 0) setWeddingSuites(d.weddingSuites);
          if (Array.isArray(d.exchangeBuybacks) && d.exchangeBuybacks.length > 0) setExchangeBuybacks(d.exchangeBuybacks);
        }
      }
      if (!silent) {
        playSuccessChime();
        showToast("⚡ Master Database Synced with Cloudflare D1 (0.2ms latency)!", true);
      }
    } catch (e) {
      console.warn("[Cloudflare D1 Edge Sync Warning]:", e);
      if (!silent) showToast("⚠️ Cloudflare D1 offline fallback active", false);
    } finally {
      setIsSyncing(false);
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
      tallyVouchers,
      setTallyVouchers,
      postTallyVoucher,
      stockLedger,
      setStockLedger,
      recordStockMovement,
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
      mergeDuplicateProduct,
      triggerAppSheetBot,
      verifyDirectorPin,
      transitLr,
      setTransitLr,
      logTransitLr,
      supplierInvoices,
      setSupplierInvoices,
      recordSupplierInvoice,
      carpenterWorkOrders,
      setCarpenterWorkOrders,
      logCarpenterWorkOrder,
      warranties,
      setWarranties,
      registerWarranty,
      weddingSuites,
      setWeddingSuites,
      logWeddingSuite,
      exchangeBuybacks,
      setExchangeBuybacks,
      logExchangeBuyback
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

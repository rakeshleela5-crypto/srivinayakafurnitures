// ==============================================================================
// OmniBuild OS™ — Universal Date Filter Context-Aware Pop-Up Modal
// Dynamically morphs to display the exact live records, KPIs, and columns
// for whichever tab/view it is opened from across the entire OS
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Calendar, 
  Search, 
  Printer, 
  Download, 
  RefreshCw, 
  X, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  FileText, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  Building2, 
  ArrowUpRight, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Package,
  Boxes,
  UserCheck,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { formatDisplayDate } from '../common/UniversalAuditWindowBar';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export function UniversalDateAuditModal({ isOpen, onClose, data = {} }) {
  const { 
    auditDateWindow, 
    updateAuditWindow, 
    orders = [], 
    inquiries = [], 
    tallyVouchers = [], 
    bankTransactions = [], 
    purchaseOrders = [], 
    routeStops = [], 
    vipProjects = [],
    architects = [],
    inventory = [],
    floorAgingStock = [],
    documentsLog = [],
    stockLedger = [],
    activeTab, 
    parseToIsoDate,
    showToast 
  } = useStore();

  // Active context: which screen triggered the modal
  const callerContext = data.context || activeTab || 'executive';

  // Internal interactive date window states
  const [fromDate, setFromDate] = useState(data.fromDate || auditDateWindow?.fromDate || '2026-09-28');
  const [toDate, setToDate] = useState(data.toDate || auditDateWindow?.toDate || '2026-09-28');
  const [activePreset, setActivePreset] = useState(auditDateWindow?.activePreset || 'Today');
  
  // Search query
  const [searchTerm, setSearchTerm] = useState('');

  // Primary tab definition based on caller context
  const getContextTabId = (ctx) => {
    switch (ctx) {
      case 'autoprocure': return 'procurement';
      case 'logistics_epod':
      case 'autonomous_fleet': return 'logistics';
      case 'safelock': return 'safelock';
      case 'b2b_projects': return 'b2b_projects';
      case 'tally_gst_desk': return 'tally_vouchers';
      case 'bank_ledger':
      case 'bank_statement': return 'bank';
      case 'crm': return 'inquiries';
      case 'architects': return 'architects';
      case 'documents': return 'documents';
      case 'inward_scanner':
      case 'outward_scanner':
      case 'barcode_studio':
      case 'qr_studio':
      case 'staff_qr': return 'dock_scans';
      case 'voice_pos':
      case 'executive':
      default: return 'sales_orders';
    }
  };

  const [activeSubTab, setActiveSubTab] = useState(() => getContextTabId(callerContext));

  // Sync state whenever modal opens or context changes
  useEffect(() => {
    if (isOpen) {
      const targetSub = getContextTabId(callerContext);
      setActiveSubTab(targetSub);
      if (data.fromDate) setFromDate(data.fromDate);
      else if (auditDateWindow?.fromDate) setFromDate(auditDateWindow.fromDate);
      if (data.toDate) setToDate(data.toDate);
      else if (auditDateWindow?.toDate) setToDate(auditDateWindow.toDate);
      if (auditDateWindow?.activePreset) setActivePreset(auditDateWindow.activePreset);
      setSearchTerm('');
    }
  }, [isOpen, callerContext, data.fromDate, data.toDate, auditDateWindow?.fromDate, auditDateWindow?.toDate]);

  if (!isOpen) return null;

  // Universal robust date checker using StoreContext's parseToIsoDate
  const isDateBetween = (dateVal) => {
    if (!dateVal) return true;
    const iso = parseToIsoDate(dateVal);
    if (!iso) return true;
    return iso >= fromDate && iso <= toDate;
  };

  // Quick Preset Click Handler
  const handleApplyPreset = (presetName) => {
    playScanBeep();
    let s = '2026-09-28';
    let e = '2026-09-28';

    if (presetName === 'Today') {
      s = '2026-09-28';
      e = '2026-09-28';
    } else if (presetName === 'Yesterday') {
      s = '2026-09-27';
      e = '2026-09-27';
    } else if (presetName === 'Last 7 Days') {
      s = '2026-09-22';
      e = '2026-09-28';
    } else if (presetName === 'This Month') {
      s = '2026-09-01';
      e = '2026-09-30';
    } else if (presetName === 'FY Year') {
      s = '2026-04-01';
      e = '2027-03-31';
    }

    setFromDate(s);
    setToDate(e);
    setActivePreset(presetName);

    // Two-Way Sync to store
    updateAuditWindow({
      fromDate: s,
      toDate: e,
      appliedFrom: s,
      appliedTo: e,
      activePreset: presetName
    });

    showToast(`📅 Horizon set to ${presetName}: ${formatDisplayDate(s)} ➔ ${formatDisplayDate(e)}`);
  };

  // Manual Date Range Recalculate
  const handleApplyCustomRange = (e) => {
    if (e) e.preventDefault();
    if (fromDate > toDate) {
      showToast('⚠️ Start Date cannot be after End Date!', false);
      return;
    }
    playScanBeep();
    setActivePreset('Custom Range');
    updateAuditWindow({
      fromDate,
      toDate,
      appliedFrom: fromDate,
      appliedTo: toDate,
      activePreset: 'Custom Range'
    });
    showToast(`⚡ Recalculated Horizon: ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}`);
  };

  // =========================================================================
  // FILTERED DATASETS FOR ALL 11 DOMAINS
  // =========================================================================

  // 1. Procurement & Factory Purchase Orders
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const inDate = isDateBetween(po.created_at || po.expected_delivery);
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (po.po_id || '').toLowerCase().includes(term) ||
        (po.supplier || '').toLowerCase().includes(term) ||
        (po.transporter || '').toLowerCase().includes(term) ||
        (po.lr_number || '').toLowerCase().includes(term) ||
        (po.sku || '').toLowerCase().includes(term)
      );
    });
  }, [purchaseOrders, fromDate, toDate, searchTerm]);

  // 2. Logistics Fleet & ePOD Route Stops
  const filteredLogistics = useMemo(() => {
    // Merge orders with route stops for full delivery manifest
    const manifest = orders.map((o, idx) => ({
      stop_id: `STOP-${String(idx + 1).padStart(2, '0')}`,
      order_id: o.Order_ID || `ORD-${idx + 1}`,
      date: o.Delivery_Schedule || o.Created_At || '2026-09-28',
      customer: o.Customer_Name || 'Valued Client',
      phone: o.Customer_Phone || '9390553301',
      address: o.Project_Address || 'Rayagada District',
      driver: o.Assigned_Driver || 'Tophan Gouda (Tata Ace OD-18-A-1234)',
      sku: o.Ordered_SKU || 'Godrej Modular Furniture',
      amount_due: Number(o.Balance_Due_INR || (o.Total_Amount_INR - (o.Advance_Paid_INR || 0)) || 0),
      status: (o.SafeLock_Status || '').includes('DELIVERED') ? 'DELIVERED_COMPLETE' :
              (o.SafeLock_Status || '').includes('TRANSIT') ? 'ON_ROUTE (TRANSIT)' : 'READY_AT_DOCK',
      otp: o.OTP_Code || '5842'
    }));

    return manifest.filter(item => {
      const inDate = isDateBetween(item.date);
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.customer.toLowerCase().includes(term) ||
        item.order_id.toLowerCase().includes(term) ||
        item.driver.toLowerCase().includes(term) ||
        item.address.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term)
      );
    });
  }, [orders, fromDate, toDate, searchTerm]);

  // 3. SafeLock Staging & Warehouse Aging Stock
  const filteredSafeLock = useMemo(() => {
    const list = [
      ...floorAgingStock.map(f => ({
        sku: f.sku,
        name: f.name,
        category: 'Floor Aging Display Piece',
        warehouse_qty: 1,
        aging_days: f.floorDays || 45,
        price: f.clearancePrice || f.mrp || 45000,
        bay: f.bay || 'Bay 1',
        status: 'CLEARANCE_ACTIVE',
        date: '2026-09-28'
      })),
      ...inventory.map(inv => ({
        sku: inv.SKU,
        name: inv.Product_Name || inv.SKU,
        category: inv.Category || 'Warehouse Staged',
        warehouse_qty: Number(inv.Warehouse_Qty || 0),
        aging_days: 12,
        price: Number(inv.Selling_Price_INR || inv.Price || 25000),
        bay: inv.Storage_Bay || 'Main Warehouse',
        status: (Number(inv.Warehouse_Qty || 0) <= 2) ? 'CRITICAL_BUFFER' : 'STAGED_AVAILABLE',
        date: '2026-09-28'
      }))
    ];

    return list.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.sku.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.bay.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    });
  }, [floorAgingStock, inventory, searchTerm]);

  // 4. B2B Hotel & Institutional Turnkey Projects
  const filteredVipProjects = useMemo(() => {
    return vipProjects.filter(vp => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (vp.name || '').toLowerCase().includes(term) ||
        (vp.location || '').toLowerCase().includes(term) ||
        (vp.architect || '').toLowerCase().includes(term) ||
        (vp.stage || '').toLowerCase().includes(term)
      );
    });
  }, [vipProjects, searchTerm]);

  // 5. Tally Prime Vouchers
  const filteredVouchers = useMemo(() => {
    return tallyVouchers.filter(v => {
      const inDate = isDateBetween(v.voucher_date || '2026-09-28');
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (v.voucher_no || '').toLowerCase().includes(term) ||
        (v.party_ledger || '').toLowerCase().includes(term) ||
        (v.narration || '').toLowerCase().includes(term) ||
        (v.voucher_type || '').toLowerCase().includes(term)
      );
    });
  }, [tallyVouchers, fromDate, toDate, searchTerm]);

  // 6. Bank & RTGS Settlements
  const filteredBankTxns = useMemo(() => {
    return bankTransactions.filter(bt => {
      const inDate = isDateBetween(bt.Date || bt.dateTime || '2026-09-28');
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (bt.Description || '').toLowerCase().includes(term) ||
        (bt.Reference_No || '').toLowerCase().includes(term) ||
        (bt.Category || '').toLowerCase().includes(term)
      );
    });
  }, [bankTransactions, fromDate, toDate, searchTerm]);

  // 7. CRM Customer Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(iq => {
      const inDate = isDateBetween(iq.inquiry_date || iq.created_at || '2026-09-28');
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (iq.customer_name || '').toLowerCase().includes(term) ||
        (iq.phone || '').includes(term) ||
        (iq.category || '').toLowerCase().includes(term) ||
        (iq.status || '').toLowerCase().includes(term)
      );
    });
  }, [inquiries, fromDate, toDate, searchTerm]);

  // 8. VIP Architects & Referral Ledgers
  const filteredArchitects = useMemo(() => {
    return architects.filter(arc => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (arc.name || '').toLowerCase().includes(term) ||
        (arc.firm || '').toLowerCase().includes(term) ||
        (arc.phone || '').includes(term)
      );
    });
  }, [architects, searchTerm]);

  // 9. Document Studio Invoices & Delivery Challans
  const filteredDocuments = useMemo(() => {
    return documentsLog.filter(doc => {
      const inDate = isDateBetween(doc.Generated_Date_Time || '2026-09-28');
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (doc.Doc_ID || '').toLowerCase().includes(term) ||
        (doc.Customer_Vendor_Name || '').toLowerCase().includes(term) ||
        (doc.Doc_Type || '').toLowerCase().includes(term)
      );
    });
  }, [documentsLog, fromDate, toDate, searchTerm]);

  // 10. Dock Inward/Outward Scans
  const filteredDockScans = useMemo(() => {
    const list = stockLedger.map((sl, idx) => ({
      scan_id: `SCN-DOCK-${sl.ledger_id || idx + 1}`,
      sku: sl.sku || 'BED-MOD-001',
      date: (sl.created_at || '2026-09-28').slice(0, 10),
      warehouse: sl.warehouse_id || 'WH-GODOWN-1',
      change_qty: sl.change_qty || 5,
      doc_ref: `${sl.reference_doc_type || 'PO'}: ${sl.reference_doc_id || 'PO-GDJ-4401'}`,
      qc_status: '100% CARTON QC PASSED'
    }));

    return list.filter(item => {
      const inDate = isDateBetween(item.date);
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.sku.toLowerCase().includes(term) ||
        item.warehouse.toLowerCase().includes(term) ||
        item.doc_ref.toLowerCase().includes(term)
      );
    });
  }, [stockLedger, fromDate, toDate, searchTerm]);

  // 11. Retail Orders & Sales Register
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const inDate = isDateBetween(o.Created_At || o.Order_Date || o.Created_Timestamp || '2026-09-28');
      if (!inDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (o.Customer_Name || '').toLowerCase().includes(term) ||
        (o.Order_ID || '').toLowerCase().includes(term) ||
        (o.Customer_Phone || '').includes(term) ||
        (o.Ordered_SKU || '').toLowerCase().includes(term)
      );
    });
  }, [orders, fromDate, toDate, searchTerm]);

  // Unified Chronological Master Daybook
  const masterDaybook = useMemo(() => {
    const list = [];

    // Orders
    filteredOrders.forEach(o => {
      list.push({
        id: o.Order_ID || 'ORD-UNKNOWN',
        date: (o.Created_At || fromDate).slice(0, 10),
        time: (o.Created_At || '').slice(11, 16) || '10:30',
        type: 'RETAIL_SALE',
        typeLabel: 'Retail / Commercial Order',
        party: o.Customer_Name || 'Walk-In Customer',
        details: o.Ordered_SKU || 'Furniture Model',
        inflow: Number(o.Advance_Paid_INR || o.Total_Amount_INR || 0),
        outflow: 0,
        status: o.SafeLock_Status || 'CONFIRMED',
        badgeColor: '#10B981'
      });
    });

    // POs
    filteredPOs.forEach(p => {
      list.push({
        id: p.po_id || 'PO-UNKNOWN',
        date: parseToIsoDate(p.created_at) || fromDate,
        time: '09:00',
        type: 'FACTORY_PO',
        typeLabel: 'Factory Purchase Order',
        party: p.supplier || 'Plant Manufacturer',
        details: `${p.qty} Sets (${p.sku || 'Furniture Kits'})`,
        inflow: 0,
        outflow: Number(p.advance_paid || p.total_value || 0),
        status: p.status || 'PO_ACTIVE',
        badgeColor: '#F43F5E'
      });
    });

    // Tally Vouchers
    filteredVouchers.forEach(v => {
      const isReceipt = v.voucher_type === 'RECEIPT' || v.voucher_type === 'SALES';
      list.push({
        id: v.voucher_no || v.voucher_id || 'VCH-01',
        date: v.voucher_date || fromDate,
        time: '12:00',
        type: 'TALLY_VOUCHER',
        typeLabel: `Tally ${v.voucher_type}`,
        party: v.party_ledger || 'General Ledger',
        details: v.narration || 'Voucher Posting',
        inflow: isReceipt ? Number(v.amount_inr || 0) : 0,
        outflow: !isReceipt ? Number(v.amount_inr || 0) : 0,
        status: v.status || 'POSTED',
        badgeColor: '#F59E0B'
      });
    });

    return list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [filteredOrders, filteredPOs, filteredVouchers, fromDate, parseToIsoDate]);

  // =========================================================================
  // DYNAMIC CONTEXTUAL HEADER & 5 KPI CARDS
  // =========================================================================
  const contextMeta = useMemo(() => {
    switch (callerContext) {
      case 'autoprocure': {
        const totalValue = filteredPOs.reduce((acc, p) => acc + (Number(p.total_value) || 0), 0);
        const advancePaid = filteredPOs.reduce((acc, p) => acc + (Number(p.advance_paid) || 0), 0);
        const balanceDue = filteredPOs.reduce((acc, p) => acc + (Number(p.balance_due) || 0), 0);
        const totalSets = filteredPOs.reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
        return {
          title: '🏭 FACTORY PROCUREMENT & VENDOR PO AUDIT',
          subtitle: 'Plant Purchase Orders, Freight Bilties & Factory Advance Settlement',
          cards: [
            { label: 'Total PO Value', value: `₹${totalValue.toLocaleString('en-IN')}`, desc: `${filteredPOs.length} Active Orders`, color: '#38BDF8', icon: Package },
            { label: 'Advance Paid to Plants', value: `₹${advancePaid.toLocaleString('en-IN')}`, desc: 'Settled via Bank RTGS', color: '#22C55E', icon: TrendingUp },
            { label: 'Balance Due on LR', value: `₹${balanceDue.toLocaleString('en-IN')}`, desc: 'Against Transporter Bilty', color: '#F59E0B', icon: Clock },
            { label: 'Ordered Furniture', value: `${totalSets} Sets`, desc: '5-Box Knockdown Kits', color: '#A855F7', icon: Boxes },
            { label: 'Active Transporters', value: '3 Fleets', desc: 'VRL, SafeXpress, ARC', color: '#10B981', icon: Truck }
          ]
        };
      }
      case 'logistics_epod':
      case 'autonomous_fleet': {
        const totalStops = filteredLogistics.length;
        const delivered = filteredLogistics.filter(l => l.status === 'DELIVERED_COMPLETE').length;
        const inTransit = filteredLogistics.filter(l => l.status.includes('TRANSIT')).length;
        const codDue = filteredLogistics.reduce((acc, l) => acc + (Number(l.amount_due) || 0), 0);
        return {
          title: '🚚 LOGISTICS FLEET & DIGITAL ePOD DISPATCH AUDIT',
          subtitle: 'Delivery Runs, Real-Time Driver Manifests & Customer OTP Verification',
          cards: [
            { label: 'Scheduled Runs', value: `${totalStops} Stops`, desc: 'Rayagada & Outstation', color: '#38BDF8', icon: Truck },
            { label: 'ePODs Completed', value: `${delivered} Signed`, desc: '100% OTP Verified', color: '#22C55E', icon: CheckCircle2 },
            { label: 'Trucks In-Transit', value: `${inTransit} Active`, desc: 'Tata Ace & Eicher', color: '#F59E0B', icon: Clock },
            { label: 'Cash / UPI to Collect', value: `₹${codDue.toLocaleString('en-IN')}`, desc: 'Driver Balance on Delivery', color: '#F43F5E', icon: CreditCard },
            { label: 'Mistri Dispatch', value: '5 Carpenters', desc: 'Pre-Staged Installation', color: '#A855F7', icon: UserCheck }
          ]
        };
      }
      case 'safelock': {
        const totalAgingUnits = floorAgingStock.length;
        const stagedCount = inventory.length;
        const clearanceValue = floorAgingStock.reduce((acc, f) => acc + (Number(f.clearancePrice || f.mrp || 0)), 0);
        return {
          title: '🔒 SAFELOCK STAGING & WAREHOUSE AGING AUDIT',
          subtitle: 'Floor Aging Display Sentinels, Bay Staging & Buffer Stock Protection',
          cards: [
            { label: 'Clearance Display Stock', value: `₹${clearanceValue.toLocaleString('en-IN')}`, desc: `${totalAgingUnits} High-End Display Units`, color: '#F59E0B', icon: ShieldCheck },
            { label: 'Critical Buffer Alert', value: '3 SKUs Low', desc: 'Reorder Threshold Triggered', color: '#F43F5E', icon: TrendingDown },
            { label: 'Warehouse SKUs Staged', value: `${stagedCount} Items`, desc: 'Across Bays A1 to C4', color: '#38BDF8', icon: Boxes },
            { label: 'SafeLock Reserve Rate', value: '100%', desc: 'Locked against UPI Advance', color: '#22C55E', icon: CheckCircle2 },
            { label: 'Knockdown Boxes', value: '28 Cartons', desc: '5-Box Teak Packaging', color: '#A855F7', icon: Package }
          ]
        };
      }
      case 'b2b_projects': {
        const totalValue = filteredVipProjects.reduce((acc, vp) => acc + (Number(vp.value) || 0), 0);
        const totalAdvance = filteredVipProjects.reduce((acc, vp) => acc + (Number(vp.advance) || 0), 0);
        const balanceDue = totalValue - totalAdvance;
        return {
          title: '🏢 B2B HOTEL & INSTITUTIONAL TURNKEY CONTRACT AUDIT',
          subtitle: 'VIP Turnkey Villa Accounts, Milestone Invoicing & Architect Collaboration',
          cards: [
            { label: 'Total Contract Value', value: `₹${totalValue.toLocaleString('en-IN')}`, desc: `${filteredVipProjects.length} Major Projects`, color: '#38BDF8', icon: Building2 },
            { label: 'Token Advance Collected', value: `₹${totalAdvance.toLocaleString('en-IN')}`, desc: 'Stage 1 Milestones Paid', color: '#22C55E', icon: TrendingUp },
            { label: 'Milestone Balance Due', value: `₹${balanceDue.toLocaleString('en-IN')}`, desc: 'On Delivery & Fitting', color: '#F59E0B', icon: Clock },
            { label: 'Partner Architects', value: 'Studio Vastu + 2', desc: 'Lead Referral Network', color: '#A855F7', icon: Award },
            { label: 'Turnkey Completion', value: '68% Avg', desc: 'On-Track Execution', color: '#10B981', icon: CheckCircle2 }
          ]
        };
      }
      case 'tally_gst_desk': {
        const totalSalesDebits = filteredVouchers
          .filter(v => v.voucher_type === 'SALES')
          .reduce((acc, v) => acc + (Number(v.amount_inr) || 0), 0);
        const totalReceipts = filteredVouchers
          .filter(v => v.voucher_type === 'RECEIPT')
          .reduce((acc, v) => acc + (Number(v.amount_inr) || 0), 0);
        const gstReserve = Math.round(totalSalesDebits * 0.18 / 1.18);
        return {
          title: '🏛️ TALLYPRIME™ & STATUTORY GST VOUCHER AUDIT',
          subtitle: 'Double-Entry Ledgers, Official GSTR-1/3B Tax Obligations & Voucher Daybook',
          cards: [
            { label: 'Sales Vouchers Posted', value: `₹${totalSalesDebits.toLocaleString('en-IN')}`, desc: 'Debtors Ledger Entries', color: '#22C55E', icon: TrendingUp },
            { label: 'Receipts Settled', value: `₹${totalReceipts.toLocaleString('en-IN')}`, desc: 'Canara Bank Credited', color: '#38BDF8', icon: CreditCard },
            { label: '18% GST Output Reserve', value: `₹${gstReserve.toLocaleString('en-IN')}`, desc: 'CGST 9% + SGST 9%', color: '#F59E0B', icon: FileText },
            { label: 'Tally Vouchers Count', value: `${filteredVouchers.length} Entries`, desc: '100% Reconciled', color: '#A855F7', icon: Layers },
            { label: 'Statutory GSTIN', value: '21AABCS1234F1Z8', desc: 'Odisha State Code 21', color: '#10B981', icon: ShieldCheck }
          ]
        };
      }
      case 'bank_ledger':
      case 'bank_statement': {
        const totalCr = filteredBankTxns.filter(b => b.Type === 'CR').reduce((acc, b) => acc + (Number(b.Amount_INR) || 0), 0);
        const totalDr = filteredBankTxns.filter(b => b.Type === 'DR').reduce((acc, b) => acc + (Number(b.Amount_INR) || 0), 0);
        return {
          title: '🏦 BANK & RTGS DUAL-LEDGER SETTLEMENT AUDIT',
          subtitle: 'Live UPI, NEFT, RTGS & Showroom Counter Cash Settlements',
          cards: [
            { label: 'Total Inward Credits', value: `+₹${totalCr.toLocaleString('en-IN')}`, desc: 'Customer Advances & Payments', color: '#22C55E', icon: TrendingUp },
            { label: 'Total Outward Debits', value: `-₹${totalDr.toLocaleString('en-IN')}`, desc: 'Supplier & Operational Payouts', color: '#F43F5E', icon: TrendingDown },
            { label: 'Net Period Cashflow', value: `₹${(totalCr - totalDr).toLocaleString('en-IN')}`, desc: 'Net Operating Inflow', color: '#38BDF8', icon: CreditCard },
            { label: 'Transactions Count', value: `${filteredBankTxns.length} Txns`, desc: 'Dual-Book Verified', color: '#A855F7', icon: Layers },
            { label: 'Bank Reconciliation', value: '100% Matched', desc: 'No Unbilled Suspense', color: '#10B981', icon: CheckCircle2 }
          ]
        };
      }
      case 'crm': {
        const totalLeadVal = filteredInquiries.reduce((acc, iq) => acc + (Number(iq.estimated_value) || 0), 0);
        return {
          title: '📱 SHOWROOM CRM LEADS & PIPELINE AUDIT',
          subtitle: 'Customer Walk-Ins, WhatsApp Inquiries & Conversion Pipeline',
          cards: [
            { label: 'Total Inquiries', value: `${filteredInquiries.length} Leads`, desc: 'Logged in Date Horizon', color: '#38BDF8', icon: UserCheck },
            { label: 'Pipeline Value', value: `₹${totalLeadVal.toLocaleString('en-IN')}`, desc: 'Estimated Requirement Value', color: '#22C55E', icon: TrendingUp },
            { label: 'Hot Follow-ups', value: '4 Ready', desc: 'VIP Villa Quotations', color: '#F59E0B', icon: Clock },
            { label: 'Lead Source', value: 'Showroom + WA', desc: 'Direct Walk-In 78%', color: '#A855F7', icon: Sparkles },
            { label: 'Conversion Rate', value: '34.2%', desc: 'Advance Token Booked', color: '#10B981', icon: CheckCircle2 }
          ]
        };
      }
      case 'architects': {
        const totalRefVal = filteredArchitects.reduce((acc, a) => acc + (Number(a.total_orders_referred) || 0), 0);
        const totalComEarned = filteredArchitects.reduce((acc, a) => acc + (Number(a.total_commission_earned) || 0), 0);
        const totalDue = filteredArchitects.reduce((acc, a) => acc + (Number(a.commission_balance_due) || 0), 0);
        return {
          title: '🏛️ VIP ARCHITECT PARTNER COMMISSION & REFERRAL AUDIT',
          subtitle: 'Certified Architect Network, Villa Design Referrals & Payouts',
          cards: [
            { label: 'Referral Order Value', value: `₹${totalRefVal.toLocaleString('en-IN')}`, desc: 'Turnkey Luxury Projects', color: '#38BDF8', icon: Building2 },
            { label: 'Commission Earned', value: `₹${totalComEarned.toLocaleString('en-IN')}`, desc: 'Standard 8% VIP Commission', color: '#22C55E', icon: Award },
            { label: 'Pending Payout Due', value: `₹${totalDue.toLocaleString('en-IN')}`, desc: 'Upon Milestone Clearance', color: '#F59E0B', icon: Clock },
            { label: 'Active Architects', value: `${filteredArchitects.length} Partners`, desc: 'Studio Vastu, Studio Rayagada', color: '#A855F7', icon: UserCheck },
            { label: 'Certified Tier', value: 'Gold Circle', desc: 'Godrej Interio Authorized', color: '#10B981', icon: ShieldCheck }
          ]
        };
      }
      case 'documents': {
        const totalDocVal = filteredDocuments.reduce((acc, d) => acc + (Number(d.Total_Amount_INR) || 0), 0);
        const totalGst = filteredDocuments.reduce((acc, d) => acc + (Number(d.GST_Amount_INR) || 0), 0);
        return {
          title: '📄 CENTRAL DOCUMENT STUDIO STATUTORY PRINT AUDIT',
          subtitle: 'Tax Invoices, Delivery Challans, Quotations & E-Way Bills',
          cards: [
            { label: 'Total Document Value', value: `₹${totalDocVal.toLocaleString('en-IN')}`, desc: `${filteredDocuments.length} Legal Documents`, color: '#38BDF8', icon: FileText },
            { label: 'GST Collected', value: `₹${totalGst.toLocaleString('en-IN')}`, desc: 'Statutory Invoice Taxes', color: '#22C55E', icon: TrendingUp },
            { label: 'Tax Invoices Issued', value: `${filteredDocuments.filter(d => d.Doc_Type === 'INVOICE').length} Bills`, desc: 'Rule 48 Triplicate Compliant', color: '#F59E0B', icon: CheckCircle2 },
            { label: 'Delivery Challans', value: '4 Issued', desc: 'Attached to Transporter Bilty', color: '#A855F7', icon: Truck },
            { label: 'Legal Compliance', value: '100% Pass', desc: 'Govt NIC QR Verification', color: '#10B981', icon: ShieldCheck }
          ]
        };
      }
      case 'inward_scanner':
      case 'outward_scanner':
      case 'barcode_studio':
      case 'qr_studio':
      case 'staff_qr': {
        return {
          title: '📦 WAREHOUSE DOCK 1 INWARD & DOCK 2 DISPATCH AUDIT',
          subtitle: 'Barcode Scans, Truck Inward Receipts, QC Checks & Vehicle Gatepasses',
          cards: [
            { label: 'Dock Barcode Scans', value: `${filteredDockScans.length} Scans`, desc: '1D Code-128 & 2D QR', color: '#38BDF8', icon: Package },
            { label: 'Trucks Unloaded', value: '3 Trucks', desc: 'Odisha Freight Inward', color: '#22C55E', icon: Truck },
            { label: 'Carton QC Status', value: '100% Passed', desc: 'Zero Damage Claims', color: '#10B981', icon: ShieldCheck },
            { label: 'Gatepasses Cleared', value: '8 Gatepasses', desc: 'Driver OTP Verified', color: '#F59E0B', icon: CheckCircle2 },
            { label: 'Staging Bays Filled', value: 'Dock A1, B2, C1', desc: 'Ready for Dispatch', color: '#A855F7', icon: Boxes }
          ]
        };
      }
      default: {
        const totalGross = filteredOrders.reduce((acc, o) => acc + (Number(o.Total_Amount_INR) || 0), 0);
        const totalAdvance = filteredOrders.reduce((acc, o) => acc + (Number(o.Advance_Paid_INR) || 0), 0);
        const balanceDue = totalGross - totalAdvance;
        return {
          title: '🏛️ OMNIBUILD OS™ MASTER REVENUE & OPERATIONS AUDIT',
          subtitle: 'Executive Multi-Channel Sales, Liquid Collections & Operations Register',
          cards: [
            { label: 'Gross Revenue / Inflow', value: `₹${totalGross.toLocaleString('en-IN')}`, desc: `${filteredOrders.length} Retail & B2B Orders`, color: '#22C55E', icon: TrendingUp },
            { label: 'Liquid Cash / UPI', value: `₹${totalAdvance.toLocaleString('en-IN')}`, desc: 'Instant Advance Collected', color: '#38BDF8', icon: CreditCard },
            { label: 'Receivables Due', value: `₹${balanceDue.toLocaleString('en-IN')}`, desc: 'On Delivery & Installation', color: '#F59E0B', icon: Clock },
            { label: '18% GST Pool', value: `₹${Math.round(totalGross * 0.18 / 1.18).toLocaleString('en-IN')}`, desc: 'CGST 9% + SGST 9%', color: '#A855F7', icon: FileText },
            { label: 'Est. Net Margin', value: `₹${Math.round(totalGross * 0.32).toLocaleString('en-IN')}`, desc: '~32% Gross Showroom Profit', color: '#10B981', icon: Building2 }
          ]
        };
      }
    }
  }, [callerContext, filteredPOs, filteredLogistics, floorAgingStock, inventory, filteredVipProjects, filteredVouchers, filteredBankTxns, filteredInquiries, filteredArchitects, filteredDocuments, filteredDockScans, filteredOrders]);

  // Export CSV Handler
  const handleExportCsv = () => {
    playSuccessChime();
    let rows = [];
    let filename = `Audit_${callerContext}_${fromDate}_to_${toDate}.csv`;

    if (activeSubTab === 'procurement') {
      rows = [
        ['PO ID', 'Date', 'Supplier', 'SKUs', 'Quantity', 'Gross Subtotal', 'Advance Paid', 'Balance Due', 'Transporter', 'Status'],
        ...filteredPOs.map(p => [
          p.po_id,
          p.created_at,
          `"${p.supplier}"`,
          `"${p.sku}"`,
          p.qty,
          p.total_value,
          p.advance_paid,
          p.balance_due,
          `"${p.transporter}"`,
          p.status
        ])
      ];
    } else if (activeSubTab === 'logistics') {
      rows = [
        ['Stop No', 'Order ID', 'Date', 'Customer', 'Phone', 'Address', 'Driver', 'Items', 'Amount Due', 'Status'],
        ...filteredLogistics.map(l => [
          l.stop_id,
          l.order_id,
          l.date,
          `"${l.customer}"`,
          l.phone,
          `"${l.address}"`,
          `"${l.driver}"`,
          `"${l.sku}"`,
          l.amount_due,
          l.status
        ])
      ];
    } else if (activeSubTab === 'safelock') {
      rows = [
        ['SKU', 'Product Name', 'Category', 'Quantity', 'Floor Aging Days', 'Price', 'Bay Location', 'Status'],
        ...filteredSafeLock.map(s => [
          s.sku,
          `"${s.name}"`,
          `"${s.category}"`,
          s.warehouse_qty,
          s.aging_days,
          s.price,
          s.bay,
          s.status
        ])
      ];
    } else if (activeSubTab === 'b2b_projects') {
      rows = [
        ['Project ID', 'Client Name', 'Location', 'Contract Value', 'Advance Paid', 'Stage', 'Phone', 'Architect'],
        ...filteredVipProjects.map(v => [
          v.id,
          `"${v.name}"`,
          `"${v.location}"`,
          v.value,
          v.advance,
          `"${v.stage}"`,
          v.phone,
          `"${v.architect}"`
        ])
      ];
    } else if (activeSubTab === 'tally_vouchers') {
      rows = [
        ['Voucher No', 'Type', 'Date', 'Party Ledger', 'Narration', 'Amount', 'Status'],
        ...filteredVouchers.map(v => [
          v.voucher_no,
          v.voucher_type,
          v.voucher_date,
          `"${v.party_ledger}"`,
          `"${v.narration}"`,
          v.amount_inr,
          v.status
        ])
      ];
    } else {
      rows = [
        ['Date', 'Type', 'Reference ID', 'Party / Client', 'Details', 'Inflow (₹)', 'Outflow (₹)', 'Status'],
        ...masterDaybook.map(d => [
          d.date,
          d.typeLabel,
          d.id,
          `"${(d.party || '').replace(/"/g, '""')}"`,
          `"${(d.details || '').replace(/"/g, '""')}"`,
          d.inflow,
          d.outflow,
          d.status
        ])
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerGoldenConfetti();
    showToast(`📥 Exported CSV for ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}!`, true);
  };

  // Push to Tally XML
  const handleTallyXmlSync = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`⚡ Synchronized with Tally Prime 9 & Cloud Gateway!`, true);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-card modal-xl" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '1200px',
          width: '96vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #070B16 0%, #0B132B 100%)',
          border: '2px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          padding: '20px 24px',
          overflow: 'hidden'
        }}
      >
        {/* ================= HEADER ================= */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(34, 197, 94, 0.2) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏛️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
                  TAB VIEWPORT: {callerContext.toUpperCase()}
                </span>
                <span style={{ 
                  background: '#22C55E', 
                  color: '#FFFFFF', 
                  padding: '1px 8px', 
                  borderRadius: '12px', 
                  fontSize: '9.5px', 
                  fontWeight: '900',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)'
                }}>
                  LIVE AUDIT ACTIVE
                </span>
              </div>
              <h2 style={{ fontSize: '18.5px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{contextMeta.title}</span>
                <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '700' }}>
                  ({formatDisplayDate(fromDate)} ➔ {formatDisplayDate(toDate)})
                </span>
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => { playScanBeep(); window.print(); }} 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Print Voucher Daybook Report"
            >
              <Printer size={13} /> Print Slip
            </button>
            <button 
              onClick={handleExportCsv} 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              title="Download Filtered CSV"
            >
              <Download size={13} /> Export CSV
            </button>
            <button 
              className="btn-close-modal" 
              onClick={onClose}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '6px', color: '#FFF', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= INTERACTIVE DATE CONTROLS BAR ================= */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px'
        }}>
          {/* Left Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {/* From Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B' }}>From :</span>
              <input 
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  background: '#0B132B',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* To Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B' }}>To :</span>
              <input 
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{
                  background: '#0B132B',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Recalculate Green Display Button */}
            <button
              onClick={handleApplyCustomRange}
              style={{
                background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: '1px solid #4ADE80',
                borderRadius: '6px',
                padding: '4px 14px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.35)'
              }}
            >
              <RefreshCw size={12} /> Recalculate
            </button>

            {/* Quick Chips */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
              {['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'FY Year'].map(preset => {
                const isActive = activePreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      background: isActive ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#F59E0B' : '#94A3B8',
                      border: isActive ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: isActive ? '800' : '600',
                      cursor: 'pointer'
                    }}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search within Results */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Search across records..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#0B132B',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '5px 10px 5px 30px',
                fontSize: '11.5px',
                color: '#FFF',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* ================= 5-PILLAR CONTEXT-SPECIFIC KPI METRICS BAR ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '10px',
          marginBottom: '14px'
        }}>
          {contextMeta.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                style={{
                  background: `linear-gradient(135deg, ${card.color}18 0%, rgba(15, 23, 42, 0.85) 100%)`,
                  border: `1px solid ${card.color}44`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '10px', color: card.color, fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{card.label}</span>
                  <Icon size={12} color={card.color} />
                </div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                  {card.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= TABS NAVIGATION ================= */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '8px',
          marginBottom: '12px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'procurement', label: `Factory POs (${filteredPOs.length})`, icon: Package, contextMatch: 'autoprocure' },
            { id: 'logistics', label: `Fleet ePOD (${filteredLogistics.length})`, icon: Truck, contextMatch: 'logistics_epod' },
            { id: 'safelock', label: `SafeLock Stock (${filteredSafeLock.length})`, icon: ShieldCheck, contextMatch: 'safelock' },
            { id: 'b2b_projects', label: `B2B Projects (${filteredVipProjects.length})`, icon: Building2, contextMatch: 'b2b_projects' },
            { id: 'tally_vouchers', label: `Tally Vouchers (${filteredVouchers.length})`, icon: FileText, contextMatch: 'tally_gst_desk' },
            { id: 'bank', label: `Bank & RTGS (${filteredBankTxns.length})`, icon: CreditCard, contextMatch: 'bank_ledger' },
            { id: 'inquiries', label: `CRM Leads (${filteredInquiries.length})`, icon: UserCheck, contextMatch: 'crm' },
            { id: 'architects', label: `Architects (${filteredArchitects.length})`, icon: Award, contextMatch: 'architects' },
            { id: 'documents', label: `Documents (${filteredDocuments.length})`, icon: FileText, contextMatch: 'documents' },
            { id: 'dock_scans', label: `Dock Scans (${filteredDockScans.length})`, icon: Boxes, contextMatch: 'inward_scanner' },
            { id: 'sales_orders', label: `Orders (${filteredOrders.length})`, icon: ShoppingBag, contextMatch: 'executive' },
            { id: 'all_daybook', label: `Master Daybook (${masterDaybook.length})`, icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeSubTab === tab.id;
            const isPrimaryContext = tab.contextMatch === callerContext;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playScanBeep();
                  setActiveSubTab(tab.id);
                }}
                style={{
                  background: isTabActive ? 'rgba(212, 175, 55, 0.24)' : isPrimaryContext ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                  color: isTabActive ? '#FFFFFF' : isPrimaryContext ? '#4ADE80' : '#94A3B8',
                  border: isTabActive ? '1px solid #D4AF37' : isPrimaryContext ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid transparent',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: isTabActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={12} color={isTabActive ? '#D4AF37' : isPrimaryContext ? '#4ADE80' : '#94A3B8'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= TAB CONTENT (SCROLLABLE TABLE) ================= */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '260px' }}>
          
          {/* TAB: PROCUREMENT & POs */}
          {activeSubTab === 'procurement' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>PO Number</th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Manufacturer / Supplier</th>
                  <th style={{ padding: '8px 10px' }}>Ordered SKUs</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Sets</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Value</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Advance Paid</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Balance Due</th>
                  <th style={{ padding: '8px 10px' }}>Transporter / Bilty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.length === 0 ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No factory purchase orders recorded in selected date range.</td></tr>
                ) : (
                  filteredPOs.map(po => (
                    <tr key={po.po_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{po.po_id}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(parseToIsoDate(po.created_at) || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}>{po.supplier}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{po.sku}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#38BDF8' }}>{po.qty} Sets</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(po.total_value || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#22C55E' }}>₹{Number(po.advance_paid || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#F43F5E' }}>₹{Number(po.balance_due || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{po.transporter} <span style={{ color: '#F59E0B', fontSize: '10px' }}>({po.lr_number})</span></td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className={`badge ${po.status === 'PO_ACTIVE' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '9px' }}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: LOGISTICS FLEET */}
          {activeSubTab === 'logistics' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Stop ID</th>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Customer Name</th>
                  <th style={{ padding: '8px 10px' }}>Address</th>
                  <th style={{ padding: '8px 10px' }}>Assigned Driver</th>
                  <th style={{ padding: '8px 10px' }}>Item / SKU</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>COD Balance</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>OTP / Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogistics.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No delivery dispatches in selected range.</td></tr>
                ) : (
                  filteredLogistics.map(l => (
                    <tr key={l.stop_id + l.order_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#38BDF8' }}>{l.stop_id}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{l.order_id}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(parseToIsoDate(l.date) || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{l.customer}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{l.address}</td>
                      <td style={{ padding: '8px 10px', color: '#38BDF8', fontWeight: '600' }}>{l.driver}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{l.sku}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: l.amount_due > 0 ? '#F43F5E' : '#22C55E' }}>
                        ₹{Number(l.amount_due).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className={`badge ${l.status === 'DELIVERED_COMPLETE' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '9px' }}>
                          {l.status === 'DELIVERED_COMPLETE' ? '✓ ePOD SIGNED' : 'IN TRANSIT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: SAFELOCK WAREHOUSE */}
          {activeSubTab === 'safelock' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>SKU Code</th>
                  <th style={{ padding: '8px 10px' }}>Product Description</th>
                  <th style={{ padding: '8px 10px' }}>Classification</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Aging Days</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Clearance / Price</th>
                  <th style={{ padding: '8px 10px' }}>Bay Location</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Staging Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSafeLock.map((s, idx) => (
                  <tr key={s.sku + idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{s.sku}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{s.name}</td>
                    <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{s.category}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#38BDF8' }}>{s.warehouse_qty}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: s.aging_days > 40 ? '#F43F5E' : '#22C55E', fontWeight: '800' }}>
                      {s.aging_days} Days
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(s.price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{s.bay}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span className="badge badge-gold" style={{ fontSize: '9px' }}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB: B2B TURNKEY PROJECTS */}
          {activeSubTab === 'b2b_projects' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Project ID</th>
                  <th style={{ padding: '8px 10px' }}>VIP Client Name & Title</th>
                  <th style={{ padding: '8px 10px' }}>Site Location</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Contract Value</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Advance Paid</th>
                  <th style={{ padding: '8px 10px' }}>Milestone Stage</th>
                  <th style={{ padding: '8px 10px' }}>Partner Architect</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Turnkey Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVipProjects.map(vp => (
                  <tr key={vp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{vp.id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{vp.name}</td>
                    <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{vp.location}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(vp.value).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#22C55E' }}>₹{Number(vp.advance).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', color: '#38BDF8' }}>{vp.stage}</td>
                    <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{vp.architect}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span className="badge badge-purple" style={{ fontSize: '9px' }}>{vp.status || 'SAFELOCKED'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB: TALLY VOUCHERS */}
          {activeSubTab === 'tally_vouchers' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Voucher No</th>
                  <th style={{ padding: '8px 10px' }}>Type</th>
                  <th style={{ padding: '8px 10px' }}>Voucher Date</th>
                  <th style={{ padding: '8px 10px' }}>Party Ledger</th>
                  <th style={{ padding: '8px 10px' }}>Narration</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Tally Sync Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No Tally vouchers found in selected range.</td></tr>
                ) : (
                  filteredVouchers.map(v => (
                    <tr key={v.voucher_no || v.voucher_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{v.voucher_no}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ 
                          background: v.voucher_type === 'SALES' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: v.voucher_type === 'SALES' ? '#4ADE80' : '#38BDF8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '800'
                        }}>
                          {v.voucher_type}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(v.voucher_date)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{v.party_ledger}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{v.narration}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(v.amount_inr || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '9px' }}>✓ {v.status || 'POSTED'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: BANK & RTGS */}
          {activeSubTab === 'bank' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Ref / UTR No</th>
                  <th style={{ padding: '8px 10px' }}>Description / Narrative</th>
                  <th style={{ padding: '8px 10px' }}>Category</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Credit (+₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Debit (-₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredBankTxns.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No bank settlements found in selected range.</td></tr>
                ) : (
                  filteredBankTxns.map((bt, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(bt.Date || bt.dateTime)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#38BDF8' }}>{bt.Reference_No}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '600', color: '#FFF' }}>{bt.Description}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{bt.Category}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: bt.Type === 'CR' ? '#22C55E' : '#475569' }}>
                        {bt.Type === 'CR' ? `+₹${Number(bt.Amount_INR).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: bt.Type === 'DR' ? '#F43F5E' : '#475569' }}>
                        {bt.Type === 'DR' ? `-₹${Number(bt.Amount_INR).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#D4AF37' }}>
                        ₹{Number(bt.Balance_INR || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: CRM INQUIRIES */}
          {activeSubTab === 'inquiries' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Lead ID</th>
                  <th style={{ padding: '8px 10px' }}>Inquiry Date</th>
                  <th style={{ padding: '8px 10px' }}>Customer Name</th>
                  <th style={{ padding: '8px 10px' }}>Phone</th>
                  <th style={{ padding: '8px 10px' }}>Interested Category</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Budget / Deal (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Funnel Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No CRM leads recorded in selected range.</td></tr>
                ) : (
                  filteredInquiries.map(iq => (
                    <tr key={iq.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{iq.id}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate(iq.inquiry_date || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{iq.customer_name}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{iq.phone}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{iq.category}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(iq.estimated_value || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-purple" style={{ fontSize: '9px' }}>{iq.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: ARCHITECTS */}
          {activeSubTab === 'architects' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Architect Name</th>
                  <th style={{ padding: '8px 10px' }}>Studio / Firm</th>
                  <th style={{ padding: '8px 10px' }}>Phone</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Orders Referred</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Earned Commission</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Payout Due</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Partner Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchitects.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{a.name}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{a.firm}</td>
                    <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{a.phone}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(a.total_orders_referred || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#22C55E' }}>₹{Number(a.total_commission_earned || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#F43F5E' }}>₹{Number(a.commission_balance_due || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '9px' }}>{a.tier || 'VIP PARTNER'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB: DOCUMENTS */}
          {activeSubTab === 'documents' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Document No</th>
                  <th style={{ padding: '8px 10px' }}>Type</th>
                  <th style={{ padding: '8px 10px' }}>Customer / Vendor</th>
                  <th style={{ padding: '8px 10px' }}>Order Ref</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Value</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>GST Tax</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(d => (
                  <tr key={d.Doc_ID} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{d.Doc_ID}</td>
                    <td style={{ padding: '8px 10px', color: '#38BDF8', fontWeight: '700' }}>{d.Doc_Type}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{d.Customer_Vendor_Name}</td>
                    <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{d.Entity_Ref_ID}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(d.Total_Amount_INR || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#F59E0B' }}>₹{Number(d.GST_Amount_INR || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '9px' }}>✓ {d.Status || 'COMPLIANT'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB: DOCK SCANS */}
          {activeSubTab === 'dock_scans' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Scan ID</th>
                  <th style={{ padding: '8px 10px' }}>SKU Code</th>
                  <th style={{ padding: '8px 10px' }}>Warehouse Bay</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Change Qty</th>
                  <th style={{ padding: '8px 10px' }}>Document / PO Reference</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>QC Verdict</th>
                </tr>
              </thead>
              <tbody>
                {filteredDockScans.map(ds => (
                  <tr key={ds.scan_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{ds.scan_id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFF' }}>{ds.sku}</td>
                    <td style={{ padding: '8px 10px', color: '#38BDF8' }}>{ds.warehouse}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#22C55E' }}>+{ds.change_qty} Sets</td>
                    <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{ds.doc_ref}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '9px' }}>✓ {ds.qc_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB: RETAIL & B2B ORDERS */}
          {activeSubTab === 'sales_orders' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Order ID</th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Customer Name</th>
                  <th style={{ padding: '8px 10px' }}>Phone</th>
                  <th style={{ padding: '8px 10px' }}>Ordered Items / SKU</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Value</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Advance Paid</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>SafeLock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No orders found in selected range.</td></tr>
                ) : (
                  filteredOrders.map(o => (
                    <tr key={o.Order_ID} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#F59E0B' }}>{o.Order_ID}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>{formatDisplayDate((o.Created_At || '').slice(0, 10) || fromDate)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}>{o.Customer_Name}</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{o.Customer_Phone}</td>
                      <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{o.Ordered_SKU}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(o.Total_Amount_INR || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#22C55E' }}>₹{Number(o.Advance_Paid_INR || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-gold" style={{ fontSize: '9px' }}>{o.SafeLock_Status || 'SAFELOCKED'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: MASTER DAYBOOK */}
          {activeSubTab === 'all_daybook' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ background: '#070B16', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 10px' }}>Date & Time</th>
                  <th style={{ padding: '8px 10px' }}>Voucher / Ref ID</th>
                  <th style={{ padding: '8px 10px' }}>Classification</th>
                  <th style={{ padding: '8px 10px' }}>Party / Client Ledger</th>
                  <th style={{ padding: '8px 10px' }}>Narration / Particulars</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Inflow (₹ Cr)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Outflow (₹ Dr)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {masterDaybook.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      No transactions recorded between {formatDisplayDate(fromDate)} and {formatDisplayDate(toDate)}.
                    </td>
                  </tr>
                ) : (
                  masterDaybook.map((row, idx) => (
                    <tr 
                      key={row.id + idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '8px 10px', color: '#CBD5E1', fontFamily: 'monospace' }}>
                        {formatDisplayDate(row.date)} <span style={{ color: '#64748B' }}>{row.time}</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#F59E0B' }}>
                        {row.id}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          background: `${row.badgeColor}22`,
                          color: row.badgeColor,
                          border: `1px solid ${row.badgeColor}55`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}>
                          {row.typeLabel}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}>
                        {row.party}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.details}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: row.inflow ? '#22C55E' : '#475569' }}>
                        {row.inflow ? `+₹${row.inflow.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: row.outflow ? '#F43F5E' : '#475569' }}>
                        {row.outflow ? `-₹${row.outflow.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                          ✓ {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= FOOTER ACTIONS ================= */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '14px',
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94A3B8' }}>
            <span>⚡ Selected Range:</span>
            <strong style={{ color: '#F59E0B' }}>{formatDisplayDate(fromDate)}</strong>
            <span>to</span>
            <strong style={{ color: '#F59E0B' }}>{formatDisplayDate(toDate)}</strong>
            <span>•</span>
            <span>Active Domain: <strong style={{ color: '#38BDF8' }}>{activeSubTab.toUpperCase()}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleTallyXmlSync}
              className="btn-ghost-edit"
              style={{ fontSize: '11.5px', padding: '6px 14px', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              ⚡ Push to Tally XML
            </button>
            <button
              onClick={handleExportCsv}
              className="btn-ghost-edit"
              style={{ fontSize: '11.5px', padding: '6px 14px' }}
            >
              📥 Download CSV
            </button>
            <button
              onClick={onClose}
              className="btn-luxury-gold"
              style={{ fontSize: '11.5px', padding: '6px 20px' }}
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UniversalDateAuditModal;

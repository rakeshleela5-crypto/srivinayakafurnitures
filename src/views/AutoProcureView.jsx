import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Factory, 
  AlertCircle, 
  Send, 
  Check, 
  FileText,
  Clock,
  Package,
  Truck,
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  DollarSign,
  Search,
  AlertTriangle,
  Zap,
  TrendingDown,
  TrendingUp,
  Tag,
  Percent,
  Hash,
  ArrowRight,
  Box,
  X
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function AutoProcureView() {
  const { catalog, inventory, adjustStock, showToast, openModal, setActiveTab } = useStore();

  // 🤖 BOT-08 Autonomous PO Auto-Pilot State
  const [bot08Autopilot, setBot08Autopilot] = useState(true);

  // 🏭 Supplier & Transport State
  const [supplier, setSupplier] = useState("Godrej Khalapur Main Plant (MH)");
  const [transporter, setTransporter] = useState("VRL Logistics Express");
  const [lrNumber, setLrNumber] = useState("LR-892104");
  const [paymentTerms, setPaymentTerms] = useState("30_ADVANCE_70_LR");
  const [leadDays, setLeadDays] = useState(14);
  const [monsoonWrap, setMonsoonWrap] = useState(true);
  const [poNotes, setPoNotes] = useState("Handle with Care — Knockdown 5-Box Heavy Teak Kits");

  // 🔍 Catalog Search & Category Filter State
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(true);

  // 💰 Commercial Factory Negotiation & Discount State
  const [discountMode, setDiscountMode] = useState("PERCENT"); // 'PERCENT' | 'FLAT'
  const [discountValue, setDiscountValue] = useState(15); // Default 15% Factory Trade Discount
  const [freightCharges, setFreightCharges] = useState(4500); // Logistics & Shipping Surcharge
  const [advancePct, setAdvancePct] = useState(30); // 30% Advance Token default

  // 📦 Multi-SKU Items Line State
  const [poItems, setPoItems] = useState([
    {
      sku: "BED-MOD-001",
      product_name: "Solid Teak King Bed (5-Box Hydraulic)",
      qty: 5,
      unit_cost: 62000,
      gst_pct: 18
    },
    {
      sku: "WDR-MOD-001",
      product_name: "Godrej Sliding 3-Door Wardrobe",
      qty: 3,
      unit_cost: 48000,
      gst_pct: 18
    }
  ]);

  // 📋 Filter state for PO History
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [selectedPrintPo, setSelectedPrintPo] = useState(null);

  // 🚚 Live Purchase Orders History
  const [poHistory, setPoHistory] = useState([
    {
      po_id: "PO-2026-881",
      supplier: "Godrej Khalapur Main Plant (MH)",
      supplier_gstin: "27AAACG0534B1Z9",
      sku: "BED-MOD-001, WDR-MOD-001",
      items: [
        { sku: "BED-MOD-001", product_name: "Solid Teak King Bed", qty: 5, unit_cost: 62000, gst_pct: 18 },
        { sku: "WDR-MOD-001", product_name: "Godrej Sliding 3-Door Wardrobe", qty: 3, unit_cost: 48000, gst_pct: 18 }
      ],
      qty: 8,
      gross_subtotal: 454000,
      trade_discount: 68100,
      freight_charges: 4500,
      subtotal: 390400,
      gst_amount: 70272,
      total_value: 460672,
      advance_paid: 138202,
      balance_due: 322470,
      transporter: "VRL Logistics Express",
      lr_number: "LR-992182",
      payment_terms: "30_ADVANCE_70_LR",
      lead_days: 14,
      expected_delivery: "15-Sep-2026",
      status: "PO_ACTIVE",
      monsoon_wrap: true,
      created_at: "02-Sep-2026 10:30 AM"
    },
    {
      po_id: "PO-2026-879",
      supplier: "Godrej Chennai Upholstery Plant (TN)",
      supplier_gstin: "33AAACG0534B1Z5",
      sku: "SOF-MOD-001",
      items: [
        { sku: "SOF-MOD-001", product_name: "3+2 Velvet Luxury Sofa Set", qty: 4, unit_cost: 38000, gst_pct: 18 }
      ],
      qty: 4,
      gross_subtotal: 152000,
      trade_discount: 22800,
      freight_charges: 3000,
      subtotal: 132200,
      gst_amount: 23796,
      total_value: 155996,
      advance_paid: 155996,
      balance_due: 0,
      transporter: "SafeXpress Supply Chain",
      lr_number: "LR-771890",
      payment_terms: "100_ADVANCE_RTGS",
      lead_days: 10,
      expected_delivery: "08-Sep-2026",
      status: "TRUCK_IN_TRANSIT",
      monsoon_wrap: true,
      created_at: "30-Aug-2026 04:15 PM"
    },
    {
      po_id: "PO-2026-865",
      supplier: "CenturyPly ProModular, Cuttack (OD)",
      supplier_gstin: "21CCCC2222C3Z3",
      sku: "OFC-CH-002, TBL-MOD-001",
      items: [
        { sku: "OFC-CH-002", product_name: "Godrej High-Back Ergonomic Chair", qty: 10, unit_cost: 8500, gst_pct: 18 },
        { sku: "TBL-MOD-001", product_name: "Solid Teak 6-Seater Dining Table", qty: 2, unit_cost: 32000, gst_pct: 18 }
      ],
      qty: 12,
      gross_subtotal: 149000,
      trade_discount: 14900,
      freight_charges: 2500,
      subtotal: 136600,
      gst_amount: 24588,
      total_value: 161188,
      advance_paid: 0,
      balance_due: 161188,
      transporter: "ARC Roadways Heavy Freight",
      lr_number: "LR-662301",
      payment_terms: "30_DAYS_MSME_CREDIT",
      lead_days: 5,
      expected_delivery: "28-Aug-2026",
      status: "INWARD_RECEIVED",
      monsoon_wrap: true,
      created_at: "24-Aug-2026 11:00 AM"
    }
  ]);

  // 🚨 Critical Low Stock Inventory Detection
  const lowStockItems = useMemo(() => {
    return inventory.filter(i => (Number(i.Warehouse_Qty) || 0) <= (Number(i.Buffer_Threshold) || 2));
  }, [inventory]);

  // Categories list for pills
  const categoriesList = useMemo(() => {
    const cats = new Set();
    catalog.forEach(c => {
      const cat = c.Category || c.Main_Category;
      if (cat) cats.add(cat);
    });
    return ["ALL", ...Array.from(cats)];
  }, [catalog]);

  // Filtered Catalog Items for Live Search Drawer
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const itemCat = item.Category || item.Main_Category || "";
      const matchCat = selectedCategory === "ALL" || itemCat === selectedCategory;
      const matchQuery = !catalogSearch || 
        (item.Product_Name && item.Product_Name.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (item.SKU && item.SKU.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (itemCat && itemCat.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (item.Sub_Category && item.Sub_Category.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (item.Material_Spec && item.Material_Spec.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (item.Material && item.Material.toLowerCase().includes(catalogSearch.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [catalog, selectedCategory, catalogSearch]);

  // Helper date formatter
  const getExpectedDateStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + Number(days));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${dayStr}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  // 🧮 Dynamic Financial Calculations for Current PO Builder
  const grossListValue = useMemo(() => {
    return poItems.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unit_cost) || 0)), 0);
  }, [poItems]);

  const discountAmount = useMemo(() => {
    if (discountMode === "PERCENT") {
      return Math.round((grossListValue * (Number(discountValue) || 0)) / 100);
    } else {
      return Math.min(grossListValue, Number(discountValue) || 0);
    }
  }, [grossListValue, discountMode, discountValue]);

  const netTaxableValue = Math.max(0, grossListValue - discountAmount + (Number(freightCharges) || 0));

  const gstTotalValue = useMemo(() => {
    if (grossListValue === 0) return 0;
    // Effective blended GST calculation
    const weightedGstRatio = poItems.reduce((acc, it) => {
      const lineGross = (Number(it.qty) || 0) * (Number(it.unit_cost) || 0);
      const lineGst = (Number(it.gst_pct) || 18) / 100;
      return acc + (lineGross * lineGst);
    }, 0) / grossListValue;

    return Math.round(netTaxableValue * weightedGstRatio);
  }, [poItems, grossListValue, netTaxableValue]);

  const grandTotalValue = Math.round(netTaxableValue + gstTotalValue);
  const totalSetsQty = poItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);

  const advancePaidCalculated = useMemo(() => {
    return Math.round((grandTotalValue * (Number(advancePct) || 0)) / 100);
  }, [grandTotalValue, advancePct]);

  const balanceDueCalculated = Math.max(0, grandTotalValue - advancePaidCalculated);

  // ➕ 1-Click Quick Add SKU from Catalog / Radar
  const handleQuickAddSkuToPO = (skuCode, customSuggestedQty) => {
    const catItem = catalog.find(c => c.SKU === skuCode);
    const existingIndex = poItems.findIndex(i => i.sku === skuCode);

    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...poItems];
      const addQty = customSuggestedQty || 2;
      updated[existingIndex].qty += addQty;
      setPoItems(updated);
      playSuccessChime();
      showToast(`📦 Increased ${skuCode} quantity by +${addQty} Sets in PO!`, true);
    } else {
      // Add new row
      const defaultQty = customSuggestedQty || 4;
      const wholesaleCost = Number(catItem?.Unit_Cost_INR) || 
        (catItem?.Selling_Price_INR ? Math.round(catItem.Selling_Price_INR * 0.7) : 
        (catItem?.Price ? Math.round(catItem.Price * 0.65) : 
        (catItem?.MRP_INR ? Math.round(catItem.MRP_INR * 0.6) : 35000)));
      
      setPoItems([
        ...poItems,
        {
          sku: skuCode,
          product_name: catItem?.Product_Name || skuCode,
          qty: defaultQty,
          unit_cost: wholesaleCost,
          gst_pct: 18
        }
      ]);
      playSuccessChime();
      showToast(`✨ Added ${catItem?.Product_Name || skuCode} (${defaultQty} Sets) to Factory PO!`, true);
    }
  };

  // ➕ Multi-SKU Item Handlers
  const handleAddItemLine = () => {
    const defaultSku = catalog[0]?.SKU || 'BED-MOD-001';
    const defaultItem = catalog.find(c => c.SKU === defaultSku);
    const wholesaleCost = Number(defaultItem?.Unit_Cost_INR) || 
      (defaultItem?.Selling_Price_INR ? Math.round(defaultItem.Selling_Price_INR * 0.7) : 
      (defaultItem?.Price ? Math.round(defaultItem.Price * 0.65) : 
      (defaultItem?.MRP_INR ? Math.round(defaultItem.MRP_INR * 0.6) : 35000)));

    setPoItems([
      ...poItems,
      {
        sku: defaultSku,
        product_name: defaultItem?.Product_Name || 'Godrej Furniture Item',
        qty: 2,
        unit_cost: wholesaleCost,
        gst_pct: 18
      }
    ]);
  };

  const handleRemoveItemLine = (idx) => {
    if (poItems.length <= 1) {
      showToast("⚠️ Purchase Order must contain at least 1 item line.", false);
      return;
    }
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handleItemFieldChange = (idx, field, val) => {
    const updated = [...poItems];
    if (field === 'sku') {
      const selected = catalog.find(c => c.SKU === val);
      updated[idx].sku = val;
      updated[idx].product_name = selected?.Product_Name || val;
      const wholesaleCost = Number(selected?.Unit_Cost_INR) || 
        (selected?.Selling_Price_INR ? Math.round(selected.Selling_Price_INR * 0.7) : 
        (selected?.Price ? Math.round(selected.Price * 0.65) : 
        (selected?.MRP_INR ? Math.round(selected.MRP_INR * 0.6) : 35000)));
      updated[idx].unit_cost = wholesaleCost;
    } else {
      updated[idx][field] = val;
    }
    setPoItems(updated);
  };

  // ⚡ 1-Click Master AI Auto-Fill from Low Stock Radar
  const handleAutoFillReplenishment = () => {
    if (lowStockItems.length === 0) {
      showToast("✅ All 115 SKUs are healthy! No critical low-stock items detected.", true);
      return;
    }

    const autoLines = lowStockItems.map(low => {
      const catItem = catalog.find(c => c.SKU === low.SKU);
      const suggestedQty = Math.max(4, ((Number(low.Buffer_Threshold) || 2) * 3) - (Number(low.Warehouse_Qty) || 0));
      const wholesaleCost = Number(catItem?.Unit_Cost_INR) || 
        (catItem?.Selling_Price_INR ? Math.round(catItem.Selling_Price_INR * 0.7) : 
        (catItem?.Price ? Math.round(catItem.Price * 0.65) : 
        (catItem?.MRP_INR ? Math.round(catItem.MRP_INR * 0.6) : 40000)));

      return {
        sku: low.SKU,
        product_name: low.Product_Name || catItem?.Product_Name || low.SKU,
        qty: suggestedQty,
        unit_cost: wholesaleCost,
        gst_pct: 18
      };
    });

    setPoItems(autoLines);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`⚡ AI Radar auto-loaded all ${autoLines.length} critical low-stock items into PO Builder!`, true);
  };

  // 📝 Generate Multi-SKU Factory PO
  const handleGenerateFactoryPO = () => {
    const newPoId = `PO-2026-${Math.floor(900 + Math.random() * 99)}`;
    const expectedArrival = getExpectedDateStr(leadDays);

    const newPoRecord = {
      po_id: newPoId,
      supplier,
      supplier_gstin: supplier.includes("Khalapur") ? "27AAACG0534B1Z9" : "21CCCC2222C3Z3",
      sku: poItems.map(i => i.sku).join(', '),
      items: poItems,
      qty: totalSetsQty,
      gross_subtotal: grossListValue,
      trade_discount: discountAmount,
      freight_charges: Number(freightCharges) || 0,
      subtotal: netTaxableValue,
      gst_amount: gstTotalValue,
      total_value: grandTotalValue,
      advance_paid: advancePaidCalculated,
      balance_due: balanceDueCalculated,
      transporter,
      lr_number: lrNumber || `LR-${Math.floor(100000 + Math.random() * 900000)}`,
      payment_terms: paymentTerms,
      lead_days: leadDays,
      expected_delivery: expectedArrival,
      status: "PO_ACTIVE",
      monsoon_wrap: monsoonWrap,
      notes: poNotes,
      created_at: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setPoHistory([newPoRecord, ...poHistory]);

    // Dispatch to Master Webhook (Google Sheets: Purchase_Orders_Log)
    dispatchWebhookAction("GENERATE_FACTORY_PO", {
      po_id: newPoId,
      supplier,
      sku: newPoRecord.sku,
      qty: totalSetsQty,
      gross_list_total: grossListValue,
      trade_discount: discountAmount,
      freight_charges: Number(freightCharges) || 0,
      total_value: grandTotalValue,
      advance_paid: advancePaidCalculated,
      balance_due: balanceDueCalculated,
      transporter,
      lr_number: newPoRecord.lr_number,
      payment_terms: paymentTerms,
      expected_delivery: expectedArrival,
      status: "PO_ACTIVE",
      items_json: JSON.stringify(poItems),
      notes: poNotes
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🏭 Factory PO #${newPoId} (₹${grandTotalValue.toLocaleString()}) created & synced to Google Sheets!`, true);
  };

  // ✏️ Open PO Edit Modal
  const handleOpenEditPo = (po) => {
    openModal('edit_factory_po', {
      po,
      onSave: (updatedPo) => {
        setPoHistory(poHistory.map(p => p.po_id === updatedPo.po_id ? updatedPo : p));
      }
    });
  };

  // 📦 1-Click Receive Inward Truck at Dock
  const handleReceiveShipment = (targetPo) => {
    // Restock all items inside this PO
    if (targetPo.items && Array.isArray(targetPo.items)) {
      targetPo.items.forEach(it => {
        adjustStock(it.sku, Number(it.qty) || 1, 0, `Factory PO ${targetPo.po_id} Inward Truck QC Verified`);
      });
    } else {
      adjustStock(targetPo.sku, targetPo.qty || 1, 0, `Factory PO ${targetPo.po_id} Inward Truck QC Verified`);
    }

    setPoHistory(poHistory.map(p => p.po_id === targetPo.po_id ? { ...p, status: "INWARD_RECEIVED" } : p));

    // Webhook dispatch to Google Sheets Purchase_Orders_Log
    dispatchWebhookAction("RECEIVE_INWARD_PO_QC", {
      po_id: targetPo.po_id,
      factory_plant: targetPo.supplier,
      transporter: targetPo.transporter,
      lr_number: targetPo.lr_number,
      total_sets_received: targetPo.qty,
      qc_status: "PASSED_100_PERCENT",
      inspector_remarks: "100% Carton QC Verified at Rayagada Central Warehouse Dock 1",
      timestamp: new Date().toISOString()
    });

    playSuccessChime();
    showToast(`📦 Inward Truck Received: +${targetPo.qty} Sets added across inventory!`, true);
  };

  // 📲 Send WhatsApp Purchase Order to Manufacturer
  const handleSendWhatsAppPO = (po) => {
    const itemsListText = (po.items || []).map((it, i) => {
      const catMatch = catalog.find(c => c.SKU === it.sku);
      const imgUrl = catMatch?.Image_URL || it.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
      return `${i + 1}. *${it.sku}* (${it.product_name}) — *${it.qty} Sets* @ ₹${Number(it.unit_cost).toLocaleString()}/Set\n   📷 Spec Photo: ${imgUrl}`;
    }).join('\n\n');

    const text = `🏭 *OFFICIAL PURCHASE ORDER — GODREJ INTERIO RAYAGADA*\n` +
      `*PO Reference:* #${po.po_id} | *Date:* ${po.created_at || 'Today'}\n` +
      `*Manufacturer:* ${po.supplier}\n\n` +
      `📦 *ORDERED LINE ITEMS & SPECIFICATIONS:*\n${itemsListText}\n\n` +
      `💰 *Total Sets:* ${po.qty} Sets\n` +
      `🏷️ *Gross List:* ₹${Number(po.gross_subtotal || po.subtotal || po.total_value).toLocaleString()}\n` +
      `🏷️ *Trade Discount Applied:* -₹${Number(po.trade_discount || 0).toLocaleString()}\n` +
      `🚛 *Freight / Logistics:* +₹${Number(po.freight_charges || 0).toLocaleString()}\n` +
      `💵 *Grand Net Payable (18% GST Incl.):* ₹${Number(po.total_value).toLocaleString()}\n` +
      `💳 *Advance Token Paid:* ₹${Number(po.advance_paid || 0).toLocaleString()} (${po.payment_terms === '30_ADVANCE_70_LR' ? '30% Advance' : '100% RTGS'})\n` +
      `⏳ *Balance Due against LR Bilty:* ₹${Number(po.balance_due || (po.total_value - (po.advance_paid || 0))).toLocaleString()}\n` +
      `🚚 *Transporter:* ${po.transporter} (LR Bilty: *${po.lr_number || 'To be assigned'}*)\n` +
      `📅 *Expected Warehouse Delivery:* ${po.expected_delivery}\n` +
      `🌧️ *Monsoon Shrink-Wrap Packaging:* ${po.monsoon_wrap ? 'MANDATORY (5-Box Sealed)' : 'Standard'}\n` +
      `📍 *Unloading Point:* Central Warehouse Dock 1, Main Road, Rayagada (OD 765001)\n\n` +
      `🌟 *View Live PO Digital Dashboard:* https://shreeganesh-godrej.web.app\n` +
      `*Authorized Showroom Signatory:* Rakesh (Store Director — +91 93905 53301)`;

    // Log WhatsApp Outbound
    dispatchWebhookAction("DISPATCH_WHATSAPP_PO_DISPATCH", {
      po_id: po.po_id,
      supplier: po.supplier,
      phone: "+91 93905 53301",
      message: text
    });

    window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`📲 Official Purchase Order #${po.po_id} dispatched via WhatsApp!`, true);
  };

  // 🗑️ Cancel PO
  const handleCancelPO = (targetPoId) => {
    setPoHistory(poHistory.map(p => p.po_id === targetPoId ? { ...p, status: "CANCELLED" } : p));
    dispatchWebhookAction("UPDATE_PURCHASE_ORDER", {
      po_id: targetPoId,
      status: "CANCELLED",
      notes: "Cancelled by Store Director"
    });
    showToast(`🔴 Factory PO #${targetPoId} marked as Cancelled.`, true);
  };

  // Filtered PO History
  const filteredPoHistory = useMemo(() => {
    return poHistory.filter(po => {
      const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
      const matchesSearch = !searchFilter || 
        po.po_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchFilter.toLowerCase()) ||
        po.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (po.lr_number && po.lr_number.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [poHistory, statusFilter, searchFilter]);

  // Overall KPI Metrics & Pipeline Reconciliation
  const activeCount = poHistory.filter(p => p.status === 'PO_ACTIVE' || p.status === 'MANUFACTURING').length;
  const inTransitCount = poHistory.filter(p => p.status === 'TRUCK_IN_TRANSIT').length;
  const receivedCount = poHistory.filter(p => p.status === 'INWARD_RECEIVED').length;
  const totalPipelineValue = poHistory
    .filter(p => p.status !== 'CANCELLED')
    .reduce((acc, p) => acc + (Number(p.total_value) || 0), 0);

  const pipelineTotals = useMemo(() => {
    const activeAndTransit = poHistory.filter(p => p.status !== 'CANCELLED');
    const gross = activeAndTransit.reduce((acc, p) => acc + (Number(p.gross_subtotal) || Number(p.subtotal) || Number(p.total_value) || 0), 0);
    const discounts = activeAndTransit.reduce((acc, p) => acc + (Number(p.trade_discount) || 0), 0);
    const freight = activeAndTransit.reduce((acc, p) => acc + (Number(p.freight_charges) || 0), 0);
    const gst = activeAndTransit.reduce((acc, p) => acc + (Number(p.gst_amount) || 0), 0);
    const total = activeAndTransit.reduce((acc, p) => acc + (Number(p.total_value) || 0), 0);
    const advance = activeAndTransit.reduce((acc, p) => acc + (Number(p.advance_paid) || 0), 0);
    const balance = activeAndTransit.reduce((acc, p) => acc + (Number(p.balance_due) || (p.total_value - (p.advance_paid || 0))), 0);
    const totalSets = activeAndTransit.reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
    return { gross, discounts, freight, gst, total, advance, balance, totalSets, count: activeAndTransit.length };
  }, [poHistory]);

  const zeroStockCount = lowStockItems.filter(i => (Number(i.Warehouse_Qty) || 0) <= 0).length;
  const criticalCount = lowStockItems.filter(i => (Number(i.Warehouse_Qty) || 0) > 0 && (Number(i.Warehouse_Qty) || 0) <= (Number(i.Buffer_Threshold) || 2)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 TOP INTERCONNECTED COMMAND RIBBON */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">🏭 AUTOPROCURE™ ENTERPRISE SUPPLY CHAIN COCKPIT</span>
          
          <button 
            className="btn-ghost-edit" 
            onClick={() => openModal('vendor_sourcing')}
            style={{ fontSize: '11.5px', padding: '6px 14px', border: '1px solid var(--accent-gold)', background: 'rgba(212,175,55,0.08)', color: 'var(--accent-gold-light)' }}
          >
            <Building2 size={13} /> <span>⚙️ Sourcing Matrix & Margins</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              setBot08Autopilot(!bot08Autopilot);
              showToast(bot08Autopilot ? "⏸️ BOT-08 Auto-Pilot Paused." : "🤖 BOT-08 Autonomous Reorder Auto-Pilot Active!", true);
            }}
            style={{ fontSize: '11.5px', padding: '6px 14px', border: bot08Autopilot ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.2)', background: bot08Autopilot ? 'rgba(16,185,129,0.1)' : 'transparent', color: bot08Autopilot ? 'var(--accent-emerald)' : '#94A3B8' }}
          >
            <span className={bot08Autopilot ? "pulse-dot-emerald" : ""} style={{ marginRight: '4px' }} />
            <span>🤖 BOT-08 Auto-Pilot: <b>{bot08Autopilot ? 'ON' : 'OFF'}</b></span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-ghost-edit" 
            onClick={() => setActiveTab('inward_scanner')}
            style={{ fontSize: '11.5px', padding: '6px 12px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)', color: 'var(--accent-cyan)' }}
          >
            <Truck size={13} /> <span>📦 Dock 1 Scanner (Tab 14)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => setActiveTab('barcode_studio')}
            style={{ fontSize: '11.5px', padding: '6px 12px', border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.08)', color: 'var(--accent-purple)' }}
          >
            <Layers size={13} /> <span>🏷️ Barcode Studio (Tab 12)</span>
          </button>
        </div>
      </div>

      {/* 📊 1. EXECUTIVE KPI SUMMARY METRICS (INTERACTIVE SMART FILTERS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Card 1: Active Factory POs */}
        <div 
          id="kpi-active-pos"
          className="glass-panel" 
          onClick={() => {
            const nextFilter = statusFilter === 'PO_ACTIVE' ? 'ALL' : 'PO_ACTIVE';
            setStatusFilter(nextFilter);
            playSuccessChime();
            showToast(nextFilter === 'PO_ACTIVE' ? "🎯 Filtered to Active Factory POs in production!" : "📋 Reset to all orders in pipeline.", true);
            document.getElementById('po-pipeline-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ 
            padding: '16px 18px', 
            borderLeft: '4px solid var(--accent-gold)', 
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            background: statusFilter === 'PO_ACTIVE' ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(15,23,42,0.9) 100%)' : undefined,
            boxShadow: statusFilter === 'PO_ACTIVE' ? '0 0 20px rgba(212,175,55,0.35), inset 0 0 10px rgba(212,175,55,0.15)' : undefined,
            border: statusFilter === 'PO_ACTIVE' ? '1.5px solid var(--accent-gold)' : undefined,
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(212,175,55,0.25)'; }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = statusFilter === 'PO_ACTIVE' ? '0 0 20px rgba(212,175,55,0.35), inset 0 0 10px rgba(212,175,55,0.15)' : ''; 
          }}
          title="Click to filter table to Active Factory POs in production"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
              Active Factory POs
            </div>
            {statusFilter === 'PO_ACTIVE' && (
              <span className="badge badge-gold" style={{ fontSize: '9px', padding: '2px 6px' }}>FILTERED ✓</span>
            )}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {activeCount} <span style={{ fontSize: '12px', color: 'var(--accent-gold-light)', fontWeight: '600' }}>In Production</span>
          </div>
          <div style={{ fontSize: '11px', color: statusFilter === 'PO_ACTIVE' ? 'var(--accent-gold)' : '#94A3B8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <span>{statusFilter === 'PO_ACTIVE' ? '✓ Showing Active POs (Click to reset)' : '👆 Click to filter table ➔'}</span>
          </div>
        </div>

        {/* Card 2: In-Transit Trucks */}
        <div 
          id="kpi-transit-trucks"
          className="glass-panel" 
          onClick={() => {
            const nextFilter = statusFilter === 'TRUCK_IN_TRANSIT' ? 'ALL' : 'TRUCK_IN_TRANSIT';
            setStatusFilter(nextFilter);
            playSuccessChime();
            showToast(nextFilter === 'TRUCK_IN_TRANSIT' ? "🚛 Filtered to In-Transit Trucks & LR Bilty shipments!" : "📋 Reset to all orders in pipeline.", true);
            document.getElementById('po-pipeline-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ 
            padding: '16px 18px', 
            borderLeft: '4px solid var(--accent-cyan)', 
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            background: statusFilter === 'TRUCK_IN_TRANSIT' ? 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(15,23,42,0.9) 100%)' : undefined,
            boxShadow: statusFilter === 'TRUCK_IN_TRANSIT' ? '0 0 20px rgba(56,189,248,0.35), inset 0 0 10px rgba(56,189,248,0.15)' : undefined,
            border: statusFilter === 'TRUCK_IN_TRANSIT' ? '1.5px solid var(--accent-cyan)' : undefined,
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(56,189,248,0.25)'; }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = statusFilter === 'TRUCK_IN_TRANSIT' ? '0 0 20px rgba(56,189,248,0.35), inset 0 0 10px rgba(56,189,248,0.15)' : ''; 
          }}
          title="Click to track In-Transit Trucks & Lorry Receipts (LR Bilty)"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
              In-Transit Trucks (LR Tracked)
            </div>
            {statusFilter === 'TRUCK_IN_TRANSIT' && (
              <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '2px 6px' }}>FILTERED ✓</span>
            )}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-cyan)', marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {inTransitCount} <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>Vehicles on Road 🚛</span>
          </div>
          <div style={{ fontSize: '11px', color: statusFilter === 'TRUCK_IN_TRANSIT' ? 'var(--accent-cyan)' : '#94A3B8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <span>{statusFilter === 'TRUCK_IN_TRANSIT' ? '✓ Showing In-Transit (Click to reset)' : '👆 Click to track LR Bilty ➔'}</span>
          </div>
        </div>

        {/* Card 3: Critical Stockout Defense */}
        <div 
          id="kpi-critical-defense"
          className="glass-panel" 
          onClick={() => {
            playSuccessChime();
            if (lowStockItems.length > 0) {
              showToast(`🚨 Focused on ${lowStockItems.length} critical low-stock items in AI Radar!`, true);
              document.getElementById('stockout-radar-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              showToast("✅ All 115 SKUs are healthy! Buffer thresholds satisfied.", true);
            }
          }}
          style={{ 
            padding: '16px 18px', 
            borderLeft: '4px solid var(--accent-rose)', 
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(244,63,94,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
          title="Click to jump directly to AI Stockout Radar & 1-Click Replenishment"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
              Critical Stockout Defense
            </div>
            {lowStockItems.length > 0 && (
              <span className="badge badge-rose" style={{ fontSize: '9px', padding: '2px 6px', animation: 'pulse 2s infinite' }}>DEFENSE ACTIVE</span>
            )}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: lowStockItems.length > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {lowStockItems.length} <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '600' }}>SKUs Below Buffer</span>
          </div>
          <div style={{ fontSize: '11px', color: lowStockItems.length > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <span>{lowStockItems.length > 0 ? '🚨 Click for Replenish Radar ➔' : '✅ 100% Buffer Healthy'}</span>
          </div>
        </div>

        {/* Card 4: Total Supply Pipeline Value */}
        <div 
          id="kpi-pipeline-value"
          className="glass-panel" 
          onClick={() => {
            setShowPipelineModal(true);
            playSuccessChime();
            showToast("💰 Supply Chain Financial Reconciliation Opened!", true);
          }}
          style={{ 
            padding: '16px 18px', 
            borderLeft: '4px solid var(--accent-emerald)', 
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
          title="Click to open Supply Chain Financial Reconciliation & Advance Token Audit"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
              Total Supply Pipeline Value
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '2px 6px' }}>RECONCILED ✓</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
            ₹{totalPipelineValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <span>💰 Click for Financial Audit ➔</span>
          </div>
        </div>

      </div>

      {/* 🚨 2. AI STOCKOUT RADAR HUD (HEADS-UP DISPLAY) */}
      {lowStockItems.length > 0 ? (
        <div 
          id="stockout-radar-section"
          style={{ 
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,10,20,0.85) 100%)', 
            border: '1.5px solid rgba(244,63,94,0.6)', 
            borderRadius: '18px', 
            padding: '20px', 
            boxShadow: '0 12px 35px rgba(244,63,94,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
          
          {/* Radar Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(244,63,94,0.25)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--accent-rose)' }}>
                <Zap size={22} color="var(--accent-rose)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '900', margin: 0 }}>
                    AI STOCKOUT RADAR HUD
                  </h3>
                  <span className="badge badge-rose" style={{ animation: 'pulse 2s infinite' }}>
                    {lowStockItems.length} SKUs Depleted
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '3px' }}>
                  Real-time warehouse buffer defense: <strong style={{ color: 'var(--accent-rose)' }}>{zeroStockCount} Out of Stock</strong> • <strong style={{ color: 'var(--accent-amber)' }}>{criticalCount} Near Depletion</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn-luxury-gold" 
                onClick={handleAutoFillReplenishment}
                style={{ padding: '10px 20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
              >
                <Sparkles size={16} /> ⚡ 1-Click Auto-Fill Full Replenishment
              </button>
            </div>
          </div>

          {/* Radar Intelligence Mini-Cards Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '14px' 
          }}>
            {lowStockItems.map(item => {
              const catItem = catalog.find(c => c.SKU === item.SKU);
              const currentStock = Number(item.Warehouse_Qty) || 0;
              const bufferThreshold = Number(item.Buffer_Threshold) || 2;
              const isZero = currentStock <= 0;
              const healthPct = Math.min(100, Math.round((currentStock / bufferThreshold) * 100));
              const suggestedQty = Math.max(4, (bufferThreshold * 3) - currentStock);
              const wholesaleRate = catItem?.Price ? Math.round(catItem.Price * 0.65) : 35000;

              return (
                <div 
                  key={item.SKU}
                  style={{ 
                    background: 'rgba(10,15,30,0.85)', 
                    border: isZero ? '1.5px solid rgba(244,63,94,0.8)' : '1px solid rgba(245,158,11,0.5)', 
                    borderRadius: '14px', 
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: isZero ? '0 0 15px rgba(244,63,94,0.2)' : 'none',
                    position: 'relative'
                  }}
                >
                  {/* Top Item Info */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-gold" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {item.SKU}
                      </span>
                      {isZero ? (
                        <span className="badge badge-rose" style={{ fontSize: '10px', fontWeight: '800' }}>
                          🔴 0 UNITS — P1 RESTOCK
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '10px', fontWeight: '700' }}>
                          🟠 CRITICAL ({currentStock}/{bufferThreshold} Left)
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.3' }}>
                      {item.Product_Name || catItem?.Product_Name || item.SKU}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      {catItem?.Category || 'Godrej Premium Series'} • Factory Landed: ₹{wholesaleRate.toLocaleString()}
                    </div>
                  </div>

                  {/* Stock Health Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#CBD5E1', marginBottom: '4px' }}>
                      <span>Warehouse Health</span>
                      <span style={{ fontWeight: '700', color: isZero ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                        {currentStock} / {bufferThreshold} Units ({healthPct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.max(5, healthPct)}%`, 
                          height: '100%', 
                          background: isZero ? 'var(--accent-rose)' : 'var(--accent-amber)',
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> Est. Runway: <b>{Math.max(1, currentStock * 2)} Days</b> before complete dryout
                    </div>
                  </div>

                  {/* 1-Click Restock Button for this specific SKU */}
                  <button 
                    className="btn-ghost-edit" 
                    onClick={() => handleQuickAddSkuToPO(item.SKU, suggestedQty)}
                    style={{ 
                      width: '100%', 
                      fontSize: '11.5px', 
                      padding: '7px 10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      background: 'rgba(212,175,55,0.12)',
                      border: '1px solid var(--accent-gold)',
                      color: 'var(--accent-gold-light)',
                      fontWeight: '700'
                    }}
                  >
                    <Plus size={13} /> + Restock This SKU ({suggestedQty} Sets)
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div style={{ 
          background: 'rgba(16,185,129,0.08)', 
          border: '1px solid rgba(16,185,129,0.3)', 
          borderRadius: '14px', 
          padding: '14px 18px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <CheckCircle2 size={20} color="var(--accent-emerald)" />
          <div style={{ fontSize: '12.5px', color: '#E2E8F0' }}>
            <strong style={{ color: 'var(--accent-emerald)' }}>All 115+ Catalog SKUs Healthy!</strong> Warehouse buffers are fully fortified across all categories.
          </div>
        </div>
      )}

      {/* 📝 3. MULTI-SKU FACTORY PURCHASE ORDER BUILDER */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Factory size={20} color="var(--accent-gold-light)" /> Multi-SKU Factory Purchase Order Studio
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Create official truckload purchase orders with multi-SKU items, trade discounts, and LR Bilty tracking
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-cyan" 
              onClick={() => {
                const stagedPo = {
                  po_id: `PO-2026-DRAFT`,
                  supplier,
                  supplier_gstin: supplier.includes("Khalapur") ? "27AAACG0534B1Z9" : "21CCCC2222C3Z3",
                  sku: poItems.map(i => i.sku).join(', '),
                  items: poItems,
                  qty: totalSetsQty,
                  gross_subtotal: grossListValue,
                  trade_discount: discountAmount,
                  freight_charges: Number(freightCharges) || 0,
                  subtotal: netTaxableValue,
                  gst_amount: gstTotalValue,
                  total_value: grandTotalValue,
                  advance_paid: advancePaidCalculated,
                  balance_due: balanceDueCalculated,
                  transporter,
                  lr_number: lrNumber || `LR-DRAFT`,
                  payment_terms: paymentTerms,
                  lead_days: leadDays,
                  expected_delivery: getExpectedDateStr(leadDays),
                  status: "DRAFT_STAGED",
                  monsoon_wrap: monsoonWrap,
                  notes: poNotes,
                  created_at: new Date().toLocaleDateString('en-IN')
                };
                setSelectedPrintPo(stagedPo);
              }}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              <FileText size={13} /> 🖨️ Preview PO Document
            </button>
            <button 
              className="btn-ghost-edit"
              onClick={() => setShowCatalogDrawer(!showCatalogDrawer)}
              style={{ fontSize: '11.5px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', color: '#CBD5E1' }}
            >
              <Search size={13} /> {showCatalogDrawer ? "Hide 115+ Catalog" : "🔍 Browse 115+ Catalog"}
            </button>
            <span className="badge badge-gold">{poItems.length} SKUs Selected</span>
            <span className="badge badge-purple">{totalSetsQty} Total Sets</span>
          </div>
        </div>

        {/* 🔍 LIVE 115+ SKU CATALOG SEARCH & CATEGORY FILTER DRAWER */}
        {showCatalogDrawer && (
          <div style={{ 
            background: '#040817', 
            borderRadius: '14px', 
            padding: '16px', 
            border: '1px solid rgba(212,175,55,0.25)', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '11px' }}>115+ SKU FACTORY CATALOG</span>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Click "+ Add to PO" to append any model with wholesale landed cost:</span>
              </div>

              {/* Instant Search Bar */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input 
                  type="text" 
                  placeholder="Search 115+ models, SKU, wood..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  style={{ width: '100%', fontSize: '12px', padding: '7px 10px 7px 32px', borderRadius: '8px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
              {categoriesList.map(cat => (
                <button 
                  key={cat}
                  className={`btn-ghost-edit ${selectedCategory === cat ? 'badge-gold' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ 
                    fontSize: '11px', 
                    padding: '4px 10px', 
                    whiteSpace: 'nowrap',
                    borderRadius: '20px',
                    background: selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                    color: selectedCategory === cat ? '#000000' : '#CBD5E1',
                    fontWeight: selectedCategory === cat ? '800' : '500'
                  }}
                >
                  {cat === 'ALL' ? `All (${catalog.length})` : cat}
                </button>
              ))}
            </div>

            {/* Compact Catalog Cards Strip */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
              gap: '10px',
              maxHeight: '220px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {filteredCatalog.slice(0, 16).map(catItem => {
                const wholesaleCost = Number(catItem.Unit_Cost_INR) || 
                  (catItem.Selling_Price_INR ? Math.round(catItem.Selling_Price_INR * 0.7) : 
                  (catItem.Price ? Math.round(catItem.Price * 0.65) : 
                  (catItem.MRP_INR ? Math.round(catItem.MRP_INR * 0.6) : 35000)));
                const inPo = poItems.some(i => i.sku === catItem.SKU);
                const invRecord = inventory.find(i => i.SKU === catItem.SKU);
                const stockQty = Number(invRecord?.Warehouse_Qty) || 0;

                return (
                  <div 
                    key={catItem.SKU}
                    style={{ 
                      background: 'rgba(15,23,42,0.85)', 
                      border: inPo ? '1.5px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '10px', 
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <img 
                        src={catItem.Image_URL || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'} 
                        alt={catItem.Product_Name}
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)', flexShrink: 0 }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', color: '#94A3B8' }}>
                          <span style={{ fontWeight: '700', color: 'var(--accent-gold-light)' }}>{catItem.SKU}</span>
                          <span style={{ color: stockQty <= 2 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: '700' }}>
                            Stock: {stockQty}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#FFFFFF', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {catItem.Product_Name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: '800', fontFamily: 'JetBrains Mono', marginTop: '1px' }}>
                          ₹{wholesaleCost.toLocaleString()} <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'normal' }}>/ set</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="btn-ghost-edit"
                      onClick={() => handleQuickAddSkuToPO(catItem.SKU, 2)}
                      style={{ 
                        fontSize: '10.5px', 
                        padding: '4px 8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px',
                        background: inPo ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                        color: inPo ? 'var(--accent-gold-light)' : '#E2E8F0',
                        border: inPo ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <Plus size={11} /> {inPo ? "Add +2 Sets" : "+ Add to PO"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Grid: Supplier, Logistics & Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          
          <div className="form-field">
            <label style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}>🏭 Factory Manufacturer / Hub</label>
            <select value={supplier} onChange={e => setSupplier(e.target.value)}>
              <option value="Godrej Khalapur Main Plant (MH)">Godrej Khalapur Main Plant (MH) — GSTIN: 27AAACG0534B1Z9</option>
              <option value="Godrej Chennai Upholstery Plant (TN)">Godrej Chennai Upholstery Plant (TN) — GSTIN: 33AAACG0534B1Z5</option>
              <option value="Godrej Interio Vikhroli Plant, Mumbai (MH)">Godrej Interio Vikhroli Plant, Mumbai (MH) — GSTIN: 27AAACG0534B1Z9</option>
              <option value="Royal Teak Crafts, Saharanpur (UP)">Royal Teak Crafts, Saharanpur (UP) — GSTIN: 09AAAA0000A1Z1</option>
              <option value="CenturyPly ProModular, Cuttack (OD)">CenturyPly ProModular, Cuttack (OD) — GSTIN: 21CCCC2222C3Z3</option>
              <option value="Sheesham Wood Hub, Jodhpur (RJ)">Sheesham Wood Hub, Jodhpur (RJ) — GSTIN: 08BBBB1111B2Z2</option>
            </select>
          </div>

          <div className="form-field">
            <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>🚚 Freight Transporter</label>
            <select value={transporter} onChange={e => setTransporter(e.target.value)}>
              <option value="VRL Logistics Express">VRL Logistics Express (Hub: Rayagada)</option>
              <option value="SafeXpress Supply Chain">SafeXpress Supply Chain (Vizag ➔ Rayagada)</option>
              <option value="GATI-KWE Surface Express">GATI-KWE Surface Express</option>
              <option value="ARC Roadways Heavy Freight">ARC Roadways Heavy Freight</option>
              <option value="Direct Godrej Dedicated Truck">Direct Godrej Dedicated Truck (OD-18-E-4491)</option>
            </select>
          </div>

          <div className="form-field">
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>💳 Commercial Payment Terms</label>
            <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
              <option value="30_ADVANCE_70_LR">30% Advance + 70% against LR Copy</option>
              <option value="100_ADVANCE_RTGS">100% Advance via RTGS / NEFT</option>
              <option value="30_DAYS_MSME_CREDIT">30-Day MSME Credit Cycle</option>
              <option value="AGAINST_DELIVERY">100% Cash/UPI on Dock Unloading</option>
            </select>
          </div>

          <div className="form-field">
            <label style={{ fontSize: '11px', color: '#CBD5E1' }}>⏱️ Transit Lead Time</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="number" 
                min="1" 
                max="60" 
                value={leadDays} 
                onChange={e => setLeadDays(Number(e.target.value))} 
                style={{ width: '80px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Days (Arrival: <b>{getExpectedDateStr(leadDays)}</b>)
              </span>
            </div>
          </div>

        </div>

        {/* Multi-SKU Items Line Table */}
        <div style={{ background: '#030712', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} /> Purchase Order Line Items
            </div>
            <button className="btn-luxury-gold" onClick={handleAddItemLine} style={{ fontSize: '11px', padding: '5px 12px' }}>
              <Plus size={13} /> Add Manual Row
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '10px 8px', width: '50px', textAlign: 'center' }}>Photo</th>
                  <th style={{ padding: '10px 8px' }}>Target Furniture SKU & Product</th>
                  <th style={{ padding: '10px 8px', width: '130px', textAlign: 'center' }}>Qty (Sets)</th>
                  <th style={{ padding: '10px 8px', width: '150px' }}>Factory Rate (₹)</th>
                  <th style={{ padding: '10px 8px', width: '100px' }}>GST Slab</th>
                  <th style={{ padding: '10px 8px', width: '140px', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '10px 8px', width: '40px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {poItems.map((item, idx) => {
                  const lineTotal = (Number(item.qty) || 0) * (Number(item.unit_cost) || 0);
                  const catMatch = catalog.find(c => c.SKU === item.sku);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <img 
                          src={catMatch?.Image_URL || item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'} 
                          alt={item.product_name}
                          style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)', display: 'block', margin: '0 auto' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'; }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select 
                          value={item.sku} 
                          onChange={e => handleItemFieldChange(idx, 'sku', e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {catalog.map(c => (
                            <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          <button 
                            className="btn-ghost-edit" 
                            onClick={() => handleItemFieldChange(idx, 'qty', Math.max(1, (Number(item.qty) || 1) - 1))}
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            min="1" 
                            value={item.qty} 
                            onChange={e => handleItemFieldChange(idx, 'qty', Math.max(1, Number(e.target.value)))}
                            style={{ width: '45px', fontSize: '12px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
                          />
                          <button 
                            className="btn-ghost-edit" 
                            onClick={() => handleItemFieldChange(idx, 'qty', (Number(item.qty) || 1) + 1)}
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input 
                          type="number" 
                          value={item.unit_cost} 
                          onChange={e => handleItemFieldChange(idx, 'unit_cost', Number(e.target.value))}
                          style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select 
                          value={item.gst_pct || 18} 
                          onChange={e => handleItemFieldChange(idx, 'gst_pct', Number(e.target.value))}
                          style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="18">18% GST</option>
                          <option value="28">28% GST</option>
                          <option value="12">12% GST</option>
                          <option value="0">0% GST</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>
                        ₹{lineTotal.toLocaleString()}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleRemoveItemLine(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                          title="Remove Line"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 💰 COMMERCIAL FACTORY FINANCIALS & B2B NEGOTIATION CONTROLS */}
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            padding: '14px'
          }}>
            
            {/* Left: Trade Discount & Freight Adjustments */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-gold-light)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={13} /> Factory Trade Discount & Freight Surcharge
              </div>

              {/* Discount Mode Switcher */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <button 
                  className={`btn-ghost-edit ${discountMode === 'PERCENT' ? 'badge-gold' : ''}`}
                  onClick={() => setDiscountMode('PERCENT')}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <Percent size={11} /> % Trade Discount
                </button>
                <button 
                  className={`btn-ghost-edit ${discountMode === 'FLAT' ? 'badge-gold' : ''}`}
                  onClick={() => setDiscountMode('FLAT')}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <Hash size={11} /> ₹ Flat Bulk Rebate
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <input 
                  type="number" 
                  value={discountValue} 
                  onChange={e => setDiscountValue(Number(e.target.value))}
                  style={{ width: '100px', fontSize: '12px', padding: '6px', borderRadius: '6px', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
                />
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {discountMode === 'PERCENT' ? `${discountValue}% Off = -₹${discountAmount.toLocaleString()}` : `Flat Rebate = -₹${discountAmount.toLocaleString()}`}
                </span>
              </div>

              {/* Freight Charges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>🚚 Freight / Logistics (₹):</label>
                <input 
                  type="number" 
                  value={freightCharges} 
                  onChange={e => setFreightCharges(Number(e.target.value))}
                  style={{ width: '110px', fontSize: '12px', padding: '6px', borderRadius: '6px', background: '#0B132B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Right: Financial Settlement Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span>Gross Factory List:</span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>₹{grossListValue.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-rose)' }}>
                <span>Trade Discount Savings:</span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>-₹{discountAmount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
                <span>Freight & Handling:</span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>+₹{Number(freightCharges || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span>Net Taxable Base:</span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>₹{netTaxableValue.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span>Factory GST (18% Blended):</span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>₹{gstTotalValue.toLocaleString()}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>Grand PO Total:</span>
                <strong style={{ fontSize: '18px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono', fontWeight: '900' }}>
                  ₹{grandTotalValue.toLocaleString()}
                </strong>
              </div>

              {/* Advance vs Balance split */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                <span>Advance Token ({advancePct}%): <b style={{ color: 'var(--accent-emerald)' }}>₹{advancePaidCalculated.toLocaleString()}</b></span>
                <span>Balance on LR: <b style={{ color: '#CBD5E1' }}>₹{balanceDueCalculated.toLocaleString()}</b></span>
              </div>
            </div>

          </div>

        </div>

        {/* Checkbox & Bottom Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="monsoonWrapNew" 
              checked={monsoonWrap} 
              onChange={e => setMonsoonWrap(e.target.checked)} 
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="monsoonWrapNew" style={{ fontSize: '11.5px', color: '#E2E8F0', cursor: 'pointer', margin: 0 }}>
              🌧️ <b>Monsoon Moisture Barrier & 5-Box Shrink-Wrap Packaging Verified</b> (Mandatory)
            </label>
          </div>

          <button 
            className="btn-luxury-gold" 
            onClick={handleGenerateFactoryPO}
            style={{ padding: '12px 28px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
          >
            <FileText size={16} /> 🚀 Generate Official Factory PO & Sync to Google Sheets
          </button>

        </div>

      </div>

      {/* 🚚 4. LIVE PURCHASE ORDERS PIPELINE & INWARD DOCK TABLE */}
      <div id="po-pipeline-section" className="glass-panel" style={{ padding: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--accent-cyan)" /> Live Factory Orders & Transit Tracking Pipeline
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Real-time shipment statuses, Lorry Receipts (LR Bilty), and 1-click inward dock inspection
            </p>
          </div>

          {/* Search & Status Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search PO#, Supplier, or LR#..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '8px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', width: '200px' }}
            />

            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PO_ACTIVE', label: '🟡 Active' },
              { id: 'TRUCK_IN_TRANSIT', label: '🔵 In-Transit 🚛' },
              { id: 'INWARD_RECEIVED', label: '🟢 Received' }
            ].map(f => (
              <button 
                key={f.id}
                className={`btn-ghost-edit ${statusFilter === f.id ? 'badge-gold' : ''}`}
                onClick={() => setStatusFilter(f.id)}
                style={{ fontSize: '11px', padding: '5px 10px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '10px' }}>PO Number</th>
                <th style={{ padding: '10px' }}>Manufacturer Plant</th>
                <th style={{ padding: '10px' }}>SKUs & Sets</th>
                <th style={{ padding: '10px' }}>PO Value (₹)</th>
                <th style={{ padding: '10px' }}>Transporter & LR Bilty</th>
                <th style={{ padding: '10px' }}>Expected Delivery</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoHistory.map((po, idx) => (
                <tr key={po.po_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                  
                  <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                    {po.po_id}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: '700', color: '#FFFFFF' }}>{po.supplier.split(',')[0]}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{po.payment_terms === '30_ADVANCE_70_LR' ? '30/70 LR Terms' : 'RTGS Advance'}</div>
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '10.5px' }}>
                      {po.sku.length > 25 ? po.sku.substring(0, 25) + '...' : po.sku}
                    </span>
                    <div style={{ fontSize: '10.5px', color: '#CBD5E1', marginTop: '2px' }}>
                      {po.qty} Total Sets
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>
                    ₹{Number(po.total_value).toLocaleString()}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{po.transporter}</div>
                    <div style={{ fontSize: '10.5px', color: '#CBD5E1', fontFamily: 'JetBrains Mono' }}>{po.lr_number || 'Pending LR'}</div>
                  </td>

                  <td style={{ padding: '12px 10px', color: '#E2E8F0' }}>
                    {po.expected_delivery}
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    {po.status === "PO_ACTIVE" && <span className="badge badge-gold">🟡 PO ACTIVE</span>}
                    {po.status === "MANUFACTURING" && <span className="badge badge-amber">🟠 IN FACTORY</span>}
                    {po.status === "TRUCK_IN_TRANSIT" && <span className="badge badge-cyan">🔵 IN TRANSIT 🚛</span>}
                    {po.status === "AT_DOCK" && <span className="badge badge-purple">🟣 AT DOCK 1</span>}
                    {po.status === "INWARD_RECEIVED" && <span className="badge badge-emerald">🟢 INWARD QC PASSED ✓</span>}
                    {po.status === "CANCELLED" && <span className="badge badge-rose">🔴 CANCELLED</span>}
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                      
                      {/* 🖨️ Print Official Factory PO (A4) */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => setSelectedPrintPo(po)} 
                        title="Print Official Godrej Factory Purchase Order (A4 Hardcopy / PDF)"
                        style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)' }}
                      >
                        <FileText size={13} />
                      </button>

                      {/* ✏️ Edit PO */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => handleOpenEditPo(po)} 
                        title="Edit PO Quantities, Supplier or LR Details"
                        style={{ padding: '5px 8px', fontSize: '11px' }}
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* 💸 Record Advance Payment Voucher */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => openModal('factory_payment_voucher', { po })} 
                        title="Record RTGS / UPI Advance Payment Voucher to Payments_Log"
                        style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--accent-emerald)', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}
                      >
                        <DollarSign size={13} />
                      </button>

                      {/* 📦 Handoff to Dock 1 Scanner */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => {
                          setActiveTab('inward_scanner');
                          showToast(`🚚 Pre-loaded PO #${po.po_id} (${po.qty} sets) into Dock 1 Inward Scanner!`, true);
                        }} 
                        title="Pre-load Manifest into Dock 1 Inward Scanner (Tab 14)"
                        style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--accent-cyan)', border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.06)' }}
                      >
                        <Truck size={13} />
                      </button>

                      {/* 📲 WhatsApp PO */}
                      <button 
                        className="btn-emerald" 
                        onClick={() => handleSendWhatsAppPO(po)} 
                        title="Send Official PO PDF/Text to Factory via WhatsApp"
                        style={{ padding: '5px 8px', fontSize: '11px' }}
                      >
                        <Send size={13} />
                      </button>

                      {/* 📦 Receive Inward Dock */}
                      {po.status !== "INWARD_RECEIVED" && po.status !== "CANCELLED" && (
                        <button 
                          className="btn-purple" 
                          onClick={() => handleReceiveShipment(po)} 
                          title="1-Click Receive Inward Shipment into Warehouse Stock"
                          style={{ padding: '5px 10px', fontSize: '11px' }}
                        >
                          <Check size={13} /> Receive
                        </button>
                      )}

                      {/* 🗑️ Cancel PO */}
                      {po.status === "PO_ACTIVE" && (
                        <button 
                          className="btn-ghost-edit" 
                          onClick={() => handleCancelPO(po.po_id)} 
                          title="Cancel PO"
                          style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--accent-rose)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 💰 SUPPLY CHAIN PIPELINE FINANCIAL RECONCILIATION MODAL */}
      {showPipelineModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 10, 24, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowPipelineModal(false)}
        >
          <div 
            style={{
              background: '#0F172A',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '20px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '26px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(16,185,129,0.2)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '10px' }}>FINANCIAL AUDIT</span>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>{pipelineTotals.count} ACTIVE POS</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: '8px 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 Supply Chain Pipeline Financial Reconciliation
                </h2>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  Real-time ledger audit of Factory PO commitments, Advance Tokens Disbursed, and Balance Due against LR Bilty
                </p>
              </div>
              <button 
                onClick={() => setShowPipelineModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#94A3B8', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Top 4 Financial Metric Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>Gross Orders List</div>
                <div style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                  ₹{(Number(pipelineTotals?.gross) || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: '600' }}>Trade Discounts Saved</div>
                <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--accent-rose)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                  -₹{(Number(pipelineTotals?.discounts) || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: '600' }}>Freight & Logistics</div>
                <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--accent-cyan)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                  +₹{(Number(pipelineTotals?.freight) || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: '600' }}>Input GST (ITC 18%)</div>
                <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--accent-purple)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                  ₹{(Number(pipelineTotals?.gst) || 0).toLocaleString()}
                </div>
              </div>

            </div>

            {/* High-Impact Settlement Highlight Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(15,23,42,0.8) 100%)', border: '1.5px solid rgba(16,185,129,0.35)', borderRadius: '14px', padding: '16px 20px', marginBottom: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '600' }}>TOTAL NET PIPELINE PAYABLE:</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                    ₹{(Number(pipelineTotals?.total) || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '600' }}>ADVANCE TOKENS DISBURSED:</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                    ₹{(Number(pipelineTotals?.advance) || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '600' }}>BALANCE DUE ON LR BILTY:</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                    ₹{(Number(pipelineTotals?.balance) || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Order Audit Table */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#E2E8F0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📋 Breakdown by Active Factory Purchase Orders ({pipelineTotals.count})
              </h4>
              <div style={{ maxHeight: '220px', overflowY: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '8px 10px' }}>PO Number</th>
                      <th style={{ padding: '8px 10px' }}>Manufacturer Plant</th>
                      <th style={{ padding: '8px 10px' }}>Sets</th>
                      <th style={{ padding: '8px 10px' }}>Net PO Value</th>
                      <th style={{ padding: '8px 10px' }}>Advance Paid</th>
                      <th style={{ padding: '8px 10px' }}>Balance Due</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poHistory.filter(p => p.status !== 'CANCELLED').map((p, idx) => (
                      <tr key={p.po_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--accent-gold-light)' }}>{p.po_id}</td>
                        <td style={{ padding: '8px 10px', color: '#E2E8F0' }}>{p.supplier}</td>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}>{p.qty}</td>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'JetBrains Mono' }}>₹{Number(p.total_value).toLocaleString()}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>₹{Number(p.advance_paid || 0).toLocaleString()}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>₹{Number(p.balance_due || (p.total_value - (p.advance_paid || 0))).toLocaleString()}</td>
                        <td style={{ padding: '8px 10px' }}>
                          {p.status === "PO_ACTIVE" && <span className="badge badge-gold" style={{ fontSize: '9px' }}>🟡 ACTIVE</span>}
                          {p.status === "TRUCK_IN_TRANSIT" && <span className="badge badge-cyan" style={{ fontSize: '9px' }}>🔵 IN-TRANSIT</span>}
                          {p.status === "INWARD_RECEIVED" && <span className="badge badge-emerald" style={{ fontSize: '9px' }}>🟢 RECEIVED</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Total Factory Goods Pipeline: <strong style={{ color: '#FFFFFF' }}>{pipelineTotals.totalSets} Furniture Sets</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-ghost-edit"
                  onClick={() => {
                    showToast("🖨️ Printing Supply Chain Pipeline Reconciliation Statement...", true);
                    window.print();
                  }}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  <FileText size={14} /> Print Audit Statement
                </button>
                <button 
                  className="btn-luxury-gold"
                  onClick={() => setShowPipelineModal(false)}
                  style={{ fontSize: '12px', padding: '8px 20px' }}
                >
                  <Check size={14} /> Close & Return to Cockpit
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🖨️ OFFICIAL FACTORY PURCHASE ORDER A4 PRINT MODAL */}
      {selectedPrintPo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 10, 24, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedPrintPo(null)}
        >
          <div 
            style={{
              background: '#040817',
              border: '2px solid var(--accent-gold)',
              borderRadius: '20px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 35px rgba(212,175,55,0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Control Bar (Hidden during print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold">🏛️ OFFICIAL FACTORY PURCHASE ORDER</span>
                <span className="badge badge-emerald">A4 READY</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  className="btn-luxury-gold" 
                  onClick={() => {
                    playSuccessChime();
                    window.print();
                  }}
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  <FileText size={14} /> 🖨️ Print Hardcopy / Save PDF
                </button>
                <button 
                  className="btn-emerald" 
                  onClick={() => handleSendWhatsAppPO(selectedPrintPo)}
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  <Send size={14} /> 📲 Send to Factory WhatsApp
                </button>
                <button 
                  onClick={() => setSelectedPrintPo(null)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#94A3B8', padding: '6px', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Purchase Order Sheet Area */}
            <div className="printable-area" style={{ background: '#030712', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
              
              {/* Top Header Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(212,175,55,0.4)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🏭</span>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold-light)', margin: 0, letterSpacing: '0.5px' }}>
                        GODREJ INTERIO RAYAGADA FLAGSHIP
                      </h2>
                      <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
                        Shree Ganesh Enterprises • Main Road, Near New Bus Stand, Rayagada, Odisha 765001
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                        GSTIN: <b>21AAAAA0000A1Z5</b> • Authorized Commercial Hub • Contact: +91 93905 53301
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-gold" style={{ fontSize: '11px', padding: '4px 10px' }}>PURCHASE ORDER</span>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#FFFFFF', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
                    {selectedPrintPo.po_id}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Date: <b>{selectedPrintPo.created_at || new Date().toLocaleDateString('en-IN')}</b>
                  </div>
                </div>
              </div>

              {/* Vendor & Logistics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '800' }}>MANUFACTURER / SUPPLIER PLANT</div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-gold-light)', marginTop: '2px' }}>{selectedPrintPo.supplier}</div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>GSTIN: {selectedPrintPo.supplier_gstin || '27AAACG0534B1Z9'}</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>Payment Terms: <b>{selectedPrintPo.payment_terms === '30_ADVANCE_70_LR' ? '30% Advance + 70% against LR Bilty' : selectedPrintPo.payment_terms}</b></div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '800' }}>LOGISTICS & DISPATCH DESTINATION</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '2px' }}>🚚 {selectedPrintPo.transporter}</div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>LR Bilty Ref: <b style={{ fontFamily: 'JetBrains Mono' }}>{selectedPrintPo.lr_number || 'Pending'}</b></div>
                  <div style={{ fontSize: '10.5px', color: 'var(--accent-emerald)', marginTop: '2px' }}>Expected Delivery: <b>{selectedPrintPo.expected_delivery}</b></div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Unloading Site: Central Warehouse Dock 1, Rayagada</div>
                </div>
              </div>

              {/* Itemized PO Table with Product Thumbnails */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📦 ORDERED LINE ITEMS ({selectedPrintPo.items?.length || 1} SKUs • {selectedPrintPo.qty} Sets):
                </div>
                <table className="luxury-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>#</th>
                      <th style={{ width: '56px', textAlign: 'center' }}>Photo</th>
                      <th>Furniture Model & Description</th>
                      <th>SKU Code</th>
                      <th style={{ textAlign: 'center' }}>Qty (Sets)</th>
                      <th style={{ textAlign: 'right' }}>Wholesale Rate (₹)</th>
                      <th style={{ textAlign: 'center' }}>GST</th>
                      <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPrintPo.items || [{ sku: selectedPrintPo.sku, product_name: 'Furniture Item', qty: selectedPrintPo.qty, unit_cost: selectedPrintPo.total_value / (selectedPrintPo.qty || 1), gst_pct: 18 }]).map((it, idx) => {
                      const catMatch = catalog.find(c => c.SKU === it.sku);
                      const imgUrl = catMatch?.Image_URL || it.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300';
                      const lineTot = (Number(it.qty) || 1) * (Number(it.unit_cost) || 0);
                      return (
                        <tr key={idx}>
                          <td style={{ color: '#94A3B8', fontSize: '11px' }}>{idx + 1}</td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>
                            <img 
                              src={imgUrl} 
                              alt={it.product_name}
                              style={{ 
                                width: '44px', 
                                height: '44px', 
                                objectFit: 'cover', 
                                borderRadius: '6px', 
                                border: '1px solid rgba(212,175,55,0.4)',
                                display: 'block',
                                margin: '0 auto'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300';
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{it.product_name || it.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{catMatch?.Material || 'Godrej Factory Grade Material'}</div>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', color: '#94A3B8', fontSize: '11px' }}>{it.sku}</td>
                          <td style={{ textAlign: 'center', fontWeight: '800', color: '#FFFFFF' }}>{it.qty}</td>
                          <td style={{ textAlign: 'right', color: '#CBD5E1', fontFamily: 'JetBrains Mono', fontSize: '11.5px' }}>
                            ₹{Number(it.unit_cost).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '10.5px', color: '#94A3B8' }}>{it.gst_pct || 18}%</td>
                          <td style={{ textAlign: 'right', fontWeight: '900', color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>
                            ₹{lineTot.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Commercial Settlement & Taxes Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', background: '#070D18', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    SPECIAL PACKAGING & DISPATCH INSTRUCTIONS:
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#CBD5E1', lineHeight: '1.5' }}>
                    <div>• 🌧️ <b>Monsoon Shrink-Wrap:</b> {selectedPrintPo.monsoon_wrap ? 'MANDATORY (Double-sealed 5-Box Kits)' : 'Standard'}</div>
                    <div>• 📦 <b>Handling:</b> {selectedPrintPo.notes || 'Handle with Care — Knockdown Heavy Teak Units'}</div>
                    <div>• 🏷️ <b>Barcode Labels:</b> Pre-stick QR Barcode on all individual master cartons before truck loading.</div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginBottom: '3px' }}>
                    <span>Gross Factory List:</span>
                    <span>₹{Number(selectedPrintPo.gross_subtotal || selectedPrintPo.subtotal || selectedPrintPo.total_value).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-rose)', marginBottom: '3px' }}>
                    <span>Trade Discount Applied:</span>
                    <span>- ₹{Number(selectedPrintPo.trade_discount || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-cyan)', marginBottom: '3px' }}>
                    <span>Freight / Transport:</span>
                    <span>+ ₹{Number(selectedPrintPo.freight_charges || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '3px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '3px' }}>
                    <span>Estimated GST (18% ITC):</span>
                    <span>₹{Number(selectedPrintPo.gst_amount || Math.round(selectedPrintPo.total_value * 0.1525)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', color: '#FFFFFF', borderTop: '1.5px solid rgba(255,255,255,0.15)', paddingTop: '6px', marginTop: '4px' }}>
                    <span>Total Landed Value:</span>
                    <span style={{ color: 'var(--accent-green)' }}>₹{Number(selectedPrintPo.total_value).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    <span>Advance Token Paid:</span>
                    <span>₹{Number(selectedPrintPo.advance_paid || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                    <span>Balance Due on LR Bilty:</span>
                    <span>₹{Number(selectedPrintPo.balance_due || (selectedPrintPo.total_value - (selectedPrintPo.advance_paid || 0))).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Official Signatures & Receiving Stamps */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ borderBottom: '1.5px solid #CBD5E1', width: '180px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '10.5px', fontWeight: '900', color: '#FFFFFF' }}>AUTHORIZED STORE DIRECTOR</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Godrej Interio Rayagada Hub</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ borderBottom: '1.5px solid #CBD5E1', width: '180px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '10.5px', fontWeight: '900', color: '#FFFFFF' }}>CENTRAL DOCK 1 RECEIVER</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Rayagada Inward Warehouse</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

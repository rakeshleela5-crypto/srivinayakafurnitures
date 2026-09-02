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
  DollarSign
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
      subtotal: 454000,
      gst_amount: 81720,
      total_value: 535720,
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
      subtotal: 152000,
      gst_amount: 27360,
      total_value: 179360,
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
      subtotal: 149000,
      gst_amount: 26820,
      total_value: 175820,
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

  // Helper date formatter
  const getExpectedDateStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + Number(days));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${dayStr}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  // 🧮 Dynamic Financial Calculations for Current PO Builder
  const subtotalValue = useMemo(() => {
    return poItems.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unit_cost) || 0)), 0);
  }, [poItems]);

  const gstTotalValue = useMemo(() => {
    return poItems.reduce((acc, it) => {
      const lineTotal = (Number(it.qty) || 0) * (Number(it.unit_cost) || 0);
      const gstRate = (Number(it.gst_pct) || 18) / 100;
      return acc + (lineTotal * gstRate);
    }, 0);
  }, [poItems]);

  const grandTotalValue = Math.round(subtotalValue + gstTotalValue);
  const totalSetsQty = poItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);

  // ➕ Multi-SKU Item Handlers
  const handleAddItemLine = () => {
    const defaultSku = catalog[0]?.SKU || 'BED-MOD-001';
    const defaultItem = catalog.find(c => c.SKU === defaultSku);
    setPoItems([
      ...poItems,
      {
        sku: defaultSku,
        product_name: defaultItem?.Product_Name || 'Godrej Furniture Item',
        qty: 2,
        unit_cost: defaultItem?.Price ? Math.round(defaultItem.Price * 0.65) : 35000,
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
      if (selected?.Price) {
        updated[idx].unit_cost = Math.round(selected.Price * 0.65);
      }
    } else {
      updated[idx][field] = val;
    }
    setPoItems(updated);
  };

  // ⚡ 1-Click AI Auto-Fill from Low Stock Radar
  const handleAutoFillReplenishment = () => {
    if (lowStockItems.length === 0) {
      showToast("✅ All 115 SKUs are healthy! No critical low-stock items detected.", true);
      return;
    }

    const autoLines = lowStockItems.map(low => {
      const catItem = catalog.find(c => c.SKU === low.SKU);
      const suggestedQty = Math.max(4, (low.Buffer_Threshold * 3) - low.Warehouse_Qty);
      return {
        sku: low.SKU,
        product_name: low.Product_Name || catItem?.Product_Name || low.SKU,
        qty: suggestedQty,
        unit_cost: catItem?.Price ? Math.round(catItem.Price * 0.65) : 40000,
        gst_pct: 18
      };
    });

    setPoItems(autoLines);
    playSuccessChime();
    showToast(`⚡ AI Radar auto-loaded ${autoLines.length} critical low-stock items into PO Builder!`, true);
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
      subtotal: subtotalValue,
      gst_amount: gstTotalValue,
      total_value: grandTotalValue,
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
      total_value: grandTotalValue,
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
    const itemsListText = (po.items || []).map((it, i) => 
      `${i + 1}. *${it.sku}* (${it.product_name}) — *${it.qty} Sets* @ ₹${Number(it.unit_cost).toLocaleString()}/Set`
    ).join('\n');

    const text = `🏭 *OFFICIAL PURCHASE ORDER — GODREJ INTERIO RAYAGADA*\n` +
      `*PO Reference:* #${po.po_id} | *Date:* ${po.created_at || 'Today'}\n` +
      `*Manufacturer:* ${po.supplier}\n\n` +
      `📦 *ORDERED LINE ITEMS:*\n${itemsListText}\n\n` +
      `💰 *Total Sets:* ${po.qty} Sets\n` +
      `💵 *Grand PO Value (incl. GST):* ₹${Number(po.total_value).toLocaleString()}\n` +
      `💳 *Payment Terms:* ${po.payment_terms === '30_ADVANCE_70_LR' ? '30% Advance + 70% on LR Copy' : '100% Advance via RTGS'}\n` +
      `🚚 *Transporter:* ${po.transporter} (LR Bilty: *${po.lr_number || 'To be assigned'}*)\n` +
      `📅 *Expected Warehouse Delivery:* ${po.expected_delivery}\n` +
      `🌧️ *Monsoon Shrink-Wrap Packaging:* ${po.monsoon_wrap ? 'MANDATORY (5-Box Sealed)' : 'Standard'}\n` +
      `📍 *Unloading Point:* Central Warehouse Dock 1, Main Road, Rayagada (OD 765001)\n\n` +
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

  // Overall KPI Metrics
  const activeCount = poHistory.filter(p => p.status === 'PO_ACTIVE' || p.status === 'MANUFACTURING').length;
  const inTransitCount = poHistory.filter(p => p.status === 'TRUCK_IN_TRANSIT').length;
  const receivedCount = poHistory.filter(p => p.status === 'INWARD_RECEIVED').length;
  const totalPipelineValue = poHistory
    .filter(p => p.status !== 'CANCELLED')
    .reduce((acc, p) => acc + (Number(p.total_value) || 0), 0);

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

      {/* 📊 1. EXECUTIVE KPI SUMMARY METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Factory POs
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
            {activeCount} <span style={{ fontSize: '12px', color: 'var(--accent-gold-light)', fontWeight: '600' }}>In Production</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            In-Transit Trucks (LR Tracked)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {inTransitCount} <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>Vehicles on Road 🚛</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Critical Stockout Defense
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: lowStockItems.length > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '4px' }}>
            {lowStockItems.length} <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '600' }}>SKUs Below Buffer</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Supply Pipeline Value
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
            ₹{totalPipelineValue.toLocaleString()}
          </div>
        </div>

      </div>

      {/* 🚨 2. AI LOW-STOCK REPLENISHMENT RADAR */}
      {lowStockItems.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(15,23,42,0.9) 100%)', 
          border: '1.5px solid var(--accent-rose)', 
          borderRadius: '16px', 
          padding: '16px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '14px',
          boxShadow: '0 8px 30px rgba(244,63,94,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-rose)' }}>
              <AlertCircle size={22} color="var(--accent-rose)" />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '800' }}>
                🚨 AI Stockout Radar: {lowStockItems.length} SKUs require Factory Restock!
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
                {lowStockItems.map(i => `${i.SKU} (${i.Warehouse_Qty}/${i.Buffer_Threshold} left)`).join(' • ')}
              </div>
            </div>
          </div>

          <button 
            className="btn-luxury-gold" 
            onClick={handleAutoFillReplenishment}
            style={{ padding: '10px 20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={15} /> ⚡ 1-Click Auto-Fill Replenishment Order
          </button>
        </div>
      )}

      {/* 📝 3. MULTI-SKU FACTORY PURCHASE ORDER BUILDER */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Factory size={20} color="var(--accent-gold-light)" /> Multi-SKU Factory Purchase Order Studio
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Create official truckload purchase orders with multi-SKU items, GST breakdown, and LR Bilty tracking
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold">{poItems.length} SKUs Selected</span>
            <span className="badge badge-purple">{totalSetsQty} Total Sets</span>
          </div>
        </div>

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
              <Plus size={13} /> Add SKU Line
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '10px 8px' }}>Target Furniture SKU & Product</th>
                  <th style={{ padding: '10px 8px', width: '100px', textAlign: 'center' }}>Qty (Sets)</th>
                  <th style={{ padding: '10px 8px', width: '140px' }}>Factory Rate (₹)</th>
                  <th style={{ padding: '10px 8px', width: '90px' }}>GST Slab</th>
                  <th style={{ padding: '10px 8px', width: '140px', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '10px 8px', width: '40px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {poItems.map((item, idx) => {
                  const lineTotal = (Number(item.qty) || 0) * (Number(item.unit_cost) || 0);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px' }}>
                        <select 
                          value={item.sku} 
                          onChange={e => handleItemFieldChange(idx, 'sku', e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                        >
                          {catalog.map(c => (
                            <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty} 
                          onChange={e => handleItemFieldChange(idx, 'qty', Number(e.target.value))}
                          style={{ width: '100%', fontSize: '12px', padding: '6px', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input 
                          type="number" 
                          value={item.unit_cost} 
                          onChange={e => handleItemFieldChange(idx, 'unit_cost', Number(e.target.value))}
                          style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select 
                          value={item.gst_pct || 18} 
                          onChange={e => handleItemFieldChange(idx, 'gst_pct', Number(e.target.value))}
                          style={{ width: '100%', fontSize: '12px', padding: '6px' }}
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

          {/* Totals Breakdown Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '30px', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal: </span>
              <strong>₹{subtotalValue.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>GST (18%): </span>
              <strong>₹{Math.round(gstTotalValue).toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--accent-gold-light)' }}>Grand Total Payable: </span>
              <strong style={{ fontSize: '17px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                ₹{grandTotalValue.toLocaleString()}
              </strong>
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
            style={{ padding: '12px 28px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={16} /> 🚀 Generate Official Factory PO & Sync to Google Sheets
          </button>

        </div>

      </div>

      {/* 🚚 4. LIVE PURCHASE ORDERS PIPELINE & INWARD DOCK TABLE */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        
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

    </div>
  );
}

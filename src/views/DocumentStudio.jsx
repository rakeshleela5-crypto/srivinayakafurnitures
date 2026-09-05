import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import CustomerOrderSearchSelector from '../components/common/CustomerOrderSearchSelector';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Truck, 
  Award, 
  Lock,
  Sparkles,
  QrCode,
  RefreshCw,
  Mic,
  Landmark,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Share2,
  Send,
  SlidersHorizontal,
  DollarSign,
  Tag,
  Building2,
  Phone,
  UserCheck,
  Check,
  Eye,
  Copy,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { FURNITURE_CATALOG } from '../data/initialData';
import { formatDateTimeIndian, formatDateIndian, dispatchWebhookAction } from '../services/webhookService';
import { DynamicQrCode } from '../utils/qrcodeGenerator';
import { playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function DocumentStudio() {
  const { 
    storeMeta, 
    orders, 
    catalog,
    openModal,
    showToast,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing,
    documentsLog,
    setDocumentsLog
  } = useStore();

  const fullCatalog = (catalog && catalog.length > 0) ? catalog : FURNITURE_CATALOG;

  // Active Document Type
  const [selectedDocType, setSelectedDocType] = useState('tax_invoice');
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || {});
  
  // Editor Active Tab inside the Live Editor sidebar: 'meta' | 'items' | 'logistics' | 'signatory'
  const [editorTab, setEditorTab] = useState('items');

  // Quick Catalog Search for Adding Line Items
  const [catalogSearch, setCatalogSearch] = useState('');

  // 📝 LIVE EDITABLE DOCUMENT STATE
  const [docData, setDocData] = useState({
    // Document Meta
    docNumber: 'INV-2026-8921',
    docDate: formatDateIndian(),
    docTime: '11:30 AM',
    orderIdRef: 'ORD-8921',
    orderDate: '28-Aug-2026',
    paymentStatus: '50% Advance Settled (UPI) ✓',
    paymentMode: 'Dynamic UPI QR',
    merchantVpa: storeMeta.upiVpa || '9390553301@ybl',
    taxType: 'INTRA_STATE', // INTRA_STATE (CGST+SGST 9%+9%) vs INTER_STATE (IGST 18%)
    
    // Customer Details
    customerName: 'Dr. Subhashish Jena',
    customerPhone: '+91 94371 88990',
    customerEmail: 'subhashish.jena@health.od.gov.in',
    projectAddress: 'Raniguda Farmhouse Villa, Rayagada, Odisha 765001',
    customerGstin: '21AAACJ1234F1Z5',
    customerType: 'VIP Residential Bungalow',

    // Itemized Goods & Services List
    items: [
      {
        id: 1,
        sku: 'BED-TEAK-001',
        name: 'Royal Teak Master Suite King Bed (Hydraulic Storage)',
        specs: '100% Solid CP Teak Wood • 10-Year Manufacturer Warranty • Seasoned Kiln Dried',
        hsn: '9403',
        qty: 1,
        unit: 'Set',
        mrp: 148000,
        rate: 132622,
        discount: 0,
        taxableValue: 132622,
        gstRate: 18
      }
    ],

    // Terms & Notes
    terms: 'Goods once sold are covered under official Godrej Interio 10-Year warranty. Free doorstep delivery & master carpenter assembly included.',
    notes: 'Fragile solid teak finish. Handle with extreme care. 5 cartons staged.',

    // Logistics & Dispatch Info
    vehicleNo: 'Tata Ace (OD-18-A-1234)',
    driverName: 'Tophan Gouda',
    driverPhone: '+91 94371 88990',
    gatepassNo: 'GP-2026-8921',
    cartonUnits: '5 Cartons (Box A to E)',
    qcStatus: 'PASSED ✓ (2400Hz Laser QC)',
    dispatchDate: formatDateIndian(),

    // Warranty Specs
    warrantyYears: 10,
    warrantySerial: 'GDJ-WAR-8921-2026',
    warrantyCoverage: {
      antiTermite: true,
      antiBorer: true,
      hydraulics: true,
      freeAnnualQc: true
    },
    warrantyScope: 'Full structural replacement against borer, termite infestation, and hydraulic lift mechanisms.',

    // Carpenter Voucher Details
    carpenterName: 'Narayana Mistri',
    carpenterPhone: '+91 94370 54321',
    carpenterWage: 500,
    carpenterTasks: 'Full knockdown bed frame assembly, headboard anchoring, and hydraulic gas lift calibration.',
    carpenterStatus: 'AUTHORIZED_PAYABLE',

    // B2B Turnkey Specs
    b2bProjectTitle: 'Rayagada District Collectorate — Executive Chamber & Conference Suite',
    b2bScopeOfWork: 'Turnkey interior furnish including 14x Executive Ergonomic Mesh Chairs, 1x 12-Seater Teak Boardroom Table, and 2x Acoustic Credenzas.',
    b2bMilestones: '50% Mobilization Advance • 40% Material Staging • 10% Final Inspection & Handover',
    b2bTotalBudget: 425000,

    // Signatory
    showDigitalStamp: true,
    signatoryName: 'Rakesh (Store Director)',
    signatoryRole: 'Authorized Signatory — Shree Ganesh Enterprises',
    authDate: formatDateIndian()
  });

  // When selected order changes, auto-load into docData
  useEffect(() => {
    if (selectedOrder && selectedOrder.Order_ID) {
      loadOrderIntoDocData(selectedOrder);
    }
  }, [selectedOrder]);

  const loadOrderIntoDocData = (order) => {
    const rawItems = order.Items_Detail || order.Ordered_SKU || order.Item_Names || 'Royal Teak Master Suite';
    const orderTotal = Number(order.Total_Amount_INR || order.Final_Amount_INR || 156494);
    const taxableApprox = Math.round(orderTotal / 1.18);

    const docPrefix = selectedDocType === 'tax_invoice' ? 'INV' :
                      selectedDocType === 'proforma_invoice' ? 'PRO' :
                      selectedDocType === 'delivery_challan' ? 'DC' :
                      selectedDocType === 'warranty_card' ? 'GDJ-WAR' :
                      selectedDocType === 'gate_pass' ? 'GP' :
                      selectedDocType === 'carpenter_voucher' ? 'VOUCH' :
                      selectedDocType === 'b2b_proposal' ? 'B2B' : 'EOD';

    const orderNum = String(order.Order_ID || '8921').replace(/[^0-9]/g, '') || '8921';

    setDocData(prev => ({
      ...prev,
      docNumber: `${docPrefix}-2026-${orderNum}`,
      docDate: formatDateIndian(),
      orderIdRef: order.Order_ID || `ORD-${orderNum}`,
      customerName: order.Customer_Name || 'VIP Customer',
      customerPhone: order.Customer_Phone || '+91 94371 88990',
      projectAddress: order.Project_Address || 'Rayagada, Odisha',
      items: [
        {
          id: 1,
          sku: order.Ordered_SKU || 'SKU-GDJ-001',
          name: typeof rawItems === 'string' ? rawItems : 'Solid Teak Luxury Living & Bedroom Furniture',
          specs: '100% Solid CP Teak Wood • Seasoned Kiln Dried • 10-Year Manufacturer Warranty',
          hsn: '9403',
          qty: 1,
          unit: 'Set',
          mrp: Math.round(orderTotal * 1.15),
          rate: taxableApprox,
          discount: 0,
          taxableValue: taxableApprox,
          gstRate: 18
        }
      ],
      warrantySerial: `GDJ-WAR-${orderNum}-2026`,
      gatepassNo: `GP-2026-${orderNum}`,
      paymentStatus: (order.Status === 'DELIVERED' || order.Payment_Status === 'PAID') ? '100% Paid in Full ✓' : '50% Advance Settled (UPI) ✓'
    }));

    showToast(`📄 Loaded Order #${order.Order_ID || orderNum} into Document Studio!`, true);
  };

  // 🧮 Dynamic Financial Calculations
  const calculatedTaxableSubtotal = docData.items.reduce((acc, item) => acc + (Number(item.taxableValue) || 0), 0);
  const calculatedGstAmount = docData.taxType === 'INTRA_STATE' 
    ? calculatedTaxableSubtotal * 0.18 
    : calculatedTaxableSubtotal * 0.18;
  const calculatedCgst = docData.taxType === 'INTRA_STATE' ? calculatedTaxableSubtotal * 0.09 : 0;
  const calculatedSgst = docData.taxType === 'INTRA_STATE' ? calculatedTaxableSubtotal * 0.09 : 0;
  const calculatedIgst = docData.taxType === 'INTER_STATE' ? calculatedTaxableSubtotal * 0.18 : 0;
  const calculatedGrandTotal = Math.round(calculatedTaxableSubtotal + calculatedGstAmount);
  const calculatedTotalMRP = docData.items.reduce((acc, item) => acc + ((Number(item.mrp) || Number(item.rate)) * (Number(item.qty) || 1)), 0);
  const calculatedTotalSavings = Math.max(0, calculatedTotalMRP - calculatedGrandTotal);

  // Handle adding product from Catalog search
  const handleAddCatalogItem = (product) => {
    const rate = Math.round(product.price / 1.18);
    const newItem = {
      id: Date.now(),
      sku: product.sku,
      name: product.name,
      specs: `${product.material || 'Solid Wood'} • ${product.category} • Warranty: ${product.warranty || '10 Years'}`,
      hsn: '9403',
      qty: 1,
      unit: 'Unit',
      mrp: product.mrp || product.price,
      rate: rate,
      discount: 0,
      taxableValue: rate,
      gstRate: 18
    };

    setDocData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setCatalogSearch('');
    showToast(`➕ Added "${product.name}" to Document items!`, true);
  };

  // Handle adding a custom blank line item
  const handleAddCustomBlankItem = () => {
    const newItem = {
      id: Date.now(),
      sku: 'CUSTOM-ACC-01',
      name: 'Custom Furniture Piece / Accessory',
      specs: 'Custom Specification / Solid Finish',
      hsn: '9403',
      qty: 1,
      unit: 'Nos',
      mrp: 12000,
      rate: 10169,
      discount: 0,
      taxableValue: 10169,
      gstRate: 18
    };

    setDocData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleUpdateItem = (id, field, value) => {
    setDocData(prev => {
      const updated = prev.items.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === 'qty' || field === 'rate' || field === 'discount') {
            const qty = field === 'qty' ? Number(value) : item.qty;
            const rate = field === 'rate' ? Number(value) : item.rate;
            const discount = field === 'discount' ? Number(value) : item.discount;
            newItem.taxableValue = Math.max(0, (qty * rate) - discount);
          }
          return newItem;
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  const handleRemoveItem = (id) => {
    if (docData.items.length <= 1) {
      showToast("⚠️ Document must contain at least 1 item!", false);
      return;
    }
    setDocData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // 1-Click WhatsApp Document Dispatch
  const handleSendWhatsAppDocument = () => {
    playSuccessChime();
    triggerGoldenConfetti();

    const cleanPhone = String(docData.customerPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let docTitle = "TAX INVOICE";
    if (selectedDocType === 'proforma_invoice') docTitle = "COMMERCIAL PROFORMA INVOICE";
    if (selectedDocType === 'warranty_card') docTitle = "10-YEAR DIGITAL WARRANTY CERTIFICATE";
    if (selectedDocType === 'delivery_challan') docTitle = "OFFICIAL DELIVERY CHALLAN";
    if (selectedDocType === 'gate_pass') docTitle = "WAREHOUSE GATE PASS";
    if (selectedDocType === 'carpenter_voucher') docTitle = "CARPENTER WORK ORDER VOUCHER";
    if (selectedDocType === 'b2b_proposal') docTitle = "B2B TURNKEY PROPOSAL";
    if (selectedDocType === 'eod_closing') docTitle = "9 PM EOD CLOSING SLIP";

    const msg = `*🏛️ GODREJ INTERIO RAYAGADA — ${docTitle}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear *${docData.customerName || 'Valued Client'}*,\n` +
      `Please find your official ${docTitle} details below:\n\n` +
      `📄 *Document No:* ${docData.docNumber}\n` +
      `📅 *Date:* ${docData.docDate} ${docData.docTime}\n` +
      `📦 *Items:* ${docData.items.map(i => `${i.name} (Qty: ${i.qty})`).join(', ')}\n` +
      `💰 *Total Amount:* ₹${calculatedGrandTotal.toLocaleString()} (GST Included)\n` +
      `🛡️ *Warranty Serial:* ${docData.warrantySerial}\n` +
      `🚚 *Logistics Ref:* ${docData.vehicleNo} | Driver: ${docData.driverName}\n\n` +
      `👉 *View & Download Official Verified Document:* \nhttps://shreeganesh-godrej.web.app/#documents\n\n` +
      `_Issued with Official Digital Seal by Shree Ganesh Enterprises_ • 📞 +91 93905 53301`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');

    // Save to documentsLog & Google Sheets
    handleSaveToCloudLog();
  };

  // 💾 Save / Log Document to Cloud Sheets
  const handleSaveToCloudLog = async () => {
    const newLogEntry = {
      Doc_ID: docData.docNumber,
      Doc_Type: selectedDocType.toUpperCase(),
      Entity_Ref_ID: docData.orderIdRef,
      Customer_Vendor_Name: docData.customerName,
      Customer_Phone: docData.customerPhone,
      Total_Amount_INR: calculatedGrandTotal,
      GST_Amount_INR: Math.round(calculatedGstAmount),
      Generated_Date_Time: formatDateTimeIndian(),
      Status: "GENERATED_LEGAL_COMPLIANT"
    };

    setDocumentsLog(prev => [newLogEntry, ...prev.filter(d => d.Doc_ID !== docData.docNumber)]);

    try {
      await dispatchWebhookAction('LOG_DOCUMENT_GENERATION', {
        doc_id: docData.docNumber,
        doc_type: selectedDocType.toUpperCase(),
        order_id: docData.orderIdRef,
        customer_name: docData.customerName,
        customer_phone: docData.customerPhone,
        total_amount: calculatedGrandTotal,
        gst_amount: Math.round(calculatedGstAmount),
        taxable_amount: Math.round(calculatedTaxableSubtotal),
        items_summary: docData.items.map(i => `${i.name} (${i.qty})`).join('; '),
        driver_name: docData.driverName,
        vehicle_no: docData.vehicleNo,
        warranty_serial: docData.warrantySerial,
        signatory: docData.signatoryName
      });
      showToast(`☁️ Document ${docData.docNumber} logged to Google Sheets!`, true);
    } catch (e) {
      console.error(e);
      showToast(`💾 Saved locally (${docData.docNumber})`, true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan" style={{ fontSize: '12px', padding: '6px 12px' }}>
            🧾 CENTRAL DOCUMENT & PRINT STUDIO 2.0
          </span>
          
          <button className="btn-luxury-gold" onClick={() => openModal('b2b_turnkey')} style={{ fontSize: '11.5px', padding: '6px 12px' }}>
            🏢 B2B Turnkey Proposal Studio
          </button>
          
          <button className="btn-emerald" onClick={handleSendWhatsAppDocument} style={{ fontSize: '11.5px', padding: '6px 12px' }}>
            <Share2 size={13} /> <span>1-Click WhatsApp Document</span>
          </button>

          <button className="btn-ghost-edit" onClick={() => window.print()} style={{ fontSize: '11.5px', padding: '6px 12px', background: 'rgba(212,175,55,0.15)', borderColor: 'var(--accent-gold)' }}>
            <Printer size={13} color="var(--accent-gold)" /> <span style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>Print A4 Page</span>
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
            <Mic size={12} /> <span>Voice POS (Tab 2)</span>
          </button>

          <button 
            className="btn-purple" 
            onClick={() => {
              setActiveTab('logistics_epod');
              showToast("🚚 Switched to Logistics Fleet & ePOD!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Truck size={12} /> <span>Fleet (Tab 4)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => handleSaveToCloudLog()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <FileSpreadsheet size={12} color="#10B981" /> <span>Sync to Sheets</span>
          </button>
        </div>

      </div>

      {/* 🧭 Document Type Switcher Ribbon */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: '#0B132B', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Document Switcher Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>
            Document Template:
          </span>
          {[
            { id: 'tax_invoice', label: '📄 Official GST Tax Invoice', icon: FileText },
            { id: 'proforma_invoice', label: '💼 Commercial Proforma', icon: Receipt },
            { id: 'delivery_challan', label: '🚚 Delivery Challan (DC-01)', icon: Truck },
            { id: 'warranty_card', label: '🛡️ 10-Year Warranty Card', icon: Award },
            { id: 'gate_pass', label: '🚪 Warehouse Gate Pass', icon: ShieldCheck },
            { id: 'carpenter_voucher', label: '🪚 Carpenter Job Voucher', icon: Award },
            { id: 'b2b_proposal', label: '🏢 B2B Turnkey Proposal', icon: Building2 },
            { id: 'eod_closing', label: '🔒 9 PM Cash Lock Slip', icon: Lock },
            { id: 'client_onboarding_sop', label: '📘 Master Architecture SOP', icon: Sparkles }
          ].map(doc => {
            const Icon = doc.icon;
            const isAct = selectedDocType === doc.id;
            return (
              <button 
                key={doc.id}
                className={`btn-ghost-edit ${isAct ? 'badge-gold' : ''}`}
                onClick={() => {
                  setSelectedDocType(doc.id);
                  const prefix = doc.id === 'tax_invoice' ? 'INV' :
                                 doc.id === 'proforma_invoice' ? 'PRO' :
                                 doc.id === 'delivery_challan' ? 'DC' :
                                 doc.id === 'warranty_card' ? 'GDJ-WAR' :
                                 doc.id === 'gate_pass' ? 'GP' :
                                 doc.id === 'carpenter_voucher' ? 'VOUCH' :
                                 doc.id === 'b2b_proposal' ? 'B2B' : 'EOD';
                  const orderNum = String(selectedOrder.Order_ID || '8921').replace(/[^0-9]/g, '') || '8921';
                  setDocData(prev => ({ ...prev, docNumber: `${prefix}-2026-${orderNum}` }));
                }}
                style={{ 
                  fontSize: '11px', 
                  padding: '5px 10px', 
                  fontWeight: isAct ? '800' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: isAct ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                  borderColor: isAct ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'
                }}
              >
                <Icon size={12} color={isAct ? 'var(--accent-gold)' : 'inherit'} />
                <span>{doc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Load From Order Quick Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '700' }}>Load Order:</span>
          <CustomerOrderSearchSelector
            selectedOrderId={selectedOrder.Order_ID}
            onSelectOrder={(orderId, orderObj) => {
              if (orderObj) {
                setSelectedOrder(orderObj);
                loadOrderIntoDocData(orderObj);
              }
            }}
            placeholder="🔍 Pick Order to auto-fill..."
            allowAll={false}
            style={{ width: '220px' }}
          />
        </div>

      </div>

      {/* 🚀 MASTER DUAL-PANE COCKPIT: LIVE EDITOR (LEFT) ↔ A4 CANVAS (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: '18px', alignItems: 'start' }}>
        
        {/* ========================================================================= */}
        {/* 🛠️ LEFT SIDEBAR: LIVE INTERACTIVE DOCUMENT EDITOR                        */}
        {/* ========================================================================= */}
        <div className="glass-panel no-print" style={{ padding: '16px', borderRadius: '14px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Header & Sub-Tabs */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={15} color="var(--accent-gold)" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                  Live Document Editor
                </span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Live Syncing ✓</span>
            </div>

            {/* Editor Sub Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '10px' }}>
              {[
                { id: 'items', label: '📦 Items' },
                { id: 'meta', label: '👤 Client' },
                { id: 'logistics', label: '🚚 Fleet' },
                { id: 'signatory', label: '🔏 Sign' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setEditorTab(t.id)}
                  style={{
                    padding: '5px 2px',
                    fontSize: '11px',
                    fontWeight: editorTab === t.id ? '800' : '500',
                    background: editorTab === t.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                    color: editorTab === t.id ? '#000000' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SUB-TAB 1: 📦 ITEMS & CATALOG PRODUCT GRID                          */}
          {/* ===================================================================== */}
          {editorTab === 'items' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* 1-Click Catalog SKU Quick Add Dropdown */}
              <div style={{ background: '#070D1E', padding: '10px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)', display: 'block', marginBottom: '6px' }}>
                  ➕ 1-Click Add From 115+ SKU Catalog:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search Catalog SKU or Name..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                  {catalogSearch.trim().length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#0B132B',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: '6px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 100,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
                    }}>
                      {fullCatalog
                        .filter(p => 
                          (p.name && p.name.toLowerCase().includes(catalogSearch.toLowerCase())) ||
                          (p.sku && p.sku.toLowerCase().includes(catalogSearch.toLowerCase())) ||
                          (p.category && p.category.toLowerCase().includes(catalogSearch.toLowerCase()))
                        )
                        .slice(0, 8)
                        .map(prod => (
                          <div 
                            key={prod.sku}
                            onClick={() => handleAddCatalogItem(prod)}
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div>
                              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#FFFFFF' }}>{prod.name}</div>
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{prod.sku} • {prod.category}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold)' }}>₹{Number(prod.price).toLocaleString()}</div>
                              <span style={{ fontSize: '9px', color: '#10B981', fontWeight: '700' }}>+ ADD</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                  Active Items ({docData.items.length}):
                </span>
                <button 
                  onClick={handleAddCustomBlankItem}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Blank Row
                </button>
              </div>

              {docData.items.map((item, idx) => (
                <div 
                  key={item.id} 
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                      #{idx + 1} SKU: {item.sku}
                    </span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                      title="Remove Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', color: '#94A3B8' }}>Item Name / Model:</label>
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px', marginTop: '2px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: '6px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94A3B8' }}>Qty:</label>
                      <input 
                        type="number" 
                        value={item.qty} 
                        onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94A3B8' }}>Rate (₹ Taxable):</label>
                      <input 
                        type="number" 
                        value={item.rate} 
                        onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px', borderRadius: '4px', color: '#10B981', fontSize: '11px', fontWeight: '700' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94A3B8' }}>Discount (₹):</label>
                      <input 
                        type="number" 
                        value={item.discount} 
                        onChange={(e) => handleUpdateItem(item.id, 'discount', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px', borderRadius: '4px', color: '#F59E0B', fontSize: '11px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '4px' }}>
                    <span>HSN: <b>{item.hsn}</b></span>
                    <span>Row Total: <b style={{ color: '#FFF' }}>₹{Number(item.taxableValue).toLocaleString()}</b></span>
                  </div>
                </div>
              ))}

              {/* Tax Type Switcher */}
              <div style={{ background: '#030712', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>GST Mode:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => setDocData(prev => ({ ...prev, taxType: 'INTRA_STATE' }))}
                    style={{
                      padding: '6px',
                      fontSize: '10.5px',
                      fontWeight: docData.taxType === 'INTRA_STATE' ? '800' : '500',
                      background: docData.taxType === 'INTRA_STATE' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: docData.taxType === 'INTRA_STATE' ? '#10B981' : 'var(--text-secondary)',
                      border: docData.taxType === 'INTRA_STATE' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Odisha Intra (CGST 9% + SGST 9%)
                  </button>

                  <button
                    onClick={() => setDocData(prev => ({ ...prev, taxType: 'INTER_STATE' }))}
                    style={{
                      padding: '6px',
                      fontSize: '10.5px',
                      fontWeight: docData.taxType === 'INTER_STATE' ? '800' : '500',
                      background: docData.taxType === 'INTER_STATE' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                      color: docData.taxType === 'INTER_STATE' ? '#60A5FA' : 'var(--text-secondary)',
                      border: docData.taxType === 'INTER_STATE' ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Inter-State (IGST 18%)
                  </button>
                </div>
              </div>

              {/* Live Summary Calculation Box */}
              <div style={{ background: '#0F172A', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--accent-gold)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Taxable Subtotal:</span>
                  <span>₹{calculatedTaxableSubtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Total GST (18%):</span>
                  <span>₹{Math.round(calculatedGstAmount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FCD34D', fontWeight: '900', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                  <span>Grand Total:</span>
                  <span>₹{calculatedGrandTotal.toLocaleString()}</span>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* SUB-TAB 2: 👤 CLIENT & LEGAL ENTITIES                               */}
          {/* ===================================================================== */}
          {editorTab === 'meta' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Document Number:</label>
                <input 
                  type="text" 
                  value={docData.docNumber} 
                  onChange={(e) => setDocData({ ...docData, docNumber: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FCD34D', fontSize: '12px', fontWeight: '800' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Date:</label>
                  <input 
                    type="text" 
                    value={docData.docDate} 
                    onChange={(e) => setDocData({ ...docData, docDate: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Order Ref ID:</label>
                  <input 
                    type="text" 
                    value={docData.orderIdRef} 
                    onChange={(e) => setDocData({ ...docData, orderIdRef: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Customer / Company Name:</label>
                <input 
                  type="text" 
                  value={docData.customerName} 
                  onChange={(e) => setDocData({ ...docData, customerName: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11.5px', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Phone:</label>
                  <input 
                    type="text" 
                    value={docData.customerPhone} 
                    onChange={(e) => setDocData({ ...docData, customerPhone: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Customer GSTIN (Optional):</label>
                  <input 
                    type="text" 
                    value={docData.customerGstin} 
                    onChange={(e) => setDocData({ ...docData, customerGstin: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Project / Delivery Address:</label>
                <textarea 
                  rows={2}
                  value={docData.projectAddress} 
                  onChange={(e) => setDocData({ ...docData, projectAddress: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Payment Status & Terms:</label>
                <input 
                  type="text" 
                  value={docData.paymentStatus} 
                  onChange={(e) => setDocData({ ...docData, paymentStatus: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#10B981', fontSize: '11px', fontWeight: '700' }}
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SUB-TAB 3: 🚚 LOGISTICS, FLEET & CARPENTER                          */}
          {/* ===================================================================== */}
          {editorTab === 'logistics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                🚚 Delivery & Warehouse Dispatch Details:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Vehicle Number:</label>
                  <input 
                    type="text" 
                    value={docData.vehicleNo} 
                    onChange={(e) => setDocData({ ...docData, vehicleNo: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Driver Name:</label>
                  <input 
                    type="text" 
                    value={docData.driverName} 
                    onChange={(e) => setDocData({ ...docData, driverName: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Gatepass Number:</label>
                  <input 
                    type="text" 
                    value={docData.gatepassNo} 
                    onChange={(e) => setDocData({ ...docData, gatepassNo: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Knockdown Units:</label>
                  <input 
                    type="text" 
                    value={docData.cartonUnits} 
                    onChange={(e) => setDocData({ ...docData, cartonUnits: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '6px' }}>
                  🪚 Master Carpenter Installation Voucher:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Carpenter Name:</label>
                    <input 
                      type="text" 
                      value={docData.carpenterName} 
                      onChange={(e) => setDocData({ ...docData, carpenterName: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Wage Amount (₹):</label>
                    <input 
                      type="number" 
                      value={docData.carpenterWage} 
                      onChange={(e) => setDocData({ ...docData, carpenterWage: Number(e.target.value) })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#10B981', fontSize: '11px', fontWeight: '700' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '6px' }}>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Scope of Assembly Work:</label>
                  <input 
                    type="text" 
                    value={docData.carpenterTasks} 
                    onChange={(e) => setDocData({ ...docData, carpenterTasks: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SUB-TAB 4: 🔏 SIGNATORY & WARRANTY CUSTOMIZER                       */}
          {/* ===================================================================== */}
          {editorTab === 'signatory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                🛡️ Warranty & Security Customizer:
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Hologram / Warranty Serial Number:</label>
                <input 
                  type="text" 
                  value={docData.warrantySerial} 
                  onChange={(e) => setDocData({ ...docData, warrantySerial: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FCD34D', fontSize: '11.5px', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Warranty Duration:</label>
                  <select
                    value={docData.warrantyYears}
                    onChange={(e) => setDocData({ ...docData, warrantyYears: Number(e.target.value) })}
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', padding: '6px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                  >
                    <option value={1}>1 Year Standard</option>
                    <option value={3}>3 Years Extended</option>
                    <option value={5}>5 Years Luxury</option>
                    <option value={10}>10 Years Royal Gold</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Digital Stamp:</label>
                  <button
                    onClick={() => setDocData({ ...docData, showDigitalStamp: !docData.showDigitalStamp })}
                    style={{
                      width: '100%',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: docData.showDigitalStamp ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: docData.showDigitalStamp ? '#10B981' : '#94A3B8',
                      border: docData.showDigitalStamp ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {docData.showDigitalStamp ? 'Seal Active ✓' : 'Blank Pen Line'}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Authorized Signatory Name:</label>
                <input 
                  type="text" 
                  value={docData.signatoryName} 
                  onChange={(e) => setDocData({ ...docData, signatoryName: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Terms & Conditions Text:</label>
                <textarea 
                  rows={2}
                  value={docData.terms} 
                  onChange={(e) => setDocData({ ...docData, terms: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '4px', color: '#FFF', fontSize: '10.5px' }}
                />
              </div>
            </div>
          )}

          {/* Bottom Action Triggers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <button 
              className="btn-luxury-gold" 
              onClick={() => window.print()}
              style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
            >
              <Printer size={13} /> <span>Print A4</span>
            </button>
            <button 
              className="btn-emerald" 
              onClick={handleSendWhatsAppDocument}
              style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
            >
              <Send size={13} /> <span>Send WhatsApp</span>
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 📄 RIGHT SIDE: HIGH-DEF A4 PRINTABLE CANVAS (AUTO UPDATING IN REAL TIME)  */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Canvas Wrapper */}
          <div className="glass-panel" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            
            {/* Top Canvas Bar */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070D1E', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>A4 VECTOR CANVAS</span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Document: <b>{docData.docNumber}</b> • {docData.customerName}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => window.print()} 
                  className="btn-ghost-edit" 
                  style={{ fontSize: '10.5px', padding: '4px 10px', color: 'var(--accent-gold)' }}
                >
                  <Printer size={12} /> Print A4
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 1. DOCUMENT TEMPLATE: OFFICIAL GST TAX INVOICE                        */}
            {/* ===================================================================== */}
            {selectedDocType === 'tax_invoice' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                
                {/* Header with Store Info & Invoice Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #0F172A', paddingBottom: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: 0 }}>{storeMeta.storeName}</h2>
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>{storeMeta.address}</div>
                    <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '2px' }}>
                      GSTIN: <b>{storeMeta.gstin}</b> | Phone: <b>{storeMeta.phone}</b> | CIN/PAN: {storeMeta.cinPan}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284C7', letterSpacing: '0.5px' }}>TAX INVOICE</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>Invoice No: {docData.docNumber}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Date: {docData.docDate} {docData.docTime}</div>
                  </div>
                </div>

                {/* Billed To & Payment Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', margin: '14px 0', padding: '12px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>BILLED TO (BUYER):</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{docData.customerName}</div>
                    <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '1px' }}>{docData.projectAddress}</div>
                    <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                      Phone: <b>{docData.customerPhone}</b> {docData.customerGstin ? `| GSTIN: ${docData.customerGstin}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>PAYMENT & DISPATCH:</div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#047857', marginTop: '2px' }}>{docData.paymentStatus}</div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>UPI VPA: {docData.merchantVpa}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>Order Ref: {docData.orderIdRef}</div>
                  </div>
                </div>

                {/* Itemized Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: '14px 0' }}>
                  <thead>
                    <tr style={{ background: '#0F172A', color: '#FFFFFF', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
                      <th style={{ padding: '8px 10px', width: '45%' }}>Item Description & Technical Specifications</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '10%' }}>HSN</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '8%' }}>Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '15%' }}>Rate (₹)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '17%' }}>Taxable Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docData.items.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 10px', verticalAlign: 'top', color: '#64748B' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 10px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>{item.name}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>{item.specs}</div>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', verticalAlign: 'top', color: '#475569' }}>{item.hsn}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', verticalAlign: 'top', fontWeight: '700' }}>{item.qty} {item.unit}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', verticalAlign: 'top', color: '#334155' }}>₹{Number(item.rate).toLocaleString()}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', verticalAlign: 'top', fontWeight: '800', color: '#0F172A' }}>₹{Number(item.taxableValue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tax Breakdown & Settlement Footer */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginTop: '16px' }}>
                  
                  {/* Left Column: Terms & Doorstep Verification QR */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>TERMS & CONDITIONS:</div>
                      <div>• {docData.terms}</div>
                      <div>• Official 10-Year Manufacturer Warranty under Serial <b>{docData.warrantySerial}</b>.</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                      <DynamicQrCode value={`https://shreeganesh-godrej.web.app/#documents?inv=${docData.docNumber}`} size={54} />
                      <div style={{ fontSize: '10px', color: '#64748B' }}>
                        <div><b>Scan to Verify Tax Invoice</b></div>
                        <div>Official Godrej Interio Digital Ledger</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Financial Calculations */}
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Taxable Value:</span>
                      <span>₹{calculatedTaxableSubtotal.toLocaleString()}</span>
                    </div>

                    {docData.taxType === 'INTRA_STATE' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>CGST (9%):</span>
                          <span>₹{Math.round(calculatedCgst).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>SGST (9%):</span>
                          <span>₹{Math.round(calculatedSgst).toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>IGST (18%):</span>
                        <span>₹{Math.round(calculatedIgst).toLocaleString()}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '16px', borderTop: '2px solid #0F172A', paddingTop: '6px', marginTop: '4px', color: '#047857' }}>
                      <span>Grand Total:</span>
                      <span>₹{calculatedGrandTotal.toLocaleString()}</span>
                    </div>

                    {/* Seal and Signatory */}
                    <div style={{ marginTop: '14px', textAlign: 'right', borderTop: '1px dashed #CBD5E1', paddingTop: '8px' }}>
                      {docData.showDigitalStamp ? (
                        <div style={{ display: 'inline-block', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800', border: '1.5px solid #047857', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                            ✓ DIGITALLY AUTHENTICATED
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{docData.signatoryName}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>Shree Ganesh Enterprises</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ height: '30px' }} />
                          <div style={{ fontSize: '11px', color: '#64748B' }}>Authorized Signatory</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ===================================================================== */}
            {/* 2. DOCUMENT TEMPLATE: COMMERCIAL PROFORMA INVOICE                     */}
            {/* ===================================================================== */}
            {selectedDocType === 'proforma_invoice' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #B45309', paddingBottom: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: 0 }}>{storeMeta.storeName}</h2>
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>{storeMeta.address}</div>
                    <div style={{ fontSize: '11.5px', color: '#334155' }}>GSTIN: {storeMeta.gstin} | Phone: {storeMeta.phone}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#B45309' }}>COMMERCIAL PROFORMA</div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>Quote Ref: {docData.docNumber}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Valid For: 15 Days From {docData.docDate}</div>
                  </div>
                </div>

                <div style={{ margin: '14px 0', padding: '12px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
                  <b>🏛️ OFFICIAL BANK ESTIMATE & ADVANCE QUOTATION:</b> This document is valid for SBI, HDFC, and ICICI Furniture / Home Improvement Loan Sanction.
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: '14px 0' }}>
                  <thead>
                    <tr style={{ background: '#78350F', color: '#FFFFFF' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item / Model Specs</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Catalogue MRP (₹)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Offer Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docData.items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 10px' }}>
                          <b>{item.name}</b>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>{item.specs}</div>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: '700' }}>{item.qty} {item.unit}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#64748B' }}>₹{((item.mrp || item.rate) * item.qty).toLocaleString()}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: '800', color: '#047857' }}>₹{Number(item.taxableValue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', maxWidth: '340px' }}>
                    <div>• 50% SafeLock token locks price and inventory.</div>
                    <div>• Balance 50% payable upon doorstep delivery & customer verification.</div>
                  </div>
                  <div style={{ textAlign: 'right', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Total Net Quotation (GST Included):</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#B45309' }}>₹{calculatedGrandTotal.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: '700', marginTop: '2px' }}>
                      50% Token Advance: ₹{Math.round(calculatedGrandTotal * 0.5).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 3. DOCUMENT TEMPLATE: OFFICIAL DELIVERY CHALLAN (FORM DC-01)          */}
            {/* ===================================================================== */}
            {selectedDocType === 'delivery_challan' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #0F172A', paddingBottom: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: 0 }}>{storeMeta.storeName}</h2>
                    <div style={{ fontSize: '11.5px', color: '#334155' }}>{storeMeta.address} | Phone: {storeMeta.phone}</div>
                    <div style={{ fontSize: '11px', color: '#334155' }}>GSTIN: {storeMeta.gstin}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '17px', fontWeight: '900', color: '#D97706' }}>OFFICIAL DELIVERY CHALLAN</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800' }}>Challan No: {docData.docNumber}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Dispatch Date: {docData.dispatchDate || docData.docDate}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '14px 0', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '800' }}>CONSIGNEE (DELIVER TO):</div>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>{docData.customerName}</div>
                    <div style={{ fontSize: '11.5px', color: '#334155' }}>{docData.projectAddress}</div>
                    <div style={{ fontSize: '11px', color: '#334155' }}>Contact: <b>{docData.customerPhone}</b></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '800' }}>FLEET LOGISTICS:</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800' }}>Vehicle: {docData.vehicleNo}</div>
                    <div style={{ fontSize: '11.5px', color: '#334155' }}>Driver: {docData.driverName}</div>
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: '800' }}>Dock Gatepass: {docData.gatepassNo} ✓</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: '14px 0' }}>
                  <thead>
                    <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Knockdown Package Units</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>QC Seal</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Declared Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docData.items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 10px' }}>
                          <b>{item.name}</b>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>SmartKit™ Flat-Pack Cartons Verified • Pre-Delivery Inspection Passed</div>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: '700' }}>{docData.cartonUnits}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', color: '#047857', fontWeight: '800' }}>{docData.qcStatus}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: '800' }}>₹{Number(item.taxableValue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11px', color: '#475569', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <div>Driver Signature: _______________________ ({docData.driverName})</div>
                  <div>Customer Signature: _______________________ ({docData.customerName})</div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 4. DOCUMENT TEMPLATE: 10-YEAR LUXURY GOLD & NAVY WARRANTY CERTIFICATE */}
            {/* ===================================================================== */}
            {selectedDocType === 'warranty_card' && (
              <div className="printable-area" style={{ background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)', color: '#FFFFFF', padding: '40px', border: '3px solid #D4AF37', position: 'relative', overflow: 'hidden' }}>
                
                {/* Ambient Watermark */}
                <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '160px', opacity: 0.04, color: '#D4AF37', pointerEvents: 'none', fontWeight: '900', fontFamily: 'serif' }}>
                  GI
                </div>

                {/* Certificate Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(212,175,55,0.4)', paddingBottom: '20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid #D4AF37', borderRadius: '30px', padding: '6px 18px', marginBottom: '12px' }}>
                    <Award size={16} color="#D4AF37" />
                    <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '800', color: '#D4AF37', textTransform: 'uppercase' }}>
                      GODREJ INTERIO OFFICIAL GUARANTEE
                    </span>
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#D4AF37', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Cinzel, Georgia, serif', margin: '4px 0' }}>
                    {docData.warrantyYears}-Year Digital Warranty Certificate
                  </h1>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Shree Ganesh Enterprises • Main Road, Near New Bus Stand, Rayagada (OD 765001)
                  </div>
                </div>

                {/* Certificate Body */}
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', letterSpacing: '0.5px', margin: 0 }}>
                    This is to officially certify that
                  </p>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', margin: '8px 0', letterSpacing: '0.5px' }}>
                    {docData.customerName}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px' }}>
                    📍 Destination Site: <b>{docData.projectAddress}</b>
                  </p>

                  <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', margin: '14px auto' }} />

                  <p style={{ fontSize: '13.5px', color: '#E2E8F0', maxWidth: '620px', margin: '0 auto', lineHeight: '1.7' }}>
                    is granted a <b>Comprehensive {docData.warrantyYears}-Year Manufacturer Warranty</b> on genuine Godrej Interio Certified Model:
                    <br />
                    <span style={{ color: '#FCD34D', fontSize: '16px', fontWeight: '800', display: 'inline-block', marginTop: '6px' }}>
                      "{docData.items.map(i => i.name).join(' + ')}"
                    </span>
                  </p>
                </div>

                {/* 4 Pillars of Warranty Protection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', margin: '16px 0' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px' }}>🐜</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>ANTI-TERMITE</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>100% Core Infusion</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px' }}>🪚</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>ANTI-BORER</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Seasoned Teak Timber</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px' }}>⚙️</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>HYDRAULIC LIFTS</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>50,000 Cycle Tested</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px' }}>🛠️</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>FREE ANNUAL QC</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Doorstep Mistri Service</div>
                  </div>
                </div>

                {/* Hologram Stamp & Authentication Grid */}
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1.5px dashed #D4AF37', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', margin: '20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 20px rgba(212,175,55,0.6)' }}>
                      🔒
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Tamper-Proof Hologram Serial
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '900', fontFamily: 'JetBrains Mono, monospace', color: '#FCD34D' }}>
                        {docData.warrantySerial}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#6EE7B7' }}>
                        ✓ Cryptographically Signed & Cloud Ledger Stored
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>COVERAGE TIMELINE</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                      2026 — 2036 ({docData.warrantyYears} Full Years)
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Invoice Ref: {docData.docNumber}</div>
                  </div>
                </div>

                {/* Signature & Security Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    <div>Authorized Signatory: <b>{docData.signatoryName}</b></div>
                    <div>Godrej Interio Flagship Store • Rayagada</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <DynamicQrCode value={`https://shreeganesh-godrej.web.app/#documents?war=${docData.warrantySerial}`} size={48} />
                  </div>
                </div>

              </div>
            )}

            {/* ===================================================================== */}
            {/* 5. DOCUMENT TEMPLATE: WAREHOUSE GATE PASS                             */}
            {/* ===================================================================== */}
            {selectedDocType === 'gate_pass' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>GODREJ INTERIO RAYAGADA GODOWN</h2>
                    <div style={{ fontSize: '12px', color: '#475569' }}>Outward Security Clearance Desk</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#B45309' }}>GATE PASS: {docData.gatepassNo}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Time: {docData.docTime} | Date: {docData.docDate}</div>
                  </div>
                </div>

                <div style={{ margin: '16px 0', fontSize: '12px', lineHeight: '1.8' }}>
                  <div><b>Authorized Driver:</b> {docData.driverName} ({docData.driverPhone})</div>
                  <div><b>Vehicle Reg No:</b> {docData.vehicleNo}</div>
                  <div><b>Consignee Name:</b> {docData.customerName} ({docData.projectAddress})</div>
                  <div><b>Knockdown Carton Count:</b> {docData.cartonUnits}</div>
                  <div><b>Staging Inspection:</b> {docData.qcStatus}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11px', borderTop: '1px solid #CBD5E1', paddingTop: '16px' }}>
                  <div>Warehouse Officer: _______________________</div>
                  <div>Security Guard Check: _______________________ (Exit Cleared ✓)</div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 6. DOCUMENT TEMPLATE: MASTER CARPENTER WORK ORDER & CASH VOUCHER      */}
            {/* ===================================================================== */}
            {selectedDocType === 'carpenter_voucher' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #0F172A', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '19px', fontWeight: '900', margin: 0 }}>MASTER CARPENTER INSTALLATION VOUCHER</h2>
                    <div style={{ fontSize: '12px', color: '#475569' }}>Godrej Interio Authorized Technical Services</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '900', color: '#047857' }}>VOUCH-{docData.orderIdRef}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Issued: {docData.docDate}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '16px 0', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>CARPENTER / FITTER:</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#B45309', marginTop: '2px' }}>{docData.carpenterName}</div>
                    <div style={{ fontSize: '11.5px', color: '#475569' }}>Phone: {docData.carpenterPhone}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>AUTHORIZED WAGE:</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#047857', marginTop: '2px' }}>₹{(Number(docData?.carpenterWage) || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>Payable upon Customer QC Sign-off</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', margin: '14px 0' }}>
                  <div><b>Customer Site:</b> {docData.customerName} ({docData.projectAddress})</div>
                  <div style={{ marginTop: '4px' }}><b>Scope of Work:</b> {docData.carpenterTasks}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11px', borderTop: '1px solid #CBD5E1', paddingTop: '16px' }}>
                  <div>Carpenter Sign: _______________________</div>
                  <div>Customer Satisfaction Sign: _______________________ (Job Completed ✓)</div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 7. DOCUMENT TEMPLATE: B2B TURNKEY PROPOSAL                            */}
            {/* ===================================================================== */}
            {selectedDocType === 'b2b_proposal' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ borderBottom: '3px solid #0F172A', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#B45309', letterSpacing: '1px' }}>ENTERPRISE TURNKEY PROPOSAL</div>
                    <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0' }}>{docData.b2bProjectTitle}</h1>
                    <div style={{ fontSize: '12px', color: '#475569' }}>Prepared for: {docData.customerName} • {docData.projectAddress}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '900', color: '#047857' }}>BUDGET: ₹{calculatedGrandTotal.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Ref: {docData.docNumber}</div>
                  </div>
                </div>

                <div style={{ margin: '16px 0', fontSize: '12px', lineHeight: '1.6' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>1. PROJECT SCOPE</h3>
                  <p style={{ color: '#334155' }}>{docData.b2bScopeOfWork}</p>

                  <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginTop: '14px' }}>2. ITEM BREAKDOWN & ESTIMATE</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', margin: '8px 0' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Item Spec</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docData.items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '8px 8px' }}><b>{item.name}</b> ({item.specs})</td>
                          <td style={{ padding: '8px 8px', textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: '700' }}>₹{Number(item.taxableValue).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginTop: '14px' }}>3. COMMERCIAL MILESTONES</h3>
                  <p style={{ color: '#334155' }}>{docData.b2bMilestones}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #CBD5E1', paddingTop: '16px', fontSize: '11px', color: '#64748B' }}>
                  <div>Director Sign: <b>{docData.signatoryName}</b> (Godrej Interio)</div>
                  <div>Client Representative Sign: _______________________</div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 8. DOCUMENT TEMPLATE: 9 PM DAILY EOD CASH LOCK SLIP                   */}
            {/* ===================================================================== */}
            {selectedDocType === 'eod_closing' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '32px', maxWidth: '440px', margin: '0 auto', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ fontSize: '16px', fontWeight: '900' }}>9 PM DAILY SHOWROOM CLOSING SLIP</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Date: {docData.docDate} 21:00 IST • Shree Ganesh Enterprises</div>
                <div style={{ width: '100%', height: '1px', background: '#000', margin: '10px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
                  <span>Cash Drawer Physical:</span>
                  <b>₹45,000</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
                  <span>UPI QR Settlements:</span>
                  <b>₹124,000</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
                  <span>Active SafeLocks Logged:</span>
                  <b>4 Orders</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', borderTop: '2px dashed #000', paddingTop: '8px', marginTop: '10px', color: '#047857' }}>
                  <span>Total Day Gross:</span>
                  <span>₹169,000</span>
                </div>

                <div style={{ marginTop: '20px', fontSize: '11px', color: '#64748B', textAlign: 'center' }}>
                  <div>Closed By: <b>{docData.signatoryName}</b></div>
                  <div>Signed & Verified for Night Godown Vault Lock ✓</div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 9. DOCUMENT: MASTER CLIENT ONBOARDING & SOP BLUEPRINT                 */}
            {/* ===================================================================== */}
            {selectedDocType === 'client_onboarding_sop' && (
              <div className="printable-area" style={{ background: '#FFFFFF', color: '#0F172A', padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ borderBottom: '3px solid #0F172A', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#B45309', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      OMNIBUILD OS™ — ENTERPRISE ARCHITECTURE & CLIENT ONBOARDING BLUEPRINT
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: '4px 0' }}>
                      Godrej Interio Rayagada Flagship Showroom
                    </h1>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Client: Shree Ganesh Enterprises | Director: Mr. Rakesh (+91 93905 53301)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: '#0F172A', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                      CONFIDENTIAL SOP
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Version 2.4 (2026)</div>
                  </div>
                </div>

                <div style={{ margin: '20px 0' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: '900', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '6px' }}>
                    1. EXECUTIVE ARCHITECTURE OVERVIEW
                  </h2>
                  <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#334155' }}>
                    OmniBuild OS™ is a multi-tier autonomous retail operating system unifying 16 core business modules, 20 automated cloud bots, and a 21-table Master Google Sheets backend. It eliminates double-selling, missing knockdown carton shortages, and after-hours customer drop-offs through 24/7 AI automation.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

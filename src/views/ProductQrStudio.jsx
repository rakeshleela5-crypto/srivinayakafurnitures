import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DynamicQrCode } from '../utils/qrcodeGenerator';
import { 
  QrCode, 
  Printer, 
  Plus, 
  Check, 
  Layers, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Tag,
  DollarSign,
  Smartphone,
  Eye,
  Sliders,
  Send,
  ShieldCheck,
  Box,
  Share2,
  Barcode,
  MessageSquare,
  Mic,
  Search,
  X,
  Filter,
  Wand2,
  Edit3,
  PlusCircle,
  Boxes,
  Calculator,
  SlidersHorizontal,
  PackageCheck,
  Copy,
  ChevronDown
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function ProductQrStudio() {
  const { 
    catalog, 
    setCatalog, 
    storeMeta, 
    showToast, 
    openModal,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing,
    registerNewSku
  } = useStore();

  const [selectedSku, setSelectedSku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [printLayout, setPrintLayout] = useState('acrylic_standee'); // acrylic_standee | frame_sticker | 5_box_labels | a4_24up
  const [qrStep, setQrStep] = useState(1);

  // 🔍 Smart Search & Category Filter State
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ➕ New Product / Custom SKU Registration Modal State
  const [isNewSkuModalOpen, setIsNewSkuModalOpen] = useState(false);
  const [newSkuForm, setNewSkuForm] = useState({
    sku: '',
    productName: '',
    category: 'Living',
    subCategory: 'Sofas & Recliners',
    priceTier: 'Luxury',
    material: 'Premium CRCA Steel & Teak Wood',
    dimensions: 'Standard Size',
    mrp: 95000,
    unitCost: 55000,
    sellingPrice: 75000,
    warranty: 5,
    boxCount: 1,
    supplier: 'Godrej Interio Flagship',
    bay: 'Dock-A1',
    openingStock: 2,
    bufferThreshold: 2,
    isHeavy: false,
    isFragile: false,
    isThisSideUp: true,
    isKeepDry: true
  });

  // Filtered Catalog List
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      let matchesCat = true;
      if (catalogCategoryFilter === 'CSV') {
        matchesCat = (item.SKU || '').toUpperCase().includes('CSV') || (item.Default_Supplier || '').includes('Featherlite') || (item.SKU || '').startsWith('OFFICE-');
      } else if (catalogCategoryFilter !== 'ALL') {
        const catStr = `${item.Main_Category || ''} ${item.Sub_Category || ''}`.toLowerCase();
        matchesCat = catStr.includes(catalogCategoryFilter.toLowerCase());
      }

      const q = catalogSearchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const fullStr = `${item.SKU || ''} ${item.Product_Name || ''} ${item.Main_Category || ''} ${item.Sub_Category || ''} ${item.Material_Spec || ''} ${item.Default_Supplier || ''} ${item.Price_Tier || ''}`.toLowerCase();
      return matchesCat && fullStr.includes(q);
    });
  }, [catalog, catalogSearchQuery, catalogCategoryFilter]);

  // Editable Product Fields
  const [skuCode, setSkuCode] = useState('BED-MOD-001');
  const [productName, setProductName] = useState('Solid King Bed (Hydraulic Storage)');
  const [category, setCategory] = useState('Bedroom');
  const [subCategory, setSubCategory] = useState('Wooden Bed');
  const [material, setMaterial] = useState('100% Solid CP Teak Wood');
  const [dimensions, setDimensions] = useState('78" L × 72" W × 48" H');
  const [mrp, setMrp] = useState(111000);
  const [sellingPrice, setSellingPrice] = useState(89790);
  const [warranty, setWarranty] = useState(10);
  const [boxCount, setBoxCount] = useState(5);
  const [supplier, setSupplier] = useState('Royal Teak Crafts, Saharanpur (UP)');
  const [storageBay, setStorageBay] = useState('Dock-A1');

  // QR Code Engine Configuration
  const [qrDestination, setQrDestination] = useState('MOBILE_AI_CONCIERGE'); // 'MOBILE_AI_CONCIERGE' | 'WHATSAPP_AI' | 'UPI_TOKEN' | 'PRODUCT_SPEC' | 'DOCK_ROUTE' | 'CUSTOM_URL'
  const [qrSize, setQrSize] = useState(160);
  const [qrColor, setQrColor] = useState('#000000'); // '#000000' | '#0F172A' | '#B45309' | '#0284C7' | '#047857' | '#7C3AED'
  const [customUrl, setCustomUrl] = useState('https://godrejinterio.com/rayagada');

  // Auto-SKU Generator Engine
  const generateSmartSku = (cat, subCat) => {
    const prefixMap = {
      'Bedroom': 'GDJ-BED',
      'Living': 'GDJ-LIV',
      'Dining': 'GDJ-DIN',
      'Office': 'GDJ-OFF',
      'Storage': 'GDJ-STO',
      'Recliner': 'GDJ-REC',
      'Kitchen': 'GDJ-KIT',
      'Custom': 'CUST-FUR'
    };
    const basePrefix = prefixMap[cat] || 'GDJ-FUR';
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    let subCode = 'MOD';
    if (subCat) {
      subCode = subCat.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'MOD';
    }
    return `${basePrefix}-${subCode}-${randSuffix}`;
  };

  // Open Clean New Product Modal
  const handleOpenNewSkuModal = () => {
    const defaultCat = 'Living';
    const defaultSub = 'Sofa';
    setNewSkuForm({
      sku: generateSmartSku(defaultCat, defaultSub),
      productName: '',
      category: defaultCat,
      subCategory: defaultSub,
      priceTier: 'Luxury',
      material: 'Solid Burma Teak & High Resilience Foam',
      dimensions: '84" L × 38" D × 36" H',
      mrp: 95000,
      unitCost: 55000,
      sellingPrice: 75000,
      warranty: 5,
      boxCount: 1,
      supplier: 'Godrej Interio Flagship',
      bay: 'Dock-A1',
      openingStock: 2,
      bufferThreshold: 2,
      isHeavy: false,
      isFragile: false,
      isThisSideUp: true,
      isKeepDry: true
    });
    setIsNewSkuModalOpen(true);
    playScanBeep();
  };

  // 1-Click Clone Variant
  const handleCloneAsVariant = () => {
    const activeItem = catalog.find(c => c.SKU === skuCode) || {
      SKU: skuCode,
      Product_Name: productName,
      Main_Category: category,
      Sub_Category: subCategory,
      Material_Spec: material,
      Dimensions: dimensions,
      MRP_INR: mrp,
      Selling_Price_INR: sellingPrice,
      Warranty_Years: warranty,
      Total_Component_Boxes: boxCount,
      Default_Supplier: supplier
    };

    const variantSku = `${skuCode}-VAR${Math.floor(10 + Math.random() * 90)}`;
    setNewSkuForm({
      sku: variantSku,
      productName: `${productName} (Variant Edition)`,
      category: activeItem.Main_Category || category || 'Living',
      subCategory: activeItem.Sub_Category || subCategory || 'Custom',
      priceTier: activeItem.Price_Tier || 'Luxury',
      material: activeItem.Material_Spec || material || 'Custom Polish & Fabric',
      dimensions: activeItem.Dimensions || dimensions || 'Standard',
      mrp: Number(activeItem.MRP_INR || mrp),
      unitCost: Math.round(Number(activeItem.Selling_Price_INR || sellingPrice) * 0.7),
      sellingPrice: Number(activeItem.Selling_Price_INR || sellingPrice),
      warranty: Number(activeItem.Warranty_Years || warranty),
      boxCount: Number(activeItem.Total_Component_Boxes || boxCount),
      supplier: activeItem.Default_Supplier || supplier,
      bay: 'Dock-A1',
      openingStock: 1,
      bufferThreshold: 2,
      isHeavy: false,
      isFragile: false,
      isThisSideUp: true,
      isKeepDry: true
    });
    setIsNewSkuModalOpen(true);
    playScanBeep();
    showToast(`📑 Cloned ${skuCode} as Variant! Set specs and save.`);
  };

  // Submit & Register Brand New Custom SKU
  const handleRegisterNewSkuSubmit = (e) => {
    e?.preventDefault();
    if (!newSkuForm.sku.trim()) {
      showToast('❌ Please enter or generate a SKU code!');
      return;
    }
    if (!newSkuForm.productName.trim()) {
      showToast('❌ Please enter a Product Model Title!');
      return;
    }

    const payload = {
      sku: newSkuForm.sku.trim().toUpperCase(),
      productName: newSkuForm.productName.trim(),
      category: newSkuForm.category,
      subCategory: newSkuForm.subCategory,
      priceTier: newSkuForm.priceTier,
      material: newSkuForm.material,
      dimensions: newSkuForm.dimensions,
      mrp: Number(newSkuForm.mrp) || 0,
      unitCost: Number(newSkuForm.unitCost) || 0,
      sellingPrice: Number(newSkuForm.sellingPrice) || 0,
      warranty: Number(newSkuForm.warranty) || 5,
      boxCount: Number(newSkuForm.boxCount) || 1,
      supplier: newSkuForm.supplier,
      bay: newSkuForm.bay || 'Dock-A1',
      openingStock: Number(newSkuForm.openingStock) || 0,
      bufferThreshold: Number(newSkuForm.bufferThreshold) || 2
    };

    if (registerNewSku) {
      registerNewSku(payload);
    } else {
      const newCatItem = {
        SKU: payload.sku,
        Product_Name: payload.productName,
        Main_Category: payload.category,
        Sub_Category: payload.subCategory,
        Material_Spec: payload.material,
        Dimensions: payload.dimensions,
        MRP_INR: payload.mrp,
        Selling_Price_INR: payload.sellingPrice,
        Warranty_Years: payload.warranty,
        Total_Component_Boxes: payload.boxCount,
        Default_Supplier: payload.supplier,
        Price_Tier: payload.priceTier,
        Image_URL: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"
      };
      setCatalog([newCatItem, ...catalog]);
      dispatchWebhookAction('REGISTER_NEW_SKU', payload);
    }

    // Set active in QR Studio
    setSelectedSku(payload.sku);
    setSkuCode(payload.sku);
    setProductName(payload.productName);
    setCategory(payload.category);
    setSubCategory(payload.subCategory);
    setMaterial(payload.material);
    setDimensions(payload.dimensions);
    setMrp(payload.mrp);
    setSellingPrice(payload.sellingPrice);
    setWarranty(payload.warranty);
    setBoxCount(payload.boxCount);
    setSupplier(payload.supplier);
    setStorageBay(payload.bay);

    setIsNewSkuModalOpen(false);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`✨ Successfully Registered & Created QR Standee for ${payload.sku}!`, true);
  };

  // Load from Master Catalog
  const handleSelectCatalogItem = (sku) => {
    setSelectedSku(sku);
    const item = catalog.find(c => c.SKU === sku);
    if (item) {
      setSkuCode(item.SKU);
      setProductName(item.Product_Name);
      setCategory(item.Main_Category || 'Bedroom');
      setSubCategory(item.Sub_Category || 'Furniture');
      setMaterial(item.Material_Spec || 'Solid Teak');
      setDimensions(item.Dimensions || 'Standard');
      setMrp(item.MRP_INR || 95000);
      setSellingPrice(item.Selling_Price_INR || 75000);
      setWarranty(item.Warranty_Years || 5);
      setBoxCount(item.Total_Component_Boxes || 3);
      setSupplier(item.Default_Supplier || 'Godrej Partner');
      playScanBeep();
      showToast(`📦 Loaded SKU: ${item.SKU} — ${item.Product_Name}`);
    }
  };

  // Save / Update to Master Catalog & Google Sheets
  const handleSaveToCatalog = () => {
    const updatedItem = {
      SKU: skuCode,
      Product_Name: productName,
      Main_Category: category,
      Sub_Category: subCategory,
      Material_Spec: material,
      Dimensions: dimensions,
      MRP_INR: Number(mrp),
      Selling_Price_INR: Number(sellingPrice),
      Warranty_Years: Number(warranty),
      Total_Component_Boxes: Number(boxCount),
      Default_Supplier: supplier,
      Price_Tier: "Luxury",
      Image_URL: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600"
    };

    const existingIdx = catalog.findIndex(c => c.SKU === skuCode);
    let newCatalog = [...catalog];
    if (existingIdx >= 0) {
      newCatalog[existingIdx] = updatedItem;
    } else {
      newCatalog.unshift(updatedItem);
    }
    setCatalog(newCatalog);
    try { localStorage.setItem('OMNIBUILD_CATALOG', JSON.stringify(newCatalog)); } catch (e) {}

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`💾 Saved SKU ${skuCode} to Master Catalog & Synced to Google Sheets!`, true);

    dispatchWebhookAction('UPDATE_CATALOG_ITEM', {
      sku: skuCode,
      product_name: productName,
      category: category,
      sub_category: subCategory,
      material: material,
      dimensions: dimensions,
      mrp: Number(mrp),
      selling_price: Number(sellingPrice),
      warranty: Number(warranty),
      box_count: Number(boxCount),
      supplier: supplier,
      bay: storageBay
    });

    dispatchWebhookAction('DISPATCH_STANDEE_PRINT_JOB', {
      sku: skuCode,
      product_name: productName,
      layout: printLayout,
      destination: qrDestination,
      qr_url: getQrPayload(),
      selling_price: Number(sellingPrice)
    });
  };

  // Calculate Advance Token
  const tokenAdvance50 = Math.round(Number(sellingPrice) * 0.5);

  // Generate QR Value payload based on destination
  const getQrPayload = () => {
    const prodHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'https://shreeganesh-godrej.web.app' : window.location.origin;

    switch (qrDestination) {
      case 'MOBILE_AI_CONCIERGE':
        return `${prodHost}/#chat?sku=${skuCode}`;
      case 'WHATSAPP_AI': {
        const cleanPhone = (storeMeta.whatsapp || '+919390553301').replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(`Namaskar Godrej Interio Rayagada! I am interested in ${productName} (${skuCode}). Please send me the official PDF brochure, festive discount quote, and teak wood warranty.`);
        return `https://wa.me/${cleanPhone}?text=${msg}`;
      }
      case 'UPI_TOKEN':
        return `upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${tokenAdvance50}&cu=INR&tn=${encodeURIComponent(`50% Token for ${skuCode} (${productName})`)}`;
      case 'PRODUCT_SPEC':
        return `https://godrejinterio.com/products/${skuCode}?warranty=${warranty}Y&specs=${encodeURIComponent(material)}`;
      case 'DOCK_ROUTE':
        return `${prodHost}/#inward?sku=${skuCode}&batch=GI-2026`;
      case 'CUSTOM_URL':
      default:
        return customUrl;
    }
  };

  const handlePrint = () => {
    dispatchWebhookAction('DISPATCH_STANDEE_PRINT_JOB', {
      sku: skuCode,
      product_name: productName,
      layout: printLayout,
      destination: qrDestination,
      qr_url: getQrPayload(),
      selling_price: Number(sellingPrice)
    });
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">📱 PRODUCT QR & ACRYLIC STANDEE STUDIO</span>

          <button className="btn-cyan" onClick={() => openModal('csv_import')} style={{ fontSize: '11px', padding: '6px 12px' }}>
            📥 Bulk CSV
          </button>

          {/* ✨ ➕ Register New SKU Modal Trigger */}
          <button 
            className="btn-luxury-gold" 
            onClick={handleOpenNewSkuModal} 
            style={{ 
              fontSize: '11px', 
              padding: '6px 14px', 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusCircle size={14} /> <span>✨ + Register New Product / Custom SKU</span>
          </button>

          {/* 📑 1-Click Clone Variant */}
          <button 
            className="btn-ghost-edit" 
            onClick={handleCloneAsVariant} 
            style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Clone current product as a variant edition"
          >
            <Copy size={13} /> <span>📑 Clone Variant</span>
          </button>
          
          <button className="btn-emerald" onClick={handleSaveToCatalog} style={{ fontSize: '11px', padding: '6px 12px' }}>
            <Save size={13} /> <span>💾 Save Specs</span>
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
              setActiveTab('whatsapp_bots');
              showToast("💬 Switched to WhatsApp AI Bots & Telemetry!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <MessageSquare size={12} /> <span>WhatsApp Bots (Tab 9)</span>
          </button>

          <button 
            className="btn-amber" 
            onClick={() => {
              setActiveTab('barcode_studio');
              showToast("🏷️ Switched to Barcode & Knockdown Studio!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Barcode size={12} /> <span>Barcodes (Tab 12)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>

          <button className="btn-luxury-gold" onClick={handlePrint} style={{ fontSize: '11px', padding: '5px 12px' }}>
            <Printer size={13} /> <span>🖨️ Print Standee</span>
          </button>
        </div>

      </div>

      {/* Main Studio Grid: In-Place Product Editor + Live Sticker Customizer & Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Product Selector & Full In-Place Spec Editor */}
        <div className="glass-panel no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>🛋️ Product Spec & QR Routing Studio</h3>
            <span className="badge badge-purple">{catalog.length} SKUs LOADED</span>
          </div>

          {/* 3-Step Navigation Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { step: 1, label: '1. 🛋️ Select SKU' },
              { step: 2, label: '2. 🏷️ Specs & Pricing' },
              { step: 3, label: '3. 📱 QR Routing' }
            ].map(s => {
              const isActive = qrStep === s.step;
              const isDone = qrStep > s.step;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    setQrStep(s.step);
                    playScanBeep();
                  }}
                  style={{
                    padding: '7px 4px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isActive ? '900' : '700',
                    background: isActive 
                      ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                      : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                    border: isActive ? '1px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {isDone ? '✓ ' : ''}{s.label}
                </button>
              );
            })}
          </div>

          {/* STEP 1: SKU SELECTOR & LIVE CATALOG SEARCH */}
          {qrStep === 1 && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Category Quick Filter Chips */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={12} /> Filter by Category:
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>
                    Showing {filteredCatalog.length} of {catalog.length} items
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {['ALL', 'Bedroom', 'Living', 'Dining', 'Office', 'Storage', 'Recliner', 'Kitchen', 'CSV'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCatalogCategoryFilter(cat);
                        playScanBeep();
                      }}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: catalogCategoryFilter === cat ? '900' : '600',
                        background: catalogCategoryFilter === cat ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'rgba(30,41,59,0.6)',
                        color: catalogCategoryFilter === cat ? '#000000' : '#CBD5E1',
                        border: catalogCategoryFilter === cat ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      {cat === 'CSV' ? '📥 Custom/CSV' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Search & Filter Bar */}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={catalogSearchQuery}
                      onChange={e => {
                        setCatalogSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="🔍 Search 115+ models by SKU, Title, Material, or Supplier..."
                      style={{
                        width: '100%',
                        padding: '9px 32px 9px 32px',
                        fontSize: '12px',
                        background: '#030712',
                        color: '#FFFFFF',
                        border: '1.5px solid var(--accent-gold)',
                        borderRadius: '8px'
                      }}
                    />
                    {catalogSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCatalogSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="btn-ghost-edit"
                    style={{ padding: '8px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                  >
                    {isDropdownOpen ? '▲ Close' : '▼ Browse'}
                  </button>
                </div>

                {/* Dropdown Results List */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    marginTop: '4px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    background: '#0B1120',
                    border: '1.5px solid var(--accent-gold)',
                    borderRadius: '8px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.95)'
                  }}>
                    {filteredCatalog.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                        No matching models found. Click below to register as a new SKU!
                      </div>
                    ) : (
                      filteredCatalog.map(item => {
                        const isSelected = item.SKU === selectedSku;
                        return (
                          <div
                            key={item.SKU}
                            onClick={() => {
                              handleSelectCatalogItem(item.SKU);
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: isSelected ? 'rgba(212,175,55,0.15)' : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ 
                                fontFamily: 'monospace', 
                                fontWeight: '900', 
                                color: 'var(--accent-gold)', 
                                fontSize: '11.5px',
                                background: '#030712',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(212,175,55,0.3)'
                              }}>
                                {item.SKU}
                              </span>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>{item.Product_Name}</div>
                                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{item.Main_Category} • {item.Material_Spec?.slice(0, 32)}...</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '12.5px', fontWeight: '900', color: 'var(--accent-emerald)' }}>
                                ₹{Number(item.Selling_Price_INR || 0).toLocaleString()}
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#64748B' }}>
                                {item.Total_Component_Boxes || 1} Box(es)
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Active Product Quick Info & SKU Generator */}
              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>SKU Code</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newSku = generateSmartSku(category, subCategory);
                        setSkuCode(newSku);
                        playScanBeep();
                        showToast(`⚡ Auto-Generated SKU: ${newSku}`);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '10.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Wand2 size={11} /> Auto-Gen SKU
                    </button>
                  </div>
                  <input 
                    value={skuCode} 
                    onChange={e => setSkuCode(e.target.value.toUpperCase())}
                    style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--accent-gold)' }}
                  />
                </div>

                <div className="form-field">
                  <label>Main Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Office & Study">Office & Study</option>
                    <option value="Storage & Almirah">Storage & Almirah</option>
                    <option value="Recliner">Recliner Lounge</option>
                    <option value="Kitchen">Kitchen Modular</option>
                  </select>
                </div>

                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Model Title</label>
                  <input value={productName} onChange={e => setProductName(e.target.value)} />
                </div>
              </div>

              {/* Bottom Nav */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-cyan"
                  onClick={handleOpenNewSkuModal}
                  style={{ fontSize: '11px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <PlusCircle size={13} /> + Custom Model Wizard
                </button>

                <button 
                  type="button" 
                  className="btn-luxury-gold" 
                  onClick={() => {
                    setQrStep(2);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
                >
                  Next: Specs, Pricing & Warranty ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SPECS, PRICING & WARRANTY */}
          {qrStep === 2 && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-field">
                  <label>Wood / Material Spec</label>
                  <input value={material} onChange={e => setMaterial(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Dimensions (L×W×H)</label>
                  <input value={dimensions} onChange={e => setDimensions(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Official MRP (₹)</label>
                  <input type="number" value={mrp} onChange={e => setMrp(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Showroom Selling Price (₹)</label>
                  <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label>Godrej Warranty (Years)</label>
                  <input type="number" value={warranty} onChange={e => setWarranty(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label>Component Box Count</label>
                  <input type="number" value={boxCount} onChange={e => setBoxCount(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label>Default Supplier / Origin</label>
                  <input value={supplier} onChange={e => setSupplier(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Assigned Warehouse Bay</label>
                  <input value={storageBay} onChange={e => setStorageBay(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-ghost-edit" 
                  onClick={() => {
                    setQrStep(1);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 16px', fontSize: '12px' }}
                >
                  ⬅️ Back: SKU
                </button>
                <button 
                  type="button" 
                  className="btn-luxury-gold" 
                  onClick={() => {
                    setQrStep(3);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
                >
                  Next: QR Destination & Color ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: QR DESTINATION & COLOR */}
          {qrStep === 3 && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-field">
                <label style={{ color: 'var(--accent-cyan)', fontWeight: '800' }}>QR Code Scan Destination Trigger</label>
                <select value={qrDestination} onChange={e => setQrDestination(e.target.value)} style={{ padding: '10px', fontSize: '12.5px' }}>
                  <option value="MOBILE_AI_CONCIERGE">🤖 Mobile AI Concierge (Instant Customer Phone UI)</option>
                  <option value="WHATSAPP_AI">💬 Direct WhatsApp Inquiry (+91 93905 53301)</option>
                  <option value="UPI_TOKEN">💳 50% Token Advance Instant UPI Payment (₹{tokenAdvance50.toLocaleString()})</option>
                  <option value="PRODUCT_SPEC">📋 Official Godrej Product Spec Sheet</option>
                  <option value="DOCK_ROUTE">🚚 Warehouse Inward Dock Barcode Route</option>
                  <option value="CUSTOM_URL">🌐 Custom Showroom / 3D URL</option>
                </select>
              </div>

              {qrDestination === 'CUSTOM_URL' && (
                <div className="form-field">
                  <label>Custom Destination URL</label>
                  <input value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="https://godrejinterio.com/rayagada/model" />
                </div>
              )}

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-field">
                  <label>QR Pixel Color</label>
                  <select value={qrColor} onChange={e => setQrColor(e.target.value)}>
                    <option value="#000000">Midnight Black (High Contrast)</option>
                    <option value="#0F172A">Navy Slate Dark</option>
                    <option value="#B45309">Luxury Gold Bronze</option>
                    <option value="#0284C7">Godrej Interio Cyan</option>
                    <option value="#047857">Forest Emerald Green</option>
                    <option value="#7C3AED">Royal Purple</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>QR Density Size ({qrSize}px)</label>
                  <input type="range" min="120" max="240" value={qrSize} onChange={e => setQrSize(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-ghost-edit" 
                  onClick={() => {
                    setQrStep(2);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 16px', fontSize: '12px' }}
                >
                  ⬅️ Back: Specs
                </button>
                <button 
                  type="button" 
                  className="btn-luxury-gold" 
                  onClick={handleSaveToCatalog}
                  style={{ flex: 1, marginLeft: '10px', justifyContent: 'center', padding: '10px', fontSize: '12px', fontWeight: '900' }}
                >
                  <Save size={14} /> 💾 Save to Google Sheets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Physical Label Layout Picker & Live Print-Ready Preview */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900' }}>🖨️ Physical Sticker & Standee Layout</h3>
            <span className="badge badge-emerald">READY TO PRINT</span>
          </div>

          {/* Layout Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '12px 0' }}>
            {[
              { id: 'acrylic_standee', label: '🖼️ Standee (4"x6")', desc: 'Dining & coffee tables' },
              { id: 'frame_sticker', label: '🏷️ Frame Sticker', desc: 'Peel & paste on wood' },
              { id: '5_box_labels', label: '📦 5-Box Carton Set', desc: 'Knockdown boxes' },
              { id: 'a4_24up', label: '📄 A4 24-Up Sheet', desc: 'Bulk sticker sheet' }
            ].map(layout => (
              <button
                key={layout.id}
                onClick={() => setPrintLayout(layout.id)}
                style={{
                  background: printLayout === layout.id ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'rgba(30,41,59,0.6)',
                  color: printLayout === layout.id ? '#000000' : '#FFFFFF',
                  fontWeight: '900',
                  border: printLayout === layout.id ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '8px 6px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px' }}>{layout.label}</div>
                <div style={{ fontSize: '8.5px', opacity: 0.8 }}>{layout.desc}</div>
              </button>
            ))}
          </div>

          {/* Live Printable Preview Canvas */}
          <div className="printable-area" style={{ background: '#030712', borderRadius: '16px', padding: '16px', border: '1.5px solid rgba(212,175,55,0.3)', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* ================= LAYOUT 1: SHOWROOM ACRYLIC STANDEE (4"x6") ================= */}
            {printLayout === 'acrylic_standee' && (
              <div style={{ 
                background: 'linear-gradient(180deg, #0F172A 0%, #030712 100%)', 
                color: '#FFFFFF', 
                borderRadius: '16px', 
                padding: '22px', 
                maxWidth: '360px', 
                width: '100%', 
                border: '2px solid var(--accent-gold)', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.95)', 
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '12px', right: '14px', background: 'var(--accent-gold)', color: '#000', fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px' }}>
                  {warranty}-YR WARRANTY ✓
                </div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                  GODREJ INTERIO RAYAGADA
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginBottom: '4px' }}>
                  {productName}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', marginBottom: '14px' }}>
                  <b>SKU:</b> {skuCode} • {material} • {dimensions}
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', display: 'inline-block', margin: '0 auto 12px auto', boxShadow: '0 8px 25px rgba(0,0,0,0.6)' }}>
                  <DynamicQrCode value={getQrPayload()} size={150} fgColor={qrColor} />
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--accent-gold-light)', fontWeight: '900', marginBottom: '3px' }}>
                  📲 SCAN FOR 3D SPECS / PAY ₹{tokenAdvance50.toLocaleString()} TOKEN
                </div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8', marginBottom: '10px' }}>
                  UPI: {storeMeta.upiId} • GPay / PhonePe / Paytm
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{Number(mrp).toLocaleString()}</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-emerald)' }}>₹{Number(sellingPrice).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.2)', color: 'var(--accent-emerald)', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      EMI: ₹{Math.round(sellingPrice / 6).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= LAYOUT 2: FURNITURE FRAME STICKER ================= */}
            {printLayout === 'frame_sticker' && (
              <div style={{ background: '#FFFFFF', color: '#000000', borderRadius: '12px', padding: '16px', maxWidth: '360px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', border: '2px solid #000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.5px' }}>GODREJ INTERIO</div>
                    <div style={{ fontSize: '8.5px', fontWeight: '700', color: '#475569' }}>RAYAGADA FLAGSHIP SHOWROOM</div>
                  </div>
                  <div style={{ background: '#000', color: '#FFF', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>
                    {warranty}-YR WARRANTY ✓
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: '900', lineHeight: '1.2', marginBottom: '2px' }}>
                  {productName}
                </div>
                <div style={{ fontSize: '9.5px', color: '#334155', marginBottom: '6px' }}>
                  <b>SKU:</b> {skuCode} • <b>Spec:</b> {material} • <b>Dim:</b> {dimensions}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F1F5F9', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <div>
                    <div style={{ fontSize: '9px', textDecoration: 'line-through', color: '#64748B' }}>MRP: ₹{Number(mrp).toLocaleString()}</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#B45309' }}>₹{Number(sellingPrice).toLocaleString()}</div>
                    <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: '800' }}>Token Advance: ₹{tokenAdvance50.toLocaleString()}</div>
                  </div>
                  <div>
                    <DynamicQrCode value={getQrPayload()} size={85} fgColor={qrColor} />
                  </div>
                </div>

                <div style={{ fontSize: '8px', textAlign: 'center', color: '#64748B', marginTop: '6px', fontWeight: '700' }}>
                  SCAN TO PAY 50% ADVANCE TOKEN VIA UPI / VIEW SPECS
                </div>
              </div>
            )}

            {/* ================= LAYOUT 3: 5-BOX KNOCKDOWN CARTON LABELS ================= */}
            {printLayout === '5_box_labels' && (
              <div className="print-carton-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                {Array.from({ length: boxCount }).map((_, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={letter} className="print-carton-item" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '8px', padding: '10px', border: '1.5px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '900' }}>GODREJ INTERIO</div>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#B45309' }}>BOX {letter} ({idx + 1}/{boxCount})</div>
                        <div style={{ fontSize: '9px', color: '#334155' }}>{skuCode}</div>
                      </div>
                      <DynamicQrCode value={`${skuCode}-BOX-${letter}`} size={58} fgColor="#000" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= LAYOUT 4: A4 24-UP ADHESIVE STICKER SHEET ================= */}
            {printLayout === 'a4_24up' && (
              <div className="print-grid-a4" style={{ width: '100%', background: '#FFFFFF', padding: '8px', borderRadius: '8px' }}>
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div key={idx} className="print-carton-item" style={{ background: '#F8FAFC', color: '#000000', borderRadius: '6px', padding: '6px', border: '1px solid #CBD5E1', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <DynamicQrCode value={getQrPayload()} size={42} fgColor="#000" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '8px', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skuCode}</div>
                      <div style={{ fontSize: '10px', fontWeight: '900', color: '#B45309' }}>₹{Number(sellingPrice).toLocaleString()}</div>
                      <div style={{ fontSize: '7px', color: '#64748B' }}>Godrej Rayagada</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Quick Action Footer */}
          <div className="no-print" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn-luxury-gold" onClick={handlePrint} style={{ flex: 1, justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
              <Printer size={16} /> 🖨️ 1-Click Print Labels Now
            </button>
            <button className="btn-emerald" onClick={handleSaveToCatalog} style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={16} /> 💾 Save to Google Sheets
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🌟 MODAL: REGISTER NEW CUSTOM PRODUCT & QR STANDEE STUDIO                */}
      {/* ========================================================================= */}
      {isNewSkuModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsNewSkuModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #0F172A 0%, #030712 100%)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
              padding: '24px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                    ✨ Register New Product & QR Standee Studio
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                    Auto-generates Code-128 & QR Standee, registers in Master Catalog, and seeds SafeLock inventory.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSkuModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterNewSkuSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* 1. Category & SKU Section */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Boxes size={14} /> 1. Category & SKU Generation
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {['Living', 'Bedroom', 'Dining', 'Office', 'Storage', 'Recliner', 'Kitchen', 'Custom'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const newSku = generateSmartSku(cat, newSkuForm.subCategory);
                          setNewSkuForm(prev => ({
                            ...prev,
                            category: cat,
                            sku: newSku
                          }));
                          playScanBeep();
                        }}
                        style={{
                          padding: '8px 6px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: newSkuForm.category === cat ? '900' : '600',
                          background: newSkuForm.category === cat ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' : 'rgba(30,41,59,0.5)',
                          color: newSkuForm.category === cat ? '#000000' : '#E2E8F0',
                          border: newSkuForm.category === cat ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                    <div className="form-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>SKU Code *</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newSku = generateSmartSku(newSkuForm.category, newSkuForm.subCategory);
                            setNewSkuForm(prev => ({ ...prev, sku: newSku }));
                            playScanBeep();
                            showToast(`⚡ Auto-Generated: ${newSku}`);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Wand2 size={11} /> Auto-Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={newSkuForm.sku}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                        placeholder="e.g. GDJ-LIV-SOF-8891"
                        style={{ fontFamily: 'monospace', fontWeight: '900', color: 'var(--accent-gold)', fontSize: '13px' }}
                      />
                    </div>

                    <div className="form-field">
                      <label>Sub-Category / Model Series</label>
                      <input
                        type="text"
                        value={newSkuForm.subCategory}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, subCategory: e.target.value }))}
                        placeholder="e.g. 3-Seater Recliner"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Product Title & Specifications */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SlidersHorizontal size={14} /> 2. Product Title & Physical Specifications
                  </div>

                  <div className="form-field" style={{ marginBottom: '10px' }}>
                    <label>Product Model Title *</label>
                    <input
                      type="text"
                      required
                      value={newSkuForm.productName}
                      onChange={e => setNewSkuForm(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="e.g. Godrej Monaco Italian Leatherette 3-Seater Sofa"
                    />
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                    <div className="form-field">
                      <label>Material & Finish Spec</label>
                      <input
                        type="text"
                        value={newSkuForm.material}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, material: e.target.value }))}
                        placeholder="e.g. Engineered Wood + Melamine Finish"
                      />
                    </div>

                    <div className="form-field">
                      <label>Dimensions (L × W × H)</label>
                      <input
                        type="text"
                        value={newSkuForm.dimensions}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, dimensions: e.target.value }))}
                        placeholder="e.g. 78″ L × 36″ W × 32″ H"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Commercial Pricing & Margin Calculator */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calculator size={14} /> 3. Commercial Financials & Profit Margins
                    </div>
                    {newSkuForm.sellingPrice > 0 && newSkuForm.unitCost > 0 && (
                      <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                        Gross Margin: {Math.round(((newSkuForm.sellingPrice - newSkuForm.unitCost) / newSkuForm.sellingPrice) * 100)}% (₹{(newSkuForm.sellingPrice - newSkuForm.unitCost).toLocaleString()})
                      </span>
                    )}
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-field">
                      <label>Official Catalog MRP (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSkuForm.mrp}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Dealer Cost Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSkuForm.unitCost}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="form-field">
                      <label style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Showroom Selling Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSkuForm.sellingPrice}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Warehouse Stock, Component Boxes & Logistics */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PackageCheck size={14} /> 4. Stock & Logistics Parameters
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    <div className="form-field">
                      <label>Opening Stock (Units)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSkuForm.openingStock}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, openingStock: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>SafeLock Buffer (Min)</label>
                      <input
                        type="number"
                        min="1"
                        value={newSkuForm.bufferThreshold}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, bufferThreshold: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Knockdown Boxes</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newSkuForm.boxCount}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, boxCount: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Godrej Warranty (Yrs)</label>
                      <input
                        type="number"
                        min="1"
                        value={newSkuForm.warranty}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, warranty: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                    <div className="form-field">
                      <label>Default Supplier / Factory</label>
                      <input
                        type="text"
                        value={newSkuForm.supplier}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, supplier: e.target.value }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Storage Bay Location</label>
                      <input
                        type="text"
                        value={newSkuForm.bay}
                        onChange={e => setNewSkuForm(prev => ({ ...prev, bay: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Live QR Standee Preview */}
                {newSkuForm.sku && (
                  <div style={{ background: '#000000', padding: '14px', borderRadius: '10px', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: '900' }}>STAND-BY QR CODE PREVIEW</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFF' }}>{newSkuForm.productName || 'New Product'}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{newSkuForm.sku} • ₹{Number(newSkuForm.sellingPrice).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#FFF', padding: '6px', borderRadius: '8px' }}>
                      <DynamicQrCode value={`https://shreeganesh-godrej.web.app/#chat?sku=${newSkuForm.sku}`} size={60} fgColor="#000" />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Submit Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-ghost-edit"
                  onClick={() => setIsNewSkuModalOpen(false)}
                  style={{ padding: '10px 18px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-luxury-gold"
                  style={{
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={15} /> <span>✨ Register Product & Generate QR Standee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

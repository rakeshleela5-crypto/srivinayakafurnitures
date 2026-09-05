import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import CustomerOrderSearchSelector from '../components/common/CustomerOrderSearchSelector';
import { Code128Barcode } from '../utils/barcode128';
import { DynamicQrCode } from '../utils/qrcodeGenerator';
import { 
  Barcode, 
  Printer, 
  Plus, 
  Check, 
  Layers, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Tag, 
  DollarSign, 
  Sliders, 
  Send, 
  ShieldCheck, 
  Box, 
  Share2, 
  Zap, 
  Activity, 
  Copy, 
  FileText, 
  AlertTriangle, 
  ArrowUp, 
  Droplets, 
  Wine, 
  Download,
  Search,
  X,
  Filter,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Mic,
  Wand2,
  Edit3,
  PlusCircle,
  Boxes,
  Calculator,
  SlidersHorizontal,
  PackageCheck
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function BarcodeStudio() {
  const { 
    catalog, 
    setCatalog, 
    orders, 
    storeMeta, 
    openModal, 
    showToast,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing,
    registerNewSku
  } = useStore();

  const [sourceMode, setSourceMode] = useState('SUPPLIER_CATALOG'); // 'SUPPLIER_CATALOG' (default) | 'CUSTOMER_ORDER'
  const [selectedSku, setSelectedSku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.Order_ID || '');

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
      // Category filter check
      let matchesCat = true;
      if (catalogCategoryFilter === 'CSV') {
        matchesCat = (item.SKU || '').toUpperCase().includes('CSV') || (item.Default_Supplier || '').includes('Featherlite') || (item.SKU || '').startsWith('OFFICE-');
      } else if (catalogCategoryFilter !== 'ALL') {
        const catStr = `${item.Main_Category || ''} ${item.Sub_Category || ''}`.toLowerCase();
        matchesCat = catStr.includes(catalogCategoryFilter.toLowerCase());
      }

      // Text search check
      const q = catalogSearchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const fullStr = `${item.SKU || ''} ${item.Product_Name || ''} ${item.Main_Category || ''} ${item.Sub_Category || ''} ${item.Material_Spec || ''} ${item.Default_Supplier || ''} ${item.Price_Tier || ''}`.toLowerCase();
      return matchesCat && fullStr.includes(q);
    });
  }, [catalog, catalogSearchQuery, catalogCategoryFilter]);

  const [printLayout, setPrintLayout] = useState('pallet_label'); // pallet_label | carton_strip | multibox_grid | thermal_50x25 | a4_24up | zpl_code
  const [barcodeStep, setBarcodeStep] = useState(1);

  // Editable Barcode Fields
  const [skuCode, setSkuCode] = useState('BED-MOD-001');
  const [productName, setProductName] = useState('Solid King Bed (Hydraulic Storage)');
  const [category, setCategory] = useState('Bedroom');
  const [material, setMaterial] = useState('100% Solid CP Teak Wood');
  const [dimensions, setDimensions] = useState('78" L × 72" W × 48" H');
  const [mrp, setMrp] = useState(111000);
  const [sellingPrice, setSellingPrice] = useState(89790);
  const [warranty, setWarranty] = useState(10);
  const [boxCount, setBoxCount] = useState(5);
  const [batchNo, setBatchNo] = useState(`GI-${new Date().getFullYear()}-0881`);
  const [storageBay, setStorageBay] = useState('Dock-A1');
  const [totalWeightKg, setTotalWeightKg] = useState(119.2);

  // Safety & Handling Visual Badges
  const [isHeavyCarton, setIsHeavyCarton] = useState(true);
  const [isFragileGlass, setIsFragileGlass] = useState(false);
  const [isThisSideUp, setIsThisSideUp] = useState(true);
  const [isKeepDry, setIsKeepDry] = useState(true);

  // Code-128 Barcode Line & Laser Features
  const [moduleWidth, setModuleWidth] = useState(1.6);
  const [barHeight, setBarHeight] = useState(55);
  const [bearerBars, setBearerBars] = useState(true); // Industrial Top & Bottom Guard Lines
  const [isLaserSweeping, setIsLaserSweeping] = useState(true); // Red Laser Line Animation
  const [barcodeColor, setBarcodeColor] = useState('#000000');
  const [quietZone, setQuietZone] = useState(true);

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
      material: 'Solid CP Teak Wood & High-Resilience Foam',
      dimensions: 'Standard Size',
      mrp: 95000,
      unitCost: 55000,
      sellingPrice: 75000,
      warranty: 5,
      boxCount: 1,
      supplier: 'Godrej Interio Flagship',
      bay: 'Dock-A1',
      openingStock: 3,
      bufferThreshold: 2,
      isHeavy: false,
      isFragile: false,
      isThisSideUp: true,
      isKeepDry: true
    });
    setIsNewSkuModalOpen(true);
    playScanBeep();
  };

  // 📑 1-Click Clone Current SKU as New Variant
  const handleCloneVariant = () => {
    const current = catalog.find(c => c.SKU === selectedSku) || {
      SKU: skuCode,
      Product_Name: productName,
      Main_Category: category,
      Material_Spec: material,
      Dimensions: dimensions,
      MRP_INR: mrp,
      Selling_Price_INR: sellingPrice,
      Warranty_Years: warranty,
      Total_Component_Boxes: boxCount,
      Assigned_Bay: storageBay
    };

    const newSkuCode = `${current.SKU}-VAR${Math.floor(10 + Math.random() * 90)}`;
    setNewSkuForm({
      sku: newSkuCode,
      productName: `${current.Product_Name} (Custom Variant)`,
      category: current.Main_Category || 'Living',
      subCategory: current.Sub_Category || 'Custom Model',
      priceTier: current.Price_Tier || 'Luxury',
      material: `${current.Material_Spec || 'Solid Teak'} (Custom Finish)`,
      dimensions: current.Dimensions || 'Standard',
      mrp: current.MRP_INR || 95000,
      unitCost: Math.round((current.Selling_Price_INR || 75000) * 0.72),
      sellingPrice: current.Selling_Price_INR || 75000,
      warranty: current.Warranty_Years || 5,
      boxCount: current.Total_Component_Boxes || 1,
      supplier: current.Default_Supplier || 'Godrej Interio Flagship',
      bay: current.Assigned_Bay || 'Dock-A1',
      openingStock: 2,
      bufferThreshold: 2,
      isHeavy: isHeavyCarton,
      isFragile: isFragileGlass,
      isThisSideUp: isThisSideUp,
      isKeepDry: isKeepDry
    });
    setIsNewSkuModalOpen(true);
    playScanBeep();
    showToast(`📑 Cloned specs from ${current.SKU}! Adjust finish/pricing and save.`, true);
  };

  // Save New SKU from Modal
  const handleSaveNewSku = () => {
    if (!newSkuForm.sku || !newSkuForm.productName) {
      showToast("⚠️ Please enter both an SKU Code and Product Title!");
      return;
    }

    if (registerNewSku) {
      registerNewSku({
        sku: newSkuForm.sku,
        productName: newSkuForm.productName,
        category: newSkuForm.category,
        subCategory: newSkuForm.subCategory,
        priceTier: newSkuForm.priceTier,
        material: newSkuForm.material,
        dimensions: newSkuForm.dimensions,
        mrp: Number(newSkuForm.mrp),
        unitCost: Number(newSkuForm.unitCost),
        sellingPrice: Number(newSkuForm.sellingPrice),
        warranty: Number(newSkuForm.warranty),
        boxCount: Number(newSkuForm.boxCount),
        supplier: newSkuForm.supplier,
        bay: newSkuForm.bay,
        openingStock: Number(newSkuForm.openingStock),
        bufferThreshold: Number(newSkuForm.bufferThreshold)
      });
    }

    // Load newly created SKU into Barcode Studio
    setSelectedSku(newSkuForm.sku);
    setSkuCode(newSkuForm.sku);
    setProductName(newSkuForm.productName);
    setCategory(newSkuForm.category);
    setMaterial(newSkuForm.material);
    setDimensions(newSkuForm.dimensions);
    setMrp(Number(newSkuForm.mrp));
    setSellingPrice(Number(newSkuForm.sellingPrice));
    setWarranty(Number(newSkuForm.warranty));
    setBoxCount(Number(newSkuForm.boxCount));
    setStorageBay(newSkuForm.bay);
    setIsHeavyCarton(newSkuForm.isHeavy);
    setIsFragileGlass(newSkuForm.isFragile);
    setIsThisSideUp(newSkuForm.isThisSideUp);
    setIsKeepDry(newSkuForm.isKeepDry);

    setIsNewSkuModalOpen(false);
  };

  // Load from Master Catalog
  const handleSelectCatalogItem = (sku) => {
    setSelectedSku(sku);
    const item = catalog.find(c => c.SKU === sku);
    if (item) {
      setSkuCode(item.SKU);
      setProductName(item.Product_Name);
      setCategory(item.Main_Category || 'Bedroom');
      setMaterial(item.Material_Spec || 'Solid Teak');
      setDimensions(item.Dimensions || 'Standard');
      setMrp(item.MRP_INR || 95000);
      setSellingPrice(item.Selling_Price_INR || 75000);
      setWarranty(item.Warranty_Years || 5);
      setBoxCount(item.Total_Component_Boxes || 3);
      setBatchNo(`GI-${new Date().getFullYear()}-0881`);
      setStorageBay(item.Assigned_Bay || 'Dock-A1');
      setIsFragileGlass(item.Material_Spec?.toLowerCase().includes('glass') || item.Material_Spec?.toLowerCase().includes('marble'));
      playScanBeep();
      showToast(`📦 Loaded Catalog SKU: ${item.SKU}`);
    }
  };

  // Load from Customer Order (Outward Packaging Mode)
  const handleSelectCustomerOrder = (orderId) => {
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.Order_ID === orderId);
    if (order) {
      const firstSku = order.Ordered_SKU ? order.Ordered_SKU.split(' ')[0] : 'BED-MOD-001';
      setSkuCode(`SK-${order.Order_ID}`);
      setProductName(`${order.Customer_Name} • ${order.Ordered_SKU}`);
      setCategory('Customer Staging');
      setMaterial('SmartKit Verified Cartons');
      setDimensions(order.Project_Address || 'Rayagada District');
      setMrp(order.Total_Amount_INR || 95000);
      setSellingPrice(order.Balance_Due_INR || 0);
      setBatchNo(`GP-${order.Order_ID}`);
      setStorageBay(`Dock 1 (Driver: ${order.Assigned_Driver ? order.Assigned_Driver.split(' ')[0] : 'Tophan'})`);
      setBoxCount(5);
      playScanBeep();
      showToast(`📦 Loaded Customer Packaging Barcode for #${order.Order_ID} (${order.Customer_Name})`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Save current studio edits to Catalog and SafeLock Inventory
  const handleSaveToCatalog = async () => {
    playSuccessChime();
    triggerGoldenConfetti();

    if (registerNewSku) {
      registerNewSku({
        sku: skuCode,
        productName: productName,
        category: category,
        material: material,
        dimensions: dimensions,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        warranty: Number(warranty),
        boxCount: Number(boxCount),
        bay: storageBay,
        openingStock: 2,
        bufferThreshold: 2
      });
    } else {
      const updatedItem = {
        SKU: skuCode,
        Product_Name: productName,
        Main_Category: category,
        Material_Spec: material,
        Dimensions: dimensions,
        MRP_INR: Number(mrp),
        Selling_Price_INR: Number(sellingPrice),
        Warranty_Years: Number(warranty),
        Total_Component_Boxes: Number(boxCount),
        Assigned_Bay: storageBay
      };

      setCatalog(prev => {
        const exists = prev.some(c => c.SKU === skuCode);
        let updated;
        if (exists) {
          updated = prev.map(c => c.SKU === skuCode ? { ...c, ...updatedItem } : c);
        } else {
          updated = [updatedItem, ...prev];
        }
        try { localStorage.setItem('OMNIBUILD_CATALOG', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      showToast(`💾 Barcode specs saved for ${skuCode} & synced to Google Sheets!`, true);

      await dispatchWebhookAction('UPDATE_CATALOG_ITEM', {
        sku: skuCode,
        product_name: productName,
        category: category,
        material: material,
        dimensions: dimensions,
        mrp: Number(mrp),
        selling_price: Number(sellingPrice),
        warranty: Number(warranty),
        box_count: Number(boxCount),
        assigned_bay: storageBay,
        batch_no: batchNo
      });
    }
  };

  // Generate Raw Zebra ZPL II Command String
  const generateZplCode = () => {
    return `^XA
^PW812
^LL1218
^LH0,0
^FO40,40^GB732,1138,4,B,0^FS
^FO60,60^A0N,32,32^FDGODREJ INTERIO RAYAGADA^FS
^FO550,60^A0N,24,24^FDBATCH: ${batchNo}^FS
^FO60,110^GB692,2,B,0^FS
^FO60,130^A0N,36,36^FD${productName.substring(0, 32)}^FS
^FO60,180^A0N,22,22^FDSKU: ${skuCode} | Boxes: ${boxCount} Cartons | Spec: ${material.substring(0, 24)}^FS
^FO60,230^BY3,3,100^BCN,100,Y,N,N^FD>:${skuCode}^FS
^FO60,380^GB692,2,B,0^FS
^FO60,405^A0N,26,26^FDSelling Rate: Rs.${Number(sellingPrice).toLocaleString()} (GST INCL)^FS
^FO520,405^A0N,26,26^FDBAY: ${storageBay}^FS
^FO60,450^A0N,20,20^FDQC STATUS: FACTORY PASSED [OK]^FS
^XZ`;
  };

  const copyZplCode = () => {
    navigator.clipboard.writeText(generateZplCode());
    playScanBeep();
    showToast("📋 Raw Zebra ZPL II Code copied to clipboard!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">🏷️ GS1 CODE-128 BARCODE STUDIO</span>
          
          <button 
            className="btn-luxury-gold"
            onClick={handleOpenNewSkuModal}
            style={{ fontSize: '11px', padding: '6px 12px', fontWeight: '900', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}
          >
            <Sparkles size={13} /> ➕ Register New SKU Barcode
          </button>

          <button 
            className="btn-ghost-edit"
            onClick={handleCloneVariant}
            style={{ fontSize: '11px', padding: '5px 10px', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.4)' }}
            title="Clone current product as a new color/finish variant"
          >
            <Copy size={12} /> 📑 Clone Variant
          </button>

          <button 
            className={`btn-ghost-edit ${isLaserSweeping ? 'badge-rose' : ''}`}
            onClick={() => setIsLaserSweeping(!isLaserSweeping)}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Activity size={12} /> {isLaserSweeping ? '🔴 Laser Line ON' : 'Laser OFF'}
          </button>

          <button 
            className={`btn-ghost-edit ${bearerBars ? 'badge-gold' : ''}`}
            onClick={() => setBearerBars(!bearerBars)}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ShieldCheck size={12} /> {bearerBars ? '📦 Bearer Guard ON' : 'Bearer OFF'}
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              openModal('csv_import');
              playScanBeep();
            }}
            style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--accent-gold-light)', border: '1px solid var(--accent-gold)' }}
          >
            <FileText size={12} /> 📁 Import CSV
          </button>

          <button className="btn-emerald" onClick={handleSaveToCatalog} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <Save size={12} /> 💾 Save Specs
          </button>
        </div>

        {/* Right Cross-Tab Terminal Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('inward_scanner');
              showToast("📥 Switched to Dock 1 Inward Scanner!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ArrowDownLeft size={12} /> <span>Dock 1 Inward (Tab 14)</span>
          </button>

          <button 
            className="btn-purple" 
            onClick={() => {
              setActiveTab('outward_scanner');
              showToast("📤 Switched to Dock 2 Outward Staging Scanner!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ArrowUpRight size={12} /> <span>Dock 2 Outward (Tab 15)</span>
          </button>

          <button 
            className="btn-emerald" 
            onClick={() => {
              setActiveTab('safelock');
              showToast("🔒 Switched to SafeLock Inventory Terminal!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ShieldCheck size={12} /> <span>SafeLock (Tab 3)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>

          <button className="btn-luxury-gold" onClick={handlePrint} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <Printer size={13} /> <span>🖨️ Print Labels</span>
          </button>
        </div>

      </div>

      {/* Main Studio Grid: Barcode Configurator + Live Printable Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: SKU Selector & Barcode Configuration */}
        <div className="glass-panel no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-cyan)' }}>
              ⚙️ GS1 Code-128 Barcode Line Parameters
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button"
                onClick={handleOpenNewSkuModal} 
                className="btn-luxury-gold" 
                style={{ fontSize: '10.5px', padding: '4px 8px' }}
              >
                <Plus size={11} /> ➕ New SKU
              </button>
              <span className="badge badge-purple">{catalog.length} SKUs</span>
            </div>
          </div>

          {/* 3-Step Navigation Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { step: 1, label: '1. 🛋️ Select / Edit SKU' },
              { step: 2, label: '2. 🏷️ Specs & Safety' },
              { step: 3, label: '3. 🎛️ Laser & ZPL' }
            ].map(s => {
              const isActive = barcodeStep === s.step;
              const isDone = barcodeStep > s.step;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    setBarcodeStep(s.step);
                    playScanBeep();
                  }}
                  style={{
                    padding: '7px 4px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isActive ? '900' : '700',
                    background: isActive 
                      ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' 
                      : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: isActive ? '#FFFFFF' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
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

          {/* STEP 1: SKU SELECTOR & BASICS */}
          {barcodeStep === 1 && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Quick Action Banner in Step 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                    ✨ Add New Product or Custom Furniture Model:
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                    Auto-generate GS1 barcode, QR code, and sync to SafeLock stock
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-luxury-gold"
                    onClick={handleOpenNewSkuModal}
                    style={{ fontSize: '10.5px', padding: '5px 10px', fontWeight: '800' }}
                  >
                    <PlusCircle size={12} /> ➕ Register SKU
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-edit"
                    onClick={() => openModal('csv_import')}
                    style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  >
                    <FileText size={11} /> CSV
                  </button>
                </div>
              </div>

              {/* Source Switcher: Supplier Catalog (Default) ⇋ Customer Dispatch Order */}
              <div style={{ display: 'flex', gap: '6px', background: '#030712', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode('SUPPLIER_CATALOG');
                    handleSelectCatalogItem(selectedSku);
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: sourceMode === 'SUPPLIER_CATALOG' ? 'linear-gradient(135deg, #0284C7, #0369A1)' : 'transparent',
                    color: sourceMode === 'SUPPLIER_CATALOG' ? '#FFFFFF' : '#94A3B8',
                    border: sourceMode === 'SUPPLIER_CATALOG' ? '1px solid #FFFFFF' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  🏭 1. Supplier / Catalog Inward
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode('CUSTOMER_ORDER');
                    if (orders.length > 0) handleSelectCustomerOrder(selectedOrderId || orders[0].Order_ID);
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: sourceMode === 'CUSTOMER_ORDER' ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'transparent',
                    color: sourceMode === 'CUSTOMER_ORDER' ? '#000000' : '#94A3B8',
                    border: sourceMode === 'CUSTOMER_ORDER' ? '1px solid #D4AF37' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  📦 2. Customer Dispatch Packaging
                </button>
              </div>

              {sourceMode === 'SUPPLIER_CATALOG' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Search size={13} /> Search & Select Furniture Product ({catalog.length} SKUs):
                    </label>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>
                      ✨ Showing <span style={{ color: 'var(--accent-cyan)' }}>{filteredCatalog.length}</span> matches
                    </span>
                  </div>

                  {/* 1-Click Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {[
                      { id: 'ALL', label: `🌟 All (${catalog.length})` },
                      { id: 'Bedroom', label: '🛏️ Bedroom' },
                      { id: 'Living', label: '🛋️ Living' },
                      { id: 'Dining', label: '🍽️ Dining' },
                      { id: 'Office', label: '🏢 Office' },
                      { id: 'Storage', label: '🗄️ Storage' },
                      { id: 'Kitchen', label: '🍳 Kitchen' },
                      { id: 'CSV', label: '🆕 CSV' }
                    ].map(cat => {
                      const isCatActive = catalogCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCatalogCategoryFilter(cat.id)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: isCatActive ? '800' : '600',
                            whiteSpace: 'nowrap',
                            background: isCatActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                            color: isCatActive ? '#000000' : '#CBD5E1',
                            border: isCatActive ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Search Input */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', color: '#64748B' }} />
                    <input
                      type="text"
                      value={catalogSearchQuery}
                      onChange={e => {
                        setCatalogSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="🔍 Search SKU, Bed, Dining, Leatherette Sofa, Teak..."
                      style={{
                        width: '100%',
                        padding: '8px 30px 8px 32px',
                        background: '#030712',
                        color: '#FFFFFF',
                        border: '1.5px solid var(--accent-cyan)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    />
                    {catalogSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCatalogSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Visual Dropdown / Quick Results List */}
                  <div style={{
                    maxHeight: '170px',
                    overflowY: 'auto',
                    background: '#050B18',
                    border: '1px solid rgba(2,132,199,0.3)',
                    borderRadius: '8px',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {filteredCatalog.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: '#94A3B8' }}>
                        No furniture products match "{catalogSearchQuery}". Click <b>➕ Register New SKU</b> above to create it.
                      </div>
                    ) : (
                      filteredCatalog.map(item => {
                        const isSelected = item.SKU === selectedSku;
                        const isCsv = (item.SKU || '').toUpperCase().includes('CSV') || (item.SKU || '').startsWith('OFFICE-');
                        return (
                          <div
                            key={item.SKU}
                            onClick={() => {
                              handleSelectCatalogItem(item.SKU);
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: isSelected ? 'rgba(2,132,199,0.25)' : 'rgba(255,255,255,0.03)',
                              border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.06)',
                              cursor: 'pointer',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: '900',
                                color: isSelected ? '#38BDF8' : 'var(--accent-cyan)',
                                background: 'rgba(2,132,199,0.15)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.SKU}
                              </span>
                              {isCsv && (
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: '800',
                                  color: '#F59E0B',
                                  background: 'rgba(245,158,11,0.15)',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  whiteSpace: 'nowrap'
                                }}>
                                  🆕 CSV
                                </span>
                              )}
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '11.5px', fontWeight: '700', color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                                  {item.Product_Name}
                                </span>
                                <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '6px' }}>
                                  • {item.Main_Category} {item.Dimensions ? `(${item.Dimensions})` : ''}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                                ₹{(item.Selling_Price_INR || item.MRP_INR || 0).toLocaleString('en-IN')}
                              </span>
                              <span style={{ fontSize: '9.5px', color: '#94A3B8', background: 'rgba(255,255,255,0.06)', padding: '2px 5px', borderRadius: '4px' }}>
                                📦 {item.Total_Component_Boxes || 1} Box{(item.Total_Component_Boxes || 1) > 1 ? 'es' : ''}
                              </span>
                              {isSelected && (
                                <span style={{ color: 'var(--accent-emerald)', fontWeight: '900', fontSize: '12px' }}>✓</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-field">
                  <label style={{ fontWeight: '800', color: 'var(--accent-gold-light)' }}>Search Customer / SafeLock Order for Packaging Barcode:</label>
                  <CustomerOrderSearchSelector
                    selectedOrderId={selectedOrderId}
                    onSelectOrder={(orderId) => {
                      if (orderId) handleSelectCustomerOrder(orderId);
                    }}
                    placeholder="🔍 Search Customer, Phone, Order ID (#8921)..."
                    allowAll={false}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              {/* Direct In-Studio Edit & Auto-Gen Fields */}
              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ margin: 0, fontWeight: '800' }}>SKU Code</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newGen = generateSmartSku(category, productName);
                        setSkuCode(newGen);
                        playScanBeep();
                        showToast(`⚡ Auto-Generated SKU: ${newGen}`);
                      }}
                      style={{
                        background: 'rgba(56,189,248,0.15)',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Wand2 size={10} /> Auto-Gen SKU
                    </button>
                  </div>
                  <input value={skuCode} onChange={e => setSkuCode(e.target.value.toUpperCase())} placeholder="e.g. GDJ-BED-001" />
                </div>

                <div className="form-field">
                  <label>Warehouse Batch</label>
                  <input value={batchNo} onChange={e => setBatchNo(e.target.value)} />
                </div>

                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Full Title</label>
                  <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Solid King Bed (Hydraulic Storage)" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-ghost-edit"
                  onClick={handleCloneVariant}
                  style={{ fontSize: '11px', padding: '8px 12px', color: '#38BDF8' }}
                >
                  <Copy size={12} /> 📑 Clone as New Variant
                </button>
                <button 
                  type="button" 
                  className="btn-cyan" 
                  onClick={() => {
                    setBarcodeStep(2);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
                >
                  Next: Specs, Pricing & Safety Badges ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SPECS, PRICING & SAFETY BADGES */}
          {barcodeStep === 2 && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-field">
                  <label>Material Spec</label>
                  <input value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. 100% Solid CP Teak Wood" />
                </div>
                <div className="form-field">
                  <label>Dimensions</label>
                  <input value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="e.g. 78x72x48 in" />
                </div>
                <div className="form-field">
                  <label>Gross Catalog MRP (₹)</label>
                  <input type="number" value={mrp} onChange={e => setMrp(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label>Selling Rate (₹)</label>
                  <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label>Total Knockdown Boxes</label>
                  <input type="number" min="1" max="8" value={boxCount} onChange={e => setBoxCount(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label>Assigned Rack Bay</label>
                  <select value={storageBay} onChange={e => setStorageBay(e.target.value)}>
                    <option value="Dock-A1">Dock-A1 (Ground Pallet)</option>
                    <option value="Dock-A2">Dock-A2 (Hydraulic Beds)</option>
                    <option value="Bay-B1">Bay-B1 (Living Sectionals)</option>
                    <option value="Bay-C1">Bay-C1 (Marble Dining)</option>
                    <option value="Mezzanine-1">Mezzanine-1 (Fittings)</option>
                    <option value="Showroom Floor">Showroom Display Floor</option>
                  </select>
                </div>
              </div>

              {/* Industrial Handling & Safety Warning Badges Config */}
              <div style={{ background: '#030712', borderRadius: '12px', padding: '12px', border: '1px solid rgba(245,158,11,0.3)', marginTop: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  ⚠️ Warehouse Safety & Handling Badges:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isHeavyCarton} onChange={e => setIsHeavyCarton(e.target.checked)} />
                    🏋️ Heavy Lift (30+ KG)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isFragileGlass} onChange={e => setIsFragileGlass(e.target.checked)} />
                    🍷 Fragile Glass / Marble
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isThisSideUp} onChange={e => setIsThisSideUp(e.target.checked)} />
                    ⬆️⬆️ This Side Up
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isKeepDry} onChange={e => setIsKeepDry(e.target.checked)} />
                    💧 Protect From Water
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-ghost-edit" 
                  onClick={() => {
                    setBarcodeStep(1);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 16px', fontSize: '12px' }}
                >
                  ⬅️ Back: SKU
                </button>
                <button 
                  type="button" 
                  className="btn-cyan" 
                  onClick={() => {
                    setBarcodeStep(3);
                    playScanBeep();
                  }}
                  style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
                >
                  Next: Laser Line & ZPL Controls ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LASER & ZPL CONTROLS */}
          {barcodeStep === 3 && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56,189,248,0.3)' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  🎛️ Code-128 Line Multipliers & Industrial Features:
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-field">
                    <label>Bar Height ({barHeight}px)</label>
                    <input type="range" min="35" max="85" value={barHeight} onChange={e => setBarHeight(Number(e.target.value))} />
                  </div>
                  <div className="form-field">
                    <label>Bar Line Thickness ({moduleWidth}px)</label>
                    <input type="range" min="1.1" max="2.6" step="0.1" value={moduleWidth} onChange={e => setModuleWidth(Number(e.target.value))} />
                  </div>
                  <div className="form-field">
                    <label>Bearer Guard Lines</label>
                    <select value={bearerBars ? 'YES' : 'NO'} onChange={e => setBearerBars(e.target.value === 'YES')}>
                      <option value="YES">Top & Bottom Guard Lines</option>
                      <option value="NO">Standard Flush Edges</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Quiet Zone Margin</label>
                    <select value={quietZone ? 'YES' : 'NO'} onChange={e => setQuietZone(e.target.value === 'YES')}>
                      <option value="YES">Enabled (GS1 Compliance)</option>
                      <option value="NO">Tight Padding</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-ghost-edit" 
                  onClick={() => {
                    setBarcodeStep(2);
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
                  <Save size={14} /> 💾 Save to Master OS & Google Sheets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Physical Print Layouts & Live Preview */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900' }}>🖨️ Physical 1D Barcode Formats</h3>
            <span className="badge badge-emerald">LASER GUN READY</span>
          </div>

          {/* Layout Tabs */}
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', margin: '12px 0' }}>
            {[
              { id: 'pallet_label', label: '📦 Pallet 4"×6"', desc: 'Master Unit' },
              { id: 'carton_strip', label: '🏷️ 2"×4" Strips', desc: 'Carton list' },
              { id: 'multibox_grid', label: '📦 Multi-Box', desc: 'Box 1..N Labels' },
              { id: 'thermal_50x25', label: '🖨️ Thermal 50×25', desc: 'Handheld tag' },
              { id: 'a4_24up', label: '📄 A4 Sheet', desc: '24-Up Laser' },
              { id: 'zpl_code', label: '⚡ Zebra ZPL', desc: 'Raw Thermal' }
            ].map(layout => (
              <button
                key={layout.id}
                onClick={() => setPrintLayout(layout.id)}
                style={{
                  background: printLayout === layout.id ? 'linear-gradient(135deg, var(--accent-cyan), #0284C7)' : 'rgba(30,41,59,0.6)',
                  color: printLayout === layout.id ? '#000000' : '#FFFFFF',
                  fontWeight: '900',
                  border: printLayout === layout.id ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '10px' }}>{layout.label}</div>
                <div style={{ fontSize: '8px', opacity: 0.8 }}>{layout.desc}</div>
              </button>
            ))}
          </div>

          {/* Live Printable Preview Canvas */}
          <div className="printable-area" style={{ background: '#030712', borderRadius: '16px', padding: '16px', border: '1.5px solid rgba(56,189,248,0.3)', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            
            {/* ================= LAYOUT 1: WAREHOUSE MASTER PALLET LABEL (4"x6") ================= */}
            {printLayout === 'pallet_label' && (
              <div className="printable-card" style={{ position: 'relative', background: '#FFFFFF', color: '#000000', borderRadius: '12px', padding: '16px', maxWidth: '380px', width: '100%', border: '2.5px solid #000', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                
                {/* Red Laser Sweeper Animation */}
                {isLaserSweeping && (
                  <div className="no-print" style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'linear-gradient(180deg, transparent, #F43F5E, #FFFFFF, #F43F5E, transparent)',
                    boxShadow: '0 0 12px #F43F5E, 0 0 20px #F43F5E',
                    animation: 'laserScanHorizontal 2s infinite ease-in-out',
                    zIndex: 10
                  }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '0.5px' }}>GODREJ INTERIO</div>
                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#475569' }}>RAYAGADA FLAGSHIP WAREHOUSE</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '10px', background: '#000', color: '#FFF', padding: '2px 6px', borderRadius: '3px' }}>BATCH: {batchNo}</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#0284C7', marginTop: '2px' }}>BAY: {storageBay}</div>
                  </div>
                </div>

                <div style={{ fontSize: '14px', fontWeight: '900', marginBottom: '2px' }}>{productName}</div>
                <div style={{ fontSize: '10px', color: '#334155', marginBottom: '8px' }}>
                  <b>SKU:</b> {skuCode} • <b>Boxes:</b> {boxCount} Cartons • <b>Spec:</b> {material}
                </div>

                {/* Safety Warning Banners */}
                {(isHeavyCarton || isFragileGlass || isThisSideUp || isKeepDry) && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0', padding: '4px 8px', background: '#FEF08A', border: '1px solid #CA8A04', borderRadius: '6px' }}>
                    {isHeavyCarton && <span style={{ fontSize: '8.5px', fontWeight: '900', color: '#854D0E' }}>🏋️ HEAVY LIFT ({totalWeightKg} KG)</span>}
                    {isFragileGlass && <span style={{ fontSize: '8.5px', fontWeight: '900', color: '#B91C1C' }}>🍷 FRAGILE</span>}
                    {isThisSideUp && <span style={{ fontSize: '8.5px', fontWeight: '900', color: '#1E3A8A' }}>⬆️ THIS SIDE UP</span>}
                    {isKeepDry && <span style={{ fontSize: '8.5px', fontWeight: '900', color: '#047857' }}>💧 KEEP DRY</span>}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <Code128Barcode 
                    value={skuCode} 
                    moduleWidth={moduleWidth} 
                    height={barHeight} 
                    bearerBars={bearerBars} 
                    quietZone={quietZone}
                    fontSize={11} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', fontWeight: '800' }}>
                  <span>Selling Rate: ₹{Number(sellingPrice).toLocaleString()}</span>
                  <span style={{ color: '#059669' }}>Dock QC: PASSED ✓</span>
                </div>
              </div>
            )}

            {/* ================= LAYOUT 2: 2"x4" CARTON STRIPS (ALL BOXES) ================= */}
            {printLayout === 'carton_strip' && (
              <div className="print-carton-list" style={{ width: '100%', gap: '10px' }}>
                {Array.from({ length: boxCount }).map((_, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={letter} className="print-carton-item" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '8px', padding: '10px 14px', border: '1.5px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '900' }}>GODREJ • BOX {letter} ({idx + 1}/{boxCount})</div>
                        <div style={{ fontSize: '10px', color: '#334155' }}>{skuCode} • {productName}</div>
                        <div style={{ fontSize: '8.5px', color: '#64748B', marginTop: '2px' }}>Bay: {storageBay} | Batch: {batchNo}</div>
                      </div>
                      <Code128Barcode 
                        value={`${skuCode}-BOX-${letter}`} 
                        moduleWidth={1.2} 
                        height={38} 
                        bearerBars={bearerBars} 
                        quietZone={false}
                        fontSize={9} 
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= LAYOUT 3: MULTI-BOX KNOCKDOWN GRID ================= */}
            {printLayout === 'multibox_grid' && (
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: boxCount > 2 ? 'repeat(2, 1fr)' : '1fr', gap: '10px' }}>
                {Array.from({ length: boxCount }).map((_, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const boxNames = [
                    'Headboard & Structural Frame',
                    'Side Rails & Support Slats',
                    'Hydraulic Piston Mechanism',
                    'Engineered Mattress Base Board',
                    'Hardware Fittings & Screws',
                    'Cushion Padding & Accessories'
                  ];
                  const boxDesc = boxNames[idx % boxNames.length];
                  return (
                    <div key={letter} style={{ background: '#FFFFFF', color: '#000000', borderRadius: '10px', padding: '12px', border: '2px solid #000', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #000', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: '900' }}>GODREJ INTERIO</span>
                        <span style={{ fontSize: '10px', fontWeight: '900', background: '#000', color: '#FFF', padding: '1px 6px', borderRadius: '3px' }}>
                          CARTON {idx + 1} OF {boxCount}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '900' }}>{productName}</div>
                      <div style={{ fontSize: '9.5px', color: '#334155', fontWeight: '700' }}>
                        📦 <b>Component:</b> {boxDesc}
                      </div>
                      <div style={{ fontSize: '9px', color: '#64748B' }}>
                        SKU: <b>{skuCode}-BOX-{letter}</b> • Bay: <b>{storageBay}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                        <Code128Barcode 
                          value={`${skuCode}-BOX-${letter}`} 
                          moduleWidth={1.1} 
                          height={36} 
                          bearerBars={true} 
                          quietZone={false}
                          fontSize={9} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', fontWeight: '800', borderTop: '1px dashed #94A3B8', paddingTop: '4px' }}>
                        <span>Batch: {batchNo}</span>
                        <span style={{ color: '#059669' }}>QC: VERIFIED ✓</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= LAYOUT 4: THERMAL 50x25 LABEL ================= */}
            {printLayout === 'thermal_50x25' && (
              <div className="printable-card" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '6px', padding: '10px 14px', width: '230px', border: '1.5px solid #000', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '9px', fontWeight: '900', marginBottom: '2px' }}>GODREJ INTERIO RAYAGADA</div>
                <div style={{ fontSize: '10px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productName}</div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <Code128Barcode 
                    value={skuCode} 
                    moduleWidth={1.1} 
                    height={35} 
                    bearerBars={bearerBars} 
                    quietZone={false}
                    fontSize={9} 
                  />
                </div>
                <div style={{ fontSize: '9px', fontWeight: '800' }}>₹{Number(sellingPrice).toLocaleString()} (GST INCL)</div>
              </div>
            )}

            {/* ================= LAYOUT 5: A4 24-UP ADHESIVE SHEET ================= */}
            {printLayout === 'a4_24up' && (
              <div className="print-grid-a4" style={{ width: '100%', background: '#FFFFFF', padding: '8px', borderRadius: '8px' }}>
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div key={idx} className="print-carton-item" style={{ background: '#F8FAFC', color: '#000000', borderRadius: '6px', padding: '6px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skuCode}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
                      <Code128Barcode 
                        value={skuCode} 
                        moduleWidth={0.85} 
                        height={24} 
                        bearerBars={false} 
                        quietZone={false}
                        fontSize={7.5} 
                      />
                    </div>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#B45309' }}>₹{Number(sellingPrice).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= LAYOUT 6: ZEBRA ZPL II RAW CODE EXPORTER ================= */}
            {printLayout === 'zpl_code' && (
              <div style={{ width: '100%', background: '#0F172A', borderRadius: '12px', padding: '16px', border: '1px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-cyan)' }}>
                    ⚡ RAW ZEBRA ZPL II PRINTER COMMANDS (4"×6" Thermal Label)
                  </span>
                  <button className="btn-luxury-gold" onClick={copyZplCode} style={{ fontSize: '10.5px', padding: '4px 10px' }}>
                    <Copy size={12} /> Copy ZPL Code
                  </button>
                </div>
                <pre style={{ background: '#030712', color: '#38BDF8', padding: '12px', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono', overflowX: 'auto', margin: 0 }}>
                  {generateZplCode()}
                </pre>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="no-print" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn-cyan" onClick={handlePrint} style={{ flex: 1, justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
              <Printer size={16} /> 🖨️ 1-Click Print Barcodes
            </button>
            <button className="btn-emerald" onClick={handleSaveToCatalog} style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={16} /> 💾 Save to Google Sheets
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🌟 MODAL: REGISTER NEW PRODUCT SKU & AUTO-GENERATE BARCODE                */}
      {/* ========================================================================= */}
      {isNewSkuModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #090E1A 0%, #030712 100%)',
            border: '2px solid rgba(212,175,55,0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            position: 'relative'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-gold">✨ NEW SKU REGISTRATION</span>
                  <span className="badge badge-cyan">GS1 COMPLIANT</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', marginTop: '6px' }}>
                  Register New Furniture Product & Auto-Generate Barcode
                </h2>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  Instantly creates Master Catalog entry, seeds SafeLock physical inventory, and generates printable barcodes & QR codes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewSkuModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Section 1: Category & Auto-SKU Generator */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold-light)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={13} /> 1. CATEGORY & SMART SKU GENERATOR:
                </div>

                {/* Category Selector Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {[
                    { id: 'Bedroom', label: '🛏️ Bedroom', prefix: 'GDJ-BED' },
                    { id: 'Living', label: '🛋️ Living Room', prefix: 'GDJ-LIV' },
                    { id: 'Dining', label: '🍽️ Dining & Study', prefix: 'GDJ-DIN' },
                    { id: 'Office', label: '🏢 Office Chairs & Desk', prefix: 'GDJ-OFF' },
                    { id: 'Storage', label: '🗄️ Wardrobes & Storage', prefix: 'GDJ-STO' },
                    { id: 'Recliner', label: '💺 Motorized Recliners', prefix: 'GDJ-REC' },
                    { id: 'Kitchen', label: '🍳 Modular Kitchen', prefix: 'GDJ-KIT' },
                    { id: 'Custom', label: '✨ Custom Craft', prefix: 'CUST-FUR' }
                  ].map(cat => {
                    const isSelected = newSkuForm.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const newGenSku = generateSmartSku(cat.id, newSkuForm.subCategory);
                          setNewSkuForm(prev => ({
                            ...prev,
                            category: cat.id,
                            sku: newGenSku
                          }));
                          playScanBeep();
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: isSelected ? '900' : '600',
                          background: isSelected ? 'linear-gradient(135deg, var(--accent-gold), #B45309)' : 'rgba(255,255,255,0.05)',
                          color: isSelected ? '#000000' : '#E2E8F0',
                          border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* SKU Code Input with Auto-Gen Button */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ margin: 0, fontWeight: '800' }}>SKU Code (Unique ID)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const gen = generateSmartSku(newSkuForm.category, newSkuForm.subCategory);
                          setNewSkuForm(prev => ({ ...prev, sku: gen }));
                          playScanBeep();
                          showToast(`⚡ Auto-Generated: ${gen}`);
                        }}
                        style={{
                          background: 'rgba(56,189,248,0.15)',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Wand2 size={11} /> ⚡ Auto-Generate SKU
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newSkuForm.sku}
                      onChange={e => setNewSkuForm({ ...newSkuForm, sku: e.target.value.toUpperCase() })}
                      placeholder="e.g. GDJ-BED-ROYALE-01"
                      style={{ fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '13px' }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Default Supplier / Brand</label>
                    <input
                      type="text"
                      value={newSkuForm.supplier}
                      onChange={e => setNewSkuForm({ ...newSkuForm, supplier: e.target.value })}
                      placeholder="e.g. Godrej Interio Official"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Product Name, Material & Specs */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box size={13} /> 2. PRODUCT DETAILS & PHYSICAL SPECIFICATIONS:
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div className="form-field">
                    <label>Product Full Title / Model Name</label>
                    <input
                      type="text"
                      value={newSkuForm.productName}
                      onChange={e => setNewSkuForm({ ...newSkuForm, productName: e.target.value })}
                      placeholder="e.g. Royale Teak Hydraulic King Bed (Imperial Finish)"
                      style={{ fontWeight: '700' }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Sub-Category</label>
                    <input
                      type="text"
                      value={newSkuForm.subCategory}
                      onChange={e => setNewSkuForm({ ...newSkuForm, subCategory: e.target.value })}
                      placeholder="e.g. Hydraulic Storage Bed"
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-field">
                    <label>Material Spec</label>
                    <input
                      type="text"
                      value={newSkuForm.material}
                      onChange={e => setNewSkuForm({ ...newSkuForm, material: e.target.value })}
                      placeholder="e.g. Solid CP Teak Wood"
                    />
                  </div>

                  <div className="form-field">
                    <label>Dimensions</label>
                    <input
                      type="text"
                      value={newSkuForm.dimensions}
                      onChange={e => setNewSkuForm({ ...newSkuForm, dimensions: e.target.value })}
                      placeholder="e.g. 78x72x48 in"
                    />
                  </div>

                  <div className="form-field">
                    <label>Price Tier</label>
                    <select
                      value={newSkuForm.priceTier}
                      onChange={e => setNewSkuForm({ ...newSkuForm, priceTier: e.target.value })}
                    >
                      <option value="Luxury">Luxury Gold 👑</option>
                      <option value="Mid-Range">Mid-Range ⚡</option>
                      <option value="Economy">Economy / Essential</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Warranty (Years)</label>
                    <select
                      value={newSkuForm.warranty}
                      onChange={e => setNewSkuForm({ ...newSkuForm, warranty: Number(e.target.value) })}
                    >
                      <option value={10}>10 Years Godrej Warranty</option>
                      <option value={5}>5 Years Standard</option>
                      <option value={3}>3 Years</option>
                      <option value={1}>1 Year Limited</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Commercial Financials & Pricing */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-emerald)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={13} /> 3. COMMERCIAL PRICING & MARGIN:
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', alignItems: 'end' }}>
                  <div className="form-field">
                    <label>Gross Catalog MRP (₹)</label>
                    <input
                      type="number"
                      value={newSkuForm.mrp}
                      onChange={e => setNewSkuForm({ ...newSkuForm, mrp: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Dealer Landing Cost (₹)</label>
                    <input
                      type="number"
                      value={newSkuForm.unitCost}
                      onChange={e => setNewSkuForm({ ...newSkuForm, unitCost: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Showroom Selling Rate (₹)</label>
                    <input
                      type="number"
                      value={newSkuForm.sellingPrice}
                      onChange={e => setNewSkuForm({ ...newSkuForm, sellingPrice: Number(e.target.value) })}
                      style={{ color: 'var(--accent-emerald)', fontWeight: '900' }}
                    />
                  </div>

                  <div style={{ background: '#030712', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Gross Margin:</div>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-emerald)' }}>
                      ₹{(Number(newSkuForm.sellingPrice) - Number(newSkuForm.unitCost)).toLocaleString('en-IN')}
                      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.8 }}>
                        ({newSkuForm.sellingPrice > 0 ? Math.round(((newSkuForm.sellingPrice - newSkuForm.unitCost) / newSkuForm.sellingPrice) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Warehouse Stock, Bay & Packaging */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#38BDF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={13} /> 4. WAREHOUSE STOCK, BAY & KNOCKDOWN PACKAGING:
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <div className="form-field">
                    <label>Initial Opening Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={newSkuForm.openingStock}
                      onChange={e => setNewSkuForm({ ...newSkuForm, openingStock: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Min Safety Buffer</label>
                    <input
                      type="number"
                      min="1"
                      value={newSkuForm.bufferThreshold}
                      onChange={e => setNewSkuForm({ ...newSkuForm, bufferThreshold: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Knockdown Cartons</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={newSkuForm.boxCount}
                      onChange={e => setNewSkuForm({ ...newSkuForm, boxCount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Assigned Rack / Bay</label>
                    <input
                      type="text"
                      value={newSkuForm.bay}
                      onChange={e => setNewSkuForm({ ...newSkuForm, bay: e.target.value })}
                      placeholder="e.g. Dock-A1"
                    />
                  </div>
                </div>

                {/* Safety Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#030712', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newSkuForm.isHeavy} onChange={e => setNewSkuForm({ ...newSkuForm, isHeavy: e.target.checked })} />
                    🏋️ Heavy Lift
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newSkuForm.isFragile} onChange={e => setNewSkuForm({ ...newSkuForm, isFragile: e.target.checked })} />
                    🍷 Fragile Glass
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newSkuForm.isThisSideUp} onChange={e => setNewSkuForm({ ...newSkuForm, isThisSideUp: e.target.checked })} />
                    ⬆️ This Side Up
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newSkuForm.isKeepDry} onChange={e => setNewSkuForm({ ...newSkuForm, isKeepDry: e.target.checked })} />
                    💧 Keep Dry
                  </label>
                </div>
              </div>

              {/* Real-time Barcode & QR Preview in Modal */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px', color: '#000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #000' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '900' }}>GODREJ INTERIO RAYAGADA</div>
                  <div style={{ fontSize: '13px', fontWeight: '900', marginTop: '2px' }}>
                    {newSkuForm.productName || 'New Furniture Product Name'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                    SKU: <b>{newSkuForm.sku || 'GDJ-NEW-001'}</b> • Price: <b>₹{Number(newSkuForm.sellingPrice || 0).toLocaleString()}</b> • Bay: <b>{newSkuForm.bay}</b>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <Code128Barcode 
                      value={newSkuForm.sku || 'GDJ-NEW-001'} 
                      moduleWidth={1.2} 
                      height={40} 
                      bearerBars={true} 
                      quietZone={false}
                      fontSize={10} 
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center', paddingLeft: '16px', borderLeft: '1px solid #CBD5E1' }}>
                  <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>MOBILE QR</div>
                  <DynamicQrCode 
                    value={`https://godrej-interio-rayagada.web.app/catalog/${newSkuForm.sku || 'NEW'}`} 
                    size={65} 
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
              <button
                type="button"
                className="btn-ghost-edit"
                onClick={() => setIsNewSkuModalOpen(false)}
                style={{ padding: '10px 18px', fontSize: '12px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-luxury-gold"
                onClick={handleSaveNewSku}
                style={{
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: '900',
                  boxShadow: '0 0 20px rgba(212,175,55,0.5)'
                }}
              >
                <Sparkles size={14} /> ✨ Generate Barcode & Add to Master Inventory
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

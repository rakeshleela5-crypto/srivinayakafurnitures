import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function ProductQrStudio() {
  const { catalog, setCatalog, storeMeta, showToast, openModal } = useStore();

  const [selectedSku, setSelectedSku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [printLayout, setPrintLayout] = useState('frame_sticker'); // frame_sticker | acrylic_standee | 5_box_labels | a4_24up

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

  // QR Code Engine Configuration
  const [qrDestination, setQrDestination] = useState('UPI_TOKEN'); // 'UPI_TOKEN' | 'PRODUCT_SPEC' | 'DOCK_ROUTE' | 'CUSTOM_URL'
  const [qrSize, setQrSize] = useState(160);
  const [qrColor, setQrColor] = useState('#000000'); // '#000000' | '#0F172A' | '#B45309' | '#0284C7'
  const [customUrl, setCustomUrl] = useState('https://godrejinterio.com/rayagada');

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

  // 1-Click New SKU Blank Template
  const handleNewSkuBlank = () => {
    const newSku = `GI-2026-${Math.floor(100 + Math.random() * 900)}`;
    setSelectedSku(newSku);
    setSkuCode(newSku);
    setProductName('New Luxury Teak Model 2026');
    setCategory('Living Room');
    setSubCategory('Sectional');
    setMaterial('Premium Burma Teak + High Resilience Foam');
    setDimensions('84" L × 38" D × 36" H');
    setMrp(120000);
    setSellingPrice(98000);
    setWarranty(10);
    setBoxCount(3);
    setSupplier('Godrej Manufacturing Hub, Rayagada (OD)');
    playSuccessChime();
    showToast(`✨ Created New SKU Template: ${newSku}!`);
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

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`💾 Saved SKU ${skuCode} to Master Catalog & Synced to Google Sheets!`, true);

    dispatchWebhookAction('UPDATE_CATALOG_ITEM', {
      sku: skuCode,
      product_name: productName,
      category: category,
      material: material,
      dimensions: dimensions,
      mrp: mrp,
      selling_price: sellingPrice,
      warranty: warranty,
      box_count: boxCount,
      supplier: supplier
    });
  };

  // Calculate Advance Token
  const tokenAdvance50 = Math.round(Number(sellingPrice) * 0.5);

  // Generate QR Value payload based on destination
  const getQrPayload = () => {
    switch (qrDestination) {
      case 'UPI_TOKEN':
        return `upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${tokenAdvance50}&cu=INR&tn=${encodeURIComponent(`50% Token for ${skuCode} (${productName})`)}`;
      case 'PRODUCT_SPEC':
        return `https://godrejinterio.com/products/${skuCode}?warranty=${warranty}Y&specs=${encodeURIComponent(material)}`;
      case 'DOCK_ROUTE':
        const prodHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'https://shreeganesh-godrej.web.app' : window.location.origin;
        return `${prodHost}/#inward?sku=${skuCode}&batch=GI-2026`;
      case 'CUSTOM_URL':
      default:
        return customUrl;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">📱 FURNITURE PRODUCT QR CODE GENERATION STUDIO</span>

          <button className="btn-cyan" onClick={() => openModal('csv_import')} style={{ fontWeight: '800' }}>
            📥 Bulk CSV Catalog Upload
          </button>

          <button className="btn-luxury-gold" onClick={handleNewSkuBlank}>
            <Plus size={14} /> ➕ Add New Furniture SKU
          </button>
          
          <button className="btn-emerald" onClick={handleSaveToCatalog}>
            <Save size={14} /> 💾 Save to Master Catalog & Sheets
          </button>
        </div>

        <button className="btn-cyan" onClick={handlePrint}>
          <Printer size={14} /> 🖨️ Print Physical Labels
        </button>
      </div>

      {/* Main Studio Grid: In-Place Product Editor + Live Sticker Customizer & Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Product Selector & Full In-Place Spec Editor */}
        <div className="glass-panel no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900' }}>🛋️ Master Catalog Product Customizer</h3>
            <span className="badge badge-purple">{catalog.length} SKUs LOADED</span>
          </div>

          {/* Quick SKU Selector */}
          <div className="form-field" style={{ margin: '10px 0' }}>
            <label style={{ fontWeight: '800', color: 'var(--accent-gold-light)' }}>Select Furniture Product to Customize</label>
            <select 
              value={selectedSku} 
              onChange={e => handleSelectCatalogItem(e.target.value)}
              style={{ background: '#030712', color: '#FFFFFF', border: '1.5px solid var(--accent-gold)' }}
            >
              {catalog.map(item => (
                <option key={item.SKU} value={item.SKU}>
                  {item.SKU} — {item.Product_Name} (MRP: ₹{item.MRP_INR?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Product Edit Form */}
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field">
              <label>SKU Code</label>
              <input value={skuCode} onChange={e => setSkuCode(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Product Name</label>
              <input value={productName} onChange={e => setProductName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Main Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Bedroom">Bedroom (King/Queen Beds)</option>
                <option value="Living Room">Living Room (Sofas & Recliners)</option>
                <option value="Dining & Study">Dining & Study (Marble/Wood)</option>
                <option value="Storage & Wardrobes">Storage & Wardrobes (Almirahs)</option>
                <option value="Commercial Office">Commercial Office (Workstations)</option>
              </select>
            </div>
            <div className="form-field">
              <label>Material & Wood Specification</label>
              <input value={material} onChange={e => setMaterial(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Physical Dimensions (L × W × H)</label>
              <input value={dimensions} onChange={e => setDimensions(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Godrej Warranty (Years)</label>
              <input type="number" value={warranty} onChange={e => setWarranty(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>MRP Price (₹)</label>
              <input type="number" value={mrp} onChange={e => setMrp(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Showroom Selling Price (₹)</label>
              <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Knockdown Box Count</label>
              <input type="number" value={boxCount} onChange={e => setBoxCount(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Default Factory Supplier</label>
              <input value={supplier} onChange={e => setSupplier(e.target.value)} />
            </div>
          </div>

          {/* QR Engine Configuration Box */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56,189,248,0.3)', marginTop: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>
              ⚙️ QR Code Destination & Payload Engine:
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-field">
                <label>QR Action / Target</label>
                <select value={qrDestination} onChange={e => setQrDestination(e.target.value)}>
                  <option value="UPI_TOKEN">💰 Instant 50% Token UPI QR (₹{tokenAdvance50.toLocaleString()})</option>
                  <option value="PRODUCT_SPEC">📄 Digital Spec & 10-Yr Warranty Certificate</option>
                  <option value="DOCK_ROUTE">📦 Staff Dock Inward/Outward Route</option>
                  <option value="CUSTOM_URL">🌐 Custom Website / WhatsApp Link</option>
                </select>
              </div>

              <div className="form-field">
                <label>QR Visual Color Theme</label>
                <select value={qrColor} onChange={e => setQrColor(e.target.value)}>
                  <option value="#000000">Matte Obsidian Black (Highest Contrast)</option>
                  <option value="#0F172A">Deep Navy Slate</option>
                  <option value="#B45309">Champagne Gold Luxury</option>
                  <option value="#0284C7">Godrej Cyan Blue</option>
                </select>
              </div>

              {qrDestination === 'CUSTOM_URL' && (
                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Enter Custom Destination URL</label>
                  <input value={customUrl} onChange={e => setCustomUrl(e.target.value)} />
                </div>
              )}
            </div>
          </div>

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
              { id: 'frame_sticker', label: '🏷️ Frame Sticker', desc: 'Peel & paste on wood' },
              { id: 'acrylic_standee', label: '🖼️ Standee (4"x6")', desc: 'Dining & coffee tables' },
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
            
            {/* ================= LAYOUT 1: FURNITURE FRAME STICKER ================= */}
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

            {/* ================= LAYOUT 2: SHOWROOM ACRYLIC STANDEE (4"x6") ================= */}
            {printLayout === 'acrylic_standee' && (
              <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '16px', padding: '20px', maxWidth: '340px', width: '100%', border: '2px solid var(--accent-gold)', boxShadow: '0 15px 40px rgba(0,0,0,0.9)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>
                  GODREJ INTERIO RAYAGADA
                </div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#FFFFFF', marginBottom: '4px' }}>
                  {productName}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '12px' }}>
                  {material} • {dimensions}
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '12px', display: 'inline-block', margin: '0 auto 12px auto', boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>
                  <DynamicQrCode value={getQrPayload()} size={140} fgColor={qrColor} />
                </div>

                <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '900', marginBottom: '2px' }}>
                  SCAN TO PAY ₹{tokenAdvance50.toLocaleString()} ADVANCE TOKEN
                </div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>
                  UPI: {storeMeta.upiId} • GPay / PhonePe / Paytm
                </div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '8px' }}>
                  ₹{Number(sellingPrice).toLocaleString()} <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{Number(mrp).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* ================= LAYOUT 3: 5-BOX KNOCKDOWN CARTON LABELS ================= */}
            {printLayout === '5_box_labels' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', maxHeight: '340px', overflowY: 'auto' }}>
                {Array.from({ length: boxCount }).map((_, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={letter} style={{ background: '#FFFFFF', color: '#000000', borderRadius: '8px', padding: '8px', border: '1.5px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '9px', fontWeight: '900' }}>GODREJ INTERIO</div>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#B45309' }}>BOX {letter} ({idx + 1}/{boxCount})</div>
                        <div style={{ fontSize: '8.5px', color: '#334155' }}>{skuCode}</div>
                      </div>
                      <DynamicQrCode value={`${skuCode}-BOX-${letter}`} size={55} fgColor="#000" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= LAYOUT 4: A4 24-UP ADHESIVE STICKER SHEET ================= */}
            {printLayout === 'a4_24up' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%', maxHeight: '340px', overflowY: 'auto', background: '#FFFFFF', padding: '10px', borderRadius: '8px' }}>
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', color: '#000000', borderRadius: '6px', padding: '6px', border: '1px solid #CBD5E1', display: 'flex', gap: '6px', alignItems: 'center' }}>
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

    </div>
  );
}

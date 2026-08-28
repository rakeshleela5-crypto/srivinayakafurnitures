import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Code128Barcode } from '../utils/barcode128';
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
  Activity
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function BarcodeStudio() {
  const { catalog, setCatalog, storeMeta, showToast } = useStore();

  const [selectedSku, setSelectedSku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [printLayout, setPrintLayout] = useState('pallet_label'); // pallet_label | carton_strip | thermal_50x25 | a4_24up

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

  // Code-128 Barcode Line & Laser Features
  const [moduleWidth, setModuleWidth] = useState(1.6);
  const [barHeight, setBarHeight] = useState(55);
  const [bearerBars, setBearerBars] = useState(true); // Industrial Top & Bottom Guard Lines
  const [isLaserSweeping, setIsLaserSweeping] = useState(true); // Red Laser Line Animation
  const [barcodeColor, setBarcodeColor] = useState('#000000');
  const [quietZone, setQuietZone] = useState(true);

  // Load from Catalog
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
      playScanBeep();
      showToast(`📦 Loaded Barcode SKU: ${item.SKU}`);
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
          <span className="badge badge-cyan">🏷️ GS1 CODE-128 1D BARCODE GENERATION STUDIO</span>
          
          <button 
            className={`btn-ghost-edit ${isLaserSweeping ? 'badge-rose' : ''}`}
            onClick={() => setIsLaserSweeping(!isLaserSweeping)}
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            <Activity size={13} /> {isLaserSweeping ? '🔴 Red Laser Scan Line ON' : 'Laser Line OFF'}
          </button>

          <button 
            className={`btn-ghost-edit ${bearerBars ? 'badge-gold' : ''}`}
            onClick={() => setBearerBars(!bearerBars)}
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            <ShieldCheck size={13} /> {bearerBars ? '📦 Bearer Guard Lines ON' : 'Bearer Lines OFF'}
          </button>
        </div>

        <button className="btn-cyan" onClick={handlePrint}>
          <Printer size={14} /> 🖨️ Print Barcode Labels
        </button>
      </div>

      {/* Main Studio Grid: Barcode Configurator + Live Printable Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: SKU Selector & Barcode Configuration */}
        <div className="glass-panel no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-cyan)' }}>
              ⚙️ GS1 Code-128 Barcode Line Parameters
            </h3>
            <span className="badge badge-purple">{catalog.length} SKUs</span>
          </div>

          {/* Quick SKU Selector */}
          <div className="form-field" style={{ margin: '10px 0' }}>
            <label style={{ fontWeight: '800', color: 'var(--accent-gold-light)' }}>Select Furniture Product</label>
            <select 
              value={selectedSku} 
              onChange={e => handleSelectCatalogItem(e.target.value)}
              style={{ background: '#030712', color: '#FFFFFF', border: '1.5px solid var(--accent-cyan)' }}
            >
              {catalog.map(item => (
                <option key={item.SKU} value={item.SKU}>
                  {item.SKU} — {item.Product_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Barcode Parameters Form */}
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field">
              <label>SKU / Barcode Data Value</label>
              <input value={skuCode} onChange={e => setSkuCode(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Warehouse Batch Code</label>
              <input value={batchNo} onChange={e => setBatchNo(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Product Name</label>
              <input value={productName} onChange={e => setProductName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Material Spec</label>
              <input value={material} onChange={e => setMaterial(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Selling Rate (₹)</label>
              <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Total Knockdown Boxes</label>
              <input type="number" value={boxCount} onChange={e => setBoxCount(Number(e.target.value))} />
            </div>
          </div>

          {/* Laser Scanner Barcode Styling Controls */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56,189,248,0.3)', marginTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>
              🎛️ Code-128 Line Multipliers & Industrial Features:
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-field">
                <label>Bar Height ({barHeight}px)</label>
                <input type="range" min="35" max="85" value={barHeight} onChange={e => setBarHeight(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Bar Line Thickness ({moduleWidth}px)</label>
                <input type="range" min="1.1" max="2.6" step="0.1" value={moduleWidth} onChange={e => setModuleWidth(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Industrial Bearer Guard Lines</label>
                <select value={bearerBars ? 'YES' : 'NO'} onChange={e => setBearerBars(e.target.value === 'YES')}>
                  <option value="YES">Top & Bottom Heavy Guard Lines (Corrugated Boxes)</option>
                  <option value="NO">Standard Flush Edges</option>
                </select>
              </div>
              <div className="form-field">
                <label>Quiet Zone Margin (10-Module)</label>
                <select value={quietZone ? 'YES' : 'NO'} onChange={e => setQuietZone(e.target.value === 'YES')}>
                  <option value="YES">Enabled (Standard GS1 Compliance)</option>
                  <option value="NO">Tight Padding</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Print Layouts & Live Preview */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900' }}>🖨️ Physical 1D Barcode Formats</h3>
            <span className="badge badge-emerald">LASER GUN READY</span>
          </div>

          {/* Layout Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '12px 0' }}>
            {[
              { id: 'pallet_label', label: '📦 Pallet Label', desc: 'Warehouse master' },
              { id: 'carton_strip', label: '🏷️ Carton Strips', desc: 'Component boxes' },
              { id: 'thermal_50x25', label: '🖨️ Thermal (50x25)', desc: 'Handheld printer' },
              { id: 'a4_24up', label: '📄 A4 24-Up Sheet', desc: 'Laser sticker paper' }
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
          <div className="printable-area" style={{ background: '#030712', borderRadius: '16px', padding: '16px', border: '1.5px solid rgba(56,189,248,0.3)', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            
            {/* ================= LAYOUT 1: WAREHOUSE PALLET LABEL ================= */}
            {printLayout === 'pallet_label' && (
              <div style={{ position: 'relative', background: '#FFFFFF', color: '#000000', borderRadius: '12px', padding: '16px', maxWidth: '380px', width: '100%', border: '2.5px solid #000', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                
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
                  <div style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '0.5px' }}>GODREJ INTERIO RAYAGADA</div>
                  <div style={{ fontWeight: '800', fontSize: '10px', background: '#000', color: '#FFF', padding: '2px 6px', borderRadius: '3px' }}>BATCH: {batchNo}</div>
                </div>

                <div style={{ fontSize: '14px', fontWeight: '900', marginBottom: '2px' }}>{productName}</div>
                <div style={{ fontSize: '10px', color: '#334155', marginBottom: '8px' }}>
                  <b>SKU:</b> {skuCode} • <b>Boxes:</b> {boxCount} Cartons • <b>Spec:</b> {material}
                </div>

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

            {/* ================= LAYOUT 2: CARTON STRIPS ================= */}
            {printLayout === 'carton_strip' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxHeight: '320px', overflowY: 'auto' }}>
                {Array.from({ length: boxCount }).map((_, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={letter} style={{ background: '#FFFFFF', color: '#000000', borderRadius: '8px', padding: '8px 12px', border: '1.5px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '900' }}>GODREJ • BOX {letter} ({idx + 1}/{boxCount})</div>
                        <div style={{ fontSize: '9px', color: '#334155' }}>{skuCode}</div>
                      </div>
                      <Code128Barcode 
                        value={`${skuCode}-BOX-${letter}`} 
                        moduleWidth={1.2} 
                        height={36} 
                        bearerBars={bearerBars} 
                        quietZone={false}
                        fontSize={9} 
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= LAYOUT 3: THERMAL 50x25 LABEL ================= */}
            {printLayout === 'thermal_50x25' && (
              <div style={{ background: '#FFFFFF', color: '#000000', borderRadius: '6px', padding: '10px 14px', width: '230px', border: '1.5px solid #000', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.6)' }}>
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

            {/* ================= LAYOUT 4: A4 24-UP ADHESIVE SHEET ================= */}
            {printLayout === 'a4_24up' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%', maxHeight: '320px', overflowY: 'auto', background: '#FFFFFF', padding: '10px', borderRadius: '8px' }}>
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', color: '#000000', borderRadius: '6px', padding: '6px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
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

          </div>

          {/* Action Footer */}
          <div className="no-print" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn-cyan" onClick={handlePrint} style={{ flex: 1, justifyContent: 'center', padding: '12px', fontWeight: '900' }}>
              <Printer size={16} /> 🖨️ 1-Click Print Barcodes
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

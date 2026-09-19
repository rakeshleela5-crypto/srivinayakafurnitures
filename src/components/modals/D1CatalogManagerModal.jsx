import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Plus, 
  Terminal, 
  Check, 
  Copy, 
  Sparkles, 
  Database, 
  Layers, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { 
  parseCatalogCsv, 
  importD1CatalogBatch, 
  createD1CatalogModel 
} from '../../services/d1DatabaseService';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export function D1CatalogManagerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { catalog, setCatalog, showToast } = useStore();
  const [activeTab, setActiveTab] = useState('METHOD_1'); // 'METHOD_1' | 'METHOD_3' | 'METHOD_2'
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Method 1 (CSV Drag-and-Drop) States
  const [parsedPreview, setParsedPreview] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Method 3 (Single Add) States
  const [singleForm, setSingleForm] = useState({
    sku: '',
    product_name: '',
    category: 'Bedroom',
    mrp_inr: 85000,
    selling_price_inr: 68000,
    warehouse_qty: 3,
    floor_qty: 1,
    finish: '100% Solid CP Teak Wood',
    dimensions: '78 x 72 x 48 in',
    warranty_years: 10
  });

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    playScanBeep();

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        const items = parseCatalogCsv(text);
        if (items.length > 0) {
          setParsedPreview(items);
          playSuccessChime();
          showToast(`📁 Parsed ${items.length} items from ${file.name}. Review below and sync!`, true);
        } else {
          showToast("⚠️ Could not parse any valid rows. Please check CSV format.", false);
        }
      }
    };
    reader.readAsText(file);
  };

  // Submit Batch to D1
  const handleCommitBatch = async () => {
    if (parsedPreview.length === 0) return;
    setIsProcessing(true);
    playScanBeep();

    try {
      const result = await importD1CatalogBatch(parsedPreview);
      // Update local state in OmniBuild OS
      if (setCatalog) {
        setCatalog(prev => {
          const skuSet = new Set(parsedPreview.map(p => p.SKU));
          const filtered = prev.filter(item => !skuSet.has(item.SKU));
          return [...parsedPreview, ...filtered];
        });
      }
      triggerGoldenConfetti();
      playSuccessChime();
      showToast(`🎉 ${parsedPreview.length} models synced to Cloudflare D1 & OmniBuild OS!`, true);
      setParsedPreview([]);
      setFileName('');
      onClose();
    } catch (err) {
      showToast(`❌ Error syncing to D1: ${err.message}`, false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Single Model to D1
  const handleCommitSingle = async (e) => {
    e.preventDefault();
    if (!singleForm.sku || !singleForm.product_name) {
      showToast("⚠️ SKU and Product Name are required.", false);
      return;
    }
    setIsProcessing(true);
    playScanBeep();

    try {
      await createD1CatalogModel(singleForm);
      const newModel = {
        SKU: singleForm.sku.toUpperCase(),
        Product_Name: singleForm.product_name,
        Main_Category: singleForm.category,
        MRP_INR: Number(singleForm.mrp_inr),
        Selling_Price_INR: Number(singleForm.selling_price_inr),
        Warehouse_Qty: Number(singleForm.warehouse_qty),
        Floor_Qty: Number(singleForm.floor_qty),
        Material_Spec: singleForm.finish,
        Dimensions: singleForm.dimensions,
        Warranty_Years: Number(singleForm.warranty_years)
      };

      if (setCatalog) {
        setCatalog(prev => [newModel, ...prev.filter(c => c.SKU !== newModel.SKU)]);
      }

      playSuccessChime();
      triggerGoldenConfetti();
      showToast(`✨ Model #${newModel.SKU} saved to Cloudflare D1!`, true);
      onClose();
    } catch (err) {
      showToast(`❌ Failed to save model: ${err.message}`, false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Sample Template
  const handleDownloadSample = () => {
    const csvContent = `SKU,Product_Name,Main_Category,MRP_INR,Selling_Price_INR,Warehouse_Qty,Material_Spec,Dimensions,Warranty_Years
BED-MOD-101,Kalista Luxury King Bed Hydraulic,Bedroom,125000,99890,4,Kiln-Dried CP Teak,78x72x48 in,10
SOF-REC-202,Centuro Dual Motor Power Recliner,Living Room,145000,116000,2,German Actuator Microfiber,84x38x40 in,5
ALM-SLM-303,Slimline 3-Door Wardrobe Royal Burgundy,Steel Storage,68000,54400,6,Tata CRCA Steel,78x54x21 in,10
KIT-MOD-404,Modular Kitchen 710 Marine Ply (Rft),Modular Kitchen,4500,3600,20,IS 710 BWP Marine,Custom Rft,15`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_godrej_catalog_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const wranglerCmd = `npx wrangler d1 execute srivinayaka-db --file=./catalog_seed.sql`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #0F172A 50%, #1E1B4B 100%)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '880px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #D4AF37, #B45309)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
            }}>
              <Database size={20} color="#000000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                  Cloudflare D1 Catalog Importer Hub
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '9px' }}>3 Ingestion Modes</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                Easily import & sync Godrej Interio models into Cloudflare D1 Edge SQL Database
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('METHOD_1')}
              style={{
                background: activeTab === 'METHOD_1' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'METHOD_1' ? '#000000' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              📁 Method 1: Excel / CSV
            </button>
            <button
              onClick={() => setActiveTab('METHOD_3')}
              style={{
                background: activeTab === 'METHOD_3' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'METHOD_3' ? '#000000' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ➕ Method 3: Single Model
            </button>
            <button
              onClick={() => setActiveTab('METHOD_2')}
              style={{
                background: activeTab === 'METHOD_2' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'METHOD_2' ? '#000000' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ⚡ Method 2: Bulk SQL
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', marginLeft: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* ========================================================================= */}
          {/* METHOD 1: CSV / EXCEL DRAG & DROP IMPORTER */}
          {/* ========================================================================= */}
          {activeTab === 'METHOD_1' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  Upload your factory price sheet or custom catalog file. All columns map automatically to Cloudflare D1.
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--accent-gold-light)',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Download size={12} /> Download Sample CSV Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(212, 175, 55, 0.4)',
                  borderRadius: '12px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <UploadCloud size={32} color="var(--accent-gold)" />
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FFFFFF' }}>
                  {fileName ? `Selected: ${fileName}` : 'Click to Browse or Drag & Drop Godrej Catalog CSV File'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Supports .csv, .txt formats • Auto-detects SKU, Name, MRP, Selling Price, and Stock
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>

              {/* Preview Table */}
              {parsedPreview.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#34D399' }}>
                      ✓ {parsedPreview.length} Models Parsed and Ready to Sync
                    </div>
                    <button
                      onClick={handleCommitBatch}
                      disabled={isProcessing}
                      className="btn-luxury-gold"
                      style={{ fontSize: '11px', padding: '6px 16px' }}
                    >
                      {isProcessing ? 'Syncing...' : `🚀 Commit ${parsedPreview.length} Items to D1 Database`}
                    </button>
                  </div>

                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    <table className="luxury-table" style={{ fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Model Name</th>
                          <th>Category</th>
                          <th>MRP (₹)</th>
                          <th>Selling (₹)</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedPreview.slice(0, 10).map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>{row.SKU}</td>
                            <td style={{ fontWeight: 'bold' }}>{row.Product_Name}</td>
                            <td>{row.Main_Category}</td>
                            <td>₹{row.MRP_INR.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--accent-gold)' }}>₹{row.Selling_Price_INR.toLocaleString('en-IN')}</td>
                            <td>{row.Warehouse_Qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedPreview.length > 10 && (
                      <div style={{ padding: '6px 12px', fontSize: '10px', color: '#94A3B8', textAlign: 'center' }}>
                        + {parsedPreview.length - 10} more items will be inserted...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 3: SINGLE MODEL QUICK ADD */}
          {/* ========================================================================= */}
          {activeTab === 'METHOD_3' && (
            <form onSubmit={handleCommitSingle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>SKU / ITEM CODE *</label>
                  <input
                    type="text"
                    required
                    value={singleForm.sku}
                    onChange={e => setSingleForm({ ...singleForm, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. BED-MOD-015"
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>PRODUCT NAME / DESCRIPTION *</label>
                  <input
                    type="text"
                    required
                    value={singleForm.product_name}
                    onChange={e => setSingleForm({ ...singleForm, product_name: e.target.value })}
                    placeholder="e.g. Godrej Centuro Motorized Recliner"
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>MAIN CATEGORY</label>
                  <select
                    value={singleForm.category}
                    onChange={e => setSingleForm({ ...singleForm, category: e.target.value })}
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px' }}
                  >
                    <option value="Bedroom">Bedroom Suites</option>
                    <option value="Living Room">Living Room & Recliners</option>
                    <option value="Steel Storage">Steel Storage & Almirahs</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Modular Kitchen">Modular Kitchen</option>
                    <option value="Mattresses">Orthopedic Mattresses</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={singleForm.mrp_inr}
                    onChange={e => setSingleForm({ ...singleForm, mrp_inr: Number(e.target.value) })}
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>FESTIVE SELLING PRICE (₹) *</label>
                  <input
                    type="number"
                    required
                    value={singleForm.selling_price_inr}
                    onChange={e => setSingleForm({ ...singleForm, selling_price_inr: Number(e.target.value) })}
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>WAREHOUSE QTY</label>
                  <input
                    type="number"
                    value={singleForm.warehouse_qty}
                    onChange={e => setSingleForm({ ...singleForm, warehouse_qty: Number(e.target.value) })}
                    style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>FINISH & MATERIAL SPEC</label>
                <input
                  type="text"
                  value={singleForm.finish}
                  onChange={e => setSingleForm({ ...singleForm, finish: e.target.value })}
                  placeholder="e.g. Tata CRCA Steel, Royal Burgundy Powder Coating"
                  style={{ width: '100%', background: '#0B132B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#CBD5E1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-luxury-gold"
                  style={{ fontSize: '12px', padding: '6px 20px' }}
                >
                  {isProcessing ? 'Saving...' : '💾 Save Model to Cloudflare D1'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* METHOD 2: BULK SQL SEED */}
          {/* ========================================================================= */}
          {activeTab === 'METHOD_2' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.6' }}>
                For the initial 1-time setup, we have compiled all <strong>137 existing Godrej furniture models</strong> from your code into an atomic SQL file: <code style={{ color: 'var(--accent-gold)' }}>catalog_seed.sql</code>.
              </div>

              <div style={{ background: '#070B14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={13} color="var(--accent-cyan)" /> 1-COMMAND MIGRATION:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wranglerCmd);
                      setCopiedCmd(true);
                      setTimeout(() => setCopiedCmd(false), 2000);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFF',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedCmd ? <Check size={11} color="#34D399" /> : <Copy size={11} />}
                    {copiedCmd ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <code style={{ fontSize: '12px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
                  {wranglerCmd}
                </code>
              </div>

              <div style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                💡 <strong>What this does:</strong> Connects to your Cloudflare account and executes 137 batch SQL <code>INSERT OR REPLACE</code> statements in 1 second. All categories, prices, finishes, and specs are populated instantly.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            ⚡ <strong>Cloudflare D1 Engine:</strong> Sub-10ms edge execution • Zero spreadsheet quota limits.
          </div>
          <button
            onClick={onClose}
            className="btn-ghost-edit"
            style={{ fontSize: '11px', padding: '5px 16px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

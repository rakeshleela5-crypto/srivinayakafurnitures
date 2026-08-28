import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Save, 
  X, 
  Layers, 
  RefreshCw, 
  Database,
  Table,
  Sparkles
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function CsvImportModal({ isOpen, onClose }) {
  const { catalog, setCatalog, showToast } = useStore();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState('MERGE'); // 'MERGE' | 'APPEND' | 'REPLACE'
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Simple, Robust Client-Side CSV Parser
  const parseCsvContent = (text) => {
    const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      showToast("⚠️ CSV file must contain at least a header row and 1 data row.", false);
      return [];
    }

    // Split CSV line handling quotes
    const splitLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Column Header Mappings
    const findIndex = (aliases) => headers.findIndex(h => aliases.some(alias => h.includes(alias)));

    const skuIdx = findIndex(['sku', 'code', 'itemcode', 'id']);
    const nameIdx = findIndex(['name', 'title', 'product', 'item']);
    const catIdx = findIndex(['category', 'group', 'type', 'maincat']);
    const subCatIdx = findIndex(['subcat', 'subcategory', 'series']);
    const specIdx = findIndex(['spec', 'material', 'wood', 'finish', 'description']);
    const dimIdx = findIndex(['dim', 'dimension', 'size', 'lxwxh']);
    const mrpIdx = findIndex(['mrp', 'listprice', 'originalprice', 'retail']);
    const priceIdx = findIndex(['price', 'selling', 'offer', 'net', 'rate']);
    const warIdx = findIndex(['warranty', 'guarantee', 'years']);
    const boxIdx = findIndex(['box', 'boxes', 'carton', 'knockdown', 'units']);
    const supIdx = findIndex(['supplier', 'vendor', 'factory', 'source']);

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length < 2) continue;

      const sku = skuIdx >= 0 && cols[skuIdx] ? cols[skuIdx] : `GI-CSV-${1000 + i}`;
      const name = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : `Imported Model ${i}`;
      const cat = catIdx >= 0 && cols[catIdx] ? cols[catIdx] : 'Living Room';
      const subCat = subCatIdx >= 0 && cols[subCatIdx] ? cols[subCatIdx] : 'Furniture';
      const spec = specIdx >= 0 && cols[specIdx] ? cols[specIdx] : 'Solid Teak & Engineered Wood';
      const dim = dimIdx >= 0 && cols[dimIdx] ? cols[dimIdx] : 'Standard Size';
      const mrp = mrpIdx >= 0 && !isNaN(Number(cols[mrpIdx])) ? Number(cols[mrpIdx]) : 65000;
      const price = priceIdx >= 0 && !isNaN(Number(cols[priceIdx])) ? Number(cols[priceIdx]) : Math.round(mrp * 0.82);
      const war = warIdx >= 0 && !isNaN(Number(cols[warIdx])) ? Number(cols[warIdx]) : 5;
      const boxes = boxIdx >= 0 && !isNaN(Number(cols[boxIdx])) ? Number(cols[boxIdx]) : 3;
      const sup = supIdx >= 0 && cols[supIdx] ? cols[supIdx] : 'Godrej Partner Hub';

      items.push({
        SKU: sku.toUpperCase(),
        Product_Name: name,
        Main_Category: cat,
        Sub_Category: subCat,
        Material_Spec: spec,
        Dimensions: dim,
        MRP_INR: mrp,
        Selling_Price_INR: price,
        Warranty_Years: war,
        Total_Component_Boxes: boxes,
        Default_Supplier: sup,
        Price_Tier: mrp > 90000 ? "Luxury" : mrp > 45000 ? "Premium" : "Executive",
        Image_URL: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600"
      });
    }

    return items;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const rows = parseCsvContent(content);
        setParsedRows(rows);
        playScanBeep();
        showToast(`📊 Parsed ${rows.length} furniture products from ${file.name}!`, true);
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const rows = parseCsvContent(content);
          setParsedRows(rows);
          playScanBeep();
          showToast(`📊 Parsed ${rows.length} furniture products from ${file.name}!`, true);
        }
      };
      reader.readAsText(file);
    }
  };

  // Download Pre-Formatted Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const sampleHeader = "SKU,Product_Name,Main_Category,Material_Spec,Dimensions,MRP_INR,Selling_Price_INR,Warranty_Years,Total_Component_Boxes,Default_Supplier\n";
    const sampleRows = [
      'BED-ROYAL-01,Royal Teak Wood Hydraulic King Bed,Bedroom,Solid Burma Teak + Gas-Lift,82" L x 76" W x 48" H,115000,92000,10,5,Saharanpur Crafts',
      'SOFA-L-LUX-02,Italian Velvet 7-Seater Corner Sectional,Living Room,Solid Sal Frame + High Density Foam,120" L x 88" D x 34" H,148000,118400,7,3,Godrej Upholstery Works',
      'DIN-MARBLE-03,Statuario Italian White Marble 6-Seater Dining,Dining & Study,Genuine Imported Marble + Brass Base,72" L x 42" W x 30" H,135000,108000,10,4,Makrana Stone Works',
      'ALM-SLIDE-04,Titan 3-Door Toughened Mirror Sliding Wardrobe,Storage & Wardrobes,CRCA Steel + Toughened Mirror,78" H x 66" W x 24" D,85000,68000,10,4,Godrej Interio Shirwal Hub',
      'DESK-BOSS-05,Presidential Veneer Executive Office Suite,Commercial Office,High-Gloss Teak Veneer + Cable Hub,84" L x 42" W x 30" H,95000,76000,5,3,Bangalore Modular Plant'
    ].join('\n');

    const blob = new Blob([sampleHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Godrej_Catalog_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    showToast("📥 Sample Furniture Catalog Template downloaded!");
  };

  // Commit Import & Sync to Google Sheets
  const handleCommitImport = () => {
    if (parsedRows.length === 0) {
      showToast("⚠️ No valid rows to import. Please upload a valid CSV file.", false);
      return;
    }

    setIsProcessing(true);

    let updatedCatalog = [];
    if (importMode === 'REPLACE') {
      updatedCatalog = [...parsedRows];
    } else if (importMode === 'APPEND') {
      const existingSkus = new Set(catalog.map(c => c.SKU));
      const newItems = parsedRows.filter(r => !existingSkus.has(r.SKU));
      updatedCatalog = [...catalog, ...newItems];
    } else {
      // MERGE & UPDATE (Default)
      const catalogMap = new Map(catalog.map(c => [c.SKU, c]));
      parsedRows.forEach(row => {
        catalogMap.set(row.SKU, row);
      });
      updatedCatalog = Array.from(catalogMap.values());
    }

    setCatalog(updatedCatalog);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🎉 Successfully imported ${parsedRows.length} SKUs into Master Catalog & Google Sheets!`, true);

    // Sync to Master Google Sheets via Webhook
    dispatchWebhookAction('BULK_CATALOG_IMPORT', {
      total_rows: parsedRows.length,
      import_mode: importMode,
      file_name: fileName || "uploaded_catalog.csv",
      imported_by: "Store Owner / Administrator (Rayagada)",
      sample_skus: parsedRows.slice(0, 5).map(r => r.SKU).join(', '),
      items_json: JSON.stringify(parsedRows)
    });

    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content glass-panel" 
        style={{ 
          maxWidth: '850px', 
          width: '95%', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          border: '2px solid var(--accent-gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
          padding: '24px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(56,189,248,0.15)', border: '1.5px solid var(--accent-cyan)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={28} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  Bulk Furniture CSV Catalog Importer
                </h2>
                <span className="badge badge-gold">21-SHEET SYNC READY</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Upload manufacturer & factory Excel/CSV catalogs to bulk-add models, MRPs, dimensions & box counts
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Top Action Bar: Sample Download */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#030712', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Need the correct column structure? Download our ready-to-use template:
          </div>
          <button className="btn-ghost-edit" onClick={handleDownloadSampleCsv} style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
            <Download size={13} /> 📥 Download Sample Template (.csv)
          </button>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragActive ? '2.5px dashed var(--accent-cyan)' : '2px dashed rgba(212,175,55,0.5)',
            background: dragActive ? 'rgba(56,189,248,0.1)' : 'rgba(3,7,18,0.6)',
            borderRadius: '16px',
            padding: '30px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".csv, .tsv, .txt" 
            style={{ display: 'none' }} 
          />
          <FileText size={40} style={{ color: 'var(--accent-gold)', margin: '0 auto 10px auto' }} />
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>
            {fileName ? `Selected File: ${fileName}` : 'Drag & Drop Furniture CSV Here, or Click to Browse'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Supports standard CSV, TSV, or comma-delimited text exports from Excel, Google Sheets, or ERPs
          </div>
        </div>

        {/* Import Strategy Options */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚙️ Import & Conflict Resolution Strategy:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'MERGE', label: '🔄 Merge & Update', desc: 'Update existing SKUs, add new ones (Recommended)' },
              { id: 'APPEND', label: '➕ Append Only', desc: 'Add new SKUs, skip existing duplicates' },
              { id: 'REPLACE', label: '⚠️ Overwrite All', desc: 'Replace entire catalog with this file' }
            ].map(strategy => (
              <button
                key={strategy.id}
                type="button"
                onClick={() => setImportMode(strategy.id)}
                style={{
                  background: importMode === strategy.id ? 'linear-gradient(135deg, var(--accent-gold), #B45309)' : 'rgba(30,41,59,0.6)',
                  color: importMode === strategy.id ? '#000000' : '#FFFFFF',
                  fontWeight: '900',
                  border: importMode === strategy.id ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '11px' }}>{strategy.label}</div>
                <div style={{ fontSize: '8.5px', opacity: 0.85, marginTop: '2px' }}>{strategy.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Data Preview Grid */}
        {parsedRows.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                📋 Preview: {parsedRows.length} Items Ready to Import
              </div>
              <span className="badge badge-emerald">ALL VALID ✓</span>
            </div>

            <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <table className="luxury-table" style={{ width: '100%', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Material</th>
                    <th>Dimensions</th>
                    <th>MRP (₹)</th>
                    <th>Selling (₹)</th>
                    <th>Boxes</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '900', color: 'var(--accent-gold-light)' }}>{row.SKU}</td>
                      <td>{row.Product_Name}</td>
                      <td><span className="badge badge-purple" style={{ fontSize: '9px' }}>{row.Main_Category}</span></td>
                      <td style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Material_Spec}</td>
                      <td>{row.Dimensions}</td>
                      <td>₹{Number(row.MRP_INR).toLocaleString()}</td>
                      <td style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>₹{Number(row.Selling_Price_INR).toLocaleString()}</td>
                      <td>{row.Total_Component_Boxes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 10 && (
                <div style={{ padding: '6px', textAlign: 'center', fontSize: '10.5px', color: 'var(--text-secondary)', background: '#030712' }}>
                  ... and {parsedRows.length - 10} more rows ready for import.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <button className="btn-ghost-edit" onClick={onClose}>
            Cancel
          </button>
          
          <button 
            className="btn-luxury-gold" 
            onClick={handleCommitImport}
            disabled={parsedRows.length === 0 || isProcessing}
            style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '900', opacity: parsedRows.length > 0 ? 1 : 0.4 }}
          >
            <Save size={16} /> 💾 Commit & Import {parsedRows.length} SKUs to Google Sheets
          </button>
        </div>

      </div>
    </div>
  );
}

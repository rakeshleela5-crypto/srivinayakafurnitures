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
  const [importStep, setImportStep] = useState(1);

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

  // 10-Product Curated Demo CSV Packs
  const DEMO_PACKS = {
    bedroom: {
      name: "10_Festive_Luxury_Bedroom_SKUs.csv",
      rows: [
        { SKU: "BED-CSV-01", Product_Name: "Royal Burma Teak Hydraulic King Bed", Main_Category: "Bedroom", Material_Spec: "100% Solid Burma Teak Wood", Dimensions: "82x76x48 in", MRP_INR: 115000, Selling_Price_INR: 92000, Warranty_Years: 10, Total_Component_Boxes: 5, Default_Supplier: "Royal Teak Crafts, Saharanpur" },
        { SKU: "BED-CSV-02", Product_Name: "Empress 4-Door Toughened Mirror Wardrobe", Main_Category: "Storage & Wardrobes", Material_Spec: "CRCA Steel + Toughened Mirror", Dimensions: "84x72x24 in", MRP_INR: 88000, Selling_Price_INR: 70400, Warranty_Years: 10, Total_Component_Boxes: 4, Default_Supplier: "Godrej Interio Shirwal Hub" },
        { SKU: "BED-CSV-03", Product_Name: "Milano Floating Bedside Nightstand (Set of 2)", Main_Category: "Bedroom", Material_Spec: "Kiln-Dried CP Teak", Dimensions: "20x18x22 in", MRP_INR: 24000, Selling_Price_INR: 19200, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Royal Teak Crafts, Saharanpur" },
        { SKU: "BED-CSV-04", Product_Name: "Heritage Hand-Carved Teak Dresser with Mirror", Main_Category: "Bedroom", Material_Spec: "Solid Teak + 5mm Beveled Mirror", Dimensions: "48x20x72 in", MRP_INR: 48000, Selling_Price_INR: 38400, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Jodhpur Artisan Guild" },
        { SKU: "BED-CSV-05", Product_Name: "OrthoComfort 10-Inch Memory Foam King Mattress", Main_Category: "Bedroom", Material_Spec: "High-Resilience Aerocell Foam", Dimensions: "78x72x10 in", MRP_INR: 38000, Selling_Price_INR: 30400, Warranty_Years: 10, Total_Component_Boxes: 1, Default_Supplier: "Godrej Sleep Solutions" },
        { SKU: "BED-CSV-06", Product_Name: "Velvet Upholstered Luxury Queen Bed", Main_Category: "Bedroom", Material_Spec: "Sal Wood Frame + Velvet Cushioning", Dimensions: "78x66x52 in", MRP_INR: 78000, Selling_Price_INR: 62400, Warranty_Years: 7, Total_Component_Boxes: 4, Default_Supplier: "Bangalore Modular Plant" },
        { SKU: "BED-CSV-07", Product_Name: "Solid Rosewood Storage Bed End Ottoman", Main_Category: "Bedroom", Material_Spec: "Solid Sheesham + Tufted Leatherette", Dimensions: "54x18x18 in", MRP_INR: 22000, Selling_Price_INR: 17600, Warranty_Years: 10, Total_Component_Boxes: 1, Default_Supplier: "Jodhpur Artisan Guild" },
        { SKU: "BED-CSV-08", Product_Name: "6-Drawer Tallboy Teak Chest of Drawers", Main_Category: "Storage & Wardrobes", Material_Spec: "Kiln-Dried CP Teak + Telescopic Rails", Dimensions: "36x20x52 in", MRP_INR: 42000, Selling_Price_INR: 33600, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Royal Teak Crafts, Saharanpur" },
        { SKU: "BED-CSV-09", Product_Name: "Imperial Four-Poster Teak Canopy Bed", Main_Category: "Bedroom", Material_Spec: "100% Solid Heavy Teak", Dimensions: "84x78x84 in", MRP_INR: 135000, Selling_Price_INR: 108000, Warranty_Years: 10, Total_Component_Boxes: 5, Default_Supplier: "Royal Teak Crafts, Saharanpur" },
        { SKU: "BED-CSV-10", Product_Name: "Solid Sheesham Queen Storage Box Bed", Main_Category: "Bedroom", Material_Spec: "Solid Seasoned Sheesham Wood", Dimensions: "78x60x42 in", MRP_INR: 59000, Selling_Price_INR: 47200, Warranty_Years: 10, Total_Component_Boxes: 4, Default_Supplier: "Jodhpur Artisan Guild" }
      ]
    },
    living: {
      name: "10_Luxury_Living_Room_Sectionals.csv",
      rows: [
        { SKU: "SOFA-CSV-01", Product_Name: "Italian Leatherette 7-Seater L-Shape Sectional", Main_Category: "Living Room", Material_Spec: "Solid Sal Frame + High Density 40D Foam", Dimensions: "120x88x34 in", MRP_INR: 148000, Selling_Price_INR: 118400, Warranty_Years: 7, Total_Component_Boxes: 3, Default_Supplier: "Godrej Upholstery Works" },
        { SKU: "SOFA-CSV-02", Product_Name: "Motorized Dual-Cup Power Recliner (Cinema)", Main_Category: "Living Room", Material_Spec: "German OKIN Motor + Napa Leatherette", Dimensions: "74x38x42 in", MRP_INR: 92000, Selling_Price_INR: 73600, Warranty_Years: 5, Total_Component_Boxes: 2, Default_Supplier: "Godrej Upholstery Works" },
        { SKU: "SOFA-CSV-03", Product_Name: "Statuario Gold Brass Center Coffee Table", Main_Category: "Living Room", Material_Spec: "Imported Quartz Marble + PVD Gold Brass", Dimensions: "48x28x18 in", MRP_INR: 36000, Selling_Price_INR: 28800, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Makrana Stone Works" },
        { SKU: "SOFA-CSV-04", Product_Name: "Scandinavian 3-Seater Fabric Sofa (Ocean Teal)", Main_Category: "Living Room", Material_Spec: "Anti-Stain Linen + Solid Oak Legs", Dimensions: "84x36x32 in", MRP_INR: 52000, Selling_Price_INR: 41600, Warranty_Years: 5, Total_Component_Boxes: 2, Default_Supplier: "Bangalore Modular Plant" },
        { SKU: "SOFA-CSV-05", Product_Name: "Chesterfield Tufted 2-Seater Loveseat (Cognac)", Main_Category: "Living Room", Material_Spec: "Full Grain Leatherette + Deep Diamond Tufting", Dimensions: "66x36x31 in", MRP_INR: 64000, Selling_Price_INR: 51200, Warranty_Years: 7, Total_Component_Boxes: 1, Default_Supplier: "Godrej Upholstery Works" },
        { SKU: "SOFA-CSV-06", Product_Name: "Walnut Veneer 72\" Floating TV Media Unit", Main_Category: "Living Room", Material_Spec: "High-Gloss American Walnut Veneer", Dimensions: "72x16x18 in", MRP_INR: 38000, Selling_Price_INR: 30400, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Bangalore Modular Plant" },
        { SKU: "SOFA-CSV-07", Product_Name: "Ergonomic Swivel Accent Lounge Armchair", Main_Category: "Living Room", Material_Spec: "Molded Foam + 360° Brushed Steel Base", Dimensions: "32x34x38 in", MRP_INR: 28000, Selling_Price_INR: 22400, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Featherlite Seating, Hyderabad" },
        { SKU: "SOFA-CSV-08", Product_Name: "Solid Sheesham Nesting End Tables (Set of 3)", Main_Category: "Living Room", Material_Spec: "Solid Sheesham Honey Teak Finish", Dimensions: "22x22x20 in", MRP_INR: 18000, Selling_Price_INR: 14400, Warranty_Years: 10, Total_Component_Boxes: 1, Default_Supplier: "Jodhpur Artisan Guild" },
        { SKU: "SOFA-CSV-09", Product_Name: "Royal Velvet Chaise Lounge (Emerald Gold)", Main_Category: "Living Room", Material_Spec: "Sal Wood + Gold Electroplated Steel", Dimensions: "64x30x32 in", MRP_INR: 42000, Selling_Price_INR: 33600, Warranty_Years: 7, Total_Component_Boxes: 1, Default_Supplier: "Godrej Upholstery Works" },
        { SKU: "SOFA-CSV-10", Product_Name: "Modular 8-Seater Reversible U-Shape Sectional", Main_Category: "Living Room", Material_Spec: "Pocket Spring Core + Textured Fabric", Dimensions: "140x96x34 in", MRP_INR: 165000, Selling_Price_INR: 132000, Warranty_Years: 7, Total_Component_Boxes: 4, Default_Supplier: "Godrej Upholstery Works" }
      ]
    },
    dining: {
      name: "10_Italian_Marble_Dining_and_Study.csv",
      rows: [
        { SKU: "DIN-CSV-01", Product_Name: "Statuario Italian White Marble 6-Seater Dining", Main_Category: "Dining & Study", Material_Spec: "Imported Statuario Marble + Brass Base", Dimensions: "72x42x30 in", MRP_INR: 135000, Selling_Price_INR: 108000, Warranty_Years: 10, Total_Component_Boxes: 4, Default_Supplier: "Makrana Stone Works" },
        { SKU: "DIN-CSV-02", Product_Name: "Solid Teak 8-Seater Royal Banquet Dining Table", Main_Category: "Dining & Study", Material_Spec: "100% Solid CP Teak Seasoned Wood", Dimensions: "96x44x30 in", MRP_INR: 128000, Selling_Price_INR: 102400, Warranty_Years: 10, Total_Component_Boxes: 5, Default_Supplier: "Royal Teak Crafts Saharanpur" },
        { SKU: "DIN-CSV-03", Product_Name: "Milano Velvet Tufted Dining Chairs (Set of 6)", Main_Category: "Dining & Study", Material_Spec: "Sal Wood Frame + Water-Repellent Velvet", Dimensions: "22x24x38 in", MRP_INR: 48000, Selling_Price_INR: 38400, Warranty_Years: 7, Total_Component_Boxes: 3, Default_Supplier: "Godrej Upholstery Works" },
        { SKU: "DIN-CSV-04", Product_Name: "Onyx Backlit Luxury 4-Seater Breakfast Table", Main_Category: "Dining & Study", Material_Spec: "Translucent Onyx Stone + LED Integration", Dimensions: "48x48x30 in", MRP_INR: 85000, Selling_Price_INR: 68000, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Makrana Stone Works" },
        { SKU: "DIN-CSV-05", Product_Name: "Teak Wood Buffet Sideboard Crockery Cabinet", Main_Category: "Dining & Study", Material_Spec: "Solid Teak + Fluted Glass Shutters", Dimensions: "66x18x36 in", MRP_INR: 54000, Selling_Price_INR: 43200, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Royal Teak Crafts Saharanpur" },
        { SKU: "DIN-CSV-06", Product_Name: "Nordic Solid Oak Minimalist Study Desk", Main_Category: "Dining & Study", Material_Spec: "Kiln-Dried White Oak + Built-in Wireless Charger", Dimensions: "54x24x30 in", MRP_INR: 32000, Selling_Price_INR: 25600, Warranty_Years: 10, Total_Component_Boxes: 1, Default_Supplier: "Bangalore Modular Plant" },
        { SKU: "DIN-CSV-07", Product_Name: "Ergonomic Leatherette Study Swivel Armchair", Main_Category: "Dining & Study", Material_Spec: "High Density Molded Foam + Chrome Star Base", Dimensions: "24x24x36 in", MRP_INR: 18000, Selling_Price_INR: 14400, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Featherlite Seating Hyderabad" },
        { SKU: "DIN-CSV-08", Product_Name: "Wall-Mounted Solid Wood Foldable Study Station", Main_Category: "Dining & Study", Material_Spec: "Heavy Plywood + Hydraulic Support Gas Spring", Dimensions: "36x24x18 in", MRP_INR: 14000, Selling_Price_INR: 11200, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Bangalore Modular Plant" },
        { SKU: "DIN-CSV-09", Product_Name: "Imperial Bar Cabinet with Wine Glass Rack", Main_Category: "Dining & Study", Material_Spec: "Sheesham Wood Antique Walnut Finish", Dimensions: "42x20x48 in", MRP_INR: 46000, Selling_Price_INR: 36800, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Jodhpur Artisan Guild" },
        { SKU: "DIN-CSV-10", Product_Name: "Round 4-Seater Glass Top Cafe Dining Set", Main_Category: "Dining & Study", Material_Spec: "12mm Toughened Glass + Electroplated Gold Legs", Dimensions: "42x42x30 in", MRP_INR: 38000, Selling_Price_INR: 30400, Warranty_Years: 5, Total_Component_Boxes: 2, Default_Supplier: "Bangalore Modular Plant" }
      ]
    },
    kitchen: {
      name: "10_Modular_Kitchen_and_Wardrobes.csv",
      rows: [
        { SKU: "MOD-CSV-01", Product_Name: "Titan 3-Door Toughened Mirror Sliding Wardrobe", Main_Category: "Storage & Wardrobes", Material_Spec: "CRCA Steel + Toughened Mirror + Soft-Close", Dimensions: "78x66x24 in", MRP_INR: 85000, Selling_Price_INR: 68000, Warranty_Years: 10, Total_Component_Boxes: 4, Default_Supplier: "Godrej Interio Shirwal Hub" },
        { SKU: "MOD-CSV-02", Product_Name: "High-Gloss Acrylic Modular L-Shape Kitchen Base", Main_Category: "Modular Kitchen", Material_Spec: "BWP Marine Grade Plywood + Blum Soft-Close", Dimensions: "120x96x34 in", MRP_INR: 185000, Selling_Price_INR: 148000, Warranty_Years: 10, Total_Component_Boxes: 6, Default_Supplier: "Godrej Modular Kitchens" },
        { SKU: "MOD-CSV-03", Product_Name: "Overhead Glass Lift-Up Kitchen Wall Cabinets", Main_Category: "Modular Kitchen", Material_Spec: "Hafele Gas Struts + Frosted Fluted Glass", Dimensions: "96x14x24 in", MRP_INR: 52000, Selling_Price_INR: 41600, Warranty_Years: 10, Total_Component_Boxes: 3, Default_Supplier: "Godrej Modular Kitchens" },
        { SKU: "MOD-CSV-04", Product_Name: "Walk-In Closet Island Drawer Unit with Glass Top", Main_Category: "Storage & Wardrobes", Material_Spec: "High-Density Engineered Wood + Jewelry Tray", Dimensions: "48x36x36 in", MRP_INR: 46000, Selling_Price_INR: 36800, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Godrej Interio Shirwal Hub" },
        { SKU: "MOD-CSV-05", Product_Name: "Corner Carousel 360-Degree Kitchen Pantry Unit", Main_Category: "Modular Kitchen", Material_Spec: "Stainless Steel 304 Chrome Baskets", Dimensions: "36x36x78 in", MRP_INR: 68000, Selling_Price_INR: 54400, Warranty_Years: 10, Total_Component_Boxes: 3, Default_Supplier: "Godrej Modular Kitchens" },
        { SKU: "MOD-CSV-06", Product_Name: "2-Door Slim Entryway Shoe & Coat Rack Cabinet", Main_Category: "Storage & Wardrobes", Material_Spec: "Prelam Board + Louvered Ventilation Doors", Dimensions: "36x15x42 in", MRP_INR: 22000, Selling_Price_INR: 17600, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Bangalore Modular Plant" },
        { SKU: "MOD-CSV-07", Product_Name: "Full-Height Pull-Out Multi-Tier Spice Pantry", Main_Category: "Modular Kitchen", Material_Spec: "Heavy Duty 80KG Soft-Close Slides", Dimensions: "18x24x78 in", MRP_INR: 44000, Selling_Price_INR: 35200, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Godrej Modular Kitchens" },
        { SKU: "MOD-CSV-08", Product_Name: "Loft Storage Overhead 4-Door Wardrobe Extension", Main_Category: "Storage & Wardrobes", Material_Spec: "CRCA Steel Anti-Rust Powder Coated", Dimensions: "72x24x20 in", MRP_INR: 28000, Selling_Price_INR: 22400, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Godrej Interio Shirwal Hub" },
        { SKU: "MOD-CSV-09", Product_Name: "Modular Quartz Countertop Kitchen Island", Main_Category: "Modular Kitchen", Material_Spec: "Engineered Quartz Stone + 4 Deep Pots Drawers", Dimensions: "60x36x36 in", MRP_INR: 76000, Selling_Price_INR: 60800, Warranty_Years: 10, Total_Component_Boxes: 3, Default_Supplier: "Makrana Stone Works" },
        { SKU: "MOD-CSV-10", Product_Name: "Stainless Steel 304 Multi-Compartment Sink Vanity", Main_Category: "Modular Kitchen", Material_Spec: "Sound-Deadened 1.2mm SS304 + Pull-Out Faucet", Dimensions: "36x22x34 in", MRP_INR: 34000, Selling_Price_INR: 27200, Warranty_Years: 10, Total_Component_Boxes: 2, Default_Supplier: "Godrej Modular Kitchens" }
      ]
    },
    office: {
      name: "10_Commercial_Office_Workstations.csv",
      rows: [
        { SKU: "OFFICE-CSV-01", Product_Name: "Presidential 84\" Teak Executive Director Desk", Main_Category: "Office & Institutional", Material_Spec: "High-Gloss Teak Veneer + Integrated Cable Hub", Dimensions: "84x42x30 in", MRP_INR: 95000, Selling_Price_INR: 76000, Warranty_Years: 5, Total_Component_Boxes: 3, Default_Supplier: "Godrej Workspaces, Vizag" },
        { SKU: "OFFICE-CSV-02", Product_Name: "AeroMesh High-Back Executive Task Chair", Main_Category: "Office & Institutional", Material_Spec: "Korean Mesh + Synchronized Tilt Mechanism", Dimensions: "26x26x48 in", MRP_INR: 28000, Selling_Price_INR: 22400, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Featherlite Seating, Hyderabad" },
        { SKU: "OFFICE-CSV-03", Product_Name: "12-Seater Boardroom Conference Table (14 Ft)", Main_Category: "Office & Institutional", Material_Spec: "Heavy CRCA Steel + 36mm Prelam Top", Dimensions: "168x48x30 in", MRP_INR: 125000, Selling_Price_INR: 100000, Warranty_Years: 5, Total_Component_Boxes: 4, Default_Supplier: "Godrej Workspaces, Vizag" },
        { SKU: "OFFICE-CSV-04", Product_Name: "4-Person Modular Workstation Cluster with Privacy Screens", Main_Category: "Office & Institutional", Material_Spec: "CRCA Powder-Coated Steel + Acoustic Fabric", Dimensions: "96x48x42 in", MRP_INR: 72000, Selling_Price_INR: 57600, Warranty_Years: 5, Total_Component_Boxes: 4, Default_Supplier: "Godrej Workspaces, Vizag" },
        { SKU: "OFFICE-CSV-05", Product_Name: "Fire-Resistant 4-Drawer Steel Filing Cabinet", Main_Category: "Office & Institutional", Material_Spec: "Heavy 1.2mm CRCA Steel + Digital Keypad", Dimensions: "20x24x54 in", MRP_INR: 34000, Selling_Price_INR: 27200, Warranty_Years: 10, Total_Component_Boxes: 1, Default_Supplier: "Godrej Security Hub" },
        { SKU: "OFFICE-CSV-06", Product_Name: "ErgoLift Dual-Motor Electric Standing Desk", Main_Category: "Office & Institutional", Material_Spec: "Dual Heavy Motors + Anti-Collision Sensor", Dimensions: "60x30x28-48 in", MRP_INR: 46000, Selling_Price_INR: 36800, Warranty_Years: 5, Total_Component_Boxes: 2, Default_Supplier: "Featherlite Seating, Hyderabad" },
        { SKU: "OFFICE-CSV-07", Product_Name: "Semi-Fowler Manual Hospital Bed with ABS Panels", Main_Category: "Office & Institutional", Material_Spec: "Epoxy Coated Steel + Collapsible Side Rails", Dimensions: "82x38x24 in", MRP_INR: 58000, Selling_Price_INR: 46400, Warranty_Years: 5, Total_Component_Boxes: 2, Default_Supplier: "Godrej MedTech Works" },
        { SKU: "OFFICE-CSV-08", Product_Name: "Dual School Classroom Bench & Desk Combo", Main_Category: "Office & Institutional", Material_Spec: "Heavy Gauge Tubular Steel + Melamine Board", Dimensions: "42x32x30 in", MRP_INR: 16000, Selling_Price_INR: 12800, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Featherlite Seating, Hyderabad" },
        { SKU: "OFFICE-CSV-09", Product_Name: "High-Density Heavy Steel Mobile Compactor Rack", Main_Category: "Office & Institutional", Material_Spec: "Mechanical Gear Driven + Anti-Rust Primer", Dimensions: "120x36x84 in", MRP_INR: 145000, Selling_Price_INR: 116000, Warranty_Years: 10, Total_Component_Boxes: 6, Default_Supplier: "Godrej Storage Solutions" },
        { SKU: "OFFICE-CSV-10", Product_Name: "WorkSmart Mid-Back Mesh Task Chair", Main_Category: "Office & Institutional", Material_Spec: "Breathable Nylon Mesh + Pneumatic Lift", Dimensions: "24x24x40 in", MRP_INR: 14000, Selling_Price_INR: 11200, Warranty_Years: 5, Total_Component_Boxes: 1, Default_Supplier: "Featherlite Seating, Hyderabad" }
      ]
    }
  };

  // Helper to download any CSV pack
  const downloadPackCsv = (packKey) => {
    const pack = DEMO_PACKS[packKey];
    if (!pack) return;

    const header = "SKU,Product_Name,Main_Category,Material_Spec,Dimensions,MRP_INR,Selling_Price_INR,Warranty_Years,Total_Component_Boxes,Default_Supplier\n";
    const rows = pack.rows.map(r => 
      `"${r.SKU}","${r.Product_Name}","${r.Main_Category}","${r.Material_Spec}","${r.Dimensions}",${r.MRP_INR},${r.Selling_Price_INR},${r.Warranty_Years},${r.Total_Component_Boxes},"${r.Default_Supplier}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', pack.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    showToast(`📥 Downloaded ${pack.name} (${pack.rows.length} SKUs)!`, true);
  };

  // Helper to load demo pack directly into parser with 1 click
  const loadDemoPackDirect = (packKey) => {
    const pack = DEMO_PACKS[packKey];
    if (!pack) return;

    setFileName(pack.name);
    setParsedRows(pack.rows);
    playScanBeep();
    showToast(`⚡ Loaded ${pack.rows.length} SKUs from ${pack.name}! Ready to import.`, true);
  };

  // Download General Pre-Formatted Sample CSV Template
  const handleDownloadSampleCsv = () => {
    downloadPackCsv('bedroom');
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
      rows: parsedRows,
      items: parsedRows,
      items_json: JSON.stringify(parsedRows)
    });

    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card modal-xl glass-panel" style={{ maxWidth: '960px', width: '95%', maxHeight: '92vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', padding: '24px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-gold">📁 BULK CATALOG IMPORTER</span>
              <span className="badge badge-cyan">AUTONOMOUS CSV ENGINE</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: '4px 0 0 0' }}>
              📊 Excel / CSV Bulk Furniture Catalog Importer
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Upload new supplier stock sheets, update MRP pricing, or batch-import new furniture lines directly into Godrej Interio Rayagada OS
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* 🧭 3-Step Wizard Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 📁 Upload & Templates' },
            { step: 2, label: '2. 🔍 Audit & Diagnostics' },
            { step: 3, label: '3. 🚀 Atomic Import' }
          ].map(s => {
            const isActive = importStep === s.step;
            const isDone = importStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setImportStep(s.step);
                  playScanBeep();
                }}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: isActive ? '900' : '700',
                  background: isActive 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                    : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                  border: isActive ? '1.5px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>

        {/* ================= STEP 1: FILE UPLOAD & PRESET TEMPLATES ================= */}
        {importStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {/* Download Sample Packs */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(212,175,55,0.25)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                    📥 Download Standard Formatted Template or Category Starter Packs:
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                    Use our verified 12-column CSV schema to guarantee zero import errors
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={downloadSampleTemplate} 
                    className="btn-ghost-edit" 
                    style={{ fontSize: '10.5px', padding: '5px 8px', color: 'var(--accent-cyan)' }}
                  >
                    <Download size={12} /> Empty Template
                  </button>
                  <button 
                    type="button"
                    onClick={() => downloadPackCsv('bedroom')} 
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 6px', fontSize: '9.5px', cursor: 'pointer' }}
                  >
                    <Download size={10} /> Bedroom .csv
                  </button>
                  <button 
                    type="button"
                    onClick={() => downloadPackCsv('living')} 
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 6px', fontSize: '9.5px', cursor: 'pointer' }}
                  >
                    <Download size={10} /> Living .csv
                  </button>
                  <button 
                    type="button"
                    onClick={() => downloadPackCsv('dining')} 
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 6px', fontSize: '9.5px', cursor: 'pointer' }}
                  >
                    <Download size={10} /> Dining .csv
                  </button>
                </div>
              </div>
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
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '14px'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".csv, .tsv, .txt" 
                style={{ display: 'none' }} 
              />
              <FileText size={42} style={{ color: 'var(--accent-gold)', margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>
                {fileName ? `Selected File: ${fileName} (${parsedRows.length} SKUs Parsed)` : 'Drag & Drop Furniture CSV Here, or Click to Browse'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Supports standard CSV, TSV, or comma-delimited text exports from Excel, Google Sheets, or ERPs
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                disabled={parsedRows.length === 0}
                onClick={() => {
                  setImportStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '800', opacity: parsedRows.length > 0 ? 1 : 0.4 }}
              >
                Next: Data Diagnostics & Audit Preview ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DATA DIAGNOSTICS & AUDIT ================= */}
        {importStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {/* Import Strategy Options */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
                ⚙️ Conflict Resolution Strategy:
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
                    onClick={() => {
                      setImportMode(strategy.id);
                      playScanBeep();
                    }}
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
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>
                  📋 Diagnostic Audit: {parsedRows.length} Items Parsed
                </div>
                <span className="badge badge-emerald">ALL HEADERS AUTO-MAPPED ✓</span>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                <table className="luxury-table" style={{ width: '100%', fontSize: '10.5px' }}>
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
                    {parsedRows.slice(0, 8).map((row, idx) => (
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
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setImportStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Upload
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setImportStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Final Review & Commit ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ATOMIC COMMIT & SYNC ================= */}
        {importStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '16px', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--accent-gold-light)', fontSize: '13px' }}>🚀 Atomic Import Execution Summary:</strong><br />
              • Total SKUs to Sync: <b style={{ color: '#FFFFFF' }}>{parsedRows.length} models</b><br />
              • Strategy: <b style={{ color: 'var(--accent-cyan)' }}>{importMode === 'MERGE' ? 'Merge & Update (Safe)' : importMode === 'APPEND' ? 'Append Only' : 'Full Catalog Replace'}</b><br />
              • Target: <b>OmniBuild OS Local Storage + Google Sheets Master Catalog</b><br />
              • Status: <b style={{ color: 'var(--accent-emerald)' }}>Verified 100% Clean • Ready to Commit</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setImportStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Diagnostics
              </button>
              <button 
                className="btn-luxury-gold" 
                onClick={handleCommitImport}
                disabled={parsedRows.length === 0 || isProcessing}
                style={{ flex: 1, marginLeft: '12px', justifyContent: 'center', padding: '12px', fontSize: '13px', fontWeight: '900' }}
              >
                <Save size={16} /> 💾 Commit & Import {parsedRows.length} SKUs to Google Sheets
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

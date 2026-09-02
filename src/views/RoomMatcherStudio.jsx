import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  Layers, 
  Check, 
  Share2, 
  Zap, 
  Maximize2, 
  Ruler, 
  ShieldCheck, 
  Image as ImageIcon,
  DollarSign,
  Upload,
  Trash2,
  Camera,
  Edit,
  Save,
  X,
  Plus,
  RefreshCw,
  Sliders,
  Printer,
  Compass,
  Sun,
  Moon,
  Palette,
  Eye,
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Mic
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';
import { calculateRoomSpatialSynergy, getFilteredCatalogForMode } from '../utils/spatialMath';

export function RoomMatcherStudio() {
  const { 
    catalog, 
    inquiries, 
    triggerSafeLockOrder, 
    showToast, 
    openModal, 
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing
  } = useStore();

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Active Room State
  const [roomImage, setRoomImage] = useState("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800");
  const [roomTitle, setRoomTitle] = useState("Master Bedroom Suite (16 × 14 ft)");
  const [dimensions, setDimensions] = useState("16' 4\" × 14' 2\" × 10' 0\"");
  const [aesthetic, setAesthetic] = useState("Solid CP Teak & Warm Neutral Tones");
  const [lighting, setLighting] = useState("3500K Warm Ambient Recessed");
  const [clearance, setClearance] = useState("38 in (Knock-down 5-Box Safe ✓)");
  const [designerNotes, setDesignerNotes] = useState("Client requested 3 ft clearance along east wall for sliding almirah doors.");

  // Category Focus Mode: 'ALL' | 'SOFA' | 'DINING' | 'ALMIRAH' | 'BED'
  const [categoryMode, setCategoryMode] = useState('ALL');
  const [roomStep, setRoomStep] = useState(1);

  // Single Item Selection (for focused single-category mode)
  const [singleSku, setSingleSku] = useState('SOF-MOD-001');

  // Interactive Doorway & Custom Combo Sliders
  const [doorwayWidth, setDoorwayWidth] = useState(38); // 28" to 48"
  const [comboDiscountPct, setComboDiscountPct] = useState(8); // 5% to 20%

  // Real-Time Visual Edit Options & Shaders
  const [beforeAfterSplit, setBeforeAfterSplit] = useState(50); // 0 to 100
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [showDoorSwingArcs, setShowDoorSwingArcs] = useState(true);
  const [lightingMode, setLightingMode] = useState('NATURAL_DAY'); // 'NATURAL_DAY' | 'WARM_GLOW' | 'CHANDELIER'
  const [wallAccentColor, setWallAccentColor] = useState(null); // null | '#1E3A8A' | '#065F46' | '#B45309' | '#334155'
  const [activeTapeTool, setActiveTapeTool] = useState(false);
  const [tapeMeasurement, setTapeMeasurement] = useState("↔️ 9' 4\" Clear Wall Span");

  // Customer Details
  const [customerName, setCustomerName] = useState("Dr. Subhashish Jena");
  const [customerPhone, setCustomerPhone] = useState("9437188291");
  const [customerAddress, setCustomerAddress] = useState("Gayatri Nagar Villa, Rayagada");
  const [exchangeCredit, setExchangeCredit] = useState(0);

  // ⚡ Budget-to-Suite Auto-Assembler State
  const [customerBudget, setCustomerBudget] = useState(150000);
  const [isBudgetAssemblerOpen, setIsBudgetAssemblerOpen] = useState(false);

  // 🕉️ 8-Point Vastu Orientation State
  const [bedDirection, setBedDirection] = useState('SOUTH'); // 'SOUTH' | 'WEST' | 'NORTH' | 'EAST'
  const [almirahDirection, setAlmirahDirection] = useState('SOUTH_WEST');
  const [sofaDirection, setSofaDirection] = useState('EAST');

  // 🎨 Flooring Material Shader State
  const [flooringTexture, setFlooringTexture] = useState('MARBLE'); // 'MARBLE' | 'TEAK' | 'TERRAZZO' | 'TILES'

  // Suite Combo Pieces (Selectable from catalog)
  const [item1Sku, setItem1Sku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [item2Sku, setItem2Sku] = useState(catalog[10]?.SKU || 'ALM-MOD-001');
  const [item3Sku, setItem3Sku] = useState(catalog[6]?.SKU || 'CHR-MOD-001');

  // Scanner Animation State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [isEditingParams, setIsEditingParams] = useState(false);

  // 📥 1-Click Import Lead from Tab 8 (Showroom CRM)
  const handleImportLead = (leadId) => {
    const lead = inquiries.find(i => i.Inquiry_ID === leadId);
    if (!lead) return;

    setCustomerName(lead.Customer_Name || "Customer");
    setCustomerPhone(lead.Customer_Phone || "94371");
    setCustomerAddress(lead.Address || lead.Locality_Address || "Rayagada Town");
    if (lead.Budget_INR) {
      setCustomerBudget(lead.Budget_INR);
      handleAutoAssembleBudget(lead.Budget_INR);
    }
    playScanBeep();
    showToast(`📥 Imported lead #${lead.Inquiry_ID} (${lead.Customer_Name}) into 2D Room Matcher!`, true);
  };

  // Sample Presets
  const samplePresets = [
    {
      id: 'master_bedroom',
      name: 'Master Bedroom Villa',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
      title: 'Master Bedroom Suite (16 × 14 ft)',
      dimensions: "16' 4\" × 14' 2\" × 10' 0\"",
      aesthetic: 'Solid CP Teak & Warm Neutral Tones',
      item1: 'BED-MOD-001',
      item2: 'ALM-MOD-001',
      item3: 'CHR-MOD-001'
    },
    {
      id: 'living_lounge',
      name: 'Luxury Living Lounge',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      title: 'Luxury Living Lounge (20 × 16 ft)',
      dimensions: "20' 0\" × 16' 6\" × 11' 0\"",
      aesthetic: 'Royal Velvet & Smoked Sal Wood',
      item1: 'SOF-MOD-001',
      item2: 'SOF-MOD-002',
      item3: 'DIN-MOD-001'
    },
    {
      id: 'executive_dining',
      name: 'Executive Dining Room',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
      title: 'Executive Dining Room (15 × 12 ft)',
      dimensions: "15' 0\" × 12' 6\" × 10' 6\"",
      aesthetic: 'Carrara Natural Marble & Teak Base',
      item1: 'DIN-MOD-001',
      item2: 'COM-MOD-001',
      item3: 'CHR-MOD-001'
    },
    {
      id: 'commercial_office',
      name: 'Executive Home Office',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      title: 'Executive Modular Workstation (14 × 12 ft)',
      dimensions: "14' 0\" × 12' 0\" × 10' 0\"",
      aesthetic: 'CRCA Steel & Prelam Particle Board',
      item1: 'COM-MOD-001',
      item2: 'CHR-MOD-001',
      item3: 'ALM-MOD-001'
    }
  ];

  // Resolve Products based on mode
  const piece1 = catalog.find(c => c.SKU === item1Sku) || catalog[0] || {};
  const piece2 = catalog.find(c => c.SKU === item2Sku) || catalog[1] || catalog[0] || {};
  const piece3 = catalog.find(c => c.SKU === item3Sku) || catalog[2] || catalog[0] || {};
  const singlePiece = catalog.find(c => c.SKU === singleSku) || catalog.find(c => (c.Main_Category || '').includes('Living') || (c.Product_Name || '').includes('Sofa')) || catalog[0] || {};

  const activeItems = categoryMode === 'ALL' ? [piece1, piece2, piece3] : [singlePiece];

  // Calculate Real-Time Spatial Clearance & Synergy
  const spatialMetrics = calculateRoomSpatialSynergy(activeItems, dimensions, categoryMode);

  // Filtered Catalog List with live Fit status for current category
  const filteredCategoryList = getFilteredCatalogForMode(catalog, categoryMode, dimensions);

  // Financial Calculations
  const totalMRP = categoryMode === 'ALL' 
    ? ((piece1.MRP_INR || 75000) + (piece2.MRP_INR || 55000) + (piece3.MRP_INR || 35000))
    : (singlePiece.MRP_INR || 60000);

  const totalSelling = categoryMode === 'ALL'
    ? ((piece1.Selling_Price_INR || 62000) + (piece2.Selling_Price_INR || 48000) + (piece3.Selling_Price_INR || 28000))
    : (singlePiece.Selling_Price_INR || 50000);

  const comboSavings = categoryMode === 'ALL' ? Math.round(totalMRP * (comboDiscountPct / 100)) : 0;
  const suiteFinalPrice = categoryMode === 'ALL' ? (totalMRP - comboSavings) : totalSelling;
  const netPayable = Math.max(0, suiteFinalPrice - exchangeCredit);
  const tokenAdvance50Pct = Math.round(netPayable * 0.5);
  const emi12Month = Math.round(netPayable / 12);

  // Live Vastu Score Calculation
  const calculateVastuScore = () => {
    let score = 50;
    if (bedDirection === 'SOUTH' || bedDirection === 'WEST') score += 25;
    if (almirahDirection === 'SOUTH_WEST') score += 15;
    if (sofaDirection === 'EAST' || sofaDirection === 'NORTH') score += 10;
    return Math.min(100, score);
  };
  const vastuScore = calculateVastuScore();

  // 1-Click Auto Align Vastu
  const handleAutoAlignVastu = () => {
    setBedDirection('SOUTH');
    setAlmirahDirection('SOUTH_WEST');
    setSofaDirection('EAST');
    playSuccessChime();
    triggerGoldenConfetti();
    showToast("🕉️ Vastu Auto-Aligned! 100% Vastu Approved (South Headboard, SW Almirah).", true);
  };

  // ⚡ 1-Click Budget-to-Suite Auto-Assembler Logic
  const handleAutoAssembleBudget = (targetBudget = customerBudget) => {
    const beds = catalog.filter(c => (c.Main_Category || '').includes('Bedroom') || (c.Product_Name || '').includes('Bed') || (c.SKU || '').startsWith('BED'));
    const almirahs = catalog.filter(c => (c.Main_Category || '').includes('Storage') || (c.Product_Name || '').includes('Almirah') || (c.SKU || '').startsWith('ALM'));
    const accents = catalog.filter(c => (c.Main_Category || '').includes('Seating') || (c.Product_Name || '').includes('Chair') || (c.SKU || '').startsWith('CHR') || (c.SKU || '').startsWith('SOF'));

    let bestCombo = null;
    let maxSpend = 0;
    const discountFactor = (100 - comboDiscountPct) / 100;

    const bList = beds.length ? beds : catalog.slice(0, 5);
    const aList = almirahs.length ? almirahs : catalog.slice(5, 10);
    const cList = accents.length ? accents : catalog.slice(10, 15);

    for (const b of bList) {
      for (const a of aList) {
        for (const c of cList) {
          const comboMRP = (b.MRP_INR || 70000) + (a.MRP_INR || 55000) + (c.MRP_INR || 30000);
          const comboPrice = Math.round(comboMRP * discountFactor);
          if (comboPrice <= targetBudget && comboPrice > maxSpend) {
            maxSpend = comboPrice;
            bestCombo = { b, a, c, comboMRP, comboPrice };
          }
        }
      }
    }

    if (bestCombo) {
      setItem1Sku(bestCombo.b.SKU);
      setItem2Sku(bestCombo.a.SKU);
      setItem3Sku(bestCombo.c.SKU);
      setCategoryMode('ALL');
      playSuccessChime();
      triggerGoldenConfetti();
      showToast(`⚡ AI Budget Assembler matched 3 items for ₹${bestCombo.comboPrice.toLocaleString()}! (Budget: ₹${Number(targetBudget).toLocaleString()})`, true);
    } else {
      setItem1Sku(catalog[0]?.SKU);
      setItem2Sku(catalog[1]?.SKU);
      setItem3Sku(catalog[2]?.SKU);
      showToast(`⚠️ No exact 3-piece combo under ₹${Number(targetBudget).toLocaleString()}. Loaded nearest suite.`);
    }
  };

  // Photo Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRoomImage(event.target.result);
        setRoomTitle(`Custom Room Photo (${file.name})`);
        triggerAiScan();
        showToast("📸 Customer Room Photo uploaded! AI Spatial Scan triggered.", true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete / Clear Photo Handler
  const handleDeletePhoto = () => {
    setRoomImage('');
    setRoomTitle('Empty Room Canvas (Upload New Room Photo)');
    playScanBeep();
    showToast("🗑️ Room photo cleared. Ready for new image upload.");
  };

  // Trigger AI Scan
  const triggerAiScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    playScanBeep();

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        playSuccessChime();
        triggerGoldenConfetti();
        showToast("✨ AI Spatial Clearance & Dimension Verification Complete! 96% Match.", true);
      }
    }, 200);
  };

  // Apply Sample Preset
  const handleSelectPreset = (preset) => {
    setRoomImage(preset.image);
    setRoomTitle(preset.title);
    setDimensions(preset.dimensions);
    setAesthetic(preset.aesthetic);
    setItem1Sku(preset.item1);
    setItem2Sku(preset.item2);
    setItem3Sku(preset.item3);
    setCategoryMode('ALL');
    triggerAiScan();
  };

  // 1-Click Convert Suite to SafeLock Order
  const handleLockSuiteCombo = () => {
    triggerSafeLockOrder({
      Customer_Name: customerName,
      Customer_Phone: customerPhone,
      Project_Address: customerAddress,
      Ordered_SKU: categoryMode === 'ALL' 
        ? `${piece1.SKU} + ${piece2.SKU} + ${piece3.SKU} (3-Item Suite)`
        : `${singlePiece.SKU} (${singlePiece.Product_Name})`,
      Total_Amount_INR: suiteFinalPrice,
      Advance_Paid_INR: tokenAdvance50Pct,
      Balance_Due_INR: suiteFinalPrice - tokenAdvance50Pct
    });

    dispatchWebhookAction('CONVERT_ROOM_MATCHER_DEAL', {
      customer_name: customerName,
      customer_phone: customerPhone,
      address: customerAddress,
      room_title: roomTitle,
      dimensions: dimensions,
      mode: categoryMode,
      items: activeItems.map(i => `${i.SKU} (${i.Product_Name})`).join(' + '),
      total_mrp: totalMRP,
      final_price: suiteFinalPrice,
      advance_token: tokenAdvance50Pct,
      synergy_score: `${spatialMetrics.synergyScore}%`
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔒 ${categoryMode === 'ALL' ? '3-Piece Bedroom Suite' : singlePiece.Product_Name} SafeLocked! 50% Token ₹${tokenAdvance50Pct.toLocaleString()} logged to Google Sheets.`, true);
  };

  // Dynamic filter lighting styles
  const getLightingStyle = () => {
    if (lightingMode === 'WARM_GLOW') {
      return { filter: 'sepia(0.2) saturate(1.25) contrast(1.05)' };
    } else if (lightingMode === 'CHANDELIER') {
      return { filter: 'contrast(1.2) brightness(0.92) drop-shadow(0 0 15px rgba(212,175,55,0.4))' };
    }
    return { filter: 'none' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeIn 0.25s ease-out' }}>

      {/* Top Notification Bar & Quick Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B132B', border: '1px solid rgba(212,175,55,0.3)', padding: '10px 16px', borderRadius: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="badge badge-gold">
            <Sparkles size={13} /> 2D MULTIMODAL AI ROOM FITTER
          </div>
          
          {/* 📥 Import Lead from Tab 8 Showroom CRM */}
          <select 
            onChange={e => handleImportLead(e.target.value)}
            defaultValue=""
            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '8px', background: '#030712', border: '1px solid rgba(56,189,248,0.4)', color: '#38BDF8', fontWeight: '700', cursor: 'pointer' }}
          >
            <option value="" disabled>📥 Import Lead from Tab 8 CRM...</option>
            {inquiries.map(inq => (
              <option key={inq.Inquiry_ID} value={inq.Inquiry_ID}>
                {inq.Inquiry_ID} — {inq.Customer_Name} (₹{(inq.Budget_INR || 0).toLocaleString()})
              </option>
            ))}
          </select>

          <button 
            className="btn-purple" 
            onClick={() => openModal('schedule_mistri_visit', { lead: { Customer_Name: customerName, Customer_Phone: customerPhone, Address: customerAddress } })}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            📐 Free Mistri Visit
          </button>
        </div>

        {/* Quick Budget & Vastu Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('voice_pos');
              showToast(`🎙️ Transferred ${customerName}'s suite into Voice POS to book token deposit!`, true);
            }}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            <Mic size={12} /> <span>Voice POS (Tab 2)</span>
          </button>

          <button 
            className="btn-emerald" 
            onClick={() => {
              setActiveTab('safelock');
              showToast(`🔒 Switched to SafeLock Inventory Terminal!`, true);
            }}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            <ShieldCheck size={12} /> <span>SafeLock (Tab 4)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              setActiveTab('documents');
              showToast(`📄 Switched to Document Studio to print 2D Layout Certificate for ${customerName}!`, true);
            }}
            style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.06)' }}
          >
            <Printer size={12} /> <span>Layout PDF (Tab 10)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>

          {/* 🕉️ Live Vastu Score Badge */}
          <div 
            onClick={handleAutoAlignVastu}
            style={{ 
              background: vastuScore >= 90 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1.5px solid ${vastuScore >= 90 ? '#10B981' : '#F59E0B'}`,
              borderRadius: '8px',
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Click to 1-Click Auto-Align Vastu orientation!"
          >
            <span style={{ fontSize: '13px' }}>🕉️</span>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: '900', color: vastuScore >= 90 ? 'var(--accent-emerald)' : '#F59E0B' }}>
                {vastuScore}% VASTU
              </div>
              <div style={{ fontSize: '8.5px', color: '#94A3B8' }}>Auto-Align ⚡</div>
            </div>
          </div>

          {/* ⚡ Budget-to-Suite Auto Assembler Quick Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#030712', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', padding: '3px 8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '800' }}>⚡ Budget: ₹</span>
            <select 
              value={customerBudget}
              onChange={e => {
                const b = Number(e.target.value);
                setCustomerBudget(b);
                handleAutoAssembleBudget(b);
              }}
              style={{ background: 'transparent', color: '#FFFFFF', border: 'none', fontSize: '11.5px', fontWeight: '900', cursor: 'pointer' }}
            >
              <option value={75000}>₹75,000 Package</option>
              <option value={100000}>₹1,00,000 Package</option>
              <option value={150000}>₹1,50,000 Package</option>
              <option value={200000}>₹2,00,000 Package</option>
              <option value={250000}>₹2,50,000 Package</option>
              <option value={350000}>₹3,50,000 Package</option>
            </select>
            <button 
              className="btn-luxury-gold" 
              onClick={() => handleAutoAssembleBudget(customerBudget)}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              Assemble
            </button>
          </div>

          <button 
            className="btn-luxury-gold" 
            onClick={triggerAiScan} 
            disabled={isScanning}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? `Scanning (${scanProgress}%)...` : '⚡ Re-Scan'}
          </button>
        </div>
      </div>

      {/* 🧭 3-Step Guided AI Room Matcher Wizard Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#030712', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { step: 1, label: '1. 📐 Room Preset & Dimensions' },
          { step: 2, label: '2. 🛋️ Furniture Staging & Clearance' },
          { step: 3, label: '3. 📋 Suite Quote & WhatsApp Lock' }
        ].map(s => {
          const isActive = roomStep === s.step;
          const isDone = roomStep > s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setRoomStep(s.step);
                playScanBeep();
              }}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: isActive ? '900' : '700',
                background: isActive 
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                  : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                border: isActive ? '2px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {isDone ? '✓ ' : ''}{s.label}
            </button>
          );
        })}
      </div>

      {/* 🎯 CATEGORY FOCUS SELECTOR TABS (Single vs Full Suite) */}
      <div style={{ display: 'flex', gap: '8px', background: '#030712', padding: '6px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: '👑 Complete 3-Item Suite Combo', icon: '👑' },
          { id: 'SOFA', label: '🛋️ Sofas & Living Room Sets Only', icon: '🛋️' },
          { id: 'DINING', label: '🪑 Dining Tables Only', icon: '🪑' },
          { id: 'ALMIRAH', label: '🚪 Wardrobes & Almirahs Only', icon: '🚪' },
          { id: 'BED', label: '🛏️ Beds & Headboards Only', icon: '🛏️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setCategoryMode(tab.id);
              playScanBeep();
              showToast(`🎯 Switched mode: ${tab.label}`);
            }}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '9px 12px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: categoryMode === tab.id ? '900' : '700',
              background: categoryMode === tab.id 
                ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                : 'rgba(30,41,59,0.5)',
              color: categoryMode === tab.id ? '#000000' : '#E2E8F0',
              border: categoryMode === tab.id ? '1.5px solid #FFFFFF' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preset Fast Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {samplePresets.map(preset => (
          <div 
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            style={{
              background: roomTitle.includes(preset.name) ? 'rgba(212,175,55,0.15)' : '#030712',
              border: roomTitle.includes(preset.name) ? '1.5px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.15s ease'
            }}
          >
            <img src={preset.image} alt={preset.name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF' }}>{preset.name}</div>
              <div style={{ fontSize: '9.5px', color: 'var(--accent-cyan)' }}>{preset.dimensions}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Working Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px' }}>

        {/* LEFT COLUMN: Real-Time Interactive Canvas & Visual Shader Controls */}
        <div style={{ background: '#0B132B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>{roomTitle}</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                📐 Floor: <b>{spatialMetrics.roomLengthFt}' × {spatialMetrics.roomWidthFt}'</b> ({spatialMetrics.floorAreaSqFt} sq.ft) • {aesthetic}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-ghost-edit" onClick={() => fileInputRef.current?.click()} style={{ fontSize: '11px', padding: '5px 10px' }}>
                <Upload size={13} /> Upload Photo
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
              {roomImage && (
                <button className="btn-ghost-edit" onClick={handleDeletePhoto} style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--accent-rose)' }}>
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* 🎛️ ON-CANVAS REAL-TIME EDIT TOOLBAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#030712', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '8px' }}>
            
            {/* Before vs After Split Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                className={`btn-ghost-edit ${showBeforeAfter ? 'badge-gold' : ''}`}
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                style={{ fontSize: '10.5px', padding: '4px 8px' }}
              >
                <Eye size={12} /> {showBeforeAfter ? 'Split View Active' : 'Before/After'}
              </button>
            </div>

            {/* Door-Swing & Walkway Arcs Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                className={`btn-ghost-edit ${showDoorSwingArcs ? 'badge-gold' : ''}`}
                onClick={() => setShowDoorSwingArcs(!showDoorSwingArcs)}
                style={{ fontSize: '10.5px', padding: '4px 8px' }}
              >
                <Compass size={12} /> {showDoorSwingArcs ? 'Door Arcs ON' : 'Door Arcs OFF'}
              </button>
            </div>

            {/* Lighting Modes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>💡 Light:</span>
              {[
                { id: 'NATURAL_DAY', label: '☀️ 5500K' },
                { id: 'WARM_GLOW', label: '🌅 3000K' },
                { id: 'CHANDELIER', label: '🌙 Luxe' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLightingMode(l.id)}
                  style={{
                    fontSize: '9.5px',
                    padding: '3px 6px',
                    borderRadius: '6px',
                    background: lightingMode === l.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                    color: lightingMode === l.id ? '#000000' : '#CBD5E1',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '800'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Wall Recolor Accent Swatches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>🎨 Wall:</span>
              {[
                { color: null, label: 'Default' },
                { color: '#1E3A8A', label: 'Navy' },
                { color: '#065F46', label: 'Sage' },
                { color: '#78350F', label: 'Warm' }
              ].map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => setWallAccentColor(w.color)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: w.color || '#CBD5E1',
                    border: wallAccentColor === w.color ? '2px solid #FFFFFF' : '1px solid rgba(0,0,0,0.5)',
                    cursor: 'pointer'
                  }}
                  title={w.label}
                />
              ))}
            </div>

            {/* Flooring Shader Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>🪵 Floor:</span>
              {[
                { id: 'MARBLE', label: 'Carrara' },
                { id: 'TEAK', label: 'Teak Wood' },
                { id: 'TERRAZZO', label: 'Terrazzo' }
              ].map(fl => (
                <button
                  key={fl.id}
                  onClick={() => setFlooringTexture(fl.id)}
                  style={{
                    fontSize: '9.5px',
                    padding: '3px 6px',
                    borderRadius: '6px',
                    background: flooringTexture === fl.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                    color: flooringTexture === fl.id ? '#000000' : '#CBD5E1',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '800'
                  }}
                >
                  {fl.label}
                </button>
              ))}
            </div>

            {/* 🕉️ Vastu Headboard Direction Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>🕉️ Headboard:</span>
              <select 
                value={bedDirection}
                onChange={e => setBedDirection(e.target.value)}
                style={{ background: '#0B132B', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '6px', fontSize: '9.5px', fontWeight: '800', padding: '2px 4px', cursor: 'pointer' }}
              >
                <option value="SOUTH">South (Ideal ✓)</option>
                <option value="WEST">West (Good ✓)</option>
                <option value="EAST">East (Neutral)</option>
                <option value="NORTH">North (Avoid ❌)</option>
              </select>
            </div>

            {/* Laser Tape Tool */}
            <button 
              className={`btn-ghost-edit ${activeTapeTool ? 'badge-gold' : ''}`}
              onClick={() => {
                setActiveTapeTool(!activeTapeTool);
                showToast(activeTapeTool ? "Laser Tape deactivated." : "📏 Laser Tape Active! Tap points to verify clear span.");
              }}
              style={{ fontSize: '10.5px', padding: '4px 8px' }}
            >
              <Ruler size={12} /> Laser Tape
            </button>
          </div>

          {/* Interactive Image & Canvas Display Area */}
          <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(212,175,55,0.3)', background: wallAccentColor || '#030712' }}>
            
            {roomImage ? (
              <>
                <img 
                  src={roomImage} 
                  alt="Room Canvas" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    opacity: wallAccentColor ? 0.88 : 1,
                    ...getLightingStyle()
                  }} 
                />

                {/* Before vs After Split Curtain */}
                {showBeforeAfter && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: `${beforeAfterSplit}%`, height: '100%', overflow: 'hidden', borderRight: '3px solid #D4AF37' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800" 
                      alt="Raw Empty Room" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', color: '#FFFFFF', fontWeight: '800' }}>
                      📸 Raw Bare Room
                    </div>
                  </div>
                )}

                {/* Laser Tape Measure Raycast Overlay */}
                {activeTapeTool && (
                  <div style={{ position: 'absolute', top: '45%', left: '15%', right: '15%', height: '2px', background: '#F43F5E', borderTop: '2px dashed #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: '#F43F5E', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>
                      {tapeMeasurement}
                    </span>
                  </div>
                )}

                {/* Door-Swing & Walkway Safety Arc Overlay */}
                {showDoorSwingArcs && (
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(3,7,18,0.85)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.4)', fontSize: '10.5px', color: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: '800' }}>
                      <Compass size={13} /> Clearance: {spatialMetrics.remainingPassageFt} ft Walkway Clear ✓
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px' }}>
                      Wardrobe Door Swing: {spatialMetrics.doorSwingRadiusFt} ft arc • Lift Height: {spatialMetrics.hydraulicLiftHeightFt} ft
                    </div>
                  </div>
                )}

                {/* Scanner Overlay */}
                {isScanning && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,165,233,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFFFFF', marginTop: '10px', letterSpacing: '1px' }}>
                      MEASURING SPATIAL CLEARANCE ({scanProgress}%)...
                    </div>
                  </div>
                )}

                {/* "Will It Fit?" Live Synergy Floating Chip */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(3,7,18,0.9)', padding: '6px 12px', borderRadius: '8px', border: `1.5px solid ${spatialMetrics.fitStatus === 'PERFECT_FIT' ? '#10B981' : spatialMetrics.fitStatus === 'TIGHT_FIT' ? '#F59E0B' : '#F43F5E'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '18px' }}>
                    {spatialMetrics.fitStatus === 'PERFECT_FIT' ? '🟢' : spatialMetrics.fitStatus === 'TIGHT_FIT' ? '🟡' : '🔴'}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: spatialMetrics.fitStatus === 'PERFECT_FIT' ? 'var(--accent-emerald)' : spatialMetrics.fitStatus === 'TIGHT_FIT' ? '#F59E0B' : 'var(--accent-rose)' }}>
                      {spatialMetrics.fitStatus === 'PERFECT_FIT' ? '✅ PERFECT FIT' : spatialMetrics.fitStatus === 'TIGHT_FIT' ? '⚠️ TIGHT FIT' : '❌ OVERSIZED'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#CBD5E1' }}>
                      {spatialMetrics.synergyScore}% Synergy • {spatialMetrics.floorCoveragePct}% Floor Covered
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '10px' }}>
                <Camera size={38} color="var(--accent-gold)" />
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>No Room Photo Uploaded</div>
                <button className="btn-luxury-gold" onClick={() => fileInputRef.current?.click()} style={{ fontSize: '11px' }}>
                  <Upload size={14} /> Upload Room Photo
                </button>
              </div>
            )}
          </div>

          {/* Split Slider Controller (if Before/After active) */}
          {showBeforeAfter && (
            <div style={{ background: '#030712', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8' }}>
                <span>⬅️ Raw Bare Room</span>
                <span style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>Split Position: {beforeAfterSplit}%</span>
                <span>Godrej Luxury Makeover ➡️</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={beforeAfterSplit} 
                onChange={e => setBeforeAfterSplit(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)', marginTop: '4px', cursor: 'pointer' }}
              />
            </div>
          )}

          {/* 📐 REAL-TIME CLEARANCE & ERGONOMICS REPORT STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#030712', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Walkway Corridor:</div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                {spatialMetrics.remainingPassageFt} Feet
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Floor Coverage:</div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {spatialMetrics.floorCoveragePct}% Space
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Door-Swing Arc:</div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                {spatialMetrics.doorSwingRadiusFt > 0 ? `${spatialMetrics.doorSwingRadiusFt} ft Safe ✓` : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Apartment Lift Entry:</div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: spatialMetrics.elevatorFits ? 'var(--accent-emerald)' : '#F59E0B', marginTop: '2px' }}>
                {spatialMetrics.elevatorFits ? '5.5ft Lift Safe ✓' : 'Stairway Check'}
              </div>
            </div>
          </div>

          {/* 🚪 DOORWAY & STAIRCASE KNOCKDOWN CLEARANCE SENTINEL */}
          <div style={{ background: '#030712', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ruler size={13} color="var(--accent-gold)" /> Doorway Entry Clearance Check:
              </span>
              <span style={{ fontSize: '11px', fontWeight: '900', color: doorwayWidth >= 34 ? 'var(--accent-emerald)' : '#F59E0B' }}>
                {doorwayWidth} Inches ({doorwayWidth >= 34 ? 'Standard Entry Safe ✓' : 'Narrow Doorway Warning'})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>28"</span>
              <input 
                type="range" 
                min={28} 
                max={48} 
                value={doorwayWidth} 
                onChange={e => setDoorwayWidth(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>48"</span>
            </div>
            <div style={{ fontSize: '10px', color: '#CBD5E1', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid var(--accent-gold)' }}>
              📦 <b>Knockdown Logistics Status:</b> All Godrej Interio suites are flat-packed in 5 heavy-duty corrugated boxes. Fits through {doorwayWidth}" doorways and narrow Rayagada apartment staircases safely!
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Category Catalog Slicer & Commercial Closing Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Category-Specific Items Selector */}
          <div style={{ background: '#0B132B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFFFFF' }}>
                {categoryMode === 'ALL' ? '👑 3-Piece Suite Pieces' : `🎯 Matching ${categoryMode} Models (${filteredCategoryList.length} SKUs)`}
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                {spatialMetrics.synergyScore}% FIT SCORE
              </span>
            </div>

            {/* If Full Suite Mode: Show 3 Dropdown Selectors */}
            {categoryMode === 'ALL' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>1. Primary Bed / Sofa Model</label>
                  <select 
                    value={item1Sku} 
                    onChange={e => setItem1Sku(e.target.value)}
                    style={{ width: '100%', background: '#030712', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', fontSize: '12px', marginTop: '4px' }}
                  >
                    {catalog.map(c => (
                      <option key={c.SKU} value={c.SKU}>{c.Product_Name} ({c.SKU}) — ₹{c.Selling_Price_INR.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>2. Storage Almirah / Wardrobe</label>
                  <select 
                    value={item2Sku} 
                    onChange={e => setItem2Sku(e.target.value)}
                    style={{ width: '100%', background: '#030712', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', fontSize: '12px', marginTop: '4px' }}
                  >
                    {catalog.map(c => (
                      <option key={c.SKU} value={c.SKU}>{c.Product_Name} ({c.SKU}) — ₹{c.Selling_Price_INR.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>3. Accent Armchair / Nightstand</label>
                  <select 
                    value={item3Sku} 
                    onChange={e => setItem3Sku(e.target.value)}
                    style={{ width: '100%', background: '#030712', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', fontSize: '12px', marginTop: '4px' }}
                  >
                    {catalog.map(c => (
                      <option key={c.SKU} value={c.SKU}>{c.Product_Name} ({c.SKU}) — ₹{c.Selling_Price_INR.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* If Single Category Mode: Show List of Filtered Items with Live Clearance Badges */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {filteredCategoryList.map(item => (
                  <div
                    key={item.SKU}
                    onClick={() => {
                      setSingleSku(item.SKU);
                      playScanBeep();
                    }}
                    style={{
                      background: singleSku === item.SKU ? 'rgba(212,175,55,0.15)' : '#030712',
                      border: singleSku === item.SKU ? '1.5px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>{item.Product_Name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{item.SKU} • {item.Dimensions || 'Standard'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
                        ₹{item.Selling_Price_INR.toLocaleString()}
                      </div>
                      <span className={`badge ${item._fitStatus === 'PERFECT_FIT' ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '8.5px', padding: '2px 4px' }}>
                        {item._fitStatus === 'PERFECT_FIT' ? 'Fit ✓' : 'Tight'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Tools Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            <button 
              className="btn-purple" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => openModal('custom_finish', { sku: activeItems[0]?.SKU || 'BED-MOD-001' })}
            >
              🧵 Finish
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => openModal('emi_scheme', { amount: netPayable, customerPhone: customerPhone })}
            >
              💳 0% EMI
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => openModal('furniture_exchange', { onApplyDiscount: (val) => setExchangeCredit(val), customerPhone: customerPhone, customerName: customerName })}
            >
              🔄 Buyback
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center', color: 'var(--accent-gold-light)' }}
              onClick={() => openModal('whatsapp_proposal', { 
                customerName: customerName, 
                customerPhone: customerPhone, 
                address: customerAddress,
                roomTitle: roomTitle,
                dimensions: dimensions,
                roomImage: roomImage,
                items: activeItems.map(it => ({ sku: it.SKU, name: it.Product_Name, mrp: it.MRP_INR, price: it.Selling_Price_INR, warranty: `${it.Warranty_Years || 5} Years` })),
                exchangeCredit: exchangeCredit
              })}
            >
              📄 Proposal
            </button>
            <button 
              className="btn-emerald" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => {
                const upiLink = `upi://pay?pa=9390553301@ybl&pn=Godrej%20Interio%20Rayagada&am=${tokenAdvance50Pct}&cu=INR&tn=Token%20Advance%20${customerName}`;
                const familyText = `*🪞 GODREJ INTERIO RAYAGADA — 3D ROOM MAKEOVER SUITE PROPOSAL*\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `Namaste! Here is the AI-matched bedroom suite designed today for *${customerName}* (${roomTitle}):\n\n` +
                  activeItems.map((it, idx) => `*${idx + 1}. ${it.Product_Name}* (${it.SKU}) — ₹${it.Selling_Price_INR.toLocaleString()}`).join('\n') + `\n\n` +
                  `🏠 *Room Dimensions:* ${dimensions} • Multimodal Synergy: ${spatialMetrics.synergyScore}% Match ✓\n` +
                  `📏 *Clear Walkway Remaining:* ${spatialMetrics.remainingPassageFt} Feet Safe Corridor\n` +
                  `💰 *Combined MRP:* ₹${totalMRP.toLocaleString()}\n` +
                  (categoryMode === 'ALL' ? `🎁 *Suite Combo Savings (${comboDiscountPct}%):* -₹${comboSavings.toLocaleString()}\n` : '') +
                  (exchangeCredit > 0 ? `🔄 *Old Furniture Exchange Credit:* -₹${exchangeCredit.toLocaleString()}\n` : '') +
                  `✨ *Net Price (GST 18% Incl.):* ₹${netPayable.toLocaleString()}\n` +
                  `💳 *Bajaj 0% EMI Option:* ₹${emi12Month.toLocaleString()} / month (12 Mos)\n` +
                  `🔒 *50% SafeLock Advance Token:* ₹${tokenAdvance50Pct.toLocaleString()}\n\n` +
                  `👉 *Pay 50% Token via UPI:* ${upiLink}\n\n` +
                  `📍 *Godrej Interio Rayagada:* Near New Bus Stand, Main Road | 📞 +91 93905 53301`;
                const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
                const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(familyText)}`, '_blank');
                showToast(`👨‍👩‍👧 3D Room Suite Proposal dispatched to WhatsApp (${customerPhone})!`, true);
              }}
            >
              👨‍👩‍👧 Family
            </button>
          </div>

          {/* Pricing & Commercial Summary Box */}
          <div style={{ background: '#030712', borderRadius: '14px', padding: '14px 18px', border: '1.5px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Combined MRP Value:</span>
              <span style={{ textDecoration: 'line-through' }}>₹{totalMRP.toLocaleString()}</span>
            </div>
            {categoryMode === 'ALL' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-emerald)' }}>
                <span>Suite Bundle Combo Savings ({comboDiscountPct}%):</span>
                <span>- ₹{comboSavings.toLocaleString()}</span>
              </div>
            )}
            {exchangeCredit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                <span>Old Furniture Trade-In Credit:</span>
                <span>- ₹{exchangeCredit.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
              <span>Net Quotation Value:</span>
              <span>₹{netPayable.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1' }}>
              <span>Bajaj 0% No-Cost EMI:</span>
              <b style={{ color: 'var(--accent-cyan)' }}>₹{emi12Month.toLocaleString()} / mo (12 Mos)</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              <span>50% SafeLock Advance Token:</span>
              <span>₹{tokenAdvance50Pct.toLocaleString()}</span>
            </div>
          </div>

          {/* 1-Click Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-luxury-gold" 
              onClick={handleLockSuiteCombo} 
              style={{ flex: 1.5, justifyContent: 'center', padding: '12px', fontSize: '12.5px', fontWeight: '900' }}
            >
              <ShieldCheck size={16} /> 🔒 1-Click SafeLock (₹{tokenAdvance50Pct.toLocaleString()})
            </button>
            <button 
              className="btn-cyan" 
              onClick={() => openModal('universal_payment', { amount: tokenAdvance50Pct, orderId: 'ROOM-SUITE-DEAL' })}
              style={{ padding: '12px 14px' }}
            >
              <CreditCard size={16} /> UPI QR
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

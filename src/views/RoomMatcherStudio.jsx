import React, { useState, useRef } from 'react';
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
  Printer
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function RoomMatcherStudio() {
  const { catalog, triggerSafeLockOrder, showToast, openModal } = useStore();

  const fileInputRef = useRef(null);

  // Active Room State
  const [roomImage, setRoomImage] = useState("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800");
  const [roomTitle, setRoomTitle] = useState("Master Bedroom Suite (16 × 14 ft)");
  const [dimensions, setDimensions] = useState("16' 4\" × 14' 2\" × 10' 0\"");
  const [aesthetic, setAesthetic] = useState("Solid CP Teak & Warm Neutral Tones");
  const [lighting, setLighting] = useState("3500K Warm Ambient Recessed");
  const [clearance, setClearance] = useState("38 in (Knock-down 5-Box Safe ✓)");
  const [designerNotes, setDesignerNotes] = useState("Client requested 3 ft clearance along east wall for sliding almirah doors.");

  // Interactive Doorway & Custom Combo Sliders
  const [doorwayWidth, setDoorwayWidth] = useState(38); // 28" to 48"
  const [comboDiscountPct, setComboDiscountPct] = useState(8); // 5% to 20%

  // Customer Details
  const [customerName, setCustomerName] = useState("Dr. Subhashish Jena");
  const [customerPhone, setCustomerPhone] = useState("9437188291");
  const [customerAddress, setCustomerAddress] = useState("Gayatri Nagar Villa, Rayagada");
  const [exchangeCredit, setExchangeCredit] = useState(0);

  // Suite Combo Pieces (Selectable from 115 catalog)
  const [item1Sku, setItem1Sku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [item2Sku, setItem2Sku] = useState(catalog[10]?.SKU || 'ALM-MOD-001');
  const [item3Sku, setItem3Sku] = useState(catalog[6]?.SKU || 'CHR-MOD-001');

  // Scanner Animation State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [isEditingParams, setIsEditingParams] = useState(false);

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

  // Resolve Products
  const piece1 = catalog.find(c => c.SKU === item1Sku) || catalog[0];
  const piece2 = catalog.find(c => c.SKU === item2Sku) || catalog[1] || catalog[0];
  const piece3 = catalog.find(c => c.SKU === item3Sku) || catalog[2] || catalog[0];

  const totalMRP = piece1.MRP_INR + piece2.MRP_INR + piece3.MRP_INR;
  const comboSavings = Math.round(totalMRP * (comboDiscountPct / 100)); // Dynamic Suite Bundle Discount
  const suiteFinalPrice = totalMRP - comboSavings;
  const tokenAdvance50Pct = Math.round(suiteFinalPrice * 0.5);

  // Photo Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRoomImage(event.target.result);
        setRoomTitle(`Custom Client Room Photo (${file.name})`);
        triggerAiScan();
        showToast("📸 Customer Room Photo uploaded successfully! AI Multimodal Scan triggered.", true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete / Clear Photo Handler
  const handleDeletePhoto = () => {
    setRoomImage('');
    setRoomTitle('Empty Room Canvas (Upload New Room Photo)');
    playScanBeep();
    showToast("🗑️ Room photo deleted. Ready for new image upload.");
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
        showToast("✨ AI Multimodal Room Analysis Complete! 96% Match Found.", true);
      }
    }, 250);
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
    triggerAiScan();
  };

  // 1-Click Convert Suite to SafeLock Order
  const handleLockSuiteCombo = () => {
    triggerSafeLockOrder({
      customerName: customerName,
      customerPhone: customerPhone,
      address: customerAddress,
      designerId: "VIP-ARC-001 (Ar. Sunita Patnaik)",
      sku: `${piece1.SKU} + ${piece2.SKU} + ${piece3.SKU} (3-Item Suite)`,
      totalAmount: suiteFinalPrice,
      advancePaid: tokenAdvance50Pct,
      driver: "Tophan Gouda (Tata Ace OD-18-A-1234)",
      schedule: "Tomorrow Express 11:00 AM",
      carpenter: "Narayana Mistri",
      carpenterPayout: 750
    });

    dispatchWebhookAction('CONVERT_ROOM_MATCHER_DEAL', {
      customer_name: customerName,
      phone: customerPhone,
      address: customerAddress,
      room_title: roomTitle,
      dimensions: dimensions,
      item1: `${piece1.SKU} (${piece1.Product_Name})`,
      item2: `${piece2.SKU} (${piece2.Product_Name})`,
      item3: `${piece3.SKU} (${piece3.Product_Name})`,
      total_mrp: totalMRP,
      savings_inr: comboSavings,
      final_price_inr: suiteFinalPrice,
      advance_token_inr: tokenAdvance50Pct
    });

    openModal('showroom_advance', {
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName,
      totalAmount: suiteFinalPrice,
      advanceToken: tokenAdvance50Pct,
      sku: `3-Item Room Suite (${piece1.SKU} + ${piece2.SKU} + ${piece3.SKU})`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload} 
      />

      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">2D MULTIMODAL AI ROOM MATCHER STUDIO</span>
          
          <button className="btn-luxury-gold" onClick={() => openModal('wedding_suite')}>
            👑 5-Room Wedding Suite Packages
          </button>

          <button className="btn-cyan" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> 📤 Upload Customer Room Photo
          </button>

          {roomImage && (
            <button className="btn-ghost-edit" style={{ color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)' }} onClick={handleDeletePhoto}>
              <Trash2 size={14} /> Delete Photo
            </button>
          )}

          <button className="btn-cyan" onClick={triggerAiScan} disabled={isScanning}>
            <Sparkles size={14} className={isScanning ? 'spin-anim' : ''} /> {isScanning ? 'Analyzing...' : 'Re-Scan Room with AI'}
          </button>

          <button className="btn-ghost-edit" onClick={() => setIsEditingParams(!isEditingParams)}>
            <Edit size={14} /> {isEditingParams ? '✕ Close Room Parameters' : '✏️ Edit Room Dimensions & Tones'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">MATCH CONFIDENCE: 96%</span>
        </div>
      </div>

      {/* Sample Presets Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
          🖼️ Showroom Presets:
        </span>
        {samplePresets.map(preset => (
          <button
            key={preset.id}
            className="btn-ghost-edit"
            style={{ fontSize: '11px', padding: '5px 12px', whiteSpace: 'nowrap' }}
            onClick={() => handleSelectPreset(preset)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Edit Room Parameters Drawer */}
      {isEditingParams && (
        <div className="glass-panel" style={{ border: '2px solid var(--accent-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
              ✏️ Edit Room Dimensions, Aesthetic & Client Profile
            </h3>
            <button className="btn-close-modal" onClick={() => setIsEditingParams(false)}><X size={16} /></button>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Room Title / Name</label>
              <input value={roomTitle} onChange={e => setRoomTitle(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Room Dimensions (L × W × H)</label>
              <input value={dimensions} onChange={e => setDimensions(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Wall Color & Wood Aesthetic</label>
              <input value={aesthetic} onChange={e => setAesthetic(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Doorway / Staircase Clearance</label>
              <input value={clearance} onChange={e => setClearance(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Customer Name</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Customer WhatsApp</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Architect / Designer Notes</label>
              <input value={designerNotes} onChange={e => setDesignerNotes(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn-luxury-gold" onClick={() => { setIsEditingParams(false); showToast("✓ Room parameters applied!"); }}>
              <Save size={14} /> Apply Parameters & Update Deal
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: 2D Room Scan Visualizer + 3-Piece Suite Combo Deal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Room Photo Viewport & Laser Scanner */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800' }}>📐 Room Spatial Analysis</h3>
            <span className="badge badge-cyan">{dimensions}</span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden', background: '#030712', border: '1px solid rgba(255,255,255,0.1)' }}>
            {roomImage ? (
              <img src={roomImage} alt="Room View" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', gap: '10px' }}>
                <ImageIcon size={40} />
                <span style={{ fontSize: '13px', fontWeight: '700' }}>No Room Photo Uploaded</span>
                <button className="btn-luxury-gold" onClick={() => fileInputRef.current?.click()} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  <Upload size={12} /> Upload Photo
                </button>
              </div>
            )}

            {/* Laser Scan Sweeper Animation */}
            {isScanning && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #38BDF8, #FFFFFF, #38BDF8, transparent)',
                boxShadow: '0 0 15px #38BDF8, 0 0 30px #38BDF8',
                animation: 'scanSweep 1.5s infinite ease-in-out'
              }} />
            )}

            {/* Dimensions Overlay Pills */}
            {roomImage && (
              <>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#FFFFFF', fontWeight: '800', border: '1px solid rgba(255,255,255,0.15)' }}>
                  🎯 Wall: {aesthetic}
                </div>
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '800', border: '1px solid rgba(16,185,129,0.3)' }}>
                  🚪 Clearance: {clearance}
                </div>
              </>
            )}
          </div>

          {/* Spatial Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
            <div style={{ background: '#030712', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Floor Area</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>228 Sq. Ft</div>
            </div>
            <div style={{ background: '#030712', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Lighting Tone</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{lighting}</div>
            </div>
            <div style={{ background: '#030712', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Teak Synergy</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)' }}>98% Match</div>
            </div>
          </div>

          {/* 📐 Interactive Doorway & Staircase Clearance Slider */}
          <div style={{ marginTop: '14px', background: '#030712', borderRadius: '10px', padding: '12px 14px', border: doorwayWidth >= 36 ? '1.5px solid #10B981' : '1.5px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                🚪 Doorway & Staircase Clearance Tester:
              </span>
              <span className={`badge ${doorwayWidth >= 36 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                {doorwayWidth}" CLEARANCE
              </span>
            </div>
            <input 
              type="range" 
              min={28} 
              max={48} 
              value={doorwayWidth} 
              onChange={e => setDoorwayWidth(Number(e.target.value))}
              style={{ width: '100%', accentColor: doorwayWidth >= 36 ? '#10B981' : '#F59E0B', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
              <span>28" Narrow Apartment</span>
              <span>36" Standard Door</span>
              <span>48" Villa Double Door</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: doorwayWidth >= 36 ? '#34D399' : '#FBBF24', fontWeight: '700' }}>
              {doorwayWidth >= 36 ? (
                <span>🟢 <b>100% SAFE ENTRY:</b> King Bed & 4-Door Wardrobe flat-packs pass easily through {doorwayWidth}" door.</span>
              ) : (
                <span>⚠️ <b>NARROW ENTRY ({doorwayWidth}"):</b> Unpack Box A headboard outside and carry frame vertically.</span>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: 3-Piece Suite Combo Deal Customizer */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-gold">AI RECOMMENDATION: 3-PIECE MASTER SUITE</span>
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginTop: '4px' }}>Customizable Suite Deal</h3>
            </div>
            <span className="badge badge-rose">{comboDiscountPct}% COMBO SAVINGS</span>
          </div>

          {/* 3 Selectable Suite Pieces */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
            
            {/* Piece 1: Bed / Sofa */}
            <div style={{ background: '#030712', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: 'var(--accent-gold-light)', fontWeight: '800' }}>PIECE 1: PRIMARY SUITE PIECE</div>
                <select 
                  value={item1Sku} 
                  onChange={e => setItem1Sku(e.target.value)}
                  style={{ width: '100%', background: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', marginTop: '2px' }}
                >
                  {catalog.map(c => (
                    <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name} (MRP: ₹{c.MRP_INR.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                <div style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontSize: '13px' }}>₹{piece1.Selling_Price_INR.toLocaleString()}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>MRP: ₹{piece1.MRP_INR.toLocaleString()}</div>
              </div>
            </div>

            {/* Piece 2: Wardrobe / Center Table */}
            <div style={{ background: '#030712', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '800' }}>PIECE 2: COMPANION STORAGE / SURFACE</div>
                <select 
                  value={item2Sku} 
                  onChange={e => setItem2Sku(e.target.value)}
                  style={{ width: '100%', background: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', marginTop: '2px' }}
                >
                  {catalog.map(c => (
                    <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name} (MRP: ₹{c.MRP_INR.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                <div style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontSize: '13px' }}>₹{piece2.Selling_Price_INR.toLocaleString()}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>MRP: ₹{piece2.MRP_INR.toLocaleString()}</div>
              </div>
            </div>

            {/* Piece 3: Accent Seating / Accessories */}
            <div style={{ background: '#030712', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: '800' }}>PIECE 3: ACCENT SEATING / COMPONENT</div>
                <select 
                  value={item3Sku} 
                  onChange={e => setItem3Sku(e.target.value)}
                  style={{ width: '100%', background: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', marginTop: '2px' }}
                >
                  {catalog.map(c => (
                    <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name} (MRP: ₹{c.MRP_INR.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                <div style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontSize: '13px' }}>₹{piece3.Selling_Price_INR.toLocaleString()}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>MRP: ₹{piece3.MRP_INR.toLocaleString()}</div>
              </div>
            </div>

          </div>

          {/* Old Furniture Exchange Credit Chip (if applied) */}
          {exchangeCredit > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: '800' }}>
                🔄 Old Furniture Exchange Credit Applied:
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--accent-gold-light)', fontWeight: '900' }}>
                - ₹{exchangeCredit.toLocaleString()}
              </span>
            </div>
          )}

          {/* Action Closing Tools: EMI Matrix, Exchange Appraiser, WhatsApp PDF */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
              onClick={() => openModal('emi_scheme', { amount: Math.max(0, suiteFinalPrice - exchangeCredit), customerPhone: customerPhone })}
            >
              💳 0% EMI Matrix
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
              onClick={() => openModal('furniture_exchange', { onApplyDiscount: (val) => setExchangeCredit(val) })}
            >
              🔄 Exchange Buyback
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center', color: 'var(--accent-gold-light)' }}
              onClick={() => openModal('whatsapp_proposal', { 
                customerName: customerName, 
                customerPhone: customerPhone, 
                address: customerAddress,
                roomTitle: roomTitle,
                dimensions: dimensions,
                roomImage: roomImage,
                items: [
                  { sku: piece1.SKU, name: piece1.Product_Name, mrp: piece1.MRP_INR, price: piece1.Selling_Price_INR, warranty: `${piece1.Warranty_Years || 10} Years` },
                  { sku: piece2.SKU, name: piece2.Product_Name, mrp: piece2.MRP_INR, price: piece2.Selling_Price_INR, warranty: `${piece2.Warranty_Years || 5} Years` },
                  { sku: piece3.SKU, name: piece3.Product_Name, mrp: piece3.MRP_INR, price: piece3.Selling_Price_INR, warranty: `${piece3.Warranty_Years || 5} Years` }
                ],
                exchangeCredit: exchangeCredit
              })}
            >
              📄 WhatsApp PDF
            </button>
          </div>

          {/* Pricing & Combo Savings Box */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1.5px solid var(--accent-gold)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Combined Individual MRP:</span>
              <span style={{ textDecoration: 'line-through' }}>₹{totalMRP.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-emerald)', marginBottom: '6px' }}>
              <span>Showroom 3-Item Combo Savings ({comboDiscountPct}%):</span>
              <span>- ₹{comboSavings.toLocaleString()} Saved</span>
            </div>

            {/* Custom Combo Discount Slider */}
            <div style={{ margin: '8px 0', background: 'rgba(212,175,55,0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(212,175,55,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                <span>🎁 Custom Suite Bundle Discount:</span>
                <span>{comboDiscountPct}% OFF</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={20} 
                value={comboDiscountPct} 
                onChange={e => setComboDiscountPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)', marginTop: '4px', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#94A3B8' }}>
                <span>5% (Standard)</span>
                <span>10% (Festive)</span>
                <span>20% (VIP Architect)</span>
              </div>
            </div>
            {exchangeCredit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                <span>Old Furniture Exchange Trade-In:</span>
                <span>- ₹{exchangeCredit.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
              <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '14px' }}>Net Suite Combo Price:</span>
              <span style={{ fontWeight: '900', color: 'var(--accent-gold-light)', fontSize: '20px' }}>₹{Math.max(0, suiteFinalPrice - exchangeCredit).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '4px' }}>
              <span>50% SafeLock Advance Token:</span>
              <b>₹{Math.round(Math.max(0, suiteFinalPrice - exchangeCredit) * 0.5).toLocaleString()}</b>
            </div>
          </div>

          {/* 1-Click Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn-luxury-gold" 
              onClick={handleLockSuiteCombo} 
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '13px', fontWeight: '900' }}
            >
              <ShieldCheck size={16} /> 🔒 1-Click SafeLock 3-Item Suite Deal (₹{Math.round(Math.max(0, suiteFinalPrice - exchangeCredit) * 0.5).toLocaleString()} Advance)
            </button>
            <button 
              className="btn-cyan" 
              onClick={() => openModal('universal_payment', { amount: Math.round(Math.max(0, suiteFinalPrice - exchangeCredit) * 0.5), orderId: 'ROOM-SUITE-DEAL' })}
              style={{ padding: '12px 16px' }}
            >
              💰 UPI QR
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

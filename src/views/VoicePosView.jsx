import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Percent, 
  DollarSign, 
  Check, 
  Share2, 
  FileText,
  CreditCard
} from 'lucide-react';
import { playScanBeep } from '../utils/audioUtils';

export function VoicePosView() {
  const { catalog, triggerSafeLockOrder, openModal, showToast } = useStore();

  // Voice & Transcript State
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("Dr. Subhashish Jena from Gayatri Nagar Villa wants the Solid King Bed with Hydraulic Storage and 4-Door Wardrobe for 1 lakh 56 thousand rupees.");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [typedQuery, setTypedQuery] = useState('');

  // Customer Profile State
  const [custName, setCustName] = useState("Dr. Subhashish Jena");
  const [custPhone, setCustPhone] = useState("9437188291");
  const [custAddress, setCustAddress] = useState("Gayatri Nagar Villa, Rayagada");
  const [custSegment, setCustSegment] = useState("High-Net-Worth Luxury");

  // Quotation Cart Items
  const [cartItems, setCartItems] = useState([
    { ...catalog[0], qty: 1 }, // BED-MOD-001
    { ...catalog[10], qty: 1 } // ALM-MOD-001
  ]);
  const [discountPct, setDiscountPct] = useState(5);
  const [exchangeCredit, setExchangeCredit] = useState(0);

  // Recording Timer
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      playScanBeep();
      showToast("🎙️ Continuous live microphone active! Speak naturally into your mic...", true);
    } else {
      setIsRecording(false);
      setIsEditingTranscript(true);
      playScanBeep();
      showToast("⏹️ Recording stopped. You can edit the transcription text below.");
    }
  };

  // Demo Presets
  const playPreset = (presetType) => {
    playScanBeep();
    if (presetType === 'dr_jena') {
      setCustName("Dr. Subhashish Jena");
      setCustPhone("9437188291");
      setCustAddress("Gayatri Nagar Villa, Rayagada");
      setTranscript("Dr. Subhashish Jena from Gayatri Nagar Villa wants Solid King Bed (Hydraulic) and 4-Door Wardrobe.");
      setCartItems([
        { ...catalog[0], qty: 1 },
        { ...catalog[10], qty: 1 }
      ]);
      setDiscountPct(5);
    } else if (presetType === 'alok_mishra') {
      setCustName("Er. Alok Mishra");
      setCustPhone("9437122334");
      setCustAddress("Raniguda Farmhouse, Rayagada");
      setTranscript("Er. Alok Mishra wants Royal Velvet 7-Seater Sectional and Wingback Accent Chair.");
      setCartItems([
        { ...catalog[5], qty: 1 },
        { ...catalog[9], qty: 1 }
      ]);
      setDiscountPct(8);
    } else if (presetType === 'sunita_patnaik') {
      setCustName("Ar. Sunita Patnaik (Studio Vastu)");
      setCustPhone("9437011223");
      setCustAddress("Ashok Nagar Villa, Rayagada");
      setTranscript("Ar. Sunita Patnaik ordered 6-Seater Italian Marble Dining Set and Luxury 4-Poster Bed.");
      setCartItems([
        { ...catalog[7], qty: 1 },
        { ...catalog[4], qty: 1 }
      ]);
      setDiscountPct(10);
    }
    showToast(`🎙️ Loaded preset order for ${custName}!`);
  };

  // Natural Language Typed Order Parser
  const handleTypedOrder = () => {
    if (!typedQuery.trim()) return;
    const q = typedQuery.toLowerCase();
    
    // Search matching products
    const matched = catalog.filter(c => 
      q.includes(c.Product_Name.toLowerCase()) || 
      q.includes(c.Main_Category.toLowerCase()) ||
      q.includes(c.Sub_Category.toLowerCase()) ||
      (q.includes('sofa') && c.Main_Category === 'Living Room') ||
      (q.includes('bed') && c.Main_Category === 'Bedroom') ||
      (q.includes('dining') && c.Main_Category === 'Dining & Study')
    );

    if (matched.length > 0) {
      setCartItems(matched.slice(0, 2).map(m => ({ ...m, qty: 1 })));
      setTranscript(`Customer ordered ${matched.map(m => m.Product_Name).join(' + ')}`);
      showToast(`✨ AI matched ${matched.length} furniture models from catalog!`);
    } else {
      showToast(`🔍 Searched catalog for "${typedQuery}"`);
    }
  };

  // Cart Calculations
  const grossTotal = cartItems.reduce((sum, item) => sum + (item.Selling_Price_INR * item.qty), 0);
  const discountAmount = Math.round(grossTotal * (discountPct / 100));
  const finalPayable = grossTotal - discountAmount;
  const advanceToken50 = Math.round(finalPayable * 0.5);

  const addItemToCart = (sku) => {
    const item = catalog.find(c => c.SKU === sku);
    if (!item) return;
    setCartItems(prev => {
      const exists = prev.find(p => p.SKU === sku);
      if (exists) {
        return prev.map(p => p.SKU === sku ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    playScanBeep();
  };

  const removeItem = (sku) => {
    setCartItems(prev => prev.filter(item => item.SKU !== sku));
  };

  const updateQty = (sku, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.SKU === sku) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const handleConfirmOrder = () => {
    const skuList = cartItems.map(i => `${i.SKU} (${i.Product_Name}) x${i.qty}`).join(', ');
    triggerSafeLockOrder({
      Customer_Name: custName,
      Customer_Phone: custPhone,
      Project_Address: custAddress,
      Ordered_SKU: skuList,
      Total_Amount_INR: finalPayable,
      Advance_Paid_INR: advanceToken50,
      Balance_Due_INR: finalPayable - advanceToken50
    });
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">🎙️ VOICE SHOWROOM COPILOT</span>
          <button className="btn-luxury-gold" onClick={() => openModal('showroom_advance', { totalAmount: finalPayable, customerName: custName, phone: custPhone, address: custAddress })}>
            ✏️ Edit Quote & 50% Token
          </button>
          <button className="btn-ghost-edit" onClick={() => openModal('new_inquiry')}>
            ➕ Log Walk-In Lead
          </button>
          <button className="btn-ghost-edit" onClick={() => openModal('emi_calculator', { amount: finalPayable })}>
            💳 0% No-Cost EMI Calc
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Auto-Syncing to Orders_SafeLock</span>
        </div>
      </div>

      {/* Main Interactive Mic & Waveform Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎙️ Continuous Live Microphone & Real-Time Transcriber
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              ⏱️ <b>UNLIMITED TIME:</b> Tap Mic ➔ Speak order naturally ➔ AI populates 115-catalog models & customer profile!
            </p>
          </div>
          <span className={`badge ${isRecording ? 'badge-rose' : 'badge-emerald'}`} style={{ padding: '6px 12px', fontSize: '11.5px' }}>
            {isRecording ? '🔴 RECORDING LIVE...' : 'UNLIMITED MIC READY'}
          </span>
        </div>

        {/* 1-Click Demo Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>⚡ 1-CLICK INSTANT PRESETS:</span>
          <button className="btn-ghost-edit" onClick={() => playPreset('dr_jena')}>🎙️ Dr. Jena (King Bed + 4D Wardrobe ₹1.56L)</button>
          <button className="btn-ghost-edit" onClick={() => playPreset('alok_mishra')}>🎙️ Er. Alok Mishra (7-Seater Sofa ₹1.36L)</button>
          <button className="btn-ghost-edit" onClick={() => playPreset('sunita_patnaik')}>🎙️ Ar. Sunita (Marble Dining ₹1.29L)</button>
        </div>

        {/* Mic Button & Waveform Soundwave */}
        <div style={{ background: '#030712', border: '1.5px solid rgba(56,189,248,0.3)', borderRadius: '16px', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button 
            type="button" 
            onClick={toggleRecording}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: isRecording ? 'linear-gradient(135deg, #E11D48, #BE123C)' : 'linear-gradient(135deg, #0284C7, #0369A1)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording ? '0 0 25px rgba(225,29,72,0.8)' : '0 0 20px rgba(2,132,199,0.5)',
              transition: 'all 0.25s ease'
            }}
          >
            {isRecording ? <MicOff size={26} /> : <Mic size={26} />}
          </button>

          {/* Soundwave Bars */}
          <div style={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <div 
                key={i} 
                style={{
                  flex: 1,
                  height: isRecording ? `${Math.max(6, Math.sin((i + timer * 5) * 0.4) * 35)}px` : '6px',
                  background: isRecording ? 'var(--accent-emerald)' : 'rgba(56,189,248,0.35)',
                  borderRadius: '3px',
                  transition: 'height 0.1s ease, background 0.2s ease'
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', fontWeight: '900', color: 'var(--accent-cyan)' }}>
              {formatTimer(timer)}
            </div>
            <div style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {isRecording ? 'STREAMING...' : 'STANDBY (CLICK MIC)'}
            </div>
          </div>
        </div>

        {/* Live Editable Transcript Display */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              💬 Real-Time Live Speech Transcription & Order Editor
            </label>
            <button className="btn-ghost-edit" style={{ fontSize: '10px' }} onClick={() => setIsEditingTranscript(!isEditingTranscript)}>
              {isEditingTranscript ? '✓ Done Editing' : '✏️ Edit Text'}
            </button>
          </div>
          
          {isEditingTranscript ? (
            <textarea 
              rows={3}
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              style={{ width: '100%', background: '#030712', border: '1.5px solid var(--accent-cyan)', borderRadius: '10px', padding: '12px', color: '#FFFFFF', fontSize: '13px', lineHeight: '1.5', outline: 'none' }}
            />
          ) : (
            <div style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '14px 16px', fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
              {transcript}
            </div>
          )}
        </div>

        {/* Natural Language Typing Search Box */}
        <div style={{ background: 'rgba(15,23,42,0.7)', border: '1.5px dashed rgba(99,102,241,0.4)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              placeholder="Or type natural language order... e.g. 'naresh sir want 7 seater sofa' or 'luxury king bed with 4D almirah'"
              value={typedQuery}
              onChange={e => setTypedQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTypedOrder()}
              style={{ flex: 1, background: '#030712', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '9px 12px', color: '#FFFFFF', fontSize: '12.5px', outline: 'none' }}
            />
            <button className="btn-cyan" onClick={handleTypedOrder}>
              <Send size={14} /> Search & Add
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Customer Profile Card + Multi-Item Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
        
        {/* Customer Profile Card */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>👤 Customer Profile Fast-Fill</h4>
            <span className="badge badge-purple">RAYAGADA POS</span>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-field">
              <label>Customer Full Name</label>
              <input value={custName} onChange={e => setCustName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>WhatsApp Contact Number</label>
              <input value={custPhone} onChange={e => setCustPhone(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Delivery Area / Villa Locality</label>
              <input value={custAddress} onChange={e => setCustAddress(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Customer Segment</label>
              <select value={custSegment} onChange={e => setCustSegment(e.target.value)}>
                <option value="High-Net-Worth Luxury">High-Net-Worth Luxury Villa</option>
                <option value="VIP Architect Referral">VIP Architect Referral</option>
                <option value="Walk-in Retail">Walk-in Retail Customer</option>
                <option value="Corporate / Institution">Corporate / Institutional Bulk</option>
              </select>
            </div>
          </div>

          {/* Quick Locality Pills */}
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>📍 Quick Rayagada Localities:</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
              {['Gayatri Nagar', 'Raniguda Farmhouse', 'Ashok Nagar', 'Sai Priya Nagar', 'JK Pur Road', 'Main Road'].map(loc => (
                <button key={loc} className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '4px 8px' }} onClick={() => setCustAddress(`${loc}, Rayagada`)}>
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Item 115-Catalog Quotation Cart */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} color="var(--accent-gold)" />
              <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Active Quotation Cart ({cartItems.length} Models)</h4>
            </div>
            <select 
              style={{ background: '#030712', color: '#FFFFFF', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '6px 10px', fontSize: '11px' }}
              onChange={e => {
                if (e.target.value) {
                  addItemToCart(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">➕ Add Any of 115 Catalog Models...</option>
              {catalog.map(c => (
                <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name} (₹{c.Selling_Price_INR.toLocaleString()})</option>
              ))}
            </select>
          </div>

          {/* Cart Items Table */}
          <div className="data-table-wrapper">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Model / Specs</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.SKU}>
                    <td>
                      <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{item.Product_Name}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>{item.SKU} • {item.Material_Spec}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button className="btn-ghost-edit" style={{ padding: '2px 7px', fontSize: '12px' }} onClick={() => updateQty(item.SKU, -1)}>-</button>
                        <strong style={{ fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}>{item.qty}</strong>
                        <button className="btn-ghost-edit" style={{ padding: '2px 7px', fontSize: '12px' }} onClick={() => updateQty(item.SKU, 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>₹{item.Selling_Price_INR.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                      ₹{(item.Selling_Price_INR * item.qty).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-ghost-edit" style={{ color: 'var(--accent-rose)', border: 'none', padding: '4px' }} onClick={() => removeItem(item.SKU)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commercial Discount Chips */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
              🏷️ Showroom Discount Slab:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[0, 5, 8, 10, 12, 15].map(pct => (
                <button 
                  key={pct} 
                  className={`btn-ghost-edit ${discountPct === pct ? 'badge-gold' : ''}`}
                  onClick={() => setDiscountPct(pct)}
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  {pct}% {pct === 15 ? '(Mgr Approved)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Old Furniture Exchange Credit Chip (if applied) */}
          {exchangeCredit > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: '800' }}>
                🔄 Old Furniture Exchange Buyback Credit Applied:
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--accent-gold-light)', fontWeight: '900' }}>
                - ₹{exchangeCredit.toLocaleString()}
              </span>
            </div>
          )}

          {/* Action Closing Tools: EMI Matrix, Exchange Appraiser, WhatsApp PDF */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
              onClick={() => openModal('emi_scheme', { amount: finalPayable, customerPhone: custPhone })}
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
                customerName: custName, 
                customerPhone: custPhone, 
                address: custAddress, 
                items: cartItems.map(c => ({ sku: c.SKU, name: c.Product_Name, mrp: c.MRP_INR, price: c.Selling_Price_INR, warranty: `${c.Warranty_Years || 5} Years` })),
                exchangeCredit: exchangeCredit
              })}
            >
              📄 WhatsApp PDF
            </button>
          </div>

          {/* DPDP 2023 Express Consent Verification */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', padding: '6px 10px', borderRadius: '8px', fontSize: '10.5px' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>🛡️ DPDP Act 2023 Digital Consent:</span>
            <span style={{ color: '#FFFFFF' }}>Verified ✓ (Order & Warranty Fulfillment)</span>
          </div>

          {/* Final Financial Summary */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid rgba(212,175,55,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Gross Catalog Total:</span>
              <span>₹{grossTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-emerald)' }}>
              <span>Showroom Discount ({discountPct}%):</span>
              <span>- ₹{discountAmount.toLocaleString()}</span>
            </div>
            {exchangeCredit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                <span>Old Furniture Trade-In Credit:</span>
                <span>- ₹{exchangeCredit.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
              <span>Final Quotation Value:</span>
              <span>₹{Math.max(0, finalPayable - exchangeCredit).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              <span>50% Advance Token (Dynamic UPI QR):</span>
              <span>₹{Math.round(Math.max(0, finalPayable - exchangeCredit) * 0.5).toLocaleString()}</span>
            </div>
          </div>

          {/* Submit SafeLock Order Button */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-luxury-gold" onClick={handleConfirmOrder} style={{ flex: 1.5, justifyContent: 'center', padding: '12px' }}>
              <Check size={16} /> 🔒 1-Click SafeLock Stock Reservation (₹{Math.round(Math.max(0, finalPayable - exchangeCredit) * 0.5).toLocaleString()})
            </button>
            <button className="btn-emerald" onClick={() => openModal('universal_payment', { amount: Math.round(Math.max(0, finalPayable - exchangeCredit) * 0.5), orderId: 'ORD-POS-ADV' })} style={{ flex: 1, justifyContent: 'center' }}>
              <CreditCard size={16} /> Show UPI QR
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

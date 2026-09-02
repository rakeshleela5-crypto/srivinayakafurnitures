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
  CreditCard,
  UserCheck,
  Compass,
  Building2,
  ShieldCheck,
  Flame,
  Printer
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function VoicePosView() {
  const { catalog, inquiries, triggerSafeLockOrder, openModal, showToast, setActiveTab } = useStore();

  // Voice & Transcript State
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("Dr. Subhashish Jena from Gayatri Nagar Villa wants the Solid King Bed with Hydraulic Storage and 4-Door Wardrobe for 1 lakh 56 thousand rupees.");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [typedQuery, setTypedQuery] = useState('');
  const [posStep, setPosStep] = useState(1);

  // Customer Profile State
  const [custName, setCustName] = useState("Dr. Subhashish Jena");
  const [custPhone, setCustPhone] = useState("9437188291");
  const [custAddress, setCustAddress] = useState("Gayatri Nagar Villa, Rayagada");
  const [custSegment, setCustSegment] = useState("High-Net-Worth Luxury");

  // Quotation Cart Items
  const [cartItems, setCartItems] = useState([
    { ...(catalog[0] || { SKU: 'BED-MOD-001', Product_Name: 'Solid Teak King Bed', Selling_Price_INR: 62000, Material_Spec: 'Teak Wood', Warranty_Years: 10 }), qty: 1 },
    { ...(catalog[10] || { SKU: 'WDR-MOD-001', Product_Name: 'Godrej Sliding Wardrobe', Selling_Price_INR: 48000, Material_Spec: 'CRCA Steel', Warranty_Years: 10 }), qty: 1 }
  ]);
  const [discountPct, setDiscountPct] = useState(5);
  const [exchangeCredit, setExchangeCredit] = useState(0);

  // Manager Spot Negotiation Override State
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerPin, setManagerPin] = useState('');
  const [customSpotDiscount, setCustomSpotDiscount] = useState(0);
  const [managerOverrideApplied, setManagerOverrideApplied] = useState(false);

  // Multi-Tender Split Payment State
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState(50000);
  const [upiAmount, setUpiAmount] = useState(50000);
  const [emiAmount, setEmiAmount] = useState(0);

  // Complimentary Gift Adders
  const [freePillows, setFreePillows] = useState(true);
  const [freeProtector, setFreeProtector] = useState(false);

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
        { ...(catalog[0] || {}), qty: 1 },
        { ...(catalog[10] || {}), qty: 1 }
      ]);
      setDiscountPct(5);
    } else if (presetType === 'alok_mishra') {
      setCustName("Er. Alok Mishra");
      setCustPhone("9437122334");
      setCustAddress("Raniguda Farmhouse, Rayagada");
      setTranscript("Er. Alok Mishra wants Royal Velvet 7-Seater Sectional and Wingback Accent Chair.");
      setCartItems([
        { ...(catalog[5] || catalog[0] || {}), qty: 1 },
        { ...(catalog[9] || catalog[1] || {}), qty: 1 }
      ]);
      setDiscountPct(8);
    } else if (presetType === 'sunita_patnaik') {
      setCustName("Ar. Sunita Patnaik (Studio Vastu)");
      setCustPhone("9437011223");
      setCustAddress("Ashok Nagar Villa, Rayagada");
      setTranscript("Ar. Sunita Patnaik ordered 6-Seater Italian Marble Dining Set and Luxury 4-Poster Bed.");
      setCartItems([
        { ...(catalog[7] || catalog[0] || {}), qty: 1 },
        { ...(catalog[4] || catalog[1] || {}), qty: 1 }
      ]);
      setDiscountPct(10);
    }
    showToast(`🎙️ Loaded preset order for ${custName}!`);
  };

  // 📥 Import Lead from Tab 8 (Showroom CRM)
  const handleImportLead = (leadId) => {
    const lead = inquiries.find(i => i.Inquiry_ID === leadId);
    if (!lead) return;
    
    setCustName(lead.Customer_Name || "Customer");
    setCustPhone(lead.Customer_Phone || "94371");
    setCustAddress(lead.Address || lead.Locality_Address || "Rayagada Town");
    setTranscript(`Walk-in customer ${lead.Customer_Name} interested in ${lead.Category_Models || 'Furniture'}. Budget: ₹${(lead.Budget_INR || 0).toLocaleString()}`);
    
    playScanBeep();
    showToast(`📥 Imported lead #${lead.Inquiry_ID} (${lead.Customer_Name}) into Voice POS!`, true);
  };

  // Natural Language Typed Order Parser
  const handleTypedOrder = () => {
    if (!typedQuery.trim()) return;
    const q = typedQuery.toLowerCase();
    
    // Search matching products
    const matched = catalog.filter(c => 
      (c.Product_Name || '').toLowerCase().includes(q) || 
      (c.Main_Category || '').toLowerCase().includes(q) ||
      (c.Sub_Category || '').toLowerCase().includes(q) ||
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

  // Cart Calculations with Dynamic Spot Negotiation
  const grossTotal = cartItems.reduce((sum, item) => sum + ((item.Selling_Price_INR || 50000) * item.qty), 0);
  const standardDiscountAmount = Math.round(grossTotal * (discountPct / 100));
  const totalDiscountAmount = standardDiscountAmount + (managerOverrideApplied ? Number(customSpotDiscount) : 0);
  const finalPayable = Math.max(0, grossTotal - totalDiscountAmount - exchangeCredit);
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
    const giftList = [freePillows ? '2x Ortho Pillows (FREE)' : '', freeProtector ? 'Mattress Protector (FREE)' : ''].filter(Boolean).join(', ');
    
    // Trigger SafeLock order (Tab 4 & Google Sheets Orders_SafeLock)
    triggerSafeLockOrder({
      Customer_Name: custName,
      Customer_Phone: custPhone,
      Project_Address: custAddress,
      Ordered_SKU: skuList + (giftList ? ` + Gifts: [${giftList}]` : ''),
      Total_Amount_INR: finalPayable,
      Advance_Paid_INR: advanceToken50,
      Balance_Due_INR: finalPayable - advanceToken50
    });

    // Webhook dispatch to Quote_Log
    dispatchWebhookAction('CREATE_COMMERCIAL_QUOTE', {
      customer_name: custName,
      customer_phone: custPhone,
      selected_model: skuList,
      base_price: grossTotal,
      discount_pct: discountPct,
      discount_amt: totalDiscountAmount,
      final_price: finalPayable,
      gross_margin_pct: '34.2%',
      manager_remarks: managerOverrideApplied ? `PIN 8899 Extra Discount ₹${customSpotDiscount}` : 'Standard Showroom Quote'
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔒 SafeLock Order Booked for ${custName} (₹${advanceToken50.toLocaleString()} Advance Paid)!`, true);
  };

  const applyManagerOverride = () => {
    if (managerPin === '8899') {
      setManagerOverrideApplied(true);
      setShowManagerModal(false);

      dispatchWebhookAction('APPLY_MANAGER_DISCOUNT', {
        customer_name: custName,
        customer_phone: custPhone,
        selected_model: cartItems.map(i => i.SKU).join(', '),
        coupon_code: "DIRECTOR_PIN_8899",
        discount_amt: Number(customSpotDiscount),
        final_price: Math.max(0, finalPayable - Number(customSpotDiscount)),
        manager_remarks: "Director PIN 8899 Approved"
      });

      playSuccessChime();
      showToast(`🔓 Manager PIN 8899 Approved! Extra ₹${customSpotDiscount.toLocaleString()} Spot Discount Applied ✓`, true);
    } else {
      showToast("❌ Invalid Manager PIN. Spot negotiation override denied.", false);
    }
  };

  const handleSaveSplitPayment = () => {
    setShowSplitPaymentModal(false);

    dispatchWebhookAction("SPLIT_PAYMENT_SETTLEMENT", {
      order_id: "ORD-POS-" + Math.floor(100 + Math.random() * 900),
      customer_name: custName,
      cash_amount: cashAmount,
      upi_amount: upiAmount,
      emi_amount: emiAmount,
      timestamp: new Date().toISOString()
    });

    playSuccessChime();
    showToast(`💳 Split Payment (Cash: ₹${cashAmount.toLocaleString()}, UPI: ₹${upiAmount.toLocaleString()}, EMI: ₹${emiAmount.toLocaleString()}) recorded to Payments_Log!`, true);
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🎯 Monthly ₹45-Lakh Showroom Sales Pacer & Goal Tracker */}
      <div style={{ background: 'linear-gradient(90deg, #1E1B4B 0%, #0F172A 100%)', border: '1.5px solid #6366F1', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#FFFFFF' }}>
              RAYAGADA SHOWROOM MONTHLY TARGET: ₹45,00,000
            </div>
            <div style={{ fontSize: '11px', color: '#A5B4FC' }}>
              Month-to-Date: <b style={{ color: '#34D399' }}>₹28,50,000 (63.3%)</b> • Required Daily Run-Rate: <b style={{ color: '#FBBF24' }}>₹82,500/day</b> • Top Seller: <b style={{ color: '#38BDF8' }}>BED-MOD-001</b>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '140px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '63.3%', height: '100%', background: 'linear-gradient(90deg, #6366F1, #34D399)', borderRadius: '4px' }}></div>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '10.5px' }}>ON TRACK ✓</span>
        </div>
      </div>

      {/* 🌟 Top Action Ribbon & CRM Lead Importer */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">🎙️ VOICE SHOWROOM COPILOT</span>
          
          {/* 📥 Import Lead from Tab 8 Showroom CRM */}
          <select 
            onChange={e => handleImportLead(e.target.value)}
            defaultValue=""
            style={{ fontSize: '11.5px', padding: '5px 10px', borderRadius: '8px', background: '#0B132B', border: '1px solid rgba(56,189,248,0.4)', color: '#38BDF8', fontWeight: '700', cursor: 'pointer' }}
          >
            <option value="" disabled>📥 Import Lead from Tab 8 CRM...</option>
            {inquiries.map(inq => (
              <option key={inq.Inquiry_ID} value={inq.Inquiry_ID}>
                {inq.Inquiry_ID} — {inq.Customer_Name} (₹{(inq.Budget_INR || 0).toLocaleString()})
              </option>
            ))}
          </select>

          <button className="btn-luxury-gold" onClick={() => setShowManagerModal(true)} style={{ fontSize: '11px', padding: '5px 12px' }}>
            🏷️ PIN 8899 Override
          </button>

          <button className="btn-ghost-edit" onClick={() => setShowSplitPaymentModal(true)} style={{ fontSize: '11px', padding: '5px 12px' }}>
            💳 Multi-Tender Split Pay
          </button>

          <button className="btn-ghost-edit" onClick={() => openModal('furniture_exchange', { onApplyDiscount: (val) => setExchangeCredit(val) })} style={{ fontSize: '11px', padding: '5px 12px' }}>
            🔄 Old Furniture Exchange
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              setActiveTab('room_matcher');
              showToast(`📸 Pre-loaded ${custName}'s cart into AI Room Matcher!`, true);
            }}
            style={{ fontSize: '11px', padding: '5px 12px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.06)' }}
          >
            <Compass size={13} /> <span>📸 2D Room Matcher (Tab 3)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              setActiveTab('documents');
              showToast(`📄 Switched to Document Studio to print Proforma GST Invoice for ${custName}!`, true);
            }}
            style={{ fontSize: '11px', padding: '5px 12px', color: 'var(--accent-cyan)', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.06)' }}
          >
            <Printer size={13} /> <span>📄 Proforma GST Invoice (Tab 10)</span>
          </button>
        </div>

      </div>

      {/* 🧭 3-Step Guided Voice POS Checkout Wizard Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#030712', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { step: 1, label: '1. 🗣️ Voice Mic & Cart' },
          { step: 2, label: '2. 👤 Customer & VIP Discounts' },
          { step: 3, label: '3. 💳 Split Pay & WhatsApp Bill' }
        ].map(s => {
          const isActive = posStep === s.step;
          const isDone = posStep > s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setPosStep(s.step);
                playScanBeep();
              }}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: isActive ? '900' : '700',
                background: isActive 
                  ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' 
                  : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: isActive ? '#FFFFFF' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
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

      {/* Main Interactive Mic & Waveform Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              🎙️ Continuous Live Microphone & Real-Time Transcriber
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              ⏱️ <b>UNLIMITED TIME:</b> Tap Mic ➔ Speak order naturally ➔ AI populates 115-catalog models & customer profile!
            </p>
          </div>
          <span className={`badge ${isRecording ? 'badge-rose' : 'badge-emerald'}`} style={{ padding: '6px 12px', fontSize: '11.5px' }}>
            {isRecording ? '🔴 RECORDING LIVE...' : 'UNLIMITED MIC READY'}
          </span>
        </div>

        {/* 1-Click Demo Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '14px 0 8px 0' }}>
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
                  transition: 'height 0.1s ease'
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: '18px', fontWeight: '900', color: isRecording ? '#F43F5E' : 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>
            {formatTimer(timer)}
          </div>
        </div>

        {/* Live Audio Transcript Box */}
        <div style={{ background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
              📝 Real-Time Voice Transcription Text:
            </span>
            <button className="btn-ghost-edit" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={() => setIsEditingTranscript(!isEditingTranscript)}>
              {isEditingTranscript ? '✓ Lock Text' : '✏️ Edit Text'}
            </button>
          </div>
          {isEditingTranscript ? (
            <textarea 
              rows={2} 
              value={transcript} 
              onChange={e => setTranscript(e.target.value)} 
              style={{ width: '100%', background: '#030712', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '8px', color: '#FFFFFF', fontSize: '12.5px' }}
            />
          ) : (
            <div style={{ fontSize: '13px', color: '#FFFFFF', fontStyle: 'italic', lineHeight: '1.4' }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Natural Language Query Search Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Type customer spoken order (e.g. 'Customer wants Solid Teak Bed + Wardrobe')..."
            value={typedQuery}
            onChange={e => setTypedQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTypedOrder()}
            style={{ flex: 1, fontSize: '12px', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}
          />
          <button className="btn-cyan" onClick={handleTypedOrder} style={{ padding: '0 18px', fontSize: '12px' }}>
            <Sparkles size={14} /> Parse with AI
          </button>
        </div>
      </div>

      {/* 2-Column POS Layout: Customer Profile & Shopping Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        
        {/* Left Column: Customer Profile & Catalog Selector */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              👤 Customer & Project Details
            </h3>
            <span className="badge badge-gold">{custSegment}</span>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}>Customer Name</label>
              <input value={custName} onChange={e => setCustName(e.target.value)} />
            </div>
            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>WhatsApp Phone</label>
              <input value={custPhone} onChange={e => setCustPhone(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Site Address / Locality</label>
              <input value={custAddress} onChange={e => setCustAddress(e.target.value)} />
            </div>
          </div>

          {/* Catalog SKU Quick Add Box */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '8px' }}>
              ➕ 1-Click Catalog SKU Quick Add:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {catalog.slice(0, 8).map(c => (
                <button
                  key={c.SKU}
                  onClick={() => addItemToCart(c.SKU)}
                  className="btn-ghost-edit"
                  style={{ fontSize: '10px', padding: '6px 8px', justifyContent: 'flex-start', textAlign: 'left', lineHeight: '1.2' }}
                >
                  <div>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{c.SKU}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>₹{(c.Selling_Price_INR || 0).toLocaleString()}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quotation Cart & Commercial Margin Engine */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} color="var(--accent-gold-light)" /> Commercial Quotation Cart
            </h3>
            <span className="badge badge-purple">{cartItems.length} Models Selected</span>
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
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>₹{(item.Selling_Price_INR || 50000).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                      ₹{((item.Selling_Price_INR || 50000) * item.qty).toLocaleString()}
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

          {/* 🎁 Complimentary Free Gift / Accessory Item Adder */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
              🎁 Complimentary Festive Accessories (Free Add-Ons):
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                <input type="checkbox" checked={freePillows} onChange={e => setFreePillows(e.target.checked)} />
                <span>2x Ortho Memory Foam Pillows (₹3,600 Value - <b>FREE</b>)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                <input type="checkbox" checked={freeProtector} onChange={e => setFreeProtector(e.target.checked)} />
                <span>Waterproof Mattress Protector (₹2,200 Value - <b>FREE</b>)</span>
              </label>
            </div>
          </div>

          {/* Action Closing Tools */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            <button 
              className="btn-purple" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => openModal('custom_finish', { sku: cartItems[0]?.SKU || 'BED-MOD-001' })}
            >
              🧵 Finish
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => openModal('emi_scheme', { amount: finalPayable, customerPhone: custPhone })}
            >
              💳 0% EMI
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => openModal('furniture_exchange', { onApplyDiscount: (val) => setExchangeCredit(val), customerPhone: custPhone, customerName: custName })}
            >
              🔄 Buyback
            </button>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center', color: 'var(--accent-gold-light)' }}
              onClick={() => openModal('whatsapp_proposal', { 
                customerName: custName, 
                customerPhone: custPhone, 
                address: custAddress, 
                items: cartItems.map(c => ({ sku: c.SKU, name: c.Product_Name, mrp: c.MRP_INR || c.Selling_Price_INR, price: c.Selling_Price_INR, warranty: `${c.Warranty_Years || 5} Years` })),
                exchangeCredit: exchangeCredit
              })}
            >
              📄 Proposal
            </button>
            <button 
              className="btn-emerald" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center' }}
              onClick={() => {
                const upiLink = `upi://pay?pa=9390553301@ybl&pn=Godrej%20Interio%20Rayagada&am=${advanceToken50}&cu=INR&tn=Token%20Advance%20${custName}`;
                const familyText = `*👨‍👩‍👧 GODREJ INTERIO RAYAGADA — FAMILY CONSULTATION SUMMARY*\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `Namaste! Here is the luxury furniture shortlisted today by *${custName}* at our Rayagada showroom:\n\n` +
                  cartItems.map((it, idx) => `*${idx + 1}. ${it.Product_Name}* (${it.SKU})\n• Dimensions: ${it.Dimensions || 'Standard'}\n• Material: ${it.Material_Spec}\n• Warranty: ${it.Warranty_Years || 10} Full Years\n• Festive Price: ₹${((it.Selling_Price_INR || 50000) * it.qty).toLocaleString()}`).join('\n\n') + `\n\n` +
                  `💰 *Total Quotation Value:* ₹${finalPayable.toLocaleString()} (GST 18% Incl.)\n` +
                  `🎁 *Festive Inclusions:* Free 2x Ortho Memory Foam Pillows + Free Delivery & Assembly\n` +
                  `💳 *50% Token Advance to Lock Stock:* ₹${advanceToken50.toLocaleString()}\n\n` +
                  `👉 *Pay 50% Token via UPI:* ${upiLink}\n\n` +
                  `📍 *Showroom Location:* Near New Bus Stand, Main Road, Rayagada | 📞 +91 93905 53301`;
                const cleanPhone = custPhone.replace(/[^0-9]/g, '');
                const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(familyText)}`, '_blank');
                showToast(`👨‍👩‍👧 Family Consultation summary dispatched to WhatsApp (${custPhone})!`, true);
              }}
            >
              👨‍👩‍👧 Family
            </button>
          </div>

          {/* Final Financial Summary */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid rgba(212,175,55,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Gross Catalog Total:</span>
              <span>₹{grossTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-emerald)' }}>
              <span>Showroom Discount ({discountPct}%):</span>
              <span>- ₹{standardDiscountAmount.toLocaleString()}</span>
            </div>
            {managerOverrideApplied && customSpotDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#F43F5E', fontWeight: '800' }}>
                <span>🔓 Manager Spot Negotiation Override (PIN: 8899):</span>
                <span>- ₹{Number(customSpotDiscount).toLocaleString()}</span>
              </div>
            )}
            {exchangeCredit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                <span>Old Furniture Trade-In Credit:</span>
                <span>- ₹{exchangeCredit.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
              <span>Final Quotation Value:</span>
              <span>₹{finalPayable.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              <span>50% Advance Token (Dynamic UPI QR):</span>
              <span>₹{advanceToken50.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit SafeLock Order Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-luxury-gold" onClick={handleConfirmOrder} style={{ flex: 1.5, justifyContent: 'center', padding: '12px', fontSize: '12.5px', fontWeight: '900' }}>
              <Check size={16} /> 🔒 1-Click SafeLock (₹{advanceToken50.toLocaleString()})
            </button>
            <button className="btn-cyan" onClick={() => openModal('universal_payment', { amount: advanceToken50, orderId: 'ORD-POS-ADV' })} style={{ padding: '12px 14px' }}>
              <CreditCard size={16} /> UPI QR
            </button>
          </div>
        </div>

      </div>

      {/* 🏷️ MANAGER SPOT NEGOTIATION OVERRIDE MODAL */}
      {showManagerModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: '440px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--accent-gold-light)' }}>🏷️ Manager Spot Negotiation Override</h3>
              <button className="btn-close-modal" onClick={() => setShowManagerModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
              <p style={{ fontSize: '12.5px', color: '#CBD5E1' }}>
                Counter-negotiate with customer. Authorize instant spot discount locked with Director Secret PIN.
              </p>
              <div className="form-field">
                <label>Extra Spot Discount (₹ Rupees)</label>
                <input 
                  type="number" 
                  value={customSpotDiscount} 
                  onChange={e => setCustomSpotDiscount(Number(e.target.value))} 
                  placeholder="e.g. 5000"
                  style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)' }}
                />
              </div>
              <div className="form-field">
                <label>Director Master PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  value={managerPin} 
                  onChange={e => setManagerPin(e.target.value)} 
                  placeholder="Enter 8899"
                  style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '18px' }}
                />
              </div>
            </div>
            <button className="btn-luxury-gold" onClick={applyManagerOverride} style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={16} /> Authorize & Apply Spot Discount
            </button>
          </div>
        </div>
      )}

      {/* 💳 MULTI-TENDER SPLIT PAYMENT MODAL */}
      {showSplitPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: '480px', background: '#0B132B', border: '2px solid #38BDF8' }}>
            <div className="modal-header">
              <h3 style={{ color: '#38BDF8' }}>💳 Multi-Tender Payment Splitter</h3>
              <button className="btn-close-modal" onClick={() => setShowSplitPaymentModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
              <div style={{ background: '#030712', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Total Bill Payable:</span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>₹{finalPayable.toLocaleString()}</span>
              </div>
              <div className="form-field">
                <label>💵 Cash in Drawer (₹)</label>
                <input type="number" value={cashAmount} onChange={e => setCashAmount(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>📱 Dynamic UPI QR / GPay (₹)</label>
                <input type="number" value={upiAmount} onChange={e => setUpiAmount(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>💳 Bajaj 0% No-Cost EMI (₹)</label>
                <input type="number" value={emiAmount} onChange={e => setEmiAmount(Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: (cashAmount + upiAmount + emiAmount) === finalPayable ? '#34D399' : '#F43F5E' }}>
                <span>Total Tender Split: ₹{(cashAmount + upiAmount + emiAmount).toLocaleString()}</span>
                <span>{(cashAmount + upiAmount + emiAmount) === finalPayable ? '100% MATCH ✓' : `MISMATCH: ₹${(finalPayable - (cashAmount + upiAmount + emiAmount)).toLocaleString()}`}</span>
              </div>
            </div>
            <button className="btn-cyan" onClick={handleSaveSplitPayment} style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={16} /> Save Split Tender Allocation & Sync
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

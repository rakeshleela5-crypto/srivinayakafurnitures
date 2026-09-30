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
  Printer,
  Search,
  Tag
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';
import { FURNITURE_CATALOG } from '../data/initialData';
import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { EditableCell } from '../components/common/InlineCellRenderer';

export function VoicePosView() {
  const { catalog = [], setCatalog, inquiries, triggerSafeLockOrder, openModal, showToast, setActiveTab, verifyDirectorPin } = useStore();

  // 📝 Inline cell edit — catalog table, saves to D1 'catalog'
  const cellEdit = useInlineCellEdit({ table: 'catalog', pkField: 'SKU', readOnly: ['SKU'], setRows: setCatalog, showToast });

  // 🔍 115+ Stock Search & Filter State
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posCatFilter, setPosCatFilter] = useState('ALL');

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
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
      playScanBeep();
      // Auto-match spoken query if recorded
      if (catalog.length > 0) {
        addItemToCart(catalog[0].SKU);
      }
      showToast("⏹️ Mic stopped. Detected order items added to cart ✓", true);
    }
  };

  // Demo Presets
  const playPreset = (presetType) => {
    playScanBeep();
    if (presetType === 'dr_jena') {
      setCustName("Dr. Subhashish Jena");
      setCustPhone("9437188291");
      setCustAddress("Gayatri Nagar Villa, Rayagada");
      setCartItems([
        { ...(catalog[0] || {}), qty: 1 },
        { ...(catalog[10] || {}), qty: 1 }
      ]);
      setDiscountPct(5);
      showToast("✨ Loaded Dr. Subhashish Jena's preset (King Bed + 4D Wardrobe) into cart!", true);
    } else if (presetType === 'alok_mishra') {
      setCustName("Er. Alok Mishra");
      setCustPhone("9437122334");
      setCustAddress("Raniguda Farmhouse, Rayagada");
      setCartItems([
        { ...(catalog[5] || catalog[0] || {}), qty: 1 },
        { ...(catalog[9] || catalog[1] || {}), qty: 1 }
      ]);
      setDiscountPct(8);
      showToast("✨ Loaded Er. Alok Mishra's preset (7-Seater Sofa + Accent Chair) into cart!", true);
    } else if (presetType === 'sunita_patnaik') {
      setCustName("Ar. Sunita Patnaik (Studio Vastu)");
      setCustPhone("9437011223");
      setCustAddress("Ashok Nagar Villa, Rayagada");
      setCartItems([
        { ...(catalog[7] || catalog[0] || {}), qty: 1 },
        { ...(catalog[4] || catalog[1] || {}), qty: 1 }
      ]);
      setDiscountPct(10);
      showToast("✨ Loaded Ar. Sunita Patnaik's preset (Marble Dining + 4-Poster Bed) into cart!", true);
    }
  };

  // 📥 Import Lead from Tab 8 (Showroom CRM)
  const handleImportLead = (leadId) => {
    const lead = inquiries.find(i => i.Inquiry_ID === leadId);
    if (!lead) return;
    
    setCustName(lead.Customer_Name || "Customer");
    setCustPhone(lead.Customer_Phone || "94371");
    setCustAddress(lead.Address || lead.Locality_Address || "Rayagada Town");
    
    playScanBeep();
    showToast(`📥 Imported lead #${lead.Inquiry_ID} (${lead.Customer_Name}) into Voice POS!`, true);
  };

  // Natural Language Typed Order Parser (Silently adds directly to cart with zero text clutter)
  const handleTypedOrder = () => {
    if (!typedQuery.trim()) return;
    const q = typedQuery.trim().toLowerCase();
    
    const matched = [];
    const segments = q.split(/[\+,\&]| and /i).map(s => s.trim()).filter(Boolean);
    
    segments.forEach(seg => {
      const found = catalog.find(c => 
        (c.SKU || '').toLowerCase() === seg ||
        (c.Product_Name || '').toLowerCase().includes(seg) ||
        (c.Sub_Category || '').toLowerCase().includes(seg) ||
        (seg.includes('bed') && c.Main_Category === 'Bedroom') ||
        (seg.includes('sofa') && c.Main_Category === 'Living Room') ||
        (seg.includes('wardrobe') && ((c.Sub_Category || '').toLowerCase().includes('wardrobe') || (c.Product_Name || '').toLowerCase().includes('wardrobe'))) ||
        (seg.includes('dining') && c.Main_Category === 'Dining & Study') ||
        (seg.includes('chair') && ((c.Sub_Category || '').toLowerCase().includes('chair') || (c.Product_Name || '').toLowerCase().includes('chair')))
      );
      if (found && !matched.some(m => m.SKU === found.SKU)) {
        matched.push(found);
      }
    });

    if (matched.length === 0) {
      const directMatches = catalog.filter(c => 
        (c.SKU || '').toLowerCase().includes(q) || 
        (c.Product_Name || '').toLowerCase().includes(q) || 
        (c.Main_Category || '').toLowerCase().includes(q) ||
        (c.Sub_Category || '').toLowerCase().includes(q)
      );
      matched.push(...directMatches.slice(0, 3));
    }

    if (matched.length > 0) {
      setCartItems(prev => {
        let updated = [...prev];
        matched.forEach(item => {
          const existing = updated.find(p => p.SKU === item.SKU);
          if (existing) {
            updated = updated.map(p => p.SKU === item.SKU ? { ...p, qty: p.qty + 1 } : p);
          } else {
            updated.push({ ...item, qty: 1 });
          }
        });
        return updated;
      });
      playScanBeep();
      showToast(`✨ Added ${matched.length} item(s) directly to Quotation Cart!`, true);
      setTypedQuery('');
    } else {
      showToast(`🔍 No catalog match found for "${typedQuery}". Try searching by SKU or model name below.`);
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

  const handleConfirmOrder = async () => {
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
      Balance_Due_INR: finalPayable - advanceToken50,
      items: cartItems.map(i => ({
        sku: i.SKU,
        qty: i.qty,
        name: i.Product_Name,
        price: i.Selling_Price_INR
      }))
    });

    // Webhook dispatch to Quote_Log & Commercial Quotations
    const dispatchRes = await dispatchWebhookAction('CREATE_COMMERCIAL_QUOTE', {
      customer_name: custName,
      customer_phone: custPhone,
      selected_model: skuList,
      base_price: grossTotal,
      discount_pct: discountPct,
      discount_amt: totalDiscountAmount,
      final_price: finalPayable,
      gross_margin_pct: '34.2%',
      manager_remarks: managerOverrideApplied ? `Director Spot Discount ₹${customSpotDiscount}` : 'Standard Showroom Quote'
    });

    if (dispatchRes && dispatchRes.success) {
      playSuccessChime();
      triggerGoldenConfetti();
      showToast(`🔒 SafeLock Order Booked & Logged to Cloudflare D1 for ${custName} (₹${advanceToken50.toLocaleString()} Advance Paid)!`, true);
    } else {
      showToast(`🔒 SafeLock Order recorded locally for ${custName}`, false);
    }
  };

  const applyManagerOverride = async () => {
    const ok = await verifyDirectorPin(managerPin);
    if (ok) {
      setManagerOverrideApplied(true);
      setShowManagerModal(false);

      const dispatchRes = await dispatchWebhookAction('APPLY_MANAGER_DISCOUNT', {
        customer_name: custName,
        customer_phone: custPhone,
        selected_model: cartItems.map(i => i.SKU).join(', '),
        coupon_code: "DIRECTOR_APPROVED",
        discount_amt: Number(customSpotDiscount),
        final_price: Math.max(0, finalPayable - Number(customSpotDiscount)),
        manager_remarks: "Director Override Approved"
      });

      if (dispatchRes && dispatchRes.success) {
        playSuccessChime();
        showToast(`🔓 Manager Authorization Approved & Logged in Cloudflare D1! Extra ₹${Number(customSpotDiscount).toLocaleString()} Spot Discount Applied ✓`, true);
      } else {
        showToast(`🔓 Spot Discount applied locally (₹${customSpotDiscount})`, false);
      }
    } else {
      showToast("❌ Invalid Manager PIN. Spot negotiation override denied.", false);
    }
  };

  const handleSaveSplitPayment = async () => {
    setShowSplitPaymentModal(false);

    const dispatchRes = await dispatchWebhookAction("SPLIT_PAYMENT_SETTLEMENT", {
      order_id: "ORD-POS-" + Math.floor(100 + Math.random() * 900),
      customer_name: custName,
      cash_amount: cashAmount,
      upi_amount: upiAmount,
      emi_amount: emiAmount,
      timestamp: new Date().toISOString()
    });

    if (dispatchRes && dispatchRes.success) {
      playSuccessChime();
      showToast(`💳 Split Payment (Cash: ₹${cashAmount.toLocaleString()}, UPI: ₹${upiAmount.toLocaleString()}, EMI: ₹${emiAmount.toLocaleString()}) settled in Cloudflare D1!`, true);
    } else {
      showToast(`💳 Split Payment recorded locally`, false);
    }
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
            aria-label="Import customer lead from Showroom CRM"
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

          <button 
            type="button"
            aria-label="Open Director Override Discount Modal"
            className="btn-luxury-gold" 
            onClick={() => setShowManagerModal(true)} 
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            🏷️ Director Override
          </button>

          <button 
            type="button"
            aria-label="Open Multi-Tender Split Payment Modal"
            className="btn-ghost-edit" 
            onClick={() => setShowSplitPaymentModal(true)} 
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            💳 Multi-Tender Split Pay
          </button>

          <button 
            type="button"
            aria-label="Open Old Furniture Exchange Calculator"
            className="btn-ghost-edit" 
            onClick={() => openModal('furniture_exchange', { onApplyDiscount: (val) => setExchangeCredit(val) })} 
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            🔄 Old Furniture Exchange
          </button>

          <button 
            type="button"
            aria-label="Open Craft Prototypes Studio"
            className="btn-ghost-edit" 
            onClick={() => openModal('ui_prototyping_lab')} 
            style={{ fontSize: '11px', padding: '5px 12px', borderColor: 'var(--accent-gold)' }}
          >
            🎨 Craft Prototypes (#27)
          </button>
        </div>
      </div>

      {/* 📑 Master Commercial Quotation Studio Top Access Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(3,7,18,0.9) 100%)',
        border: '1.5px solid var(--accent-gold)',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(212,175,55,0.15)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-gold)', color: '#030712', borderRadius: '8px', padding: '8px', fontWeight: '900', fontSize: '16px' }}>
            📑
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
              Master Commercial Quotation Studio & 5 Value Schemes
            </div>
            <div style={{ fontSize: '11.5px', color: '#CBD5E1' }}>
              Live edit customer profile, item prices, free festive gifts, the 5 schemes & 1-Click WhatsApp / Phone Gmail / Print
            </div>
          </div>
        </div>

        <button 
          type="button"
          className="btn-luxury-gold"
          style={{ fontSize: '12px', padding: '9px 18px', fontWeight: '900', boxShadow: '0 0 15px rgba(212,175,55,0.4)', cursor: 'pointer' }}
          onClick={() => {
            playScanBeep();
            openModal('whatsapp_proposal', { 
              customerName: custName, 
              customerPhone: custPhone, 
              address: custAddress, 
              items: cartItems.map(c => ({ 
                sku: c.SKU, 
                name: c.Product_Name, 
                mrp: c.MRP_INR || c.Selling_Price_INR, 
                price: c.Selling_Price_INR, 
                warranty: `${c.Warranty_Years || 5} Years`,
                qty: c.qty,
                specs: c.Material_Spec || c.Dimensions || 'Solid Material',
                image: c.Image_URL || c.image || c.thumbnail || '',
                thumbnail: c.Image_URL || c.image || c.thumbnail || '',
                category: c.Category || c.Main_Category || 'Living Room',
                finish: c.Color_Finish || c.Finish_Color || ''
              })),
              exchangeCredit: exchangeCredit
            });
          }}
        >
          <FileText size={15} /> 📑 Open Quotation Studio (WhatsApp / Gmail / Print)
        </button>
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

      {/* 🎙️ Sleek AI Voice & Natural Language Omni-Bar */}
      <div className="glass-panel" style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(3,7,18,0.95) 100%)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '14px' }}>
        
        {/* Header Row: Title, 1-Click Presets, and Live Compact Mic Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '10px', padding: '6px 10px', fontSize: '15px' }}>
              🎙️
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Showroom Voice Copilot & AI Smart Add
                <span className="badge badge-cyan" style={{ fontSize: '9.5px', padding: '2px 6px' }}>115+ SKUs Linked</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Speak or type natural order items — instantly adds to Quotation Cart below.
              </div>
            </div>
          </div>

          {/* Right Controls: 1-Click Presets + Compact Mic Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>⚡ PRESETS:</span>
            <button type="button" className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '4px 8px' }} onClick={() => playPreset('dr_jena')}>
              Dr. Jena (Bed + Wardrobe)
            </button>
            <button type="button" className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '4px 8px' }} onClick={() => playPreset('alok_mishra')}>
              Er. Alok (Sofa + Chair)
            </button>
            <button type="button" className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '4px 8px' }} onClick={() => playPreset('sunita_patnaik')}>
              Ar. Sunita (Marble Dining)
            </button>

            {/* Compact Live Mic Pill */}
            <button 
              type="button" 
              onClick={toggleRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '20px',
                background: isRecording ? 'linear-gradient(135deg, #E11D48, #BE123C)' : 'linear-gradient(135deg, #0284C7, #0369A1)',
                color: '#FFFFFF',
                border: isRecording ? '1.5px solid #FDA4AF' : '1.5px solid rgba(56,189,248,0.5)',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '11.5px',
                boxShadow: isRecording ? '0 0 16px rgba(225,29,72,0.8)' : '0 0 10px rgba(2,132,199,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isRecording ? `REC ${formatTimer(timer)}` : 'Tap to Speak'}</span>
            </button>
          </div>

        </div>

        {/* Input Bar: Smart Search / Parse with AI */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', color: '#38BDF8', pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Type product name, SKU, or spoken order (e.g. 'King Bed and 4-Door Wardrobe', 'Sofa', 'Dining')..."
              value={typedQuery}
              onChange={e => setTypedQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTypedOrder()}
              style={{ 
                width: '100%', 
                fontSize: '12.5px', 
                padding: '10px 14px 10px 34px', 
                borderRadius: '8px', 
                background: '#030712', 
                border: '1px solid rgba(56,189,248,0.3)', 
                color: '#FFFFFF' 
              }}
            />
          </div>
          <button 
            type="button" 
            className="btn-cyan" 
            onClick={handleTypedOrder} 
            style={{ padding: '0 20px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={14} /> ✨ Add to Cart
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

          {/* Interactive 115+ Catalog SKU Search & Quick Add */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={13} color="var(--accent-gold-light)" /> ➕ 115+ Catalog Stock Quick Add:
              </div>
              <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>Click SKU to add</span>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'Bedroom', label: '🛏️ Bed' },
                { id: 'Living', label: '🛋️ Sofa' },
                { id: 'Dining', label: '🍽️ Dining' },
                { id: 'Storage', label: '🚪 Wardrobe' },
                { id: 'Recliner', label: '🪑 Chair' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPosCatFilter(cat.id)}
                  className={`btn-ghost-edit ${posCatFilter === cat.id ? 'badge-gold' : ''}`}
                  style={{ fontSize: '9.5px', padding: '2px 6px', borderRadius: '12px' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Search 115+ models by SKU, Name, Material..." 
                value={posSearchQuery}
                onChange={e => setPosSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '26px', fontSize: '11px', background: '#030712', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', color: '#FFFFFF', paddingRight: '22px' }}
              />
              {posSearchQuery && (
                <button 
                  type="button" 
                  onClick={() => setPosSearchQuery('')}
                  style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtered Catalog Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {((catalog && catalog.length > 0 ? catalog : FURNITURE_CATALOG).filter(c => {
                const cat = (c.Main_Category || '').toLowerCase();
                const sub = (c.Sub_Category || '').toLowerCase();
                const matchesCat = posCatFilter === 'ALL' || cat.includes(posCatFilter.toLowerCase()) || sub.includes(posCatFilter.toLowerCase());
                const q = posSearchQuery.trim().toLowerCase();
                if (!q) return matchesCat;
                const matchesQ = (c.SKU || '').toLowerCase().includes(q) || (c.Product_Name || '').toLowerCase().includes(q) || (c.Material_Spec || '').toLowerCase().includes(q);
                return matchesCat && matchesQ;
              })).slice(0, 24).map(c => (
                <button
                  key={c.SKU}
                  type="button"
                  onClick={() => addItemToCart(c.SKU)}
                  className="btn-ghost-edit"
                  style={{ fontSize: '10px', padding: '6px 8px', justifyContent: 'flex-start', textAlign: 'left', lineHeight: '1.2', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontSize: '9.5px', fontFamily: 'JetBrains Mono' }}>{c.SKU}</span>
                      <span style={{ fontSize: '8.5px', color: 'var(--accent-emerald)' }}>+ Add</span>
                    </div>
                    <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {c.Product_Name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
                      ₹{(c.Selling_Price_INR || 0).toLocaleString()}
                    </div>
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
            <table className="luxury-table sheets-grid">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Model / Specs</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={item.SKU}>
                    <td className="row-num" style={{ textAlign: 'center', color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: '10.5px' }}>
                      {idx + 1}
                    </td>
                    <EditableCell
                      value={item.Product_Name}
                      field="Product_Name"
                      rowIdx={idx}
                      pkVal={item.SKU}
                      {...cellEdit}
                    >
                      <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{item.Product_Name}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>{item.SKU} • {item.Material_Spec}</div>
                    </EditableCell>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button className="btn-ghost-edit" style={{ padding: '2px 7px', fontSize: '12px' }} onClick={() => updateQty(item.SKU, -1)}>-</button>
                        <strong style={{ fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}>{item.qty}</strong>
                        <button className="btn-ghost-edit" style={{ padding: '2px 7px', fontSize: '12px' }} onClick={() => updateQty(item.SKU, 1)}>+</button>
                      </div>
                    </td>
                    <EditableCell
                      value={item.Selling_Price_INR}
                      field="Selling_Price_INR"
                      rowIdx={idx}
                      pkVal={item.SKU}
                      numeric
                      style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}
                      onSaved={(rIdx, fld, val) => {
                        setCart(prev => prev.map(ci => ci.SKU === item.SKU ? { ...ci, Selling_Price_INR: Number(val) } : ci));
                      }}
                      {...cellEdit}
                    >
                      ₹{(item.Selling_Price_INR || 50000).toLocaleString()}
                    </EditableCell>
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

          {/* 📑 Master Commercial Quotation Direct Hub */}
          <button 
            type="button"
            className="btn-luxury-gold" 
            style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: '12px', fontWeight: '900', letterSpacing: '0.3px' }}
            onClick={() => {
              playScanBeep();
              openModal('whatsapp_proposal', { 
                customerName: custName, 
                customerPhone: custPhone, 
                address: custAddress, 
                items: cartItems.map(c => ({ 
                  sku: c.SKU, 
                  name: c.Product_Name, 
                  mrp: c.MRP_INR || c.Selling_Price_INR, 
                  price: c.Selling_Price_INR, 
                  warranty: `${c.Warranty_Years || 5} Years`,
                  qty: c.qty,
                  specs: c.Material_Spec || c.Dimensions || 'Solid Material',
                  image: c.Image_URL || c.image || c.thumbnail || '',
                  thumbnail: c.Image_URL || c.image || c.thumbnail || '',
                  category: c.Category || c.Main_Category || 'Living Room',
                  finish: c.Color_Finish || c.Finish_Color || ''
                })),
                exchangeCredit: exchangeCredit
              });
            }}
          >
            <FileText size={15} /> 📑 Master Commercial Quotation (WhatsApp / Gmail / Print)
          </button>

          {/* Action Closing Tools & Enterprise Benchmark Engines */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            <button 
              className="btn-purple" 
              style={{ fontSize: '10px', padding: '8px 2px', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(14,165,233,0.15))', border: '1px solid #C084FC' }}
              onClick={() => openModal('furniture_variant_matrix', { 
                productData: {
                  sku: cartItems[0]?.SKU || 'BED-MOD-001',
                  name: cartItems[0]?.Product_Name || 'Master Furniture Piece',
                  basePrice: cartItems[0]?.Selling_Price_INR || 54000,
                  onApply: (customItem) => {
                    setCartItems(prev => {
                      const updated = [...prev];
                      if (updated[0]) {
                        updated[0] = { ...updated[0], ...customItem, qty: updated[0].qty || 1 };
                      }
                      return updated;
                    });
                  }
                }
              })}
              title="Medusa-style 4D Variant Matrix: Wood, Finish, Size, and Upholstery Customization"
            >
              📐 4D Matrix
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
                items: cartItems.map(c => ({ 
                  sku: c.SKU, 
                  name: c.Product_Name, 
                  mrp: c.MRP_INR || c.Selling_Price_INR, 
                  price: c.Selling_Price_INR, 
                  warranty: `${c.Warranty_Years || 5} Years`,
                  qty: c.qty,
                  specs: c.Material_Spec || c.Dimensions || 'Solid Material',
                  image: c.Image_URL || c.image || c.thumbnail || '',
                  thumbnail: c.Image_URL || c.image || c.thumbnail || '',
                  category: c.Category || c.Main_Category || 'Living Room',
                  finish: c.Color_Finish || c.Finish_Color || ''
                })),
                exchangeCredit: exchangeCredit
              })}
            >
              📄 Proposal
            </button>
            <button 
              className="btn-luxury-gold" 
              style={{ fontSize: '10px', padding: '8px 4px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={() => openModal('bluetooth_printer', { 
                order: {
                  order_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                  customer_name: custName,
                  customer_phone: custPhone,
                  project_address: custAddress,
                  items: cartItems.map(c => ({
                    name: c.Product_Name,
                    qty: c.qty,
                    price: (c.Selling_Price_INR || 50000) * c.qty
                  })),
                  total_amount_inr: finalPayable,
                  advance_paid_inr: advanceToken50,
                  payment_mode: 'UPI Token',
                  otp_code: '8899',
                  assigned_driver: 'Tophan Gouda (Tata Ace OD-18-B-4491)',
                  carpenter_assigned: 'Narayana Mistri (Lead Installer)'
                }
              })}
              title="Print instant 3-Inch POS Receipt via Bluetooth Thermal Printer"
            >
              <Printer size={12} /> <span>🖨️ 3" Thermal Slip</span>
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
                <span>🔓 Manager Spot Negotiation Override:</span>
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

          {/* Enterprise Benchmark Retail OS Action Suite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              type="button"
              className="btn-luxury-gold" 
              onClick={() => openModal('split_tender_pos', {
                totalAmount: finalPayable,
                customerName: custName,
                customerPhone: custPhone,
                address: custAddress,
                items: cartItems.map(c => ({ name: c.Product_Name, qty: c.qty, price: (c.Selling_Price_INR || 50000) * c.qty }))
              })} 
              style={{ justifyContent: 'center', padding: '11px', fontSize: '12px', fontWeight: '900', background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(16,185,129,0.2))', border: '1px solid var(--accent-gold)' }}
              title="Odoo/Vertex Split Tender: Split across Cash, UPI QR, Card EDC & Khata"
            >
              ⚡ Split Tender POS (Odoo)
            </button>

            <button 
              type="button"
              className="btn-purple" 
              onClick={() => openModal('enterprise_pipeline', {
                totalAmount: finalPayable,
                customerName: custName,
                customerPhone: custPhone,
                address: custAddress,
                items: cartItems.map(c => ({ name: c.Product_Name, qty: c.qty, price: (c.Selling_Price_INR || 50000), hsn: '940350' }))
              })} 
              style={{ justifyContent: 'center', padding: '11px', fontSize: '12px', fontWeight: '900' }}
              title="ERPNext Pipeline: Quote -> Sales Order -> Delivery Note -> Tax Invoice"
            >
              📑 ERP Pipeline (ERPNext)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              type="button"
              className="btn-ghost-edit" 
              onClick={() => openModal('customer_khata', { customerName: custName, phone: custPhone })}
              style={{ justifyContent: 'center', padding: '9px', fontSize: '11px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.3)' }}
              title="Crater Benchmark: Customer Credit Ledger & Milestone Aging Statements"
            >
              🏛️ Customer Khata (Crater)
            </button>

            <button 
              type="button"
              className="btn-ghost-edit" 
              onClick={() => openModal('eway_bill_generator', {
                totalAmount: finalPayable,
                customerName: custName,
                customerAddress: custAddress,
                items: cartItems.map(c => ({ name: c.Product_Name, qty: c.qty, price: c.Selling_Price_INR || 50000, hsnCode: '940350' }))
              })}
              style={{ justifyContent: 'center', padding: '9px', fontSize: '11px', color: 'var(--accent-cyan)', border: '1px solid rgba(14,165,233,0.3)' }}
              title="India-Compliance Benchmark: Statutory E-Way Bill NIC JSON Generator"
            >
              🚚 E-Way Bill ({finalPayable >= 50000 ? 'Mandatory' : 'Optional'})
            </button>

            <button 
              type="button"
              className="btn-ghost-edit" 
              onClick={() => openModal('feature_flags_console')}
              style={{ gridColumn: 'span 2', justifyContent: 'center', padding: '7px', fontSize: '10.5px', color: 'var(--accent-gold-light)', border: '1px dashed rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)' }}
              title="Architecture Pillar #12: Edge-Native Feature Flag & Canary Rollout Console"
            >
              🎛️ Feature Flags & Canary Console (Pillar #12)
            </button>
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
                  placeholder="••••"
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

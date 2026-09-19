import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  FileText, 
  Share2, 
  Layers, 
  RefreshCw, 
  Send, 
  UserCheck, 
  Package, 
  Percent, 
  CheckCircle2, 
  Settings2, 
  ShieldCheck, 
  Activity, 
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { SpotlightCard, ShimmerButton, BorderBeamBadge } from '../components/common/LuxuryComponents';
import { getAiRouterTelemetry, getAiProviderKeys, saveAiProviderKey } from '../services/aiRouterService';
import { searchGroundedKnowledge } from '../services/catalogRagService';

const DEFAULT_ARCHITECTS = [
  { id: 'arc-1', name: 'Ar. Rajesh Mohapatra', firm: 'DesignStudio Rayagada', phone: '9861054321', defaultRate: 10 },
  { id: 'arc-2', name: 'Ar. Ananya Rao', firm: 'Aura Spaces Vizag', phone: '9437199220', defaultRate: 12 },
  { id: 'arc-3', name: 'Er. Pradeep Patnaik', firm: 'JK Paper Town Villa Projects', phone: '9437012345', defaultRate: 8 }
];

const DEFAULT_DEPOT_ITEMS = [
  { id: 'dep-1', sku: 'SOF-MOD-001', name: 'Centuro 3-Seater Motorized Recliner', stock: 1, indent: 3, status: 'URGENT INDENT' },
  { id: 'dep-2', sku: 'ALM-MOD-001', name: 'Slimline 4-Door Steel Almirah (Walnut Teak)', stock: 2, indent: 4, status: 'REPLENISH' },
  { id: 'dep-3', sku: 'DIN-MOD-001', name: 'Carrara Marble 6-Seater Dining Set', stock: 0, indent: 2, status: 'OUT OF STOCK' }
];

export default function ShowroomAiAgentsView() {
  const [activeTab, setActiveTab] = useState('quotation'); // 'quotation' | 'architect' | 'depot' | 'cart_recovery' | 'telemetry'
  const [telemetry, setTelemetry] = useState(getAiRouterTelemetry());
  const [keys, setKeys] = useState(getAiProviderKeys());
  const [isSaved, setIsSaved] = useState(false);

  // =========================================================================
  // AGENT 1: DYNAMIC QUOTATION CART STATE
  // =========================================================================
  const [quoteCustomer, setQuoteCustomer] = useState('Dr. Subhashish Jena');
  const [quotePhone, setQuotePhone] = useState('9437188291');
  const [discountPercent, setDiscountPercent] = useState(12);
  const [quoteNotes, setQuoteNotes] = useState('Includes 10-Year Godrej Warranty, complimentary laser measurement & 2x Ortho Pillows.');
  const [quoteItems, setQuoteItems] = useState([
    { id: 'item-1', name: 'Centuro King Hydraulic Teak Bed', sp: 58000, qty: 1 },
    { id: 'item-2', name: 'Godrej Ortho-Posture 8-Inch Dual Mattress', sp: 24000, qty: 1 },
    { id: 'item-3', name: 'Slimline 4-Door Almirah (Walnut Teak CRCA)', sp: 38000, qty: 1 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [quoteResult, setQuoteResult] = useState(null);

  // =========================================================================
  // AGENT 2: ARCHITECT COMMISSION STATE
  // =========================================================================
  const [architects, setArchitects] = useState(DEFAULT_ARCHITECTS);
  const [selectedArchId, setSelectedArchId] = useState('arc-1');
  const [projectValue, setProjectValue] = useState(420000);
  const [customRateOverride, setCustomRateOverride] = useState(10);
  const [commissionResult, setCommissionResult] = useState(null);
  const [showAddArch, setShowAddArch] = useState(false);
  const [newArchName, setNewArchName] = useState('');
  const [newArchFirm, setNewArchFirm] = useState('');
  const [newArchPhone, setNewArchPhone] = useState('');
  const [newArchRate, setNewArchRate] = useState(10);

  // =========================================================================
  // AGENT 3: DEPOT INDENT BUILDER STATE
  // =========================================================================
  const [depotItems, setDepotItems] = useState(DEFAULT_DEPOT_ITEMS);
  const [depotOrderGenerated, setDepotOrderGenerated] = useState(false);
  const [newDepotSku, setNewDepotSku] = useState('');
  const [newDepotName, setNewDepotName] = useState('');
  const [newDepotIndent, setNewDepotIndent] = useState(2);

  // =========================================================================
  // AGENT 4: VIP CART RECOVERY STATE (EDITABLE CANVAS)
  // =========================================================================
  const [selectedLead, setSelectedLead] = useState({
    name: 'Priyanka Tripathy',
    phone: '9437255100',
    item: 'Centuro Motorized Recliner (Royal Leatherette)',
    price: 48500,
    scannedAgo: '18 hours ago'
  });
  const [recoveryLang, setRecoveryLang] = useState('TELUGU');
  const [draftedMessage, setDraftedMessage] = useState(
    'నమస్కారం Priyanka Tripathy గారు! 🙏 మీరు నిన్న శ్రీ వినాయక ఫర్నిచర్స్ (గోద్రెజ్ ఇంటీరియో రాయగడ) లో Centuro Motorized Recliner చూసారు. మీ కోసం ప్రత్యేక 48-గంటల ఫెస్టివల్ ప్రివిలేజ్ డిస్కౌంట్ సిద్ధంగా ఉంది. మీకు అనుకూలమైన సమయం చెప్పండి!'
  );

  // Update telemetry on mount and interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(getAiRouterTelemetry());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Update architect override rate when selected architect changes
  useEffect(() => {
    const arch = architects.find(a => a.id === selectedArchId);
    if (arch) setCustomRateOverride(arch.defaultRate);
  }, [selectedArchId, architects]);

  // Quotation Cart Calculations
  const subtotal = quoteItems.reduce((sum, it) => sum + (it.sp * it.qty), 0);
  const discAmount = Math.round(subtotal * (discountPercent / 100));
  const taxable = subtotal - discAmount;
  const cgst = Math.round(taxable * 0.09);
  const sgst = Math.round(taxable * 0.09);
  const netTotal = taxable + cgst + sgst;

  // Handler: Add Item to Cart
  const handleAddItemToQuote = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    const item = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      sp: Number(newItemPrice),
      qty: 1
    };
    setQuoteItems([...quoteItems, item]);
    setNewItemName('');
    setNewItemPrice('');
  };

  // Handler: Update Item Quantity
  const handleUpdateQty = (itemId, delta) => {
    setQuoteItems(quoteItems.map(it => {
      if (it.id === itemId) {
        const newQty = Math.max(1, it.qty + delta);
        return { ...it, qty: newQty };
      }
      return it;
    }));
  };

  // Handler: Remove Item
  const handleRemoveItem = (itemId) => {
    setQuoteItems(quoteItems.filter(it => it.id !== itemId));
  };

  // Handler: Compile Quotation
  const handleCompileQuotation = () => {
    const res = {
      quoteId: `GI-QUO-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: quoteCustomer,
      phone: quotePhone,
      items: quoteItems,
      subtotal,
      discountPercent,
      discAmount,
      cgst,
      sgst,
      netTotal,
      notes: quoteNotes,
      date: new Date().toLocaleDateString('en-IN')
    };
    setQuoteResult(res);
  };

  // Handler: Run Architect Commission Calculation
  const handleCalculateCommission = () => {
    const arch = architects.find(a => a.id === selectedArchId) || architects[0];
    const rate = Number(customRateOverride);
    const grossCommission = Math.round(projectValue * (rate / 100));
    const tdsDeduction = Math.round(grossCommission * 0.10); // 10% TDS Section 194H
    const netPayable = grossCommission - tdsDeduction;

    setCommissionResult({
      voucherId: `ARC-VOUCH-${Math.floor(1000 + Math.random() * 9000)}`,
      architect: `${arch.name} (${arch.firm})`,
      phone: arch.phone,
      projectValue,
      rate,
      grossCommission,
      tdsDeduction,
      netPayable
    });
  };

  // Handler: Register New Architect
  const handleRegisterArchitect = (e) => {
    e.preventDefault();
    if (!newArchName.trim()) return;
    const newArch = {
      id: `arc-${Date.now()}`,
      name: newArchName.trim(),
      firm: newArchFirm.trim() || 'Independent Studio',
      phone: newArchPhone.trim() || '9437188291',
      defaultRate: Number(newArchRate) || 10
    };
    setArchitects([...architects, newArch]);
    setSelectedArchId(newArch.id);
    setShowAddArch(false);
    setNewArchName('');
    setNewArchFirm('');
    setNewArchPhone('');
  };

  // Handler: Add SKU to Depot Indent
  const handleAddDepotSku = (e) => {
    e.preventDefault();
    if (!newDepotSku.trim() || !newDepotName.trim()) return;
    const item = {
      id: `dep-${Date.now()}`,
      sku: newDepotSku.trim().toUpperCase(),
      name: newDepotName.trim(),
      stock: 0,
      indent: Number(newDepotIndent) || 2,
      status: 'CUSTOM INDENT'
    };
    setDepotItems([...depotItems, item]);
    setNewDepotSku('');
    setNewDepotName('');
  };

  // Handler: Regenerate AI Recovery Draft
  const handleRegenerateDraft = () => {
    let msg = '';
    if (recoveryLang === 'ODIA') {
      msg = `ନମସ୍କାର ${selectedLead.name} ମାଡାମ/ବାବୁ! 🙏 ଆପଣ ଗତକାଲି ଆମ ଶ୍ରୀ ବିନାୟକ ଫର୍ଣ୍ଣିଚର (ଗୋଦରେଜ ଇଣ୍ଟେରିଓ ରାୟଗଡା) ରେ ${selectedLead.item} ଦେଖିଥିଲେ। ଆପଣଙ୍କ ପାଇଁ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ସ୍ୱତନ୍ତ୍ର ଉତ୍ସବ ବୋନସ୍ ଉପଲବ୍ଧ ଅଛି। ଉଚିତ ସମୟ ଜଣାନ୍ତୁ!`;
    } else if (recoveryLang === 'TELUGU') {
      msg = `నమస్కారం ${selectedLead.name} గారు! 🙏 మీరు నిన్న శ్రీ వినాయక ఫర్నిచర్స్ (గోద్రెజ్ ఇంటీరియో రాయగడ) లో ${selectedLead.item} చూసారు. మీ కోసం ప్రత్యేక 48-గంటల ఫెస్టివల్ ప్రివిలేజ్ డిస్కౌంట్ సిద్ధంగా ఉంది. మీకు అనుకూలమైన సమయం చెప్పండి!`;
    } else {
      msg = `Namaskar ${selectedLead.name}! 🙏 Thank you for visiting Sri Vinayaka Furnitures (Godrej Interio Rayagada) and viewing our ${selectedLead.item}. Director Rakesh Nayak has approved a limited 48-hour festive showroom privilege with complimentary laser site measurement.`;
    }
    setDraftedMessage(msg);
  };

  // Quick insertion helpers for VIP draft
  const appendSnippet = (snippet) => {
    setDraftedMessage(prev => `${prev}\n\n${snippet}`);
  };

  return (
    <div className="view-container" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 🌟 Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px' }}>
              SHOWROOM AI AGENTS COMMAND CENTER
            </h1>
            <BorderBeamBadge text="DYNAMIC CARTS & FULL EDIT" variant="gold" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 0 0' }}>
            Fully customizable retail agents for custom room builders, architect registries, depot indent adjustments, and editable WhatsApp drafts.
          </p>
        </div>

        {/* Real-time Multi-LLM Telemetry Badge */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.8)', 
          border: '1px solid rgba(212, 175, 55, 0.25)', 
          borderRadius: '12px', 
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Engine</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>{telemetry.currentProvider}</div>
            </div>
          </div>
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latency</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{telemetry.lastLatencyMs || 240}ms</div>
          </div>
        </div>
      </div>

      {/* 🧭 Agent Navigation Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        {[
          { id: 'quotation', label: '1. Custom Quotation & Cart Builder', icon: FileText },
          { id: 'architect', label: '2. Architect Registry & Payouts', icon: Percent },
          { id: 'depot', label: '3. Custom Depot Indent Builder', icon: Package },
          { id: 'cart_recovery', label: '4. Editable WhatsApp VIP Canvas', icon: Sparkles },
          { id: 'telemetry', label: '⚙️ Router & FreeLLM Setup', icon: Settings2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(15,23,42,0.85))' : 'rgba(15,23,42,0.6)',
                color: isActive ? 'var(--accent-gold-light)' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 📑 TAB 1: DYNAMIC QUOTATION & ROOM CART BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'quotation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--accent-gold)" />
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                    Custom Room Cart & Item Builder
                  </h3>
                </div>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>{quoteItems.length} Items in Cart</span>
              </div>

              {/* Customer Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Customer Name</label>
                  <input
                    type="text"
                    value={quoteCustomer}
                    onChange={(e) => setQuoteCustomer(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>WhatsApp Phone</label>
                  <input
                    type="text"
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              {/* Add New Line Item Sub-Form */}
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-gold-light)', marginBottom: '8px' }}>
                  + Add Custom Furniture Item
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="e.g. Teak 2-Seater Lounge Sofa"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    style={{ flex: 2, minWidth: '160px', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    style={{ flex: 1, minWidth: '90px', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    className="btn-cyan"
                    onClick={handleAddItemToQuote}
                    style={{ padding: '7px 12px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Dynamic Line-Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {quoteItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070D18', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>₹{item.sp.toLocaleString('en-IN')} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Quantity Incrementor */}
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          style={{ padding: '4px 8px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px' }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          style={{ padding: '4px 8px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px' }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#FFFFFF', minWidth: '70px', textAlign: 'right' }}>
                        ₹{(item.sp * item.qty).toLocaleString('en-IN')}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Slider & Notes */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Festive Showroom Privilege Discount</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-gold)' }}>{discountPercent}% (-₹{discAmount.toLocaleString('en-IN')})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Quotation Remarks & Warranty Terms</label>
                <textarea
                  rows="2"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '11.5px' }}
                />
              </div>

              <ShimmerButton variant="gold" onClick={handleCompileQuotation} style={{ width: '100%', marginTop: '16px' }}>
                <Sparkles size={14} /> Compile & Update Formal Quotation
              </ShimmerButton>
            </div>
          </SpotlightCard>

          {/* Quotation Slip Preview */}
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  📄 Formal Quotation Slip
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                  {quoteResult ? quoteResult.quoteId : 'LIVE PREVIEW'}
                </span>
              </div>

              <div style={{ background: '#070D18', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Client: <strong style={{ color: '#FFFFFF' }}>{quoteCustomer}</strong></span>
                  <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Showroom: Godrej Interio Rayagada | GSTIN: 21AAECG1234F1Z8
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {quoteItems.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#FFFFFF' }}>• {it.name} <span style={{ color: 'var(--accent-gold)' }}>x{it.qty}</span></span>
                      <span style={{ color: 'var(--text-secondary)' }}>₹{(it.sp * it.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '12px', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                    <span>Festive Privilege ({discountPercent}%):</span>
                    <span>-₹{discAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>GST 18% (CGST 9% + SGST 9%):</span>
                    <span>+₹{(cgst + sgst).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(212,175,55,0.3)' }}>
                    <span>Net Payable Amount:</span>
                    <span>₹{netTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {quoteNotes && (
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '11px', color: 'var(--accent-gold-light)', fontStyle: 'italic' }}>
                    Note: {quoteNotes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-cyan"
                  style={{ flex: 1, padding: '10px', fontSize: '12px' }}
                  onClick={() => {
                    const itemsSummary = quoteItems.map(i => `${i.name} (Qty: ${i.qty})`).join(', ');
                    const text = encodeURIComponent(`Namaskar ${quoteCustomer} Sir! 🙏 Here is your official Godrej Interio Rayagada formal quotation for ${itemsSummary}.\n\nTotal Net: ₹${netTotal.toLocaleString('en-IN')} (Incl. GST 18%).\nNotes: ${quoteNotes}\n\nPlease let us know to confirm 50% token advance via UPI/RTGS.`);
                    window.open(`https://wa.me/91${quotePhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                  }}
                >
                  <Send size={14} /> Send WhatsApp Quote
                </button>
              </div>

            </div>
          </SpotlightCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 💼 TAB 2: ARCHITECT REGISTRY & COMMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'architect' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Percent size={18} color="var(--accent-cyan)" />
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                    Architect Registry & Payouts
                  </h3>
                </div>
                <button
                  className="btn-ghost-edit"
                  onClick={() => setShowAddArch(!showAddArch)}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  + Register Architect
                </button>
              </div>

              {/* Sub-Form: Register New Architect Partner */}
              {showAddArch && (
                <form onSubmit={handleRegisterArchitect} style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', padding: '14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    🏛️ Register New Interior Architect / Partner
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Architect Name (e.g. Ar. Sameer Mohanty)"
                    value={newArchName}
                    onChange={(e) => setNewArchName(e.target.value)}
                    style={{ padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Studio / Firm Name"
                      value={newArchFirm}
                      onChange={(e) => setNewArchFirm(e.target.value)}
                      style={{ padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp Phone"
                      value={newArchPhone}
                      onChange={(e) => setNewArchPhone(e.target.value)}
                      style={{ padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn-cyan" style={{ flex: 1, padding: '7px', fontSize: '11.5px' }}>
                      Save Partner
                    </button>
                    <button type="button" className="btn-ghost-edit" onClick={() => setShowAddArch(false)} style={{ padding: '7px', fontSize: '11.5px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Select Partner Architect
                  </label>
                  <select
                    value={selectedArchId}
                    onChange={(e) => setSelectedArchId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    {architects.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.firm}) - {a.defaultRate}% Default</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Referred Turnkey Project Value (₹)
                  </label>
                  <input
                    type="number"
                    value={projectValue}
                    onChange={(e) => setProjectValue(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Custom Commission Rate Override</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{customRateOverride}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.5"
                    value={customRateOverride}
                    onChange={(e) => setCustomRateOverride(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  />
                </div>

                <ShimmerButton variant="cyan" onClick={handleCalculateCommission} style={{ marginTop: '6px' }}>
                  <Zap size={14} /> Calculate TDS-Compliant Payout
                </ShimmerButton>
              </div>

            </div>
          </SpotlightCard>

          {/* Commission Voucher Output */}
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  🏛️ Architect Payout Voucher
                </h3>
                {commissionResult && (
                  <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{commissionResult.voucherId}</span>
                )}
              </div>

              {commissionResult ? (
                <div>
                  <div style={{ background: '#070D18', border: '1px dashed rgba(6,182,212,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px' }}>
                      Partner: {commissionResult.architect}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Referred Project Value:</span>
                        <span>₹{commissionResult.projectValue.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
                        <span>Commission Tier Rate:</span>
                        <span><strong>{commissionResult.rate}%</strong></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFFFFF' }}>
                        <span>Gross Commission:</span>
                        <span>₹{commissionResult.grossCommission.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#EF4444' }}>
                        <span>TDS (10% Sec 194H):</span>
                        <span>-₹{commissionResult.tdsDeduction.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span>Net Bank Transfer Payout:</span>
                        <span>₹{commissionResult.netPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-emerald"
                    style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                    onClick={() => {
                      const text = encodeURIComponent(`Namaskar ${commissionResult.architect}! 🙏 Your referral commission voucher (${commissionResult.voucherId}) for Project Value ₹${commissionResult.projectValue.toLocaleString('en-IN')} is approved. Net Bank Payout: ₹${commissionResult.netPayable.toLocaleString('en-IN')} (TDS 10% deducted). Shipped from Sri Vinayaka Furnitures.`);
                      window.open(`https://wa.me/91${commissionResult.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                    }}
                  >
                    <Send size={14} /> Dispatch Voucher on WhatsApp
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '13px', margin: 0 }}>Select architect and project value to generate instant TDS-compliant commission voucher.</p>
                </div>
              )}
            </div>
          </SpotlightCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 📦 TAB 3: CUSTOM DEPOT INDENT BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'depot' && (
        <SpotlightCard>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  Bhubaneswar Depot Custom Indent Builder
                </h3>
              </div>
              <button
                className="btn-luxury-gold"
                style={{ padding: '6px 12px', fontSize: '11.5px' }}
                onClick={() => setDepotOrderGenerated(true)}
              >
                ⚡ Compile & Review Depot Requisition
              </button>
            </div>

            {/* Sub-Form: Add Custom SKU to Indent */}
            <form onSubmit={handleAddDepotSku} style={{ background: 'rgba(15,23,42,0.7)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="SKU (e.g. BED-MOD-002)"
                value={newDepotSku}
                onChange={(e) => setNewDepotSku(e.target.value)}
                style={{ flex: 1, minWidth: '130px', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
              />
              <input
                type="text"
                placeholder="Product Description"
                value={newDepotName}
                onChange={(e) => setNewDepotName(e.target.value)}
                style={{ flex: 2, minWidth: '180px', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={newDepotIndent}
                onChange={(e) => setNewDepotIndent(e.target.value)}
                style={{ width: '80px', padding: '7px 10px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
              />
              <button type="submit" className="btn-cyan" style={{ padding: '7px 14px', fontSize: '11.5px' }}>
                + Add SKU
              </button>
            </form>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.8)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px' }}>SKU Code</th>
                    <th style={{ padding: '10px' }}>Product Description</th>
                    <th style={{ padding: '10px' }}>Floor Stock</th>
                    <th style={{ padding: '10px' }}>Depot Indent Qty</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {depotItems.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{row.sku}</td>
                      <td style={{ padding: '10px', color: '#FFFFFF' }}>{row.name}</td>
                      <td style={{ padding: '10px', color: row.stock === 0 ? '#EF4444' : '#F59E0B' }}>
                        {row.stock} Units
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                          <button
                            onClick={() => {
                              setDepotItems(depotItems.map(d => d.id === row.id ? { ...d, indent: Math.max(1, d.indent - 1) } : d));
                            }}
                            style={{ padding: '3px 8px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0 8px', fontWeight: '700', color: '#10B981' }}>{row.indent} Pcs</span>
                          <button
                            onClick={() => {
                              setDepotItems(depotItems.map(d => d.id === row.id ? { ...d, indent: d.indent + 1 } : d));
                            }}
                            style={{ padding: '3px 8px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className={row.status === 'OUT OF STOCK' ? 'badge badge-rose' : 'badge badge-gold'} style={{ fontSize: '10px' }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => setDepotItems(depotItems.filter(d => d.id !== row.id))}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                          title="Remove from indent"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {depotOrderGenerated && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#070D18', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-gold-light)' }}>
                    ✅ Depot Requisition Indent #BBSR-IND-8821 Compiled
                  </span>
                  <button
                    className="btn-cyan"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => {
                      const lines = depotItems.map(d => `• ${d.sku} (${d.name}): ${d.indent} Pcs`).join('\n');
                      const text = encodeURIComponent(`Godrej Interio Depot Indent #BBSR-IND-8821 from Sri Vinayaka Furnitures Rayagada:\n\n${lines}\n\nPlease confirm truck dispatch slot from BBSR Depot.`);
                      window.open(`https://wa.me/919437155667?text=${text}`, '_blank');
                    }}
                  >
                    <Send size={12} /> Send to Depot Manager WhatsApp
                  </button>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  Total Indent Qty: <strong>{depotItems.reduce((acc, d) => acc + d.indent, 0)} Units</strong> across {depotItems.length} SKUs.
                </div>
              </div>
            )}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* 🌟 TAB 4: VIP CART RECOVERY (EDITABLE LIVE CANVAS) */}
      {/* ========================================================================= */}
      {activeTab === 'cart_recovery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  VIP QR Showroom Lead Selector
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Select Unsettled QR Showroom Visitor
                  </label>
                  <select
                    value={selectedLead.name}
                    onChange={(e) => {
                      const leads = [
                        { name: 'Priyanka Tripathy', phone: '9437255100', item: 'Centuro Motorized Recliner (Royal Leatherette)', price: 48500, scannedAgo: '18 hours ago' },
                        { name: 'K. Venkat Rao', phone: '9861022345', item: 'Solid Teak 6-Seater Dining Set', price: 62000, scannedAgo: '22 hours ago' },
                        { name: 'Dr. Debasis Panda', phone: '9437199881', item: 'Slimline 4-Door Mirror Wardrobe', price: 42000, scannedAgo: '1 day ago' }
                      ];
                      const found = leads.find(l => l.name === e.target.value) || leads[0];
                      setSelectedLead(found);
                    }}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    <option value="Priyanka Tripathy">Priyanka Tripathy (Centuro Recliner - 18h ago)</option>
                    <option value="K. Venkat Rao">K. Venkat Rao (Teak Dining Set - 22h ago)</option>
                    <option value="Dr. Debasis Panda">Dr. Debasis Panda (Slimline Wardrobe - 1 day ago)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Cultural Language Framework
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['TELUGU', 'ODIA', 'ENGLISH'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setRecoveryLang(lang)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: recoveryLang === lang ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                          background: recoveryLang === lang ? 'rgba(212,175,55,0.2)' : 'transparent',
                          color: recoveryLang === lang ? 'var(--accent-gold-light)' : 'var(--text-secondary)',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <ShimmerButton variant="gold" onClick={handleRegenerateDraft} style={{ marginTop: '10px' }}>
                  <Sparkles size={14} /> Re-Draft Cultural AI Message
                </ShimmerButton>
              </div>
            </div>
          </SpotlightCard>

          {/* Editable Live WhatsApp Canvas */}
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit3 size={15} color="#10B981" />
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                    Editable WhatsApp Live Canvas
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {draftedMessage.length} characters
                </span>
              </div>

              {/* Quick Insertion Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => appendSnippet('📍 Narayana Mistri will visit your home tomorrow at 4:00 PM for complimentary laser room measurement.')}
                  style={{ fontSize: '10.5px', padding: '4px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#FFFFFF', cursor: 'pointer' }}
                >
                  + 4 PM Carpenter Visit
                </button>
                <button
                  type="button"
                  onClick={() => appendSnippet('💳 Pay 50% Token Advance via UPI: 9390553301@hdfcbank to lock festive price.')}
                  style={{ fontSize: '10.5px', padding: '4px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                >
                  + Token UPI Link
                </button>
                <button
                  type="button"
                  onClick={() => appendSnippet('🛡️ Official Godrej 10-Year anti-termite and borer warranty certificate included.')}
                  style={{ fontSize: '10.5px', padding: '4px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'var(--accent-gold-light)', cursor: 'pointer' }}
                >
                  + 10-Yr Warranty
                </button>
              </div>

              {/* Editable Textarea */}
              <textarea
                rows="6"
                value={draftedMessage}
                onChange={(e) => setDraftedMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#070D18',
                  border: '1px solid #10B981',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  resize: 'vertical'
                }}
              />

              <button
                className="btn-emerald"
                style={{ width: '100%', padding: '10px', fontSize: '12.5px' }}
                onClick={() => {
                  window.open(`https://wa.me/91${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draftedMessage)}`, '_blank');
                }}
              >
                <Send size={14} /> Send Personalized WhatsApp to {selectedLead.name}
              </button>
            </div>
          </SpotlightCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ TAB 5: MULTI-LLM ROUTER & FREELLMAPI CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'telemetry' && (
        <SpotlightCard>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Cpu size={18} color="var(--accent-gold)" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                Multi-LLM Smart Router & Free Provider Keys
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Configure your free-tier keys. OmniBuild OS uses intelligent failover: <strong>Gemini Flash ➡️ Groq LLaMA 3.3 ➡️ Custom FreeLLMAPI Proxy ➡️ Local Engine</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Google Gemini API Key (Primary)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keys.geminiKey}
                  onChange={(e) => setKeys({ ...keys, geminiKey: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Groq API Key (High-Speed LLaMA 3.3 70B Failover)
                </label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={keys.groqKey}
                  onChange={(e) => setKeys({ ...keys, groqKey: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Custom FreeLLMAPI Endpoint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:3001 or https://my-proxy.com"
                  value={keys.customEndpoint}
                  onChange={(e) => setKeys({ ...keys, customEndpoint: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShimmerButton
                variant="gold"
                onClick={() => {
                  saveAiProviderKey('gemini', keys.geminiKey);
                  saveAiProviderKey('groq', keys.groqKey);
                  saveAiProviderKey('customEndpoint', keys.customEndpoint);
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 3000);
                }}
              >
                <ShieldCheck size={14} /> Save Secure Provider Keys
              </ShimmerButton>
              {isSaved && (
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>
                  ✅ Keys updated securely in localStorage!
                </span>
              )}
            </div>
          </div>
        </SpotlightCard>
      )}

    </div>
  );
}

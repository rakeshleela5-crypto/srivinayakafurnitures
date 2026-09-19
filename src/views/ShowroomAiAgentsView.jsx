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
  Cpu
} from 'lucide-react';
import { SpotlightCard, ShimmerButton, BorderBeamBadge } from '../components/common/LuxuryComponents';
import { getAiRouterTelemetry, getAiProviderKeys, saveAiProviderKey } from '../services/aiRouterService';
import { searchGroundedKnowledge } from '../services/catalogRagService';

export default function ShowroomAiAgentsView() {
  const [activeTab, setActiveTab] = useState('quotation'); // 'quotation' | 'architect' | 'depot' | 'cart_recovery' | 'telemetry'
  const [telemetry, setTelemetry] = useState(getAiRouterTelemetry());
  const [keys, setKeys] = useState(getAiProviderKeys());
  const [isSaved, setIsSaved] = useState(false);

  // Agent 1: Quotation State
  const [quoteCustomer, setQuoteCustomer] = useState('Dr. Subhashish Jena');
  const [quotePhone, setQuotePhone] = useState('9437188291');
  const [quotePackage, setQuotePackage] = useState('MASTER_BEDROOM');
  const [discountPercent, setDiscountPercent] = useState(12);
  const [quoteResult, setQuoteResult] = useState(null);

  // Agent 2: Architect Commission State
  const [architectName, setArchitectName] = useState('Ar. Rajesh Mohapatra (DesignStudio)');
  const [architectPhone, setArchitectPhone] = useState('9861054321');
  const [projectValue, setProjectValue] = useState(420000);
  const [commissionResult, setCommissionResult] = useState(null);

  // Agent 3: Depot Requisition State
  const [depotOrderGenerated, setDepotOrderGenerated] = useState(false);

  // Agent 4: VIP Cart Recovery State
  const [selectedLead, setSelectedLead] = useState({
    name: 'Priyanka Tripathy',
    phone: '9437255100',
    item: 'Centuro Motorized Recliner (Royal Leatherette)',
    price: 48500,
    scannedAgo: '18 hours ago'
  });
  const [recoveryLang, setRecoveryLang] = useState('TELUGU');
  const [draftedMessage, setDraftedMessage] = useState('');

  // Update telemetry on mount and interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(getAiRouterTelemetry());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Handler: Run Quotation Agent
  const handleGenerateQuote = () => {
    const packages = {
      MASTER_BEDROOM: {
        title: 'Master Bedroom Teak Suite',
        items: [
          { name: 'Centuro King Hydraulic Teak Bed', mrp: 68000, sp: 58000 },
          { name: 'Godrej Ortho-Posture 8-Inch Dual Mattress', mrp: 28500, sp: 24000 },
          { name: 'Slimline 4-Door Almirah (Walnut Teak CRCA)', mrp: 44000, sp: 38000 }
        ]
      },
      LIVING_LUXURY: {
        title: 'Presidential Living Room Lounge',
        items: [
          { name: 'Centuro 3-Seater Motorized Recliner', mrp: 74000, sp: 62000 },
          { name: 'Solid Teak Glass-Top Coffee Table', mrp: 18500, sp: 15500 },
          { name: 'Accent Teak Lounge Wing Chair (Velvet)', mrp: 26000, sp: 21500 }
        ]
      },
      DINING_MARBLE: {
        title: '6-Seater Italian Carrara Marble Suite',
        items: [
          { name: 'Carrara Marble 6-Seater Dining Table', mrp: 82000, sp: 69000 },
          { name: '6x Teak Ergonomic Upholstered Chairs', mrp: 36000, sp: 30000 }
        ]
      }
    };

    const pkg = packages[quotePackage] || packages.MASTER_BEDROOM;
    const subtotal = pkg.items.reduce((sum, item) => sum + item.sp, 0);
    const discAmount = Math.round(subtotal * (discountPercent / 100));
    const taxable = subtotal - discAmount;
    const cgst = Math.round(taxable * 0.09);
    const sgst = Math.round(taxable * 0.09);
    const netTotal = taxable + cgst + sgst;

    const res = {
      quoteId: `GI-QUO-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: quoteCustomer,
      phone: quotePhone,
      packageTitle: pkg.title,
      items: pkg.items,
      subtotal,
      discountPercent,
      discAmount,
      cgst,
      sgst,
      netTotal,
      date: new Date().toLocaleDateString('en-IN')
    };

    setQuoteResult(res);
  };

  // Handler: Run Architect Commission Agent
  const handleCalculateCommission = () => {
    let rate = 8;
    if (projectValue >= 500000) rate = 12;
    else if (projectValue >= 200000) rate = 10;

    const grossCommission = Math.round(projectValue * (rate / 100));
    const tdsDeduction = Math.round(grossCommission * 0.10); // 10% TDS Section 194H
    const netPayable = grossCommission - tdsDeduction;

    setCommissionResult({
      voucherId: `ARC-VOUCH-${Math.floor(1000 + Math.random() * 9000)}`,
      architect: architectName,
      phone: architectPhone,
      projectValue,
      rate,
      grossCommission,
      tdsDeduction,
      netPayable
    });
  };

  // Handler: Draft VIP Follow-up
  const handleDraftRecovery = () => {
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
            <BorderBeamBadge text="500 AI AGENTS ACTIVE" variant="gold" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 0 0' }}>
            Autonomous retail agents for instant quotations, architect commission reconciliations, depot re-stocking, and VIP lead recovery.
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
          { id: 'quotation', label: '1. Retail Quotation & GST Agent', icon: FileText },
          { id: 'architect', label: '2. Architect Commission Agent', icon: Percent },
          { id: 'depot', label: '3. Stock Re-order & Depot Agent', icon: Package },
          { id: 'cart_recovery', label: '4. VIP Lead Recovery Agent', icon: Sparkles },
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
      {/* 📑 TAB 1: RETAIL QUOTATION & GST AGENT */}
      {/* ========================================================================= */}
      {activeTab === 'quotation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <FileText size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  Auto-Quotation Generator
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Customer / Client Name
                  </label>
                  <input
                    type="text"
                    value={quoteCustomer}
                    onChange={(e) => setQuoteCustomer(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Select Furniture Suite Package
                  </label>
                  <select
                    value={quotePackage}
                    onChange={(e) => setQuotePackage(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    <option value="MASTER_BEDROOM">🛏️ Master Bedroom Teak Suite (Bed + Ortho Mattress + Almirah)</option>
                    <option value="LIVING_LUXURY">🛋️ Presidential Living Lounge (Centuro Recliner + Table + Wing Chair)</option>
                    <option value="DINING_MARBLE">🪑 6-Seater Italian Carrara Marble Suite</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Festive Showroom Privilege Discount</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-gold)' }}>{discountPercent}%</span>
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

                <ShimmerButton variant="gold" onClick={handleGenerateQuote} style={{ marginTop: '10px' }}>
                  <Sparkles size={14} /> Calculate & Compile Quotation
                </ShimmerButton>
              </div>
            </div>
          </SpotlightCard>

          {/* Quotation Slip Preview */}
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  📄 Formal Quotation Slip
                </h3>
                {quoteResult && (
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>{quoteResult.quoteId}</span>
                )}
              </div>

              {quoteResult ? (
                <div>
                  <div style={{ background: '#070D18', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Client: <strong style={{ color: '#FFFFFF' }}>{quoteResult.customer}</strong></span>
                      <span>Date: {quoteResult.date}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-gold-light)', marginBottom: '12px' }}>
                      Package: {quoteResult.packageTitle}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {quoteResult.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#FFFFFF' }}>• {it.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>₹{it.sp.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '12px', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Subtotal:</span>
                        <span>₹{quoteResult.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                        <span>Festive Discount ({quoteResult.discountPercent}%):</span>
                        <span>-₹{quoteResult.discAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>GST 18% (CGST 9% + SGST 9%):</span>
                        <span>+₹{(quoteResult.cgst + quoteResult.sgst).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(212,175,55,0.3)' }}>
                        <span>Net Payable Amount:</span>
                        <span>₹{quoteResult.netTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-cyan"
                      style={{ flex: 1, padding: '10px', fontSize: '12px' }}
                      onClick={() => {
                        const text = encodeURIComponent(`Namaskar ${quoteResult.customer} Sir! 🙏 Here is your official Godrej Interio Rayagada quotation (${quoteResult.quoteId}) for ${quoteResult.packageTitle}: Total Net: ₹${quoteResult.netTotal.toLocaleString('en-IN')}. Please let us know to confirm 50% token advance.`);
                        window.open(`https://wa.me/91${quoteResult.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                      }}
                    >
                      <Send size={14} /> Send WhatsApp Quote
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '13px', margin: 0 }}>Configure options on the left and click "Calculate & Compile Quotation" to see the instant slip.</p>
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💼 TAB 2: ARCHITECT COMMISSION AGENT */}
      {/* ========================================================================= */}
      {activeTab === 'architect' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Percent size={18} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  Architect Commission Engine
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Registered Architect / Interior Designer
                  </label>
                  <select
                    value={architectName}
                    onChange={(e) => setArchitectName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    <option value="Ar. Rajesh Mohapatra (DesignStudio)">Ar. Rajesh Mohapatra (DesignStudio Rayagada)</option>
                    <option value="Ar. Ananya Rao (Aura Spaces)">Ar. Ananya Rao (Aura Spaces Vizag)</option>
                    <option value="Er. Pradeep Patnaik (JK Paper Villa)">Er. Pradeep Patnaik (JK Paper Town)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Total Referred Project Bill Value (₹)
                  </label>
                  <input
                    type="number"
                    value={projectValue}
                    onChange={(e) => setProjectValue(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div style={{ background: 'rgba(15,23,42,0.7)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Showroom Commission Tier Matrix:</div>
                  <div>• Up to ₹2,00,000: <strong>8%</strong> Commission</div>
                  <div>• ₹2,00,000 to ₹5,00,000: <strong>10%</strong> Commission</div>
                  <div>• Above ₹5,00,000: <strong>12%</strong> Executive Commission</div>
                  <div style={{ marginTop: '4px', color: 'var(--accent-gold)' }}>• Mandatory 10% TDS deduction under Sec 194H</div>
                </div>

                <ShimmerButton variant="cyan" onClick={handleCalculateCommission} style={{ marginTop: '6px' }}>
                  <Zap size={14} /> Calculate Payout Voucher
                </ShimmerButton>
              </div>
            </div>
          </SpotlightCard>

          {/* Commission Voucher Preview */}
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
                        <span>Applicable Tier Rate:</span>
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
      {/* 📦 TAB 3: STOCK RE-ORDER & DEPOT REQUISITION AGENT */}
      {/* ========================================================================= */}
      {activeTab === 'depot' && (
        <SpotlightCard>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  Bhubaneswar Depot Re-order Agent
                </h3>
              </div>
              <button
                className="btn-luxury-gold"
                style={{ padding: '6px 12px', fontSize: '11px' }}
                onClick={() => setDepotOrderGenerated(true)}
              >
                ⚡ Scan Stock & Compile Depot Indent
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Scans Rayagada floor showroom stock and active SafeLocks. Automatically recommends factory re-orders for SKUs below safe threshold (≤ 2 units).
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.8)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px' }}>SKU Code</th>
                    <th style={{ padding: '10px' }}>Product Description</th>
                    <th style={{ padding: '10px' }}>Current Stock</th>
                    <th style={{ padding: '10px' }}>Depot Indent Qty</th>
                    <th style={{ padding: '10px' }}>Depot Supply Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sku: 'SOF-MOD-001', name: 'Centuro 3-Seater Motorized Recliner', stock: 1, indent: 3, status: 'URGENT INDENT' },
                    { sku: 'ALM-MOD-001', name: 'Slimline 4-Door Steel Almirah (Walnut Teak)', stock: 2, indent: 4, status: 'REPLENISH' },
                    { sku: 'DIN-MOD-001', name: 'Carrara Marble 6-Seater Dining Set', stock: 0, indent: 2, status: 'OUT OF STOCK' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{row.sku}</td>
                      <td style={{ padding: '10px', color: '#FFFFFF' }}>{row.name}</td>
                      <td style={{ padding: '10px', color: row.stock === 0 ? '#EF4444' : '#F59E0B' }}>
                        {row.stock} Units {row.stock === 0 ? '⚠️' : ''}
                      </td>
                      <td style={{ padding: '10px', fontWeight: '700', color: '#10B981' }}>+{row.indent} Units</td>
                      <td style={{ padding: '10px' }}>
                        <span className={row.status === 'OUT OF STOCK' ? 'badge badge-rose' : 'badge badge-gold'} style={{ fontSize: '10px' }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {depotOrderGenerated && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#070D18', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-gold-light)' }}>
                    ✅ Depot Requisition Indent #BBSR-IND-8821 Compiled
                  </span>
                  <button
                    className="btn-cyan"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => {
                      const text = encodeURIComponent(`Godrej Interio Depot Indent #BBSR-IND-8821 from Sri Vinayaka Furnitures Rayagada:\n- SOF-MOD-001 (Centuro Recliner): 3 Pcs\n- ALM-MOD-001 (Slimline 4-Door): 4 Pcs\n- DIN-MOD-001 (Carrara Dining): 2 Pcs\nPlease confirm truck dispatch date from BBSR Depot.`);
                      window.open(`https://wa.me/919437155667?text=${text}`, '_blank');
                    }}
                  >
                    <Send size={12} /> Send to Depot Manager WhatsApp
                  </button>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  Total Indent Qty: <strong>9 Units</strong> | Estimated Depot Billing: <strong>₹3,42,000</strong>
                </div>
              </div>
            )}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* 🌟 TAB 4: VIP CART RECOVERY & FOLLOW-UP AGENT */}
      {/* ========================================================================= */}
      {activeTab === 'cart_recovery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Sparkles size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                  VIP QR Lead Recovery
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
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
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Language for Cultural Touch
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

                <ShimmerButton variant="gold" onClick={handleDraftRecovery} style={{ marginTop: '10px' }}>
                  <Sparkles size={14} /> Draft Cultural Follow-up Message
                </ShimmerButton>
              </div>
            </div>
          </SpotlightCard>

          {/* Drafted Message Output */}
          <SpotlightCard>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#FFFFFF', fontWeight: '800' }}>
                💬 AI WhatsApp Draft
              </h3>

              {draftedMessage ? (
                <div>
                  <div style={{ background: '#052E16', border: '1px solid #10B981', borderRadius: '10px', padding: '16px', color: '#FFFFFF', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                    {draftedMessage}
                  </div>

                  <button
                    className="btn-emerald"
                    style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                    onClick={() => {
                      window.open(`https://wa.me/91${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draftedMessage)}`, '_blank');
                    }}
                  >
                    <Send size={14} /> Send WhatsApp to {selectedLead.name}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '13px', margin: 0 }}>Click "Draft Cultural Follow-up Message" to generate personalized message with 1-click WhatsApp send.</p>
                </div>
              )}
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

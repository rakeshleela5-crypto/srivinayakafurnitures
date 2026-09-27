import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Share2, 
  Printer, 
  ArrowRight, 
  Check, 
  Layers, 
  Sliders, 
  Info,
  Maximize2
} from 'lucide-react';
import { 
  triggerGoldenConfetti, 
  playSuccessChime, 
  playScanBeep,
  playSafeLockSound,
  playTactileClick,
  playMechanicalPop
} from '../../utils/audioUtils';

/**
 * ==============================================================================
 * OmniBuild OS™ — Divergent UI Prototyping Lab (#27)
 * Core Component: Flagship Furniture Quotation & SafeLock Card
 * Showcases 3 distinct design engineering and motion paradigms:
 * - Prototype A: Sovereign Titanium Glass (Monastic, High-Density, Snappy 160ms)
 * - Prototype B: Tactile Heritage Neumorphism (Physical Inset Depth, 3D Sink, Brass Vault)
 * - Prototype C: Apple Fluid Kinetic Sheet (Continuous Squircle, iOS Springs, Fluid Touch)
 * ==============================================================================
 */

// Demo quotation payload for Dr. Subhashish Jena
const DEMO_QUOTE = {
  quoteId: 'QT-2026-8921',
  customerName: 'Dr. Subhashish Jena',
  phone: '+91 94371 88291',
  locality: 'Gayatri Nagar Villa, Rayagada',
  items: [
    { name: 'Kalista Hydraulic King Bed (Teak)', sku: 'BED-MOD-001', qty: 1, price: 78000 },
    { name: 'Centuro Motorized Recliner (Nano-Shield)', sku: 'SOF-REC-002', qty: 1, price: 54000 }
  ],
  grossAmount: 132000,
  festiveDiscount: 6600, // 5%
  netAmount: 125400,
  taxable: 106271,
  cgst: 9564.5,
  sgst: 9564.5,
  tokenAdvanceRequired: 25080, // 20%
  deliveryFee: 0 // Rayagada Local
};

export function QuotationCardPrototypes({ onClose }) {
  const [activePrototype, setActivePrototype] = useState('PROTOTYPE_A'); // 'PROTOTYPE_A' | 'PROTOTYPE_B' | 'PROTOTYPE_C'
  const [isLocked, setIsLocked] = useState(false);
  const [splitMode, setSplitMode] = useState('UPI'); // 'UPI' | 'CASH' | 'CARD'

  const handleLockTrigger = (protoType) => {
    if (protoType === 'PROTOTYPE_B') {
      playSafeLockSound();
    } else {
      playSuccessChime();
    }
    triggerGoldenConfetti();
    setIsLocked(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '880px',
      margin: '0 auto',
      padding: '10px'
    }}>
      {/* 🧪 PROTOTYPE SELECTOR RIBBON */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1.5px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> DIVERGENT UI PROTOTYPING LAB (#27)
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Select a design philosophy to preview the Flagship Quotation & SafeLock Card:
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.3)' }}>
            Comparing 3 Live Aesthetic & Motion Paradigms
          </div>
        </div>

        {/* Prototype Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => { setActivePrototype('PROTOTYPE_A'); playTactileClick(); setIsLocked(false); }}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: activePrototype === 'PROTOTYPE_A' ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
              background: activePrototype === 'PROTOTYPE_A' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
              color: activePrototype === 'PROTOTYPE_A' ? '#FFF8DC' : '#94A3B8',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 120ms ease, background-color 160ms ease'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '800' }}>👑 Prototype A: Sovereign Titanium Glass</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Linear/Vercel craft • 1px Gold hairline • 160ms snap</div>
          </button>

          <button
            onClick={() => { setActivePrototype('PROTOTYPE_B'); playTactileClick(); setIsLocked(false); }}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: activePrototype === 'PROTOTYPE_B' ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.08)',
              background: activePrototype === 'PROTOTYPE_B' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
              color: activePrototype === 'PROTOTYPE_B' ? '#FDE68A' : '#94A3B8',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 120ms ease, background-color 160ms ease'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '800' }}>🏛️ Prototype B: Tactile Heritage</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Physical inset depth • 3D button sink • Stamped seal</div>
          </button>

          <button
            onClick={() => { setActivePrototype('PROTOTYPE_C'); playTactileClick(); setIsLocked(false); }}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: activePrototype === 'PROTOTYPE_C' ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
              background: activePrototype === 'PROTOTYPE_C' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
              color: activePrototype === 'PROTOTYPE_C' ? '#E0F2FE' : '#94A3B8',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 120ms ease, background-color 160ms ease'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '800' }}>🍏 Prototype C: Apple Fluid Sheet</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Continuous squircle • 280ms spring dampening • Fluid pill</div>
          </button>
        </div>
      </div>

      {/* 🌟 PROTOTYPE A: SOVEREIGN TITANIUM GLASS */}
      {activePrototype === 'PROTOTYPE_A' && (
        <div style={{
          background: 'linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(7,11,20,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.15)',
          borderRadius: '16px',
          padding: '28px',
          animation: 'modalCenteredSpring 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--accent-gold-light)' }}>
                SOVEREIGN SHOWROOM QUOTATION #{DEMO_QUOTE.quoteId}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                {DEMO_QUOTE.customerName}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                📍 {DEMO_QUOTE.locality} • 📞 {DEMO_QUOTE.phone}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                {isLocked ? '🔒 SAFELOCKED (STAGED)' : '⚡ LIVE NEGOTIATION'}
              </span>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                Reverse 18% GST Compliant ✓
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {DEMO_QUOTE.items.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{item.name}</div>
                  <div style={{ fontSize: '10.5px', color: '#64748B' }}>SKU: {item.sku} • Qty: {item.qty}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold-light)', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown Footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            background: 'rgba(0,0,0,0.3)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '22px'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>GROSS SUBTOTAL</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>₹{DEMO_QUOTE.grossAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#10B981' }}>FESTIVE DISCOUNT (5%)</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>-₹{DEMO_QUOTE.festiveDiscount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#38BDF8' }}>TAXABLE BASE</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8' }}>₹{DEMO_QUOTE.taxable.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>FINAL PAYABLE</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold)', fontVariantNumeric: 'tabular-nums' }}>
                ₹{DEMO_QUOTE.netAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Interactive SafeLock Action Bar */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button className="btn-ghost-edit" onClick={() => playScanBeep()}>
              <Printer size={14} /> Print Bluetooth Slip
            </button>
            <button className="btn-ghost-edit" onClick={() => playScanBeep()}>
              <Share2 size={14} /> Send WhatsApp PDF
            </button>
            <button 
              className="btn-luxury-gold"
              onClick={() => handleLockTrigger('PROTOTYPE_A')}
              disabled={isLocked}
              style={{ padding: '10px 22px' }}
            >
              {isLocked ? <><Check size={16} /> SafeLock Vault Sealed ✓</> : <><Lock size={15} /> Lock 20% Token (₹{DEMO_QUOTE.tokenAdvanceRequired.toLocaleString()})</>}
            </button>
          </div>
        </div>
      )}

      {/* 🏛️ PROTOTYPE B: TACTILE HERITAGE NEUMORPHISM */}
      {activePrototype === 'PROTOTYPE_B' && (
        <div style={{
          background: 'linear-gradient(180deg, #1A1F2C 0%, #0F141F 100%)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.5)',
          border: '1.5px solid #2A3245',
          animation: 'modalCenteredSpring 240ms cubic-bezier(0.2, 0.9, 0.3, 1.15) forwards'
        }}>
          {/* Godrej Heritage Crest */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px groove rgba(212,175,55,0.2)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 10px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🏛️
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#FDE68A', letterSpacing: '0.04em' }}>
                  SHREE GANESH ENTERPRISES • GODREJ INTERIO
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  127-Year Trust • Rayagada Flagship Showroom Vault
                </div>
              </div>
            </div>

            {/* Brass Stamped Wax Seal */}
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: isLocked ? 'radial-gradient(circle, #059669 0%, #064E3B 100%)' : 'radial-gradient(circle, #D97706 0%, #78350F 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 2px 3px rgba(255,255,255,0.4)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '900',
              color: '#FFFFFF',
              transform: isLocked ? 'scale(1.05) rotate(-5deg)' : 'scale(1)',
              transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <span>{isLocked ? 'SEALED' : 'TOKEN'}</span>
              <span style={{ fontSize: '8px', opacity: 0.8 }}>{isLocked ? 'ODISHA' : '20%'}</span>
            </div>
          </div>

          {/* Tactile Inset Customer Ledger Box */}
          <div style={{
            background: '#0B0F17',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Client: <strong style={{ color: '#FFFFFF' }}>{DEMO_QUOTE.customerName}</strong></span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Location: <strong style={{ color: '#FBBF24' }}>Rayagada Town</strong></span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Packages: 1x Kalista King Bed with Teak Finish + 1x Centuro Motorized Recliner
            </div>
          </div>

          {/* Physical 3D Tactile Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Showroom Value:</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#FDE68A', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                ₹{DEMO_QUOTE.netAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={() => handleLockTrigger('PROTOTYPE_B')}
              disabled={isLocked}
              style={{
                background: isLocked 
                  ? 'linear-gradient(180deg, #10B981 0%, #047857 100%)'
                  : 'linear-gradient(180deg, #F59E0B 0%, #B45309 100%)',
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: '13px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                boxShadow: isLocked 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
                  : '0 6px 0 #78350F, 0 10px 20px rgba(0,0,0,0.5)',
                transform: isLocked ? 'translateY(4px)' : 'none',
                cursor: 'pointer',
                transition: 'transform 80ms ease, box-shadow 80ms ease'
              }}
            >
              {isLocked ? '✓ SAFE STAMPED & LOCKED' : '🔒 STAMP & LOCK ADVANCE'}
            </button>
          </div>
        </div>
      )}

      {/* 🍏 PROTOTYPE C: APPLE FLUID KINETIC SHEET */}
      {activePrototype === 'PROTOTYPE_C' && (
        <div style={{
          background: 'rgba(23, 31, 49, 0.82)',
          backdropFilter: 'blur(30px) saturate(190%)',
          borderRadius: '28px',
          clipPath: 'inset(0 round 28px)', // Apple Continuous Squircle Smoothing
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2)',
          padding: '28px',
          animation: 'modalCenteredSpring 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* iOS Handlebar Indicator */}
          <div style={{ width: '38px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto 16px auto' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#38BDF8', letterSpacing: '0.05em' }}>
                SHOWROOM PROPOSAL
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                {DEMO_QUOTE.customerName}
              </div>
            </div>

            {/* Apple Segmented Control for Tender Mode */}
            <div style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.35)',
              padding: '3px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {['UPI', 'CASH', 'CARD'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setSplitMode(mode); playMechanicalPop(); }}
                  style={{
                    background: splitMode === mode ? '#38BDF8' : 'transparent',
                    color: splitMode === mode ? '#070B14' : '#94A3B8',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Fluid Cards Container */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            padding: '18px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: '600' }}>2 Items Selected</span>
              <span style={{ fontSize: '11px', color: '#38BDF8', background: 'rgba(56,189,248,0.12)', padding: '3px 8px', borderRadius: '8px' }}>
                Free Rayagada Delivery
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Total Payable</span>
              <span style={{ fontSize: '26px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                ₹{DEMO_QUOTE.netAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Apple HIG Fluid Action Button */}
          <button
            onClick={() => handleLockTrigger('PROTOTYPE_C')}
            disabled={isLocked}
            style={{
              width: '100%',
              background: isLocked ? '#10B981' : 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
              color: isLocked ? '#FFFFFF' : '#070B14',
              fontWeight: '800',
              fontSize: '14px',
              padding: '14px 20px',
              borderRadius: '999px', // Pill button
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(56,189,248,0.3)',
              transform: isLocked ? 'scale(0.98)' : 'none',
              transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease'
            }}
          >
            {isLocked ? (
              <><Check size={18} /> Order Confirmed & Synchronized</>
            ) : (
              <><CreditCard size={18} /> Confirm {splitMode} Token (₹{DEMO_QUOTE.tokenAdvanceRequired.toLocaleString()}) <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      )}

      {/* 📊 CRAFT COMPARISON MATRIX TABLE */}
      <div style={{
        background: 'rgba(10, 15, 29, 0.8)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={14} color="var(--accent-gold)" /> CRAFT & MOTION SPECIFICATION MATRIX
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="luxury-table" style={{ fontSize: '11.5px' }}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Prototype A (Titanium Glass)</th>
                <th>Prototype B (Tactile Heritage)</th>
                <th>Prototype C (Apple Fluid Sheet)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Corner Smoothing</strong></td>
                <td>Standard 16px radius</td>
                <td>Chiseled 20px outer, 12px inner</td>
                <td>Continuous 28px Squircle</td>
              </tr>
              <tr>
                <td><strong>Spring Timing</strong></td>
                <td>160ms snap (Fast feedback)</td>
                <td>80ms mechanical button sink</td>
                <td>280ms spring ($k=300, \zeta=0.78$)</td>
              </tr>
              <tr>
                <td><strong>Button Feedback</strong></td>
                <td>Subtle 1px micro-drop</td>
                <td>6px physical 3D key depression</td>
                <td>Pill squeeze with touch tracking</td>
              </tr>
              <tr>
                <td><strong>Best For</strong></td>
                <td>Director Daily Operations</td>
                <td>Traditional Trust & Heritage VIPs</td>
                <td>Mobile Customer Concierge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

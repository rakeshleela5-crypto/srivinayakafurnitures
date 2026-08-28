import React, { useState, useEffect } from 'react';
import { useStore, USER_ROLES } from '../context/StoreContext';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Delete, 
  Sparkles, 
  UserCheck,
  Zap,
  Key
} from 'lucide-react';
import { playScanBeep } from '../utils/audioUtils';

export function AuthLockScreen() {
  const { loginWithPin, loginAsRole } = useStore();
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  // Keyboard listener for physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 4) {
          handleKeyClick(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          submitPin(pin);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleKeyClick = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      playScanBeep();
      if (newPin.length === 4) {
        submitPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    playScanBeep();
  };

  const handleClear = () => {
    setPin('');
    playScanBeep();
  };

  const submitPin = (enteredPin) => {
    const result = loginWithPin(enteredPin);
    if (!result.success) {
      setErrorShake(true);
      setTimeout(() => {
        setErrorShake(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 30%, #0F172A 0%, #070B14 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Aura */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', top: '15%', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Main Lock Screen Card */}
      <div style={{
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(212,175,55,0.3)',
        borderRadius: '24px',
        padding: '36px 32px',
        maxWidth: '420px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(212,175,55,0.1)',
        position: 'relative',
        zIndex: 2,
        transform: errorShake ? 'translateX(-8px)' : 'none',
        transition: 'transform 0.1s ease'
      }}>
        
        {/* Brand Logo & Header */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #D4AF37, #B45309)',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: '900',
          boxShadow: '0 0 20px rgba(212,175,55,0.5)',
          marginBottom: '12px'
        }}>
          GI
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', textAlign: 'center', letterSpacing: '0.5px' }}>
          OmniBuild OS™
        </h2>
        <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px', textAlign: 'center' }}>
          Godrej Interio Rayagada Flagship
        </div>

        {/* PIN Dots Indicator */}
        <div style={{ display: 'flex', gap: '14px', margin: '24px 0 16px 0' }}>
          {[0, 1, 2, 3].map(idx => {
            const isFilled = pin.length > idx;
            return (
              <div 
                key={idx}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: isFilled ? 'linear-gradient(135deg, #D4AF37, #F59E0B)' : 'rgba(255,255,255,0.15)',
                  border: isFilled ? '2px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.3)',
                  boxShadow: isFilled ? '0 0 12px var(--accent-gold)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}
        </div>

        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '18px' }}>
          Enter your 4-digit showroom staff PIN
        </div>

        {/* Numeric Keypad (3x4 Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', maxWidth: '280px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyClick(String(num))}
              style={{
                background: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: '800',
                padding: '14px 0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,41,59,0.7)'}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'rgba(30,41,59,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              color: '#94A3B8',
              fontSize: '11px',
              fontWeight: '800',
              padding: '14px 0',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            style={{
              background: 'rgba(30,41,59,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: '800',
              padding: '14px 0',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,41,59,0.7)'}
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            style={{
              background: 'rgba(30,41,59,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              color: '#F43F5E',
              fontSize: '18px',
              padding: '14px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Delete size={18} />
          </button>
        </div>

        {/* 1-Click Quick-Switch Role Selector (Demo / Showroom Pills) */}
        <div style={{ width: '100%', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
            ⚡ 1-Click Fast Profile Switcher:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              className="btn-ghost-edit" 
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '11px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
              onClick={() => loginAsRole('OWNER')}
            >
              <span>👑 <b>Rakesh (Store Owner)</b></span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-gold-light)' }}>PIN: 8899</span>
            </button>

            <button 
              className="btn-ghost-edit" 
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '11px' }}
              onClick={() => loginAsRole('SALES')}
            >
              <span>💼 <b>Sunil (Sales Executive)</b></span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>PIN: 1122</span>
            </button>

            <button 
              className="btn-ghost-edit" 
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '11px' }}
              onClick={() => loginAsRole('WAREHOUSE')}
            >
              <span>📦 <b>Santosh (Dock Supervisor)</b></span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-amber)' }}>PIN: 3344</span>
            </button>

            <button 
              className="btn-ghost-edit" 
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '11px' }}
              onClick={() => loginAsRole('DRIVER')}
            >
              <span>🚚 <b>Tophan (Fleet Driver)</b></span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-purple)' }}>PIN: 5566</span>
            </button>

            <button 
              className="btn-ghost-edit" 
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '11px' }}
              onClick={() => loginAsRole('ARCHITECT')}
            >
              <span>🏛️ <b>Ar. Sunita (VIP Partner)</b></span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-emerald)' }}>PIN: 7788</span>
            </button>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '16px', fontSize: '11px', color: '#64748B', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>Godrej Interio Rayagada • Enterprise Role-Based Access Control • 256-Bit Encrypted</div>
        <div style={{ color: 'var(--accent-gold-light)', fontSize: '10.5px' }}>
          ⚖️ Legally Protected under DPDP Act 2023 & Section 43/66 IT Act 2000 (Govt. of India)
        </div>
      </div>
    </div>
  );
}

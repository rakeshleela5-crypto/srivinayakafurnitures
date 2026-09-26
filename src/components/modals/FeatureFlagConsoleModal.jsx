// ==============================================================================
// OmniBuild OS™ — Enterprise Feature Flag & Canary Rollout Management Console
// Provides Store Director with instant toggle kill-switches and canary audits
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Radio, 
  Layers, 
  X, 
  Zap, 
  Cpu, 
  Info 
} from 'lucide-react';
import { 
  getAllFeatureFlagStatuses, 
  setFeatureFlagOverride, 
  resetAllFeatureFlagOverrides 
} from '../../services/featureFlagService';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export default function FeatureFlagConsoleModal({ isOpen, onClose }) {
  const [flags, setFlags] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      refreshFlags();
    }
  }, [isOpen]);

  const refreshFlags = () => {
    setFlags(getAllFeatureFlagStatuses());
  };

  if (!isOpen) return null;

  const handleToggle = (flagKey, currentState) => {
    playScanBeep();
    setFeatureFlagOverride(flagKey, !currentState);
    refreshFlags();
  };

  const handleClearOverride = (flagKey) => {
    playScanBeep();
    setFeatureFlagOverride(flagKey, null);
    refreshFlags();
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all feature flags to production master defaults?')) {
      playSuccessChime();
      triggerGoldenConfetti();
      resetAllFeatureFlagOverrides();
      refreshFlags();
    }
  };

  const categories = ['ALL', ...new Set(flags.map(f => f.category))];

  const filteredFlags = filterCategory === 'ALL' 
    ? flags 
    : flags.filter(f => f.category === filterCategory);

  const activeCount = flags.filter(f => f.currentlyActive).length;
  const overriddenCount = flags.filter(f => f.hasOverride).length;

  return (
    <div className="modal-backdrop-luxury animate-fade-in" style={{ zIndex: 1200 }}>
      <div 
        className="glass-modal-card animate-scale-up" 
        style={{ 
          maxWidth: '850px', 
          width: '95%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.98), rgba(5, 8, 16, 0.99))',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '16px 22px', 
          borderBottom: '1px solid rgba(255,255,255,0.08)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(212,175,55,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(212,175,55,0.15)',
              border: '1px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Feature Flag & Canary Rollout Console
              </h2>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Architecture Pillar #12 • Zero-Overhead Hash Cohorts • Emergency Kill-Switches
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-ghost-edit"
              onClick={handleResetAll}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444' }}
              title="Reset all local overrides"
            >
              <RotateCcw size={12} /> Reset Master Defaults
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Real-time Metrics Pill Strip */}
        <div style={{ 
          padding: '10px 22px', 
          background: 'rgba(0,0,0,0.3)', 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-emerald" style={{ fontSize: '10.5px' }}>
              ✓ {activeCount} / {flags.length} Flags Active
            </span>
            {overriddenCount > 0 ? (
              <span className="badge badge-rose" style={{ fontSize: '10.5px' }}>
                ⚠️ {overriddenCount} Manual Overrides Active
              </span>
            ) : (
              <span className="badge badge-gold" style={{ fontSize: '10.5px' }}>
                ⚡ Production Master Governed
              </span>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                style={{
                  fontSize: '10.5px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: filterCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: filterCategory === cat ? '#000000' : '#CBD5E1',
                  fontWeight: filterCategory === cat ? '800' : '500'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Flag List Body */}
        <div style={{ padding: '16px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredFlags.map(flag => {
            const isOverridden = flag.hasOverride;
            const isCurrentlyActive = flag.currentlyActive;

            return (
              <div 
                key={flag.key}
                style={{
                  background: isCurrentlyActive ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${isOverridden ? 'rgba(239, 68, 68, 0.4)' : isCurrentlyActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Flag Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: isCurrentlyActive ? '#FFFFFF' : '#94A3B8' }}>
                      {flag.name}
                    </span>
                    <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)', background: 'rgba(14,165,233,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                      {flag.key}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                      {flag.category}
                    </span>
                    {isOverridden && (
                      <span className="badge badge-rose" style={{ fontSize: '9px' }}>
                        OVERRIDDEN ({flag.overrideValue ? 'ON' : 'OFF'})
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                    {flag.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '10px', color: '#64748B' }}>
                    <span>Rollout: <strong style={{ color: flag.rolloutPercentage === 100 ? '#10B981' : 'var(--accent-gold)' }}>{flag.rolloutPercentage}%</strong></span>
                    <span>•</span>
                    <span>Target Roles: <strong style={{ color: '#E2E8F0' }}>{flag.allowedRoles.join(', ')}</strong></span>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => handleClearOverride(flag.key)}
                      style={{ fontSize: '10px', color: '#94A3B8', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                      title="Clear manual override and revert to master rule"
                    >
                      Clear Override
                    </button>
                  )}

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(flag.key, isCurrentlyActive)}
                    style={{
                      width: '54px',
                      height: '28px',
                      borderRadius: '14px',
                      background: isCurrentlyActive ? '#10B981' : 'rgba(255,255,255,0.15)',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      padding: '2px'
                    }}
                    title={isCurrentlyActive ? 'Click to disable' : 'Click to enable'}
                  >
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        transform: isCurrentlyActive ? 'translateX(26px)' : 'translateX(0px)',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }} 
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '12px 22px', 
          background: 'rgba(0,0,0,0.5)', 
          borderTop: '1px solid rgba(255,255,255,0.08)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} color="var(--accent-gold)" />
            <span>Changes take effect immediately across all showroom tabs without page reload.</span>
          </div>

          <button
            type="button"
            className="btn-luxury-gold"
            onClick={onClose}
            style={{ fontSize: '11px', padding: '6px 18px', fontWeight: '800' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

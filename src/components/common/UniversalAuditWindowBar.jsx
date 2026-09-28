import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Calendar, 
  RefreshCw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ShieldCheck, 
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

// Helper to format Date as YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format Date as DD/MM/YYYY for Indian display standard
export function formatDisplayDate(isoStr) {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

export function UniversalAuditWindowBar({ customTitle, showBanner = true, compact = false }) {
  const { 
    auditDateWindow, 
    updateAuditWindow, 
    activeTab, 
    showToast,
    openModal
  } = useStore();

  const [localFrom, setLocalFrom] = useState(auditDateWindow?.fromDate || '2026-09-28');
  const [localTo, setLocalTo] = useState(auditDateWindow?.toDate || '2026-09-28');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync if external store changes
  React.useEffect(() => {
    if (auditDateWindow?.fromDate) setLocalFrom(auditDateWindow.fromDate);
    if (auditDateWindow?.toDate) setLocalTo(auditDateWindow.toDate);
  }, [auditDateWindow?.fromDate, auditDateWindow?.toDate]);

  // Apply Quick Date Presets
  const applyPreset = (presetName) => {
    playScanBeep();
    const baseToday = new Date('2026-09-28T00:00:00');

    let s = '2026-09-28';
    let e = '2026-09-28';

    if (presetName === 'Today') {
      s = formatDate(baseToday);
      e = formatDate(baseToday);
    } else if (presetName === 'Yesterday') {
      const yesterday = new Date(baseToday);
      yesterday.setDate(yesterday.getDate() - 1);
      s = formatDate(yesterday);
      e = formatDate(yesterday);
    } else if (presetName === 'Last 7 Days') {
      const past7 = new Date(baseToday);
      past7.setDate(past7.getDate() - 6);
      s = formatDate(past7);
      e = formatDate(baseToday);
    } else if (presetName === 'This Month') {
      s = '2026-09-01';
      e = '2026-09-30';
    } else if (presetName === 'FY Year') {
      // Indian Financial Year 2026-27 (1 Apr 2026 - 31 Mar 2027)
      s = '2026-04-01';
      e = '2027-03-31';
    }

    setLocalFrom(s);
    setLocalTo(e);

    updateAuditWindow({
      fromDate: s,
      toDate: e,
      appliedFrom: s,
      appliedTo: e,
      activePreset: presetName
    });

    showToast(`📅 Audit Window Synced: ${presetName} (${formatDisplayDate(s)} to ${formatDisplayDate(e)})`);
  };

  // Handle Green Display Button Click -> Opens Universal Date Audit Pop-Up Modal
  const handleDisplayClick = () => {
    playScanBeep();
    updateAuditWindow({
      fromDate: localFrom,
      toDate: localTo,
      appliedFrom: localFrom,
      appliedTo: localTo,
      activePreset: 'Custom Range'
    });
    // Open Universal Pop-up View for that Date Range
    openModal('universal_date_audit', {
      fromDate: localFrom,
      toDate: localTo,
      context: activeTab
    });
    showToast(`⚡ Displaying Synced Audit Pop-Up: ${formatDisplayDate(localFrom)} to ${formatDisplayDate(localTo)}`);
  };

  // Dynamic context title based on active tab if customTitle is not passed
  const getBannerTitle = () => {
    if (customTitle) return customTitle;

    switch (activeTab) {
      case 'autoprocure':
        return `AUTOPROCURE™ FACTORY PO & SOURCING AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'crm':
        return `SHOWROOM CRM LEADS & PIPELINE AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'architects':
        return `VIP ARCHITECT PARTNER COMMISSION & REFERRAL AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'documents':
        return `CENTRAL DOCUMENT STUDIO STATUTORY PRINT AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'inward_scanner':
        return `DOCK 1 INWARD TRUCK UNLOADING & QC AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'outward_scanner':
        return `DOCK 2 OUTWARD TRUCK DISPATCH & GATEPASS AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'barcode_studio':
      case 'qr_studio':
        return `BARCODE & 2D QR STUDIO PRINT AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'pms_tape_chart':
        return `PMS AUDIT WINDOW (TAPE CHART) FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'executive':
        return `EXECUTIVE REVENUE AUDIT WINDOW FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'voice_pos':
        return `VOICE POS & SHOWROOM BILLING AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'bank_ledger':
      case 'bank_statement':
        return `BANK & RTGS SETTLEMENT AUDIT WINDOW FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'tally_gst_desk':
        return `TALLY PRIME™ & GST STATUTORY AUDIT WINDOW FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'b2b_projects':
        return `B2B HOTEL & INSTITUTIONAL CONTRACT AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'safelock':
        return `SAFELOCK WAREHOUSE AGING & STAGING WINDOW FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'logistics_epod':
      case 'autonomous_fleet':
        return `LOGISTICS FLEET & ePOD DISPATCH AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      case 'live_database':
        return `CLOUDFLARE D1 DATABASE 52-TABLE AUDIT FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
      default:
        return `OMNIBUILD OS™ MASTER AUDIT WINDOW FROM ${formatDisplayDate(auditDateWindow.appliedFrom)} TO ${formatDisplayDate(auditDateWindow.appliedTo)}`;
    }
  };

  if (compact && isCollapsed) {
    return (
      <div 
        style={{
          background: 'linear-gradient(90deg, #070B16 0%, #0F172A 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(false)}
        title="Click to expand full date range controller"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-gold)' }}>📅 Audit Horizon:</span>
          <strong style={{ color: '#FFFFFF' }}>{formatDisplayDate(auditDateWindow.appliedFrom)}</strong>
          <span style={{ color: '#94A3B8' }}>to</span>
          <strong style={{ color: '#FFFFFF' }}>{formatDisplayDate(auditDateWindow.appliedTo)}</strong>
          <span className="badge badge-gold" style={{ fontSize: '9.5px', padding: '1px 6px' }}>{auditDateWindow.activePreset}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDisplayClick();
            }}
            style={{
              background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
            }}
          >
            ⚡ Pop-Up
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold-light)' }}>
            <span>Adjust Dates</span> <ChevronDown size={13} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="universal-audit-window-bar"
      style={{
        background: 'linear-gradient(180deg, #070B16 0%, #0F172A 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '4px'
      }}
    >
      {/* Top Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Left Date Inputs & Green Display Button */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* From Date Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', letterSpacing: '0.5px' }}>
              From :
            </span>
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              background: '#0B132B',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '4px 8px'
            }}>
              <input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* To Date Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', letterSpacing: '0.5px' }}>
              To :
            </span>
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              background: '#0B132B',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '4px 8px'
            }}>
              <input
                type="date"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* 🟢 Bright Green Display Action Button (Exact Replica) */}
          <button
            onClick={handleDisplayClick}
            style={{
              background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
              color: '#FFFFFF',
              border: '1px solid #4ADE80',
              borderRadius: '7px',
              padding: '5px 18px',
              fontSize: '12.5px',
              fontWeight: '900',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Display
          </button>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px', flexWrap: 'wrap' }}>
            {['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'FY Year'].map((preset) => {
              const isActive = auditDateWindow.activePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  style={{
                    background: isActive ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#38BDF8' : '#CBD5E1',
                    border: isActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: isActive ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Info & Collapse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            Universal Sync
          </span>

          {compact && (
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#CBD5E1',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
              title="Minimize Audit Bar"
            >
              <ChevronUp size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 🌟 PROMINENT GOLD AUDIT TITLE BANNER (EXACT REPLICA) */}
      {showBanner && (
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '900',
            color: '#F59E0B',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
          }}>
            <span>🏛️</span> {getBannerTitle()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5px', color: '#94A3B8' }}>
            <span>Active Range: <strong style={{ color: '#F1F5F9' }}>{formatDisplayDate(auditDateWindow.appliedFrom)} ➔ {formatDisplayDate(auditDateWindow.appliedTo)}</strong></span>
            <span>•</span>
            <button
              onClick={handleDisplayClick}
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '5px',
                padding: '3px 10px',
                color: 'var(--accent-gold)',
                fontSize: '10.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
              title="Click to view full Daybook & Audit Pop-up"
            >
              <span>🔍 View Pop-Up Daybook</span>
            </button>
            <span>•</span>
            <span>Status: <strong style={{ color: '#34D399' }}>Live Cloud Active</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
export default UniversalAuditWindowBar;

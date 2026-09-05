import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Layers, 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Factory, 
  Landmark, 
  Users, 
  MessageSquare, 
  FileText, 
  Database,
  RefreshCw,
  Zap,
  Smartphone
} from 'lucide-react';

export function TopTicker() {
  return (
    <div className="luxury-top-ticker">
      <div className="ticker-track">
        <div className="ticker-item">
          <span>🏛️</span>
          <span><b>GODREJ INTERIO RAYAGADA FLAGSHIP SHOWROOM</b></span>
        </div>
        <div className="ticker-item">
          <span>📍</span>
          <span>Main Road, Near New Bus Stand, Rayagada (OD 765001)</span>
        </div>
        <div className="ticker-item">
          <span>📞</span>
          <span>+91 93905 53301</span>
        </div>
        <div className="ticker-item">
          <span>🔒</span>
          <span>SafeLock™ Real-Time Stock Defense Active (115 SKUs)</span>
        </div>
        <div className="ticker-item">
          <span>🚚</span>
          <span>Express Delivery Across Rayagada District</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="pulse-dot-emerald" />
        <span style={{ fontSize: '10.5px', color: 'var(--accent-emerald)', fontWeight: '800' }}>LIVE ONLINE</span>
      </div>
    </div>
  );
}

export function AppHeader() {
  const { storeMeta, syncWithGoogleSheets, isSyncing, setActiveTab, currentUser, logout, openModal } = useStore();

  return (
    <header className="app-header">
      <div className="brand-box">
        <div className="brand-logo-badge">GI</div>
        <div className="brand-text">
          <h1>OmniBuild OS™</h1>
          <p>Godrej Interio Rayagada Flagship Showroom & Supply Chain Cockpit</p>
        </div>
      </div>

      <div className="header-actions">
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${currentUser.badgeClass}`} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{currentUser.avatar}</span>
              <span>{currentUser.name}</span>
            </span>
            <button className="btn-ghost-edit" onClick={logout} style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)' }} title="Lock Screen">
              <span>🔒 Lock</span>
            </button>
          </div>
        )}
        <button 
          className="btn-ghost-edit" 
          onClick={() => setActiveTab('bank_ledger')} 
          style={{ fontSize: '11px', padding: '6px 12px', color: '#34D399', border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.08)' }} 
          title="Open Commercial Bank Ledger, Statement Reconciler & B2B RTGS"
        >
          <span>🏛️ Bank Ledger & RTGS</span>
        </button>
        <button 
          className="btn-ghost-edit" 
          onClick={() => openModal('store_settings')} 
          style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-emerald)', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)' }} 
          title="Configure Showroom Legal Entity, GSTIN, and Doorstep Merchant UPI VPA"
        >
          <span>⚙️ Identity & UPI</span>
        </button>
        <button 
          className="btn-ghost-edit" 
          onClick={() => openModal('dpdp_compliance')} 
          style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }} 
          title="View Statutory DPDP 2023 Privacy Policy & Anti-Hacking Terms"
        >
          <ShieldCheck size={13} /> <span>🛡️ DPDP 2023</span>
        </button>
        <button className="btn-luxury-gold" onClick={() => setActiveTab('staff_qr')} style={{ padding: '6px 14px', fontSize: '11.5px' }}>
          <span>📱 Staff QR</span>
        </button>
        <button className="btn-header-sync" onClick={() => syncWithGoogleSheets(false)}>
          <RefreshCw size={13} className={isSyncing ? 'spin-anim' : ''} />
          <span>{isSyncing ? 'Syncing...' : '2-Way Webhook Sync'}</span>
        </button>
      </div>
    </header>
  );
}

export function TabsRibbon() {
  const { activeTab, setActiveTab, currentUser } = useStore();

  const allTabs = [
    // PHASE 1: Executive & Showroom Sales
    { id: 'executive', label: '☕ 1. Executive Cockpit', icon: Zap },
    { id: 'crm', label: '👥 2. Showroom CRM Leads', icon: Users },
    { id: 'voice_pos', label: '🎙️ 3. AI Voice POS & Quote', icon: Mic },
    { id: 'architects', label: '🏛️ 4. Architect VIP Network', icon: Landmark },

    // PHASE 2: Warehouse Dock & Supply Chain
    { id: 'autoprocure', label: '🏭 5. Factory POs & AutoProcure', icon: Factory },
    { id: 'inward_scanner', label: '📦 6. Inward Truck QC Scanner', icon: Truck },
    { id: 'safelock', label: '🔒 7. SafeLock Warehouse Stock', icon: ShieldCheck },
    { id: 'barcode_studio', label: '🏷️ 8. Barcode Studio (1D)', icon: Layers },
    { id: 'qr_studio', label: '📱 9. Product QR Studio (2D)', icon: Smartphone },

    // PHASE 3: Outward Dispatch & Customer Delivery
    { id: 'outward_scanner', label: '🚚 10. Outward Dispatch Scanner', icon: Truck },
    { id: 'logistics_epod', label: '📱 11. Logistics Fleet & ePOD', icon: Truck },
    { id: 'documents', label: '🧾 12. Document Studio', icon: FileText },

    // PHASE 4: Finance, Automation & Master Database
    { id: 'bank_ledger', label: '🏛️ 13. Bank Statements & RTGS', icon: Landmark },
    { id: 'whatsapp_bots', label: '💬 14. WhatsApp & 26 Bots', icon: MessageSquare },
    { id: 'staff_qr', label: '📱 15. Staff Mobile QR Hub', icon: Smartphone },
    { id: 'live_database', label: '📡 16. Live 36-Table Cloud', icon: Database }
  ];

  // Filter tabs allowed for current role
  const visibleTabs = currentUser?.allowedTabs 
    ? allTabs.filter(tab => currentUser.allowedTabs.includes(tab.id))
    : allTabs;

  return (
    <div className="tabs-ribbon">
      {visibleTabs.map(tab => (
        <button 
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export function BottomDock() {
  const { activeTab, setActiveTab, currentUser } = useStore();

  const allDockItems = [
    { id: 'executive', label: '☕ Executive' },
    { id: 'crm', label: '👥 CRM Leads' },
    { id: 'voice_pos', label: '🎙️ Voice POS' },
    { id: 'architects', label: '🏛️ Architects' },
    { id: 'autoprocure', label: '🏭 Factory PO' },
    { id: 'inward_scanner', label: '📦 Inward' },
    { id: 'safelock', label: '🔒 SafeLock' },
    { id: 'barcode_studio', label: '🏷️ Barcodes' },
    { id: 'qr_studio', label: '📱 QR Studio' },
    { id: 'outward_scanner', label: '🚚 Outward' },
    { id: 'logistics_epod', label: '📱 Fleet ePOD' },
    { id: 'documents', label: '🧾 Documents' },
    { id: 'bank_ledger', label: '🏛️ Bank Ledger' },
    { id: 'whatsapp_bots', label: '💬 WhatsApp' },
    { id: 'staff_qr', label: '📱 QR Hub' },
    { id: 'live_database', label: '📡 36 Tables' }
  ];

  const visibleDockItems = currentUser?.allowedTabs
    ? allDockItems.filter(item => currentUser.allowedTabs.includes(item.id))
    : allDockItems;

  return (
    <div className="luxury-bottom-dock">
      {visibleDockItems.map(item => (
        <button 
          key={item.id}
          className={`dock-btn ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

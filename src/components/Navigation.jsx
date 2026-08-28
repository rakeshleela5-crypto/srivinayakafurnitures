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
          onClick={() => openModal('dpdp_compliance')} 
          style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }} 
          title="View Statutory DPDP 2023 Privacy Policy & Anti-Hacking Terms"
        >
          <ShieldCheck size={13} /> <span>🛡️ DPDP 2023 Shield</span>
        </button>
        <button className="btn-luxury-gold" onClick={() => setActiveTab('staff_qr')} style={{ padding: '6px 14px', fontSize: '11.5px' }}>
          <span>📱 Staff QR Portals</span>
        </button>
        <button className="btn-header-sync" onClick={syncWithGoogleSheets}>
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
    { id: 'executive', label: '☕ 1. Executive Hub', icon: Zap },
    { id: 'voice_pos', label: '🎙️ 2. AI Voice POS & Quote', icon: Mic },
    { id: 'room_matcher', label: '📸 3. 2D AI Room Matcher', icon: Sparkles },
    { id: 'safelock', label: '🔒 4. SafeLock Inventory', icon: ShieldCheck },
    { id: 'autoprocure', label: '🏭 5. Factory Purchase Orders', icon: Factory },
    { id: 'logistics_epod', label: '🚚 6. Fleet & Digital ePOD', icon: Truck },
    { id: 'architects', label: '🏛️ 7. Architect VIP Referral', icon: Landmark },
    { id: 'crm', label: '👥 8. Showroom CRM Leads', icon: Users },
    { id: 'whatsapp_bots', label: '💬 9. WhatsApp & 20 Bots', icon: MessageSquare },
    { id: 'documents', label: '🧾 10. Document Studio', icon: FileText },
    { id: 'live_database', label: '📡 11. Live 21-Table Cloud', icon: Database },
    { id: 'barcode_studio', label: '🏷️ 12. Barcode Studio (1D)', icon: Layers },
    { id: 'qr_studio', label: '📱 13. Product QR Studio (2D)', icon: Smartphone },
    { id: 'inward_scanner', label: '📦 14. Staff Inward Dock Scanner', icon: Truck },
    { id: 'outward_scanner', label: '🚚 15. Staff Outward Dock Dispatch', icon: Truck },
    { id: 'staff_qr', label: '📱 16. Staff Mobile QR Board', icon: Smartphone }
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
    { id: 'executive', label: 'Executive' },
    { id: 'voice_pos', label: '🎙️ Voice POS' },
    { id: 'room_matcher', label: '📸 AI Matcher' },
    { id: 'safelock', label: '🔒 SafeLock' },
    { id: 'autoprocure', label: '🏭 Factory PO' },
    { id: 'logistics_epod', label: '🚚 Fleet ePOD' },
    { id: 'architects', label: '🏛️ Architects' },
    { id: 'crm', label: '👥 CRM Leads' },
    { id: 'whatsapp_bots', label: '💬 WhatsApp' },
    { id: 'documents', label: '🧾 Documents' },
    { id: 'live_database', label: '📡 21 Tables' },
    { id: 'barcode_studio', label: '🏷️ Barcodes' },
    { id: 'qr_studio', label: '📱 QR Studio' },
    { id: 'inward_scanner', label: '📦 Inward' },
    { id: 'outward_scanner', label: '🚚 Outward' },
    { id: 'staff_qr', label: '📱 QR Hub' }
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

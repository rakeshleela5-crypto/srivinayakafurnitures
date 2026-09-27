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
  Smartphone,
  Building2,
  Bot,
  Printer,
  Download,
  FileSpreadsheet
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
  const { storeMeta, syncWithGoogleSheets, isSyncing, setActiveTab, currentUser, logout, openModal, appMode, toggleAppMode } = useStore();
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      alert("📲 How to Install OmniBuild OS on your Device:\n\n• On Android: Tap Chrome Menu (⋮) → 'Install app' or 'Add to Home screen'.\n• On iPhone / iPad: Tap the Share button (⎋) → 'Add to Home Screen'.\n• On Windows / Mac: Look for the Install icon in the browser address bar!");
    }
  };

  React.useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setActiveTab('tally_gst_desk');
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [setActiveTab]);

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
          onClick={toggleAppMode} 
          style={{ 
            fontSize: '11px', 
            padding: '6px 12px', 
            color: appMode === 'PRODUCTION' ? '#10B981' : '#F59E0B', 
            border: `1px solid ${appMode === 'PRODUCTION' ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)'}`, 
            background: appMode === 'PRODUCTION' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            fontWeight: '700'
          }} 
          title="Toggle between Pure Live Google Sheets Data and Luxury Demo Showcase"
        >
          <span>{appMode === 'PRODUCTION' ? '🟢 LIVE CLOUD DATA' : '🎭 DEMO SHOWCASE'}</span>
        </button>
        {currentUser?.allowedTabs?.includes('b2b_projects') && (
          <button 
            className="btn-ghost-edit" 
            onClick={() => setActiveTab('b2b_projects')} 
            style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }} 
            title="Open B2B & Institutional Projects Hub for Naresh Sir"
          >
            <Building2 size={13} /> <span>🏨 B2B Hub (Naresh Sir)</span>
          </button>
        )}
        {currentUser?.allowedTabs?.includes('bank_ledger') && (
          <button 
            className="btn-ghost-edit" 
            onClick={() => setActiveTab('bank_ledger')} 
            style={{ fontSize: '11px', padding: '6px 12px', color: '#34D399', border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.08)' }} 
            title="Open Commercial Bank Ledger, Statement Reconciler & B2B RTGS"
          >
            <span>🏛️ Bank Ledger & RTGS</span>
          </button>
        )}
        {(currentUser?.id === 'rakesh' || currentUser?.allowedTabs?.includes('executive')) && (
          <button 
            className="btn-ghost-edit" 
            onClick={() => openModal('store_settings')} 
            style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-emerald)', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)' }} 
            title="Configure Showroom Legal Entity, GSTIN, and Doorstep Merchant UPI VPA"
          >
            <span>⚙️ Identity & UPI</span>
          </button>
        )}
        <button 
          className="btn-ghost-edit" 
          onClick={() => openModal('dpdp_compliance')} 
          style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }} 
          title="View Statutory DPDP 2023 Privacy Policy & Anti-Hacking Terms"
        >
          <ShieldCheck size={13} /> <span>🛡️ DPDP 2023</span>
        </button>
        {(currentUser?.id === 'rakesh' || currentUser?.allowedTabs?.includes('live_database')) && (
          <button 
            className="btn-cyan" 
            onClick={() => openModal('d1_catalog_manager')} 
            style={{ fontSize: '11px', padding: '6px 14px', fontWeight: '800' }} 
            title="Open Cloudflare D1 Database & Catalog Studio (43 Tables)"
          >
            <span>🗄️ D1 Studio</span>
          </button>
        )}
        {currentUser?.allowedTabs?.includes('staff_qr') && (
          <button className="btn-luxury-gold" onClick={() => setActiveTab('staff_qr')} style={{ padding: '6px 14px', fontSize: '11.5px' }}>
            <span>📱 Staff QR</span>
          </button>
        )}
        <button 
          className="btn-ghost-edit" 
          onClick={() => openModal('bluetooth_printer')} 
          style={{ fontSize: '11px', padding: '6px 12px', color: '#10B981', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)' }} 
          title="Connect Hardware 3-Inch Bluetooth Thermal POS Receipt Printer"
        >
          <Printer size={13} /> <span>🖨️ 3" Thermal POS</span>
        </button>
        {!isInstalled && (
          <button 
            className="btn-luxury-gold" 
            onClick={handleInstallClick} 
            style={{ fontSize: '11px', padding: '6px 12px' }} 
            title="Install OmniBuild OS to your Android / iPhone Home Screen"
          >
            <Download size={13} /> <span>📲 Install App</span>
          </button>
        )}
        <button className="btn-header-sync" onClick={() => syncWithGoogleSheets(false)} title="Sync with Cloudflare D1 Edge (Sub-10ms)">
          <RefreshCw size={13} className={isSyncing ? 'spin-anim' : ''} />
          <span>{isSyncing ? 'Syncing...' : '⚡ D1 Cloud Sync'}</span>
        </button>
      </div>
    </header>
  );
}

export function TabsRibbon() {
  const { activeTab, setActiveTab, currentUser } = useStore();

  const allTabs = [
    // PHASE 1: Executive, B2B & Showroom Sales
    { id: 'executive', label: '☕ 1. Executive Cockpit', icon: Zap },
    { id: 'b2b_projects', label: '🏨 2. B2B Hub (Naresh Sir)', icon: Building2 },
    { id: 'crm', label: '👥 3. Showroom CRM Leads', icon: Users },
    { id: 'voice_pos', label: '🎙️ 4. AI Voice POS & Quote', icon: Mic },
    { id: 'architects', label: '🏛️ 5. Architect VIP Network', icon: Landmark },

    // PHASE 2: Warehouse Dock & Supply Chain
    { id: 'autoprocure', label: '🏭 6. Factory POs & AutoProcure', icon: Factory },
    { id: 'inward_scanner', label: '📦 7. Inward Truck QC Scanner', icon: Truck },
    { id: 'safelock', label: '🔒 8. SafeLock Warehouse Stock', icon: ShieldCheck },
    { id: 'barcode_studio', label: '🏷️ 9. Barcode Studio (1D)', icon: Layers },
    { id: 'qr_studio', label: '📱 10. Product QR Studio (2D)', icon: Smartphone },

    // PHASE 3: Outward Dispatch & Customer Delivery
    { id: 'outward_scanner', label: '🚚 11. Outward Dispatch Scanner', icon: Truck },
    { id: 'logistics_epod', label: '📱 12. Logistics Fleet & ePOD', icon: Truck },
    { id: 'documents', label: '🧾 13. Document Studio', icon: FileText },

    // PHASE 4: Finance, Staff Hub & Sovereign Cloudflare D1 Database
    { id: 'bank_ledger', label: '🏛️ 14. Bank Statements & RTGS', icon: Landmark },
    { id: 'tally_gst_desk', label: '⚡ 15. Tally & GST Hub', icon: FileSpreadsheet },
    { id: 'staff_qr', label: '📱 16. Staff Mobile QR Hub', icon: Smartphone },
    { id: 'live_database', label: '🗄️ 17. Live 43-Table D1 Edge', icon: Database },

    // PHASE 5: Autonomous Edge Robotics & Cron Fleet
    { id: 'autonomous_fleet', label: '🤖 18. 20-Bot Autonomous Fleet', icon: Bot }
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
    { id: 'b2b_projects', label: '🏨 B2B Hub' },
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
    { id: 'tally_gst_desk', label: '⚡ Tally & GST' },
    { id: 'staff_qr', label: '📱 QR Hub' },
    { id: 'live_database', label: '🗄️ 43 Tables D1' },
    { id: 'autonomous_fleet', label: '🤖 20-Bot Fleet' }
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

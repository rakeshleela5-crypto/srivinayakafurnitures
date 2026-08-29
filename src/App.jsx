import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { TopTicker, AppHeader, TabsRibbon, BottomDock } from './components/Navigation';
import { ModalContainer } from './components/modals/ModalContainer';
import { AuthLockScreen } from './components/AuthLockScreen';

import { ExecutiveOverview } from './views/ExecutiveOverview';
import { VoicePosView } from './views/VoicePosView';
import { RoomMatcherStudio } from './views/RoomMatcherStudio';
import { InventorySafeLockView } from './views/InventorySafeLockView';
import { AutoProcureView } from './views/AutoProcureView';
import { LogisticsEpodView } from './views/LogisticsEpodView';
import { ArchitectPortalView } from './views/ArchitectPortalView';
import { ShowroomCrmView } from './views/ShowroomCrmView';
import { WhatsAppBotSimulator } from './views/WhatsAppBotSimulator';
import { DocumentStudio } from './views/DocumentStudio';
import { LiveDatabaseView } from './views/LiveDatabaseView';
import { BarcodeStudio } from './views/BarcodeStudio';
import { ProductQrStudio } from './views/ProductQrStudio';
import { StaffInwardScannerView } from './views/StaffInwardScannerView';
import { StaffOutwardScannerView } from './views/StaffOutwardScannerView';
import { StaffQrHubView } from './views/StaffQrHubView';
import { MobileCustomerChatView } from './views/MobileCustomerChatView';

function AppContent() {
  const { activeTab, setActiveTab, currentUser } = useStore();
  const [workerMode, setWorkerMode] = React.useState(() => {
    return ['#inward', '#outward', '#barcode', '#qr-studio', '#logistics', '#qr', '#chat', '#concierge'].some(h => window.location.hash.toLowerCase().includes(h));
  });

  // URL Hash listener for direct worker and customer QR links
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('chat') || hash.includes('concierge')) {
        setActiveTab('customer_chat');
        setWorkerMode(true);
      } else if (hash.includes('inward')) {
        setActiveTab('inward_scanner');
        setWorkerMode(true);
      } else if (hash.includes('outward')) {
        setActiveTab('outward_scanner');
        setWorkerMode(true);
      } else if (hash.includes('barcode')) {
        setActiveTab('barcode_studio');
        setWorkerMode(true);
      } else if (hash.includes('qr-studio') || hash.includes('qrstudio')) {
        setActiveTab('qr_studio');
        setWorkerMode(true);
      } else if (hash.includes('logistics')) {
        setActiveTab('logistics_epod');
        setWorkerMode(true);
      } else if (hash.includes('qr')) {
        setActiveTab('staff_qr');
        setWorkerMode(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveTab]);

  // Direct QR Hash routes bypass login screen
  const isDirectWorkerHash = ['#inward', '#outward', '#barcode', '#qr-studio', '#logistics', '#qr', '#chat', '#concierge'].some(h => window.location.hash.toLowerCase().includes(h));
  if (!currentUser && !isDirectWorkerHash && !workerMode) {
    return <AuthLockScreen />;
  }

  // Full-screen Standalone Mobile Customer AI Chat Experience
  if (activeTab === 'customer_chat' || window.location.hash.toLowerCase().includes('chat') || window.location.hash.toLowerCase().includes('concierge')) {
    return (
      <>
        <MobileCustomerChatView />
        <ModalContainer />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'customer_chat':
        return <MobileCustomerChatView />;
      case 'executive':
        return <ExecutiveOverview />;
      case 'voice_pos':
        return <VoicePosView />;
      case 'room_matcher':
        return <RoomMatcherStudio />;
      case 'safelock':
        return <InventorySafeLockView />;
      case 'autoprocure':
        return <AutoProcureView />;
      case 'logistics_epod':
        return <LogisticsEpodView />;
      case 'architects':
        return <ArchitectPortalView />;
      case 'crm':
        return <ShowroomCrmView />;
      case 'whatsapp_bots':
        return <WhatsAppBotSimulator />;
      case 'documents':
        return <DocumentStudio />;
      case 'live_database':
        return <LiveDatabaseView />;
      case 'barcode_studio':
        return <BarcodeStudio />;
      case 'qr_studio':
        return <ProductQrStudio />;
      case 'inward_scanner':
        return <StaffInwardScannerView />;
      case 'outward_scanner':
        return <StaffOutwardScannerView />;
      case 'staff_qr':
        return <StaffQrHubView />;
      default:
        return <ExecutiveOverview />;
    }
  };

  return (
    <>
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {workerMode ? (
        <div className="mobile-worker-app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo-badge" style={{ width: '34px', height: '34px', fontSize: '13px', borderRadius: '8px' }}>GI</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFFFFF' }}>
                {activeTab === 'inward_scanner' ? '📦 DOCK 1: INWARD SCANNER' :
                 activeTab === 'outward_scanner' ? '🚚 DOCK 2: OUTWARD DISPATCH' :
                 activeTab === 'logistics_epod' ? '📱 DRIVER DESK: DELIVERY ePOD' :
                 activeTab === 'barcode_studio' ? '🏷️ 1D CODE-128 STUDIO' :
                 activeTab === 'qr_studio' ? '📱 2D QR STUDIO' : '📱 STAFF MOBILE PORTAL'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-gold-light)' }}>Godrej Interio Rayagada</div>
            </div>
          </div>
          <button 
            className="btn-luxury-gold" 
            onClick={() => setWorkerMode(false)}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            🌐 Full Desktop OS
          </button>
        </div>
      ) : (
        <>
          <TopTicker />
          <AppHeader />
          <TabsRibbon />
        </>
      )}

      <main className="main-layout">
        {renderActiveView()}
      </main>

      {!workerMode && <BottomDock />}
      <ModalContainer />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

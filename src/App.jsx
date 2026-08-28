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

function AppContent() {
  const { activeTab, setActiveTab, currentUser } = useStore();

  // URL Hash listener for direct worker links (e.g. #inward, #outward, #barcode, #qr-studio, #qr)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('inward')) {
        setActiveTab('inward_scanner');
      } else if (hash.includes('outward')) {
        setActiveTab('outward_scanner');
      } else if (hash.includes('barcode')) {
        setActiveTab('barcode_studio');
      } else if (hash.includes('qr-studio') || hash.includes('qrstudio')) {
        setActiveTab('qr_studio');
      } else if (hash.includes('qr')) {
        setActiveTab('staff_qr');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveTab]);

  // If user is locked and not accessing a direct dock worker QR hash, show Lock Screen
  const isDirectWorkerHash = ['#inward', '#outward', '#barcode', '#qr-studio', '#qr'].some(h => window.location.hash.toLowerCase().includes(h));
  if (!currentUser && !isDirectWorkerHash) {
    return <AuthLockScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
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

      <TopTicker />
      <AppHeader />
      <TabsRibbon />

      <main className="main-layout">
        {renderActiveView()}
      </main>

      <BottomDock />
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

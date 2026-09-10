import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShowroomAdvanceModal, NewInquiryModal, ScheduleMistriVisitModal } from './CrmModals';
import { EditInquiryModal, ConvertInquiryModal, ManageOrderModal, StockOverrideModal, EmiCalculatorModal } from './OrderModals';
import { DigitalEpodModal, SmsDispatchModal, EditFleetDriverModal, WarehouseWallPosterModal } from './LogisticsModals';
import { 
  RegisterArchitectModal, 
  ArchitectPayoutModal, 
  CarpenterDispatchModal, 
  UniversalPaymentCheckoutModal, 
  BarcodeStudioModal, 
  OrderInvoiceModal, 
  EodReconciliationModal,
  AddVipProjectModal,
  EditVipProjectModal,
  AddFloorAgingSkuModal,
  EditFloorAgingModal,
  ExecutiveRevenueLedgerModal,
  ExecutiveSafeLocksDrilldownModal,
  ExecutiveDeliveriesDrilldownModal,
  ExecutiveHotLeadsDrilldownModal,
  ExecutiveArchitectsDrilldownModal,
  CustomDateRangeModal
} from './ExecutiveModals';
import { WhatsAppProposalModal, EmiSchemeModal, FurnitureExchangeModal } from './ProposalAndFinanceModals';
import { DpdpComplianceModal } from './DpdpComplianceModal';
import { CsvImportModal } from './CsvImportModal';
import { EditArchitectModal, ArchitectPassModal, ArchitectCertificateModal, ArchitectLedgerStatementModal } from './ArchitectExtendedModals';
import { EditBotConfigModal } from './EditBotConfigModal';
import { 
  TierPricingModal, 
  OrderReschedulerModal, 
  StoreSettingsModal,
  WeddingSuiteModal,
  MistriQcWarrantyModal,
  AgingStockModal,
  CustomFinishModal,
  BoxDamageClaimModal,
  GodrejCareAmcModal,
  B2bTurnkeyModal
} from './HeartEngineModals';
import { BulkBotBroadcastModal } from './BulkBotBroadcastModal';
import { FurnitureFollowUpModal } from './FurnitureFollowUpModal';
import { SmartKitStagingModal } from './SmartKitStagingModal';
import { EditFactoryPoModal } from './EditFactoryPoModal';
import { FactoryPaymentVoucherModal, VendorSourcingModal } from './FactoryProcureModals';
import { ShowroomProfitRadarModal } from './ShowroomProfitRadarModal';
import { GeminiConfigModal } from './GeminiConfigModal';
import { EnterpriseSecurityModal } from './EnterpriseSecurityModal';
import { AppsScriptHubModal } from './AppsScriptHubModal';

export function ModalContainer() {
  const { activeModal, modalProps, closeModal } = useStore();

  if (!activeModal) return null;

  return (
    <>
      <ShowroomAdvanceModal isOpen={activeModal === 'showroom_advance'} onClose={closeModal} data={modalProps} />
      <NewInquiryModal isOpen={activeModal === 'new_inquiry'} onClose={closeModal} />
      <EditInquiryModal isOpen={activeModal === 'edit_inquiry'} onClose={closeModal} inquiry={modalProps.inquiry} />
      <ConvertInquiryModal isOpen={activeModal === 'convert_inquiry'} onClose={closeModal} inquiry={modalProps.inquiry} />
      <ManageOrderModal isOpen={activeModal === 'manage_order'} onClose={closeModal} order={modalProps.order} />
      <StockOverrideModal isOpen={activeModal === 'stock_override'} onClose={closeModal} sku={modalProps.sku} />
      <EmiCalculatorModal isOpen={activeModal === 'emi_calculator'} onClose={closeModal} amount={modalProps.amount} />
      
      <DigitalEpodModal isOpen={activeModal === 'digital_epod'} onClose={closeModal} stop={modalProps.stop} />
      <SmsDispatchModal isOpen={activeModal === 'sms_dispatch'} onClose={closeModal} stop={modalProps.stop} />
      <EditFleetDriverModal isOpen={activeModal === 'edit_fleet_driver'} onClose={closeModal} driver={modalProps.driver} />
      <WarehouseWallPosterModal isOpen={activeModal === 'warehouse_wall_poster'} onClose={closeModal} />

      <RegisterArchitectModal isOpen={activeModal === 'register_architect'} onClose={closeModal} />
      <ArchitectPayoutModal isOpen={activeModal === 'architect_payout'} onClose={closeModal} architect={modalProps.architect} />
      <EditArchitectModal isOpen={activeModal === 'edit_architect'} onClose={closeModal} architect={modalProps.architect} />
      <ArchitectPassModal isOpen={activeModal === 'architect_pass'} onClose={closeModal} architect={modalProps.architect} />
      <ArchitectCertificateModal isOpen={activeModal === 'architect_certificate'} onClose={closeModal} architect={modalProps.architect} />
      <ArchitectLedgerStatementModal isOpen={activeModal === 'architect_statement'} onClose={closeModal} architect={modalProps.architect} />

      <CarpenterDispatchModal isOpen={activeModal === 'carpenter_dispatch'} onClose={closeModal} order={modalProps.order} />
      <UniversalPaymentCheckoutModal isOpen={activeModal === 'universal_payment'} onClose={closeModal} amount={modalProps.amount} orderId={modalProps.orderId} customerName={modalProps.customerName} customerPhone={modalProps.customerPhone} />
      <BarcodeStudioModal isOpen={activeModal === 'barcode_studio'} onClose={closeModal} />
      <OrderInvoiceModal isOpen={activeModal === 'order_invoice'} onClose={closeModal} order={modalProps.order} />
      <EodReconciliationModal isOpen={activeModal === 'eod_reconciliation'} onClose={closeModal} />

      {/* 👑 VIP Villa & 🔥 Floor Aging Executive Modals */}
      <AddVipProjectModal isOpen={activeModal === 'add_vip_project'} onClose={closeModal} />
      <EditVipProjectModal isOpen={activeModal === 'edit_vip_project'} onClose={closeModal} project={modalProps.project} />
      <AddFloorAgingSkuModal isOpen={activeModal === 'add_floor_aging'} onClose={closeModal} />
      <EditFloorAgingModal isOpen={activeModal === 'edit_floor_aging'} onClose={closeModal} item={modalProps.item} />

      {/* 📊 Executive Command Tower 5-Pillar Drill-Down Modals */}
      <ExecutiveRevenueLedgerModal isOpen={activeModal === 'executive_revenue_ledger'} onClose={closeModal} />
      <ExecutiveSafeLocksDrilldownModal isOpen={activeModal === 'executive_safelocks_drilldown'} onClose={closeModal} />
      <ExecutiveDeliveriesDrilldownModal isOpen={activeModal === 'executive_deliveries_drilldown'} onClose={closeModal} />
      <ExecutiveHotLeadsDrilldownModal isOpen={activeModal === 'executive_hotleads_drilldown'} onClose={closeModal} />
      <ExecutiveArchitectsDrilldownModal isOpen={activeModal === 'executive_architects_drilldown'} onClose={closeModal} />
      <CustomDateRangeModal 
        isOpen={activeModal === 'custom_date_range'} 
        onClose={closeModal} 
        customRange={modalProps?.customRange} 
        onApplyCustomRange={modalProps?.onApplyCustomRange} 
      />

      {/* New Proposals & Finance Modals */}
      <WhatsAppProposalModal isOpen={activeModal === 'whatsapp_proposal' || activeModal === 'customer_proposal'} onClose={closeModal} proposalData={modalProps} />
      <EmiSchemeModal isOpen={activeModal === 'emi_scheme'} onClose={closeModal} amount={modalProps.amount} customerPhone={modalProps.customerPhone} />
      <FurnitureExchangeModal isOpen={activeModal === 'furniture_exchange'} onClose={closeModal} onApplyDiscount={modalProps.onApplyDiscount} />
      
      {/* Statutory DPDP 2023 Compliance & Privacy Modal */}
      {activeModal === 'dpdp_compliance' && <DpdpComplianceModal />}

      {/* Bulk CSV Catalog Importer Modal */}
      <CsvImportModal isOpen={activeModal === 'csv_import'} onClose={closeModal} />

      {/* Bot Configuration Modal */}
      <EditBotConfigModal isOpen={activeModal === 'edit_bot_config'} onClose={closeModal} bot={modalProps.bot} />

      {/* Bulk Bot Broadcast Modal */}
      <BulkBotBroadcastModal isOpen={activeModal === 'bulk_bot_broadcast'} onClose={closeModal} />

      {/* 🛋️ Smart Furniture Follow-Up & Festive Drip Modal */}
      <FurnitureFollowUpModal isOpen={activeModal === 'furniture_followup'} onClose={closeModal} lead={modalProps.lead} />

      {/* ❤️ THE 11 HEART ENGINES */}
      <TierPricingModal isOpen={activeModal === 'tier_pricing'} onClose={closeModal} sku={modalProps.sku} />
      <OrderReschedulerModal isOpen={activeModal === 'order_rescheduler'} onClose={closeModal} order={modalProps.order} />
      <StoreSettingsModal isOpen={activeModal === 'store_settings'} onClose={closeModal} />
      <WeddingSuiteModal isOpen={activeModal === 'wedding_suite'} onClose={closeModal} />
      <MistriQcWarrantyModal isOpen={activeModal === 'mistri_qc_warranty'} onClose={closeModal} stop={modalProps.stop} />
      <AgingStockModal isOpen={activeModal === 'aging_stock'} onClose={closeModal} />
      <CustomFinishModal isOpen={activeModal === 'custom_finish'} onClose={closeModal} sku={modalProps.sku} />
      <BoxDamageClaimModal isOpen={activeModal === 'box_damage_claim'} onClose={closeModal} stop={modalProps.stop} />
      <GodrejCareAmcModal isOpen={activeModal === 'godrej_care_amc'} onClose={closeModal} customer={modalProps.customer} />
      <B2bTurnkeyModal isOpen={activeModal === 'b2b_turnkey'} onClose={closeModal} />
      <SmartKitStagingModal isOpen={activeModal === 'smartkit_staging'} onClose={closeModal} order={modalProps.order} />
      <EditFactoryPoModal isOpen={activeModal === 'edit_factory_po'} onClose={closeModal} po={modalProps.po} onSave={modalProps.onSave} />
      <FactoryPaymentVoucherModal isOpen={activeModal === 'factory_payment_voucher'} onClose={closeModal} po={modalProps.po} />
      <VendorSourcingModal isOpen={activeModal === 'vendor_sourcing'} onClose={closeModal} />
      <ScheduleMistriVisitModal isOpen={activeModal === 'schedule_mistri_visit'} onClose={closeModal} lead={modalProps.lead} />
      
      {/* 💰 SHOWROOM PROFIT & MARGIN RADAR (HEART ENGINE) */}
      <ShowroomProfitRadarModal isOpen={activeModal === 'showroom_profit_radar'} onClose={closeModal} />

      {/* 🧠 GOOGLE GEMINI AI CONFIGURATION MODAL */}
      <GeminiConfigModal isOpen={activeModal === 'gemini_config'} onClose={closeModal} />

      {/* 🛡️ ENTERPRISE FIREWALL & SECURITY CONSOLE */}
      <EnterpriseSecurityModal isOpen={activeModal === 'enterprise_security'} onClose={closeModal} />

      {/* ⚡ GOOGLE APPS SCRIPT & CLOUD DATABASE GATEWAY */}
      <AppsScriptHubModal isOpen={activeModal === 'appsscript_hub'} onClose={closeModal} />
    </>
  );
}

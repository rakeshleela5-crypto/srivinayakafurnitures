/**
 * OmniBuild OS™ — Enterprise Bank Accounts & B2B Transaction Ledger Seed Data
 * Client: Godrej Interio Rayagada Flagship Showroom (Shree Ganesh Enterprises)
 */

export const BANK_ACCOUNTS = [
  {
    id: "HDFC_CURRENT",
    bankName: "HDFC Bank",
    accountName: "Shree Ganesh Enterprises",
    accountNumber: "50200088192481",
    accountType: "Current Account (Primary Operating)",
    ifsc: "HDFC0001892",
    branch: "Main Road Branch, Rayagada (Odisha 765001)",
    currentBalance: 3842500,
    upiId: "9390553301@hdfcbank",
    color: "#004C8F"
  },
  {
    id: "SBI_CURRENT",
    bankName: "State Bank of India (SBI)",
    accountName: "Shree Ganesh Enterprises (Commercial)",
    accountNumber: "39182049182",
    accountType: "Current Account (Govt & Wholesale POs)",
    ifsc: "SBIN0000167",
    branch: "Collectorate Road Branch, Rayagada",
    currentBalance: 1480000,
    upiId: "shreeganesh.godrej@sbi",
    color: "#280071"
  }
];

export const INITIAL_BANK_TRANSACTIONS = [
  {
    id: "TXN-BNK-2026-8812",
    dateTime: "03-Sep-2026 11:30 AM",
    flowType: "INWARD_CREDIT",
    bankAccountId: "HDFC_CURRENT",
    bankAccountName: "HDFC Bank Current A/c (***2481)",
    paymentMode: "RTGS",
    utrNumber: "HDFCR5202609038819",
    partyName: "Dr. Subhashish Jena",
    partyCategory: "VIP Client (Villa Project)",
    amount: 450000,
    linkedEntityType: "CUSTOMER_QUOTATION",
    linkedId: "QUO-GI-2026-4892",
    reconciliationStatus: "VERIFIED_AND_MATCHED",
    notes: "50% Token Advance for Gayatri Nagar Villa (5-Piece Teak Suite)",
    loggedBy: "Store Director"
  },
  {
    id: "TXN-BNK-2026-8811",
    dateTime: "02-Sep-2026 04:15 PM",
    flowType: "OUTWARD_DEBIT",
    bankAccountId: "SBI_CURRENT",
    bankAccountName: "SBI Current A/c (***9182)",
    paymentMode: "RTGS",
    utrNumber: "SBINR2026090299104",
    partyName: "Godrej & Boyce Mfg. Co. Ltd. (Khalapur Plant)",
    partyCategory: "Manufacturer Factory PO",
    amount: 1280000,
    linkedEntityType: "FACTORY_PO",
    linkedId: "PO-2026-881",
    reconciliationStatus: "VERIFIED_AND_MATCHED",
    notes: "Wholesale PO for 50 Knockdown Hydraulic Beds (Batch #881)",
    loggedBy: "Accountant"
  },
  {
    id: "TXN-BNK-2026-8810",
    dateTime: "02-Sep-2026 01:20 PM",
    flowType: "INWARD_CREDIT",
    bankAccountId: "SBI_CURRENT",
    bankAccountName: "SBI Current A/c (***9182)",
    paymentMode: "NEFT",
    utrNumber: "AXISP2026090244109",
    partyName: "Koraput District Collectorate & Medical Dept",
    partyCategory: "Govt / Institutional Tender",
    amount: 620000,
    linkedEntityType: "SAFELOCK_ORDER",
    linkedId: "ORD-2026-105",
    reconciliationStatus: "VERIFIED_AND_MATCHED",
    notes: "Tender Milestone 2: 40 Godrej Interio Stacking Chairs & Exam Desks",
    loggedBy: "Executive Sales Head"
  },
  {
    id: "TXN-BNK-2026-8809",
    dateTime: "01-Sep-2026 06:40 PM",
    flowType: "OUTWARD_DEBIT",
    bankAccountId: "HDFC_CURRENT",
    bankAccountName: "HDFC Bank Current A/c (***2481)",
    paymentMode: "NEFT",
    utrNumber: "HDFCN26090155214",
    partyName: "VRL Logistics Express Ltd.",
    partyCategory: "Freight Transporter",
    amount: 45000,
    linkedEntityType: "TRANSPORT_FREIGHT",
    linkedId: "LR-892104",
    reconciliationStatus: "VERIFIED_AND_MATCHED",
    notes: "Interstate 32ft Container Truck Freight from Mumbai Plant to Rayagada",
    loggedBy: "Logistics Manager"
  },
  {
    id: "TXN-BNK-2026-8808",
    dateTime: "01-Sep-2026 10:15 AM",
    flowType: "INWARD_CREDIT",
    bankAccountId: "HDFC_CURRENT",
    bankAccountName: "HDFC Bank Current A/c (***2481)",
    paymentMode: "RTGS",
    utrNumber: "ICICR5202609013320",
    partyName: "Ar. Meera Pattnaik (Design Studio)",
    partyCategory: "Architect Partner VIP Referral",
    amount: 320000,
    linkedEntityType: "CUSTOMER_QUOTATION",
    linkedId: "QUO-GI-2026-4410",
    reconciliationStatus: "VERIFIED_AND_MATCHED",
    notes: "Direct Client Bank Advance for 3x Executive Office Workstations",
    loggedBy: "Store Director"
  },
  {
    id: "TXN-BNK-2026-8807",
    dateTime: "31-Aug-2026 05:00 PM",
    flowType: "OUTWARD_DEBIT",
    bankAccountId: "SBI_CURRENT",
    bankAccountName: "SBI Current A/c (***9182)",
    paymentMode: "RTGS",
    utrNumber: "SBINR2026083177192",
    partyName: "Godrej Interio Khurda Regional C&F Depot",
    partyCategory: "Wholesale Stock Depot",
    amount: 640000,
    linkedEntityType: "FACTORY_PO",
    linkedId: "PO-2026-879",
    reconciliationStatus: "VERIFIED_AND_MATCHED",
    notes: "Urgent buffer stock requisition: 25 Mattresses + 10 Recliners",
    loggedBy: "Accountant"
  },
  {
    id: "TXN-BNK-2026-8806",
    dateTime: "31-Aug-2026 02:30 PM",
    flowType: "INWARD_CREDIT",
    bankAccountId: "HDFC_CURRENT",
    bankAccountName: "HDFC Bank Current A/c (***2481)",
    paymentMode: "Cheque Clearing",
    utrNumber: "CHQ-892101",
    partyName: "Hotel Swarna Palace & Resorts Rayagada",
    partyCategory: "Commercial Hospitality",
    amount: 280000,
    linkedEntityType: "CUSTOMER_QUOTATION",
    linkedId: "QUO-GI-2026-4190",
    reconciliationStatus: "PENDING_UTR_CLEARANCE",
    notes: "Cheque deposited in HDFC Branch — Awaiting clearance cycle",
    loggedBy: "Accountant"
  }
];

// ==============================================================================
// OmniBuild OS™ — Enterprise ERP & Retail Operating System Service
// Benchmark References:
// - frappe/erpnext & resilient-tech/india-compliance (GST, E-Way Bill, Document State Machine)
// - odoo/odoo (POS Cashier Sessions, Split-Tender Payment Engine)
// - medusajs/medusa (Multidimensional Furniture Variant Matrix)
// - crater-invoice/crater (Customer Khata Ledger, Milestone Installments, Aging Buckets)
// ==============================================================================

export const INDIAN_STATES = [
  { code: '21', name: 'Odisha', stateCodeAlpha: 'OD' },
  { code: '37', name: 'Andhra Pradesh', stateCodeAlpha: 'AP' },
  { code: '36', name: 'Telangana', stateCodeAlpha: 'TG' },
  { code: '22', name: 'Chhattisgarh', stateCodeAlpha: 'CG' },
  { code: '19', name: 'West Bengal', stateCodeAlpha: 'WB' },
  { code: '20', name: 'Jharkhand', stateCodeAlpha: 'JH' },
  { code: '10', name: 'Bihar', stateCodeAlpha: 'BR' },
  { code: '27', name: 'Maharashtra', stateCodeAlpha: 'MH' },
  { code: '29', name: 'Karnataka', stateCodeAlpha: 'KA' },
  { code: '33', name: 'Tamil Nadu', stateCodeAlpha: 'TN' },
  { code: '07', name: 'Delhi', stateCodeAlpha: 'DL' }
];

export const STORE_GSTIN = '21AAECG8899D1ZF';
export const STORE_STATE_CODE = '21'; // Odisha
export const STORE_PINCODE = '765001'; // Rayagada

export const HSN_FURNITURE_MASTER = {
  '9403': { description: 'Other Furniture and parts thereof (Wooden/Panel)', gstRate: 18 },
  '940320': { description: 'Metal Furniture / Steel Almirahs / Cupboards', gstRate: 18 },
  '940350': { description: 'Wooden Furniture for Bedroom (Beds, Wardrobes)', gstRate: 18 },
  '940360': { description: 'Other Wooden Furniture (Dining Tables, Chairs)', gstRate: 18 },
  '940421': { description: 'Mattresses of Cellular Rubber or Plastics', gstRate: 18 },
  '940429': { description: 'Coir / Spring / Other Mattresses', gstRate: 12 },
  '9401': { description: 'Seats (Chairs, Sofas) whether or not convertible into beds', gstRate: 18 }
};

// ------------------------------------------------------------------------------
// 1. Indian GST Resolution Engine (Intra-State vs Inter-State)
// ------------------------------------------------------------------------------
export function calculateGstBreakdown({
  grossOrTaxableAmount = 0,
  hsnCode = '9403',
  destinationStateCode = '21',
  isGstInclusive = true
}) {
  const hsnInfo = HSN_FURNITURE_MASTER[hsnCode] || HSN_FURNITURE_MASTER['9403'];
  const gstRate = hsnInfo.gstRate || 18;
  const isIntraState = String(destinationStateCode) === String(STORE_STATE_CODE);

  let taxableValue = 0;
  let totalTax = 0;
  let grossAmount = 0;

  if (isGstInclusive) {
    grossAmount = Number(grossOrTaxableAmount) || 0;
    taxableValue = Math.round((grossAmount / (1 + gstRate / 100)) * 100) / 100;
    totalTax = Math.round((grossAmount - taxableValue) * 100) / 100;
  } else {
    taxableValue = Number(grossOrTaxableAmount) || 0;
    totalTax = Math.round((taxableValue * (gstRate / 100)) * 100) / 100;
    grossAmount = Math.round((taxableValue + totalTax) * 100) / 100;
  }

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isIntraState) {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  } else {
    igstRate = gstRate;
    igstAmount = totalTax;
  }

  return {
    hsnCode,
    hsnDescription: hsnInfo.description,
    gstRate,
    taxableValue,
    totalTax,
    grossAmount,
    isIntraState,
    taxType: isIntraState ? 'INTRA_STATE (CGST + SGST)' : 'INTER_STATE (IGST)',
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount
  };
}

// ------------------------------------------------------------------------------
// 2. Government E-Way Bill NIC Payload Generator (NIC Standard Schema)
// ------------------------------------------------------------------------------
export function generateEWayBillJson({
  docNumber = 'SVF/INV/26-27/001',
  docDate = new Date().toISOString().split('T')[0],
  customerName = 'Dr. Subhashish Jena',
  customerGstin = 'URP',
  customerAddress = 'Gayatri Nagar Villa, Rayagada',
  destinationPincode = '765001',
  destinationStateCode = '21',
  items = [],
  totalGross = 65000,
  transporterName = 'Tophan Gouda Fleet Services',
  transporterId = '21TRP9988X1ZQ',
  vehicleNumber = 'OD-18-B-4491',
  approxDistanceKm = 12
}) {
  const isInterState = String(destinationStateCode) !== String(STORE_STATE_CODE);
  const gstBreakdown = calculateGstBreakdown({
    grossOrTaxableAmount: totalGross,
    destinationStateCode,
    isGstInclusive: true
  });

  const payload = {
    version: '1.0.0421',
    billLists: [
      {
        userGstin: STORE_GSTIN,
        supplyType: 'O', // Outward
        subSupplyType: '1', // Supply
        docType: 'INV', // Tax Invoice
        docNo: docNumber,
        docDate: docDate.replace(/-/g, '/'),
        transType: '1', // Regular
        fromGstin: STORE_GSTIN,
        fromTrdName: 'SRI VINAYAKA FURNITURES (GODREJ INTERIO RAYAGADA)',
        fromAddr1: 'Main Road, Near New Bus Stand',
        fromAddr2: 'Opposite State Bank Colony',
        fromPlace: 'Rayagada',
        fromPincode: Number(STORE_PINCODE),
        actFromStateCode: Number(STORE_STATE_CODE),
        fromStateCode: Number(STORE_STATE_CODE),
        toGstin: customerGstin || 'URP',
        toTrdName: customerName,
        toAddr1: customerAddress.slice(0, 50),
        toAddr2: customerAddress.slice(50, 100) || 'Rayagada Town',
        toPlace: 'Rayagada',
        toPincode: Number(destinationPincode) || 765001,
        actToStateCode: Number(destinationStateCode),
        toStateCode: Number(destinationStateCode),
        totalValue: gstBreakdown.taxableValue,
        cgstValue: gstBreakdown.cgstAmount,
        sgstValue: gstBreakdown.sgstAmount,
        igstValue: gstBreakdown.igstAmount,
        cessValue: 0,
        totInvValue: gstBreakdown.grossAmount,
        transDistance: String(approxDistanceKm),
        transporterId: transporterId || '',
        transporterName: transporterName || 'Sri Vinayaka Logistics Desk',
        transDocNo: `LR-${Math.floor(1000 + Math.random() * 9000)}`,
        transMode: '1', // Road
        transDocDate: docDate.replace(/-/g, '/'),
        vehicleNo: vehicleNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
        vehicleType: 'R', // Regular (Tata Ace 1.5T)
        itemList: items.length > 0 ? items.map((it, idx) => ({
          itemNo: idx + 1,
          productName: it.name || it.Product_Name || 'Furniture Goods',
          productDesc: it.sku || it.SKU || 'Wooden / Metal Furniture',
          hsnCode: Number(it.hsnCode || 9403),
          quantity: it.qty || 1,
          qtyUnit: 'NOS',
          taxableAmount: Math.round(((it.price || 50000) * (it.qty || 1) / 1.18) * 100) / 100,
          cgstRate: isInterState ? 0 : 9,
          sgstRate: isInterState ? 0 : 9,
          igstRate: isInterState ? 18 : 0,
          cessRate: 0
        })) : [
          {
            itemNo: 1,
            productName: 'Living & Bedroom Furniture Suite',
            productDesc: 'Finished Furniture Consignment',
            hsnCode: 940350,
            quantity: 1,
            qtyUnit: 'NOS',
            taxableAmount: gstBreakdown.taxableValue,
            cgstRate: isInterState ? 0 : 9,
            sgstRate: isInterState ? 0 : 9,
            igstRate: isInterState ? 18 : 0,
            cessRate: 0
          }
        ]
      }
    ]
  };

  const isMandatory = totalGross >= 50000;

  return {
    isMandatory,
    thresholdMessage: isMandatory 
      ? '⚠️ Mandatory E-Way Bill Required: Consignment total ≥ ₹50,000 threshold under Section 68 of CGST Act.'
      : 'ℹ️ Optional E-Way Bill: Consignment total < ₹50,000 threshold (Recommended for inter-district commercial transport).',
    payload
  };
}

// ------------------------------------------------------------------------------
// 3. Document State Machine (ERPNext Standard)
// ------------------------------------------------------------------------------
export const DOC_TYPES = {
  QUOTATION: { code: 'EST', label: 'Commercial Quotation / Estimate', prefix: 'SVF/EST' },
  SALES_ORDER: { code: 'SO', label: 'Confirmed Sales Order (Stock Reserved)', prefix: 'SVF/SO' },
  DELIVERY_NOTE: { code: 'DN', label: 'Delivery Challan & Gate Pass', prefix: 'SVF/DN' },
  TAX_INVOICE: { code: 'INV', label: 'GST Tax Invoice', prefix: 'SVF/INV' }
};

export const DOC_STATUSES = {
  0: { code: 'DRAFT', label: 'Draft', color: '#94A3B8', badge: 'badge-muted' },
  1: { code: 'CONFIRMED', label: 'Confirmed (Stock Reserved)', color: '#D4AF37', badge: 'badge-gold' },
  2: { code: 'DISPATCHED', label: 'Out for Delivery (In Transit)', color: '#38BDF8', badge: 'badge-blue' },
  3: { code: 'COMPLETED', label: 'Delivered & Assembled ✓', color: '#10B981', badge: 'badge-emerald' },
  4: { code: 'CANCELLED', label: 'Cancelled / Voided', color: '#F43F5E', badge: 'badge-rose' }
};

export function generateNextDocNumber(typeKey = 'QUOTATION', sequenceNumber = 1) {
  const type = DOC_TYPES[typeKey] || DOC_TYPES.QUOTATION;
  const currentYear = new Date().getFullYear();
  const nextYearShort = String(currentYear + 1).slice(-2);
  const currentYearShort = String(currentYear).slice(-2);
  const fy = `${currentYearShort}-${nextYearShort}`;
  const seqFormatted = String(sequenceNumber).padStart(4, '0');
  return `${type.prefix}/${fy}/${seqFormatted}`;
}

// ------------------------------------------------------------------------------
// 4. Multidimensional Furniture Variant Matrix (Medusa Standard)
// ------------------------------------------------------------------------------
export const FURNITURE_VARIANT_SPECS = {
  woodSpecies: [
    { id: 'teak_cpt', name: 'CPT Solid Teak Wood (100% Seasoned)', priceAdder: 12000, leadDays: 7, durability: '⭐⭐⭐⭐⭐ Life: 35+ Yrs' },
    { id: 'sheesham', name: 'North Indian Solid Sheesham', priceAdder: 6000, leadDays: 5, durability: '⭐⭐⭐⭐ Life: 25+ Yrs' },
    { id: 'godrej_crca', name: 'Godrej CRCA Anti-Rust Treated Steel', priceAdder: 0, leadDays: 2, durability: '⭐⭐⭐⭐⭐ Life: 30+ Yrs' },
    { id: 'engineered_hdf', name: 'European High-Density Fibreboard (HDF)', priceAdder: -4000, leadDays: 3, durability: '⭐⭐⭐ Life: 12+ Yrs' }
  ],
  polishFinishes: [
    { id: 'natural_matte', name: 'Natural Teak Matte Grain Polyurethane', priceAdder: 0, previewColor: '#8B5A2B' },
    { id: 'walnut_gloss', name: 'Italian High-Gloss Dark Walnut', priceAdder: 2500, previewColor: '#4A2A18' },
    { id: 'dark_mahogany', name: 'Royal Mahogany Deep Burgundy Finish', priceAdder: 3000, previewColor: '#420D09' },
    { id: 'vintage_honey', name: 'Warm Amber Honey Antique Lacquer', priceAdder: 1500, previewColor: '#C68B59' },
    { id: 'duco_white', name: 'Luxury Duco Satin Pearl White', priceAdder: 4500, previewColor: '#E2E8F0' }
  ],
  dimensionSizes: [
    { id: 'king', name: 'King Size (72" x 78" / 6 x 6.5 ft)', priceMultiplier: 1.15, standard: true },
    { id: 'queen', name: 'Queen Size (60" x 78" / 5 x 6.5 ft)', priceMultiplier: 1.0, standard: true },
    { id: 'single', name: 'Single Bed (36" x 75" / 3 x 6.25 ft)', priceMultiplier: 0.65, standard: true },
    { id: 'six_seater', name: '6-Seater Family Dining (60" x 36")', priceMultiplier: 1.0, standard: true },
    { id: 'eight_seater', name: '8-Seater Grand Dining (84" x 42")', priceMultiplier: 1.35, standard: false }
  ],
  upholsteryGrades: [
    { id: 'grade_a_velvet', name: 'Grade-A Hydrophobic Stain-Resistant Velvet', priceAdder: 4000, texture: 'Plush & Soft' },
    { id: 'suede_leatherette', name: 'Breathable Microfiber Suede Leatherette', priceAdder: 2800, texture: 'Warm Matte' },
    { id: 'heavy_linen', name: 'Pure Textured Belgian Linen Weave', priceAdder: 3500, texture: 'Crisp Natural' },
    { id: 'standard_fabric', name: 'Standard Showroom Woven Jacquard', priceAdder: 0, texture: 'Standard' }
  ]
};

export function calculateCustomVariantPrice({
  basePrice = 50000,
  selectedWoodId = 'teak_cpt',
  selectedFinishId = 'natural_matte',
  selectedSizeId = 'queen',
  selectedUpholsteryId = 'standard_fabric'
}) {
  const wood = FURNITURE_VARIANT_SPECS.woodSpecies.find(w => w.id === selectedWoodId) || FURNITURE_VARIANT_SPECS.woodSpecies[0];
  const finish = FURNITURE_VARIANT_SPECS.polishFinishes.find(f => f.id === selectedFinishId) || FURNITURE_VARIANT_SPECS.polishFinishes[0];
  const size = FURNITURE_VARIANT_SPECS.dimensionSizes.find(s => s.id === selectedSizeId) || FURNITURE_VARIANT_SPECS.dimensionSizes[1];
  const upholstery = FURNITURE_VARIANT_SPECS.upholsteryGrades.find(u => u.id === selectedUpholsteryId) || FURNITURE_VARIANT_SPECS.upholsteryGrades[3];

  const scaledBase = Math.round(basePrice * size.priceMultiplier);
  const totalCustomPrice = scaledBase + wood.priceAdder + finish.priceAdder + upholstery.priceAdder;
  const totalLeadDays = Math.max(wood.leadDays, 3);

  return {
    totalCustomPrice,
    basePrice,
    scaledBase,
    totalLeadDays,
    breakdown: {
      woodSpec: wood.name,
      woodDelta: wood.priceAdder,
      finishSpec: finish.name,
      finishDelta: finish.priceAdder,
      sizeSpec: size.name,
      sizeMultiplier: size.priceMultiplier,
      upholsterySpec: upholstery.name,
      upholsteryDelta: upholstery.priceAdder
    }
  };
}

// ------------------------------------------------------------------------------
// 5. Customer Khata Ledger & Milestone Engine (Crater Standard)
// ------------------------------------------------------------------------------
export const SAMPLE_CUSTOMER_KHATAS = [
  {
    customerId: 'CUST-001',
    customerName: 'Dr. Subhashish Jena',
    phone: '9437188291',
    address: 'Gayatri Nagar Villa, Rayagada',
    creditLimit: 250000,
    totalBilled: 165000,
    totalPaid: 110000,
    outstandingBalance: 55000,
    agingBucket: '1-30_DAYS',
    lastPaymentDate: '2026-09-18',
    orders: [
      {
        orderId: 'ORD-8921',
        date: '2026-08-28',
        total: 110000,
        paid: 110000,
        status: 'PAID_FULL',
        description: 'Solid Teak Master Bedroom Suite'
      },
      {
        orderId: 'ORD-9104',
        date: '2026-09-15',
        total: 55000,
        paid: 0,
        status: 'BALANCE_ON_DELIVERY',
        description: '6-Seater Royal Dining Table & Console'
      }
    ]
  },
  {
    customerId: 'CUST-002',
    customerName: 'Advocate B. K. Patnaik',
    phone: '9861054321',
    address: 'Court Road, Rayagada',
    creditLimit: 150000,
    totalBilled: 95000,
    totalPaid: 45000,
    outstandingBalance: 50000,
    agingBucket: '31-60_DAYS',
    lastPaymentDate: '2026-08-10',
    orders: [
      {
        orderId: 'ORD-8812',
        date: '2026-08-05',
        total: 95000,
        paid: 45000,
        status: 'INSTALLMENT_PENDING',
        description: 'Godrej Executive Office Table + 3 Leatherette Chairs'
      }
    ]
  },
  {
    customerId: 'CUST-003',
    customerName: 'Pooja Agarwal (Interior Architect)',
    phone: '9437012345',
    address: 'JK Pur Township, Rayagada',
    creditLimit: 500000,
    totalBilled: 380000,
    totalPaid: 350000,
    outstandingBalance: 30000,
    agingBucket: 'CURRENT',
    lastPaymentDate: '2026-09-24',
    orders: [
      {
        orderId: 'ORD-9201',
        date: '2026-09-22',
        total: 380000,
        paid: 350000,
        status: 'RETENTION_ON_QC',
        description: 'Turnkey Villa 3 BHK Custom Upholstered Beds & Wardrobes'
      }
    ]
  }
];

export function generateKhataPaymentReminderText({
  customerName = 'Valued Patron',
  outstandingBalance = 55000,
  orderRef = 'ORD-9104',
  upiVpa = '9390553301@ybl'
}) {
  const upiLink = `upi://pay?pa=${upiVpa}&pn=Sri%20Vinayaka%20Furnitures&am=${outstandingBalance}&cu=INR&tn=Balance%20Payment%20${orderRef}`;
  return (
    `*🏛️ SRI VINAYAKA FURNITURES — STATEMENT OF ACCOUNT*\n` +
    `*(Godrej Interio Flagship Showroom, Rayagada)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Dear *${customerName}*,\n\n` +
    `Greetings from Sri Vinayaka Furnitures! Hope you are enjoying your furniture installation.\n\n` +
    `📋 *Account Summary for Order Ref:* ${orderRef}\n` +
    `💰 *Outstanding Balance Due:* *₹${outstandingBalance.toLocaleString()}*\n` +
    `💳 *Instant 0% Fee UPI Payment Link:*\n${upiLink}\n\n` +
    `Bank NEFT Details: Canara Bank Rayagada\nA/C: 120001889912 | IFSC: CNRB0001234\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `For any billing reconciliation, call Store Director Rakesh: +91 93905 53301.\n` +
    `_Thank you for choosing Godrej Interio quality!_`
  );
}

// ------------------------------------------------------------------------------
// 6. Cashier POS Shift Session Engine (Odoo POS Standard)
// ------------------------------------------------------------------------------
export function calculateCashierShiftAudit({
  openingCashFloat = 5000,
  cashSalesTotal = 24500,
  cashExpensesOut = 750, // Tea/Diesel
  actualCountedCash = 28750
}) {
  const expectedCashInDrawer = openingCashFloat + cashSalesTotal - cashExpensesOut;
  const variance = actualCountedCash - expectedCashInDrawer;
  const isBalanced = Math.abs(variance) === 0;

  return {
    openingCashFloat,
    cashSalesTotal,
    cashExpensesOut,
    expectedCashInDrawer,
    actualCountedCash,
    variance,
    isBalanced,
    statusText: isBalanced 
      ? '✅ PERFECT CASHIER AUDIT: Exact drawer match, zero variance.' 
      : variance > 0 
        ? `⚠️ CASH SURPLUS: Drawer has ₹${variance.toLocaleString()} surplus.` 
        : `🚨 CASH DEFICIT: Drawer is short by ₹${Math.abs(variance).toLocaleString()}. Supervisor PIN required.`
  };
}

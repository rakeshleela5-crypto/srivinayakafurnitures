/**
 * OmniBuild OS™ — Showroom Pricing & Split-Tender Allocation Engine
 * Flagship showroom arithmetic engine for Godrej Interio Rayagada | Shree Ganesh Enterprises
 * Built using strict Test-Driven Development (TDD)
 */

export const SAFE_LOCK_TOKEN_PERCENTAGE = 0.20; // 20% minimum token advance
export const MAX_STANDARD_DISCOUNT_PCT = 35; // Maximum discount before Director override
export const HIGH_VALUE_FREE_DELIVERY_THRESHOLD = 100000; // Free delivery for >= ₹1 Lakh

export const VALID_PAYMENT_MODES = Object.freeze([
  'CASH',
  'DYNAMIC_UPI_QR',
  'CARD_EDC',
  'BAJAJ_EMI',
  'KHATA_LEDGER',
  'BANK_NEFT_RTGS'
]);

export const ODISHA_DELIVERY_SLABS = Object.freeze({
  RAYAGADA_LOCAL: {
    name: 'Rayagada Flagship Showroom Vicinity',
    pinCodes: ['765001', '765002'],
    feeINR: 0
  },
  ODISHA_OUTSTATION: {
    name: 'Odisha Outstation Districts (Gunupur, Koraput, Jeypore, Paralakhemundi)',
    pinCodes: ['765022', '764020', '764001', '761200', '765017', '764056'],
    feeINR: 1200
  },
  DEFAULT_REGIONAL: {
    name: 'General Inter-State / Regional Transit',
    feeINR: 2500
  }
});

/**
 * Calculates item subtotal, discount, reverse 18% GST (9% CGST + 9% SGST),
 * regional delivery fee, and minimum SafeLock token advance.
 */
export function calculateFurniturePricing({
  items = [],
  discountPct = 0,
  deliveryPinCode = '765001',
  hasDirectorOverride = false
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items list cannot be empty');
  }

  for (const item of items) {
    if (!item.qty || typeof item.qty !== 'number' || item.qty <= 0) {
      throw new Error('Quantity must be a positive integer');
    }
  }

  // 1. Gross Subtotal
  const grossSubtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * item.qty), 0);

  // 2. Discount & Director Cap Enforcement
  let appliedDiscountPct = Number(discountPct) || 0;
  let wasDiscountCapped = false;

  if (appliedDiscountPct > MAX_STANDARD_DISCOUNT_PCT && !hasDirectorOverride) {
    appliedDiscountPct = MAX_STANDARD_DISCOUNT_PCT;
    wasDiscountCapped = true;
  }

  const discountAmount = Math.round(grossSubtotal * (appliedDiscountPct / 100));
  const discountedTotal = grossSubtotal - discountAmount;

  // 3. Statutory Reverse 18% GST (Taxable Subtotal + 9% CGST + 9% SGST)
  // Base = Inclusive / 1.18
  const taxableSubtotal = Math.round((discountedTotal / 1.18));
  const totalGst = discountedTotal - taxableSubtotal;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  // 4. Regional Delivery Surcharge
  let deliveryFee = ODISHA_DELIVERY_SLABS.DEFAULT_REGIONAL.feeINR;
  const pin = String(deliveryPinCode || '').trim();

  if (ODISHA_DELIVERY_SLABS.RAYAGADA_LOCAL.pinCodes.includes(pin)) {
    deliveryFee = ODISHA_DELIVERY_SLABS.RAYAGADA_LOCAL.feeINR;
  } else if (ODISHA_DELIVERY_SLABS.ODISHA_OUTSTATION.pinCodes.includes(pin)) {
    deliveryFee = ODISHA_DELIVERY_SLABS.ODISHA_OUTSTATION.feeINR;
  }

  // Waive delivery fee if order total exceeds high-value threshold
  let isFreeDeliveryWaived = false;
  if (discountedTotal >= HIGH_VALUE_FREE_DELIVERY_THRESHOLD) {
    deliveryFee = 0;
    isFreeDeliveryWaived = true;
  }

  // 5. Grand Total & SafeLock Token Advance
  const grandTotal = discountedTotal + deliveryFee;
  const minimumAdvanceToken = Math.round(grandTotal * SAFE_LOCK_TOKEN_PERCENTAGE);

  return Object.freeze({
    grossSubtotal,
    discountPctApplied: appliedDiscountPct,
    discountAmount,
    discountedTotal,
    taxableSubtotal,
    cgst,
    sgst,
    totalGst,
    deliveryFee,
    isFreeDeliveryWaived,
    grandTotal,
    minimumAdvanceToken,
    wasDiscountCapped
  });
}

/**
 * Validates a multi-tender split payment allocation
 */
export function validateSplitTender({
  grandTotal = 0,
  tenders = [],
  cashGivenByCustomer = 0
}) {
  const errors = [];
  let totalAllocated = 0;
  let cashTenderAmount = 0;

  if (!Array.isArray(tenders) || tenders.length === 0) {
    errors.push('At least one payment tender must be provided');
  }

  for (const tender of (tenders || [])) {
    const amt = Number(tender.amount);
    if (isNaN(amt) || amt < 0) {
      errors.push('Tender amount cannot be negative or invalid');
      continue;
    }

    if (!VALID_PAYMENT_MODES.includes(tender.mode)) {
      errors.push(`Invalid payment mode: ${tender.mode}`);
      continue;
    }

    totalAllocated += amt;
    if (tender.mode === 'CASH') {
      cashTenderAmount += amt;
    }
  }

  const remainingBalance = Math.round((grandTotal - totalAllocated) * 100) / 100;
  
  if (remainingBalance > 0) {
    errors.push(`Remaining balance of ₹${remainingBalance.toLocaleString()} must be allocated`);
  } else if (remainingBalance < 0) {
    errors.push(`Over-allocation: Tenders exceed grand total by ₹${Math.abs(remainingBalance).toLocaleString()}`);
  }

  const changeDue = cashTenderAmount > 0 
    ? Math.max(0, (Number(cashGivenByCustomer) || 0) - cashTenderAmount)
    : 0;

  const isValid = errors.length === 0 && remainingBalance === 0;

  return Object.freeze({
    isValid,
    totalAllocated,
    remainingBalance,
    changeDue,
    errors
  });
}

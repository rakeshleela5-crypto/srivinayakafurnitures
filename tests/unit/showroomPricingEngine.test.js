import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateFurniturePricing, 
  validateSplitTender,
  ODISHA_DELIVERY_SLABS,
  SAFE_LOCK_TOKEN_PERCENTAGE
} from '../../src/utils/showroomPricingEngine.js';

describe('ShowroomPricingEngine — Strict TDD Test Suite (#20)', () => {
  describe('calculateFurniturePricing', () => {
    it('calculates gross total, standard discount, and reverse 18% GST (9% CGST + 9% SGST)', () => {
      const items = [
        { sku: 'BED-MOD-001', name: 'Kalista Hydraulic Bed', price: 60000, qty: 1 },
        { sku: 'MAT-ORT-001', name: 'Godrej Ortho Mattress', price: 20000, qty: 1 }
      ];

      const result = calculateFurniturePricing({
        items,
        discountPct: 10,
        deliveryPinCode: '765001' // Rayagada Town
      });

      // Gross = 80,000; 10% discount = 8,000; Discounted = 72,000
      assert.equal(result.grossSubtotal, 80000);
      assert.equal(result.discountAmount, 8000);
      assert.equal(result.discountedTotal, 72000);

      // Taxable = 72,000 / 1.18 = 61016.95 -> 61017
      assert.equal(result.taxableSubtotal, 61017);
      assert.equal(result.cgst, 5491.5);
      assert.equal(result.sgst, 5491.5);
      assert.equal(result.totalGst, 10983);
      assert.equal(result.deliveryFee, 0); // Rayagada local is free
      assert.equal(result.grandTotal, 72000);

      // Minimum 20% SafeLock token advance
      assert.equal(result.minimumAdvanceToken, 14400);
    });

    it('applies flat ₹1,200 rural delivery surcharge for outstation Odisha districts under ₹1,00,000', () => {
      const items = [
        { sku: 'SOF-3STR-001', name: 'Centuro 3-Seater Sofa', price: 45000, qty: 1 }
      ];

      const result = calculateFurniturePricing({
        items,
        discountPct: 0,
        deliveryPinCode: '765022' // Gunupur, Rayagada district outstation
      });

      assert.equal(result.deliveryFee, 1200);
      assert.equal(result.grandTotal, 46200);
    });

    it('waives rural delivery surcharge for high-value orders (>= ₹1,00,000)', () => {
      const items = [
        { sku: 'B2B-CONF-001', name: 'Executive Conference Suite', price: 120000, qty: 1 }
      ];

      const result = calculateFurniturePricing({
        items,
        discountPct: 0,
        deliveryPinCode: '764020' // Koraput
      });

      assert.equal(result.deliveryFee, 0);
      assert.equal(result.isFreeDeliveryWaived, true);
      assert.equal(result.grandTotal, 120000);
    });

    it('enforces 35% maximum promotional discount cap unless Director override is active', () => {
      const items = [{ sku: 'ALM-SLD-001', name: 'Godrej Almirah', price: 50000, qty: 1 }];

      // Attempt 40% discount without Director override
      const capped = calculateFurniturePricing({
        items,
        discountPct: 40,
        hasDirectorOverride: false
      });
      assert.equal(capped.discountPctApplied, 35);
      assert.equal(capped.wasDiscountCapped, true);

      // With Director override
      const overridden = calculateFurniturePricing({
        items,
        discountPct: 40,
        hasDirectorOverride: true
      });
      assert.equal(overridden.discountPctApplied, 40);
      assert.equal(overridden.wasDiscountCapped, false);
    });

    it('rejects empty items list or negative quantities with ValidationError', () => {
      assert.throws(() => {
        calculateFurniturePricing({ items: [] });
      }, /Items list cannot be empty/);

      assert.throws(() => {
        calculateFurniturePricing({
          items: [{ sku: 'TEST', price: 1000, qty: -2 }]
        });
      }, /Quantity must be a positive integer/);
    });
  });

  describe('validateSplitTender', () => {
    it('validates exact multi-tender split across Cash, UPI, and Card', () => {
      const result = validateSplitTender({
        grandTotal: 65000,
        tenders: [
          { mode: 'CASH', amount: 15000 },
          { mode: 'DYNAMIC_UPI_QR', amount: 25000, reference: 'UPI9437188291' },
          { mode: 'CARD_EDC', amount: 25000, reference: 'HDFC-778219' }
        ],
        cashGivenByCustomer: 15000
      });

      assert.equal(result.isValid, true);
      assert.equal(result.totalAllocated, 65000);
      assert.equal(result.remainingBalance, 0);
      assert.equal(result.changeDue, 0);
      assert.equal(result.errors.length, 0);
    });

    it('correctly calculates change due when cash given exceeds cash tender amount', () => {
      const result = validateSplitTender({
        grandTotal: 10000,
        tenders: [
          { mode: 'CASH', amount: 10000 }
        ],
        cashGivenByCustomer: 10500 // Customer handed two 500 notes extra
      });

      assert.equal(result.isValid, true);
      assert.equal(result.changeDue, 500);
    });

    it('flags unallocated remaining balance when tenders fall short of grand total', () => {
      const result = validateSplitTender({
        grandTotal: 50000,
        tenders: [
          { mode: 'CASH', amount: 20000 },
          { mode: 'DYNAMIC_UPI_QR', amount: 20000 }
        ]
      });

      assert.equal(result.isValid, false);
      assert.equal(result.remainingBalance, 10000);
      assert.ok(result.errors.some(e => e.includes('Remaining balance of ₹10,000')));
    });

    it('rejects invalid or unauthorized payment modes', () => {
      const result = validateSplitTender({
        grandTotal: 10000,
        tenders: [
          { mode: 'CRYPTO_BITCOIN', amount: 10000 }
        ]
      });

      assert.equal(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('Invalid payment mode: CRYPTO_BITCOIN')));
    });

    it('rejects negative or non-numeric tender amounts', () => {
      const result = validateSplitTender({
        grandTotal: 10000,
        tenders: [
          { mode: 'CASH', amount: -5000 },
          { mode: 'DYNAMIC_UPI_QR', amount: 15000 }
        ]
      });

      assert.equal(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('Tender amount cannot be negative')));
    });
  });
});

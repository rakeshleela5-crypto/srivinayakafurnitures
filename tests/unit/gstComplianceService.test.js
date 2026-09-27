import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGstin,
  calculateGstTaxSplit,
  generateGstr1Json,
  generateGstr3bSummary,
  generateEwayBillJson,
  reconcileGstr2b
} from '../../src/services/gstComplianceService.js';

describe('GST Statutory Compliance Engine — Unit Test Suite', () => {
  describe('GSTIN Validation and Checksum', () => {
    it('validates a standard Indian 15-character GSTIN format and state code', () => {
      // 21 = Odisha, AABCS = PAN first 5, 1234 = num, F = entity char, 1 = entity no, Z = default, 8 = check
      const result = validateGstin('21AABCS1234F1Z8');
      assert.equal(result.valid !== undefined, true);
      assert.equal(result.stateCode, '21');
      assert.equal(result.stateName, 'Odisha');
      assert.equal(result.isUtWithoutLeg, false);
      assert.equal(result.pan, 'AABCS1234F');
    });

    it('identifies Union Territories requiring UTGST (e.g. Chandigarh 04, Ladakh 26)', () => {
      const chd = validateGstin('04AAACG1234P1ZA');
      assert.equal(chd.stateCode, '04');
      assert.equal(chd.isUtWithoutLeg, true);

      const ladakh = validateGstin('26AAACL1234K1ZB');
      assert.equal(ladakh.stateCode, '26');
      assert.equal(ladakh.isUtWithoutLeg, true);
    });

    it('rejects invalid GSTIN strings', () => {
      assert.equal(validateGstin('').valid, false);
      assert.equal(validateGstin('INVALID_GSTIN').valid, false);
      assert.equal(validateGstin('99AABCS1234F1Z8').valid, false); // invalid state 99
    });
  });

  describe('calculateGstTaxSplit', () => {
    it('calculates intra-state Odisha GST (9% CGST + 9% SGST) for 18% rate', () => {
      const split = calculateGstTaxSplit({
        taxableAmount: 100000,
        taxRatePct: 18,
        supplierStateCode: '21',
        placeOfSupply: '21'
      });

      assert.equal(split.isInterState, false);
      assert.equal(split.isUtgst, false);
      assert.equal(split.cgstAmount, 9000);
      assert.equal(split.sgstAmount, 9000);
      assert.equal(split.utgstAmount, 0);
      assert.equal(split.igstAmount, 0);
      assert.equal(split.totalTax, 18000);
      assert.equal(split.totalInvoiceValue, 118000);
    });

    it('calculates inter-state GST (18% IGST) when place of supply differs (e.g. AP 37)', () => {
      const split = calculateGstTaxSplit({
        taxableAmount: 50000,
        taxRatePct: 18,
        supplierStateCode: '21', // Odisha
        placeOfSupply: '37' // Andhra Pradesh
      });

      assert.equal(split.isInterState, true);
      assert.equal(split.igstAmount, 9000);
      assert.equal(split.cgstAmount, 0);
      assert.equal(split.sgstAmount, 0);
      assert.equal(split.totalTax, 9000);
      assert.equal(split.totalInvoiceValue, 59000);
    });

    it('calculates UTGST for Union Territories without legislature (e.g. Chandigarh 04)', () => {
      const split = calculateGstTaxSplit({
        taxableAmount: 40000,
        taxRatePct: 18,
        supplierStateCode: '04',
        placeOfSupply: '04'
      });

      assert.equal(split.isInterState, false);
      assert.equal(split.isUtgst, true);
      assert.equal(split.cgstAmount, 3600);
      assert.equal(split.sgstAmount, 0);
      assert.equal(split.utgstAmount, 3600);
      assert.equal(split.totalTax, 7200);
    });

    it('returns 0 tax for Bill of Supply (exempt goods / composition)', () => {
      const split = calculateGstTaxSplit({
        taxableAmount: 25000,
        taxRatePct: 18,
        isBillOfSupply: true
      });

      assert.equal(split.totalTax, 0);
      assert.equal(split.totalInvoiceValue, 25000);
    });
  });

  describe('generateGstr1Json', () => {
    it('generates schema-compliant GSTR-1 JSON with B2B, B2CS, HSN and Doc Issue tables', () => {
      const orders = [
        {
          Order_ID: 'INV-2026-1001',
          Customer_Name: 'Collectorate Rayagada',
          Customer_GSTIN: '21AAACG1234P1ZA',
          Total_Amount_INR: 118000,
          Quantity: 1,
          Unit: 'Set',
          HSN: '9403',
          Created_Timestamp: '2026-09-15'
        },
        {
          Order_ID: 'INV-2026-1002',
          Customer_Name: 'Retail Walk-in Customer',
          Customer_GSTIN: '',
          Total_Amount_INR: 23600,
          Quantity: 2,
          Unit: 'Nos',
          HSN: '9403',
          Created_Timestamp: '2026-09-16'
        }
      ];

      const gstr1 = generateGstr1Json({
        orders,
        supplierGstin: '21AABCS1234F1Z8',
        filingPeriod: '092026'
      });

      assert.equal(gstr1.gstin, '21AABCS1234F1Z8');
      assert.equal(gstr1.fp, '092026');
      assert.equal(gstr1.version, 'GSTR1_V2.0');

      // Table 4: B2B should have 1 customer
      assert.equal(gstr1.b2b.length, 1);
      assert.equal(gstr1.b2b[0].ctin, '21AAACG1234P1ZA');
      assert.equal(gstr1.b2b[0].inv[0].inum, 'INV-2026-1001');

      // Table 7: B2CS should have retail entry
      assert.equal(gstr1.b2cs.length, 1);
      assert.equal(gstr1.b2cs[0].sply_ty, 'INTRA');
      assert.equal(gstr1.b2cs[0].rt, 18);

      // Table 12: HSN Summary
      assert.equal(gstr1.hsn.data.length, 1);
      assert.equal(gstr1.hsn.data[0].hsn_sc, '9403');
      assert.equal(gstr1.hsn.data[0].qty, 3);

      // Table 13: Document Issue
      assert.equal(gstr1.doc_issue.doc_det[0].docs[0].totnum, 2);
    });
  });

  describe('generateGstr3bSummary', () => {
    it('computes Box 3.1 outward taxable value and tax obligations', () => {
      const orders = [
        {
          Order_ID: 'INV-1',
          Total_Amount_INR: 118000,
          Quantity: 1,
          Unit: 'Nos',
          HSN: '9403'
        }
      ];

      const summary = generateGstr3bSummary({
        orders,
        supplierGstin: '21AABCS1234F1Z8',
        filingPeriod: '092026'
      });

      assert.equal(summary.period, '092026');
      assert.equal(summary.table31_outwardSupplies.taxableValue, 100000);
      assert.equal(summary.table31_outwardSupplies.cgst, 9000);
      assert.equal(summary.table31_outwardSupplies.sgst, 9000);
    });
  });

  describe('generateEwayBillJson', () => {
    it('generates standard NIC E-Way Bill JSON payload for dispatch consignment', () => {
      const order = {
        Order_ID: 'INV-2026-8921',
        Customer_Name: 'Dr. Subhashish Jena',
        Customer_GSTIN: '21AAACJ1234F1Z5',
        Total_Amount_INR: 156494,
        Project_Address: 'Gayatri Nagar, Rayagada',
        Project_Pincode: 765001,
        Vehicle_No: 'OD-18-A-1234',
        Ordered_SKU: 'Royal Teak Master Suite King Bed',
        HSN: '9403',
        Quantity: 1,
        Unit: 'Set'
      };

      const eway = generateEwayBillJson({
        order,
        storeMeta: {
          gstin: '21AABCS1234F1Z8',
          legalName: 'Shree Ganesh Enterprises',
          addressLine1: 'Main Road',
          addressLine2: 'Rayagada'
        },
        transporterDetails: {
          approxDistanceKm: 15,
          vehicleNo: 'OD18A1234'
        }
      });

      assert.equal(eway.version, '1.0.0421');
      assert.equal(eway.billLists.length, 1);
      const bill = eway.billLists[0];
      assert.equal(bill.docNo, 'INV-2026-8921');
      assert.equal(bill.supplyType, 'O');
      assert.equal(bill.fromStateCode, 21);
      assert.equal(bill.toStateCode, 21);
      assert.equal(bill.vehicleNo, 'OD18A1234');
      assert.equal(bill.itemList[0].hsnCode, 9403);
    });
  });

  describe('reconcileGstr2b', () => {
    it('matches portal 2B invoices against internal purchase books and flags missing ITC', () => {
      const portal2b = {
        b2b: [
          {
            ctin: '27AAACG0000F1Z2',
            trdName: 'Godrej & Boyce Mfg Co Ltd',
            inv: [
              {
                inum: 'G&B/2026/9981',
                idt: '12-09-2026',
                val: 590000,
                items: [{ txval: 500000, iamt: 90000, camt: 0, samt: 0 }]
              },
              {
                inum: 'G&B/2026/9982',
                idt: '14-09-2026',
                val: 118000,
                items: [{ txval: 100000, iamt: 18000, camt: 0, samt: 0 }]
              }
            ]
          }
        ]
      };

      const internalBooks = [
        {
          invoiceNo: 'G&B/2026/9981',
          totalAmount: 590000,
          vendor: 'Godrej Factory Plant'
        },
        {
          invoiceNo: 'LOCAL-PLY-771',
          totalAmount: 45000,
          vendor: 'Rayagada Timber Mill'
        }
      ];

      const result = reconcileGstr2b({
        portal2bJson: portal2b,
        internalPurchaseRecords: internalBooks
      });

      assert.equal(result.matchedCount, 1);
      assert.equal(result.matched[0].invoiceNumber, 'G&B/2026/9981');
      assert.equal(result.missingInBooksCount, 1); // 9982 in portal, not in books
      assert.equal(result.missingInBooks[0].invoiceNumber, 'G&B/2026/9982');
      assert.equal(result.missingIn2bCount, 1); // LOCAL-PLY-771 not in portal (supplier hasn't filed!)
      assert.equal(result.missingIn2b[0].invoiceNumber, 'LOCAL-PLY-771');
    });
  });
});

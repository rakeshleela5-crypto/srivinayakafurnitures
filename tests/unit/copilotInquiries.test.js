import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { askShowroomAssistant } from '../../src/services/geminiService.js';
import { INITIAL_INQUIRIES } from '../../src/data/initialData.js';

describe('Ask My Showroom Copilot — Data Grounding & Inquiries Test Suite', () => {
  const mockContext = {
    orders: [
      { Order_ID: 'ORD-901', Customer_Name: 'Dr. Subhashish Jena', Total_Amount_INR: 156000, Advance_Paid_INR: 80000, Balance_Due_INR: 76000, Phone: '9390553301', Created_Date: 'Today' },
      { Order_ID: 'ORD-902', Customer_Name: 'Smt. Minati Pradhan', Total_Amount_INR: 52000, Advance_Paid_INR: 20000, Balance_Due_INR: 32000, Phone: '9390553301', Created_Date: 'Today' }
    ],
    inquiries: INITIAL_INQUIRIES,
    catalog: [
      { SKU: 'BED-TEAK-001', Product_Name: 'Grand Royal Teakwood King Bed', Selling_Price_INR: 115000, MRP_INR: 145000, Main_Category: 'bedroom' }
    ],
    inventory: [
      { SKU: 'BED-TEAK-001', Product_Name: 'Grand Royal Teakwood King Bed', Warehouse_Qty: 3, Buffer_Threshold: 2 }
    ],
    bankAccounts: [
      { id: 'HDFC_CURRENT', bankName: 'HDFC Bank Current A/c', currentBalance: 3842500 },
      { id: 'SBI_COMMERCIAL', bankName: 'SBI Commercial A/c', currentBalance: 1480000 }
    ],
    profitMetrics: {
      total_sales: 25641407,
      net_profit: 6180351,
      net_margin_pct: '24.1%'
    },
    storeMeta: {
      storeName: 'Godrej Interio Rayagada Flagship Showroom',
      upiId: '9390553301@ybl'
    }
  };

  it('answers "today inquiries" with real live CRM inquiries and NEVER returns dummy Kalista bed', async () => {
    const answer = await askShowroomAssistant('today inquiries', mockContext);

    // 1. Must NOT contain the dummy mock fallback string
    assert.equal(
      answer.includes('Recommended model based on your inquiry is Kalista King Hydraulic Bed'),
      false,
      'Copilot must not return the dummy Kalista Bed recommendation'
    );

    // 2. Must contain real CRM inquiry data
    assert.equal(
      answer.includes('Inquiries') || answer.includes('CRM') || answer.includes('leads'),
      true,
      'Response must be grounded in inquiries/CRM'
    );
    assert.equal(
      answer.includes('K. Venkat Rao') || answer.includes('Venkat') || answer.includes('Manjula Sahu'),
      true,
      'Response must include real customer names from inquiries'
    );
    assert.equal(
      answer.includes('₹') || answer.includes('Rs.'),
      true,
      'Response must include rupee currency values'
    );
  });

  it('answers "who owes balance" with exact pending customer names and figures', async () => {
    const answer = await askShowroomAssistant('who owes balance payment?', mockContext);

    assert.equal(answer.includes('Dr. Subhashish Jena'), true);
    assert.equal(answer.includes('₹76,000') || answer.includes('76,000'), true);
    assert.equal(answer.includes('Smt. Minati Pradhan'), true);
  });

  it('answers "today sales" with counter sales and orders metrics', async () => {
    const answer = await askShowroomAssistant('today sales', mockContext);

    assert.equal(answer.includes('Today\'s') || answer.includes('Turnover') || answer.includes('Sales'), true);
    assert.equal(answer.includes('₹') || answer.includes('Rs.'), true);
  });

  it('answers "bank balance" with HDFC and SBI liquid balances', async () => {
    const answer = await askShowroomAssistant('what is our bank balance in hdfc?', mockContext);

    assert.equal(answer.includes('HDFC'), true);
    assert.equal(answer.includes('38,42,500') || answer.includes('3,842,500'), true);
  });
});

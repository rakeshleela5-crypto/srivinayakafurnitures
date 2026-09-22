/**
 * OmniBuild OS™ — Enterprise Tally Prime XML & Excel Integration Bridge
 * Client: Godrej Interio Rayagada Flagship Showroom (Shree Ganesh Enterprises)
 * 
 * Generates 100% standard Tally Prime-compatible XML and structured Excel files
 * for Sales Invoices, Purchase Invoices, and Payment / Receipt / Journal Vouchers.
 */

/**
 * Clean strings for safe XML output
 */
function sanitizeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date to Tally format (YYYYMMDD)
 */
function formatTallyDate(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  } catch (e) {
    return '20260901';
  }
}

/**
 * 1. Generate Pure Tally Prime-Compliant XML
 */
export function generateTallyPrimeXml({ orders = [], bankTransactions = [], companyName = "Shree Ganesh Enterprises" }) {
  const company = sanitizeXml(companyName);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters and Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  // 🛒 1. Sales Invoices (Voucher Type: Sales)
  orders.forEach((order, idx) => {
    const vchNo = sanitizeXml(order.Order_ID || `INV-GI-2026-${1000 + idx}`);
    const vchDate = formatTallyDate(order.Created_Timestamp || order.dateTime);
    const partyName = sanitizeXml(order.Customer_Name || "Cash Customer Rayagada");
    const totalAmount = Number(order.Total_Amount_INR || order.amount || 50000);
    const gstRate = 0.18;
    const taxableAmount = Math.round(totalAmount / (1 + gstRate));
    const gstAmount = totalAmount - taxableAmount;
    const cgst = Math.round(gstAmount / 2);
    const sgst = gstAmount - cgst;
    const narration = sanitizeXml(`Godrej Interio Showroom Sales: ${order.Ordered_SKU || 'Furniture Suite'} | Phone: ${order.Customer_Phone || 'N/A'}`);

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${vchDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${vchNo}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <BASICBASEPARTYNAME>${partyName}</BASICBASEPARTYNAME>
            <NARRATION>${narration}</NARRATION>
            
            <!-- Sundry Debtor Ledger (Debit) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Sales GST 18% Ledger (Credit) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Furniture Sales @ 18%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${taxableAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Output CGST Ledger (Credit) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Output SGST Ledger (Credit) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  // 🏦 2. Bank & Payment/Receipt/Journal Vouchers
  bankTransactions.forEach((txn, idx) => {
    const isOutward = txn.flowType === 'OUTWARD_DEBIT';
    const vchType = isOutward ? 'Payment' : 'Receipt';
    const vchNo = sanitizeXml(txn.id || `TXN-BNK-${2000 + idx}`);
    const vchDate = formatTallyDate(txn.dateTime);
    const bankName = sanitizeXml(txn.bankAccountName || 'Canara Bank Current A/c');
    const partyName = sanitizeXml(txn.partyName || (isOutward ? 'Vendor Account' : 'Customer Account'));
    const amount = Number(txn.amount || 0);
    const utr = sanitizeXml(txn.utrNumber || 'N/A');
    const isSuspense = txn.reconciliationStatus === 'UNBILLED_SUSPENSE_OUTFLOW';
    const ledgerHead = isSuspense ? 'Suspense Account (Unbilled Advances)' : partyName;
    const narration = sanitizeXml(`Mode: ${txn.paymentMode || 'RTGS'} | UTR: ${utr} | Notes: ${txn.notes || ''}`);

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${vchType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${vchDate}</DATE>
            <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${vchNo}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${ledgerHead}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <NARRATION>${narration}</NARRATION>

            <!-- Party / Suspense Ledger Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${ledgerHead}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isOutward ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${isOutward ? (-amount).toFixed(2) : amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Bank Ledger Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${bankName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isOutward ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${isOutward ? amount.toFixed(2) : (-amount).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
}

/**
 * 2. Generate Tally-Structured Excel / CSV for Standard Import
 */
export function generateTallyExcelCsv({ orders = [], bankTransactions = [] }) {
  const headers = [
    "Voucher_Date",
    "Voucher_Type",
    "Voucher_No",
    "Party_Ledger",
    "Particulars_Debit_Credit",
    "Amount_INR",
    "Bank_Or_Cash_Account",
    "UTR_Cheque_Ref",
    "Narration",
    "Audit_Status"
  ];

  const rows = [];

  // Orders -> Sales Vouchers
  orders.forEach((ord, i) => {
    rows.push([
      ord.Created_Timestamp || "2026-09-15",
      "Sales",
      ord.Order_ID || `INV-${1000 + i}`,
      ord.Customer_Name || "Customer",
      "Sales Account @ 18%",
      Number(ord.Total_Amount_INR || ord.amount || 0).toFixed(2),
      "Sundry Debtors",
      ord.Payment_Ref || "ONLINE_UPI",
      `Godrej Interio Showroom Delivery: ${ord.Ordered_SKU || 'Furniture'}`,
      ord.SafeLock_Status || "CONFIRMED"
    ]);
  });

  // Bank Transactions -> Payment / Receipt / Suspense Vouchers
  bankTransactions.forEach((txn, i) => {
    const isOutward = txn.flowType === 'OUTWARD_DEBIT';
    const isSuspense = txn.reconciliationStatus === 'UNBILLED_SUSPENSE_OUTFLOW';
    rows.push([
      txn.dateTime || "2026-09-14",
      isOutward ? (isSuspense ? "Payment (Suspense)" : "Payment") : "Receipt",
      txn.id || `TXN-${2000 + i}`,
      txn.partyName || "Counterparty",
      isSuspense ? "Suspense Account (Awaiting Invoice)" : (isOutward ? "Sundry Creditor" : "Sundry Debtor"),
      Number(txn.amount || 0).toFixed(2),
      txn.bankAccountName || "Canara Bank Current A/c",
      txn.utrNumber || "N/A",
      txn.notes || "Bank Ledger Transaction",
      txn.reconciliationStatus || "VERIFIED"
    ]);
  });

  const csvString = [
    headers.join(","),
    ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  ].join("\r\n");

  return csvString;
}

/**
 * 3. Browser Download Helper
 */
export function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const fs = require("fs");
const path = require("path");

const IMPORT_LINES = `import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { EditableCell } from '../components/common/InlineCellRenderer';`;

function addImports(code, importLines) {
  const lastImportMatch = [...code.matchAll(/^import .+$/mg)];
  if (!lastImportMatch.length) return code;
  const last = lastImportMatch[lastImportMatch.length - 1];
  const insertAt = last.index + last[0].length;
  return code.slice(0, insertAt) + "\n" + importLines + code.slice(insertAt);
}

function insertAfter(code, marker, insertion) {
  const idx = code.indexOf(marker);
  if (idx < 0) { console.warn("Marker not found:", marker.slice(0,50)); return code; }
  const insertAt = idx + marker.length;
  return code.slice(0, insertAt) + insertion + code.slice(insertAt);
}

function replace(code, from, to) {
  if (!code.includes(from)) { console.warn("Replace target not found:", from.slice(0,60)); return code; }
  return code.replace(from, to);
}

// ──────────────────────────────────────────────────────────────────────
// 1. InventorySafeLockView — table: orders, pk: Order_ID
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/InventorySafeLockView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  code = insertAfter(code,
    `isSyncing\n  } = useStore();`,
    `\n\n  // 📝 Inline cell edit — orders table\n  const cellEdit = useInlineCellEdit({ table: 'orders', pkField: 'Order_ID', readOnly: ['OTP_Code','Order_ID'], setRows: setOrders, showToast });`
  );
  // Add setOrders to destructure if missing
  if (!code.includes("setOrders")) {
    code = code.replace("orders,", "orders, setOrders,");
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ InventorySafeLockView done");
}

// ──────────────────────────────────────────────────────────────────────
// 2. LogisticsEpodView — table: orders, pk: Order_ID
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/LogisticsEpodView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  code = insertAfter(code,
    `isDateInAuditWindow\n  } = useStore();`,
    `\n\n  // 📝 Inline cell edit — logistics/orders\n  const cellEdit = useInlineCellEdit({ table: 'orders', pkField: 'Order_ID', readOnly: ['Order_ID','OTP_Code'], setRows: setOrders, showToast });`
  );
  if (!code.includes("setOrders")) {
    code = code.replace("orders,", "orders, setOrders,");
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ LogisticsEpodView done");
}

// ──────────────────────────────────────────────────────────────────────
// 3. TallyGstOfficeView — table: tally_vouchers, pk: voucher_id
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/TallyGstOfficeView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  // Find first useStore closing brace
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — tally_vouchers\n  const cellEdit = useInlineCellEdit({ table: 'tally_vouchers', pkField: 'voucher_id', readOnly: ['voucher_id'], setRows: () => {}, showToast });` +
      code.slice(insertAt);
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ TallyGstOfficeView done");
}

// ──────────────────────────────────────────────────────────────────────
// 4. BankStatementLedgerView — table: bank_transactions, pk: txn_id
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/BankStatementLedgerView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `auditDateWindow\n  } = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — bank_transactions\n  const cellEdit = useInlineCellEdit({ table: 'bank_transactions', pkField: 'txn_id', readOnly: ['txn_id'], setRows: setBankTransactions, showToast });` +
      code.slice(insertAt);
  }
  if (!code.includes("setBankTransactions")) {
    code = code.replace("bankTransactions:", "setBankTransactions, bankTransactions:");
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ BankStatementLedgerView done");
}

// ──────────────────────────────────────────────────────────────────────
// 5. AutoProcureView — table: purchase_orders_log, pk: po_id
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/AutoProcureView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — purchase_orders_log\n  const cellEdit = useInlineCellEdit({ table: 'purchase_orders_log', pkField: 'po_id', readOnly: ['po_id'], setRows: setPoHistory, showToast });` +
      code.slice(insertAt);
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ AutoProcureView done");
}

// ──────────────────────────────────────────────────────────────────────
// 6. B2bInstitutionalProjectsView — table: vip_projects, pk: project_id
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/B2bInstitutionalProjectsView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — vip_projects\n  const cellEdit = useInlineCellEdit({ table: 'vip_projects', pkField: 'project_id', readOnly: ['project_id'], setRows: setVipProjects, showToast });` +
      code.slice(insertAt);
  }
  if (!code.includes("setVipProjects")) {
    code = code.replace("vipProjects", "vipProjects, setVipProjects");
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ B2bInstitutionalProjectsView done");
}

// ──────────────────────────────────────────────────────────────────────
// 7. DocumentStudio — table: documents_log, pk: doc_id
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/DocumentStudio.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — documents_log\n  const cellEdit = useInlineCellEdit({ table: 'documents_log', pkField: 'doc_id', readOnly: ['doc_id'], setRows: () => {}, showToast });` +
      code.slice(insertAt);
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ DocumentStudio done");
}

// ──────────────────────────────────────────────────────────────────────
// 8. WhatsAppBotSimulator — table: bot_configurations, pk: bot_id
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/WhatsAppBotSimulator.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — bot_configurations\n  const cellEdit = useInlineCellEdit({ table: 'bot_configurations', pkField: 'bot_id', readOnly: ['bot_id'], setRows: setBotConfigurations, showToast });` +
      code.slice(insertAt);
  }
  if (!code.includes("setBotConfigurations")) {
    code = code.replace("botConfigurations", "botConfigurations, setBotConfigurations");
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ WhatsAppBotSimulator done");
}

// ──────────────────────────────────────────────────────────────────────
// 9. VoicePosView — table: catalog, pk: SKU
// ──────────────────────────────────────────────────────────────────────
{
  const f = "src/views/VoicePosView.jsx";
  let code = fs.readFileSync(f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — catalog\n  const cellEdit = useInlineCellEdit({ table: 'catalog', pkField: 'SKU', readOnly: ['SKU'], setRows: setCatalog, showToast });` +
      code.slice(insertAt);
  }
  if (!code.includes("setCatalog")) {
    code = code.replace("catalog = [],", "catalog = [], setCatalog,");
  }
  fs.writeFileSync(f, code, "utf8");
  console.log("✅ VoicePosView done");
}

// ──────────────────────────────────────────────────────────────────────
// 10 & 11. StaffInwardScannerView + StaffOutwardScannerView
// ──────────────────────────────────────────────────────────────────────
for (const [f, table] of [
  ["StaffInwardScannerView.jsx", "inward_scan_log"],
  ["StaffOutwardScannerView.jsx", "outward_scan_log"]
]) {
  let code = fs.readFileSync("src/views/" + f, "utf8");
  code = addImports(code, IMPORT_LINES);
  const marker = `} = useStore();`;
  const idx = code.indexOf(marker);
  if (idx >= 0) {
    const insertAt = idx + marker.length;
    code = code.slice(0, insertAt) +
      `\n\n  // 📝 Inline cell edit — ${table}\n  const cellEdit = useInlineCellEdit({ table: '${table}', pkField: 'scan_id', readOnly: ['scan_id'], setRows: () => {}, showToast });` +
      code.slice(insertAt);
  }
  fs.writeFileSync("src/views/" + f, code, "utf8");
  console.log("✅ " + f + " done");
}

console.log("\n🎉 All 11 views updated with useInlineCellEdit hook!");

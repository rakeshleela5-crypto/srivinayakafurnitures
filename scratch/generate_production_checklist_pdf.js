import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const outputPath = path.resolve('public/OmniBuild_OS_Production_Implementation_Dossier.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 40, right: 40 },
  info: {
    Title: 'OmniBuild OS — Production Implementation & Data Collection Dossier',
    Author: 'N. Leela Rakesh / Shree Ganesh Enterprises',
    Subject: 'Client Onboarding & Real-Time Production Setup Specification'
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Helper colors
const GOLD = '#D4AF37';
const DARK_SLATE = '#0F172A';
const ACCENT_BLUE = '#0284C7';
const TEXT_MUTED = '#475569';

// ==========================================
// PAGE 1: TITLE & EXECUTIVE SUMMARY
// ==========================================
doc.rect(0, 0, 595.28, 70).fill(DARK_SLATE);

doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(22).text('OMNIBUILD OS™', 40, 20);
doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica').text('Enterprise Showroom Management System — Production Handover Dossier', 40, 46);

doc.moveDown(3);

doc.fillColor('#000000').font('Helvetica-Bold').fontSize(15).text('OFFICIAL CLIENT DATA COLLECTION & SETUP QUESTIONNAIRE', 40, 90);
doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(9.5).text('Target Showroom: Godrej Interio Rayagada | Shree Ganesh Enterprises', 40, 110);
doc.text('Date: September 2026  •  Deployment Spec: Live Real-Time Production', 40, 124);

// Divider line
doc.moveTo(40, 140).lineTo(555, 140).strokeColor(GOLD).lineWidth(1.5).stroke();

doc.moveDown(1.5);

// Callout Box
doc.rect(40, 155, 515, 45).fillAndStroke('#FEF3C7', '#D97706');
doc.fillColor('#92400E').font('Helvetica-Bold').fontSize(9.5).text('📌 INSTRUCTIONS FOR STORE DIRECTOR (N. LEELA RAKESH):', 50, 163);
doc.fillColor('#78350F').font('Helvetica').fontSize(8.5).text(
  'To transition OmniBuild OS from the verified cloud system to live daily production at your Rayagada showroom, please provide the verified data points below. This ensures your tax invoices, dynamic UPI QR codes, inventory buffer alerts, and WhatsApp dispatches work with 100% precision.',
  50, 176, { width: 495 }
);

// ==========================================
// SECTION 1: LEGAL & TAX IDENTITY
// ==========================================
let currentY = 215;

function drawSectionHeader(title, icon) {
  doc.rect(40, currentY, 515, 22).fill('#1E293B');
  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(10).text(`${icon}  ${title}`, 48, currentY + 6);
  currentY += 28;
}

function drawTableRow(label, priority, defaultVal, userVal) {
  doc.rect(40, currentY, 150, 20).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
  doc.rect(190, currentY, 75, 20).stroke();
  doc.rect(265, currentY, 130, 20).stroke();
  doc.rect(395, currentY, 160, 20).stroke();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text(label, 45, currentY + 6);
  
  const pColor = priority === 'CRITICAL' ? '#DC2626' : (priority === 'RECOMMENDED' ? '#059669' : '#0284C7');
  doc.fillColor(pColor).font('Helvetica-Bold').fontSize(7.5).text(priority, 195, currentY + 6);
  
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(defaultVal, 270, currentY + 6, { width: 120, lineBreak: false });
  doc.fillColor('#000000').font('Helvetica').fontSize(8).text(userVal, 400, currentY + 6);

  currentY += 20;
}

drawSectionHeader('1. LEGAL ENTITY & STATUTORY BILLING IDENTITY (GST & INVOICING)', '🏛️');

// Header row
doc.rect(40, currentY, 150, 18).fill('#F1F5F9');
doc.rect(190, currentY, 75, 18).fill('#F1F5F9');
doc.rect(265, currentY, 130, 18).fill('#F1F5F9');
doc.rect(395, currentY, 160, 18).fill('#F1F5F9');

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text('FIELD NAME', 45, currentY + 5);
doc.text('PRIORITY', 195, currentY + 5);
doc.text('CURRENT DEFAULT', 270, currentY + 5);
doc.text('LIVE STORE VALUE (FILL IN)', 400, currentY + 5);
currentY += 18;

drawTableRow('Legal Entity Name', 'CRITICAL', 'Shree Ganesh Enterprises', '___________________________');
drawTableRow('Trade / Banner Name', 'CRITICAL', 'Godrej Interio Rayagada', '___________________________');
drawTableRow('15-Digit GSTIN (Odisha)', 'CRITICAL', '21AAAAA0000A1Z5', '21________________________');
drawTableRow('Physical Showroom Address', 'CRITICAL', 'Main Road, Rayagada 765001', '___________________________');
drawTableRow('Official Billing Phone', 'CRITICAL', '+91 93905 53301', '___________________________');
drawTableRow('Customer Support Email', 'RECOMMENDED', 'rakeshleela5@gmail.com', '___________________________');

currentY += 15;

// ==========================================
// SECTION 2: BANKING & DOORSTEP UPI VPA
// ==========================================
drawSectionHeader('2. BANKING, DUAL-LEDGER RECONCILIATION & DOORSTEP UPI QR', '💳');

// Header row
doc.rect(40, currentY, 150, 18).fill('#F1F5F9');
doc.rect(190, currentY, 75, 18).fill('#F1F5F9');
doc.rect(265, currentY, 130, 18).fill('#F1F5F9');
doc.rect(395, currentY, 160, 18).fill('#F1F5F9');

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text('FIELD NAME', 45, currentY + 5);
doc.text('PRIORITY', 195, currentY + 5);
doc.text('CURRENT DEFAULT', 270, currentY + 5);
doc.text('LIVE STORE VALUE (FILL IN)', 400, currentY + 5);
currentY += 18;

drawTableRow('Primary UPI ID (VPA)', 'CRITICAL', '9390553301@ybl', '__________________@_______');
drawTableRow('Primary Bank Name', 'CRITICAL', 'HDFC Bank', '___________________________');
drawTableRow('Current Account Number', 'CRITICAL', '50200088192481', '___________________________');
drawTableRow('Bank IFSC Code', 'CRITICAL', 'HDFC0001892 (Rayagada)', '___________________________');
drawTableRow('Account Holder Name', 'CRITICAL', 'Shree Ganesh Enterprises', '___________________________');
drawTableRow('Secondary Bank (Supplier RTGS)', 'OPTIONAL', 'SBI Commercial Account', '___________________________');

currentY += 15;

// ==========================================
// SECTION 3: STAFF ROSTER & SECURITY PINS
// ==========================================
drawSectionHeader('3. STAFF ROSTER & 4-DIGIT SECURITY PIN CONFIGURATION', '👥');

doc.rect(40, currentY, 130, 18).fill('#F1F5F9');
doc.rect(170, currentY, 130, 18).fill('#F1F5F9');
doc.rect(300, currentY, 70, 18).fill('#F1F5F9');
doc.rect(370, currentY, 185, 18).fill('#F1F5F9');

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text('ROLE & PRIVILEGE', 45, currentY + 5);
doc.text('DEFAULT NAME', 175, currentY + 5);
doc.text('DEFAULT PIN', 305, currentY + 5);
doc.text('REAL STAFF NAME & MOBILE NO.', 375, currentY + 5);
currentY += 18;

function drawStaffRow(role, defName, pin, userFill) {
  doc.rect(40, currentY, 130, 20).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
  doc.rect(170, currentY, 130, 20).stroke();
  doc.rect(300, currentY, 70, 20).stroke();
  doc.rect(370, currentY, 185, 20).stroke();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text(role, 45, currentY + 6);
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(defName, 175, currentY + 6);
  doc.fillColor('#D97706').font('Helvetica-Bold').fontSize(8).text(pin, 305, currentY + 6);
  doc.fillColor('#000000').font('Helvetica').fontSize(8).text(userFill, 375, currentY + 6);

  currentY += 20;
}

drawStaffRow('Store Director (Owner)', 'Rakesh (Director)', '8899', 'N. Leela Rakesh (+91 93905 53301)');
drawStaffRow('Sales Executive', 'Sunil', '1122', '___________________________');
drawStaffRow('Warehouse Dock Supervisor', 'Santosh', '3344', '___________________________');
drawStaffRow('Logistics & Fleet Driver', 'Tophan Gouda', '5566', '___________________________');
drawStaffRow('Master Assembly Carpenter', 'Narayana Mistri', 'Job Cards', '___________________________');
drawStaffRow('VIP Architect Partner', 'Ar. Sunita Patnaik', '7788', '___________________________');

// PAGE BREAK TO PAGE 2
doc.addPage();
currentY = 40;

// Header on Page 2
doc.rect(0, 0, 595.28, 45).fill(DARK_SLATE);
doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(14).text('OMNIBUILD OS™ — PRODUCTION HANDOVER DOSSIER (PAGE 2)', 40, 16);

currentY = 60;

// ==========================================
// SECTION 4: PHYSICAL INVENTORY EXPORT SPEC
// ==========================================
drawSectionHeader('4. PHYSICAL WAREHOUSE STOCK & CATALOG EXPORT SPECIFICATION', '📦');

doc.fillColor('#334155').font('Helvetica').fontSize(8.5).text(
  'To initialize the live warehouse catalog (115 SKUs) and SafeLock buffer alerts, please provide an Excel/CSV spreadsheet export from your Godrej Interio dealer portal, Tally, or physical register containing the following 9 columns:',
  40, currentY, { width: 515 }
);
currentY += 25;

const invCols = [
  ['1. Godrej SKU / Item Code', 'Unique code for 1D/2D barcode labels (e.g. BED-MOD-001, SOF-LIV-002).'],
  ['2. Product Name & Model', 'Official furniture title displayed on invoices and Voice POS quotes.'],
  ['3. Product Category', 'Bedroom Suites, Recliner Sofas, Modular Wardrobes, Dining, Mattresses.'],
  ['4. Official MRP (INR)', 'Official manufacturer retail price printed on tags and quotations.'],
  ['5. Showroom Selling Price (INR)', 'Final standard customer billing price after standard showroom discount.'],
  ['6. Landed Factory Cost (INR)', 'Confidential purchase price to compute net margin (Owner PIN 8899 only).'],
  ['7. Warehouse Stock (Carton Units)', 'Exact quantity of knock-down cartons currently in back warehouse.'],
  ['8. Display Floor Stock (Units & Age)', 'Floor models + date of display to track >45 days aging markdown alerts.'],
  ['9. Safety Buffer Threshold', 'Minimum stock count (default: 2 units) before AutoProcure triggers factory PO.']
];

invCols.forEach(([col, desc]) => {
  doc.rect(40, currentY, 170, 18).fillAndStroke('#F8FAFC', '#E2E8F0');
  doc.rect(210, currentY, 345, 18).stroke();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text(col, 45, currentY + 5);
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(desc, 215, currentY + 5, { width: 335, lineBreak: false });
  currentY += 18;
});

currentY += 15;

// ==========================================
// SECTION 5: HARDWARE & PERIPHERALS
// ==========================================
drawSectionHeader('5. SHOWROOM HARDWARE & DEVICE CHECKLIST', '🖨️');

doc.rect(40, currentY, 140, 18).fill('#F1F5F9');
doc.rect(180, currentY, 210, 18).fill('#F1F5F9');
doc.rect(390, currentY, 165, 18).fill('#F1F5F9');

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text('DEVICE TYPE', 45, currentY + 5);
doc.text('MINIMUM SPECIFICATION', 185, currentY + 5);
doc.text('SHOWROOM MAKE & MODEL', 395, currentY + 5);
currentY += 18;

function drawHwRow(type, spec, userFill) {
  doc.rect(40, currentY, 140, 20).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
  doc.rect(180, currentY, 210, 20).stroke();
  doc.rect(390, currentY, 165, 20).stroke();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text(type, 45, currentY + 6);
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(spec, 185, currentY + 6, { width: 200, lineBreak: false });
  doc.fillColor('#000000').font('Helvetica').fontSize(8).text(userFill, 395, currentY + 6);
  currentY += 20;
}

drawHwRow('Handheld Barcode Scanner', '1D/2D USB or Bluetooth Laser Scanner', '___________________________');
drawHwRow('Thermal Receipt Printer', '3-inch (80mm) ESC/POS USB or Bluetooth', '___________________________');
drawHwRow('Office Laser Printer', 'Standard A4 Laser for Tax Invoices', '___________________________');
drawHwRow('Showroom Floor Tablet', 'Android 10+ Tablet or iPad (Chrome)', '___________________________');
drawHwRow('Driver Smartphone', 'Android phone for ePOD & Doorstep UPI', '___________________________');

currentY += 15;

// ==========================================
// SECTION 6: WHATSAPP & CLOUD ACCOUNTS
// ==========================================
drawSectionHeader('6. CLOUD, WHATSAPP & GOOGLE GEMINI AI CONFIGURATION', '🧠');

doc.rect(40, currentY, 160, 18).fill('#F1F5F9');
doc.rect(200, currentY, 190, 18).fill('#F1F5F9');
doc.rect(390, currentY, 165, 18).fill('#F1F5F9');

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text('SERVICE / INTEGRATION', 45, currentY + 5);
doc.text('RECOMMENDED SETUP', 205, currentY + 5);
doc.text('CLIENT SUBMISSION / CHOICE', 395, currentY + 5);
currentY += 18;

function drawCloudRow(svc, rec, choice) {
  doc.rect(40, currentY, 160, 22).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
  doc.rect(200, currentY, 190, 22).stroke();
  doc.rect(390, currentY, 165, 22).stroke();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text(svc, 45, currentY + 7);
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(rec, 205, currentY + 5, { width: 180 });
  doc.fillColor('#000000').font('Helvetica').fontSize(8).text(choice, 395, currentY + 7);
  currentY += 22;
}

drawCloudRow('WhatsApp Strategy', 'Option A: 1-Click wa.me Direct (₹0 cost, instant, no Meta approval required)', '[X] Option A (Direct wa.me)');
drawCloudRow('Dedicated Showroom Gmail', 'Google Account to own Master Sheet (14TqQ7LR5xSNppufWFhXDGo9hANC0JV_wRukc7HlIpaI)', '__________________@gmail.com');
drawCloudRow('Google Gemini AI Key', 'Free API key from aistudio.google.com (Powers Voice POS + 24/7 AI Concierge)', 'AIzaSy_____________________');
drawCloudRow('Weekly Backup Cloud Drive', 'Automated Sunday Drive Backup', '[X] Activated (Auto-Mirror)');

currentY += 25;

// ==========================================
// SIGN-OFF BLOCK
// ==========================================
doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(GOLD).lineWidth(1).stroke();
currentY += 15;

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9).text('HANDOVER ACCEPTANCE & AUTHORIZATION:', 40, currentY);
doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8).text('Total Agreed Commercial Value: ₹3,00,000 (INR Three Lakhs Only)', 40, currentY + 12);
doc.text('Token Advance Released (50%): ₹1,50,000  •  Balance Upon Complete Staff Go-Live: ₹1,50,000', 40, currentY + 24);

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9).text('STORE DIRECTOR SIGNATURE & SEAL:', 360, currentY);
doc.rect(360, currentY + 15, 190, 45).strokeColor('#94A3B8').lineWidth(0.5).stroke();
doc.fillColor('#94A3B8').font('Helvetica').fontSize(7.5).text('(Sign & Affix Firm Stamp)', 410, currentY + 35);

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ Master Production Implementation PDF successfully generated at: ${outputPath}`);
});

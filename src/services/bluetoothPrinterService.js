/**
 * ==============================================================================
 * OmniBuild OS™ — Hardware Bluetooth Thermal Receipt Printer Service
 * Supports:
 * - 3-Inch (80mm / 576 dots) and 2-Inch (58mm / 384 dots) Thermal POS Printers
 * - Standard ESC/POS Command Protocol
 * - Web Bluetooth GATT Serial Port Profile (SPP)
 * - Universal Thermal Web-Print Fallback for iOS Safari & Windows USB POS
 * ==============================================================================
 */

// Common Bluetooth Thermal Printer Service & Characteristic UUIDs
const PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Printer Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Generic Chinese Thermal Printer
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Serial
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / Common BLE SPP
  '0000af00-0000-1000-8000-00805f9b34fb'  // Android POS Terminal Service
];

let connectedDevice = null;
let writeCharacteristic = null;

/**
 * Checks if browser supports Web Bluetooth API
 */
export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * Checks if printer is currently connected
 */
export function isPrinterConnected() {
  return !!connectedDevice && connectedDevice.gatt && connectedDevice.gatt.connected && !!writeCharacteristic;
}

/**
 * Gets currently connected printer device name
 */
export function getConnectedPrinterName() {
  return connectedDevice ? (connectedDevice.name || 'Bluetooth Thermal Printer') : null;
}

/**
 * Scan and connect to nearby Bluetooth thermal receipt printer
 */
export async function connectBluetoothPrinter() {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth is not supported in this browser. Please use Android Chrome or Edge.');
  }

  try {
    console.log('🔍 [BLUETOOTH] Scanning for Bluetooth ESC/POS receipt printers...');
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES
    });

    if (!device) throw new Error('No Bluetooth printer selected');

    console.log(`📱 [BLUETOOTH] Connecting to GATT Server: ${device.name || device.id}`);
    const server = await device.gatt.connect();

    // Iterate through supported services to find the writable characteristic
    let char = null;
    for (const serviceUuid of PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const characteristics = await service.getCharacteristics();
        for (const c of characteristics) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            char = c;
            break;
          }
        }
        if (char) break;
      } catch (e) {
        // Continue searching other services
      }
    }

    if (!char) {
      throw new Error('Connected to device, but could not find an ESC/POS writable print channel.');
    }

    connectedDevice = device;
    writeCharacteristic = char;

    device.addEventListener('gattserverdisconnected', () => {
      console.warn('⚠️ [BLUETOOTH] Thermal printer disconnected');
      connectedDevice = null;
      writeCharacteristic = null;
    });

    console.log('✅ [BLUETOOTH] Thermal Receipt Printer Connected & Ready!');
    return {
      success: true,
      deviceName: device.name || 'ESC/POS Thermal Printer'
    };
  } catch (err) {
    console.error('❌ [BLUETOOTH] Connection failed:', err);
    throw err;
  }
}

/**
 * Disconnects current Bluetooth printer
 */
export async function disconnectBluetoothPrinter() {
  if (connectedDevice && connectedDevice.gatt.connected) {
    await connectedDevice.gatt.disconnect();
  }
  connectedDevice = null;
  writeCharacteristic = null;
  return { success: true };
}

/**
 * Converts text into ESC/POS binary buffer
 */
export function buildEscPosReceipt(order) {
  const ESC = 0x1B;
  const GS = 0x1D;

  const parts = [];

  // Helper to push raw ASCII string
  const text = (str) => {
    parts.push(Buffer ? Buffer.from(str, 'ascii') : new TextEncoder().encode(str));
  };

  // Helper to push raw bytes
  const bytes = (...b) => {
    parts.push(new Uint8Array(b));
  };

  // 1. Initialize Printer (ESC @)
  bytes(ESC, 0x40);

  // 2. Center Align (ESC a 1)
  bytes(ESC, 0x61, 0x01);

  // 3. Double Height & Width (GS ! 0x11) for Store Title
  bytes(GS, 0x21, 0x11);
  bytes(ESC, 0x45, 0x01); // Bold ON
  text("GODREJ INTERIO\n");
  bytes(GS, 0x21, 0x00); // Normal size
  text("SRI VINAYAKA FURNITURES\n");
  bytes(ESC, 0x45, 0x00); // Bold OFF
  text("Main Road, Near New Bus Stand, Rayagada\n");
  text("GSTIN: 21AAACS1234F1Z5 | Ph: +91 93905 53301\n");
  text("================================================\n");

  // 4. Left Align (ESC a 0)
  bytes(ESC, 0x61, 0x00);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  text(`Receipt Date: ${now}\n`);
  text(`Order ID:     ${order.order_id || order.Order_ID || 'ORD-LIVE'}\n`);
  text(`Customer:     ${order.customer_name || order.Customer_Name || 'Walk-in Guest'}\n`);
  text(`Phone:        ${order.customer_phone || order.Customer_Phone || 'N/A'}\n`);
  if (order.project_address || order.Project_Address) {
    text(`Address:      ${order.project_address || order.Project_Address}\n`);
  }
  text("------------------------------------------------\n");

  // 5. Table Header (48 chars for 3-inch/80mm, 32 chars for 2-inch/58mm)
  bytes(ESC, 0x45, 0x01); // Bold ON
  text("ITEM DESCRIPTION            QTY       AMOUNT INR\n");
  bytes(ESC, 0x45, 0x00); // Bold OFF
  text("------------------------------------------------\n");

  // 6. Line Items
  const items = order.items || [
    {
      name: order.product_name || order.Ordered_SKU || 'Godrej Interio Solid Teak / CRCA Unit',
      qty: order.qty || 1,
      price: order.total_amount_inr || order.Total_Amount_INR || 0
    }
  ];

  let totalAmt = 0;
  items.forEach(item => {
    const name = String(item.name || item.product_name || 'Furniture Item').padEnd(26).slice(0, 26);
    const qty = String(item.qty || 1).padStart(4);
    const amt = Number(item.price || item.Total_Amount_INR || 0);
    totalAmt += amt;
    const amtStr = (`₹` + amt.toLocaleString('en-IN')).padStart(16);
    text(`${name} ${qty} ${amtStr}\n`);
  });

  text("------------------------------------------------\n");

  // 7. Totals & Payment Summary (Right aligned)
  const total = Number(order.total_amount_inr || order.Total_Amount_INR || totalAmt);
  const advance = Number(order.advance_paid_inr || order.Advance_Paid_INR || 0);
  const balance = Math.max(0, total - advance);
  const cgst = Math.round(total * 0.09);
  const sgst = Math.round(total * 0.09);

  bytes(ESC, 0x61, 0x02); // Right Align
  text(`Taxable Value: ₹${(total - cgst - sgst).toLocaleString('en-IN')}\n`);
  text(`CGST (9.0%):   ₹${cgst.toLocaleString('en-IN')}\n`);
  text(`SGST (9.0%):   ₹${sgst.toLocaleString('en-IN')}\n`);
  bytes(ESC, 0x45, 0x01); // Bold ON
  text(`GROSS TOTAL:   ₹${total.toLocaleString('en-IN')}\n`);
  bytes(ESC, 0x45, 0x00); // Bold OFF
  text(`Advance Paid:  ₹${advance.toLocaleString('en-IN')} (${order.payment_mode || 'UPI'})\n`);
  
  if (balance > 0) {
    bytes(ESC, 0x45, 0x01);
    text(`BALANCE DUE:   ₹${balance.toLocaleString('en-IN')}\n`);
    bytes(ESC, 0x45, 0x00);
  } else {
    bytes(ESC, 0x45, 0x01);
    text(`PAYMENT STATUS: 100% PRE-PAID (SAFELOCKED)\n`);
    bytes(ESC, 0x45, 0x00);
  }

  // 8. Delivery & OTP Verification Box
  bytes(ESC, 0x61, 0x01); // Center Align
  text("================================================\n");
  text(`DELIVERY OTP CODE: [ ${order.otp_code || order.OTP_Code || '8899'} ]\n`);
  text(`Assigned Driver: ${order.assigned_driver || 'Tophan Gouda (Tata Ace OD-18-B-4491)'}\n`);
  text(`Carpenter SLA:   ${order.carpenter_assigned || 'Narayana Mistri (Lead Installer)'}\n`);
  text("================================================\n");

  // 9. Footer Terms & Thank You
  bytes(ESC, 0x45, 0x01);
  text("Thank you for choosing Godrej Interio!\n");
  bytes(ESC, 0x45, 0x00);
  text("10-Year Manufacturer Warranty | 0% Spot EMI\n");
  text("For Service & Assembly: +91 93905 53301\n");
  text("Generated by OmniBuild OS™ (Cloudflare Edge)\n\n\n");

  // 10. Paper Cut (GS V 0) or Feed lines
  bytes(0x1D, 0x56, 0x41, 0x03); // Feed 3 lines & Cut paper

  // Merge all byte buffers
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}

/**
 * Sends ESC/POS raw bytes in chunks to the Bluetooth characteristic
 */
export async function sendEscPosToBluetooth(bytes) {
  if (!isPrinterConnected()) {
    throw new Error('No Bluetooth printer connected. Please click "Pair Bluetooth Printer" first.');
  }

  // Split into chunks of 100 bytes (Bluetooth LE MTU safety limit)
  const CHUNK_SIZE = 100;
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, Math.min(i + CHUNK_SIZE, bytes.length));
    if (writeCharacteristic.writeValueWithoutResponse) {
      await writeCharacteristic.writeValueWithoutResponse(chunk);
    } else {
      await writeCharacteristic.writeValue(chunk);
    }
    // Tiny delay between packets
    await new Promise(res => setTimeout(res, 20));
  }
  return { success: true, bytesWritten: bytes.length };
}

/**
 * Universal 3-Inch (80mm) Thermal Web Print Fallback
 * Works on ANY browser (iOS Safari, Android Chrome, Windows POS desktop)
 */
export function printThermalReceiptWindow(order) {
  const total = Number(order.total_amount_inr || order.Total_Amount_INR || 0);
  const advance = Number(order.advance_paid_inr || order.Advance_Paid_INR || 0);
  const balance = Math.max(0, total - advance);
  const cgst = Math.round(total * 0.09);
  const sgst = Math.round(total * 0.09);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const printWindow = window.open('', '_blank', 'width=420,height=700');
  if (!printWindow) {
    alert('Please allow popups to open the 3-Inch Thermal Receipt print preview.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt — ${order.order_id || 'ORD'}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            width: 76mm;
            margin: 0 auto;
            padding: 8px 4px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #000000;
            line-height: 1.25;
            background: #FFFFFF;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .title { font-size: 14px; font-weight: 900; }
          .subtitle { font-size: 12px; font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          .double-divider { border-top: 1px double #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { text-align: left; border-bottom: 1px dashed #000; padding: 2px 0; font-size: 10px; }
          td { padding: 3px 0; vertical-align: top; }
          .otp-box {
            border: 2px dashed #000;
            padding: 6px;
            margin: 6px 0;
            text-align: center;
            font-weight: bold;
          }
          @media print {
            body { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">GODREJ INTERIO</div>
          <div class="subtitle">SRI VINAYAKA FURNITURES</div>
          <div>Main Road, Near New Bus Stand, Rayagada</div>
          <div>GSTIN: 21AAACS1234F1Z5 | Ph: +91 93905 53301</div>
        </div>
        <div class="double-divider"></div>
        <div><b>Date:</b> ${now}</div>
        <div><b>Order ID:</b> ${order.order_id || order.Order_ID || 'ORD-8921'}</div>
        <div><b>Customer:</b> ${order.customer_name || order.Customer_Name || 'Walk-in Customer'}</div>
        <div><b>Phone:</b> ${order.customer_phone || order.Customer_Phone || 'N/A'}</div>
        <div><b>Address:</b> ${order.project_address || order.Project_Address || 'Rayagada (OD)'}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th style="width: 55%;">ITEM</th>
              <th style="width: 15%; text-align: center;">QTY</th>
              <th style="width: 30%; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.product_name || order.Ordered_SKU || 'Godrej Interio Solid Teak / CRCA Unit'}</td>
              <td style="text-align: center;">${order.qty || 1}</td>
              <td style="text-align: right;">₹${total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="right">
          <div>Taxable Value: ₹${(total - cgst - sgst).toLocaleString('en-IN')}</div>
          <div>CGST (9%): ₹${cgst.toLocaleString('en-IN')}</div>
          <div>SGST (9%): ₹${sgst.toLocaleString('en-IN')}</div>
          <div class="bold" style="font-size: 13px; margin-top: 3px;">GROSS TOTAL: ₹${total.toLocaleString('en-IN')}</div>
          <div>Advance Paid: ₹${advance.toLocaleString('en-IN')} (${order.payment_mode || 'UPI'})</div>
          ${balance > 0 ? `<div class="bold" style="font-size: 12px; color: #b91c1c;">BALANCE DUE: ₹${balance.toLocaleString('en-IN')}</div>` : `<div class="bold">STATUS: 100% PRE-PAID</div>`}
        </div>
        <div class="double-divider"></div>
        <div class="otp-box">
          DELIVERY OTP: [ ${order.otp_code || order.OTP_Code || '8899'} ]<br>
          <span style="font-size: 9px; font-weight: normal;">Give OTP only upon complete assembly verification</span>
        </div>
        <div><b>Driver:</b> ${order.assigned_driver || 'Tophan Gouda (Tata Ace)'}</div>
        <div><b>Carpenter SLA:</b> ${order.carpenter_assigned || 'Narayana Mistri (24h SLA)'}</div>
        <div class="divider"></div>
        <div class="center" style="font-size: 10px; margin-top: 6px;">
          <div class="bold">Thank you for choosing Godrej Interio!</div>
          <div>10-Year Manufacturer Warranty | 0% Spot EMI</div>
          <div>Showroom Helpline: +91 93905 53301</div>
          <div style="font-size: 8.5px; margin-top: 4px; color: #555;">OmniBuild OS™ — Cloudflare Sovereign Edge</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

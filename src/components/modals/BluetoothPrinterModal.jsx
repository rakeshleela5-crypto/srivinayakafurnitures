import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  CheckCircle2, 
  FileText, 
  X, 
  RefreshCw, 
  Share2, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { 
  isBluetoothSupported, 
  isPrinterConnected, 
  getConnectedPrinterName, 
  connectBluetoothPrinter, 
  disconnectBluetoothPrinter, 
  buildEscPosReceipt, 
  sendEscPosToBluetooth, 
  printThermalReceiptWindow 
} from '../../services/bluetoothPrinterService';
import { playScanBeep, playSuccessChime } from '../../utils/audioUtils';

export function BluetoothPrinterModal({ isOpen, onClose, order = null }) {
  const [isSupported, setIsSupported] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [printerName, setPrinterName] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Default sample order if not passed
  const activeOrder = order || {
    order_id: 'ORD-8921',
    customer_name: 'Dr. Subhashish Jena',
    customer_phone: '94371 88291',
    project_address: 'Govt Medical Quarters, Rayagada',
    product_name: 'Godrej Kalista Hydraulic Storage King Bed',
    total_amount_inr: 95000,
    advance_paid_inr: 45000,
    payment_mode: 'UPI (Doorstep VPA)',
    otp_code: '8899',
    assigned_driver: 'Tophan Gouda (Tata Ace OD-18-B-4491)',
    carpenter_assigned: 'Narayana Mistri (Lead Installer)'
  };

  useEffect(() => {
    setIsSupported(isBluetoothSupported());
    setIsConnected(isPrinterConnected());
    setPrinterName(getConnectedPrinterName());
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConnect = async () => {
    setErrorMsg(null);
    setIsConnecting(true);
    playScanBeep();

    try {
      const result = await connectBluetoothPrinter();
      setIsConnected(true);
      setPrinterName(result.deviceName);
      playSuccessChime();
      showToast(`Connected to ${result.deviceName}!`);
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        setErrorMsg(err.message || 'Failed to connect to Bluetooth printer');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectBluetoothPrinter();
    setIsConnected(false);
    setPrinterName(null);
    playScanBeep();
    showToast('Bluetooth printer disconnected.');
  };

  const handlePrintBluetooth = async () => {
    if (!isConnected) {
      handleConnect();
      return;
    }
    setErrorMsg(null);
    setIsPrinting(true);
    playScanBeep();

    try {
      const escPosBytes = buildEscPosReceipt(activeOrder);
      await sendEscPosToBluetooth(escPosBytes);
      playSuccessChime();
      showToast('3-Inch receipt printed via Bluetooth!');
    } catch (err) {
      setErrorMsg(err.message || 'Printing failed. Please ensure the printer is turned on.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleUniversalPrint = () => {
    playScanBeep();
    printThermalReceiptWindow(activeOrder);
    showToast('Opened 3-Inch Thermal System Print Preview');
  };

  const handleCopySlip = () => {
    playScanBeep();
    const text = `🧾 *GODREJ INTERIO RAYAGADA — 3" THERMAL POS SLIP*\nOrder: ${activeOrder.order_id}\nCustomer: ${activeOrder.customer_name} (${activeOrder.customer_phone})\nItem: ${activeOrder.product_name}\nGross Total: ₹${Number(activeOrder.total_amount_inr).toLocaleString('en-IN')}\nAdvance Paid: ₹${Number(activeOrder.advance_paid_inr).toLocaleString('en-IN')}\nBalance Due: ₹${(Number(activeOrder.total_amount_inr) - Number(activeOrder.advance_paid_inr)).toLocaleString('en-IN')}\nDelivery OTP: ${activeOrder.otp_code || '8899'}\nShowroom Helpline: +91 93905 53301`;
    navigator.clipboard.writeText(text);
    showToast('Receipt copied to clipboard for WhatsApp!');
  };

  const total = Number(activeOrder.total_amount_inr || 0);
  const advance = Number(activeOrder.advance_paid_inr || 0);
  const balance = Math.max(0, total - advance);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10001,
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px',
          fontWeight: '700',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{
        background: '#121620',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A'
            }}>
              <Printer size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                  HARDWARE INTEGRATION • 3-INCH ESC/POS
                </span>
                <span style={{
                  background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: isConnected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: isConnected ? '#34D399' : '#F87171',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '800'
                }}>
                  {isConnected ? `CONNECTED: ${printerName}` : 'DISCONNECTED'}
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                Bluetooth Thermal Receipt Printer (80mm)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Left Controls, Right 3-Inch Thermal Paper Roll */}
        <div style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '24px'
        }}>
          {/* Left Column: Device Connection & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Bluetooth Status Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>
                  Hardware Bluetooth Connectivity
                </span>
                <span style={{ fontSize: '11px', color: isSupported ? '#10B981' : '#F59E0B' }}>
                  {isSupported ? 'Web Bluetooth Supported' : 'Fallback Mode Active'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isConnected ? (
                  <button
                    onClick={handleDisconnect}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#F87171',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <BluetoothOff size={15} />
                    <span>Disconnect {printerName}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Bluetooth size={16} />
                    <span>{isConnecting ? 'Searching Printers...' : 'Pair Bluetooth Thermal Printer'}</span>
                  </button>
                )}
              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#FCA5A5',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Print Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handlePrintBluetooth}
                disabled={isPrinting}
                style={{
                  background: isConnected
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
                  border: 'none',
                  color: isConnected ? '#FFFFFF' : '#0F172A',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                <Printer size={18} />
                <span>
                  {isPrinting ? 'Sending ESC/POS Bytes...' : (isConnected ? '🖨️ Send to Bluetooth Printer (ESC/POS)' : 'Pair & Print Bluetooth Slip')}
                </span>
              </button>

              <button
                onClick={handleUniversalPrint}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#F1F5F9',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={15} />
                <span>📄 Universal 3-Inch Thermal Print (iOS Safari & USB)</span>
              </button>

              <button
                onClick={handleCopySlip}
                style={{
                  background: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#25D366',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Share2 size={15} />
                <span>📋 Copy 3-Inch Text Slip for WhatsApp</span>
              </button>
            </div>

            {/* Hardware Guide Note */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '11px',
              color: '#CBD5E1',
              lineHeight: 1.5
            }}>
              <b>💡 Supported Hardware:</b> Works with any 80mm (3-Inch) or 58mm (2-Inch) wireless Bluetooth receipt printer (Everycom, TVS, Epson, Bluetooth POS). Simply turn on the printer, ensure Bluetooth is enabled on your phone/tablet, and click <b>Pair Bluetooth</b>.
            </div>

          </div>

          {/* Right Column: Realistic 3-Inch (80mm) Thermal Paper Slip Preview */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', textAlign: 'center' }}>
              🧾 3-INCH (80mm) THERMAL PAPER PREVIEW
            </div>

            <div style={{
              background: '#FFFFFF',
              color: '#000000',
              borderRadius: '4px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
              padding: '16px 12px',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '10px',
              lineHeight: 1.25,
              position: 'relative',
              borderTop: '3px solid #E2E8F0'
            }}>
              {/* Top Perforated Edge Visual */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900' }}>GODREJ INTERIO</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>SRI VINAYAKA FURNITURES</div>
                <div style={{ fontSize: '9px' }}>Main Road, Near New Bus Stand, Rayagada</div>
                <div style={{ fontSize: '8.5px' }}>GSTIN: 21AAACS1234F1Z5 | Ph: 93905 53301</div>
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

              <div><b>Date:</b> {new Date().toLocaleDateString('en-IN')}</div>
              <div><b>Order ID:</b> {activeOrder.order_id}</div>
              <div><b>Customer:</b> {activeOrder.customer_name}</div>
              <div><b>Phone:</b> {activeOrder.customer_phone}</div>
              {activeOrder.project_address && (
                <div><b>Address:</b> {activeOrder.project_address}</div>
              )}

              <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '9.5px' }}>
                <span>ITEM</span>
                <span>QTY</span>
                <span>AMOUNT</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span style={{ maxWidth: '140px' }}>{activeOrder.product_name}</span>
                <span>1</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

              <div style={{ textAlign: 'right' }}>
                <div>Taxable: ₹{Math.round(total * 0.82).toLocaleString('en-IN')}</div>
                <div>CGST 9%: ₹{Math.round(total * 0.09).toLocaleString('en-IN')}</div>
                <div>SGST 9%: ₹{Math.round(total * 0.09).toLocaleString('en-IN')}</div>
                <div style={{ fontWeight: 'bold', fontSize: '11.5px', marginTop: '2px' }}>
                  GROSS: ₹{total.toLocaleString('en-IN')}
                </div>
                <div>Advance: ₹{advance.toLocaleString('en-IN')} ({activeOrder.payment_mode})</div>
                <div style={{ fontWeight: 'bold', color: balance > 0 ? '#b91c1c' : '#000' }}>
                  {balance > 0 ? `BAL DUE: ₹${balance.toLocaleString('en-IN')}` : 'STATUS: 100% PRE-PAID'}
                </div>
              </div>

              <div style={{ borderTop: '1px double #000', margin: '6px 0' }} />

              <div style={{
                border: '1px dashed #000',
                padding: '4px',
                textAlign: 'center',
                margin: '4px 0',
                fontWeight: 'bold'
              }}>
                DELIVERY OTP: [ {activeOrder.otp_code || '8899'} ]
              </div>

              <div style={{ fontSize: '8.5px' }}><b>Driver:</b> {activeOrder.assigned_driver}</div>
              <div style={{ fontSize: '8.5px' }}><b>Carpenter:</b> {activeOrder.carpenter_assigned}</div>

              <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

              <div style={{ textAlign: 'center', fontSize: '8.5px' }}>
                <b>Thank you for choosing Godrej Interio!</b><br />
                10-Year Warranty | 0% Spot EMI<br />
                Rayagada Flagship Helpline: +91 93905 53301
              </div>

              {/* Bottom paper tear serration */}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: 0,
                right: 0,
                height: '6px',
                background: 'radial-gradient(circle, transparent, transparent 50%, #121620 50%, #121620 100%)',
                backgroundSize: '10px 10px'
              }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
export default BluetoothPrinterModal;

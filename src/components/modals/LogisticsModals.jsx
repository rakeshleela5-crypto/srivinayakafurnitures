import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DynamicQrCode } from '../../utils/qrcodeGenerator';
import { X, Check, Truck, Navigation, Star, Camera, MessageSquare, AlertTriangle, QrCode, Printer } from 'lucide-react';

export function DigitalEpodModal({ isOpen, onClose, stop = {} }) {
  const { submitEpodDelivery, showToast } = useStore();
  const [csat, setCsat] = useState(5);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [otpCode, setOtpCode] = useState(stop.Order_ID ? stop.Order_ID.replace('ORD-', '') : '8921');
  const [amountCollected, setAmountCollected] = useState(stop.Amount_Due || 78247);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDrawn(false);
    }
  };

  const handleCanvasDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setSignatureDrawn(true);
  };

  const handleSubmit = () => {
    submitEpodDelivery(stop.Order_ID || "ORD-8921", {
      customerName: stop.Customer_Name || "Customer",
      driverName: "Tophan Gouda",
      vehicle: "Tata Ace OD-18-A-1234",
      csat: `${csat}.0 ⭐`,
      geotag: "19.1724° N, 83.4163° E (Rayagada)",
      amountCollected: Number(amountCollected)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🚚 Digital ePOD & Customer Sign-Off ({stop.Order_ID})</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--accent-emerald)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{stop.Customer_Name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stop.Address} • {stop.Items}</div>
            </div>
            <span className="badge badge-emerald">GPS LOCKED 📍</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--accent-emerald)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
            🛰️ GeoTag: 19.1724° N, 83.4163° E (Near Gayatri Nagar Villa)
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Customer Delivery 4-Digit OTP</label>
            <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '16px', letterSpacing: '4px' }} />
          </div>
          <div className="form-field">
            <label>Balance Due at Doorstep (₹)</label>
            <input type="number" value={amountCollected} onChange={e => setAmountCollected(Number(e.target.value))} />
          </div>
        </div>

        {/* 📱 1-Tap Doorstep Dynamic UPI QR Code */}
        <div style={{ background: '#030712', border: '1.5px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              📱 Doorstep Dynamic UPI Collection
            </div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
              ₹{Number(amountCollected).toLocaleString()}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
              Scan with GPay / PhonePe / Paytm to settle balance instantly.
            </div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DynamicQrCode 
              value={`upi://pay?pa=9390553301@ybl&pn=Godrej%20Interio%20Rayagada&am=${amountCollected}&cu=INR&tn=Doorstep%20Balance%20${stop.Order_ID || 'ORD-8921'}`}
              size={64}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Customer Experience Rating (CSAT)
          </label>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', background: '#030712', padding: '10px', borderRadius: '10px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                type="button" 
                onClick={() => setCsat(star)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px' }}
              >
                {star <= csat ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
              Customer Digital Signature Pad
            </label>
            <button type="button" onClick={handleClearSignature} style={{ fontSize: '10px', background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontWeight: '700' }}>
              Clear Signature
            </button>
          </div>
          <canvas 
            ref={canvasRef}
            width={480}
            height={110}
            onMouseDown={(e) => {
              const ctx = canvasRef.current.getContext('2d');
              ctx.beginPath();
              handleCanvasDraw(e);
            }}
            onMouseMove={(e) => {
              if (e.buttons === 1) handleCanvasDraw(e);
            }}
            onTouchMove={handleCanvasDraw}
            style={{ width: '100%', height: '110px', background: '#030712', border: '1.5px dashed rgba(212,175,55,0.4)', borderRadius: '10px', touchAction: 'none' }}
          />
        </div>

        <button className="btn-emerald" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          <Check size={16} /> Submit Verified ePOD & Release Goods (₹{Number(amountCollected).toLocaleString()})
        </button>
      </div>
    </div>
  );
}

export function SmsDispatchModal({ isOpen, onClose, stop = {} }) {
  const { showToast } = useStore();
  const [phone, setPhone] = useState(stop.Customer_Phone || "9437188291");
  const [otp, setOtp] = useState("8921");
  const [driver, setDriver] = useState("Tophan Gouda (+91 94371 55667)");

  if (!isOpen) return null;

  const handleSend = (channel) => {
    showToast(`📱 4-Digit Delivery OTP #${otp} dispatched via ${channel} to ${phone}!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3><MessageSquare size={18} color="var(--accent-cyan)" /> Dispatch Delivery OTP to Customer</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Customer Mobile / WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Secure 4-Digit Delivery OTP</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} style={{ fontFamily: 'JetBrains Mono', fontWeight: '900', textAlign: 'center', fontSize: '16px' }} />
          </div>
        </div>

        <div style={{ background: '#030712', padding: '14px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <strong style={{ color: '#25D366' }}>💬 WhatsApp Preview:</strong><br />
          "Namaskar! Your Godrej Interio Rayagada furniture delivery is on the way with driver {driver}. Share OTP <b>{otp}</b> with the driver only after inspecting all carton boxes."
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-emerald" onClick={() => handleSend('WhatsApp Live')} style={{ flex: 1, justifyContent: 'center' }}>
            Send WhatsApp OTP
          </button>
          <button className="btn-cyan" onClick={() => handleSend('SMS Gateway')} style={{ flex: 1, justifyContent: 'center' }}>
            Send SMS OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditFleetDriverModal({ isOpen, onClose, driver = {} }) {
  const { drivers, setDrivers, showToast } = useStore();
  const [name, setName] = useState(driver.Name || '');
  const [phone, setPhone] = useState(driver.Phone || '');
  const [vehicle, setVehicle] = useState(driver.Vehicle || 'Tata Ace (OD-18-A-1234)');
  const [route, setRoute] = useState(driver.Route || 'Rayagada Town & Gayatri Nagar');

  if (!isOpen) return null;

  const handleSave = () => {
    if (driver.Driver_ID) {
      setDrivers(prev => prev.map(d => d.Driver_ID === driver.Driver_ID ? { ...d, Name: name, Phone: phone, Vehicle: vehicle, Route: route } : d));
    } else {
      const newD = {
        Driver_ID: `DRV-0${drivers.length + 1}`,
        Name: name || "New Driver",
        Phone: phone || "9437000000",
        Vehicle: vehicle,
        Route: route,
        Capacity_KG: "1200 kg",
        Status: "AVAILABLE_DOCK",
        CSAT: "5.0 ⭐"
      };
      setDrivers([...drivers, newD]);
    }
    showToast(`Driver profile updated!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🚚 {driver.Driver_ID ? `Edit Driver ${driver.Name}` : '➕ Add New Fleet Driver'}</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Driver Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tophan Gouda" />
          </div>
          <div className="form-field">
            <label>Driver Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9437155667" />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Vehicle Make & Plate Number</label>
            <input value={vehicle} onChange={e => setVehicle(e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Assigned Delivery Route Sector</label>
            <input value={route} onChange={e => setRoute(e.target.value)} />
          </div>
        </div>

        <button className="btn-luxury-gold" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Save Driver Record
        </button>
      </div>
    </div>
  );
}

export function WarehouseWallPosterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3><Printer size={18} color="var(--accent-gold)" /> Warehouse Inward Wall Poster (Printable QR)</h3>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            GODREJ INTERIO RAYAGADA FLAGSHIP
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '4px' }}>
            CENTRAL WAREHOUSE INWARD UNLOADING DOCK
          </div>
          
          <div style={{ display: 'inline-block', padding: '20px', background: '#F8FAFC', border: '3px dashed #000000', borderRadius: '16px', margin: '24px 0' }}>
            <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '12px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DynamicQrCode value="https://shreeganesh-godrej.web.app/#inward" size={180} fgColor="#000000" />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', marginTop: '12px', color: '#000000' }}>
              SCAN TO LAUNCH DOCK INWARD SCANNER APP
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#334155', maxWidth: '440px', margin: '0 auto', lineHeight: '1.4' }}>
            Staff Instruction: Scan this wall poster with your phone camera upon factory truck arrival. Inspect all 5 component boxes before signing gate-pass.
          </div>
        </div>

        <button className="btn-luxury-gold no-print" onClick={() => window.print()} style={{ width: '100%', justifyContent: 'center' }}>
          <Printer size={16} /> Print Wall Poster (A4 Sheet)
        </button>
      </div>
    </div>
  );
}

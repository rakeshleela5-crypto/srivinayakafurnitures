import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DynamicQrCode } from '../utils/qrcodeGenerator';
import { 
  QrCode, 
  Printer, 
  Smartphone, 
  Truck, 
  Barcode, 
  CreditCard, 
  Share2, 
  Wifi, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

export function StaffQrHubView() {
  const { storeMeta } = useStore();

  const getProductionHost = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'https://shreeganesh-godrej.web.app';
      }
      return window.location.origin;
    }
    return 'https://shreeganesh-godrej.web.app';
  };

  const [customHost, setCustomHost] = useState(getProductionHost());

  const qrPortals = [
    {
      id: 'inward_scanner',
      title: 'DOCK 1: INWARD FACTORY SCANNER',
      badge: 'UNLOADING BAY (RECEIPTS)',
      badgeColor: 'badge-emerald',
      icon: '📦',
      description: 'Scan to verify incoming 5-box furniture shipments from factory trucks & auto-increment warehouse stock.',
      url: `${customHost}/#inward`,
      targetGroup: 'Warehouse Inward Dock Staff'
    },
    {
      id: 'outward_scanner',
      title: 'DOCK 2: OUTWARD DISPATCH SCANNER',
      badge: 'LOADING BAY (DISPATCH)',
      badgeColor: 'badge-amber',
      icon: '🚚',
      description: 'Scan to verify customer delivery cartons into Tata Ace/Bolero with Anti-Partial Load Lock & Gate Pass release.',
      url: `${customHost}/#outward`,
      targetGroup: 'Warehouse Loading & Gate Security'
    },
    {
      id: 'driver_epod',
      title: 'DRIVER DESK: MOBILE DELIVERY ePOD',
      badge: 'FLEET & DRIVERS',
      badgeColor: 'badge-cyan',
      icon: '📱',
      description: 'Scan to open Driver Doorstep Delivery Manifest with 4-Digit OTP & Customer Digital Signature Pad.',
      url: `${customHost}/#logistics`,
      targetGroup: 'Delivery Drivers & Carpenters'
    },
    {
      id: 'barcode_studio',
      title: 'STICKER DESK: CODE-128 BARCODE STUDIO',
      badge: 'LABEL PRINTER',
      badgeColor: 'badge-purple',
      icon: '🏷️',
      description: 'Scan to generate carton barcode stickers, 5-box knockdown labels & showroom acrylic standee price tags.',
      url: `${customHost}/#barcode`,
      targetGroup: 'Inventory Packaging & Labelling'
    },
    {
      id: 'upi_payment',
      title: 'CASH COUNTER: INSTANT UPI POS',
      badge: 'INSTANT ADVANCE / SETTLEMENT',
      badgeColor: 'badge-gold',
      icon: '💳',
      description: `Scan with Google Pay, PhonePe, Paytm, or BHIM to pay 50% advance token directly to ${storeMeta.upiVpa}.`,
      url: `upi://pay?pa=${storeMeta.upiVpa}&pn=Godrej%20Interio%20Rayagada&am=78247&cu=INR`,
      targetGroup: 'Showroom Customers & Cashier'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">📱 DEDICATED STAFF MOBILE QR LAUNCHPAD</span>
          <button className="btn-luxury-gold no-print" onClick={() => window.print()}>
            <Printer size={14} /> Print Warehouse Wall Poster (A4 / A3)
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#030712', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Wifi size={13} color="var(--accent-cyan)" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Host Base URL:</span>
            <input 
              value={customHost} 
              onChange={e => setCustomHost(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '11.5px', fontFamily: 'JetBrains Mono', outline: 'none', width: '180px' }}
            />
          </div>
        </div>
      </div>

      {/* Main Printable Wall Poster Canvas */}
      <div className="glass-panel printable-area" style={{ padding: '24px' }}>
        
        {/* Poster Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(212,175,55,0.3)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold)', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
            🏛️ GODREJ INTERIO RAYAGADA FLAGSHIP WAREHOUSE & SHOWROOM
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', marginTop: '8px' }}>
            📱 Staff & Driver Quick-Scan Mobile Launchpad
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Point any smartphone camera at the specific QR code below to launch the dedicated tool instantly. Zero login required!
          </p>
        </div>

        {/* 5 Distinct QR Code Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {qrPortals.map(portal => (
            <div 
              key={portal.id}
              style={{
                background: '#030712',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}
            >
              {/* Top Badge */}
              <span className={`badge ${portal.badgeColor}`} style={{ fontSize: '10px', fontWeight: '900' }}>
                {portal.badge}
              </span>

              {/* Title & Icon */}
              <div>
                <div style={{ fontSize: '22px' }}>{portal.icon}</div>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
                  {portal.title}
                </h4>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Target: <b>{portal.targetGroup}</b>
                </div>
              </div>

              {/* Real Scannable Vector QR Code */}
              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', border: '2px solid var(--accent-gold)' }}>
                <DynamicQrCode value={portal.url} size={140} fgColor="#000000" bgColor="#FFFFFF" />
              </div>

              {/* Explanation Text */}
              <div style={{ fontSize: '11px', color: '#CBD5E1', lineHeight: '1.4', minHeight: '44px' }}>
                {portal.description}
              </div>

              {/* Link button (for desktop testing) */}
              <a 
                href={portal.url} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-ghost-edit no-print"
                style={{ fontSize: '10.5px', padding: '5px 12px', width: '100%', justifyContent: 'center' }}
              >
                <ExternalLink size={12} /> Open Directly in New Tab
              </a>
            </div>
          ))}
        </div>

        {/* Poster Bottom Notice */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Godrej Interio Rayagada Central Warehouse • Main Road Unloading Docks • System Integrated with Google Apps Script 2-Way Webhook
        </div>

      </div>

    </div>
  );
}

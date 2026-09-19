// OmniBuild OS™ — ISO/IEC 18004 Standard Compliant QR Code Generator Engine
// Renders to Canvas element directly for 100% XSS immunity & crisp scannability

import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function DynamicQrCode({ value, size = 140, fgColor = "#000000", bgColor = "#FFFFFF", margin = 1 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    setError(false);
    QRCode.toCanvas(canvasRef.current, String(value), {
      margin: margin,
      color: {
        dark: fgColor,
        light: bgColor
      },
      errorCorrectionLevel: 'M',
      width: size
    }).catch(err => {
      console.error("QR Code Canvas Render Error:", err);
      setError(true);
    });
  }, [value, size, fgColor, bgColor, margin]);

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        background: bgColor, 
        padding: '6px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: `${size}px`,
        height: `${size}px`,
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {error ? (
        <div style={{ fontSize: '10px', color: '#EF4444', fontFamily: 'sans-serif', textAlign: 'center' }}>QR Error</div>
      ) : (
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
        />
      )}
    </div>
  );
}

// Helper to extract matrix for canvas or low-level rendering if needed
export function generateQrMatrix(text) {
  try {
    const qr = QRCode.create(text || 'https://shreeganesh-godrej.web.app', { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const matrix = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        row.push(qr.modules.get(r, c) ? 1 : 0);
      }
      matrix.push(row);
    }
    return matrix;
  } catch (e) {
    return Array.from({ length: 21 }, () => Array(21).fill(0));
  }
}

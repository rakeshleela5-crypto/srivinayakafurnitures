import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Code128Barcode } from '../utils/barcode128';
import { DynamicQrCode } from '../utils/qrcodeGenerator';
import { 
  Barcode, 
  Camera, 
  Sun, 
  Moon, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  RotateCcw,
  Truck,
  Box,
  Zap,
  Flashlight,
  Video,
  VideoOff,
  Image as ImageIcon,
  Edit,
  Save,
  X,
  Trash2,
  Maximize2,
  Printer,
  ShieldCheck,
  Tag,
  Sliders
} from 'lucide-react';
import { playScanBeep, playSuccessChime, playSafeLockSound, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function StaffInwardScannerView() {
  const { catalog, inventory, adjustStock, showToast } = useStore();

  const [sunnyMode, setSunnyMode] = useState(false);
  const [scannedInput, setScannedInput] = useState('');
  const [selectedPoSku, setSelectedPoSku] = useState('BED-MOD-001');
  const [inwardQuantity, setInwardQuantity] = useState(2);
  const [batchNo, setBatchNo] = useState(`BATCH-GI-${new Date().getFullYear()}-0881`);
  const [storageBay, setStorageBay] = useState('Dock-A1');
  const [supplierNotes, setSupplierNotes] = useState('Factory shipment via Century Logistics truck #OD-02-C-9988');

  // Camera & Media Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [damageSnapshots, setDamageSnapshots] = useState([]);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Edit Shipment Header Drawer
  const [isEditingShipment, setIsEditingShipment] = useState(false);

  // Granular Box-by-Box Component Array with In-Depth Fields
  const [customBoxes, setCustomBoxes] = useState([
    { 
      id: 'A', 
      name: 'Teak Headboard & Hydraulic Assembly Frame', 
      weight: 38.5, 
      dimensions: '82" × 48" × 8"', 
      condition: 'INTACT_OK', // 'INTACT_OK' | 'OUTER_TORN' | 'INTERNAL_DAMAGE' | 'SHORTAGE_MISSING'
      notes: 'Carved teak headboard with pre-installed hydraulic lift brackets',
      barcode: 'SK-BED-01-A'
    },
    { 
      id: 'B', 
      name: 'Solid Teak Side Rails & Footboard', 
      weight: 29.0, 
      dimensions: '78" × 12" × 6"', 
      condition: 'INTACT_OK',
      notes: 'Dual side runners with teak polish wrap',
      barcode: 'SK-BED-01-B'
    },
    { 
      id: 'C', 
      name: 'Heavy-Duty Metal Slats & Frame Grid', 
      weight: 24.5, 
      dimensions: '76" × 70" × 4"', 
      condition: 'INTACT_OK',
      notes: 'Powder-coated steel cross-members with noise-dampening rubber caps',
      barcode: 'SK-BED-01-C'
    },
    { 
      id: 'D', 
      name: 'Gas-Lift Shock Absorbers & Hardware Kit', 
      weight: 8.2, 
      dimensions: '18" × 12" × 6"', 
      condition: 'INTACT_OK',
      notes: 'Pair of 250N gas pistons + Allen key bolts pouch #HK-89',
      barcode: 'SK-BED-01-D'
    },
    { 
      id: 'E', 
      name: 'Water-Resistant Engineered Mattress Base', 
      weight: 19.0, 
      dimensions: '76" × 36" × 3"', 
      condition: 'INTACT_OK',
      notes: 'Marine-grade pre-laminated base board with breathability vents',
      barcode: 'SK-BED-01-E'
    }
  ]);

  const [verifiedBoxes, setVerifiedBoxes] = useState(['A', 'B']);
  const [editingBoxIndex, setEditingBoxIndex] = useState(null); // Index of box currently being edited in modal/drawer

  const activeProduct = catalog.find(c => c.SKU === selectedPoSku) || catalog[0];

  // Calculate Total Knockdown Weight
  const totalKnockdownWeight = customBoxes.reduce((sum, b) => sum + (Number(b.weight) || 0), 0);

  // Camera Stream Lifecycle & Real-Time Barcode Detector
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing = cameraFacing) => {
    try {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
        playScanBeep();
        showToast("📷 Live Smartphone Barcode Camera Active! Aim at carton barcode.", true);

        // Start continuous live barcode detection loop
        startLiveBarcodeScanner();
      } else {
        showToast("⚠️ Camera device not detected. Barcode laser gun & manual mode active.");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      showToast("⚠️ Camera permission required. Simulation scanner mode active.");
      setIsCameraActive(true);
    }
  };

  const flipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
    showToast(`🔄 Switched to ${nextFacing === 'environment' ? 'Rear Main Camera' : 'Front Camera'}`);
  };

  const startLiveBarcodeScanner = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8', 'upc_a', 'data_matrix']
        });

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const raw = barcodes[0].rawValue;
                if (raw) {
                  handleProcessBarcodeScan(raw);
                }
              }
            } catch (e) {
              // Frame scan cycle
            }
          }
        }, 350);
      } catch (e) {
        console.warn("BarcodeDetector initialization failed, using standard video stream:", e);
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (mediaStreamRef.current) {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      if (track && track.applyConstraints) {
        try {
          const nextState = !isTorchOn;
          await track.applyConstraints({
            advanced: [{ torch: nextState }]
          });
          setIsTorchOn(nextState);
          showToast(nextState ? "🔦 Warehouse Camera Torch ON" : "🔦 Torch OFF");
        } catch (e) {
          setIsTorchOn(!isTorchOn);
          showToast("🔦 Torch toggled");
        }
      }
    } else {
      setIsTorchOn(!isTorchOn);
      showToast(isTorchOn ? "🔦 Torch OFF" : "🔦 Warehouse Camera Torch ON");
    }
  };

  const captureDamageSnapshot = () => {
    playScanBeep();
    let realDataUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400";

    // Grab real frame from active video element
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        realDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      } catch (e) {
        console.error("Frame capture error:", e);
      }
    }

    const newSnapshot = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      label: `Carton Damage Photo #${damageSnapshots.length + 1}`,
      dataUrl: realDataUrl
    };
    setDamageSnapshots(prev => [newSnapshot, ...prev]);
    showToast("📸 Real Camera Snapshot captured & attached to damage report!", true);
  };

  // Process live camera or gun barcode
  const handleProcessBarcodeScan = (raw) => {
    if (!raw) return;
    const val = raw.trim().toUpperCase();

    const matchedBox = customBoxes.find(b => 
      val.includes(`BOX-${b.id}`) || 
      val.includes(`-${b.id}`) || 
      val === b.id || 
      val.endsWith(b.id) || 
      val === b.barcode
    );

    if (matchedBox) {
      if (!verifiedBoxes.includes(matchedBox.id)) {
        setVerifiedBoxes(prev => [...prev, matchedBox.id]);
        playScanBeep();
        showToast(`📦 Box ${matchedBox.id} (${matchedBox.name}) Verified!`, true);
      }
    } else if (val.includes(selectedPoSku)) {
      setVerifiedBoxes(customBoxes.map(b => b.id));
      playScanBeep();
      playSuccessChime();
      showToast(`🎯 Full SKU ${selectedPoSku} scanned! All ${customBoxes.length} boxes verified.`);
    }
  };

  // Barcode Gun / Input Handler
  const handleScanSubmit = (e) => {
    e?.preventDefault();
    if (!scannedInput.trim()) return;

    handleProcessBarcodeScan(scannedInput);
    setScannedInput('');
  };

  const toggleManualBox = (boxId) => {
    if (verifiedBoxes.includes(boxId)) {
      setVerifiedBoxes(prev => prev.filter(id => id !== boxId));
      showToast(`Box ${boxId} unmarked.`);
    } else {
      setVerifiedBoxes(prev => [...prev, boxId]);
      playScanBeep();
      showToast(`Box ${boxId} manually verified ✓`);
    }
  };

  const handle1ClickScanAll = () => {
    playScanBeep();
    setVerifiedBoxes(customBoxes.map(b => b.id));
    playSuccessChime();
    showToast(`⚡ 1-Click Scan All: ${customBoxes.length}/${customBoxes.length} Boxes Verified!`);
  };

  // Add / Remove Custom Box Component
  const handleAddBox = () => {
    const nextLetter = String.fromCharCode(65 + customBoxes.length);
    const newBox = {
      id: nextLetter,
      name: `Custom Knockdown Unit ${customBoxes.length + 1}`,
      weight: 15.0,
      dimensions: '36" × 24" × 6"',
      condition: 'INTACT_OK',
      notes: 'Additional component kit',
      barcode: `SK-${selectedPoSku.substring(0, 7)}-${nextLetter}`
    };
    setCustomBoxes(prev => [...prev, newBox]);
    showToast(`➕ Added Component Box ${nextLetter} (${newBox.weight} KG)`);
  };

  const handleRemoveBox = (boxId) => {
    setCustomBoxes(prev => prev.filter(b => b.id !== boxId));
    setVerifiedBoxes(prev => prev.filter(id => id !== boxId));
    showToast(`🗑️ Removed Component Box ${boxId}`);
  };

  // Update specific box fields
  const handleUpdateBoxField = (index, field, value) => {
    setCustomBoxes(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // 1-Click Print Single Box Label
  const handlePrintSingleBox = (box) => {
    playScanBeep();
    showToast(`🖨️ Printing Barcode & QR Label for Box ${box.id} (${box.name})...`, true);
    window.print();
  };

  // Complete Inward Action
  const handleCompleteInward = () => {
    const missingBoxes = customBoxes.filter(b => b.condition === 'SHORTAGE_MISSING' || !verifiedBoxes.includes(b.id));
    const damagedBoxes = customBoxes.filter(b => b.condition === 'INTERNAL_DAMAGE');

    if (missingBoxes.length > 0 && !window.confirm(`⚠️ ${missingBoxes.length} box(es) are missing/unverified. Accept partial inward?`)) {
      return;
    }

    adjustStock(selectedPoSku, inwardQuantity, 0, `Factory Truck Inward QC: +${inwardQuantity} sets (${batchNo}) received & verified`);
    playSafeLockSound();
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🎉 Inward QC Complete! +${inwardQuantity} Sets of ${selectedPoSku} (${totalKnockdownWeight} KG) added to ${storageBay}!`, true);

    dispatchWebhookAction('INWARD_STOCK_SCAN', {
      sku: selectedPoSku,
      quantity: inwardQuantity,
      batch_no: batchNo,
      storage_bay: storageBay,
      supplier_notes: supplierNotes,
      total_weight_kg: totalKnockdownWeight,
      dock_worker: "Warehouse Dock Supervisor (Rayagada)",
      verified_boxes: verifiedBoxes.join(', '),
      damaged_boxes_count: damagedBoxes.length,
      damage_photos_count: damageSnapshots.length,
      boxes_breakdown: JSON.stringify(customBoxes)
    });

    setVerifiedBoxes([]);
  };

  const isAllBoxesVerified = verifiedBoxes.length >= customBoxes.length;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      background: sunnyMode ? '#F8FAFC' : 'transparent',
      color: sunnyMode ? '#0F172A' : '#FFFFFF',
      padding: sunnyMode ? '20px' : '0',
      borderRadius: sunnyMode ? '16px' : '0'
    }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon" style={{ background: sunnyMode ? '#FFFFFF' : 'rgba(15,23,42,0.7)', border: sunnyMode ? '2px solid #000000' : '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${sunnyMode ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '12px' }}>
            📦 DEDICATED STAFF INWARD DOCK SCANNER
          </span>
          <button 
            className="btn-luxury-gold"
            onClick={() => setSunnyMode(!sunnyMode)}
            style={{ fontWeight: '800' }}
          >
            {sunnyMode ? <Moon size={14} /> : <Sun size={14} />} 
            {sunnyMode ? 'Switch to Dark Mode' : '☀️ Sunny Dock Outdoor Mode (High Visibility)'}
          </button>
          <button className="btn-ghost-edit" onClick={() => setIsEditingShipment(!isEditingShipment)}>
            <Edit size={14} /> {isEditingShipment ? '✕ Close Shipment Details' : '✏️ Edit Inward Batch & Bay Details'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-gold">{customBoxes.length} BOXES ({totalKnockdownWeight} KG TOTAL)</span>
          <span className="badge badge-purple">ZERO-LOGIN DOCK PORTAL</span>
        </div>
      </div>

      {/* Edit Inward Shipment Header Modal / Drawer */}
      {isEditingShipment && (
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0F172A', border: '2px solid var(--accent-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
              ✏️ Edit Inward Shipment, Batch & Rack Bay Parameters
            </h3>
            <button className="btn-close-modal" onClick={() => setIsEditingShipment(false)}><X size={16} /></button>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Factory Batch Number</label>
              <input value={batchNo} onChange={e => setBatchNo(e.target.value)} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Assigned Storage Rack / Bay</label>
              <select value={storageBay} onChange={e => setStorageBay(e.target.value)}>
                <option value="Dock-A1">Dock-A1 (Main Ground Storage)</option>
                <option value="Dock-A2">Dock-A2 (Hydraulic Bed Storage)</option>
                <option value="Bay-B1">Bay-B1 (Living Room Sectionals)</option>
                <option value="Bay-C1">Bay-C1 (Marble Dining Suites)</option>
                <option value="Bay-D1">Bay-D1 (Almirahs & Wardrobes)</option>
                <option value="Mezzanine-1">Mezzanine-1 (Hardware & Fittings)</option>
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Transporter & Supplier Inward Notes</label>
              <input value={supplierNotes} onChange={e => setSupplierNotes(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn-luxury-gold" onClick={() => { setIsEditingShipment(false); showToast("✓ Inward parameters updated!"); }}>
              <Save size={14} /> Save & Apply Parameters
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Live Camera / Laser Gun + Granular Box-by-Box Verification Checklist */}
      <div className="dock-scanner-grid">
        
        {/* Left Column: Live Smartphone Camera + Barcode Scanner Interface */}
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0B132B', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: sunnyMode ? '#000000' : 'var(--accent-cyan)' }}>
              📷 Live Camera & Laser Gun Scanner
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {isCameraActive ? (
                <button className="btn-ghost-edit" style={{ color: 'var(--accent-rose)', border: '1px solid var(--accent-rose)' }} onClick={stopCamera}>
                  <VideoOff size={13} /> Stop Camera
                </button>
              ) : (
                <button className="btn-emerald" onClick={startCamera}>
                  <Video size={13} /> Start Camera Scanner
                </button>
              )}
            </div>
          </div>

          {/* Live Smartphone Camera Viewport */}
          {isCameraActive && (
            <div style={{ position: 'relative', width: '100%', height: '240px', background: '#000', borderRadius: '12px', overflow: 'hidden', margin: '12px 0', border: '2px solid var(--accent-cyan)' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Laser Line Viewfinder Animation */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #F43F5E, #FFFFFF, #F43F5E, transparent)',
                boxShadow: '0 0 15px #F43F5E, 0 0 25px #F43F5E',
                animation: 'pulse 1.2s infinite'
              }} />

              {/* Viewport Controls Overlay */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  onClick={flipCamera}
                  style={{ background: 'rgba(56,189,248,0.85)', color: '#000000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Flip Camera (Rear / Front)"
                >
                  <RotateCcw size={15} />
                </button>
                <button 
                  type="button" 
                  onClick={toggleTorch}
                  style={{ background: isTorchOn ? '#F59E0B' : 'rgba(0,0,0,0.7)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Toggle Torch Flashlight"
                >
                  <Flashlight size={15} />
                </button>
                <button 
                  type="button" 
                  onClick={captureDamageSnapshot}
                  style={{ background: 'rgba(244,63,94,0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Snap Carton Damage Photo"
                >
                  <Camera size={15} />
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.8)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#38BDF8', fontWeight: '800' }}>
                LIVE CAMERA SCANNING • {cameraFacing === 'environment' ? 'REAR LENS' : 'FRONT LENS'}
              </div>
            </div>
          )}

          {/* Damaged Carton Photo Thumbnails Strip */}
          {damageSnapshots.length > 0 && (
            <div style={{ background: '#030712', borderRadius: '10px', padding: '8px', margin: '8px 0', border: '1px solid rgba(244,63,94,0.4)' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--accent-rose)', marginBottom: '4px' }}>
                📸 Inspection Photos Captured ({damageSnapshots.length}):
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {damageSnapshots.map(snap => (
                  <div key={snap.id} style={{ position: 'relative', width: '55px', height: '45px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                    <img src={snap.dataUrl} alt="damage" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Shipment SKU & Quantity */}
          <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr', margin: '8px 0' }}>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)', fontWeight: '800' }}>Arriving Furniture SKU</label>
              <select 
                value={selectedPoSku} 
                onChange={e => { setSelectedPoSku(e.target.value); setVerifiedBoxes([]); }}
                style={{ background: sunnyMode ? '#F1F5F9' : '#030712', color: sunnyMode ? '#000' : '#FFFFFF', border: sunnyMode ? '2px solid #000' : '1px solid var(--accent-gold)' }}
              >
                {catalog.map(c => (
                  <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)', fontWeight: '800' }}>Quantity (Sets)</label>
              <input 
                type="number" 
                min="1" 
                value={inwardQuantity} 
                onChange={e => setInwardQuantity(Number(e.target.value))}
                style={{ background: sunnyMode ? '#F1F5F9' : '#030712', color: sunnyMode ? '#000' : '#FFFFFF', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>

          {/* Barcode Gun Input Form */}
          <form onSubmit={handleScanSubmit} style={{ margin: '10px 0' }}>
            <label style={{ fontSize: '12px', fontWeight: '900', color: sunnyMode ? '#000' : 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
              🔫 Scan Carton Barcode (Laser Gun / Camera):
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input 
                autoFocus
                placeholder="Scan carton barcode (e.g. BED-MOD-001-BOX-A)..."
                value={scannedInput}
                onChange={e => setScannedInput(e.target.value)}
                style={{ 
                  flex: 1, 
                  background: sunnyMode ? '#FFFF00' : '#030712', 
                  color: '#000000', 
                  fontWeight: '900', 
                  fontSize: '13px', 
                  border: sunnyMode ? '2.5px solid #000' : '1.5px solid var(--accent-gold)', 
                  borderRadius: '8px', 
                  padding: '10px 12px',
                  outline: 'none'
                }}
              />
              <button className="btn-luxury-gold" type="submit" style={{ padding: '0 16px' }}>
                Verify
              </button>
            </div>
          </form>

          {/* Quick Simulation Buttons */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: sunnyMode ? '#475569' : 'var(--text-secondary)' }}>
              ⚡ 1-Click Test Scanners:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {customBoxes.map(b => (
                <button 
                  key={b.id}
                  className="btn-ghost-edit" 
                  style={{ fontSize: '11px', padding: '4px 8px', background: sunnyMode ? '#E2E8F0' : 'rgba(255,255,255,0.08)', color: sunnyMode ? '#000' : '#FFF' }}
                  onClick={() => { setScannedInput(`BOX-${b.id}`); handleScanSubmit(); }}
                >
                  Scan Box {b.id}
                </button>
              ))}
              <button className="btn-emerald" onClick={handle1ClickScanAll} style={{ fontSize: '11px', padding: '4px 8px' }}>
                Scan All {customBoxes.length} Boxes ✓
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Knockdown Component Boxes Verification Bay + Granular Box-by-Box Editor */}
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0B132B', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: sunnyMode ? '#000' : '#FFFFFF' }}>
                🧩 {customBoxes.length}-Box Knockdown Checklist ({selectedPoSku})
              </h3>
              <span style={{ fontSize: '11px', color: sunnyMode ? '#475569' : 'var(--text-secondary)' }}>
                Target Bay: <b>{storageBay}</b> • Total Weight: <b>{totalKnockdownWeight} KG</b>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '3px 8px' }} onClick={handleAddBox}>
                <Plus size={12} /> Add Box
              </button>
              <span className={`badge ${isAllBoxesVerified ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                {verifiedBoxes.length}/{customBoxes.length} VERIFIED {isAllBoxesVerified ? '✓' : '⚠️'}
              </span>
            </div>
          </div>

          {/* Granular Box-by-Box Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
            {customBoxes.map((box, idx) => {
              const isVerified = verifiedBoxes.includes(box.id);
              const isEditingThisBox = editingBoxIndex === idx;

              return (
                <div 
                  key={box.id}
                  style={{
                    background: isVerified ? (sunnyMode ? '#DCFCE7' : 'rgba(16,185,129,0.12)') : (sunnyMode ? '#F1F5F9' : '#030712'),
                    border: isVerified ? '2px solid #10B981' : (sunnyMode ? '1.5px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)'),
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {/* Main Box Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div 
                        onClick={() => toggleManualBox(box.id)}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: isVerified ? '#10B981' : (sunnyMode ? '#CBD5E1' : '#334155'), 
                          color: isVerified ? '#FFFFFF' : '#000000', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: '900',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                        title="Click to toggle manual verification"
                      >
                        {box.id}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '13px', color: sunnyMode ? '#000000' : '#FFFFFF' }}>
                          BOX {box.id}: {box.name}
                        </div>
                        <div style={{ fontSize: '11px', color: sunnyMode ? '#475569' : 'var(--text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span>⚖️ <b>{box.weight} KG</b></span>
                          <span>📐 <b>{box.dimensions}</b></span>
                          <span style={{ color: 'var(--accent-gold-light)' }}>Barcode: <b>{box.barcode || `${selectedPoSku}-BOX-${box.id}`}</b></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        className={`badge ${isVerified ? 'badge-emerald' : 'badge-rose'}`} 
                        onClick={() => toggleManualBox(box.id)}
                        style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', fontSize: '10px' }}
                      >
                        {isVerified ? 'VERIFIED ✓' : 'MANUAL VERIFY ✕'}
                      </button>

                      <button 
                        className="btn-ghost-edit" 
                        style={{ padding: '3px 6px', fontSize: '10.5px' }} 
                        onClick={() => setEditingBoxIndex(isEditingThisBox ? null : idx)}
                        title="Edit Box Specifications & Condition"
                      >
                        <Edit size={12} /> {isEditingThisBox ? 'Done' : 'Edit Box'}
                      </button>

                      <button 
                        className="btn-ghost-edit" 
                        style={{ padding: '3px 6px', color: 'var(--accent-cyan)' }} 
                        onClick={() => handlePrintSingleBox(box)}
                        title="Print Box Replacement Label"
                      >
                        <Printer size={12} />
                      </button>

                      {customBoxes.length > 1 && (
                        <button className="btn-ghost-edit" style={{ padding: '3px 6px', color: 'var(--accent-rose)' }} onClick={() => handleRemoveBox(box.id)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Condition Tag Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Condition:</span>
                    <span className={`badge ${box.condition === 'INTACT_OK' ? 'badge-emerald' : box.condition === 'OUTER_TORN' ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                      {box.condition === 'INTACT_OK' ? '🟢 INTACT FACTORY OK' : box.condition === 'OUTER_TORN' ? '⚠️ OUTER CARTON SCUFF' : '🚨 DAMAGE / SHORTAGE FLAGGED'}
                    </span>
                    {box.notes && (
                      <span style={{ fontSize: '10.5px', color: sunnyMode ? '#64748B' : '#94A3B8', fontStyle: 'italic', marginLeft: '6px' }}>
                        "{box.notes}"
                      </span>
                    )}
                  </div>

                  {/* In-Place Box Edit Panel (Opens when Edit Box is clicked) */}
                  {isEditingThisBox && (
                    <div style={{ background: sunnyMode ? '#E2E8F0' : '#0B132B', borderRadius: '10px', padding: '12px', marginTop: '6px', border: '1.5px solid var(--accent-gold)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        ✏️ Edit Specifications for Box {box.id} ({selectedPoSku})
                      </div>

                      <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
                        <div className="form-field">
                          <label style={{ fontSize: '10.5px' }}>Component Name</label>
                          <input value={box.name} onChange={e => handleUpdateBoxField(idx, 'name', e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label style={{ fontSize: '10.5px' }}>Weight (KG)</label>
                          <input type="number" step="0.5" value={box.weight} onChange={e => handleUpdateBoxField(idx, 'weight', Number(e.target.value))} />
                        </div>
                        <div className="form-field">
                          <label style={{ fontSize: '10.5px' }}>Dimensions</label>
                          <input value={box.dimensions} onChange={e => handleUpdateBoxField(idx, 'dimensions', e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label style={{ fontSize: '10.5px' }}>Condition Status</label>
                          <select value={box.condition} onChange={e => handleUpdateBoxField(idx, 'condition', e.target.value)}>
                            <option value="INTACT_OK">🟢 Intact & Flawless</option>
                            <option value="OUTER_TORN">⚠️ Outer Scuff / Packaging Torn</option>
                            <option value="INTERNAL_DAMAGE">🚨 Internal Damage (Claim Factory)</option>
                            <option value="SHORTAGE_MISSING">❌ Missing / Shortage Box</option>
                          </select>
                        </div>
                        <div className="form-field" style={{ gridColumn: '2 / -1' }}>
                          <label style={{ fontSize: '10.5px' }}>Box Notes / Hardware Details</label>
                          <input value={box.notes} onChange={e => handleUpdateBoxField(idx, 'notes', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button className="btn-luxury-gold" style={{ fontSize: '10.5px', padding: '4px 10px' }} onClick={() => { setEditingBoxIndex(null); showToast(`✓ Box ${box.id} updated!`); }}>
                          <Check size={12} /> Save Box {box.id} Specs
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Complete Inward QC Button */}
          <button 
            className="btn-luxury-gold" 
            onClick={handleCompleteInward}
            disabled={!isAllBoxesVerified}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '12px', 
              fontSize: '13.5px',
              fontWeight: '900',
              opacity: isAllBoxesVerified ? 1 : 0.45
            }}
          >
            <Check size={16} /> ✅ 1-Click Complete Inward QC & Add +{inwardQuantity} Sets ({totalKnockdownWeight} KG) to {storageBay}
          </button>
        </div>

      </div>

    </div>
  );
}

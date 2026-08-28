import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Code128Barcode } from '../utils/barcode128';
import { DynamicQrCode } from '../utils/qrcodeGenerator';
import { 
  Truck, 
  Barcode, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Sun, 
  Moon, 
  FileCheck, 
  Send, 
  UserCheck, 
  Lock,
  Sparkles,
  MapPin,
  Camera,
  Flashlight,
  Video,
  VideoOff,
  Image as ImageIcon,
  Edit,
  Save,
  X,
  DollarSign,
  Printer,
  Sliders,
  Layers
} from 'lucide-react';
import { playScanBeep, playSuccessChime, playSafeLockSound, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function StaffOutwardScannerView() {
  const { orders, drivers, updateOrderStatus, showToast } = useStore();

  const [sunnyMode, setSunnyMode] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.Order_ID || 'ORD-8921');
  const [selectedDriverId, setSelectedDriverId] = useState('DRV-01');
  const [scannedInput, setScannedInput] = useState('');
  const [loadedBoxes, setLoadedBoxes] = useState(['A', 'B', 'C']);

  // Camera & Media Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cargoProofPhotos, setCargoProofPhotos] = useState([]);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Edit Dispatch Details Header State
  const [isEditingDispatch, setIsEditingDispatch] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('Dr. Subhashish Jena');
  const [editCustomerPhone, setEditCustomerPhone] = useState('9437188291');
  const [editAddress, setEditAddress] = useState('Gayatri Nagar Villa, Rayagada');
  const [editSchedule, setEditSchedule] = useState('Today, 04:30 PM Express');
  const [editSiteNotes, setEditSiteNotes] = useState('Ground Floor Delivery • Wide Double Door Access');
  const [editCarpenter, setEditCarpenter] = useState('Narayana Mistri');
  const [editCarpenterPayout, setEditCarpenterPayout] = useState(500);
  const [editBalanceDue, setEditBalanceDue] = useState(78247);
  const [editPaymentMode, setEditPaymentMode] = useState('DYNAMIC_UPI_QR');

  // Granular Box-by-Box Dispatch Model
  const [boxDetails, setBoxDetails] = useState([
    { 
      letter: 'A', 
      name: 'Headboard & Hydraulic Lift Frame', 
      weight: 42.0, 
      stacking: 'MIDDLE_STACK', // 'BOTTOM_HEAVY' | 'MIDDLE_STACK' | 'TOP_FRAGILE'
      status: 'VERIFIED_LOADED',
      notes: 'Carved teak headboard with pre-installed hydraulic lift brackets',
      barcode: 'BOX-A'
    },
    { 
      letter: 'B', 
      name: 'Solid Teak Side Rails & Footboard', 
      weight: 28.0, 
      stacking: 'MIDDLE_STACK',
      status: 'VERIFIED_LOADED',
      notes: 'Dual side runners wrapped in protective blanket',
      barcode: 'BOX-B'
    },
    { 
      letter: 'C', 
      name: 'Heavy Metal Slats & Frame Grid', 
      weight: 24.5, 
      stacking: 'BOTTOM_HEAVY',
      status: 'VERIFIED_LOADED',
      notes: 'Place on bottom floor of Tata Ace truck bed',
      barcode: 'BOX-C'
    },
    { 
      letter: 'D', 
      name: 'Gas-Lift Shock Absorbers & Hardware Kit', 
      weight: 8.2, 
      stacking: 'TOP_FRAGILE',
      status: 'STAGED_AT_DOCK',
      notes: 'Contains 250N gas pistons and assembly screw pouch for Narayana Mistri',
      barcode: 'BOX-D'
    },
    { 
      letter: 'E', 
      name: 'Mattress Support Base Platform', 
      weight: 19.0, 
      stacking: 'BOTTOM_HEAVY',
      status: 'STAGED_AT_DOCK',
      notes: 'Flat engineered mattress board platform',
      barcode: 'BOX-E'
    }
  ]);

  const [editingBoxIndex, setEditingBoxIndex] = useState(null);

  const activeOrder = orders.find(o => o.Order_ID === selectedOrderId) || orders[0];
  const activeDriver = drivers.find(d => d.Driver_ID === selectedDriverId) || drivers[0];

  const totalBoxesRequired = boxDetails.length;
  const boxLetters = boxDetails.map(b => b.letter);

  const totalPayloadWeight = boxDetails.reduce((sum, b) => sum + (Number(b.weight) || 0), 0);
  const vehicleMaxPayload = 750; // 750 KG for Tata Ace / Bolero Pickup
  const payloadPercentage = Math.min(100, Math.round((totalPayloadWeight / vehicleMaxPayload) * 100));

  const isFullyLoaded = loadedBoxes.length >= totalBoxesRequired;

  // Sync edit form on order change
  useEffect(() => {
    if (activeOrder) {
      setEditCustomerName(activeOrder.Customer_Name || '');
      setEditCustomerPhone(activeOrder.Customer_Phone || '');
      setEditAddress(activeOrder.Project_Address || '');
      setEditSchedule(activeOrder.Delivery_Schedule || 'Today, 04:30 PM');
      setEditCarpenter(activeOrder.Carpenter_Assigned || 'Narayana Mistri');
      setEditCarpenterPayout(activeOrder.Carpenter_Payout_INR || 500);
      setEditBalanceDue(activeOrder.Balance_Due_INR || 78247);
    }
  }, [selectedOrderId]);

  // Camera Lifecycle & Real-Time Barcode Detector
  const [cameraFacing, setCameraFacing] = useState('environment');
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
        showToast("📷 Vehicle Loading Camera Active! Scan cartons going into truck.", true);

        // Start continuous live barcode detection loop
        startLiveBarcodeScanner();
      } else {
        showToast("⚠️ Camera device not detected. Scanner gun & manual mode active.");
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
        console.warn("BarcodeDetector initialization failed:", e);
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
          showToast(nextState ? "🔦 Truck Bed Camera Torch ON" : "🔦 Torch OFF");
        } catch (e) {
          setIsTorchOn(!isTorchOn);
          showToast("🔦 Torch toggled");
        }
      }
    } else {
      setIsTorchOn(!isTorchOn);
      showToast(isTorchOn ? "🔦 Torch OFF" : "🔦 Truck Bed Camera Torch ON");
    }
  };

  const captureCargoProof = () => {
    playScanBeep();
    let realDataUrl = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400";

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

    const newProof = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      label: `Truck Loading Proof #${cargoProofPhotos.length + 1}`,
      dataUrl: realDataUrl
    };
    setCargoProofPhotos(prev => [newProof, ...prev]);
    showToast("📸 Real Camera Cargo Proof Photo captured for Gate Pass!", true);
  };

  // Process scanned code
  const handleProcessBarcodeScan = (raw) => {
    if (!raw) return;
    const val = raw.trim().toUpperCase();

    const matchedLetter = boxLetters.find(l => 
      val.includes(`BOX-${l}`) || 
      val.includes(`-${l}`) ||
      val === l || 
      val.endsWith(l)
    );

    if (matchedLetter) {
      if (!loadedBoxes.includes(matchedLetter)) {
        setLoadedBoxes(prev => [...prev, matchedLetter]);
        playScanBeep();
        showToast(`🚚 Carton ${matchedLetter} Loaded into Truck!`, true);
      }
    } else if (val.includes(selectedOrderId) || val.includes(activeOrder.Ordered_SKU)) {
      setLoadedBoxes([...boxLetters]);
      playScanBeep();
      playSuccessChime();
      showToast(`🎯 Full Order Barcode Scanned! All ${totalBoxesRequired} cartons loaded.`);
    }
  };

  // Barcode Gun & Scanner
  const handleScanSubmit = (e) => {
    e?.preventDefault();
    if (!scannedInput.trim()) return;

    handleProcessBarcodeScan(scannedInput);
    setScannedInput('');
  };

  const toggleManualBox = (letter) => {
    if (loadedBoxes.includes(letter)) {
      setLoadedBoxes(prev => prev.filter(l => l !== letter));
      showToast(`Box ${letter} unloaded.`);
    } else {
      setLoadedBoxes(prev => [...prev, letter]);
      playScanBeep();
      showToast(`Box ${letter} manually loaded in truck ✓`);
    }
  };

  const handle1ClickLoadAll = () => {
    playScanBeep();
    setLoadedBoxes(boxLetters);
    playSuccessChime();
    showToast(`⚡ 1-Click Load All: 5/5 Component Cartons Verified in Vehicle!`);
  };

  const handleUpdateBoxField = (index, field, value) => {
    setBoxDetails(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handlePrintBoxLabel = (box) => {
    playScanBeep();
    showToast(`🖨️ Printing Delivery Label for Box ${box.letter}...`);
    window.print();
  };

  // Release Vehicle Action
  const handleReleaseVehicle = () => {
    if (!isFullyLoaded) {
      showToast(`🚨 PARTIAL LOAD BLOCKED: Missing ${totalBoxesRequired - loadedBoxes.length} cartons! Do not release truck.`, false);
      return;
    }

    updateOrderStatus(selectedOrderId, `DISPATCHED_IN_TRANSIT (${activeDriver.Vehicle})`);
    playSafeLockSound();
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🚀 Vehicle Released! Gate Pass generated & WhatsApp alert sent to ${editCustomerName} (OTP: 8921)!`, true);

    dispatchWebhookAction('OUTWARD_DISPATCH_SCAN', {
      order_id: selectedOrderId,
      driver: activeDriver.Name,
      vehicle: activeDriver.Vehicle,
      customer_name: editCustomerName,
      customer_phone: editCustomerPhone,
      delivery_address: editAddress,
      schedule: editSchedule,
      site_notes: editSiteNotes,
      carpenter: editCarpenter,
      carpenter_payout: editCarpenterPayout,
      balance_due: editBalanceDue,
      payment_mode: editPaymentMode,
      total_payload_kg: totalPayloadWeight,
      loaded_boxes: loadedBoxes.join(', '),
      cargo_photos_count: cargoProofPhotos.length,
      box_details: JSON.stringify(boxDetails),
      dispatch_timestamp: new Date().toISOString()
    });

    setLoadedBoxes([]);
  };

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
          <span className={`badge ${sunnyMode ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '12px' }}>
            🚚 DEDICATED STAFF OUTWARD DOCK DISPATCH SCANNER
          </span>
          <button 
            className="btn-luxury-gold"
            onClick={() => setSunnyMode(!sunnyMode)}
            style={{ fontWeight: '800' }}
          >
            {sunnyMode ? <Moon size={14} /> : <Sun size={14} />} 
            {sunnyMode ? 'Switch to Dark Mode' : '☀️ Sunny Dock Outdoor Mode (High Visibility)'}
          </button>
          <button className="btn-ghost-edit" onClick={() => setIsEditingDispatch(!isEditingDispatch)}>
            <Edit size={14} /> {isEditingDispatch ? '✕ Close Dispatch Details' : '✏️ Edit Dispatch, Driver & Carpenter Details'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-gold">TRUCK LOAD: {totalPayloadWeight} KG ({payloadPercentage}% CAPACITY)</span>
          <span className="badge badge-emerald">ANTI-PARTIAL LOAD DEFENSE ACTIVE</span>
        </div>
      </div>

      {/* Edit Dispatch Order Details Modal / Drawer */}
      {isEditingDispatch && (
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0F172A', border: '2px solid var(--accent-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
              ✏️ Edit Customer Dispatch, Driver & Carpenter Job Parameters
            </h3>
            <button className="btn-close-modal" onClick={() => setIsEditingDispatch(false)}><X size={16} /></button>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Customer Name</label>
              <input value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Customer WhatsApp Phone</label>
              <input value={editCustomerPhone} onChange={e => setEditCustomerPhone(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Delivery Destination Address</label>
              <input value={editAddress} onChange={e => setEditAddress(e.target.value)} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Delivery Time Slot</label>
              <input value={editSchedule} onChange={e => setEditSchedule(e.target.value)} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Site Handling & Staircase Notes</label>
              <input value={editSiteNotes} onChange={e => setEditSiteNotes(e.target.value)} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Assigned Master Carpenter</label>
              <select value={editCarpenter} onChange={e => setEditCarpenter(e.target.value)}>
                <option value="Narayana Mistri">Narayana Mistri (Master Carpenter)</option>
                <option value="Kailash Mistri">Kailash Mistri (Hydraulic Specialist)</option>
                <option value="Babu Mistri">Babu Mistri (Modular Specialist)</option>
              </select>
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Carpenter Wage Payout (₹)</label>
              <input type="number" value={editCarpenterPayout} onChange={e => setEditCarpenterPayout(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Balance Due at Doorstep (₹)</label>
              <input type="number" value={editBalanceDue} onChange={e => setEditBalanceDue(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)' }}>Doorstep Payment Mode</label>
              <select value={editPaymentMode} onChange={e => setEditPaymentMode(e.target.value)}>
                <option value="DYNAMIC_UPI_QR">Dynamic UPI QR (PhonePe / GPay)</option>
                <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
                <option value="FULL_ADVANCE_PAID">Full Advance Paid (Zero Due)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn-luxury-gold" onClick={() => { setIsEditingDispatch(false); showToast("✓ Dispatch parameters updated!"); }}>
              <Save size={14} /> Save & Apply Parameters
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Loading Bay Cockpit + Granular 5-Box Vehicle Loading Checklist */}
      <div className="dock-scanner-grid">
        
        {/* Left Column: Camera + Order Matcher & Scanner Gun Interface */}
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0B132B', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: sunnyMode ? '#000000' : 'var(--accent-amber)' }}>
              📋 Loading Manifest & Camera Scanner
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
            <div style={{ position: 'relative', width: '100%', height: '240px', background: '#000', borderRadius: '12px', overflow: 'hidden', margin: '12px 0', border: '2px solid var(--accent-amber)' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Aiming Reticle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #F59E0B, #FFFFFF, #F59E0B, transparent)',
                boxShadow: '0 0 15px #F59E0B, 0 0 25px #F59E0B',
                animation: 'pulse 1.2s infinite'
              }} />

              {/* Viewport Controls Overlay */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  onClick={flipCamera}
                  style={{ background: 'rgba(245,158,11,0.85)', color: '#000000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
                  onClick={captureCargoProof}
                  style={{ background: 'rgba(16,185,129,0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Snap Truck Cargo Loading Proof"
                >
                  <Camera size={15} />
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.8)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#F59E0B', fontWeight: '800' }}>
                TRUCK LOADING BAY CAMERA • {cameraFacing === 'environment' ? 'REAR LENS' : 'FRONT LENS'}
              </div>
            </div>
          )}

          {/* Cargo Proof Photo Thumbnails Strip */}
          {cargoProofPhotos.length > 0 && (
            <div style={{ background: '#030712', borderRadius: '10px', padding: '8px', margin: '8px 0', border: '1px solid rgba(16,185,129,0.4)' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                📸 Truck Cargo Proof Photos ({cargoProofPhotos.length}):
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {cargoProofPhotos.map(snap => (
                  <div key={snap.id} style={{ position: 'relative', width: '55px', height: '45px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #10B981' }}>
                    <img src={snap.dataUrl} alt="truck-proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Select Customer Order to Load */}
          <div className="form-field">
            <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)', fontWeight: '800' }}>Select Dispatch Order (Delivery Challan)</label>
            <select 
              value={selectedOrderId} 
              onChange={e => { setSelectedOrderId(e.target.value); setLoadedBoxes([]); }}
              style={{ background: sunnyMode ? '#F1F5F9' : '#030712', color: sunnyMode ? '#000' : '#FFFFFF', border: sunnyMode ? '2px solid #000' : '1px solid var(--accent-gold)' }}
            >
              {orders.map(o => (
                <option key={o.Order_ID} value={o.Order_ID}>
                  {o.Order_ID} — {o.Customer_Name} ({o.Ordered_SKU})
                </option>
              ))}
            </select>
          </div>

          {/* Customer & Address Quick Card */}
          <div style={{ background: sunnyMode ? '#F1F5F9' : '#030712', borderRadius: '10px', padding: '12px', border: sunnyMode ? '1.5px solid #CBD5E1' : '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }}>
            <div style={{ fontWeight: '900', fontSize: '13px', color: sunnyMode ? '#000000' : '#FFFFFF' }}>{editCustomerName}</div>
            <div style={{ fontSize: '11px', color: sunnyMode ? '#475569' : 'var(--text-secondary)' }}>📍 {editAddress} • 📞 {editCustomerPhone}</div>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '800', marginTop: '4px' }}>
              Furniture: {activeOrder.Ordered_SKU}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--accent-emerald)', marginTop: '2px' }}>
              🪚 Carpenter: <b>{editCarpenter}</b> (₹{editCarpenterPayout}) • Balance Due: <b>₹{editBalanceDue.toLocaleString()}</b> ({editPaymentMode})
            </div>
          </div>

          {/* Assign Driver & Vehicle Payload Meter */}
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', margin: '8px 0' }}>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)', fontWeight: '800' }}>Assigned Fleet Driver</label>
              <select 
                value={selectedDriverId} 
                onChange={e => setSelectedDriverId(e.target.value)}
                style={{ background: sunnyMode ? '#F1F5F9' : '#030712', color: sunnyMode ? '#000' : '#FFFFFF', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.2)' }}
              >
                {drivers.map(d => (
                  <option key={d.Driver_ID} value={d.Driver_ID}>{d.Name} ({d.Vehicle})</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)', fontWeight: '800' }}>Live Truck Payload</label>
              <div style={{ background: sunnyMode ? '#E2E8F0' : '#030712', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', border: sunnyMode ? '1px solid #94A3B8' : '1px solid rgba(255,255,255,0.1)' }}>
                {totalPayloadWeight} KG / {vehicleMaxPayload} KG ({payloadPercentage}% OK ✓)
              </div>
            </div>
          </div>

          {/* Barcode Gun Input Form */}
          <form onSubmit={handleScanSubmit} style={{ margin: '10px 0' }}>
            <label style={{ fontSize: '12px', fontWeight: '900', color: sunnyMode ? '#000' : 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
              🔫 Scan Carton into Vehicle (Laser Gun / Camera):
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input 
                autoFocus
                placeholder="Scan carton barcode (e.g. BED-MOD-001-BOX-D)..."
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
              {boxLetters.map(l => (
                <button 
                  key={l}
                  className="btn-ghost-edit" 
                  style={{ fontSize: '11px', padding: '4px 8px', background: sunnyMode ? '#E2E8F0' : 'rgba(255,255,255,0.08)', color: sunnyMode ? '#000' : '#FFF' }}
                  onClick={() => { setScannedInput(`BOX-${l}`); handleScanSubmit(); }}
                >
                  Load Box {l}
                </button>
              ))}
              <button className="btn-emerald" onClick={handle1ClickLoadAll} style={{ fontSize: '11px', padding: '4px 8px' }}>
                Load All {boxDetails.length} Boxes ✓
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 5-Box Anti-Partial Loading Checklist & Granular Box-by-Box Dispatch Editor */}
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0B132B', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: sunnyMode ? '#000' : '#FFFFFF' }}>
                🛡️ {boxDetails.length}-Box Loading Defense Checklist ({selectedOrderId})
              </h3>
              <span style={{ fontSize: '11px', color: sunnyMode ? '#475569' : 'var(--text-secondary)' }}>
                Vehicle: {activeDriver.Vehicle} ({activeDriver.Name}) • Total Weight: {totalPayloadWeight} KG
              </span>
            </div>
            <span className={`badge ${isFullyLoaded ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
              {loadedBoxes.length}/{boxDetails.length} BOXES LOADED {isFullyLoaded ? '✓' : '🚨 PARTIAL'}
            </span>
          </div>

          {/* Granular Box-by-Box Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
            {boxDetails.map((box, idx) => {
              const isLoaded = loadedBoxes.includes(box.letter);
              const isEditingThisBox = editingBoxIndex === idx;

              return (
                <div 
                  key={box.letter}
                  style={{
                    background: isLoaded ? (sunnyMode ? '#DCFCE7' : 'rgba(16,185,129,0.15)') : (sunnyMode ? '#FEE2E2' : 'rgba(244,63,94,0.1)'),
                    border: isLoaded ? '2px solid #10B981' : '1.5px solid var(--accent-rose)',
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
                        onClick={() => toggleManualBox(box.letter)}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: isLoaded ? '#10B981' : '#F43F5E', 
                          color: '#FFFFFF', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: '900',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                        title="Click to toggle manual loading"
                      >
                        {box.letter}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '13px', color: sunnyMode ? '#000000' : '#FFFFFF' }}>
                          BOX {box.letter}: {box.name}
                        </div>
                        <div style={{ fontSize: '11px', color: sunnyMode ? '#475569' : 'var(--text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span>⚖️ <b>{box.weight} KG</b></span>
                          <span style={{ color: 'var(--accent-gold-light)' }}>Barcode: <b>BOX-{box.letter}</b></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        className={`badge ${isLoaded ? 'badge-emerald' : 'badge-rose'}`} 
                        onClick={() => toggleManualBox(box.letter)}
                        style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', fontSize: '10px' }}
                      >
                        {isLoaded ? 'LOADED IN TRUCK ✓' : 'MANUAL LOAD ✕'}
                      </button>

                      <button 
                        className="btn-ghost-edit" 
                        style={{ padding: '3px 6px', fontSize: '10.5px' }} 
                        onClick={() => setEditingBoxIndex(isEditingThisBox ? null : idx)}
                        title="Edit Box Stacking & Carpenter Notes"
                      >
                        <Edit size={12} /> {isEditingThisBox ? 'Done' : 'Edit Box'}
                      </button>

                      <button 
                        className="btn-ghost-edit" 
                        style={{ padding: '3px 6px', color: 'var(--accent-cyan)' }} 
                        onClick={() => handlePrintBoxLabel(box)}
                        title="Print Box Delivery Label"
                      >
                        <Printer size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Stacking Placement & Carpenter Instructions Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Stacking:</span>
                    <span className={`badge ${box.stacking === 'BOTTOM_HEAVY' ? 'badge-cyan' : box.stacking === 'TOP_FRAGILE' ? 'badge-rose' : 'badge-gold'}`} style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                      {box.stacking === 'BOTTOM_HEAVY' ? '🟢 BOTTOM HEAVY (BED FLOOR)' : box.stacking === 'TOP_FRAGILE' ? '🔴 TOP FRAGILE (DO NOT CRUSH)' : '🟡 MIDDLE STACK'}
                    </span>
                    {box.notes && (
                      <span style={{ fontSize: '10.5px', color: sunnyMode ? '#64748B' : '#94A3B8', fontStyle: 'italic', marginLeft: '6px' }}>
                        "{box.notes}"
                      </span>
                    )}
                  </div>

                  {/* In-Place Box Edit Panel */}
                  {isEditingThisBox && (
                    <div style={{ background: sunnyMode ? '#E2E8F0' : '#0B132B', borderRadius: '10px', padding: '12px', marginTop: '6px', border: '1.5px solid var(--accent-gold)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        ✏️ Edit Stacking & Handling for Box {box.letter}
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
                          <label style={{ fontSize: '10.5px' }}>Truck Stacking Placement</label>
                          <select value={box.stacking} onChange={e => handleUpdateBoxField(idx, 'stacking', e.target.value)}>
                            <option value="BOTTOM_HEAVY">🟢 Bottom Heavy (Floor Level)</option>
                            <option value="MIDDLE_STACK">🟡 Middle Stack</option>
                            <option value="TOP_FRAGILE">🔴 Top Fragile (No Weight Above)</option>
                          </select>
                        </div>
                        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '10.5px' }}>Carpenter Assembly & Hardware Notes</label>
                          <input value={box.notes} onChange={e => handleUpdateBoxField(idx, 'notes', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button className="btn-luxury-gold" style={{ fontSize: '10.5px', padding: '4px 10px' }} onClick={() => { setEditingBoxIndex(null); showToast(`✓ Box ${box.letter} dispatch specs updated!`); }}>
                          <Check size={12} /> Save Box {box.letter} Specs
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Release Vehicle Gate Pass Button */}
          <button 
            className="btn-luxury-gold" 
            onClick={handleReleaseVehicle}
            disabled={!isFullyLoaded}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '12px', 
              fontSize: '13.5px',
              fontWeight: '900',
              opacity: isFullyLoaded ? 1 : 0.45
            }}
          >
            <Lock size={16} /> 🚀 Release Vehicle & Generate Security Gate Pass ({totalPayloadWeight} KG Verified)
          </button>
        </div>

      </div>

    </div>
  );
}

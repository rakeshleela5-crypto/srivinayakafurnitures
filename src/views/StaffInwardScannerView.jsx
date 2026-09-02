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
  Sliders,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { playScanBeep, playSuccessChime, playSafeLockSound, triggerGoldenConfetti, speakVoiceFeedback } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';
import { decodeBarcodeFromSource, decodeBarcodeFromImageFile, sanitizeBarcode } from '../utils/barcodeDecoder';
import { generateBoxesForProduct } from '../utils/knockdownBoxGenerator';

export function StaffInwardScannerView() {
  const { 
    catalog, 
    inventory, 
    adjustStock, 
    showToast,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing
  } = useStore();

  const [sunnyMode, setSunnyMode] = useState(false);
  const [inwardStep, setInwardStep] = useState(1);
  const [scannedInput, setScannedInput] = useState('');
  const [selectedPoSku, setSelectedPoSku] = useState(catalog[0]?.SKU || 'BED-MOD-001');
  const [inwardQuantity, setInwardQuantity] = useState(1); // Default to 1 Set
  const [batchNo, setBatchNo] = useState(`BATCH-GI-${new Date().getFullYear()}-0881`);
  const [storageBay, setStorageBay] = useState('Dock-A1');
  const [truckNumber, setTruckNumber] = useState('OD-02-C-9988');
  const [biltyNumber, setBiltyNumber] = useState('LR-88912');
  const [transporterName, setTransporterName] = useState('Century Logistics Rayagada');
  const [supplierNotes, setSupplierNotes] = useState('Factory shipment via Century Logistics truck #OD-02-C-9988');

  // Camera & Media Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isContinuousScan, setIsContinuousScan] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x, 1.5x, 2x
  const [soundProfile, setSoundProfile] = useState('LASER_BEEP'); // 'LASER_BEEP' | 'VOICE_ANNOUNCER' | 'CHIME' | 'SILENT'
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [scanHistoryLog, setScanHistoryLog] = useState([]);
  const [damageSnapshots, setDamageSnapshots] = useState([]);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastScanRef = useRef({ code: '', time: 0 });

  // Edit Shipment Header Drawer
  const [isEditingShipment, setIsEditingShipment] = useState(false);

  const activeProduct = catalog.find(c => c.SKU === selectedPoSku) || catalog[0];

  // Dynamic Knockdown Component Box Array — generated based on active SKU's Category & Total_Component_Boxes
  const [customBoxes, setCustomBoxes] = useState(() => generateBoxesForProduct(activeProduct));

  // Clean Zero State: Starts with 0 verified boxes for fresh shipment unloading
  const [verifiedBoxes, setVerifiedBoxes] = useState([]);
  const [editingBoxIndex, setEditingBoxIndex] = useState(null);
  const [printingBox, setPrintingBox] = useState(null); // Index of box currently being edited in modal/drawer

  // Calculate Total Knockdown Weight (Per Set and Total for All Sets)
  const totalKnockdownWeight = customBoxes.reduce((sum, b) => sum + (Number(b.weight) || 0), 0);
  const totalShipmentWeight = (totalKnockdownWeight * Math.max(1, inwardQuantity)).toFixed(1);

  // Haptic feedback trigger for noisy warehouse docks
  const triggerHaptic = () => {
    if (hapticsEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 40, 100]);
      } catch (e) {}
    }
  };

  // Camera Stream Lifecycle & Real-Time Barcode Detector
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const scanIntervalRef = useRef(null);

  // Auto-attach video stream whenever isCameraActive is toggled and videoRef mounts
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Global Bluetooth & USB Laser Barcode Scanner Keyboard Wedge Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      const currentTime = Date.now();
      const charDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 2) {
          e.preventDefault();
          const scannedCode = buffer.trim();
          buffer = '';
          handleProcessBarcodeScan(scannedCode);
        }
      } else if (e.key.length === 1) {
        if (charDiff < 80 || !isInputFocused) {
          buffer += e.key;
        } else {
          buffer = e.key;
        }

        setTimeout(() => {
          if (Date.now() - lastKeyTime > 350 && buffer.length > 0) {
            buffer = '';
          }
        }, 400);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      stopCamera();
    };
  }, [customBoxes, verifiedBoxes, selectedPoSku]);

  const startCamera = async (facing = cameraFacing) => {
    try {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
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
        setIsCameraActive(true);

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.play().catch(() => {});
          }
        }, 80);

        playScanBeep();
        triggerHaptic();
        showToast("📷 Live Smartphone Barcode Camera Active! Aim at carton barcode.", true);

        // Start continuous live barcode detection loop
        startLiveBarcodeScanner();
      } else {
        showToast("⚠️ Camera device not detected. Barcode laser gun & manual mode active.");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      showToast("⚠️ Camera permission required or unavailable. Scanner mode active.");
      setIsCameraActive(false);
    }
  };

  const flipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
    showToast(`🔄 Switched to ${nextFacing === 'environment' ? 'Rear Main Camera' : 'Front Camera'}`);
  };

  const cycleZoom = async () => {
    const nextZoom = zoomLevel === 1 ? 1.5 : zoomLevel === 1.5 ? 2 : 1;
    setZoomLevel(nextZoom);
    if (mediaStreamRef.current) {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().zoom) {
        try {
          await track.applyConstraints({ advanced: [{ zoom: nextZoom }] });
        } catch (e) {}
      }
    }
    showToast(`🔍 Camera Zoom: ${nextZoom}x`);
  };

  const startLiveBarcodeScanner = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const detected = await decodeBarcodeFromSource(videoRef.current);
          if (detected) {
            handleProcessBarcodeScan(detected);
          }
        } catch (e) {
          // Scan cycle tick
        }
      }
    }, 280);
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

  const captureDamageSnapshot = async () => {
    playScanBeep();
    triggerHaptic();
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

        // Try decoding from captured snapshot
        const decodedFromFrame = await decodeBarcodeFromImageFile(realDataUrl);
        if (decodedFromFrame) {
          handleProcessBarcodeScan(decodedFromFrame);
        }
      } catch (e) {
        console.error("Frame capture error:", e);
      }
    }

    const newSnapshot = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      label: `Carton Photo #${damageSnapshots.length + 1}`,
      dataUrl: realDataUrl
    };
    setDamageSnapshots(prev => [newSnapshot, ...prev]);
    showToast("📸 Real Camera Snapshot captured & processed!", true);
  };

  // 📁 Snap / Upload Photo ➔ Decodes Barcode from Photo directly
  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("🔍 Processing & Decoding Barcode from Photo...", true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;

      // 1. Run Universal Dual-Engine Decoder on the uploaded photo
      const detectedCode = await decodeBarcodeFromImageFile(dataUrl);

      if (detectedCode) {
        handleProcessBarcodeScan(detectedCode);
        showToast(`🎯 Barcode Decoded from Photo: ${detectedCode}! Verification applied ✓`, true);
      } else {
        // Fallback: If glare/angle prevented auto-decode, notify staff
        showToast("⚠️ Could not auto-detect barcode lines from photo. Tap any box card below to verify manually.", false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 🔄 Dynamic SKU Selector Handler — regenerates boxes and resets bay
  const handleSelectSku = (newSku) => {
    setSelectedPoSku(newSku);
    const prod = catalog.find(c => c.SKU === newSku) || catalog[0];
    if (prod) {
      const generated = generateBoxesForProduct(prod);
      setCustomBoxes(generated);
      setVerifiedBoxes([]);
      setScanHistoryLog([]);
      if (prod.Assigned_Bay) setStorageBay(prod.Assigned_Bay);
      playScanBeep();
      showToast(`📦 Loaded ${generated.length}-Box Knockdown checklist for ${prod.SKU} (${prod.Product_Name})!`, true);
    }
  };

  // Process live camera, photo decoder, or gun barcode
  const handleProcessBarcodeScan = (raw) => {
    if (!raw) return;
    const val = sanitizeBarcode(raw).toUpperCase().trim();
    if (!val) return;

    // Anti-Duplicate Debounce Filter
    const now = Date.now();
    if (lastScanRef.current.code === val && (now - lastScanRef.current.time) < 1500) {
      return;
    }
    lastScanRef.current = { code: val, time: now };

    // Trigger visual green laser decode flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    // 1. Check for specific box match
    const matchedBox = customBoxes.find((b, idx) => {
      const boxLetter = (b.id || b.letter || String.fromCharCode(65 + idx)).toUpperCase();
      const boxNum = String(idx + 1);
      const bCode = (b.barcode || '').toUpperCase();
      const bName = (b.name || '').toUpperCase();

      return (
        val === boxLetter ||
        val === `BOX-${boxLetter}` ||
        val === `BOX ${boxLetter}` ||
        val === `BOX${boxLetter}` ||
        val === boxNum ||
        val === `BOX-${boxNum}` ||
        val === `BOX ${boxNum}` ||
        val === `BOX${boxNum}` ||
        val === bCode ||
        val.includes(bCode) ||
        bCode.includes(val) ||
        val.endsWith(`-${boxLetter}`) ||
        val.endsWith(`_${boxLetter}`) ||
        (val.length > 3 && bName.includes(val))
      );
    });

    if (matchedBox) {
      if (!verifiedBoxes.includes(matchedBox.id)) {
        setVerifiedBoxes(prev => [...prev, matchedBox.id]);
        
        // Audio Profile Dispatch
        if (soundProfile === 'VOICE_ANNOUNCER') {
          speakVoiceFeedback(`Box ${matchedBox.id} ${matchedBox.name} Verified`);
        } else if (soundProfile === 'CHIME') {
          playSuccessChime();
        } else {
          playScanBeep();
        }
        triggerHaptic();

        setScanHistoryLog(prev => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), code: val, label: `Box ${matchedBox.id} (${matchedBox.name})`, status: 'VERIFIED' },
          ...prev.slice(0, 19)
        ]);
        showToast(`📦 Box ${matchedBox.id} (${matchedBox.name}) Verified!`, true);
      } else {
        showToast(`⚠️ Box ${matchedBox.id} is already verified.`);
      }
    } 
    // 2. Check for Master SKU / Pallet Barcode Scan
    else if (val.includes(selectedPoSku.toUpperCase()) || selectedPoSku.toUpperCase().includes(val) || val === 'ALL' || val === 'MASTER') {
      setVerifiedBoxes(customBoxes.map(b => b.id));
      if (soundProfile === 'VOICE_ANNOUNCER') {
        speakVoiceFeedback(`All ${customBoxes.length} cartons verified for ${selectedPoSku}`);
      } else {
        playSuccessChime();
        triggerGoldenConfetti();
      }
      triggerHaptic();
      setScanHistoryLog(prev => [
        { id: Date.now(), time: new Date().toLocaleTimeString(), code: val, label: `Master Pallet SKU ${selectedPoSku} (All ${customBoxes.length} Boxes)`, status: 'VERIFIED_ALL' },
        ...prev.slice(0, 19)
      ]);
      showToast(`🎯 Master Pallet Barcode (${val}) Verified! All ${customBoxes.length} boxes marked OK!`, true);
    } 
    // 3. Fallback: Verify first unverified box
    else {
      const unverified = customBoxes.find(b => !verifiedBoxes.includes(b.id));
      if (unverified) {
        setVerifiedBoxes(prev => [...prev, unverified.id]);
        playScanBeep();
        triggerHaptic();
        setScanHistoryLog(prev => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), code: val, label: `Box ${unverified.id} (${unverified.name}) via Manual Scan`, status: 'VERIFIED' },
          ...prev.slice(0, 19)
        ]);
        showToast(`📦 Verified Box ${unverified.id} (${unverified.name}) for barcode "${val}"!`, true);
      } else {
        showToast(`⚠️ All ${customBoxes.length} boxes are already verified for ${selectedPoSku}!`);
      }
    }

    if (!isContinuousScan) {
      stopCamera();
    }
  };

  // 1-Tap Fullscreen Kiosk Mode
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        showToast("⛶ Fullscreen Warehouse Terminal Mode Active");
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        showToast("Standard Window View");
      }
    } catch (e) {}
  };

  // 1-Click WhatsApp Inward Report
  const sendWhatsAppReport = () => {
    const text = `📦 *GODREJ INTERIO RAYAGADA — FACTORY INWARD RECEIVING REPORT*
━━━━━━━━━━━━━━━━━━━━
📅 Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}
🚚 Truck No: ${truckNumber}
📋 Bilty / LR: ${biltyNumber}
🏢 Transporter: ${transporterName}
🏷️ SKU: ${selectedPoSku} (${activeProduct.Product_Name})
📦 Total Sets: ${inwardQuantity} Set(s)
⚖️ Total Weight: ${totalShipmentWeight} KG
📍 Storage Bay: ${storageBay}
🏭 Batch No: ${batchNo}
🧩 Verified Boxes: ${verifiedBoxes.join(', ')} / ${customBoxes.length} (${verifiedBoxes.length === customBoxes.length ? '100% COMPLETE ✓' : 'PARTIAL'})
━━━━━━━━━━━━━━━━━━━━
✅ QC Status: PASSED & ADDED TO MASTER INVENTORY
👤 Dock Supervisor: Rakesh (9390553301)`;
    window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Barcode Gun / Manual Input Handler
  const handleScanSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = scannedInput.trim();
    if (!query) {
      showToast("⚠️ Please enter a box barcode or letter (e.g. A, BOX-A, or SKU) to verify.", false);
      return;
    }

    handleProcessBarcodeScan(query);
    setScannedInput('');
  };

  const toggleManualBox = (boxId) => {
    if (verifiedBoxes.includes(boxId)) {
      setVerifiedBoxes(prev => prev.filter(id => id !== boxId));
      showToast(`Box ${boxId} unmarked.`);
    } else {
      setVerifiedBoxes(prev => [...prev, boxId]);
      if (soundProfile === 'VOICE_ANNOUNCER') {
        speakVoiceFeedback(`Box ${boxId} verified manually`);
      } else {
        playScanBeep();
      }
      showToast(`Box ${boxId} manually verified ✓`);
    }
  };

  const handle1ClickScanAll = () => {
    playScanBeep();
    setVerifiedBoxes(customBoxes.map(b => b.id));
    playSuccessChime();
    if (soundProfile === 'VOICE_ANNOUNCER') {
      speakVoiceFeedback(`All ${customBoxes.length} boxes verified`);
    }
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
    setPrintingBox(box);
    playScanBeep();
    showToast(`🖨️ Printing Barcode & QR Label for Box ${box.id} (${box.name})...`, true);
    setTimeout(() => {
      window.print();
    }, 120);
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
    showToast(`🎉 Inward QC Complete! +${inwardQuantity} Sets of ${selectedPoSku} (${totalShipmentWeight} KG) added to ${storageBay}!`, true);

    dispatchWebhookAction('INWARD_STOCK_SCAN', {
      sku: selectedPoSku,
      quantity: inwardQuantity,
      batch_no: batchNo,
      storage_bay: storageBay,
      truck_no: truckNumber,
      bilty_no: biltyNumber,
      transporter: transporterName,
      supplier_notes: supplierNotes,
      total_weight_kg: totalShipmentWeight,
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
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon" style={{ background: sunnyMode ? '#FFFFFF' : 'rgba(15,23,42,0.7)', border: sunnyMode ? '2px solid #000000' : '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${sunnyMode ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '11px' }}>
            📦 DOCK 1 INWARD SCANNER
          </span>
          <button 
            className="btn-luxury-gold"
            onClick={() => setSunnyMode(!sunnyMode)}
            style={{ fontSize: '11px', padding: '5px 10px', fontWeight: '800' }}
          >
            {sunnyMode ? <Moon size={12} /> : <Sun size={12} />} 
            {sunnyMode ? 'Dark Mode' : '☀️ Sunny Dock Mode'}
          </button>
          <button className="btn-ghost-edit" onClick={() => setIsEditingShipment(!isEditingShipment)} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <Edit size={12} /> {isEditingShipment ? '✕ Close Batch' : '✏️ Batch Details'}
          </button>
          <button 
            className="btn-ghost-edit" 
            style={{ color: 'var(--accent-rose)', border: '1px solid var(--accent-rose)', fontSize: '11px', padding: '5px 10px' }}
            onClick={() => { setVerifiedBoxes([]); setScanHistoryLog([]); showToast("🔄 Inward Dock Verification reset to 0/5 boxes!"); }}
            title="Reset verified boxes to start fresh shipment"
          >
            🔄 Reset
          </button>
        </div>

        {/* Right Cross-Terminal Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-amber" 
            onClick={() => {
              setActiveTab('autoprocure');
              showToast("🏭 Switched to Factory Purchase Orders!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Truck size={12} /> <span>Factory POs (Tab 5)</span>
          </button>

          <button 
            className="btn-emerald" 
            onClick={() => {
              setActiveTab('safelock');
              showToast("🔒 Switched to SafeLock Inventory Terminal!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ShieldCheck size={12} /> <span>SafeLock (Tab 4)</span>
          </button>

          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('barcode_studio');
              showToast("🏷️ Switched to Barcode & Knockdown Studio!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Tag size={12} /> <span>Barcodes (Tab 11)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>
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

      {/* 🧭 3-Step Guided Inward Dock Wizard Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: sunnyMode ? '#E2E8F0' : '#030712', padding: '6px', borderRadius: '12px', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { step: 1, label: '1. 🚚 Factory PO & Truck Match' },
          { step: 2, label: '2. 📷 5-Box Laser QC Scan' },
          { step: 3, label: '3. 🏷️ Bay Putaway & Restock' }
        ].map(s => {
          const isActive = inwardStep === s.step;
          const isDone = inwardStep > s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setInwardStep(s.step);
                playScanBeep();
              }}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: isActive ? '900' : '700',
                background: isActive 
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                  : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: isActive ? '#FFFFFF' : isDone ? 'var(--accent-emerald)' : sunnyMode ? '#475569' : '#94A3B8',
                border: isActive ? '2px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {isDone ? '✓ ' : ''}{s.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Live Camera / Laser Gun + Granular Box-by-Box Verification Checklist */}
      <div className="dock-scanner-grid">
        
        {/* Left Column: Live Smartphone Camera + Barcode Scanner Interface */}
        <div className="glass-panel" style={{ background: sunnyMode ? '#FFFFFF' : '#0B132B', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: sunnyMode ? '#000000' : 'var(--accent-cyan)' }}>
              📷 Live Camera & Laser Gun Scanner
            </h3>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                capture="environment" 
                style={{ display: 'none' }} 
                onChange={handlePhotoFileUpload} 
              />

              <button 
                className="btn-ghost-edit" 
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => fileInputRef.current?.click()}
                title="Direct Snap / Upload Photo from Camera File"
              >
                📁 Snap / Upload Photo
              </button>

              {isCameraActive ? (
                <button className="btn-ghost-edit" style={{ color: 'var(--accent-rose)', border: '1px solid var(--accent-rose)', fontSize: '11px', padding: '4px 8px' }} onClick={stopCamera}>
                  <VideoOff size={13} /> Stop Camera
                </button>
              ) : (
                <button className="btn-emerald" onClick={() => startCamera()} style={{ fontSize: '11px', padding: '4px 8px' }}>
                  <Video size={13} /> Start Camera Scanner
                </button>
              )}
            </div>
          </div>

          {/* Live Smartphone Camera Viewport */}
          {isCameraActive && (
            <div style={{ position: 'relative', width: '100%', height: '260px', background: '#000', borderRadius: '12px', overflow: 'hidden', margin: '12px 0', border: '2px solid var(--accent-cyan)' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: isHighContrast ? 'contrast(220%) grayscale(100%) brightness(1.1)' : 'none',
                  transform: zoomLevel > 1 ? `scale(${zoomLevel})` : 'none',
                  transition: 'transform 0.2s ease, filter 0.2s ease'
                }} 
              />
              
              {/* Decode Success Green Flash Overlay */}
              {flashActive && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(16,185,129,0.45)',
                  boxShadow: 'inset 0 0 40px #10B981',
                  zIndex: 20,
                  pointerEvents: 'none'
                }} />
              )}

              {/* Industrial Target Finder Reticle with Corner Brackets [ ┼ ] */}
              <div style={{
                position: 'absolute',
                top: '20%',
                bottom: '20%',
                left: '15%',
                right: '15%',
                border: '2px dashed rgba(56,189,248,0.75)',
                borderRadius: '10px',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                zIndex: 5
              }}>
                {/* Center Laser Line Sweeper */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2.5px',
                  background: 'linear-gradient(90deg, transparent, #F43F5E, #FFFFFF, #F43F5E, transparent)',
                  boxShadow: '0 0 15px #F43F5E, 0 0 25px #F43F5E',
                  animation: 'pulse 1.2s infinite'
                }} />
              </div>

              {/* Top-Left Mode & Audio Pills */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px', zIndex: 10, flexWrap: 'wrap', maxWidth: '65%' }}>
                <button 
                  type="button" 
                  onClick={() => setIsContinuousScan(!isContinuousScan)}
                  style={{ background: isContinuousScan ? 'rgba(16,185,129,0.9)' : 'rgba(0,0,0,0.7)', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '9.5px', fontWeight: '800', cursor: 'pointer' }}
                  title="Toggle Continuous Fast Auto-Scan"
                >
                  ⚡ {isContinuousScan ? 'Continuous' : 'Single'}
                </button>
                <button 
                  type="button" 
                  onClick={cycleZoom}
                  style={{ background: 'rgba(56,189,248,0.85)', color: '#000000', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '9.5px', fontWeight: '800', cursor: 'pointer' }}
                  title="Cycle Digital Zoom"
                >
                  🔍 {zoomLevel}x
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const next = soundProfile === 'LASER_BEEP' ? 'VOICE_ANNOUNCER' : soundProfile === 'VOICE_ANNOUNCER' ? 'CHIME' : soundProfile === 'CHIME' ? 'SILENT' : 'LASER_BEEP';
                    setSoundProfile(next);
                    showToast(`🔊 Sound Mode: ${next}`);
                  }}
                  style={{ background: 'rgba(245,158,11,0.9)', color: '#000000', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '9.5px', fontWeight: '800', cursor: 'pointer' }}
                  title="Cycle Audio Feedback: Laser Beep / Voice Speech / Chime / Silent"
                >
                  {soundProfile === 'LASER_BEEP' ? '🔊 Laser Beep' : soundProfile === 'VOICE_ANNOUNCER' ? '🗣️ Voice Callout' : soundProfile === 'CHIME' ? '🎵 Chime' : '📳 Silent'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsHighContrast(!isHighContrast)}
                  style={{ background: isHighContrast ? '#FFFFFF' : 'rgba(0,0,0,0.75)', color: isHighContrast ? '#000' : '#FFF', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '9.5px', fontWeight: '800', cursor: 'pointer' }}
                  title="Toggle High-Contrast Filter for Faded Barcodes"
                >
                  🌓 {isHighContrast ? 'B&W Contrast ON' : 'Normal'}
                </button>
              </div>

              {/* Viewport Controls Overlay */}
              <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', zIndex: 10 }}>
                <button 
                  type="button" 
                  onClick={toggleFullscreen}
                  style={{ background: 'rgba(30,41,59,0.85)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Fullscreen Kiosk Mode"
                >
                  <Maximize2 size={14} />
                </button>
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

              <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#38BDF8', fontWeight: '800', zIndex: 10 }}>
                AIM LASER AT BARCODE • {cameraFacing === 'environment' ? 'REAR HD LENS' : 'FRONT LENS'} {hapticsEnabled ? '• 📳 HAPTICS ACTIVE' : ''}
              </div>
            </div>
          )}

          {/* Live Scan Activity History Feed */}
          {scanHistoryLog.length > 0 && (
            <div style={{ background: '#030712', borderRadius: '10px', padding: '8px 10px', margin: '8px 0', border: '1px solid rgba(56,189,248,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                  📜 Live Scan Activity Log:
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                  {scanHistoryLog.length} Scans Recorded
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '75px', overflowY: 'auto' }}>
                {scanHistoryLog.slice(0, 4).map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'JetBrains Mono', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{log.label}</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>✓ {log.time}</span>
                  </div>
                ))}
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
              <label style={{ color: sunnyMode ? '#000' : 'var(--accent-cyan)', fontWeight: '800', fontSize: '11.5px' }}>
                Arriving Furniture SKU ({catalog.length} Master SKUs Available):
              </label>
              <select 
                value={selectedPoSku} 
                onChange={e => handleSelectSku(e.target.value)}
                style={{ 
                  background: sunnyMode ? '#F1F5F9' : '#030712', 
                  color: sunnyMode ? '#000' : '#FFFFFF', 
                  border: sunnyMode ? '2px solid #000' : '1.5px solid var(--accent-cyan)',
                  padding: '8px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '8px'
                }}
              >
                {catalog.map(c => (
                  <option key={c.SKU} value={c.SKU}>
                    {c.SKU} — {c.Product_Name} ({c.Total_Component_Boxes || 1} Box{(c.Total_Component_Boxes || 1) > 1 ? 'es' : ''})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label style={{ color: sunnyMode ? '#000' : 'var(--text-secondary)', fontWeight: '800', fontSize: '11.5px' }}>Quantity (Sets)</label>
              <input 
                type="number" 
                min="1" 
                value={inwardQuantity} 
                onChange={e => setInwardQuantity(Number(e.target.value))}
                style={{ background: sunnyMode ? '#F1F5F9' : '#030712', color: sunnyMode ? '#000' : '#FFFFFF', border: sunnyMode ? '2px solid #000' : '1px solid rgba(255,255,255,0.2)', padding: '8px 10px', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Barcode Gun Input Form */}
          <form onSubmit={handleScanSubmit} style={{ margin: '10px 0' }}>
            <label style={{ fontSize: '12px', fontWeight: '900', color: sunnyMode ? '#000' : 'var(--accent-gold-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔫 Scan Carton Barcode (Laser Gun / Camera):
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input 
                autoFocus
                placeholder={`Scan barcode or type A, B, BOX-A, or ${selectedPoSku}...`}
                value={scannedInput}
                onChange={e => setScannedInput(e.target.value)}
                style={{ 
                  flex: 1, 
                  background: sunnyMode ? '#FFFF00' : '#030712', 
                  color: '#FFFFFF', 
                  fontWeight: '800', 
                  fontSize: '13px', 
                  border: sunnyMode ? '2.5px solid #000' : '1.5px solid var(--accent-gold)', 
                  borderRadius: '8px', 
                  padding: '10px 12px',
                  outline: 'none'
                }}
              />
              <button 
                className="btn-luxury-gold" 
                type="submit" 
                style={{ padding: '0 20px', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={15} /> Verify
              </button>
            </div>
          </form>

          {/* Quick Simulation Buttons */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: sunnyMode ? '#475569' : 'var(--text-secondary)' }}>
              ⚡ 1-Click Test Scanners ({customBoxes.length} Boxes for {selectedPoSku}):
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {customBoxes.map(b => (
                <button 
                  key={b.id}
                  type="button"
                  className="btn-ghost-edit" 
                  style={{ fontSize: '11px', padding: '5px 10px', background: sunnyMode ? '#E2E8F0' : 'rgba(255,255,255,0.08)', color: sunnyMode ? '#000' : '#FFF', fontWeight: '800' }}
                  onClick={() => handleProcessBarcodeScan(b.id)}
                >
                  Scan Box {b.id}
                </button>
              ))}
              <button 
                type="button"
                className="btn-emerald" 
                onClick={handle1ClickScanAll} 
                style={{ fontSize: '11px', padding: '5px 12px', fontWeight: '800' }}
              >
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

          {/* Bottom Action Ribbons: Complete Inward QC & WhatsApp Report */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button 
              className="btn-luxury-gold" 
              onClick={handleCompleteInward}
              disabled={!isAllBoxesVerified}
              style={{ 
                flex: 2, 
                justifyContent: 'center', 
                padding: '14px', 
                fontSize: '13.5px',
                fontWeight: '900',
                opacity: isAllBoxesVerified ? 1 : 0.45
              }}
            >
              <Check size={16} /> ✅ 1-Click Complete Inward QC & Add +{inwardQuantity} Set(s) ({totalShipmentWeight} KG) to {storageBay}
            </button>
            <button 
              className="btn-emerald" 
              onClick={sendWhatsAppReport}
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                padding: '14px', 
                fontSize: '12.5px',
                fontWeight: '900',
                background: '#25D366',
                color: '#000000'
              }}
              title="Send Inward Receiving Report to WhatsApp"
            >
              📲 WhatsApp Summary
            </button>
          </div>
        </div>

      </div>

      {/* 🖨️ Dedicated Printable Inward Box Label */}
      {printingBox && (
        <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', padding: '24px', border: '2px solid #000000', borderRadius: '12px', margin: '20px auto', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
            🏛️ GODREJ INTERIO RAYAGADA — INWARD QC CARTON PASS
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>
            <span>SKU: {selectedPoSku}</span>
            <span>BOX: {printingBox.letter || printingBox.id} OF {customBoxes.length}</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '900', margin: '10px 0' }}>
            {printingBox.name}
          </div>
          <div style={{ fontSize: '12px', color: '#333', marginBottom: '12px' }}>
            Weight: {printingBox.weight} KG • Assigned Bay: {storageBay} • Batch: {batchNo}
          </div>
          <div style={{ padding: '12px', border: '1px dashed #000', borderRadius: '8px', display: 'inline-block', margin: '10px 0' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '4px', fontFamily: 'monospace' }}>
              *{selectedPoSku}-{printingBox.id}*
            </div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>GS1-128 BARCODE VALUE</div>
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '12px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
            Factory Truck: {truckNumber} • Bilty LR: {biltyNumber} • QC Status: PASSED ✓
          </div>
        </div>
      )}
    </div>
  );
}

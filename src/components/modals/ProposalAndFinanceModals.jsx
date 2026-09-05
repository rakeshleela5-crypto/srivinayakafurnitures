import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Send, 
  Printer, 
  Share2, 
  DollarSign, 
  CreditCard, 
  RefreshCw, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  FileText,
  Smartphone,
  Layers,
  ArrowRight,
  TrendingDown,
  Copy,
  Mail,
  Plus,
  Trash2,
  Edit3,
  Gift,
  CheckCircle2,
  Sliders,
  Search,
  Tag,
  SlidersHorizontal,
  Calculator,
  Building2,
  Landmark
} from 'lucide-react';
import { DynamicQrCode } from '../../utils/qrcodeGenerator';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';
import { FURNITURE_CATALOG } from '../../data/initialData';

// =========================================================================
// 1. 📄 MASTER COMMERCIAL QUOTATION & MULTI-CHANNEL PROPOSAL MODAL
// =========================================================================
export function WhatsAppProposalModal({ isOpen, onClose, proposalData = {} }) {
  const { storeMeta, catalog = [], showToast } = useStore();

  // Active view mode: 'preview' (Live Proposal Sheet) vs 'edit' (Form Editor)
  const [activeTabMode, setActiveTabMode] = useState('preview');

  // Customer & Site Profile State
  const [customerName, setCustomerName] = useState(proposalData.customerName || "Dr. Subhashish Jena");
  const [customerPhone, setCustomerPhone] = useState(proposalData.customerPhone || "9437188291");
  const [customerEmail, setCustomerEmail] = useState(proposalData.customerEmail || "doctor.subhashish.jena@gmail.com");
  const [projectAddress, setProjectAddress] = useState(proposalData.address || "Gayatri Nagar Villa, Rayagada");
  const [proposalNumber, setProposalNumber] = useState(proposalData.proposalNumber || `QUO-GI-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [validityDays, setValidityDays] = useState(7);

  // Selected Furniture Items State
  const [items, setItems] = useState(proposalData.items || [
    { sku: "BED-MOD-001", name: "Solid King Bed (Hydraulic Teak)", mrp: 98000, price: 78247, warranty: "10 Years", qty: 1, specs: "Solid Teak Wood • 6.5x6 ft" },
    { sku: "ALM-MOD-001", name: "4-Door Sliding Mirror Wardrobe", mrp: 65000, price: 52000, warranty: "10 Years", qty: 1, specs: "CRCA Heavy Steel • 78x48 in" },
    { sku: "CHR-MOD-001", name: "Solid Teak Accent Armchair", mrp: 28000, price: 21890, warranty: "5 Years", qty: 1, specs: "High Density Foam • Teak Arms" }
  ]);

  // 🔍 Live Furniture Catalog Stock Search & Filter State
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [isCatalogSearchOpen, setIsCatalogSearchOpen] = useState(true);

  // Complementary Festive Free Gifts State
  const [freePillows, setFreePillows] = useState(true);
  const [freeProtector, setFreeProtector] = useState(true);
  const [freePolishKit, setFreePolishKit] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState(true);
  const [customGiftText, setCustomGiftText] = useState("Free White-Glove Installation & Teak Polish Care Kit");

  // ⭐ The 5 Value Schemes & Options State
  // 1. Finish Customization
  const [selectedFinish, setSelectedFinish] = useState("Imperial Teak Gloss (Scratch-Proof PU)");
  const [customFinishNotes, setCustomFinishNotes] = useState("Zero-VOC Natural Polish Coating");

  // 2. 0% No-Cost EMI Scheme
  const [includeEmi, setIncludeEmi] = useState(true);
  const [emiProvider, setEmiProvider] = useState("Bajaj Finserv"); // 'Bajaj Finserv' | 'HDFC PineLabs' | 'TVS Credit'
  const [emiTenure, setEmiTenure] = useState(12); // 3, 6, 9, 12, 18, 24 months

  // 3. Old Furniture Buyback / Exchange Credit
  const [includeTradeIn, setIncludeTradeIn] = useState(Boolean(proposalData.exchangeCredit && proposalData.exchangeCredit > 0));
  const [oldItemName, setOldItemName] = useState("Old King Size Wooden Bed (Solid Teak)");
  const [exchangeCredit, setExchangeCredit] = useState(proposalData.exchangeCredit || 8500);

  // 4. Executive Proposal & Warranty Terms
  const [warrantyYears, setWarrantyYears] = useState("10 Full Years");
  const [executiveTier, setExecutiveTier] = useState("VIP Showroom Platinum Tier");
  const [specialTerms, setSpecialTerms] = useState("7-Day Guaranteed Showroom Price Lock • 100% On-Time Delivery Guarantee");

  // 5. Target Room & Suite Specification
  const [roomTitle, setRoomTitle] = useState(proposalData.roomTitle || "Master Bedroom Suite (16 × 14 ft)");
  const [dimensions, setDimensions] = useState(proposalData.dimensions || "16' 4\" × 14' 2\" × 10' 0\"");
  const [roomImage, setRoomImage] = useState(proposalData.roomImage || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800");

  // 💰 Commercial Pricing & Discount Edit Controls
  const [discountMode, setDiscountMode] = useState('pct'); // 'pct' | 'flat'
  const [discountPct, setDiscountPct] = useState(8);
  const [flatDiscountAmount, setFlatDiscountAmount] = useState(0);
  const [isFinalOverride, setIsFinalOverride] = useState(false);
  const [customFinalAmount, setCustomFinalAmount] = useState('');
  const [advanceMode, setAdvanceMode] = useState('50pct'); // '50pct' | 'custom'
  const [customAdvanceAmount, setCustomAdvanceAmount] = useState('');
  const [proposalLang, setProposalLang] = useState('EN');

  // Sync props when opening
  useEffect(() => {
    if (proposalData.customerName) setCustomerName(proposalData.customerName);
    if (proposalData.customerPhone) setCustomerPhone(proposalData.customerPhone);
    if (proposalData.address) setProjectAddress(proposalData.address);
    if (proposalData.items && proposalData.items.length > 0) setItems(proposalData.items.map(it => ({ ...it, qty: it.qty || 1 })));
    if (proposalData.exchangeCredit !== undefined) {
      setExchangeCredit(proposalData.exchangeCredit);
      setIncludeTradeIn(proposalData.exchangeCredit > 0);
    }
  }, [proposalData]);

  if (!isOpen) return null;

  // Real-Time Commercial Calculations
  const totalMRP = items.reduce((sum, item) => sum + ((Number(item.mrp) || Number(item.price) || 50000) * (Number(item.qty) || 1)), 0);
  const baseSelling = items.reduce((sum, item) => sum + ((Number(item.price) || 50000) * (Number(item.qty) || 1)), 0);
  
  // Showroom Discount calculation (Percentage vs Flat Rupee)
  const comboDiscountAmount = discountMode === 'flat' 
    ? Number(flatDiscountAmount || 0) 
    : Math.round(baseSelling * (Number(discountPct || 0) / 100));

  const tradeInDeduction = includeTradeIn ? Number(exchangeCredit || 0) : 0;
  
  // Computed final vs manual override
  const autoFinalAmount = Math.max(0, baseSelling - comboDiscountAmount - tradeInDeduction);
  const finalAmount = (isFinalOverride && customFinalAmount !== '' && !isNaN(customFinalAmount)) 
    ? Math.max(0, Number(customFinalAmount)) 
    : autoFinalAmount;
  
  // Tax breakdown (18% GST included)
  const taxableBase = Math.round(finalAmount / 1.18);
  const cgst9 = Math.round((finalAmount - taxableBase) / 2);
  const sgst9 = finalAmount - taxableBase - cgst9;
  
  // 50% vs Custom Advance Token
  const advance50Pct = (advanceMode === 'custom' && customAdvanceAmount !== '' && !isNaN(customAdvanceAmount))
    ? Math.max(0, Number(customAdvanceAmount))
    : Math.round(finalAmount * 0.5);

  // 0% EMI Calculation
  const monthlyEmi = emiTenure > 0 ? Math.round(finalAmount / emiTenure) : finalAmount;

  const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // 115+ Catalog Search & Filter Engine
  const fullCatalog = (catalog && catalog.length > 0) ? catalog : FURNITURE_CATALOG;
  
  // High-Resolution Image Resolver for every furniture item
  const getItemImage = (it) => {
    if (it && it.image) return it.image;
    if (it && it.Image_URL) return it.Image_URL;
    if (it && it.thumbnail) return it.thumbnail;
    const match = fullCatalog.find(c => c.SKU === (it?.sku || it?.SKU));
    if (match && (match.Image_URL || match.image || match.thumbnail)) {
      return match.Image_URL || match.image || match.thumbnail;
    }
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
  };

  const filteredCatalog = fullCatalog.filter(p => {
    const cat = (p.Main_Category || '').toLowerCase();
    const sub = (p.Sub_Category || '').toLowerCase();
    const matchesCategory = selectedCategoryFilter === 'ALL' || 
      cat.includes(selectedCategoryFilter.toLowerCase()) || 
      sub.includes(selectedCategoryFilter.toLowerCase());
    
    const q = catalogSearchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesQuery = (p.SKU || '').toLowerCase().includes(q) ||
      (p.Product_Name || '').toLowerCase().includes(q) ||
      cat.includes(q) ||
      sub.includes(q) ||
      (p.Material_Spec || '').toLowerCase().includes(q) ||
      (p.Finish_Color || '').toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  // 1-Click Add product from Stock Catalog
  const handleAddCatalogProduct = (prod) => {
    const unitSelling = prod.Selling_Price_INR || prod.MRP_INR || 45000;
    const unitMRP = prod.MRP_INR || Math.round(unitSelling * 1.25);
    setItems(prev => [
      ...prev,
      {
        sku: prod.SKU || `SKU-${Date.now()}`,
        name: prod.Product_Name || 'Godrej Interio Premium Furniture',
        mrp: unitMRP,
        price: unitSelling,
        warranty: `${prod.Warranty_Years || 10} Years`,
        qty: 1,
        specs: prod.Material_Spec || prod.Dimensions || `${prod.Main_Category || 'Solid Wood'} Spec`,
        image: prod.Image_URL || prod.image || prod.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        thumbnail: prod.Image_URL || prod.image || prod.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        category: prod.Main_Category || prod.Category || 'Living Room',
        finish: prod.Finish_Color || prod.Color_Finish || 'Imperial Teak'
      }
    ]);
    playScanBeep();
    showToast(`➕ Added "${prod.Product_Name}" to Quotation!`, true);
  };

  // Add Custom Made-to-Order Item
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        sku: `CUST-MOD-${Math.floor(100 + Math.random() * 900)}`,
        name: "Custom Made-to-Order Furniture Piece",
        mrp: 35000,
        price: 28000,
        warranty: "5 Years",
        qty: 1,
        specs: "Custom Teak & Polish",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
        thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
        category: "Custom",
        finish: "Custom Finish"
      }
    ]);
    playScanBeep();
  };

  // Update specific item field
  const handleUpdateItem = (index, field, value) => {
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
    playScanBeep();
  };

  // =========================================================================
  // 📲 1. WHATSAPP DISPATCH HANDLER (WITH 4-LANGUAGE SUPPORT & VISUAL PHOTOS)
  // =========================================================================
  const handleSendWhatsApp = () => {
    playScanBeep();
    const upiLink = `upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${advance50Pct}&cu=INR&tn=${encodeURIComponent(`Token Advance for ${proposalNumber}`)}`;
    
    // Free gifts list
    const giftList = [
      freePillows ? '• 2x Ortho Memory Foam Pillows (₹3,600 Value - FREE)' : '',
      freeProtector ? '• Waterproof Mattress Protector (₹2,200 Value - FREE)' : '',
      freePolishKit ? '• Master Furniture Polish Care Kit (FREE)' : '',
      freeDelivery ? '• Free White-Glove Truck Delivery & Assembly in Rayagada' : '',
      customGiftText ? `• ${customGiftText}` : ''
    ].filter(Boolean).join('\n');

    let message = '';
    if (proposalLang === 'OR') {
      message = `*🏛️ ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ସରକାରୀ ବାଣିଜ୍ୟିକ କୋଟେସନ୍ ଏବଂ ପ୍ରସ୍ତାବ*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*କୋଟେସନ୍ ନଂ:* ${proposalNumber} (ବୈଧତା: ${validUntil})\n` +
        `*ଗ୍ରାହକ ନାମ:* ${customerName}\n` +
        `*ମୋବାଇଲ୍:* +91 ${customerPhone}\n` +
        `*ଡେଲିଭରି ଠିକଣା:* ${projectAddress}\n\n` +
        `🛋️ *ମନୋନୀତ ଫର୍ନିଚର ସାମଗ୍ରୀ ତାଲିକା:*\n` +
        items.map((it, idx) => `*${idx + 1}. ${it.name}* (Qty: ${it.qty})\n• SKU: ${it.sku} | ୱାରେଣ୍ଟି: ${it.warranty}\n• ମୂଲ୍ୟ: ₹${((it.price || 0) * (it.qty || 1)).toLocaleString()}\n• 📷 ଫଟୋ ରେଫରେନ୍ସ: ${getItemImage(it)}`).join('\n\n') + `\n\n` +
        `🎁 *ମାଗଣା ଉପହାର ଓ ଆଡ-ଅନ୍:*\n${giftList}\n\n` +
        `⭐ *୫ଟି ବିଶେଷ ସୁବିଧା ଓ ଯୋଜନା:*\n` +
        `1. 🧵 ଫିନିସ୍: ${selectedFinish}\n` +
        (includeEmi ? `2. 💳 ୦% ବିନା ସୁଧ EMI: ₹${monthlyEmi.toLocaleString()}/ମାସ (${emiTenure} ମାସ - ${emiProvider} / ₹0 ଅଗ୍ରିମ)\n` : '') +
        (includeTradeIn ? `3. 🔄 ପୁରୁଣା ଫର୍ନିଚର ଏକ୍ସଚେଞ୍ଜ୍ ରିହାତି: -₹${exchangeCredit.toLocaleString()} (${oldItemName})\n` : '') +
        `4. 📄 ଏକଜିକ୍ୟୁଟିଭ୍ ପ୍ରସ୍ତାବ: ${warrantyYears} ୱାରେଣ୍ଟି ସହିତ ୭-ଦିନ ମୂଲ୍ୟ ଗ୍ୟାରେଣ୍ଟି\n` +
        `5. 👨‍👩‍👧 ପାରିବାରିକ ପରାମର୍ଶ: ${roomTitle} (${dimensions})\n\n` +
        `💰 *ବାଣିଜ୍ୟିକ ହିସାବ:* \n` +
        `• ମୋଟ MRP: ₹${totalMRP.toLocaleString()}\n` +
        `• ଶୋ'ରୁମ୍ ରିହାତି (${discountPct}%): -₹${comboDiscountAmount.toLocaleString()}\n` +
        (includeTradeIn ? `• ପୁରୁଣା ଫର୍ନିଚର ଏକ୍ସଚେଞ୍ଜ୍: -₹${exchangeCredit.toLocaleString()}\n` : '') +
        `• *ନିଟ୍ ପ୍ରସ୍ତାବ ମୂଲ୍ୟ (GST 18% ସହିତ):* *₹${finalAmount.toLocaleString()}*\n` +
        `• *୫୦% ସୁରକ୍ଷିତ ଷ୍ଟକ୍ ବୁକିଂ ଟୋକନ୍:* *₹${advance50Pct.toLocaleString()}*\n\n` +
        `👉 *୫୦% ଟୋକନ୍ UPI ମାଧ୍ୟମରେ ଦେୟ କରନ୍ତୁ (GPay/PhonePe/Paytm):*\n${upiLink}\n\n` +
        `🌟 *ସମ୍ପୂର୍ଣ୍ଣ ଡିଜିଟାଲ୍ ଭିଜୁଆଲ୍ କୋଟେସନ୍ ଦେଖନ୍ତୁ:* https://shreeganesh-godrej.web.app\n` +
        `📍 *ଶୋ'ରୁମ୍:* ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ମୁଖ୍ୟ ରାସ୍ତା, ରାୟଗଡ଼ା | 📞 9390553301`;
    } else if (proposalLang === 'TE') {
      message = `*🏛️ గోద్రెజ్ ఇంటీరియో రాయగడ — కమర్షియల్ కొటేషన్ & డిజైన్ ప్రపోజల్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*కొటేషన్ నం:* ${proposalNumber} (వ్యాలిడిటీ: ${validUntil})\n` +
        `*కస్టమర్:* ${customerName}\n` +
        `*ఫోన్:* +91 ${customerPhone}\n` +
        `*డెలివరీ అడ్రస్:* ${projectAddress}\n\n` +
        `🛋️ *ఎంపిక చేసిన ఫర్నిచర్ ఐటమ్స్:*\n` +
        items.map((it, idx) => `*${idx + 1}. ${it.name}* (Qty: ${it.qty})\n• SKU: ${it.sku} | వారంటీ: ${it.warranty}\n• ధర: ₹${((it.price || 0) * (it.qty || 1)).toLocaleString()}\n• 📷 ఫోటో: ${getItemImage(it)}`).join('\n\n') + `\n\n` +
        `🎁 *ఉచిత కాంప్లిమెంటరీ గిఫ్ట్స్:*\n${giftList}\n\n` +
        `⭐ *5 ప్రత్యేక ప్రయోజనాలు & స్కీమ్స్:*\n` +
        `1. 🧵 ఫినిష్: ${selectedFinish}\n` +
        (includeEmi ? `2. 💳 0% వడ్డీ లేని EMI: ₹${monthlyEmi.toLocaleString()}/నెలకు (${emiTenure} నెలలు - ${emiProvider} / ₹0 డౌన్‌పేమెంట్)\n` : '') +
        (includeTradeIn ? `3. 🔄 పాత ఫర్నిచర్ ఎక్స్ఛేంజ్ డిస్కౌంట్: -₹${exchangeCredit.toLocaleString()} (${oldItemName})\n` : '') +
        `4. 📄 ఎగ్జిక్యూటివ్ ప్రపోజల్: ${warrantyYears} వారంటీ & 7 రోజుల ప్రైస్ లాక్\n` +
        `5. 👨‍👩‍👧 ఫ్యామిలీ కన్సల్టేషన్: ${roomTitle} (${dimensions})\n\n` +
        `💰 *కమర్షియల్ సమ్మరీ:*\n` +
        `• మొత్తం MRP: ₹${totalMRP.toLocaleString()}\n` +
        `• షోరూమ్ డిస్కౌంట్ (${discountPct}%): -₹${comboDiscountAmount.toLocaleString()}\n` +
        (includeTradeIn ? `• పాత ఫర్నిచర్ ఎక్స్ఛేంజ్: -₹${exchangeCredit.toLocaleString()}\n` : '') +
        `• *నెట్ ప్రపోజల్ ధర (18% GST తో):* *₹${finalAmount.toLocaleString()}*\n` +
        `• *50% సేఫ్‌లాక్ అడ్వాన్స్ టోకెన్:* *₹${advance50Pct.toLocaleString()}*\n\n` +
        `👉 *UPI ద్వారా 50% అడ్వాన్స్ చెల్లించండి:*\n${upiLink}\n\n` +
        `🌟 *పూర్తి డిజిటల్ విజువల్ కొటేషన్ చూడండి:* https://shreeganesh-godrej.web.app\n` +
        `📍 *షోరూమ్:* న్యూ బస్ స్టాండ్ దగ్గర, రాయగడ | 📞 9390553301`;
    } else if (proposalLang === 'HI') {
      message = `*🏛️ गोदरेज इंटीरियो रायगड़ा — आधिकारिक वाणिज्यिक कोटेशन व प्रस्ताव*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*कोटेशन संख्या:* ${proposalNumber} (वैधता: ${validUntil})\n` +
        `*ग्राहक का नाम:* ${customerName}\n` +
        `*फोन:* +91 ${customerPhone}\n` +
        `*डिलीवरी पता:* ${projectAddress}\n\n` +
        `🛋️ *चयनित फर्नीचर उत्पाद:*\n` +
        items.map((it, idx) => `*${idx + 1}. ${it.name}* (मात्रा: ${it.qty})\n• SKU: ${it.sku} | वारंटी: ${it.warranty}\n• कीमत: ₹${((it.price || 0) * (it.qty || 1)).toLocaleString()}\n• 📷 फोटो: ${getItemImage(it)}`).join('\n\n') + `\n\n` +
        `🎁 *निःशुल्क उपहार (फेस्टिव एड-ऑन्स):*\n${giftList}\n\n` +
        `⭐ *5 विशेष योजनाएं और विकल्प:*\n` +
        `1. 🧵 फिनिश: ${selectedFinish}\n` +
        (includeEmi ? `2. 💳 0% नो-कॉस्ट EMI: ₹${monthlyEmi.toLocaleString()}/माह (${emiTenure} महीने - ${emiProvider} / ₹0 डाउन पेमेंट)\n` : '') +
        (includeTradeIn ? `3. 🔄 पुराना फर्नीचर एक्सचेंज छूट: -₹${exchangeCredit.toLocaleString()} (${oldItemName})\n` : '') +
        `4. 📄 एग्जीक्यूटिव प्रस्ताव: ${warrantyYears} वारंटी और 7-दिन प्राइस लॉक गारंटी\n` +
        `5. 👨‍👩‍👧 फैमिली कंसल्टेशन: ${roomTitle} (${dimensions})\n\n` +
        `💰 *कमर्शियल बिल सारांश:*\n` +
        `• कुल MRP: ₹${totalMRP.toLocaleString()}\n` +
        `• शोरूम छूट (${discountPct}%): -₹${comboDiscountAmount.toLocaleString()}\n` +
        (includeTradeIn ? `• पुराना फर्नीचर एक्सचेंज: -₹${exchangeCredit.toLocaleString()}\n` : '') +
        `• *अंतिम प्रस्ताव मूल्य (18% GST सहित):* *₹${finalAmount.toLocaleString()}*\n` +
        `• *50% सेफलॉक एडवांस टोकन:* *₹${advance50Pct.toLocaleString()}*\n\n` +
        `👉 *UPI द्वारा 50% टोकन एडवांस का भुगतान करें:*\n${upiLink}\n\n` +
        `🌟 *संपूर्ण डिजिटल विजुअल कोटेशन देखें:* https://shreeganesh-godrej.web.app\n` +
        `📍 *शोरूम:* न्यू बस स्टैंड के पास, मेन रोड, रायगड़ा | 📞 9390553301`;
    } else {
      message = `*🏛️ GODREJ INTERIO RAYAGADA — OFFICIAL COMMERCIAL QUOTATION*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Quotation Ref:* ${proposalNumber} (Price Locked Till ${validUntil})\n` +
        `*Customer Name:* ${customerName}\n` +
        `*Phone:* +91 ${customerPhone}\n` +
        `*Site Address:* ${projectAddress}\n\n` +
        `🛋️ *SELECTED FURNITURE PIECES:*\n` +
        items.map((it, idx) => `*${idx + 1}. ${it.name}* (Qty: ${it.qty})\n• SKU: ${it.sku} | Warranty: ${it.warranty}\n• Price: ₹${((it.price || 0) * (it.qty || 1)).toLocaleString()}\n• 📷 Photo: ${getItemImage(it)}`).join('\n\n') + `\n\n` +
        `🎁 *COMPLIMENTARY FESTIVE ACCESSORIES (FREE ADD-ONS):*\n${giftList}\n\n` +
        `⭐ *THE 5 VALUE SCHEMES & OPTIONS:*\n` +
        `1. 🧵 Selected Finish: ${selectedFinish}\n` +
        (includeEmi ? `2. 💳 0% No-Cost EMI: ₹${monthlyEmi.toLocaleString()}/month (${emiTenure} Months via ${emiProvider} / ₹0 Downpayment)\n` : '') +
        (includeTradeIn ? `3. 🔄 Old Furniture Buyback Credit: -₹${exchangeCredit.toLocaleString()} (${oldItemName})\n` : '') +
        `4. 📄 Executive Proposal: ${warrantyYears} Warranty • 7-Day Price Lock Guarantee\n` +
        `5. 👨‍👩‍👧 Family & Room Bundle: ${roomTitle} (${dimensions})\n\n` +
        `💰 *COMMERCIAL PRICING BREAKDOWN:*\n` +
        `• Total Catalog MRP: ₹${totalMRP.toLocaleString()}\n` +
        `• Showroom Suite Discount (${discountPct}%): -₹${comboDiscountAmount.toLocaleString()}\n` +
        (includeTradeIn ? `• Old Furniture Trade-In Credit: -₹${exchangeCredit.toLocaleString()}\n` : '') +
        `• *Net Proposal Payable (GST 18% Incl.):* *₹${finalAmount.toLocaleString()}*\n` +
        `• *50% SafeLock Advance Token to Lock Stock:* *₹${advance50Pct.toLocaleString()}*\n\n` +
        `👉 *Click to Pay 50% Token via UPI (GPay/PhonePe/Paytm):*\n${upiLink}\n\n` +
        `🌟 *View Official Visual Proposal & Lookbook:* https://shreeganesh-godrej.web.app\n` +
        `📍 *Flagship Showroom:* Main Road, Near New Bus Stand, Rayagada (Odisha 765001) | 📞 +91 93905 53301`;
    }

    const cleanPhone = String(customerPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('SEND_WHATSAPP_PROPOSAL', {
      proposal_number: proposalNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      email: customerEmail,
      address: projectAddress,
      selected_models: items.map(it => `${it.name} (${it.sku} x${it.qty || 1} @ ₹${(it.price || 0).toLocaleString()})`).join('; '),
      total_mrp: totalMRP,
      showroom_discount: comboDiscountAmount,
      discount_mode: discountMode,
      trade_in_credit: tradeInDeduction,
      old_furniture_item: includeTradeIn ? oldItemName : '',
      total_amount: finalAmount,
      advance_token: advance50Pct,
      selected_finish: selectedFinish,
      emi_tenure: emiTenure,
      emi_monthly: monthlyEmi,
      emi_provider: emiProvider,
      free_gifts: [freePillows && '2x Memory Foam Pillows', freeProtector && 'Mattress Protector', freePolishKit && 'Teak Polish Kit', freeDelivery && 'White-Glove Delivery & Assembly', customGiftText].filter(Boolean).join(', '),
      valid_until: validUntil,
      language: proposalLang
    });

    playSuccessChime();
    triggerGoldenConfetti();
    window.open(whatsappUrl, '_blank');
    showToast(`📲 Commercial Quotation #${proposalNumber} dispatched to WhatsApp (+91 ${customerPhone})!`, true);
  };

  // =========================================================================
  // 📧 2. REAL-TIME GMAIL DISPATCH HANDLER (MOBILE GMAIL APP + WEB COMPOSE)
  // =========================================================================
  const handleSendGmail = () => {
    playScanBeep();
    const subject = `Official Commercial Quotation & Proposal #${proposalNumber} — Godrej Interio Rayagada for ${customerName}`;
    
    const body = `Dear ${customerName},

Thank you for visiting Godrej Interio, Rayagada Flagship Showroom.

We are pleased to present the official commercial quotation for your selected luxury furniture suite.

==================================================
🏛️ GODREJ INTERIO RAYAGADA — COMMERCIAL QUOTATION
Quotation Ref: ${proposalNumber}
Date: ${new Date().toLocaleDateString('en-GB')} (Valid till: ${validUntil})
Customer: ${customerName} | Phone: +91 ${customerPhone}
Delivery Site: ${projectAddress}
Target Space: ${roomTitle} (${dimensions})
==================================================

🛋️ SELECTED FURNITURE PIECES & PHOTO REFERENCES:
${items.map((it, idx) => `${idx + 1}. ${it.name} [SKU: ${it.sku}] (Qty: ${it.qty})
   - Dimensions/Specs: ${it.specs || 'Standard'}
   - Warranty: ${it.warranty}
   - Rate: ₹${((it.price || 0) * (it.qty || 1)).toLocaleString()}
   - 📷 Photo Reference: ${getItemImage(it)}`).join('\n\n')}

🎁 COMPLIMENTARY FESTIVE ACCESSORIES (100% FREE):
${freePillows ? '• 2x Ortho Memory Foam Pillows (₹3,600 Value - FREE)\n' : ''}${freeProtector ? '• Waterproof Mattress Protector (₹2,200 Value - FREE)\n' : ''}${freePolishKit ? '• Master Furniture Polish Care Kit (FREE)\n' : ''}${freeDelivery ? '• Free White-Glove Truck Delivery & Assembly in Rayagada\n' : ''}${customGiftText ? `• ${customGiftText}\n` : ''}
⭐ VALUE SCHEMES & OPTIONS INCLUDED:
1. Finish Customization: ${selectedFinish}
2. 0% No-Cost EMI: ₹${monthlyEmi.toLocaleString()}/month (${emiTenure} Months via ${emiProvider} / ₹0 Downpayment)
3. Old Furniture Buyback: ${includeTradeIn ? `₹${exchangeCredit.toLocaleString()} Trade-in Credit applied for ${oldItemName}` : 'Not Opted'}
4. Warranty & Terms: ${warrantyYears} Godrej Warranty • ${specialTerms}
5. Target Space: ${roomTitle} (${dimensions})

==================================================
💰 COMMERCIAL PRICING & TAX BREAKDOWN:
- Combined Catalog MRP: ₹${totalMRP.toLocaleString()}
- Showroom Suite Discount (${discountPct}%): -₹${comboDiscountAmount.toLocaleString()}
${includeTradeIn ? `- Old Furniture Trade-In Deduction: -₹${exchangeCredit.toLocaleString()}\n` : ''}- Taxable Value: ₹${taxableBase.toLocaleString()}
- CGST (9%): ₹${cgst9.toLocaleString()}
- SGST (9%): ₹${sgst9.toLocaleString()}
--------------------------------------------------
NET QUOTATION PAYABLE (GST 18% INCL.): ₹${finalAmount.toLocaleString()}
50% SAFELOCK STOCK ADVANCE TOKEN: ₹${advance50Pct.toLocaleString()}
==================================================

HOW TO LOCK STOCK & CONFIRM ORDER:
You can pay the 50% SafeLock advance token (₹${advance50Pct.toLocaleString()}) via UPI:
UPI ID: ${storeMeta.upiId}
Payee Name: ${storeMeta.storeName}
Link: upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${advance50Pct}&cu=INR&tn=${encodeURIComponent(`Token for ${proposalNumber}`)}

🌟 View Official Interactive Digital Proposal & Lookbook:
https://shreeganesh-godrej.web.app

Showroom Location:
Godrej Interio Flagship Showroom
Main Road, Near New Bus Stand, Rayagada, Odisha 765001
Contact: +91 93905 53301 / +91 94371 88291
GSTIN: 21AAAAA0000A1Z5

Warm regards,
Store Director & Executive Design Team
Godrej Interio Rayagada`;

    // Detect if running on mobile phone (Android / iOS)
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    
    const mailtoUrl = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Dispatch background cloud email logging webhook
    dispatchWebhookAction('SEND_EMAIL_QUOTATION', {
      proposal_number: proposalNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      address: projectAddress,
      selected_models: items.map(it => `${it.name} (${it.sku} x${it.qty || 1} @ ₹${(it.price || 0).toLocaleString()})`).join('; '),
      total_mrp: totalMRP,
      showroom_discount: comboDiscountAmount,
      discount_mode: discountMode,
      trade_in_credit: tradeInDeduction,
      total_amount: finalAmount,
      advance_token: advance50Pct,
      selected_finish: selectedFinish,
      emi_plan: includeEmi ? `₹${monthlyEmi.toLocaleString()}/mo (${emiTenure}M via ${emiProvider})` : 'Full Payment',
      free_gifts: [freePillows && '2x Memory Foam Pillows', freeProtector && 'Mattress Protector', freePolishKit && 'Teak Polish Kit', freeDelivery && 'White-Glove Delivery & Assembly', customGiftText].filter(Boolean).join(', '),
      valid_until: validUntil
    });

    playSuccessChime();

    if (isMobile) {
      // 📱 On Mobile: Instantly trigger native Gmail / Mail app intent
      window.location.href = mailtoUrl;
      showToast(`📱 Opening Gmail App on your mobile for ${customerEmail}...`, true);
    } else {
      // 💻 On Desktop: Open Gmail Web tab with fallback to mailto
      const win = window.open(gmailWebUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = mailtoUrl;
      }
      showToast(`📧 Gmail compose opened with commercial quotation for ${customerEmail}!`, true);
    }
  };

  // =========================================================================
  // 🏛️ 3. OFFICIAL BANK RTGS / DIRECT TRANSFER HANDLER
  // =========================================================================
  const handleCopyBankDetails = () => {
    const text = `🏛️ *GODREJ INTERIO RAYAGADA — OFFICIAL BANK RTGS DETAILS*\n━━━━━━━━━━━━━━━━━━━━\n• *Beneficiary Name:* Shree Ganesh Enterprises\n• *Bank Name:* HDFC Bank Ltd.\n• *Account Number:* 50200088192481\n• *Account Type:* Current Account\n• *IFSC Code:* HDFC0001892\n• *Branch:* Main Road, Rayagada (Odisha 765001)\n━━━━━━━━━━━━━━━━━━━━\n• *Quotation Reference:* #${proposalNumber}\n• *Customer Name:* ${customerName}\n• *Net Payable:* ₹${finalAmount.toLocaleString()}\n• *50% SafeLock Token:* ₹${advance50Pct.toLocaleString()}\n━━━━━━━━━━━━━━━━━━━━\n_Please share Bank UTR reference after transfer for instant SafeLock stock allocation._`;
    navigator.clipboard.writeText(text);
    playScanBeep();
    showToast(`📋 Official Showroom Bank RTGS Details for #${proposalNumber} copied for WhatsApp!`, true);
  };

  const handleLogBankRtgsPayment = () => {
    const utr = `HDFCR5${new Date().toISOString().slice(2,10).replace(/-/g,'')}${Math.floor(1000 + Math.random() * 9000)}`;
    dispatchWebhookAction('LOG_BANK_TRANSACTION', {
      transaction_id: `TXN-BNK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      flow_type: 'INWARD_CREDIT',
      bank_account: 'HDFC Bank Current A/c (***2481)',
      payment_mode: 'RTGS',
      utr_number: utr,
      party_name: customerName,
      amount: advance50Pct,
      linked_entity_type: 'CUSTOMER_QUOTATION',
      linked_id: proposalNumber,
      reconciliation_status: 'VERIFIED_AND_MATCHED',
      notes: `50% SafeLock Token for Quotation #${proposalNumber} (${items.length} SKUs)`,
      logged_by: 'Store Director'
    });
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`✅ Inward Bank RTGS ₹${advance50Pct.toLocaleString()} (UTR: ${utr}) logged to Bank_Transactions_Log!`, true);
  };

  // =========================================================================
  // 🖨️ 4. HARD COPY / PRINT PDF HANDLER
  // =========================================================================
  const handlePrintHardCopy = () => {
    playScanBeep();
    showToast(`🖨️ Generating A4 print-ready hard copy quotation for ${customerName}...`);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Modal Header & Navigation Bar (Hidden during print) */}
        <div className="modal-header no-print" style={{ borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-gold">🏛️ MASTER COMMERCIAL QUOTATION STUDIO</span>
              <span className="badge badge-emerald">PRICE LOCKED ({validityDays} DAYS)</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
              📄 Quotation #{proposalNumber} — {customerName}
            </h3>
          </div>
          
          <div className="modal-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* View/Edit Mode Toggle */}
            <div style={{ display: 'flex', background: '#030712', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => setActiveTabMode('preview')}
                style={{
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  borderRadius: '6px',
                  background: activeTabMode === 'preview' ? 'var(--accent-cyan)' : 'transparent',
                  color: activeTabMode === 'preview' ? '#000000' : '#94A3B8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                👁️ Live Document Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTabMode('edit')}
                style={{
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  borderRadius: '6px',
                  background: activeTabMode === 'edit' ? 'var(--accent-gold)' : 'transparent',
                  color: activeTabMode === 'edit' ? '#000000' : '#94A3B8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Details & 5 Schemes
              </button>
            </div>

            {/* Regional Language Switcher */}
            <div style={{ display: 'flex', gap: '2px', background: '#030712', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { id: 'EN', label: '🇬🇧 EN' },
                { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ' },
                { id: 'TE', label: '🇮🇳 తెలుగు' },
                { id: 'HI', label: '🇮🇳 HI' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setProposalLang(l.id)}
                  style={{
                    padding: '4px 6px',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    borderRadius: '4px',
                    background: proposalLang === l.id ? 'var(--accent-emerald)' : 'transparent',
                    color: proposalLang === l.id ? '#000000' : '#94A3B8',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* 3 DISPATCH BUTTONS */}
            <button className="btn-luxury-gold" onClick={handleSendWhatsApp} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <Send size={13} /> 📲 WhatsApp
            </button>

            <button className="btn-cyan" onClick={handleSendGmail} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <Mail size={13} /> 📧 Gmail
            </button>

            <button 
              type="button"
              className="btn-ghost-edit" 
              onClick={handleCopyBankDetails} 
              style={{ fontSize: '11px', padding: '6px 10px', color: '#34D399', border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.08)' }} 
              title="Copy Official Showroom Bank RTGS & NEFT details for High-Ticket VIP clients"
            >
              <Building2 size={13} /> 🏛️ Bank RTGS
            </button>

            <button className="btn-ghost-edit" onClick={handlePrintHardCopy} style={{ fontSize: '11px', padding: '6px 10px', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Printer size={13} /> 🖨️ Print (A4)
            </button>

            <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ✏️ EDIT MODE: LIVE FORM TO EDIT EVERY FIELD, GIFT, ITEM & 5 SCHEMES     */}
        {/* ========================================================================= */}
        {activeTabMode === 'edit' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '14px 0' }}>
            
            {/* 1. Customer & Quotation Profile */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '10px' }}>
                👤 1. CUSTOMER & QUOTATION METADATA (EDITABLE):
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="form-field">
                  <label>Customer Full Name</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>WhatsApp Phone</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Customer Gmail / Email ID</label>
                  <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Delivery Site Address / Villa Locality</label>
                  <input value={projectAddress} onChange={e => setProjectAddress(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Price Validity (Days)</label>
                  <input type="number" value={validityDays} onChange={e => setValidityDays(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* 2. Furniture Catalog Stock Search & Shortlisted Items */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1.5px solid rgba(56,189,248,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={15} color="var(--accent-cyan)" /> 🔍 2. LIVE FURNITURE CATALOG STOCK SEARCH ({fullCatalog.length} SKUs):
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button"
                    className="btn-ghost-edit" 
                    onClick={() => setIsCatalogSearchOpen(!isCatalogSearchOpen)} 
                    style={{ fontSize: '10.5px', padding: '3px 8px', color: 'var(--accent-cyan)' }}
                  >
                    {isCatalogSearchOpen ? '▲ Hide Stock Search' : '▼ Browse 115+ Stock'}
                  </button>
                  <button 
                    type="button"
                    className="btn-ghost-edit" 
                    onClick={handleAddItem} 
                    style={{ fontSize: '10.5px', padding: '3px 8px', color: 'var(--accent-gold-light)' }}
                  >
                    <Plus size={12} /> Add Custom Item
                  </button>
                </div>
              </div>

              {/* Collapsible Catalog Stock Search & Filter Bar */}
              {isCatalogSearchOpen && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  
                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {[
                      { id: 'ALL', label: `All Stock (${fullCatalog.length})` },
                      { id: 'Bedroom', label: '🛏️ Bedroom' },
                      { id: 'Living', label: '🛋️ Living & Sofas' },
                      { id: 'Dining', label: '🍽️ Dining' },
                      { id: 'Storage', label: '🚪 Wardrobes & Storage' },
                      { id: 'Recliner', label: '🪑 Recliners & Chairs' },
                      { id: 'Office', label: '💼 Office & Study' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`btn-ghost-edit ${selectedCategoryFilter === cat.id ? 'badge-cyan' : ''}`}
                        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px' }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Input Box */}
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                      type="text" 
                      placeholder="Type SKU (e.g. BED-MOD-001, WDR-MOD), Product Name, Material (Teak, Steel), or Finish..."
                      value={catalogSearchQuery}
                      onChange={e => setCatalogSearchQuery(e.target.value)}
                      style={{ width: '100%', paddingLeft: '34px', fontSize: '12px', background: '#070D18', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', color: '#FFFFFF', paddingRight: '28px' }}
                    />
                    {catalogSearchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setCatalogSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Live Search Matching Stock Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredCatalog.slice(0, 18).map(prod => (
                      <div 
                        key={prod.SKU}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono', color: 'var(--accent-gold-light)', fontWeight: '800' }}>{prod.SKU}</span>
                            <span style={{ fontSize: '9px', color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                              {prod.Warranty_Years || 10}Y Warranty
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px', lineHeight: '1.2' }}>
                            {prod.Product_Name}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px' }}>
                            {prod.Material_Spec || prod.Main_Category || 'Solid Wood'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                          <div>
                            <span style={{ fontSize: '11.5px', fontWeight: '900', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                              ₹{(prod.Selling_Price_INR || 0).toLocaleString()}
                            </span>
                            {prod.MRP_INR && prod.MRP_INR > prod.Selling_Price_INR && (
                              <span style={{ fontSize: '9.5px', color: '#64748B', textDecoration: 'line-through', marginLeft: '4px' }}>
                                ₹{(Number(prod?.MRP_INR) || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddCatalogProduct(prod)}
                            className="btn-emerald"
                            style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredCatalog.length === 0 && (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '12px' }}>
                        No furniture models found matching "{catalogSearchQuery}". Try another keyword or add a custom item!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shortlisted Items Line Table */}
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#CBD5E1', marginBottom: '8px' }}>
                📋 CURRENT QUOTATION LINE ITEMS ({items.length}):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '44px 2fr 1fr 0.8fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img 
                      src={getItemImage(item)} 
                      alt={item.name} 
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'; }}
                    />
                    <div>
                      <input 
                        value={item.name} 
                        onChange={e => handleUpdateItem(idx, 'name', e.target.value)} 
                        placeholder="Product Name" 
                        style={{ fontSize: '12px', padding: '4px 6px', fontWeight: '700', width: '100%' }}
                      />
                      <input 
                        value={item.specs || ''} 
                        onChange={e => handleUpdateItem(idx, 'specs', e.target.value)} 
                        placeholder="Specs / Dimensions" 
                        style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--accent-cyan)', marginTop: '2px', width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '9px', color: '#94A3B8' }}>SKU Code</label>
                      <input value={item.sku} onChange={e => handleUpdateItem(idx, 'sku', e.target.value)} style={{ fontSize: '11px', padding: '4px 6px', width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '9px', color: '#94A3B8' }}>Qty</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleUpdateItem(idx, 'qty', Math.max(1, (item.qty || 1) - 1))}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', borderRadius: '4px', width: '20px', height: '24px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty || 1} 
                          onChange={e => handleUpdateItem(idx, 'qty', Math.max(1, Number(e.target.value)))} 
                          style={{ fontSize: '11px', padding: '4px 4px', textAlign: 'center', width: '34px' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleUpdateItem(idx, 'qty', (item.qty || 1) + 1)}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', borderRadius: '4px', width: '20px', height: '24px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '9px', color: '#94A3B8' }}>Unit MRP (₹)</label>
                      <input type="number" value={item.mrp || Math.round((item.price || 40000) * 1.25)} onChange={e => handleUpdateItem(idx, 'mrp', Number(e.target.value))} style={{ fontSize: '11px', padding: '4px 6px', width: '100%', color: '#94A3B8' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '9px', color: 'var(--accent-gold-light)' }}>Unit Selling (₹)</label>
                      <input type="number" value={item.price} onChange={e => handleUpdateItem(idx, 'price', Number(e.target.value))} style={{ fontSize: '11px', padding: '4px 6px', fontWeight: '700', color: 'var(--accent-gold-light)', width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '9px', color: '#94A3B8' }}>Line Total (₹)</label>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'JetBrains Mono', paddingTop: '4px' }}>
                        ₹{((item.price || 0) * (item.qty || 1)).toLocaleString()}
                      </div>
                    </div>
                    <button type="button" className="btn-ghost-edit" onClick={() => handleRemoveItem(idx)} style={{ color: 'var(--accent-rose)', padding: '6px', border: 'none' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Complimentary Festive Gifts (Free Add-Ons) */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-emerald)', marginBottom: '8px' }}>
                🎁 3. COMPLIMENTARY FESTIVE ACCESSORIES (FREE ADD-ONS):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                  <input type="checkbox" checked={freePillows} onChange={e => setFreePillows(e.target.checked)} />
                  <span>2x Ortho Memory Foam Pillows (₹3,600 Value - <b>100% FREE</b>)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                  <input type="checkbox" checked={freeProtector} onChange={e => setFreeProtector(e.target.checked)} />
                  <span>Waterproof Mattress Protector (₹2,200 Value - <b>100% FREE</b>)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                  <input type="checkbox" checked={freePolishKit} onChange={e => setFreePolishKit(e.target.checked)} />
                  <span>Master Teak Wood Polish & Care Kit (<b>100% FREE</b>)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                  <input type="checkbox" checked={freeDelivery} onChange={e => setFreeDelivery(e.target.checked)} />
                  <span>White-Glove Truck Delivery & Carpenter Assembly (<b>100% FREE</b>)</span>
                </label>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Custom Extra Free Gift / Festive Add-on</label>
                  <input value={customGiftText} onChange={e => setCustomGiftText(e.target.value)} placeholder="e.g. Free Center Table Glass Top" style={{ marginTop: '2px' }} />
                </div>
              </div>
            </div>

            {/* 4. The 5 Value Schemes & Options Breakdown Configurator */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '10px' }}>
                ⭐ 4. THE 5 VALUE SCHEMES & OPTIONS CONFIGURATOR:
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                
                {/* 1. Finish Option */}
                <div className="form-field">
                  <label style={{ color: 'var(--accent-gold-light)' }}>1. Selected Finish Customization</label>
                  <select value={selectedFinish} onChange={e => setSelectedFinish(e.target.value)}>
                    <option value="Imperial Teak Gloss (Scratch-Proof PU)">Imperial Teak Gloss (Scratch-Proof PU)</option>
                    <option value="Royal Walnut Matte Finish">Royal Walnut Matte Finish</option>
                    <option value="Champagne Gold Luxury Velvet">Champagne Gold Luxury Velvet</option>
                    <option value="Natural Sheesham Oil Finish">Natural Sheesham Oil Finish</option>
                    <option value="Custom Factory Formulation">Custom Factory Formulation</option>
                  </select>
                </div>

                {/* 2. 0% EMI Scheme */}
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ color: 'var(--accent-cyan)' }}>2. 0% No-Cost EMI Plan</label>
                    <span style={{ fontSize: '10px', color: '#34D399' }}>₹{monthlyEmi.toLocaleString()}/mo</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={emiProvider} onChange={e => setEmiProvider(e.target.value)} style={{ flex: 1 }}>
                      <option value="Bajaj Finserv">Bajaj Finserv</option>
                      <option value="HDFC PineLabs">HDFC PineLabs</option>
                      <option value="TVS Credit">TVS Credit</option>
                    </select>
                    <select value={emiTenure} onChange={e => setEmiTenure(Number(e.target.value))} style={{ width: '110px' }}>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="9">9 Months</option>
                      <option value="12">12 Months (0%)</option>
                      <option value="18">18 Months</option>
                      <option value="24">24 Months</option>
                    </select>
                  </div>
                </div>

                {/* 3. Old Furniture Buyback */}
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ color: 'var(--accent-emerald)' }}>3. Old Furniture Trade-In Credit (₹)</label>
                    <label style={{ fontSize: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={includeTradeIn} onChange={e => setIncludeTradeIn(e.target.checked)} /> Include Trade-In
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input value={oldItemName} onChange={e => setOldItemName(e.target.value)} placeholder="Old Furniture Name" style={{ flex: 1.5 }} />
                    <input type="number" value={exchangeCredit} onChange={e => setExchangeCredit(Number(e.target.value))} placeholder="Amount" style={{ width: '100px', fontWeight: '800', color: 'var(--accent-emerald)' }} />
                  </div>
                </div>

                {/* 4. Executive Proposal & Warranty */}
                <div className="form-field">
                  <label style={{ color: '#A5B4FC' }}>4. Warranty & Executive Proposal Terms</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={warrantyYears} onChange={e => setWarrantyYears(e.target.value)} style={{ width: '130px' }}>
                      <option value="5 Full Years">5 Full Years</option>
                      <option value="10 Full Years">10 Full Years</option>
                      <option value="15 Full Years">15 Full Years</option>
                      <option value="Lifetime Structural">Lifetime Structural</option>
                    </select>
                    <input value={specialTerms} onChange={e => setSpecialTerms(e.target.value)} placeholder="Special Terms" style={{ flex: 1 }} />
                  </div>
                </div>

                {/* 5. Target Room / Suite Designation */}
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'var(--accent-rose)' }}>5. Target Room / Suite Designation</label>
                  <input value={roomTitle} onChange={e => setRoomTitle(e.target.value)} placeholder="Room Title (e.g. Master Bedroom Suite, Living Room)" />
                </div>

              </div>
            </div>

            {/* 5. Comprehensive Commercial Pricing, Discount & Final Amount Controls */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1.5px solid rgba(212,175,55,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={16} /> 💰 5. COMMERCIAL PRICING, DISCOUNT & FINAL SETTLEMENT CONTROLS:
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px' }}>
                  <span style={{ color: '#94A3B8' }}>Gross MRP: <b style={{ color: '#FFFFFF' }}>₹{totalMRP.toLocaleString()}</b></span>
                  <span style={{ color: 'var(--accent-emerald)' }}>Catalog Savings: <b>₹{Math.max(0, totalMRP - baseSelling).toLocaleString()}</b></span>
                </div>
              </div>

              {/* Discount Controls: Percentage vs Flat Rupee */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    🏷️ Showroom Discount Mode:
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className={`btn-ghost-edit ${discountMode === 'pct' ? 'badge-gold' : ''}`}
                      onClick={() => setDiscountMode('pct')}
                      style={{ fontSize: '10.5px', padding: '3px 8px' }}
                    >
                      % Percentage Discount
                    </button>
                    <button
                      type="button"
                      className={`btn-ghost-edit ${discountMode === 'flat' ? 'badge-gold' : ''}`}
                      onClick={() => setDiscountMode('flat')}
                      style={{ fontSize: '10.5px', padding: '3px 8px' }}
                    >
                      ₹ Flat Rupee Amount
                    </button>
                  </div>
                </div>

                {discountMode === 'pct' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {[0, 5, 8, 10, 12, 15, 20].map(pct => (
                      <button 
                        key={pct} 
                        type="button" 
                        onClick={() => { setDiscountPct(pct); setIsFinalOverride(false); }} 
                        className={`btn-ghost-edit ${discountPct === pct && !isFinalOverride ? 'badge-gold' : ''}`}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '700' }}
                      >
                        {pct}% {pct === 15 ? '(Mgr)' : pct === 20 ? '(Director)' : ''}
                      </button>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Custom %:</span>
                      <input 
                        type="number" 
                        value={discountPct} 
                        onChange={e => { setDiscountPct(Number(e.target.value)); setIsFinalOverride(false); }} 
                        style={{ width: '55px', padding: '3px 6px', fontSize: '11px', textAlign: 'center' }} 
                      />
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--accent-gold-light)', fontWeight: '800', marginLeft: 'auto' }}>
                      - ₹{comboDiscountAmount.toLocaleString()} Discount
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '700' }}>Flat Discount: ₹</span>
                      <input 
                        type="number" 
                        value={flatDiscountAmount} 
                        onChange={e => { setFlatDiscountAmount(Number(e.target.value)); setIsFinalOverride(false); }} 
                        placeholder="Enter discount amount" 
                        style={{ width: '130px', padding: '4px 8px', fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)' }} 
                      />
                    </div>
                    {[2000, 5000, 10000, 15000, 25000].map(amt => (
                      <button 
                        key={amt} 
                        type="button" 
                        onClick={() => { setFlatDiscountAmount(amt); setIsFinalOverride(false); }} 
                        className="btn-ghost-edit" 
                        style={{ padding: '3px 8px', fontSize: '10px' }}
                      >
                        +₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Final Quotation Value & Advance Settlement Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', alignItems: 'start' }}>
                
                {/* Final Net Amount Box with Direct Override */}
                <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                      💰 FINAL QUOTATION NET PAYABLE (GST 18% INCL.):
                    </span>
                    <label style={{ fontSize: '10px', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="checkbox" 
                        checked={isFinalOverride} 
                        onChange={e => {
                          setIsFinalOverride(e.target.checked);
                          if (e.target.checked) setCustomFinalAmount(String(autoFinalAmount));
                        }} 
                      />
                      <span>✏️ Round Deal Override</span>
                    </label>
                  </div>

                  {isFinalOverride ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>₹</span>
                      <input 
                        type="number" 
                        value={customFinalAmount} 
                        onChange={e => setCustomFinalAmount(e.target.value)} 
                        placeholder="e.g. 150000" 
                        style={{ flex: 1, fontSize: '15px', fontWeight: '900', color: 'var(--accent-gold-light)', padding: '6px 10px', border: '1.5px solid var(--accent-gold)' }} 
                      />
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>(Negotiated Lumpsum)</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                      ₹{finalAmount.toLocaleString()}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                    Taxable: ₹{taxableBase.toLocaleString()} • CGST (9%): ₹{cgst9.toLocaleString()} • SGST (9%): ₹{sgst9.toLocaleString()}
                  </div>
                </div>

                {/* Advance Token Payment Scheme */}
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                      💳 SAFELOCK STOCK ADVANCE TOKEN:
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        type="button" 
                        className={`btn-ghost-edit ${advanceMode === '50pct' ? 'badge-emerald' : ''}`}
                        onClick={() => setAdvanceMode('50pct')}
                        style={{ fontSize: '9.5px', padding: '2px 6px' }}
                      >
                        50% Standard
                      </button>
                      <button 
                        type="button" 
                        className={`btn-ghost-edit ${advanceMode === 'custom' ? 'badge-emerald' : ''}`}
                        onClick={() => {
                          setAdvanceMode('custom');
                          if (!customAdvanceAmount) setCustomAdvanceAmount(String(Math.round(finalAmount * 0.5)));
                        }}
                        style={{ fontSize: '9.5px', padding: '2px 6px' }}
                      >
                        Custom ₹
                      </button>
                    </div>
                  </div>

                  {advanceMode === 'custom' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-emerald)' }}>₹</span>
                      <input 
                        type="number" 
                        value={customAdvanceAmount} 
                        onChange={e => setCustomAdvanceAmount(e.target.value)} 
                        placeholder="Custom token advance" 
                        style={{ flex: 1, fontSize: '15px', fontWeight: '900', color: 'var(--accent-emerald)', padding: '6px 10px', border: '1.5px solid var(--accent-emerald)' }} 
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>
                      ₹{advance50Pct.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8' }}>(50% of Quotation)</span>
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                    Dynamic UPI QR Code updates instantly with this advance token amount!
                  </div>
                </div>

              </div>

            </div>

            {/* Switch to Preview Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button"
                className="btn-cyan" 
                onClick={() => setActiveTabMode('preview')} 
                style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '800', boxShadow: '0 0 15px rgba(56,189,248,0.4)' }}
              >
                👁️ View Live Quotation Document & QR Code ➔
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 👁️ PREVIEW MODE: THE A4 PRINTABLE MASTER COMMERCIAL QUOTATION SHEET       */}
        {/* ========================================================================= */}
        <div className="printable-area" style={{ display: activeTabMode === 'preview' ? 'flex' : 'none', flexDirection: 'column', gap: '16px', margin: '14px 0' }}>
          
          <div className="printable-quotation-sheet" style={{ background: '#030712', borderRadius: '16px', padding: '24px', border: '1.5px solid rgba(212,175,55,0.3)', color: '#FFFFFF' }}>
            
            {/* Header / Brand Title Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(212,175,55,0.4)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>🏛️</span>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold-light)', margin: 0, letterSpacing: '0.5px' }}>
                      GODREJ INTERIO RAYAGADA FLAGSHIP
                    </h2>
                    <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
                      Main Road, Near New Bus Stand, Rayagada, Odisha 765001 • 📞 +91 93905 53301 / +91 94371 88291
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                      GSTIN: 21AAAAA0000A1Z5 • Authorized Godrej Commercial Hub • Shree Ganesh Enterprises
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-gold" style={{ fontSize: '11px', padding: '4px 10px' }}>OFFICIAL COMMERCIAL PROPOSAL</span>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF', marginTop: '6px' }}>
                  Ref: {proposalNumber}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                  Price Guaranteed Till: {validUntil}
                </div>
              </div>
            </div>

            {/* Client & Project Profile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '800' }}>CLIENT PROFILE</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>{customerName}</div>
                <div style={{ fontSize: '11.5px', color: '#CBD5E1' }}>📞 +91 {customerPhone} • 📧 {customerEmail}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>📍 Site Address: {projectAddress}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '800' }}>TARGET SPACE & SPECIFICATION</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-cyan)' }}>{roomTitle}</div>
                <div style={{ fontSize: '11.5px', color: '#CBD5E1' }}>Dimensions: {dimensions}</div>
              </div>
            </div>

            {/* Itemized Furniture Pieces Table */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🛋️ SHORTLISTED FURNITURE PIECES:
              </div>
              <table className="luxury-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '28px' }}>#</th>
                    <th style={{ width: '56px', textAlign: 'center' }}>Photo</th>
                    <th>Furniture Model & Specifications</th>
                    <th>SKU Code</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th>Warranty</th>
                    <th style={{ textAlign: 'right' }}>MRP (₹)</th>
                    <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#94A3B8', fontSize: '11px' }}>{idx + 1}</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>
                        <img 
                          src={getItemImage(it)} 
                          alt={it.name}
                          style={{ 
                            width: '46px', 
                            height: '46px', 
                            objectFit: 'cover', 
                            borderRadius: '6px', 
                            border: '1px solid rgba(212,175,55,0.4)',
                            display: 'block',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{it.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{it.specs || 'Solid Wood / Premium CRCA Steel'}</div>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#94A3B8', fontSize: '11px' }}>{it.sku}</td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: '#FFFFFF' }}>{it.qty || 1}</td>
                      <td><span className="badge badge-emerald" style={{ fontSize: '9.5px' }}>{it.warranty || '10 Years'}</span></td>
                      <td style={{ textAlign: 'right', textDecoration: 'line-through', color: '#94A3B8', fontSize: '11px' }}>
                        ₹{((it.mrp || it.price || 50000) * (it.qty || 1)).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '900', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                        ₹{((it.price || 50000) * (it.qty || 1)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Complimentary Festive Gifts Callout Banner */}
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '4px' }}>
                🎁 COMPLIMENTARY FESTIVE ACCESSORIES & SERVICES (100% FREE):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '11.5px', color: '#FFFFFF' }}>
                {freePillows && <div>✓ <b>2x Ortho Memory Foam Pillows</b> (₹3,600 Value - <b>FREE</b>)</div>}
                {freeProtector && <div>✓ <b>Waterproof Mattress Protector</b> (₹2,200 Value - <b>FREE</b>)</div>}
                {freePolishKit && <div>✓ <b>Master Teak Wood Polish & Care Kit</b> (<b>FREE</b>)</div>}
                {freeDelivery && <div>✓ <b>Free White-Glove Truck Delivery & Assembly in Rayagada</b></div>}
                {customGiftText && <div style={{ gridColumn: 'span 2' }}>✓ <b>{customGiftText}</b></div>}
              </div>
            </div>

            {/* The 5 Value Schemes & Options Grid */}
            <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
                ⭐ THE 5 VALUE SCHEMES & OPTIONS SUMMARY:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '11.5px' }}>
                <div>
                  <span style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>1. 🧵 Selected Finish:</span>
                  <div style={{ color: '#FFFFFF', marginLeft: '14px' }}>{selectedFinish} ({customFinishNotes})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '800' }}>2. 💳 0% No-Cost EMI:</span>
                  <div style={{ color: '#FFFFFF', marginLeft: '14px' }}>
                    {includeEmi ? `₹${monthlyEmi.toLocaleString()}/mo for ${emiTenure} Months (${emiProvider} • ₹0 Down)` : 'Not Selected'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>3. 🔄 Old Furniture Buyback:</span>
                  <div style={{ color: '#FFFFFF', marginLeft: '14px' }}>
                    {includeTradeIn ? `₹${exchangeCredit.toLocaleString()} Trade-in deduction for ${oldItemName}` : 'No Exchange Claimed'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#A5B4FC', fontWeight: '800' }}>4. 📄 Executive Terms & Warranty:</span>
                  <div style={{ color: '#FFFFFF', marginLeft: '14px' }}>{warrantyYears} • {specialTerms}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--accent-rose)', fontWeight: '800' }}>5. 🏠 Target Room / Suite Designation:</span>
                  <div style={{ color: '#FFFFFF', marginLeft: '14px' }}>{roomTitle} ({dimensions})</div>
                </div>
              </div>
            </div>

            {/* Financial Totals & 50% UPI QR Payment Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', alignItems: 'center', background: '#070D18', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              
              {/* Financial Calculations */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginBottom: '3px' }}>
                  <span>Combined Catalog MRP:</span>
                  <span>₹{totalMRP.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-emerald)', marginBottom: '3px' }}>
                  <span>Showroom Festive Discount {discountMode === 'pct' ? `(${discountPct}%)` : '(Flat)'}:</span>
                  <span>- ₹{comboDiscountAmount.toLocaleString()}</span>
                </div>
                {includeTradeIn && exchangeCredit > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-cyan)', marginBottom: '3px' }}>
                    <span>Old Furniture Buyback Credit:</span>
                    <span>- ₹{exchangeCredit.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '3px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '3px' }}>
                  <span>Taxable Value (₹{taxableBase.toLocaleString()}) + 18% GST (CGST 9% + SGST 9%):</span>
                  <span>₹{(cgst9 + sgst9).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: '#FFFFFF', borderTop: '1.5px solid rgba(255,255,255,0.15)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Net Proposal Total (GST 18% Incl.):</span>
                  <span style={{ color: 'var(--accent-gold-light)' }}>₹{finalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  <span>{advanceMode === 'custom' ? 'SafeLock Advance Token (Custom):' : '50% SafeLock Advance Token to Lock Stock:'}</span>
                  <span>₹{advance50Pct.toLocaleString()}</span>
                </div>
              </div>

              {/* Dual Payment Options: UPI QR + Official Bank RTGS Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                
                {/* 1. Dynamic Token UPI QR Box */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '10px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize: '9.5px', fontWeight: '900', color: '#0F172A', marginBottom: '4px', textAlign: 'center', letterSpacing: '0.3px' }}>
                    OPTION 1: SCAN UPI QR (₹{advance50Pct.toLocaleString()})
                  </div>
                  <DynamicQrCode 
                    value={`upi://pay?pa=${storeMeta.upiId}&pn=${encodeURIComponent(storeMeta.storeName)}&am=${advance50Pct}&cu=INR&tn=${encodeURIComponent(`Token for ${proposalNumber}`)}`}
                    size={95}
                    fgColor="#0F172A"
                  />
                  <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#475569', marginTop: '4px', textAlign: 'center' }}>
                    UPI ID: {storeMeta.upiId} • GPay / PhonePe / Paytm
                  </div>
                </div>

                {/* 2. Official Bank RTGS Details Card (High-Ticket > ₹1L) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0A192F, #0F172A)', border: '1px solid rgba(52,211,153,0.3)', padding: '10px', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '9.5px', fontWeight: '900', color: '#34D399', marginBottom: '4px', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={11} /> OPTION 2: DIRECT BANK RTGS / NEFT
                    </div>
                    <div style={{ fontSize: '9px', color: '#CBD5E1', lineHeight: '1.4' }}>
                      <div><b>A/c Name:</b> Shree Ganesh Enterprises</div>
                      <div><b>Bank:</b> HDFC Bank Ltd.</div>
                      <div><b>A/c No:</b> <span style={{ color: '#FCD34D', fontFamily: 'monospace', fontWeight: 'bold' }}>50200088192481</span></div>
                      <div><b>IFSC:</b> <span style={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: 'bold' }}>HDFC0001892</span></div>
                      <div><b>Branch:</b> Main Road, Rayagada</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '8px', color: '#94A3B8', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '3px', marginTop: '3px' }}>
                    *Recommended for High-Ticket Orders &gt; ₹1,00,000
                  </div>
                </div>

              </div>

            </div>

            {/* 📸 VIP VISUAL DESIGN PORTFOLIO & SUITE GALLERY */}
            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1.5px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '16px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📸 VIP SUITE VISUAL PORTFOLIO & FINISH SPECIFICATIONS:
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>GODREJ INTERIO CERTIFIED</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: items.length > 2 ? 'repeat(3, 1fr)' : `repeat(${Math.max(1, items.length)}, 1fr)`, gap: '12px' }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', width: '100%', height: '110px', background: '#0B132B' }}>
                      <img 
                        src={getItemImage(it)} 
                        alt={it.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
                        }}
                      />
                      <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(0,0,0,0.75)', color: '#FFFFFF', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                        #{idx + 1} • {it.sku}
                      </span>
                      <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'var(--accent-gold)', color: '#000000', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>
                        Qty: {it.qty || 1}
                      </span>
                    </div>
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.2 }}>{it.name}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--accent-cyan)', marginTop: '2px' }}>{it.specs || 'Solid Teak / CRCA Heavy Steel'}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                        <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>Finish: <b>{selectedFinish.split(' ')[0]}</b></span>
                        <span style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>₹{((it.price || 0) * (it.qty || 1)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Showroom Seal & Authorized Signatory Line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '10px', color: '#64748B', maxWidth: '400px' }}>
                🛡️ Issued under Statutory Compliance of DPDP Act, 2023 & Indian Contract Act. Data Fiduciary: Shree Ganesh Enterprises (Godrej Interio Rayagada). Section 65B BSA Admissible Commercial Record.
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1.5px solid #CBD5E1', width: '180px', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '10.5px', fontWeight: '900', color: '#FFFFFF' }}>STORE DIRECTOR & MANAGER</div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>Godrej Interio Flagship Rayagada</div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Action Buttons (Hidden during print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button className="btn-ghost-edit" onClick={() => setActiveTabMode(activeTabMode === 'preview' ? 'edit' : 'preview')} style={{ fontSize: '11px', padding: '8px 12px' }}>
              {activeTabMode === 'preview' ? '✏️ Edit Quotation Details' : '👁️ View Live Preview'}
            </button>
            <button 
              type="button"
              className="btn-ghost-edit" 
              onClick={handleLogBankRtgsPayment} 
              style={{ fontSize: '11px', padding: '8px 12px', color: '#34D399', border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.08)' }} 
              title="Record that customer paid token advance directly via Bank RTGS/NEFT"
            >
              <Building2 size={13} /> 🏛️ Log Bank RTGS Token (₹{advance50Pct.toLocaleString()})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-luxury-gold" onClick={handleSendWhatsApp} style={{ fontSize: '12px', padding: '10px 14px', fontWeight: '800' }}>
              <Send size={14} /> 📲 Send WhatsApp Quote ({proposalLang})
            </button>
            <button className="btn-cyan" onClick={handleSendGmail} style={{ fontSize: '12px', padding: '10px 14px', fontWeight: '800' }}>
              <Mail size={14} /> 📧 Send via Gmail
            </button>
            <button className="btn-ghost-edit" onClick={handlePrintHardCopy} style={{ fontSize: '12px', padding: '10px 14px', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Printer size={14} /> 🖨️ Print Hard Copy (A4)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 2. 💳 INSTANT 0-COST EMI SCHEME COMPARISON MATRIX MODAL
// =========================================================================
export function EmiSchemeModal({ isOpen, onClose, amount = 125000, customerPhone = "9437188291" }) {
  const { showToast } = useStore();
  const [selectedProvider, setSelectedProvider] = useState('BAJAJ'); // 'BAJAJ' | 'HDFC' | 'TVS'
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [lang, setLang] = useState('EN');

  if (!isOpen) return null;

  const totalAmount = Number(amount) || 125000;

  const emiSchemes = [
    { tenure: 3, label: '3 Months (Super Fast)', monthly: Math.round(totalAmount / 3), interestRate: '0% Interest', processingFee: 0, downpayment: 0, popular: false },
    { tenure: 6, label: '6 Months (Zero Cost)', monthly: Math.round(totalAmount / 6), interestRate: '0% Interest', processingFee: 0, downpayment: 0, popular: false },
    { tenure: 9, label: '9 Months (Smart Budget)', monthly: Math.round(totalAmount / 9), interestRate: '0% Interest', processingFee: 499, downpayment: 0, popular: false },
    { tenure: 12, label: '12 Months (Flagship Choice)', monthly: Math.round(totalAmount / 12), interestRate: '0% Interest', processingFee: 0, downpayment: 0, popular: true },
    { tenure: 18, label: '18 Months (Extended Easy)', monthly: Math.round((totalAmount * 1.05) / 18), interestRate: '5.5% Reduced', processingFee: 799, downpayment: 0, popular: false },
    { tenure: 24, label: '24 Months (Lowest Monthly)', monthly: Math.round((totalAmount * 1.08) / 24), interestRate: '8.0% Extended', processingFee: 999, downpayment: 0, popular: false }
  ];

  const activeScheme = emiSchemes.find(s => s.tenure === selectedTenure) || emiSchemes[3];

  const generateEmiMessage = () => {
    if (lang === 'OR') {
      return `*💳 ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ୦% ବିନା ସୁଧ EMI ଯୋଜନା*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*ମୋଟ ଫର୍ନିଚର ମୂଲ୍ୟ:* ₹${totalAmount.toLocaleString()}\n` +
        `*ମନୋନୀତ ଫାଇନାନ୍ସ:* ${selectedProvider} Finance (${activeScheme.tenure} ମାସ)\n\n` +
        `💰 *ମାସିକ କିସ୍ତି (EMI):* ₹${(Number(activeScheme?.monthly) || 0).toLocaleString()} / ମାସ\n` +
        `🏷️ *ସୁଧ ହାର:* ${activeScheme.interestRate}\n` +
        `💵 *ଡାଉନ୍ ପେମେଣ୍ଟ:* ₹0 (ଜିରୋ ଅଗ୍ରିମ)\n` +
        `📄 *ପ୍ରୋସେସିଂ ଫି:* ₹${activeScheme.processingFee}\n\n` +
        `📋 *ଅନ୍ୟ ସମସ୍ତ EMI ବିକଳ୍ପ:*\n` +
        emiSchemes.map(s => `• ${s.tenure} ମାସ: ₹${(Number(s?.monthly) || 0).toLocaleString()}/ମାସ (${s.interestRate})`).join('\n') + `\n\n` +
        `👉 *ଆଧାର କାର୍ଡ ଏବଂ PAN ସହିତ ଷ୍ଟୋରରେ ତୁରନ୍ତ ୫ ମିନିଟରେ ଅନୁମୋଦନ!*\n` +
        `*ଶୋ'ରୁମ୍:* ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*💳 గోద్రెజ్ ఇంటీరియో రాయగడ — 0% వడ్డీ లేని EMI కొటేషన్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*మొత్తం ఫర్నిచర్ బిల్లు:* ₹${totalAmount.toLocaleString()}\n` +
        `*ఎంచుకున్న ఫైనాన్స్:* ${selectedProvider} Finance (${activeScheme.tenure} నెలలు)\n\n` +
        `💰 *నెలవారీ వాయిదా (EMI):* ₹${(Number(activeScheme?.monthly) || 0).toLocaleString()} / నెలకు\n` +
        `🏷️ *వడ్డీ రేటు:* ${activeScheme.interestRate}\n` +
        `💵 *డౌన్‌పేమెంట్:* ₹0 (జీరో అడ్వాన్స్)\n` +
        `📄 *ప్రాసెసింగ్ ఫీజు:* ₹${activeScheme.processingFee}\n\n` +
        `📋 *అందుబాటులో ఉన్న EMI ప్లాన్స్:*\n` +
        emiSchemes.map(s => `• ${s.tenure} నెలలు: ₹${(Number(s?.monthly) || 0).toLocaleString()}/నెలకు (${s.interestRate})`).join('\n') + `\n\n` +
        `👉 *ఆధార్ / పాన్ కార్డ్‌తో కేవలం 5 నిమిషాల్లో తక్షణ అనుమతి!*\n` +
        `*షోరూమ్:* న్యూ బస్ స్టాండ్ దగ్గర, రాయగడ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*💳 गोदरेज इंटीरियो रायगड़ा — 0% नो-कॉस्ट EMI कोटेशन*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*कुल फर्नीचर बिल:* ₹${totalAmount.toLocaleString()}\n` +
        `*चयनित फाइनेंस:* ${selectedProvider} Finance (${activeScheme.tenure} महीने)\n\n` +
        `💰 *मासिक किस्त (EMI):* ₹${(Number(activeScheme?.monthly) || 0).toLocaleString()} / महीना\n` +
        `🏷️ *ब्याज दर:* ${activeScheme.interestRate}\n` +
        `💵 *डाउन पेमेंट:* ₹0 (जीरो एडवांस)\n` +
        `📄 *प्रोसेसिंग फीस:* ₹${activeScheme.processingFee}\n\n` +
        `📋 *उपलब्ध EMI विकल्प:*\n` +
        emiSchemes.map(s => `• ${s.tenure} महीने: ₹${(Number(s?.monthly) || 0).toLocaleString()}/माह (${s.interestRate})`).join('\n') + `\n\n` +
        `👉 *आधार और पैन कार्ड के साथ स्टोर पर 5 मिनट में तुरंत अप्रूवल!*\n` +
        `*शोरूम:* न्यू बस स्टैंड के पास, रायगड़ा | 📞 9390553301`;
    }
    return `*💳 GODREJ INTERIO RAYAGADA — 0% NO-COST EMI QUOTE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Total Furniture Bill:* ₹${totalAmount.toLocaleString()}\n` +
      `*Selected Scheme:* ${selectedProvider} Finance (${activeScheme.tenure} Months)\n\n` +
      `💰 *Monthly Installment:* ₹${(Number(activeScheme?.monthly) || 0).toLocaleString()} / month\n` +
      `🏷️ *Interest Rate:* ${activeScheme.interestRate}\n` +
      `💵 *Downpayment:* ₹0 (Zero Advance)\n` +
      `📄 *Processing Fee:* ₹${activeScheme.processingFee}\n\n` +
      `📋 *All EMI Options Available at Store:*\n` +
      emiSchemes.map(s => `• ${s.tenure} Months: ₹${(Number(s?.monthly) || 0).toLocaleString()}/mo (${s.interestRate})`).join('\n') + `\n\n` +
      `👉 *Instant Approval with Aadhaar / PAN at Store (5-Min Paperless)*\n` +
      `*Flagship Store:* Near New Bus Stand, Rayagada | 📞 +91 93905 53301`;
  };

  const handleShareEmiWhatsApp = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    const message = generateEmiMessage();
    const cleanPhone = String(customerPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    dispatchWebhookAction('SHARE_EMI_SCHEDULE', {
      total_amount: totalAmount,
      provider: selectedProvider,
      tenure: selectedTenure,
      phone: customerPhone,
      language: lang
    });

    window.open(url, '_blank');
    showToast(`📲 0% EMI Breakdown shared to WhatsApp (${customerPhone})!`, true);
  };

  const handleCopyEmi = () => {
    playScanBeep();
    navigator.clipboard.writeText(generateEmiMessage());
    showToast(`📋 Copied 0% EMI Breakdown to clipboard!`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '650px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        <div className="modal-header">
          <div>
            <span className="badge badge-gold">INSTANT ZERO-COST FINANCING MATRIX</span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              💳 0-Cost EMI Comparison (Total: ₹{totalAmount.toLocaleString()})
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 4-Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#030712', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '800' }}>🌐 WhatsApp Language:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'EN', label: '🇬🇧 EN' },
              { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ' },
              { id: 'TE', label: '🇮🇳 తెలుగు' },
              { id: 'HI', label: '🇮🇳 HI' }
            ].map(l => (
              <button 
                key={l.id} 
                className={`btn-ghost-edit ${lang === l.id ? 'badge-gold' : ''}`}
                onClick={() => setLang(l.id)}
                style={{ fontSize: '10.5px', padding: '3px 8px' }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '10px 0' }}>
          {[
            { id: 'BAJAJ', name: 'Bajaj Finserv', tag: '0% Paperless' },
            { id: 'HDFC', name: 'HDFC PineLabs', tag: 'Debit/Credit Card' },
            { id: 'TVS', name: 'TVS Credit', tag: 'Instant Aadhaar' }
          ].map(prov => (
            <button
              key={prov.id}
              onClick={() => setSelectedProvider(prov.id)}
              style={{
                background: selectedProvider === prov.id ? 'linear-gradient(135deg, #D4AF37, #B45309)' : 'rgba(30,41,59,0.7)',
                color: selectedProvider === prov.id ? '#000000' : '#FFFFFF',
                fontWeight: '900',
                border: selectedProvider === prov.id ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '10px 8px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12.5px' }}>{prov.name}</div>
              <div style={{ fontSize: '9.5px', opacity: 0.8 }}>{prov.tag}</div>
            </button>
          ))}
        </div>

        {/* EMI Tenure Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0' }}>
          {emiSchemes.map(sch => {
            const isSelected = selectedTenure === sch.tenure;
            return (
              <div
                key={sch.tenure}
                onClick={() => setSelectedTenure(sch.tenure)}
                style={{
                  background: isSelected ? 'rgba(212,175,55,0.15)' : '#030712',
                  border: isSelected ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                {sch.popular && (
                  <span className="badge badge-rose" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '9px', padding: '2px 6px' }}>
                    MOST POPULAR 🔥
                  </span>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>{sch.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: isSelected ? 'var(--accent-gold-light)' : '#FFFFFF', margin: '4px 0' }}>
                  ₹{(Number(sch?.monthly) || 0).toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>/ month</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  <span>{sch.interestRate}</span>
                  <span>Fee: ₹{sch.processingFee}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn-ghost-edit" onClick={handleCopyEmi} style={{ flex: 1, justifyContent: 'center' }}>
            <Copy size={14} /> Copy
          </button>
          <button className="btn-luxury-gold" onClick={handleShareEmiWhatsApp} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
            <Send size={15} /> 📲 Send EMI Plan to Customer WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 3. 🔄 OLD FURNITURE EXCHANGE & BUYBACK VALUATION ENGINE MODAL
// =========================================================================
export function FurnitureExchangeModal({ isOpen, onClose, onApplyDiscount, customerPhone = "9437188291", customerName = "Dr. Subhashish Jena" }) {
  const { showToast } = useStore();
  const [exchangeStep, setExchangeStep] = useState(1); // 1: Category & Wood, 2: Condition & Notes, 3: Valuation & Voucher

  const [category, setCategory] = useState('BED'); // 'BED' | 'SOFA' | 'DINING' | 'ALMIRAH'
  const [woodType, setWoodType] = useState('TEAK'); // 'TEAK' | 'SAL' | 'PLY' | 'STEEL'
  const [condition, setCondition] = useState('GOOD'); // 'MINT' | 'GOOD' | 'HEAVY_WEAR'
  const [customerNotes, setCustomerNotes] = useState('Old 6x6 King size wooden bed in good structural condition');
  const [phone, setPhone] = useState(customerPhone);
  const [lang, setLang] = useState('EN');

  if (!isOpen) return null;

  // AI Appraisal Algorithm
  const calculateBuybackValue = () => {
    let base = 5000;
    if (category === 'BED') base = 7000;
    if (category === 'SOFA') base = 6000;
    if (category === 'DINING') base = 5500;
    if (category === 'ALMIRAH') base = 4500;

    let woodMultiplier = 1.0;
    if (woodType === 'TEAK') woodMultiplier = 1.4; // Solid Teak has high scrap salvage
    if (woodType === 'SAL') woodMultiplier = 1.2;
    if (woodType === 'PLY') woodMultiplier = 0.8;
    if (woodType === 'STEEL') woodMultiplier = 0.9;

    let condMultiplier = 1.0;
    if (condition === 'MINT') condMultiplier = 1.2;
    if (condition === 'GOOD') condMultiplier = 1.0;
    if (condition === 'HEAVY_WEAR') condMultiplier = 0.7;

    return Math.round((base * woodMultiplier * condMultiplier) / 100) * 100;
  };

  const buybackValue = calculateBuybackValue();
  const exchangeCertNo = `EXC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const generateBuybackMessage = () => {
    if (lang === 'OR') {
      return `*🔄 ଗୋଦ୍ରେଜ୍ ଇଣ୍ଟେରିଓ ରାୟଗଡ଼ା — ପୁରୁଣା ଫର୍ନିଚର ଏକ୍ସଚେଞ୍ଜ୍ ସାର୍ଟିଫିକେଟ୍*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*ମାନ୍ୟବର ${customerName}*,\n` +
        `ଆପଣଙ୍କ ପୁରୁଣା ଫର୍ନିଚର ମୂଲ୍ୟାୟନ ସଫଳ ହୋଇଛି ଏବଂ ଆପଣଙ୍କୁ ନୂଆ ଗୋଦ୍ରେଜ୍ ଫର୍ନିଚର କ୍ରୟ ପାଇଁ ଏକ୍ସଚେଞ୍ଜ୍ କ୍ରେଡିଟ୍ ପ୍ରଦାନ କରାଗଲା।\n\n` +
        `📜 *ସାର୍ଟିଫିକେଟ୍ ନଂ:* #${exchangeCertNo}\n` +
        `🪵 *ପୁରୁଣା ସାମଗ୍ରୀ:* ${category === 'BED' ? 'Double Bed (Wooden)' : category === 'SOFA' ? 'Sofa Set' : category === 'DINING' ? 'Dining Table' : 'Almirah'} (${woodType})\n` +
        `🔍 *କଣ୍ଡିସନ୍:* ${condition}\n` +
        `💰 *ଏକ୍ସଚେଞ୍ଜ୍ ରିହାତି ମୂଲ୍ୟ:* *₹${buybackValue.toLocaleString()}*\n\n` +
        `✨ *ଏହି ରିହାତି ଆପଣଙ୍କ ନୂଆ ଗୋଦ୍ରେଜ୍ ମାଷ୍ଟର ସୁଇଟ୍ ବିଲ୍ ରୁ ସିଧାସଳଖ କଟାଯିବ।*\n` +
        `*ଶୋ'ରୁମ୍:* ନୂଆ ବସ୍ ଷ୍ଟାଣ୍ଡ ନିକଟ, ରାୟଗଡ଼ା | 📞 9390553301`;
    } else if (lang === 'TE') {
      return `*🔄 గోద్రెజ్ ఇంటీరియో రాయగడ — పాత ఫర్నిచర్ ఎక్స్ఛేంజ్ సర్టిఫికేట్*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*గౌరవనీయులైన ${customerName}*,\n` +
        `మీ పాత ఫర్నిచర్ ఎక్స్ఛేంజ్ క్రెడిట్ విలువ విజయవంతంగా నిర్ధారించబడింది.\n\n` +
        `📜 *సర్టిఫికేట్ నం:* #${exchangeCertNo}\n` +
        `🪵 *పాత ఫర్నిచర్:* ${category} (${woodType})\n` +
        `🔍 *కండిషన్:* ${condition}\n` +
        `💰 *ఎక్స్ఛేంజ్ డిస్కౌంట్ విలువ:* *₹${buybackValue.toLocaleString()}*\n\n` +
        `✨ *ఈ తగ్గింపు మీ కొత్త గోద్రెజ్ మాస్టర్ బెడ్‌రూమ్ సూట్ బిల్లుపై తక్షణమే వర్తిస్తుంది.*\n` +
        `*షోరూమ్:* న్యూ బస్ స్టాండ్ దగ్గర, రాయగడ | 📞 9390553301`;
    } else if (lang === 'HI') {
      return `*🔄 गोदरेज इंटीरियो रायगड़ा — पुराना फर्नीचर एक्सचेंज सर्टिफिकेट*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*आदरणीय ${customerName}*,\n` +
        `आपके पुराने फर्नीचर का मूल्यांकन सफलतापूर्वक हो गया है।\n\n` +
        `📜 *सर्टिफिकेट संख्या:* #${exchangeCertNo}\n` +
        `🪵 *पुराना फर्नीचर:* ${category} (${woodType})\n` +
        `🔍 *कंडीशन:* ${condition}\n` +
        `💰 *एक्सचेंज डिस्काउंट वैल्यू:* *₹${buybackValue.toLocaleString()}*\n\n` +
        `✨ *यह छूट आपके नए गोदरेज मास्टर सुइट के बिल से तुरंत घटा दी जाएगी।*\n` +
        `*शोरूम:* न्यू बस स्टैंड के पास, रायगड़ा | 📞 9390553301`;
    }
    return `*🔄 GODREJ INTERIO RAYAGADA — OLD FURNITURE BUYBACK CERTIFICATE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Dear ${customerName}*,\n` +
      `Your old furniture has been appraised and approved for instant trade-in credit.\n\n` +
      `📜 *Certificate Ref:* #${exchangeCertNo}\n` +
      `🪵 *Item Category:* ${category} (${woodType} Material)\n` +
      `🔍 *Physical Condition:* ${condition}\n` +
      `💰 *Instant Buyback Credit Value:* *₹${buybackValue.toLocaleString()}*\n\n` +
      `✨ *This credit will be directly deducted from your new Godrej Master Bedroom Suite Invoice.*\n` +
      `*Flagship Store:* Near New Bus Stand, Rayagada | 📞 +91 93905 53301`;
  };

  const handleApply = (sendWhatsApp = false) => {
    playSuccessChime();
    triggerGoldenConfetti();
    if (onApplyDiscount) {
      onApplyDiscount(buybackValue, {
        certNo: exchangeCertNo,
        category,
        woodType,
        condition,
        notes: customerNotes
      });
    }
    dispatchWebhookAction('RECORD_FURNITURE_EXCHANGE', {
      cert_number: exchangeCertNo,
      category,
      wood_type: woodType,
      condition,
      buyback_credit_inr: buybackValue,
      notes: customerNotes,
      phone: phone,
      language: lang
    });

    if (sendWhatsApp) {
      const message = generateBuybackMessage();
      const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }

    showToast(`🎉 Applied ₹${buybackValue.toLocaleString()} Old Furniture Exchange Credit to Invoice!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>TRADE-IN APPRAISAL WIZARD</span>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
              🔄 Old Furniture Exchange Appraiser
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={16} /></button>
        </div>

        {/* 🧭 LUXURY 3-STEP WIZARD PROGRESS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '12px 0 16px', background: '#030712', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { step: 1, label: '1. 🪵 Type & Wood' },
            { step: 2, label: '2. 🔍 Wear & Pick' },
            { step: 3, label: '3. 💰 Certificate' }
          ].map(s => {
            const isActive = exchangeStep === s.step;
            const isDone = exchangeStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setExchangeStep(s.step);
                  playScanBeep();
                }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: isActive ? '900' : '700',
                  background: isActive 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)' 
                    : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#000000' : isDone ? 'var(--accent-emerald)' : '#94A3B8',
                  border: isActive ? '1px solid #FFFFFF' : isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 🪵 STEP 1: CATEGORY & MATERIAL SELECTION */}
        {/* ========================================================================= */}
        {exchangeStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                1. Select Old Furniture Category:
              </label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="BED">Double Bed / King Bed (Wooden)</option>
                <option value="SOFA">Sofa Set (3+1+1 or L-Shape)</option>
                <option value="DINING">Dining Table Set (4 or 6 Seater)</option>
                <option value="ALMIRAH">Almirah / Wardrobe (Steel or Wood)</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                2. Select Primary Wood / Core Material:
              </label>
              <select value={woodType} onChange={e => setWoodType(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="TEAK">Solid Teak / Sheesham (High Scrap Salvage)</option>
                <option value="SAL">Sal Wood / Indian Hardwood</option>
                <option value="PLY">Commercial Plywood / Particle Board</option>
                <option value="STEEL">CRCA Heavy Steel Almirah</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setExchangeStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: Condition & Pickup ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🔍 STEP 2: WEAR CONDITION & PICKUP ADDRESS */}
        {/* ========================================================================= */}
        {exchangeStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                3. Age & Physical Wear Condition:
              </label>
              <select value={condition} onChange={e => setCondition(e.target.value)} style={{ padding: '10px', fontSize: '13px' }}>
                <option value="MINT">1–3 Years Old (Mint Condition / Reusable)</option>
                <option value="GOOD">4–7 Years Old (Good Structural Shape / Minor Scratches)</option>
                <option value="HEAVY_WEAR">8+ Years Old (Heavy Wear / Scrap Salvage)</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                Customer WhatsApp Mobile Number:
              </label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px', fontSize: '13px' }} />
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#CBD5E1' }}>
                Old Furniture Pickup Location & Notes:
              </label>
              <input value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} style={{ padding: '10px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn-ghost-edit" 
                onClick={() => {
                  setExchangeStep(1);
                  playScanBeep();
                }}
                style={{ padding: '10px 16px', fontSize: '12px' }}
              >
                ⬅️ Back: Type & Wood
              </button>
              <button 
                type="button" 
                className="btn-luxury-gold" 
                onClick={() => {
                  setExchangeStep(3);
                  playScanBeep();
                }}
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
              >
                Next: View Valuation & Certificate ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 💰 STEP 3: VALUATION CERTIFICATE & WHATSAPP VOUCHER */}
        {/* ========================================================================= */}
        {exchangeStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 4-Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#030712', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '800' }}>🌐 WhatsApp Language:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'EN', label: '🇬🇧 EN' },
                  { id: 'OR', label: '🇮🇳 ଓଡ଼ିଆ' },
                  { id: 'TE', label: '🇮🇳 తెలుగు' },
                  { id: 'HI', label: '🇮🇳 HI' }
                ].map(l => (
                  <button 
                    key={l.id} 
                    type="button"
                    className={`btn-ghost-edit ${lang === l.id ? 'badge-gold' : ''}`}
                    onClick={() => setLang(l.id)}
                    style={{ fontSize: '10.5px', padding: '3px 8px' }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Valuation Result Box */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1.5px solid var(--accent-gold)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Estimated Trade-In Buyback Credit Value
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-gold-light)', margin: '4px 0' }}>
                ₹{buybackValue.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                ✓ Certified Certificate #{exchangeCertNo} • Instant Deduction Ready
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button 
                type="button"
                className="btn-ghost-edit" 
                onClick={() => {
                  setExchangeStep(2);
                  playScanBeep();
                }}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                ⬅️ Back
              </button>
              <button className="btn-ghost-edit" onClick={() => handleApply(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Apply Discount
              </button>
              <button className="btn-luxury-gold" onClick={() => handleApply(true)} style={{ flex: 1.8, justifyContent: 'center', padding: '10px', fontWeight: '900' }}>
                <Check size={16} /> 📲 Apply & Send WhatsApp
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  Send, 
  Phone, 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  CreditCard, 
  MapPin, 
  Clock, 
  RotateCcw,
  MessageSquare,
  Share2,
  Search,
  Eye,
  Layers,
  ArrowRight,
  ShoppingCart,
  Grid,
  Filter,
  Tag,
  RefreshCw,
  Mic,
  Users
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';
import { generateConciergeFollowup, getGeminiApiKey } from '../services/geminiService';

export function MobileCustomerChatView() {
  const { 
    catalog, 
    storeMeta, 
    showToast, 
    openModal, 
    triggerSafeLockOrder, 
    inquiries, 
    setInquiries,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing
  } = useStore();

  // Extract SKU from URL parameters (e.g. #chat?sku=BED-MOD-001 or ?sku=BED-MOD-001)
  const getInitialSku = () => {
    try {
      const fullUrl = window.location.href;
      const match = fullUrl.match(/[?&]sku=([A-Za-z0-9-_]+)/i);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    } catch (e) {
      console.warn("Could not parse SKU from URL:", e);
    }
    return 'BED-MOD-001';
  };

  const [currentSku, setCurrentSku] = useState(getInitialSku);
  const [isProductCardExpanded, setIsProductCardExpanded] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const [cloudSynced, setCloudSynced] = useState(false);
  const chatBottomRef = useRef(null);

  // VIP Customer Profile State (Persisted in localStorage)
  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('OMNIBUILD_CUSTOMER_PROFILE');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Error reading customer profile:", e);
    }
    return { name: '', phone: '', address: 'Rayagada', isRegistered: false };
  });

  const [isLeadCaptureOpen, setIsLeadCaptureOpen] = useState(!customerProfile.isRegistered);
  const [leadName, setLeadName] = useState(customerProfile.name || '');
  const [leadPhone, setLeadPhone] = useState(customerProfile.phone || '');
  const [leadAddress, setLeadAddress] = useState(customerProfile.address || 'Rayagada');

  // 🎯 Behavioral Intent & Milestone Telemetry Tracking
  const [shoppingOccasion, setShoppingOccasion] = useState('HOME_UPGRADE'); // 'WEDDING' | 'GRIHA_PRAVESH' | 'HOME_UPGRADE'
  const [portalLang, setPortalLang] = useState('EN'); // 'EN' | 'OR' | 'TE' | 'HI'
  const [browsedCategories, setBrowsedCategories] = useState(['Bedroom']);
  const [browsedSkus, setBrowsedSkus] = useState([currentSku]);
  const [highestBudget, setHighestBudget] = useState(89790);
  const [sessionStartTime] = useState(Date.now());

  // 💬 SUPERPOWER 4: GEMINI MULTI-LINGUAL CONCIERGE STATES
  const [aiDraftMessage, setAiDraftMessage] = useState('');
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [isAiConciergePanelOpen, setIsAiConciergePanelOpen] = useState(false);
  const [conciergeTargetName, setConciergeTargetName] = useState(customerProfile.name || 'Shree Rajesh Panda');
  const [conciergeOccasion, setConciergeOccasion] = useState('Wedding Bedroom Suite');
  const [conciergeLang, setConciergeLang] = useState('ODIA');

  const handleGenerateAiConcierge = async () => {
    setIsGeneratingAiDraft(true);
    playScanBeep();
    try {
      const msg = await generateConciergeFollowup({
        customerName: conciergeTargetName,
        occasion: conciergeOccasion,
        language: conciergeLang,
        category: (catalog.find(c => c.SKU === currentSku) || catalog[0])?.Product_Name || 'Solid Teak Hydraulic Bed',
        budget: (catalog.find(c => c.SKU === currentSku) || catalog[0])?.Selling_Price_INR || 89790,
        quoteId: `QUO-${Math.floor(1000 + Math.random() * 9000)}`
      });
      setAiDraftMessage(msg);
      playSuccessChime();
      showToast(`✨ Culturally authentic ${conciergeLang} message drafted by Gemini!`, true);
    } catch (err) {
      showToast(`Error: ${err.message}`, false);
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleDispatchBot27Recovery = () => {
    dispatchWebhookAction('BOT_27_CONCIERGE_LEAD_RECOVERY', {
      customer_name: conciergeTargetName,
      customer_phone: customerProfile.phone || leadPhone || '9390553301',
      category: (catalog.find(c => c.SKU === currentSku) || catalog[0])?.Product_Name || 'Solid Teak Bed',
      occasion: conciergeOccasion,
      language: conciergeLang,
      budget: (catalog.find(c => c.SKU === currentSku) || catalog[0])?.Selling_Price_INR || 89790,
      recovery_step: 1
    });
    playSuccessChime();
    showToast(`🚀 BOT-27 AI Concierge Recovery dispatched & logged to Google Sheets!`, true);
  };

  // Interactive Product Customization & Tuner
  const [woodFinish, setWoodFinish] = useState('👑 Natural Teak');
  const [storageType, setStorageType] = useState('⚡ Hydraulic Auto-Lift');
  const [freePillows, setFreePillows] = useState(true);
  const [freeProtector, setFreeProtector] = useState(true);
  const [roomPreset, setRoomPreset] = useState('14x16'); // '12x14', '14x16', '16x18'
  const [isSafeLockModalOpen, setIsSafeLockModalOpen] = useState(false);
  const [tokenAmountOption, setTokenAmountOption] = useState(5000); // 5000 or 50%

  // ⏱️ AUTOMATED 5-MINUTE DWELL & DIRECTOR VIP ALERT TRIGGER
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const [hasDwellAlertTriggered, setHasDwellAlertTriggered] = useState(false);
  const [showDirectorAlertModal, setShowDirectorAlertModal] = useState(false);
  const [showExitIntentModal, setShowExitIntentModal] = useState(false);
  const hasTriggeredDwellRef = useRef(false);

  // Active Session Dwell Timer (counts up every second)
  useEffect(() => {
    const dwellInterval = setInterval(() => {
      setDwellSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(dwellInterval);
  }, []);

  // Exit-Intent Listener (triggers if mouse leaves viewport on desktop to close tab)
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !showExitIntentModal && !hasTriggeredDwellRef.current && dwellSeconds >= 15) {
        setShowExitIntentModal(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showExitIntentModal, dwellSeconds]);

  // Automated 5-Minute (300s) or High-Ticket 2-Minute (120s) Dwell & CRM Trigger
  useEffect(() => {
    const activeSp = catalog.find(c => c.SKU === currentSku)?.Selling_Price_INR || 89790;
    const effectiveBudget = Math.max(highestBudget || 0, activeSp);
    const threshold = effectiveBudget >= 150000 ? 120 : 300;

    if (dwellSeconds >= threshold && !hasTriggeredDwellRef.current) {
      hasTriggeredDwellRef.current = true;
      setHasDwellAlertTriggered(true);

      const custName = customerProfile.name || leadName || 'VIP Showroom Guest';
      const custPhone = customerProfile.phone || leadPhone || '9390553301';
      const prodName = catalog.find(c => c.SKU === currentSku)?.Product_Name || 'Godrej Luxury Collection';
      const isUltraVipLead = effectiveBudget >= 120000 || shoppingOccasion === 'WEDDING';

      // 1. Silent Background Synchronization to Google Sheets (Table 6: Inquiries_Log)
      dispatchWebhookAction('BOT_27_CONCIERGE_LEAD_RECOVERY', {
        customer_name: custName,
        customer_phone: custPhone,
        address: customerProfile.address || leadAddress || 'Rayagada',
        category: `${prodName} [${shoppingOccasion}]`,
        budget: effectiveBudget,
        occasion: shoppingOccasion,
        language: portalLang,
        ai_intent_score: isUltraVipLead ? '99% (👑 ULTRA-VIP DIRECTOR CALL > 1.5L)' : '95% (🔥 5-MIN HOT CONCIERGE LEAD)',
        dwell_time_seconds: dwellSeconds,
        recovery_step: 1
      });

      // 2. Immediate In-Memory Reflection in ShowroomCrmView
      if (setInquiries) {
        const autoHotLead = {
          Inquiry_ID: `INQ-AI-${Math.floor(1000 + Math.random() * 9000)}`,
          Inquiry_Date_Time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          Customer_Name: custName,
          Customer_Phone: custPhone,
          Address: customerProfile.address || leadAddress || 'Rayagada',
          Channel: '24/7 Mobile AI Concierge (5-Min Dwell)',
          Category_Models: `${prodName} [${shoppingOccasion}]`,
          Budget_INR: effectiveBudget,
          Urgency: isUltraVipLead ? 'DIRECTOR_URGENT' : 'HOT_LEAD',
          AI_Intent_Score: isUltraVipLead ? '99% (👑 ULTRA-VIP DIRECTOR CALL)' : '95% (🔥 5-MIN HOT LEAD)',
          Follow_Up_Date: 'Today (Within 5 Mins)',
          Status: 'ENGAGED_ON_MOBILE_AI',
          Assigned_Staff: 'Naresh & Naren (Store Directors)'
        };
        setInquiries(prev => [autoHotLead, ...(prev || [])]);
      }

      // 3. Audio Chime & VIP Director Privilege Modal
      playSuccessChime();
      triggerGoldenConfetti();
      setShowDirectorAlertModal(true);
      showToast("👑 VIP Privilege Unlocked: Store Director Direct Call Authorized!", true);
    }
  }, [dwellSeconds, highestBudget, customerProfile, leadName, leadPhone, leadAddress, currentSku, catalog, shoppingOccasion, portalLang, setInquiries, showToast]);

  // Silent Background Cloud Sync with Google Sheets on QR scan
  useEffect(() => {
    async function syncCatalogWithGoogleSheets() {
      try {
        const res = await dispatchWebhookAction('GET_ALL_STATUS', {});
        if (res && res.success) {
          setCloudSynced(true);
          console.log('📡 [Mobile Concierge] Live Google Sheets Catalog Synced');
        }
      } catch (err) {
        console.warn('Offline fallback active for mobile chat:', err);
      }
    }
    syncCatalogWithGoogleSheets();
  }, []);

  // Find product from catalog (with fallback)
  const activeProduct = catalog.find(c => c.SKU === currentSku) || catalog[0] || {
    SKU: 'BED-MOD-001',
    Product_Name: 'Solid King Bed (Hydraulic Storage)',
    Main_Category: 'Bedroom',
    Material_Spec: '100% Solid CP Teak Wood',
    Dimensions: '78" L × 72" W × 48" H',
    MRP_INR: 111000,
    Selling_Price_INR: 89790,
    Warranty_Years: 10,
    Image_URL: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600'
  };

  const mrp = activeProduct.MRP_INR || 111000;
  const sp = activeProduct.Selling_Price_INR || 89790;
  const savings = mrp - sp;
  const tokenAdvance50 = Math.round(sp * 0.5);

  const getOccasionLabel = () => {
    if (shoppingOccasion === 'WEDDING') return '💍 Wedding Suite (Marriage)';
    if (shoppingOccasion === 'GRIHA_PRAVESH') return '🏠 Griha Pravesh (New Home)';
    return '✨ Premium Room Refresh';
  };

  // Handle Lead Registration (Saves to Google Sheets & CRM with Occasion & Intent Score)
  const handleRegisterLead = (e) => {
    if (e) e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      showToast("⚠️ Please enter your Name and WhatsApp Mobile Number to unlock VIP discounts.", false);
      return;
    }

    const newProfile = {
      name: leadName.trim(),
      phone: leadPhone.trim(),
      address: leadAddress.trim() || 'Rayagada',
      isRegistered: true,
      occasion: shoppingOccasion,
      language: portalLang
    };
    setCustomerProfile(newProfile);
    localStorage.setItem('OMNIBUILD_CUSTOMER_PROFILE', JSON.stringify(newProfile));
    setIsLeadCaptureOpen(false);

    const isUltraVip = (highestBudget || sp) >= 150000;
    const intentLabel = isUltraVip 
      ? '99% (👑 ULTRA-VIP DIRECTOR CALL > 1.5L)'
      : (shoppingOccasion === 'WEDDING' || shoppingOccasion === 'GRIHA_PRAVESH')
        ? '96% (💍 HIGH-TICKET OCCASION LEAD)'
        : '92% (HOT MOBILE VIP LEAD)';

    // Register in CRM Leads State
    const newInquiry = {
      Inquiry_ID: `INQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      Customer_Name: newProfile.name,
      Customer_Phone: newProfile.phone,
      Address: newProfile.address,
      Category_Models: `${activeProduct.Product_Name} [${getOccasionLabel()}]`,
      Budget_INR: highestBudget || sp,
      Urgency: isUltraVip ? "DIRECTOR_URGENT" : "HIGH_HOT_LEAD",
      AI_Intent_Score: intentLabel,
      Status: "ENGAGED_ON_MOBILE_AI"
    };
    setInquiries(prev => [newInquiry, ...prev]);

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🎉 Welcome ${newProfile.name}! 8% Festive Discount Unlocked ✓`, true);

    // Dispatch to Master Google Apps Script Webhook (Table 6: Inquiries_Log)
    dispatchWebhookAction('LOG_INQUIRY', {
      customer_name: newProfile.name,
      customer_phone: newProfile.phone,
      address: newProfile.address,
      category: `${activeProduct.Product_Name} (${getOccasionLabel()} • Lang: ${portalLang})`,
      budget: highestBudget || sp,
      intent_score: intentLabel
    });

    // Multi-Lingual Personalized Welcome Greeting in Chat
    let welcomeGreeting = '';
    if (portalLang === 'OR') {
      welcomeGreeting = `ନମସ୍କାର **${newProfile.name} ବାବୁ**! 🙏\n\nଗୋଦରେଜ୍ ଇଣ୍ଟିରିଓ ରାୟଗଡା ତରଫରୁ ସ୍ୱାଗତ। ଆପଣଙ୍କ ${getOccasionLabel()} ପାଇଁ ସ୍ପେଶାଲ୍ ଫେଷ୍ଟିଭ୍ ପ୍ରାଇସ୍ ଲକ୍ ସୁରକ୍ଷିତ ହୋଇଛି:\n\n• ✨ **ଶୋରୁମ୍ ଡିସକାଉଣ୍ଟ:** ₹${savings.toLocaleString()} ରିହାତି\n• 🎁 **ମାଗଣା ଉପହାର:** 2x ଅର୍ଥୋ ପିଲୋ + ୱାଟରପ୍ରୁଫ୍ ପ୍ରୋଟେକ୍ଟର୍\n• 🚚 **ମାଗଣା ଡେଲିଭରୀ ଓ ଫିଟିଙ୍ଗ୍:** ରାୟଗଡା ଜିଲ୍ଲା ମଧ୍ୟରେ।\n\n48 ଘଣ୍ଟା ପାଇଁ ଏହି ଷ୍ଟକ୍ ସୁରକ୍ଷିତ ରଖିବାକୁ ତଳେ **[🔒 SafeLock]** ଟ୍ୟାପ୍ କରନ୍ତୁ!`;
    } else if (portalLang === 'TE') {
      welcomeGreeting = `నమస్కారం **${newProfile.name} గారు**! 🙏\n\nరాయగడ గోద్రెజ్ ఇంటీరియోకి స్వాగతం. మీ ${getOccasionLabel()} కోసం ప్రత్యేక పండుగ ఆఫర్ రిజర్వ్ చేయబడింది:\n\n• ✨ **షోరూమ్ డిస్కౌంట్:** ₹${savings.toLocaleString()} ఆదా\n• 🎁 **ఉచిత బహుమతులు:** 2x ఆర్థో పిల్లోస్ + ప్రొటెక్టర్\n• 🚚 **ఉచిత డెలివరీ & ఫిట్టింగ్:** రాయగడలో మాస్టర్ కార్పెంటర్ ద్వారా.\n\nఈ ప్రొడక్ట్‌ను 48 గంటలు రిజర్వ్ చేయడానికి క్రింద **[🔒 SafeLock]** ట్యాప్ చేయండి!`;
    } else {
      welcomeGreeting = `Namaskar **${newProfile.name} Ji**! 🙏\n\nI have registered your profile for **${newProfile.address}** delivery [${getOccasionLabel()}]. You now have exclusive access to:\n\n• ✨ **Showroom Spot Discount:** Up to ₹${savings.toLocaleString()} OFF\n• 🎁 **Complimentary Gifts:** 2x Ortho Pillows + Mattress Protector\n• 🚚 **Free Hydraulic Assembly:** In Rayagada by Master Carpenter Narayana Mistri.\n\nTap **[🔒 SafeLock Bed]** below to hold this piece for 48 hours, or ask me any question!`;
    }

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        title: `👑 VIP ${getOccasionLabel()} Offer Unlocked`,
        text: welcomeGreeting,
        time: "Just Now",
        matchedProducts: []
      }
    ]);
  };

  // 📲 1-Click WhatsApp Quote Saver / Exit-Intent Trigger
  const handleSaveQuoteToWhatsApp = () => {
    const custName = customerProfile.name || leadName || 'VIP Customer';
    const cleanStorePhone = (storeMeta.phone || '+919390553301').replace(/[^0-9]/g, '');

    let waText = '';
    if (portalLang === 'OR') {
      waText = `ନମସ୍କାର ନରେଶ ସାର୍ ଏବଂ ନରେନ ସାର୍! 🙏 ମୁଁ ${custName}। ମୁଁ ଗୋଦରେଜ୍ ଇଣ୍ଟିରିଓ ରାୟଗଡାର 24/7 AI Concierge ରେ ${activeProduct.Product_Name} (₹${sp.toLocaleString()}) ଦେଖୁଥିଲି [${getOccasionLabel()}]। ଦୟାକରି ଏହାର ରିଅଲ୍ ଶୋରୁମ୍ ଭିଡିଓ ଏବଂ ଫେଷ୍ଟିଭ୍ ଅଫର୍ ପଠାନ୍ତୁ।`;
    } else if (portalLang === 'TE') {
      waText = `నమస్కారం నరేష్ సర్ & నరేన్ సర్! 🙏 నేను ${custName}. రాయగడ గోద్రెజ్ ఇంటీరియో 24/7 పోర్టల్‌లో ${activeProduct.Product_Name} (₹${sp.toLocaleString()}) చూశాను [${getOccasionLabel()}]. దయచేసి షోరూమ్ వీడియో మరియు పండుగ ఆఫర్ వివరాలు పంపండి.`;
    } else {
      waText = `Namaskar Directors Naresh & Naren Sir! 🙏 I am ${custName}. I was exploring the ${activeProduct.Product_Name} (₹${sp.toLocaleString()}) on your Godrej Interio Rayagada 24/7 Concierge for my ${getOccasionLabel()}. Please send showroom floor video & festive offer details.`;
    }

    // Telemetry dispatch
    dispatchWebhookAction('LOG_INQUIRY', {
      customer_name: custName,
      customer_phone: customerProfile.phone || leadPhone || '94371',
      address: customerProfile.address || leadAddress || 'Rayagada',
      category: `${activeProduct.Product_Name} (${getOccasionLabel()} • ${portalLang})`,
      budget: highestBudget || sp,
      intent_score: (highestBudget || sp) >= 150000 ? '99% (👑 ULTRA-VIP DIRECTOR CALL > 1.5L)' : '95% (HOT CONCIERGE WHATSAPP)',
      channel: '24/7 AI Concierge (WhatsApp Quote Saved)'
    });

    window.open(`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(waText)}`, '_blank');
    showToast("📲 Quote & Festive Privileges saved to WhatsApp!", true);
  };

  // Handle 1-Click SafeLock Confirmation by Customer
  const handleConfirmCustomerSafeLock = () => {
    if (!customerProfile.isRegistered) {
      setIsLeadCaptureOpen(true);
      showToast("⚠️ Please enter your name and phone number to SafeLock this furniture piece.");
      return;
    }

    const giftsText = [freePillows ? '2x Ortho Pillows (FREE)' : '', freeProtector ? 'Mattress Protector (FREE)' : ''].filter(Boolean).join(', ');
    const skuSpec = `${activeProduct.SKU} (${activeProduct.Product_Name}) [Finish: ${woodFinish}, Storage: ${storageType}]${giftsText ? ` + Gifts: [${giftsText}]` : ''}`;

    const advancePaid = Number(tokenAmountOption) || 5000;

    const created = triggerSafeLockOrder({
      Customer_Name: customerProfile.name,
      Customer_Phone: customerProfile.phone,
      Project_Address: customerProfile.address,
      Ordered_SKU: skuSpec,
      Total_Amount_INR: sp,
      Advance_Paid_INR: advancePaid,
      Balance_Due_INR: sp - advancePaid,
      Delivery_Schedule: "Today, 04:30 PM",
      Assigned_Driver: "Tophan Gouda (Tata Ace OD-18-A-1234)",
      Carpenter_Assigned: "Narayana Mistri"
    });

    setIsSafeLockModalOpen(false);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🔒 Order #${created.Order_ID} SAFELOCKED for ${customerProfile.name}! Stock reserved in warehouse.`, true);

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        title: "🔒 SafeLock Reservation Confirmed!",
        text: `🎉 **Congratulations ${customerProfile.name} Ji!**\n\nYour **${activeProduct.Product_Name}** has been **SAFELOCKED (RESERVED)** under Order Ref: **#${created.Order_ID}**!\n\n• 📦 **Stock Reserved:** 1 Unit locked at Warehouse Dock 1\n• 💰 **Token Advance:** ₹${advancePaid.toLocaleString()} Settled via UPI QR\n• 🚚 **Delivery Scheduled:** Today, 04:30 PM (Driver: Tophan Gouda)\n• 🪚 **Installation:** Narayana Mistri assigned\n\nDirectors Naresh & Naren have received your order notification. Thank you for choosing Godrej Interio!`,
        time: "Just Now",
        matchedProducts: []
      }
    ]);
  };

  // Chat Messages State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      title: "Godrej Interio 24/7 AI Concierge",
      text: `Namaskar! 🙏 Welcome to Godrej Interio Rayagada Flagship Showroom.\n\nI see you are viewing our luxury **${activeProduct.Product_Name}** (${activeProduct.SKU}) on our showroom floor.\n\n• 🏷️ **Showroom Festive Price:** ₹${sp.toLocaleString()} (Save ₹${savings.toLocaleString()})\n• 🌳 **Craftsmanship:** ${activeProduct.Material_Spec || '100% Solid CP Teak Wood'}\n• 🛡️ **Factory Warranty:** ${activeProduct.Warranty_Years || 10} Years Certified\n\nAsk me anything about dimensions, custom fabrics, or ask to explore our **complete 115+ furniture catalog**!`,
      time: "Just Now",
      matchedProducts: []
    }
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Switch Active Featured Product
  const handleSwitchActiveProduct = (product) => {
    setCurrentSku(product.SKU);
    setIsProductCardExpanded(true);
    playSuccessChime();
    triggerGoldenConfetti();

    // 🎯 Track behavioral telemetry
    setBrowsedSkus(prev => Array.from(new Set([...prev, product.SKU])));
    if (product.Main_Category) {
      setBrowsedCategories(prev => Array.from(new Set([...prev, product.Main_Category])));
    }
    const pPrice = Number(product.Selling_Price_INR) || 0;
    if (pPrice > highestBudget) {
      setHighestBudget(pPrice);
    }

    const switchMsg = {
      id: Date.now(),
      sender: "bot",
      title: "🛋️ Product Showcase Updated",
      text: `✨ Now viewing **${product.Product_Name}** (${product.SKU})!\n\n• 🏷️ **Showroom Price:** ₹${Number(product.Selling_Price_INR).toLocaleString()} (MRP: ₹${Number(product.MRP_INR).toLocaleString()})\n• 🌳 **Spec:** ${product.Material_Spec || 'Solid Teak'}\n• 📐 **Dimensions:** ${product.Dimensions || 'Standard Size'}\n• 🛡️ **Warranty:** ${product.Warranty_Years || 5} Years\n\nWould you like to reserve this with a 50% token advance (₹${Math.round(Number(product.Selling_Price_INR) * 0.5).toLocaleString()}) or check room clearance?`,
      time: "Just Now",
      matchedProducts: []
    };

    setChatMessages(prev => [...prev, switchMsg]);
    showToast(`🛋️ Switched to: ${product.Product_Name}!`, true);
  };

  // Universal 115-to-200+ SKU NLP Search & Multi-Product Recommendation Engine
  const generateAiReply = (rawQuery) => {
    const q = (rawQuery || '').toLowerCase().trim();

    // 🛡️ Security Guardrail 1: Cost / Profit / Wholesale Probes
    if (q.includes('cost') || q.includes('purchase price') || q.includes('wholesale') || q.includes('factory price') || q.includes('margin') || q.includes('profit') || q.includes('how much you buy')) {
      return {
        title: "🛡️ Official Showroom Statement",
        text: `Namaskar! As an authorized Godrej Interio flagship showroom, all our luxury solid teak and modular furniture are priced under official factory MRP with exclusive showroom festive discounts and a 10-Year Manufacturer Warranty. How can I assist you with your home decor selection today?`,
        matchedProducts: []
      };
    }

    // 🛡️ Security Guardrail 2: Customer Privacy / PII Probes
    if (q.includes('who bought') || q.includes('customer phone') || q.includes('customer address') || q.includes('dr. jena') || q.includes('other customer') || q.includes('sales record')) {
      return {
        title: "🛡️ Privacy Protection",
        text: `We strictly adhere to enterprise customer data protection policies and cannot disclose private client transactions or contact records. We would be delighted to assist you with your personal home furniture requirements!`,
        matchedProducts: []
      };
    }

    // 🛡️ Security Guardrail 3: Extreme Bargaining
    if (q.includes('40%') || q.includes('50% discount') || q.includes('cheap') || q.includes('lowest price')) {
      return {
        title: "🏷️ Festive Pricing Policy",
        text: `Our maximum authorized showroom festive discount for this luxury solid wood suite is up to 8% with complimentary delivery & hydraulic installation in Rayagada. For customized corporate or whole-villa architectural projects, our Showroom Directors Naresh & Naren (+91 93905 53301) can arrange a personalized consultation.`,
        matchedProducts: []
      };
    }

    // =========================================================================
    // 🔍 MULTI-PRODUCT SEARCH ACROSS ENTIRE CATALOG (115 ➔ 200+ SKUs)
    // =========================================================================

    // 1. Category Search: Sofas & Living Room
    if (q.includes('sofa') || q.includes('couch') || q.includes('living') || q.includes('recliner') || q.includes('sectional') || q.includes('coffee table')) {
      const sofaMatches = catalog.filter(c => 
        (c.Main_Category && c.Main_Category.toLowerCase().includes('living')) ||
        (c.Product_Name && (c.Product_Name.toLowerCase().includes('sofa') || c.Product_Name.toLowerCase().includes('recliner') || c.Product_Name.toLowerCase().includes('lounge')))
      ).slice(0, 4);

      return {
        title: "🛋️ Living Room & Luxury Sofas Collection",
        text: `Here are our top Godrej Interio living room & sofa models available in stock at Rayagada with high-density foam & solid wood frames. Tap any card below to explore specs or reserve with a 50% token advance:`,
        matchedProducts: sofaMatches.length > 0 ? sofaMatches : catalog.slice(1, 4)
      };
    }

    // 2. Category Search: Dining Sets
    if (q.includes('dining') || q.includes('dining table') || q.includes('marble dining') || q.includes('6 seater') || q.includes('4 seater') || q.includes('dining chair')) {
      const diningMatches = catalog.filter(c => 
        (c.Main_Category && c.Main_Category.toLowerCase().includes('dining')) ||
        (c.Product_Name && c.Product_Name.toLowerCase().includes('dining'))
      ).slice(0, 4);

      return {
        title: "🪑 Dining Room & Marble Suites",
        text: `Here are our premium solid teak & Italian Carrara marble dining suites available for immediate dispatch in Rayagada:`,
        matchedProducts: diningMatches.length > 0 ? diningMatches : catalog.slice(2, 5)
      };
    }

    // 3. Category Search: Wardrobes & Almirahs
    if (q.includes('wardrobe') || q.includes('almirah') || q.includes('cupboard') || q.includes('closet') || q.includes('sliding door') || q.includes('4 door') || q.includes('3 door') || q.includes('steel almirah')) {
      const wardrobeMatches = catalog.filter(c => 
        (c.Main_Category && (c.Main_Category.toLowerCase().includes('storage') || c.Main_Category.toLowerCase().includes('almirah'))) ||
        (c.Product_Name && (c.Product_Name.toLowerCase().includes('wardrobe') || c.Product_Name.toLowerCase().includes('almirah') || c.Product_Name.toLowerCase().includes('cupboard')))
      ).slice(0, 4);

      return {
        title: "🚪 Wardrobes & Heavy Steel Almirahs",
        text: `Explore our 4-door and sliding wardrobe collection equipped with Godrej Ultra-Lock security and anti-termite CP teak finishes:`,
        matchedProducts: wardrobeMatches.length > 0 ? wardrobeMatches : catalog.slice(5, 8)
      };
    }

    // 4. Category Search: Beds & Mattresses
    if (q.includes('other bed') || q.includes('beds') || q.includes('mattress') || q.includes('king bed') || q.includes('queen bed') || q.includes('hydraulic bed')) {
      const bedMatches = catalog.filter(c => 
        (c.Main_Category && c.Main_Category.toLowerCase().includes('bed')) ||
        (c.Product_Name && (c.Product_Name.toLowerCase().includes('bed') || c.Product_Name.toLowerCase().includes('mattress')))
      ).filter(c => c.SKU !== activeProduct.SKU).slice(0, 4);

      return {
        title: "🛏️ Bedroom Suites & Hydraulic Beds",
        text: `Here are alternative bedroom models in Solid Teak and Engineered Wood with hydraulic lift storage:`,
        matchedProducts: bedMatches.length > 0 ? bedMatches : catalog.slice(0, 3)
      };
    }

    // 5. Category Search: Office, Study & Workstations
    if (q.includes('office') || q.includes('study') || q.includes('chair') || q.includes('desk') || q.includes('workstation') || q.includes('boss chair') || q.includes('mesh')) {
      const officeMatches = catalog.filter(c => 
        (c.Main_Category && c.Main_Category.toLowerCase().includes('office')) ||
        (c.Product_Name && (c.Product_Name.toLowerCase().includes('chair') || c.Product_Name.toLowerCase().includes('desk') || c.Product_Name.toLowerCase().includes('workstation') || c.Product_Name.toLowerCase().includes('study')))
      ).slice(0, 4);

      return {
        title: "🏢 Executive Office & Ergonomic Chairs",
        text: `Here are our BIFMA-certified ergonomic mesh chairs and modular study workstations:`,
        matchedProducts: officeMatches.length > 0 ? officeMatches : catalog.slice(3, 6)
      };
    }

    // 6. Generic Catalog Browser / All Products Query
    if (q.includes('catalog') || q.includes('all product') || q.includes('what else') || q.includes('other furniture') || q.includes('models') || q.includes('range') || q.includes('collection') || q.includes('show me')) {
      const flagshipItems = [
        catalog.find(c => c.SKU === 'SOF-MOD-001') || catalog[1],
        catalog.find(c => c.SKU === 'DIN-MOD-001') || catalog[2],
        catalog.find(c => c.SKU === 'ALM-MOD-001') || catalog[5],
        catalog.find(c => c.SKU === 'COM-MOD-001') || catalog[7]
      ].filter(Boolean);

      return {
        title: "📖 Complete Godrej Interio Showroom Range",
        text: `Our Rayagada Flagship Showroom features over **${catalog.length}+ luxury furniture SKUs** across 5 categories. Here are our top flagship highlights. Tap any item to inspect or type what you are looking for:`,
        matchedProducts: flagshipItems
      };
    }

    // 7. Specific SKU Search
    const directSkuMatch = catalog.find(c => c.SKU.toLowerCase() === q || q.includes(c.SKU.toLowerCase()));
    if (directSkuMatch) {
      return {
        title: `🏷️ Product Match: ${directSkuMatch.SKU}`,
        text: `I found **${directSkuMatch.Product_Name}** (${directSkuMatch.SKU}) in our catalog at ₹${Number(directSkuMatch.Selling_Price_INR).toLocaleString()} (MRP: ₹${Number(directSkuMatch.MRP_INR).toLocaleString()}). Tap below to focus this model:`,
        matchedProducts: [directSkuMatch]
      };
    }

    // Dimensions & Clearance for active product
    if (q.includes('dimension') || q.includes('size') || q.includes('fit') || q.includes('length') || q.includes('width') || q.includes('height')) {
      return {
        title: "📐 Dimensions & Room Clearance",
        text: `📐 Exact Specifications for ${activeProduct.Product_Name}:\n• Dimensions: ${activeProduct.Dimensions || '78" Length × 72" Width × 48" Headboard Height'}\n• Mattress Size Required: Standard King (78 × 72 in)\n• Knock-down Design: Ships in 5 secure flat-pack cartons (Fits easily through all standard 32" apartment doorways & staircases ✓)\n• Hydraulic Lift: Heavy-duty German gas springs rated for 15,000+ open-close cycles.`,
        matchedProducts: []
      };
    }

    // Wood & Material Specs
    if (q.includes('wood') || q.includes('teak') || q.includes('material') || q.includes('sheesham') || q.includes('quality') || q.includes('termite')) {
      return {
        title: "🌳 Teak Wood & Material Certification",
        text: `🌳 Premium Material Guarantee:\n• Material: ${activeProduct.Material_Spec || '100% Solid Central Province (CP) Teak Wood'}\n• Seasoning: Kiln-dried to 8–12% moisture content to prevent seasonal warping or cracking.\n• Protection: 4-coat polyurethane anti-scratch matte lacquer.\n• Anti-Termite: 100% vacuum-pressure treated against borer and termites with 10-Year Certificate.`,
        matchedProducts: []
      };
    }

    // Delivery & Installation
    if (q.includes('delivery') || q.includes('when') || q.includes('install') || q.includes('assembly') || q.includes('time') || q.includes('rayagada')) {
      return {
        title: "🚚 Express Delivery & Free Assembly",
        text: `🚚 Delivery Timeline for Rayagada & Nearby Districts:\n• Same-Day / 24-Hour Express Delivery in Rayagada Town (Rayagada, Gunupur, Jeypore, Koraput).\n• Hydraulic assembly by certified Godrej Interio technicians included at zero extra cost.\n• Transit Insurance: 100% covered against any transport scratches.`,
        matchedProducts: []
      };
    }

    // Pricing & Proforma Quote
    if (q.includes('price') || q.includes('quote') || q.includes('mrp') || q.includes('discount') || q.includes('offer') || q.includes('rate')) {
      return {
        title: "🏷️ Proforma Price Breakdown",
        text: `📋 Official Quotation for ${activeProduct.Product_Name}:\n• Official MRP: ₹${mrp.toLocaleString()}\n• ⚡ Showroom Festive Price: ₹${sp.toLocaleString()}\n• 🎁 Your Instant Savings: ₹${savings.toLocaleString()}\n• 🔒 Token Advance to Lock Price: ₹${tokenAdvance50.toLocaleString()} (50%)\n• GST Invoice: 18% GST Input Tax Credit compliant for businesses.`,
        matchedProducts: []
      };
    }

    // Warranty
    if (q.includes('warranty') || q.includes('guarantee') || q.includes('service') || q.includes('damage')) {
      return {
        title: "🛡️ 10-Year Manufacturer Warranty",
        text: `🛡️ Comprehensive Warranty Coverage:\n• Duration: ${activeProduct.Warranty_Years || 10} Years Official Godrej Warranty\n• Covers: Wood structural integrity, hydraulic gas springs, and hardware hinges.\n• Doorstep Service: In-house technician visit within 48 hours of service request.`,
        matchedProducts: []
      };
    }

    // Showroom Location & Timings
    if (q.includes('where') || q.includes('address') || q.includes('location') || q.includes('timing') || q.includes('open') || q.includes('hours')) {
      return {
        title: "📍 Showroom Location & Timings",
        text: `📍 Godrej Interio Rayagada Flagship Showroom (Shree Ganesh Enterprises)\nMain Road, Near New Bus Stand, Rayagada, Odisha 765001.\n\n⏰ Showroom Hours: 10:00 AM – 8:30 PM (Open 7 Days)\n📞 Contact / WhatsApp: +91 93905 53301`,
        matchedProducts: []
      };
    }

    // Fallback Customer Assistance
    return {
      title: "Godrej Interio Assistant",
      text: `Thank you for your question regarding "${rawQuery}"! Our showroom features **${catalog.length} live models** across Bedroom, Living, Dining, and Office. Would you like to reserve **${activeProduct.Product_Name}** (₹${sp.toLocaleString()}), or explore other matching furniture collections?`,
      matchedProducts: []
    };
  };

  const handleSendChat = (customText = null) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: "Just Now",
      matchedProducts: []
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMsg('');
    playScanBeep();

    setTimeout(() => {
      const reply = generateAiReply(textToSend);
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        title: reply.title,
        text: reply.text,
        time: "Just Now",
        matchedProducts: reply.matchedProducts || []
      };
      setChatMessages(prev => [...prev, botReply]);
      playSuccessChime();
    }, 350);
  };

  const handlePayUpi = (targetProduct = null) => {
    const prod = targetProduct || activeProduct;
    const price = prod.Selling_Price_INR || 89790;
    const token = Math.round(Number(price) * 0.5);

    playSuccessChime();
    triggerGoldenConfetti();
    const upiUrl = `upi://pay?pa=${storeMeta.upiId || '9390553301@ybl'}&pn=${encodeURIComponent(storeMeta.storeName || 'Godrej Interio Rayagada')}&am=${token}&cu=INR&tn=${encodeURIComponent(`50% Token for ${prod.SKU} - ${prod.Product_Name}`)}`;
    window.location.href = upiUrl;
  };

  const handleOpenWhatsApp = (targetProduct = null) => {
    const prod = targetProduct || activeProduct;
    const cleanPhone = (storeMeta.whatsapp || '+919390553301').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Namaskar Godrej Interio Rayagada! I am in the showroom viewing ${prod.Product_Name} (${prod.SKU}) at ₹${Number(prod.Selling_Price_INR).toLocaleString()}. Please assist me with delivery and booking.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070D18', color: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 🌟 Top Command Ribbon & Cross-Terminal Handoffs */}
      <div style={{ background: '#030712', borderBottom: '1px solid rgba(212,175,55,0.3)', padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-gold" style={{ fontSize: '10.5px', padding: '3px 8px' }}>
            📱 MOBILE AI CONCIERGE
          </span>
          <span style={{ fontSize: '10px', color: dwellSeconds >= 300 ? '#F87171' : '#FCD34D', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px', border: dwellSeconds >= 300 ? '1px solid #EF4444' : '1px solid rgba(212,175,55,0.3)' }}>
            <Clock size={10} />
            <span>{Math.floor(dwellSeconds / 60)}m {String(dwellSeconds % 60).padStart(2, '0')}s</span>
            {dwellSeconds >= 300 && <span style={{ background: '#EF4444', color: '#FFF', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: '900' }}>🔥 5M HOT</span>}
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>• Scan & Fit Hub</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyan"
            onClick={() => {
              setActiveTab('voice_pos');
              showToast("🎙️ Switched to Voice POS & Quote Studio!", true);
            }}
            style={{ fontSize: '10.5px', padding: '3px 8px' }}
          >
            <Mic size={11} /> <span>Voice POS (Tab 2)</span>
          </button>

          <button 
            className="btn-amber"
            onClick={() => {
              setActiveTab('showroom_crm');
              showToast("👥 Switched to Showroom CRM Leads!", true);
            }}
            style={{ fontSize: '10.5px', padding: '3px 8px' }}
          >
            <Users size={11} /> <span>CRM (Tab 8)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '10.5px', padding: '3px 8px' }}
          >
            <RefreshCw size={11} className={isSyncing ? 'spin-anim' : ''} /> <span>Sync</span>
          </button>

          <button 
            className="btn-luxury-gold"
            onClick={() => setIsAiConciergePanelOpen(!isAiConciergePanelOpen)}
            style={{ fontSize: '10.5px', padding: '3px 10px', background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: '#FFF', border: 'none' }}
          >
            <Sparkles size={11} /> <span>✨ Gemini Concierge ({conciergeLang})</span>
          </button>
        </div>
      </div>

      {/* 💬 SUPERPOWER 4: GEMINI MULTI-LINGUAL CONCIERGE DRAWER */}
      {isAiConciergePanelOpen && (
        <div style={{
          background: 'linear-gradient(135deg, #0F172A, #1E1B4B)',
          borderBottom: '2px solid #A855F7',
          padding: '16px 20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E9D5FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} className="text-purple-400" />
                ✨ Gemini Multi-Lingual WhatsApp Concierge Studio
              </span>
              <span style={{ fontSize: '10px', background: 'rgba(168,85,247,0.2)', color: '#D8B4FE', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.4)' }}>
                Powered by Gemini 1.5 Flash
              </span>
            </div>
            <button
              onClick={() => setIsAiConciergePanelOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Customer / Lead Name:
              </label>
              <input
                type="text"
                value={conciergeTargetName}
                onChange={(e) => setConciergeTargetName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0B132B',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Occasion / Milestone:
              </label>
              <select
                value={conciergeOccasion}
                onChange={(e) => setConciergeOccasion(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0B132B',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
              >
                <option value="Wedding Bedroom Suite">💍 Wedding Bedroom Suite (ବିବାହ ଉପହାର)</option>
                <option value="Griha Pravesh Housewarming">🏡 Griha Pravesh (ଗୃହ ପ୍ରବେଶ)</option>
                <option value="Luxury Turnkey Villa">👑 Luxury Turnkey Villa Project</option>
                <option value="Home Living Renovation">✨ Home Living Renovation</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Language Preference:
              </label>
              <select
                value={conciergeLang}
                onChange={(e) => setConciergeLang(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0B132B',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: '#FFF',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                <option value="ODIA">🇮🇳 Odia (ଓଡ଼ିଆ) - Rayagada Native</option>
                <option value="TELUGU">🇮🇳 Telugu (తెలుగు) - Border Client</option>
                <option value="HINDI">🇮🇳 Hindi (हिन्दी)</option>
                <option value="ENGLISH">🌐 English (Executive Tone)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={handleGenerateAiConcierge}
              disabled={isGeneratingAiDraft}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#FFF',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: isGeneratingAiDraft ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 15px rgba(168,85,247,0.4)'
              }}
            >
              {isGeneratingAiDraft ? <RefreshCw size={13} className="spin-anim" /> : <Sparkles size={13} />}
              {isGeneratingAiDraft ? `Crafting in ${conciergeLang}...` : `✨ Draft Message in ${conciergeLang}`}
            </button>
          </div>

          {aiDraftMessage && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '11px', color: '#D8B4FE', fontWeight: 'bold', marginBottom: '6px' }}>
                📝 Generated WhatsApp Follow-up ({conciergeLang}):
              </div>
              <div style={{ fontSize: '13px', color: '#F1F5F9', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'system-ui' }}>
                {aiDraftMessage}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const phone = (customerProfile.phone || leadPhone || '9390553301').replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(aiDraftMessage)}`, '_blank');
                    showToast("📲 Opened in WhatsApp with pre-filled AI draft!", true);
                  }}
                  style={{
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <MessageSquare size={13} /> 📲 Send via WhatsApp
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiDraftMessage);
                    showToast("📋 Copied message to clipboard!", true);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#CBD5E1',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy Text
                </button>

                <button
                  onClick={handleDispatchBot27Recovery}
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Send size={13} /> 🚀 Log to BOT-27 Queue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Mobile Header */}
      <div style={{ background: '#0F1A2E', borderBottom: '1px solid rgba(212,175,55,0.3)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#000000', fontSize: '15px', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}>
            GI
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.3px' }}>
              {storeMeta.storeName || 'Godrej Interio Rayagada'}
            </div>
            <div style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
              24/7 AI Concierge Online ({catalog.length} SKUs)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 🌐 Regional Language 1-Tap Switcher */}
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.3)' }}>
            {[
              { id: 'EN', label: 'EN' },
              { id: 'OR', label: 'ଓଡ଼ିଆ' },
              { id: 'TE', label: 'తెలుగు' },
              { id: 'HI', label: 'हिंदी' }
            ].map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setPortalLang(l.id);
                  showToast(`🌐 Language: ${l.label}`);
                }}
                style={{
                  background: portalLang === l.id ? 'var(--accent-gold)' : 'transparent',
                  color: portalLang === l.id ? '#000000' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '3px 6px',
                  fontSize: '9.5px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          <a 
            href={`tel:${(storeMeta.phone || '+919390553301').replace(/[^0-9+]/g, '')}`}
            style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.3)', textDecoration: 'none' }}
            title="Call Showroom"
          >
            <Phone size={15} />
          </a>
          <button 
            onClick={() => handleOpenWhatsApp()}
            style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', border: '1px solid #25D366', cursor: 'pointer' }}
            title="Open in WhatsApp"
          >
            <MessageSquare size={15} />
          </button>
        </div>
      </div>

      {/* Top VIP Lead Capture & Identity Bar */}
      {isLeadCaptureOpen ? (
        <div style={{ margin: '10px 14px 4px 14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(16,185,129,0.15) 100%)', border: '1.5px solid var(--accent-gold)', borderRadius: '16px', padding: '14px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Unlock VIP 8% Festive Discount
              </span>
            </div>
            {customerProfile.isRegistered && (
              <button 
                onClick={() => setIsLeadCaptureOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '11px', cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            )}
          </div>
          <p style={{ fontSize: '11px', color: '#CBD5E1', margin: '0 0 10px 0', lineHeight: '1.4' }}>
            Enter your name & WhatsApp number to lock in exclusive showroom festive pricing, free delivery, and a 48-hour SafeLock stock hold!
          </p>
          <form onSubmit={handleRegisterLead} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                placeholder="Your Full Name (e.g. Jai Sriram)"
                value={leadName}
                onChange={e => setLeadName(e.target.value)}
                style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
                required
              />
              <input
                type="tel"
                placeholder="WhatsApp Number (e.g. 9437155667)"
                value={leadPhone}
                onChange={e => setLeadPhone(e.target.value)}
                style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Delivery Location in Rayagada (e.g. Sai Priya Nagar, Rayagada)"
              value={leadAddress}
              onChange={e => setLeadAddress(e.target.value)}
              style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
            />

            {/* 💍 Shopping Purpose / Occasion Milestone Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10.5px', color: '#FCD34D', fontWeight: '800' }}>
                  🎯 Shopping Occasion:
                </span>
                <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>
                  Unlocks Special Bridal/Villa Packages
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'WEDDING', label: '💍 Wedding Suite' },
                  { id: 'GRIHA_PRAVESH', label: '🏠 Griha Pravesh' },
                  { id: 'HOME_UPGRADE', label: '✨ Room Refresh' }
                ].map(occ => (
                  <button
                    type="button"
                    key={occ.id}
                    onClick={() => setShoppingOccasion(occ.id)}
                    style={{
                      fontSize: '10px',
                      padding: '6px 4px',
                      borderRadius: '8px',
                      border: shoppingOccasion === occ.id ? '1.5px solid #FCD34D' : '1px solid rgba(255,255,255,0.15)',
                      background: shoppingOccasion === occ.id ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.4)',
                      color: shoppingOccasion === occ.id ? '#FCD34D' : '#CBD5E1',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)', color: '#000000', border: 'none', borderRadius: '10px', padding: '9px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(212,175,55,0.4)' }}
            >
              <Sparkles size={14} /> ✨ Claim VIP Discount & Save My Profile
            </button>
          </form>
        </div>
      ) : (
        <div style={{ margin: '8px 14px 2px 14px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '12px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>👑</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#6EE7B7' }}>
                VIP Client: {customerProfile.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                📞 {customerProfile.phone} • 📍 {customerProfile.address}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsLeadCaptureOpen(true)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '700', cursor: 'pointer' }}
          >
            ✏️ Edit
          </button>
        </div>
      )}

      {/* Scanned Furniture Showcase Card */}
      <div style={{ margin: '10px 14px 6px 14px', background: '#0F172A', borderRadius: '18px', border: '1.5px solid rgba(212,175,55,0.35)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
        
        {/* Card Header Banner */}
        <div 
          onClick={() => setIsProductCardExpanded(!isProductCardExpanded)}
          style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(15,23,42,0.9))' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold" style={{ fontSize: '9px', fontWeight: '900' }}>
              FEATURED PRODUCT
            </span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
              {activeProduct.SKU}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold-light)', fontSize: '11px', fontWeight: '700' }}>
            {isProductCardExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Collapsible Product Details & Interactive Customizer */}
        {isProductCardExpanded && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '12px', alignItems: 'center' }}>
              <img 
                src={activeProduct.Image_URL || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600'} 
                alt={activeProduct.Product_Name}
                style={{ width: '90px', height: '85px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                  {activeProduct.Product_Name}
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  🌳 {activeProduct.Material_Spec || '100% Solid CP Teak Wood'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#FCD34D' }}>
                    ₹{sp.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{mrp.toLocaleString()}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    Save ₹{savings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 🎛️ Interactive Customer Preference Customizer */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '10px', margin: '12px 0 8px 0', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '800' }}>🪵 Wood / Polish Finish:</span>
                <select 
                  value={woodFinish} 
                  onChange={e => setWoodFinish(e.target.value)}
                  style={{ background: '#0F1A2E', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '3px 6px', fontSize: '11px' }}
                >
                  <option value="👑 Natural Teak">👑 Natural CP Teak</option>
                  <option value="🍫 Dark Walnut">🍫 Dark Walnut</option>
                  <option value="🍷 Royal Mahogany">🍷 Royal Mahogany</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '800' }}>⚙️ Storage Mechanism:</span>
                <select 
                  value={storageType} 
                  onChange={e => setStorageType(e.target.value)}
                  style={{ background: '#0F1A2E', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '3px 6px', fontSize: '11px' }}
                >
                  <option value="⚡ Hydraulic Auto-Lift">⚡ Hydraulic Auto-Lift</option>
                  <option value="📦 Manual Box Storage">📦 Manual Box Storage</option>
                  <option value="🗄️ Side Drawers">🗄️ Side Drawers</option>
                </select>
              </div>

              {/* Free Gifts Checklist */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '2px' }}>
                <label style={{ fontSize: '10.5px', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={freePillows} onChange={e => setFreePillows(e.target.checked)} />
                  2x Ortho Pillows (FREE)
                </label>
                <label style={{ fontSize: '10.5px', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={freeProtector} onChange={e => setFreeProtector(e.target.checked)} />
                  Mattress Protector (FREE)
                </label>
              </div>
            </div>

            {/* Quick 1-Tap Booking & Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginTop: '10px' }}>
              <button 
                onClick={() => setIsSafeLockModalOpen(true)}
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)', color: '#000000', border: 'none', borderRadius: '10px', padding: '9px 10px', fontSize: '11.5px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.4)' }}
              >
                🔒 SafeLock Bed (₹5k Token)
              </button>
              <button 
                onClick={() => handleOpenWhatsApp()}
                style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid #25D366', borderRadius: '10px', padding: '9px 10px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <MessageSquare size={13} /> 📲 Video Brochure
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SafeLock Reservation & Dynamic Token Advance Modal */}
      {isSafeLockModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0F172A', border: '2px solid var(--accent-gold)', borderRadius: '20px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#FCD34D' }}>SafeLock 48-Hour Stock Hold</h3>
              </div>
              <button onClick={() => setIsSafeLockModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ margin: '14px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: '#030712', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '13px' }}>{activeProduct.Product_Name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Finish: {woodFinish} • Storage: {storageType}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {freePillows && '✓ 2x Ortho Pillows (FREE) '}
                  {freeProtector && '✓ Mattress Protector (FREE)'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Select Token Advance Amount:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setTokenAmountOption(5000)}
                    style={{
                      background: tokenAmountOption === 5000 ? 'var(--accent-gold)' : '#030712',
                      color: tokenAmountOption === 5000 ? '#000000' : '#FFFFFF',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    ₹5,000 Token Hold
                  </button>
                  <button
                    type="button"
                    onClick={() => setTokenAmountOption(tokenAdvance50)}
                    style={{
                      background: tokenAmountOption === tokenAdvance50 ? 'var(--accent-emerald)' : '#030712',
                      color: tokenAmountOption === tokenAdvance50 ? '#FFFFFF' : '#FFFFFF',
                      border: '1px solid var(--accent-emerald)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    50% Advance (₹{tokenAdvance50.toLocaleString()})
                  </button>
                </div>
              </div>

              {/* Dynamic QR Display & Bank Details */}
              <div style={{ textAlign: 'center', background: '#FFFFFF', color: '#000000', borderRadius: '12px', padding: '12px', margin: '6px 0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>SCAN & PAY VIA ANY UPI APP</div>
                <div style={{ fontSize: '10px', color: '#475569' }}>Merchant VPA: {storeMeta.upiVpa || '9390553301@ybl'}</div>
                <div style={{ width: '120px', height: '120px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`upi://pay?pa=${storeMeta.upiVpa || '9390553301@ybl'}&pn=${encodeURIComponent(storeMeta.storeName || 'Godrej Interio Rayagada')}&am=${tokenAmountOption}&cu=INR&tn=${encodeURIComponent(`SafeLock Token for ${activeProduct.SKU}`)}`)}`}
                    alt="UPI QR"
                    style={{ width: '110px', height: '110px' }}
                  />
                </div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#047857' }}>Amount Payable: ₹{tokenAmountOption.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setIsSafeLockModalOpen(false)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px', color: '#FFFFFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCustomerSafeLock}
                style={{ flex: 2, background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', border: 'none', borderRadius: '10px', padding: '10px', color: '#FFFFFF', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
              >
                <Check size={15} /> Confirm SafeLock Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {chatMessages.map(msg => (
          <div 
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? '#005C4B' : '#1E293B',
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              padding: '12px 14px',
              maxWidth: '92%',
              fontSize: '12.5px',
              color: '#F1F5F9',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              borderLeft: msg.sender === 'bot' ? '3.5px solid var(--accent-gold)' : 'none'
            }}
          >
            {msg.title && (
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#FCD34D', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.4px' }}>
                {msg.title}
              </div>
            )}
            <div style={{ lineHeight: '1.5', whiteSpace: 'pre-line' }}>{msg.text}</div>

            {/* 🎴 In-Chat Rich Product Recommendation Cards / Carousels */}
            {msg.matchedProducts && msg.matchedProducts.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📦 Tap any item to inspect or reserve:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {msg.matchedProducts.map((p, pIdx) => {
                    const pSp = Number(p.Selling_Price_INR) || 45000;
                    const pMrp = Number(p.MRP_INR) || 60000;
                    const pSavings = pMrp - pSp;
                    const pToken = Math.round(pSp * 0.5);

                    return (
                      <div 
                        key={pIdx}
                        style={{
                          background: '#0B132B',
                          border: '1px solid rgba(212,175,55,0.3)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <img 
                            src={p.Image_URL || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'} 
                            alt={p.Product_Name}
                            style={{ width: '60px', height: '55px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.Product_Name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>
                              {p.SKU} • <span className="badge badge-purple" style={{ fontSize: '8.5px', padding: '1px 4px' }}>{p.Main_Category || 'Furniture'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
                                ₹{pSp.toLocaleString()}
                              </span>
                              <span style={{ fontSize: '9.5px', color: '#94A3B8', textDecoration: 'line-through' }}>
                                ₹{pMrp.toLocaleString()}
                              </span>
                              <span className="badge badge-emerald" style={{ fontSize: '8px', padding: '1px 3px' }}>
                                -₹{pSavings.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Triggers */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSwitchActiveProduct(p)}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)',
                              color: '#000000',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 4px',
                              fontSize: '10px',
                              fontWeight: '900',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={12} /> View Product
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePayUpi(p)}
                            style={{
                              flex: 1,
                              background: 'rgba(16,185,129,0.2)',
                              color: 'var(--accent-emerald)',
                              border: '1px solid var(--accent-emerald)',
                              borderRadius: '6px',
                              padding: '6px 4px',
                              fontSize: '10px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <CreditCard size={12} /> 50% Token (₹{pToken.toLocaleString()})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ fontSize: '9px', color: '#94A3B8', textAlign: 'right', marginTop: '4px' }}>
              {msg.time} {msg.sender === 'user' && '✓✓'}
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Category Discovery Chips Carousel */}
      <div style={{ background: '#0F1A2E', padding: '8px 12px 4px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {[
            { label: '🛋️ Sofas & Living', query: 'Show me your living room sofa and recliner collection' },
            { label: '🪑 Marble Dining', query: 'Show me 6-seater and marble top dining tables' },
            { label: '🚪 4-Door Wardrobes', query: 'Show me your sliding wardrobes and heavy almirahs' },
            { label: '🛏️ Alternative Beds', query: 'Show me other king and queen bed models' },
            { label: '🏢 Office Chairs & Desks', query: 'Show me ergonomic office chairs and study desks' },
            { label: '📖 Full 115+ Catalog', query: 'Show me your complete furniture catalog' },
            { label: '📐 Room Dimensions', query: 'What are the exact dimensions and clearance needed for this piece?' },
            { label: '🌳 Teak Wood Warranty', query: 'What wood is used and what is the termite warranty?' },
            { label: '🚚 Delivery to Rayagada', query: 'How soon can you deliver and install in Rayagada?' }
          ].map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChat(p.query)}
              style={{
                background: 'rgba(212,175,55,0.12)',
                color: '#FCD34D',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '16px',
                padding: '5px 10px',
                fontSize: '10.5px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 1-Click WhatsApp Quote Saver & Showroom Video Bar (Exit-Intent & Drop-Off Protection) */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(37,211,102,0.18) 0%, rgba(212,175,55,0.18) 100%)',
        borderTop: '1px solid rgba(37,211,102,0.4)',
        padding: '8px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '16px' }}>📹</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#6EE7B7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Want real showroom video of {activeProduct.Product_Name}?
            </div>
            <div style={{ fontSize: '9.5px', color: '#FCD34D' }}>
              Save ₹{savings.toLocaleString()} Festive Price-Lock on WhatsApp
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveQuoteToWhatsApp}
          style={{
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '18px',
            padding: '7px 12px',
            fontSize: '10.5px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 3px 12px rgba(37,211,102,0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          <MessageSquare size={13} /> <span>Save to WhatsApp</span>
        </button>
      </div>

      {/* Bottom Sticky Chat Input */}
      <div style={{ background: '#0F1A2E', padding: '10px 14px 16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          placeholder="Ask anything (e.g. 'Show dining tables', 'Sofas under 60k')..."
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendChat()}
          style={{
            flex: 1,
            background: '#070D18',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '24px',
            padding: '12px 18px',
            color: '#FFFFFF',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button 
          onClick={() => handleSendChat()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #B45309)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* 👑 VIP DIRECTOR PRIVILEGE UNLOCKED MODAL (Triggered on 5-Minute Dwell or High Budget) */}
      {showDirectorAlertModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px 20px',
            boxShadow: '0 20px 50px rgba(245,158,11,0.25), 0 0 30px rgba(0,0,0,0.8)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowDirectorAlertModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#94A3B8',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '32px' }}>👑</span>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FCD34D', margin: '6px 0 2px 0', letterSpacing: '-0.3px' }}>
                Store Director Direct Privilege Unlocked!
              </h3>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>
                🔥 5-Minute High-Intent Session Verified • Godrej Interio Rayagada
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11.5px', color: '#E2E8F0', lineHeight: '1.5' }}>
                Namaskar <strong>{customerProfile.name || leadName || 'Respected Customer'}</strong>! Because you have taken time exploring our flagship collection today, Store Directors <strong>Naresh & Naren (+91 9390553301)</strong> have authorized:
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#A7F3D0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>✓ <strong>Direct Showroom Margin Discount</strong> on {activeProduct.Product_Name}</div>
                <div>✓ <strong>Priority Factory Dispatch & Free Assembly</strong> in Rayagada</div>
                <div>✓ <strong>48-Hour SafeLock Price Guarantee</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={`https://wa.me/919390553301?text=${encodeURIComponent(`Namaskar Directors Naresh & Naren Sir! 🙏 I am ${customerProfile.name || leadName || 'a VIP Customer'} exploring ${activeProduct.Product_Name} (₹${sp.toLocaleString()}) on your 24/7 AI Concierge [${getOccasionLabel()}]. I would like to speak directly about the festive showroom privilege.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  padding: '11px 16px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(37,211,102,0.4)'
                }}
              >
                <MessageSquare size={16} /> <span>WhatsApp Directors Naresh & Naren (+91 9390553301)</span>
              </a>

              <a
                href="tel:9390553301"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#FCD34D',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  border: '1px solid rgba(245,158,11,0.4)',
                  padding: '9px 16px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Phone size={14} /> <span>Call Director Now (+91 9390553301)</span>
              </a>

              <button
                onClick={() => {
                  setShowDirectorAlertModal(false);
                  setIsLeadCaptureOpen(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '11px',
                  padding: '6px',
                  cursor: 'pointer'
                }}
              >
                Continue Exploring Showroom Models ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏳ EXIT-INTENT MODAL (Catches user leaving tab) */}
      {showExitIntentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0B132B',
            border: '1.5px solid #25D366',
            borderRadius: '18px',
            maxWidth: '400px',
            width: '100%',
            padding: '20px 18px',
            boxShadow: '0 15px 40px rgba(37,211,102,0.25)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>⏳</span>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                Leaving Already? Don't Lose Your Quote!
              </h4>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                Send your shortlisted <strong>{activeProduct.Product_Name}</strong> and festive savings directly to WhatsApp so you don't lose it.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  setShowExitIntentModal(false);
                  handleSaveQuoteToWhatsApp();
                }}
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={14} /> <span>Save Quote & Video to WhatsApp</span>
              </button>

              <button
                onClick={() => setShowExitIntentModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '11px',
                  padding: '4px',
                  cursor: 'pointer'
                }}
              >
                Stay on Portal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

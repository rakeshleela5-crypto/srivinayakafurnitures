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
  Tag
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function MobileCustomerChatView() {
  const { catalog, storeMeta, showToast, openModal } = useStore();

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
        text: `Our maximum authorized showroom festive discount for this luxury solid wood suite is up to 8% with complimentary delivery & hydraulic installation in Rayagada. For customized corporate or whole-villa architectural projects, our Showroom Director Mr. Rakesh (+91 93905 53301) can arrange a personalized consultation.`,
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

        <div style={{ display: 'flex', gap: '8px' }}>
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

      {/* Scanned Furniture Showcase Card */}
      <div style={{ margin: '12px 14px 6px 14px', background: '#0F172A', borderRadius: '18px', border: '1.5px solid rgba(212,175,55,0.35)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
        
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

        {/* Collapsible Product Details */}
        {isProductCardExpanded && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '12px', alignItems: 'center' }}>
              <img 
                src={activeProduct.Image_URL || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600'} 
                alt={activeProduct.Product_Name}
                style={{ width: '90px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}
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

            {/* Quick 1-Tap Booking Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => handlePayUpi()}
                style={{ background: 'linear-gradient(135deg, #10B981, #047857)', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '8px 10px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
              >
                <CreditCard size={13} /> 50% Token (₹{tokenAdvance50.toLocaleString()})
              </button>
              <button 
                onClick={() => handleSendChat(`Please provide full room clearance and dimensions for ${activeProduct.Product_Name}`)}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 10px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Sparkles size={13} color="var(--accent-gold-light)" /> Room Clearance
              </button>
            </div>
          </div>
        )}
      </div>

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

    </div>
  );
}

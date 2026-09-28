import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  X,
  Phone,
  Bed,
  Hotel,
  Layers,
  Wrench,
  Lock,
  Unlock,
  Check,
  Send,
  Eye
} from 'lucide-react';
import { SpotlightCard, ShimmerButton } from '../components/common/LuxuryComponents';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

// Sample Properties & Rooms Data (Aligned with Godrej Interio Rayagada B2B Hotel Contracts)
const INITIAL_PROPERTIES = [
  {
    id: 'PROP-01',
    name: 'Sri Sai Vasudev Residency',
    location: 'Near Railway Station, Rayagada',
    category: 'HOTEL',
    totalRooms: 18,
    contractValue: 840000,
    scope: '18 Deluxe Teak Rooms (Beds + Wardrobes + Centuro Mattresses)'
  },
  {
    id: 'PROP-02',
    name: 'Hotel Sai International & Suites',
    location: 'Gunupur Main Road, Rayagada Dist.',
    category: 'HOTEL',
    totalRooms: 12,
    contractValue: 580000,
    scope: '12 Executive AC Suites (King Teak Beds + Luggage Racks)'
  },
  {
    id: 'PROP-03',
    name: 'Hotel Swarna Palace & Resorts',
    location: 'Barijhola Industrial Corridor, Rayagada',
    category: 'RESORT',
    totalRooms: 8,
    contractValue: 420000,
    scope: '8 Royal Cottages (Solid Wood Furniture + Sofa Sets)'
  },
  {
    id: 'PROP-04',
    name: 'Godrej Flagship Executive Mockup Suites',
    location: 'Showroom 2nd Floor, Rayagada Flagship',
    category: 'SHOWROOM_SUITE',
    totalRooms: 4,
    contractValue: 250000,
    scope: '4 Commercial Mockup Suites for Architect & Client Walkthroughs'
  }
];

const INITIAL_ROOMS = [
  // Sri Sai Vasudev Residency (Rooms 101 - 108)
  { id: 'RM-101', propertyId: 'PROP-01', number: '101', type: 'Deluxe Teak King', floor: '1st Floor', rate: 2800, furniture: 'Godrej Royal Teak King Bed + 2-Door Steel Almirah + Centuro 8" Mattress' },
  { id: 'RM-102', propertyId: 'PROP-01', number: '102', type: 'Deluxe Teak King', floor: '1st Floor', rate: 2800, furniture: 'Godrej Royal Teak King Bed + 2-Door Steel Almirah + Centuro 8" Mattress' },
  { id: 'RM-103', propertyId: 'PROP-01', number: '103', type: 'Executive Twin Bed', floor: '1st Floor', rate: 2400, furniture: 'Godrej Twin Teak Beds (2x) + Slimline Wardrobe' },
  { id: 'RM-104', propertyId: 'PROP-01', number: '104', type: 'Executive Twin Bed', floor: '1st Floor', rate: 2400, furniture: 'Godrej Twin Teak Beds (2x) + Slimline Wardrobe' },
  { id: 'RM-105', propertyId: 'PROP-01', number: '105', type: 'Super Deluxe Suite', floor: '1st Floor', rate: 3800, furniture: 'Godrej Master Suite + Centuro Recliner + Luggage Desk' },
  { id: 'RM-106', propertyId: 'PROP-01', number: '106', type: 'Super Deluxe Suite', floor: '1st Floor', rate: 3800, furniture: 'Godrej Master Suite + Centuro Recliner + Luggage Desk' },
  
  // Hotel Sai International (Rooms 201 - 205)
  { id: 'RM-201', propertyId: 'PROP-02', number: '201', type: 'Executive AC Suite', floor: '2nd Floor', rate: 3200, furniture: 'Godrej Imperial King Bed + 3-Door Sliding Teak Wardrobe' },
  { id: 'RM-202', propertyId: 'PROP-02', number: '202', type: 'Executive AC Suite', floor: '2nd Floor', rate: 3200, furniture: 'Godrej Imperial King Bed + 3-Door Sliding Teak Wardrobe' },
  { id: 'RM-203', propertyId: 'PROP-02', number: '203', type: 'Corporate Business Suite', floor: '2nd Floor', rate: 3500, furniture: 'Godrej Executive Study Workstation + King Bed + SafeLock Locker' },
  { id: 'RM-204', propertyId: 'PROP-02', number: '204', type: 'Corporate Business Suite', floor: '2nd Floor', rate: 3500, furniture: 'Godrej Executive Study Workstation + King Bed + SafeLock Locker' },

  // Swarna Palace & Resorts (Rooms 301 - 303)
  { id: 'RM-301', propertyId: 'PROP-03', number: '301', type: 'Royal Heritage Villa', floor: 'Ground', rate: 4500, furniture: 'Handcrafted Godrej Sheesham Suite + 5-Seater Leatherette Sofa' },
  { id: 'RM-302', propertyId: 'PROP-03', number: '302', type: 'Royal Heritage Villa', floor: 'Ground', rate: 4500, furniture: 'Handcrafted Godrej Sheesham Suite + 5-Seater Leatherette Sofa' },

  // Godrej Showroom Mockup Suites (Rooms 401 - 402)
  { id: 'RM-401', propertyId: 'PROP-04', number: 'VIP-A', type: 'Presidential Master Suite', floor: 'Showroom 2F', rate: 0, furniture: 'Godrej Centuro Motorized Bed + Walk-in Wardrobe + Smart Safe' },
  { id: 'RM-402', propertyId: 'PROP-04', number: 'VIP-B', type: 'Architect Demo Suite', floor: 'Showroom 2F', rate: 0, furniture: 'Godrej Kalista Teak Line + Ergonomic Work Desk + Accent Chairs' }
];

// Sample Bookings & Fit-out Tapes (Dates aligned with 2026-09-28)
const INITIAL_TAPES = [
  {
    id: 'TAPE-001',
    roomId: 'RM-101',
    guestName: 'Dr. Subhashish Jena (AIIMS Bhubaneswar)',
    phone: '9437188291',
    checkIn: '2026-09-26',
    checkOut: '2026-09-29',
    status: 'OCCUPIED', // OCCUPIED | RESERVED | FITOUT | MAINTENANCE | VIP_BLOCK
    folioAmount: 8400,
    advancePaid: 5000,
    auditStatus: 'AUDITED_LOCKED',
    notes: 'Medical symposium VIP guest. Teak suite extra mattress verified.'
  },
  {
    id: 'TAPE-002',
    roomId: 'RM-102',
    guestName: 'Godrej Interio Fit-Out Team (Carpenter Narayana)',
    phone: '9390553301',
    checkIn: '2026-09-27',
    checkOut: '2026-09-30',
    status: 'FITOUT',
    folioAmount: 0,
    advancePaid: 0,
    auditStatus: 'AUDITED_LOCKED',
    notes: 'Staging 2-Door Steel Almirah & King Bed Assembly from Bhubaneswar Depot truck.'
  },
  {
    id: 'TAPE-003',
    roomId: 'RM-103',
    guestName: 'Vedanta Alumina Executive Audit Team (3 Pax)',
    phone: '9861033441',
    checkIn: '2026-09-28',
    checkOut: '2026-10-02',
    status: 'OCCUPIED',
    folioAmount: 9600,
    advancePaid: 9600,
    auditStatus: 'PENDING_TODAY',
    notes: 'Corporate billing to Vedanta Ltd Lanjigarh. Twin beds configured.'
  },
  {
    id: 'TAPE-004',
    roomId: 'RM-105',
    guestName: 'Shree Ganesh Enterprises Board Meeting (Naresh Sir)',
    phone: '9437055000',
    checkIn: '2026-09-28',
    checkOut: '2026-09-28',
    status: 'VIP_BLOCK',
    folioAmount: 0,
    advancePaid: 0,
    auditStatus: 'AUDITED_LOCKED',
    notes: 'Reserved for Director B2B client contract signing with Rayagada Collectorate team.'
  },
  {
    id: 'TAPE-005',
    roomId: 'RM-201',
    guestName: 'K. Rama Krishna (Hotel Sai MD Guests)',
    phone: '9861033441',
    checkIn: '2026-09-25',
    checkOut: '2026-09-28',
    status: 'OCCUPIED',
    folioAmount: 9600,
    advancePaid: 4800,
    auditStatus: 'AUDITED_LOCKED',
    notes: 'Checking out today afternoon. Final room inspection pending.'
  },
  {
    id: 'TAPE-006',
    roomId: 'RM-202',
    guestName: 'JK Paper Mills Senior Engineers Delegation',
    phone: '9438012345',
    checkIn: '2026-09-28',
    checkOut: '2026-10-01',
    status: 'RESERVED',
    folioAmount: 9600,
    advancePaid: 4800,
    auditStatus: 'PENDING_TODAY',
    notes: 'Advance token received via UPI. Arrival expected 6:00 PM.'
  },
  {
    id: 'TAPE-007',
    roomId: 'RM-203',
    guestName: 'Godrej Interio Fit-Out QC Inspection (Er. Rakesh)',
    phone: '9390553301',
    checkIn: '2026-09-28',
    checkOut: '2026-09-29',
    status: 'FITOUT',
    folioAmount: 0,
    advancePaid: 0,
    auditStatus: 'PENDING_TODAY',
    notes: 'Installing SafeLock Smart Digital Safe in wardrobe locker.'
  },
  {
    id: 'TAPE-008',
    roomId: 'RM-301',
    guestName: 'Utkal Alumina Commercial Delegation',
    phone: '9777123987',
    checkIn: '2026-09-27',
    checkOut: '2026-10-03',
    status: 'OCCUPIED',
    folioAmount: 27000,
    advancePaid: 15000,
    auditStatus: 'PENDING_TODAY',
    notes: 'Royal Cottage 6 nights booking. Includes daily breakfast.'
  },
  {
    id: 'TAPE-009',
    roomId: 'RM-104',
    guestName: 'Deep Sanitization & Mattress Steam Wash',
    phone: 'Showroom Desk',
    checkIn: '2026-09-28',
    checkOut: '2026-09-28',
    status: 'MAINTENANCE',
    folioAmount: 0,
    advancePaid: 0,
    auditStatus: 'AUDITED_LOCKED',
    notes: 'Post-monsoon preventive fabric care with Godrej Anti-Microbial spray.'
  }
];

// Helper to format date as YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format date as DD/MM/YYYY for Indian PMS Standards
function formatDisplayDate(isoStr) {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

// Generate array of consecutive ISO dates between start & end
function getDateRangeArray(startDateStr, endDateStr, maxDays = 31) {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [startDateStr];
  }

  // Ensure start <= end
  let curr = new Date(start);
  let count = 0;

  while (curr <= end && count < maxDays) {
    dates.push(formatDate(curr));
    curr.setDate(curr.getDate() + 1);
    count++;
  }

  // If user selected a range with start === end, ensure at least that 1 day is returned
  if (dates.length === 0) {
    dates.push(startDateStr);
  }

  return dates;
}

export function PmsTapeChartView() {
  const { 
    showToast, 
    currentUser, 
    auditDateWindow, 
    updateAuditWindow 
  } = useStore();

  // 📅 Audit Window Date Range State (Synchronized with Global Store)
  const todayIso = '2026-09-28';
  const appliedFrom = auditDateWindow?.appliedFrom || '2026-09-28';
  const appliedTo = auditDateWindow?.appliedTo || '2026-09-28';
  const activePreset = auditDateWindow?.activePreset || 'Today';

  const [fromDate, setFromDate] = useState(auditDateWindow?.fromDate || '2026-09-28');
  const [toDate, setToDate] = useState(auditDateWindow?.toDate || '2026-09-28');

  // Keep local inputs in sync if global auditDateWindow changes externally
  React.useEffect(() => {
    if (auditDateWindow?.fromDate) setFromDate(auditDateWindow.fromDate);
    if (auditDateWindow?.toDate) setToDate(auditDateWindow.toDate);
  }, [auditDateWindow?.fromDate, auditDateWindow?.toDate]);

  // Filter & Search
  const [selectedPropertyId, setSelectedPropertyId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Interactive Tape / Folio Modal
  const [selectedTape, setSelectedTape] = useState(null);
  const [isFolioModalOpen, setIsFolioModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isNightAuditRunning, setIsNightAuditRunning] = useState(false);

  // New Booking Form State
  const [newBookingRoomId, setNewBookingRoomId] = useState('RM-101');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('2026-09-28');
  const [newCheckOut, setNewCheckOut] = useState('2026-09-30');
  const [newBookingStatus, setNewBookingStatus] = useState('RESERVED');
  const [newAdvancePaid, setNewAdvancePaid] = useState('2000');
  const [newNotes, setNewNotes] = useState('');

  // Tapes Data
  const [tapes, setTapes] = useState(INITIAL_TAPES);

  // Apply Quick Date Presets
  const applyPreset = (presetName) => {
    playScanBeep();

    const baseToday = new Date('2026-09-28T00:00:00');
    let s = '2026-09-28';
    let e = '2026-09-28';

    if (presetName === 'Today') {
      s = formatDate(baseToday);
      e = formatDate(baseToday);
    } else if (presetName === 'Yesterday') {
      const yesterday = new Date(baseToday);
      yesterday.setDate(yesterday.getDate() - 1);
      s = formatDate(yesterday);
      e = formatDate(yesterday);
    } else if (presetName === 'Last 7 Days') {
      const past7 = new Date(baseToday);
      past7.setDate(past7.getDate() - 6);
      s = formatDate(past7);
      e = formatDate(baseToday);
    } else if (presetName === 'This Month') {
      s = '2026-09-01';
      e = '2026-09-30';
    } else if (presetName === 'FY Year') {
      s = '2026-04-01';
      e = '2027-03-31';
      showToast('📅 Financial Year 2026-27 active. Displaying September 2026 operational grid.');
    }

    setFromDate(s);
    setToDate(e);

    updateAuditWindow({
      fromDate: s,
      toDate: e,
      appliedFrom: s,
      appliedTo: e,
      activePreset: presetName
    });
  };

  // Handle Display Button Click (as shown in the green screenshot button)
  const handleDisplayClick = () => {
    playScanBeep();
    updateAuditWindow({
      fromDate: fromDate,
      toDate: toDate,
      appliedFrom: fromDate,
      appliedTo: toDate,
      activePreset: 'Custom Range'
    });
    showToast(`🔄 PMS Audit Window Refreshed: ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}`);
  };

  // Calculate Dates Array for Grid Columns
  const calendarDates = useMemo(() => {
    // If range is a single day (like Today or Yesterday in the photo), show that day plus a 6-day forward horizon for visual context
    if (appliedFrom === appliedTo) {
      const start = new Date(appliedFrom);
      const end = new Date(appliedFrom);
      end.setDate(end.getDate() + 6); // 7-day view anchored on selected audit date
      return getDateRangeArray(formatDate(start), formatDate(end), 14);
    }
    return getDateRangeArray(appliedFrom, appliedTo, 31);
  }, [appliedFrom, appliedTo]);

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    return INITIAL_ROOMS.filter(rm => {
      const matchesProp = selectedPropertyId === 'ALL' || rm.propertyId === selectedPropertyId;
      const matchesSearch = !searchQuery || 
        rm.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.furniture.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProp && matchesSearch;
    });
  }, [selectedPropertyId, searchQuery]);

  // Aggregate KPI Metrics
  const metrics = useMemo(() => {
    const totalRooms = INITIAL_ROOMS.length;
    
    // Check tapes active on the appliedFrom date
    const activeOnAuditDate = tapes.filter(t => {
      return t.checkIn <= appliedFrom && t.checkOut >= appliedFrom;
    });

    const occupiedCount = activeOnAuditDate.filter(t => t.status === 'OCCUPIED').length;
    const reservedCount = activeOnAuditDate.filter(t => t.status === 'RESERVED').length;
    const fitoutCount = activeOnAuditDate.filter(t => t.status === 'FITOUT').length;
    const maintenanceCount = activeOnAuditDate.filter(t => t.status === 'MAINTENANCE').length;
    const vacantCount = totalRooms - (occupiedCount + reservedCount + fitoutCount + maintenanceCount);

    const occupancyRate = Math.round((occupiedCount / (totalRooms || 1)) * 100);

    const dailyAuditedRevenue = activeOnAuditDate.reduce((sum, t) => {
      const rm = INITIAL_ROOMS.find(r => r.id === t.roomId);
      return sum + (rm ? rm.rate : 0);
    }, 0);

    const pendingAuditCount = activeOnAuditDate.filter(t => t.auditStatus === 'PENDING_TODAY').length;

    return {
      totalRooms,
      occupiedCount,
      reservedCount,
      fitoutCount,
      vacantCount,
      occupancyRate,
      dailyAuditedRevenue,
      pendingAuditCount
    };
  }, [tapes, appliedFrom]);

  // 1-Click Run Daily Night Audit
  const handleRunNightAudit = async () => {
    setIsNightAuditRunning(true);
    playScanBeep();
    showToast(`🔒 Initiating PMS Night Audit for Business Date: ${formatDisplayDate(appliedFrom)}...`);

    // Simulate audit calculations & ledger postings
    await new Promise(r => setTimeout(r, 900));

    setTapes(prev => prev.map(t => {
      if (t.checkIn <= appliedFrom && t.checkOut >= appliedFrom) {
        return { ...t, auditStatus: 'AUDITED_LOCKED' };
      }
      return t;
    }));

    setIsNightAuditRunning(false);
    playSuccessChime();
    triggerGoldenConfetti();

    // Webhook notification to Executive & Bank Ledger
    dispatchWebhookAction('PMS_NIGHT_AUDIT_COMPLETED', {
      audit_date: appliedFrom,
      audited_revenue_inr: metrics.dailyAuditedRevenue,
      occupancy_pct: metrics.occupancyRate,
      auditor: currentUser?.name || 'Store Director',
      timestamp: new Date().toISOString()
    });

    showToast(`✨ Night Audit Complete! ₹${metrics.dailyAuditedRevenue.toLocaleString()} posted to Room Revenue Ledger & Locked.`, true);
  };

  // Add New Booking / Fit-out Block
  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!newGuestName.trim()) {
      showToast('⚠️ Please enter guest or contractor name', false);
      return;
    }

    const room = INITIAL_ROOMS.find(r => r.id === newBookingRoomId);
    const dayDiff = Math.max(1, Math.round((new Date(newCheckOut) - new Date(newCheckIn)) / (1000 * 60 * 60 * 24)));
    const folioAmt = (room ? room.rate : 2500) * dayDiff;

    const newTape = {
      id: `TAPE-${Date.now().toString().slice(-4)}`,
      roomId: newBookingRoomId,
      guestName: newGuestName,
      phone: newGuestPhone || 'N/A',
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      status: newBookingStatus,
      folioAmount: folioAmt,
      advancePaid: Number(newAdvancePaid) || 0,
      auditStatus: 'PENDING_TODAY',
      notes: newNotes || 'Added via OmniBuild PMS Tape Chart'
    };

    setTapes(prev => [newTape, ...prev]);
    setIsNewBookingModalOpen(false);
    playSuccessChime();
    showToast(`✅ Room ${room?.number || ''} ${newBookingStatus} block created for ${newGuestName}!`);
  };

  // Send WhatsApp Audit Briefing
  const handleWhatsAppAuditShare = () => {
    const text = `🏨 *PMS AUDIT WINDOW (TAPE CHART) SUMMARY*\n` +
      `*Godrej Interio Rayagada & Institutional Resourcing*\n` +
      `📅 *Audit Date:* ${formatDisplayDate(appliedFrom)}\n\n` +
      `📊 *KEY METRICS:*\n` +
      `• Total Rooms Monitored: ${metrics.totalRooms} Units\n` +
      `• Occupancy Rate: ${metrics.occupancyRate}% (${metrics.occupiedCount} In-House)\n` +
      `• Advance Reserved: ${metrics.reservedCount} Rooms\n` +
      `• Godrej Interio Fit-Outs Active: ${metrics.fitoutCount} Rooms\n` +
      `• Daily Audited Room Revenue: ₹${metrics.dailyAuditedRevenue.toLocaleString()}\n` +
      `• Night Audit Status: ${metrics.pendingAuditCount === 0 ? 'LOCKED & AUDITED ✓' : `${metrics.pendingAuditCount} Folios Pending`}\n\n` +
      `_Generated by OmniBuild OS™ PMS Module_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
      
      {/* ========================================================================= */}
      {/* 🌟 1. PIXEL-ACCURATE TOP AUDIT CONTROLLER BAR (EXACT SCREENSHOT REPLICA) */}
      {/* ========================================================================= */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #070B16 0%, #0F172A 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Top Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Left Date Range Inputs & Green Display Button */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* From Date Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', letterSpacing: '0.5px' }}>
                From :
              </span>
              <div style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                background: '#0B132B',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '4px 10px'
              }}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* To Date Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', letterSpacing: '0.5px' }}>
                To :
              </span>
              <div style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                background: '#0B132B',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '4px 10px'
              }}>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* 🟢 Bright Green Display Action Button (Exact Replica) */}
            <button
              id="pms-display-btn"
              onClick={handleDisplayClick}
              style={{
                background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: '1px solid #4ADE80',
                borderRadius: '8px',
                padding: '6px 20px',
                fontSize: '13px',
                fontWeight: '900',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Display
            </button>

            {/* Quick Filter Presets (Today, Yesterday, Last 7 Days, This Month, FY Year) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px', flexWrap: 'wrap' }}>
              {['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'FY Year'].map((preset) => {
                const isActive = activePreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    style={{
                      background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#38BDF8' : '#CBD5E1',
                      border: isActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: isActive ? '800' : '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Tools: Night Audit & New Booking */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, var(--accent-gold), #B45309)',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '900',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.35)'
              }}
            >
              <Plus size={14} /> New Room Booking
            </button>

            <button
              onClick={handleRunNightAudit}
              disabled={isNightAuditRunning}
              style={{
                background: metrics.pendingAuditCount === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: metrics.pendingAuditCount === 0 ? '#34D399' : '#FBBF24',
                border: `1px solid ${metrics.pendingAuditCount === 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isNightAuditRunning ? 'not-allowed' : 'pointer'
              }}
              title="Post Daily Room Charges, calculate GST and lock daybook"
            >
              {isNightAuditRunning ? <RefreshCw size={13} className="spin-anim" /> : <Lock size={13} />}
              {metrics.pendingAuditCount === 0 ? 'Audit Locked ✓' : `Run Night Audit (${metrics.pendingAuditCount})`}
            </button>

            <button
              onClick={handleWhatsAppAuditShare}
              style={{
                background: 'rgba(37, 211, 102, 0.12)',
                color: '#25D366',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              title="Share EOD Audit on WhatsApp"
            >
              <Send size={13} />
            </button>
          </div>
        </div>

        {/* 🌟 PROMINENT GOLD AUDIT TITLE BANNER (EXACT REPLICA) */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '900',
            color: '#F59E0B',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
          }}>
            <span>🏢</span> PMS AUDIT WINDOW (TAPE CHART) FROM {formatDisplayDate(appliedFrom)} TO {formatDisplayDate(appliedTo)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#94A3B8' }}>
            <span>Auditing Hub: <strong style={{ color: '#F1F5F9' }}>Rayagada Commercial Central</strong></span>
            <span>•</span>
            <span>Business Date: <strong style={{ color: 'var(--accent-gold)' }}>{formatDisplayDate(todayIso)}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 2. PMS AUDIT METRICS RADAR */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {/* Occupancy Card */}
        <SpotlightCard style={{ padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Audited Occupancy</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#38BDF8' }}>{metrics.occupancyRate}%</span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>({metrics.occupiedCount} / {metrics.totalRooms} Rooms)</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.occupancyRate}%`, height: '100%', background: '#38BDF8', borderRadius: '2px' }} />
          </div>
        </SpotlightCard>

        {/* Audited Room Revenue Card */}
        <SpotlightCard style={{ padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '700', textTransform: 'uppercase' }}>Daily Room Revenue</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#F59E0B' }}>₹{metrics.dailyAuditedRevenue.toLocaleString()}</span>
            <span style={{ fontSize: '10px', color: '#34D399', fontWeight: '700' }}>+18% GST Accrued</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '6px' }}>
            Auto-syncs with Tab 14 Bank & Tab 15 Tally Prime
          </div>
        </SpotlightCard>

        {/* Godrej Interio Fit-Outs Active */}
        <SpotlightCard style={{ padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700', textTransform: 'uppercase' }}>Godrej Fit-Out Staging</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#818CF8' }}>{metrics.fitoutCount} Suites</span>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Bhubaneswar Depot</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '6px' }}>
            Assembly & QA by Carpenter Narayana
          </div>
        </SpotlightCard>

        {/* Night Audit Status */}
        <SpotlightCard style={{ padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: '700', textTransform: 'uppercase' }}>EOD Night Audit Folio</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: metrics.pendingAuditCount === 0 ? '#34D399' : '#FBBF24' }}>
              {metrics.pendingAuditCount === 0 ? 'AUDITED ✓' : `${metrics.pendingAuditCount} TO CLOSE`}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '6px' }}>
            {metrics.pendingAuditCount === 0 ? 'All Folio balances reconciled' : 'Review folios before 9 PM register lock'}
          </div>
        </SpotlightCard>
      </div>

      {/* ========================================================================= */}
      {/* 🔍 3. PROPERTY SELECTOR, SEARCH & TAPE LEGEND */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(11, 19, 43, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '10px 16px'
      }}>
        {/* Property Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Property:</span>
          
          <button
            onClick={() => setSelectedPropertyId('ALL')}
            style={{
              background: selectedPropertyId === 'ALL' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
              color: selectedPropertyId === 'ALL' ? '#000' : '#CBD5E1',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            All Properties ({INITIAL_ROOMS.length})
          </button>

          {INITIAL_PROPERTIES.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPropertyId(p.id)}
              style={{
                background: selectedPropertyId === p.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                color: selectedPropertyId === p.id ? '#000' : '#CBD5E1',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {p.category === 'HOTEL' ? '🏨' : p.category === 'RESORT' ? '🌴' : '🛋️'} {p.name.split(' ')[0]} ({p.totalRooms})
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#CBD5E1', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10B981' }} /> In-House (Occupied)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F59E0B' }} /> Reserved (Token Paid)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#6366F1' }} /> Godrej Fit-Out Assembly
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#A855F7' }} /> VIP Director Block
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#EF4444' }} /> Maintenance / QC
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📅 4. THE INTERACTIVE TAPE CHART GRID (ROOMS VS. DATES MATRIX) */}
      {/* ========================================================================= */}
      <div 
        style={{
          background: '#070C18',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ overflowX: 'auto', maxHeight: '650px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            
            {/* Header Row: Room Info Column + Date Columns */}
            <thead>
              <tr style={{ background: '#0D1527', borderBottom: '2px solid rgba(212, 175, 55, 0.3)' }}>
                
                {/* Room Identifier Header */}
                <th style={{
                  padding: '14px 16px',
                  width: '260px',
                  minWidth: '260px',
                  position: 'sticky',
                  left: 0,
                  background: '#0D1527',
                  zIndex: 10,
                  boxShadow: '4px 0 10px rgba(0,0,0,0.3)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '900', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    ROOM & GODREJ SUITE SPEC
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                    Type • Tariff • Furniture Assets
                  </div>
                </th>

                {/* Calendar Date Columns */}
                {calendarDates.map((dateStr) => {
                  const dObj = new Date(dateStr + 'T00:00:00');
                  const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = dObj.getDate();
                  const monthName = dObj.toLocaleDateString('en-US', { month: 'short' });
                  const isCurrentDay = dateStr === todayIso;

                  return (
                    <th 
                      key={dateStr}
                      style={{
                        padding: '10px 8px',
                        minWidth: '95px',
                        textAlign: 'center',
                        background: isCurrentDay ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                        borderBottom: isCurrentDay ? '2px solid var(--accent-gold)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: isCurrentDay ? 'var(--accent-gold)' : '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>
                        {dayName}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: isCurrentDay ? '#FFFFFF' : '#CBD5E1', marginTop: '2px' }}>
                        {dayNum} {monthName}
                      </div>
                      {isCurrentDay && (
                        <span style={{ fontSize: '9px', background: 'var(--accent-gold)', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: '900' }}>
                          TODAY
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body: Room Rows */}
            <tbody>
              {filteredRooms.map((room) => {
                const property = INITIAL_PROPERTIES.find(p => p.id === room.propertyId);

                return (
                  <tr 
                    key={room.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    
                    {/* Fixed Room Cell */}
                    <td style={{
                      padding: '12px 16px',
                      position: 'sticky',
                      left: 0,
                      background: '#070C18',
                      zIndex: 5,
                      boxShadow: '4px 0 10px rgba(0,0,0,0.3)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '900',
                            color: 'var(--accent-gold)'
                          }}>
                            {room.number}
                          </span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#F8FAFC' }}>
                              {room.type}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                              {property ? property.name.split(' ')[0] : ''} • ₹{room.rate ? `${room.rate}/nt` : 'VIP Demo'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '230px' }} title={room.furniture}>
                        🛋️ {room.furniture}
                      </div>
                    </td>

                    {/* Timeline Date Grid Cells for this Room */}
                    {calendarDates.map((dateStr) => {
                      // Find if any tape overlaps this date for this room
                      const matchingTape = tapes.find(t => t.roomId === room.id && t.checkIn <= dateStr && t.checkOut >= dateStr);
                      const isTapeStart = matchingTape && matchingTape.checkIn === dateStr;
                      const isCurrentDay = dateStr === todayIso;

                      let tapeBg = 'transparent';
                      let tapeBorder = 'none';
                      let tapeColor = '#FFFFFF';
                      let tapeBadge = '';

                      if (matchingTape) {
                        if (matchingTape.status === 'OCCUPIED') {
                          tapeBg = 'linear-gradient(90deg, #059669, #10B981)';
                          tapeBorder = '1px solid #34D399';
                          tapeBadge = '🟢 In-House';
                        } else if (matchingTape.status === 'RESERVED') {
                          tapeBg = 'linear-gradient(90deg, #D97706, #F59E0B)';
                          tapeBorder = '1px solid #FCD34D';
                          tapeBadge = '🟡 Reserved';
                        } else if (matchingTape.status === 'FITOUT') {
                          tapeBg = 'linear-gradient(90deg, #4338CA, #6366F1)';
                          tapeBorder = '1px solid #A5B4FC';
                          tapeBadge = '🔵 Godrej Fit-Out';
                        } else if (matchingTape.status === 'VIP_BLOCK') {
                          tapeBg = 'linear-gradient(90deg, #7E22CE, #A855F7)';
                          tapeBorder = '1px solid #D8B4FE';
                          tapeBadge = '🟣 VIP Block';
                        } else if (matchingTape.status === 'MAINTENANCE') {
                          tapeBg = 'linear-gradient(90deg, #DC2626, #EF4444)';
                          tapeBorder = '1px solid #FCA5A5';
                          tapeBadge = '🔴 QC Maintenance';
                        }
                      }

                      return (
                        <td
                          key={dateStr}
                          style={{
                            padding: '6px 4px',
                            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                            background: isCurrentDay ? 'rgba(212, 175, 55, 0.04)' : 'transparent',
                            height: '52px',
                            verticalAlign: 'middle',
                            position: 'relative'
                          }}
                        >
                          {matchingTape ? (
                            <div
                              onClick={() => {
                                playScanBeep();
                                setSelectedTape({ ...matchingTape, room, property });
                                setIsFolioModalOpen(true);
                              }}
                              style={{
                                background: tapeBg,
                                border: tapeBorder,
                                color: tapeColor,
                                borderRadius: isTapeStart ? '6px 0 0 6px' : (matchingTape.checkOut === dateStr ? '0 6px 6px 0' : '0'),
                                padding: '4px 6px',
                                fontSize: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                height: '36px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                overflow: 'hidden',
                                transition: 'transform 0.1s, filter 0.1s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                              title={`${matchingTape.guestName} (${matchingTape.status}) • Click to view Folio`}
                            >
                              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {matchingTape.guestName}
                              </div>
                              <div style={{ fontSize: '8.5px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{tapeBadge}</span>
                                {matchingTape.folioAmount > 0 && <span>• ₹{matchingTape.folioAmount}</span>}
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setNewBookingRoomId(room.id);
                                setNewCheckIn(dateStr);
                                setIsNewBookingModalOpen(true);
                              }}
                              style={{
                                width: '100%',
                                height: '32px',
                                borderRadius: '4px',
                                border: '1px dashed transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.06)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.background = 'transparent';
                              }}
                              title="Vacant • Click to book room"
                            >
                              <span style={{ fontSize: '10px', color: '#64748B', opacity: 0.4 }}>+</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧾 5. FOLIO AUDIT & ROOM DETAIL DRAWER / MODAL */}
      {/* ========================================================================= */}
      {isFolioModalOpen && selectedTape && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsFolioModalOpen(false)}
        >
          <div 
            style={{
              background: '#0B132B',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                  {selectedTape.property?.name || 'Property'} • Room {selectedTape.room?.number}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: '6px 0 0 0' }}>
                  {selectedTape.guestName}
                </h3>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  📞 {selectedTape.phone}
                </div>
              </div>

              <button
                onClick={() => setIsFolioModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Booking Dates & Status Row */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>CHECK-IN</div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>{formatDisplayDate(selectedTape.checkIn)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>CHECK-OUT</div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>{formatDisplayDate(selectedTape.checkOut)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>AUDIT STATUS</div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: selectedTape.auditStatus === 'AUDITED_LOCKED' ? '#34D399' : '#FBBF24' }}>
                  {selectedTape.auditStatus === 'AUDITED_LOCKED' ? 'LOCKED ✓' : 'PENDING'}
                </div>
              </div>
            </div>

            {/* Financial Folio Summary */}
            {selectedTape.folioAmount > 0 && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', fontWeight: '800', marginBottom: '8px' }}>
                  💰 AUDITED FOLIO CHARGES
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  <span>Gross Room Tariff:</span>
                  <span>₹{selectedTape.folioAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  <span>Advance Token Paid:</span>
                  <span style={{ color: '#34D399' }}>- ₹{selectedTape.advancePaid.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '900', color: '#FFFFFF', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                  <span>Balance Due at Check-out:</span>
                  <span style={{ color: '#F59E0B' }}>₹{(selectedTape.folioAmount - selectedTape.advancePaid).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Godrej Interio Staged Furniture */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '10px',
              padding: '12px 16px'
            }}>
              <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '800', marginBottom: '4px' }}>
                🛋️ GODREJ INTERIO ROOM ASSETS SPEC
              </div>
              <div style={{ fontSize: '11.5px', color: '#E2E8F0', lineHeight: '1.5' }}>
                {selectedTape.room?.furniture}
              </div>
            </div>

            {/* Notes */}
            {selectedTape.notes && (
              <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                "{selectedTape.notes}"
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  playSuccessChime();
                  showToast(`🧾 Folio bill for ${selectedTape.guestName} sent to Bluetooth Thermal Printer & Cloudflare D1!`, true);
                  setIsFolioModalOpen(false);
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, var(--accent-gold), #B45309)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                🖨️ Print Guest Folio Receipt
              </button>

              <button
                onClick={() => setIsFolioModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#CBD5E1',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ➕ 6. NEW ROOM BOOKING / FIT-OUT MODAL */}
      {/* ========================================================================= */}
      {isNewBookingModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsNewBookingModalOpen(false)}
        >
          <div 
            style={{
              background: '#0B132B',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="var(--accent-gold)" /> New Room Tape Reservation
              </h3>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Assign Room</label>
                <select
                  value={newBookingRoomId}
                  onChange={(e) => setNewBookingRoomId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#070C18',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                >
                  {INITIAL_ROOMS.map(rm => (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.number} — {rm.type} (₹{rm.rate}/nt)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Guest / Organization / Contractor</label>
                <input
                  type="text"
                  placeholder="e.g. Vedanta Executive Team or Narayana Carpenter"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#070C18',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Check-In Date</label>
                  <input
                    type="date"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#070C18',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Check-Out Date</label>
                  <input
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#070C18',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Booking Type</label>
                  <select
                    value={newBookingStatus}
                    onChange={(e) => setNewBookingStatus(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#070C18',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  >
                    <option value="RESERVED">🟡 Advance Reserved</option>
                    <option value="OCCUPIED">🟢 In-House (Check In Now)</option>
                    <option value="FITOUT">🔵 Godrej Furniture Fit-Out</option>
                    <option value="VIP_BLOCK">🟣 VIP Director Block</option>
                    <option value="MAINTENANCE">🔴 Maintenance / QC</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={newAdvancePaid}
                    onChange={(e) => setNewAdvancePaid(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#070C18',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Notes & Instructions</label>
                <textarea
                  placeholder="Special requests, extra mattress, Godrej fit-out instruction..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: '#070C18',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, var(--accent-gold), #B45309)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  Create Tape Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#CBD5E1',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default PmsTapeChartView;

import React, { useState } from 'react';
import { 
  Building2, 
  Hotel, 
  Layers, 
  Plus, 
  Send, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  Phone, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Users,
  Edit3,
  Trash2,
  ChevronRight,
  CreditCard,
  Archive
} from 'lucide-react';
import { SpotlightCard, ShimmerButton, BorderBeamBadge } from '../components/common/LuxuryComponents';

const STAGES = [
  { id: 'LEAD_INGESTION', label: '1. Lead Ingested', badge: 'badge-amber' },
  { id: 'SITE_MEASUREMENT', label: '2. Site Measurement Scheduled', badge: 'badge-purple' },
  { id: 'PROPOSAL_SENT', label: '3. Proposal & CAD Submitted', badge: 'badge-cyan' },
  { id: 'TOKEN_RECEIVED', label: '4. 50% Token Advance Received', badge: 'badge-gold' },
  { id: 'DEPOT_DISPATCH', label: '5. Depot Dispatch Confirmed', badge: 'badge-emerald' },
  { id: 'HANDOVER_SETTLED', label: '6. Handover Completed & Settled', badge: 'badge-emerald' }
];

const INITIAL_B2B_PROJECTS = [
  {
    id: 'B2B-HTL-001',
    clientName: 'Sri Sai Vasudev Residency',
    category: 'HOTEL',
    contactPerson: 'Sri Naresh Sir / General Manager',
    phone: '9437188291',
    location: 'Near Railway Station, Rayagada',
    roomsCount: 18,
    scope: '18 Deluxe Rooms (18 Teak Beds + 18 Mattresses + 18 2-Door Steel Almirahs + Reception Lobby)',
    contractValue: 840000,
    advancePaid: 420000,
    balanceDue: 420000,
    stage: 'DEPOT_DISPATCH',
    stageLabel: '5. Depot Dispatch Confirmed',
    nextAction: 'Confirm delivery truck arrival & Carpenter Narayana assembly slot',
    nextDate: '2026-09-22',
    tierDiscount: '15% Institutional Rebate'
  },
  {
    id: 'B2B-HTL-002',
    clientName: 'Hotel Sai International & Suites',
    category: 'HOTEL',
    contactPerson: 'K. Rama Krishna (Managing Director)',
    phone: '9861033441',
    location: 'Gunupur Main Road, Rayagada Dist.',
    roomsCount: 12,
    scope: '12 Executive AC Rooms (Teak King Beds + Luggage Racks + 3-Door Sliding Wardrobes)',
    contractValue: 580000,
    advancePaid: 0,
    balanceDue: 580000,
    stage: 'PROPOSAL_SENT',
    stageLabel: '3. Proposal & CAD Submitted',
    nextAction: 'Follow up on 50% Token approval meeting with Naresh Sir',
    nextDate: '2026-09-21',
    tierDiscount: '15% Institutional Rebate'
  },
  {
    id: 'B2B-CORP-001',
    clientName: 'JK Paper Mills Executive Guest House',
    category: 'CORPORATE',
    contactPerson: 'Er. Pradeep Patnaik (Admin Head)',
    phone: '9437012345',
    location: 'JK Pur Township, Rayagada',
    roomsCount: 6,
    scope: '6 VIP Suites (Centuro Motorized Recliners + Teak Coffee Tables + Ergonomic Study Workstations)',
    contractValue: 450000,
    advancePaid: 225000,
    balanceDue: 225000,
    stage: 'TOKEN_RECEIVED',
    stageLabel: '4. 50% Token Advance Received',
    nextAction: 'Issue factory fabrication order to Godrej Interio Hub',
    nextDate: '2026-09-24',
    tierDiscount: 'Custom Corporate Tier'
  },
  {
    id: 'B2B-HOSP-001',
    clientName: 'Utkal Multi-Specialty Hospital',
    category: 'HOSPITAL',
    contactPerson: 'Dr. Subhashish Jena (Medical Director)',
    phone: '9437198765',
    location: 'Barijhola Bypass, Rayagada',
    roomsCount: 24,
    scope: '24 Private Wards (Anti-Microbial Overbed Tables + Doctor Consult Cabins + Waiting Lounge Sofas)',
    contractValue: 1120000,
    advancePaid: 560000,
    balanceDue: 560000,
    stage: 'TOKEN_RECEIVED',
    stageLabel: '4. 50% Token Advance Received',
    nextAction: 'Coordinate phase 1 delivery for 12 cabins',
    nextDate: '2026-09-25',
    tierDiscount: '20% Healthcare Surcharge Waiver'
  }
];

export default function B2bInstitutionalProjectsView() {
  const [projects, setProjects] = useState(INITIAL_B2B_PROJECTS);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [incomingPayment, setIncomingPayment] = useState('');

  // New Project Form State
  const [newClientName, setNewClientName] = useState('');
  const [newCategory, setNewCategory] = useState('HOTEL');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('Rayagada');
  const [newRooms, setNewRooms] = useState(10);
  const [newContractValue, setNewContractValue] = useState(500000);

  // Financial Aggregations
  const totalPipeline = projects.reduce((acc, p) => acc + p.contractValue, 0);
  const totalReceived = projects.reduce((acc, p) => acc + p.advancePaid, 0);
  const totalPending = projects.reduce((acc, p) => acc + p.balanceDue, 0);

  // Filtered Projects
  const filteredProjects = projects.filter(p => {
    const matchesCat = selectedFilter === 'ALL' || p.category === selectedFilter;
    const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Handler: Add New Project
  const handleAddNewProject = (e) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newProj = {
      id: `B2B-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: newClientName,
      category: newCategory,
      contactPerson: newContact || 'Property Manager',
      phone: newPhone || '9437188291',
      location: newLocation,
      roomsCount: Number(newRooms),
      scope: `${newRooms} Rooms Turnkey Commercial Package (Beds, Storage, Study)`,
      contractValue: Number(newContractValue),
      advancePaid: 0,
      balanceDue: Number(newContractValue),
      stage: 'SITE_MEASUREMENT',
      stageLabel: '2. Site Measurement Scheduled',
      nextAction: 'Schedule Carpenter Narayana for laser measurement',
      nextDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      tierDiscount: Number(newRooms) >= 20 ? '20% Bulk Contract Surcharge' : '15% Institutional Rebate'
    };

    setProjects([newProj, ...projects]);
    setShowAddModal(false);
    setNewClientName('');
    setNewContact('');
    setNewPhone('');
  };

  // Handler: Save Edited Project
  const handleSaveEditedProject = (e) => {
    e.preventDefault();
    if (!editingProject) return;

    setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
    setEditingProject(null);
  };

  // Handler: Log Incoming Payment
  const handleLogPayment = () => {
    const amt = Number(incomingPayment);
    if (!amt || amt <= 0 || !editingProject) return;

    const updatedPaid = Math.min(editingProject.contractValue, editingProject.advancePaid + amt);
    const updatedDue = Math.max(0, editingProject.contractValue - updatedPaid);

    const updated = {
      ...editingProject,
      advancePaid: updatedPaid,
      balanceDue: updatedDue,
      stage: updatedPaid >= editingProject.contractValue ? 'HANDOVER_SETTLED' : 
             updatedPaid >= (editingProject.contractValue * 0.5) ? 'TOKEN_RECEIVED' : editingProject.stage,
      stageLabel: updatedPaid >= editingProject.contractValue ? '6. Handover Completed & Settled' :
                  updatedPaid >= (editingProject.contractValue * 0.5) ? '4. 50% Token Advance Received' : editingProject.stageLabel
    };

    setEditingProject(updated);
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
    setIncomingPayment('');
  };

  // Handler: Advance to Next Stage directly from Card
  const handleAdvanceStage = (projId) => {
    const target = projects.find(p => p.id === projId);
    if (!target) return;

    const currentIndex = STAGES.findIndex(s => s.id === target.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      const updated = {
        ...target,
        stage: nextStage.id,
        stageLabel: nextStage.label
      };
      setProjects(projects.map(p => p.id === projId ? updated : p));
    }
  };

  // Handler: Delete / Archive Project
  const handleDeleteProject = (projId) => {
    if (window.confirm('Are you sure you want to archive this commercial project?')) {
      setProjects(projects.filter(p => p.id !== projId));
      if (editingProject?.id === projId) setEditingProject(null);
    }
  };

  return (
    <div className="view-container" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 🌟 Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏨</span>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px' }}>
              B2B & INSTITUTIONAL PROJECTS HUB
            </h1>
            <BorderBeamBadge text="NARESH SIR DESK" variant="gold" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 0 0' }}>
            Centralized commercial client pipeline for Sri Sai Vasudev Residency, hotels, resorts, hospitals & institutional contracts.
          </p>
        </div>

        <ShimmerButton variant="gold" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Add Commercial Contract
        </ShimmerButton>
      </div>

      {/* 📊 Top Executive Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SpotlightCard>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Commercial Pipeline
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '4px' }}>
              ₹{totalPipeline.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Across {projects.length} Active Bulk Contracts
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Advance Payments Collected
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#10B981', marginTop: '4px' }}>
              ₹{totalReceived.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Verified In Bank Ledgers
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Milestone Receivables Due
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#EF4444', marginTop: '4px' }}>
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Tied to Depot Dispatch & Handover
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Contract Rooms / Units
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {projects.reduce((sum, p) => sum + p.roomsCount, 0)} Rooms
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Godrej Commercial Spec
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* 🔍 Search & Category Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'ALL', label: 'All Contracts' },
            { id: 'HOTEL', label: '🏨 Hotels & Resorts' },
            { id: 'CORPORATE', label: '🏢 Corporate Guest Houses' },
            { id: 'HOSPITAL', label: '🏥 Hospitals & Clinics' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedFilter === f.id ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)',
                background: selectedFilter === f.id ? 'rgba(212,175,55,0.18)' : 'rgba(15,23,42,0.6)',
                color: selectedFilter === f.id ? 'var(--accent-gold-light)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: selectedFilter === f.id ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search hotel or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              background: '#0B132B',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px'
            }}
          />
        </div>
      </div>

      {/* 📋 Project Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {filteredProjects.map(proj => (
          <SpotlightCard key={proj.id}>
            <div style={{ padding: '24px' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#FFFFFF', fontWeight: '800' }}>
                      {proj.clientName}
                    </h3>
                    <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                      {proj.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span><Users size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {proj.contactPerson}</span>
                    <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {proj.location}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                    ₹{proj.contractValue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {proj.roomsCount} Rooms Contract
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#FFFFFF', marginBottom: '14px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>Scope: </span>
                {proj.scope}
              </div>

              {/* Progress Milestones */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Stage: <strong style={{ color: 'var(--accent-gold-light)' }}>{proj.stageLabel}</strong></span>
                  <span>{proj.advancePaid > 0 ? `${Math.round((proj.advancePaid / proj.contractValue) * 100)}% Funded` : 'Token Pending'}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(100, Math.round((proj.advancePaid / proj.contractValue) * 100))}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--accent-gold), #10B981)',
                      borderRadius: '3px'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>Advance: ₹{proj.advancePaid.toLocaleString('en-IN')}</span>
                  <span style={{ color: '#EF4444', fontWeight: '700' }}>Due: ₹{proj.balanceDue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Next Follow-up Action */}
              <div style={{ background: 'rgba(212,175,55,0.08)', borderLeft: '3px solid var(--accent-gold)', padding: '8px 12px', borderRadius: '0 6px 6px 0', fontSize: '11.5px', marginBottom: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Next Milestone Action</div>
                <div style={{ color: '#FFFFFF', fontWeight: '600' }}>{proj.nextAction}</div>
                <div style={{ color: 'var(--accent-gold)', fontSize: '10.5px', marginTop: '2px' }}>Due Date: {proj.nextDate}</div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-ghost-edit"
                  style={{ padding: '8px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setEditingProject({ ...proj })}
                  title="Edit details, change stage, or log payment"
                >
                  <Edit3 size={12} /> Edit / Log Payment
                </button>

                <button
                  className="btn-cyan"
                  style={{ padding: '8px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => handleAdvanceStage(proj.id)}
                  title="Advance project to next stage"
                >
                  <ChevronRight size={12} /> Next Stage
                </button>

                <button
                  className="btn-emerald"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '11.5px' }}
                  onClick={() => {
                    const text = encodeURIComponent(`Namaskar ${proj.contactPerson}! 🙏 This is Naresh / Director Rakesh from Sri Vinayaka Furnitures (Godrej Interio Rayagada). Regarding our commercial contract for ${proj.clientName} (${proj.roomsCount} Rooms): Next Step: ${proj.nextAction}. Current Balance: ₹${proj.balanceDue.toLocaleString('en-IN')}. Please confirm your availability today.`);
                    window.open(`https://wa.me/91${proj.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                  }}
                >
                  <Send size={12} /> WhatsApp Follow-up
                </button>

                <button
                  className="btn-ghost-edit"
                  style={{ padding: '8px', color: '#EF4444' }}
                  onClick={() => handleDeleteProject(proj.id)}
                  title="Archive or Delete project"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* ✏️ Modal: Edit Commercial Contract & Log Payment */}
      {editingProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0F172A', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#FFFFFF', fontWeight: '800' }}>
                  ✏️ Edit Commercial Contract: {editingProject.clientName}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>ID: {editingProject.id}</span>
              </div>
              <button onClick={() => setEditingProject(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Quick Payment Logger */}
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <CreditCard size={14} /> Log Incoming Client Payment
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 100000)"
                  value={incomingPayment}
                  onChange={(e) => setIncomingPayment(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px' }}
                />
                <button
                  type="button"
                  className="btn-emerald"
                  onClick={handleLogPayment}
                  style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  + Add to Advance
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Currently Paid: <strong style={{ color: '#10B981' }}>₹{editingProject.advancePaid.toLocaleString('en-IN')}</strong> | Balance Due: <strong style={{ color: '#EF4444' }}>₹{editingProject.balanceDue.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handleSaveEditedProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Client / Hotel Name</label>
                  <input
                    type="text"
                    required
                    value={editingProject.clientName}
                    onChange={(e) => setEditingProject({ ...editingProject, clientName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Project Stage</label>
                  <select
                    value={editingProject.stage}
                    onChange={(e) => {
                      const found = STAGES.find(s => s.id === e.target.value);
                      setEditingProject({
                        ...editingProject,
                        stage: e.target.value,
                        stageLabel: found ? found.label : editingProject.stageLabel
                      });
                    }}
                    style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contact Person</label>
                  <input
                    type="text"
                    value={editingProject.contactPerson}
                    onChange={(e) => setEditingProject({ ...editingProject, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>WhatsApp Phone</label>
                  <input
                    type="text"
                    value={editingProject.phone}
                    onChange={(e) => setEditingProject({ ...editingProject, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Contract Value (₹)</label>
                  <input
                    type="number"
                    value={editingProject.contractValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingProject({
                        ...editingProject,
                        contractValue: val,
                        balanceDue: Math.max(0, val - editingProject.advancePaid)
                      });
                    }}
                    style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Rooms / Units</label>
                  <input
                    type="number"
                    value={editingProject.roomsCount}
                    onChange={(e) => setEditingProject({ ...editingProject, roomsCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Scope of Work Specifications</label>
                <textarea
                  rows="2"
                  value={editingProject.scope}
                  onChange={(e) => setEditingProject({ ...editingProject, scope: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Next Milestone Action</label>
                <input
                  type="text"
                  value={editingProject.nextAction}
                  onChange={(e) => setEditingProject({ ...editingProject, nextAction: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFFFFF', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-ghost-edit"
                  onClick={() => setEditingProject(null)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <ShimmerButton variant="gold" type="submit" style={{ flex: 1 }}>
                  Save Deal Changes
                </ShimmerButton>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ➕ Modal: Add New Commercial Contract */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0F172A', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF', fontWeight: '800' }}>
                🏨 Add Commercial Client Contract
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddNewProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Hotel / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Sai Vasudev Residency"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    <option value="HOTEL">Hotel & Resort</option>
                    <option value="CORPORATE">Corporate Office</option>
                    <option value="HOSPITAL">Hospital / Clinic</option>
                    <option value="EDUCATION">School / College</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Total Rooms / Units</label>
                  <input
                    type="number"
                    min="1"
                    value={newRooms}
                    onChange={(e) => setNewRooms(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Contact Person</label>
                  <input
                    type="text"
                    placeholder="Managing Director / Owner"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>WhatsApp Phone</label>
                  <input
                    type="text"
                    placeholder="94371xxxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Location / Site</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Estimated Contract Value (₹)</label>
                  <input
                    type="number"
                    value={newContractValue}
                    onChange={(e) => setNewContractValue(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#070D18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-ghost-edit"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <ShimmerButton variant="gold" type="submit" style={{ flex: 1 }}>
                  Create B2B Project
                </ShimmerButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

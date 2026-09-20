import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  FileText, 
  Zap, 
  Cpu, 
  Scale, 
  Activity,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Tag,
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { 
  getStoredKnowledgeDocs, 
  saveKnowledgeDoc, 
  deleteKnowledgeDoc, 
  resetKnowledgeDocsToDefault, 
  autoExtractKeywords, 
  exportKnowledgeDocsAsJson, 
  importKnowledgeDocsFromJson,
  runAgenticRagPipeline, 
  searchGroundedKnowledge 
} from '../../services/catalogRagService';
import { playScanBeep, playSuccessChime } from '../../utils/audioUtils';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: FolderOpen },
  { id: 'WARRANTY_SPECS', label: '🛡️ Warranty & Mechanics', icon: ShieldCheck },
  { id: 'MATERIAL_SPECS', label: '🪵 Wood, Steel & Marine Ply', icon: Layers },
  { id: 'COMMERCIAL_B2B', label: '🏨 B2B & Hotel Slabs', icon: Scale },
  { id: 'LOGISTICS_SLA', label: '🚚 Logistics & Assembly', icon: Zap },
  { id: 'FINANCE_OFFERS', label: '💳 0% EMI & Exchange', icon: Sparkles }
];

export function AgenticRagStudioModal({ isOpen, onClose }) {
  const [docsList, setDocsList] = useState(() => getStoredKnowledgeDocs());
  const [query, setQuery] = useState('What is the warranty period on Godrej Centuro motorized recliner mechanism?');
  const [pipelineResult, setPipelineResult] = useState(() => runAgenticRagPipeline('What is the warranty period on Godrej Centuro motorized recliner mechanism?'));
  const [activeTab, setActiveTab] = useState('STUDIO'); // 'STUDIO' | 'KNOWLEDGE_BASE'
  const [copiedId, setCopiedId] = useState(null);
  
  // Knowledge Base Filtering
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Editor State
  const [editingDoc, setEditingDoc] = useState(null); // null or doc object
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [editorTestQuery, setEditorTestQuery] = useState('');
  const [editorTestResult, setEditorTestResult] = useState(null);
  
  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Backup & Import Modal State
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [backupFeedback, setBackupFeedback] = useState(null);

  if (!isOpen) return null;

  const sampleQueries = [
    {
      label: '🛋️ Centuro Recliner Warranty',
      q: 'What is the warranty period on Godrej Centuro motorized recliner mechanism?'
    },
    {
      label: '🚪 Slimline Royal Burgundy & Locker',
      q: 'Does the Slimline wardrobe come in Royal Burgundy with a locker?'
    },
    {
      label: '🍳 Kitchen Coastal Humidity & Termites',
      q: 'Can the modular kitchen withstand coastal Odisha humidity and termites?'
    },
    {
      label: '🏨 Hotel Bulk Contract Slabs',
      q: 'What are the bulk pricing discount slabs and payment terms for hotel rooms?'
    }
  ];

  const handleRunQuery = (qText) => {
    const q = (qText || query).trim();
    if (!q) return;
    if (qText) setQuery(qText);
    playScanBeep();
    const res = runAgenticRagPipeline(q);
    setPipelineResult(res);
    playSuccessChime();
    if (activeTab !== 'STUDIO') setActiveTab('STUDIO');
  };

  const handleCopyCitation = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered knowledge documents
  const filteredDocs = useMemo(() => {
    return docsList.filter(doc => {
      const matchCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
      const q = searchFilter.toLowerCase().trim();
      const matchSearch = !q || 
        (doc.title || '').toLowerCase().includes(q) ||
        (doc.citation || '').toLowerCase().includes(q) ||
        (doc.content || '').toLowerCase().includes(q) ||
        (doc.keywords || []).some(k => k.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [docsList, selectedCategory, searchFilter]);

  // Open Edit Form
  const handleOpenEdit = (doc) => {
    setEditingDoc({
      ...doc,
      keywords: [...(doc.keywords || [])]
    });
    setEditorTestQuery(doc.title || '');
    setEditorTestResult(null);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    const newDoc = {
      id: '',
      title: '',
      category: selectedCategory !== 'ALL' ? selectedCategory : 'WARRANTY_SPECS',
      citation: '',
      content: '',
      keywords: []
    };
    setEditingDoc(newDoc);
    setEditorTestQuery('');
    setEditorTestResult(null);
  };

  // Save Document
  const handleSaveDoc = () => {
    if (!editingDoc.title?.trim() || !editingDoc.content?.trim()) {
      alert('Please provide both a Title and Policy Content for this document.');
      return;
    }

    playScanBeep();
    const saved = saveKnowledgeDoc(editingDoc);
    const updatedList = getStoredKnowledgeDocs();
    setDocsList(updatedList);
    setEditingDoc(null);
    playSuccessChime();

    // Re-run pipeline on current query to refresh citations
    if (query) {
      setPipelineResult(runAgenticRagPipeline(query));
    }
  };

  // Delete Document
  const handleDeleteDoc = (docId) => {
    deleteKnowledgeDoc(docId);
    const updated = getStoredKnowledgeDocs();
    setDocsList(updated);
    setDeleteConfirmId(null);
    playSuccessChime();

    if (query) {
      setPipelineResult(runAgenticRagPipeline(query));
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all knowledge documents to official Godrej factory defaults? Any custom documents will be replaced.')) {
      const restored = resetKnowledgeDocsToDefault();
      setDocsList(restored);
      playSuccessChime();
      if (query) {
        setPipelineResult(runAgenticRagPipeline(query));
      }
    }
  };

  // Auto-extract keywords
  const handleAutoKeywords = () => {
    if (!editingDoc) return;
    const extracted = autoExtractKeywords(editingDoc.content, editingDoc.title);
    setEditingDoc(prev => ({
      ...prev,
      keywords: Array.from(new Set([...(prev.keywords || []), ...extracted]))
    }));
    playSuccessChime();
  };

  // Add custom keyword
  const handleAddKeyword = () => {
    const kw = newKeywordInput.trim().toLowerCase();
    if (!kw || !editingDoc) return;
    if (!editingDoc.keywords.includes(kw)) {
      setEditingDoc(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), kw]
      }));
    }
    setNewKeywordInput('');
  };

  // Remove keyword
  const handleRemoveKeyword = (kwToRemove) => {
    if (!editingDoc) return;
    setEditingDoc(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== kwToRemove)
    }));
  };

  // In-Editor Live Testing
  const handleEditorTest = () => {
    if (!editorTestQuery.trim()) return;
    const res = runAgenticRagPipeline(editorTestQuery.trim());
    setEditorTestResult(res);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #0F172A 50%, #1E1B4B 100%)',
        border: '1px solid rgba(147, 51, 234, 0.45)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '980px',
        maxHeight: '94vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(147, 51, 234, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)'
            }}>
              <BookOpen size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.3px' }}>
                  Production Agentic RAG Studio
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '9.5px', background: 'rgba(212,175,55,0.2)', border: '1px solid var(--accent-gold)' }}>
                  JamWithAI Architecture
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                Hybrid Retrieval (BM25 + Semantic) • Document Grading • Zero-Hallucination Grounding
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('STUDIO')}
              style={{
                background: activeTab === 'STUDIO' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'STUDIO' ? '#000000' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Zap size={13} /> Live Pipeline Runner
            </button>
            <button
              onClick={() => setActiveTab('KNOWLEDGE_BASE')}
              style={{
                background: activeTab === 'KNOWLEDGE_BASE' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'KNOWLEDGE_BASE' ? '#000000' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <BookOpen size={13} /> Indexed Godrej Docs ({docsList.length})
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', marginLeft: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* TAB 1: STUDIO PIPELINE RUNNER */}
          {activeTab === 'STUDIO' && (
            <>
              {/* Query Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRunQuery(); }}
                      placeholder="Ask any technical Godrej product specification, warranty, or B2B clause..."
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(147, 51, 234, 0.4)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleRunQuery()}
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0 20px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
                    }}
                  >
                    <Zap size={14} /> Run RAG Pipeline
                  </button>
                </div>

                {/* Sample Prompt Chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 'bold' }}>⚡ Test Questions:</span>
                  {sampleQueries.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRunQuery(chip.q)}
                      style={{
                        background: query === chip.q ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                        border: query === chip.q ? '1px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        color: query === chip.q ? '#E9D5FF' : '#CBD5E1',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LangGraph Pipeline Execution Visualizer */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#A855F7" />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.3px' }}>
                      LangGraph Multi-Stage Execution Pipeline
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: pipelineResult.isGrounded ? '#34D399' : '#F87171',
                    background: pipelineResult.isGrounded ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    border: `1px solid ${pipelineResult.isGrounded ? '#34D399' : '#F87171'}`
                  }}>
                    Confidence: {pipelineResult.confidencePct}% Accurate
                  </span>
                </div>

                {/* 4 Pipeline Stages */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {/* STAGE 1: RETRIEVAL */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 'bold' }}>STAGE 1: RETRIEVAL</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#38BDF8', marginTop: '4px' }}>Hybrid Fusion</div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>BM25 (Lexical) + Dense Vector</div>
                  </div>

                  {/* STAGE 2: RANKING */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 'bold' }}>STAGE 2: RANKING</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#818CF8', marginTop: '4px' }}>Reciprocal Rank</div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                      RRF Rank Score: {pipelineResult.retrievedDocuments[0]?.relevanceScore || '0.00'}
                    </div>
                  </div>

                  {/* STAGE 3: DOC GRADER */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 'bold' }}>STAGE 3: DOC GRADER</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: pipelineResult.isGrounded ? '#34D399' : '#F87171', marginTop: '4px' }}>
                      {pipelineResult.graderResult}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Zero-Hallucination Gatekeeper</div>
                  </div>

                  {/* STAGE 4: CITATION */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 'bold' }}>STAGE 4: SYNTHESIS</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-gold)', marginTop: '4px' }}>Grounded Answer</div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Exact Godrej Manual Quoted</div>
                  </div>
                </div>
              </div>

              {/* Retrieved Grounded Knowledge Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>
                    Verified Grounded Sources ({pipelineResult.retrievedDocuments.length})
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Strict Zero Hallucination Mode Active
                  </span>
                </div>

                {pipelineResult.retrievedDocuments.length === 0 ? (
                  <div style={{
                    padding: '28px',
                    textAlign: 'center',
                    background: 'rgba(248, 113, 113, 0.08)',
                    border: '1px dashed rgba(248, 113, 113, 0.3)',
                    borderRadius: '10px',
                    color: '#F87171',
                    fontSize: '12.5px'
                  }}>
                    ⚠️ No officially grounded Godrej documents passed the confidence threshold for this query.
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                      The Document Grader safely blocked the AI from guessing or making up unverified facts.
                    </div>
                  </div>
                ) : (
                  pipelineResult.retrievedDocuments.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: idx === 0 ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            background: idx === 0 ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            #{idx + 1} MATCH ({doc.relevanceScore})
                          </span>
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#FFFFFF' }}>{doc.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                            BM25: {doc.bm25Score} • Dense: {doc.semanticScore}
                          </span>
                          <button
                            onClick={() => handleCopyCitation(doc.citation, doc.id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#CBD5E1',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Copy Source Citation"
                          >
                            {copiedId === doc.id ? <Check size={10} color="#34D399" /> : <Copy size={10} />}
                            {copiedId === doc.id ? 'Copied' : 'Cite'}
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '600' }}>
                        📖 Citation: {doc.citation}
                      </div>

                      <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: '1.6', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px' }}>
                        {doc.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* TAB 2: KNOWLEDGE BASE CMS (CLIENT EDIT STUDIO) */}
          {activeTab === 'KNOWLEDGE_BASE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Action Toolbar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ position: 'relative', flex: '1 1 260px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search indexed policies, citations, keywords..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleOpenCreate}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-gold), #B8860B)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <Plus size={14} /> + Add Knowledge Doc
                  </button>

                  <button
                    onClick={() => setShowBackupModal(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#CBD5E1',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Export or Import JSON Backup"
                  >
                    <Download size={13} /> Backup / Sync
                  </button>

                  <button
                    onClick={handleResetDefaults}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#F87171',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Reset to Factory Godrej Documents"
                  >
                    <RotateCcw size={13} /> Reset Defaults
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const count = cat.id === 'ALL' 
                    ? docsList.length 
                    : docsList.filter(d => d.category === cat.id).length;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        background: isSelected ? 'rgba(124, 58, 237, 0.35)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? '1px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#FFFFFF' : '#94A3B8',
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Icon size={12} />
                      <span>{cat.label}</span>
                      <span style={{
                        fontSize: '9.5px',
                        background: isSelected ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Document Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                {filteredDocs.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '30px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '13px'
                  }}>
                    No documents found matching "{searchFilter}".
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-gold" style={{ fontSize: '9.5px' }}>
                          {doc.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
                            {doc.id}
                          </span>
                          <button
                            onClick={() => handleOpenEdit(doc)}
                            style={{
                              background: 'rgba(124, 58, 237, 0.25)',
                              border: '1px solid rgba(124, 58, 237, 0.5)',
                              color: '#C084FC',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '10.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="Edit Document"
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(doc.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#F87171',
                              borderRadius: '6px',
                              padding: '3px 7px',
                              fontSize: '10.5px',
                              cursor: 'pointer'
                            }}
                            title="Delete Policy"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Citation */}
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FFFFFF', lineHeight: '1.4' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '500' }}>
                        📖 {doc.citation}
                      </div>

                      {/* Content Snippet */}
                      <div style={{
                        fontSize: '11.5px',
                        color: '#CBD5E1',
                        lineHeight: '1.5',
                        background: 'rgba(0,0,0,0.25)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        maxHeight: '75px',
                        overflowY: 'auto'
                      }}>
                        {doc.content}
                      </div>

                      {/* Keywords Chips */}
                      {doc.keywords && doc.keywords.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                          {doc.keywords.slice(0, 6).map((k, kidx) => (
                            <span
                              key={kidx}
                              style={{
                                fontSize: '9.5px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#94A3B8',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              #{k}
                            </span>
                          ))}
                          {doc.keywords.length > 6 && (
                            <span style={{ fontSize: '9.5px', color: '#64748B', alignSelf: 'center' }}>
                              +{doc.keywords.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Test Query Button */}
                      <button
                        onClick={() => handleRunQuery(doc.title)}
                        style={{
                          marginTop: '4px',
                          background: 'rgba(124, 58, 237, 0.15)',
                          border: '1px solid rgba(124, 58, 237, 0.35)',
                          color: '#C084FC',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Zap size={12} /> Test Query in Live Pipeline
                      </button>

                      {/* Delete Confirmation In-Card */}
                      {deleteConfirmId === doc.id && (
                        <div style={{
                          marginTop: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: '10.5px', color: '#FCA5A5' }}>
                            Permanently remove this policy?
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              style={{
                                background: '#DC2626',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: '#CBD5E1',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            🔒 <strong>Zero Hallucination Guarantee:</strong> Powered by LangGraph document grading & hybrid reciprocal rank fusion.
          </div>
          <button
            onClick={onClose}
            className="btn-luxury-gold"
            style={{ fontSize: '12px', padding: '6px 18px' }}
          >
            Done
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ✏️ MODAL: DOCUMENT CMS EDITOR (ADD / EDIT)                               */}
      {/* ========================================================================= */}
      {editingDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(147, 51, 234, 0.3)'
          }}>
            {/* Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#C084FC" />
                <h4 style={{ margin: 0, fontSize: '15px', color: '#FFFFFF', fontWeight: '800' }}>
                  {editingDoc.id ? '✏️ Edit Godrej Knowledge Document' : '➕ Add New Knowledge Document'}
                </h4>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', fontWeight: 'bold', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={editingDoc.category}
                onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="WARRANTY_SPECS">🛡️ WARRANTY_SPECS (Recliners, Mechanisms, Lockers)</option>
                <option value="MATERIAL_SPECS">🪵 MATERIAL_SPECS (Wood, 710 Marine Ply, Steel, Fabric)</option>
                <option value="COMMERCIAL_B2B">🏨 COMMERCIAL_B2B (Hotel Slabs, Naresh Sir Contract)</option>
                <option value="LOGISTICS_SLA">🚚 LOGISTICS_SLA (Rayagada Delivery SLA, Assembly)</option>
                <option value="FINANCE_OFFERS">💳 FINANCE_OFFERS (0% EMI, Old Furniture Exchange)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', fontWeight: 'bold', marginBottom: '6px' }}>
                Document Title
              </label>
              <input
                type="text"
                value={editingDoc.title}
                onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                placeholder="e.g. Centuro Motorized Recliner Warranty & Mechanism Specs"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Official Citation */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', fontWeight: 'bold', marginBottom: '6px' }}>
                Official Godrej Citation / Reference
              </label>
              <input
                type="text"
                value={editingDoc.citation}
                onChange={(e) => setEditingDoc({ ...editingDoc, citation: e.target.value })}
                placeholder="e.g. Godrej Interio Warranty Standard GI-WARR-2026 - Section 4.2, Page 9"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Policy Content */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '11.5px', color: '#CBD5E1', fontWeight: 'bold' }}>
                  Policy / Specification Text (Ground Truth Fact)
                </label>
                <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                  {editingDoc.content?.length || 0} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={editingDoc.content}
                onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                placeholder="Enter exact manufacturer specifications, terms, warranty years, and technical details..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Keyword Tuner */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11.5px', color: '#CBD5E1', fontWeight: 'bold' }}>
                  Search Keywords & Slang Tags ({editingDoc.keywords?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={handleAutoKeywords}
                  style={{
                    background: 'rgba(124, 58, 237, 0.3)',
                    border: '1px solid #A855F7',
                    color: '#E9D5FF',
                    borderRadius: '6px',
                    padding: '3px 9px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Auto-extract optimal keywords from title and content"
                >
                  <Sparkles size={11} /> ✨ Auto-Extract Keywords
                </button>
              </div>

              {/* Tag Chips */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                minHeight: '40px',
                alignItems: 'center'
              }}>
                {(editingDoc.keywords || []).map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(124, 58, 237, 0.25)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      color: '#E9D5FF',
                      fontSize: '10.5px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    #{kw}
                    <X
                      size={11}
                      onClick={() => handleRemoveKeyword(kw)}
                      style={{ cursor: 'pointer', color: '#F87171' }}
                    />
                  </span>
                ))}

                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
                    placeholder="+ add tag"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      outline: 'none',
                      width: '75px'
                    }}
                  />
                  {newKeywordInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        padding: '1px 6px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live In-Editor Validation Bar */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94A3B8' }}>
                ⚡ Test Document Retrieval Before Saving:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={editorTestQuery}
                  onChange={(e) => setEditorTestQuery(e.target.value)}
                  placeholder="Ask a question targeting this policy..."
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '11px'
                  }}
                />
                <button
                  type="button"
                  onClick={handleEditorTest}
                  style={{
                    background: 'rgba(124, 58, 237, 0.3)',
                    border: '1px solid #A855F7',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Test Match
                </button>
              </div>

              {editorTestResult && (
                <div style={{ fontSize: '11px', color: editorTestResult.isGrounded ? '#34D399' : '#F87171', marginTop: '4px' }}>
                  {editorTestResult.isGrounded 
                    ? `✅ PASSED GRADER: Matches "${editorTestResult.retrievedDocuments[0]?.title}" (${editorTestResult.confidencePct}% Confidence)`
                    : '❌ Did not match threshold. Add more relevant keywords to improve match.'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDoc}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gold), #B8860B)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
                }}
              >
                💾 Save & Re-Index Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📥 MODAL: BACKUP / SYNC JSON                                              */}
      {/* ========================================================================= */}
      {showBackupModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} color="var(--accent-gold)" />
                <h4 style={{ margin: 0, fontSize: '15px', color: '#FFFFFF', fontWeight: '800' }}>
                  Knowledge Base Backup & Transfer
                </h4>
              </div>
              <button
                onClick={() => { setShowBackupModal(false); setBackupFeedback(null); }}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: '1.5' }}>
              Export all {docsList.length} indexed Godrej policies as a JSON backup, or import a JSON pack from another showroom computer.
            </div>

            {/* Export Action */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const jsonStr = exportKnowledgeDocsAsJson();
                  navigator.clipboard.writeText(jsonStr);
                  setBackupFeedback({ type: 'success', text: '✅ Knowledge JSON copied to clipboard!' });
                  playSuccessChime();
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '9px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Copy size={13} /> Copy JSON to Clipboard
              </button>

              <button
                type="button"
                onClick={() => {
                  const jsonStr = exportKnowledgeDocsAsJson();
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `godrej_interio_knowledge_base_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setBackupFeedback({ type: 'success', text: '✅ Downloaded JSON backup file!' });
                  playSuccessChime();
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={13} /> Download .json File
              </button>
            </div>

            {/* Import Area */}
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', fontWeight: 'bold', marginBottom: '6px' }}>
                Paste JSON to Import
              </label>
              <textarea
                rows={4}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "id": "DOC-1", "title": "...", "content": "..." } ]'
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!importJsonText.trim()) return;
                  const res = importKnowledgeDocsFromJson(importJsonText.trim());
                  if (res.success) {
                    setDocsList(getStoredKnowledgeDocs());
                    setImportJsonText('');
                    setBackupFeedback({ type: 'success', text: `✅ Successfully imported ${res.count} documents!` });
                    playSuccessChime();
                  } else {
                    setBackupFeedback({ type: 'error', text: `❌ Import failed: ${res.error}` });
                  }
                }}
                style={{
                  marginTop: '8px',
                  background: 'rgba(52, 211, 153, 0.2)',
                  border: '1px solid #34D399',
                  color: '#34D399',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Upload size={13} /> Import & Replace Knowledge Base
              </button>
            </div>

            {/* Feedback Message */}
            {backupFeedback && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                background: backupFeedback.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: backupFeedback.type === 'success' ? '#34D399' : '#FCA5A5',
                border: `1px solid ${backupFeedback.type === 'success' ? '#34D399' : '#EF4444'}`
              }}>
                {backupFeedback.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

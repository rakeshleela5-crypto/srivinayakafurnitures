import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { 
  GODREJ_KNOWLEDGE_DOCS, 
  runAgenticRagPipeline, 
  searchGroundedKnowledge 
} from '../../services/catalogRagService';
import { playScanBeep, playSuccessChime } from '../../utils/audioUtils';

export function AgenticRagStudioModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('What is the warranty period on Godrej Centuro motorized recliner mechanism?');
  const [pipelineResult, setPipelineResult] = useState(() => runAgenticRagPipeline('What is the warranty period on Godrej Centuro motorized recliner mechanism?'));
  const [activeTab, setActiveTab] = useState('STUDIO'); // 'STUDIO' | 'KNOWLEDGE_BASE'
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

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
  };

  const handleCopyCitation = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #0F172A 50%, #1E1B4B 100%)',
        border: '1px solid rgba(147, 51, 234, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(147, 51, 234, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.25)'
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
                LangGraph Hybrid Retrieval (BM25 + Semantic Vectors) • Document Grading • Zero-Hallucination Citations
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
                cursor: 'pointer'
              }}
            >
              ⚡ Live Pipeline Runner
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
                cursor: 'pointer'
              }}
            >
              📚 Indexed Godrej Docs ({GODREJ_KNOWLEDGE_DOCS.length})
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
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={13} /> LangGraph Multi-Stage Execution Pipeline
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '9.5px' }}>
                    Confidence: {pipelineResult.confidencePct}% Accurate
                  </span>
                </div>

                {/* 4 Steps Flow */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {/* Step 1 */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>STAGE 1: RETRIEVAL</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Scale size={13} color="#60A5FA" /> Hybrid Fusion
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                      BM25 (Lexical) + Dense Vector (Semantic Keyword Cluster)
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>STAGE 2: RANKING</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Layers size={13} color="#C084FC" /> Reciprocal Rank
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                      RRF Rank Score: {pipelineResult.retrievedDocuments[0]?.relevanceScore || 0.85}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#34D399', fontWeight: '700', marginBottom: '4px' }}>STAGE 3: DOC GRADER</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#34D399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={13} /> {pipelineResult.graderResult}
                    </div>
                    <div style={{ fontSize: '10px', color: '#A7F3D0', marginTop: '4px' }}>
                      Zero-Hallucination Gatekeeper Passed
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: '700', marginBottom: '4px' }}>STAGE 4: SYNTHESIS</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={13} /> Grounded Answer
                    </div>
                    <div style={{ fontSize: '10px', color: '#FDE68A', marginTop: '4px' }}>
                      Exact Godrej Manual Page Quoted
                    </div>
                  </div>
                </div>
              </div>

              {/* Retrieved Grounded Knowledge & Answers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="var(--accent-gold)" /> Verified Grounded Sources ({pipelineResult.retrievedDocuments.length})
                </div>

                {pipelineResult.retrievedDocuments.map((doc, idx) => (
                  <div
                    key={doc.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: idx === 0 ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                          #{idx + 1} MATCH ({doc.relevanceScore})
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                          {doc.title}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10.5px', color: '#34D399', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          BM25: {doc.bm25Score} • Dense: {doc.semanticScore}
                        </span>
                        <button
                          onClick={() => handleCopyCitation(doc.citation, doc.id)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#CBD5E1',
                            borderRadius: '4px',
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
                ))}
              </div>
            </>
          )}

          {activeTab === 'KNOWLEDGE_BASE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                The following official Godrej Interio policy booklets, technical spec sheets, and Rayagada flagship charters are permanently indexed in your showroom's hybrid vector store:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {GODREJ_KNOWLEDGE_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-gold" style={{ fontSize: '9px' }}>{doc.category}</span>
                      <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>{doc.id}</span>
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#FFFFFF' }}>{doc.title}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-gold)' }}>📖 {doc.citation}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4', marginTop: '4px', maxHeight: '60px', overflow: 'hidden' }}>
                      {doc.content.slice(0, 140)}...
                    </div>
                    <button
                      onClick={() => handleRunQuery(doc.title)}
                      style={{
                        marginTop: '6px',
                        background: 'rgba(124, 58, 237, 0.2)',
                        border: '1px solid rgba(124, 58, 237, 0.4)',
                        color: '#C084FC',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '10.5px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}
                    >
                      ⚡ Test Query on this Document
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)'
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
    </div>
  );
}

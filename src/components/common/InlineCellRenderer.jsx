// ==============================================================================
// OmniBuild OS™ — InlineCellRenderer
// Drop-in <td> replacement with double-click edit, ✅/❌, D1 optimistic save.
// Used across all 12 data-table views.
// ==============================================================================
import React from 'react';
import { Edit2, Check, X, RefreshCw, CheckCircle2 } from 'lucide-react';

/**
 * EditableCell — renders a single <td> with inline edit capability.
 *
 * Props:
 *   value          — current cell value
 *   field          — field/column name (string)
 *   rowIdx         — row index (number)
 *   pkVal          — primary key value for D1 update
 *   isProtected    — boolean: PK or read-only → no edit
 *   editingCell    — from useInlineCellEdit
 *   setEditingCell — from useInlineCellEdit
 *   startEdit      — from useInlineCellEdit
 *   cancelEdit     — from useInlineCellEdit
 *   saveEdit       — from useInlineCellEdit
 *   isEditing      — (rowIdx, field) => bool
 *   isSaving       — (rowIdx, field) => bool
 *   isSaved        — (rowIdx, field) => bool
 *   children       — how to render the value when NOT editing
 *   style          — extra td style overrides
 *   numeric        — boolean: use number input
 */
export function EditableCell({
  value, field, rowIdx, pkVal,
  isProtected,
  editingCell, setEditingCell,
  startEdit, cancelEdit, saveEdit,
  isEditing: isEditingFn, isSaving: isSavingFn, isSaved: isSavedFn,
  children, style = {}, numeric = false,
  ...tdProps
}) {
  const resolvedProtected = typeof isProtected === 'function' ? isProtected(field) : Boolean(isProtected);
  const editing = isEditingFn ? isEditingFn(rowIdx, field) : false;
  const saving  = isSavingFn ? isSavingFn(rowIdx, field) : false;
  const saved   = isSavedFn ? isSavedFn(rowIdx, field) : false;

  const handleCellClick = (e) => {
    if (resolvedProtected || editing || saving) return;
    if (e.target.closest('button, a, select, input, .no-edit-click')) {
      return;
    }
    startEdit?.(rowIdx, field, value, pkVal);
  };

  const tdStyle = {
    position: 'relative',
    cursor: resolvedProtected ? 'default' : 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s, outline 0.2s',
    background: saved    ? 'rgba(16, 185, 129, 0.2)' :
                editing  ? 'rgba(9, 13, 22, 0.95)'    : undefined,
    outline: saved   ? '2px solid #10B981' :
             editing ? '2px solid #D4AF37'  : undefined,
    ...style
  };

  return (
    <td
      onClick={handleCellClick}
      onDoubleClick={() => !resolvedProtected && !editing && startEdit?.(rowIdx, field, value, pkVal)}
      title={resolvedProtected ? `🔒 Protected field` : `Click or double-click to edit (saves to Cloudflare D1 SQL)`}
      style={tdStyle}
      {...tdProps}
    >
      {editing ? (
        <div 
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', minWidth: '130px' }}
        >
          <input
            autoFocus
            type={numeric ? 'number' : 'text'}
            value={editingCell?.value ?? ''}
            onChange={e => setEditingCell(prev => ({ ...prev, value: e.target.value }))}
            onBlur={() => saveEdit?.()}
            onKeyDown={e => {
              if (e.key === 'Enter')  { e.preventDefault(); saveEdit?.(); }
              if (e.key === 'Escape') { cancelEdit?.(); }
            }}
            style={{
              flex: 1,
              minWidth: '85px',
              background: '#090D16',
              border: '1.5px solid #D4AF37',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.35)',
              borderRadius: '5px',
              padding: '4px 7px',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontFamily: numeric ? 'JetBrains Mono, monospace' : 'inherit',
              outline: 'none'
            }}
          />
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); saveEdit?.(); }}
            title="Save changes (Enter or click away)"
            style={{ 
              padding: '4px 6px', 
              background: 'rgba(16,185,129,0.25)', 
              border: '1px solid #10B981', 
              borderRadius: '4px', 
              color: '#10B981', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          ><Check size={12} /></button>
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); cancelEdit?.(); }}
            title="Cancel (Esc)"
            style={{ 
              padding: '4px 6px', 
              background: 'rgba(244,63,94,0.25)', 
              border: '1px solid #F43F5E', 
              borderRadius: '4px', 
              color: '#F43F5E', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          ><X size={12} /></button>
        </div>
      ) : saving ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D4AF37' }}>
          <RefreshCw size={12} className="animate-spin" />
          <span style={{ fontSize: '11px', fontWeight: '700' }}>Saving to D1...</span>
        </div>
      ) : saved ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34D399', fontWeight: '700' }}>
          <CheckCircle2 size={12} />
          <span>{children ?? String(value ?? '—')}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}>{children ?? String(value ?? '—')}</div>
          {!resolvedProtected && (
            <button
              type="button"
              className="cell-edit-badge"
              onClick={e => { 
                e.stopPropagation(); 
                startEdit?.(rowIdx, field, value, pkVal); 
              }}
              title="Click to inline-edit"
            >
              <Edit2 size={10} />
              <span>Edit</span>
            </button>
          )}
        </div>
      )}
    </td>
  );
}

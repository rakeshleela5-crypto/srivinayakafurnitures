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
  const editing = isEditingFn(rowIdx, field);
  const saving  = isSavingFn(rowIdx, field);
  const saved   = isSavedFn(rowIdx, field);

  const tdStyle = {
    position: 'relative',
    cursor: isProtected ? 'default' : 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s, outline 0.2s',
    background: saved    ? 'rgba(16, 185, 129, 0.18)' :
                editing  ? 'rgba(15, 23, 42, 0.9)'    : undefined,
    outline: saved   ? '1.5px solid #10B981' :
             editing ? '1.5px solid #D4AF37'  : undefined,
    ...style
  };

  return (
    <td
      onDoubleClick={() => !isProtected && startEdit(rowIdx, field, value, pkVal)}
      title={isProtected ? `🔒 Protected field` : `Double-click or click ✏️ to edit (saves to Cloudflare D1 SQL)`}
      style={tdStyle}
      {...tdProps}
    >
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
          <input
            autoFocus
            type={numeric ? 'number' : 'text'}
            value={editingCell.value}
            onChange={e => setEditingCell(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={e => {
              if (e.key === 'Enter')  { e.preventDefault(); saveEdit(); }
              if (e.key === 'Escape') { cancelEdit(); }
            }}
            style={{
              flex: 1,
              minWidth: '80px',
              background: '#030712',
              border: '1px solid #D4AF37',
              borderRadius: '4px',
              padding: '3px 6px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: numeric ? 'JetBrains Mono, monospace' : 'inherit',
              outline: 'none'
            }}
          />
          <button
            type="button"
            onClick={saveEdit}
            title="Save (Enter)"
            style={{ padding: '2px 5px', background: 'rgba(16,185,129,0.2)', border: 'none', borderRadius: '4px', color: '#10B981', cursor: 'pointer' }}
          ><Check size={12} /></button>
          <button
            type="button"
            onClick={cancelEdit}
            title="Cancel (Esc)"
            style={{ padding: '2px 5px', background: 'rgba(244,63,94,0.2)', border: 'none', borderRadius: '4px', color: '#F43F5E', cursor: 'pointer' }}
          ><X size={12} /></button>
        </div>
      ) : saving ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D4AF37' }}>
          <RefreshCw size={11} className="animate-spin" />
          <span style={{ fontSize: '10px' }}>Saving...</span>
        </div>
      ) : saved ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34D399' }}>
          <CheckCircle2 size={11} />
          <span>{children ?? String(value ?? '—')}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span>{children ?? String(value ?? '—')}</span>
          {!isProtected && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); startEdit(rowIdx, field, value, pkVal); }}
              title="Edit cell"
              style={{ padding: '1px 3px', background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', opacity: 0.6 }}
            ><Edit2 size={10} /></button>
          )}
        </div>
      )}
    </td>
  );
}

// ==============================================================================
// OmniBuild OS™ — Shared Inline Cell Edit Hook
// Provides double-click-to-edit with Cloudflare D1 persistence.
// Used across ALL 12+ data-table views in the OS.
// ==============================================================================
import { useState } from 'react';

/**
 * useInlineCellEdit
 * @param {Object}   options
 * @param {string}   options.table     — D1 table name (e.g. 'inquiries')
 * @param {string}   options.pkField   — primary key field name (e.g. 'Inquiry_ID')
 * @param {string[]} options.readOnly  — additional fields that must NOT be editable
 * @param {Function} options.setRows   — React state setter for the rows array
 * @param {Function} options.showToast — toast from useStore()
 * @param {Function} [options.onSaved] — optional callback(rowIdx, field, newValue) after save
 */
export function useInlineCellEdit({ table, pkField, readOnly = [], setRows, showToast, onSaved }) {
  const [editingCell, setEditingCell]     = useState(null);
  const [savingCellKey, setSavingCellKey] = useState(null);
  const [savedCellKey, setSavedCellKey]   = useState(null);

  const protectedFields = new Set([pkField, ...readOnly]);

  const startEdit = (rowIdx, field, currentValue, pkVal) => {
    if (protectedFields.has(field)) {
      showToast(`🔒 "${field}" is protected and cannot be edited directly.`, false);
      return;
    }
    setEditingCell({
      rowIdx, field,
      value: currentValue !== null && currentValue !== undefined ? String(currentValue) : '',
      originalValue: currentValue,
      pkVal
    });
  };

  const cancelEdit = () => setEditingCell(null);

  const saveEdit = async () => {
    if (!editingCell) return;
    const { rowIdx, field, value, originalValue, pkVal } = editingCell;

    if (String(value) === String(originalValue ?? '')) {
      setEditingCell(null);
      return;
    }

    const cellKey = `${rowIdx}-${field}`;
    setSavingCellKey(cellKey);

    const lf = field.toLowerCase();
    const isNumeric = ['amount','inr','qty','price','count','pct','rate','score','days','years','total','paid','due','balance','fee','cost','value','vol'].some(k => lf.includes(k));

    let coercedVal = value;
    if (isNumeric) {
      coercedVal = value === '' ? null : (value.includes('.') ? parseFloat(value) : parseInt(value, 10));
    }

    let previousRows;
    setRows(prev => {
      previousRows = [...prev];
      const next = [...prev];
      if (next[rowIdx]) next[rowIdx] = { ...next[rowIdx], [field]: coercedVal };
      return next;
    });
    setEditingCell(null);

    try {
      const res = await fetch('/api/d1-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cell',
          tableName: table,
          primaryKeyColumn: pkField,
          primaryKeyValue: pkVal,
          columnName: field,
          newValue: coercedVal
        })
      });
      const json = await res.json();
      if (json.success) {
        setSavedCellKey(cellKey);
        setTimeout(() => setSavedCellKey(null), 2500);
        showToast(`✅ ${field} updated in Cloudflare D1!`, true);
        onSaved?.(rowIdx, field, coercedVal);
      } else {
        setRows(prev => { const r = [...prev]; r[rowIdx] = previousRows[rowIdx]; return r; });
        showToast(`❌ D1 Update Failed: ${json.error || 'Server error'}`, false);
      }
    } catch {
      setRows(prev => { const r = [...prev]; r[rowIdx] = previousRows[rowIdx]; return r; });
      showToast('❌ Could not reach Cloudflare D1 edge. Change reverted.', false);
    } finally {
      setSavingCellKey(null);
    }
  };

  return {
    editingCell, setEditingCell,
    startEdit, cancelEdit, saveEdit,
    isEditing:   (ri, f) => editingCell?.rowIdx === ri && editingCell?.field === f,
    isSaving:    (ri, f) => savingCellKey === `${ri}-${f}`,
    isSaved:     (ri, f) => savedCellKey  === `${ri}-${f}`,
    isProtected: (f)     => protectedFields.has(f)
  };
}

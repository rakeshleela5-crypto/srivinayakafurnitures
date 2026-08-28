import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  Edit, 
  Check, 
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { dispatchWebhookAction, formatDateTimeIndian } from '../services/webhookService';

export function LiveDatabaseView() {
  const { 
    orders, 
    catalog, 
    inventory, 
    smartKitBoxes, 
    inquiries, 
    architects, 
    drivers, 
    routeStops, 
    paymentsLog, 
    documentsLog,
    syncWithGoogleSheets,
    isSyncing,
    showToast,
    openModal
  } = useStore();

  const [selectedTable, setSelectedTable] = useState('Orders_SafeLock');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const tableDataMap = {
    'Orders_SafeLock': orders,
    'Furniture_Catalog': catalog,
    'Inventory_Stock': inventory,
    'SmartKit_Components': smartKitBoxes,
    'Inquiries_Log': inquiries,
    'Architect_VIPs': architects,
    'Fleet_Drivers': drivers,
    'Delivery_Route_Stops': routeStops,
    'Payments_Log': paymentsLog,
    'Document_Generation_Log': documentsLog
  };

  const rawRows = tableDataMap[selectedTable] || [];
  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  const filteredRows = rawRows.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartEdit = (row, idx) => {
    setEditingRowIndex(idx);
    setEditFormData({ ...row });
  };

  const handleSaveRow = async () => {
    showToast(`💾 Record updated in ${selectedTable} & dispatched to Google Sheets!`, true);
    dispatchWebhookAction('UPDATE_ROW', {
      table: selectedTable,
      record_id: editFormData[headers[0]] || `REC-${Date.now()}`,
      data: JSON.stringify(editFormData)
    });
    setEditingRowIndex(null);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawRows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedTable}_Export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`📥 Exported ${selectedTable} as JSON!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">📡 LIVE 21-TABLE GOOGLE SHEETS BROWSER</span>
          <button className="btn-cyan" onClick={() => openModal('csv_import')} style={{ fontWeight: '800' }}>
            📥 Import CSV / Excel
          </button>
          <button className="btn-luxury-gold" onClick={() => syncWithGoogleSheets()}>
            <RefreshCw size={14} className={isSyncing ? 'spin-anim' : ''} /> 2-Way Master Refresh
          </button>
          <button className="btn-ghost-edit" onClick={handleExportJson}>
            <Download size={14} /> Export Table JSON
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">CONNECTED TO APPS SCRIPT</span>
        </div>
      </div>

      {/* Table Selector Pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Object.keys(tableDataMap).map(tbl => (
          <button 
            key={tbl}
            className={`btn-ghost-edit ${selectedTable === tbl ? 'badge-gold' : ''}`}
            onClick={() => { setSelectedTable(tbl); setEditingRowIndex(null); }}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            📊 {tbl} ({tableDataMap[tbl].length})
          </button>
        ))}
      </div>

      {/* Table Grid Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Active Table: {selectedTable}</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Showing {filteredRows.length} of {rawRows.length} records</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              placeholder={`🔍 Search in ${selectedTable}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '7px 12px', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Universal Table */}
        <div className="data-table-wrapper" style={{ maxHeight: '540px' }}>
          <table className="luxury-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                {headers.map(h => (
                  <th key={h}>{h.replace(/_/g, ' ')}</th>
                ))}
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const isEditing = editingRowIndex === idx;
                return (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{idx + 1}</td>
                    {headers.map(h => (
                      <td key={h}>
                        {isEditing ? (
                          <input 
                            value={editFormData[h] || ''}
                            onChange={e => setEditFormData({ ...editFormData, [h]: e.target.value })}
                            style={{ background: '#030712', border: '1px solid var(--accent-gold)', borderRadius: '4px', padding: '4px 6px', color: '#FFFFFF', fontSize: '12px', width: '100%' }}
                          />
                        ) : (
                          <span style={{ fontSize: '12px' }}>
                            {typeof row[h] === 'number' ? `₹${row[h].toLocaleString()}` : String(row[h] || '-')}
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <button className="btn-luxury-gold" onClick={handleSaveRow} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          <Check size={12} /> Save
                        </button>
                      ) : (
                        <button className="btn-ghost-edit" onClick={() => handleStartEdit(row, idx)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          <Edit size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

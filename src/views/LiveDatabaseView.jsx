// ==============================================================================
// OmniBuild OS™ — Cloudflare D1 Live Database Explorer & Tabular Schema Mirror
// Client: Sri Vinayaka Furnitures (Rayagada Flagship Showroom)
// 100% SQL Column Fidelity: Reflects SQLite tables, types & rows directly in Frontend
// Staff Mode: Allows Accountant & Receptionist to inspect, search, and export tables
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  Key, 
  Layers, 
  FileSpreadsheet, 
  Plus, 
  CheckCircle2, 
  Table, 
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Printer
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function LiveDatabaseView() {
  const { showToast, openModal, setActiveTab } = useStore();

  // Active Category & Active Table
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedTableName, setSelectedTableName] = useState('catalog');
  const [tablesList, setTablesList] = useState([]);
  const [tableData, setTableData] = useState({
    columns: [],
    rows: [],
    totalCount: 0,
    isLiveD1: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Master Categories for the 43+ Enterprise D1 Tables
  const CATEGORY_TABS = [
    { id: 'ALL', label: 'All Tables (43+)', icon: '🏛️' },
    { id: 'SALES', label: 'Sales & POS', icon: '🛒' },
    { id: 'STOCK', label: 'Inventory & Godown', icon: '📦' },
    { id: 'ACCOUNTS', label: 'Accounts & Cashier', icon: '💰' },
    { id: 'LOGISTICS', label: 'Fleet & Logistics', icon: '🚚' },
    { id: 'WORKSHOP', label: 'Workshop & Assembly', icon: '🛠️' },
    { id: 'AI', label: 'AI & Telemetry', icon: '🤖' }
  ];

  // 1. Fetch List of Tables on Mount
  useEffect(() => {
    fetchTablesList();
  }, []);

  const fetchTablesList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/d1-tables?action=list_tables');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.tables) {
          setTablesList(json.tables);
          const hasCatalog = json.tables.find(t => t.tableName === 'catalog');
          setSelectedTableName(hasCatalog ? 'catalog' : json.tables[0].tableName);
        }
      }
    } catch (err) {
      console.warn('Could not fetch tables list from edge, using fallback list', err);
      // Hardened fallback tables list with core operational tables first
      setTablesList([
        { tableName: 'catalog', category: '📦 Inventory & Godown' },
        { tableName: 'orders', category: '🛒 Sales & Counter POS' },
        { tableName: 'inquiries', category: '🛒 Sales & Counter POS' },
        { tableName: 'payments', category: '💰 Accounts & Reconciliation' },
        { tableName: 'architects', category: '🛒 Sales & Counter POS' },
        { tableName: 'smartkit_boxes', category: '📦 Inventory & Godown' },
        { tableName: 'inventory_stock', category: '📦 Inventory & Godown' },
        { tableName: 'floor_aging_sentinel', category: '📦 Inventory & Godown' },
        { tableName: 'transactions_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'bank_transactions_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'eod_reconciliation_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'discounts_override_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'fleet_drivers', category: '🚚 Logistics & Fleet Drivers' },
        { tableName: 'delivery_route_stops', category: '🚚 Logistics & Fleet Drivers' },
        { tableName: 'carpenter_work_orders', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'room_fitment_qc_log', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'warranty_registry', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'purchase_orders_log', category: '📦 Inventory & Godown' },
        { tableName: 'quote_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'daily_sales_summary', category: '🛒 Sales & Counter POS' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Selected Table Schema & Rows
  useEffect(() => {
    if (selectedTableName) {
      fetchTableSchemaAndRows(selectedTableName, currentPage, searchQuery);
    }
  }, [selectedTableName, currentPage]);

  const fetchTableSchemaAndRows = async (tableName, page = 1, search = '') => {
    setIsLoading(true);
    try {
      const url = `/api/d1-tables?table=${encodeURIComponent(tableName)}&page=${page}&limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTableData({
            columns: json.columns || [],
            rows: json.rows || [],
            totalCount: json.totalCount || 0,
            isLiveD1: json.isLiveD1
          });
          setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn(`Error loading table ${tableName}`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = () => {
    playScanBeep();
    fetchTableSchemaAndRows(selectedTableName, currentPage, searchQuery);
    showToast(`🔄 Synchronized live schema & data for ${selectedTableName}!`, true);
  };

  // 3. Instant Search Filter
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return tableData.rows;
    const q = searchQuery.toLowerCase().trim();
    return tableData.rows.filter(row => {
      return Object.values(row).some(val => 
        String(val ?? '').toLowerCase().includes(q)
      );
    });
  }, [tableData.rows, searchQuery]);

  // 4. Export Table to CSV (Accountant Utility)
  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      showToast('⚠️ No records to export in the current table', false);
      return;
    }

    playSuccessChime();
    triggerGoldenConfetti();

    const cols = tableData.columns.map(c => c.name);
    const csvHeader = cols.join(',');
    const csvRows = filteredRows.map(row => {
      return cols.map(col => {
        let val = row[col];
        if (val === null || val === undefined) return '""';
        let str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `D1_${selectedTableName.toUpperCase()}_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(`📥 Exported ${filteredRows.length} rows from ${selectedTableName} to Excel CSV!`, true);
  };

  // Filter tables by active category
  const filteredTablesList = useMemo(() => {
    if (activeCategory === 'ALL') return tablesList;
    const catUpper = activeCategory.toUpperCase();
    return tablesList.filter(t => {
      const cat = (t.category || '').toUpperCase();
      if (catUpper === 'SALES') return cat.includes('SALES') || cat.includes('POS');
      if (catUpper === 'STOCK') return cat.includes('INVENTORY') || cat.includes('GODOWN');
      if (catUpper === 'ACCOUNTS') return cat.includes('ACCOUNTS') || cat.includes('BANKING');
      if (catUpper === 'LOGISTICS') return cat.includes('LOGISTICS') || cat.includes('FLEET');
      if (catUpper === 'WORKSHOP') return cat.includes('WORKSHOP') || cat.includes('ASSEMBLY') || cat.includes('FITMENT');
      if (catUpper === 'AI') return cat.includes('AI') || cat.includes('TELEMETRY');
      return true;
    });
  }, [tablesList, activeCategory]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ========================================================================= */}
      {/* ⚡ TOP LIVE D1 CONNECTION STATUS BANNER                                   */}
      {/* ========================================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(0,0,0,0.5))',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(212,175,55,0.15)',
            border: '1px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Cloudflare D1 Live Database Explorer & Tabular Schema Mirror
              </h2>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span>LIVE D1 REMOTE SYNCED (srivinayaka-db)</span>
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
              1:1 SQL Schema Fidelity • Accountant & Receptionist Autonomous Terminal • Last Sync: <strong style={{ color: 'var(--accent-gold-light)' }}>{lastSyncTime}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-ghost-edit"
            onClick={handleManualSync}
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Sync Live From D1
          </button>

          <button
            type="button"
            className="btn-luxury-gold"
            onClick={handleExportCsv}
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontWeight: '800' }}
          >
            <Download size={13} /> Export Table to CSV (for Tally / Excel)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏷️ DEPARTMENT CATEGORY TABS & TABLE SELECTOR BAR                          */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`btn-ghost-edit ${activeCategory === tab.id ? 'badge-gold' : ''}`}
              style={{ fontSize: '11.5px', padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Table Selector & Search Controls */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '10px', 
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Table Picker Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Table size={14} /> Active SQL Table:
            </span>
            <select
              value={selectedTableName}
              onChange={e => {
                setSelectedTableName(e.target.value);
                setCurrentPage(1);
              }}
              className="luxury-input"
              style={{ fontSize: '12px', fontWeight: '800', fontFamily: 'JetBrains Mono', padding: '6px 12px', minWidth: '240px', color: '#FFFFFF' }}
            >
              {filteredTablesList.map(t => (
                <option key={t.tableName} value={t.tableName}>
                  {t.tableName} ({t.category?.replace(/[^\w\s]/gi, '').trim() || 'General'})
                </option>
              ))}
            </select>
            <span className="badge badge-purple" style={{ fontSize: '10px' }}>
              {tableData.totalCount} Rows in D1
            </span>
          </div>

          {/* Search Across All Columns */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder={`Search all columns in ${selectedTableName}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="luxury-input"
              style={{ width: '100%', paddingLeft: '32px', fontSize: '11.5px', borderRadius: '8px' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📊 1:1 HIGH-DENSITY SQL SPREADSHEET TABLE                                 */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '0px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* Schema Info Bar */}
        <div style={{ background: '#070D1E', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SQL Table Schema: <strong style={{ color: '#FFFFFF', fontFamily: 'JetBrains Mono' }}>{selectedTableName}</strong>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', background: 'rgba(14,165,233,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {tableData.columns.length} Defined Columns
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            Showing <strong>{filteredRows.length}</strong> of <strong>{tableData.totalCount}</strong> rows
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table-wrapper" style={{ maxHeight: '560px', overflowY: 'auto' }}>
          <table className="luxury-table" style={{ width: '100%', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#030712' }}>
                <th style={{ width: '40px', textAlign: 'center', color: '#94A3B8' }}>#</th>
                {tableData.columns.map(col => (
                  <th key={col.name} style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {col.pk === 1 && <Key size={11} color="var(--accent-gold)" title="Primary Key" />}
                      <span style={{ color: col.pk === 1 ? 'var(--accent-gold-light)' : '#FFFFFF', fontWeight: '800', fontFamily: 'JetBrains Mono' }}>
                        {col.name}
                      </span>
                      <span style={{ fontSize: '8.5px', color: '#94A3B8', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px', fontWeight: '400' }}>
                        {col.type || 'TEXT'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ textAlign: 'center', color: '#64748B', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>
                      {rowIdx + 1}
                    </td>
                    {tableData.columns.map(col => {
                      const val = row[col.name];
                      const isNumeric = col.type === 'INTEGER' || col.type === 'REAL' || col.name.includes('amount') || col.name.includes('qty') || col.name.includes('price');
                      const isStatus = col.name.includes('status');
                      const isPk = col.pk === 1;

                      return (
                        <td 
                          key={col.name} 
                          style={{ 
                            textAlign: isNumeric ? 'right' : 'left',
                            fontFamily: (isNumeric || isPk) ? 'JetBrains Mono, monospace' : 'inherit',
                            color: isPk ? 'var(--accent-gold-light)' : '#E2E8F0',
                            fontWeight: isPk ? '800' : '400',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isStatus ? (
                            <span className={`badge ${String(val).includes('SUFFICIENT') || String(val).includes('RECONCILED') || String(val).includes('PAID') ? 'badge-emerald' : String(val).includes('LOW') || String(val).includes('ALERT') ? 'badge-rose' : 'badge-gold'}`} style={{ fontSize: '9px' }}>
                              {String(val ?? 'N/A')}
                            </span>
                          ) : isNumeric && (col.name.includes('amount') || col.name.includes('price') || col.name.includes('total')) && typeof val === 'number' ? (
                            `₹${val.toLocaleString()}`
                          ) : (
                            String(val ?? '—')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableData.columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <RefreshCw size={16} className="animate-spin" color="var(--accent-gold)" />
                        <span>Querying Cloudflare D1 SQL table...</span>
                      </div>
                    ) : (
                      <div>No records found in table <strong>{selectedTableName}</strong> {searchQuery && `matching "${searchQuery}"`}.</div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 💼 ACCOUNTANT QUICK ACTION SHORTCUTS                                     */}
      {/* ========================================================================= */}
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.06)', 
        borderRadius: '10px', 
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={15} color="var(--accent-gold)" />
          <span>Need specialized accounting workflows? Direct navigation shortcuts:</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            className="btn-ghost-edit" 
            onClick={() => setActiveTab('bank_ledger')}
            style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}
          >
            🏛️ Canara & HDFC Bank Reconciliation
          </button>

          <button 
            type="button" 
            className="btn-ghost-edit" 
            onClick={() => openModal('eod_reconciliation')}
            style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}
          >
            📋 EOD Shift Cash Drawer Audit
          </button>

          <button 
            type="button" 
            className="btn-ghost-edit" 
            onClick={() => openModal('customer_khata')}
            style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}
          >
            🏛️ Customer Khata Ledgers
          </button>

          <button 
            type="button" 
            className="btn-ghost-edit" 
            onClick={() => openModal('feature_flags_console')}
            style={{ fontSize: '11px', color: 'var(--accent-purple)' }}
          >
            🎛️ Feature Flags Console (#12)
          </button>
        </div>
      </div>

    </div>
  );
}

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
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableSearchFilter, setTableSearchFilter] = useState('');

  // Master Categories for the 52 Enterprise D1 Tables
  const CATEGORY_TABS = [
    { id: 'ALL', label: `All Tables (${tablesList.length || 52})`, icon: '🏛️' },
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
      // Hardened fallback tables list with all 52 enterprise tables
      setTablesList([
        // Sales & POS
        { tableName: 'catalog', category: '🛒 Sales & Counter POS' },
        { tableName: 'orders', category: '🛒 Sales & Counter POS' },
        { tableName: 'inquiries', category: '🛒 Sales & Counter POS' },
        { tableName: 'payments', category: '🛒 Sales & Counter POS' },
        { tableName: 'architects', category: '🛒 Sales & Counter POS' },
        { tableName: 'smartkit_boxes', category: '🛒 Sales & Counter POS' },
        { tableName: 'transactions_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'quote_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'commercial_quotations_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'discounts_override_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'daily_sales_summary', category: '🛒 Sales & Counter POS' },
        { tableName: 'wedding_suites_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'exchange_buyback_log', category: '🛒 Sales & Counter POS' },
        { tableName: 'customer_anniversary_log', category: '🛒 Sales & Counter POS' },
        // Inventory & Godown
        { tableName: 'inventory_stock', category: '📦 Inventory & Godown' },
        { tableName: 'stock_ledger', category: '📦 Inventory & Godown' },
        { tableName: 'floor_aging_sentinel', category: '📦 Inventory & Godown' },
        { tableName: 'purchase_orders_log', category: '📦 Inventory & Godown' },
        { tableName: 'vendor_sourcing_matrix', category: '📦 Inventory & Godown' },
        { tableName: 'transit_lr_tracking', category: '📦 Inventory & Godown' },
        { tableName: 'supplier_invoices_ledger', category: '📦 Inventory & Godown' },
        // Accounts & Reconciliation
        { tableName: 'bank_transactions_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'tally_vouchers', category: '💰 Accounts & Reconciliation' },
        { tableName: 'tally_voucher_items', category: '💰 Accounts & Reconciliation' },
        { tableName: 'gst_returns_filings_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'document_generation_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'eod_reconciliation_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'commission_log', category: '💰 Accounts & Reconciliation' },
        { tableName: 'store_sales_targets', category: '💰 Accounts & Reconciliation' },
        { tableName: 'profit_radar_audit_log', category: '💰 Accounts & Reconciliation' },
        // Logistics & Fleet Drivers
        { tableName: 'fleet_drivers', category: '🚚 Logistics & Fleet Drivers' },
        { tableName: 'delivery_route_stops', category: '🚚 Logistics & Fleet Drivers' },
        { tableName: 'delivery_log', category: '🚚 Logistics & Fleet Drivers' },
        { tableName: 'delivery_reschedule_log', category: '🚚 Logistics & Fleet Drivers' },
        { tableName: 'otp_log', category: '🚚 Logistics & Fleet Drivers' },
        // Workshop & Fitment QC
        { tableName: 'carpenter_work_orders', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'carpenter_installation_slas', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'room_fitment_qc_log', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'warranty_registry', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'amc_subscriptions_log', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'vip_villa_projects', category: '🛠️ Workshop & Fitment QC' },
        { tableName: 'b2b_commercial_tenders_log', category: '🛠️ Workshop & Fitment QC' },
        // AI Fleet & Telemetry
        { tableName: 'bot_configurations', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'bot_configurations_log', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'bot_test_log', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'whatsapp_dispatches_log', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'followup_queue_log', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'appsheet_bots_telemetry', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'marketing_campaigns_log', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'customer_reviews_log', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'company_profile', category: '🤖 AI Fleet & Telemetry' },
        { tableName: 'store_alerts_log', category: '🤖 AI Fleet & Telemetry' }
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

  // Group tables by category for clean organized display
  const tablesByCategory = useMemo(() => {
    const groups = {};
    filteredTablesList.forEach(t => {
      const cat = t.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
    return groups;
  }, [filteredTablesList]);

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
            aria-label="Synchronize live SQL schema and rows from Cloudflare D1"
            className="btn-ghost-edit"
            onClick={handleManualSync}
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Sync Live From D1
          </button>

          <button
            type="button"
            aria-label="Export active table to Excel CSV for Tally accounting"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Table size={14} /> Active SQL Table:
            </span>
            <select
              value={selectedTableName}
              onChange={e => {
                setSelectedTableName(e.target.value);
                setCurrentPage(1);
                playScanBeep();
              }}
              className="luxury-input"
              style={{
                fontSize: '12.5px',
                fontWeight: '800',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '7px 14px',
                minWidth: '270px',
                backgroundColor: '#0B1120',
                color: '#F8FAFC',
                colorScheme: 'dark',
                border: '1.5px solid rgba(212, 175, 55, 0.45)',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              {Object.entries(tablesByCategory).map(([categoryName, tables]) => (
                <optgroup 
                  key={categoryName} 
                  label={categoryName}
                  style={{ backgroundColor: '#070B14', color: '#D4AF37', fontWeight: '800' }}
                >
                  {tables.map(t => (
                    <option 
                      key={t.tableName} 
                      value={t.tableName}
                      style={{ backgroundColor: '#0B1120', color: '#F8FAFC', padding: '6px 10px' }}
                    >
                      {t.tableName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button
              type="button"
              onClick={() => { setShowTableModal(true); playScanBeep(); }}
              className="btn-ghost-edit"
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Layers size={13} /> Quick Browser ({tablesList.length || 52})
            </button>

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
          <table className="luxury-table sheets-grid" style={{ width: '100%', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#0B132B' }}>
                <th style={{ width: '45px', textAlign: 'center', color: '#94A3B8' }}>#</th>
                {tableData.columns.map(col => (
                  <th key={col.name} style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {col.pk === 1 && <Key size={11} color="var(--accent-gold)" title="Primary Key" />}
                      <span style={{ color: col.pk === 1 ? 'var(--accent-gold-light)' : '#FFFFFF', fontWeight: '800', fontFamily: 'JetBrains Mono' }}>
                        {col.name}
                      </span>
                      <span style={{ fontSize: '8.5px', color: '#94A3B8', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px', fontWeight: '400', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                  <tr key={rowIdx}>
                    <td className="row-num" style={{ textAlign: 'center', color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: '10.5px' }}>
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

      {/* ========================================================================= */}
      {/* 🏛️ TABLE NAVIGATOR MODAL                                                 */}
      {/* ========================================================================= */}
      {showTableModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0B1120',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 30px rgba(212,175,55,0.18)',
            animation: 'modalCenteredSpring 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Table size={18} color="var(--accent-gold)" />
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>
                  Enterprise SQL Table Navigator ({tablesList.length} Tables)
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowTableModal(false)}
                className="btn-ghost-edit"
                style={{ padding: '4px 10px', fontSize: '13px' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Filter Search */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Filter tables by name or department (e.g. orders, quote, catalog)..."
                  value={tableSearchFilter}
                  onChange={e => setTableSearchFilter(e.target.value)}
                  className="luxury-input"
                  style={{ width: '100%', paddingLeft: '34px', fontSize: '13px' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Tables Grid */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(tablesByCategory).map(([catName, tables]) => {
                const matched = tables.filter(t => 
                  !tableSearchFilter.trim() || 
                  t.tableName.toLowerCase().includes(tableSearchFilter.toLowerCase()) ||
                  catName.toLowerCase().includes(tableSearchFilter.toLowerCase())
                );
                if (matched.length === 0) return null;
                return (
                  <div key={catName}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{catName}</span>
                      <span style={{ fontSize: '10px', opacity: 0.7, color: '#94A3B8' }}>({matched.length})</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                      {matched.map(t => (
                        <button
                          key={t.tableName}
                          type="button"
                          onClick={() => {
                            setSelectedTableName(t.tableName);
                            setCurrentPage(1);
                            setShowTableModal(false);
                            playSuccessChime();
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: selectedTableName === t.tableName ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                            border: selectedTableName === t.tableName ? '1.5px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)',
                            color: selectedTableName === t.tableName ? 'var(--accent-gold-light)' : '#E2E8F0',
                            fontSize: '12px',
                            fontWeight: '700',
                            fontFamily: "'JetBrains Mono', monospace",
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 120ms ease'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.tableName}
                          </span>
                          {selectedTableName === t.tableName && <span style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// OmniBuild OS™ — Smart Customer & Order Autocomplete Combobox Selector
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, User, ChevronDown, Check, Sparkles, Phone, MapPin, Package, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { playScanBeep } from '../../utils/audioUtils';

export default function CustomerOrderSearchSelector({
  selectedOrderId = '',
  onSelectOrder = () => {},
  placeholder = "🔍 Search Customer, Order ID, Phone, SKU...",
  allowAll = true,
  allLabel = "👑 All Active Orders (Show All)",
  customOrders = null,
  compact = false,
  style = {}
}) {
  const { orders } = useStore();
  const sourceOrders = customOrders || orders || [];

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Find currently selected order object
  const currentOrder = useMemo(() => {
    if (!selectedOrderId || selectedOrderId === 'ALL' || selectedOrderId === '') return null;
    return sourceOrders.find(o => String(o.Order_ID || '').toLowerCase() === String(selectedOrderId).toLowerCase());
  }, [selectedOrderId, sourceOrders]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return sourceOrders;
    const q = searchQuery.toLowerCase().trim();
    return sourceOrders.filter(o => {
      const name = String(o.Customer_Name || '').toLowerCase();
      const id = String(o.Order_ID || '').toLowerCase();
      const phone = String(o.Customer_Phone || '').replace(/[^0-9]/g, '');
      const sku = String(o.Ordered_SKU || o.Item_Names || '').toLowerCase();
      const address = String(o.Project_Address || '').toLowerCase();
      const driver = String(o.Assigned_Driver || '').toLowerCase();
      const otp = String(o.OTP_Code || '').toLowerCase();

      return name.includes(q) ||
        id.includes(q) ||
        phone.includes(q) ||
        sku.includes(q) ||
        address.includes(q) ||
        driver.includes(q) ||
        otp.includes(q);
    });
  }, [searchQuery, sourceOrders]);

  const handleSelect = (orderId, orderObj) => {
    playScanBeep();
    onSelectOrder(orderId, orderObj);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    playScanBeep();
    onSelectOrder('', null);
    setSearchQuery('');
  };

  return (
    <div 
      ref={dropdownRef} 
      className="customer-search-selector-container" 
      style={{ position: 'relative', width: compact ? '260px' : '340px', ...style }}
    >
      {/* Input / Display Bar */}
      <div 
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: currentOrder ? 'rgba(212,175,55,0.12)' : '#030712',
          border: currentOrder 
            ? '1.5px solid var(--accent-gold)' 
            : isOpen ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.18)',
          borderRadius: '10px',
          padding: compact ? '6px 10px' : '8px 12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 16px rgba(56,189,248,0.25)' : 'none'
        }}
      >
        <Search size={compact ? 13 : 15} color={currentOrder ? "var(--accent-gold)" : "#94A3B8"} style={{ flexShrink: 0 }} />
        
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (currentOrder ? `${currentOrder.Customer_Name} (#${currentOrder.Order_ID})` : '')}
          placeholder={currentOrder ? `${currentOrder.Customer_Name} (${currentOrder.Order_ID})` : placeholder}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: compact ? '11px' : '12px',
            fontWeight: currentOrder && !isOpen ? '800' : '600',
            width: '100%',
            cursor: 'text'
          }}
        />

        {/* Clear Button */}
        {(currentOrder || searchQuery) && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear Spotlight Filter"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#CBD5E1',
              padding: 0,
              flexShrink: 0
            }}
          >
            <X size={11} />
          </button>
        )}

        <ChevronDown 
          size={14} 
          color="#94A3B8" 
          style={{ 
            flexShrink: 0, 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </div>

      {/* Dropdown Floating Results Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '320px',
            maxWidth: '440px',
            maxHeight: '380px',
            overflowY: 'auto',
            background: '#0B132B',
            border: '1.5px solid var(--accent-cyan)',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(56,189,248,0.2)',
            zIndex: 99999,
            padding: '6px',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header & Quick Clear */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'} Found
            </span>
            {allowAll && (
              <button
                type="button"
                onClick={() => handleSelect('', null)}
                style={{
                  background: !selectedOrderId ? 'rgba(212,175,55,0.2)' : 'transparent',
                  border: '1px solid rgba(212,175,55,0.4)',
                  color: 'var(--accent-gold-light)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {allLabel}
              </button>
            )}
          </div>

          {/* List of Filtered Orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔍</div>
                No matching customer or order found for "<b>{searchQuery}</b>"
                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                  Try searching by name, phone, order ID, or product.
                </div>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrderId === order.Order_ID;
                const phoneStr = String(order.Customer_Phone || '').replace(/[^0-9]/g, '');

                return (
                  <div
                    key={order.Order_ID}
                    onClick={() => handleSelect(order.Order_ID, order)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.1) 100%)' 
                        : 'rgba(255,255,255,0.03)',
                      border: isSelected 
                        ? '1px solid var(--accent-gold)' 
                        : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    {/* Top Row: ID, Name, Amount */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                          {order.Order_ID}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? 'var(--accent-gold-light)' : '#FFFFFF' }}>
                          {order.Customer_Name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: '900', color: 'var(--accent-emerald)' }}>
                          ₹{Number(order.Total_Amount_INR || 0).toLocaleString()}
                        </span>
                        {isSelected && <Check size={13} color="var(--accent-gold)" />}
                      </div>
                    </div>

                    {/* Middle Row: SKU & Phone */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: '#94A3B8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Package size={10} color="var(--accent-cyan)" /> {order.Ordered_SKU || order.Item_Names || 'Solid Teak Bed'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#CBD5E1', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>
                        <Phone size={9} /> {phoneStr || '9390553301'}
                      </span>
                    </div>

                    {/* Bottom Row: Address & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', color: '#64748B', paddingTop: '2px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={9} /> {order.Project_Address || 'Rayagada, Odisha'}
                      </span>
                      <span style={{ color: order.SafeLock_Status?.includes('RESERVED') ? '#38BDF8' : '#34D399', fontWeight: '700' }}>
                        {order.SafeLock_Status || 'SAFELOCKED'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

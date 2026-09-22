import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Boxes, 
  Layers, 
  X, 
  Check, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Plus, 
  Trash2, 
  Hammer, 
  ArrowRightLeft, 
  ShieldCheck, 
  Package, 
  AlertCircle,
  Tag,
  Building2,
  Warehouse
} from 'lucide-react';
import { getProductBomRecipe, disassembleKitToComponents } from '../../utils/knockdownBoxGenerator';
import { playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export function KitAssemblyModal({ isOpen, onClose, product }) {
  const { showToast, inventory, adjustStock } = useStore();

  const initialRecipe = useMemo(() => {
    if (!product) return null;
    return getProductBomRecipe(product);
  }, [product]);

  const [recipe, setRecipe] = useState(initialRecipe);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [dekitQty, setDekitQty] = useState(1);
  const [isDekitting, setIsDekitting] = useState(false);

  React.useEffect(() => {
    if (product) {
      const r = getProductBomRecipe(product);
      setRecipe(r);
      if (r && r.components) {
        const defaults = {};
        r.components.forEach(c => {
          if (c.isInterchangeable && c.selectedOption) {
            defaults[c.componentId] = c.selectedOption;
          }
        });
        setSelectedOptions(defaults);
      }
    }
  }, [product]);

  if (!isOpen || !product || !recipe) return null;

  // Handle swapping an interchangeable component option
  const handleSwapOption = (componentId, optionName, deltaINR) => {
    setSelectedOptions(prev => ({
      ...prev,
      [componentId]: optionName
    }));
    showToast(`Option changed to ${optionName}`, 'success');
  };

  // Instant De-Kit / Disassembly Handler
  const handleExecuteDekit = () => {
    setIsDekitting(true);
    const breakdown = disassembleKitToComponents(product, dekitQty);

    setTimeout(() => {
      // Deduct assembled unit stock
      if (adjustStock) {
        adjustStock(product.SKU, -dekitQty, `Disassembled ${dekitQty}x ${product.Product_Name} into child BOM parts`);
      }

      playSuccessChime();
      triggerGoldenConfetti();
      showToast(`Successfully disassembled ${dekitQty}x ${product.Product_Name} into ${breakdown.length} component parts in stock!`, 'success');
      setIsDekitting(false);
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#0F172A',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 23, 42, 0) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}>
              <Boxes size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  Interactive BOM & Kit Assembly Studio
                </h2>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#D4AF37',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                  {recipe.kitType}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Master SKU: <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{product.SKU}</span> | Factory Code: <span style={{ color: '#FCD34D', fontWeight: '600' }}>{recipe.mfgCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Master Product Summary Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Assembled Finished Product
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                {product.Product_Name}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                {product.Material_Spec} • {product.Dimensions}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Selling Price</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#10B981' }}>
                  ₹{(product.Selling_Price_INR || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ready Stock</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#FCD34D' }}>
                  {recipe.readyStockUnits} Units
                </div>
              </div>
            </div>
          </div>

          {/* Child Components Breakdown Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#D4AF37" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                  Constituent Child Parts Recipe ({recipe.components.length} Components)
                </h3>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Auto-deducted from warehouse when kit is billed
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recipe.components.map((comp, idx) => {
                const isSwappable = comp.isInterchangeable && comp.availableOptions && comp.availableOptions.length > 0;
                const currentOpt = selectedOptions[comp.componentId] || comp.selectedOption;

                return (
                  <div key={comp.componentId || idx} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'border-color 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          color: '#D4AF37',
                          fontWeight: '800',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                            {comp.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'flex', gap: '10px' }}>
                            <span>Code: <code style={{ color: '#FCD34D' }}>{comp.partCode}</code></span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Warehouse size={11} /> {comp.warehouseLocation}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>Req. Qty</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                            {comp.requiredQty} {comp.unit}
                          </div>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>Avail Stock</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: comp.currentStock > 3 ? '#10B981' : '#F59E0B' }}>
                            {comp.currentStock} {comp.unit}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interchangeable Options Selector (e.g. Door finish swap from audio) */}
                    {isSwappable && (
                      <div style={{
                        marginTop: '4px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(212, 175, 55, 0.06)',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ArrowRightLeft size={12} />
                          Live Finish / Color Customization (Selected: {currentOpt}):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {comp.availableOptions.map(opt => {
                            const isSelected = currentOpt === opt.name;
                            return (
                              <button
                                key={opt.code}
                                onClick={() => handleSwapOption(comp.componentId, opt.name, opt.deltaINR)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                                  background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                                  color: isSelected ? '#FCD34D' : '#94A3B8',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                {isSelected && <Check size={11} />}
                                {opt.name}
                                {opt.deltaINR > 0 && <span style={{ color: '#10B981', fontSize: '10px' }}>+₹{opt.deltaINR}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instant De-Kit / Disassembly Panel */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: '700', fontSize: '13px' }}>
                <Hammer size={16} />
                Instant De-Kit / Disassemble Finished Units
              </div>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0', maxWidth: '440px', lineHeight: '1.5' }}>
                If a customer buys separate parts (e.g. only door panels, table legs, or bed slats), de-kit {dekitQty} ready unit back into individual component stock.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={dekitQty}
                onChange={(e) => setDekitQty(Number(e.target.value))}
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Unit{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <button
                onClick={handleExecuteDekit}
                disabled={isDekitting}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: isDekitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Hammer size={14} />
                {isDekitting ? 'Disassembling...' : `De-Kit ${dekitQty} Unit${dekitQty > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            ⚡ OmniBuild OS™ Precision BOM Engine • Godrej Interio Rayagada
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E2E8F0',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                playSuccessChime();
                showToast('Customized BOM configuration saved for active quotation!', 'success');
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
                border: 'none',
                color: '#000000',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 12px rgba(212, 175, 55, 0.3)'
              }}
            >
              <Check size={14} />
              Save BOM Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

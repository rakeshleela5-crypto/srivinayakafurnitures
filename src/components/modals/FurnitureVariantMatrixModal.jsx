// ==============================================================================
// OmniBuild OS™ — Multidimensional Furniture Variant Matrix Modal (Medusa Standard)
// Configures Wood species, Polish finishes, Dimensions, and Upholstery grades
// Calculates dynamic price adders, lead times, and durability specs in real-time
// ==============================================================================

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Sliders, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShoppingCart, 
  Share2, 
  ShieldCheck, 
  Ruler, 
  Palette, 
  TreePine,
  DollarSign
} from 'lucide-react';
import { 
  FURNITURE_VARIANT_SPECS, 
  calculateCustomVariantPrice 
} from '../../services/enterpriseErpService';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export function FurnitureVariantMatrixModal({ isOpen, onClose, productData = {} }) {
  const { showToast } = useStore();

  const basePrice = productData.basePrice || productData.Selling_Price_INR || 54000;
  const productName = productData.name || productData.Product_Name || 'Royal Master Bed Suite';
  const sku = productData.sku || productData.SKU || 'BED-MOD-001';

  // Selection state
  const [selectedWoodId, setSelectedWoodId] = useState('teak_cpt');
  const [selectedFinishId, setSelectedFinishId] = useState('natural_matte');
  const [selectedSizeId, setSelectedSizeId] = useState('queen');
  const [selectedUpholsteryId, setSelectedUpholsteryId] = useState('grade_a_velvet');

  const customResult = calculateCustomVariantPrice({
    basePrice,
    selectedWoodId,
    selectedFinishId,
    selectedSizeId,
    selectedUpholsteryId
  });

  if (!isOpen) return null;

  const handleApplyToCart = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`✅ Added ${customResult.breakdown.sizeSpec} (${customResult.breakdown.woodSpec}) to Cart at ₹${customResult.totalCustomPrice.toLocaleString()}!`, true);
    if (productData.onApply) {
      productData.onApply({
        sku: `${sku}-CUST`,
        name: `${productName} (${customResult.breakdown.sizeSpec})`,
        price: customResult.totalCustomPrice,
        specs: `${customResult.breakdown.woodSpec} • ${customResult.breakdown.finishSpec} • ${customResult.breakdown.upholsterySpec}`,
        leadDays: customResult.totalLeadDays
      });
    }
    onClose();
  };

  const handleShareWhatsAppSpecs = () => {
    playScanBeep();
    const text = `*👑 GODREJ INTERIO / SRI VINAYAKA FURNITURES — BESPOKE SPEC SHEET*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Product:* ${productName} (Ref: ${sku})\n\n` +
      `🌲 *Wood Species:* ${customResult.breakdown.woodSpec} (${customResult.breakdown.woodDelta >= 0 ? '+' : ''}₹${customResult.breakdown.woodDelta.toLocaleString()})\n` +
      `📏 *Size & Dimensions:* ${customResult.breakdown.sizeSpec}\n` +
      `🎨 *Polish Finish:* ${customResult.breakdown.finishSpec} (${customResult.breakdown.finishDelta >= 0 ? '+' : ''}₹${customResult.breakdown.finishDelta.toLocaleString()})\n` +
      `🧵 *Upholstery / Cushioning:* ${customResult.breakdown.upholsterySpec} (${customResult.breakdown.upholsteryDelta >= 0 ? '+' : ''}₹${customResult.breakdown.upholsteryDelta.toLocaleString()})\n\n` +
      `💰 *Total Configured Price:* *₹${customResult.totalCustomPrice.toLocaleString()}* (GST 18% Included)\n` +
      `⏳ *Crafting Lead Time:* ${customResult.totalLeadDays} Working Days\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Visit Rayagada Flagship Showroom to inspect wood grain & physical fabric swatches.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel glass-card" style={{ maxWidth: '860px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.25)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📐</span>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Multidimensional Furniture Variant Studio
              </h2>
              <span className="badge badge-purple" style={{ fontSize: '10px' }}>Medusa Commerce Benchmark</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Configuring: <strong style={{ color: 'var(--accent-gold-light)' }}>{productName}</strong> ({sku})
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Live Dynamic Price & Lead Time Bar */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,0,0,0.6))', 
          border: '1px solid rgba(212,175,55,0.35)', 
          borderRadius: '12px', 
          padding: '14px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '18px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)', textTransform: 'uppercase', fontWeight: '800' }}>
              Configured Custom Showroom Price
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ₹{customResult.totalCustomPrice.toLocaleString()}
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '400' }}>
                (Base: ₹{basePrice.toLocaleString()})
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <Calendar size={14} /> Lead Time: {customResult.totalLeadDays} Days
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
              Odisha On-Site Carpenter Assembly Included ✓
            </div>
          </div>
        </div>

        {/* 4-Dimension Configuration Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          {/* Dimension 1: Wood Species */}
          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold-light)', fontWeight: '800', fontSize: '13px', marginBottom: '10px' }}>
              <TreePine size={16} /> 1. Wood Species / Core Material
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FURNITURE_VARIANT_SPECS.woodSpecies.map(w => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWoodId(w.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: selectedWoodId === w.id ? '1px solid var(--accent-gold-light)' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedWoodId === w.id ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: selectedWoodId === w.id ? '#FFFFFF' : '#CBD5E1' }}>
                      {w.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>{w.durability} • {w.leadDays} Days Workshop Time</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: w.priceAdder > 0 ? 'var(--accent-gold-light)' : w.priceAdder < 0 ? 'var(--accent-emerald)' : '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                    {w.priceAdder > 0 ? `+₹${w.priceAdder.toLocaleString()}` : w.priceAdder < 0 ? `-₹${Math.abs(w.priceAdder).toLocaleString()}` : 'Included'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 2: Dimensions & Sizing */}
          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '13px', marginBottom: '10px' }}>
              <Ruler size={16} /> 2. Dimensions & Ergonomic Sizing
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FURNITURE_VARIANT_SPECS.dimensionSizes.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSizeId(s.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: selectedSizeId === s.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedSizeId === s.id ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '800', color: selectedSizeId === s.id ? '#FFFFFF' : '#CBD5E1' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: s.priceMultiplier > 1 ? 'var(--accent-cyan)' : s.priceMultiplier < 1 ? 'var(--accent-emerald)' : '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                    {s.priceMultiplier > 1 ? `+${Math.round((s.priceMultiplier - 1) * 100)}% scale` : s.priceMultiplier < 1 ? `-${Math.round((1 - s.priceMultiplier) * 100)}% scale` : 'Standard'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 3: Polish Finishes */}
          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F472B6', fontWeight: '800', fontSize: '13px', marginBottom: '10px' }}>
              <Palette size={16} /> 3. Polish & Surface Lacquer
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FURNITURE_VARIANT_SPECS.polishFinishes.map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFinishId(f.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: selectedFinishId === f.id ? '1px solid #F472B6' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedFinishId === f.id ? 'rgba(244,114,182,0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: f.previewColor, border: '1px solid #FFFFFF' }} />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: selectedFinishId === f.id ? '#FFFFFF' : '#CBD5E1' }}>
                      {f.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: f.priceAdder > 0 ? '#F472B6' : '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                    {f.priceAdder > 0 ? `+₹${f.priceAdder.toLocaleString()}` : 'Base Finish'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 4: Upholstery & Cushioning */}
          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C084FC', fontWeight: '800', fontSize: '13px', marginBottom: '10px' }}>
              <Layers size={16} /> 4. Upholstery & Cushion Grade
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FURNITURE_VARIANT_SPECS.upholsteryGrades.map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUpholsteryId(u.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: selectedUpholsteryId === u.id ? '1px solid #C084FC' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedUpholsteryId === u.id ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: selectedUpholsteryId === u.id ? '#FFFFFF' : '#CBD5E1' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>{u.texture}</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: u.priceAdder > 0 ? '#C084FC' : '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                    {u.priceAdder > 0 ? `+₹${u.priceAdder.toLocaleString()}` : 'Included'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
          <button 
            type="button" 
            className="btn-ghost-edit" 
            onClick={handleShareWhatsAppSpecs}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Share2 size={14} /> Send Custom Spec Sheet on WhatsApp
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-ghost-edit" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-luxury-gold" 
              onClick={handleApplyToCart}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: '900' }}
            >
              <ShoppingCart size={15} />
              <span>Apply Customization (₹{customResult.totalCustomPrice.toLocaleString()})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

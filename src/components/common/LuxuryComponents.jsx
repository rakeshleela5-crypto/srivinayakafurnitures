import React, { useRef } from 'react';

/**
 * Aceternity UI — Spotlight Card
 * Tracks mouse position and dynamically casts an ambient specular glow 
 * over the card surface following the user's cursor.
 */
export function SpotlightCard({ 
  children, 
  className = '', 
  style = {}, 
  spotlightColor = 'rgba(212, 175, 55, 0.14)',
  ...props 
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--mouse-x', '-1000px');
    cardRef.current.style.setProperty('--mouse-y', '-1000px');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card ${className}`}
      style={style}
      {...props}
    >
      <div className="spotlight-content">
        {children}
      </div>
    </div>
  );
}

/**
 * Aceternity & Uiverse — Shimmer Button
 * Features continuous specular light sweep and tactile spring depression.
 */
export function ShimmerButton({ 
  children, 
  onClick, 
  variant = 'gold', // 'gold' | 'cyan' | 'emerald' | 'purple'
  className = '', 
  style = {}, 
  ...props 
}) {
  const variantClass = 
    variant === 'cyan' ? 'btn-cyan' :
    variant === 'emerald' ? 'btn-emerald' :
    variant === 'purple' ? 'btn-purple' : 'btn-luxury-gold';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Magic UI — Border Beam Card
 * Creates a glowing, rotating perimeter light beam around VIP or critical cards.
 */
export function BorderBeamCard({ 
  children, 
  className = '', 
  style = {}, 
  ...props 
}) {
  return (
    <div className={`border-beam-card ${className}`} style={style} {...props}>
      <div className="border-beam-inner">
        {children}
      </div>
    </div>
  );
}

/**
 * Magic UI — Border Beam Badge
 * Compact badge with glowing neon rim and soft pulsing dot.
 */
export function BorderBeamBadge({ text, variant = 'gold', className = '', style = {} }) {
  const color = variant === 'cyan' ? '#06B6D4' : variant === 'emerald' ? '#10B981' : '#D4AF37';
  return (
    <span 
      className={`border-beam-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '10.5px',
        fontWeight: '800',
        letterSpacing: '0.5px',
        background: 'rgba(15, 23, 42, 0.9)',
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${color}33`,
        color: '#FFFFFF',
        ...style
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      {text}
    </span>
  );
}


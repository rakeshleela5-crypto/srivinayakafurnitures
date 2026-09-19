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

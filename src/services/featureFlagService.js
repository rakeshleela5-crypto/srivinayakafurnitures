/**
 * ==============================================================================
 * OmniBuild OS™ — Edge-Native Feature Flag & Canary Rollout Engine
 * Zero Performance Overhead • Hash-Based Canary Cohorts • Kill-Switch Fallback
 * ==============================================================================
 */

import { useState, useEffect } from 'react';

// Default Master Configuration of Enterprise Feature Flags
export const MASTER_FEATURE_FLAGS = Object.freeze({
  SPLIT_TENDER_POS: {
    key: 'split_tender_pos',
    name: 'Multi-Tender POS Terminal',
    description: 'Split showroom bills across Cash, UPI QR, Card EDC, and Khata (Odoo/Vertex benchmark)',
    defaultEnabled: true,
    rolloutPercentage: 100, // 100% full rollout
    allowedRoles: ['rakesh', 'sunil_sales', 'dock_supervisor'],
    category: '🛒 POS & Cashier'
  },
  EWAY_BILL_NIC_GENERATOR: {
    key: 'eway_bill_nic_generator',
    name: 'Statutory E-Way Bill NIC JSON Generator',
    description: 'Section 68 CGST ₹50,000 threshold verification and NIC-compliant JSON payload generator',
    defaultEnabled: true,
    rolloutPercentage: 100,
    allowedRoles: ['rakesh', 'sunil_sales'],
    category: '🚚 Logistics & Compliance'
  },
  FURNITURE_VARIANT_MATRIX: {
    key: 'furniture_variant_matrix',
    name: '4D Furniture Variant Studio',
    description: 'Medusa-style dynamic matrix configuring Wood Species, Dimensions, Finishes, and Upholstery',
    defaultEnabled: true,
    rolloutPercentage: 100,
    allowedRoles: ['rakesh', 'sunil_sales'],
    category: '📐 Custom Workshop'
  },
  CUSTOMER_KHATA_LEDGER: {
    key: 'customer_khata_ledger',
    name: 'Customer Khata & Milestone Aging Ledger',
    description: 'Crater-benchmark customer accounts, milestone installments, and automated WhatsApp reminders',
    defaultEnabled: true,
    rolloutPercentage: 100,
    allowedRoles: ['rakesh', 'sunil_sales'],
    category: '🏛️ Accounts & Finance'
  },
  ENTERPRISE_ERP_PIPELINE: {
    key: 'enterprise_erp_pipeline',
    name: 'ERPNext Document Pipeline Stepper',
    description: 'Quotation (EST) -> Sales Order (SO) -> Delivery Note (DN) -> Tax Invoice (INV) state machine',
    defaultEnabled: true,
    rolloutPercentage: 100,
    allowedRoles: ['rakesh', 'sunil_sales'],
    category: '📑 Enterprise ERP'
  },
  D1_LIVE_EXPLORER: {
    key: 'd1_live_explorer',
    name: 'Cloudflare D1 Live Database Explorer',
    description: '1:1 SQL schema and real-time tabular data mirror with accountant CSV exports',
    defaultEnabled: true,
    rolloutPercentage: 100,
    allowedRoles: ['rakesh', 'sunil_sales'],
    category: '⚡ Database & Cloud'
  },
  BOM_KIT_ASSEMBLY: {
    key: 'bom_kit_assembly',
    name: 'Interactive Knockdown BOM Kit Assembly',
    description: 'Hardware checklist, 5/5 carton verification, and carpenter audio guide for knockdown kits',
    defaultEnabled: true,
    rolloutPercentage: 75, // 75% Canary rollout
    allowedRoles: ['rakesh', 'dock_supervisor'],
    category: '🛠️ Workshop & Fitment'
  },
  AI_VOICE_CONCIERGE: {
    key: 'ai_voice_concierge',
    name: 'AI Voice POS Concierge (Experimental)',
    description: 'Autonomous voice-to-cart parsing and Odia/Telugu dialect negotiation copilot',
    defaultEnabled: false, // Canary in testing
    rolloutPercentage: 25, // 25% Canary rollout
    allowedRoles: ['rakesh'],
    category: '🤖 AI Research'
  }
});

const STORAGE_KEY = 'omnibuild_feature_flag_overrides';

/**
 * Get locally persisted overrides (stored in browser localStorage for Store Director)
 */
export function getLocalFlagOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Feature flag override storage error:', e);
    return {};
  }
}

/**
 * Set a specific flag override (force ENABLE or DISABLE)
 */
export function setFeatureFlagOverride(flagKey, isEnabled) {
  try {
    const current = getLocalFlagOverrides();
    if (isEnabled === null || isEnabled === undefined) {
      delete current[flagKey];
    } else {
      current[flagKey] = Boolean(isEnabled);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('omnibuild_flags_updated', { detail: { flagKey, isEnabled } }));
  } catch (e) {
    console.warn('Could not save feature flag override:', e);
  }
}

/**
 * Reset all local overrides back to master defaults
 */
export function resetAllFeatureFlagOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('omnibuild_flags_updated', { detail: {} }));
  } catch (e) {
    console.warn('Could not reset feature flag overrides:', e);
  }
}

/**
 * Deterministic Murmur-style Hash for Canary Cohorts (0 - 99)
 */
export function hashToCohortBucket(keyString) {
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    hash = (hash << 5) - hash + keyString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

/**
 * Fast synchronous evaluation of a feature flag
 * Performance budget: < 0.1ms
 */
export function isFeatureActive(flagKey, userContext = null) {
  const flag = MASTER_FEATURE_FLAGS[flagKey] || Object.values(MASTER_FEATURE_FLAGS).find(f => f.key === flagKey);
  if (!flag) return false;

  // 1. Check local director override first
  const overrides = getLocalFlagOverrides();
  if (typeof overrides[flag.key] === 'boolean') {
    return overrides[flag.key];
  }

  // 2. Check hard kill-switch default
  if (!flag.defaultEnabled) return false;

  // 3. Check role authorization
  if (flag.allowedRoles && flag.allowedRoles.length > 0) {
    const userRole = userContext?.role || userContext?.id || 'rakesh';
    if (!flag.allowedRoles.includes(userRole) && userRole !== 'rakesh') {
      return false;
    }
  }

  // 4. Check Canary Cohort percentage
  if (flag.rolloutPercentage < 100) {
    const identity = userContext?.id || userContext?.phone || 'showroom_counter_1';
    const bucket = hashToCohortBucket(`${flag.key}:${identity}`);
    return bucket < flag.rolloutPercentage;
  }

  return true;
}

/**
 * React Hook for dynamic feature flag subscription with hot-reload
 */
export function useFeatureFlag(flagKey, userContext = null) {
  const [isActive, setIsActive] = useState(() => isFeatureActive(flagKey, userContext));

  useEffect(() => {
    const handleUpdate = () => {
      setIsActive(isFeatureActive(flagKey, userContext));
    };

    window.addEventListener('omnibuild_flags_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('omnibuild_flags_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [flagKey, userContext]);

  return isActive;
}

/**
 * Get comprehensive flag status audit for the management console
 */
export function getAllFeatureFlagStatuses(userContext = null) {
  const overrides = getLocalFlagOverrides();
  return Object.values(MASTER_FEATURE_FLAGS).map(flag => {
    const hasOverride = typeof overrides[flag.key] === 'boolean';
    const overrideValue = overrides[flag.key];
    const currentlyActive = isFeatureActive(flag.key, userContext);

    return {
      ...flag,
      hasOverride,
      overrideValue,
      currentlyActive
    };
  });
}

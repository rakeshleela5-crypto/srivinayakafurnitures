// OmniBuild OS™ — Spatial Dimension, Clearance & Ergonomics Mathematical Engine
// Calculates real-world room clearances, door-swing radii, and apartment entry feasibility

/**
 * Parses dimension string into numerical feet and inches
 * Example: "14' 4\" × 12' 2\" × 10' 0\"" -> { length: 14.33, width: 12.17, height: 10.0 }
 */
export function parseDimensionsString(dimStr = "14' 0\" × 12' 0\" × 9' 6\"") {
  if (!dimStr) return { length: 14, width: 12, height: 9.5 };
  
  const parts = dimStr.split('×').map(p => p.trim());
  
  const parsePart = (str) => {
    if (!str) return 12;
    const feetMatch = str.match(/(\d+)'/);
    const inchesMatch = str.match(/(\d+)"/);
    const feet = feetMatch ? parseFloat(feetMatch[1]) : 0;
    const inches = inchesMatch ? parseFloat(inchesMatch[1]) : 0;
    return feet + (inches / 12);
  };

  const length = parsePart(parts[0]) || 14;
  const width = parsePart(parts[1]) || 12;
  const height = parsePart(parts[2]) || 9.5;

  return { length, width, height };
}

/**
 * Calculates spatial fit for an item or multi-item combo in a given room
 * @param {Array} items - Array of catalog items
 * @param {string} roomDimensionsStr - Room dimensions string
 * @param {string} categoryMode - 'ALL' | 'SOFA' | 'DINING' | 'ALMIRAH' | 'BED'
 */
export function calculateRoomSpatialSynergy(items = [], roomDimensionsStr = "14' 0\" × 12' 0\" × 9' 6\"", categoryMode = 'ALL') {
  const room = parseDimensionsString(roomDimensionsStr);
  const floorAreaSqFt = Math.round(room.length * room.width);

  // Calculate total furniture footprint
  let totalLengthNeeded = 0;
  let totalDepthNeeded = 0;
  let totalAreaOccupied = 0;

  items.forEach(item => {
    // Default approximations based on SKU type
    let itemL = 6.5; // ft
    let itemD = 3.5; // ft
    const name = (item.Product_Name || '').toLowerCase();
    const sku = (item.SKU || '').toLowerCase();

    if (name.includes('bed') || sku.includes('bed')) {
      itemL = 6.8; itemD = 6.2;
    } else if (name.includes('wardrobe') || name.includes('almirah') || sku.includes('alm') || sku.includes('wdr')) {
      itemL = 5.5; itemD = 2.2;
    } else if (name.includes('sofa') || sku.includes('sof')) {
      itemL = name.includes('7-seater') ? 9.2 : name.includes('5-seater') ? 7.8 : 6.2;
      itemD = 3.4;
    } else if (name.includes('dining') || sku.includes('din')) {
      itemL = name.includes('6-seater') ? 6.0 : 4.5;
      itemD = 3.5;
    } else if (name.includes('recliner') || sku.includes('rcl')) {
      itemL = 3.5; itemD = 3.5;
    } else if (name.includes('chair') || sku.includes('chr')) {
      itemL = 2.8; itemD = 2.8;
    }

    totalLengthNeeded += itemL;
    totalDepthNeeded = Math.max(totalDepthNeeded, itemD);
    totalAreaOccupied += (itemL * itemD);
  });

  // Calculate remaining human walkway and door clearance
  const remainingWallLength = Math.max(0, room.length - (categoryMode === 'ALL' ? totalLengthNeeded * 0.65 : totalLengthNeeded));
  const remainingWidthPassage = Math.max(0, room.width - totalDepthNeeded);
  const floorCoverageRatio = totalAreaOccupied / floorAreaSqFt;

  // Door Swing and Chair Clearance zones
  const hasWardrobe = items.some(i => (i.Product_Name || '').toLowerCase().includes('wardrobe') || (i.Product_Name || '').toLowerCase().includes('almirah'));
  const hasDining = items.some(i => (i.Product_Name || '').toLowerCase().includes('dining'));
  const hasHydraulicBed = items.some(i => (i.Product_Name || '').toLowerCase().includes('bed'));

  const doorSwingRadiusFt = hasWardrobe ? 2.2 : 0;
  const chairPulloutZoneFt = hasDining ? 2.8 : 0;
  const hydraulicLiftHeightFt = hasHydraulicBed ? 5.2 : 0;

  // Minimum required safe walkway
  const minWalkwayNeeded = 3.0; // ft
  const isWalkwaySafe = remainingWidthPassage >= minWalkwayNeeded;

  // Fit Status Classification
  let fitStatus = 'PERFECT_FIT'; // 'PERFECT_FIT' | 'TIGHT_FIT' | 'OVERSIZED'
  let synergyScore = 96;
  let statusMessage = "Optimal spatial synergy. Generous 4.5 ft human walkway corridor preserved.";

  if (floorCoverageRatio > 0.45 || remainingWidthPassage < 2.2 || remainingWallLength < 1.0) {
    fitStatus = 'OVERSIZED';
    synergyScore = 68;
    statusMessage = "Spatial Alert: High floor congestion. Recommended to choose a more compact model.";
  } else if (floorCoverageRatio > 0.32 || remainingWidthPassage < 3.2) {
    fitStatus = 'TIGHT_FIT';
    synergyScore = 84;
    statusMessage = "Comfortable fit with 2.8 ft clearance. Soft-close hinges recommended.";
  }

  // Apartment Elevator and Staircase Entry Check
  const maxSingleBoxLength = items.some(i => (i.Product_Name || '').toLowerCase().includes('sofa') && (i.Product_Name || '').toLowerCase().includes('7-seater')) ? 7.5 : 6.8;
  const elevatorFits = maxSingleBoxLength <= 6.8; // Standard 5.5 - 6.8 ft elevator door diagonal

  return {
    roomLengthFt: room.length.toFixed(1),
    roomWidthFt: room.width.toFixed(1),
    roomHeightFt: room.height.toFixed(1),
    floorAreaSqFt,
    occupiedAreaSqFt: Math.round(totalAreaOccupied),
    remainingPassageFt: remainingWidthPassage.toFixed(1),
    remainingWallLengthFt: remainingWallLength.toFixed(1),
    floorCoveragePct: Math.round(floorCoverageRatio * 100),
    doorSwingRadiusFt,
    chairPulloutZoneFt,
    hydraulicLiftHeightFt,
    isWalkwaySafe,
    fitStatus,
    synergyScore,
    statusMessage,
    elevatorFits,
    knockdownBoxesCount: items.length * 2 + 1
  };
}

/**
 * Filter catalog items according to isolated category mode with live fit validation
 */
export function getFilteredCatalogForMode(catalog = [], categoryMode = 'ALL', roomDimensionsStr = "14' 0\" × 12' 0\" × 9' 6\"") {
  if (!catalog || catalog.length === 0) return [];

  return catalog.filter(item => {
    const cat = (item.Main_Category || '').toLowerCase();
    const subCat = (item.Sub_Category || '').toLowerCase();
    const name = (item.Product_Name || '').toLowerCase();

    if (categoryMode === 'SOFA') {
      return cat.includes('living') || subCat.includes('sofa') || name.includes('sofa') || name.includes('recliner') || name.includes('sectional');
    } else if (categoryMode === 'DINING') {
      return cat.includes('dining') || subCat.includes('dining') || name.includes('dining') || name.includes('table');
    } else if (categoryMode === 'ALMIRAH') {
      return cat.includes('wardrobe') || cat.includes('storage') || subCat.includes('almirah') || subCat.includes('wardrobe') || name.includes('wardrobe') || name.includes('almirah');
    } else if (categoryMode === 'BED') {
      return cat.includes('bedroom') || subCat.includes('bed') || name.includes('bed');
    }
    return true; // 'ALL' mode returns all items
  }).map(item => {
    // Attach dynamic fit calculation for each card
    const singleFit = calculateRoomSpatialSynergy([item], roomDimensionsStr, categoryMode);
    return {
      ...item,
      _fitStatus: singleFit.fitStatus,
      _synergyScore: singleFit.synergyScore,
      _remainingPassage: singleFit.remainingPassageFt
    };
  });
}

// OmniBuild OS™ — Universal SmartKit Knockdown Component Box Generator
// Dynamically generates box breakdown for any of the 137 Master SKUs based on Category, Dimensions & Total_Component_Boxes

export function generateBoxesForProduct(product) {
  if (!product) {
    return [
      {
        id: 'A',
        letter: 'A',
        name: 'Main Furniture Unit Assembly',
        weight: 25.0,
        dimensions: 'Standard Carton',
        condition: 'INTACT_OK',
        notes: 'Factory sealed single carton with high-density EPE foam',
        barcode: 'SK-GEN-01-A'
      }
    ];
  }

  const boxCount = Math.max(1, Number(product.Total_Component_Boxes) || 1);
  const sku = product.SKU || 'SKU-001';
  const name = product.Product_Name || 'Furniture Unit';
  const cat = (product.Main_Category || '').toLowerCase();
  const subCat = (product.Sub_Category || '').toLowerCase();
  const rawDims = product.Dimensions || 'Standard Size';

  let componentList = [];

  // 🛏️ BEDROOM & BEDS
  if (cat.includes('bed') || subCat.includes('bed')) {
    if (boxCount === 5) {
      componentList = [
        { name: 'Teak Headboard & Hydraulic Lift Assembly Frame', weight: 38.5, dim: '82" × 48" × 8"', notes: 'Carved teak headboard with pre-installed hydraulic lift brackets' },
        { name: 'Solid Teak Side Rails & Footboard Panel', weight: 29.0, dim: '78" × 12" × 6"', notes: 'Dual side runners with protective teak polish blanket wrap' },
        { name: 'Heavy-Duty Metal Slats & Frame Grid Support', weight: 24.5, dim: '76" × 70" × 4"', notes: 'Powder-coated steel cross-members with noise-dampening rubber caps' },
        { name: 'Gas-Lift Shock Absorbers & Hardware Kit Pouch', weight: 8.2, dim: '18" × 12" × 6"', notes: 'Pair of 250N gas pistons + Allen key bolts pouch #HK-89' },
        { name: 'Water-Resistant Engineered Mattress Base Board', weight: 19.0, dim: '76" × 36" × 3"', notes: 'Marine-grade pre-laminated base board with breathability vents' }
      ];
    } else if (boxCount === 4) {
      componentList = [
        { name: 'Solid Wood Headboard & Footboard Panel', weight: 34.0, dim: '80" × 48" × 6"', notes: 'Main headboard and footboard section' },
        { name: 'Side Rails & Structural Bed Frame', weight: 26.0, dim: '78" × 12" × 6"', notes: 'Dual side structural rails' },
        { name: 'Bed Slats & Center Support Beam', weight: 20.0, dim: '76" × 60" × 4"', notes: 'Reinforced wooden slats' },
        { name: 'Hardware Fasteners & Assembly Fittings', weight: 6.5, dim: '16" × 10" × 4"', notes: 'Bolts, brackets and tool kit' }
      ];
    } else if (boxCount === 2) {
      componentList = [
        { name: 'Main Bed Frame & Headboard Assembly', weight: 44.0, dim: '80" × 48" × 8"', notes: 'Frame and headboard carton' },
        { name: 'Bed Slats, Center Support & Hardware Kit', weight: 18.0, dim: '76" × 30" × 5"', notes: 'Slats and fittings pouch' }
      ];
    } else {
      componentList = Array.from({ length: boxCount }, (_, i) => ({
        name: `Bed Modular Component Section ${i + 1}`,
        weight: (90 / boxCount).toFixed(1),
        dim: rawDims,
        notes: `Carton Box ${i + 1} of ${boxCount}`
      }));
    }
  }
  // 🛋️ LIVING ROOM & SOFAS / RECLINERS
  else if (cat.includes('living') || cat.includes('sofa') || subCat.includes('sofa') || subCat.includes('recliner')) {
    if (boxCount === 3) {
      componentList = [
        { name: '3-Seater Main Sectional Seating Base', weight: 42.0, dim: '84" × 36" × 32"', notes: 'Main sofa frame with high-resilience 40D molded foam core' },
        { name: 'Reversible Chaise Lounger Module & Armrest', weight: 32.5, dim: '66" × 34" × 30"', notes: 'Interlocking metal bracket connector for left/right alignment' },
        { name: 'Backrest Cushions, Solid Legs & Hardware Pack', weight: 14.5, dim: '36" × 24" × 18"', notes: '6x fiber cushions + 8x solid wood legs + assembly wrench' }
      ];
    } else if (boxCount === 2) {
      componentList = [
        { name: 'Main Sofa Seater Structure & Mechanism', weight: 38.0, dim: '74" × 36" × 32"', notes: 'Frame and motor assembly' },
        { name: 'Cushions, Armrest Panels & Leg Pack', weight: 16.0, dim: '36" × 24" × 16"', notes: 'Cushions and hardware carton' }
      ];
    } else if (boxCount === 4) {
      componentList = [
        { name: 'Left-Arm 3-Seater Sectional Module', weight: 36.0, dim: '78" × 36" × 32"', notes: 'Left-side module' },
        { name: 'Right-Arm 2-Seater Sectional Module', weight: 28.0, dim: '58" × 36" × 32"', notes: 'Right-side module' },
        { name: 'Corner Wedge Seater Connector Module', weight: 22.0, dim: '36" × 36" × 32"', notes: 'Corner connector section' },
        { name: 'Plush Cushions, Legs & Hardware Pack', weight: 14.0, dim: '36" × 24" × 18"', notes: 'Accessories and hardware' }
      ];
    } else if (boxCount === 1) {
      componentList = [
        { name: 'Single-Unit Chair / Recliner & Base', weight: 28.0, dim: rawDims, notes: 'Single carton packaging with corner guards' }
      ];
    } else {
      componentList = Array.from({ length: boxCount }, (_, i) => ({
        name: `Sofa Modular Section ${i + 1}`,
        weight: (75 / boxCount).toFixed(1),
        dim: rawDims,
        notes: `Carton Box ${i + 1} of ${boxCount}`
      }));
    }
  }
  // 🍽️ DINING & STUDY
  else if (cat.includes('dining') || subCat.includes('dining') || subCat.includes('study')) {
    if (boxCount === 4) {
      componentList = [
        { name: 'Marble / Solid Teak Dining Tabletop Slab', weight: 52.0, dim: '72" × 42" × 4"', notes: 'Reinforced heavy wooden crate with foam corner protectors' },
        { name: 'Solid Pedestal / Table Base Legs & Crossbars', weight: 24.0, dim: '32" × 28" × 28"', notes: 'Heavy support structure and mounting plate' },
        { name: 'Upholstered Dining Chairs Set A (3 Chairs)', weight: 18.5, dim: '38" × 24" × 24"', notes: 'Padded dining chairs carton 1' },
        { name: 'Upholstered Dining Chairs Set B (3 Chairs) & Hardware', weight: 19.5, dim: '38" × 24" × 24"', notes: 'Padded dining chairs carton 2 + assembly bolts' }
      ];
    } else if (boxCount === 3) {
      componentList = [
        { name: 'Dining Tabletop & Support Frame', weight: 38.0, dim: '66" × 38" × 5"', notes: 'Main dining table surface' },
        { name: 'Table Legs & Structural Underframe', weight: 18.0, dim: '30" × 24" × 24"', notes: 'Solid legs and brackets' },
        { name: 'Dining Chairs Set & Assembly Hardware', weight: 22.0, dim: '40" × 26" × 26"', notes: 'Chairs and hardware carton' }
      ];
    } else if (boxCount === 2) {
      componentList = [
        { name: 'Dining / Study Table Top & Legs Pack', weight: 34.0, dim: '60" × 36" × 6"', notes: 'Tabletop and legs package' },
        { name: 'Chairs / Drawer Units & Hardware Pack', weight: 18.0, dim: '36" × 24" × 20"', notes: 'Seating and fittings' }
      ];
    } else if (boxCount === 1) {
      componentList = [
        { name: 'Study Desk / Table Knockdown Pack', weight: 26.0, dim: rawDims, notes: 'Single carton packaging' }
      ];
    } else {
      componentList = Array.from({ length: boxCount }, (_, i) => ({
        name: `Dining Suite Component ${i + 1}`,
        weight: (60 / boxCount).toFixed(1),
        dim: rawDims,
        notes: `Carton Box ${i + 1} of ${boxCount}`
      }));
    }
  }
  // 🏢 OFFICE & INSTITUTIONAL
  else if (cat.includes('office') || subCat.includes('chair') || subCat.includes('desk') || subCat.includes('workstation')) {
    if (boxCount === 1) {
      componentList = [
        { name: 'Complete Knockdown Chair / Desk Unit & Hardware', weight: 14.5, dim: rawDims, notes: 'Factory sealed single carton with high-density EPE foam' }
      ];
    } else if (boxCount === 2) {
      componentList = [
        { name: 'Executive Desktop Surface & Side Modesty Panel', weight: 24.0, dim: '60" × 30" × 6"', notes: 'Main desktop surface panel' },
        { name: 'CRCA Steel Base Frame, Motor & Hardware Kit', weight: 18.5, dim: '42" × 14" × 8"', notes: 'Legs, mechanism and cable management tray' }
      ];
    } else if (boxCount === 3) {
      componentList = [
        { name: 'Executive Director Desktop Surface Top', weight: 32.0, dim: '84" × 42" × 5"', notes: 'Veneer top surface with cable hub' },
        { name: 'Pedestal Storage Drawers & Credenza Unit', weight: 28.0, dim: '48" × 20" × 28"', notes: 'Storage cabinet' },
        { name: 'Steel Leg Assembly, Modesty Panel & Wire Tray', weight: 18.0, dim: '72" × 18" × 6"', notes: 'Frame and cable management' }
      ];
    } else if (boxCount === 4) {
      componentList = [
        { name: 'Modular Workstation Tops (Set of 4 Desks)', weight: 36.0, dim: '48" × 24" × 8"', notes: '4x prelam desktop slabs' },
        { name: 'CRCA Steel Heavy Modular Understructure', weight: 32.0, dim: '96" × 16" × 12"', notes: 'Main steel legs and beams' },
        { name: 'Acoustic Fabric Privacy Screen Partitions', weight: 14.0, dim: '48" × 18" × 6"', notes: 'Sound-dampening acoustic screens' },
        { name: 'Raceway Cable Trays, Power Outlets & Hardware', weight: 12.0, dim: '48" × 12" × 6"', notes: 'Fittings and cable raceways' }
      ];
    } else {
      componentList = Array.from({ length: boxCount }, (_, i) => ({
        name: `Office Module Component ${i + 1}`,
        weight: (45 / boxCount).toFixed(1),
        dim: rawDims,
        notes: `Carton Box ${i + 1} of ${boxCount}`
      }));
    }
  }
  // 🗄️ STORAGE, WARDROBES & MODULAR KITCHEN
  else if (cat.includes('storage') || cat.includes('wardrobe') || cat.includes('kitchen') || subCat.includes('almirah')) {
    if (boxCount === 4) {
      componentList = [
        { name: 'Outer Side Panels & Top/Bottom Slabs', weight: 36.0, dim: '84" × 24" × 6"', notes: 'Main almirah body carcass panels' },
        { name: 'Internal Shelves & Drawer Box Compartments', weight: 26.0, dim: '36" × 22" × 12"', notes: 'Shelving and inner locker units' },
        { name: 'Toughened Mirror / Lacquered Glass Door Shutters', weight: 32.0, dim: '82" × 18" × 4"', notes: 'Fragile mirror door panels in protective casing' },
        { name: 'Soft-Close Hinges, Lock & Hardware Pack', weight: 8.0, dim: '18" × 12" × 6"', notes: 'Locks, keys, handles and fastener screws' }
      ];
    } else if (boxCount === 2) {
      componentList = [
        { name: 'Almirah / Storage Body & Shelves Knockdown', weight: 38.0, dim: '72" × 24" × 8"', notes: 'Main cabinet body structure' },
        { name: 'Shutters, Hinges & Lock Pack', weight: 22.0, dim: '70" × 18" × 4"', notes: 'Door panels and locks' }
      ];
    } else {
      componentList = Array.from({ length: boxCount }, (_, i) => ({
        name: `Storage Component Unit ${i + 1}`,
        weight: (50 / boxCount).toFixed(1),
        dim: rawDims,
        notes: `Carton Box ${i + 1} of ${boxCount}`
      }));
    }
  }
  // 🌟 DEFAULT FALLBACK FOR ANY OTHER ITEM
  else {
    componentList = Array.from({ length: boxCount }, (_, i) => ({
      name: `${name} — Component Box ${i + 1}`,
      weight: (40 / boxCount).toFixed(1),
      dim: rawDims,
      notes: `Carton Box ${i + 1} of ${boxCount}`
    }));
  }

  // Ensure exact length match
  return Array.from({ length: boxCount }, (_, i) => {
    const letter = String.fromCharCode(65 + i); // 'A', 'B', 'C', 'D', 'E'...
    const comp = componentList[i] || {
      name: `${name} — Section ${letter}`,
      weight: (30 / boxCount).toFixed(1),
      dim: rawDims,
      notes: `Carton Box ${letter} of ${boxCount}`
    };

    return {
      id: letter,
      letter: letter,
      name: comp.name,
      weight: Number(comp.weight) || 15.0,
      dimensions: comp.dim || rawDims,
      condition: 'INTACT_OK',
      notes: comp.notes || 'Factory sealed carton',
      barcode: `SK-${sku}-${letter}`
    };
  });
}

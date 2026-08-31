// Universal SmartKit Flat-Pack Knock-Down Carton Decomposition Utility
// Breaks down ANY furniture SKU or product model into factory component cartons

export function generateSmartKitBoxesForProduct(productNameOrSku = "", orderId = "ORD-8921") {
  const name = (productNameOrSku || "").toLowerCase();
  const baseId = orderId ? orderId.replace(/[^a-zA-Z0-9]/g, '') : "ORD";
  
  // 1. Beds & Hydraulic Storage Suites (5 Boxes)
  if (name.includes('bed') || name.includes('sleep') || name.includes('cot') || name.includes('king') || name.includes('queen')) {
    return [
      { Box_ID: `BOX-${baseId}-A`, Component_Name: "Box 1/5: Teak Headboard & Hydraulic Frame Assembly", Weight_KG: "38.5 kg", Barcode: `SK-${baseId}-A`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-B`, Component_Name: "Box 2/5: Solid Teak Side Rails & Footboard Panels", Weight_KG: "29.0 kg", Barcode: `SK-${baseId}-B`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-C`, Component_Name: "Box 3/5: Heavy-Duty Metal Slats & Frame Grid", Weight_KG: "24.5 kg", Barcode: `SK-${baseId}-C`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-D`, Component_Name: "Box 4/5: Gas-Lift Shock Absorbers & Hardware Kit", Weight_KG: "8.2 kg", Barcode: `SK-${baseId}-D`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-E`, Component_Name: "Box 5/5: Water-Resistant Engineered Mattress Base", Weight_KG: "19.0 kg", Barcode: `SK-${baseId}-E`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" }
    ];
  }
  
  // 2. Wardrobes / Almirahs / Closets (4 Boxes)
  if (name.includes('wardrobe') || name.includes('almirah') || name.includes('closet') || name.includes('cupboard') || name.includes('alm-')) {
    return [
      { Box_ID: `BOX-${baseId}-A`, Component_Name: "Box 1/4: Left/Right Carcass Side Panels & Base Plinth", Weight_KG: "42.0 kg", Barcode: `SK-${baseId}-A`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-B`, Component_Name: "Box 2/4: Front Shutters & Mirrored Dressing Panel", Weight_KG: "34.5 kg", Barcode: `SK-${baseId}-B`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-C`, Component_Name: "Box 3/4: Internal Shelves, Hanging Rods & Drawers", Weight_KG: "26.0 kg", Barcode: `SK-${baseId}-C`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-D`, Component_Name: "Box 4/4: Godrej Soft-Close Hinges & Master Lock Kit", Weight_KG: "6.5 kg", Barcode: `SK-${baseId}-D`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" }
    ];
  }
  
  // 3. Dining Tables / Marble / Glass Sets (3 Boxes)
  if (name.includes('dining') || name.includes('din-') || name.includes('table') || name.includes('marble')) {
    return [
      { Box_ID: `BOX-${baseId}-A`, Component_Name: "Box 1/3: Solid Teak Under-Frame & Heavy Legs", Weight_KG: "31.0 kg", Barcode: `SK-${baseId}-A`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-B`, Component_Name: "Box 2/3: Italian Polished Marble Top (Fragile Glass Pack)", Weight_KG: "48.0 kg", Barcode: `SK-${baseId}-B`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-C`, Component_Name: "Box 3/3: Cushioned Dining Chairs (Set) & Hardware Kit", Weight_KG: "22.5 kg", Barcode: `SK-${baseId}-C`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" }
    ];
  }
  
  // 4. Sofas / Recliners / Sectionals (3 Boxes)
  if (name.includes('sofa') || name.includes('recliner') || name.includes('couch') || name.includes('sectional') || name.includes('sof-')) {
    return [
      { Box_ID: `BOX-${baseId}-A`, Component_Name: "Box 1/3: 3-Seater Main Heavy Frame & S-Spring Base", Weight_KG: "44.0 kg", Barcode: `SK-${baseId}-A`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-B`, Component_Name: "Box 2/3: High-Density Cushion & Backrest Pack", Weight_KG: "28.0 kg", Barcode: `SK-${baseId}-B`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-C`, Component_Name: "Box 3/3: Motorized Recliner Actuator & Hardware Kit", Weight_KG: "14.5 kg", Barcode: `SK-${baseId}-C`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" }
    ];
  }

  // 5. Office Suites / Desks / Ergonomic (3 Boxes)
  if (name.includes('office') || name.includes('desk') || name.includes('chair') || name.includes('workstation') || name.includes('off-')) {
    return [
      { Box_ID: `BOX-${baseId}-A`, Component_Name: "Box 1/3: Engineered Desk Surface & Cable Management Tray", Weight_KG: "26.0 kg", Barcode: `SK-${baseId}-A`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-B`, Component_Name: "Box 2/3: Powder-Coated Steel Legs & Modesty Panel", Weight_KG: "18.5 kg", Barcode: `SK-${baseId}-B`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
      { Box_ID: `BOX-${baseId}-C`, Component_Name: "Box 3/3: Drawer Pedestal Unit & Central Locking Kit", Weight_KG: "12.0 kg", Barcode: `SK-${baseId}-C`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" }
    ];
  }

  // 6. Universal Furniture Fallback (3 Boxes)
  return [
    { Box_ID: `BOX-${baseId}-A`, Component_Name: "Box 1/3: Master Structural Panels & Core Frame", Weight_KG: "32.0 kg", Barcode: `SK-${baseId}-A`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
    { Box_ID: `BOX-${baseId}-B`, Component_Name: "Box 2/3: Sub-Assemblies, Shelves & Fasteners", Weight_KG: "21.5 kg", Barcode: `SK-${baseId}-B`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" },
    { Box_ID: `BOX-${baseId}-C`, Component_Name: "Box 3/3: Godrej Fittings, Screws & Assembly Manual", Weight_KG: "5.5 kg", Barcode: `SK-${baseId}-C`, Status: "VERIFIED_STAGED", Staged_By: "Dock Staff" }
  ];
}

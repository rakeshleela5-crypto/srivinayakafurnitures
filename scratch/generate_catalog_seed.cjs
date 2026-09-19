const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/initialData.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find start and end of FURNITURE_CATALOG
const startMarker = 'export const FURNITURE_CATALOG = [';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error('FURNITURE_CATALOG not found');
  process.exit(1);
}

// Find the matching closing bracket
let bracketDepth = 0;
let endIndex = -1;
const jsonStart = startIndex + 'export const FURNITURE_CATALOG = '.length;

for (let i = jsonStart; i < content.length; i++) {
  if (content[i] === '[') bracketDepth++;
  else if (content[i] === ']') {
    bracketDepth--;
    if (bracketDepth === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

const rawJson = content.slice(jsonStart, endIndex);
let items;
try {
  items = JSON.parse(rawJson);
} catch (e) {
  // Use function evaluation if JSON has trailing commas
  items = new Function('return ' + rawJson)();
}

console.log('Found catalog items:', items.length);

let sql = `-- ==============================================================================
-- OmniBuild OS™ — Complete 115-Item Godrej Catalog Seed for Cloudflare D1
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
-- Execute: npx wrangler d1 execute srivinayaka-db --file=./catalog_seed.sql
-- ==============================================================================

INSERT OR REPLACE INTO catalog (sku, product_name, category, mrp_inr, selling_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years)
VALUES
`;

const rows = items.map(item => {
  const clean = str => String(str || '').replace(/'/g, "''").trim();
  const sku = clean(item.SKU);
  const name = clean(item.Product_Name);
  const cat = clean(item.Main_Category || 'General');
  const mrp = Number(item.MRP_INR) || 0;
  const sp = Number(item.Selling_Price_INR) || Math.round(mrp * 0.82);
  const wqty = Math.floor(Math.random() * 6) + 2;
  const fqty = 1;
  const finish = clean(item.Material_Spec || 'Godrej Standard');
  const dims = clean(item.Dimensions || 'Standard');
  const warr = Number(item.Warranty_Years) || 5;

  return `  ('${sku}', '${name}', '${cat}', ${mrp}, ${sp}, ${wqty}, ${fqty}, '${finish}', '${dims}', ${warr})`;
});

sql += rows.join(',\n') + ';\n';

const outPath = path.join(__dirname, '../catalog_seed.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Successfully written', items.length, 'catalog items to', outPath);

import fs from 'fs';

const code = fs.readFileSync('C:/Users/rakes/OneDrive/Desktop/ALL_IN_ONE_MASTER_WEBHOOK.gs', 'utf8');

// Find all sheet names in getOrCreateSheet
const sheetMatches = code.matchAll(/getOrCreateSheet\(ss,\s*["']([^"']+)["']/g);
const allSheets = new Set();
for (const match of sheetMatches) {
  allSheets.add(match[1]);
}

// Find all _Log tables
const logTables = Array.from(allSheets).filter(name => name.endsWith('_Log'));
const coreMasterTables = Array.from(allSheets).filter(name => !name.endsWith('_Log'));

console.log(`TOTAL SHEETS DETECTED IN GS: ${allSheets.size}`);
console.log(`LOG TABLES COUNT: ${logTables.length}`);
console.log(`LOG TABLES LIST:`, logTables);
console.log(`CORE MASTER TABLES COUNT: ${coreMasterTables.length}`);
console.log(`CORE MASTER TABLES LIST:`, coreMasterTables);

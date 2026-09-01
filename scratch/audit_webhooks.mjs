import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('C:/Users/rakes/.gemini/antigravity-ide/scratch/omnibuild-os/src');
const actions = new Set();
const regex = /dispatchWebhookAction\s*\(\s*['"]([^'"]+)['"]/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    actions.add(match[1]);
  }
});

const gsContent = fs.readFileSync('C:/Users/rakes/.gemini/antigravity-ide/scratch/omnibuild-os/ALL_IN_ONE_MASTER_WEBHOOK.gs', 'utf8');

const missing = [];
const found = [];

Array.from(actions).sort().forEach(action => {
  if (gsContent.includes(action)) {
    found.push(action);
  } else {
    missing.push(action);
  }
});

console.log(`TOTAL DISPATCHED ACTIONS IN FRONTEND: ${actions.size}`);
console.log(`FOUND IN GOOGLE SHEETS WEBHOOK (${found.length}):`);
found.forEach(a => console.log(`  ✅ ${a}`));

console.log(`\nMISSING IN GOOGLE SHEETS WEBHOOK (${missing.length}):`);
missing.forEach(a => console.log(`  ❌ ${a}`));

import fs from 'fs';
import path from 'path';

// 1. Scan frontend src/ directory for all dispatchWebhookAction calls
function getDispatchedActions(dirPath, actionSet = new Set()) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getDispatchedActions(fullPath, actionSet);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(/dispatchWebhookAction\s*\(\s*['"]([^'"]+)['"]/g);
      for (const m of matches) {
        actionSet.add(m[1]);
      }
    }
  }
  return actionSet;
}

const frontendActions = getDispatchedActions('C:/Users/rakes/.gemini/antigravity-ide/scratch/omnibuild-os/src');

// 2. Scan ALL_IN_ONE_MASTER_WEBHOOK.gs for all handled action names
const gsCode = fs.readFileSync('C:/Users/rakes/OneDrive/Desktop/ALL_IN_ONE_MASTER_WEBHOOK.gs', 'utf8');

const handledActionRegex = /action\s*===\s*['"]([^'"]+)['"]/g;
const handledActions = new Set();
let match;
while ((match = handledActionRegex.exec(gsCode)) !== null) {
  handledActions.add(match[1]);
}

// 3. Find missing actions
const missingFromBackend = [];
for (const action of frontendActions) {
  if (!handledActions.has(action)) {
    missingFromBackend.push(action);
  }
}

console.log("=================================================");
console.log(`TOTAL FRONTEND DISPATCHED ACTIONS: ${frontendActions.size}`);
console.log(`TOTAL HANDLED BACKEND ACTIONS: ${handledActions.size}`);
console.log("=================================================");
console.log("FRONTEND ACTIONS DISPATCHED:", Array.from(frontendActions));
console.log("-------------------------------------------------");
console.log("BACKEND ACTIONS HANDLED:", Array.from(handledActions));
console.log("-------------------------------------------------");
console.log("MISSING FROM BACKEND (IF ANY):", missingFromBackend);
console.log("=================================================");

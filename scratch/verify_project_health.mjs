import fs from 'fs';
import path from 'path';

function checkDirectory(dirPath) {
  let count = 0;
  let errors = 0;
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
      count++;
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.length === 0) {
        console.error(`❌ Empty file found: ${file}`);
        errors++;
      }
    }
  });
  return { count, errors };
}

const views = checkDirectory('C:/Users/rakes/.gemini/antigravity-ide/scratch/omnibuild-os/src/views');
const modals = checkDirectory('C:/Users/rakes/.gemini/antigravity-ide/scratch/omnibuild-os/src/components/modals');

console.log(`VIEWS CHECK: ${views.count} components, ${views.errors} errors.`);
console.log(`MODALS CHECK: ${modals.count} components, ${modals.errors} errors.`);

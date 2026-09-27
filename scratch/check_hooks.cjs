const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk('./src');
const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext'];
const issues = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  for (const hook of hooks) {
    const hookRegex = new RegExp('\\b' + hook + '\\s*\\(', 'g');
    if (hookRegex.test(content)) {
      // Check if it's imported from 'react'
      const importRegex = new RegExp('import\\s+[^;]*\\b' + hook + '\\b[^;]*from\\s+[\'"]react[\'"]');
      const hasDirectImport = importRegex.test(content);
      const isReactDotHook = new RegExp('React\\.' + hook + '\\s*\\(').test(content);

      // Check if there are bare hook usages
      const matches = content.match(new RegExp('([A-Za-z0-9_$.]*\\b' + hook + '\\s*\\()', 'g')) || [];
      const hasBare = matches.some(m => !m.startsWith('React.'));

      if (hasBare && !hasDirectImport) {
        issues.push({ file: f, hook });
      }
    }
  }
}

console.log('Hook issues found:', JSON.stringify(issues, null, 2));

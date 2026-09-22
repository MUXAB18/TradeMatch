const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  'ml-': 'ms-',
  'mr-': 'me-',
  'pl-': 'ps-',
  'pr-': 'pe-',
  'text-left': 'text-start',
  'text-right': 'text-end',
  'left-': 'start-',
  'right-': 'end-',
  'border-l': 'border-s',
  'border-r': 'border-e',
  'rounded-l-': 'rounded-s-',
  'rounded-r-': 'rounded-e-',
  'rounded-tl-': 'rounded-ss-',
  'rounded-tr-': 'rounded-se-',
  'rounded-bl-': 'rounded-es-',
  'rounded-br-': 'rounded-ee-',
  'space-x-': 'space-x-reverse space-x-' // Wait, space-x automatically supports RTL if `dir="rtl"` is set, or in Tailwind v4 it's fully logical.
};

// Actually, let's just do the exact replacements.
const exactReplacements = [
  { regex: /\bml-(\d+|\[.*?\]|auto)\b/g, replace: 'ms-$1' },
  { regex: /\bmr-(\d+|\[.*?\]|auto)\b/g, replace: 'me-$1' },
  { regex: /\bpl-(\d+|\[.*?\]|auto)\b/g, replace: 'ps-$1' },
  { regex: /\bpr-(\d+|\[.*?\]|auto)\b/g, replace: 'pe-$1' },
  { regex: /\btext-left\b/g, replace: 'text-start' },
  { regex: /\btext-right\b/g, replace: 'text-end' },
  { regex: /\bleft-(\d+|\[.*?\]|auto|full)\b/g, replace: 'start-$1' },
  { regex: /\bright-(\d+|\[.*?\]|auto|full)\b/g, replace: 'end-$1' },
  { regex: /\bborder-l-(\d+|\[.*?\]|transparent|black|white|primary|error|border)\b/g, replace: 'border-s-$1' },
  { regex: /\bborder-r-(\d+|\[.*?\]|transparent|black|white|primary|error|border)\b/g, replace: 'border-e-$1' },
  { regex: /\bborder-l\b/g, replace: 'border-s' },
  { regex: /\bborder-r\b/g, replace: 'border-e' },
  { regex: /\brounded-l(-[a-z2-3]+)?\b/g, replace: 'rounded-s$1' },
  { regex: /\brounded-r(-[a-z2-3]+)?\b/g, replace: 'rounded-e$1' },
  { regex: /\brounded-tl(-[a-z2-3]+)?\b/g, replace: 'rounded-ss$1' },
  { regex: /\brounded-tr(-[a-z2-3]+)?\b/g, replace: 'rounded-se$1' },
  { regex: /\brounded-bl(-[a-z2-3]+)?\b/g, replace: 'rounded-es$1' },
  { regex: /\brounded-br(-[a-z2-3]+)?\b/g, replace: 'rounded-ee$1' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replace } of exactReplacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Done!');

/**
 * Setup Verification Script
 * Checks that all required folders and files exist per rules.md
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_STRUCTURE = {
  folders: [
    'app/(auth)',
    'app/(tabs)',
    'components',
    'hooks',
    'services',
    'constants',
    'utils',
    'types',
  ],
  files: [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/(auth)/_layout.tsx',
    'app/(tabs)/_layout.tsx',
    'services/firebase.ts',
    'services/users.ts',
    'services/jobs.ts',
    'services/certifications.ts',
    'types/index.ts',
    'constants/theme.ts',
    'constants/index.ts',
    'tsconfig.json',
    'eslint.config.mjs',
    '.prettierrc',
    '.env.example',
    'firestore.rules',
    'app.config.js',
  ],
  configFiles: [
    'prd.md',
    'architecture.md',
    'rules.md',
    'phases.md',
    'design.md',
    'memory.md',
    'ai-architecture.md',
  ],
};

function checkExists(itemPath, type = 'file') {
  const fullPath = path.join(process.cwd(), itemPath);
  const exists = fs.existsSync(fullPath);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${type}: ${itemPath}`);
  return exists;
}

console.log('\n🔍 Verifying TradeMatch Project Setup\n');

console.log('📁 Required Folders:');
const foldersOk = REQUIRED_STRUCTURE.folders.every(folder =>
  checkExists(folder, 'folder')
);

console.log('\n📄 Required Files:');
const filesOk = REQUIRED_STRUCTURE.files.every(file => checkExists(file, 'file'));

console.log('\n📚 Documentation Files:');
const docsOk = REQUIRED_STRUCTURE.configFiles.every(file =>
  checkExists(file, 'doc')
);

console.log('\n🔧 Configuration Check:');
const envExists = fs.existsSync('.env');
console.log(
  envExists
    ? '✅ .env file exists'
    : '⚠️  .env file missing - copy from .env.example'
);

console.log('\n📦 Dependencies Check:');
const packageJsonExists = fs.existsSync('package.json');
const nodeModulesExists = fs.existsSync('node_modules');
console.log(packageJsonExists ? '✅ package.json exists' : '❌ package.json missing');
console.log(
  nodeModulesExists
    ? '✅ node_modules exists'
    : '⚠️  node_modules missing - run npm install'
);

console.log('\n' + '='.repeat(50));

const allOk = foldersOk && filesOk && docsOk && packageJsonExists && nodeModulesExists;

if (allOk) {
  console.log('✅ Setup verification PASSED!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure Firebase keys in .env file');
  console.log('2. Run: npm start');
  console.log('3. See SETUP.md for detailed instructions');
} else {
  console.log('❌ Setup verification FAILED!');
  console.log('Some required files or folders are missing.');
}

console.log('='.repeat(50) + '\n');

process.exit(allOk ? 0 : 1);

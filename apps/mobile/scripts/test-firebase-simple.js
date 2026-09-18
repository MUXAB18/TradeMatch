/**
 * Simple Firebase Connection Test (Node.js)
 * Tests that Firebase configuration is properly set up
 */

require('dotenv').config();

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testConfiguration() {
  log('\n🔥 Testing Firebase Configuration\n', colors.blue);

  const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
  ];

  log('📋 Checking .env file...', colors.blue);

  let allPresent = true;
  const missingVars = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      log(`   ❌ ${varName} is missing or empty`, colors.red);
      missingVars.push(varName);
      allPresent = false;
    } else {
      log(`   ✅ ${varName} is set`, colors.green);
    }
  });

  log('\n' + '='.repeat(60), allPresent ? colors.green : colors.red);

  if (allPresent) {
    log('✅ Firebase configuration is complete!', colors.green);
    log('='.repeat(60) + '\n', colors.green);

    log('Configuration summary:', colors.blue);
    log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`, colors.green);
    log(
      `   Auth Domain: ${process.env.FIREBASE_AUTH_DOMAIN}`,
      colors.green
    );
    log(`   API Key: ${process.env.FIREBASE_API_KEY?.substring(0, 20)}...`, colors.green);

    log('\n📋 Next steps:', colors.blue);
    log('   1. Start your app: npm start');
    log('   2. Deploy Firebase rules: firebase deploy --only firestore');
    log('   3. See FIREBASE-SETUP-GUIDE.md for detailed instructions');

    return true;
  } else {
    log('❌ Firebase configuration is incomplete!', colors.red);
    log('='.repeat(60) + '\n', colors.red);

    log('⚠️  Missing variables:', colors.yellow);
    missingVars.forEach(varName => {
      log(`   - ${varName}`, colors.yellow);
    });

    log('\n📋 To fix this:', colors.blue);
    log('   1. Go to Firebase Console: https://console.firebase.google.com/');
    log('   2. Select your project (or create one)');
    log('   3. Add a Web app (</>  icon)');
    log('   4. Copy the configuration values');
    log('   5. Add them to your .env file');
    log('\n   See FIREBASE-SETUP-GUIDE.md for step-by-step instructions.');

    return false;
  }
}

// Run test
const success = testConfiguration();
process.exit(success ? 0 : 1);

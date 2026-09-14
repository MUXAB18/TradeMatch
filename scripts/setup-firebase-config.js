#!/usr/bin/env node
/**
 * Interactive Firebase Configuration Setup
 * Helps you add Firebase credentials to .env file
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise(resolve => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, answer => {
      resolve(answer.trim());
    });
  });
}

async function setup() {
  log('\n' + '='.repeat(60), colors.green);
  log('🔥 Firebase Configuration Setup', colors.bold + colors.green);
  log('='.repeat(60) + '\n', colors.green);

  log('This will help you add Firebase credentials to your .env file.\n', colors.blue);
  log('You need to get these values from Firebase Console:', colors.yellow);
  log('1. Go to https://console.firebase.google.com/', colors.yellow);
  log('2. Select your project (or create one)', colors.yellow);
  log('3. Click the Web icon (</>)  to add a web app', colors.yellow);
  log('4. Copy the configuration values\n', colors.yellow);

  const proceed = await question('Do you have your Firebase configuration ready? (yes/no): ');

  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    log('\nℹ️  Please get your Firebase configuration first.', colors.blue);
    log('See FIREBASE-SETUP-GUIDE.md for detailed instructions.\n', colors.blue);
    rl.close();
    process.exit(0);
  }

  log('\n📋 Enter your Firebase configuration:\n', colors.blue);

  const config = {
    FIREBASE_API_KEY: await question('Firebase API Key: '),
    FIREBASE_AUTH_DOMAIN: await question('Firebase Auth Domain: '),
    FIREBASE_PROJECT_ID: await question('Firebase Project ID: '),
    FIREBASE_STORAGE_BUCKET: await question('Firebase Storage Bucket: '),
    FIREBASE_MESSAGING_SENDER_ID: await question('Firebase Messaging Sender ID: '),
    FIREBASE_APP_ID: await question('Firebase App ID: '),
  };

  // Validate that all fields are filled
  const missingFields = Object.entries(config).filter(([_, value]) => !value);

  if (missingFields.length > 0) {
    log('\n❌ Some fields are missing:', colors.red);
    missingFields.forEach(([key]) => log(`   - ${key}`, colors.red));
    log('\nPlease run the script again and provide all values.\n', colors.yellow);
    rl.close();
    process.exit(1);
  }

  // Create .env content
  const envContent = `# Firebase Configuration
# Generated on ${new Date().toISOString()}

FIREBASE_API_KEY=${config.FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${config.FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${config.FIREBASE_PROJECT_ID}
FIREBASE_STORAGE_BUCKET=${config.FIREBASE_STORAGE_BUCKET}
FIREBASE_MESSAGING_SENDER_ID=${config.FIREBASE_MESSAGING_SENDER_ID}
FIREBASE_APP_ID=${config.FIREBASE_APP_ID}
`;

  // Write to .env file
  const envPath = path.join(process.cwd(), '.env');

  try {
    fs.writeFileSync(envPath, envContent);
    log('\n✅ Firebase configuration saved to .env file!', colors.green);

    log('\n📋 Configuration summary:', colors.blue);
    log(`   Project ID: ${config.FIREBASE_PROJECT_ID}`, colors.green);
    log(`   Auth Domain: ${config.FIREBASE_AUTH_DOMAIN}`, colors.green);

    log('\n🔍 Testing configuration...', colors.blue);

    // Run test
    const { exec } = require('child_process');
    exec('npm run test:firebase', (error, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      if (error) {
        log('\n⚠️  Configuration test failed. Please check your values.', colors.yellow);
      }

      log('\n📋 Next steps:', colors.blue);
      log('   1. Run: npm start', colors.green);
      log('   2. Deploy Firebase: firebase init && firebase deploy --only firestore', colors.green);
      log('   3. See FIREBASE-SETUP-GUIDE.md for detailed instructions\n', colors.green);

      rl.close();
    });
  } catch (error) {
    log('\n❌ Error writing .env file:', colors.red);
    log(error.message, colors.red);
    rl.close();
    process.exit(1);
  }
}

setup().catch(error => {
  log('\n❌ Error:', colors.red);
  log(error.message, colors.red);
  rl.close();
  process.exit(1);
});

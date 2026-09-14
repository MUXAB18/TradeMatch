/**
 * Firebase Connection Test Script
 * Verifies that Firebase is properly configured and connected
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Constants from 'expo-constants';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testFirebaseConnection() {
  log('\n🔥 Testing Firebase Connection\n', colors.blue);

  try {
    // Step 1: Check environment variables
    log('📋 Step 1: Checking environment variables...', colors.blue);
    
    const config = {
      apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
      authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
      projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID,
      storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
      appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
    };

    const missingVars: string[] = [];
    Object.entries(config).forEach(([key, value]) => {
      if (!value) {
        missingVars.push(key);
        log(`   ❌ ${key} is missing`, colors.red);
      } else {
        log(`   ✅ ${key} is set`, colors.green);
      }
    });

    if (missingVars.length > 0) {
      log('\n❌ Firebase configuration incomplete!', colors.red);
      log('Please add the following to your .env file:', colors.yellow);
      missingVars.forEach(key => log(`   - ${key}`, colors.yellow));
      log('\nSee .env.example for the required format.', colors.yellow);
      return false;
    }

    // Step 2: Initialize Firebase
    log('\n📋 Step 2: Initializing Firebase...', colors.blue);
    
    const existingApps = getApps();
    if (existingApps.length > 0) {
      log('   ℹ️  Firebase already initialized', colors.yellow);
    }

    const app = initializeApp(config);
    log(`   ✅ Firebase app initialized`, colors.green);
    log(`   Project ID: ${config.projectId}`, colors.green);

    // Step 3: Test Auth connection
    log('\n📋 Step 3: Testing Firebase Authentication...', colors.blue);
    getAuth(app);
    log(`   ✅ Auth instance created`, colors.green);
    log(`   Auth domain: ${config.authDomain}`, colors.green);

    // Step 4: Test Firestore connection
    log('\n📋 Step 4: Testing Firestore connection...', colors.blue);
    const db = getFirestore(app);
    log(`   ✅ Firestore instance created`, colors.green);

    // Try to read from a collection (will fail gracefully if empty)
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      log(`   ✅ Firestore connection successful`, colors.green);
      log(`   Users collection documents: ${snapshot.size}`, colors.green);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          log(`   ⚠️  Firestore accessible but no read permission (expected before auth)`, colors.yellow);
        } else {
          log(`   ❌ Firestore connection failed: ${error.message}`, colors.red);
          return false;
        }
      }
    }

    // Success!
    log('\n' + '='.repeat(50), colors.green);
    log('✅ Firebase connection test PASSED!', colors.green);
    log('='.repeat(50) + '\n', colors.green);

    log('Next steps:', colors.blue);
    log('1. Deploy security rules: firebase deploy --only firestore:rules');
    log('2. Deploy indexes: firebase deploy --only firestore:indexes');
    log('3. Start building your app!');

    return true;

  } catch (error) {
    log('\n' + '='.repeat(50), colors.red);
    log('❌ Firebase connection test FAILED!', colors.red);
    log('='.repeat(50) + '\n', colors.red);

    if (error instanceof Error) {
      log(`Error: ${error.message}`, colors.red);
      
      if (error.message.includes('API key not valid')) {
        log('\n⚠️  Invalid API key. Please check your .env file.', colors.yellow);
      } else if (error.message.includes('network')) {
        log('\n⚠️  Network error. Check your internet connection.', colors.yellow);
      }
    }

    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\nUnexpected error: ${error}`, colors.red);
    process.exit(1);
  });

import { initializeApp, FirebaseApp } from 'firebase/app';
// @ts-ignore: getReactNativePersistence is not explicitly typed in some firebase versions but works at runtime
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || '',
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || '',
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || '',
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId:
    Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || '',
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, auth, db, firebaseConfig };

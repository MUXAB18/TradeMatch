/**
 * Expo configuration with environment variable support
 * This file loads environment variables from .env and makes them available in the app
 */

require('dotenv').config();

module.exports = {
  expo: {
    name: 'TradeMatch',
    slug: 'tradematch',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'tradematch',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#007AFF',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.tradematch.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#007AFF',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      package: 'com.tradematch.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-status-bar'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  },
};

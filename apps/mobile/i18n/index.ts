import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en.json';
import es from './translations/es.json';
import ar from './translations/ar.json';

const STORE_LANGUAGE_KEY = 'settings.lang';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ar: { translation: ar },
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Check if user has a saved language preference
      const savedDataJSON = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
      const lng = savedDataJSON ? savedDataJSON : null;
      if (lng) {
        callback(lng);
        return;
      }
    } catch (error) {
      console.log('Error reading language from AsyncStorage', error);
    }
    
    // Fall back to device locale
    const bestLng = Localization.getLocales()[0]?.languageCode || 'en';
    callback(bestLng);
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lng);
    } catch (error) {
      console.log('Error saving language to AsyncStorage', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Recommend false for React Native
    },
  });

export default i18n;

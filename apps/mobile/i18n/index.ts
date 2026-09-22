import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en  from './translations/en.json';
import ar  from './translations/ar.json';
import hi  from './translations/hi.json';
import ur  from './translations/ur.json';
import bn  from './translations/bn.json';
import fil from './translations/fil.json';
import ne  from './translations/ne.json';

export const STORE_LANGUAGE_KEY = 'settings.lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'en',  name: 'English',    nativeName: 'English',    flag: '🇬🇧', rtl: false },
  { code: 'ar',  name: 'Arabic',     nativeName: 'العربية',    flag: '🇸🇦', rtl: true  },
  { code: 'hi',  name: 'Hindi',      nativeName: 'हिन्दी',       flag: '🇮🇳', rtl: false },
  { code: 'ur',  name: 'Urdu',       nativeName: 'اردو',        flag: '🇵🇰', rtl: true  },
  { code: 'bn',  name: 'Bengali',    nativeName: 'বাংলা',       flag: '🇧🇩', rtl: false },
  { code: 'fil', name: 'Filipino',   nativeName: 'Filipino',   flag: '🇵🇭', rtl: false },
  { code: 'ne',  name: 'Nepali',     nativeName: 'नेपाली',      flag: '🇳🇵', rtl: false },
];

const resources = {
  en:  { translation: en  },
  ar:  { translation: ar  },
  hi:  { translation: hi  },
  ur:  { translation: ur  },
  bn:  { translation: bn  },
  fil: { translation: fil },
  ne:  { translation: ne  },
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const saved = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
      if (saved) { callback(saved); return; }
    } catch (e) {
      console.warn('i18n: could not read AsyncStorage', e);
    }
    // Fall back to device locale, map to supported code
    const deviceLng = Localization.getLocales()[0]?.languageCode ?? 'en';
    const supported = SUPPORTED_LANGUAGES.map(l => l.code);
    callback(supported.includes(deviceLng) ? deviceLng : 'en');
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lng);
    } catch (e) {
      console.warn('i18n: could not write AsyncStorage', e);
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
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;

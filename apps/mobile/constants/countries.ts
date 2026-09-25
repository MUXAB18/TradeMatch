export interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
  isLive?: boolean;
}

export const COUNTRIES: Country[] = [
  { name: 'Pakistan', dial_code: '+92', code: 'PK', flag: '🇵🇰', isLive: true },
  { name: 'Saudi Arabia', dial_code: '+966', code: 'SA', flag: '🇸🇦', isLive: true },
  { name: 'United Arab Emirates', dial_code: '+971', code: 'AE', flag: '🇦🇪', isLive: true },
  { name: 'Qatar', dial_code: '+974', code: 'QA', flag: '🇶🇦', isLive: true },
  { name: 'Kuwait', dial_code: '+965', code: 'KW', flag: '🇰🇼', isLive: true },
  { name: 'Oman', dial_code: '+968', code: 'OM', flag: '🇴🇲', isLive: true },
  { name: 'Bahrain', dial_code: '+973', code: 'BH', flag: '🇧🇭', isLive: true },
  { name: 'India', dial_code: '+91', code: 'IN', flag: '🇮🇳', isLive: true },
  { name: 'Bangladesh', dial_code: '+880', code: 'BD', flag: '🇧🇩', isLive: true },
  { name: 'Philippines', dial_code: '+63', code: 'PH', flag: '🇵🇭', isLive: true },
  { name: 'Nepal', dial_code: '+977', code: 'NP', flag: '🇳🇵', isLive: true },
  { name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸', isLive: true },
  { name: 'United Kingdom', dial_code: '+44', code: 'GB', flag: '🇬🇧', isLive: true },
  { name: 'Canada', dial_code: '+1', code: 'CA', flag: '🇨🇦', isLive: true },
  { name: 'Australia', dial_code: '+61', code: 'AU', flag: '🇦🇺', isLive: true },
];

export const POPULAR_COUNTRIES = ['AE', 'SA', 'QA', 'US', 'GB', 'CA', 'AU'];

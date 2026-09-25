/**
 * Design system constants
 * Per design.md Section 3 - Visual System
 */

import { useColorScheme } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';

export const LightColors = {
  // Primary
  primary: '#007AFF',
  secondary: '#AAAAAA',

  // Status
  success: '#007AFF',
  warning: '#AAAAAA',

  // Neutral
  background: '#F5F5F7',
  textPrimary: '#1D1D1F',
  textSecondary: '#AAAAAA',

  // Utility
  white: '#F5F5F7',
  error: '#1D1D1F',
  surface: '#FFFFFF',
  border: '#E5E5EA',
  textPlaceholder: '#AAAAAA',
  black: '#1D1D1F',
};

export const DarkColors = {
  // Primary
  primary: '#00E5FF', // Neon Cyan
  secondary: '#8E8E93',

  // Status
  success: '#39FF14', // Neon Green
  warning: '#FF9F0A',

  // Neutral
  background: '#000000',
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',

  // Utility
  white: '#1C1C1E', // inverted surface mapping
  error: '#FF453A',
  surface: '#1C1C1E',
  border: '#38383A',
  textPlaceholder: '#636366',
  black: '#F5F5F7', // inverted for contrasts
};

// Default for backwards compatibility if accessed outside hooks
export const Colors = LightColors;

export const Typography = {
  // Font sizes (minimum 16px per design.md)
  body: 16,
  bodySmall: 14,
  small: 14,
  header: 22,
  header2: 24,
  header3: 20,
  headerLarge: 26,
  headerSmall: 18,
  headerMedium: 20,

  // Line height
  lineHeight: 1.5,
};

export const Spacing = {
  // Base spacing unit: 8px (per design.md Section 3)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Minimum tap target
  minTapTarget: 44,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
  round: 9999,
};

export function useAppTheme() {
  let isDark = false;
  
  // Try to use our ThemeContext, but gracefully fallback to system if not inside Provider
  try {
    const context = useThemeContext();
    isDark = context.isDark;
  } catch (e) {
    const colorScheme = useColorScheme();
    isDark = colorScheme === 'dark';
  }
  
  const colors = isDark ? DarkColors : LightColors;
  
  return {
    colors,
    isDark,
  };
}

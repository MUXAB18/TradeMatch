import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

// Safely export the enums so they don't throw 'undefined' errors
export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle || {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy'
};

export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType || {
  Success: 'success',
  Warning: 'warning',
  Error: 'error'
};

export const impactAsync = async (style?: any) => {
  if (Platform.OS === 'web') return;
  return ExpoHaptics.impactAsync(style);
};

export const notificationAsync = async (type?: any) => {
  if (Platform.OS === 'web') return;
  return ExpoHaptics.notificationAsync(type);
};

export const selectionAsync = async () => {
  if (Platform.OS === 'web') return;
  return ExpoHaptics.selectionAsync();
};

// Also keep the simple helper functions that were previously defined
export const light = () => impactAsync(ImpactFeedbackStyle.Light);
export const medium = () => impactAsync(ImpactFeedbackStyle.Medium);
export const heavy = () => impactAsync(ImpactFeedbackStyle.Heavy);
export const success = () => notificationAsync(NotificationFeedbackType.Success);
export const warning = () => notificationAsync(NotificationFeedbackType.Warning);
export const error = () => notificationAsync(NotificationFeedbackType.Error);

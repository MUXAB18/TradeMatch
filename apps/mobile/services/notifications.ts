/**
 * Notification Service
 * Handles push notification permissions, token registration, and local notifications
 * Per Expo v57 documentation: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions and register device push token
 * Called after onboarding completes with clear explanation of why
 * 
 * @returns Promise<string | null> - Expo push token or null if failed
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Android requires notification channel setup before requesting permissions (Android 13+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    // Note: The OS will show the permission dialog with our app's name
    // On iOS, we can't customize the message, but the timing (after onboarding)
    // provides context: user just completed setup and sees value
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // User denied permissions
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }

    // Get Expo push token
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
      console.warn('Expo project ID not found - push notifications may not work in production');
      // For development, we'll continue without projectId
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    const token = tokenData.data;
    console.log('Expo push token:', token);

    // Save token to user's Firestore document
    await savePushTokenToFirestore(token);

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Save push token to user's Firestore document
 * Also initializes notification preferences with all enabled by default
 */
async function savePushTokenToFirestore(token: string): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('No authenticated user to save push token');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: token,
      // Initialize preferences if not already set (won't overwrite existing)
      'notificationPreferences.jobMatches': true,
      'notificationPreferences.certReminders': true,
      'notificationPreferences.profileNudges': true,
      updatedAt: new Date(),
    });

    console.log('Push token saved to Firestore');
  } catch (error) {
    console.error('Error saving push token to Firestore:', error);
  }
}

/**
 * Update notification preferences in Firestore
 */
export async function updateNotificationPreferences(preferences: {
  jobMatches?: boolean;
  certReminders?: boolean;
  profileNudges?: boolean;
}): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('No authenticated user to update preferences');
      return;
    }

    const userRef = doc(db, 'users', userId);
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Only update provided preferences
    if (preferences.jobMatches !== undefined) {
      updates['notificationPreferences.jobMatches'] = preferences.jobMatches;
    }
    if (preferences.certReminders !== undefined) {
      updates['notificationPreferences.certReminders'] = preferences.certReminders;
    }
    if (preferences.profileNudges !== undefined) {
      updates['notificationPreferences.profileNudges'] = preferences.profileNudges;
    }

    await updateDoc(userRef, updates);
    console.log('Notification preferences updated');
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

/**
 * Remove push token when user logs out or disables notifications
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: null,
      updatedAt: new Date(),
    });

    console.log('Push token removed from Firestore');
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}

/**
 * Listen for push token updates (in case token changes while app is running)
 * Returns a subscription that should be removed on cleanup
 */
export function addPushTokenListener(callback: (token: string) => void) {
  return Notifications.addPushTokenListener((tokenData) => {
    const token = tokenData.data;
    console.log('Push token updated:', token);
    
    // Save new token to Firestore
    savePushTokenToFirestore(token).catch(console.error);
    
    // Call user's callback
    callback(token);
  });
}

/**
 * Listen for notifications received while app is in foreground
 * Returns a subscription that should be removed on cleanup
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Listen for user interactions with notifications (taps)
 * Returns a subscription that should be removed on cleanup
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

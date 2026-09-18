import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { userProfileExists } from '../services/users';
import { useAppTheme } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (loading) return;

    const checkAuthAndNavigate = async () => {
      if (!user) {
        // Not authenticated
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        if (hasSeenOnboarding === 'true') {
          router.replace('/(auth)');
        } else {
          router.replace('/(auth)/onboarding');
        }
        return;
      }

      // Check if user has completed profile
      const hasProfile = await userProfileExists(user.uid);
      
      if (hasProfile) {
        // Profile exists - go to main app
        router.replace('/(tabs)/home');
      } else {
        // Authenticated but no profile - go to trade selection
        router.replace('/(auth)/trade');
      }
    };

    checkAuthAndNavigate();
  }, [user, loading]);

  // Return null or a blank view matching the background since the splash screen is visible
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} />
  );
}

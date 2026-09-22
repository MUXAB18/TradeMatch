import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { userProfileExists } from '../services/users';
import { useAppTheme } from '../constants/theme';

/**
 * index.tsx is only reached when:
 *  - The splash has finished AND
 *  - The user is already logged in (routed here by _layout.tsx)
 *
 * Onboarding routing for new users is handled in _layout.tsx
 * right when the splash animation completes.
 */
export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (loading || !user) return;

    const route = async () => {
      const hasProfile = await userProfileExists(user.uid);
      if (hasProfile) {
        router.replace('/(tabs)/home');
      } else {
        // Authenticated but profile not yet created
        router.replace('/(auth)/trade');
      }
    };

    route();
  }, [user, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} />
  );
}

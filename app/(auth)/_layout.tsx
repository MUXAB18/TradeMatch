import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export default function AuthLayout() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: reduceMotion ? 'none' : 'fade',
        animationDuration: 250,
      }} 
    />
  );
}

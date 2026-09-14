import { Tabs } from 'expo-router';
import { useAppTheme } from '../../constants/theme';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabLayout() {
  useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab. View dashboard and quick actions.',
        }}
      />
      <Tabs.Screen
        name="certifications"
        options={{
          title: 'Certs',
          tabBarAccessibilityLabel: 'Certifications tab. Manage your certifications.',
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarAccessibilityLabel: 'Jobs tab. View matched job opportunities.',
        }}
      />
      <Tabs.Screen
        name="prep"
        options={{
          title: 'Prep',
          tabBarAccessibilityLabel: 'Interview prep tab. Practice interview questions.',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab. Manage application settings.',
        }}
      />
    </Tabs>
  );
}

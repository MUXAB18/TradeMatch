import { Tabs } from 'expo-router';
import { useAppTheme } from '../../constants/theme';
import { CustomTabBar } from '../../components/CustomTabBar';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  useAppTheme();
  const { t } = useTranslation();

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
          title: t('tabs.home'),
          tabBarAccessibilityLabel: 'Home tab. View dashboard and quick actions.',
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t('tabs.jobs'),
          tabBarAccessibilityLabel: 'Jobs tab. View matched job opportunities.',
        }}
      />
      <Tabs.Screen
        name="prep"
        options={{
          title: t('tabs.prep'),
          tabBarAccessibilityLabel: 'Interview prep tab. Practice interview questions.',
        }}
      />
      <Tabs.Screen
        name="certifications"
        options={{
          title: t('tabs.certifications'),
          tabBarAccessibilityLabel: 'Certifications tab. Manage your certifications.',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarAccessibilityLabel: 'Settings tab. Manage application settings.',
        }}
      />
    </Tabs>
  );
}

'use client';

import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import SettingsSidebar, { SettingsSection } from '@/components/settings/SettingsSidebar';
import { 
  ProfileSettings, AccountSettings, NotificationSettings, 
  AppearanceSettings, LanguageSettings, PrivacySettings, 
  BillingSettings, DangerZone, HelpSettings
} from '@/components/settings/SettingsForms';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Bridge: old showToast(type, message) API → global toast system
  const showToast = (type: 'success' | 'error', text: string) => {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings showToast={showToast} />;
      case 'account':
        return <AccountSettings />;
      case 'security':
        return <SecuritySettings showToast={showToast} />;
      case 'notifications':
        return <NotificationSettings showToast={showToast} />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'help':
        return <HelpSettings />;
      case 'danger':
        return <DangerZone showToast={showToast} />;
      default:
        return <ProfileSettings showToast={showToast} />;
    }
  };

  return (
    // Outer shell: full height, no scroll — header is locked at top
    <div className="flex flex-col h-full overflow-hidden">


      {/* ── SCROLLABLE BODY — fills remaining height ── */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0">

        {/* Sidebar panel */}
        <div className="w-full lg:w-72 shrink-0 lg:h-full lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border">
          <div className="px-4 py-6">
            <SettingsSidebar
              activeSection={activeSection}
              onSelect={setActiveSection}
            />
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto">
          <div className="px-6 py-8 pb-24 lg:pb-10 max-w-3xl">
            {renderSection()}
          </div>
        </div>

      </div>
    </div>
  );
}

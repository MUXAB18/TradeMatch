import { 
  User, Shield, Bell, Palette, Globe, Lock, 
  CreditCard, HelpCircle, AlertTriangle 
} from 'lucide-react';

export type SettingsSection = 
  | 'profile' | 'account' | 'notifications' | 'appearance' 
  | 'language' | 'security' | 'privacy' | 'billing' 
  | 'help' | 'danger';

interface SidebarProps {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}
import { useTranslations } from 'next-intl';

export default function SettingsSidebar({ activeSection, onSelect }: SidebarProps) {
  const t = useTranslations('settings');
  const categories = [
    {
      title: 'General',
      items: [
        { id: 'profile', label: t('title_profile'), icon: <User size={18} />, desc: 'Personal information' },
        { id: 'account', label: t('title_account'), icon: <Shield size={18} />, desc: 'Account details' },
      ]
    },
    {
      title: 'Experience',
      items: [
        { id: 'notifications', label: t('title_notifications'), icon: <Bell size={18} />, desc: 'Email and push' },
        { id: 'appearance', label: t('title_appearance'), icon: <Palette size={18} />, desc: 'Theme preferences' },
        { id: 'language', label: t('title_language'), icon: <Globe size={18} />, desc: 'Locale settings' },
      ]
    },
    {
      title: 'Security & Privacy',
      items: [
        { id: 'security', label: 'Security', icon: <Lock size={18} />, desc: 'Passwords and 2FA' },
        { id: 'privacy', label: t('title_privacy'), icon: <Shield size={18} />, desc: 'Data and visibility' },
      ]
    },
    {
      title: 'Other',
      items: [
        { id: 'billing', label: t('title_billing'), icon: <CreditCard size={18} />, desc: 'Plans and payments' },
        { id: 'help', label: t('title_help'), icon: <HelpCircle size={18} />, desc: 'FAQ and contact' },
      ]
    },
    {
      title: t('title_danger'),
      items: [
        { id: 'danger', label: t('delete_account_title'), icon: <AlertTriangle size={18} />, desc: 'Permanent removal' },
      ]
    }
  ];

  return (
    <div className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Mobile view: Horizontal scrollable tabs (visible only on small screens) */}
      <div className="lg:hidden flex overflow-x-auto pb-2 -mx-5 px-5 snap-x hide-scrollbar">
        {categories.flatMap(cat => cat.items).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as SettingsSection)}
            className={`
              flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-[14px] font-bold snap-start me-2
              ${activeSection === item.id 
                ? 'bg-[#007AFF] text-white shadow-md' 
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop view: Vertical sidebar */}
      <div className="hidden lg:block space-y-8">
        {categories.map((category) => (
          <div key={category.title}>
            <h3 className="text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-3">
              {category.title}
            </h3>
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = activeSection === item.id;
                const isDanger = item.id === 'danger';
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id as SettingsSection)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-start
                      ${isActive 
                        ? (isDanger ? 'bg-red-50 text-red-600' : 'bg-[#F0F7FF] text-[#007AFF]') 
                        : 'hover:bg-background/80 text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    <div className={isActive ? (isDanger ? 'text-red-600' : 'text-[#007AFF]') : 'text-text-secondary'}>
                      {item.icon}
                    </div>
                    <div>
                      <div className={`text-[14px] font-bold ${isActive ? (isDanger ? 'text-red-600' : 'text-[#007AFF]') : 'text-text-primary'}`}>
                        {item.label}
                      </div>
                      <div className={`text-[12px] ${isActive ? (isDanger ? 'text-red-600/70' : 'text-[#007AFF]/70') : 'text-text-secondary'} line-clamp-1`}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

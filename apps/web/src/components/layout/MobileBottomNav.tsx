'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Briefcase, BookOpen, Settings, MessageSquare } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

const WORKER_TABS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/prep', label: 'Prep', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const AGENCY_TABS = [
  { href: '/agency/dashboard', label: 'Dashboard', icon: Home },
  { href: '/agency/candidates', label: 'Candidates', icon: User },
  { href: '/agency/shortlisted', label: 'Shortlist', icon: BookOpen },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { profile } = useUserProfile();
  
  const tabs = profile?.role === 'agency' ? AGENCY_TABS : WORKER_TABS;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border">
      <div className="flex flex-row justify-around items-center h-[68px] px-1 safe-area-bottom">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/home' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

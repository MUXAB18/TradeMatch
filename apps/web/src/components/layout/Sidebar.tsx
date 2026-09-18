'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, User, Briefcase, BookOpen, Settings, LogOut, Menu, X, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getInitials } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { profileKey } from '@/lib/utils';

const WORKER_NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/prep', label: 'Prep', icon: BookOpen },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: "Settings", icon: Settings },
];

const AGENCY_NAV = [
  { href: '/agency/dashboard', label: 'Dashboard', icon: Home },
  { href: '/agency/candidates', label: 'Candidates', icon: User },
  { href: '/agency/shortlisted', label: 'Shortlisted', icon: BookOpen },
  { href: '/agency/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.name || user?.displayName || 'User';
  const initials = getInitials(displayName);

  const [mockPhotoUrl, setMockPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(profileKey(user?.uid)) || '{}') : {};
    if (localData.photoUrl) {
      setMockPhotoUrl(localData.photoUrl);
    }
    
    const handleStorage = () => {
      const data = JSON.parse(localStorage.getItem(profileKey(user?.uid)) || '{}');
      setMockPhotoUrl(data.photoUrl || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border h-[68px] flex items-center px-6">
        {/* Logo */}
        <Link href="/home" className="flex items-center shrink-0 mr-8">
          <Image
            src="/logo-v3.png"
            alt="TradeMatch"
            width={220}
            height={54}
            className="h-11 w-auto object-contain"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Nav Items — center/left */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {(profile?.role === 'agency' ? AGENCY_NAV : WORKER_NAV).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isNotifications = item.href === '/notifications';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-150 text-[14px] font-semibold relative
                  ${isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-text-secondary hover:bg-black/6 hover:text-text-primary'
                  }
                `}
              >
                <div className="relative">
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-surface shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side — user avatar + sign out */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[14px] hover:opacity-90 transition-opacity overflow-hidden shrink-0"
            aria-label="Go to profile"
          >
            {mockPhotoUrl || user?.photoURL ? (
              <Image
                src={mockPhotoUrl || user?.photoURL || ''}
                alt={displayName}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              initials
            )}
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold text-text-primary">{displayName.split(' ')[0]}</span>
            <span className="text-[11px] text-text-secondary capitalize">
              {profile?.trade || 'Trades Worker'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-text-secondary hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
            aria-label="Sign out"
          >
            <LogOut size={15} strokeWidth={2} />
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 rounded-xl text-text-secondary hover:bg-black/5 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile Dropdown Menu ─────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed top-[68px] left-0 right-0 z-40 bg-surface border-b border-border shadow-lg"
          role="navigation"
        >
          <div className="px-4 py-3 space-y-1">
            {(profile?.role === 'agency' ? AGENCY_NAV : WORKER_NAV).map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/home' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-all
                    ${isActive
                      ? 'bg-primary text-white font-bold'
                      : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User info + sign out */}
          <div className="px-4 py-4 border-t border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[14px] shrink-0 overflow-hidden">
              {mockPhotoUrl || user?.photoURL ? (
                <Image
                  src={mockPhotoUrl || user?.photoURL || ''}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-text-primary truncate">{displayName}</p>
              <p className="text-[12px] text-text-secondary capitalize truncate">{profile?.trade || 'Trades Worker'}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-error bg-error/8 border border-error/20"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

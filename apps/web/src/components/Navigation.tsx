"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Award, BookOpen, User, Settings, Bell, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const DESKTOP_TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/certifications", label: "Certs", icon: Award },
  { href: "/prep", label: "Prep", icon: BookOpen },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/prep", label: "Prep", icon: BookOpen },
];

import { useNotifications } from '@/contexts/NotificationsContext';

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (pathname.startsWith("/login")) return null;

  return (
    <>
      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex fixed top-0 start-0 h-screen w-64 bg-surface border-e border-border z-50 flex-col pt-8 pb-8 px-4 shadow-sm">
        <div className="flex items-center px-4 mb-10">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-v3.png" 
              alt="TradeMatch Logo" 
              width={200} 
              height={56} 
              className="h-12 md:h-14 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {DESKTOP_TABS.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/home" && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            const isNotifications = tab.href === '/notifications';
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 font-semibold hover:text-text-primary"
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[15px]">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation (Fixed to bottom, no floating pill) */}
      <div className="md:hidden fixed bottom-0 start-0 end-0 z-50 bg-surface border-t border-border pb-safe">
        <div className="flex flex-row justify-around items-center h-[68px] px-2">
          {MOBILE_TABS.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/home" && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            const isNotifications = tab.href === '/notifications';

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${
                  isActive
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <div className="relative">
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1 -end-1.5 w-3.5 h-3.5 bg-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-surface">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Award, BookOpen } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Certifications", href: "/certifications", icon: Award },
    { name: "Prep", href: "/prep", icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe z-50">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

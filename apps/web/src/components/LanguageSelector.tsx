"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/routing';
import { useState, useRef, useEffect, useTransition } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LOCALES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'fil', label: 'Filipino', native: 'Filipino' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLocaleChange(newLocale: string) {
    setIsOpen(false);
    startTransition(() => {
      // Replace preserves the current pathname and query params, but changes the locale
      router.replace(
        pathname,
        { locale: newLocale }
      );
    });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold transition-all border
          ${isOpen ? 'bg-black/5 dark:bg-white/5 border-border' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}
          ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe size={16} strokeWidth={2} />
        <span className="hidden lg:inline-block">{currentLocale.native}</span>
        <span className="lg:hidden uppercase">{currentLocale.code}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full end-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg shadow-black/5 overflow-hidden z-50 py-1">
          <div className="px-3 py-2 border-b border-border bg-background/50">
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Select Language</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLocaleChange(l.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-start text-[14px] transition-colors
                  ${locale === l.code ? 'bg-primary/10 text-primary font-bold' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary font-medium'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[15px]">{l.native}</span>
                  <span className="text-[11px] text-text-tertiary">{l.label}</span>
                </div>
                {locale === l.code && <Check size={16} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

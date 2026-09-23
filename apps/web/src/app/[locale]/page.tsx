import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslations } from 'next-intl';
import GlobalFooter from '@/components/layout/GlobalFooter';

export default function LandingPage() {
  const t = useTranslations('landing');
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 md:px-12 py-4 md:py-6 flex justify-between items-center border-b border-border bg-surface">
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src="/logo-v3.png" 
            alt="TradeMatch Logo" 
            className="h-8 md:h-12 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5 md:gap-4">
          <LanguageSelector />
          <Link href="/login" className="px-2 md:px-6 py-2 md:py-2.5 font-bold text-text-primary hover:text-primary transition-colors text-sm md:text-base whitespace-nowrap">
            {t('login')}
          </Link>
          <Link href="/signup" className="px-4 md:px-6 py-2 md:py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-sm text-sm md:text-base whitespace-nowrap">
            {t('signup')}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 py-20">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
            {t('hero_title')} <span className="text-primary">{t('hero_highlight')}</span>
          </h1>

          <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
            {t('hero_desc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/signup" className="px-8 py-4 bg-primary text-white font-bold rounded-full text-lg hover:bg-primary/90 transition-colors shadow-[0_8px_24px_rgba(0,122,255,0.25)]">
              {t('get_started')}
            </Link>
          </div>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 text-start">
          <div className="bg-surface p-8 rounded-[24px] border border-border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">{t('feature1_title')}</h3>
            <p className="text-text-secondary leading-relaxed">
              {t('feature1_desc')}
            </p>
          </div>

          <div className="bg-surface p-8 rounded-[24px] border border-border shadow-sm">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 4L12 14.01l-3-3" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">{t('feature2_title')}</h3>
            <p className="text-text-secondary leading-relaxed">
              {t('feature2_desc')}
            </p>
          </div>

          <div className="bg-surface p-8 rounded-[24px] border border-border shadow-sm">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">{t('feature3_title')}</h3>
            <p className="text-text-secondary leading-relaxed">
              {t('feature3_desc')}
            </p>
          </div>
        </div>

        {/* Mobile Apps CTA - Premium Redesign */}
        <div className="mt-32 mb-12 max-w-5xl w-full mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[40px] blur-3xl opacity-50 transition-opacity group-hover:opacity-70"></div>
          
          <div className="relative bg-gradient-to-br from-[#0055FF] to-[#007AFF] text-white p-10 md:p-16 rounded-[40px] w-full flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl shadow-primary/20">
            {/* Decorative circles */}
            <div className="absolute -top-24 -end-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            
            {/* Left Content */}
            <div className="text-start w-full md:w-[55%] z-10 flex flex-col items-start">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold tracking-wide mb-6 text-white border border-white/20 shadow-sm">
                {t('coming_soon')}
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                {t('app_title1')} <br/>
                <span className="text-white/90">{t('app_title2')}</span>
              </h2>
              <p className="text-white/80 text-lg md:text-xl mb-10 font-medium leading-relaxed w-full">
                {t('app_desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button className="bg-black/90 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.55.03 2.87.68 3.65 1.83-3.13 1.94-2.6 6.04.53 7.28-.7 1.76-1.55 3.32-2.85 4.82zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-start flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 font-bold leading-none mb-1">{t('download_app_store')}</span>
                    <span className="font-bold text-sm leading-none">{t('app_store')}</span>
                  </div>
                </button>
                <button className="bg-black/90 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 3.25a.75.75 0 0 0-.25.5v16.5a.75.75 0 0 0 1.13.65l13.5-7.75a.75.75 0 0 0 0-1.3L4.88 4.1a.75.75 0 0 0-.88-.85z"/>
                  </svg>
                  <div className="text-start flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 font-bold leading-none mb-1">{t('get_on_google')}</span>
                    <span className="font-bold text-sm leading-none">{t('google_play')}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Content - Phone Mockup Graphic */}
            <div className="relative w-full md:w-[45%] h-64 md:h-80 flex items-center justify-center z-10 mt-10 md:mt-0">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-[32px] border border-white/20 shadow-2xl flex flex-col overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Phone Header */}
                <div className="h-14 border-b border-white/10 flex items-center px-6">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="ms-3 h-3 w-24 bg-white/20 rounded-full"></div>
                </div>
                {/* Phone Body */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="h-24 rounded-2xl bg-white/10 border border-white/10 p-4 flex flex-col justify-between">
                    <div className="h-3 w-1/3 bg-white/20 rounded-full"></div>
                    <div className="h-8 w-2/3 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-32 flex-1 rounded-2xl bg-white/10 border border-white/10"></div>
                    <div className="h-32 flex-1 rounded-2xl bg-white/10 border border-white/10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <GlobalFooter />
    </div>
  );
}

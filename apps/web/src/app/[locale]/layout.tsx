import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans, Noto_Nastaliq_Urdu, Noto_Kufi_Arabic, Noto_Sans_Devanagari, Noto_Sans_Bengali } from 'next/font/google';
import '../globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const plusJakartaSans = Plus_Jakarta_Sans({ variable: '--font-sans', subsets: ['latin'] });
const notoSans = Noto_Sans({ variable: '--font-sans', subsets: ['latin'] });
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({ variable: '--font-sans', subsets: ['arabic'], weight: ['400', '700'] });
const notoKufiArabic = Noto_Kufi_Arabic({ variable: '--font-sans', subsets: ['arabic'] });
const notoSansDevanagari = Noto_Sans_Devanagari({ variable: '--font-sans', subsets: ['devanagari'] });
const notoSansBengali = Noto_Sans_Bengali({ variable: '--font-sans', subsets: ['bengali'] });

function getFontClassForLocale(locale: string) {
  switch (locale) {
    case 'ur': return notoNastaliqUrdu.variable;
    case 'ar': return notoKufiArabic.variable;
    case 'hi': 
    case 'ne': return notoSansDevanagari.variable;
    case 'bn': return notoSansBengali.variable;
    case 'fil': return notoSans.variable;
    case 'en': 
    default: return plusJakartaSans.variable;
  }
}

export const metadata: Metadata = {
  title: {
    template: '%s | TradeMatch',
    default: 'TradeMatch - The Job Copilot for Skilled Trades',
  },
  description: 'TradeMatch helps skilled trades workers build professional CVs, track required certifications, and match with pre-qualified jobs.',
  icons: {
    icon: [
      { url: '/favicon_cropped.png', sizes: 'any', type: 'image/png' },
    ],
    apple: '/favicon_cropped.png',
    shortcut: '/favicon_cropped.png',
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = 'ltr'; // User requested to disable RTL direction flipping
  const fontVar = getFontClassForLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fontVar} antialiased min-h-screen bg-background text-text-primary font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

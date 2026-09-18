import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

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
  openGraph: {
    title: 'TradeMatch - The Job Copilot for Skilled Trades',
    description: 'Build your profile, track your certifications, and find the right job in your trade.',
    url: 'https://tradematch.example.com',
    siteName: 'TradeMatch',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/browser.png',
        width: 1200,
        height: 630,
        alt: 'TradeMatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeMatch - The Job Copilot for Skilled Trades',
    description: 'Build your profile, track your certifications, and find the right job in your trade.',
    images: ['/browser.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} antialiased min-h-screen bg-background text-text-primary font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

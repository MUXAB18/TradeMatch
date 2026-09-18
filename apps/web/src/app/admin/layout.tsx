import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — TradeMatch',
  description: 'TradeMatch internal admin dashboard',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans">
      {children}
    </div>
  );
}

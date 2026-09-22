import React from 'react';
import Link from 'next/link';

export default function GlobalFooter() {
  return (
    <footer className="w-full border-t border-border py-6 px-6 mt-auto bg-background/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
        <div className="flex items-center gap-3">
          <img src="/logo-v2.png" alt="TradeMatch Logo" className="w-8 h-8 object-contain opacity-60 grayscale hover:grayscale-0 transition-all" />
          <span>&copy; {new Date().getFullYear()} TradeMatch. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 font-medium">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact &amp; Support</Link>
        </div>
      </div>
    </footer>
  );
}

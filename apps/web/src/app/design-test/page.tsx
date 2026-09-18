'use client';

import { useState } from 'react';

export default function DesignTestPage() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen`}>
      <div className="bg-background text-text-primary p-xl min-h-screen font-sans transition-colors duration-200">
        <div className="max-w-2xl mx-auto space-y-xl">
          <header className="flex justify-between items-center">
            <h1 className="text-header-large font-bold">Design System Test</h1>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="bg-surface border border-border px-md py-sm rounded-md"
            >
              Toggle {isDark ? 'Light' : 'Dark'} Mode
            </button>
          </header>

          <section className="space-y-md">
            <h2 className="text-header font-semibold">Typography (Plus Jakarta Sans)</h2>
            <div className="space-y-sm bg-surface p-lg rounded-lg border border-border">
              <p className="text-body">Body: The quick brown fox jumps over the lazy dog. (16px base)</p>
              <p className="text-small text-text-secondary">Small: The quick brown fox jumps over the lazy dog. (14px)</p>
              <p className="text-placeholder">Placeholder text looks like this.</p>
            </div>
          </section>

          <section className="space-y-md">
            <h2 className="text-header font-semibold">Colors</h2>
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-primary text-white p-md rounded-md flex items-center justify-center font-medium">Primary</div>
              <div className="bg-secondary text-white p-md rounded-md flex items-center justify-center font-medium">Secondary</div>
              <div className="bg-success text-black p-md rounded-md flex items-center justify-center font-medium">Success</div>
              <div className="bg-warning text-white p-md rounded-md flex items-center justify-center font-medium">Warning / Error</div>
            </div>
          </section>

          <section className="space-y-md">
            <h2 className="text-header font-semibold">Interactive Elements (Tap Targets)</h2>
            <div className="space-y-md bg-surface p-lg rounded-lg border border-border">
              <p className="text-body text-text-secondary">The button below should be at least 44px on mobile and 32px on desktop.</p>
              <button className="bg-primary text-white min-h-[var(--spacing-tap)] px-lg rounded-md font-medium">
                Primary Action Button
              </button>
            </div>
          </section>

          <section className="space-y-md">
            <h2 className="text-header font-semibold">Spacing Scale</h2>
            <div className="space-y-sm">
              <div className="bg-primary h-xs w-full rounded-full"></div>
              <p className="text-small text-text-secondary">xs (4px)</p>
              
              <div className="bg-primary h-sm w-full rounded-full"></div>
              <p className="text-small text-text-secondary">sm (8px)</p>
              
              <div className="bg-primary h-md w-full rounded-full"></div>
              <p className="text-small text-text-secondary">md (16px)</p>
              
              <div className="bg-primary h-lg w-full rounded-full"></div>
              <p className="text-small text-text-secondary">lg (24px)</p>
              
              <div className="bg-primary h-xl w-full rounded-full"></div>
              <p className="text-small text-text-secondary">xl (32px)</p>
              
              <div className="bg-primary h-xxl w-full rounded-full"></div>
              <p className="text-small text-text-secondary">xxl (48px)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

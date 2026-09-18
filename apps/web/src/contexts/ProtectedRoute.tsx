'use client';

import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not logged in and not on login page, render nothing until redirect happens
  if (!user && !pathname.startsWith('/login')) {
    return null;
  }

  return <>{children}</>;
}

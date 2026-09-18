import Sidebar from '@/components/layout/Sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ProtectedRoute } from '@/contexts/ProtectedRoute';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NotificationsProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-background">
          {/* Fixed top nav bar (68px tall) */}
          <Sidebar />

          {/* Main content — padded below top nav; bottom padding for mobile bottom nav */}
          <main className="flex-1 flex flex-col overflow-y-auto pt-[68px] pb-[68px] md:pb-0">
            {children}
          </main>

          {/* Fixed bottom nav on mobile only */}
          <MobileBottomNav />
        </div>
      </NotificationsProvider>
    </ProtectedRoute>
  );
}

import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/contexts/ProtectedRoute';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import GlobalPopup from '@/components/GlobalPopup';
import MaintenanceGuard from '@/components/layout/MaintenanceGuard';
import GlobalFooter from '@/components/layout/GlobalFooter';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NotificationsProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-background">
          <MaintenanceGuard>
            {/* Fixed top nav bar (68px tall) */}
            <Sidebar />

            {/* Main content — padded below top nav */}
            <main className="flex-1 flex flex-col overflow-y-auto pt-[68px]">
              <div className="flex-1 shrink-0">
                {children}
              </div>
              <GlobalFooter />
            </main>

            <GlobalPopup />
          </MaintenanceGuard>
        </div>
      </NotificationsProvider>
    </ProtectedRoute>
  );
}

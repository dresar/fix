import { useState, useEffect, Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Toaster } from '@/components/ui/toaster';
import { AIAssistant } from './AIAssistant';
import { useAdminPrefetch } from '../hooks/useAdminPrefetch';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAdminAuthStore();
  const location = useLocation();

  // Trigger prefetching when authenticated
  const { isLoading: isPrefetching, progress } = useAdminPrefetch();

  // Redirect if not authenticated
  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-y-0 left-0 z-50 h-full">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200 md:pl-64">
        <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Suspense fallback={
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <AIAssistant />
      <Toaster />
    </div>
  );
}

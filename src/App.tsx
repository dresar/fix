import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeApplicator } from "@/components/effects/ThemeApplicator";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { Preloader } from "@/components/ui/Preloader";
import { dataManager } from "@/services/dataManager";
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// Public Pages
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const LoginPage = lazy(() => import("./admin/pages/LoginPage"));
const DashboardPage = lazy(() => import("./admin/pages/DashboardPage"));
const MessagesPage = lazy(() => import("./admin/pages/MessagesPage"));
const SettingsPage = lazy(() => import("./admin/pages/SettingsPage"));
const AboutContentPage = lazy(() => import("./admin/pages/AboutContentPage"));
// const ExperiencePage = lazy(() => import("./admin/pages/ExperiencePage")); // DELETED
const AISettingsPage = lazy(() => import("./admin/pages/AISettingsPage"));

// New Admin Pages
const ProjectList = lazy(() => import("./admin/pages/projects/ProjectList"));
const ProjectForm = lazy(() => import("./admin/pages/projects/ProjectForm"));
const SkillList = lazy(() => import("./admin/pages/skills/SkillList"));
const EducationList = lazy(() => import("./admin/pages/education/EducationList"));
const EducationForm = lazy(() => import("./admin/pages/education/EducationForm"));
const CertificateList = lazy(() => import("./admin/pages/certificates/CertificateList"));
const CertificateForm = lazy(() => import("./admin/pages/certificates/CertificateForm"));
const WATemplateList = lazy(() => import("./admin/pages/communication/WATemplateList"));
const ExperienceList = lazy(() => import("./admin/pages/experience/ExperienceList"));
const ExperienceForm = lazy(() => import("./admin/pages/experience/ExperienceForm"));
const BlogListAdmin = lazy(() => import("./admin/pages/blog/BlogList"));
const BlogFormAdmin = lazy(() => import("./admin/pages/blog/BlogForm"));
const CommentList = lazy(() => import("./admin/pages/blog/CommentList"));

import { AdminLayout } from "./admin/components/AdminLayout";

// Configure Query Client with Persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // In development, data is always stale (0). In production, it stays fresh (Infinity).
      staleTime: import.meta.env.DEV ? 0 : Infinity, 
      gcTime: 24 * 60 * 60 * 1000, // Keep in memory for 24 hours
      refetchOnWindowFocus: import.meta.env.DEV, // Refetch on focus in dev
      refetchOnMount: import.meta.env.DEV, // Refetch on mount in dev
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have cached data for critical endpoints
    const checkCache = () => {
      // Check for React Query cache or legacy DataManager cache
      const hasLegacyCache = Object.keys(localStorage).some(key => key.startsWith('portfolio_cache_'));
      const hasQueryCache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
      
      if (hasLegacyCache || hasQueryCache) {
        // Fast load for returning visitors
        setIsLoading(false);
      } else {
        // Immediate load for first-time visitors (removed artificial delay)
        setIsLoading(false);
      }
    };

    checkCache();
  }, []);

  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister }}
    >
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeApplicator />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {/* Preloader removed to prevent blocking UI on slow connections */}
          {/* {isLoading && <Preloader />} */}

          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ErrorBoundary>
              <Suspense fallback={null}> {/* Fallback handled by Preloader initially */}
                <Routes>
                  {/* Admin Routes (Outside Maintenance Guard) */}
                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    
                    {/* Projects */}
                    <Route path="projects" element={<ProjectList />} />
                    <Route path="projects/new" element={<ProjectForm />} />
                    <Route path="projects/edit/:id" element={<ProjectForm />} />

                    {/* Skills */}
                    <Route path="skills" element={<SkillList />} />

                    {/* Education */}
                    <Route path="education" element={<EducationList />} />
                    <Route path="education/new" element={<EducationForm />} />
                    <Route path="education/:id" element={<EducationForm />} />

                    {/* Certificates */}
                    <Route path="certificates" element={<CertificateList />} />
                    <Route path="certificates/new" element={<CertificateForm />} />
                    <Route path="certificates/edit/:id" element={<CertificateForm />} />

                    {/* Communication */}
                    <Route path="communication/wa" element={<WATemplateList />} />

                    {/* Blog */}
                    <Route path="blog" element={<BlogListAdmin />} />
                    <Route path="blog/new" element={<BlogFormAdmin />} />
                    <Route path="blog/edit/:id" element={<BlogFormAdmin />} />
                    <Route path="blog/comments" element={<CommentList />} />
                    
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="about-content" element={<AboutContentPage />} />
                    <Route path="experience" element={<ExperienceList />} />
                    <Route path="experience/new" element={<ExperienceForm />} />
                    <Route path="experience/edit/:id" element={<ExperienceForm />} />
                    <Route path="ai-settings" element={<AISettingsPage />} />

                    {/* Add more admin routes here */}
                  </Route>

                  {/* Public Routes (Inside Maintenance Guard) */}
                  <Route path="/*" element={
                    <MaintenanceGuard>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/blog" element={<BlogList />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/project/:id" element={<ProjectDetail />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      {/* Global Floating Elements */}
                      <FloatingWhatsApp />
                      <ScrollToTop />
                    </MaintenanceGuard>
                  } />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
};

export default App;

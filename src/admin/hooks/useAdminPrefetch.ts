import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function useAdminPrefetch() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const prefetchData = async () => {
      setIsLoading(true);
      setProgress(0);
      console.log('🚀 Prefetching admin data...');
      
      const queries = [
        // Content
        { key: ['home-content'], fn: api.content.home.get },
        { key: ['about-content'], fn: api.content.about.get },
        { key: ['settings'], fn: api.content.settings.get },
        
        // Resume
        { key: ['skills'], fn: api.skills.getAll },
        { key: ['skill-categories'], fn: api.skillCategories.getAll },
        { key: ['education'], fn: api.education.getAll },
        { key: ['experience'], fn: api.experience.getAll },
        { key: ['certificates'], fn: api.certificates.getAll },
        { key: ['certificate-categories'], fn: api.certificateCategories.getAll },
        
        // Projects
        { key: ['projects'], fn: () => api.projects.getAll() },
        { key: ['project-categories'], fn: api.projectCategories.getAll },
        
        // Blog
        { key: ['blog-posts'], fn: () => api.blog.posts.getAll() },
        { key: ['blog-categories'], fn: api.blog.categories.getAll },
        
        // Communication
        { key: ['messages'], fn: api.messages.getAll },
        { key: ['wa-templates'], fn: api.waTemplates.getAll },
        { key: ['social-links'], fn: api.socialLinks.getAll },
        
        // Dashboard Stats
        { key: ['dashboard-stats'], fn: api.dashboard.getStats },
      ];

      let completed = 0;
      const total = queries.length;

      const updateProgress = () => {
        completed++;
        setProgress(Math.round((completed / total) * 100));
      };

      // Execute all prefetches in parallel but track individual completion
      await Promise.all(
        queries.map(({ key, fn }) => 
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn: fn,
            staleTime: Infinity,
          }).finally(updateProgress)
        )
      );
      
      console.log('✅ Admin data prefetching complete');
      setIsLoading(false);
    };

    prefetchData();
  }, [queryClient, isAuthenticated]);

  return { isLoading, progress };
}

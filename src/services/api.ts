import { apiCall } from './apiClient';
import { dataManager } from './dataManager';

export { apiCall }; // Re-export if needed elsewhere

// Auth API
export const authAPI = {
  login: (data: any) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => apiCall('/auth/me'),
  updateMe: (data: any) => apiCall('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Profile API
export const profileAPI = {
  get: async () => {
    const data = await dataManager.fetchWithCache('/profile');
    // Handle array response from generic CRUD
    return Array.isArray(data) ? data[0] || {} : data;
  },
  update: async (data: any) => {
    // We need to know the ID to update. Assuming ID 1 for singleton profile if not provided
    // But generic API update requires ID in URL usually: /resource/id
    // Let's check if we have an ID in the data or fetch it first.
    // Ideally, frontend should pass ID.
    // For now, let's try to get existing one to find ID.
    const existing = await dataManager.fetchWithCache('/profile');
    const id = Array.isArray(existing) && existing[0] ? existing[0].id : 1;
    
    const result = await apiCall(`/profile/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/profile');
    return result;
  }
};

// Projects API
export const projectsAPI = {
  getAll: async () => dataManager.fetchWithCache('/projects'),
  getById: (id: number) => dataManager.fetchWithCache(`/projects/${id}`),
  create: async (data: any) => {
    const result = await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/projects');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/projects');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/projects/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/projects');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/projects/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/projects');
    return result;
  }
};

// Project Categories API
export const projectCategoriesAPI = {
  getAll: async () => dataManager.fetchWithCache('/projects/categories'),
  create: async (data: any) => {
    const result = await apiCall('/projects/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    dataManager.invalidate('/projects/categories');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/projects/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    dataManager.invalidate('/projects/categories');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/projects/categories/${id}`, {
      method: 'DELETE',
    });
    dataManager.invalidate('/projects/categories');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/projects/categories/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/projects/categories');
    return result;
  }
};

// Experience API
export const experienceAPI = {
  getAll: async () => dataManager.fetchWithCache('/experience'),
  create: async (data: any) => {
    const result = await apiCall('/experience', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/experience');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/experience/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/experience');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/experience/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/experience');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/experience/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/experience');
    return result;
  }
};

// Skills API
export const skillsAPI = {
  getAll: async () => dataManager.fetchWithCache('/skills'),
  create: async (data: any) => {
    const result = await apiCall('/skills', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/skills');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/skills');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/skills/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/skills');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/skills/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/skills');
    return result;
  }
};

// Skill Categories API
export const skillCategoriesAPI = {
  getAll: async () => dataManager.fetchWithCache('/skill-categories'),
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/skill-categories/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/skill-categories');
    return result;
  }
};

// Certificate Categories API
export const certificateCategoriesAPI = {
  getAll: async () => dataManager.fetchWithCache('/certificate-categories'),
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/certificate-categories/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/certificate-categories');
    return result;
  }
};

// Education API
export const educationAPI = {
  getAll: async () => dataManager.fetchWithCache('/education'),
  create: async (data: any) => {
    const result = await apiCall('/education', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/education');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/education/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/education');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/education/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/education');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/education/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/education');
    return result;
  }
};

// Certificates API
export const certificatesAPI = {
  getAll: async () => dataManager.fetchWithCache('/certificates'),
  create: async (data: any) => {
    const result = await apiCall('/certificates', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/certificates');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/certificates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/certificates');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/certificates/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/certificates');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/certificates/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/certificates');
    return result;
  }
};

// Social Links API
export const socialLinksAPI = {
  getAll: async () => dataManager.fetchWithCache('/social-links'),
};

// Messages API (Public POST only)
export const messagesAPI = {
  create: (data: any) => apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAll: async () => dataManager.fetchWithCache('/messages'), // Added getAll
  delete: async (id: number) => {
    const result = await apiCall(`/messages/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/messages');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/messages/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/messages');
    return result;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => dataManager.fetchWithCache('/admin/dashboard-stats'),
};

// Site Settings API
export const siteSettingsAPI = {
  get: async () => {
      const data = await dataManager.fetchWithCache('/settings');
      return Array.isArray(data) ? data[0] || {} : data;
  },
  createOrUpdate: async (data: any) => {
      // Check if settings exist to decide between POST and PUT
      const existing = await dataManager.fetchWithCache('/settings');
      const id = Array.isArray(existing) && existing[0] ? existing[0].id : null;

      if (id) {
          return apiCall(`/settings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
      } else {
          return apiCall('/settings', {
            method: 'POST',
            body: JSON.stringify(data),
          });
      }
  },
};

// WA Templates API (Public GET)
export const waTemplatesAPI = {
  getAll: async () => dataManager.fetchWithCache('/wa-templates'),
  create: async (data: any) => {
    const result = await apiCall('/wa-templates', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/wa-templates');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/wa-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/wa-templates');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/wa-templates/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/wa-templates');
    return result;
  }
};

// Health check
export const healthAPI = {
  check: () => apiCall('/health'), // Health check should not be cached
};

// Blog Categories API
export const blogCategoriesAPI = {
  getAll: async () => dataManager.fetchWithCache('/blog-categories'),
  create: async (data: any) => {
    const result = await apiCall('/blog-categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/blog-categories');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/blog-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/blog-categories');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/blog-categories/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/blog-categories');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/blog-categories/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/blog-categories');
    return result;
  }
};

// Blog Posts API
export const blogPostsAPI = {
  getAll: async () => dataManager.fetchWithCache('/blog-posts'),
  getOne: async (slug: string) => dataManager.fetchWithCache(`/blog-posts/by_slug?slug=${slug}`),
  // Explicitly ensuring getById is available and cache invalidated
  getById: async (id: number) => dataManager.fetchWithCache(`/blog-posts/${id}`),
  create: async (data: any) => {
    const result = await apiCall('/blog-posts', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/blog-posts');
    return result;
  },
  update: async (id: number, data: any) => {
    const result = await apiCall(`/blog-posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    dataManager.invalidate('/blog-posts');
    return result;
  },
  delete: async (id: number) => {
    const result = await apiCall(`/blog-posts/${id}`, {
        method: 'DELETE',
    });
    dataManager.invalidate('/blog-posts');
    return result;
  },
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/blog-posts/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
    });
    dataManager.invalidate('/blog-posts');
    return result;
  },
  getComments: async (id: number) => {
      // Don't cache comments too aggressively or at all if real-time is needed
      // But let's cache for a bit
      return apiCall(`/blog-posts/${id}?action=comments`); 
  },
  addComment: async (id: number, data: any) => {
      const result = await apiCall(`/blog-posts/${id}?action=comments`, {
          method: 'POST',
          body: JSON.stringify(data)
      });
      // Invalidate comments cache for this post if we were caching it
      // dataManager.invalidate(`/blog-posts/${id}/comments`);
      return result;
  },
  like: async (id: number, count = 1) => {
      return apiCall(`/blog-posts/${id}?action=like`, {
          method: 'POST',
          body: JSON.stringify({ count })
      });
  },
  view: async (id: number) => {
      return apiCall(`/blog-posts/${id}?action=view`, {
          method: 'POST'
      });
  }
};

// Home Content API
export const homeContentAPI = {
  get: async () => {
      const data = await dataManager.fetchWithCache('/home-content');
      return Array.isArray(data) ? data[0] || {} : data;
  },
};

// About Content API
export const aboutContentAPI = {
  get: async () => {
      const data = await dataManager.fetchWithCache('/about-content');
      return Array.isArray(data) ? data[0] || {} : data;
  },
};

// AI API
export const aiAPI = {
    fetchModels: (data: any) => apiCall('/ai/models', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    generateContent: (data: any) => apiCall('/ai?action=generate', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    analyzeGithub: (url: string) => apiCall('/ai?action=analyze-github', {
        method: 'POST',
        body: JSON.stringify({ url })
    })
};

// Content API wrapper (for backward compatibility if needed)
export const contentAPI = {
  home: homeContentAPI,
  about: aboutContentAPI,
  settings: siteSettingsAPI
};

// Blog API wrapper
export const blogAPI = {
  posts: blogPostsAPI,
  categories: blogCategoriesAPI
};

// Aggregate API export
export const api = {
    auth: authAPI,
    profile: profileAPI,
    projects: projectsAPI,
    projectCategories: projectCategoriesAPI,
    experience: experienceAPI,
    skills: skillsAPI,
    skillCategories: skillCategoriesAPI,
    certificateCategories: certificateCategoriesAPI,
    education: educationAPI,
    certificates: certificatesAPI,
    socialLinks: socialLinksAPI,
    messages: messagesAPI,
    siteSettings: siteSettingsAPI,
    waTemplates: waTemplatesAPI,
    health: healthAPI,
    blog: blogAPI, // Using nested structure
    blogCategories: blogCategoriesAPI, // Direct access
    blogPosts: blogPostsAPI, // Direct access
    blogComments: {
        getAll: async () => dataManager.fetchWithCache('/blog-comments'),
        create: async (data: any) => {
            const result = await apiCall('/blog-comments', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            dataManager.invalidate('/blog-comments');
            return result;
        },
        delete: async (id: number) => {
            const result = await apiCall(`/blog-comments/${id}`, {
                method: 'DELETE',
            });
            dataManager.invalidate('/blog-comments');
            return result;
        }
    },
    content: contentAPI, // Using nested structure
    homeContent: homeContentAPI, // Direct access
    aboutContent: aboutContentAPI, // Direct access
    ai: aiAPI,
    dashboard: dashboardAPI
};

import { useQuery } from '@tanstack/react-query';
import { blogPostsAPI, blogCategoriesAPI } from '@/services/api';
import { useMemo } from 'react';

export function useBlogPosts() {
  const postsQuery = useQuery({
    queryKey: ['blog-posts'],
    queryFn: blogPostsAPI.getAll,
  });

  const posts = useMemo(() => {
    const data = postsQuery.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [postsQuery.data]);

  return {
    posts,
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    error: postsQuery.error,
  };
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogPostsAPI.getOne(slug),
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  const categoriesQuery = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogCategoriesAPI.getAll,
  });

  const categories = useMemo(() => {
    const data = categoriesQuery.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [categoriesQuery.data]);

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
  };
}

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { normalizeMediaUrl } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, User, Search, ArrowRight, AlertCircle, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BlogList = () => {
  const { t } = useTranslation();
  const { posts, isLoading, isError, error } = useBlogPosts();
  const { categories: allCategories } = useBlogCategories();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, a-z, z-a
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;

  const publishedPosts = useMemo(() => {
    return posts.filter((post: any) => post.is_published);
  }, [posts]);

  // Merge extracted categories from posts with allCategories from API to ensure coverage
  const categories = useMemo(() => {
    const postCategories = new Set(publishedPosts.map((p: any) => p.category?.name).filter(Boolean));
    const apiCategories = new Set(allCategories.map((c: any) => c.name));
    
    // Combine sets
    const combined = new Set([...postCategories, ...apiCategories]);
    return ['All', ...Array.from(combined).sort()];
  }, [publishedPosts, allCategories]);

  const filteredPosts = useMemo(() => {
    let result = publishedPosts.filter((post: any) => {
      const matchesSearch = (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sorting
    result.sort((a: any, b: any) => {
      if (sortOrder === 'newest') {
        return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime();
      } else if (sortOrder === 'a-z') {
        return a.title.localeCompare(b.title);
      } else if (sortOrder === 'z-a') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [publishedPosts, searchQuery, selectedCategory, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOrder]);

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
            >
              {t('blog.title')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              {t('blog.description')}
            </motion.p>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 max-w-6xl mx-auto">
             <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('blog.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters Group */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Category Select */}
                    <div className="w-full sm:w-[200px]">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder={t('blog.category_label')} />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === 'All' ? t('common.all') : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Select */}
                    <div className="w-full sm:w-[200px]">
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger>
                           <div className="flex items-center gap-2">
                            {sortOrder === 'newest' || sortOrder === 'oldest' ? (
                                <SortDesc className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <SortAsc className="w-4 h-4 text-muted-foreground" />
                            )}
                            <SelectValue placeholder={t('blog.sort_label')} />
                           </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">{t('blog.sort.newest')}</SelectItem>
                          <SelectItem value="oldest">{t('blog.sort.oldest')}</SelectItem>
                          <SelectItem value="a-z">{t('blog.sort.az')}</SelectItem>
                          <SelectItem value="z-a">{t('blog.sort.za')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
             </div>

             {/* Active Filters Display */}
             {(selectedCategory !== 'All' || searchQuery) && (
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <span>{t('blog.active_filter')}</span>
                    {selectedCategory !== 'All' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {t('blog.category_label')}: {selectedCategory}
                            <button onClick={() => setSelectedCategory('All')} className="ml-1 hover:text-foreground">×</button>
                        </Badge>
                    )}
                    {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {t('blog.search_label')} "{searchQuery}"
                            <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-foreground">×</button>
                        </Badge>
                    )}
                    <Button variant="link" size="sm" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="text-xs h-auto p-0">
                        {t('blog.reset_filter')}
                    </Button>
                </div>
             )}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('blog.error_title')}</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {t('blog.error_description')}
                {error instanceof Error ? ` (${error.message})` : ''}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                {t('common.retry')}
              </Button>
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
              {currentPosts.map((post: any, index: number) => (
                <div key={post.id} className="relative group">
                  <Link to={`/blog/${post.slug}`} className="block h-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={normalizeMediaUrl(post.coverImage || post.coverImageFile || post.cover_image || post.thumbnail || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&q=80')} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {post.category?.name || t('blog.general')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.author?.username || 'Admin'}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center text-sm text-primary font-medium mt-auto">
                          {t('blog.read_more')} <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t('common.previous')}
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">{t('blog.no_posts')}</p>
              {(searchQuery || selectedCategory !== 'All') && (
                  <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-2">
                      {t('blog.clear_filter')}
                  </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
};

export default BlogList;
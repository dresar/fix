import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlogPostBySlug } from '@/hooks/useBlog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { normalizeMediaUrl, formatCompactNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Calendar, User, ArrowLeft, Share2, Heart, Eye, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Helmet } from 'react-helmet-async';
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

const BlogDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  
  const { data: post, isLoading, isError } = useBlogPostBySlug(slug || '');
  
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments Query
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['blog-comments', post?.id],
    queryFn: () => api.blogPosts.getComments(post.id),
    enabled: !!post?.id,
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (variables: { id: number, count: number }) => api.blogPosts.like(variables.id, variables.count),
    onSuccess: (data) => {
      queryClient.setQueryData(['blog-post', slug], (old: any) => ({
        ...old,
        likes: data.likes
      }));
    }
  });

  // View Mutation
  const viewMutation = useMutation({
    mutationFn: (id: number) => api.blogPosts.view(id),
    onSuccess: (data) => {
        // Update view count in cache silently
        queryClient.setQueryData(['blog-post', slug], (old: any) => ({
            ...old,
            views: data.views
        }));
    }
  });

  // Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (data: any) => api.blogPosts.addComment(post.id, data),
    onSuccess: (newComment) => {
      // Optimistic Update: Manually add new comment to cache
      queryClient.setQueryData(['blog-comments', post?.id], (old: any) => {
          return [newComment, ...(Array.isArray(old) ? old : [])];
      });
      
      // Update comment count in post detail cache
      queryClient.setQueryData(['blog-post', slug], (old: any) => ({
          ...old,
          comments_count: (old?.comments_count || 0) + 1
      }));

      queryClient.invalidateQueries({ queryKey: ['blog-comments', post?.id] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', slug] }); 
      
      setCommentContent('');
      setCommentName('');
      setCommentEmail('');
      toast.success('Komentar berhasil dikirim!');
    },
    onError: () => {
      toast.error('Gagal mengirim komentar. Silakan coba lagi.');
    }
  });

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Trigger View Count
  useEffect(() => {
    if (post?.id) {
        // Simple debounce check or just run once per mount
        const viewedKey = `viewed_post_${post.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
            viewMutation.mutate(post.id);
            sessionStorage.setItem(viewedKey, 'true');
        }
    }
  }, [post?.id]);

  const [pendingLikes, setPendingLikes] = useState(0);
  const [lastLikeTime, setLastLikeTime] = useState(0);

  // Debounced Like Logic
  useEffect(() => {
    if (pendingLikes === 0) return;

    const timeout = setTimeout(() => {
        if (post?.id) {
            likeMutation.mutate({ id: post.id, count: pendingLikes });
            setPendingLikes(0);
        }
    }, 2000); // Wait 2 seconds of inactivity before sending

    return () => clearTimeout(timeout);
  }, [pendingLikes, post?.id]);

  const handleLike = () => {
    if (post?.id) {
        // Optimistic UI Update immediately
        queryClient.setQueryData(['blog-post', slug], (old: any) => ({
            ...old,
            likes: (old?.likes || 0) + 1
        }));
        
        setPendingLikes(prev => prev + 1);
        setLastLikeTime(Date.now());
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentContent) {
        toast.error('Nama dan komentar wajib diisi');
        return;
    }
    
    setIsSubmitting(true);
    commentMutation.mutate({
        name: commentName,
        email: commentEmail,
        content: commentContent,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(commentName)}&background=random` // CDN Avatar
    }, {
        onSettled: () => setIsSubmitting(false)
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post?.title;
    
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`, '_blank');
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(url);
        toast.success('Link berhasil disalin!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16 container mx-auto px-4 max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-4">
               <Skeleton className="h-8 w-3/4 mb-4" />
               <Skeleton className="h-4 w-1/2 mb-8" />
               <Skeleton className="h-96 w-full rounded-xl mb-8" />
             </div>
             <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-40 w-full rounded-xl" />
             </div>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">{t('blog.not_found')}</h1>
                <Button onClick={() => navigate('/blog')} variant="outline">
                    {t('blog.back_to_blog')}
                </Button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb / Back */}
          <Helmet>
            <title>{post.seo_title || post.title} - Portfolio</title>
            <meta name="description" content={post.seo_description || post.excerpt} />
            {post.seo_keywords && post.seo_keywords.length > 0 && (
              <meta name="keywords" content={Array.isArray(post.seo_keywords) ? post.seo_keywords.join(', ') : post.seo_keywords} />
            )}
            <meta property="og:title" content={post.seo_title || post.title} />
            <meta property="og:description" content={post.seo_description || post.excerpt} />
            {(post.coverImageFile || post.coverImage) && (
              <meta property="og:image" content={normalizeMediaUrl(post.coverImageFile || post.coverImage)} />
            )}
          </Helmet>

          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.back_to_blog')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Main Article Content */}
            <article className="lg:col-span-2">
              {/* Header */}
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Badge variant="secondary" className="text-sm">
                        {post.category?.name || t('blog.default_category')}
                    </Badge>
                    <span className="text-muted-foreground text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(post.created_at), 'd MMMM yyyy', { locale: idLocale })}
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                    {post.title}
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary/50 pl-4">
                    {post.excerpt}
                </p>
              </header>

              {/* Featured Image */}
              {(post.coverImageFile || post.coverImage) ? (
                <div className="rounded-xl overflow-hidden mb-12 shadow-lg">
                    <img 
                        src={normalizeMediaUrl(post.coverImageFile || post.coverImage)} 
                        alt={post.title} 
                        className="w-full max-h-[500px] object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/1200x600?text=Blog+Post";
                        }}
                    />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden mb-12 shadow-lg">
                    <img 
                        src="https://placehold.co/1200x600?text=Blog+Post" 
                        alt={post.title} 
                        className="w-full max-h-[500px] object-cover"
                    />
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg dark:prose-invert max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="border-t pt-8 mb-8">
                 <div className="flex flex-wrap gap-2">
                     {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string, i: number) => (
                         <Badge key={i} variant="outline" className="text-muted-foreground">
                             # {tag}
                         </Badge>
                     ))}
                 </div>
              </div>
              
              {/* Share Buttons Mobile (Bottom) */}
              <div className="lg:hidden flex justify-between items-center pt-6 border-t border-border">
                  <span className="font-semibold">{t('common.share_label')}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                    </Button>
                  </div>
              </div>
            </article>

            {/* Right Column: Sidebar (Sticky) */}
            <aside className="space-y-8">
              <div className="sticky top-24 space-y-6">
                
                {/* Author Profile */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                     <User className="w-5 h-5 text-primary" />
                     Tentang Penulis
                   </h3>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {profile?.aboutImage || profile?.heroImage ? (
                             <img src={normalizeMediaUrl(profile.aboutImage || profile.heroImage)} alt="Author" className="w-full h-full object-cover" />
                        ) : (
                             <span className="font-bold text-primary text-lg">{profile?.fullName?.charAt(0) || 'E'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{profile?.fullName || 'Eka'}</p>
                        <p className="text-xs text-muted-foreground">{profile?.role && JSON.parse(profile.role)[0] || 'Software Engineer'}</p>
                      </div>
                   </div>
                   <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-4">
                     {profile?.shortBio || profile?.bio || 'Suka berbagi pengalaman seputar teknologi, coding, dan pengembangan karir di dunia IT.'}
                   </p>
                </div>

                {/* Engagement Stats */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                   <h3 className="font-bold text-lg mb-4">Interaksi</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-background rounded-lg border border-border/50">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleLike}
                            className={`h-10 w-10 rounded-full mb-2 ${likeMutation.isPending ? 'opacity-50' : ''} hover:bg-red-500/10 hover:text-red-500`}
                         >
                           <Heart className="w-5 h-5" />
                         </Button>
                         <p className="text-lg font-bold">{formatCompactNumber(post.likes || 0)}</p>
                         <p className="text-xs text-muted-foreground">Suka</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg border border-border/50">
                         <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
                           <Eye className="w-5 h-5" />
                         </div>
                         <p className="text-lg font-bold">{formatCompactNumber(post.views || 0)}</p>
                         <p className="text-xs text-muted-foreground">Dilihat</p>
                      </div>
                   </div>
                </div>

                {/* Share Desktop */}
                <div className="hidden lg:block bg-card border border-border rounded-xl p-6 shadow-sm">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                     <Share2 className="w-5 h-5" />
                     Bagikan Artikel
                   </h3>
                   <div className="flex gap-2">
                      <Button className="flex-1" variant="outline" onClick={() => handleShare('twitter')}>
                          Twitter
                      </Button>
                      <Button className="flex-1" variant="outline" onClick={() => handleShare('facebook')}>
                          Facebook
                      </Button>
                   </div>
                   <Button className="w-full mt-2" variant="outline" onClick={() => handleShare('copy')}>
                       Salin Link
                   </Button>
                </div>

                {/* Comments Section */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                     <MessageCircle className="w-5 h-5" />
                     Komentar ({comments?.length || 0})
                   </h3>
                   
                   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                      {commentsLoading ? (
                          <div className="text-center py-4 text-muted-foreground text-xs">Memuat komentar...</div>
                      ) : comments.length > 0 ? (
                          comments.map((comment: any) => (
                              <div key={comment.id} className="flex gap-3">
                                 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                   {comment.avatar ? (
                                       <img src={comment.avatar} alt={comment.name} className="w-full h-full object-cover" />
                                   ) : (
                                       <span className="text-xs font-bold">{comment.name.charAt(0).toUpperCase()}</span>
                                   )}
                                 </div>
                                 <div className="flex-1">
                                    <div className="bg-muted/30 p-3 rounded-lg rounded-tl-none">
                                       <div className="flex justify-between items-start mb-1">
                                         <p className="text-sm font-bold">{comment.name}</p>
                                         <span className="text-[10px] text-muted-foreground">
                                             {format(new Date(comment.createdAt), 'd MMM yyyy', { locale: idLocale })}
                                         </span>
                                       </div>
                                       <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                                    </div>
                                 </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-4 text-muted-foreground text-xs italic">
                              Belum ada komentar. Jadilah yang pertama!
                          </div>
                      )}
                   </div>
                   
                   <div className="pt-4 border-t border-border">
                      <form onSubmit={handleCommentSubmit} className="space-y-3">
                          <Input 
                            placeholder="Nama Lengkap *" 
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            className="text-sm"
                            required
                          />
                          <Input 
                            placeholder="Email (Opsional)" 
                            type="email"
                            value={commentEmail}
                            onChange={(e) => setCommentEmail(e.target.value)}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                             <Textarea 
                                placeholder="Tulis komentar..." 
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="flex-1 text-sm min-h-[80px] resize-none"
                                required
                             />
                             <Button 
                                type="submit" 
                                size="icon" 
                                variant="default" 
                                className="h-[80px] w-12"
                                disabled={isSubmitting}
                             >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                             </Button>
                          </div>
                      </form>
                   </div>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
};

export default BlogDetail;

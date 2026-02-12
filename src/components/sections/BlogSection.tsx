import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPosts } from '@/hooks/useBlog';
import { normalizeMediaUrl } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';

export const BlogSection = () => {
  const { t } = useTranslation();
  const { posts, isLoading } = useBlogPosts();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter only published posts and take first 8 (2 rows x 4 columns)
  const latestPosts = posts
    .filter((post: any) => post.is_published)
    .slice(0, 8);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
        <section id="blog" className="py-6 md:py-12 relative overflow-hidden">
             <div className="container mx-auto px-4 text-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
             </div>
        </section>
    )
  }

  return (
    <section id="blog" className="py-6 md:py-8 relative overflow-hidden bg-secondary/5">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {t('blog.latest_title')}
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </motion.div>

        {latestPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t('blog.no_posts')}</p>
          </div>
        ) : (
        <div 
          className={isMobile ? "relative w-full overflow-hidden" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"}
          ref={containerRef}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {isMobile ? (
            <motion.div 
              className="flex gap-4"
              animate={{
                x: ["0%", "-50%"]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: latestPosts.length * 5, // Adjust speed based on item count
                  ease: "linear",
                },
                playState: isPaused ? "paused" : "running"
              }}
              style={{
                width: "max-content" 
              }}
            >
              {[...latestPosts, ...latestPosts].map((post: any, index: number) => (
                <div 
                  key={`${post.id}-${index}`}
                  className="w-[85vw] max-w-[350px] flex-shrink-0"
                >
                  <motion.div
                    className="neon-card group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card border border-border/50"
                  >
                     <div className="relative aspect-video overflow-hidden">
                        <Link to={`/blog/${post.slug}`} className="block h-full">
                            <img
                                src={post.coverImage || post.coverImageFile ? normalizeMediaUrl(post.coverImage || post.coverImageFile) : "https://placehold.co/600x400?text=Blog+Post"}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://placehold.co/600x400?text=Blog+Post";
                                }}
                            />
                        </Link>
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {post.category?.name || t('blog.default_category')}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(post.created_at), 'd MMM yyyy', { locale: id })}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            {post.title}
                          </Link>
                        </h3>

                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center text-primary text-sm font-medium mt-auto">
                          {t('blog.read_more')} <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          ) : (
            latestPosts.map((post: any, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="neon-card group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden">
                <Link to={`/blog/${post.slug}`} className="block h-full">
                    <img
                        src={post.coverImage || post.coverImageFile ? normalizeMediaUrl(post.coverImage || post.coverImageFile) : "https://placehold.co/600x400?text=Blog+Post"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/600x400?text=Blog+Post";
                        }}
                    />
                </Link>
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {post.category?.name || t('blog.default_category')}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(post.created_at), 'd MMM yyyy', { locale: id })}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {post.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>

                <div className="flex items-center text-primary text-sm font-medium">
                  {t('blog.read_more')} <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          )))}
        </div>
        )}

        <div className="mt-12 text-center">
            <Button 
                onClick={() => navigate('/blog')}
                size="lg"
                variant="outline"
                className="group"
            >
                {t('blog.view_all')}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </div>
      </div>
    </section>
  );
};

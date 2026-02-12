import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { normalizeMediaUrl } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Github, Sparkles, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { AISummaryModal } from '@/components/ui/AISummaryModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading, isError } = useProjects();
  const { t } = useTranslation();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const project = useMemo(() => {
    if (!projects || !id) return null;
    return projects.find((p: any) => p.id === Number(id));
  }, [projects, id]);

  const allImages = useMemo(() => {
    if (!project) return [];
    const images = [];
    if (project.coverImage || project.thumbnail) {
      images.push(normalizeMediaUrl(project.coverImage || project.thumbnail));
    }
    
    // Handle legacy relation
    if (project.images && project.images.length > 0) {
      project.images.forEach((img: any) => images.push(normalizeMediaUrl(img.image)));
    }

    // Handle JSON gallery
    if (project.gallery) {
      let gallery = project.gallery;
      if (typeof gallery === 'string') {
        try {
          gallery = JSON.parse(gallery);
        } catch (e) {
          gallery = [];
        }
      }
      if (Array.isArray(gallery)) {
        gallery.forEach((img: string) => images.push(normalizeMediaUrl(img)));
      }
    }
    
    return images;
  }, [project]);

  useEffect(() => {
    if (!isAutoPlaying || allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    setIsAutoPlaying(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setIsAutoPlaying(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const videoUrl = useMemo(() => {
    if (!project) return null;
    return getYouTubeEmbedUrl(project.video_url || project.demoUrl);
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16 container mx-auto px-4 max-w-5xl">
           <Skeleton className="h-8 w-3/4 mb-4" />
           <Skeleton className="h-4 w-1/2 mb-8" />
           <Skeleton className="h-96 w-full rounded-xl mb-8" />
           <div className="space-y-4">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-5/6" />
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || (!isLoading && !project)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Proyek tidak ditemukan</h1>
                <Button onClick={() => navigate('/')} variant="outline">
                    Kembali ke Beranda
                </Button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-6xl">
          <Helmet>
            <title>{project.title} - Portfolio</title>
            <meta name="description" content={project.description} />
            <meta property="og:title" content={project.title} />
            <meta property="og:description" content={project.description} />
            {(project.coverImage || project.thumbnail) && (
              <meta property="og:image" content={normalizeMediaUrl(project.coverImage || project.thumbnail)} />
            )}
          </Helmet>

          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('projects.back_to_home')}
          </Link>

          {/* Project Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Main Content Column */}
            <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1">
                        {project.category_details?.name || t('projects.default_category')}
                    </Badge>
                    {project.createdAt && (
                        <Badge variant="secondary" className="text-muted-foreground bg-muted/50 font-normal">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(project.createdAt).toLocaleDateString()}
                        </Badge>
                    )}
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading leading-tight tracking-tight">
                    {project.title}
                </h1>
                
                <div className="flex flex-wrap gap-2">
                    {project.techStack?.map((tech: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-secondary/40 border border-secondary rounded-md text-xs font-medium text-secondary-foreground">
                            {tech}
                        </span>
                    ))}
                </div>

                {videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm aspect-video mt-6">
                    <iframe
                      width="100%"
                      height="100%"
                      src={videoUrl}
                      title="Project Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <p className="text-base text-muted-foreground leading-relaxed">
                        {project.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    {project.demoUrl && (
                        <Button asChild size="sm" className="h-9">
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t('projects.live_demo')}
                            </a>
                        </Button>
                    )}
                    {project.repoUrl && (
                        <Button variant="outline" asChild size="sm" className="h-9">
                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4 mr-2" />
                                {t('projects.repository')}
                            </a>
                        </Button>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 gap-2 h-9 ml-auto"
                        onClick={() => setAiModalOpen(true)}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Insight
                    </Button>
                </div>
            </div>

            {/* Gallery Column (Slider) */}
            <div className="order-1 lg:order-2 lg:col-span-7 space-y-4">
                <div 
                  className="aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border/50 shadow-md relative group"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={currentImageIndex}
                            src={allImages[currentImageIndex] || ''} 
                            alt={project.title} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full object-cover"
                        />
                    </AnimatePresence>

                    {/* Slider Controls */}
                    {allImages.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            
                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {allImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setCurrentImageIndex(idx); setIsAutoPlaying(false); }}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                
                {/* Thumbnails */}
                {allImages.length > 1 && (
                    <div className="grid grid-cols-6 gap-2">
                        {allImages.map((img: string, idx: number) => (
                            <button 
                                key={idx}
                                onClick={() => { setCurrentImageIndex(idx); setIsAutoPlaying(false); }}
                                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                                    idx === currentImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* Detailed Content */}
          <div className="border-t border-border/50 pt-12">
             <div className="prose prose-lg dark:prose-invert max-w-none">
                {project.content ? (
                    <div dangerouslySetInnerHTML={{ __html: project.content }} />
                ) : (
                    <p className="text-center text-muted-foreground italic">
                        Tidak ada konten detail untuk proyek ini.
                    </p>
                )}
             </div>
          </div>

          {/* Additional Links */}
          {project.links && project.links.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border/50">
                  <h3 className="text-xl font-bold mb-4">Sumber Daya Tambahan</h3>
                  <div className="flex flex-col gap-2">
                      {project.links.map((link: any, i: number) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                              <ExternalLink className="w-4 h-4" />
                              {link.label}
                          </a>
                      ))}
                  </div>
              </div>
          )}

        </article>
      </main>
      
      <Footer />

      <AISummaryModal 
        isOpen={aiModalOpen} 
        onClose={() => setAiModalOpen(false)} 
        project={project} 
      />
      
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
};

export default ProjectDetail;

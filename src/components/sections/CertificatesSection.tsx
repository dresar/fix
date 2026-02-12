import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCertificates } from '@/hooks/useCertificates';
import { useModalStore } from '@/store/modalStore';
import { certificateCategoriesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { normalizeMediaUrl } from '@/lib/utils';

export const CertificatesSection = () => {
  const { t } = useTranslation();
  const { openCertificateModal } = useModalStore();
  const { certificates = [], isLoading, refetch } = useCertificates();
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['certificateCategories'],
    queryFn: async () => {
      try {
        const res = await certificateCategoriesAPI.getAll();
        return res;
      } catch (error) {
        console.error('Failed to fetch categories', error);
        return [];
      }
    },
  });

  const filteredCertificates = selectedCategory === 'all'
    ? certificates
    : certificates.filter(c => c.category === selectedCategory);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const displayedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (catId: number | 'all') => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      const section = document.getElementById('certificates');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      const section = document.getElementById('certificates');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section id="certificates" className="py-6 md:py-12 relative flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="certificates" className="py-6 md:py-8 relative bg-card/50 dark:bg-transparent">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
            {t('nav.certificates')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.certificates.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.certificates.subtitle')}
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => handleCategoryChange('all')}
            className="rounded-full"
            size="sm"
          >
            {t('common.all')}
          </Button>
          {categories.map((cat: any) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(cat.id)}
              className="rounded-full"
              size="sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div
          className={isMobile ? "relative w-full overflow-hidden" : ""}
          ref={containerRef}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
        {isMobile ? (
          <motion.div 
            className="flex gap-6"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: displayedCertificates.length * 5, // Adjust speed based on item count
                ease: "linear",
              },
              playState: isPaused ? "paused" : "running"
            }}
            style={{
              width: "max-content" 
            }}
          >
            {[...displayedCertificates, ...displayedCertificates].map((cert, index) => (
              <div 
                key={`${cert.id}-${index}`}
                className="w-[85vw] max-w-[350px] flex-shrink-0"
                onClick={() => openCertificateModal(cert)}
              >
                <div className="glass-strong rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 cursor-pointer h-full flex flex-col dark:bg-card/50 bg-white shadow-sm hover:shadow-md border border-border/50">
                  {/* Image/Thumbnail */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {cert.image ? (
                      <img
                        src={normalizeMediaUrl(cert.image)}
                        alt={cert.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Award className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-lg bg-background/90 text-sm font-medium">
                        {t('certificates.view')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{cert.issuer}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(cert.issueDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                      </div>
                      
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t('certificates.verify')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedCertificates.map((cert) => (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  mass: 1 
                }}
                className="group relative"
                onClick={() => openCertificateModal(cert)}
              >
                <div className="glass-strong rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 cursor-pointer h-full flex flex-col dark:bg-card/50 bg-white shadow-sm hover:shadow-md">
                  {/* Image/Thumbnail */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {cert.image ? (
                      <img
                        src={normalizeMediaUrl(cert.image)}
                        alt={cert.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Award className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-lg bg-background/90 text-sm font-medium">
                        {t('certificates.view')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{cert.issuer}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(cert.issueDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                      </div>
                      
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t('certificates.verify')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        )}

        </div>
        
        {/* Pagination Controls */}
        {!isMobile && totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                currentPage === 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {t('common.previous')}
            </button>
            <span className="flex items-center text-muted-foreground text-sm">
              {t('common.page_info', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No certificates found in this category.
          </div>
        )}
      </div>
    </section>
  );
};
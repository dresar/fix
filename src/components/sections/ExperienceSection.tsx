import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Building2, Loader2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExperience } from '@/hooks/useExperience';
import { normalizeMediaUrl } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';

export const ExperienceSection = () => {
  const { t } = useTranslation();
  const { experiences = [], isLoading } = useExperience();
  const { openExperienceGalleryModal } = useModalStore();
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

  if (isLoading) {
    return (
      <section id="experience" className="py-6 md:py-12 relative bg-card/30 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  const formatDate = (dateString: string | Date | undefined) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const locale = t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US';
      return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  };

  return (
    <section id="experience" className="py-6 md:py-8 relative bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
            {t('nav.experience')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.experience.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.experience.subtitle')}
          </p>
        </motion.div>

        {/* Experience Grid/Slider */}
        <div className="relative">
          {/* Mobile: Horizontal Scroll / Desktop: Grid */}
          <div 
            className={isMobile ? "relative w-full overflow-hidden" : "flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar"}
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
                   duration: experiences.length * 5, // Adjust speed based on item count
                   ease: "linear",
                 },
                 playState: isPaused ? "paused" : "running"
               }}
               style={{
                 width: "max-content" 
               }}
             >
               {[...experiences, ...experiences].map((exp, index) => (
                <div 
                  key={`${exp.id}-${index}`}
                  className="w-[85vw] max-w-[350px] flex-shrink-0"
                >
                  <motion.div
                    className="glass-strong rounded-2xl p-6 hover:glow-primary transition-all duration-300 h-full flex flex-col border border-border/50 dark:bg-card/50 bg-white shadow-sm hover:shadow-md"
                  >
                     {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="shrink-0">
                        {exp.image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-border">
                            <img 
                              src={normalizeMediaUrl(exp.image)} 
                              alt={exp.company} 
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Briefcase className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-heading font-bold mb-1 leading-tight line-clamp-2">{exp.role}</h3>
                            <div className="text-primary font-medium flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span className="line-clamp-1">{exp.company}</span>
                            </div>
                          </div>
                          
                          {/* Documentation Eye Icon */}
                          {exp.gallery && (exp.gallery.length > 0 || (typeof exp.gallery === 'string' && exp.gallery !== '[]')) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary -mt-1 -mr-1"
                              onClick={() => openExperienceGalleryModal(exp)}
                              title="Lihat Dokumentasi"
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md">
                        <Calendar className="w-4 h-4" />
                        {formatDate(exp.startDate)} - {exp.isCurrent ? t('common.present') : (exp.endDate ? formatDate(exp.endDate) : t('common.present'))}
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md">
                          <MapPin className="w-4 h-4" />
                          {exp.location}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm line-clamp-4 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
               ))}
             </motion.div>
            ) : (
            experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="min-w-[85vw] md:min-w-0 snap-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="glass-strong rounded-2xl p-6 hover:glow-primary transition-all duration-300 h-full flex flex-col border border-border/50 dark:bg-card/50 bg-white shadow-sm hover:shadow-md">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0">
                      {exp.image ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-border">
                          <img 
                            src={normalizeMediaUrl(exp.image)} 
                            alt={exp.company} 
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-1 leading-tight line-clamp-2">{exp.role}</h3>
                          <div className="text-primary font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="line-clamp-1">{exp.company}</span>
                          </div>
                        </div>
                        
                        {/* Documentation Eye Icon */}
                        {exp.gallery && (exp.gallery.length > 0 || (typeof exp.gallery === 'string' && exp.gallery !== '[]')) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary -mt-1 -mr-1"
                            onClick={() => openExperienceGalleryModal(exp)}
                            title="Lihat Dokumentasi"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-4 h-4" />
                      {formatDate(exp.startDate)} - {exp.isCurrent ? t('common.present') : (exp.endDate ? formatDate(exp.endDate) : t('common.present'))}
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md">
                        <MapPin className="w-4 h-4" />
                        {exp.location}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm line-clamp-4 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )))}
          </div>
        </div>
      </div>
    </section>
  );
};

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ArrowRight, Loader2, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '@/hooks/useProjects';
import { useProjectCategories } from '@/hooks/useProjectCategories';
import { Button } from '@/components/ui/button';
import { AISummaryModal } from '@/components/ui/AISummaryModal';
import { normalizeMediaUrl } from '@/lib/utils';

export const ProjectsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useProjectCategories();
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryProject, setSummaryProject] = useState<any>(null);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const itemsPerPage = 15; // Show 15 projects per page with pagination
  const { projects = [], isLoading, isError } = useProjects();

  const filters = useMemo(() => [
    { id: 'all', label: t('projects.all_projects') },
    ...(categories || []).map((c: any) => ({ id: c.id, label: c.name }))
  ], [categories, t]);

  const filteredProjects = projects.filter((project: any) =>
    activeFilter === 'all' ? true : project.category === activeFilter
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const displayedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (filterId: number | 'all') => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      const section = document.getElementById('projects');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      const section = document.getElementById('projects');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section id="projects" className="py-6 md:py-12 relative flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  if (isError) {
    return (
      <section id="projects" className="py-6 md:py-12 relative flex flex-col justify-center items-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('common.error')}</h3>
        <p className="text-muted-foreground mb-6">{t('common.error')}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          {t('common.retry')}
        </Button>
      </section>
    );
  }

  return (
    <section id="projects" className="py-6 md:py-8 relative bg-card/50 dark:bg-transparent">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
            {t('nav.projects')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.projects.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.projects.subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((project: any) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all dark:bg-card/50 dark:border-border/50 bg-white shadow-sm hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={normalizeMediaUrl(project.coverImage || project.thumbnail || project.image)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* AI Summary Button - Top Right */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-white transition-colors shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Randomize index if summaries exist to show different variations
                      if (project.summaries && project.summaries.length > 0) {
                          const randomIndex = Math.floor(Math.random() * project.summaries.length);
                          setSummaryIndex(randomIndex);
                      } else {
                          setSummaryIndex(0);
                      }
                      setSummaryProject(project);
                    }}
                    title={t('projects.ai_summary')}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>

                  {/* Overlay with Detail Button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10 cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full hover:bg-primary hover:text-white transition-colors h-10 w-10"
                      onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/project/${project.id}`);
                      }}
                      title={t('projects.view_details')}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(() => {
                        let techList: string[] = [];
                        try {
                            if (Array.isArray(project.tech)) {
                                techList = project.tech;
                            } else if (typeof project.tech === 'string') {
                                if (project.tech.startsWith('[')) {
                                    techList = JSON.parse(project.tech);
                                } else {
                                    techList = project.tech.split(',').map(t => t.trim());
                                }
                            }
                        } catch (e) {
                            console.warn("Failed to parse tech", project.tech);
                            techList = [];
                        }

                        return (
                           <>
                            {techList.slice(0, 3).map((tech: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-secondary rounded-md"
                              >
                                {tech}
                              </span>
                            ))}
                            {techList.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-secondary rounded-md">
                                +{techList.length - 3}
                              </span>
                            )}
                           </>
                        )
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t mt-4 gap-2">
                    <div className="flex gap-2">
                      {/* GitHub Button */}
                      {(project.repo_urls?.length > 0 || project.repoUrl || project.github_url) && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-full hover:bg-black hover:text-white transition-colors h-9 w-9"
                          onClick={() => window.open(project.repo_urls?.[0] || project.repoUrl || project.github_url, '_blank')}
                          title={t('projects.repository')}
                        >
                          <Github className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Demo Button */}
                      {(project.demo_urls?.length > 0 || project.demoUrl || project.demo_url) && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-full hover:bg-blue-500 hover:text-white transition-colors h-9 w-9"
                          onClick={() => window.open(project.demo_urls?.[0] || project.demoUrl || project.demo_url, '_blank')}
                          title={t('projects.live_demo')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Button
                      onClick={() => navigate(`/project/${project.id}`)}
                      variant="default"
                      size="sm"
                      className="gap-2 px-6 flex-1 ml-auto"
                    >
                      {t('projects.view_details')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI Summary Modal */}
        <AISummaryModal
          isOpen={!!summaryProject}
          onClose={() => setSummaryProject(null)}
          project={summaryProject}
          startIndex={summaryIndex}
        />

        {/* Empty State */}
        {displayedProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t('projects.not_found')}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              {t('common.previous')}
            </Button>
            <span className="flex items-center px-4 text-sm font-medium">
              {t('common.page_info', { current: currentPage, total: totalPages })}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

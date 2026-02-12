  import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, ChevronLeft, ChevronRight, Award, FileText, Play } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useState, useEffect, useMemo } from 'react';

import { normalizeMediaUrl } from '@/lib/utils';

export const GlobalModal = () => {
  const { isOpen, modalType, projectData, educationData, experienceData, documentUrl, documentTitle, certificateData, closeModal } = useModalStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Parse gallery data safely
  const educationGallery = useMemo(() => {
    if (!educationData?.gallery) return [];
    if (Array.isArray(educationData.gallery)) return educationData.gallery;
    try {
      if (typeof educationData.gallery === 'string') {
          if (educationData.gallery.startsWith('[')) {
             return JSON.parse(educationData.gallery);
          }
          return [{ url: educationData.gallery, caption: '' }];
      }
      return [];
    } catch (e) {
      console.error("Failed to parse gallery", e);
      return [];
    }
  }, [educationData]);

  // Parse experience gallery safely
  const experienceGallery = useMemo(() => {
    if (!experienceData?.gallery) return [];
    if (Array.isArray(experienceData.gallery)) return experienceData.gallery;
    try {
      if (typeof experienceData.gallery === 'string') {
          if (experienceData.gallery.startsWith('[')) {
             return JSON.parse(experienceData.gallery);
          }
          return [experienceData.gallery];
      }
      return [];
    } catch (e) {
      console.error("Failed to parse experience gallery", e);
      return [];
    }
  }, [experienceData]);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setCurrentMediaIndex(0);
    }
  }, [isOpen, projectData, educationData, experienceData]);

  const mediaItems = projectData ? [
    ...(projectData.video_url ? [{ type: 'video', url: projectData.video_url }] : []),
    ...(projectData.images?.map(img => ({ type: 'image', url: img.image, caption: img.caption })) || []),
    ...(projectData.thumbnail ? [{ type: 'image', url: projectData.thumbnail }] : [])
  ] : [];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const nextImage = () => {
    if (modalType === 'education-gallery' && educationGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % educationGallery.length);
    } else if (modalType === 'experience-gallery' && experienceGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % experienceGallery.length);
    }
  };

  const prevImage = () => {
    if (modalType === 'education-gallery' && educationGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + educationGallery.length) % educationGallery.length);
    } else if (modalType === 'experience-gallery' && experienceGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + experienceGallery.length) % experienceGallery.length);
    }
  };

  const nextMedia = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
    }
  };

  const prevMedia = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors text-foreground"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Project Modal */}
            {modalType === 'project' && projectData && (
              <div className="p-6 md:p-8">
                {/* Header Section */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                      {projectData.category_details?.name || projectData.category || 'PROJECT'}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{projectData.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{projectData.description}</p>
                </div>

                {/* Media Carousel */}
                {mediaItems.length > 0 && (
                  <div className="mb-8 space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video group shadow-lg border border-border/50">
                        {mediaItems[currentMediaIndex].type === 'youtube' ? (
                            <iframe 
                                src={mediaItems[currentMediaIndex].url.replace('watch?v=', 'embed/')} 
                                className="w-full h-full" 
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            />
                        ) : mediaItems[currentMediaIndex].type === 'video' ? (
                            <video 
                                src={mediaItems[currentMediaIndex].url} 
                                controls 
                                className="w-full h-full"
                            />
                        ) : (
                            <img 
                                src={mediaItems[currentMediaIndex].url} 
                                alt={mediaItems[currentMediaIndex].caption || projectData.title} 
                                className="w-full h-full object-contain"
                            />
                        )}

                        {/* Navigation Arrows */}
                        {mediaItems.length > 1 && (
                            <>
                                <button
                                    onClick={prevMedia}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/50 hover:bg-background text-foreground transition-all opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextMedia}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/50 hover:bg-background text-foreground transition-all opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails - Horizontal Scroll on Mobile */}
                    {mediaItems.length > 1 && (
                        <div className="relative">
                          <div className="flex gap-3 overflow-x-auto pb-4 px-1 snap-x snap-mandatory no-scrollbar">
                              {mediaItems.map((item, index) => (
                                  <button
                                      key={index}
                                      onClick={() => setCurrentMediaIndex(index)}
                                      className={`flex-shrink-0 relative w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden bg-muted border-2 transition-all snap-center ${
                                          currentMediaIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                                      }`}
                                  >
                                      {item.type === 'image' ? (
                                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                              <Play className="w-8 h-8 text-white" />
                                          </div>
                                      )}
                                  </button>
                              ))}
                          </div>
                        </div>
                    )}
                  </div>
                )}

                {/* Project Details Grid */}
                <div className="grid md:grid-cols-1 gap-8 mb-8">
                    {/* Content (Rich Text) */}
                    {projectData.content && (
                      <div 
                        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: projectData.content }}
                      />
                    )}

                    {/* Technologies */}
                    {projectData.techStack && (
                      <div>
                        <h4 className="font-semibold mb-3">Technologies Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const techs = typeof projectData.techStack === 'string' 
                                ? JSON.parse(projectData.techStack) 
                                : projectData.techStack;
                              return Array.isArray(techs) ? techs.map((tech: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                                >
                                  {tech}
                                </span>
                              )) : null;
                            } catch (e) {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  {projectData.demoUrl && (
                    <a
                      href={projectData.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Live
                    </a>
                  )}
                  {projectData.repoUrl && (
                    <a
                      href={projectData.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Education Gallery Modal */}
            {modalType === 'education-gallery' && educationData && (
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">{educationData.institution}</h2>
                
                {/* Gallery Carousel */}
                <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground relative">
                     {educationGallery[currentImageIndex] ? (
                        <img 
                            src={typeof educationGallery[currentImageIndex] === 'string' ? educationGallery[currentImageIndex] : educationGallery[currentImageIndex].url} 
                            alt="Gallery" 
                            className="w-full h-full object-contain" 
                        />
                     ) : (
                        <span className="text-lg">No Image</span>
                     )}
                     
                     {educationGallery[currentImageIndex]?.caption && (
                         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-sm">
                             {educationGallery[currentImageIndex].caption}
                         </div>
                     )}
                  </div>
                  {educationGallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {educationGallery.map((photo: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={typeof photo === 'string' ? photo : photo.url} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Gallery Modal */}
            {modalType === 'experience-gallery' && experienceData && (
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">{experienceData.company}</h2>
                <p className="text-lg text-muted-foreground mb-4">{experienceData.role}</p>
                
                {/* Gallery Carousel */}
                <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground relative">
                     {experienceGallery[currentImageIndex] ? (
                        <img 
                            src={typeof experienceGallery[currentImageIndex] === 'string' ? normalizeMediaUrl(experienceGallery[currentImageIndex]) : normalizeMediaUrl(experienceGallery[currentImageIndex].url)} 
                            alt="Gallery" 
                            className="w-full h-full object-contain" 
                        />
                     ) : (
                        <span className="text-lg">No Image</span>
                     )}
                     
                     {experienceGallery[currentImageIndex]?.caption && (
                         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-sm">
                             {experienceGallery[currentImageIndex].caption}
                         </div>
                     )}
                  </div>
                  {experienceGallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {experienceGallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {experienceGallery.map((photo: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={typeof photo === 'string' ? normalizeMediaUrl(photo) : normalizeMediaUrl(photo.url)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Education Document Modal */}
            {modalType === 'education-document' && documentUrl && (
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  {documentTitle}
                </h2>
                <div className="rounded-xl overflow-hidden bg-muted aspect-[3/4] max-h-[70vh] flex items-center justify-center">
                  <span className="text-muted-foreground">Document Preview</span>
                </div>
              </div>
            )}

            {/* Certificate Modal */}
            {modalType === 'certificate' && certificateData && (
              <div className="p-6 md:p-8">
                {/* Certificate Image */}
                {certificateData.image && (
                  <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video">
                    <img 
                      src={normalizeMediaUrl(certificateData.image)} 
                      alt={certificateData.title} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">{certificateData.title}</h2>
                    <p className="text-muted-foreground">{certificateData.issuer}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="px-4 py-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Issue Date: </span>
                    <span className="font-medium">{new Date(certificateData.issueDate).toLocaleDateString()}</span>
                  </div>
                  {certificateData.credentialId && (
                    <div className="px-4 py-2 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Credential ID: </span>
                      <span className="font-medium">{certificateData.credentialId}</span>
                    </div>
                  )}
                </div>

                {certificateData.credentialUrl && (
                  <a
                    href={certificateData.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify Certificate
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

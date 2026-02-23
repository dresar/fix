
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { normalizeMediaUrl } from '@/lib/utils';

export const ExperienceGalleryModal = () => {
  const { isOpen, modalType, experienceData, closeModal } = useModalStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isModalOpen = isOpen && modalType === 'experience-gallery';

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
    if (isModalOpen) {
      setCurrentImageIndex(0);
    }
  }, [isModalOpen, experienceData]);

  const nextImage = () => {
    if (experienceGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % experienceGallery.length);
    }
  };

  const prevImage = () => {
    if (experienceGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + experienceGallery.length) % experienceGallery.length);
    }
  };

  if (!experienceData) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
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
      </DialogContent>
    </Dialog>
  );
};

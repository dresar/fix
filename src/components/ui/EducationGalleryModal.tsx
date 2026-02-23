
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

export const EducationGalleryModal = () => {
  const { isOpen, modalType, educationData, closeModal } = useModalStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isModalOpen = isOpen && modalType === 'education-gallery';

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

  useEffect(() => {
    if (isModalOpen) {
      setCurrentImageIndex(0);
    }
  }, [isModalOpen, educationData]);

  const nextImage = () => {
    if (educationGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % educationGallery.length);
    }
  };

  const prevImage = () => {
    if (educationGallery.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + educationGallery.length) % educationGallery.length);
    }
  };

  if (!educationData) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
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
      </DialogContent>
    </Dialog>
  );
};

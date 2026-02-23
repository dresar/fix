
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Calendar, Award, MapPin, Building, Globe, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const EducationDetailModal = () => {
  const { t } = useTranslation();
  const { isOpen, modalType, educationData, closeModal } = useModalStore();

  const isModalOpen = isOpen && modalType === 'education-detail';

  if (!educationData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (String(dateString).toLowerCase() === 'sekarang' || String(dateString).toLowerCase() === 'present') return t('common.present');
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const locale = t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US';
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const gallery = educationData.gallery 
    ? (typeof educationData.gallery === 'string' ? JSON.parse(educationData.gallery) : educationData.gallery)
    : [];

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-3xl w-[90vw] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
        <ScrollArea className="max-h-[85vh]">
          {/* Header Image / Cover */}
          <div className="relative h-32 md:h-48 bg-primary/10 w-full">
             {educationData.coverImage ? (
                <img 
                  src={educationData.coverImage} 
                  alt={educationData.institution} 
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <GraduationCap className="w-16 h-16 text-primary/40" />
                </div>
             )}
             
             {/* Logo Overlay */}
             {educationData.logo && (
                <div className="absolute -bottom-8 left-6 md:left-8 w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-background bg-white p-2 shadow-lg flex items-center justify-center">
                    <img 
                        src={educationData.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                    />
                </div>
             )}
          </div>

          <div className="pt-10 px-6 pb-6 md:px-8 md:pb-8">
             {/* Title & Subtitle */}
             <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {educationData.institution}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-primary font-medium text-lg">
                    <span>{educationData.degree}</span>
                    {educationData.field && (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <span className="text-muted-foreground">{educationData.field}</span>
                        </>
                    )}
                </div>
             </div>

             {/* Meta Info Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">{t('common.date')}</p>
                        <p className="text-sm font-medium">
                            {formatDate(educationData.startDate)} - {educationData.endDate ? formatDate(educationData.endDate) : t('common.present')}
                        </p>
                    </div>
                </div>

                {educationData.gpa && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <Award className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">{t('education.gpa')}</p>
                            <p className="text-sm font-medium">{educationData.gpa}</p>
                        </div>
                    </div>
                )}

                {educationData.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">{t('common.location')}</p>
                            <p className="text-sm font-medium">{educationData.location}</p>
                        </div>
                    </div>
                )}
             </div>

             {/* Description */}
             {educationData.description && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4 text-primary" />
                        {t('common.description')}
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                        {educationData.description}
                    </div>
                </div>
             )}

             {/* Gallery Preview */}
             {gallery.length > 0 && (
                <div className="mb-6">
                     <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        {t('education.gallery')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {gallery.slice(0, 4).map((img: string, idx: number) => (
                            <div key={idx} className="aspect-video rounded-md overflow-hidden border border-border/50">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* Map Embed */}
             {educationData.mapUrl && (
                <div className="rounded-xl overflow-hidden border border-border/50 h-48 md:h-64 w-full">
                    <iframe 
                        src={educationData.mapUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy"
                        title="Location Map"
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                    />
                </div>
             )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    );
}

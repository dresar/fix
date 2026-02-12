
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Briefcase, Building2, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExperienceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: any;
}

export function ExperienceDetailModal({ isOpen, onClose, experience }: ExperienceDetailModalProps) {
  if (!experience) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Parse gallery if string
  let gallery = [];
  try {
    gallery = typeof experience.gallery === 'string' ? JSON.parse(experience.gallery) : (experience.gallery || []);
  } catch (e) {
    gallery = [];
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            {experience.image ? (
                <div className="h-12 w-12 rounded border overflow-hidden shrink-0">
                    <img src={experience.image} alt={experience.company} className="h-full w-full object-cover" />
                </div>
            ) : (
                <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            <div className="flex flex-col gap-1">
                <span>{experience.role}</span>
                <span className="text-base font-normal text-muted-foreground">{experience.company}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 w-full p-6 pt-2">
            <div className="space-y-6 pb-6">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm">
                        {experience.type === 'work' ? 'Pekerjaan' : experience.type === 'internship' ? 'Magang' : 'Organisasi'}
                    </Badge>
                    {experience.isCurrent && <Badge className="text-sm bg-green-500 hover:bg-green-600">Masih Aktif</Badge>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {formatDate(experience.startDate)} - {experience.isCurrent ? 'Sekarang' : formatDate(experience.endDate)}
                        </span>
                    </div>
                    {experience.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{experience.location}</span>
                        </div>
                    )}
                </div>

                {experience.description && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5" /> Deskripsi Pekerjaan
                        </h3>
                        <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {experience.description}
                        </div>
                    </div>
                )}

                {gallery.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" /> Galeri Dokumentasi
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {gallery.map((img: string, idx: number) => (
                                <div key={idx} className="aspect-video rounded-lg overflow-hidden border bg-muted group relative">
                                    <img 
                                        src={img} 
                                        alt={`Dokumentasi ${idx + 1}`} 
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                    <a 
                                        href={img} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Lihat Penuh</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

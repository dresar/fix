
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  MoreVertical,
  Award,
  CheckSquare,
  Square
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";

export default function EducationList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const { data: educationList = [], refetch } = useQuery({
    queryKey: ['education'],
    queryFn: api.education.getAll,
  });

  // Debug: Log data to verify images
  // console.log('Education List Data:', educationList);

  const toggleSelectAll = () => {
    if (selectedIds.length === educationList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(educationList.map(e => e.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    setDeleteAlert({ isOpen: true, isBulk: true });
  };

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  const confirmDelete = async () => {
    try {
      if (deleteAlert.isBulk) {
        await api.education.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} item dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.education.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Data dihapus." });
      }
      queryClient.invalidateQueries({ queryKey: ['education'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  const parseGallery = (galleryData: string | any[] | null | undefined): string[] => {
    if (!galleryData) return [];
    let parsed: any[] = [];
    
    if (Array.isArray(galleryData)) {
      parsed = galleryData;
    } else if (typeof galleryData === 'string') {
      try {
        parsed = JSON.parse(galleryData);
      } catch (e) {
        console.error("Failed to parse gallery:", e);
        return [];
      }
    }

    // Normalize to string[]
    return parsed.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && item.url) return item.url;
      return null;
    }).filter(Boolean) as string[];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pendidikan</h2>
          <p className="text-muted-foreground">Riwayat pendidikan dan sertifikasi akademis.</p>
        </div>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
                </Button>
            )}
            <Button variant="outline" onClick={toggleSelectAll}>
                {educationList.length > 0 && selectedIds.length === educationList.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {educationList.length > 0 && selectedIds.length === educationList.length ? 'Batal Pilih' : 'Pilih Semua'}
            </Button>
            <Button onClick={() => navigate('/admin/education/new')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pendidikan
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Loader Removed */}
        {educationList?.map((edu) => (
          <Card key={edu.id} className={`relative group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${selectedIds.includes(edu.id) ? 'ring-2 ring-primary' : ''}`}>
            <div className="absolute top-2 left-2 z-20">
                <Checkbox 
                    checked={selectedIds.includes(edu.id)} 
                    onCheckedChange={() => toggleSelect(edu.id)}
                    className="bg-background/80 backdrop-blur-sm"
                />
            </div>
            {/* Cover Image */}
            <div className="h-32 bg-muted relative">
                {edu.coverImage || edu.cover_image || edu.cover_image_url ? (
                    <img src={edu.coverImage || edu.cover_image || edu.cover_image_url} alt={edu.institution} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-white/50" />
                    </div>
                )}
                {/* Logo Overlay */}
                <div className="absolute -bottom-6 left-4">
                    <div className="h-16 w-16 rounded-lg border-4 border-background bg-white flex items-center justify-center overflow-hidden shadow-sm">
                        {edu.logo || edu.logo_url || edu.image ? (
                            <img src={edu.logo || edu.logo_url || edu.image} alt="Logo" className="h-full w-full object-contain p-1" />
                        ) : (
                            <GraduationCap className="h-8 w-8 text-primary" />
                        )}
                    </div>
                </div>
            </div>

            <CardContent className="pt-10 pb-4 px-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="font-bold text-lg leading-tight">{edu.institution}</h3>
                    <p className="text-sm text-muted-foreground">{edu.degree} {edu.field ? `in ${typeof edu.field === 'string' ? edu.field : 'Unknown Field'}` : ''}</p>
                 </div>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/admin/education/${edu.id}`)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(edu.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                            {edu.startDate ? new Date(edu.startDate).getFullYear() : '-'} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Sekarang'}
                        </span>
                    </div>
                    {edu.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{edu.location}</span>
                        </div>
                    )}
                </div>
                
                {edu.gpa && (
                    <Badge variant="outline" className="text-xs">
                        <Award className="h-3 w-3 mr-1" /> GPA: {edu.gpa}
                    </Badge>
                )}

                {edu.description && (
                    <p className="text-sm line-clamp-3 text-muted-foreground">
                        {edu.description}
                    </p>
                )}

                {/* Gallery Preview */}
                {(() => {
                    const gallery = parseGallery(edu.gallery);
                    if (gallery.length > 0) {
                        return (
                            <div className="flex gap-1 mt-2 overflow-hidden">
                                {gallery.slice(0, 3).map((img: string, i: number) => (
                                    <div key={i} className="h-8 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                        <img src={img} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {gallery.length > 3 && (
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                        +{gallery.length - 3}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Item?` : "Hapus Pendidikan?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus data pendidikan yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus data pendidikan ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

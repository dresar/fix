
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Plus, Trash2, Edit, Calendar, MapPin, Briefcase, Image as ImageIcon, Eye, CheckSquare, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ExperienceDetailModal } from './ExperienceDetailModal';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";

export default function ExperienceList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const { data: experiences = [] } = useQuery({
    queryKey: ['experience'],
    queryFn: api.experience.getAll,
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === experiences.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(experiences.map((e: any) => e.id));
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
        await api.experience.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} item dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.experience.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Data pengalaman dihapus." });
      }
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // if (isLoading) {
  //     return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat Pengalaman..." /></div>;
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pengalaman Kerja</h1>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={toggleSelectAll}>
            {experiences.length > 0 && selectedIds.length === experiences.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
            {experiences.length > 0 && selectedIds.length === experiences.length ? 'Batal Pilih' : 'Pilih Semua'}
          </Button>
          <Button onClick={() => navigate('/admin/experience/new')}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengalaman
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {experiences.length === 0 ? (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Belum ada data pengalaman kerja.</p>
                    <Button onClick={() => navigate('/admin/experience/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Sekarang
                    </Button>
                </CardContent>
            </Card>
        ) : (
            experiences.map((exp) => (
            <Card key={exp.id} className={`overflow-hidden transition-all ${selectedIds.includes(exp.id) ? 'ring-2 ring-primary bg-accent/10' : ''}`}>
                <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="pt-1">
                            <Checkbox 
                                checked={selectedIds.includes(exp.id)} 
                                onCheckedChange={() => toggleSelect(exp.id)}
                            />
                        </div>
                        {exp.image ? (
                            <div className="h-12 w-12 rounded border overflow-hidden shrink-0">
                                <img src={exp.image} alt={exp.company} className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center shrink-0">
                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}
                        
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{exp.role}</h3>
                                {exp.isCurrent && <Badge variant="secondary">Saat Ini</Badge>}
                                <Badge variant="outline" className="capitalize">{exp.type === 'work' ? 'Kerja' : exp.type === 'internship' ? 'Magang' : 'Organisasi'}</Badge>
                            </div>
                            <div className="text-muted-foreground font-medium">{exp.company}</div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Sekarang' : formatDate(exp.endDate)}
                                    </span>
                                </div>
                                {exp.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{exp.location}</span>
                                    </div>
                                )}
                            </div>
                            
                            {exp.description && (
                                <p className="mt-3 text-sm line-clamp-2">{exp.description}</p>
                            )}

                            {exp.gallery && (
                                <div className="flex gap-2 mt-3">
                                    <Badge variant="outline" className="text-xs">
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        Dokumentasi Tersedia
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                        <Button variant="secondary" size="sm" onClick={() => {
                            setSelectedExperience(exp);
                            setIsDetailOpen(true);
                        }}>
                            <Eye className="h-4 w-4 mr-2" /> Detail
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/experience/edit/${exp.id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(exp.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </Button>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>

      <ExperienceDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        experience={selectedExperience} 
      />

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Item?` : "Hapus Pengalaman?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus data pengalaman yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus data pengalaman ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

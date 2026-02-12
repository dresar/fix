import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Award, 
  Calendar, 
  Link as LinkIcon, 
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function CertificateList() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates'],
    queryFn: api.certificates.getAll,
    // Stale time handled globally in App.tsx (Infinity)
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['certificate-categories'],
    queryFn: api.certificateCategories.getAll,
    // Stale time handled globally in App.tsx (Infinity)
  });

  // Removed loader
  // const isLoading = isCertLoading;

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  // Pagination Logic
  const filteredCertificates = selectedCategory === "all" 
      ? certificates 
      : certificates.filter(c => c.categoryId?.toString() === selectedCategory);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCertificates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCertificates.map(c => c.id));
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

  const confirmDelete = async () => {
    try {
      if (deleteAlert.isBulk) {
        await api.certificates.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} sertifikat dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.certificates.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Sertifikat dihapus." });
      }
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sertifikat</h2>
          <p className="text-muted-foreground">Lisensi & Sertifikasi Profesional.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
                </Button>
            )}
             <Button variant="outline" onClick={toggleSelectAll}>
                {filteredCertificates.length > 0 && selectedIds.length === filteredCertificates.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {filteredCertificates.length > 0 && selectedIds.length === filteredCertificates.length ? 'Batal Pilih' : 'Pilih Semua'}
             </Button>

             <div className="w-[200px]">
                <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={() => navigate('/admin/certificates/new')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Sertifikat
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((cert) => (
          <Card key={cert.id} className={`relative group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${selectedIds.includes(cert.id) ? 'ring-2 ring-primary' : ''}`}>
            <div className="absolute top-2 left-2 z-20">
                <Checkbox 
                    checked={selectedIds.includes(cert.id)} 
                    onCheckedChange={() => toggleSelect(cert.id)}
                    className="bg-background/80 backdrop-blur-sm"
                />
            </div>
            <div className="aspect-video bg-muted relative overflow-hidden">
                {cert.image ? (
                    <img src={cert.image} alt={cert.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                        <Award className="h-16 w-16 text-yellow-500/50" />
                    </div>
                )}
                {cert.verified && (
                    <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold line-clamp-2 leading-tight mb-1">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                </div>
                
                <div className="mt-4 space-y-2 text-sm text-muted-foreground flex-grow">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    {cert.credentialId && (
                        <div className="font-mono text-xs bg-muted p-1 rounded inline-block">
                            ID: {cert.credentialId}
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    {cert.credentialUrl ? (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center text-primary hover:underline">
                            <LinkIcon className="h-3 w-3 mr-1" /> Lihat Kredensial
                        </a>
                    ) : <span></span>}
                    
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/certificates/edit/${cert.id}`)}>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(cert.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
        {filteredCertificates.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Tidak ada sertifikat yang ditemukan.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Sertifikat?` : "Hapus Sertifikat?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus sertifikat yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus sertifikat ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}


import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Plus, Trash2, Edit, ExternalLink, Github, Youtube, Layers, MoreVertical, ChevronLeft, ChevronRight, Filter, CheckSquare, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { normalizeMediaUrl } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from '@/admin/components/DeleteAlert';

export default function ProjectList() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // State for Delete Alert
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number; // If single delete
    isBulk?: boolean; // If bulk delete
  }>({ isOpen: false });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.getAll,
    // Stale time handled globally in App.tsx (Infinity)
    select: (response: any) => {
       if (Array.isArray(response)) return response;
       if (response && Array.isArray(response.data)) return response.data;
       return [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['project-categories'],
    queryFn: api.projectCategories.getAll,
    // Stale time handled globally in App.tsx (Infinity)
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Removed loader
  // const isLoading = isProjLoading;

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  // Pagination Logic
  const filteredProjects = selectedCategory === "all" 
      ? projects 
      : projects.filter(p => p.categoryId?.toString() === selectedCategory);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteAlert.isBulk) {
        await api.projects.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} project dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.projects.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Project dihapus." });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  const handleBulkDelete = () => {
    setDeleteAlert({ isOpen: true, isBulk: true });
  };

  // if (isLoading) {
  //     return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat Project..." /></div>;
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Daftar Project</h1>
        <div className="flex gap-2 w-full md:w-auto">
             {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
                </Button>
            )}
             <Button variant="outline" onClick={toggleSelectAll}>
                {filteredProjects.length > 0 && selectedIds.length === filteredProjects.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {filteredProjects.length > 0 && selectedIds.length === filteredProjects.length ? 'Batal Pilih' : 'Pilih Semua'}
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
            <Button onClick={() => navigate('/admin/projects/new')}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Project
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.length === 0 ? (
            <div className="col-span-full">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Belum ada data project.</p>
                        <Button onClick={() => navigate('/admin/projects/new')}>
                            <Plus className="mr-2 h-4 w-4" /> Buat Project Baru
                        </Button>
                    </CardContent>
                </Card>
            </div>
        ) : (
            currentItems.map((proj) => (
            <Card key={proj.id} className={`overflow-hidden flex flex-col group relative transition-all ${selectedIds.includes(proj.id) ? 'ring-2 ring-primary' : ''}`}>
                <div className="absolute top-2 left-2 z-20">
                    <Checkbox 
                        checked={selectedIds.includes(proj.id)} 
                        onCheckedChange={() => toggleSelect(proj.id)}
                        className="bg-background/80 backdrop-blur-sm"
                    />
                </div>
                <div className="relative aspect-video bg-muted">
                    {proj.coverImage ? (
                        <img src={normalizeMediaUrl(proj.coverImage)} alt={proj.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                            <Layers className="h-10 w-10 opacity-20" />
                        </div>
                    )}
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/admin/projects/edit/${proj.id}`)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(proj.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                
                <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-semibold text-lg line-clamp-1 flex-1" title={proj.title}>{proj.title}</h3>
                        <Badge variant={proj.is_published ? "default" : "secondary"} className="shrink-0">
                            {proj.is_published ? "Publik" : "Draft"}
                        </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {proj.description || "Tidak ada deskripsi singkat."}
                    </p>
                    
                    <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                        {proj.repoUrl ? (
                            <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                <Github className="h-4 w-4" />
                            </a>
                        ) : <Github className="h-4 w-4 text-muted-foreground/30 p-1" />}
                        
                        {proj.demoUrl ? (
                            <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        ) : <ExternalLink className="h-4 w-4 text-muted-foreground/30 p-1" />}
                        
                        {proj.videoUrl ? (
                            <a href={proj.videoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                <Youtube className="h-4 w-4" />
                            </a>
                        ) : <Youtube className="h-4 w-4 text-muted-foreground/30 p-1" />}
                        
                        <div className="ml-auto">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(`/admin/projects/edit/${proj.id}`)}>
                                Detail
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            ))
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
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Project?` : "Hapus Project?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus project yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus project ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

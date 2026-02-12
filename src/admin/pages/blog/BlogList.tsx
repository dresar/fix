import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Edit, 
  FileText, 
  Calendar, 
  Eye,
  MoreVertical,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";

export default function BlogList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: api.blog.posts.getAll,
    // Stale time handled globally in App.tsx (Infinity)
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: api.blog.categories.getAll,
    // Stale time handled globally in App.tsx (Infinity)
  });

  // Removed loader
  // const isLoading = isPostsLoading;

  // Derived state for filtering
  const filteredPosts = (posts || []).filter((post: any) => {
    const matchesSearch = !searchQuery || 
      (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
      post.category?.id.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p: any) => p.id));
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
        await api.blog.posts.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} artikel dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.blog.posts.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Artikel dihapus." });
      }
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog & Artikel</h2>
          <p className="text-muted-foreground">Kelola konten artikel, tutorial, dan berita.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
             {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
                </Button>
            )}
             <Button variant="outline" onClick={toggleSelectAll}>
                {filteredPosts.length > 0 && selectedIds.length === filteredPosts.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {filteredPosts.length > 0 && selectedIds.length === filteredPosts.length ? 'Batal Pilih' : 'Pilih Semua'}
             </Button>
            <Button onClick={() => navigate('/admin/blog/new')}>
            <Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru
            </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border max-w-sm flex-grow">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari artikel..." 
            className="border-none shadow-none focus-visible:ring-0 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Loader removed */}
        {currentItems.map((post) => (
          <Card key={post.id} className={`overflow-hidden hover:shadow-lg transition-all flex flex-col group ${selectedIds.includes(post.id) ? 'ring-2 ring-primary' : ''}`}>
            <div className="aspect-video bg-muted relative overflow-hidden">
              <div className="absolute top-2 left-2 z-20">
                  <Checkbox 
                      checked={selectedIds.includes(post.id)} 
                      onCheckedChange={() => toggleSelect(post.id)}
                      className="bg-background/80 backdrop-blur-sm"
                  />
              </div>
              {post.coverImage ? (
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                  <FileText className="h-12 w-12 opacity-20" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                 <Badge variant={post.is_published ? "default" : "secondary"} className={post.is_published ? "bg-green-500/90 hover:bg-green-600 shadow-sm" : "bg-background/80 backdrop-blur shadow-sm"}>
                  {post.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4 flex-grow flex flex-col">
              <div className="mb-2">
                 <Badge variant="outline" className="text-xs mb-2">{post.category?.name || "Uncategorized"}</Badge>
                 <h3 className="font-bold text-lg line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{post.title}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                {post.excerpt || "Tidak ada ringkasan."}
              </p>

              <div className="pt-4 border-t mt-auto flex items-center justify-between">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {post.published_at 
                        ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: idLocale }) 
                        : 'Draft'}
                    </span>
                 </div>

                 <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Tidak ada artikel ditemukan.</p>
            <Button variant="link" onClick={() => navigate('/admin/blog/new')}>Mulai Menulis</Button>
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
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Artikel?` : "Hapus Artikel?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus artikel yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { DeleteAlert } from "../../components/DeleteAlert";
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { 
  Trash2, 
  Eye, 
  Search, 
  MessageSquare,
  User,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function CommentList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newComment, setNewComment] = useState({
    postId: '',
    name: 'Admin',
    content: ''
  });
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
  }>({ isOpen: false });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['blog-comments'],
    queryFn: api.blogComments.getAll,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: api.blogPosts.getAll,
  });

  const filteredComments = Array.isArray(comments) ? comments.filter((comment: any) => 
    (comment.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (comment.post?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  ) : [];

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteAlert.id) return;
    try {
      await api.blogComments.delete(deleteAlert.id);
      toast({ title: "Berhasil", description: "Komentar dihapus." });
      queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus komentar." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.postId || !newComment.name || !newComment.content) {
        toast({ variant: "destructive", title: "Gagal", description: "Mohon lengkapi semua field." });
        return;
    }
    
    try {
        await api.blogComments.create({
            postId: parseInt(newComment.postId),
            name: newComment.name,
            email: 'admin@local.host',
            content: newComment.content,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newComment.name)}&background=random`,
            isApproved: true
        });
        toast({ title: "Berhasil", description: "Komentar ditambahkan." });
        queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
        setIsAddOpen(false);
        setNewComment({ postId: '', name: 'Admin', content: '' });
    } catch (error) {
        toast({ variant: "destructive", title: "Gagal", description: "Gagal menambah komentar." });
    }
  };

  const handleView = (comment: any) => {
    setSelectedComment(comment);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Komentar Blog</h2>
          <p className="text-muted-foreground">Kelola komentar dari pengunjung blog Anda.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Komentar
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-card p-2 rounded-lg border max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari komentar..." 
          className="border-none shadow-none focus-visible:ring-0 h-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Penulis</TableHead>
              <TableHead>Komentar</TableHead>
              <TableHead>Artikel</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Memuat..." : "Tidak ada komentar ditemukan."}
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment: any) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback>{comment.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{comment.name}</span>
                        <span className="text-xs text-muted-foreground">{comment.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-[300px]">{comment.content}</p>
                  </TableCell>
                  <TableCell>
                    {comment.post ? (
                      <span className="text-sm font-medium text-primary hover:underline cursor-pointer" onClick={() => window.open(`/blog/${comment.post.slug}`, '_blank')}>
                        {comment.post.title}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Artikel dihapus</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {comment.createdAt ? format(new Date(comment.createdAt), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(comment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(comment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Comment Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Komentar Manual</DialogTitle>
            <DialogDescription>
                Tambahkan komentar baru seolah-olah dari pengunjung atau sebagai admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Pilih Artikel</Label>
                <Select 
                    value={newComment.postId} 
                    onValueChange={(val) => setNewComment({...newComment, postId: val})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih artikel..." />
                    </SelectTrigger>
                    <SelectContent>
                        {posts.map((post: any) => (
                            <SelectItem key={post.id} value={post.id.toString()}>
                                {post.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Nama Pengirim</Label>
                <Input 
                    value={newComment.name} 
                    onChange={(e) => setNewComment({...newComment, name: e.target.value})} 
                    placeholder="Nama pengirim" 
                />
            </div>
            <div className="space-y-2">
                <Label>Isi Komentar</Label>
                <Textarea 
                    value={newComment.content} 
                    onChange={(e) => setNewComment({...newComment, content: e.target.value})} 
                    placeholder="Tulis komentar disini..." 
                    rows={4}
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleAddComment}>Simpan Komentar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Komentar</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedComment.avatar} />
                  <AvatarFallback>{selectedComment.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedComment.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedComment.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedComment.createdAt ? format(new Date(selectedComment.createdAt), 'dd MMMM yyyy HH:mm', { locale: idLocale }) : '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                   <ExternalLink className="h-4 w-4" />
                   {selectedComment.post ? (
                     <a href={`/blog/${selectedComment.post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                       {selectedComment.post.title}
                     </a>
                   ) : (
                     <span>Artikel tidak ditemukan</span>
                   )}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedComment.content}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Tutup</Button>
            <Button variant="destructive" onClick={() => { setIsViewOpen(false); handleDelete(selectedComment.id); }}>Hapus Komentar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Komentar?"
        description="Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}

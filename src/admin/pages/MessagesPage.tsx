import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Trash2, Mail, MessageSquare, Search, CheckSquare, Square, MoreVertical, Eye, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from '@/admin/components/DeleteAlert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMessage, setViewMessage] = useState<any | null>(null);

  // State for Delete Alert
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const { data: messages = [], isLoading, isFetching } = useQuery({
    queryKey: ['messages'],
    queryFn: api.messages.getAll,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    refetchIntervalInBackground: true,
    select: (response: any) => {
       if (Array.isArray(response)) return response;
       if (response && Array.isArray(response.data)) return response.data;
       return [];
    }
  });

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  const handleBulkDelete = () => {
    setDeleteAlert({ isOpen: true, isBulk: true });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteAlert.isBulk) {
        await api.messages.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} pesan dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.messages.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Pesan dihapus." });
      }
      await queryClient.invalidateQueries({ queryKey: ['messages'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus pesan." });
    } finally {
      setIsDeleting(false);
      setDeleteAlert({ isOpen: false });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map((m: any) => m.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredMessages = messages.filter((msg: any) => 
    msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Pesan Masuk
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground">Kelola pesan yang masuk dari formulir kontak.</p>
        </div>
        <div className="flex gap-2 items-center">
            {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Hapus ({selectedIds.length})
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['messages'] })} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari pesan..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <Button variant="outline" onClick={toggleSelectAll} disabled={filteredMessages.length === 0}>
                {filteredMessages.length > 0 && selectedIds.length === filteredMessages.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {filteredMessages.length > 0 && selectedIds.length === filteredMessages.length ? 'Batal Pilih' : 'Pilih Semua'}
             </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredMessages.length === 0 ? (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada pesan masuk.</p>
                </CardContent>
            </Card>
        ) : (
            filteredMessages.map((msg: any) => (
            <Card key={msg.id} className={`transition-all hover:shadow-md ${selectedIds.includes(msg.id) ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <div className="p-4 flex items-start gap-4">
                    <Checkbox 
                        checked={selectedIds.includes(msg.id)} 
                        onCheckedChange={() => toggleSelect(msg.id)}
                        className="mt-1"
                    />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0 grid gap-1 cursor-pointer" onClick={() => setViewMessage(msg)}>
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">{msg.senderName}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(msg.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{msg.email}</p>
                        <p className="font-medium truncate">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {msg.message}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewMessage(msg)}>
                                <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(msg.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>
            ))
        )}
      </div>

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Pesan?` : "Hapus Pesan?"}
        description={deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus pesan yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
      
      {/* Dialog for View Message */}
      <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Pesan</DialogTitle>
            <DialogDescription>
              {viewMessage && `Diterima pada ${format(new Date(viewMessage.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}`}
            </DialogDescription>
          </DialogHeader>
          
          {viewMessage && (
            <div className="grid gap-4 py-4">
               <div className="space-y-1">
                 <h4 className="text-sm font-medium text-muted-foreground">Pengirim</h4>
                 <p className="font-medium">{viewMessage.senderName}</p>
               </div>
               <div className="space-y-1">
                 <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                 <p className="font-medium select-all">{viewMessage.email}</p>
               </div>
               <div className="space-y-1">
                 <h4 className="text-sm font-medium text-muted-foreground">Subjek</h4>
                 <p className="font-medium">{viewMessage.subject}</p>
               </div>
               <div className="space-y-1 pt-2 border-t mt-2">
                 <h4 className="text-sm font-medium text-muted-foreground mb-2">Pesan</h4>
                 <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap border">
                     {viewMessage.message}
                 </div>
               </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
             <Button variant="outline" onClick={() => setViewMessage(null)}>Tutup</Button>
             {viewMessage && (
                <Button variant="destructive" onClick={() => { handleDelete(viewMessage.id); setViewMessage(null); }} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Hapus Pesan
                </Button>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

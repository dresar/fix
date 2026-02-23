
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { api } from '../../services/api';
import { SkillCategory } from '@/types';

const categorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
    slug: z.string().optional(),
    order: z.coerce.number().optional().default(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function SkillCategoryManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            slug: '',
            order: 0,
        }
    });

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['skillCategories'],
        queryFn: api.skillCategories.getAll,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    const createMutation = useMutation({
        mutationFn: api.skillCategories.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
            form.reset();
            toast({ title: "Berhasil", description: "Kategori skill berhasil dibuat." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal membuat kategori skill." })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => api.skillCategories.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
            setEditingId(null);
            form.reset();
            toast({ title: "Berhasil", description: "Kategori skill berhasil diperbarui." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui kategori skill." })
    });

    const deleteMutation = useMutation({
        mutationFn: api.skillCategories.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
            toast({ title: "Terhapus", description: "Kategori skill berhasil dihapus." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus kategori skill." })
    });

    const onSubmit = (data: CategoryFormValues) => {
        if (!data.slug) {
            data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (category: SkillCategory) => {
        setEditingId(category.id!);
        form.setValue('name', category.name);
        form.setValue('slug', category.slug || '');
        form.setValue('order', category.order || 0);
    };

    const handleCancel = () => {
        setEditingId(null);
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Kategori
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manajemen Kategori Skill</DialogTitle>
                    <DialogDescription>
                        Tambah, ubah, atau hapus kategori skill.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* Form Section */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="p-4 border rounded-lg bg-card">
                            <h3 className="font-medium mb-4">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Kategori</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="Contoh: Frontend" 
                                        {...form.register('name')} 
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (Opsional)</Label>
                                    <Input 
                                        id="slug" 
                                        placeholder="frontend" 
                                        {...form.register('slug')} 
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Akan dibuat otomatis jika kosong.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order">Urutan</Label>
                                    <Input 
                                        id="order" 
                                        type="number"
                                        placeholder="0" 
                                        {...form.register('order')} 
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Urutan tampilan (angka terkecil tampil lebih dulu).
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button 
                                        type="submit" 
                                        className="flex-1"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {editingId ? 'Simpan' : 'Tambah'}
                                    </Button>
                                    {editingId && (
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon"
                                            onClick={handleCancel}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="md:col-span-2">
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Urutan</TableHead>
                                        <TableHead className="w-[100px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                Belum ada kategori.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category: SkillCategory) => (
                                            <TableRow key={category.id}>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{category.slug}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{category.order || 0}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => handleEdit(category)}
                                                        >
                                                            <Pencil className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => {
                                                                if (confirm('Yakin ingin menghapus kategori ini?')) {
                                                                    deleteMutation.mutate(category.id!);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

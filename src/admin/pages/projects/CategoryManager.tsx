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

const categorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
    slug: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            slug: '',
        }
    });

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['project-categories'],
        queryFn: api.projectCategories.getAll,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    const createMutation = useMutation({
        mutationFn: api.projectCategories.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-categories'] });
            form.reset();
            toast({ title: "Berhasil", description: "Kategori berhasil dibuat." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal membuat kategori." })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => api.projectCategories.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-categories'] });
            setEditingId(null);
            form.reset();
            toast({ title: "Berhasil", description: "Kategori berhasil diperbarui." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui kategori." })
    });

    const deleteMutation = useMutation({
        mutationFn: api.projectCategories.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-categories'] });
            toast({ title: "Terhapus", description: "Kategori berhasil dihapus." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus kategori." })
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

    const handleEdit = (category: any) => {
        setEditingId(category.id);
        form.reset({
            name: category.name,
            slug: category.slug,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Kelola Kategori
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Kategori Project</DialogTitle>
                    <DialogDescription>
                        Tambah, edit, atau hapus kategori project.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-end">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="name">{editingId ? 'Edit Kategori' : 'Kategori Baru'}</Label>
                            <Input
                                id="name"
                                placeholder="Nama kategori"
                                {...form.register('name')}
                            />
                        </div>
                        <div className="flex gap-1">
                            {editingId && (
                                <Button type="button" variant="ghost" size="icon" onClick={handleCancelEdit}>
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                            <Button type="submit" size="icon" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </form>
                    {form.formState.errors.name && (
                        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="border rounded-md max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                                            Belum ada kategori.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((cat: any) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-medium">
                                                {cat.name || '-'}
                                                {cat.slug && (
                                                    <span className="text-xs text-muted-foreground ml-2 block">
                                                        {cat.slug}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            if (confirm('Hapus kategori ini?')) deleteMutation.mutate(cat.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

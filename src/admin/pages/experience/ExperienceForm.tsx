
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIGenerateModal } from '@/admin/components/AIGenerateModal';
import { ModernLoader } from '@/components/ui/ModernLoader';

import { useQueryClient } from '@tanstack/react-query';

const experienceSchema = z.object({
  type: z.enum(['work', 'internship', 'organization']),
  role: z.string().min(1, "Posisi diperlukan"),
  company: z.string().min(1, "Nama Instansi/Perusahaan diperlukan"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai diperlukan"),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional(),
  image: z.string().url("URL Logo harus valid").optional().or(z.literal('')),
  gallery: z.array(z.object({
    url: z.string().url("URL Gambar harus valid")
  })).optional()
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperienceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      type: 'work',
      role: '',
      company: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      location: '',
      image: '',
      gallery: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "gallery"
  });

  useEffect(() => {
    if (id) {
      loadExperience(parseInt(id));
    }
  }, [id]);

  const loadExperience = async (experienceId: number) => {
    setIsLoading(true);
    try {
      const data = await api.experience.getAll(); // Assuming getAll returns list, we filter locally or need getById endpoint
      const experience = data.find((e: any) => e.id === experienceId);
      
      if (experience) {
        // Parse gallery if it's a string
        let galleryData = [];
        try {
            galleryData = typeof experience.gallery === 'string' 
                ? JSON.parse(experience.gallery) 
                : (experience.gallery || []);
        } catch (e) {
            galleryData = [];
        }

        form.reset({
          ...experience,
          type: 'work', // Default fallback as type might not be in DB or mapped differently
          startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
          endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
          gallery: Array.isArray(galleryData) ? galleryData.map((url: string) => ({ url })) : []
        });
      } else {
         toast({ variant: "destructive", title: "Error", description: "Pengalaman tidak ditemukan" });
         navigate('/admin/experience');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal memuat data", description: "Tidak dapat mengambil data pengalaman." });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExperienceFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
          ...data,
          endDate: data.isCurrent ? null : data.endDate,
          // Convert gallery array of objects back to simple array of strings or keep structure depending on backend
          gallery: JSON.stringify(data.gallery?.map(g => g.url) || [])
      };

      if (id) {
        await api.experience.update(parseInt(id), payload);
        toast({ title: "Berhasil", description: "Data pengalaman diperbarui." });
      } else {
        await api.experience.create(payload);
        toast({ title: "Berhasil", description: "Data pengalaman ditambahkan." });
      }
      await queryClient.invalidateQueries({ queryKey: ['experience'] });
      navigate('/admin/experience');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat Pengalaman..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/experience')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengalaman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tipe Pengalaman</Label>
                <Tabs 
                    defaultValue={form.watch('type')} 
                    onValueChange={(val) => form.setValue('type', val as any)}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="work">Kerja</TabsTrigger>
                        <TabsTrigger value="internship">Magang</TabsTrigger>
                        <TabsTrigger value="organization">Organisasi</TabsTrigger>
                    </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Nama Instansi / Perusahaan</Label>
                <Input id="company" {...form.register('company')} placeholder="Contoh: PT. Teknologi Maju" />
                {form.formState.errors.company && <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Posisi / Jabatan</Label>
                <Input id="role" {...form.register('role')} placeholder="Contoh: Senior Frontend Developer" />
                {form.formState.errors.role && <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input id="location" {...form.register('location')} placeholder="Contoh: Jakarta, Indonesia (Remote)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input type="date" id="startDate" {...form.register('startDate')} />
                {form.formState.errors.startDate && <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="endDate">Tanggal Selesai</Label>
                  <div className="flex items-center gap-2">
                    <Switch 
                        checked={form.watch('isCurrent')}
                        onCheckedChange={(checked) => form.setValue('isCurrent', checked)}
                    />
                    <Label className="text-sm text-muted-foreground">Masih Aktif</Label>
                  </div>
                </div>
                <Input 
                    type="date" 
                    id="endDate" 
                    {...form.register('endDate')} 
                    disabled={form.watch('isCurrent')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Deskripsi Pekerjaan</Label>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                    onClick={() => setIsAIModalOpen(true)}
                >
                    <Sparkles className="h-4 w-4 mr-2" /> Generate with AI
                </Button>
              </div>
              <Textarea 
                id="description" 
                {...form.register('description')} 
                placeholder="Jelaskan tanggung jawab dan pencapaian Anda..." 
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Media & Dokumentasi</h3>
              
              <div className="space-y-2">
                <Label htmlFor="image">URL Logo Perusahaan (CDN)</Label>
                <div className="flex gap-2">
                    <Input id="image" {...form.register('image')} placeholder="https://..." />
                    {form.watch('image') && (
                        <div className="h-10 w-10 relative rounded overflow-hidden border">
                            <img src={form.watch('image')} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Masukkan URL gambar langsung (Direct Link).</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Galeri Dokumentasi (Unlimited CDN)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ url: '' })}>
                        <Plus className="h-4 w-4 mr-2" /> Tambah Gambar
                    </Button>
                </div>
                
                {fields.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Belum ada dokumentasi. Tambahkan URL gambar untuk menampilkan galeri.
                    </div>
                )}

                <div className="grid gap-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                            <div className="grid gap-2 flex-1">
                                <Input 
                                    {...form.register(`gallery.${index}.url` as const)} 
                                    placeholder="https://example.com/image.jpg" 
                                />
                            </div>
                            {form.watch(`gallery.${index}.url`) && (
                                <div className="h-10 w-10 relative rounded overflow-hidden border shrink-0">
                                    <img 
                                        src={form.watch(`gallery.${index}.url`)} 
                                        alt={`Doc ${index + 1}`} 
                                        className="h-full w-full object-cover" 
                                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                                    />
                                </div>
                            )}
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/experience')}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? 'Simpan Perubahan' : 'Tambah Pengalaman'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AIGenerateModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={(text) => form.setValue('description', text, { shouldDirty: true })}
        contextData={{
            role: form.watch('role'),
            company: form.watch('company')
        }}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { api } from '../services/api';
import { Loader2, Save, User, MapPin, Mail, Phone, Link as LinkIcon, Image as ImageIcon, Map as MapIcon, Globe, Briefcase, Edit2, X, Plus, Trash2, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, CheckSquare, Square } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DeleteAlert } from "../components/DeleteAlert";

// --- Schemas ---

const profileSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap diperlukan"),
  greeting: z.string().optional(),
  role: z.string().optional(), // We will handle this as comma-separated string in the UI, convert to JSON on submit
  bio: z.string().optional(),
  shortBio: z.string().optional(),
  heroImage: z.string().optional(),
  aboutImage: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
  map_embed_url: z.string().optional(),
  stats_project_count: z.string().optional(),
  stats_exp_years: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
    // Custom state for Roles input (comma separated) to avoid fighting with JSON format in input
    const [rolesInput, setRolesInput] = useState("");
  
    // Update form value whenever rolesInput changes to ensure it's captured
    useEffect(() => {
        const rolesArray = rolesInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
        const rolesJson = JSON.stringify(rolesArray);
        // Only update if different to avoid loop (though setValue shouldn't trigger this effect)
        // Actually, we just need to make sure onSubmit uses the latest rolesInput, which it does.
        // But for live preview, we use rolesInput state directly.
    }, [rolesInput]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      greeting: '',
      role: '',
      bio: '',
      shortBio: '',
      heroImage: '',
      aboutImage: '',
      location: '',
      email: '',
      phone: '',
      resumeUrl: '',
      map_embed_url: '',
      stats_project_count: '',
      stats_exp_years: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      let data = await api.profile.get();
      
      // FIX: Handle Array if it slips through from API
      if (Array.isArray(data)) {
          data = data[0] || {};
      }

      if (data && Object.keys(data).length > 0) {
        // Parse roles JSON to comma-separated string for display
        let parsedRoles = "";
        try {
            const rawRole = data.role;
            if (Array.isArray(rawRole)) {
                parsedRoles = rawRole.join(", ");
            } else if (typeof rawRole === 'string' && (rawRole.startsWith('[') || rawRole.includes(','))) {
                 try {
                    const rolesArr = JSON.parse(rawRole);
                    if (Array.isArray(rolesArr)) parsedRoles = rolesArr.join(", ");
                    else parsedRoles = rawRole;
                 } catch {
                    parsedRoles = rawRole;
                 }
            } else {
                parsedRoles = String(rawRole || "");
            }
        } catch (e) {
            parsedRoles = data.role || "";
        }
        
        setRolesInput(parsedRoles);

        form.reset({
          fullName: data.fullName || '',
          greeting: data.greeting || '',
          role: data.role || '', 
          bio: data.bio || '',
          shortBio: data.shortBio || '',
          heroImage: data.heroImage || '',
          aboutImage: data.aboutImage || '',
          location: data.location || '',
          email: data.email || '',
          phone: data.phone || '',
          resumeUrl: data.resumeUrl || '',
          map_embed_url: data.map_embed_url || '',
          stats_project_count: data.stats_project_count || '',
          stats_exp_years: data.stats_exp_years || '',
        });
      } else {
         toast({ title: "Data Kosong", description: "Tidak ada data profil ditemukan dari server." });
      }
    } catch (error) {
      console.error("Load Profile Error:", error);
      toast({
        variant: "destructive",
        title: "Gagal memuat profil",
        description: "Terjadi kesalahan saat mengambil data profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Convert rolesInput string back to JSON array string
      const rolesArray = rolesInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
      const rolesJson = JSON.stringify(rolesArray);

      const payload = {
        ...data,
        role: rolesJson
      };

      await api.profile.update(payload);
      
      toast({
        title: "Profil disimpan",
        description: "Informasi profil Anda telah diperbarui.",
      });
      setIsEditing(false); // Disable editing mode after successful save
    } catch (error) {
      console.error("Save Error:", error);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan profil. Cek koneksi atau format data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
              const { latitude, longitude } = position.coords;
              // Simple placeholder, real reverse geocoding needs API Key
              form.setValue('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              toast({ title: "Lokasi Terdeteksi", description: "Koordinat berhasil diambil. (Reverse geocoding perlu API Google Maps)" });
          }, (err) => {
              toast({ variant: "destructive", title: "Gagal Deteksi", description: "Izin lokasi ditolak atau tidak tersedia." });
          });
      }
  };

  // Watch values for previews
  const heroImage = form.watch('heroImage');
  const aboutImage = form.watch('aboutImage');
  const mapEmbedUrl = form.watch('map_embed_url');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
      
      {/* Sticky Header Actions */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b flex justify-between items-center -mx-6 px-6 mb-6">
          <div>
              <h3 className="text-lg font-semibold">Edit Profil Utama</h3>
              <p className="text-sm text-muted-foreground">Update informasi yang tampil di halaman depan.</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profil
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditing(false);
                  loadProfile(); // Reset changes
                }}>
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="shadow-lg">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </>
            )}
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Informasi Dasar</CardTitle>
                    <CardDescription>Identitas utama yang muncul di Hero Section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nama Lengkap</Label>
                            <Input id="fullName" {...form.register('fullName')} placeholder="Nama Anda" disabled={!isEditing} />
                            {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="greeting">Sapaan (Greeting)</Label>
                            <Input id="greeting" {...form.register('greeting')} placeholder="Halo, Saya..." disabled={!isEditing} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rolesInput">Peran / Roles</Label>
                        <Input 
                            id="rolesInput" 
                            value={rolesInput} 
                            onChange={(e) => setRolesInput(e.target.value)} 
                            placeholder="Contoh: Web Developer, Backend Engineer, UI Designer" 
                            disabled={!isEditing}
                        />
                        <p className="text-xs text-muted-foreground">Pisahkan dengan koma (,). Sistem akan otomatis mengubahnya menjadi format array.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shortBio">Deskripsi Singkat (Hero)</Label>
                        <Textarea id="shortBio" {...form.register('shortBio')} className="min-h-[80px]" placeholder="Deskripsi pendek di bawah nama..." disabled={!isEditing} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografi Lengkap (About Page)</Label>
                        <Textarea id="bio" {...form.register('bio')} className="min-h-[150px]" placeholder="Cerita lengkap tentang pengalaman dan keahlian Anda..." disabled={!isEditing} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/> Statistik</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="stats_project_count">Jumlah Proyek (Angka)</Label>
                        <Input id="stats_project_count" {...form.register('stats_project_count')} placeholder="15" disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stats_exp_years">Tahun Pengalaman (Angka)</Label>
                        <Input id="stats_exp_years" {...form.register('stats_exp_years')} placeholder="4" disabled={!isEditing} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapIcon className="w-5 h-5"/> Lokasi & Peta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">Lokasi Teks</Label>
                        <div className="flex gap-2">
                            <Input id="location" {...form.register('location')} placeholder="Jakarta, Indonesia" disabled={!isEditing} />
                            <Button type="button" variant="outline" size="icon" onClick={handleAutoLocation} title="Deteksi Lokasi" disabled={!isEditing}>
                                <MapPin className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="map_embed_url">URL Embed Google Maps</Label>
                        <Input 
                            id="map_embed_url" 
                            {...form.register('map_embed_url')} 
                            placeholder="https://www.google.com/maps/embed?..." 
                            disabled={!isEditing}
                            onChange={(e) => {
                                let val = e.target.value;
                                // Auto-extract src from iframe tag if pasted
                                if (val.includes('<iframe') || val.includes('src=')) {
                                    const match = val.match(/src=["'](.*?)["']/);
                                    if (match && match[1]) {
                                        val = match[1].trim(); // Trim whitespace
                                        toast({ title: "Auto-Format", description: "Link peta berhasil diambil dari kode iframe." });
                                    }
                                }
                                form.setValue('map_embed_url', val, { shouldValidate: true, shouldDirty: true });
                            }}
                        />
                        <p className="text-xs text-muted-foreground">Paste link atau seluruh kode iframe dari Google Maps (akan otomatis diformat).</p>
                    </div>
                    {mapEmbedUrl && (
                        <div className="rounded-md border overflow-hidden h-[200px] bg-muted/20 mt-2">
                            <iframe 
                                key={mapEmbedUrl}
                                src={mapEmbedUrl} 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                allow="clipboard-write"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Media & Contact */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Media & Gambar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Hero Image */}
                    <div className="space-y-3">
                        <Label htmlFor="heroImage">Foto Profil Utama (Hero)</Label>
                        <Input id="heroImage" {...form.register('heroImage')} placeholder="https://..." disabled={!isEditing} />
                        
                        <div className="relative aspect-[3/4] w-full rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center">
                            {heroImage ? (
                                <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4 text-muted-foreground">
                                    <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <span className="text-xs">Preview Foto Utama</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* About Image */}
                    <div className="space-y-3">
                        <Label htmlFor="aboutImage">Foto Tentang Saya</Label>
                        <Input id="aboutImage" {...form.register('aboutImage')} placeholder="https://..." disabled={!isEditing} />
                        
                        <div className="relative aspect-video w-full rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center">
                            {aboutImage ? (
                                <img src={aboutImage} alt="About Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4 text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <span className="text-xs">Preview Foto About</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="resumeUrl">Link Resume / CV (PDF)</Label>
                        <Input id="resumeUrl" {...form.register('resumeUrl')} placeholder="https://..." disabled={!isEditing} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5"/> Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" {...form.register('email')} placeholder="email@example.com" disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp / Telepon</Label>
                        <Input id="phone" {...form.register('phone')} placeholder="+62..." disabled={!isEditing} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Bottom Section: Large Previews */}
      <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe className="w-5 h-5"/> Live Preview</h3>
          <div className="grid md:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/10 pb-4">
                      <CardTitle className="text-sm">Hero Section Preview</CardTitle>
                  </CardHeader>
                  <div className="p-6 flex items-center gap-6 bg-background">
                      <div className="flex-1 space-y-2">
                          <div className="text-sm text-primary font-medium">{form.watch('greeting') || 'Halo...'}</div>
                          <div className="text-2xl font-bold">{form.watch('fullName') || 'Nama Anda'}</div>
                          <div className="flex gap-2 flex-wrap">
                              {rolesInput.split(',').map((r, i) => r.trim() && (
                                  <Badge key={i} variant="secondary" className="text-xs">{r.trim()}</Badge>
                              ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">{form.watch('shortBio')}</p>
                      </div>
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                          {heroImage ? (
                              <img src={heroImage} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-xs">No Img</div>
                          )}
                      </div>
                  </div>
              </Card>

              <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/10 pb-4">
                      <CardTitle className="text-sm">About Section Preview</CardTitle>
                  </CardHeader>
                  <div className="p-6 flex flex-col gap-4 bg-background">
                      <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                              {aboutImage && <img src={aboutImage} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 space-y-1">
                              <div className="font-semibold">About Me</div>
                              <p className="text-xs text-muted-foreground line-clamp-4">{form.watch('bio')}</p>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-muted/20 p-2 rounded text-center">
                              <div className="text-lg font-bold text-primary">{form.watch('stats_project_count') || '0'}</div>
                              <div className="text-[10px] uppercase text-muted-foreground">Projects</div>
                          </div>
                          <div className="bg-muted/20 p-2 rounded text-center">
                              <div className="text-lg font-bold text-primary">{form.watch('stats_exp_years') || '0'}</div>
                              <div className="text-[10px] uppercase text-muted-foreground">Years Exp</div>
                          </div>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </form>
  );
}

const socialSchema = z.object({
    platform: z.string().min(1, "Platform diperlukan"),
    url: z.string().url("URL tidak valid"),
    icon: z.string().optional(),
});

type SocialFormValues = z.infer<typeof socialSchema>;

function SocialsTab() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteAlert, setDeleteAlert] = useState<{
        isOpen: boolean;
        id?: number;
        isBulk?: boolean;
    }>({ isOpen: false });
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<SocialFormValues>({
        resolver: zodResolver(socialSchema),
        defaultValues: {
            platform: '',
            url: '',
            icon: '',
        }
    });

    const { data: socials = [], isLoading } = useQuery({
        queryKey: ['social-links'],
        queryFn: api.socialLinks.getAll,
    });

    const createMutation = useMutation({
        mutationFn: api.socialLinks.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-links'] });
            setIsDialogOpen(false);
            form.reset();
            toast({ title: "Berhasil", description: "Link sosial media ditambahkan." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menambahkan link." })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => api.socialLinks.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-links'] });
            setIsDialogOpen(false);
            setEditingId(null);
            form.reset();
            toast({ title: "Berhasil", description: "Link sosial media diperbarui." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui link." })
    });

    const deleteMutation = useMutation({
        mutationFn: api.socialLinks.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-links'] });
            toast({ title: "Terhapus", description: "Link sosial media dihapus." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus link." })
    });

    const handleDelete = (id: number) => {
        setDeleteAlert({ isOpen: true, id, isBulk: false });
    };

    const handleBulkDelete = () => {
        setDeleteAlert({ isOpen: true, isBulk: true });
    };

    const confirmDelete = async () => {
        try {
            if (deleteAlert.isBulk) {
                await api.socialLinks.bulkDelete(selectedIds);
                toast({ title: "Berhasil", description: `${selectedIds.length} link dihapus.` });
                setSelectedIds([]);
                queryClient.invalidateQueries({ queryKey: ['social-links'] });
            } else if (deleteAlert.id) {
                deleteMutation.mutate(deleteAlert.id);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
        } finally {
            setDeleteAlert({ isOpen: false });
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === socials.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(socials.map((s: any) => s.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const onSubmit = (data: SocialFormValues) => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (social: any) => {
        setEditingId(social.id);
        form.reset({
            platform: social.platform,
            url: social.url,
            icon: social.icon || '',
        });
        setIsDialogOpen(true);
    };

    const getIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('github')) return <Github className="w-4 h-4" />;
        if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4" />;
        if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
        if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
        if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
        return <LinkIcon className="w-4 h-4" />;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Media Sosial</CardTitle>
                    <CardDescription>Tautkan profil sosial media Anda.</CardDescription>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
                        </Button>
                    )}
                    <Button variant="outline" onClick={toggleSelectAll}>
                        {socials.length > 0 && selectedIds.length === socials.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                        {socials.length > 0 && selectedIds.length === socials.length ? 'Batal Pilih' : 'Pilih Semua'}
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setEditingId(null); form.reset(); }}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Link' : 'Tambah Link Sosial Media'}</DialogTitle>
                            <DialogDescription>
                                Masukkan detail platform dan URL profil Anda.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Platform</Label>
                                <Select 
                                    onValueChange={(val) => form.setValue('platform', val)} 
                                    defaultValue={form.watch('platform')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GitHub">GitHub</SelectItem>
                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                        <SelectItem value="Twitter">Twitter / X</SelectItem>
                                        <SelectItem value="Instagram">Instagram</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="YouTube">YouTube</SelectItem>
                                        <SelectItem value="Website">Website / Blog</SelectItem>
                                        <SelectItem value="Other">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.watch('platform') === 'Other' && (
                                    <Input {...form.register('platform')} placeholder="Nama Platform Lain" className="mt-2" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>URL Profil</Label>
                                <Input {...form.register('url')} placeholder="https://..." />
                                {form.formState.errors.url && <p className="text-xs text-destructive">{form.formState.errors.url.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {socials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        Belum ada link sosial media.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                socials.map((social: any) => (
                                    <TableRow key={social.id}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedIds.includes(social.id)} 
                                                onCheckedChange={() => toggleSelect(social.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {getIcon(social.platform)}
                                            {social.platform}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            <a href={social.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                                                {social.url}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(social)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if(confirm('Yakin ingin menghapus?')) deleteMutation.mutate(social.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <DeleteAlert
                isOpen={deleteAlert.isOpen}
                onClose={() => setDeleteAlert({ isOpen: false })}
                onConfirm={confirmDelete}
                title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Link?` : "Hapus Link?"}
                description={
                    deleteAlert.isBulk
                        ? "Apakah Anda yakin ingin menghapus link sosial media yang dipilih? Tindakan ini tidak dapat dibatalkan."
                        : "Apakah Anda yakin ingin menghapus link sosial media ini? Tindakan ini tidak dapat dibatalkan."
                }
            />
        </Card>
    );
}

export default function AboutContentPage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tentang Saya & Profil</h2>
          <p className="text-muted-foreground">Kelola informasi pribadi, statistik, dan tampilan visual.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="profile">Profil Utama</TabsTrigger>
          <TabsTrigger value="socials">Media Sosial</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="socials" className="space-y-4">
          <SocialsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

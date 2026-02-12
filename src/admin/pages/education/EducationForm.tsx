
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2, Plus, Image as ImageIcon, Loader2, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { useQueryClient } from '@tanstack/react-query';

export default function EducationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    gpa: '',
    logo: '',
    coverImage: '',
    location: '',
    mapUrl: '',
    description: '',
    gallery: '[]'
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadEducation(Number(id));
    }
  }, [id]);

  const loadEducation = async (eduId: number) => {
    setIsLoading(true);
    try {
      const data = await api.education.getAll(); // Ideally use getOne if available
      const edu = data.find((e: any) => e.id === eduId);
      if (edu) {
        setFormData({
            institution: edu.institution,
            degree: edu.degree || '',
            field: edu.field || '',
            startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
            endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
            gpa: edu.gpa || '',
            logo: edu.logo || '',
            coverImage: edu.coverImage || '',
            location: edu.location || '',
            mapUrl: edu.mapUrl || '',
            description: edu.description || '',
            gallery: typeof edu.gallery === 'string' ? edu.gallery : JSON.stringify(edu.gallery || [])
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal memuat data." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Basic Validation
      if (!formData.institution) throw new Error("Nama Institusi wajib diisi");
      if (!formData.startDate) throw new Error("Tanggal Mulai wajib diisi");

      const payload = {
        ...formData,
        logo_url: formData.logo,
        cover_image: formData.coverImage,
        endDate: formData.endDate || null,
      };

      if (id && id !== 'new') {
        await api.education.update(Number(id), payload);
        toast({ title: "Berhasil", description: "Data pendidikan diperbarui." });
      } else {
        await api.education.create(payload);
        toast({ title: "Berhasil", description: "Data pendidikan ditambahkan." });
      }
      await queryClient.invalidateQueries({ queryKey: ['education'] });
      navigate('/admin/education');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal", description: error.message || "Terjadi kesalahan saat menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGalleryImage = () => {
    const url = prompt("Masukkan URL Gambar Galeri (CDN):");
    if (url) {
        if (!url.startsWith('http')) {
            toast({ variant: "destructive", title: "Error", description: "URL tidak valid." });
            return;
        }
        const current = JSON.parse(formData.gallery || '[]');
        const updated = [...current, url];
        setFormData({...formData, gallery: JSON.stringify(updated)});
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
      const current = JSON.parse(formData.gallery || '[]');
      const updated = current.filter((_: any, i: number) => i !== index);
      setFormData({...formData, gallery: JSON.stringify(updated)});
  };

  if (isLoading) return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat Pendidikan..." /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/education')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{id === 'new' ? 'Tambah Pendidikan Baru' : 'Edit Pendidikan'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Akademik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Institusi / Sekolah <span className="text-red-500">*</span></Label>
                            <Input 
                                value={formData.institution} 
                                onChange={(e) => setFormData({...formData, institution: e.target.value})} 
                                placeholder="Contoh: Universitas Indonesia"
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Gelar (Degree)</Label>
                                <Input 
                                    value={formData.degree} 
                                    onChange={(e) => setFormData({...formData, degree: e.target.value})} 
                                    placeholder="Contoh: Sarjana Komputer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bidang Studi (Field)</Label>
                                <Input 
                                    value={formData.field} 
                                    onChange={(e) => setFormData({...formData, field: e.target.value})} 
                                    placeholder="Contoh: Teknik Informatika"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tanggal Mulai <span className="text-red-500">*</span></Label>
                                <Input 
                                    type="date"
                                    value={formData.startDate} 
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Selesai</Label>
                                <Input 
                                    type="date"
                                    value={formData.endDate} 
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                                />
                                <p className="text-xs text-muted-foreground">Biarkan kosong jika masih menempuh pendidikan.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Lokasi (Kota, Negara)</Label>
                                <Input 
                                    value={formData.location} 
                                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                                    placeholder="Jakarta, Indonesia"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nilai Akhir / GPA</Label>
                                <Input 
                                    value={formData.gpa} 
                                    onChange={(e) => setFormData({...formData, gpa: e.target.value})} 
                                    placeholder="3.85 / 4.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Google Maps Embed URL</Label>
                            <Input 
                                value={formData.mapUrl} 
                                onChange={(e) => {
                                    let val = e.target.value;
                                    // Auto extract src if iframe tag is pasted
                                    if (val.includes('<iframe') && val.includes('src="')) {
                                        const match = val.match(/src="([^"]+)"/);
                                        if (match && match[1]) {
                                            val = match[1];
                                        }
                                    }
                                    setFormData({...formData, mapUrl: val});
                                }} 
                                placeholder="https://www.google.com/maps/embed?..."
                            />
                            {formData.mapUrl && (
                                <div className="aspect-video w-full rounded-md overflow-hidden border mt-2 bg-muted">
                                    <iframe 
                                        key={formData.mapUrl}
                                        src={formData.mapUrl} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen 
                                        loading="lazy"
                                        title="Map Preview"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Deskripsi Lengkap</Label>
                            <Textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                placeholder="Ceritakan pengalaman, pencapaian, organisasi, atau detail aktivitas..."
                                className="min-h-[150px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Galeri Foto</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddGalleryImage}>
                            <Plus className="h-4 w-4 mr-2" /> Tambah Foto
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {JSON.parse(formData.gallery || '[]').map((url: string, idx: number) => (
                                <div key={idx} className="relative aspect-video group bg-muted rounded-lg overflow-hidden border">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleRemoveGalleryImage(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {JSON.parse(formData.gallery || '[]').length === 0 && (
                                <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada foto galeri</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Media & Actions */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Media & Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Logo Institusi (URL)</Label>
                            <div className="flex gap-2">
                                <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {formData.logo ? <img src={formData.logo} className="h-full w-full object-contain p-1" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                                </div>
                                <Input 
                                    value={formData.logo} 
                                    onChange={(e) => setFormData({...formData, logo: e.target.value})} 
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Cover Image (URL)</Label>
                             <div className="aspect-video w-full rounded border bg-muted flex items-center justify-center overflow-hidden mb-2">
                                    {formData.coverImage ? <img src={formData.coverImage} className="w-full h-full object-cover" /> : <p className="text-xs text-muted-foreground">Preview Cover</p>}
                                </div>
                            <Input 
                                value={formData.coverImage} 
                                onChange={(e) => setFormData({...formData, coverImage: e.target.value})} 
                                placeholder="https://example.com/cover.jpg"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/admin/education')}>
                        Batal
                    </Button>
                    <Button type="submit" className="w-full" disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Simpan Data
                    </Button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}

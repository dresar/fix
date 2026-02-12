import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { CertificateCategoryManager } from './CertificateCategoryManager';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ModernLoader } from '@/components/ui/ModernLoader';

export default function CertificateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: categories = [] } = useQuery({
    queryKey: ['certificate-categories'],
    queryFn: api.certificateCategories.getAll,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    image: '',
    verified: false,
    credentialId: '',
    categoryId: 0
  });

  useEffect(() => {
    if (isEditing) {
      loadCertificate(Number(id));
    }
  }, [id]);

  // Removed loadCategories since useQuery handles it


  const loadCertificate = async (certId: number) => {
    setIsLoading(true);
    try {
      // Since we don't have a direct getById in the api client for certificates (it uses getAll),
      // we might need to fetch all and find, or implement getById.
      // Looking at the api.ts, there is no getById for certificates, only getAll.
      // However, usually there should be one. Let's try to see if we can find it in the list or if we should add it.
      // For now, I'll fetch all and find, but ideally we should add getById.
      // Wait, let's check if the backend supports GET /certificates/:id.
      // resume.routes.ts has: router.get('/certificates', publicApiGuard, resumeController.getCertificates);
      // It DOES NOT seem to have a specific GET /certificates/:id.
      // So I must fetch all and find locally for now, or update backend (which I can't easily do without seeing controller).
      // But wait, the previous modal implementation passed the certificate object directly.
      // Here I am reloading the page, so I need to fetch.
      
      const allCerts = await api.certificates.getAll();
      const cert = allCerts.find(c => c.id === certId);
      
      if (cert) {
        setFormData({
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
          credentialUrl: cert.credentialUrl || '',
          image: cert.image || '',
          verified: cert.verified || false,
          credentialId: cert.credentialId || '',
          categoryId: cert.categoryId || 0
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Sertifikat tidak ditemukan." });
        navigate('/admin/certificates');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal memuat sertifikat." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.issuer || !formData.issueDate) {
        toast({ variant: "destructive", title: "Validasi Gagal", description: "Mohon lengkapi nama, penerbit, dan tanggal terbit." });
        return;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
        toast({ variant: "destructive", title: "Validasi Gagal", description: "Mohon pilih kategori." });
        return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        issueDate: new Date(formData.issueDate),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        image: formData.image === '' ? null : formData.image,
        credentialUrl: formData.credentialUrl === '' ? null : formData.credentialUrl,
        credentialId: formData.credentialId === '' ? null : formData.credentialId,
      };

      if (isEditing) {
        await api.certificates.update(Number(id), payload);
        toast({ title: "Berhasil", description: "Sertifikat diperbarui." });
      } else {
        await api.certificates.create(payload);
        toast({ title: "Berhasil", description: "Sertifikat ditambahkan." });
      }
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      navigate('/admin/certificates');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><ModernLoader size="lg" text="Memuat Sertifikat..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/certificates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Sertifikat' : 'Tambah Sertifikat'}</h2>
          <p className="text-muted-foreground">{isEditing ? 'Perbarui data sertifikat.' : 'Tambahkan sertifikat baru ke portofolio.'}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Sertifikat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nama Sertifikat</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: AWS Certified Cloud Practitioner" />
              </div>
              <div className="space-y-2">
                <Label>Penerbit (Issuer)</Label>
                <Input value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} required placeholder="Contoh: Amazon Web Services" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tanggal Terbit</Label>
                <Input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Kadaluarsa (Opsional)</Label>
                <Input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ID Kredensial (Opsional)</Label>
              <Input value={formData.credentialId} onChange={e => setFormData({...formData, credentialId: e.target.value})} placeholder="Contoh: AKIAIOSFODNN7EXAMPLE" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Kategori</Label>
                <CertificateCategoryManager />
              </div>
              <Select 
                value={formData.categoryId ? formData.categoryId.toString() : "0"} 
                onValueChange={(val) => setFormData({...formData, categoryId: Number(val)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pilih Kategori...</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.verified}
                onChange={e => setFormData({...formData, verified: e.target.checked})}
              />
              <Label htmlFor="verified">Verified</Label>
            </div>

            <div className="space-y-2">
              <Label>URL Kredensial</Label>
              <Input value={formData.credentialUrl} onChange={e => setFormData({...formData, credentialUrl: e.target.value})} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label>Gambar Sertifikat (URL)</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                </div>
                {formData.image && (
                  <div className="h-20 w-20 rounded border overflow-hidden flex-shrink-0 bg-muted">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/certificates')}>Batal</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/admin/services/api';
import { useToast } from '@/components/ui/use-toast';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
  contextData?: {
    role: string;
    company: string;
  };
}

export function AIGenerateModal({ isOpen, onClose, onGenerate, contextData }: AIGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const fullPrompt = `
        Tugas: Buatkan deskripsi pengalaman kerja (bullet points) untuk CV/Portfolio saya.
        
        Konteks Saya:
        Posisi: ${contextData?.role || 'Tidak spesifik'}
        Perusahaan: ${contextData?.company || 'Tidak spesifik'}
        
        Instruksi Tambahan: ${prompt}
        
        Aturan Ketat (Wajib Dipatuhi):
        1. OUTPUT LANGSUNG ke poin-poin deskripsi pekerjaan. JANGAN ada kata pengantar (intro) seperti "Tentu", "Berikut adalah", "Posisi:", dll.
        2. JANGAN ada penutup (outro) seperti "Semoga membantu", dll.
        3. JANGAN buat format lowongan kerja (Qualifications, About Company). Ini adalah PENGALAMAN KERJA yang sudah dilakukan.
        4. Gunakan sudut pandang orang pertama (saya) namun implisit (contoh: "Memimpin tim..." bukan "Saya memimpin tim...").
        5. Bahasa Indonesia profesional, modern, dan mengalir (tidak kaku/robotik).
        6. Fokus pada ACTION dan RESULT (Dampak).
        7. DILARANG menggunakan simbol markdown tebal/miring (**bold**/*italic*) atau header (###). Gunakan plain text dengan bullet points (-).
      `;

      // Call AI Service (We'll reuse project summary endpoint or create new one)
      // For now, assuming we use a generic AI endpoint
      const response = await api.ai.generateContent({ 
        prompt: fullPrompt,
        systemInstruction: "Kamu adalah penulis CV profesional. Tugasmu hanya menulis isi deskripsi pengalaman kerja secara langsung tanpa basa-basi."
      });
      
      onGenerate(response.content);
      onClose();
      toast({ title: "Berhasil", description: "Deskripsi berhasil dibuat oleh AI." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "Gagal men-generate konten." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Deskripsi dengan AI
          </DialogTitle>
          <DialogDescription>
            Masukkan instruksi tambahan untuk membantu AI membuat deskripsi pekerjaan yang lebih akurat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Instruksi untuk AI (Opsional)</Label>
            <Textarea 
              placeholder="Contoh: Fokuskan pada pengalaman saya memimpin tim 5 orang dan meningkatkan omzet 20%..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan jika ingin AI membuatkan deskripsi umum berdasarkan posisi dan perusahaan.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
          <Button onClick={handleGenerate} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Berpikir...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Sekarang
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

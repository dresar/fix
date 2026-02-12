
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Code2, 
  Server, 
  Layout, 
  Database, 
  Terminal, 
  Palette, 
  Cpu, 
  Globe,
  MoreVertical,
  CheckSquare,
  Square 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";

// Helper to get icon based on category
const getCategoryIcon = (category: string | any) => {
  let catName = 'code';
  
  if (typeof category === 'string') {
    catName = category;
  } else if (typeof category === 'object' && category !== null) {
    catName = category.name || category.slug || 'code';
  }
  
  const lower = String(catName || '').toLowerCase();
  
  if (lower.includes('front')) return <Layout className="h-8 w-8 text-blue-500" />;
  if (lower.includes('back')) return <Server className="h-8 w-8 text-green-500" />;
  if (lower.includes('db') || lower.includes('data')) return <Database className="h-8 w-8 text-amber-500" />;
  if (lower.includes('devops') || lower.includes('cloud')) return <Terminal className="h-8 w-8 text-purple-500" />;
  if (lower.includes('design') || lower.includes('ui')) return <Palette className="h-8 w-8 text-pink-500" />;
  return <Code2 className="h-8 w-8 text-primary" />;
};

export default function SkillList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<any>(null);
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    percentage: 50
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: api.skills.getAll,
    // Stale time handled globally in App.tsx (Infinity)
  });

  // Removed loader
  // const isLoading = isSkillLoading;

  const toggleSelectAll = () => {
    if (selectedIds.length === skills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(skills.map(s => s.id));
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
        await api.skills.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} skill dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.skills.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Skill dihapus." });
        // loadSkills is not needed as we use react-query invalidation below, 
        // but if loadSkills is defined elsewhere we might need to check. 
        // Actually the original code had loadSkills() which seems undefined in the snippet I read?
        // Wait, line 147 in Read output says `loadSkills();`. But I don't see `loadSkills` defined in the file snippet I read.
        // It uses `useQuery` now. So `queryClient.invalidateQueries` is correct.
      }
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setDeleteAlert({ isOpen: false });
    }
  };

  const handleOpenModal = (skill?: any) => {
    if (skill) {
      setCurrentSkill(skill);
      setFormData({
        name: skill.name,
        category: typeof skill.category === 'object' && skill.category ? (skill.category.name || 'Frontend') : (skill.category || 'Frontend'),
        percentage: skill.percentage || skill.proficiency || 50
      });
    } else {
      setCurrentSkill(null);
      setFormData({
        name: '',
        category: 'Frontend',
        percentage: 50
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentSkill) {
        await api.skills.update(currentSkill.id, formData);
        toast({ title: "Berhasil", description: "Skill berhasil diperbarui." });
      } else {
        await api.skills.create(formData);
        toast({ title: "Berhasil", description: "Skill berhasil ditambahkan." });
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan skill." });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
          <p className="text-muted-foreground">Kelola kemampuan dan keahlian teknis Anda.</p>
        </div>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
                </Button>
            )}
            <Button variant="outline" onClick={toggleSelectAll}>
                {skills.length > 0 && selectedIds.length === skills.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {skills.length > 0 && selectedIds.length === skills.length ? 'Batal Pilih' : 'Pilih Semua'}
            </Button>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Skill
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Loader removed */}
        {skills.filter((skill: any) => skill && skill.id).map((skill) => (
          <Card key={skill.id} className={`relative group overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${selectedIds.includes(skill.id) ? 'ring-2 ring-primary' : ''}`} style={{ borderLeftColor: (skill.percentage || skill.proficiency || 0) >= 80 ? '#22c55e' : (skill.percentage || skill.proficiency || 0) >= 50 ? '#eab308' : '#ef4444' }}>
            <div className="absolute top-2 right-2 z-20">
                 <Checkbox 
                     checked={selectedIds.includes(skill.id)} 
                     onCheckedChange={() => toggleSelect(skill.id)}
                 />
            </div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-secondary/50 rounded-lg">
                  {getCategoryIcon(skill.category)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenModal(skill)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(skill.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg">{skill.name}</h3>
                <Badge variant="secondary" className="text-xs font-normal">
                  {typeof skill.category === 'object' && skill.category !== null ? (skill.category.name || 'Unknown') : (skill.category || 'Unknown')}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Proficiency</span>
                  <span className="font-medium">{Number(skill.percentage || skill.proficiency) || 0}%</span>
                </div>
                <Progress value={Number(skill.percentage || skill.proficiency) || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSkill ? 'Edit Skill' : 'Tambah Skill Baru'}</DialogTitle>
            <DialogDescription>
              {currentSkill ? 'Perbarui informasi skill yang sudah ada.' : 'Tambahkan skill baru ke dalam daftar keahlian Anda.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Skill</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Contoh: React.js"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frontend">Frontend Development</SelectItem>
                  <SelectItem value="Backend">Backend Development</SelectItem>
                  <SelectItem value="Fullstack">Fullstack</SelectItem>
                  <SelectItem value="DevOps">DevOps & Cloud</SelectItem>
                  <SelectItem value="Mobile">Mobile App</SelectItem>
                  <SelectItem value="UI/UX">UI/UX Design</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Tools">Tools & Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Tingkat Keahlian</Label>
                <span className="text-sm font-medium text-muted-foreground">{formData.percentage}%</span>
              </div>
              <Slider 
                defaultValue={[formData.percentage]} 
                max={100} 
                step={5} 
                onValueChange={(vals) => setFormData({...formData, percentage: vals[0]})}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Skill?` : "Hapus Skill?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus skill yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus skill ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

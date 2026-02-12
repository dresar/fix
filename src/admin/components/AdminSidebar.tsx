import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Package,
  Layers,
  MessageSquare,
  BarChart,
  Shield,
  Briefcase,
  GraduationCap,
  Award,
  Zap,
  MessageCircle,
  User,
  Bot,
  Mail
} from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavLink, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Mail, label: 'Pesan Masuk', path: '/admin/messages' },
  { icon: User, label: 'Tentang Saya', path: '/admin/about-content' },
  { icon: Briefcase, label: 'Pengalaman', path: '/admin/experience' },
  { icon: Briefcase, label: 'Proyek', path: '/admin/projects' },
  { icon: Zap, label: 'Keahlian', path: '/admin/skills' },
  { icon: GraduationCap, label: 'Pendidikan', path: '/admin/education' },
  { icon: Award, label: 'Sertifikat', path: '/admin/certificates' },
  { icon: FileText, label: 'Blog', path: '/admin/blog' },
  { icon: MessageSquare, label: 'Komentar', path: '/admin/blog/comments' },
  { icon: MessageCircle, label: 'WhatsApp', path: '/admin/communication/wa' },
  { icon: Bot, label: 'AI Settings', path: '/admin/ai-settings' },
  { icon: Settings, label: 'Pengaturan', path: '/admin/settings' },
];

export function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-200 ease-in-out h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1.5 px-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isOpen && onClose()} // Close on mobile click
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

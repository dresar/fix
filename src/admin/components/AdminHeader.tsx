import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { LogOut, User, Settings, ExternalLink, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../services/api";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { logout, user, updateUser } = useAdminAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Fetch Admin User instead of Public Profile
        const data = await api.auth.getMe();
        if (data) {
            updateUser(data);
        }
      } catch (e) {
        console.error("Failed to load header profile", e);
      }
    };
    loadProfile();
  }, [updateUser]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Use user from store as primary source
  const adminName = user?.name || user?.username || "Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();
  const adminAvatar = user?.avatar || "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex-1">
        <h2 className="text-lg font-semibold md:text-xl truncate">Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="outline" size="sm" asChild className="hidden md:flex">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Lihat Website
          </a>
        </Button>
        
        {/* Mobile View Website Icon */}
        <Button variant="ghost" size="icon" asChild className="md:hidden">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-5 w-5" />
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarImage src={adminAvatar} alt={adminName} />
                <AvatarFallback>{adminInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{adminName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

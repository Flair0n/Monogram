import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LayoutDashboard, Settings, User, LogOut } from "lucide-react";

export function ProfileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === '/profile') {
      return location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`h-auto p-0 rounded-full hover:opacity-80 transition-opacity duration-250 focus:outline-none ${
            isActive('/profile') ? 'ring-2 ring-sage/30' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-sage/10 border-2 border-sage/20 flex items-center justify-center hover:border-sage/40 transition-colors duration-250">
            <span className="text-sm font-medium text-sage tracking-tight">
              {user ? getInitials(user.name) : 'U'}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 mt-2 z-[100] p-2" onCloseAutoFocus={(e: Event) => e.preventDefault()}>
        <DropdownMenuLabel className="py-4 px-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage/10 border-2 border-sage/20 flex items-center justify-center">
              <span className="text-base font-medium text-sage tracking-tight">
                {user ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base">{user?.name}</span>
              <span className="text-sm text-muted-foreground font-normal">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <div className="py-1 space-y-1">
          <DropdownMenuItem onClick={() => navigate('/dashboard')} className="py-3 px-3 cursor-pointer">
            <LayoutDashboard className="w-4 h-4 mr-3" strokeWidth={1.5} />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')} className="py-3 px-3 cursor-pointer">
            <Settings className="w-4 h-4 mr-3" strokeWidth={1.5} />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/profile')} className="py-3 px-3 cursor-pointer">
            <User className="w-4 h-4 mr-3" strokeWidth={1.5} />
            Profile
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="my-2" />
        <div className="py-1">
          <DropdownMenuItem onClick={handleLogout} className="py-3 px-3 cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-3" strokeWidth={1.5} />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '../ui/separator';
import { Edit3, LayoutDashboard, Settings } from 'lucide-react';
import { ProfileHeader } from '../ProfileHeader';
import { useSpace } from '../../contexts/SpaceContext';

interface MainLayoutProps {
  children: ReactNode;
  showStats?: boolean;
  stats?: {
    activeSpaces: number;
    unreadUpdates: number;
    totalCommunity: number;
  };
}

export function MainLayout({ children, showStats, stats }: MainLayoutProps) {
  const location = useLocation();
  const { isInSpace, currentSpace } = useSpace();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    if (path === '/profile') {
      return location.pathname.startsWith('/profile');
    }
    return location.pathname.startsWith(path);
  };

  // Determine settings path based on context
  const settingsPath = isInSpace 
    ? `/spaces/${currentSpace?.id}/settings` 
    : '/settings';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF5]">
      {/* Header Navigation - Enhanced height and spacing */}
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Spacer for centering on desktop */}
          <div className="flex-1 hidden md:block"></div>

          {/* Center: Logo - Larger with tighter tracking */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2.5 md:gap-3 hover:opacity-70 transition-opacity duration-300"
          >
            <Edit3 className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
            <span className="text-2xl md:text-[28px] font-medium tracking-tighter">Monogram</span>
          </Link>

          {/* Right: Navigation Icons + Space Badge + User Avatar */}
          <nav className="flex-1 flex items-center justify-end gap-4 md:gap-8">
            {isInSpace && currentSpace && (
              <>
                <div className="hidden lg:flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-sage/5 border border-sage/20">
                  <span className="text-foreground/60">Space:</span>
                  <span className="font-medium">{currentSpace.name}</span>
                </div>
                <Separator orientation="vertical" className="hidden lg:block h-6 bg-black/10" />
              </>
            )}

            <Link
              to="/dashboard"
              className={`p-2 md:p-2.5 rounded-lg transition-all duration-250 ${
                isActive('/dashboard') 
                  ? 'bg-sage/10 text-sage' 
                  : 'text-foreground/40 hover:text-foreground/70 hover:bg-black/5'
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
            </Link>

            <Link
              to={settingsPath}
              className={`p-2 md:p-2.5 rounded-lg transition-all duration-250 ${
                isActive('/settings') || isActive(`/spaces/${currentSpace?.id}/settings`) 
                  ? 'bg-sage/10 text-sage' 
                  : 'text-foreground/40 hover:text-foreground/70 hover:bg-black/5'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </Link>

            <ProfileHeader />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

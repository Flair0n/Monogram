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
    return location.pathname.startsWith(path);
  };

  // Determine settings label based on context
  const settingsLabel = isInSpace ? 'Space Settings' : 'Settings';
  const settingsPath = isInSpace 
    ? `/spaces/${currentSpace?.id}/settings` 
    : '/settings';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Edit3 className="w-6 h-6" />
            <span className="text-xl">Monogram</span>
          </Link>

          <nav className="flex items-center gap-6">
            {isInSpace && currentSpace && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Space:</span>
                  <span className="font-medium">{currentSpace.name}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            <Link
              to="/dashboard"
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to={settingsPath}
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/settings') || isActive(`/spaces/${currentSpace?.id}/settings`) 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              {settingsLabel}
            </Link>

            <Separator orientation="vertical" className="h-6" />

            <ProfileHeader />
          </nav>
        </div>

        {/* Global Stats Bar */}
        {showStats && stats && (
          <div className="border-t border-border bg-muted/30">
            <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-medium">{stats.activeSpaces}</p>
                <p className="text-xs text-muted-foreground">Active Spaces</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-medium">{stats.unreadUpdates}</p>
                <p className="text-xs text-muted-foreground">Unread Updates</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-medium">{stats.totalCommunity}</p>
                <p className="text-xs text-muted-foreground">Total Community</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

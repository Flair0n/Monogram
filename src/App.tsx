import { useState } from 'react';
import { HeroPage } from './components/HeroPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SpaceOverview } from './components/SpaceOverview';
import { CuratorPanel } from './components/CuratorPanel';
import { ResponseEditor } from './components/ResponseEditor';
import { NewsletterPage } from './components/NewsletterPage';
import { MembersPage } from './components/MembersPage';
import { SettingsPage } from './components/SettingsPage';

type View = 'hero' | 'login' | 'dashboard' | 'space' | 'curator' | 'editor' | 'newsletter' | 'members' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('1');
  const [showWelcome, setShowWelcome] = useState(false);

  const handleNavigate = (view: string, spaceId?: string) => {
    console.log('Navigating from', currentView, 'to', view);
    
    // Show welcome message when navigating to dashboard from login
    if (view === 'dashboard' && currentView === 'login') {
      console.log('Setting showWelcome to true');
      setShowWelcome(true);
    }
    
    setCurrentView(view as View);
    if (spaceId) {
      setCurrentSpaceId(spaceId);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'hero':
        return <HeroPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} showWelcome={showWelcome} onWelcomeClose={() => setShowWelcome(false)} />;
      case 'space':
        return <SpaceOverview onNavigate={handleNavigate} spaceId={currentSpaceId} />;
      case 'curator':
        return <CuratorPanel onNavigate={handleNavigate} />;
      case 'editor':
        return <ResponseEditor onNavigate={handleNavigate} />;
      case 'newsletter':
        return <NewsletterPage onNavigate={handleNavigate} />;
      case 'members':
        return <MembersPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <HeroPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
    </div>
  );
}

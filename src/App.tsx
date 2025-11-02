import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { SpaceOverview } from './components/SpaceOverview';
import { CuratorPanel } from './components/CuratorPanel';
import { ResponseEditor } from './components/ResponseEditor';
import { NewsletterPage } from './components/NewsletterPage';
import { MembersPage } from './components/MembersPage';
import { SettingsPage } from './components/SettingsPage';

type View = 'dashboard' | 'space' | 'curator' | 'editor' | 'newsletter' | 'members' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('1');

  const handleNavigate = (view: string, spaceId?: string) => {
    setCurrentView(view as View);
    if (spaceId) {
      setCurrentSpaceId(spaceId);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
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
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
    </div>
  );
}

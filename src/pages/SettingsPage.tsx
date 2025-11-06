import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Bell, Palette, Eye, Trash2, AlertCircle, Check, Globe, Shield, X } from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { useAuth } from "../contexts/AuthContext";
import { TerminalSelector } from "../components/ui/terminal-selector";

type SettingCategory = 'appearance' | 'notifications' | 'privacy' | 'preferences' | 'account';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('appearance');
  const [saved, setSaved] = useState(false);
  
  // Settings state
  const [theme, setTheme] = useState('light');
  const [profileVisibility, setProfileVisibility] = useState('spaces');
  const [landingPage, setLandingPage] = useState('dashboard');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const categories = [
    { id: 'appearance' as SettingCategory, label: 'Appearance', icon: Palette },
    { id: 'notifications' as SettingCategory, label: 'Notifications', icon: Bell },
    { id: 'privacy' as SettingCategory, label: 'Privacy & Data', icon: Shield },
    { id: 'preferences' as SettingCategory, label: 'Preferences', icon: Eye },
    { id: 'account' as SettingCategory, label: 'Account', icon: AlertCircle },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  const handleConfirmDelete = () => {
    const expectedText = `sudo rm ${user?.name}`;
    if (deleteConfirmText === expectedText) {
      // Perform account deletion
      console.log("Account deleted");
      // Add your deletion logic here
      // logout and redirect
    }
  };

  const isDeleteEnabled = deleteConfirmText === `sudo rm ${user?.name}`;

  return (
    <MainLayout>
      <div className="page-transition">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-medium mb-3 tracking-tight">Settings</h1>
            <p className="text-foreground/60 leading-relaxed">Manage your global preferences and account settings</p>
          </div>

          {/* Horizontal Tabs */}
          <div className="border-b border-black/10 mb-8">
            <nav className="flex gap-8">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 pb-4 border-b-2 transition-all duration-200 ${
                      activeCategory === cat.id
                        ? 'border-sage text-sage font-medium'
                        : 'border-transparent text-foreground/60 hover:text-foreground hover:border-black/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Panel */}
          <div>
            <Card className="p-8 border-black/10 shadow-sm">
                {/* Content changes based on activeCategory */}
                {activeCategory === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-medium mb-2 tracking-tight">Appearance</h2>
                      <p className="text-foreground/60">Customize how Monogram looks</p>
                    </div>
                    <Separator className="bg-black/10" />
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-1">Theme</p>
                        <p className="text-sm text-foreground/60 mb-3">Choose your color scheme</p>
                      </div>
                      <TerminalSelector
                        label="theme"
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'dark', label: 'Dark' },
                          { value: 'system', label: 'System' },
                        ]}
                        value={theme}
                        onChange={setTheme}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                )}

                {activeCategory === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-medium mb-2 tracking-tight">Notifications</h2>
                      <p className="text-foreground/60">Control your notification preferences</p>
                    </div>
                    <Separator className="bg-black/10" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium mb-1">Email Notifications</p>
                          <p className="text-sm text-foreground/60">Receive updates via email</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-black/5" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium mb-1">Space Invites</p>
                          <p className="text-sm text-foreground/60">Get notified of invites</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-medium mb-2 tracking-tight">Privacy & Data</h2>
                      <p className="text-foreground/60">Manage your privacy settings</p>
                    </div>
                    <Separator className="bg-black/10" />
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-1">Profile Visibility</p>
                        <p className="text-sm text-foreground/60 mb-3">Who can see your profile</p>
                      </div>
                      <TerminalSelector
                        label="visibility"
                        options={[
                          { value: 'public', label: 'Public' },
                          { value: 'spaces', label: 'Spaces Only' },
                          { value: 'private', label: 'Private' },
                        ]}
                        value={profileVisibility}
                        onChange={setProfileVisibility}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                )}

                {activeCategory === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-medium mb-2 tracking-tight">Preferences</h2>
                      <p className="text-foreground/60">Customize your experience</p>
                    </div>
                    <Separator className="bg-black/10" />
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-1">Default Landing Page</p>
                        <p className="text-sm text-foreground/60 mb-3">Where to go after login</p>
                      </div>
                      <TerminalSelector
                        label="landing"
                        options={[
                          { value: 'dashboard', label: 'Dashboard' },
                          { value: 'last-space', label: 'Last Space' },
                        ]}
                        value={landingPage}
                        onChange={setLandingPage}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                )}

                {activeCategory === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-medium mb-2 tracking-tight">Account</h2>
                      <p className="text-foreground/60">Manage your account</p>
                    </div>
                    <Separator className="bg-black/10" />
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <p className="font-medium text-destructive mb-2">Delete Account</p>
                      <p className="text-sm text-foreground/60 mb-4">This action cannot be undone</p>
                      
                      {!showDeleteConfirm ? (
                        <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      ) : (
                        <div className="space-y-4 py-4 px-4 bg-destructive/10 border-l-4 border-destructive rounded">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-destructive mb-1">Confirm Account Deletion</p>
                              <p className="text-sm text-foreground/70 mb-3">
                                Type <code className="px-2 py-0.5 bg-destructive/20 rounded font-mono text-xs">sudo rm {user?.name}</code> to confirm
                              </p>
                            </div>
                            <button
                              onClick={handleCancelDelete}
                              className="text-foreground/60 hover:text-foreground transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <Input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={`sudo rm ${user?.name}`}
                            className="font-mono text-sm bg-background"
                            autoFocus
                          />
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelDelete}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleConfirmDelete}
                              disabled={!isDeleteEnabled}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-black/10 flex justify-between">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
                <Button onClick={handleSave} className="gap-2 min-w-32">
                  {saved ? <><Check className="w-4 h-4" />Saved</> : 'Save Changes'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

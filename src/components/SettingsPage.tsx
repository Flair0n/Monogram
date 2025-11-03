import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Bell, Palette, Eye, Trash2, AlertCircle, Check, Globe, Shield } from "lucide-react";
import { MainLayout } from "./layouts/MainLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SettingCategory = 'appearance' | 'notifications' | 'privacy' | 'preferences' | 'account';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('appearance');
  const [saved, setSaved] = useState(false);

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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium mb-1">Theme</p>
                        <p className="text-sm text-foreground/60">Choose your color scheme</p>
                      </div>
                      <Select defaultValue="light">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium mb-1">Profile Visibility</p>
                        <p className="text-sm text-foreground/60">Who can see your profile</p>
                      </div>
                      <Select defaultValue="spaces">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="spaces">Spaces Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium mb-1">Default Landing Page</p>
                        <p className="text-sm text-foreground/60">Where to go after login</p>
                      </div>
                      <Select defaultValue="dashboard">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="last-space">Last Space</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
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

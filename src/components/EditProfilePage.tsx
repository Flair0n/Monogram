import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { User, Mail, ArrowLeft, Save, X } from 'lucide-react';

export function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock state - replace with actual form handling
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: '',
  });

  const handleSave = () => {
    // TODO: Implement save functionality with backend
    console.log('Saving profile:', formData);
    navigate('/profile');
  };

  return (
    <MainLayout>
      <div className="page-transition">
        {/* Header */}
        <div className="border-b border-black/10 bg-white/50">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="gap-2 mb-6 -ml-3 text-foreground/60 hover:text-foreground"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-medium mb-2 tracking-tight">Edit Profile</h1>
            <p className="text-foreground/60">Update your personal information and profile details</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-3xl mx-auto px-8 py-12">
          <Card className="p-8 border-black/10">
            {/* Profile Picture */}
            <div className="text-center pb-8 border-b border-black/10">
              <div className="inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-sage/10 ring-4 ring-sage/30 ring-offset-4 ring-offset-white flex items-center justify-center">
                  <span className="text-5xl font-medium text-sage tracking-tight">
                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              </div>
              <div>
                <Button variant="outline" size="sm" className="mb-2">
                  Change Avatar
                </Button>
                <p className="text-xs text-foreground/60">
                  Upload a new profile picture (JPG, PNG, max 2MB)
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 pt-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-foreground/60">
                  A brief description that appears on your profile
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className="h-11"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-8 mt-8 border-t border-black/10">
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" strokeWidth={1.5} />
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

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
      <div className="page-transition max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="gap-2 mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
          <h1 className="text-4xl font-medium mb-3 tracking-tight">Edit Profile</h1>
          <p className="text-foreground/60 leading-relaxed">
            Update your personal information and profile details
          </p>
        </div>

        <Card className="p-10 border-black/10 shadow-sm">
          {/* Profile Picture */}
          <div className="mb-10 text-center">
            <div className="inline-block mb-6">
              <div className="w-28 h-28 rounded-full bg-sage/10 border-4 border-sage/20 flex items-center justify-center mx-auto">
                <span className="text-4xl font-medium text-sage tracking-tight">
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

          <Separator className="my-10 bg-black/10" />

          {/* Basic Information */}
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium">
                <User className="w-4 h-4" strokeWidth={1.5} />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="text-lg py-6"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="text-lg py-6"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={5}
                className="text-base resize-none"
              />
              <p className="text-sm text-foreground/60">
                A brief description that appears on your profile
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-base font-medium">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="text-lg py-6"
              />
            </div>
          </div>

          <Separator className="my-10 bg-black/10" />

          {/* Save Actions */}
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')}
              className="flex-1 gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

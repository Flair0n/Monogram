import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layouts/MainLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { User, Mail, ArrowLeft, Save, X } from 'lucide-react';

export function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock state - replace with actual form handling
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to backend/storage
      console.log('Uploading avatar:', file);
    }
  };

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
            <div className="pb-8 border-b border-black/10">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 p-6 border-[5px] border-black/40 shadow-lg bg-transparent">
                  <div className="w-40 h-40 bg-sage/10 flex items-center justify-center overflow-hidden relative">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-medium text-sage tracking-tight">
                        {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-lg font-medium mb-2 tracking-tight">Profile Picture</h3>
                  <p className="text-sm text-foreground/60 mb-4">
                    Upload Your Profile Picture
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAvatarClick}
                    type="button"
                    className="mb-2"
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-foreground/60">
                    JPG, PNG, max 2MB
                  </p>
                </div>
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
                  disabled
                  className="h-11 bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-foreground/60">
                  Email address cannot be changed
                </p>
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

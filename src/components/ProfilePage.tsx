import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Calendar, 
  Edit3, 
  Edit2,
  Check,
  X,
  ChevronRight
} from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const handleSave = () => {
    // TODO: Save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  // Mock data - replace with actual data from your backend
  const joinedSpaces = [
    { id: '1', name: 'Sunday Reflections', role: 'Member', joined: 'Jan 2024', members: 24 },
    { id: '2', name: 'Creative Sparks', role: 'Curator', joined: 'Feb 2024', members: 18 },
    { id: '3', name: 'Morning Pages', role: 'Member', joined: 'Mar 2024', members: 31 },
  ];

  return (
    <MainLayout>
      <div className="page-transition">
        {/* Centered Profile Header */}
        <div className="border-b border-black/10 bg-white/50">
          <div className="max-w-3xl mx-auto px-8 py-16 text-center">
            {/* Avatar */}
            <div className="inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-sage/10 ring-4 ring-sage/30 ring-offset-4 ring-offset-[#FFFBF5] flex items-center justify-center">
                <span className="text-5xl font-medium text-sage tracking-tight">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
            </div>

            {/* Name with Edit */}
            {isEditing ? (
              <div className="mb-6">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-3xl font-medium text-center mb-4 h-auto py-3 max-w-md mx-auto"
                />
                <div className="flex items-center justify-center gap-3">
                  <Button size="sm" onClick={handleSave} className="gap-2">
                    <Check className="w-4 h-4" strokeWidth={1.5} />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <h1 className="text-4xl font-medium tracking-tight">{user?.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                    title="Edit name"
                  >
                    <Edit2 className="w-4 h-4 text-foreground/40 hover:text-foreground/70" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center justify-center gap-4 text-foreground/60 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                <span>{user?.email}</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-black/20" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span>Joined March 2024</span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile/edit')}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Spaces List */}
        <div className="max-w-3xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-medium tracking-tight mb-2">Your Spaces</h2>
            <p className="text-foreground/60">Spaces you're part of</p>
          </div>

          <div className="space-y-3">
            {joinedSpaces.map((space) => (
              <Card 
                key={space.id}
                className="p-6 border-black/10 hover:border-sage/20 hover:bg-sage/5 transition-all cursor-pointer group"
                onClick={() => navigate(`/spaces/${space.id}/dashboard`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-sage/10 flex items-center justify-center group-hover:bg-sage/20 transition-colors flex-shrink-0">
                      <Edit3 className="w-5 h-5 text-sage" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-lg tracking-tight">{space.name}</h3>
                        <Badge 
                          variant={space.role === 'Curator' ? 'default' : 'secondary'}
                          className="text-xs uppercase tracking-wide"
                        >
                          {space.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/60">
                        {space.members} members · Joined {space.joined}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-sage group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={1.5} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, Users, Download, Trash2, Bell } from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { useSpace } from "../contexts/SpaceContext";

export function SpaceSettingsPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { setCurrentSpace } = useSpace();

  // Mock space data
  const mockSpacesData: Record<string, any> = {
    "1": { name: "Sunday Reflections", description: "Weekly introspective prompts for mindful living" },
    "2": { name: "Creative Sparks", description: "Fiction prompts and collaborative storytelling" },
    "3": { name: "Morning Pages", description: "Daily gratitude and goal-setting journaling" }
  };

  const currentSpace = mockSpacesData[spaceId || "1"] || mockSpacesData["1"];

  // Set current space context
  useEffect(() => {
    if (spaceId) {
      setCurrentSpace({
        id: spaceId,
        name: currentSpace.name,
        description: currentSpace.description,
        memberCount: 8,
        currentWeek: 12,
        currentCurator: "Emma Chen"
      });
    }

    return () => {
      setCurrentSpace(null);
    };
  }, [spaceId, currentSpace.name, currentSpace.description, setCurrentSpace]);

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8 md:p-16 page-transition">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8 -ml-4"
            onClick={() => navigate(`/spaces/${spaceId}/dashboard`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space
          </Button>

          <div className="mb-8">
            <h1 className="mb-2">{currentSpace.name} Settings</h1>
            <p className="text-muted-foreground">Manage this space's preferences and members</p>
          </div>

          <div className="space-y-6">
            {/* Space Details */}
            <Card className="p-6 paper-texture">
              <h3 className="mb-6">Space Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="space-name">Space Name</Label>
                  <Input
                    id="space-name"
                    defaultValue={currentSpace.name}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    defaultValue={currentSpace.description}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="curator-rotation">Curator Rotation</Label>
                  <Input
                    id="curator-rotation"
                    defaultValue="Weekly (Sunday)"
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Members */}
            <Card className="p-6 paper-texture">
              <div className="flex items-center justify-between mb-6">
                <h3>Members (8)</h3>
                <Button size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  Invite
                </Button>
              </div>
              <div className="space-y-3">
                {['Emma Chen', 'Marcus Williams', 'Sofia Rodriguez', 'You'].map((member, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-xs text-accent-foreground">
                          {member.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">{member}</p>
                        <p className="text-xs text-muted-foreground">
                          {index === 0 ? 'Current Curator' : 'Member'}
                        </p>
                      </div>
                    </div>
                    {member !== 'You' && (
                      <Button variant="ghost" size="sm">Remove</Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6 paper-texture">
              <h3 className="mb-6">Space Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">New Prompts</p>
                      <p className="text-xs text-muted-foreground">Get notified when prompts are published</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">New Responses</p>
                      <p className="text-xs text-muted-foreground">Get notified when members submit responses</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Weekly Newsletter</p>
                      <p className="text-xs text-muted-foreground">Receive the compiled newsletter</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6 paper-texture">
              <h3 className="mb-6">Data Management</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Export All Writings
                </Button>
                <p className="text-xs text-muted-foreground px-4">
                  Download a PDF or JSON archive of all responses from this space
                </p>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 paper-texture border-destructive/50">
              <h3 className="mb-4 text-destructive">Danger Zone</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="w-4 h-4" />
                  Leave This Space
                </Button>
                <p className="text-xs text-muted-foreground px-4">
                  You'll lose access to all content. This action cannot be undone.
                </p>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => navigate(`/spaces/${spaceId}/dashboard`)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

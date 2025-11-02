import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { ArrowLeft, Users, Download, Trash2, Bell } from "lucide-react";

interface SettingsPageProps {
  onNavigate: (view: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  return (
    <div className="min-h-screen p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 -ml-4"
          onClick={() => onNavigate('space')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Space
        </Button>

        <div className="mb-8">
          <h1 className="mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your space preferences</p>
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
                  defaultValue="Sunday Reflections"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  defaultValue="A weekly writing space for thoughtful reflection"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Curator Rotation */}
          <Card className="p-6 paper-texture">
            <h3 className="mb-6">Curator Rotation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Rotation Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically rotate curator each week
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p>Rotation Day</p>
                  <p className="text-sm text-muted-foreground">
                    Day when curator changes
                  </p>
                </div>
                <select className="px-3 py-2 rounded-md border border-border bg-background">
                  <option>Sunday</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6 paper-texture">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5" />
              <h3>Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>New Prompts</p>
                  <p className="text-sm text-muted-foreground">
                    When new prompts are published
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p>Weekly Newsletter</p>
                  <p className="text-sm text-muted-foreground">
                    When the week's letter is ready
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p>Response Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Gentle reminder to write
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Members */}
          <Card className="p-6 paper-texture">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5" />
              <h3>Members</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Allow Invites</p>
                  <p className="text-sm text-muted-foreground">
                    Let members invite new writers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div>
                <Label htmlFor="max-members">Maximum Members</Label>
                <Input
                  id="max-members"
                  type="number"
                  defaultValue="12"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 6-12 for intimate conversations
                </p>
              </div>
            </div>
          </Card>

          {/* Export & Archive */}
          <Card className="p-6 paper-texture">
            <div className="flex items-center gap-2 mb-6">
              <Download className="w-5 h-5" />
              <h3>Export & Archive</h3>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Export All Letters (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Export All Letters (JSON)
              </Button>
              <p className="text-xs text-muted-foreground">
                Download all your collective's writing in your preferred format
              </p>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/50">
            <div className="flex items-center gap-2 mb-6">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h3 className="text-destructive">Danger Zone</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="mb-2">Leave Space</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove yourself from this writing collective
                </p>
                <Button variant="outline" className="text-destructive border-destructive/50">
                  Leave Space
                </Button>
              </div>
              <Separator />
              <div>
                <p className="mb-2">Delete Space</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete this space and all its content
                </p>
                <Button variant="destructive">
                  Delete Space
                </Button>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button className="flex-1">Save Changes</Button>
            <Button variant="outline" onClick={() => onNavigate('space')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, Users, Download, Trash2, Bell, Mail, UserPlus } from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { useSpace } from "../contexts/SpaceContext";
import { useAuth } from "../contexts/AuthContext";
import { ExportWritings } from "../components/ExportWritings";
import { getSpaceByName, getSpaceMembers, updateSpace, inviteMember, removeMember, leaveSpace, type SpaceWithDetails } from "../lib/space-api";

export function SpaceSettingsPage() {
  const { spaceName } = useParams<{ spaceName: string }>();
  const navigate = useNavigate();
  const { setCurrentSpace } = useSpace();
  const { user } = useAuth();
  
  // Real data state
  const [space, setSpace] = useState<SpaceWithDetails | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [spaceNameInput, setSpaceNameInput] = useState("");
  const [description, setDescription] = useState("");
  const [rotationType, setRotationType] = useState<"ROUND_ROBIN" | "MANUAL" | "RANDOM">("ROUND_ROBIN");
  
  const [exportInlineOpen, setExportInlineOpen] = useState(false);
  const [inviteInlineOpen, setInviteInlineOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [removeConfirmText, setRemoveConfirmText] = useState("");

  // Load space data
  useEffect(() => {
    if (!spaceName || !user) return;

    const loadSpaceData = async () => {
      try {
        setLoading(true);
        
        // Load space details by name
        const spaceData = await getSpaceByName(decodeURIComponent(spaceName));
        
        if (!spaceData) {
          console.error('Space not found:', spaceName);
          navigate('/dashboard');
          return;
        }
        
        setSpace(spaceData);

        if (spaceData) {
          setSpaceNameInput(spaceData.name);
          setDescription(spaceData.description || "");
          setRotationType(spaceData.rotation_type as any);

          // Load members
          const membersData = await getSpaceMembers(spaceData.id);
          setMembers(membersData);

          // Set current space context
          setCurrentSpace({
            id: spaceData.id,
            name: spaceData.name,
            description: spaceData.description || "",
            memberCount: spaceData.member_count,
            currentWeek: spaceData.current_week,
            currentCurator: spaceData.current_curator?.name || "No curator assigned"
          });
        }
      } catch (error) {
        console.error('Error loading space data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpaceData();

    return () => {
      setCurrentSpace(null);
    };
  }, [spaceName, user, setCurrentSpace]);

  // Show loading state
  if (loading || !space) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sage border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSaveChanges = async () => {
    if (!space) return;

    try {
      await updateSpace(space.id, {
        name: spaceNameInput,
        description: description,
        rotation_type: rotationType,
      });

      // Reload space data to get updated info
      const spaceData = await getSpaceByName(spaceNameInput);
      if (spaceData) {
        setSpace(spaceData);
      }

      // Navigate back using the new space name
      navigate(`/spaces/${encodeURIComponent(spaceNameInput)}/dashboard`);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8 md:p-16 page-transition">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8 -ml-4"
            onClick={() => navigate(`/spaces/${encodeURIComponent(space.name)}/dashboard`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space
          </Button>

          <div className="mb-8">
            <h1 className="mb-2">{space.name} Settings</h1>
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
                    value={spaceNameInput}
                    onChange={(e) => setSpaceNameInput(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="curator-rotation">Curator Rotation</Label>
                  <select
                    id="curator-rotation"
                    value={rotationType}
                    onChange={(e) => setRotationType(e.target.value as any)}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="ROUND_ROBIN">Automatic Rotation (Each member takes turns)</option>
                    <option value="MANUAL">Manual Selection (Leader assigns each week)</option>
                    <option value="RANDOM">Random Pick (System chooses randomly)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {rotationType === 'ROUND_ROBIN' && 'Members will automatically rotate as curator each week'}
                    {rotationType === 'MANUAL' && 'You can manually assign a curator each week'}
                    {rotationType === 'RANDOM' && 'A random member will be selected as curator each week'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Curator Assignment */}
            <Card className="p-6 paper-texture">
              <h3 className="mb-6">Current Curator</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-curator">Assign Curator for Week {space.current_week}</Label>
                  <select
                    id="current-curator"
                    value={space.current_curator_id || 'none'}
                    onChange={async (e) => {
                      if (!space) return;
                      try {
                        const newCuratorId = e.target.value === 'none' ? null : e.target.value;
                        await updateSpace(space.id, {
                          current_curator_id: newCuratorId,
                        });
                        // Reload space data
                        const spaceData = await getSpaceByName(decodeURIComponent(spaceName!));
                        if (spaceData) setSpace(spaceData);
                      } catch (error) {
                        console.error('Error updating curator:', error);
                      }
                    }}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="none">No curator (no prompts this week)</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.user.id}>
                        {member.user.name} {member.user.id === user?.id && '(You)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    The curator sets the weekly prompts for all members to respond to
                  </p>
                </div>
                {space.current_curator && (
                  <div className="p-4 bg-sage/5 border border-sage/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                        {space.current_curator.avatar_url ? (
                          <img 
                            src={space.current_curator.avatar_url} 
                            alt={space.current_curator.name} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <span className="text-sm font-medium text-sage">
                            {space.current_curator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{space.current_curator.name}</p>
                        <p className="text-xs text-muted-foreground">Current curator for Week {space.current_week}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Members */}
            <Card className="p-6 paper-texture">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-6">
                  <h3>Members ({members.length})</h3>
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setInviteInlineOpen(!inviteInlineOpen)}
                  >
                    <Users className="w-4 h-4" />
                    Invite
                  </Button>
                </div>

                {/* Inline Invite Form */}
                <AnimatePresence>
                  {inviteInlineOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-6 p-4 border border-border rounded-lg space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email" className="text-sm font-normal">
                            Email Address
                          </Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="invite-email"
                                type="email"
                                placeholder="member@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="pl-9"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInviteInlineOpen(false);
                              setInviteEmail("");
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!space || !user) return;
                              try {
                                await inviteMember(space.id, inviteEmail, user.id);
                                // Reload members
                                const membersData = await getSpaceMembers(space.id);
                                setMembers(membersData);
                                setInviteInlineOpen(false);
                                setInviteEmail("");
                              } catch (error) {
                                console.error('Error inviting member:', error);
                              }
                            }}
                            className="flex-1 gap-2"
                            disabled={!inviteEmail}
                          >
                            <UserPlus className="w-4 h-4" />
                            Send Invite
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {members.map((member) => {
                    const initials = member.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    const isCurrentUser = member.user.id === user?.id;
                    const isLeader = member.user.id === space.leader_id;
                    
                    return (
                      <div key={member.id}>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                              {member.user.avatar_url ? (
                                <img src={member.user.avatar_url} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-xs text-accent-foreground">{initials}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm">
                                {member.user.name}
                                {isCurrentUser && " (You)"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isLeader ? 'Leader' : member.role}
                              </p>
                            </div>
                          </div>
                          {!isCurrentUser && !isLeader && user?.id === space.leader_id && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (memberToRemove === member.id) {
                                  setMemberToRemove(null);
                                  setRemoveConfirmText("");
                                } else {
                                  setMemberToRemove(member.id);
                                  setRemoveConfirmText("");
                                }
                              }}
                            >
                              {memberToRemove === member.id ? 'Cancel' : 'Remove'}
                            </Button>
                          )}
                        </div>

                        {/* Inline Remove Confirmation */}
                        <AnimatePresence>
                          {memberToRemove === member.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="py-4 px-4 space-y-3 bg-destructive/5 border-l-2 border-destructive">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-destructive">
                                    Confirm removal of {member.user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Type <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">sudo rm {member.user.name}</code> to confirm
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    placeholder={`sudo rm ${member.user.name}`}
                                    value={removeConfirmText}
                                    onChange={(e) => setRemoveConfirmText(e.target.value)}
                                    className="flex-1 font-mono text-sm"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      if (!space) return;
                                      try {
                                        await removeMember(space.id, member.user.id);
                                        // Reload members
                                        const membersData = await getSpaceMembers(space.id);
                                        setMembers(membersData);
                                        setMemberToRemove(null);
                                        setRemoveConfirmText("");
                                      } catch (error) {
                                        console.error('Error removing member:', error);
                                      }
                                    }}
                                    disabled={removeConfirmText !== `sudo rm ${member.user.name}`}
                                    className="gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
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
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => setExportInlineOpen(!exportInlineOpen)}
                >
                  <Download className="w-4 h-4" />
                  Export All Writings
                </Button>
                
                {/* Inline Export Form */}
                <AnimatePresence>
                  {exportInlineOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 mt-4 border-t border-border/50">
                        <ExportWritings 
                          spaceName={space.name} 
                          inline={true}
                          onClose={() => setExportInlineOpen(false)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!exportInlineOpen && (
                  <p className="text-xs text-muted-foreground px-4">
                    Download a Markdown or JSON archive of all responses from this space
                  </p>
                )}
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 paper-texture border-destructive/50">
              <h3 className="mb-4 text-destructive">Danger Zone</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={async () => {
                    if (!space || !user) return;
                    if (window.confirm(`Are you sure you want to leave "${space.name}"? This action cannot be undone.`)) {
                      try {
                        await leaveSpace(space.id, user.id);
                        navigate('/dashboard');
                      } catch (error) {
                        console.error('Error leaving space:', error);
                      }
                    }
                  }}
                >
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
              <Button className="flex-1" onClick={handleSaveChanges}>Save Changes</Button>
              <Button variant="outline" onClick={() => navigate(`/spaces/${encodeURIComponent(space.name)}/dashboard`)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { joinSpace, getSpace } from "../lib/space-api";
import { Link2, Mail, CheckCircle } from "lucide-react";

interface JoinSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
}

export function JoinSpaceDialog({ open, onOpenChange, userId, onSuccess }: JoinSpaceDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [spaceInfo, setSpaceInfo] = useState<{ name: string; description: string | null } | null>(null);

  const handleReset = () => {
    setInviteCode("");
    setInviteLink("");
    setError(null);
    setSuccess(false);
    setSpaceInfo(null);
  };

  const extractSpaceIdFromLink = (link: string): string | null => {
    try {
      const url = new URL(link);
      // Extract from path like /spaces/123/join or /join/123
      const match = url.pathname.match(/\/spaces\/([^\/]+)\/join|\/join\/([^\/]+)/);
      return match ? (match[1] || match[2]) : null;
    } catch {
      return null;
    }
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch space info first
      const space = await getSpace(inviteCode);
      
      if (!space) {
        setError("Space not found. Please check the invite code.");
        return;
      }

      setSpaceInfo({ name: space.name, description: space.description });

      // Join the space
      await joinSpace(inviteCode, userId);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        handleReset();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to join space. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByLink = async () => {
    if (!inviteLink.trim()) {
      setError("Please enter an invite link");
      return;
    }

    const spaceId = extractSpaceIdFromLink(inviteLink);
    
    if (!spaceId) {
      setError("Invalid invite link format");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch space info first
      const space = await getSpace(spaceId);
      
      if (!space) {
        setError("Space not found. Please check the invite link.");
        return;
      }

      setSpaceInfo({ name: space.name, description: space.description });

      // Join the space
      await joinSpace(spaceId, userId);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        handleReset();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to join space. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) handleReset();
    }}>
      <DialogContent className="sm:max-w-md">
        {success && spaceInfo ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle>Welcome to {spaceInfo.name}!</DialogTitle>
              <DialogDescription>
                You've successfully joined the space. Redirecting...
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Join a Space</DialogTitle>
              <DialogDescription>
                Enter an invite code or paste an invite link to join a space
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">
                  <Mail className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="link">
                  <Link2 className="w-4 h-4 mr-2" />
                  Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="e.g., abc123def456"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask the space leader for an invite code
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleJoinByCode}
                    disabled={loading || !inviteCode.trim()}
                  >
                    {loading ? "Joining..." : "Join Space"}
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="link" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-link">Invite Link</Label>
                  <Input
                    id="invite-link"
                    placeholder="https://monogram.app/spaces/..."
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinByLink()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the full invite link shared with you
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleJoinByLink}
                    disabled={loading || !inviteLink.trim()}
                  >
                    {loading ? "Joining..." : "Join Space"}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

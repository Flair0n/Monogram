import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Users, FileText, Clock, PenLine, Mail } from "lucide-react";
import { MainLayout } from "./layouts/MainLayout";

export function SpaceOverview() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  // Mock space data - replace with Supabase later
  const spaceData = {
    "1": { name: "Sunday Reflections", curator: "Emma Chen", week: 12 },
    "2": { name: "Creative Sparks", curator: "Marcus Williams", week: 8 },
    "3": { name: "Morning Pages", curator: "You", week: 24 },
  };

  const space = spaceData[spaceId as keyof typeof spaceData] || spaceData["1"];

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8 md:p-16 page-transition">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 -ml-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4">{space.name}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="gap-2">
              <Clock className="w-3 h-3" />
              Week {space.week} · 3 days remaining
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Users className="w-3 h-3" />
              8 members
            </Badge>
            <Badge variant="outline" className="gap-2">
              <FileText className="w-3 h-3" />
              6 responses
            </Badge>
          </div>

          <Card className="p-6 paper-texture mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                <span className="text-accent-foreground">EC</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Current Curator</p>
                <h3 className="mb-2">{space.curator}</h3>
                <p className="text-sm italic text-muted-foreground">
                  "This week, let's explore the moments that surprise us—the unexpected kindness, 
                  the sudden clarity, the things we didn't know we were looking for."
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate(`/spaces/${spaceId}/editor`)}
              className="gap-2"
            >
              <PenLine className="w-4 h-4" />
              Write Now
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/spaces/${spaceId}/newsletter`)}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              View This Week's Letter
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all paper-texture"
            onClick={() => navigate(`/spaces/${spaceId}/curator`)}
          >
            <FileText className="w-6 h-6 mb-3" />
            <h4 className="mb-2">Curator Panel</h4>
            <p className="text-sm text-muted-foreground">
              Create prompts for your week
            </p>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all paper-texture"
            onClick={() => navigate(`/spaces/${spaceId}/members`)}
          >
            <Users className="w-6 h-6 mb-3" />
            <h4 className="mb-2">Members</h4>
            <p className="text-sm text-muted-foreground">
              View all participants
            </p>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all paper-texture"
            onClick={() => navigate('/settings')}
          >
            <Clock className="w-6 h-6 mb-3" />
            <h4 className="mb-2">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Manage space preferences
            </p>
          </Card>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}

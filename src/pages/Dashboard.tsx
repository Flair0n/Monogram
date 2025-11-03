import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { 
  Plus,
  Users,
  Calendar,
  Mail,
  ChevronRight,
  Feather,
  Inbox,
  UsersRound
} from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { usePermission } from "../components/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

// Mock data - replace with Supabase later
const mockSpaces = [
  {
    id: "1",
    name: "Sunday Reflections",
    description: "Weekly introspective prompts for mindful living",
    memberCount: 8,
    currentWeek: 12,
    currentCurator: "Emma Chen",
    unreadResponses: 3,
    color: "accent"
  },
  {
    id: "2",
    name: "Creative Sparks",
    description: "Fiction prompts and collaborative storytelling",
    memberCount: 6,
    currentWeek: 8,
    currentCurator: "Marcus Williams",
    unreadResponses: 0,
    color: "secondary"
  },
  {
    id: "3",
    name: "Morning Pages",
    description: "Daily gratitude and goal-setting journaling",
    memberCount: 12,
    currentWeek: 24,
    currentCurator: "You",
    unreadResponses: 5,
    color: "primary"
  }
];

export function Dashboard() {
  const navigate = useNavigate();
  const { allowed: canCreate, message: createMessage } = usePermission('canCreateSpace');

  // Calculate global stats
  const stats = {
    activeSpaces: mockSpaces.length,
    unreadUpdates: mockSpaces.reduce((acc, space) => acc + space.unreadResponses, 0),
    totalCommunity: mockSpaces.reduce((acc, space) => acc + space.memberCount, 0),
  };

  const handleCreateSpace = () => {
    if (!canCreate) return;
    // Navigate to create space flow - implement later
    alert("Create Space feature coming soon!");
  };

  return (
    <MainLayout>
      <div className="page-transition">

        {/* Spaces Section */}
        <div className="px-8 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-medium mb-4 tracking-tight">Your Writing Spaces</h1>
              <p className="text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                Choose a space to continue your journaling journey, or create a new one
              </p>
            </div>

          {/* Spaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSpaces.map((space) => (
              <Card
                key={space.id}
                className="p-6 paper-texture cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => navigate(`/spaces/${space.id}/dashboard`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full bg-${space.color} flex items-center justify-center shrink-0`}>
                    <Feather className={`w-6 h-6 text-${space.color}-foreground`} />
                  </div>
                  {space.unreadResponses > 0 && (
                    <Badge variant="default" className="text-xs">
                      {space.unreadResponses} new
                    </Badge>
                  )}
                </div>

                <h3 className="mb-2 group-hover:text-primary transition-colors">
                  {space.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {space.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{space.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Week {space.currentWeek}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Curator: {space.currentCurator}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Enter Space
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}

            {/* Create New Space Card */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`p-6 paper-texture transition-all border-dashed border-2 flex flex-col items-center justify-center min-h-[300px] group ${
                      canCreate 
                        ? 'cursor-pointer hover:shadow-lg' 
                        : 'opacity-40 cursor-not-allowed bg-terracotta/10 border-terracotta/30'
                    }`}
                    onClick={handleCreateSpace}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                      canCreate 
                        ? 'bg-muted group-hover:bg-primary group-hover:text-primary-foreground' 
                        : 'bg-terracotta/20 text-terracotta/60'
                    }`}>
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className={`mb-2 transition-colors ${
                      canCreate ? 'group-hover:text-primary' : 'text-terracotta/60'
                    }`}>
                      Create New Space
                    </h3>
                    <p className={`text-sm text-center ${
                      canCreate ? 'text-muted-foreground' : 'text-terracotta/60'
                    }`}>
                      Start a new journaling group with friends
                    </p>
                  </Card>
                </TooltipTrigger>
                {!canCreate && (
                  <TooltipContent 
                    side="top" 
                    className="bg-terracotta/90 text-white border-terracotta text-xs"
                  >
                    <p>{createMessage}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

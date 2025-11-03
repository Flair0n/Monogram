import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Users, FileText, Clock, PenLine, Mail } from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { usePermission } from "../components/permissions";
import { getSpaceById } from "../lib/mockData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

export function SpaceOverview() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  // Get space data from mock database
  const spaceData = getSpaceById(spaceId || 'space_1');
  
  // Mock display data - in real app, fetch from Supabase with space details
  const displayData = {
    space_1: { displayName: "Poetry & Prose", curatorName: "Emma Chen", week: 12 },
    space_2: { displayName: "Creative Nonfiction", curatorName: "Marcus Williams", week: 8 },
    space_3: { displayName: "Short Stories", curatorName: "You", week: 24 },
  };
  
  const display = displayData[spaceId as keyof typeof displayData] || displayData.space_1;
  
  // Check permissions
  const { allowed: canSetQuestions, message: questionsMessage } = usePermission('canSetQuestions', spaceData);
  const { allowed: canManageMembers, message: membersMessage } = usePermission('canManageMembers', spaceData);
  const { allowed: canAccessSettings, message: settingsMessage } = usePermission('canAccessSettings', spaceData);

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
          <h1 className="mb-4">{display.displayName}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="gap-2">
              <Clock className="w-3 h-3" />
              Week {display.week} · 3 days remaining
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Users className="w-3 h-3" />
              {spaceData?.members.length || 0} members
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
                <h3 className="mb-2">{display.curatorName}</h3>
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
          {/* Curator Panel - Restricted to leaders and curators */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`p-6 transition-all paper-texture ${
                    canSetQuestions
                      ? 'cursor-pointer hover:shadow-lg'
                      : 'opacity-40 cursor-not-allowed bg-terracotta/10 border-terracotta/30'
                  }`}
                  onClick={() => canSetQuestions && navigate(`/spaces/${spaceId}/curator`)}
                >
                  <FileText className={`w-6 h-6 mb-3 ${!canSetQuestions && 'text-terracotta/60'}`} />
                  <h4 className={`mb-2 ${!canSetQuestions && 'text-terracotta/60'}`}>Curator Panel</h4>
                  <p className={`text-sm ${canSetQuestions ? 'text-muted-foreground' : 'text-terracotta/60'}`}>
                    Create prompts for your week
                  </p>
                </Card>
              </TooltipTrigger>
              {!canSetQuestions && (
                <TooltipContent side="top" className="bg-terracotta/90 text-white border-terracotta text-xs">
                  <p>{questionsMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Members - Restricted to leaders */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`p-6 transition-all paper-texture ${
                    canManageMembers
                      ? 'cursor-pointer hover:shadow-lg'
                      : 'opacity-40 cursor-not-allowed bg-terracotta/10 border-terracotta/30'
                  }`}
                  onClick={() => canManageMembers && navigate(`/spaces/${spaceId}/members`)}
                >
                  <Users className={`w-6 h-6 mb-3 ${!canManageMembers && 'text-terracotta/60'}`} />
                  <h4 className={`mb-2 ${!canManageMembers && 'text-terracotta/60'}`}>Manage Members</h4>
                  <p className={`text-sm ${canManageMembers ? 'text-muted-foreground' : 'text-terracotta/60'}`}>
                    Add or remove participants
                  </p>
                </Card>
              </TooltipTrigger>
              {!canManageMembers && (
                <TooltipContent side="top" className="bg-terracotta/90 text-white border-terracotta text-xs">
                  <p>{membersMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Settings - Restricted to leaders */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`p-6 transition-all paper-texture ${
                    canAccessSettings
                      ? 'cursor-pointer hover:shadow-lg'
                      : 'opacity-40 cursor-not-allowed bg-terracotta/10 border-terracotta/30'
                  }`}
                  onClick={() => canAccessSettings && navigate(`/spaces/${spaceId}/settings`)}
                >
                  <Clock className={`w-6 h-6 mb-3 ${!canAccessSettings && 'text-terracotta/60'}`} />
                  <h4 className={`mb-2 ${!canAccessSettings && 'text-terracotta/60'}`}>Space Settings</h4>
                  <p className={`text-sm ${canAccessSettings ? 'text-muted-foreground' : 'text-terracotta/60'}`}>
                    Manage space preferences
                  </p>
                </Card>
              </TooltipTrigger>
              {!canAccessSettings && (
                <TooltipContent side="top" className="bg-terracotta/90 text-white border-terracotta text-xs">
                  <p>{settingsMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}

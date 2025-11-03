import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  Home, 
  Calendar, 
  Mail, 
  Archive, 
  FileText,
  Users,
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  PenLine,
  Edit2
} from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { useSpace } from "../contexts/SpaceContext";

// Mock data - will be replaced with actual data from Supabase
const mockSpacesData: Record<string, any> = {
  "1": {
    name: "Sunday Reflections",
    currentCurator: "Emma Chen",
    weekNumber: 12
  },
  "2": {
    name: "Creative Sparks",
    currentCurator: "Marcus Williams",
    weekNumber: 8
  },
  "3": {
    name: "Morning Pages",
    currentCurator: "You",
    weekNumber: 24
  }
};

const mockPrompts = [
  {
    id: "1",
    text: "What moment this week made you pause and take a breath?",
    hasResponse: true
  },
  {
    id: "2",
    text: "Describe a conversation that changed your perspective.",
    hasResponse: true
  },
  {
    id: "3",
    text: "What are you grateful for that you once took for granted?",
    hasResponse: false
  }
];

const mockUpcomingCurators = [
  { name: "Marcus Williams", week: 13, date: "Nov 10" },
  { name: "Sofia Rodriguez", week: 14, date: "Nov 17" },
  { name: "You", week: 15, date: "Nov 24" }
];

const mockStats = {
  streak: 8,
  totalResponses: 47,
  badges: 3
};

export function SpaceDashboard() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { setCurrentSpace } = useSpace();
  const [activeNav, setActiveNav] = useState<"thisweek" | "responses" | "members" | "archive">("thisweek");

  const currentSpace = mockSpacesData[spaceId || "1"] || mockSpacesData["1"];

  // Set current space context when component mounts
  useEffect(() => {
    if (spaceId) {
      setCurrentSpace({
        id: spaceId,
        name: currentSpace.name,
        description: "",
        memberCount: 8,
        currentWeek: currentSpace.weekNumber,
        currentCurator: currentSpace.currentCurator
      });
    }

    // Clear space context when component unmounts
    return () => {
      setCurrentSpace(null);
    };
  }, [spaceId, currentSpace.name, currentSpace.weekNumber, currentSpace.currentCurator, setCurrentSpace]);

  return (
    <MainLayout>
      <div className="flex-1 flex page-transition">
        {/* Left Navigation Panel */}
        <aside className="w-64 border-r border-border bg-card/30 p-6">
          <nav className="space-y-2">
            <NavItem
              icon="[>]"
              label="This Week"
              active={activeNav === "thisweek"}
              onClick={() => setActiveNav("thisweek")}
            />
            <NavItem
              icon="[~]"
              label="My Responses"
              active={activeNav === "responses"}
              onClick={() => setActiveNav("responses")}
            />
            <NavItem
              icon="[@]"
              label="Members"
              active={activeNav === "members"}
              onClick={() => setActiveNav("members")}
            />
            <NavItem
              icon="[#]"
              label="Archive"
              active={activeNav === "archive"}
              onClick={() => setActiveNav("archive")}
            />
            
            <Separator className="my-4" />
            
            <NavItem
              icon="[*]"
              label="Space Settings"
              active={false}
              onClick={() => navigate(`/spaces/${spaceId}/settings`)}
            />
          </nav>

          {/* Bottom Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Week {currentSpace.weekNumber}</p>
              <p>8 members active</p>
              <p className="flex items-center gap-1">
                Online<span className="cursor-blink">|</span>
              </p>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-8">
            <AnimatePresence mode="wait">
              {activeNav === "thisweek" && (
                <motion.div
                  key="thisweek"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Week Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Week {currentSpace.weekNumber} · Nov 3–9, 2025
                      </span>
                    </div>
                    <h1 className="mb-2">This Week's Prompts</h1>
                    <p className="text-muted-foreground">
                      Curated by {currentSpace.currentCurator}
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  {/* Prompts List */}
                  <div className="space-y-6">
                    {mockPrompts.map((prompt, index) => (
                      <Card key={prompt.id} className="p-6 paper-texture">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                            <span className="text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="mb-4 leading-relaxed">{prompt.text}</p>
                            
                            {prompt.hasResponse ? (
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="gap-1">
                                  <FileText className="w-3 h-3" />
                                  Response submitted
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/spaces/${spaceId}/editor`)}
                                >
                                  Edit
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                onClick={() => navigate(`/spaces/${spaceId}/editor`)}
                              >
                                <PenLine className="w-4 h-4" />
                                Write Response
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Newsletter Preview Card */}
                  <Card className="mt-8 p-8 paper-texture bg-card shadow-lg border-2">
                    <div className="relative">
                      {/* Folded corner effect */}
                      <div className="absolute -top-6 -right-6 w-12 h-12 bg-muted border-l border-b border-border transform rotate-45"></div>
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                          <Mail className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1">This Week's Newsletter</h3>
                          <p className="text-sm text-muted-foreground">
                            Publishes Sunday, Nov 9 at 6:00 PM
                          </p>
                        </div>
                      </div>

                      <div className="pl-16">
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          A beautifully formatted collection of everyone's responses, 
                          delivered like a vintage literary zine.
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>6/8 responded</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>75% participation</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/spaces/${spaceId}/newsletter`)}
                        >
                          Preview Newsletter
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Curator Note */}
                  {currentSpace.currentCurator === "Emma Chen" && (
                    <Card className="mt-6 p-6 bg-secondary/10 border-secondary">
                      <p className="text-sm italic text-muted-foreground">
                        💭 "I've been thinking a lot about gratitude this week. These prompts 
                        are an invitation to notice the small things that hold us together."
                      </p>
                      <p className="text-sm mt-2">— Emma</p>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeNav === "responses" && (
                <motion.div
                  key="responses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h1 className="mb-2">My Responses</h1>
                    <p className="text-muted-foreground">
                      All your written reflections and submissions
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Card key={item} className="p-6 paper-texture">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant="secondary" className="mb-2">Week {currentSpace.weekNumber - item + 1}</Badge>
                            <p className="font-medium">What surprised you this week?</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/spaces/${spaceId}/editor`)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          The way light filtered through the cafe window at exactly 3pm, 
                          creating patterns on my notebook...
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Nov {10 - item}, 2025</span>
                          <span>•</span>
                          <span>347 words</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeNav === "members" && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h1 className="mb-2">Members</h1>
                    <p className="text-muted-foreground">
                      8 active members in this space
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {["Emma Chen", "Marcus Williams", "Sofia Rodriguez", "You", "James Park", "Olivia Taylor", "Daniel Kim", "Sarah Johnson"].map((member, index) => (
                      <Card key={index} className="p-5 paper-texture">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
                              <span className="text-lg font-medium text-sage">
                                {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{member}</p>
                              <p className="text-sm text-muted-foreground">
                                {index === 0 ? "Curator" : index === 3 ? "You" : "Member"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {Math.floor(Math.random() * 20) + 5} responses
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button className="w-full mt-6 gap-2">
                    <Users className="w-4 h-4" />
                    Invite New Members
                  </Button>
                </motion.div>
              )}

              {activeNav === "archive" && (
                <motion.div
                  key="archive"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h1 className="mb-2">Archive</h1>
                    <p className="text-muted-foreground">
                      Past weeks and historical responses
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((weekBack) => (
                      <Card key={weekBack} className="p-6 paper-texture hover:border-sage/20 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline">Week {currentSpace.weekNumber - weekBack}</Badge>
                              <span className="text-sm text-muted-foreground">
                                Oct {30 - weekBack * 7}–Nov {6 - weekBack * 7}, 2025
                              </span>
                            </div>
                            <p className="font-medium mb-2">Curated by {weekBack % 3 === 0 ? "Emma Chen" : weekBack % 3 === 1 ? "Marcus Williams" : "Sofia Rodriguez"}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>3 prompts</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>7/8 responded</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-6 gap-2">
                    <Archive className="w-4 h-4" />
                    Export All Archives
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-border bg-card/30 p-6 overflow-auto">
          {/* Stats Card */}
          <Card className="p-6 mb-6 paper-texture">
            <h3 className="mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-accent" />
                  <span className="text-sm">Writing Streak</span>
                </div>
                <span className="text-xl">{mockStats.streak}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  <span className="text-sm">Total Responses</span>
                </div>
                <span className="text-xl">{mockStats.totalResponses}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm">Badges Earned</span>
                </div>
                <span className="text-xl">{mockStats.badges}</span>
              </div>
            </div>
          </Card>

          {/* Upcoming Curators */}
          <Card className="p-6 paper-texture">
            <h3 className="mb-4">Curator Schedule</h3>
            <div className="space-y-3">
              {mockUpcomingCurators.map((curator, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between py-2 ${
                    index < mockUpcomingCurators.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm">{curator.name}</p>
                    <p className="text-xs text-muted-foreground">Week {curator.week}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{curator.date}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => navigate(`/spaces/${spaceId}/settings`)}
            >
              View Full Schedule
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6 p-6 paper-texture bg-muted/30">
            <h4 className="mb-3 text-sm">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => navigate(`/spaces/${spaceId}/members`)}
              >
                <Users className="w-4 h-4" />
                Invite Members
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
              >
                <Archive className="w-4 h-4" />
                Export Writings
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </MainLayout>
  );
}

// Navigation Item Component with ASCII icons
function NavItem({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: string; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
        active 
          ? 'bg-black text-white' 
          : 'hover:bg-muted text-foreground'
      }`}
    >
      <span className="text-sm font-mono">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

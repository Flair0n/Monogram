import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
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
  Edit2,
  Check,
  X
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

// Mock responses data with editable content
const mockResponsesData = [
  {
    id: "1",
    weekNumber: 12,
    title: "What surprised you this week?",
    content: "The way light filtered through the cafe window at exactly 3pm, creating patterns on my notebook that reminded me of childhood afternoons spent reading in my grandmother's living room. It was such a small thing, but it stopped me in my tracks and made me realize how rarely I pause to notice these moments.",
    date: "Nov 10, 2025",
    wordCount: 347
  },
  {
    id: "2",
    weekNumber: 11,
    title: "Describe a conversation that changed your perspective.",
    content: "A brief exchange with a stranger at the bus stop about the weather turned into a profound discussion about how we choose to experience each day. They said something simple: 'Every morning is a blank page.' It shifted how I think about routine.",
    date: "Nov 9, 2025",
    wordCount: 289
  },
  {
    id: "3",
    weekNumber: 10,
    title: "What are you grateful for that you once took for granted?",
    content: "The sound of rain on the roof. I used to barely notice it, but after living in an apartment building for years, moving to a house with a proper attic has made me appreciate this simple pleasure. It's become my favorite soundtrack for writing.",
    date: "Nov 8, 2025",
    wordCount: 412
  },
  {
    id: "4",
    weekNumber: 9,
    title: "If you could bottle a feeling from this week, which would it be?",
    content: "That quiet satisfaction after finishing a project I'd been putting off for months. Not the loud celebration kind of happiness, but the peaceful contentment of knowing I followed through on something important to me.",
    date: "Nov 7, 2025",
    wordCount: 325
  },
  {
    id: "5",
    weekNumber: 8,
    title: "What lesson did you learn the hard way this week?",
    content: "That saying 'yes' to everything means saying 'no' to the things that truly matter. I overcommitted and ended up exhausted, missing out on quality time with people I care about. Setting boundaries isn't selfish—it's necessary.",
    date: "Nov 6, 2025",
    wordCount: 398
  }
];

// Current week's prompts
const currentWeekPrompts = [
  "What surprised you this week?",
  "Describe a conversation that changed your perspective.",
  "What are you grateful for that you once took for granted?"
];

// Mock archived weeks data
const generateArchivedWeeks = (currentWeekNumber: number) => {
  const archivedWeeks = [];
  const curators = ["Emma Chen", "Marcus Williams", "Sofia Rodriguez", "You"];
  
  for (let i = 1; i <= 8; i++) {
    const weekNumber = currentWeekNumber - i;
    const curator = curators[i % curators.length];
    
    archivedWeeks.push({
      weekNumber,
      dateRange: `Oct ${30 - i * 7}–Nov ${6 - i * 7}, 2025`,
      curator,
      prompts: [
        {
          id: `${weekNumber}-1`,
          text: i % 3 === 0 ? "What made you laugh this week?" : i % 3 === 1 ? "Describe a small act of kindness you witnessed." : "What lesson did you learn the hard way?",
          userResponse: i <= 5 ? {
            content: "This is a sample response that shows what the user wrote for this archived prompt. It could be quite long and detailed, capturing their thoughts and reflections from that particular week.",
            wordCount: 142,
            publishedAt: `Oct ${30 - i * 7}, 2025`
          } : null
        },
        {
          id: `${weekNumber}-2`,
          text: i % 3 === 0 ? "If you could relive one moment, which would it be?" : i % 3 === 1 ? "What song captured your mood this week?" : "Describe a place that brought you peace.",
          userResponse: i <= 4 ? {
            content: "Another thoughtful response from the past, showing the user's engagement with the prompts over time.",
            wordCount: 89,
            publishedAt: `Oct ${31 - i * 7}, 2025`
          } : null
        },
        {
          id: `${weekNumber}-3`,
          text: i % 3 === 0 ? "What are you looking forward to?" : i % 3 === 1 ? "Share a quote that resonated with you." : "What habit are you grateful for?",
          userResponse: i <= 3 ? {
            content: "A reflection on habits, routines, or memorable quotes that shaped that week's experience.",
            wordCount: 67,
            publishedAt: `Nov ${1 - i * 7}, 2025`
          } : null
        }
      ],
      totalResponses: i <= 5 ? (i <= 3 ? 3 : i === 4 ? 2 : 1) : 0,
      participation: `${Math.floor(Math.random() * 3) + 6}/8`
    });
  }
  
  return archivedWeeks;
};

export function SpaceDashboard() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { setCurrentSpace } = useSpace();
  const [activeNav, setActiveNav] = useState<"thisweek" | "responses" | "members" | "archive">("thisweek");
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [responses, setResponses] = useState(mockResponsesData);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  
  // This Week reflection state
  const [currentWeekReflections, setCurrentWeekReflections] = useState<{
    [promptIndex: number]: { content: string; isDraft: boolean; savedAt?: string }
  }>({});
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [reflectionContent, setReflectionContent] = useState("");
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Archive state
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const currentSpace = mockSpacesData[spaceId || "1"] || mockSpacesData["1"];

  // Initialize reflection content on mount
  useEffect(() => {
    const saved = currentWeekReflections[activePromptIndex];
    if (saved?.content) {
      setReflectionContent(saved.content);
    }
  }, []);

  // Load saved reflection when switching prompts
  const handlePromptChange = (index: number) => {
    setActivePromptIndex(index);
    const saved = currentWeekReflections[index];
    setReflectionContent(saved?.content || "");
    setIsEditingReflection(true);
  };

  // Save as draft
  const handleSaveDraft = () => {
    setCurrentWeekReflections(prev => ({
      ...prev,
      [activePromptIndex]: {
        content: reflectionContent,
        isDraft: true,
        savedAt: new Date().toISOString()
      }
    }));
    
    // Show success feedback
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  // Publish reflection
  const handlePublish = () => {
    const newResponse = {
      id: `new-${Date.now()}`,
      weekNumber: currentSpace.weekNumber,
      title: currentWeekPrompts[activePromptIndex],
      content: reflectionContent,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      wordCount: reflectionContent.split(/\s+/).filter(w => w.length > 0).length
    };
    
    setResponses(prev => [newResponse, ...prev]);
    
    // Mark as published
    setCurrentWeekReflections(prev => ({
      ...prev,
      [activePromptIndex]: {
        content: reflectionContent,
        isDraft: false,
        savedAt: new Date().toISOString()
      }
    }));
    
    // Clear current reflection and show success
    setReflectionContent("");
    setIsEditingReflection(false);
    
    // Optional: Switch to My Responses tab after a short delay
    setTimeout(() => {
      setActiveNav("responses");
    }, 1000);
  };

  const handleEditResponse = (id: string, title: string, content: string) => {
    setEditingResponseId(id);
    setEditedTitle(title);
    setEditedContent(content);
  };

  const handleSaveResponse = (id: string) => {
    setResponses(prev => prev.map(response => 
      response.id === id 
        ? { ...response, title: editedTitle, content: editedContent, wordCount: editedContent.split(/\s+/).filter(w => w.length > 0).length }
        : response
    ));
    setEditingResponseId(null);
    setEditedTitle("");
    setEditedContent("");
  };

  const handleCancelEdit = () => {
    setEditingResponseId(null);
    setEditedTitle("");
    setEditedContent("");
  };

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
                    <h1 className="text-4xl font-serif mb-2">This Week's Prompts</h1>
                    <p className="text-muted-foreground">
                      Curated by {currentSpace.currentCurator}
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  {/* All Prompts with Inline Responses */}
                  <div className="space-y-8">
                    {currentWeekPrompts.map((prompt, index) => {
                      const saved = currentWeekReflections[index];
                      const isEditing = activePromptIndex === index && isEditingReflection;
                      
                      return (
                        <Card key={index} className="p-8 paper-texture border-black/20 shadow-sm">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Prompt Header */}
                            <div className="flex items-start justify-between gap-4 mb-6">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-black/20 flex items-center justify-center mt-1">
                                  <span className="text-sm font-mono">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-serif text-xl mb-2">{prompt}</p>
                                  {saved && !isEditing && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge 
                                        variant={saved.isDraft ? "secondary" : "default"}
                                        className="text-xs"
                                      >
                                        {saved.isDraft ? "Draft" : "Published"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {saved.content.split(/\s+/).filter(w => w.length > 0).length} words
                                        {saved.savedAt && ` · Saved ${new Date(saved.savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Edit Button */}
                              {saved && !isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePromptChange(index)}
                                  className="gap-2"
                                >
                                  <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                                  Edit
                                </Button>
                              )}
                            </div>

                            <Separator className="mb-6" />

                            {/* Display or Edit Mode */}
                            {isEditing ? (
                              // Edit Mode
                              <div className="space-y-6">
                                <Textarea
                                  value={reflectionContent}
                                  onChange={(e) => setReflectionContent(e.target.value)}
                                  placeholder="Start your reflection here…

Press enter to begin a new paragraph. Write freely—this is your space to think, explore, and reflect on the week's experiences."
                                  className="min-h-[300px] text-base leading-relaxed resize-none border-0 focus:ring-0 focus:outline-none shadow-none p-0 font-serif placeholder:text-muted-foreground/40 placeholder:italic bg-transparent"
                                  style={{ lineHeight: '1.8' }}
                                  autoFocus
                                />

                                {/* Edit Footer */}
                                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">
                                      {reflectionContent.split(/\s+/).filter(w => w.length > 0).length} words
                                    </div>
                                    
                                    {/* Save Success Message */}
                                    <AnimatePresence>
                                      {showSaveSuccess && (
                                        <motion.div
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -10 }}
                                          className="flex items-center gap-2 text-sm text-sage"
                                        >
                                          <Check className="w-4 h-4" strokeWidth={2} />
                                          <span>Draft saved</span>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditingReflection(false);
                                        setReflectionContent("");
                                      }}
                                      className="gap-2 border-black/20 hover:bg-black/5"
                                    >
                                      <X className="w-4 h-4" strokeWidth={1.5} />
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={handleSaveDraft}
                                      disabled={!reflectionContent.trim()}
                                      className="gap-2 border-black/20 hover:bg-cream/30 hover:border-black/30 disabled:opacity-40 shadow-sm"
                                    >
                                      <FileText className="w-4 h-4" strokeWidth={1.5} />
                                      Save Draft
                                    </Button>
                                    <Button
                                      onClick={handlePublish}
                                      disabled={!reflectionContent.trim()}
                                      className="gap-2 bg-black text-white hover:bg-black/90 disabled:opacity-40 shadow-md"
                                    >
                                      <Check className="w-4 h-4" strokeWidth={1.5} />
                                      Publish
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : saved ? (
                              // Display Mode with Saved Content
                              <div>
                                <p className="text-base text-muted-foreground leading-relaxed font-serif whitespace-pre-wrap">
                                  {saved.content}
                                </p>
                              </div>
                            ) : (
                              // Empty State
                              <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">You haven't responded to this prompt yet.</p>
                                <Button
                                  variant="outline"
                                  onClick={() => handlePromptChange(index)}
                                  className="gap-2"
                                >
                                  <PenLine className="w-4 h-4" strokeWidth={1.5} />
                                  Write Response
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Curator Note */}
                  {currentSpace.currentCurator === "Emma Chen" && (
                    <Card className="mt-8 p-6 bg-sage/5 border-sage/20">
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        💭 "I've been thinking a lot about gratitude this week. These prompts 
                        are an invitation to notice the small things that hold us together."
                      </p>
                      <p className="text-sm mt-2 font-serif">— Emma</p>
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
                    {responses.map((response) => (
                      <Card key={response.id} className="p-6 paper-texture">
                        {editingResponseId === response.id ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Editing Mode */}
                            <div className="space-y-4">
                              <div>
                                <Badge variant="secondary" className="mb-3">Week {response.weekNumber}</Badge>
                                <Input
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  className="font-medium mb-3 border-black/20 focus:border-black/40"
                                  placeholder="Response title..."
                                />
                              </div>
                              
                              <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="min-h-[200px] leading-relaxed resize-none border-black/20 focus:border-black/40"
                                placeholder="Write your response..."
                              />
                              
                              <div className="flex items-center justify-between pt-2">
                                <div className="text-xs text-muted-foreground">
                                  {editedContent.split(/\s+/).filter(word => word.length > 0).length} words
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="gap-2 border-black/20 hover:bg-black/5"
                                  >
                                    <X className="w-4 h-4" strokeWidth={1.5} />
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveResponse(response.id)}
                                    className="gap-2 bg-black text-white hover:bg-black/90 shadow-sm"
                                  >
                                    <Check className="w-4 h-4" strokeWidth={1.5} />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Display Mode */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <Badge variant="secondary" className="mb-2">Week {response.weekNumber}</Badge>
                                <p className="font-medium">{response.title}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditResponse(response.id, response.title, response.content)}
                                className="hover:bg-black/5"
                              >
                                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                              {response.content}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{response.date}</span>
                              <span>•</span>
                              <span>{response.wordCount} words</span>
                            </div>
                          </motion.div>
                        )}
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
                    {generateArchivedWeeks(currentSpace.weekNumber).map((week) => {
                      const isExpanded = expandedWeek === week.weekNumber;
                      
                      return (
                        <Card key={week.weekNumber} className="paper-texture overflow-hidden">
                          {/* Week Header - Clickable */}
                          <button
                            onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                            className="w-full p-6 text-left hover:bg-cream/20 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="outline">Week {week.weekNumber}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {week.dateRange}
                                  </span>
                                </div>
                                <p className="font-medium mb-2">Curated by {week.curator}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span>{week.totalResponses} of 3 prompts answered</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{week.participation} members</span>
                                  </div>
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                              </motion.div>
                            </div>
                          </button>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <Separator />
                                <div className="p-6 pt-4 space-y-6">
                                  {week.prompts.map((prompt, index) => (
                                    <div key={prompt.id} className="space-y-3">
                                      {/* Prompt */}
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-black/20 flex items-center justify-center">
                                          <span className="text-xs font-mono">{index + 1}</span>
                                        </div>
                                        <p className="font-medium text-foreground/90">{prompt.text}</p>
                                      </div>

                                      {/* User's Response or No Response */}
                                      {prompt.userResponse ? (
                                        <div className="ml-9 bg-cream/20 p-4 rounded-lg border border-black/5">
                                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                            {prompt.userResponse.content}
                                          </p>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{prompt.userResponse.publishedAt}</span>
                                            <span>•</span>
                                            <span>{prompt.userResponse.wordCount} words</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="ml-9 text-sm text-muted-foreground italic">
                                          No response submitted
                                        </div>
                                      )}

                                      {index < week.prompts.length - 1 && (
                                        <Separator className="ml-9 mt-6" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      );
                    })}
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

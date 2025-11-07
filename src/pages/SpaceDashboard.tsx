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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
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
  X,
  Copy,
  Send,
  UserPlus,
  Trash2,
  Image,
  Plus,
  Music
} from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { useSpace } from "../contexts/SpaceContext";
import { useAuth } from "../contexts/AuthContext";
import { ExportWritings } from "../components/ExportWritings";
import { SpotifyResponse } from "../components/SpotifyResponse";
import { SpotifyTrackCard } from "../components/SpotifyTrackCard";
import { PlaylistBuilder } from "../components/PlaylistBuilder";
import { 
  getSpace,
  getSpaceByName,
  getSpaceMembers, 
  getCurrentWeekPrompts, 
  getUserResponses,
  submitResponse,
  getArchivedWeeks,
  createPrompt,
  deletePrompt,
  getWeekSubmissionStatus,
  getWeekSpotifyResponses,
  publishWeek,
  updateResponse,
  type SpaceWithDetails 
} from "../lib/space-api";
import { supabase } from "../lib/supabase";
import type { SpotifyResponseData } from "../lib/spotify-types";

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

// Initial members data
const initialMembersData = [
  { id: "1", name: "Emma Chen", role: "Curator", email: "emma@example.com", joinedDate: "Jan 2024", responsesCount: 18, avatar: "EC" },
  { id: "2", name: "Marcus Williams", role: "Member", email: "marcus@example.com", joinedDate: "Jan 2024", responsesCount: 15, avatar: "MW" },
  { id: "3", name: "Sofia Rodriguez", role: "Member", email: "sofia@example.com", joinedDate: "Feb 2024", responsesCount: 22, avatar: "SR" },
  { id: "4", name: "You", role: "Member", email: "you@example.com", joinedDate: "Feb 2024", responsesCount: 12, avatar: "YO" },
  { id: "5", name: "James Park", role: "Member", email: "james@example.com", joinedDate: "Feb 2024", responsesCount: 9, avatar: "JP" },
  { id: "6", name: "Olivia Taylor", role: "Member", email: "olivia@example.com", joinedDate: "Mar 2024", responsesCount: 14, avatar: "OT" },
  { id: "7", name: "Daniel Kim", role: "Member", email: "daniel@example.com", joinedDate: "Mar 2024", responsesCount: 11, avatar: "DK" },
  { id: "8", name: "Sarah Johnson", role: "Member", email: "sarah@example.com", joinedDate: "Mar 2024", responsesCount: 8, avatar: "SJ" }
];

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
  const archivedWeeks: Array<{
    weekNumber: number;
    dateRange: string;
    curator: string;
    prompts: Array<{
      id: string;
      text: string;
      userResponse: {
        content: string;
        wordCount: number;
        publishedAt: string;
      } | null;
    }>;
    totalResponses: number;
    participation: string;
  }> = [];
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
  const { spaceName } = useParams<{ spaceName: string }>();
  const navigate = useNavigate();
  const { setCurrentSpace } = useSpace();
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<"thisweek" | "responses" | "members" | "archive" | "review">("thisweek");
  
  // Real data state
  const [space, setSpace] = useState<SpaceWithDetails | null>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [archivedWeeks, setArchivedWeeks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  
  // This Week reflection state
  const [currentWeekReflections, setCurrentWeekReflections] = useState<{
    [promptIndex: number]: { content: string; imageUrl?: string; isDraft: boolean; savedAt?: string }
  }>({});
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [reflectionContent, setReflectionContent] = useState("");
  const [reflectionImage, setReflectionImage] = useState<File | null>(null);
  const [reflectionImagePreview, setReflectionImagePreview] = useState<string>("");
  const [reflectionSpotify, setReflectionSpotify] = useState<SpotifyResponseData | null>(null);
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Archive state
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  
  // Invite members state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  // Export writings state
  const [exportInlineOpen, setExportInlineOpen] = useState(false);
  
  // Curator prompt creation state
  const [promptType, setPromptType] = useState<"text" | "image" | "spotify">("text");
  const [newPromptText, setNewPromptText] = useState("");
  const [newPromptCaption, setNewPromptCaption] = useState("");
  const [newPromptImage, setNewPromptImage] = useState<File | null>(null);
  const [newPromptImagePreview, setNewPromptImagePreview] = useState<string>("");
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<{ id: string; question: string } | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Review & Publish state
  const [submissionStatus, setSubmissionStatus] = useState<any[]>([]);
  const [spotifyResponses, setSpotifyResponses] = useState<SpotifyResponseData[]>([]);
  const [showPublishWeekDialog, setShowPublishWeekDialog] = useState(false);
  const [isPublishingWeek, setIsPublishingWeek] = useState(false);

  // Handle escape key for dialogs
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (promptToDelete) setPromptToDelete(null);
        if (showPublishDialog && !isPublishing) setShowPublishDialog(false);
        if (showPublishWeekDialog && !isPublishingWeek) setShowPublishWeekDialog(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [promptToDelete, showPublishDialog, isPublishing, showPublishWeekDialog, isPublishingWeek]);

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
          // Load current week prompts
          const promptsData = await getCurrentWeekPrompts(spaceData.id, spaceData.current_week);
          setPrompts(promptsData);

          // Load members
          const membersData = await getSpaceMembers(spaceData.id);
          setMembers(membersData);

          // Load user responses
          const responsesData = await getUserResponses(user.id, spaceData.id);
          setResponses(responsesData);

          // Load archived weeks
          const archivedData = await getArchivedWeeks(spaceData.id, spaceData.current_week, user.id);
          setArchivedWeeks(archivedData);

          // Load submission status if user is curator or leader
          if (user.id === spaceData.current_curator_id || user.id === spaceData.leader_id) {
            const statusData = await getWeekSubmissionStatus(spaceData.id, spaceData.current_week);
            setSubmissionStatus(statusData);
            
            // Load Spotify responses for playlist building
            const spotifyData = await getWeekSpotifyResponses(spaceData.id, spaceData.current_week);
            setSpotifyResponses(spotifyData);
          }

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

    // Clear space context when component unmounts
    return () => {
      setCurrentSpace(null);
    };
  }, [spaceName, user, setCurrentSpace]);

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
  const handlePublish = async () => {
    if (!user || !prompts[activePromptIndex]) return;

    try {
      const prompt = prompts[activePromptIndex];
      let imageUrl: string | undefined = undefined;
      let musicUrl: string | undefined = undefined;
      let content = reflectionContent;
      
      // Upload image if this is an image response type
      if (prompt.response_type === 'IMAGE' && reflectionImage && space) {
        const fileExt = reflectionImage.name.split('.').pop();
        const fileName = `${space.id}/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('response-images')
          .upload(fileName, reflectionImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('response-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }
      
      // Handle Spotify response type
      if (prompt.response_type === 'SPOTIFY' && reflectionSpotify) {
        musicUrl = reflectionSpotify.spotifyUrl;
        imageUrl = reflectionSpotify.albumArtUrl;
        // Store track metadata as JSON in content field
        content = JSON.stringify({
          trackId: reflectionSpotify.trackId,
          trackName: reflectionSpotify.trackName,
          artistName: reflectionSpotify.artistName,
          albumName: reflectionSpotify.albumName,
          duration: reflectionSpotify.duration,
        });
      }
      
      // Submit to database
      await submitResponse({
        promptId: prompt.id,
        userId: user.id,
        content: content,
        imageUrl: imageUrl,
        musicUrl: musicUrl,
        isDraft: false,
      });

      // Mark as published locally
      setCurrentWeekReflections(prev => ({
        ...prev,
        [activePromptIndex]: {
          content: content,
          imageUrl: imageUrl,
          isDraft: false,
          savedAt: new Date().toISOString()
        }
      }));

      // Reload responses
      if (space) {
        const responsesData = await getUserResponses(user.id, space.id);
        setResponses(responsesData);
      }

      // Clear current reflection and show success
      setReflectionContent("");
      setReflectionImage(null);
      setReflectionImagePreview("");
      setReflectionSpotify(null);
      setIsEditingReflection(false);

      // Switch to My Responses tab after a short delay
      setTimeout(() => {
        setActiveNav("responses");
      }, 1000);
    } catch (error) {
      console.error('Error publishing response:', error);
    }
  };

  const handleEditResponse = (id: string, title: string, content: string) => {
    setEditingResponseId(id);
    setEditedTitle(title);
    setEditedContent(content);
  };

  const handleSaveResponse = async (id: string) => {
    try {
      await updateResponse(id, editedContent);
      
      // Reload responses
      if (space && user) {
        const responsesData = await getUserResponses(user.id, space.id);
        setResponses(responsesData);
      }
      
      setEditingResponseId(null);
      setEditedTitle("");
      setEditedContent("");
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingResponseId(null);
    setEditedTitle("");
    setEditedContent("");
  };

  const handleSendInvites = () => {
    // Parse emails from the textarea
    const emailList = inviteEmails
      .split(/[\n,]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
    
    if (emailList.length === 0) return;
    
    // Add new members to the list
    const newMembers = emailList.map((email, index) => {
      const nameParts = email.split('@')[0].split('.');
      const name = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || email.split('@')[0];
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      return {
        id: `new-${Date.now()}-${index}`,
        name: name,
        role: "Member" as const,
        email: email,
        joinedDate: "Just now",
        responsesCount: 0,
        avatar: initials
      };
    });
    
    setMembers(prev => [...prev, ...newMembers]);
    setInviteSuccess(true);
    
    setTimeout(() => {
      setInviteDialogOpen(false);
      setInviteEmails("");
      setInviteMessage("");
      setInviteSuccess(false);
      
      // Auto-switch to Members tab to show new members
      setActiveNav("members");
    }, 1500);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPromptImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPromptImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewPromptImage(null);
    setNewPromptImagePreview("");
  };

  const handleResponseImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReflectionImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReflectionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveResponseImage = () => {
    setReflectionImage(null);
    setReflectionImagePreview("");
  };

  const handleAddPrompt = async () => {
    if (!user || !space || !newPromptText.trim()) return;

    try {
      setIsAddingPrompt(true);
      
      await createPrompt({
        spaceId: space.id,
        curatorId: user.id,
        weekNumber: space.current_week,
        question: newPromptText.trim(),
        order: prompts.length + 1,
        responseType: promptType === "text" ? "TEXT" : promptType === "image" ? "IMAGE" : "SPOTIFY",
        isPublished: true,
      });

      // Reload prompts
      const promptsData = await getCurrentWeekPrompts(space.id, space.current_week);
      setPrompts(promptsData);
      
      // Reset form
      setPromptType("text");
      setNewPromptText("");
      setNewPromptCaption("");
      setNewPromptImage(null);
      setNewPromptImagePreview("");
      setShowPromptForm(false);
    } catch (error) {
      console.error('Error adding prompt:', error);
    } finally {
      setIsAddingPrompt(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!space) return;

    try {
      await deletePrompt(promptId);

      // Reload prompts
      const promptsData = await getCurrentWeekPrompts(space.id, space.current_week);
      setPrompts(promptsData);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handlePublishPrompts = async () => {
    if (!space) return;

    try {
      setIsPublishing(true);
      
      // TODO: Implement email notification logic
      // This will send emails to all space members with the week's prompts
      console.log('Publishing prompts to members:', {
        spaceId: space.id,
        spaceName: space.name,
        weekNumber: space.current_week,
        promptCount: prompts.length,
        memberCount: space.member_count
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowPublishDialog(false);
      // Could show a success toast here
    } catch (error) {
      console.error('Error publishing prompts:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishWeek = async () => {
    if (!space) return;

    try {
      setIsPublishingWeek(true);
      
      // Publish the week and create newsletter
      await publishWeek(space.id, space.current_week);
      
      // Auto-rotate curator if rotation type is not manual
      if (space.rotation_type !== 'MANUAL') {
        const { rotateCurator } = await import('../lib/space-api');
        await rotateCurator(space.id);
      }
      
      // Reload space data to reflect published status and new curator
      const spaceData = await getSpaceByName(decodeURIComponent(spaceName!));
      if (spaceData) {
        setSpace(spaceData);
      }
      
      setShowPublishWeekDialog(false);
      
      // Switch to archive tab to show the published week
      setTimeout(() => {
        setActiveNav("archive");
      }, 1000);
    } catch (error) {
      console.error('Error publishing week:', error);
    } finally {
      setIsPublishingWeek(false);
    }
  };

  // Show loading state
  if (loading || !space) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sage border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading space...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
            
            {/* Review & Publish - Only for Curator and Leader */}
            {(user?.id === space.current_curator_id || user?.id === space.leader_id) && (
              <>
                <Separator className="my-4" />
                <NavItem
                  icon="[✓]"
                  label="Review & Publish"
                  active={activeNav === "review"}
                  onClick={() => setActiveNav("review")}
                />
              </>
            )}
            
            <Separator className="my-4" />
            
            <NavItem
              icon="[*]"
              label="Space Settings"
              active={false}
              onClick={() => navigate(`/spaces/${encodeURIComponent(space.name)}/settings`)}
            />
          </nav>

          {/* Bottom Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Week {space.current_week}</p>
              <p>{space.member_count} members active</p>
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
                        Week {space.current_week}
                      </span>
                    </div>
                    <h1 className="text-4xl font-serif mb-2">This Week's Prompts</h1>
                    <p className="text-muted-foreground">
                      Curated by {space.current_curator?.name || "No curator assigned"}
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  {/* Curator Panel - Show ONLY if user is current curator */}
                  {space.current_curator_id && user?.id === space.current_curator_id && (
                    <Card className="p-6 mb-8 paper-texture bg-sage/5 border-sage/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium mb-1">You're the Curator this week!</h3>
                          <p className="text-sm text-muted-foreground">Set prompts for your space members to respond to</p>
                        </div>
                      </div>
                      
                      {prompts.length < 10 && (
                        <div className="space-y-3">
                          {!showPromptForm ? (
                            <Button
                              onClick={() => setShowPromptForm(true)}
                              variant="outline"
                              className="w-full gap-2 border-sage/30 hover:bg-sage/10"
                            >
                              <Plus className="w-4 h-4" />
                              Add New Prompt
                            </Button>
                          ) : (
                            <div className="space-y-4 p-4 border border-sage/20 rounded-lg bg-background">
                              {/* Response Type Selector */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Response Type</Label>
                                <p className="text-xs text-muted-foreground mb-2">How should members respond to this prompt?</p>
                                <div className="grid grid-cols-3 gap-2">
                                  <Button
                                    type="button"
                                    variant={promptType === "text" ? "default" : "outline"}
                                    onClick={() => setPromptType("text")}
                                    className="gap-2"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Text
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={promptType === "image" ? "default" : "outline"}
                                    onClick={() => setPromptType("image")}
                                    className="gap-2"
                                  >
                                    <Image className="w-4 h-4" />
                                    Image
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={promptType === "spotify" ? "default" : "outline"}
                                    onClick={() => setPromptType("spotify")}
                                    className="gap-2"
                                  >
                                    <Music className="w-4 h-4" />
                                    Spotify
                                  </Button>
                                </div>
                              </div>

                              {/* Prompt Question (for all types) */}
                              <div className="space-y-2">
                                <Label htmlFor="prompt-question" className="text-sm">
                                  Prompt Question
                                </Label>
                                <Textarea
                                  id="prompt-question"
                                  placeholder={
                                    promptType === "text" 
                                      ? "Enter a thought-provoking question..." 
                                      : promptType === "image"
                                      ? "e.g., Share an image that represents your week"
                                      : "e.g., Share a song that captures your mood this week"
                                  }
                                  value={newPromptText}
                                  onChange={(e) => setNewPromptText(e.target.value)}
                                  className="min-h-[100px] resize-none"
                                  autoFocus
                                />
                                {promptType === "image" && (
                                  <p className="text-xs text-muted-foreground">
                                    Members will upload an image with a one-line caption
                                  </p>
                                )}
                                {promptType === "spotify" && (
                                  <p className="text-xs text-muted-foreground">
                                    Members will share a Spotify track (URL or Now Playing)
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowPromptForm(false);
                                    setPromptType("text");
                                    setNewPromptText("");
                                    setNewPromptCaption("");
                                    setNewPromptImage(null);
                                    setNewPromptImagePreview("");
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleAddPrompt}
                                  disabled={isAddingPrompt || !newPromptText.trim()}
                                  className="flex-1 gap-2 bg-sage hover:bg-sage/90 text-cream"
                                >
                                  <PenLine className="w-4 h-4" />
                                  {isAddingPrompt ? 'Adding...' : 'Add Prompt'}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{prompts.length}/10 prompts created</span>
                          </div>
                        </div>
                      )}
                      
                      {prompts.length >= 10 && (
                        <p className="text-sm text-muted-foreground">
                          Maximum of 10 prompts reached for this week
                        </p>
                      )}
                      
                      {prompts.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-sage/20">
                          <Button
                            onClick={() => setShowPublishDialog(true)}
                            className="w-full gap-2 bg-sage hover:bg-sage/90 text-cream"
                          >
                            <Send className="w-4 h-4" />
                            Publish & Notify Members ({space.member_count} members)
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Send email notification to all members with this week's prompts
                          </p>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* All Prompts with Inline Responses */}
                  {prompts.length === 0 ? (
                    <Card className="p-12 text-center paper-texture">
                      <p className="text-muted-foreground mb-4">No prompts for this week yet.</p>
                      <p className="text-sm text-muted-foreground">The curator will set prompts soon.</p>
                    </Card>
                  ) : (
                    <div className="space-y-8">
                      {prompts.map((prompt, index) => {
                      const saved = currentWeekReflections[index];
                      const isEditing = activePromptIndex === index && isEditingReflection;
                      const isCurator = space.current_curator_id && user?.id === space.current_curator_id;
                      
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
                                  <div className="flex items-start gap-2 mb-3">
                                    <p className="font-serif text-xl flex-1">{prompt.question}</p>
                                    {prompt.response_type === 'SPOTIFY' && (
                                      <Badge variant="outline" className="text-xs gap-1 shrink-0">
                                        <Music className="w-3 h-3" />
                                        Spotify Response
                                      </Badge>
                                    )}
                                    {prompt.response_type === 'IMAGE' && (
                                      <Badge variant="outline" className="text-xs gap-1 shrink-0">
                                        <Image className="w-3 h-3" />
                                        Image Response
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {saved && !isEditing && (
                                    <div className="flex items-center gap-2 mt-4">
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
                              
                              <div className="flex items-center gap-2">
                                {/* Edit Button for responses */}
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
                                
                                {/* Delete Button for curator */}
                                {isCurator && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPromptToDelete({ id: prompt.id, question: prompt.question })}
                                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <Separator className="mb-6" />

                            {/* Display or Edit Mode */}
                            {isEditing ? (
                              // Edit Mode
                              <div className="space-y-6">
                                {/* Spotify Response Type */}
                                {prompt.response_type === 'SPOTIFY' ? (
                                  <SpotifyResponse
                                    promptId={prompt.id}
                                    onSubmit={(data) => setReflectionSpotify(data)}
                                    initialValue={reflectionSpotify || undefined}
                                  />
                                ) : prompt.response_type === 'IMAGE' ? (
                                  /* Image Response Type */
                                  <div className="space-y-4">
                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                      {reflectionImagePreview ? (
                                        <div className="relative">
                                          <img 
                                            src={reflectionImagePreview} 
                                            alt="Response" 
                                            className="w-full max-h-96 object-cover rounded-lg border border-border"
                                          />
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleRemoveResponseImage}
                                            className="absolute top-2 right-2 gap-2"
                                          >
                                            <X className="w-4 h-4" />
                                            Remove
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleResponseImageSelect}
                                            className="hidden"
                                            id="response-image-upload"
                                          />
                                          <label
                                            htmlFor="response-image-upload"
                                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                          >
                                            <Image className="w-12 h-12 text-muted-foreground mb-3" />
                                            <span className="text-sm text-muted-foreground font-medium">Click to upload your image</span>
                                            <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                                          </label>
                                        </div>
                                      )}
                                    </div>

                                    {/* Caption Input */}
                                    <div className="space-y-2">
                                      <Label htmlFor="image-caption" className="text-sm">Caption (one line)</Label>
                                      <Input
                                        id="image-caption"
                                        value={reflectionContent}
                                        onChange={(e) => setReflectionContent(e.target.value)}
                                        placeholder="Add a short caption for your image..."
                                        maxLength={150}
                                        className="text-base"
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        {reflectionContent.length}/150 characters
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  /* Text Response Type */
                                  <Textarea
                                    value={reflectionContent}
                                    onChange={(e) => setReflectionContent(e.target.value)}
                                    placeholder="Start your reflection here…

Press enter to begin a new paragraph. Write freely—this is your space to think, explore, and reflect on the week's experiences."
                                    className="min-h-[300px] text-base leading-relaxed resize-none border-0 focus:ring-0 focus:outline-none shadow-none p-0 font-serif placeholder:text-muted-foreground/40 placeholder:italic bg-transparent"
                                    style={{ lineHeight: '1.8' }}
                                    autoFocus
                                  />
                                )}

                                {/* Edit Footer */}
                                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">
                                      {prompt.response_type === 'IMAGE' 
                                        ? `${reflectionContent.length}/150 characters`
                                        : `${reflectionContent.split(/\s+/).filter(w => w.length > 0).length} words`
                                      }
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
                                        setReflectionImage(null);
                                        setReflectionImagePreview("");
                                        setReflectionSpotify(null);
                                      }}
                                      className="gap-2 border-black/20 hover:bg-black/5"
                                    >
                                      <X className="w-4 h-4" strokeWidth={1.5} />
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={handleSaveDraft}
                                      disabled={
                                        prompt.response_type === 'SPOTIFY'
                                          ? !reflectionSpotify
                                          : prompt.response_type === 'IMAGE' 
                                          ? (!reflectionImage || !reflectionContent.trim())
                                          : !reflectionContent.trim()
                                      }
                                      className="gap-2 border-black/20 hover:bg-cream/30 hover:border-black/30 disabled:opacity-40 shadow-sm"
                                    >
                                      <FileText className="w-4 h-4" strokeWidth={1.5} />
                                      Save Draft
                                    </Button>
                                    <Button
                                      onClick={handlePublish}
                                      disabled={
                                        prompt.response_type === 'SPOTIFY'
                                          ? !reflectionSpotify
                                          : prompt.response_type === 'IMAGE' 
                                          ? (!reflectionImage || !reflectionContent.trim())
                                          : !reflectionContent.trim()
                                      }
                                      className="gap-2 bg-sage hover:bg-sage/90 text-cream disabled:opacity-40 shadow-md"
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
                  )}

                  {/* Curator Note */}
                  {space.current_curator && (
                    <Card className="mt-8 p-6 bg-sage/5 border-sage/20">
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        💭 This week's prompts curated by {space.current_curator.name}
                      </p>
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

                  {responses.length === 0 ? (
                    <Card className="p-12 text-center paper-texture">
                      <p className="text-muted-foreground mb-4">No responses yet.</p>
                      <p className="text-sm text-muted-foreground">Start writing to see your responses here.</p>
                    </Card>
                  ) : (
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
                                    className="gap-2 bg-sage hover:bg-sage/90 text-cream shadow-sm"
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
                                <Badge variant="secondary" className="mb-2">Week {response.prompt?.week_number}</Badge>
                                <p className="font-medium">{response.prompt?.question}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditResponse(response.id, response.prompt?.question || "", response.content)}
                                className="hover:bg-black/5"
                              >
                                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                              </Button>
                            </div>
                            {/* Check if this is a Spotify response */}
                            {response.music_url ? (
                              <div className="mb-3">
                                {(() => {
                                  try {
                                    const trackData = JSON.parse(response.content);
                                    return (
                                      <SpotifyTrackCard
                                        track={{
                                          id: trackData.trackId || '',
                                          name: trackData.trackName || 'Unknown Track',
                                          artist: trackData.artistName || 'Unknown Artist',
                                          album: trackData.albumName || 'Unknown Album',
                                          albumArt: response.image_url || '',
                                          duration: trackData.duration || 0,
                                          url: response.music_url,
                                        }}
                                        showProgress={false}
                                        animated={false}
                                      />
                                    );
                                  } catch (e) {
                                    // Fallback for invalid JSON
                                    return (
                                      <div className="p-4 border border-border rounded-lg bg-muted/20">
                                        <p className="text-sm text-muted-foreground mb-2">
                                          🎵 Spotify track shared
                                        </p>
                                        <a 
                                          href={response.music_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-sage hover:underline"
                                        >
                                          Open in Spotify
                                        </a>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            ) : (
                              /* Regular text response */
                              <>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                  {response.content}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{new Date(response.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span>•</span>
                                  <span>{response.content.split(/\s+/).filter((w: string) => w.length > 0).length} words</span>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </Card>
                    ))}
                  </div>
                  )}
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
                      {members.length} active member{members.length !== 1 ? 's' : ''} in this space
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  {members.length === 0 ? (
                    <Card className="p-12 text-center paper-texture">
                      <p className="text-muted-foreground">No members yet.</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {members.map((member) => {
                        const initials = member.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                        return (
                          <Card key={member.id} className="p-6 paper-texture">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center">
                                  {member.user.avatar_url ? (
                                    <img src={member.user.avatar_url} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-xl font-medium text-sage">{initials}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-base">{member.user.name}</p>
                                    {member.user.id === user?.id && (
                                      <Badge variant="outline" className="text-xs">You</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {member.role} · Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm px-4 py-2">
                                  {member.total_submissions} response{member.total_submissions !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
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

                  {archivedWeeks.length === 0 ? (
                    <Card className="p-12 text-center paper-texture">
                      <p className="text-muted-foreground mb-4">No archived weeks yet.</p>
                      <p className="text-sm text-muted-foreground">Past weeks will appear here once you complete them.</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {archivedWeeks.map((week) => {
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
                                    <span>{week.totalResponses} of {week.prompts.length} prompts answered</span>
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
                  )}

                  <ExportWritings spaceName={space.name} className="w-full mt-6" />
                </motion.div>
              )}

              {activeNav === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h1 className="mb-2 font-serif italic" style={{ fontFamily: "'Victor Mono', monospace" }}>
                      Review & Publish
                    </h1>
                    <p className="text-muted-foreground">
                      Week {space.current_week} submission status
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  {/* Summary Stats */}
                  <Card className="p-6 mb-6 paper-texture bg-cream/30 border-black/10">
                    <div className="font-mono text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">&gt; Total Members:</span>
                        <span className="font-medium">{submissionStatus.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">&gt; Submitted:</span>
                        <span className="font-medium text-sage">
                          {submissionStatus.filter(s => s.hasSubmitted).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">&gt; Pending:</span>
                        <span className="font-medium text-terracotta">
                          {submissionStatus.filter(s => !s.hasSubmitted).length}
                        </span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-base">
                        <span className="text-muted-foreground">&gt; Completion Rate:</span>
                        <span className="font-medium">
                          {submissionStatus.length > 0 
                            ? Math.round((submissionStatus.filter(s => s.hasSubmitted).length / submissionStatus.length) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Submission Status Table */}
                  <Card className="paper-texture bg-cream/20 border-black/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full font-mono text-sm">
                        <thead className="bg-black/5 border-b border-black/10">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Member</th>
                            <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-center py-3 px-4 font-medium text-muted-foreground">Responses</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Last Activity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {submissionStatus.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                No members found
                              </td>
                            </tr>
                          ) : (
                            submissionStatus.map((status) => (
                              <tr key={status.userId} className="hover:bg-black/5 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
                                      {status.avatarUrl ? (
                                        <img 
                                          src={status.avatarUrl} 
                                          alt={status.userName} 
                                          className="w-full h-full rounded-full object-cover" 
                                        />
                                      ) : (
                                        <span className="text-xs font-medium text-sage">
                                          {status.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-medium">{status.userName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {status.hasSubmitted ? (
                                    <Badge variant="default" className="bg-sage text-cream font-mono text-xs">
                                      ✓ Answered
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-terracotta/30 text-terracotta font-mono text-xs">
                                      ○ Pending
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-muted-foreground">
                                    {status.responseCount}/{status.totalPrompts}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-muted-foreground">
                                  {status.lastSubmission 
                                    ? new Date(status.lastSubmission).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })
                                    : '—'
                                  }
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Playlist Builder */}
                  {space && spotifyResponses.length > 0 && (
                    <div className="mt-8">
                      <PlaylistBuilder
                        spaceId={space.id}
                        spaceName={space.name}
                        weekNumber={space.current_week}
                        responses={spotifyResponses}
                        onPlaylistCreated={(playlistUrl) => {
                          console.log('Playlist created:', playlistUrl);
                          // Reload space data to show playlist URL
                        }}
                      />
                    </div>
                  )}

                  {/* Publish Week Button */}
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowPublishWeekDialog(true)}
                      disabled={space.is_published}
                      className="w-full gap-2 bg-sage hover:bg-sage/90 text-cream font-mono"
                    >
                      <Send className="w-4 h-4" />
                      {space.is_published ? 'Week Already Published' : `Publish Week ${space.current_week}`}
                    </Button>
                    {!space.is_published && (
                      <p className="text-xs text-muted-foreground mt-2 text-center font-mono">
                        &gt; This will generate the newsletter draft and notify all members
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-border bg-card/30 p-6 overflow-auto">
          {/* Stats Card */}
          {user && (
            <Card className="p-6 mb-6 paper-texture">
              <h3 className="mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent" />
                    <span className="text-sm">Writing Streak</span>
                  </div>
                  <span className="text-xl">{user.currentStreak}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    <span className="text-sm">Total Responses</span>
                  </div>
                  <span className="text-xl">{responses.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm">Tokens</span>
                  </div>
                  <span className="text-xl">{user.tokenBalance}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Upcoming Curators */}
          <Card className="p-6 paper-texture">
            <h3 className="mb-4">Curator Schedule</h3>
            {space.current_curator ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm">{space.current_curator.name}</p>
                    <p className="text-xs text-muted-foreground">Week {space.current_week} (Current)</p>
                  </div>
                  <span className="text-xs text-sage font-medium">Active</span>
                </div>
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    {space.rotation_type === 'ROUND_ROBIN' && 'Rotation: Automatic (takes turns)'}
                    {space.rotation_type === 'MANUAL' && 'Rotation: Manual (leader assigns)'}
                    {space.rotation_type === 'RANDOM' && 'Rotation: Random selection'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No curator assigned yet</p>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => navigate(`/spaces/${space.name}/settings`)}
            >
              Manage Rotation
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6 p-6 paper-texture bg-muted/30 quick-actions-section">
            <h4 className="mb-3 text-sm">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => setInviteDialogOpen(!inviteDialogOpen)}
              >
                <UserPlus className="w-4 h-4" />
                Invite Members
              </Button>
              
              {/* Inline Invite Form */}
              <AnimatePresence>
                {inviteDialogOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4 border-t border-border/50 mt-2">
                      {/* Success Message */}
                      <AnimatePresence>
                        {inviteSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-800">Invitations sent successfully!</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Share Link */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Share Link</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={`monogram.app/join/${encodeURIComponent(space.name)}`}
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`monogram.app/join/${encodeURIComponent(space.name)}`);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Email Invites */}
                      <div className="space-y-2">
                        <Label htmlFor="invite-emails" className="text-xs text-muted-foreground">
                          Email Addresses
                        </Label>
                        <Textarea
                          id="invite-emails"
                          placeholder="Enter email addresses (one per line or comma-separated)"
                          value={inviteEmails}
                          onChange={(e) => setInviteEmails(e.target.value)}
                          className="min-h-[80px] text-xs resize-none"
                        />
                      </div>

                      {/* Personal Message */}
                      <div className="space-y-2">
                        <Label htmlFor="invite-message" className="text-xs text-muted-foreground">
                          Personal Message (Optional)
                        </Label>
                        <Textarea
                          id="invite-message"
                          placeholder="Add a personal note to your invitation..."
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          className="min-h-[60px] text-xs resize-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setInviteDialogOpen(false);
                            setInviteEmails("");
                            setInviteMessage("");
                            setInviteSuccess(false);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSendInvites}
                          disabled={!inviteEmails.trim()}
                          className="flex-1 bg-sage text-cream hover:bg-sage/90"
                        >
                          <Send className="w-3 h-3 mr-2" />
                          Send Invites
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => setExportInlineOpen(!exportInlineOpen)}
              >
                <Archive className="w-4 h-4" />
                Export Writings
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
            </div>
          </Card>
        </aside>
      </div>

      {/* Delete Prompt Confirmation Dialog - Terminal Style */}
      {promptToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
          {/* Click handler overlay */}
          <div
            className="absolute inset-0"
            onClick={() => setPromptToDelete(null)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Terminal Window */}
          <div
            className="relative border-2 rounded-lg shadow-2xl w-full max-w-2xl font-mono"
            style={{ 
              fontFamily: "'IBM Plex Mono', monospace", 
              zIndex: 1000000,
              animation: 'fadeInScale 0.3s ease-out forwards',
              backgroundColor: '#fdfaf5',
              borderColor: 'rgba(42, 42, 42, 0.2)',
              opacity: 1
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div 
              className="px-4 py-3 rounded-t-lg flex items-center justify-between"
              style={{ backgroundColor: '#2a2a2a', color: '#fdfaf5' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                <span className="ml-3 text-sm opacity-70">delete_prompt.sh</span>
              </div>
              <button
                onClick={() => setPromptToDelete(null)}
                className="text-[#fdfaf5]/50 hover:text-[#fdfaf5] transition-colors text-sm"
              >
                [ESC]
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-4" style={{ color: '#2a2a2a', backgroundColor: '#fdfaf5' }}>
              {/* Warning Line */}
              <div className="text-sm opacity-60 mb-4">
                <span className="text-[#ff5f56]">⚠</span> Destructive action detected
              </div>

              {/* Prompt to Delete */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#ff5f56]">&gt;</span>
                  <span className="opacity-70">Prompt to delete:</span>
                </div>
                <div className="ml-4 p-3 bg-[#2a2a2a]/5 border border-[#2a2a2a]/10 rounded">
                  <p className="text-sm italic">"{promptToDelete.question}"</p>
                </div>
              </div>

              {/* Warning Message */}
              <div className="ml-4 p-3 bg-[#ff5f56]/10 border border-[#ff5f56]/20 rounded">
                <p className="text-xs text-[#ff5f56]/80">
                  This will permanently delete this prompt and all member responses. This action cannot be undone.
                </p>
              </div>

              {/* Command Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setPromptToDelete(null)}
                  className="flex-1 px-4 py-2 text-sm border border-[#2a2a2a]/30 rounded hover:border-[#2a2a2a] transition-colors"
                >
                  [ESC] Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeletePrompt(promptToDelete.id);
                    setPromptToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-[#ff5f56] text-[#fdfaf5] rounded hover:bg-[#ff5f56]/90 transition-colors"
                >
                  <span className="text-[#fdfaf5]">&gt;</span> run delete_prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Prompts Confirmation Dialog - Terminal Style */}
      {showPublishDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
          {/* Click handler overlay */}
          <div
            className="absolute inset-0"
            onClick={() => !isPublishing && setShowPublishDialog(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Terminal Window */}
          <div
            className="relative border-2 rounded-lg shadow-2xl w-full max-w-2xl font-mono"
            style={{ 
              fontFamily: "'IBM Plex Mono', monospace", 
              zIndex: 1000000,
              animation: 'fadeInScale 0.3s ease-out forwards',
              backgroundColor: '#fdfaf5',
              borderColor: 'rgba(42, 42, 42, 0.2)',
              opacity: 1
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div 
              className="px-4 py-3 rounded-t-lg flex items-center justify-between"
              style={{ backgroundColor: '#2a2a2a', color: '#fdfaf5' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                <span className="ml-3 text-sm opacity-70">publish_prompts.sh</span>
              </div>
              <button
                onClick={() => !isPublishing && setShowPublishDialog(false)}
                disabled={isPublishing}
                className="text-[#fdfaf5]/50 hover:text-[#fdfaf5] transition-colors text-sm disabled:opacity-30"
              >
                [ESC]
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-4" style={{ color: '#2a2a2a', backgroundColor: '#fdfaf5' }}>
              {/* Info Line */}
              <div className="text-sm opacity-60 mb-4">
                <span className="text-[#bfa67a]">📧</span> Publishing Week {space?.current_week} prompts
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#bfa67a]">&gt;</span>
                  <span className="opacity-70">Recipients: {space?.member_count} members</span>
                </div>
              </div>

              {/* Prompts List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#bfa67a]">&gt;</span>
                  <span className="opacity-70">Prompts to publish:</span>
                </div>
                <div className="ml-4 p-3 bg-[#2a2a2a]/5 border border-[#2a2a2a]/10 rounded max-h-48 overflow-y-auto space-y-2">
                  {prompts.map((prompt, index) => (
                    <p key={prompt.id} className="text-xs">
                      {index + 1}. {prompt.question}
                    </p>
                  ))}
                </div>
              </div>

              {/* Info Message */}
              <div className="ml-4 p-3 bg-[#bfa67a]/10 border border-[#bfa67a]/20 rounded">
                <p className="text-xs text-[#2a2a2a]/70">
                  Members will receive an email notification with all prompts and can start submitting their responses.
                </p>
              </div>

              {/* Status Messages */}
              {isPublishing && (
                <div className="pt-2 text-sm text-[#bfa67a]">
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    <span>Sending notifications...</span>
                  </div>
                </div>
              )}

              {/* Command Buttons */}
              {!isPublishing && (
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowPublishDialog(false)}
                    className="flex-1 px-4 py-2 text-sm border border-[#2a2a2a]/30 rounded hover:border-[#2a2a2a] transition-colors"
                  >
                    [ESC] Cancel
                  </button>
                  <button
                    onClick={handlePublishPrompts}
                    className="flex-1 px-4 py-2 text-sm bg-[#bfa67a] text-[#fdfaf5] rounded hover:bg-[#bfa67a]/90 transition-colors"
                  >
                    <span className="text-[#fdfaf5]">&gt;</span> run publish_prompts
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Publish Week Confirmation Dialog - Terminal Style */}
      {showPublishWeekDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
          {/* Click handler overlay */}
          <div
            className="absolute inset-0"
            onClick={() => !isPublishingWeek && setShowPublishWeekDialog(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Terminal Window */}
          <div
            className="relative border-2 rounded-lg shadow-2xl w-full max-w-2xl font-mono"
            style={{ 
              fontFamily: "'IBM Plex Mono', monospace", 
              zIndex: 1000000,
              animation: 'fadeInScale 0.3s ease-out forwards',
              backgroundColor: '#fdfaf5',
              borderColor: 'rgba(42, 42, 42, 0.2)',
              opacity: 1
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div 
              className="px-4 py-3 rounded-t-lg flex items-center justify-between"
              style={{ backgroundColor: '#2a2a2a', color: '#fdfaf5' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                <span className="ml-3 text-sm opacity-70">publish_week.sh</span>
              </div>
              <button
                onClick={() => !isPublishingWeek && setShowPublishWeekDialog(false)}
                disabled={isPublishingWeek}
                className="text-[#fdfaf5]/50 hover:text-[#fdfaf5] transition-colors text-sm disabled:opacity-30"
              >
                [ESC]
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-4" style={{ color: '#2a2a2a', backgroundColor: '#fdfaf5' }}>
              {/* Confirmation Line */}
              <div className="text-sm opacity-60 mb-4">
                <span className="text-[#bfa67a]">&gt;</span> Confirm publish for Week {space?.current_week}?
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#bfa67a]">&gt;</span>
                  <span className="opacity-70">Space: {space?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#bfa67a]">&gt;</span>
                  <span className="opacity-70">
                    Submissions: {submissionStatus.filter(s => s.hasSubmitted).length}/{submissionStatus.length} members
                  </span>
                </div>
              </div>

              {/* Info Message */}
              <div className="ml-4 p-3 bg-[#bfa67a]/10 border border-[#bfa67a]/20 rounded">
                <p className="text-xs text-[#2a2a2a]/70">
                  This will mark the week as published and create a newsletter draft. All members will be notified.
                </p>
              </div>

              {/* Status Messages */}
              {isPublishingWeek && (
                <div className="pt-2 text-sm text-[#bfa67a]">
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    <span>Publishing week and generating newsletter...</span>
                  </div>
                </div>
              )}

              {/* Command Buttons */}
              {!isPublishingWeek && (
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowPublishWeekDialog(false)}
                    className="flex-1 px-4 py-2 text-sm border border-[#2a2a2a]/30 rounded hover:border-[#2a2a2a] transition-colors"
                  >
                    [ESC] Cancel
                  </button>
                  <button
                    onClick={handlePublishWeek}
                    className="flex-1 px-4 py-2 text-sm bg-[#bfa67a] text-[#fdfaf5] rounded hover:bg-[#bfa67a]/90 transition-colors"
                  >
                    <span className="text-[#fdfaf5]">&gt;</span> run publish_week
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
          ? 'bg-sage text-cream' 
          : 'hover:bg-muted text-foreground'
      }`}
    >
      <span className="text-sm font-mono">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

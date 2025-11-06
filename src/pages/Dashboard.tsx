import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import "../styles/modal-animations.css";
import { 
  Plus,
  Users,
  Calendar,
  Mail,
  ChevronRight,
  Feather,
  Inbox,
  UsersRound,
  LogOut
} from "lucide-react";
import { MainLayout } from "../components/layouts/MainLayout";
import { usePermission } from "../components/permissions";
import { useAuth } from "../contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { TerminalSelector } from "../components/ui/terminal-selector";
import { getUserSpaces, createSpace, type SpaceWithDetails, type AccessType } from "../lib/space-api";
import { SpaceCard } from "../components/SpaceCard";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allowed: canCreate, message: createMessage } = usePermission('canCreateSpace');
  const [spaces, setSpaces] = useState<SpaceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [accessType, setAccessType] = useState<AccessType>("PUBLIC");
  const [rotationType, setRotationType] = useState<"ROUND_ROBIN" | "RANDOM" | "MANUAL">("ROUND_ROBIN");
  const [publishDay, setPublishDay] = useState<number>(0); // 0 = Sunday
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load user's spaces
  useEffect(() => {
    if (user) {
      loadSpaces();
    }
  }, [user]);

  const loadSpaces = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userSpaces = await getUserSpaces(user.id);
      setSpaces(userSpaces);
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate global stats
  const stats = {
    activeSpaces: spaces.length,
    unreadUpdates: spaces.reduce((acc, space) => acc + (space.unread_responses || 0), 0),
    totalCommunity: spaces.reduce((acc, space) => acc + space.member_count, 0),
  };

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTerminal) {
        closeTerminal();
      }
    };

    if (showTerminal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Focus on name input when terminal opens
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showTerminal]);

  const handleCreateSpace = () => {
    if (!canCreate) return;
    setShowTerminal(true);
  };

  const closeTerminal = () => {
    setShowTerminal(false);
    setSpaceName("");
    setDescription("");
    setAccessType("PUBLIC");
    setRotationType("ROUND_ROBIN");
    setPublishDay(0);
    setIsCreating(false);
    setShowSuccess(false);
  };

  const handleAccessTypeChange = (type: string) => {
    if (!isCreating && !showSuccess) {
      setAccessType(type as AccessType);
    }
  };

  const handleRotationTypeChange = (type: string) => {
    if (!isCreating && !showSuccess) {
      setRotationType(type as "ROUND_ROBIN" | "RANDOM" | "MANUAL");
    }
  };

  const handlePublishDayChange = (day: string) => {
    if (!isCreating && !showSuccess) {
      setPublishDay(parseInt(day));
    }
  };

  const accessTypeOptions = [
    { value: "PUBLIC", label: "Public" },
    { value: "PRIVATE", label: "Private" },
  ];

  const rotationTypeOptions = [
    { value: "ROUND_ROBIN", label: "Round Robin" },
    { value: "RANDOM", label: "Random" },
    { value: "MANUAL", label: "Manual" },
  ];

  const publishDayOptions = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  const handleSubmit = async () => {
    if (!spaceName.trim() || !description.trim() || !user) return;
    
    setIsCreating(true);
    
    try {
      // Simulate typewriter effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create space in database
      await createSpace({
        name: spaceName,
        description: description,
        leaderId: user.id,
        accessType: accessType,
        rotationType: rotationType,
        publishDay: publishDay,
      });
      
      setIsCreating(false);
      setShowSuccess(true);
      
      // Reload spaces
      await loadSpaces();
      
      // Close after showing success
      await new Promise(resolve => setTimeout(resolve, 1500));
      closeTerminal();
    } catch (error) {
      console.error('Error creating space:', error);
      setIsCreating(false);
    }
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
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sage border-r-transparent"></div>
                <p className="text-sm text-foreground/60 mt-4">Loading your spaces...</p>
              </div>
            ) : spaces.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-foreground/60 mb-4">No spaces yet. Create your first one!</p>
              </div>
            ) : (
              spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  currentUserId={user?.id}
                  onClick={() => navigate(`/spaces/${space.id}/dashboard`)}
                />
              ))
            )}

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

      {/* Terminal Modal - Separate Dialog Box */}
      {showTerminal && (
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
            onClick={closeTerminal}
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
                    <span className="ml-3 text-sm opacity-70">create_new_space.sh</span>
                  </div>
                  <button
                    onClick={closeTerminal}
                    className="text-[#fdfaf5]/50 hover:text-[#fdfaf5] transition-colors text-sm"
                  >
                    [ESC]
                  </button>
                </div>

                {/* Terminal Body */}
                <div className="p-6 space-y-4" style={{ color: '#2a2a2a', backgroundColor: '#fdfaf5' }}>
                  {/* Welcome Line */}
                  <div className="text-sm opacity-60 mb-6">
                    <span className="text-[#bfa67a]">~</span> Initializing new space creation...
                  </div>

                  {/* Space Name Input */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#bfa67a]">&gt;</span>
                      <span className="opacity-70">Space Name:</span>
                    </div>
                    <div className="ml-4 relative">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={spaceName}
                        onChange={(e) => setSpaceName(e.target.value)}
                        disabled={isCreating || showSuccess}
                        className="w-full bg-transparent border-b border-[#2a2a2a]/20 px-2 py-1 text-base focus:outline-none focus:border-[#bfa67a] transition-colors disabled:opacity-50"
                        placeholder="e.g., Daily Reflections"
                      />
                      {!spaceName && cursorBlink && !isCreating && !showSuccess && (
                        <div className="absolute left-2 top-1 w-2 h-5 bg-[#bfa67a]/50"></div>
                      )}
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#bfa67a]">&gt;</span>
                      <span className="opacity-70">Description:</span>
                    </div>
                    <div className="ml-4">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isCreating || showSuccess}
                        rows={3}
                        className="w-full bg-transparent border border-[#2a2a2a]/20 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#bfa67a] transition-colors resize-none disabled:opacity-50"
                        placeholder="What's this space about?"
                      />
                    </div>
                  </div>

                  {/* Access Type Toggle */}
                  <div className="space-y-1">
                    <div className="ml-4">
                      <TerminalSelector
                        options={accessTypeOptions}
                        value={accessType}
                        onChange={handleAccessTypeChange}
                        label="Access Type"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Curator Rotation Type */}
                  <div className="space-y-1">
                    <div className="ml-4">
                      <TerminalSelector
                        options={rotationTypeOptions}
                        value={rotationType}
                        onChange={handleRotationTypeChange}
                        label="Curator Rotation"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Weekly Publish Day */}
                  <div className="space-y-1">
                    <div className="ml-4">
                      <TerminalSelector
                        options={publishDayOptions}
                        value={publishDay.toString()}
                        onChange={handlePublishDayChange}
                        label="Publish Day"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Status Messages */}
                  {isCreating && (
                    <div className="pt-4 text-sm text-[#bfa67a]">
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse">●</span>
                        <span>Creating new space...</span>
                      </div>
                    </div>
                  )}

                  {showSuccess && (
                    <div className="pt-4 text-sm text-green-600">
                      <div className="flex items-center gap-2">
                        <span>✓</span>
                        <span>Space created successfully</span>
                      </div>
                    </div>
                  )}

                  {/* Command Button */}
                  {!isCreating && !showSuccess && (
                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={closeTerminal}
                        className="flex-1 px-4 py-2 text-sm border border-[#2a2a2a]/30 rounded hover:border-[#2a2a2a] transition-colors"
                      >
                        [ESC] Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!spaceName.trim() || !description.trim()}
                        className="flex-1 px-4 py-2 text-sm bg-[#2a2a2a] text-[#fdfaf5] rounded hover:bg-[#2a2a2a]/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="text-[#bfa67a]">&gt;</span> run create_space
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

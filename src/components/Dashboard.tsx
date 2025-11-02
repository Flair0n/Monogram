import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Edit3 } from "lucide-react";

interface Space {
  id: string;
  title: string;
  coverImage: string;
  currentCurator: string;
  memberCount: number;
  responseCount: number;
}

interface DashboardProps {
  onNavigate: (view: string, spaceId?: string) => void;
}

const mockSpaces: Space[] = [
  {
    id: "1",
    title: "Sunday Reflections",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    currentCurator: "Emma Chen",
    memberCount: 8,
    responseCount: 6
  },
  {
    id: "2",
    title: "Morning Pages Collective",
    coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    currentCurator: "Marcus Williams",
    memberCount: 12,
    responseCount: 10
  },
  {
    id: "3",
    title: "The Midnight Society",
    coverImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    currentCurator: "Sofia Rodriguez",
    memberCount: 6,
    responseCount: 5
  }
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="w-6 h-6" />
            <h1 className="text-3xl">Monogram</h1>
          </div>
          <p className="text-muted-foreground">
            Your writing spaces<span className="cursor-blink inline-block ml-1">|</span>
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockSpaces.map((space) => (
            <Card
              key={space.id}
              className="overflow-hidden cursor-pointer transition-all hover:shadow-lg paper-texture group"
              onClick={() => onNavigate('space', space.id)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={space.coverImage}
                  alt={space.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2">{space.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Curator: {space.currentCurator}</p>
                  <p>{space.memberCount} members · {space.responseCount} responses</p>
                </div>
              </div>
            </Card>
          ))}

          {/* Create New Space Card */}
          <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg border-2 border-dashed flex items-center justify-center min-h-[320px]">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="mb-2">Create New Space</h3>
              <p className="text-sm text-muted-foreground">
                Start a new writing collective
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

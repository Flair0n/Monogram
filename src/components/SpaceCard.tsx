import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, Calendar, Mail, ChevronRight, Feather } from "lucide-react";
import type { SpaceWithDetails } from "../lib/space-api";

interface SpaceCardProps {
  space: SpaceWithDetails;
  currentUserId?: string;
  onClick?: () => void;
}

export function SpaceCard({ space, currentUserId, onClick }: SpaceCardProps) {
  const isCurrentUserCurator = space.current_curator_id === currentUserId;
  const curatorName = isCurrentUserCurator 
    ? "You" 
    : space.current_curator?.name || "TBD";

  return (
    <Card
      className="p-6 paper-texture cursor-pointer hover:shadow-lg transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center shrink-0">
          <Feather className="w-6 h-6 text-sage-foreground" />
        </div>
        {space.unread_responses && space.unread_responses > 0 && (
          <Badge variant="default" className="text-xs">
            {space.unread_responses} new
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
        {space.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
        {space.description || "No description"}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {space.member_count} {space.member_count === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Week {space.current_week}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>Curator: {curatorName}</span>
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
  );
}

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Crown, Flame, Mail, Calendar } from "lucide-react";

interface MembersPageProps {
  onNavigate: (view: string) => void;
}

interface Member {
  name: string;
  initials: string;
  role: 'curator' | 'next' | 'member';
  streak: number;
  responseCount: number;
  joinDate: string;
  color: string;
}

const mockMembers: Member[] = [
  {
    name: "Emma Chen",
    initials: "EC",
    role: "curator",
    streak: 12,
    responseCount: 48,
    joinDate: "Jan 2025",
    color: "bg-accent"
  },
  {
    name: "Marcus Williams",
    initials: "MW",
    role: "next",
    streak: 10,
    responseCount: 42,
    joinDate: "Jan 2025",
    color: "bg-secondary"
  },
  {
    name: "Sofia Rodriguez",
    initials: "SR",
    role: "member",
    streak: 8,
    responseCount: 35,
    joinDate: "Feb 2025",
    color: "bg-muted"
  },
  {
    name: "James Kim",
    initials: "JK",
    role: "member",
    streak: 11,
    responseCount: 44,
    joinDate: "Jan 2025",
    color: "bg-accent"
  },
  {
    name: "Aria Patel",
    initials: "AP",
    role: "member",
    streak: 6,
    responseCount: 28,
    joinDate: "Mar 2025",
    color: "bg-secondary"
  },
  {
    name: "Lucas Brown",
    initials: "LB",
    role: "member",
    streak: 9,
    responseCount: 39,
    joinDate: "Feb 2025",
    color: "bg-muted"
  },
  {
    name: "Nina Zhang",
    initials: "NZ",
    role: "member",
    streak: 7,
    responseCount: 32,
    joinDate: "Feb 2025",
    color: "bg-accent"
  },
  {
    name: "Oliver Smith",
    initials: "OS",
    role: "member",
    streak: 12,
    responseCount: 50,
    joinDate: "Jan 2025",
    color: "bg-secondary"
  }
];

export function MembersPage({ onNavigate }: MembersPageProps) {
  return (
    <div className="min-h-screen p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 -ml-4"
          onClick={() => onNavigate('space')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Space
        </Button>

        <div className="mb-8">
          <h1 className="mb-2">Members</h1>
          <p className="text-muted-foreground">8 writers in Sunday Reflections</p>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {mockMembers.map((member) => (
            <Card key={member.name} className="p-6 paper-texture hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full ${member.color} flex items-center justify-center shrink-0`}>
                  <span className="text-foreground">{member.initials}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4>{member.name}</h4>
                    {member.role === 'curator' && (
                      <Badge variant="default" className="gap-1">
                        <Crown className="w-3 h-3" />
                        Curator
                      </Badge>
                    )}
                    {member.role === 'next' && (
                      <Badge variant="secondary" className="gap-1">
                        Next
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      <span>{member.streak} week streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{member.responseCount} responses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {member.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Curator Rotation Info */}
        <Card className="p-6 paper-texture">
          <h3 className="mb-4">Curator Rotation</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4" />
                <span>Current: Emma Chen</span>
              </div>
              <Badge variant="outline">Week 12</Badge>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-secondary" />
                <span>Next: Marcus Williams</span>
              </div>
              <Badge variant="outline">Week 13</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-muted" />
                <span>Following: Sofia Rodriguez</span>
              </div>
              <Badge variant="outline">Week 14</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

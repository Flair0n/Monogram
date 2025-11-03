import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Heart, Sprout, Pencil, Download } from "lucide-react";
import { useState } from "react";

interface NewsletterPageProps {
  onNavigate: (view: string) => void;
}

interface Response {
  author: string;
  content: string;
  reactions: {
    heart: number;
    sprout: number;
    pencil: number;
  };
}

const mockResponses: { [key: number]: Response[] } = {
  0: [
    {
      author: "Marcus W.",
      content: "I was surprised by how much a stranger's smile on the subway changed my entire morning. I'd been feeling isolated, caught in my own loop of thoughts, when this elderly woman just looked at me and smiled—not a polite smile, but a genuine, warm one. It reminded me that we're all in this together, somehow.",
      reactions: { heart: 5, sprout: 2, pencil: 3 }
    },
    {
      author: "Sofia R.",
      content: "The surprise for me was realizing I'd been holding my breath metaphorically for weeks. When I finally exhaled—made a decision I'd been avoiding—the relief was physical. My shoulders dropped. My jaw unclenched. Sometimes the surprise is in the release.",
      reactions: { heart: 8, sprout: 4, pencil: 2 }
    },
    {
      author: "Emma C.",
      content: "Finding a handwritten note in a library book—dated 1987. Just three words: 'Don't give up.' I wasn't looking for a sign, but there it was. Maybe someone left it for themselves. Maybe for me. Either way, I'm keeping it.",
      reactions: { heart: 12, sprout: 6, pencil: 5 }
    }
  ],
  1: [
    {
      author: "Marcus W.",
      content: "My neighbor saw me struggling with groceries and didn't just offer to help—he actually helped. He carried them up three flights of stairs without making conversation about it. Just did it. That's the kind of kindness that feels rare: the kind that doesn't need acknowledgment.",
      reactions: { heart: 6, sprout: 3, pencil: 1 }
    },
    {
      author: "Emma C.",
      content: "I watched a kid give his umbrella to someone at the bus stop. He just ran off into the rain, laughing. His mom called after him but he didn't care. That's the thing about kindness when you're young—you haven't learned to calculate it yet.",
      reactions: { heart: 9, sprout: 5, pencil: 4 }
    }
  ]
};

export function NewsletterPage({ onNavigate }: NewsletterPageProps) {
  const [reactions, setReactions] = useState<{ [key: string]: string | null }>({});

  const handleReaction = (responseKey: string, reaction: string) => {
    setReactions(prev => ({
      ...prev,
      [responseKey]: prev[responseKey] === reaction ? null : reaction
    }));
  };

  return (
    <div className="min-h-screen p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 -ml-4"
          onClick={() => onNavigate('space')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Space
        </Button>

        {/* Newsletter Header */}
        <div className="mb-12 pb-8 border-b-2 border-border">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline">Week 12</Badge>
            <Badge variant="secondary">November 2, 2025</Badge>
          </div>
          <h1 className="mb-4">Sunday Reflections</h1>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Curated by Emma Chen</p>
            <div className="pl-4 border-l-2 border-accent">
              <p className="italic text-muted-foreground">
                "This week, let's explore the moments that surprise us—the unexpected kindness, 
                the sudden clarity, the things we didn't know we were looking for."
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Letter
          </Button>
        </div>

        {/* Responses by Question */}
        <div className="space-y-12">
          {Object.entries(mockResponses).map(([promptIndex, responses]) => (
            <div key={promptIndex} className="pb-8 border-b border-border last:border-0">
              {/* Question */}
              <div className="mb-8">
                <div className="inline-block px-3 py-1 rounded bg-muted mb-3">
                  <p className="text-xs">Question {parseInt(promptIndex) + 1}</p>
                </div>
                <h3 className="text-xl mb-2">
                  {promptIndex === '0' 
                    ? "What surprised you this week?" 
                    : "Describe a moment of unexpected kindness you witnessed or experienced."}
                </h3>
              </div>

              {/* Responses */}
              <div className="space-y-8">
                {responses.map((response, idx) => {
                  const responseKey = `${promptIndex}-${idx}`;
                  return (
                    <div key={idx} className="paper-texture bg-card p-6 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <span className="text-sm text-accent-foreground">
                            {response.author.charAt(0)}
                          </span>
                        </div>
                        <p className="font-mono">{response.author}</p>
                      </div>
                      
                      <p className="mb-4 leading-relaxed">
                        {response.content}
                      </p>

                      {/* Reactions */}
                      <div className="flex items-center gap-4 pt-4 border-t border-border">
                        <button
                          onClick={() => handleReaction(responseKey, 'heart')}
                          className={`
                            flex items-center gap-2 px-3 py-1 rounded-full transition-all
                            ${reactions[responseKey] === 'heart' 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted'}
                          `}
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{response.reactions.heart}</span>
                        </button>
                        <button
                          onClick={() => handleReaction(responseKey, 'sprout')}
                          className={`
                            flex items-center gap-2 px-3 py-1 rounded-full transition-all
                            ${reactions[responseKey] === 'sprout' 
                              ? 'bg-secondary text-secondary-foreground' 
                              : 'hover:bg-muted'}
                          `}
                        >
                          <Sprout className="w-4 h-4" />
                          <span className="text-sm">{response.reactions.sprout}</span>
                        </button>
                        <button
                          onClick={() => handleReaction(responseKey, 'pencil')}
                          className={`
                            flex items-center gap-2 px-3 py-1 rounded-full transition-all
                            ${reactions[responseKey] === 'pencil' 
                              ? 'bg-muted text-foreground' 
                              : 'hover:bg-muted'}
                          `}
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-sm">{response.reactions.pencil}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Next curator: Marcus Williams
          </p>
          <p className="text-xs text-muted-foreground">
            Sunday Reflections · Week 12 · 8 members
          </p>
        </div>
      </div>
    </div>
  );
}

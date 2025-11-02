import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, Image, Music, Trash2, Eye } from "lucide-react";

interface Prompt {
  id: string;
  type: 'text' | 'image' | 'music';
  content: string;
  mediaUrl?: string;
}

interface CuratorPanelProps {
  onNavigate: (view: string) => void;
}

export function CuratorPanel({ onNavigate }: CuratorPanelProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([
    { id: '1', type: 'text', content: 'What surprised you this week?' }
  ]);
  const [curatorNote, setCuratorNote] = useState(
    "This week, let's explore the moments that surprise us—the unexpected kindness, the sudden clarity, the things we didn't know we were looking for."
  );
  const [showPreview, setShowPreview] = useState(false);

  const addPrompt = () => {
    if (prompts.length < 10) {
      setPrompts([
        ...prompts,
        { id: Date.now().toString(), type: 'text', content: '' }
      ]);
    }
  };

  const updatePrompt = (id: string, content: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, content } : p));
  };

  const deletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen p-8 md:p-16">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 -ml-4"
          onClick={() => onNavigate('space')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Space
        </Button>

        <div className="mb-8">
          <h1 className="mb-2">Curator Panel</h1>
          <p className="text-muted-foreground">
            Create up to 10 prompts for your week as curator
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Side */}
          <div>
            <Card className="p-6 mb-6 paper-texture">
              <label className="block mb-3">Curator's Note</label>
              <Textarea
                value={curatorNote}
                onChange={(e) => setCuratorNote(e.target.value)}
                placeholder="Share your thoughts for the week..."
                className="min-h-[100px] resize-none"
              />
            </Card>

            <div className="flex items-center justify-between mb-4">
              <h3>Prompts ({prompts.length}/10)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addPrompt}
                disabled={prompts.length >= 10}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Prompt
              </Button>
            </div>

            <div className="space-y-4">
              {prompts.map((prompt, index) => (
                <Card key={prompt.id} className="p-4 paper-texture">
                  <div className="flex items-start gap-3 mb-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1">
                      <Textarea
                        value={prompt.content}
                        onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                        placeholder="Enter your prompt..."
                        className="min-h-[80px] resize-none mb-3"
                      />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Image className="w-3 h-3" />
                          Add Image
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Music className="w-3 h-3" />
                          Add Song
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePrompt(prompt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1">Publish Prompts</Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </div>

          {/* Preview Side */}
          {showPreview && (
            <div className="lg:sticky lg:top-8 h-fit">
              <Card className="p-8 paper-texture shadow-lg">
                <div className="mb-6 pb-6 border-b border-border">
                  <h2 className="mb-2">Sunday Reflections</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Week 13 · Curated by Emma Chen
                  </p>
                  <p className="text-sm italic">{curatorNote}</p>
                </div>

                <div className="space-y-6">
                  {prompts.map((prompt, index) => (
                    <div key={prompt.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex gap-3 mb-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <p className="flex-1">{prompt.content || '(No prompt yet)'}</p>
                      </div>
                      <div className="ml-10">
                        <p className="text-sm text-muted-foreground italic">
                          Responses will appear here...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

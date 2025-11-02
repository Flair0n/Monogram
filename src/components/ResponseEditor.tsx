import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { ArrowLeft, ArrowRight, Image, Music, Check } from "lucide-react";

interface ResponseEditorProps {
  onNavigate: (view: string) => void;
}

const prompts = [
  "What surprised you this week?",
  "Describe a moment of unexpected kindness you witnessed or experienced.",
  "What's something you've been thinking about but haven't said out loud?",
  "If you could bottle a feeling from this week, which would it be and why?",
  "Write about something small that made you smile."
];

export function ResponseEditor({ onNavigate }: ResponseEditorProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(prompts.length).fill(''));
  const [isFocused, setIsFocused] = useState(false);

  const progress = ((currentPromptIndex + 1) / prompts.length) * 100;

  const handleNext = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentPromptIndex] = value;
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    alert('Response submitted!');
    onNavigate('space');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('space')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Save & Exit
            </Button>
            <div className="text-sm text-muted-foreground">
              Question {currentPromptIndex + 1} of {prompts.length}
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Prompt */}
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-2 rounded-md bg-muted mb-6">
              <p className="text-sm">Prompt {currentPromptIndex + 1}</p>
            </div>
            <h2 className="text-2xl mb-2">{prompts[currentPromptIndex]}</h2>
          </div>

          {/* Writing Area */}
          <div className="mb-8">
            <div className={`
              min-h-[400px] p-8 rounded-lg paper-texture bg-card shadow-lg
              border-2 transition-all
              ${isFocused ? 'border-primary' : 'border-border'}
            `}>
              <Textarea
                value={responses[currentPromptIndex]}
                onChange={(e) => handleResponseChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Start typing..."
                className="min-h-[350px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base leading-relaxed"
              />
              {responses[currentPromptIndex] === '' && (
                <span className="cursor-blink text-xl">|</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Image className="w-4 h-4" />
                Add Image
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Music className="w-4 h-4" />
                Add Song
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPromptIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentPromptIndex === prompts.length - 1 ? (
                <Button onClick={handleSubmit} className="gap-2">
                  <Check className="w-4 h-4" />
                  Submit Responses
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

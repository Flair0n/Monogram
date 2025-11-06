import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Edit3, Users, Mail, Calendar, Feather, BookOpen, PenLine } from "lucide-react";

export function HeroPage() {
  const navigate = useNavigate();
  
  const lines = [
    "Write together.",
    "Read together.",
    "Reflect together."
  ];
  
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  
  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);
  
  // Typewriter effect
  useEffect(() => {
    const currentLine = lines[currentLineIndex];
    
    if (isTyping) {
      if (displayedText.length < currentLine.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentLine.slice(0, displayedText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause before next line
        const timeout = setTimeout(() => {
          setCurrentLineIndex((prev) => (prev + 1) % lines.length);
          setDisplayedText("");
        }, 2500);
        return () => clearTimeout(timeout);
      }
    }
  }, [displayedText, isTyping, currentLineIndex]);
  return (
    <div className="min-h-screen page-transition">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-6 h-6" />
            <span className="text-xl">Monogram</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-32 md:py-48 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
              <Feather className="w-4 h-4" />
              <span className="text-sm">Collective Journaling, Reimagined</span>
            </div>
          </div>
          
          <div className="min-h-[320px] flex items-center justify-center px-4 w-full">
            <h1
              className="mb-6 leading-tight whitespace-nowrap"
              style={{ 
                fontFamily: "'Victor Mono', monospace",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(2.5rem, 8vw, 8rem)",
                marginLeft: "5%"
              }}
            >
              {displayedText}
              <span 
                className="text-gray-600"
                style={{ 
                  opacity: showCursor ? 1 : 0,
                  transition: 'opacity 0.1s ease',
                  marginLeft: '4px'
                }}
              >
                |
              </span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A retro typewriter-inspired digital space where small groups take turns curating 
            weekly writing prompts and receive a beautiful letter each week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              <PenLine className="w-5 h-5" />
              Start Writing
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <BookOpen className="w-5 h-5" />
              Learn More
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Free for groups up to 12 writers<span className="cursor-blink inline-block ml-1">|</span>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple, thoughtful approach to collective writing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 paper-texture">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="mb-3">Weekly Rotation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each week, a different member becomes the curator, creating thoughtful 
                prompts for the group.
              </p>
            </Card>

            <Card className="p-8 paper-texture">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <PenLine className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="mb-3">Quiet Reflection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Take your time responding to prompts in a distraction-free, 
                paper-like writing environment.
              </p>
            </Card>

            <Card className="p-8 paper-texture">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="mb-3">Digital Letters</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive a beautifully formatted newsletter each week with everyone's 
                responses in a vintage zine style.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshot Preview */}
      <section className="px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <Card className="p-8 md:p-12 paper-texture shadow-2xl">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <Edit3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">App Preview</p>
              </div>
            </div>
            <div className="text-center">
              <h3 className="mb-2">A literary journal, not a startup dashboard</h3>
              <p className="text-muted-foreground">
                Every detail designed to feel timeless, quiet, and human
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">For Small Groups Who Love Words</h2>
            <p className="text-muted-foreground">
              Perfect for book clubs, writing groups, close friends, and creative collectives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 paper-texture">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-accent-foreground">EC</span>
                </div>
                <div>
                  <p className="mb-2 italic text-muted-foreground">
                    "It's like having a weekly letter exchange with your closest friends, 
                    but without the pressure of social media."
                  </p>
                  <p className="text-sm">— Emma, Sunday Reflections</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 paper-texture">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-secondary-foreground">MW</span>
                </div>
                <div>
                  <p className="mb-2 italic text-muted-foreground">
                    "The rotation system means everyone gets to lead, and the writing 
                    stays fresh week after week."
                  </p>
                  <p className="text-sm">— Marcus, Morning Pages Collective</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl mb-6">Ready to start writing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create your first space in minutes. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
            <Users className="w-5 h-5" />
            Create Your Space
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              <span>Monogram</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Monogram. For writers, by writers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

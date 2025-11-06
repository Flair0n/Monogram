import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Edit3, ArrowLeft, Mail, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Helper function to parse Supabase auth errors into user-friendly messages
function parseAuthError(error: Error): string {
  const message = error.message.toLowerCase();
  
  // Password validation errors
  if (message.includes('password') && message.includes('short')) {
    return 'Password must be at least 6 characters long';
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Use a mix of letters, numbers, and symbols';
  }
  
  // Email validation errors
  if (message.includes('invalid') && message.includes('email')) {
    return 'Please enter a valid email address';
  }
  if (message.includes('email') && message.includes('already')) {
    return 'An account with this email already exists. Try signing in instead';
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead';
  }
  
  // Authentication errors
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before signing in';
  }
  if (message.includes('user not found')) {
    return 'No account found with this email. Try signing up instead';
  }
  
  // Network/server errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again';
  }
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again';
  }
  
  // Rate limiting
  if (message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again';
  }
  
  // Default fallback
  return error.message || 'An error occurred. Please try again';
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signup(email, password, name);
        if (error) {
          setError(parseAuthError(error));
          setLoading(false);
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await login(email, password);
        if (error) {
          setError(parseAuthError(error));
          setLoading(false);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(parseAuthError(err));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(parseAuthError(error));
      } else {
        setResetEmailSent(true);
      }
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // If showing forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        {/* Header */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Edit3 className="w-6 h-6" />
              <span className="text-xl">Monogram</span>
            </button>
            <Button 
              variant="ghost" 
              onClick={() => setShowForgotPassword(false)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </div>
        </nav>

        {/* Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="p-8 md:p-10 paper-texture shadow-lg">
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-medium">Check Your Email</h2>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to reset your password. The link will expire in 1 hour.
                  </p>
                  <Button 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl mb-2">Reset Password</h2>
                    <p className="text-muted-foreground">
                      Enter your email and we'll send you a reset link
                      <span className="cursor-blink inline-block ml-1">|</span>
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Edit3 className="w-6 h-6" />
            <span className="text-xl">Monogram</span>
          </button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="p-8 md:p-10 paper-texture shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-2">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Start your writing journey" 
                  : "Sign in to your spaces"}
                <span className="cursor-blink inline-block ml-1">|</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Emma Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <Separator />
            </div>

            {/* Toggle Sign Up/In */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp 
                  ? "Already have an account?" 
                  : "Don't have an account?"}
                {' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-foreground underline hover:no-underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>

            {/* Social Login */}
            <div className="mt-6 space-y-3">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" onClick={handleSubmit}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" onClick={handleSubmit}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy Note */}
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
            By continuing, you agree to Monogram's Terms of Service and Privacy Policy. 
            Your writing is private to your spaces.
          </p>
        </div>
      </div>
    </div>
  );
}

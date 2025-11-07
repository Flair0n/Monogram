import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleSpotifyCallback, getOAuthReturnPath } from '../lib/spotify-auth';
import { MainLayout } from '../components/layouts/MainLayout';

export function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Handle user denial
      if (error === 'access_denied') {
        setStatus('error');
        setErrorMessage('Spotify connection was cancelled.');
        setTimeout(() => {
          navigate(getOAuthReturnPath());
        }, 2000);
        return;
      }

      // Handle missing parameters
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Invalid callback parameters.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      // Exchange code for tokens
      const result = await handleSpotifyCallback(code, state);

      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          navigate(getOAuthReturnPath());
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(result.error?.message || 'Failed to connect Spotify');
        setTimeout(() => {
          navigate(getOAuthReturnPath());
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen bg-cream/30">
        <div 
          className="w-full max-w-md border-2 rounded-lg shadow-2xl font-mono overflow-hidden"
          style={{ 
            fontFamily: "'IBM Plex Mono', monospace",
            backgroundColor: '#fdfaf5',
            borderColor: 'rgba(42, 42, 42, 0.2)',
          }}
        >
          {/* Terminal Header */}
          <div 
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: '#2a2a2a', color: '#fdfaf5' }}
          >
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            <span className="ml-3 text-sm opacity-70">spotify_auth.sh</span>
          </div>

          {/* Terminal Body */}
          <div 
            className="p-8 min-h-[200px] flex flex-col items-center justify-center"
            style={{ color: '#2a2a2a', backgroundColor: '#fdfaf5' }}
          >
            {status === 'processing' && (
              <div className="text-center space-y-4">
                <div className="text-[#bfa67a] text-lg">
                  <span className="animate-pulse">●</span> Connecting to Spotify...
                </div>
                <p className="text-sm text-muted-foreground">
                  &gt; Exchanging authorization code
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="text-[#27c93f] text-lg">
                  ✓ Successfully connected!
                </div>
                <p className="text-sm text-muted-foreground">
                  &gt; Redirecting back...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="text-[#ff5f56] text-lg">
                  ✗ Connection failed
                </div>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
                <p className="text-xs text-muted-foreground">
                  &gt; Redirecting back...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

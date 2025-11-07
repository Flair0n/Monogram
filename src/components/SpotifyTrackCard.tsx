/**
 * SpotifyTrackCard Component
 * Displays Spotify track in retro terminal-style card with typewriter animation
 */

import { useState, useEffect } from 'react';
import type { SpotifyTrackMetadata } from '../lib/spotify-types';
import { formatDuration } from '../lib/spotify';

interface SpotifyTrackCardProps {
  track: SpotifyTrackMetadata;
  showProgress?: boolean;
  progress?: number; // in milliseconds
  animated?: boolean;
}

export function SpotifyTrackCard({
  track,
  animated = true,
}: SpotifyTrackCardProps) {
  const [showCursor, setShowCursor] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `▶ Now Playing: ${track.name} — ${track.artist}`;

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Typewriter animation
  useEffect(() => {
    if (!animated) {
      setDisplayedText(fullText);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [fullText, animated]);

  const durationFormatted = formatDuration(track.duration);

  // Extract Spotify track ID from URL for embed
  const getSpotifyTrackId = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const trackId = getSpotifyTrackId(track.url);

  return (
    <div
      className="font-mono text-sm w-full max-w-2xl"
      style={{
        fontFamily: "'Victor Mono', 'IBM Plex Mono', monospace",
        backgroundColor: '#2a2a2a',
        color: '#bfa67a',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '2px solid rgba(191, 166, 122, 0.3)',
        overflow: 'hidden',
      }}
    >
      {/* ASCII Border Top */}
      <div 
        className="mb-3 flex" 
        style={{ 
          color: '#bfa67a', 
          fontSize: '0.75rem',
        }}
      >
        <span>╔{'═'.repeat(88)}╗</span>
      </div>

      {/* Content with side borders */}
      <div className="space-y-3 px-2">
        {/* Now Playing with Typewriter */}
        <div className="flex gap-2 items-center min-h-[1.5rem]">
          <span style={{ color: '#bfa67a' }}>║</span>
          <span style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
            {displayedText}
            {animated && displayedText.length < fullText.length && showCursor && (
              <span className="inline-block w-2 h-4 bg-[#bfa67a] ml-1 animate-pulse" />
            )}
          </span>
        </div>

        {/* Track Details - No Album Art */}
        <div className="space-y-2 py-2">
          <div className="flex gap-2">
            <span style={{ color: '#bfa67a' }}>║</span>
            <div>
              <span style={{ fontStyle: 'italic', fontSize: '0.75rem', opacity: 0.8 }}>
                Album:
              </span>
              {' '}
              <span style={{ fontStyle: 'italic', fontSize: '0.875rem', opacity: 0.95 }}>
                {track.album}
              </span>
              {track.releaseYear && (
                <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '0.5rem' }}>
                  ({track.releaseYear})
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <span style={{ color: '#bfa67a' }}>║</span>
            <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
              Duration: {durationFormatted}
            </span>
          </div>
        </div>

        {/* Spotify Embedded Player - Compact */}
        {trackId && (
          <div className="py-2" style={{ overflow: 'hidden' }}>
            <iframe
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              scrolling="no"
              style={{
                borderRadius: '0.375rem',
                border: '1px solid rgba(191, 166, 122, 0.2)',
                display: 'block',
                overflow: 'hidden',
              }}
              title={`Spotify player for ${track.name}`}
            />
          </div>
        )}

        {/* Spotify Link */}
        <div className="flex gap-2 pt-1">
          <span style={{ color: '#bfa67a' }}>║</span>
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline transition-opacity hover:opacity-80"
            style={{ color: '#bfa67a', fontStyle: 'italic' }}
          >
            Open in Spotify →
          </a>
        </div>
      </div>

      {/* ASCII Border Bottom */}
      <div 
        className="mt-3 flex" 
        style={{ 
          color: '#bfa67a', 
          fontSize: '0.75rem',
        }}
      >
        <span>╚{'═'.repeat(88)}╝</span>
      </div>
    </div>
  );
}

/**
 * Compact version for smaller displays
 */
export function SpotifyTrackCardCompact({ track }: { track: SpotifyTrackMetadata }) {
  return (
    <div
      className="font-mono text-xs p-3 flex items-center gap-3"
      style={{
        fontFamily: "'Victor Mono', 'IBM Plex Mono', monospace",
        backgroundColor: '#2a2a2a',
        color: '#bfa67a',
        borderRadius: '0.375rem',
        border: '1px solid rgba(191, 166, 122, 0.3)',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate" style={{ fontStyle: 'italic' }}>
          {track.name}
        </div>
        <div className="text-[10px] truncate opacity-70">
          {track.artist} • {track.album}
        </div>
      </div>
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] hover:underline shrink-0"
        style={{ color: '#bfa67a' }}
      >
        ▶
      </a>
    </div>
  );
}

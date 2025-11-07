/**
 * SpotifyTrackCard Component
 * Displays Spotify track in retro terminal-style card with typewriter animation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  showProgress = false,
  progress,
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

  const progressFormatted = progress ? formatDuration(progress) : '0:00';
  const durationFormatted = formatDuration(track.duration);

  return (
    <div
      className="font-mono text-sm"
      style={{
        fontFamily: "'Victor Mono', 'IBM Plex Mono', monospace",
        backgroundColor: '#2a2a2a',
        color: '#bfa67a',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '2px solid rgba(191, 166, 122, 0.3)',
      }}
    >
      {/* ASCII Border Top */}
      <div className="mb-2" style={{ color: '#bfa67a' }}>
        ╔{'═'.repeat(50)}╗
      </div>

      {/* Content */}
      <div className="space-y-2 px-2">
        {/* Now Playing with Typewriter */}
        <div className="flex items-center min-h-[1.5rem]">
          <span style={{ fontStyle: 'italic' }}>
            {displayedText}
            {animated && displayedText.length < fullText.length && showCursor && (
              <span className="inline-block w-2 h-4 bg-[#bfa67a] ml-1 animate-pulse" />
            )}
          </span>
        </div>

        {/* Album Art and Details */}
        <div className="flex items-center gap-4 py-2">
          {track.albumArt && (
            <img
              src={track.albumArt}
              alt={track.album}
              className="w-20 h-20 object-cover rounded border-2"
              style={{ borderColor: '#bfa67a' }}
            />
          )}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span style={{ color: '#bfa67a' }}>║</span>
              <span style={{ fontStyle: 'italic' }}>
                Album: {track.album} {track.releaseYear && `(${track.releaseYear})`}
              </span>
            </div>
            {showProgress && (
              <div className="flex items-center gap-2">
                <span style={{ color: '#bfa67a' }}>║</span>
                <span style={{ fontStyle: 'italic' }}>
                  ⧗ {progressFormatted} / {durationFormatted}
                </span>
              </div>
            )}
            {!showProgress && (
              <div className="flex items-center gap-2">
                <span style={{ color: '#bfa67a' }}>║</span>
                <span style={{ fontStyle: 'italic' }}>
                  Duration: {durationFormatted}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Spotify Link */}
        <div className="flex items-center gap-2">
          <span style={{ color: '#bfa67a' }}>║</span>
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: '#bfa67a', fontStyle: 'italic' }}
          >
            Open in Spotify →
          </a>
        </div>
      </div>

      {/* ASCII Border Bottom */}
      <div className="mt-2" style={{ color: '#bfa67a' }}>
        ╚{'═'.repeat(50)}╝
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
      {track.albumArt && (
        <img
          src={track.albumArt}
          alt={track.album}
          className="w-12 h-12 object-cover rounded"
          style={{ border: '1px solid #bfa67a' }}
        />
      )}
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

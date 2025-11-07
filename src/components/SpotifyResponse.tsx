/**
 * SpotifyResponse Component
 * Main component for Spotify response input with URL paste and Now Playing
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Music, Play, X, Check } from 'lucide-react';
import { SpotifyConnect } from './SpotifyConnect';
import { SpotifyTrackCard } from './SpotifyTrackCard';
import { useSpotify } from '../hooks/useSpotify';
import type { SpotifyTrackMetadata, SpotifyResponseData } from '../lib/spotify-types';

interface SpotifyResponseProps {
  promptId: string;
  onSubmit: (data: SpotifyResponseData) => void;
  onCancel?: () => void;
  initialValue?: SpotifyResponseData;
}

export function SpotifyResponse({
  promptId,
  onSubmit,
  onCancel,
  initialValue,
}: SpotifyResponseProps) {
  const {
    isConnected,
    isLoading: spotifyLoading,
    error: spotifyError,
    connect,
    disconnect,
    fetchNowPlaying,
    fetchTrackByUrl,
    validateUrl,
    clearError,
  } = useSpotify();

  const [spotifyUrl, setSpotifyUrl] = useState(initialValue?.spotifyUrl || '');
  const [track, setTrack] = useState<SpotifyTrackMetadata | null>(
    initialValue
      ? {
          id: initialValue.trackId,
          name: initialValue.trackName,
          artist: initialValue.artistName,
          album: initialValue.albumName,
          albumArt: initialValue.albumArtUrl,
          url: initialValue.spotifyUrl,
          duration: initialValue.duration,
        }
      : null
  );
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  /**
   * Handle Now Playing button click
   */
  const handleNowPlaying = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    setIsLoadingTrack(true);
    setUrlError(null);
    clearError();

    const trackData = await fetchNowPlaying();

    if (trackData) {
      setTrack(trackData);
      setSpotifyUrl(trackData.url);
    }

    setIsLoadingTrack(false);
  };

  /**
   * Handle URL input change
   */
  const handleUrlChange = (value: string) => {
    setSpotifyUrl(value);
    setUrlError(null);
    clearError();

    // Clear track if URL is cleared
    if (!value.trim()) {
      setTrack(null);
    }
  };

  /**
   * Handle URL paste/submit
   */
  const handleFetchFromUrl = async () => {
    if (!spotifyUrl.trim()) {
      setUrlError('Please enter a Spotify URL');
      return;
    }

    if (!validateUrl(spotifyUrl)) {
      setUrlError('Invalid Spotify URL. Please paste a valid track link.');
      return;
    }

    if (!isConnected) {
      connect();
      return;
    }

    setIsLoadingTrack(true);
    setUrlError(null);
    clearError();

    const trackData = await fetchTrackByUrl(spotifyUrl);

    if (trackData) {
      setTrack(trackData);
    }

    setIsLoadingTrack(false);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!track) return;

    const responseData: SpotifyResponseData = {
      trackId: track.id,
      trackName: track.name,
      artistName: track.artist,
      albumName: track.album,
      spotifyUrl: track.url,
      albumArtUrl: track.albumArt,
      duration: track.duration,
    };

    onSubmit(responseData);
  };

  /**
   * Clear track selection
   */
  const handleClearTrack = () => {
    setTrack(null);
    setSpotifyUrl('');
    setUrlError(null);
    clearError();
  };

  return (
    <div className="space-y-6">
      {/* Spotify Connection Status */}
      {!isConnected && (
        <SpotifyConnect
          isConnected={isConnected}
          isLoading={spotifyLoading}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      )}

      {/* Input Section */}
      {!track && (
        <div className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="spotify-url">Spotify Track URL</Label>
            <div className="flex gap-2">
              <Input
                id="spotify-url"
                type="text"
                placeholder="https://open.spotify.com/track/..."
                value={spotifyUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFetchFromUrl();
                  }
                }}
                className={urlError ? 'border-destructive' : ''}
              />
              <Button
                onClick={handleFetchFromUrl}
                disabled={!spotifyUrl.trim() || isLoadingTrack}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                {isLoadingTrack ? 'Loading...' : 'Add'}
              </Button>
            </div>
            {urlError && (
              <p className="text-xs text-destructive">{urlError}</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Now Playing Button */}
          <Button
            onClick={handleNowPlaying}
            disabled={isLoadingTrack}
            variant="outline"
            className="w-full gap-2"
          >
            <Play className="w-4 h-4" />
            {isLoadingTrack
              ? 'Fetching...'
              : isConnected
              ? 'Use Now Playing'
              : 'Connect Spotify for Now Playing'}
          </Button>

          {/* Error Display */}
          {spotifyError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{spotifyError.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Track Preview */}
      {track && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Selected Track</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearTrack}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Change
            </Button>
          </div>
          <SpotifyTrackCard track={track} animated={true} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!track}
          className="flex-1 gap-2 bg-sage hover:bg-sage/90 text-cream"
        >
          <Music className="w-4 h-4" />
          Submit Response
        </Button>
      </div>
    </div>
  );
}

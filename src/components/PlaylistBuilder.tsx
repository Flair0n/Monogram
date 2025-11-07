/**
 * PlaylistBuilder Component
 * Allows curators to compile Spotify responses into a shared playlist
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Music, ExternalLink, Check, Loader2 } from 'lucide-react';
import { SpotifyConnect } from './SpotifyConnect';
import { useSpotify } from '../hooks/useSpotify';
import { buildPlaylistFromTracks } from '../lib/spotify';
import type { SpotifyResponseData } from '../lib/spotify-types';

interface PlaylistBuilderProps {
  spaceId: string;
  spaceName: string;
  weekNumber: number;
  responses: SpotifyResponseData[];
  onPlaylistCreated: (playlistUrl: string) => void;
  existingPlaylistUrl?: string;
}

export function PlaylistBuilder({
  spaceId,
  spaceName,
  weekNumber,
  responses,
  onPlaylistCreated,
  existingPlaylistUrl,
}: PlaylistBuilderProps) {
  const {
    isConnected,
    isLoading: spotifyLoading,
    error: spotifyError,
    connect,
    disconnect,
  } = useSpotify();

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(existingPlaylistUrl || null);

  /**
   * Build playlist from responses
   */
  const handleBuildPlaylist = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    if (responses.length === 0) {
      setBuildError('No Spotify responses found for this week');
      return;
    }

    setIsBuilding(true);
    setBuildError(null);

    try {
      const playlistName = `${spaceName} - Week ${weekNumber}`;
      const description = `Compiled playlist from ${spaceName} for Week ${weekNumber}. ${responses.length} tracks from the community.`;
      const trackIds = responses.map(r => r.trackId);

      const result = await buildPlaylistFromTracks(playlistName, trackIds, description);

      if (result.error || !result.data) {
        setBuildError(result.error?.message || 'Failed to create playlist');
        return;
      }

      const url = result.data.external_urls.spotify;
      setPlaylistUrl(url);
      onPlaylistCreated(url);
    } catch (error) {
      console.error('Error building playlist:', error);
      setBuildError('An unexpected error occurred while creating the playlist');
    } finally {
      setIsBuilding(false);
    }
  };

  // No responses
  if (responses.length === 0) {
    return (
      <Card className="p-6 paper-texture bg-muted/30">
        <div className="text-center py-4">
          <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No Spotify responses for this week yet
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 paper-texture border-sage/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium mb-1 font-mono" style={{ fontFamily: "'Victor Mono', monospace", fontStyle: 'italic' }}>
              Playlist Builder
            </h3>
            <p className="text-sm text-muted-foreground">
              Compile all Spotify responses into a shared playlist
            </p>
          </div>
          {!isConnected && (
            <SpotifyConnect
              isConnected={isConnected}
              isLoading={spotifyLoading}
              onConnect={connect}
              compact={true}
            />
          )}
        </div>

        {/* Stats */}
        <div
          className="p-4 rounded font-mono text-sm"
          style={{
            backgroundColor: '#2a2a2a',
            color: '#bfa67a',
            border: '1px solid rgba(191, 166, 122, 0.3)',
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span style={{ fontStyle: 'italic' }}>&gt; Total Tracks:</span>
              <span className="font-medium">{responses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontStyle: 'italic' }}>&gt; Week:</span>
              <span className="font-medium">{weekNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontStyle: 'italic' }}>&gt; Space:</span>
              <span className="font-medium truncate ml-2">{spaceName}</span>
            </div>
          </div>
        </div>

        {/* Existing Playlist */}
        {playlistUrl && (
          <div className="p-4 bg-sage/10 border border-sage/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <p className="text-sm font-medium">Playlist Created</p>
                  <p className="text-xs text-muted-foreground">
                    {spaceName} - Week {weekNumber}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(playlistUrl, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Spotify
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(buildError || spotifyError) && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              {buildError || spotifyError?.message}
            </p>
          </div>
        )}

        {/* Build Button */}
        {!playlistUrl && (
          <Button
            onClick={handleBuildPlaylist}
            disabled={isBuilding || !isConnected}
            className="w-full gap-2 bg-sage hover:bg-sage/90 text-cream"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Playlist...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                {isConnected ? 'Build Playlist' : 'Connect Spotify to Build Playlist'}
              </>
            )}
          </Button>
        )}

        {playlistUrl && (
          <p className="text-xs text-center text-muted-foreground font-mono" style={{ fontStyle: 'italic' }}>
            &gt; Playlist saved to week metadata
          </p>
        )}
      </div>
    </Card>
  );
}

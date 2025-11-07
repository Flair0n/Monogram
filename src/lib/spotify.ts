/**
 * Spotify API Client
 * Handles all Spotify Web API calls with automatic token refresh
 */

import {
  SpotifyTrack,
  SpotifyTrackMetadata,
  CurrentlyPlaying,
  SpotifyPlaylist,
  SpotifyUser,
  SPOTIFY_CONFIG,
  SPOTIFY_URL_PATTERNS,
  SPOTIFY_ERROR_MESSAGES,
  type SpotifyError,
  type SpotifyApiResponse,
} from './spotify-types';
import { getValidAccessToken, refreshSpotifyToken, getSpotifyTokens } from './spotify-auth';

// ============================================
// API Request Helper
// ============================================

/**
 * Make authenticated request to Spotify API
 * Automatically handles token refresh on 401 errors
 */
async function spotifyApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<SpotifyApiResponse<T>> {
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    return {
      error: {
        code: 'NOT_CONNECTED',
        message: SPOTIFY_ERROR_MESSAGES.NOT_CONNECTED,
      },
    };
  }
  
  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Handle 401 - Token expired, try to refresh
    if (response.status === 401) {
      const tokens = await getSpotifyTokens();
      if (tokens) {
        try {
          const newTokens = await refreshSpotifyToken(tokens.refreshToken);
          // Retry request with new token
          const retryResponse = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              'Authorization': `Bearer ${newTokens.accessToken}`,
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Spotify API error: ${retryResponse.status}`);
          }
          
          const data = await retryResponse.json();
          return { data };
        } catch (refreshError) {
          return {
            error: {
              code: 'TOKEN_REFRESH_FAILED',
              message: SPOTIFY_ERROR_MESSAGES.TOKEN_REFRESH_FAILED,
              originalError: refreshError,
            },
          };
        }
      }
    }
    
    // Handle 429 - Rate limited
    if (response.status === 429) {
      return {
        error: {
          code: 'RATE_LIMITED',
          message: SPOTIFY_ERROR_MESSAGES.RATE_LIMITED,
        },
      };
    }
    
    // Handle 404 - Not found
    if (response.status === 404) {
      return {
        error: {
          code: 'TRACK_NOT_FOUND',
          message: SPOTIFY_ERROR_MESSAGES.TRACK_NOT_FOUND,
        },
      };
    }
    
    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: {
          code: 'API_ERROR',
          message: SPOTIFY_ERROR_MESSAGES.API_ERROR,
          originalError: errorData,
        },
      };
    }
    
    // Handle 204 No Content (e.g., no track playing)
    if (response.status === 204) {
      return { data: null as T };
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Spotify API request failed:', error);
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: SPOTIFY_ERROR_MESSAGES.NETWORK_ERROR,
        originalError: error,
      },
    };
  }
}

// ============================================
// Track Operations
// ============================================

/**
 * Get currently playing track
 */
export async function getCurrentlyPlaying(): Promise<SpotifyApiResponse<CurrentlyPlaying>> {
  return spotifyApiRequest<CurrentlyPlaying>('/me/player/currently-playing');
}

/**
 * Get track by ID
 */
export async function getTrackById(trackId: string): Promise<SpotifyApiResponse<SpotifyTrack>> {
  return spotifyApiRequest<SpotifyTrack>(`/tracks/${trackId}`);
}

/**
 * Parse Spotify URL and extract track ID
 */
export function parseSpotifyUrl(url: string): { type: 'track' | 'album' | 'playlist' | null; id: string | null } {
  // Try track URL
  let match = url.match(SPOTIFY_URL_PATTERNS.TRACK);
  if (match) return { type: 'track', id: match[1] };
  
  // Try track URI
  match = url.match(SPOTIFY_URL_PATTERNS.URI_TRACK);
  if (match) return { type: 'track', id: match[1] };
  
  // Try album URL
  match = url.match(SPOTIFY_URL_PATTERNS.ALBUM);
  if (match) return { type: 'album', id: match[1] };
  
  // Try album URI
  match = url.match(SPOTIFY_URL_PATTERNS.URI_ALBUM);
  if (match) return { type: 'album', id: match[1] };
  
  // Try playlist URL
  match = url.match(SPOTIFY_URL_PATTERNS.PLAYLIST);
  if (match) return { type: 'playlist', id: match[1] };
  
  // Try playlist URI
  match = url.match(SPOTIFY_URL_PATTERNS.URI_PLAYLIST);
  if (match) return { type: 'playlist', id: match[1] };
  
  return { type: null, id: null };
}

/**
 * Get track by URL (supports track, album, playlist URLs)
 */
export async function getTrackByUrl(url: string): Promise<SpotifyApiResponse<SpotifyTrack>> {
  const parsed = parseSpotifyUrl(url);
  
  if (!parsed.id) {
    return {
      error: {
        code: 'INVALID_URL',
        message: SPOTIFY_ERROR_MESSAGES.INVALID_URL,
      },
    };
  }
  
  // For now, only support track URLs
  // TODO: Support album and playlist URLs (get first track)
  if (parsed.type !== 'track') {
    return {
      error: {
        code: 'INVALID_URL',
        message: 'Only track URLs are supported. Please paste a Spotify track link.',
      },
    };
  }
  
  return getTrackById(parsed.id);
}

/**
 * Convert Spotify track to metadata format
 */
export function trackToMetadata(track: SpotifyTrack): SpotifyTrackMetadata {
  const albumArt = track.album.images[0]?.url || '';
  const releaseYear = track.album.release_date?.split('-')[0];
  
  return {
    id: track.id,
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArt: albumArt,
    url: track.external_urls.spotify,
    duration: track.duration_ms,
    releaseYear: releaseYear,
  };
}

// ============================================
// Playlist Operations
// ============================================

/**
 * Get current user's Spotify profile
 */
export async function getCurrentUser(): Promise<SpotifyApiResponse<SpotifyUser>> {
  return spotifyApiRequest<SpotifyUser>('/me');
}

/**
 * Create a new playlist
 */
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
  isPublic: boolean = true
): Promise<SpotifyApiResponse<SpotifyPlaylist>> {
  return spotifyApiRequest<SpotifyPlaylist>(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description: description || '',
      public: isPublic,
    }),
  });
}

/**
 * Add tracks to playlist
 */
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[]
): Promise<SpotifyApiResponse<{ snapshot_id: string }>> {
  // Spotify API limits to 100 tracks per request
  const chunks: string[][] = [];
  for (let i = 0; i < trackUris.length; i += 100) {
    chunks.push(trackUris.slice(i, i + 100));
  }
  
  // Add tracks in chunks
  for (const chunk of chunks) {
    const result = await spotifyApiRequest<{ snapshot_id: string }>(
      `/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        body: JSON.stringify({
          uris: chunk,
        }),
      }
    );
    
    if (result.error) {
      return result;
    }
  }
  
  return { data: { snapshot_id: 'success' } };
}

/**
 * Build playlist from track IDs
 * Creates a new playlist and adds all tracks
 */
export async function buildPlaylistFromTracks(
  playlistName: string,
  trackIds: string[],
  description?: string
): Promise<SpotifyApiResponse<SpotifyPlaylist>> {
  // Get current user
  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data) {
    return {
      error: userResult.error || {
        code: 'API_ERROR',
        message: 'Failed to get user profile',
      },
    };
  }
  
  // Create playlist
  const playlistResult = await createPlaylist(
    userResult.data.id,
    playlistName,
    description,
    true
  );
  
  if (playlistResult.error || !playlistResult.data) {
    return {
      error: playlistResult.error || {
        code: 'PLAYLIST_CREATE_FAILED',
        message: SPOTIFY_ERROR_MESSAGES.PLAYLIST_CREATE_FAILED,
      },
    };
  }
  
  // Convert track IDs to URIs
  const trackUris = trackIds.map(id => `spotify:track:${id}`);
  
  // Add tracks to playlist
  const addResult = await addTracksToPlaylist(playlistResult.data.id, trackUris);
  
  if (addResult.error) {
    return {
      error: {
        code: 'PLAYLIST_ADD_TRACKS_FAILED',
        message: SPOTIFY_ERROR_MESSAGES.PLAYLIST_ADD_TRACKS_FAILED,
        originalError: addResult.error,
      },
    };
  }
  
  return playlistResult;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format duration from milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Validate Spotify URL
 */
export function isValidSpotifyUrl(url: string): boolean {
  const parsed = parseSpotifyUrl(url);
  return parsed.id !== null;
}

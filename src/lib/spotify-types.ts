/**
 * Spotify API TypeScript Interfaces
 * Type definitions for Spotify Web API responses and internal data structures
 */

// ============================================
// Authentication & Tokens
// ============================================

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO timestamp
  tokenType?: string;
}

export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

// ============================================
// Spotify API Objects
// ============================================

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  album_type: string;
  release_date: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

export interface CurrentlyPlaying {
  item: SpotifyTrack | null;
  progress_ms: number | null;
  is_playing: boolean;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  timestamp: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  public: boolean;
  collaborative: boolean;
  uri: string;
  external_urls: {
    spotify: string;
  };
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

// ============================================
// Internal Application Types
// ============================================

export interface SpotifyResponseData {
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  spotifyUrl: string;
  albumArtUrl: string;
  duration: number;
  progress?: number;
}

export interface SpotifyTrackMetadata {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
  duration: number;
  releaseYear?: string;
}

// ============================================
// Error Messages
// ============================================

export const SPOTIFY_ERROR_MESSAGES = {
  // OAuth Errors
  OAUTH_DENIED: "Spotify connection was cancelled. Please try again to use Now Playing.",
  OAUTH_FAILED: "Failed to connect to Spotify. Please try again.",
  OAUTH_INVALID_STATE: "Invalid OAuth state. Please try connecting again.",
  
  // API Errors
  NO_TRACK_PLAYING: "No track currently playing. Try pasting a Spotify URL instead.",
  INVALID_URL: "Invalid Spotify URL. Please paste a valid track, album, or playlist link.",
  TRACK_NOT_FOUND: "Track not found. Please check the URL and try again.",
  RATE_LIMITED: "Too many requests. Please try again in a few minutes.",
  NETWORK_ERROR: "Connection failed. Please check your internet connection.",
  API_ERROR: "Spotify API error. Please try again later.",
  
  // Token Errors
  TOKEN_EXPIRED: "Your Spotify session expired. Please reconnect.",
  TOKEN_INVALID: "Invalid Spotify token. Please reconnect your account.",
  TOKEN_REFRESH_FAILED: "Failed to refresh Spotify session. Please reconnect.",
  
  // Playlist Errors
  PLAYLIST_CREATE_FAILED: "Failed to create playlist. Please try again.",
  PLAYLIST_ADD_TRACKS_FAILED: "Failed to add tracks to playlist. Please try again.",
  NO_SPOTIFY_RESPONSES: "No Spotify responses found for this week.",
  
  // Permission Errors
  INSUFFICIENT_SCOPE: "Missing required permissions. Please reconnect and approve all permissions.",
  NOT_CONNECTED: "Spotify not connected. Please connect your account first.",
  
  // General
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// ============================================
// Spotify URL Patterns
// ============================================

export const SPOTIFY_URL_PATTERNS = {
  TRACK: /^https?:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
  ALBUM: /^https?:\/\/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/,
  PLAYLIST: /^https?:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
  URI_TRACK: /^spotify:track:([a-zA-Z0-9]+)$/,
  URI_ALBUM: /^spotify:album:([a-zA-Z0-9]+)$/,
  URI_PLAYLIST: /^spotify:playlist:([a-zA-Z0-9]+)$/,
} as const;

// ============================================
// Spotify API Configuration
// ============================================

export const SPOTIFY_CONFIG = {
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  API_BASE_URL: 'https://api.spotify.com/v1',
  SCOPES: [
    'user-read-currently-playing',
    'user-read-playback-state',
    'playlist-modify-public',
    'playlist-modify-private',
  ].join(' '),
} as const;

// ============================================
// Helper Types
// ============================================

export type SpotifyErrorCode = keyof typeof SPOTIFY_ERROR_MESSAGES;

export interface SpotifyError {
  code: SpotifyErrorCode;
  message: string;
  originalError?: unknown;
}

export interface SpotifyApiResponse<T> {
  data?: T;
  error?: SpotifyError;
}

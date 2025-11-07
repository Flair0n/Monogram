/**
 * Spotify OAuth Authentication
 * Handles OAuth flow, token management, and storage
 */

import { supabase } from './supabase';
import {
  SpotifyTokens,
  SpotifyAuthResponse,
  SPOTIFY_CONFIG,
  SPOTIFY_ERROR_MESSAGES,
  type SpotifyError,
} from './spotify-types';

// ============================================
// Environment Variables
// ============================================

const SPOTIFY_CLIENT_ID = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_REDIRECT_URI = (import.meta as any).env?.VITE_SPOTIFY_REDIRECT_URI || '';

// Validate environment variables
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
  console.error('Missing Spotify environment variables. Please check your .env file.');
}

// ============================================
// OAuth Flow
// ============================================

/**
 * Generate a random state string for OAuth security
 */
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initiate Spotify OAuth flow
 * Redirects user to Spotify authorization page
 */
export function initiateSpotifyAuth(): void {
  const state = generateRandomState();
  
  // Store state in sessionStorage for verification
  sessionStorage.setItem('spotify_auth_state', state);
  
  // Store current path to redirect back after auth
  sessionStorage.setItem('spotify_auth_return_path', window.location.pathname);
  
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: state,
    scope: SPOTIFY_CONFIG.SCOPES,
    show_dialog: 'false', // Don't force approval screen if already authorized
  });
  
  window.location.href = `${SPOTIFY_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * Handle OAuth callback from Spotify
 * Exchanges authorization code for access tokens
 */
export async function handleSpotifyCallback(
  code: string,
  state: string
): Promise<{ success: boolean; error?: SpotifyError }> {
  try {
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('spotify_auth_state');
    if (!storedState || storedState !== state) {
      return {
        success: false,
        error: {
          code: 'OAUTH_INVALID_STATE',
          message: SPOTIFY_ERROR_MESSAGES.OAUTH_INVALID_STATE,
        },
      };
    }
    
    // Clean up state
    sessionStorage.removeItem('spotify_auth_state');
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Save tokens to user metadata
    await saveSpotifyTokens(tokens);
    
    return { success: true };
  } catch (error) {
    console.error('Spotify OAuth callback error:', error);
    return {
      success: false,
      error: {
        code: 'OAUTH_FAILED',
        message: SPOTIFY_ERROR_MESSAGES.OAUTH_FAILED,
        originalError: error,
      },
    };
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const response = await fetch(SPOTIFY_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Token exchange failed:', error);
    throw new Error('Failed to exchange code for tokens');
  }
  
  const data: SpotifyAuthResponse = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    tokenType: data.token_type,
  };
}

// ============================================
// Token Management
// ============================================

/**
 * Save Spotify tokens to Supabase user metadata
 */
export async function saveSpotifyTokens(tokens: SpotifyTokens): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }
  
  // Update user metadata with Spotify tokens
  const { error } = await supabase.auth.updateUser({
    data: {
      spotify_access_token: tokens.accessToken,
      spotify_refresh_token: tokens.refreshToken,
      spotify_token_expires_at: tokens.expiresAt,
    },
  });
  
  if (error) {
    console.error('Failed to save Spotify tokens:', error);
    throw error;
  }
}

/**
 * Get Spotify tokens from Supabase user metadata
 */
export async function getSpotifyTokens(): Promise<SpotifyTokens | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  const metadata = user.user_metadata;
  
  if (!metadata.spotify_access_token || !metadata.spotify_refresh_token) {
    return null;
  }
  
  return {
    accessToken: metadata.spotify_access_token,
    refreshToken: metadata.spotify_refresh_token,
    expiresAt: metadata.spotify_token_expires_at,
  };
}

/**
 * Check if Spotify tokens are expired
 */
export function areTokensExpired(tokens: SpotifyTokens): boolean {
  const expiresAt = new Date(tokens.expiresAt);
  const now = new Date();
  
  // Consider expired if within 5 minutes of expiration
  const bufferMs = 5 * 60 * 1000;
  return expiresAt.getTime() - now.getTime() < bufferMs;
}

/**
 * Refresh Spotify access token using refresh token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch(SPOTIFY_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh token');
  }
  
  const data: SpotifyAuthResponse = await response.json();
  
  const newTokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Spotify may not return new refresh token
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    tokenType: data.token_type,
  };
  
  // Save updated tokens
  await saveSpotifyTokens(newTokens);
  
  return newTokens;
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getSpotifyTokens();
  
  if (!tokens) {
    return null;
  }
  
  // Check if token is expired
  if (areTokensExpired(tokens)) {
    try {
      const newTokens = await refreshSpotifyToken(tokens.refreshToken);
      return newTokens.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }
  
  return tokens.accessToken;
}

/**
 * Check if user is connected to Spotify
 */
export async function isSpotifyConnected(): Promise<boolean> {
  const tokens = await getSpotifyTokens();
  return tokens !== null;
}

/**
 * Disconnect Spotify by removing tokens from user metadata
 */
export async function disconnectSpotify(): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      spotify_access_token: null,
      spotify_refresh_token: null,
      spotify_token_expires_at: null,
    },
  });
  
  if (error) {
    console.error('Failed to disconnect Spotify:', error);
    throw error;
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get the return path after OAuth
 */
export function getOAuthReturnPath(): string {
  const path = sessionStorage.getItem('spotify_auth_return_path');
  sessionStorage.removeItem('spotify_auth_return_path');
  return path || '/dashboard';
}

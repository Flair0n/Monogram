/**
 * useSpotify Hook
 * Manages Spotify connection state and provides convenient access to Spotify functionality
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isSpotifyConnected,
  initiateSpotifyAuth,
  disconnectSpotify,
  getValidAccessToken,
} from '../lib/spotify-auth';
import {
  getCurrentlyPlaying,
  getTrackByUrl,
  isValidSpotifyUrl,
} from '../lib/spotify';
import type {
  SpotifyTrackMetadata,
  SpotifyError,
} from '../lib/spotify-types';
import { trackToMetadata } from '../lib/spotify';

interface UseSpotifyReturn {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: SpotifyError | null;
  
  // Actions
  connect: () => void;
  disconnect: () => Promise<void>;
  fetchNowPlaying: () => Promise<SpotifyTrackMetadata | null>;
  fetchTrackByUrl: (url: string) => Promise<SpotifyTrackMetadata | null>;
  validateUrl: (url: string) => boolean;
  clearError: () => void;
}

/**
 * Custom hook for managing Spotify integration
 */
export function useSpotify(): UseSpotifyReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SpotifyError | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  /**
   * Check if user is connected to Spotify
   */
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const connected = await isSpotifyConnected();
      setIsConnected(connected);
    } catch (err) {
      console.error('Error checking Spotify connection:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiate Spotify OAuth flow
   */
  const connect = useCallback(() => {
    setError(null);
    initiateSpotifyAuth();
  }, []);

  /**
   * Disconnect from Spotify
   */
  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await disconnectSpotify();
      setIsConnected(false);
    } catch (err) {
      console.error('Error disconnecting Spotify:', err);
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to disconnect Spotify',
        originalError: err,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch currently playing track
   */
  const fetchNowPlaying = useCallback(async (): Promise<SpotifyTrackMetadata | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if connected
      if (!isConnected) {
        setError({
          code: 'NOT_CONNECTED',
          message: 'Please connect your Spotify account first',
        });
        return null;
      }

      const result = await getCurrentlyPlaying();

      if (result.error) {
        setError(result.error);
        return null;
      }

      if (!result.data || !result.data.item) {
        setError({
          code: 'NO_TRACK_PLAYING',
          message: 'No track currently playing. Try pasting a Spotify URL instead.',
        });
        return null;
      }

      const metadata = trackToMetadata(result.data.item);
      return metadata;
    } catch (err) {
      console.error('Error fetching now playing:', err);
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to fetch currently playing track',
        originalError: err,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  /**
   * Fetch track by Spotify URL
   */
  const fetchTrackByUrl = useCallback(async (url: string): Promise<SpotifyTrackMetadata | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate URL
      if (!isValidSpotifyUrl(url)) {
        setError({
          code: 'INVALID_URL',
          message: 'Invalid Spotify URL. Please paste a valid track link.',
        });
        return null;
      }

      // Check if connected
      if (!isConnected) {
        setError({
          code: 'NOT_CONNECTED',
          message: 'Please connect your Spotify account first',
        });
        return null;
      }

      const result = await getTrackByUrl(url);

      if (result.error) {
        setError(result.error);
        return null;
      }

      if (!result.data) {
        setError({
          code: 'TRACK_NOT_FOUND',
          message: 'Track not found. Please check the URL.',
        });
        return null;
      }

      const metadata = trackToMetadata(result.data);
      return metadata;
    } catch (err) {
      console.error('Error fetching track by URL:', err);
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to fetch track',
        originalError: err,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  /**
   * Validate Spotify URL
   */
  const validateUrl = useCallback((url: string): boolean => {
    return isValidSpotifyUrl(url);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    fetchNowPlaying,
    fetchTrackByUrl,
    validateUrl,
    clearError,
  };
}

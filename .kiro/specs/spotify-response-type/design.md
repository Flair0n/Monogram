# Design Document

## Overview

The Spotify Response Type feature extends Monogram's prompt system to support music-based responses. Users can share Spotify tracks either by pasting URLs or by automatically capturing their currently playing track. Curators can compile all responses into a shared Spotify playlist.

## Architecture

### Component Structure

```
src/
├── components/
│   ├── SpotifyResponse.tsx       # Main Spotify response component
│   ├── SpotifyTrackCard.tsx      # Retro-style track display
│   ├── SpotifyConnect.tsx        # OAuth connection button
│   └── PlaylistBuilder.tsx       # Curator playlist compilation
├── lib/
│   ├── spotify.ts                # Spotify API client
│   ├── spotify-auth.ts           # OAuth flow management
│   └── spotify-types.ts          # TypeScript interfaces
└── hooks/
    └── useSpotify.ts             # Spotify state management hook
```

### Data Flow

1. **Prompt Creation**: Curator selects "Spotify" response type → Saved to `prompts.response_type`
2. **User Response**: Member pastes URL or clicks "Now Playing" → Fetch track data → Display preview → Save to `responses`
3. **Playlist Building**: Curator clicks "Build Playlist" → Fetch all Spotify responses → Create playlist via API → Save URL to `newsletters`

## Components and Interfaces

### SpotifyResponse Component

**Props:**
```typescript
interface SpotifyResponseProps {
  promptId: string;
  onSubmit: (data: SpotifyResponseData) => void;
  initialValue?: SpotifyResponseData;
}

interface SpotifyResponseData {
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  spotifyUrl: string;
  albumArtUrl: string;
  duration: number;
  progress?: number;
}
```

**Features:**
- Input field for Spotify URL
- "Now Playing" button
- Track preview card
- Submit/Cancel actions

### SpotifyTrackCard Component

**Props:**
```typescript
interface SpotifyTrackCardProps {
  track: SpotifyTrack;
  showProgress?: boolean;
  animated?: boolean;
}

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  progress?: number;
  url: string;
}
```

**Styling:**
- ASCII box-drawing characters (╔═╗║╚╝)
- Victor Mono Italic font
- Amber (#bfa67a) on dark gray (#2a2a2a)
- 80x80px album art
- Typewriter animation with Framer Motion
- Blinking cursor effect

### SpotifyConnect Component

**Props:**
```typescript
interface SpotifyConnectProps {
  onConnect: () => void;
  isConnected: boolean;
}
```

**Features:**
- Shows connection status
- Initiates OAuth flow
- Displays user's Spotify profile when connected

### PlaylistBuilder Component

**Props:**
```typescript
interface PlaylistBuilderProps {
  spaceId: string;
  weekNumber: number;
  responses: SpotifyResponseData[];
  onPlaylistCreated: (playlistUrl: string) => void;
}
```

**Features:**
- "Build Playlist" button
- Progress indicator during creation
- Playlist URL display
- "Open in Spotify" link

## Data Models

### Database Schema Updates

**prompts table:**
```sql
-- Add SPOTIFY to response_type enum
ALTER TYPE response_type ADD VALUE 'SPOTIFY';
```

**responses table:**
```sql
-- Existing fields used:
-- music_url: stores Spotify track URL
-- image_url: stores album art URL
-- content: stores JSON with track metadata
```

**users metadata (Supabase Auth):**
```json
{
  "spotify_access_token": "BQD...",
  "spotify_refresh_token": "AQD...",
  "spotify_token_expires_at": "2025-01-07T12:00:00Z",
  "spotify_user_id": "user123"
}
```

**newsletters table:**
```sql
-- Add playlist_url column
ALTER TABLE newsletters ADD COLUMN playlist_url TEXT;
```

### TypeScript Interfaces

```typescript
// lib/spotify-types.ts

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface CurrentlyPlaying {
  item: SpotifyTrack;
  progress_ms: number;
  is_playing: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}
```

## Spotify API Integration

### Authentication Flow

1. User clicks "Connect Spotify"
2. Redirect to Spotify OAuth:
   ```
   https://accounts.spotify.com/authorize?
     client_id={CLIENT_ID}&
     response_type=code&
     redirect_uri={REDIRECT_URI}&
     scope=user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private
   ```
3. Spotify redirects back with authorization code
4. Exchange code for tokens:
   ```
   POST https://accounts.spotify.com/api/token
   ```
5. Store tokens in Supabase user metadata

### Token Refresh

```typescript
async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
  };
}
```

### API Endpoints Used

1. **Get Currently Playing Track**
   ```
   GET https://api.spotify.com/v1/me/player/currently-playing
   Authorization: Bearer {access_token}
   ```

2. **Get Track Details**
   ```
   GET https://api.spotify.com/v1/tracks/{id}
   Authorization: Bearer {access_token}
   ```

3. **Create Playlist**
   ```
   POST https://api.spotify.com/v1/users/{user_id}/playlists
   Authorization: Bearer {access_token}
   Body: { "name": "Playlist Name", "public": true }
   ```

4. **Add Tracks to Playlist**
   ```
   POST https://api.spotify.com/v1/playlists/{playlist_id}/tracks
   Authorization: Bearer {access_token}
   Body: { "uris": ["spotify:track:id1", "spotify:track:id2"] }
   ```

## Error Handling

### Error Types

1. **OAuth Errors**: User denies permission, invalid credentials
2. **API Errors**: Rate limiting, invalid track ID, network failures
3. **Token Errors**: Expired token, invalid refresh token
4. **Validation Errors**: Invalid Spotify URL format

### Error Messages

```typescript
const ERROR_MESSAGES = {
  OAUTH_DENIED: "Spotify connection was cancelled. Please try again to use Now Playing.",
  OAUTH_FAILED: "Failed to connect to Spotify. Please try again.",
  NO_TRACK_PLAYING: "No track currently playing. Try pasting a Spotify URL instead.",
  INVALID_URL: "Invalid Spotify URL. Please paste a valid track, album, or playlist link.",
  RATE_LIMITED: "Too many requests. Please try again in a few minutes.",
  NETWORK_ERROR: "Connection failed. Please check your internet connection.",
  TOKEN_EXPIRED: "Your Spotify session expired. Please reconnect.",
  PLAYLIST_FAILED: "Failed to create playlist. Please try again."
};
```

## Testing Strategy

### Unit Tests

- Spotify URL validation
- Token refresh logic
- Track data parsing
- Error handling

### Integration Tests

- OAuth flow (mocked)
- API calls (mocked)
- Token storage/retrieval
- Playlist creation

### E2E Tests

- Complete response submission flow
- Now Playing feature
- Playlist builder
- Token refresh on expiry

## Environment Variables

Required in `.env`:

```bash
# Spotify API Credentials
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# For production
# VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/spotify/callback
```

## Security Considerations

1. **Token Storage**: Store tokens in Supabase auth metadata (server-side)
2. **Client Secret**: Never expose in client code; use Supabase Edge Functions for token exchange
3. **HTTPS**: Require HTTPS in production for OAuth redirect
4. **Scope Limitation**: Request only necessary Spotify scopes
5. **Token Rotation**: Implement automatic token refresh
6. **Rate Limiting**: Implement client-side rate limiting to avoid API abuse

## Performance Considerations

1. **Lazy Loading**: Load Spotify SDK only when needed
2. **Caching**: Cache track metadata to reduce API calls
3. **Debouncing**: Debounce URL input validation
4. **Optimistic UI**: Show loading states during API calls
5. **Image Optimization**: Use appropriate album art sizes (80x80 for cards)

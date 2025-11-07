# 🎵 How Spotify Responses Work

## Overview

Spotify responses allow members to share music tracks as their response to prompts. Instead of writing text, they share a Spotify track that represents their answer.

---

## 📊 Data Flow

### 1. Prompt Creation (Curator)

```
Curator creates prompt → Selects "Spotify" response type → Prompt saved with response_type = 'SPOTIFY'
```

**What happens:**
- Curator clicks "Add Prompt" in "This Week" tab
- Selects the Spotify (🎵) response type option
- Writes the prompt question
- Prompt is saved to database with `response_type: 'SPOTIFY'`

**Database:**
```sql
INSERT INTO prompts (space_id, week_number, question, response_type)
VALUES ('space-id', 1, 'What song represents your week?', 'SPOTIFY');
```

---

### 2. Response Submission (Member)

```
Member sees Spotify prompt → Connects Spotify (if needed) → Shares track → Track data saved
```

**Step-by-step:**

#### A. Member Opens Prompt
- Sees prompt with 🎵 Spotify badge
- SpaceDashboard checks: `prompt.response_type === 'SPOTIFY'`
- Renders `<SpotifyResponse>` component instead of text input

#### B. Connect Spotify (First Time Only)
- Member clicks "Connect Spotify"
- OAuth flow starts via `initiateSpotifyAuth()`
- Redirects to Spotify authorization page
- User approves permissions
- Redirects back to `/auth/spotify/callback`
- Tokens saved to user metadata in Supabase

**Tokens stored:**
```json
{
  "spotify": {
    "accessToken": "BQD...",
    "refreshToken": "AQD...",
    "expiresAt": "2024-01-15T10:30:00Z"
  }
}
```

#### C. Share Track (Two Options)

**Option 1: Now Playing**
- Member clicks "Now Playing" button
- `getCurrentlyPlaying()` calls Spotify API
- Gets currently playing track
- Displays track preview

**Option 2: Paste URL**
- Member pastes Spotify track URL
- `getTrackByUrl()` extracts track ID
- Calls Spotify API to get track details
- Displays track preview

#### D. Submit Response
- Member clicks "Submit"
- Track metadata saved to database

**Database:**
```sql
INSERT INTO responses (
  prompt_id,
  user_id,
  content,           -- JSON: {trackId, trackName, artistName, albumName, duration}
  music_url,         -- Spotify track URL
  image_url,         -- Album art URL
  is_draft
) VALUES (
  'prompt-id',
  'user-id',
  '{"trackId":"3n3Ppam7vgaVa1iaRUc9Lp","trackName":"Mr. Brightside","artistName":"The Killers","albumName":"Hot Fuss","duration":222394}',
  'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
  'https://i.scdn.co/image/ab67616d0000b273...',
  false
);
```

---

### 3. Response Display (All Members)

```
Member views responses → System checks music_url → Renders SpotifyTrackCard
```

**How it works:**

#### In "My Responses" Tab
```typescript
// SpaceDashboard.tsx checks each response
{response.music_url ? (
  // This is a Spotify response - show track card
  <SpotifyTrackCard
    track={{
      id: trackData.trackId,
      name: trackData.trackName,
      artist: trackData.artistName,
      album: trackData.albumName,
      albumArt: response.image_url,
      duration: trackData.duration,
      url: response.music_url,
    }}
  />
) : (
  // Regular text response
  <p>{response.content}</p>
)}
```

**Visual Result:**
```
╔═══════════════════════════════════════════════════════╗
║  [Album Art]  Mr. Brightside                         ║
║               The Killers                             ║
║               Hot Fuss                                ║
║               3:42                                    ║
║               [Open in Spotify →]                    ║
╚═══════════════════════════════════════════════════════╝
```

---

### 4. Playlist Building (Curator)

```
Week ends → Curator reviews → Builds playlist → Playlist URL saved to newsletter
```

**Step-by-step:**

#### A. Curator Opens Review Tab
- System loads all Spotify responses for the week
- Calls `getWeekSpotifyResponses(spaceId, weekNumber)`
- Filters for prompts with `response_type = 'SPOTIFY'`
- Gets all non-draft responses with `music_url`

**API Call:**
```typescript
const spotifyResponses = await getWeekSpotifyResponses(spaceId, weekNumber);
// Returns: [{trackId, trackName, artistName, albumName, spotifyUrl, albumArtUrl, duration}, ...]
```

#### B. Build Playlist
- Curator clicks "Build Playlist" button
- `PlaylistBuilder` component:
  1. Checks curator is connected to Spotify
  2. Creates new playlist via `createPlaylist()`
  3. Adds all tracks via `addTracksToPlaylist()`
  4. Returns playlist URL

**Spotify API Calls:**
```typescript
// 1. Create playlist
POST https://api.spotify.com/v1/users/{user_id}/playlists
Body: {
  name: "Monogram - Space Name - Week 1",
  description: "Curated by members of Space Name",
  public: true
}

// 2. Add tracks
POST https://api.spotify.com/v1/playlists/{playlist_id}/tracks
Body: {
  uris: ["spotify:track:3n3Ppam7vgaVa1iaRUc9Lp", ...]
}
```

#### C. Save Playlist URL
- Playlist URL saved to state
- When curator publishes week, URL saved to newsletter

**Database:**
```sql
INSERT INTO newsletters (space_id, week_number, playlist_url, status)
VALUES ('space-id', 1, 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', 'DRAFT');
```

---

## 🔄 Token Management

### Auto-Refresh Flow

Spotify access tokens expire after 1 hour. The system automatically refreshes them:

```typescript
// Before any Spotify API call
const tokens = await getSpotifyTokens(userId);

if (new Date(tokens.expiresAt) <= new Date()) {
  // Token expired - refresh it
  const newTokens = await refreshSpotifyToken(tokens.refreshToken);
  await saveSpotifyTokens(userId, newTokens);
}

// Now make API call with fresh token
```

**User never sees this happening** - it's completely transparent.

---

## 🎨 UI Components

### SpotifyResponse Component
**Purpose:** Input interface for sharing tracks  
**Location:** Shown when responding to Spotify prompts  
**Features:**
- Connect Spotify button
- "Now Playing" button
- URL input field
- Track preview
- Submit/Cancel actions

### SpotifyTrackCard Component
**Purpose:** Display track in retro terminal style  
**Location:** My Responses tab, Archive (future)  
**Features:**
- ASCII box frame (╔═╗║╚╝)
- Album art (80x80px)
- Track name, artist, album
- Duration display
- "Open in Spotify" link
- Typewriter animation (optional)
- Blinking cursor effect

### PlaylistBuilder Component
**Purpose:** Compile week's tracks into playlist  
**Location:** Review & Publish tab (curator only)  
**Features:**
- Track count display
- Member participation stats
- "Build Playlist" button
- Progress indicator
- Playlist URL with link
- Error handling

### SpotifyConnect Component
**Purpose:** OAuth connection management  
**Location:** Inside SpotifyResponse  
**Features:**
- Connection status
- "Connect Spotify" button
- User's Spotify username when connected
- Disconnect option

---

## 🗄️ Database Schema

### Responses Table
```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id),
  user_id UUID REFERENCES users(id),
  content TEXT,              -- For Spotify: JSON with track metadata
  music_url TEXT,            -- Spotify track URL (NULL for text responses)
  image_url TEXT,            -- Album art URL (NULL for text responses)
  is_draft BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Prompts Table
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  space_id UUID REFERENCES spaces(id),
  week_number INTEGER,
  question TEXT,
  response_type response_type,  -- ENUM: 'TEXT', 'IMAGE', 'SPOTIFY'
  is_published BOOLEAN,
  created_at TIMESTAMPTZ
);
```

### Newsletters Table
```sql
CREATE TABLE newsletters (
  id UUID PRIMARY KEY,
  space_id UUID REFERENCES spaces(id),
  week_number INTEGER,
  playlist_url TEXT,         -- Spotify playlist URL (NULL if no Spotify responses)
  status TEXT,               -- 'DRAFT', 'SENT'
  created_at TIMESTAMPTZ
);
```

### Users Metadata (Supabase Auth)
```json
{
  "spotify": {
    "accessToken": "BQD...",
    "refreshToken": "AQD...",
    "expiresAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔍 How to Verify It's Working

### 1. Check Response Type
```typescript
console.log(prompt.response_type); // Should be 'SPOTIFY'
```

### 2. Check Response Data
```typescript
console.log(response.music_url); // Should be Spotify URL
console.log(response.image_url); // Should be album art URL
console.log(JSON.parse(response.content)); // Should be track metadata
```

### 3. Check Component Rendering
```typescript
// In SpaceDashboard.tsx
{response.music_url ? (
  <SpotifyTrackCard ... /> // ✅ Should render this for Spotify responses
) : (
  <p>{response.content}</p> // ❌ Not this
)}
```

---

## 🐛 Troubleshooting

### "Showing like ordinary text response"

**Problem:** Spotify responses display as plain text instead of track cards

**Cause:** The `music_url` field is NULL or the conditional rendering isn't working

**Fix:**
1. Check if response has `music_url`:
   ```sql
   SELECT id, music_url, content FROM responses WHERE prompt_id = 'your-prompt-id';
   ```
2. Verify SpotifyTrackCard is imported in SpaceDashboard.tsx
3. Check the conditional: `{response.music_url ? <SpotifyTrackCard /> : <p>text</p>}`

### "Cannot create Spotify prompt"

**Problem:** Error about check constraint violation

**Cause:** Database doesn't have SPOTIFY in response_type enum

**Fix:** Run the migration SQL (see `apply-spotify-migration.md`)

### "Now Playing not working"

**Problem:** Button doesn't fetch current track

**Cause:** User needs to have Spotify open and playing

**Fix:** 
1. Open Spotify app/web player
2. Start playing a track
3. Click "Now Playing" within 30 seconds

---

## 📝 Summary

**Spotify responses work by:**

1. **Storing track metadata as JSON** in the `content` field
2. **Storing Spotify URL** in the `music_url` field  
3. **Storing album art URL** in the `image_url` field
4. **Checking `music_url`** to determine if response is Spotify
5. **Rendering SpotifyTrackCard** when `music_url` exists
6. **Rendering plain text** when `music_url` is NULL

The key is the `music_url` field - if it exists, it's a Spotify response and should render as a track card, not plain text.

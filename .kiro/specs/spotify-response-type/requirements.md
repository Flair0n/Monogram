# Requirements Document

## Introduction

This document outlines the requirements for implementing a Spotify Response Type feature in the Monogram journaling application. This feature allows users to respond to prompts with Spotify tracks, either by pasting URLs or by automatically fetching their currently playing track. Curators can compile all Spotify responses into a shared playlist.

## Glossary

- **Monogram System**: The journaling application that manages spaces, prompts, and responses
- **Spotify Response Type**: A prompt response format that captures Spotify track information
- **Curator**: The designated member who creates prompts for a given week
- **Response**: A user's submission to a prompt
- **Now Playing**: The track currently playing on a user's Spotify account
- **Playlist Builder**: Feature that compiles all Spotify responses into a shared playlist

## Requirements

### Requirement 1: Spotify Response Type Selection

**User Story:** As a curator, I want to create prompts that request Spotify track responses, so that members can share music that resonates with them.

#### Acceptance Criteria

1. WHEN creating a prompt, THE Monogram System SHALL display "Spotify" as a selectable response type alongside "Text" and "Image"
2. WHEN "Spotify" response type is selected, THE Monogram System SHALL save the response_type as "SPOTIFY" in the prompts table
3. WHEN viewing a Spotify-type prompt, THE Monogram System SHALL display a badge indicating "Spotify Response"
4. WHERE a prompt has response_type "SPOTIFY", THE Monogram System SHALL present Spotify-specific input controls to members
5. THE Monogram System SHALL validate that response_type is one of: TEXT, IMAGE, or SPOTIFY

### Requirement 2: Spotify URL Input

**User Story:** As a member, I want to paste a Spotify track URL as my response, so that I can share music without connecting my Spotify account.

#### Acceptance Criteria

1. WHEN responding to a Spotify prompt, THE Monogram System SHALL provide an input field for Spotify URLs
2. WHEN a user pastes a Spotify URL, THE Monogram System SHALL validate the URL format matches Spotify track/album/playlist patterns
3. WHEN a valid Spotify URL is provided, THE Monogram System SHALL extract the track ID from the URL
4. WHEN the track ID is extracted, THE Monogram System SHALL fetch track metadata from Spotify's public API
5. THE Monogram System SHALL display track name, artist, album, and album art in a retro-style preview card

### Requirement 3: Spotify OAuth Integration

**User Story:** As a member, I want to connect my Spotify account, so that I can automatically share my currently playing track.

#### Acceptance Criteria

1. WHEN a user selects "Now Playing" for the first time, THE Monogram System SHALL redirect to Spotify OAuth authorization
2. THE Monogram System SHALL request scopes: user-read-currently-playing, user-read-playback-state, playlist-modify-public, playlist-modify-private
3. WHEN OAuth succeeds, THE Monogram System SHALL store access_token and refresh_token in Supabase user metadata
4. WHEN access_token expires, THE Monogram System SHALL automatically refresh using refresh_token
5. THE Monogram System SHALL handle OAuth errors gracefully with user-friendly messages

### Requirement 4: Now Playing Feature

**User Story:** As a member, I want to automatically capture my currently playing Spotify track, so that I can quickly respond without searching.

#### Acceptance Criteria

1. WHEN a user clicks "Now Playing", THE Monogram System SHALL call GET https://api.spotify.com/v1/me/player/currently-playing
2. WHEN currently-playing data is retrieved, THE Monogram System SHALL extract track name, artist, album, duration, and progress
3. WHEN no track is playing, THE Monogram System SHALL display "No track currently playing. Try pasting a Spotify URL instead."
4. WHEN track data is retrieved, THE Monogram System SHALL populate the response with track_id, name, artist, album, and spotify_url
5. THE Monogram System SHALL display the track in a retro-style card with typewriter animation

### Requirement 5: Retro-Style Display

**User Story:** As a user, I want Spotify responses to match Monogram's retro aesthetic, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Monogram System SHALL display Spotify tracks in a terminal-inspired frame using ASCII box-drawing characters
2. THE Monogram System SHALL use Victor Mono Italic font for track information
3. THE Monogram System SHALL use a monochrome palette (amber #bfa67a on dark gray #2a2a2a)
4. THE Monogram System SHALL display album cover art at 80x80 pixels with a subtle border
5. WHEN track information appears, THE Monogram System SHALL animate text with a typewriter effect using Framer Motion
6. THE Monogram System SHALL display a blinking cursor "_" to simulate terminal typing
7. THE Monogram System SHALL show track progress as "MM:SS / MM:SS" format

### Requirement 6: Response Data Storage

**User Story:** As the system, I want to store Spotify response data, so that it can be retrieved and compiled later.

#### Acceptance Criteria

1. WHEN a Spotify response is submitted, THE Monogram System SHALL save spotify_track_id in the responses table
2. WHEN a Spotify response is submitted, THE Monogram System SHALL save track_name, artist_name, album_name in the content field as JSON
3. WHEN a Spotify response is submitted, THE Monogram System SHALL save spotify_url in the music_url field
4. WHEN a Spotify response is submitted, THE Monogram System SHALL save album_art_url in the image_url field
5. THE Monogram System SHALL timestamp the response with created_at

### Requirement 7: Playlist Builder

**User Story:** As a curator, I want to compile all Spotify responses into a shared playlist, so that members can listen to the week's music together.

#### Acceptance Criteria

1. WHEN viewing the Review & Publish tab, THE Monogram System SHALL display a "Build Playlist" button if any Spotify responses exist
2. WHEN "Build Playlist" is clicked, THE Monogram System SHALL authenticate with the curator's Spotify account
3. WHEN authenticated, THE Monogram System SHALL create a new Spotify playlist named "[Space Name] - Week [N]"
4. WHEN the playlist is created, THE Monogram System SHALL add all Spotify track IDs from responses to the playlist
5. WHEN the playlist is complete, THE Monogram System SHALL save the playlist URL in the newsletters table
6. THE Monogram System SHALL display the playlist URL with a "Open in Spotify" link
7. IF curator is not connected to Spotify, THE Monogram System SHALL prompt them to connect first

### Requirement 8: Token Management

**User Story:** As the system, I want to manage Spotify tokens securely, so that users don't need to re-authenticate frequently.

#### Acceptance Criteria

1. THE Monogram System SHALL store spotify_access_token in Supabase auth.users metadata
2. THE Monogram System SHALL store spotify_refresh_token in Supabase auth.users metadata
3. THE Monogram System SHALL store token_expires_at timestamp in user metadata
4. WHEN access_token is expired, THE Monogram System SHALL automatically refresh using refresh_token
5. WHEN refresh fails, THE Monogram System SHALL prompt user to re-authenticate
6. THE Monogram System SHALL never expose tokens in client-side code or logs

### Requirement 9: Environment Configuration

**User Story:** As a developer, I want to configure Spotify API credentials, so that the integration works across environments.

#### Acceptance Criteria

1. THE Monogram System SHALL read VITE_SPOTIFY_CLIENT_ID from environment variables
2. THE Monogram System SHALL read VITE_SPOTIFY_CLIENT_SECRET from environment variables
3. THE Monogram System SHALL read VITE_SPOTIFY_REDIRECT_URI from environment variables
4. THE Monogram System SHALL validate that all required Spotify environment variables are present on startup
5. THE Monogram System SHALL provide clear error messages if environment variables are missing

### Requirement 10: Error Handling

**User Story:** As a user, I want clear feedback when Spotify integration fails, so that I know how to resolve issues.

#### Acceptance Criteria

1. WHEN Spotify API returns an error, THE Monogram System SHALL display a user-friendly error message
2. WHEN OAuth fails, THE Monogram System SHALL explain the failure and offer to retry
3. WHEN rate limits are hit, THE Monogram System SHALL inform the user to try again later
4. WHEN network errors occur, THE Monogram System SHALL display "Connection failed. Please check your internet."
5. THE Monogram System SHALL log all Spotify API errors for debugging without exposing sensitive data

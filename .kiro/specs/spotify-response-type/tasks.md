# Implementation Plan

- [x] 1. Database and Schema Updates


  - Update Prisma schema to add SPOTIFY to ResponseType enum
  - Create migration to add SPOTIFY value to response_type enum
  - Add playlist_url column to newsletters table
  - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Environment Configuration












  - Add Spotify environment variables to .env.example
  - Document required Spotify App setup in README
  - Add environment variable validation on app startup
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_





-

- [x] 3. Spotify API Client Library




  - [x] 3.1 Create lib/spotify-types.ts with TypeScript interfaces



    - Define SpotifyTokens, SpotifyTrack, CurrentlyPlaying, SpotifyPlaylist interfaces


    - Export error message constants
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 3.2 Create lib/spotify-auth.ts for OAuth management



    - Implement initiateSpotifyAuth() to start OAuth flow
    - Implement handleSpotifyCallback() to exchange code for tokens


    - Implement refreshSpotifyToken() for automatic token refresh
    - Implement getSpotifyTokens() to retrieve tokens from user metadata
    - Implement saveSpotifyTokens() to store tokens in Supabase
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5_


  - [x] 3.3 Create lib/spotify.ts for API calls


    - Implement getCurrentlyPlaying() to fetch now playing track
    - Implement getTrackById() to fetch track details
    - Implement getTrackByUrl() to parse URL and fetch track
    - Implement createPlaylist() to create new Spotify playlist
    - Implement addTracksToPlaylist() to add tracks to playlist
    - Add automatic token refresh on 401 errors
    - _Requirements: 2.2, 2.3, 2.4, 4.1, 4.2, 7.3, 7.4_

- [x] 4. Custom Hooks



  - [x] 4.1 Create hooks/useSpotify.ts


    - Manage Spotify connection state
    - Provide isConnected, connect, disconnect functions
    - Handle token refresh automatically
    - Expose loading and error states
    - _Requirements: 3.1, 3.4, 8.4, 8.5_

- [x] 5. Spotify Response Components




  - [x] 5.1 Create components/SpotifyConnect.tsx


    - Display connection status
    - Show "Connect Spotify" button when disconnected
    - Show Spotify username when connected
    - Handle OAuth redirect
    - Style with retro Monogram aesthetic
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 5.2 Create components/SpotifyTrackCard.tsx


    - Display track in ASCII box frame (╔═╗║╚╝)
    - Show album art (80x80px)
    - Display track name, artist, album
    - Show duration and progress (MM:SS / MM:SS)
    - Implement typewriter animation with Framer Motion
    - Add blinking cursor effect
    - Use Victor Mono Italic font
    - Use amber (#bfa67a) on dark gray (#2a2a2a) palette
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 5.3 Create components/SpotifyResponse.tsx


    - Add input field for Spotify URL
    - Add "Now Playing" button
    - Validate Spotify URL format
    - Fetch and display track preview
    - Handle "Connect Spotify" flow
    - Show error messages
    - Provide submit/cancel actions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 5.4 Create components/PlaylistBuilder.tsx


    - Display "Build Playlist" button
    - Show track count and member participation
    - Handle playlist creation
    - Display progress during creation
    - Show playlist URL with "Open in Spotify" link
    - Handle curator not connected to Spotify
    - Style with retro terminal aesthetic
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 6. Update Prompt Creation UI




  - [x] 6.1 Add "Spotify" option to response type selector in SpaceDashboard


    - Add button with music icon
    - Update promptType state to include "spotify"
    - Update validation to accept SPOTIFY type
    - _Requirements: 1.1, 1.2_

  - [x] 6.2 Update createPrompt API call to support SPOTIFY type


    - Pass responseType: "SPOTIFY" to API
    - _Requirements: 1.2, 1.5_

- [x] 7. Update Response Submission UI




  - [x] 7.1 Update SpaceDashboard to show Spotify input for SPOTIFY prompts


    - Check if prompt.response_type === 'SPOTIFY'
    - Render SpotifyResponse component
    - Handle Spotify response submission
    - _Requirements: 1.4, 2.1, 4.4_

  - [x] 7.2 Update handlePublish to save Spotify data

    - Save track_id, track metadata to responses table
    - Save spotify_url to music_url field
    - Save album_art_url to image_url field
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.3 Display Spotify badge on SPOTIFY type prompts

    - Show music icon badge
    - _Requirements: 1.3_

- [x] 8. Update Review & Publish Tab


  - [x] 8.1 Add PlaylistBuilder component to Review tab


    - Show only if Spotify responses exist
    - Pass week's Spotify responses
    - Handle playlist creation callback
    - _Requirements: 7.1, 7.5_

  - [x] 8.2 Update publishWeek to save playlist URL

    - Save playlist_url to newsletters table
    - _Requirements: 7.5_

- [x] 9. OAuth Callback Route


  - [x] 9.1 Create auth/spotify/callback route



    - Handle OAuth callback
    - Exchange code for tokens
    - Save tokens to user metadata
    - Redirect back to original page
    - Handle errors gracefully
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 10. Response Display Updates

  - [x] 10.1 Update My Responses tab to display Spotify tracks

    - Render SpotifyTrackCard for Spotify responses
    - Show track metadata
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_


  - [x] 10.2 Update Archive tab to display Spotify tracks

    - Render SpotifyTrackCard for archived Spotify responses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 11. Testing and Error Handling
  - [ ]* 11.1 Add error handling for all Spotify API calls
    - Implement user-friendly error messages
    - Log errors for debugging
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 11.2 Test OAuth flow
    - Test successful connection
    - Test denied permission
    - Test token refresh
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 11.3 Test Now Playing feature
    - Test with track playing
    - Test with no track playing
    - Test with Spotify closed
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 11.4 Test Playlist Builder
    - Test with multiple tracks
    - Test with no Spotify responses
    - Test with curator not connected
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 12. Documentation
  - [ ]* 12.1 Update README with Spotify setup instructions
    - Document how to create Spotify App
    - Document required environment variables
    - Document OAuth redirect URI setup
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 12.2 Add inline code comments
    - Document complex Spotify API interactions
    - Explain token refresh logic
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

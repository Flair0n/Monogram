# Spotify Integration Setup Guide

This guide will help you set up Spotify integration for the Monogram app.

## Prerequisites

- A Spotify account (free or premium)
- Access to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"** button
4. Fill in the application details:
   - **App name**: `Monogram` (or your preferred name)
   - **App description**: `Journaling app with music integration`
   - **Website**: `http://localhost:3000` (for development)
   - **Redirect URI**: `http://localhost:3000/auth/spotify/callback`
   - **API/SDKs**: Select **Web API**
5. Accept the **Terms of Service**
6. Click **"Save"**

## Step 2: Get Your Credentials

1. On your app's dashboard, you'll see:
   - **Client ID**: A long string of characters
   - **Client Secret**: Click "Show client secret" to reveal it
2. Copy both values - you'll need them for your `.env` file

## Step 3: Configure Redirect URIs

### For Development

The redirect URI `http://localhost:3000/auth/spotify/callback` should already be added from Step 1.

### For Production

1. In your Spotify app settings, click **"Edit Settings"**
2. Under **"Redirect URIs"**, click **"Add"**
3. Enter your production URL: `https://yourdomain.com/auth/spotify/callback`
4. Click **"Add"**
5. Click **"Save"** at the bottom of the settings page

## Step 4: Add Credentials to Environment Variables

1. Copy `.env.example` to `.env` (if you haven't already)
2. Add your Spotify credentials:

```bash
VITE_SPOTIFY_CLIENT_ID=your_client_id_from_step_2
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_from_step_2
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback
```

3. For production, update the redirect URI:

```bash
VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/spotify/callback
```

## Step 5: Verify Setup

1. Start your development server: `npm run dev`
2. Navigate to a space with a Spotify prompt
3. Click **"Connect Spotify"**
4. You should be redirected to Spotify's authorization page
5. After authorizing, you should be redirected back to Monogram

## OAuth Scopes

The app requests the following Spotify permissions:

- **user-read-currently-playing**: Read your currently playing track
- **user-read-playback-state**: Read your playback state
- **playlist-modify-public**: Create and modify public playlists
- **playlist-modify-private**: Create and modify private playlists

These scopes are configured in the code and don't need to be set in the Spotify dashboard.

## Features Enabled

Once Spotify is connected, users can:

1. **Paste Spotify URLs**: Share any Spotify track, album, or playlist link
2. **Use "Now Playing"**: Automatically capture the currently playing track
3. **View Track Cards**: See track details in a retro-style terminal card
4. **Curator Playlists**: Curators can compile all responses into a shared playlist

## Troubleshooting

### "Invalid redirect URI" Error

**Problem**: Spotify returns an error about invalid redirect URI.

**Solution**:
- Ensure the redirect URI in your `.env` file exactly matches the one in Spotify dashboard
- Include the protocol (`http://` or `https://`)
- Don't include trailing slashes
- Check for typos

### "Invalid client" Error

**Problem**: Authentication fails with "invalid client" error.

**Solution**:
- Double-check your Client ID and Client Secret
- Ensure there are no extra spaces or quotes in your `.env` file
- Try regenerating credentials in Spotify dashboard

### "Insufficient scope" Error

**Problem**: Features don't work after connecting.

**Solution**:
- The user must approve all requested permissions during OAuth
- If denied, disconnect and reconnect Spotify
- Ensure all required scopes are requested in the code

### "No track currently playing" Message

**Problem**: "Now Playing" doesn't work.

**Solution**:
- Ensure Spotify is open and playing a track
- Check that you're logged into the same Spotify account
- Try refreshing the page
- If still not working, try pasting a Spotify URL instead

### Rate Limiting

**Problem**: Spotify API returns rate limit errors.

**Solution**:
- Spotify has rate limits on API calls
- Wait a few minutes before trying again
- Consider implementing caching for track metadata

## Security Best Practices

1. **Never commit `.env` to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation only

2. **Protect Client Secret**
   - Never expose client secret in client-side code
   - Consider using Supabase Edge Functions for token exchange
   - Rotate credentials if accidentally exposed

3. **Use HTTPS in Production**
   - Always use HTTPS for OAuth callbacks in production
   - Update redirect URI to use `https://`

4. **Token Storage**
   - Tokens are stored in Supabase user metadata (server-side)
   - Never store tokens in localStorage or client-side state
   - Tokens are automatically refreshed when expired

## Production Deployment Checklist

Before deploying to production:

- [ ] Create production Spotify app (or update existing)
- [ ] Add production redirect URI to Spotify app settings
- [ ] Update `VITE_SPOTIFY_REDIRECT_URI` in production environment variables
- [ ] Test OAuth flow in production environment
- [ ] Verify "Now Playing" feature works
- [ ] Test playlist creation
- [ ] Monitor for CORS or redirect issues
- [ ] Set up error logging for Spotify API calls

## Support

If you encounter issues not covered in this guide:

1. Check the [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
2. Review the [Spotify Developer Forum](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer)
3. Check the Monogram GitHub issues

## Additional Resources

- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/reference/)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/)
- [Spotify API Rate Limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)

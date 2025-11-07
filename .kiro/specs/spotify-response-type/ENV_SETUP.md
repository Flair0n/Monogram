# Environment Variables Setup

## Required Environment Variables

Add these to your `.env` file:

```bash
# Spotify API Credentials
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# For Production
# VITE_SPOTIFY_REDIRECT_URI=https://monogram-three.vercel.app/auth/spotify/callback
```

## How to Get Spotify Credentials

### Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the details:
   - **App name**: Monogram (or your app name)
   - **App description**: Journaling app with music integration
   - **Redirect URI**: `http://localhost:3000/auth/spotify/callback` (for development)
   - Also add: `https://monogram-three.vercel.app/auth/spotify/callback` (for production)
   - **API/SDKs**: Web API
5. Accept the Terms of Service
6. Click "Save"

### Step 2: Get Your Credentials

1. On your app's dashboard, you'll see:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "Show client secret" and copy this value
2. Add these to your `.env` file

### Step 3: Configure Redirect URIs

1. In your Spotify app settings, click "Edit Settings"
2. Under "Redirect URIs", add:
   - Development: `http://localhost:3000/auth/spotify/callback`
   - Production: `https://monogram-three.vercel.app/auth/spotify/callback`
3. Click "Add"
4. Click "Save" at the bottom

### Step 4: Set Required Scopes

The app will request these scopes during OAuth:
- `user-read-currently-playing` - Read currently playing track
- `user-read-playback-state` - Read playback state
- `playlist-modify-public` - Create and modify public playlists
- `playlist-modify-private` - Create and modify private playlists

These are configured in the code, not in the Spotify dashboard.

## Example .env File

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Spotify
VITE_SPOTIFY_CLIENT_ID=abc123def456ghi789
VITE_SPOTIFY_CLIENT_SECRET=xyz987uvw654rst321
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Other environment variables...
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Client Secret Protection**
   - The client secret should ideally be used server-side only
   - Consider using Supabase Edge Functions for token exchange
   - Never expose client secret in client-side code

3. **Production Setup**
   - Use environment variables in your hosting platform (Vercel, Netlify, etc.)
   - Update redirect URI to your production domain
   - Enable HTTPS for OAuth callbacks

4. **Token Storage**
   - Tokens are stored in Supabase user metadata (server-side)
   - Never store tokens in localStorage or client-side state

## Troubleshooting

### "Invalid redirect URI" error
- Ensure the redirect URI in your `.env` exactly matches the one in Spotify dashboard
- Include the protocol (`http://` or `https://`)
- Don't include trailing slashes

### "Invalid client" error
- Double-check your Client ID and Client Secret
- Ensure there are no extra spaces or quotes
- Regenerate credentials if needed

### "Insufficient scope" error
- The required scopes are requested during OAuth
- User must approve all requested permissions
- If denied, user needs to reconnect and approve

## Testing

To test the Spotify integration:

1. Start your development server: `npm run dev`
2. Navigate to a space with a Spotify prompt
3. Click "Connect Spotify"
4. Authorize the app
5. Try "Now Playing" or paste a Spotify URL
6. Verify track data is displayed correctly

## Production Deployment

Before deploying to production:

1. Update `VITE_SPOTIFY_REDIRECT_URI` to `https://monogram-three.vercel.app/auth/spotify/callback`
2. Ensure the production redirect URI is added to your Spotify app settings
3. Set environment variables in your hosting platform
4. Test OAuth flow in production environment
5. Monitor for any CORS or redirect issues

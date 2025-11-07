# Spotify Response Type Not Visible - Troubleshooting

## Issue: "Spotify response type is no longer seen"

The Spotify button is in the code and should be visible. Here's how to check:

### ✅ Step 1: Verify You're the Curator

The Spotify option (and all prompt creation) is only visible to the **current week's curator**.

**Check:**
1. Go to your space dashboard
2. Look at the top - it should say "Curated by [Your Name]"
3. If it says someone else's name, you won't see the curator panel

**Solution:** 
- Wait for your curator turn, OR
- If you're the space leader, manually assign yourself as curator in Space Settings

---

### ✅ Step 2: Open the Prompt Form

The Spotify button is inside the "Add New Prompt" form.

**Steps:**
1. Scroll to the "Curator Panel" section (green/sage background)
2. Click the **"Add New Prompt"** button
3. The form will expand showing three buttons: **Text**, **Image**, **Spotify**

**If you don't see "Add New Prompt" button:**
- You might have 10 prompts already (max limit)
- You might not be the curator (see Step 1)

---

### ✅ Step 3: Check Browser Console

Open browser DevTools (F12) and check for errors:

```javascript
// Look for errors like:
// - "Music is not defined" (missing import)
// - Component rendering errors
```

---

### ✅ Step 4: Verify Database Migration

If you can see the Spotify button but get an error when creating a prompt:

**Error:** `violates check constraint "prompts_response_type_check"`

**Solution:** Run the database migration (see `apply-spotify-migration.md`)

---

## Quick Visual Check

When you're the curator and click "Add New Prompt", you should see:

```
┌─────────────────────────────────────┐
│ Response Type                       │
│ How should members respond?         │
│                                     │
│ ┌─────┐  ┌─────┐  ┌─────────┐     │
│ │Text │  │Image│  │ Spotify │     │
│ └─────┘  └─────┘  └─────────┘     │
│                                     │
│ Prompt Question                     │
│ ┌─────────────────────────────┐   │
│ │ Enter question...           │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Still Not Seeing It?

### Check 1: Are you on the right tab?
- Go to **"This Week"** tab (not "My Responses" or "Archive")

### Check 2: Refresh the page
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear cache if needed

### Check 3: Check the code
The Spotify button is at line ~885 in `src/pages/SpaceDashboard.tsx`:

```tsx
<Button
  type="button"
  variant={promptType === "spotify" ? "default" : "outline"}
  onClick={() => setPromptType("spotify")}
  className="gap-2"
>
  <Music className="w-4 h-4" />
  Spotify
</Button>
```

### Check 4: Verify imports
Make sure `Music` icon is imported at the top of SpaceDashboard.tsx:

```tsx
import { Music } from "lucide-react";
```

---

## Expected Behavior

**When Spotify is selected:**
1. Button highlights (filled background)
2. Placeholder text changes to: "e.g., Share a song that captures your mood this week"
3. Help text appears: "Members will share a Spotify track URL or use Now Playing"
4. When you save, it creates a prompt with `response_type: 'SPOTIFY'`

---

## Debug Commands

Run these in browser console to check state:

```javascript
// Check if you're the curator
console.log('Current curator:', space?.current_curator_id);
console.log('Your user ID:', user?.id);
console.log('Are you curator?', space?.current_curator_id === user?.id);

// Check prompt form state
console.log('Show prompt form:', showPromptForm);
console.log('Prompt type:', promptType);
```

---

## Contact Points

If none of this works:
1. Check that files were saved after the implementation
2. Restart your dev server
3. Check for TypeScript/build errors in terminal
4. Verify all Spotify files exist in `src/components/` and `src/lib/`

# Apply Spotify Migration - SAFE (No Data Loss)

You're seeing this error because the database doesn't have the SPOTIFY response type yet:

```
Error: new row for relation "prompts" violates check constraint "prompts_response_type_check"
```

## ✅ This Migration is SAFE

- **No data will be lost** - We're only adding a new enum value
- **Existing prompts are preserved** - TEXT and IMAGE prompts remain unchanged
- **Idempotent** - Safe to run multiple times
- **Takes ~5 seconds** to complete

---

## Quick Fix - Run This SQL in Supabase

### Option 1: Full Migration (Recommended)

This includes all newsletter columns needed for the feature.

1. **Go to Supabase Dashboard** → Your Project → **SQL Editor**
2. **Copy the entire contents** of `prisma/migrations/add_spotify_response_type.sql`
3. **Paste and click "Run"**

### Option 2: Minimal Migration (Just Spotify)

If you only want Spotify support right now:

1. **Go to Supabase Dashboard** → Your Project → **SQL Editor**
2. **Copy and paste this SQL** and click "Run":

```sql
-- Add SPOTIFY to response_type enum (SAFE - No data loss)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'SPOTIFY' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'response_type')
    ) THEN
        ALTER TYPE response_type ADD VALUE 'SPOTIFY';
        RAISE NOTICE 'Added SPOTIFY to response_type enum';
    ELSE
        RAISE NOTICE 'SPOTIFY already exists';
    END IF;
END $$;

-- Update constraint to allow SPOTIFY
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_response_type_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_response_type_check 
    CHECK (response_type IN ('TEXT', 'IMAGE', 'SPOTIFY'));

-- Add playlist_url to newsletters
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'playlist_url'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN playlist_url TEXT;
        RAISE NOTICE 'Added playlist_url column';
    END IF;
END $$;
```

3. **Verify it worked** by running:

```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'response_type')
ORDER BY enumsortorder;
```

You should see: `TEXT`, `IMAGE`, `SPOTIFY`

---

## ⚠️ DO NOT Use `prisma db push`

**Warning:** Running `npx prisma db push` will try to recreate the enum and **WILL CAUSE DATA LOSS**.

The SQL migration above is the safe way to add SPOTIFY without affecting existing data.

---

## After Migration

1. ✅ Refresh your app
2. ✅ Try creating a Spotify prompt again
3. ✅ It should work!

The error will be gone and you can start using the Spotify feature immediately.

---

## Troubleshooting

**Still seeing the error?**
- Make sure the SQL ran successfully (check for error messages)
- Refresh your browser completely (Ctrl+Shift+R or Cmd+Shift+R)
- Check that SPOTIFY appears in the enum values query

**Need to rollback?**
```sql
-- Remove SPOTIFY (only if you need to undo)
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_response_type_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_response_type_check 
    CHECK (response_type IN ('TEXT', 'IMAGE'));
-- Note: Can't remove enum values in PostgreSQL without recreating the type
```

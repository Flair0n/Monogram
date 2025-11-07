-- Add Spotify support to Monogram
-- This migration adds SPOTIFY response type and playlist URL storage

-- Check if response_type enum exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'response_type') THEN
        CREATE TYPE response_type AS ENUM ('TEXT', 'IMAGE');
    END IF;
END $$;

-- Add SPOTIFY to response_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'SPOTIFY' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'response_type')
    ) THEN
        ALTER TYPE response_type ADD VALUE 'SPOTIFY';
    END IF;
END $$;

-- Add playlist_url column to newsletters table
ALTER TABLE newsletters 
ADD COLUMN IF NOT EXISTS playlist_url TEXT;

-- Add comment
COMMENT ON COLUMN newsletters.playlist_url IS 'URL to compiled Spotify playlist for the week';

-- Add index for faster playlist lookups
CREATE INDEX IF NOT EXISTS idx_newsletters_playlist_url ON newsletters(playlist_url) WHERE playlist_url IS NOT NULL;

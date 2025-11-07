-- Migration: Add SPOTIFY to response_type enum (SAFE - No Data Loss)
-- This migration safely adds SPOTIFY to the enum without dropping existing data

-- Step 1: Add SPOTIFY to the response_type enum if it doesn't exist
-- This is safe and won't affect existing TEXT/IMAGE values
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
        RAISE NOTICE 'SPOTIFY already exists in response_type enum';
    END IF;
END $$;

-- Step 2: Drop the old check constraint if it exists
-- This is safe - we're just removing a constraint, not data
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_response_type_check;

-- Step 3: Add the updated check constraint to allow SPOTIFY
-- This validates the enum values at the constraint level
ALTER TABLE prompts ADD CONSTRAINT prompts_response_type_check 
    CHECK (response_type IN ('TEXT', 'IMAGE', 'SPOTIFY'));

-- Step 4: Add playlist_url column to newsletters table if it doesn't exist
-- This is safe - just adding a new nullable column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'playlist_url'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN playlist_url TEXT;
        RAISE NOTICE 'Added playlist_url column to newsletters table';
    ELSE
        RAISE NOTICE 'playlist_url column already exists in newsletters table';
    END IF;
END $$;

-- Step 5: Add curator_id column to newsletters if it doesn't exist
-- This is needed for the newsletter feature
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'curator_id'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN curator_id UUID REFERENCES users(id);
        RAISE NOTICE 'Added curator_id column to newsletters table';
    ELSE
        RAISE NOTICE 'curator_id column already exists in newsletters table';
    END IF;
END $$;

-- Step 6: Add title, theme, footer_note columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN title TEXT NOT NULL DEFAULT 'Weekly Newsletter';
        RAISE NOTICE 'Added title column to newsletters table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'theme'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN theme TEXT;
        RAISE NOTICE 'Added theme column to newsletters table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'footer_note'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN footer_note TEXT;
        RAISE NOTICE 'Added footer_note column to newsletters table';
    END IF;
END $$;

-- Step 7: Add status column if it doesn't exist (for newsletter workflow)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'newsletter_status'
    ) THEN
        CREATE TYPE newsletter_status AS ENUM ('DRAFT', 'PUBLISHED');
        RAISE NOTICE 'Created newsletter_status enum';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletters' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE newsletters ADD COLUMN status newsletter_status DEFAULT 'DRAFT';
        RAISE NOTICE 'Added status column to newsletters table';
    END IF;
END $$;

-- Verify the changes
DO $$
DECLARE
    enum_values TEXT;
BEGIN
    SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) INTO enum_values
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'response_type');
    
    RAISE NOTICE 'Current response_type enum values: %', enum_values;
END $$;

-- ================================================
-- MONOGRAM DATABASE SETUP
-- ================================================
-- Run this script in Supabase SQL Editor
-- This creates all necessary tables, policies, and functions
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'FREE' CHECK (role IN ('FREE', 'PREMIUM', 'ADMIN')),
  
  -- Phase 1: Gamification fields
  token_balance INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  total_responses INTEGER NOT NULL DEFAULT 0,
  total_curations INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (access_type IN ('PUBLIC', 'PRIVATE')),
  current_week INTEGER NOT NULL DEFAULT 1,
  current_curator_id UUID REFERENCES users(id),
  
  -- Curator rotation settings
  rotation_type TEXT NOT NULL DEFAULT 'ROUND_ROBIN' CHECK (rotation_type IN ('ROUND_ROBIN', 'MANUAL', 'RANDOM')),
  
  -- Newsletter settings
  publish_day INTEGER NOT NULL DEFAULT 0, -- 0 = Sunday, 6 = Saturday
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'CURATOR', 'ADMIN')),
  
  -- Participation tracking
  weekly_streak INTEGER NOT NULL DEFAULT 0,
  total_submissions INTEGER NOT NULL DEFAULT 0,
  
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_submitted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(space_id, user_id)
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  curator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  
  -- Prompt content
  question TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0, -- Order within the week (1-10)
  
  -- Media attachments
  image_url TEXT,
  music_url TEXT, -- Spotify/Apple Music link
  media_type TEXT CHECK (media_type IN ('IMAGE', 'MUSIC', 'VIDEO')),
  
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(space_id, week_number, "order")
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Response content
  content TEXT NOT NULL,
  image_url TEXT,
  music_url TEXT,
  
  is_draft BOOLEAN NOT NULL DEFAULT true,
  is_selected BOOLEAN NOT NULL DEFAULT false, -- Selected for newsletter
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(prompt_id, user_id)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Display preferences
  theme TEXT NOT NULL DEFAULT 'LIGHT' CHECK (theme IN ('LIGHT', 'DARK', 'SYSTEM')),
  landing_page TEXT NOT NULL DEFAULT 'DASHBOARD' CHECK (landing_page IN ('DASHBOARD', 'LAST_SPACE')),
  profile_visibility TEXT NOT NULL DEFAULT 'SPACES' CHECK (profile_visibility IN ('PUBLIC', 'SPACES', 'PRIVATE')),
  
  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  weekly_reminders BOOLEAN NOT NULL DEFAULT true,
  curator_notifications BOOLEAN NOT NULL DEFAULT true,
  badge_notifications BOOLEAN NOT NULL DEFAULT true,
  
  -- Phase 1: Customization
  active_theme_id UUID,
  typewriter_sound BOOLEAN NOT NULL DEFAULT false,
  custom_css_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_spaces_leader ON spaces(leader_id);
CREATE INDEX IF NOT EXISTS idx_spaces_access ON spaces(access_type);
CREATE INDEX IF NOT EXISTS idx_spaces_current_week ON spaces(current_week);
CREATE INDEX IF NOT EXISTS idx_memberships_space ON memberships(space_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_space ON prompts(space_id);
CREATE INDEX IF NOT EXISTS idx_prompts_week ON prompts(week_number);
CREATE INDEX IF NOT EXISTS idx_prompts_curator ON prompts(curator_id);
CREATE INDEX IF NOT EXISTS idx_prompts_published ON prompts(is_published);
CREATE INDEX IF NOT EXISTS idx_responses_prompt ON responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_draft ON responses(is_draft);
CREATE INDEX IF NOT EXISTS idx_settings_user ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_users_token_balance ON users(token_balance);
CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

DROP POLICY IF EXISTS "Public spaces are viewable by everyone" ON spaces;
DROP POLICY IF EXISTS "Private spaces viewable by members" ON spaces;
DROP POLICY IF EXISTS "Authenticated users can create spaces" ON spaces;
DROP POLICY IF EXISTS "Space admins can update spaces" ON spaces;
DROP POLICY IF EXISTS "Space creators can delete spaces" ON spaces;

DROP POLICY IF EXISTS "Members can view space memberships" ON memberships;
DROP POLICY IF EXISTS "Space admins can add members" ON memberships;
DROP POLICY IF EXISTS "Users can leave spaces" ON memberships;
DROP POLICY IF EXISTS "Space admins can remove members" ON memberships;

DROP POLICY IF EXISTS "Space members can view prompts" ON prompts;
DROP POLICY IF EXISTS "Current curator can create prompts" ON prompts;

DROP POLICY IF EXISTS "Space members can view published responses" ON responses;
DROP POLICY IF EXISTS "Space members can create responses" ON responses;
DROP POLICY IF EXISTS "Users can update own responses" ON responses;
DROP POLICY IF EXISTS "Users can delete own responses" ON responses;

DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON users FOR DELETE USING (auth.uid() = id);

-- Spaces policies
CREATE POLICY "Public spaces are viewable by everyone" ON spaces FOR SELECT USING (access_type = 'Public');
CREATE POLICY "Private spaces viewable by members" ON spaces FOR SELECT USING (
  access_type = 'Private' AND EXISTS (
    SELECT 1 FROM memberships WHERE space_id = spaces.id AND user_id = auth.uid()
  )
);
CREATE POLICY "Authenticated users can create spaces" ON spaces FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Space admins can update spaces" ON spaces FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = spaces.id AND user_id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Space creators can delete spaces" ON spaces FOR DELETE USING (auth.uid() = creator_id);

-- Memberships policies
CREATE POLICY "Members can view space memberships" ON memberships FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships m WHERE m.space_id = memberships.space_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "Space admins can add members" ON memberships FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = memberships.space_id AND user_id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Users can leave spaces" ON memberships FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Space admins can remove members" ON memberships FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = memberships.space_id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Prompts policies
CREATE POLICY "Space members can view prompts" ON prompts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = prompts.space_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Current curator can create prompts" ON prompts FOR INSERT WITH CHECK (
  auth.uid() = curator_id
);

-- Responses policies
CREATE POLICY "Space members can view published responses" ON responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM prompts p
    JOIN memberships m ON m.space_id = p.space_id
    WHERE p.id = responses.prompt_id AND m.user_id = auth.uid()
  ) AND (is_draft = false OR user_id = auth.uid())
);
CREATE POLICY "Space members can create responses" ON responses FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM prompts p
    JOIN memberships m ON m.space_id = p.space_id
    WHERE p.id = prompt_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own responses" ON responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own responses" ON responses FOR DELETE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'free'
  );
  
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_spaces_updated_at ON spaces;
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_responses_updated_at ON responses;
CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STORAGE BUCKETS
-- ================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('badges', 'badges', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for exports
DROP POLICY IF EXISTS "Users can access own exports" ON storage.objects;
DROP POLICY IF EXISTS "Users can create own exports" ON storage.objects;

CREATE POLICY "Users can access own exports" ON storage.objects FOR SELECT USING (
  bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can create own exports" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- DONE
-- ================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Monogram database setup complete!';
  RAISE NOTICE 'Tables created: users, spaces, memberships, prompts, responses, settings';
  RAISE NOTICE 'Storage buckets created: avatars, exports, badges';
  RAISE NOTICE 'RLS policies enabled on all tables';
END $$;

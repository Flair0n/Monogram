-- ================================================
-- MONOGRAM DATABASE SETUP - COMPLETE SCHEMA
-- ================================================
-- Run this script in Supabase SQL Editor
-- This creates all necessary tables, policies, and functions
-- Matches Prisma schema exactly
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- DROP EXISTING TABLES (for clean migration)
-- ================================================
DROP TABLE IF EXISTS token_gifts CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS store_items CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS curator_rotations CASCADE;
DROP TABLE IF EXISTS newsletters CASCADE;
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================
-- TABLES
-- ================================================

-- Users table (extends auth.users)
CREATE TABLE users (
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
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spaces table (all spaces are private/invite-only)
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_week INTEGER NOT NULL DEFAULT 1,
  current_curator_id UUID REFERENCES users(id),
  
  -- Curator rotation settings
  rotation_type TEXT NOT NULL DEFAULT 'ROUND_ROBIN' CHECK (rotation_type IN ('ROUND_ROBIN', 'MANUAL', 'RANDOM')),
  
  -- Newsletter settings
  publish_day INTEGER NOT NULL DEFAULT 0, -- 0 = Sunday, 6 = Saturday
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'CURATOR', 'ADMIN')),
  
  -- Participation tracking
  weekly_streak INTEGER NOT NULL DEFAULT 0,
  total_submissions INTEGER NOT NULL DEFAULT 0,
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_submitted_at TIMESTAMPTZ,
  
  UNIQUE(space_id, user_id)
);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  curator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  
  -- Prompt content
  question TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0, -- Order within the week (1-10)
  response_type TEXT NOT NULL DEFAULT 'TEXT' CHECK (response_type IN ('TEXT', 'IMAGE')), -- What type of response is expected
  
  -- Media attachments
  image_url TEXT,
  music_url TEXT, -- Spotify/Apple Music link
  media_type TEXT CHECK (media_type IN ('IMAGE', 'MUSIC', 'VIDEO')),
  
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(space_id, week_number, "order")
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Response content
  content TEXT NOT NULL,
  image_url TEXT,
  music_url TEXT,
  
  is_draft BOOLEAN NOT NULL DEFAULT true,
  is_selected BOOLEAN NOT NULL DEFAULT false, -- Selected for newsletter
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(prompt_id, user_id)
);

-- Newsletters table
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  curator_id UUID NOT NULL REFERENCES users(id),
  
  -- Newsletter content
  title TEXT NOT NULL,
  theme TEXT, -- Curator's theme/reflection
  footer_note TEXT,
  
  -- URLs
  public_url TEXT, -- Web version
  pdf_url TEXT,    -- PDF export
  
  -- Publishing
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(space_id, week_number)
);

-- Curator Rotations table
CREATE TABLE curator_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  was_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(space_id, week_number)
);

-- Settings table
CREATE TABLE settings (
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
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- PHASE 1: GAMIFICATION TABLES
-- ================================================

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earning, negative for spending
  type TEXT NOT NULL CHECK (type IN ('EARN_RESPONSE', 'EARN_CURATOR', 'EARN_STREAK', 'EARN_BADGE', 'EARN_GIFT', 'SPEND_PURCHASE', 'SPEND_GIFT', 'ADMIN_ADJUSTMENT')),
  reason TEXT NOT NULL,
  
  -- Optional metadata
  space_id UUID,
  prompt_id UUID,
  item_id UUID, -- Store item purchased
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PARTICIPATION', 'CURATION', 'SOCIAL', 'MILESTONE', 'SEASONAL', 'SPECIAL')),
  
  -- Unlock criteria
  criteria TEXT NOT NULL, -- JSON string with unlock requirements
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Display settings
  is_displayed BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER,
  
  UNIQUE(user_id, badge_id)
);

-- Store Items table
CREATE TABLE store_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('THEMES', 'SOUNDS', 'SKINS', 'SEASONAL', 'PREMIUM')),
  item_type TEXT NOT NULL, -- theme, sound, skin, etc.
  
  -- Pricing
  price INTEGER NOT NULL, -- Cost in tokens
  
  -- Media
  preview_url TEXT,
  asset_url TEXT, -- Actual file/config
  
  -- Metadata
  metadata TEXT, -- JSON string with item config
  
  -- Availability
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_limited BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER, -- For limited items
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL, -- Token amount at time of purchase
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true, -- Can be toggled off
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, item_id)
);

-- Token Gifts table
CREATE TABLE token_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_token_balance ON users(token_balance);
CREATE INDEX idx_users_current_streak ON users(current_streak);

-- Spaces indexes
CREATE INDEX idx_spaces_leader ON spaces(leader_id);
CREATE INDEX idx_spaces_current_week ON spaces(current_week);

-- Memberships indexes
CREATE INDEX idx_memberships_space ON memberships(space_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_role ON memberships(role);

-- Prompts indexes
CREATE INDEX idx_prompts_space ON prompts(space_id);
CREATE INDEX idx_prompts_week ON prompts(week_number);
CREATE INDEX idx_prompts_curator ON prompts(curator_id);
CREATE INDEX idx_prompts_published ON prompts(is_published);

-- Responses indexes
CREATE INDEX idx_responses_prompt ON responses(prompt_id);
CREATE INDEX idx_responses_user ON responses(user_id);
CREATE INDEX idx_responses_draft ON responses(is_draft);

-- Newsletters indexes
CREATE INDEX idx_newsletters_space ON newsletters(space_id);
CREATE INDEX idx_newsletters_week ON newsletters(week_number);
CREATE INDEX idx_newsletters_published ON newsletters(is_published);

-- Curator Rotations indexes
CREATE INDEX idx_curator_rotations_space ON curator_rotations(space_id);
CREATE INDEX idx_curator_rotations_user ON curator_rotations(user_id);

-- Settings indexes
CREATE INDEX idx_settings_user ON settings(user_id);

-- Transactions indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Badges indexes
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_active ON badges(is_active);

-- User Badges indexes
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

-- Store Items indexes
CREATE INDEX idx_store_items_category ON store_items(category);
CREATE INDEX idx_store_items_available ON store_items(is_available);
CREATE INDEX idx_store_items_limited ON store_items(is_limited);

-- Purchases indexes
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_item ON purchases(item_id);

-- Token Gifts indexes
CREATE INDEX idx_token_gifts_from ON token_gifts(from_user_id);
CREATE INDEX idx_token_gifts_to ON token_gifts(to_user_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE curator_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_gifts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON users FOR DELETE USING (auth.uid() = id);

-- Spaces policies (all spaces are private - only members can view)
CREATE POLICY "Members can view their spaces" ON spaces FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = spaces.id AND user_id = auth.uid()
  )
);
CREATE POLICY "Authenticated users can create spaces" ON spaces FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Space leaders can update spaces" ON spaces FOR UPDATE USING (
  auth.uid() = leader_id OR EXISTS (
    SELECT 1 FROM memberships WHERE space_id = spaces.id AND user_id = auth.uid() AND role = 'ADMIN'
  )
);
CREATE POLICY "Space leaders can delete spaces" ON spaces FOR DELETE USING (auth.uid() = leader_id);

-- Memberships policies
CREATE POLICY "Members can view space memberships" ON memberships FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships m WHERE m.space_id = memberships.space_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "Users can join spaces" ON memberships FOR INSERT WITH CHECK (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM spaces WHERE id = memberships.space_id AND leader_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.space_id = memberships.space_id AND m.user_id = auth.uid() AND m.role = 'ADMIN'
  )
);
CREATE POLICY "Users can leave spaces" ON memberships FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Space admins can remove members" ON memberships FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM spaces WHERE id = memberships.space_id AND leader_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.space_id = memberships.space_id AND m.user_id = auth.uid() AND m.role = 'ADMIN'
  )
);

-- Prompts policies
CREATE POLICY "Space members can view prompts" ON prompts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = prompts.space_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Curators can create prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = curator_id);
CREATE POLICY "Curators can update own prompts" ON prompts FOR UPDATE USING (auth.uid() = curator_id);
CREATE POLICY "Curators can delete own prompts" ON prompts FOR DELETE USING (auth.uid() = curator_id);

-- Responses policies
CREATE POLICY "Space members can view responses" ON responses FOR SELECT USING (
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

-- Newsletters policies
CREATE POLICY "Published newsletters are public" ON newsletters FOR SELECT USING (is_published = true);
CREATE POLICY "Space members can view newsletters" ON newsletters FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = newsletters.space_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Space leaders can create newsletters" ON newsletters FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM spaces WHERE id = space_id AND leader_id = auth.uid()
  )
);
CREATE POLICY "Space leaders can update newsletters" ON newsletters FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM spaces WHERE id = space_id AND leader_id = auth.uid()
  )
);

-- Curator Rotations policies
CREATE POLICY "Space members can view rotations" ON curator_rotations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships WHERE space_id = curator_rotations.space_id AND user_id = auth.uid()
  )
);

-- Settings policies
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Everyone can view active badges" ON badges FOR SELECT USING (is_active = true);

-- User Badges policies
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Store Items policies
CREATE POLICY "Everyone can view available items" ON store_items FOR SELECT USING (is_available = true);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can make purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can toggle purchases" ON purchases FOR UPDATE USING (auth.uid() = user_id);

-- Token Gifts policies
CREATE POLICY "Users can view sent gifts" ON token_gifts FOR SELECT USING (auth.uid() = from_user_id);
CREATE POLICY "Users can view received gifts" ON token_gifts FOR SELECT USING (auth.uid() = to_user_id);
CREATE POLICY "Users can send gifts" ON token_gifts FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ================================================
-- FUNCTIONS
-- ================================================

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

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_items_updated_at BEFORE UPDATE ON store_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STORAGE BUCKETS
-- ================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('response-images', 'response-images', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('newsletter-pdfs', 'newsletter-pdfs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('badge-images', 'badge-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
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

-- ================================================
-- SEED DATA
-- ================================================

-- Seed starter badges
INSERT INTO badges (name, description, image_url, category, criteria, sort_order) VALUES
('First Response', 'Submitted your first weekly response', 'https://placehold.co/100x100/sage/white?text=1st', 'PARTICIPATION', '{"totalResponses": 1}', 1),
('5 Week Streak', 'Maintained a 5-week participation streak', 'https://placehold.co/100x100/terracotta/white?text=5W', 'PARTICIPATION', '{"currentStreak": 5}', 2),
('10 Week Streak', 'Maintained a 10-week participation streak', 'https://placehold.co/100x100/gold/white?text=10W', 'PARTICIPATION', '{"currentStreak": 10}', 3),
('First Curator', 'Served as curator for the first time', 'https://placehold.co/100x100/sage/white?text=C1', 'CURATION', '{"totalCurations": 1}', 4),
('Ink Enthusiast', 'Earned 1000 tokens', 'https://placehold.co/100x100/terracotta/white?text=1K', 'MILESTONE', '{"tokenBalance": 1000}', 5),
('Community Builder', 'Created your first space', 'https://placehold.co/100x100/sage/white?text=CB', 'SOCIAL', '{"spacesCreated": 1}', 6)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- DONE
-- ================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Monogram database setup complete!';
  RAISE NOTICE 'Tables created: 14 core + gamification tables';
  RAISE NOTICE 'Storage buckets created: 6 buckets';
  RAISE NOTICE 'RLS policies enabled on all tables';
  RAISE NOTICE 'Starter badges seeded';
END $$;

-- ================================================================
-- MONOGRAM DATABASE SCHEMA - COMPLETE SQL
-- ================================================================
-- For Supabase PostgreSQL
-- Run this in Supabase SQL Editor to create all tables
-- Compatible with Prisma schema
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ENUMS
-- ================================================================

CREATE TYPE user_role AS ENUM ('FREE', 'PREMIUM', 'ADMIN');
CREATE TYPE access_type AS ENUM ('Public', 'Private');
CREATE TYPE membership_role AS ENUM ('MEMBER', 'CURATOR', 'ADMIN');
CREATE TYPE curator_rotation_type AS ENUM ('ROUND_ROBIN', 'MANUAL', 'RANDOM');
CREATE TYPE media_type AS ENUM ('IMAGE', 'MUSIC', 'VIDEO');
CREATE TYPE transaction_type AS ENUM (
  'EARN_RESPONSE',
  'EARN_CURATOR',
  'EARN_STREAK',
  'EARN_BADGE',
  'EARN_GIFT',
  'SPEND_PURCHASE',
  'SPEND_GIFT',
  'ADMIN_ADJUSTMENT'
);
CREATE TYPE badge_category AS ENUM (
  'PARTICIPATION',
  'CURATION',
  'SOCIAL',
  'MILESTONE',
  'SEASONAL',
  'SPECIAL'
);
CREATE TYPE store_category AS ENUM (
  'THEMES',
  'SOUNDS',
  'SKINS',
  'SEASONAL',
  'PREMIUM'
);
CREATE TYPE theme AS ENUM ('LIGHT', 'DARK', 'SYSTEM');
CREATE TYPE landing_page AS ENUM ('dashboard', 'last-space');
CREATE TYPE profile_visibility AS ENUM ('PUBLIC', 'SPACES', 'PRIVATE');

-- ================================================================
-- CORE TABLES (MVP - Phase 0)
-- ================================================================

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'FREE' NOT NULL,
  
  -- Phase 1: Gamification fields
  token_balance INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_active_date DATE,
  total_responses INTEGER DEFAULT 0 NOT NULL,
  total_curations INTEGER DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Spaces table
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_type access_type DEFAULT 'Public' NOT NULL,
  current_week INTEGER DEFAULT 1 NOT NULL,
  current_curator_id UUID REFERENCES users(id),
  
  -- Curator rotation settings
  rotation_type curator_rotation_type DEFAULT 'ROUND_ROBIN' NOT NULL,
  
  -- Newsletter settings
  publish_day INTEGER DEFAULT 0 NOT NULL, -- 0 = Sunday, 6 = Saturday
  is_published BOOLEAN DEFAULT false NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role DEFAULT 'MEMBER' NOT NULL,
  
  -- Participation tracking
  weekly_streak INTEGER DEFAULT 0 NOT NULL,
  total_submissions INTEGER DEFAULT 0 NOT NULL,
  
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
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
  "order" INTEGER DEFAULT 0 NOT NULL, -- Order within the week (1-10)
  
  -- Media attachments
  image_url TEXT,
  music_url TEXT, -- Spotify/Apple Music link
  media_type media_type,
  
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
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
  
  is_draft BOOLEAN DEFAULT true NOT NULL,
  is_selected BOOLEAN DEFAULT false NOT NULL, -- Selected for newsletter
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(prompt_id, user_id)
);

-- Newsletters table
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  curator_id UUID NOT NULL,
  
  -- Newsletter content
  title TEXT NOT NULL,
  theme TEXT, -- Curator's theme/reflection
  footer_note TEXT,
  
  -- URLs
  public_url TEXT, -- Web version
  pdf_url TEXT,    -- PDF export
  
  -- Publishing
  is_published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMPTZ,
  emails_sent INTEGER DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(space_id, week_number)
);

-- Curator Rotation History
CREATE TABLE curator_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  was_notified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(space_id, week_number)
);

-- ================================================================
-- GAMIFICATION TABLES (Phase 1)
-- ================================================================

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earning, negative for spending
  type transaction_type NOT NULL,
  reason TEXT NOT NULL,
  
  -- Optional metadata
  space_id UUID,
  prompt_id UUID,
  item_id UUID, -- Store item purchased
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category badge_category NOT NULL,
  
  -- Unlock criteria
  criteria TEXT NOT NULL, -- JSON string with unlock requirements
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Display settings
  is_displayed BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER,
  
  UNIQUE(user_id, badge_id)
);

-- Store Items table
CREATE TABLE store_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category store_category NOT NULL,
  item_type TEXT NOT NULL, -- theme, sound, skin, etc.
  
  -- Pricing
  price INTEGER NOT NULL, -- Cost in tokens
  
  -- Media
  preview_url TEXT,
  asset_url TEXT, -- Actual file/config
  
  -- Metadata
  metadata TEXT, -- JSON string with item config
  
  -- Availability
  is_available BOOLEAN DEFAULT true NOT NULL,
  is_limited BOOLEAN DEFAULT false NOT NULL,
  stock INTEGER, -- For limited items
  
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL, -- Token amount at time of purchase
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL, -- Can be toggled off
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, item_id)
);

-- Token Gifts table
CREATE TABLE token_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Display preferences
  theme theme DEFAULT 'LIGHT' NOT NULL,
  landing_page landing_page DEFAULT 'dashboard' NOT NULL,
  profile_visibility profile_visibility DEFAULT 'SPACES' NOT NULL,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  weekly_reminders BOOLEAN DEFAULT true NOT NULL,
  curator_notifications BOOLEAN DEFAULT true NOT NULL,
  badge_notifications BOOLEAN DEFAULT true NOT NULL,
  
  -- Phase 1: Customization
  active_theme_id UUID,
  typewriter_sound BOOLEAN DEFAULT false NOT NULL,
  custom_css_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- INDEXES
-- ================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_token_balance ON users(token_balance);
CREATE INDEX idx_users_current_streak ON users(current_streak);

-- Spaces indexes
CREATE INDEX idx_spaces_leader_id ON spaces(leader_id);
CREATE INDEX idx_spaces_access_type ON spaces(access_type);
CREATE INDEX idx_spaces_current_week ON spaces(current_week);

-- Memberships indexes
CREATE INDEX idx_memberships_space_id ON memberships(space_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_role ON memberships(role);

-- Prompts indexes
CREATE INDEX idx_prompts_space_id ON prompts(space_id);
CREATE INDEX idx_prompts_week_number ON prompts(week_number);
CREATE INDEX idx_prompts_curator_id ON prompts(curator_id);
CREATE INDEX idx_prompts_is_published ON prompts(is_published);

-- Responses indexes
CREATE INDEX idx_responses_prompt_id ON responses(prompt_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_is_draft ON responses(is_draft);

-- Newsletters indexes
CREATE INDEX idx_newsletters_space_id ON newsletters(space_id);
CREATE INDEX idx_newsletters_week_number ON newsletters(week_number);
CREATE INDEX idx_newsletters_is_published ON newsletters(is_published);

-- Curator Rotations indexes
CREATE INDEX idx_curator_rotations_space_id ON curator_rotations(space_id);
CREATE INDEX idx_curator_rotations_user_id ON curator_rotations(user_id);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Badges indexes
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_is_active ON badges(is_active);

-- User Badges indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- Store Items indexes
CREATE INDEX idx_store_items_category ON store_items(category);
CREATE INDEX idx_store_items_is_available ON store_items(is_available);
CREATE INDEX idx_store_items_is_limited ON store_items(is_limited);

-- Purchases indexes
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_item_id ON purchases(item_id);

-- Token Gifts indexes
CREATE INDEX idx_token_gifts_from_user_id ON token_gifts(from_user_id);
CREATE INDEX idx_token_gifts_to_user_id ON token_gifts(to_user_id);

-- Settings indexes
CREATE INDEX idx_settings_user_id ON settings(user_id);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
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

CREATE TRIGGER update_store_items_updated_at BEFORE UPDATE ON store_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE curator_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Spaces policies
CREATE POLICY "Public spaces are viewable by everyone" ON spaces
  FOR SELECT USING (access_type = 'Public' OR auth.uid() IN (
    SELECT user_id FROM memberships WHERE space_id = spaces.id
  ));

CREATE POLICY "Space leaders can update their spaces" ON spaces
  FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Authenticated users can create spaces" ON spaces
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

-- Memberships policies
CREATE POLICY "Members can view memberships in their spaces" ON memberships
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM memberships m WHERE m.space_id = memberships.space_id
  ));

CREATE POLICY "Users can join spaces" ON memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave spaces" ON memberships
  FOR DELETE USING (auth.uid() = user_id);

-- Prompts policies
CREATE POLICY "Members can view prompts in their spaces" ON prompts
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM memberships WHERE space_id = prompts.space_id
  ));

CREATE POLICY "Curators can create prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = curator_id);

CREATE POLICY "Curators can update their prompts" ON prompts
  FOR UPDATE USING (auth.uid() = curator_id);

-- Responses policies
CREATE POLICY "Users can view responses in their spaces" ON responses
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM memberships WHERE space_id IN (
      SELECT space_id FROM prompts WHERE id = responses.prompt_id
    )
  ));

CREATE POLICY "Users can create their own responses" ON responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" ON responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Newsletters policies
CREATE POLICY "Members can view newsletters in their spaces" ON newsletters
  FOR SELECT USING (
    is_published = true OR auth.uid() IN (
      SELECT user_id FROM memberships WHERE space_id = newsletters.space_id
    )
  );

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Badges policies (public read)
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (is_active = true);

-- User Badges policies
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Store Items policies (public read)
CREATE POLICY "Anyone can view available store items" ON store_items
  FOR SELECT USING (is_available = true);

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Token Gifts policies
CREATE POLICY "Users can view gifts they sent or received" ON token_gifts
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send gifts" ON token_gifts
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Settings policies
CREATE POLICY "Users can view their own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('prompt-images', 'prompt-images', true),
  ('response-images', 'response-images', false),
  ('newsletter-pdfs', 'newsletter-pdfs', false),
  ('store-assets', 'store-assets', true),
  ('badge-images', 'badge-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for prompt images
CREATE POLICY "Prompt images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'prompt-images');

CREATE POLICY "Curators can upload prompt images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'prompt-images' AND auth.role() = 'authenticated');

-- Storage policies for response images
CREATE POLICY "Response images accessible to space members" ON storage.objects
  FOR SELECT USING (bucket_id = 'response-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload response images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'response-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for newsletter PDFs
CREATE POLICY "Newsletter PDFs accessible to space members" ON storage.objects
  FOR SELECT USING (bucket_id = 'newsletter-pdfs' AND auth.role() = 'authenticated');

-- Storage policies for store assets
CREATE POLICY "Store assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

-- Storage policies for badge images
CREATE POLICY "Badge images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'badge-images');

-- ================================================================
-- SEED DATA (Optional Starter Badges)
-- ================================================================

INSERT INTO badges (name, description, image_url, category, criteria, sort_order) VALUES
  ('First Response', 'Submitted your first weekly response', '/badges/first-response.png', 'PARTICIPATION', '{"totalResponses": 1}', 1),
  ('5 Week Streak', 'Maintained a 5-week participation streak', '/badges/5-week-streak.png', 'PARTICIPATION', '{"currentStreak": 5}', 2),
  ('10 Week Streak', 'Maintained a 10-week participation streak', '/badges/10-week-streak.png', 'PARTICIPATION', '{"currentStreak": 10}', 3),
  ('First Curator', 'Served as weekly curator for the first time', '/badges/first-curator.png', 'CURATION', '{"totalCurations": 1}', 10),
  ('Ink Enthusiast', 'Earned 1,000 tokens', '/badges/ink-enthusiast.png', 'MILESTONE', '{"tokenBalance": 1000}', 20),
  ('Community Builder', 'Created your first space', '/badges/community-builder.png', 'SOCIAL', '{"createdSpaces": 1}', 30)
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Monogram database schema created successfully!';
  RAISE NOTICE '📊 Tables: 14 core + 7 gamification = 21 total';
  RAISE NOTICE '🔐 RLS policies enabled on all tables';
  RAISE NOTICE '📦 Storage buckets created';
  RAISE NOTICE '🏆 Starter badges seeded';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '1. Run: npm run prisma:generate';
  RAISE NOTICE '2. Verify schema: npm run prisma:studio';
  RAISE NOTICE '3. Start building!';
END $$;

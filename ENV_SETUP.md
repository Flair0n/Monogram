# Monogram - Environment Setup Guide

## Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials:**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to Settings > API
   - Copy `Project URL` → `VITE_SUPABASE_URL`
   - Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

3. **Update `.env.local`** with your credentials

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Files

- **`.env.example`** - Template with all available variables (commit to git)
- **`.env.local`** - Local development config (never commit)
- **`.env.production`** - Production config template (never commit actual values)

## Supabase Database Setup

### 1. Create Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'Public' CHECK (access_type IN ('Public', 'Private')),
  current_week INTEGER NOT NULL DEFAULT 1,
  current_curator_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'curator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  curator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  landing_page TEXT NOT NULL DEFAULT 'dashboard' CHECK (landing_page IN ('dashboard', 'last-space')),
  profile_visibility TEXT NOT NULL DEFAULT 'spaces' CHECK (profile_visibility IN ('public', 'spaces', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_spaces_creator ON spaces(creator_id);
CREATE INDEX idx_memberships_space ON memberships(space_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_prompts_space ON prompts(space_id);
CREATE INDEX idx_responses_prompt ON responses(prompt_id);
CREATE INDEX idx_responses_user ON responses(user_id);
CREATE INDEX idx_settings_user ON settings(user_id);
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

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
```

### 3. Create Storage Buckets

```sql
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('badges', 'badges', true);

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

-- Storage policies for exports
CREATE POLICY "Users can access own exports" ON storage.objects FOR SELECT USING (
  bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can create own exports" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Create Database Functions

```sql
-- Function to handle user creation
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

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Type Generation

Generate TypeScript types from your database:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Generate types
supabase gen types typescript --local > src/types/database.types.ts
```

## Security Checklist

- [ ] Never commit `.env.local` or `.env.production` with real credentials
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
- [ ] Enable RLS on all tables
- [ ] Test RLS policies thoroughly
- [ ] Use environment variables for all sensitive data
- [ ] Enable Supabase Auth email confirmation in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable Supabase audit logs
- [ ] Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **"Missing VITE_SUPABASE_URL"**: Check that `.env.local` exists and variables are set
2. **RLS errors**: Verify policies are created and user is authenticated
3. **CORS errors**: Add your domain to `CORS_ALLOWED_ORIGINS`
4. **Type errors**: Run type generation command after schema changes

### Debug Mode

Enable debug logging:

```bash
VITE_DEBUG=true npm run dev
```

## Next Steps

1. Set up authentication UI
2. Implement API routes for spaces, prompts, responses
3. Configure email templates
4. Set up analytics (optional)
5. Deploy to production (Vercel, Netlify, etc.)
6. Configure custom domain
7. Set up monitoring

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

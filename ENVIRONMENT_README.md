# Monogram Environment Setup

Complete environment configuration has been created for the Monogram MVP.

## 📁 Files Created

- **`.env.example`** - Template with all variables and comprehensive documentation
- **`.env.local`** - Local development configuration (update with your credentials)
- **`.env.production`** - Production configuration template
- **`ENV_SETUP.md`** - Detailed setup guide with database schema and security checklist
- **`src/config/env.ts`** - Type-safe environment variable access
- **`src/lib/supabase.ts`** - Supabase client configuration with database types
- **`src/lib/api.ts`** - API request utilities with authentication
- **`src/lib/storage.ts`** - File upload/download utilities for Supabase Storage
- **`src/vite-env.d.ts`** - TypeScript definitions for environment variables
- **`supabase/schema.sql`** - Complete database schema with RLS policies

## 🚀 Quick Start

1. **Copy environment template:**

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. **Get Supabase credentials:**

   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project → Settings → API
   - Copy credentials to `.env.local`

3. **Install dependencies:**

   ```powershell
   npm install
   ```

4. **Set up database:**

   - Go to Supabase SQL Editor
   - Run the contents of `supabase/schema.sql`

5. **Start development:**
   ```powershell
   npm run dev
   ```

## 📋 What's Included

### Environment Variables

- ✅ Supabase URL and keys (anon + service role)
- ✅ Application URLs (dev + production)
- ✅ JWT secrets and CORS configuration
- ✅ Email service integration (Resend, Postmark, SendGrid)
- ✅ File storage buckets
- ✅ Analytics (Plausible, Sentry)
- ✅ Feature flags
- ✅ Rate limiting and quotas

### Database Schema

- ✅ Users table (extends auth.users)
- ✅ Spaces, memberships, prompts, responses
- ✅ Settings with theme and notification preferences
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for timestamps
- ✅ Storage buckets (avatars, exports, badges)

### Type Safety

- ✅ TypeScript definitions for all env variables
- ✅ Database type generation support
- ✅ Type-safe API client
- ✅ Storage utilities with validation

### Security

- ✅ Only `VITE_` prefixed variables exposed to frontend
- ✅ Service role key server-side only
- ✅ RLS policies on all tables
- ✅ CORS configuration
- ✅ File upload validation

## 📖 Documentation

See **`ENV_SETUP.md`** for:

- Complete setup instructions
- Database schema details
- RLS policy explanations
- Storage bucket configuration
- Security checklist
- Troubleshooting guide

## ⚙️ Configuration

Import environment variables in your code:

```typescript
import { supabase, app, features, storage } from "@/config/env";

// Use Supabase
console.log(supabase.url);

// Check feature flags
if (features.analytics) {
  // Initialize analytics
}

// Access storage buckets
const avatarBucket = storage.buckets.avatars;
```

## 🔐 Security Notes

- ⚠️ Never commit `.env.local` or `.env.production` with real credentials
- ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
- ⚠️ All tables have RLS enabled
- ⚠️ Run `npm audit` regularly for security vulnerabilities

## 📦 Next Steps

1. Update `.env.local` with your Supabase credentials
2. Run the database schema in Supabase SQL Editor
3. Test authentication flow
4. Implement API routes for spaces, prompts, and responses
5. Configure email templates (optional)
6. Set up analytics (optional)
7. Deploy to production

For detailed instructions, see `ENV_SETUP.md`.

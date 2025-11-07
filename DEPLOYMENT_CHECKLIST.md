# 🚀 Monogram Deployment Checklist

## Pre-Deployment (Do This Now)

### 1. Run Database Migration

- [ ] Open Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `supabase/migrations/001_complete_schema.sql`
- [ ] Paste and execute
- [ ] Verify success message appears

### 2. Verify Database Setup

- [ ] Run `npx prisma studio`
- [ ] Check that 14 tables exist:
  - [ ] users
  - [ ] spaces
  - [ ] memberships
  - [ ] prompts
  - [ ] responses
  - [ ] newsletters
  - [ ] curator_rotations
  - [ ] settings
  - [ ] transactions
  - [ ] badges (should have 6 seeded badges)
  - [ ] user_badges
  - [ ] store_items
  - [ ] purchases
  - [ ] token_gifts

### 3. Verify Storage Buckets

- [ ] Go to Supabase Dashboard → Storage
- [ ] Check that 6 buckets exist:
  - [ ] avatars (public)
  - [ ] prompt-images (public)
  - [ ] response-images (private)
  - [ ] newsletter-pdfs (private)
  - [ ] store-assets (public)
  - [ ] badge-images (public)

### 4. Test Space Creation

- [ ] Start dev server: `npm run dev`
- [ ] Sign up for a new test account
- [ ] Create a new space with:
  - [ ] Name: "Test Space"
  - [ ] Description: "Testing space creation"
  - [ ] Access Type: Public
  - [ ] Rotation: Round Robin
  - [ ] Publish Day: Sunday
- [ ] Verify space appears in dashboard
- [ ] Open Prisma Studio and verify:
  - [ ] Space record exists in `spaces` table
  - [ ] Membership record exists in `memberships` table with role='ADMIN'
  - [ ] Both have correct user_id

### 5. Test Basic Flows

- [ ] Log out and log back in
- [ ] Navigate to space dashboard
- [ ] Check that space details load correctly
- [ ] Verify no console errors

## Post-Deployment Verification

### Database Health

- [ ] All tables have correct structure
- [ ] RLS policies are active
- [ ] Indexes are in place
- [ ] Triggers are working (updated_at)

### Authentication

- [ ] Sign up creates user profile
- [ ] Login works correctly
- [ ] Session persists on refresh
- [ ] Logout works correctly

### Space Management

- [ ] Can create spaces
- [ ] Sp
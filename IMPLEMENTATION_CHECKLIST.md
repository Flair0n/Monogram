# 🚀 Monogram Implementation Checklist

Complete roadmap for building Monogram with the new schema.

---

## ✅ Database Setup (Complete)

- [x] Prisma schema designed for MVP + Phase 1
- [x] SQL migration file created
- [x] API helper functions written
- [x] Documentation generated

**Next Steps:**

1. Add Supabase credentials to `.env.local`
2. Run `npm run prisma:generate` to generate Prisma Client
3. Run migration in Supabase SQL Editor (`supabase/migrations/001_complete_schema.sql`)
4. Uncomment type exports in `src/lib/prisma.ts`

---

## 📋 MVP (Phase 0) Implementation

### 1. Authentication & Onboarding ⏳

**Files to Create:**

- [ ] `src/hooks/useAuth.ts` - Auth context and hooks
- [ ] `src/components/OnboardingFlow.tsx` - Initial setup flow
- [ ] `src/components/ProfileSetup.tsx` - Name, avatar selection

**Key Features:**

- [ ] Magic link login via Supabase Auth
- [ ] Persistent session management
- [ ] Display name and avatar setup
- [ ] Auto-create user row via trigger (already in SQL)

**API Usage:**

```typescript
import { supabase } from "@/lib/supabase";

// Sign in with magic link
await supabase.auth.signInWithOtp({ email });

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Update profile
await prisma.user.update({
  where: { id: user.id },
  data: { name, avatarUrl },
});
```

---

### 2. Space Management ⏳

**Files to Create:**

- [ ] `src/components/CreateSpaceModal.tsx` - Space creation dialog
- [ ] `src/components/SpaceCard.tsx` - Space preview card
- [ ] `src/components/SpaceSettings.tsx` - Space configuration
- [ ] `src/components/JoinSpaceDialog.tsx` - Join via invite

**Key Features:**

- [ ] Create space with name, description, access type
- [ ] Invite members (email or link)
- [ ] Configure curator rotation type
- [ ] Set weekly publish day
- [ ] Leader can override curator

**API Usage:**

```typescript
import { createSpace, getUserSpaces } from "@/lib/monogram-api";

// Create space
const space = await createSpace({
  name: "Book Club",
  description: "Monthly reads",
  leaderId: userId,
  accessType: "PUBLIC",
  rotationType: "ROUND_ROBIN",
});

// Get user's spaces
const spaces = await getUserSpaces(userId);
```

---

### 3. Weekly Curation System ⏳

**Files to Create:**

- [ ] `src/components/CuratorDashboard.tsx` - Curator interface
- [ ] `src/components/PromptEditor.tsx` - Create/edit prompts
- [ ] `src/components/PromptPreview.tsx` - Preview before publish
- [ ] `src/components/MediaUpload.tsx` - Image/music attachment

**Key Features:**

- [ ] Auto-assign curator based on rotation type
- [ ] Create up to 10 prompts per week
- [ ] Add images or music links to prompts
- [ ] Draft and publish workflow
- [ ] Leader can edit/override

**API Usage:**

```typescript
import { createPrompts, assignNextCurator } from "@/lib/monogram-api";

// Assign next curator
await assignNextCurator(spaceId);

// Create week's prompts
await createPrompts({
  spaceId,
  curatorId,
  weekNumber: 1,
  prompts: [
    { question: "What inspired you this week?", order: 1 },
    { question: "Share a memorable moment", order: 2, imageUrl: "..." },
  ],
});
```

---

### 4. Member Submissions ⏳

**Files to Create:**

- [ ] `src/components/ResponseForm.tsx` - Response editor
- [ ] `src/components/ResponseCard.tsx` - Display response
- [ ] `src/components/WeeklyPrompts.tsx` - List of prompts
- [ ] `src/components/SubmissionStatus.tsx` - Completion tracker

**Key Features:**

- [ ] View week's prompts
- [ ] Submit text + image + music responses
- [ ] Save as draft or publish
- [ ] Edit until leader publishes newsletter
- [ ] Submission status indicator

**API Usage:**

```typescript
import { submitResponse, getWeekPrompts } from "@/lib/monogram-api";

// Get prompts
const prompts = await getWeekPrompts(spaceId, weekNumber);

// Submit response
await submitResponse({
  promptId,
  userId,
  content: "My reflection...",
  imageUrl: uploadedImageUrl,
  isDraft: false,
});
```

---

### 5. Dashboard ⏳

**Files to Update:**

- [ ] `src/components/Dashboard.tsx` - Main dashboard layout

**Tabs to Implement:**

- [ ] **This Week** - Current prompts and submission status
- [ ] **Responses** - View all member responses (curator/leader only)
- [ ] **Archive** - Past newsletters
- [ ] **Members** - Space member list

**Key Features:**

- [ ] Current week overview
- [ ] Submission progress ("3/5 members submitted")
- [ ] Quick access to active spaces
- [ ] Notifications for curator assignment

---

### 6. Newsletter Generation ⏳

**Files to Create:**

- [ ] `src/components/NewsletterEditor.tsx` - Select responses, add theme
- [ ] `src/components/NewsletterPreview.tsx` - Preview before send
- [ ] `src/components/NewsletterTemplate.tsx` - Email template
- [ ] `src/lib/email.ts` - Email sending logic
- [ ] `src/lib/pdf-generator.ts` - PDF export

**Key Features:**

- [ ] Leader reviews all responses
- [ ] Select responses to include
- [ ] Add curator's theme/reflection
- [ ] Add optional footer note
- [ ] Generate public web version
- [ ] Export as PDF
- [ ] Send via email

**API Usage:**

```typescript
import { generateNewsletter, publishNewsletter } from "@/lib/monogram-api";

// Create newsletter
const newsletter = await generateNewsletter({
  spaceId,
  weekNumber,
  curatorId,
  title: "Week 1: New Beginnings",
  theme: "This week we explored...",
  footerNote: "Thank you for participating!",
});

// Publish
await publishNewsletter(newsletter.id, publicUrl, pdfUrl);
```

---

### 7. Email Integration ⏳

**Setup Resend:**

```bash
npm install resend
```

**Environment Variables:**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@monogram.app
```

**Email Template:**

- [ ] Typewriter aesthetic styling
- [ ] Curator name and theme
- [ ] Selected responses with images/music
- [ ] "View Online" link
- [ ] Unsubscribe footer

---

## 🪙 Phase 1 (Gamification) Implementation

### 1. Token Economy ⏳

**Files to Create:**

- [ ] `src/components/TokenBalance.tsx` - Display balance
- [ ] `src/components/TokenHistory.tsx` - Transaction list
- [ ] `src/hooks/useTokens.ts` - Token operations

**Auto-Award Tokens:**

- [ ] Weekly response submission: **50 tokens**
- [ ] Serving as curator: **100 tokens**
- [ ] 5-week streak: **200 tokens**
- [ ] 10-week streak: **500 tokens**
- [ ] Earning a badge: **100 tokens**

**API Usage:**

```typescript
import { awardTokens } from "@/lib/monogram-api";

// Award tokens automatically
await awardTokens({
  userId,
  amount: 50,
  type: "EARN_RESPONSE",
  reason: "Completed weekly responses",
  spaceId,
});
```

---

### 2. Streaks & Stats ⏳

**Files to Create:**

- [ ] `src/components/StreakDisplay.tsx` - Streak counter with animation
- [ ] `src/components/UserStats.tsx` - Overall statistics
- [ ] `src/lib/cron/update-streaks.ts` - Daily streak calculation

**Supabase Edge Function (Cron):**

```typescript
// Deploy to Supabase Edge Functions
// Run daily at midnight
import { updateUserStreak } from "@/lib/monogram-api";

// Update all active users
for (const user of activeUsers) {
  await updateUserStreak(user.id);
}
```

**Key Features:**

- [ ] Current streak display
- [ ] Longest streak record
- [ ] Total responses count
- [ ] Total curations count
- [ ] Last active date

---

### 3. Badges & Achievements ⏳

**Files to Create:**

- [ ] `src/components/BadgeGrid.tsx` - Display all badges
- [ ] `src/components/BadgeCard.tsx` - Single badge display
- [ ] `src/components/BadgeUnlock.tsx` - Unlock animation/notification
- [ ] `src/lib/badge-checker.ts` - Badge eligibility logic

**Starter Badges:**

- [x] First Response (already seeded)
- [x] 5 Week Streak (already seeded)
- [x] 10 Week Streak (already seeded)
- [x] First Curator (already seeded)
- [x] Ink Enthusiast (already seeded)
- [x] Community Builder (already seeded)

**Badge Check Logic:**

```typescript
import { checkAndAwardBadge } from "@/lib/monogram-api";

// Check after response submission
if (user.totalResponses === 1) {
  await checkAndAwardBadge(userId, "First Response");
}

// Check after streak update
if (user.currentStreak === 5) {
  await checkAndAwardBadge(userId, "5 Week Streak");
}
```

---

### 4. The Atelier (Store) ⏳

**Files to Create:**

- [ ] `src/components/StoreGrid.tsx` - Store item catalog
- [ ] `src/components/StoreItemCard.tsx` - Item preview
- [ ] `src/components/PurchaseModal.tsx` - Confirmation dialog
- [ ] `src/components/MyPurchases.tsx` - Owned items

**Store Items to Create:**

- [ ] **Themes:** Dark Mode, Sepia, Mint, Rose
- [ ] **Sounds:** Typewriter clicks, soft chimes
- [ ] **Skins:** Custom fonts, alternative layouts

**API Usage:**

```typescript
import { purchaseItem } from "@/lib/monogram-api";

// Purchase item
await purchaseItem(userId, itemId);

// Get user's purchases
const purchases = await prisma.purchase.findMany({
  where: { userId },
  include: { item: true },
});
```

---

### 5. Profile Shelf ⏳

**Files to Create:**

- [ ] `src/components/ProfilePage.tsx` - Public profile
- [ ] `src/components/BadgeShelf.tsx` - Display earned badges
- [ ] `src/components/ThemeSelector.tsx` - Select active theme

**Key Features:**

- [ ] Display name, avatar, join date
- [ ] Token balance
- [ ] Current streak
- [ ] Earned badges (customizable order)
- [ ] Active theme preview
- [ ] Profile visibility settings

---

### 6. Token Gifting ⏳

**Files to Create:**

- [ ] `src/components/GiftTokenModal.tsx` - Send gift interface
- [ ] `src/components/GiftHistory.tsx` - Sent/received gifts

**API Usage:**

```typescript
import { sendTokenGift } from "@/lib/monogram-api";

// Send gift
await sendTokenGift({
  fromUserId,
  toUserId,
  amount: 100,
  message: "Great response this week!",
});
```

---

### 7. Leaderboards ⏳

**Files to Create:**

- [ ] `src/components/GlobalLeaderboard.tsx` - Platform-wide leaders
- [ ] `src/components/SpaceLeaderboard.tsx` - Space-specific leaders

**Leaderboard Types:**

- [ ] Top by tokens
- [ ] Top by current streak
- [ ] Top by total responses
- [ ] Space top contributors

**API Usage:**

```typescript
import {
  getTokenLeaderboard,
  getStreakLeaderboard,
  getSpaceLeaderboard,
} from "@/lib/monogram-api";

// Global leaderboards
const tokenLeaders = await getTokenLeaderboard(10);
const streakLeaders = await getStreakLeaderboard(10);

// Space leaderboard
const spaceLeaders = await getSpaceLeaderboard(spaceId, 10);
```

---

## 🎨 UI/UX Enhancements

### Components to Polish:

- [ ] Loading states for all async operations
- [ ] Error boundaries and error messages
- [ ] Empty states ("No responses yet")
- [ ] Success notifications/toasts
- [ ] Confirmation dialogs for destructive actions
- [ ] Skeleton loaders during data fetch

### Animations:

- [ ] Badge unlock celebration
- [ ] Token counter increment animation
- [ ] Streak flame animation
- [ ] Newsletter card transitions
- [ ] Modal enter/exit animations

---

## 🔒 Security & Permissions

### Row Level Security (RLS):

- [x] Already configured in SQL migration
- [ ] Test policies with different user roles
- [ ] Verify cascade deletes work correctly

### Client-Side Guards:

- [ ] Redirect non-members from private spaces
- [ ] Hide curator tools from non-curators
- [ ] Disable editing after newsletter published
- [ ] Check token balance before purchases

---

## 📊 Analytics & Monitoring

### Optional Integrations:

- [ ] Plausible Analytics (privacy-friendly)
- [ ] Sentry for error tracking
- [ ] Supabase Realtime for live updates
- [ ] PostHog for product analytics

---

## 🚀 Deployment Checklist

### Before Launch:

- [ ] Run full Prisma migration on production database
- [ ] Set up Supabase Edge Functions for cron jobs
- [ ] Configure Resend/SendGrid for emails
- [ ] Set up Supabase Storage buckets
- [ ] Deploy to Vercel/Netlify
- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Test authentication flow end-to-end
- [ ] Test newsletter generation and delivery
- [ ] Seed initial badges and store items
- [ ] Create demo space for onboarding

### Post-Launch:

- [ ] Monitor error rates
- [ ] Track user signups
- [ ] Monitor email delivery rates
- [ ] Collect user feedback
- [ ] Plan Phase 2 features

---

## 📚 Documentation to Write

- [ ] User guide (how to create spaces, submit responses)
- [ ] Curator guide (how to set prompts, curate newsletter)
- [ ] Leader guide (space management, member roles)
- [ ] API documentation for developers
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 🎯 Key Metrics to Track

### MVP Success Metrics:

- [ ] User signups
- [ ] Spaces created
- [ ] Weekly response rate
- [ ] Newsletter delivery rate
- [ ] User retention (week-over-week)

### Phase 1 Success Metrics:

- [ ] Token transactions per user
- [ ] Badge unlock rate
- [ ] Store purchase conversion rate
- [ ] Average streak length
- [ ] Gifting activity

---

## 🛠️ Useful Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema changes
npm run prisma:push

# Create migration
npm run prisma:migrate

# Format schema
npm run prisma:format

# Reset database (CAUTION)
npm run prisma:migrate reset

# Seed database
npm run prisma:seed
```

---

## 💡 Tips & Best Practices

1. **Use Transactions**: Always use `prisma.$transaction()` for multi-step operations (tokens + records)
2. **Optimistic Updates**: Update UI immediately, rollback on error
3. **Caching**: Use React Query or SWR for data fetching
4. **Type Safety**: Leverage Prisma's generated types
5. **Error Handling**: Always catch and display user-friendly errors
6. **Performance**: Add indexes for frequently queried fields (already done)
7. **Testing**: Write integration tests for critical flows
8. **Backup**: Regular database backups via Supabase

---

## 🎉 Next Immediate Steps

1. **Add Supabase credentials to `.env.local`**

   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"
   ```

2. **Generate Prisma Client**

   ```bash
   npm run prisma:generate
   ```

3. **Run SQL migration in Supabase**

   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_complete_schema.sql`
   - Execute

4. **Uncomment type exports in `src/lib/prisma.ts`**

5. **Start building authentication flow**

---

**You're ready to build Monogram! 🚀**

All database infrastructure is in place. Focus on implementing one feature at a time, starting with authentication and space creation.

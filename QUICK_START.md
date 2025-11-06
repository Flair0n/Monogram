# 🎯 Monogram Schema - Quick Start Guide

**TL;DR:** Complete database schema ready for MVP + Phase 1. Follow 5 steps to get started.

---

## 📦 What You Got

```
✅ prisma/schema.prisma             - Full database schema (14 models)
✅ supabase/migrations/...sql       - SQL migration with RLS policies
✅ src/lib/monogram-api.ts          - Ready-to-use API functions
✅ SCHEMA_DESIGN.md                 - Complete documentation
✅ IMPLEMENTATION_CHECKLIST.md      - Build roadmap
✅ DATABASE_RELATIONSHIPS.md        - Visual diagrams
✅ SCHEMA_SUMMARY.md                - Overview & stats
```

---

## 🚀 5-Minute Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize (~2 minutes)

### Step 2: Get Credentials

1. Go to **Project Settings → Database**
2. Copy **Connection string** (Transaction mode)
3. Replace `[YOUR-PASSWORD]` with your database password

### Step 3: Update .env.local

```env
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

### Step 4: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 5: Run SQL Migration

1. Open **Supabase Dashboard → SQL Editor**
2. Copy **entire** contents of `supabase/migrations/001_complete_schema.sql`
3. Paste and click **Run**
4. Wait for success message

### Step 6: Uncomment Types

In `src/lib/prisma.ts`, uncomment lines 31-32:

```typescript
export type {
  User,
  Space,
  Membership,
  Prompt,
  Response,
  Settings,
} from "@prisma/client";
export {
  UserRole,
  AccessType,
  MembershipRole,
  Theme,
  LandingPage,
  ProfileVisibility,
} from "@prisma/client";
```

---

## ✅ Verify Setup

```bash
# Open Prisma Studio to browse data
npm run prisma:studio

# Should open http://localhost:5555
# You should see all 14 tables
```

---

## 📊 Schema Overview

### Core Tables (MVP)

```
users          - User accounts + gamification stats
spaces         - Groups/communities
memberships    - User-space relationships
prompts        - Weekly prompts (1-10 per week)
responses      - Member submissions
newsletters    - Published weekly letters
curator_rotations - Curator history
```

### Gamification Tables (Phase 1)

```
transactions   - Token earning/spending log
badges         - Achievement definitions
user_badges    - Earned badges per user
store_items    - Atelier store catalog
purchases      - User purchases
token_gifts    - Peer-to-peer transfers
settings       - User preferences
```

---

## 🎯 Key Features

### MVP (Phase 0)

- ✅ Magic link authentication
- ✅ Create/join spaces
- ✅ Automatic curator rotation (round-robin/manual/random)
- ✅ Up to 10 prompts per week
- ✅ Text + image + music responses
- ✅ Newsletter generation (email + PDF + web)
- ✅ Archive of past newsletters

### Phase 1 (Gamification)

- ✅ Token economy (earn/spend)
- ✅ Participation streaks
- ✅ Achievement badges
- ✅ The Atelier store (themes, sounds, skins)
- ✅ Token gifting
- ✅ Leaderboards

---

## 💻 Quick Usage Examples

### Create a Space

```typescript
import { createSpace } from "@/lib/monogram-api";

const space = await createSpace({
  name: "Book Club",
  description: "Monthly book discussions",
  leaderId: userId,
  accessType: "PUBLIC",
  rotationType: "ROUND_ROBIN",
});
```

### Create Prompts

```typescript
import { createPrompts } from "@/lib/monogram-api";

await createPrompts({
  spaceId,
  curatorId,
  weekNumber: 1,
  prompts: [
    { question: "What inspired you this week?", order: 1 },
    { question: "Share a memorable moment", order: 2 },
    // Up to 10 prompts...
  ],
});
```

### Submit Response

```typescript
import { submitResponse } from "@/lib/monogram-api";

await submitResponse({
  promptId,
  userId,
  content: "My reflection...",
  imageUrl: uploadedImageUrl,
  isDraft: false, // Awards 50 tokens!
});
```

### Award Tokens

```typescript
import { awardTokens } from "@/lib/monogram-api";

await awardTokens({
  userId,
  amount: 100,
  type: "EARN_CURATOR",
  reason: "Served as weekly curator",
  spaceId,
});
```

### Purchase Store Item

```typescript
import { purchaseItem } from "@/lib/monogram-api";

await purchaseItem(userId, itemId);
// Automatically deducts tokens and creates transaction
```

---

## 📁 File Structure

```
d:\projects\Monogram\
├── prisma/
│   └── schema.prisma              ← Database schema
├── supabase/
│   └── migrations/
│       └── 001_complete_schema.sql ← SQL migration
├── src/
│   ├── lib/
│   │   ├── prisma.ts              ← Prisma client
│   │   ├── supabase.ts            ← Supabase client
│   │   └── monogram-api.ts        ← Helper functions
│   └── components/
│       ├── Dashboard.tsx          ← Existing dashboard
│       └── ... (to be built)
├── SCHEMA_DESIGN.md               ← Full documentation
├── IMPLEMENTATION_CHECKLIST.md    ← Build roadmap
├── DATABASE_RELATIONSHIPS.md      ← Visual diagrams
└── SCHEMA_SUMMARY.md              ← Overview
```

---

## 🎨 Database Schema Diagram

```
USER (Core)
 ├─> SPACE (creates as leader)
 │    ├─> MEMBERSHIP (many-to-many with users)
 │    ├─> PROMPT (weekly, 1-10 per week)
 │    │    └─> RESPONSE (from members)
 │    ├─> NEWSLETTER (published weekly)
 │    └─> CURATOR_ROTATION (history)
 ├─> SETTINGS (1-to-1)
 │
 └─> Gamification:
      ├─> TRANSACTION (token log)
      ├─> USER_BADGE (earned achievements)
      │    └─> BADGE (definitions)
      ├─> PURCHASE (store items)
      │    └─> STORE_ITEM (catalog)
      └─> TOKEN_GIFT (sent/received)
```

---

## 🔑 Key Concepts

### 1. Curator Rotation

- **ROUND_ROBIN**: Cycles through members in order
- **MANUAL**: Leader assigns each week
- **RANDOM**: Random member each week

### 2. Prompts (1-10 per week)

- Each has `order` field (1-10)
- Can include text, image, or music
- Draft/published workflow

### 3. Token Economy

```
EARN_RESPONSE:  +50 tokens (weekly submission)
EARN_CURATOR:   +100 tokens (serving as curator)
EARN_STREAK:    Bonus tokens (5 weeks: +200, 10 weeks: +500)
EARN_BADGE:     +100 tokens (badge unlock)
```

### 4. Badges

```
First Response    - Submit first weekly response
5 Week Streak     - Maintain 5-week participation
10 Week Streak    - Maintain 10-week participation
First Curator     - Serve as curator
Ink Enthusiast    - Earn 1,000 tokens
Community Builder - Create first space
```

---

## 🎯 Build Roadmap

### Week 1-2: Authentication & Spaces

- [ ] Supabase Auth integration
- [ ] User profile setup
- [ ] Create/join spaces
- [ ] Space dashboard

### Week 3-4: Curation & Responses

- [ ] Curator assignment
- [ ] Prompt creation (1-10)
- [ ] Response submission
- [ ] Draft/publish workflow

### Week 5-6: Newsletter

- [ ] Response curation
- [ ] Email template
- [ ] PDF generation
- [ ] Archive view

### Week 7-8: Gamification

- [ ] Token awards
- [ ] Streak tracking
- [ ] Badge system

### Week 9-10: Store & Polish

- [ ] Store items
- [ ] Purchase flow
- [ ] Leaderboards
- [ ] Final polish

---

## 🧪 Test Data

6 badges already seeded:

- First Response
- 5 Week Streak
- 10 Week Streak
- First Curator
- Ink Enthusiast
- Community Builder

Create test space:

```typescript
import { createSpace } from "@/lib/monogram-api";

const testSpace = await createSpace({
  name: "Test Book Club",
  description: "Testing space",
  leaderId: userId,
  accessType: "PUBLIC",
});
```

---

## 📚 Documentation

- **SCHEMA_DESIGN.md** - Complete schema reference with examples
- **IMPLEMENTATION_CHECKLIST.md** - Detailed build guide with file structure
- **DATABASE_RELATIONSHIPS.md** - Visual diagrams and relationships
- **SCHEMA_SUMMARY.md** - Overview, stats, and best practices

---

## 🆘 Troubleshooting

### "Module has no exported member"

**Cause:** Prisma Client not generated yet  
**Fix:** Run `npm run prisma:generate`

### "Connection refused"

**Cause:** Wrong DATABASE_URL  
**Fix:** Check credentials in .env.local

### "Table does not exist"

**Cause:** SQL migration not run  
**Fix:** Run migration in Supabase SQL Editor

### Type errors in monogram-api.ts

**Cause:** Expected until Prisma Client generated  
**Fix:** Will auto-resolve after `npm run prisma:generate`

---

## 🎉 You're Ready!

All database infrastructure is complete. Start building:

```bash
# 1. Add credentials to .env.local
# 2. Generate Prisma Client
npm run prisma:generate

# 3. Run SQL migration in Supabase Dashboard
# 4. Start building!
npm run dev
```

**Next:** Implement authentication flow (see IMPLEMENTATION_CHECKLIST.md)

---

## 📞 Need Help?

1. Check **IMPLEMENTATION_CHECKLIST.md** for step-by-step guidance
2. Review **SCHEMA_DESIGN.md** for model details
3. Use **DATABASE_RELATIONSHIPS.md** for understanding connections
4. Reference **monogram-api.ts** for code examples

**Happy building! 🚀**

# 🗂️ Monogram Database Schema Design

Complete Prisma schema for **MVP (Phase 0)** and **Phase 1 (Gamification)**.

---

## 📊 Schema Overview

### Core Tables (MVP - Phase 0)

1. **User** - User accounts with gamification tracking
2. **Space** - Groups/communities with curator rotation
3. **Membership** - User-Space relationships with participation stats
4. **Prompt** - Weekly prompts (up to 10 per week) with media
5. **Response** - Member submissions to prompts
6. **Newsletter** - Weekly generated newsletters
7. **CuratorRotation** - Curator assignment history

### Gamification Tables (Phase 1)

8. **Transaction** - Token earning/spending ledger
9. **Badge** - Achievement definitions
10. **UserBadge** - Earned badges per user
11. **StoreItem** - The Atelier store catalog
12. **Purchase** - User purchases from store
13. **TokenGift** - Peer-to-peer token transfers
14. **Settings** - User preferences and customizations

---

## 🎯 Key Features Implemented

### MVP (Phase 0)

#### 1. **Authentication & User Profiles**

```prisma
model User {
  id         String   @id @db.Uuid
  name       String
  email      String   @unique
  avatarUrl  String?
  role       UserRole @default(FREE)
}
```

- ✅ Supabase Auth integration (UUID primary key)
- ✅ Basic profile fields
- ✅ Role-based access (FREE/PREMIUM/ADMIN)

#### 2. **Spaces (Groups)**

```prisma
model Space {
  leaderId         String
  accessType       AccessType
  currentWeek      Int
  currentCuratorId String?
  rotationType     CuratorRotationType
  publishDay       Int
}
```

- ✅ Leader/admin management
- ✅ Public/Private access control
- ✅ Automatic week tracking
- ✅ Curator rotation (round-robin, manual, random)
- ✅ Configurable publish day

#### 3. **Weekly Curation System**

```prisma
model Prompt {
  weekNumber Int
  question   String
  order      Int       // 1-10 prompts per week
  imageUrl   String?
  musicUrl   String?
  mediaType  MediaType?
  isPublished Boolean
}
```

- ✅ Up to 10 prompts per week (via `order` field)
- ✅ Text, image, or music prompts
- ✅ Draft/published states
- ✅ Curator assignment per prompt

#### 4. **Member Submissions**

```prisma
model Response {
  content    String
  imageUrl   String?
  musicUrl   String?
  isDraft    Boolean
  isSelected Boolean  // For newsletter inclusion
}
```

- ✅ Text + image + music support
- ✅ Draft mode
- ✅ Newsletter selection flag
- ✅ Unique constraint (one response per user per prompt)

#### 5. **Newsletter Generation**

```prisma
model Newsletter {
  weekNumber   Int
  title        String
  theme        String?     // Curator's reflection
  footerNote   String?
  publicUrl    String?     // Web version
  pdfUrl       String?     // PDF export
  isPublished  Boolean
  emailsSent   Int
}
```

- ✅ Weekly newsletter per space
- ✅ Curator theme/reflection
- ✅ Public web version
- ✅ PDF export support
- ✅ Email tracking

#### 6. **Roles & Permissions**

```prisma
enum MembershipRole {
  MEMBER   // Submit responses, view newsletters
  CURATOR  // Can be assigned as curator
  ADMIN    // Co-admin of space
}
```

- ✅ Member: Submit responses
- ✅ Curator: Set prompts, view responses
- ✅ Admin: Manage space, override curator
- ✅ Leader: Full control (via Space.leaderId)

#### 7. **Curator Rotation**

```prisma
model CuratorRotation {
  spaceId     String
  userId      String
  weekNumber  Int
  wasNotified Boolean
}
```

- ✅ Rotation history tracking
- ✅ Notification tracking
- ✅ Supports all rotation types

---

### Phase 1 (Gamification)

#### 8. **Token Economy**

```prisma
model User {
  tokenBalance    Int
  currentStreak   Int
  longestStreak   Int
  totalResponses  Int
  totalCurations  Int
}

model Transaction {
  userId  String
  amount  Int  // +/- tokens
  type    TransactionType
  reason  String
}

enum TransactionType {
  EARN_RESPONSE
  EARN_CURATOR
  EARN_STREAK
  EARN_BADGE
  EARN_GIFT
  SPEND_PURCHASE
  SPEND_GIFT
  ADMIN_ADJUSTMENT
}
```

- ✅ Ink Token balance per user
- ✅ Complete transaction ledger
- ✅ Earn tokens for:
  - Weekly submissions (`EARN_RESPONSE`)
  - Serving as curator (`EARN_CURATOR`)
  - Participation streaks (`EARN_STREAK`)
  - Earning badges (`EARN_BADGE`)
  - Receiving gifts (`EARN_GIFT`)

#### 9. **Badges & Achievements**

```prisma
model Badge {
  name        String
  description String
  imageUrl    String
  category    BadgeCategory
  criteria    String  // JSON unlock requirements
}

model UserBadge {
  userId       String
  badgeId      String
  earnedAt     DateTime
  isDisplayed  Boolean
  displayOrder Int?
}

enum BadgeCategory {
  PARTICIPATION  // "5 Weeks Streak"
  CURATION       // "First Curator"
  SOCIAL         // "Ink Enthusiast"
  MILESTONE      // Platform achievements
  SEASONAL       // Limited time events
  SPECIAL        // Unique/rare badges
}
```

- ✅ Collectible achievements
- ✅ Category organization
- ✅ Flexible criteria system (JSON)
- ✅ Profile display customization

#### 10. **The Atelier (Store)**

```prisma
model StoreItem {
  name        String
  description String
  category    StoreCategory
  itemType    String  // theme, sound, skin
  price       Int     // Token cost
  previewUrl  String?
  assetUrl    String?
  metadata    String? // JSON config
  isLimited   Boolean
  stock       Int?
}

model Purchase {
  userId      String
  itemId      String
  pricePaid   Int
  isActive    Boolean  // Can toggle on/off
}

enum StoreCategory {
  THEMES
  SOUNDS
  SKINS
  SEASONAL
  PREMIUM
}
```

- ✅ Token-based store
- ✅ Themes, sounds, visual skins
- ✅ Limited edition items
- ✅ Purchase history
- ✅ Toggle purchased items

#### 11. **Streaks & Stats**

```prisma
model User {
  currentStreak  Int
  longestStreak  Int
  lastActiveDate DateTime?
  totalResponses Int
  totalCurations Int
}

model Membership {
  weeklyStreak      Int
  totalSubmissions  Int
  lastSubmittedAt   DateTime?
}
```

- ✅ Global user stats
- ✅ Per-space participation tracking
- ✅ Automatic streak calculation (via cron)

#### 12. **Token Gifting**

```prisma
model TokenGift {
  fromUserId String
  toUserId   String
  amount     Int
  message    String?
}
```

- ✅ Peer-to-peer transfers
- ✅ Optional gift message
- ✅ Full transaction history

#### 13. **Enhanced Settings**

```prisma
model Settings {
  // Phase 1 additions
  activeThemeId         String?
  typewriterSound       Boolean
  customCssUrl          String?
  curatorNotifications  Boolean
  badgeNotifications    Boolean
}
```

- ✅ Purchased theme activation
- ✅ Sound effects toggle
- ✅ Custom styling
- ✅ Granular notification controls

---

## 🔐 Security & Performance

### Indexes

All foreign keys and frequently queried fields are indexed:

- `@@index([userId])` on all user-related tables
- `@@index([spaceId])` on all space-related tables
- `@@index([weekNumber])` for newsletters/prompts
- `@@index([isPublished])` for draft filtering
- `@@index([tokenBalance])` for leaderboards
- `@@index([currentStreak])` for gamification

### Unique Constraints

- `@@unique([spaceId, userId])` - One membership per user per space
- `@@unique([promptId, userId])` - One response per user per prompt
- `@@unique([spaceId, weekNumber])` - One newsletter per week per space
- `@@unique([userId, badgeId])` - Badges earned once
- `@@unique([userId, itemId])` - Store items purchased once

### Cascade Deletes

- Deleting a Space removes all memberships, prompts, newsletters
- Deleting a User removes all their data except gifts/transactions (for audit trail)
- Deleting a Prompt removes all responses

---

## 🚀 Usage Examples

### Creating a Space with Rotation

```typescript
const space = await prisma.space.create({
  data: {
    name: "Book Club",
    description: "Monthly book discussions",
    leaderId: userId,
    accessType: "PUBLIC",
    rotationType: "ROUND_ROBIN",
    publishDay: 0, // Sunday
  },
});
```

### Adding Prompts for the Week

```typescript
const prompts = await prisma.prompt.createMany({
  data: [
    {
      spaceId: space.id,
      curatorId: curatorId,
      weekNumber: 1,
      question: "What was your favorite chapter?",
      order: 1,
      isPublished: true,
    },
    {
      spaceId: space.id,
      curatorId: curatorId,
      weekNumber: 1,
      question: "Share a quote that resonated with you.",
      order: 2,
      musicUrl: "https://open.spotify.com/...",
      mediaType: "MUSIC",
      isPublished: true,
    },
    // Up to 10 prompts...
  ],
});
```

### Earning Tokens

```typescript
await prisma.$transaction([
  // Add tokens to user
  prisma.user.update({
    where: { id: userId },
    data: {
      tokenBalance: { increment: 50 },
      totalResponses: { increment: 1 },
      currentStreak: { increment: 1 },
    },
  }),
  // Log transaction
  prisma.transaction.create({
    data: {
      userId: userId,
      amount: 50,
      type: "EARN_RESPONSE",
      reason: "Completed weekly responses",
      spaceId: spaceId,
    },
  }),
]);
```

### Awarding a Badge

```typescript
const badge = await prisma.badge.findUnique({
  where: { name: "5 Weeks Streak" },
});

await prisma.$transaction([
  prisma.userBadge.create({
    data: {
      userId: userId,
      badgeId: badge.id,
    },
  }),
  prisma.user.update({
    where: { id: userId },
    data: {
      tokenBalance: { increment: 100 }, // Badge reward
    },
  }),
  prisma.transaction.create({
    data: {
      userId: userId,
      amount: 100,
      type: "EARN_BADGE",
      reason: `Earned badge: ${badge.name}`,
    },
  }),
]);
```

### Store Purchase

```typescript
const item = await prisma.storeItem.findUnique({
  where: { id: itemId },
});

await prisma.$transaction([
  prisma.purchase.create({
    data: {
      userId: userId,
      itemId: itemId,
      pricePaid: item.price,
    },
  }),
  prisma.user.update({
    where: { id: userId },
    data: {
      tokenBalance: { decrement: item.price },
    },
  }),
  prisma.transaction.create({
    data: {
      userId: userId,
      amount: -item.price,
      type: "SPEND_PURCHASE",
      reason: `Purchased: ${item.name}`,
      itemId: itemId,
    },
  }),
]);
```

---

## 📝 Next Steps

1. **Add Supabase Credentials**

   ```bash
   # Update .env.local with your Supabase project details
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres"
   ```

2. **Generate Prisma Client**

   ```bash
   npm run prisma:generate
   ```

3. **Sync Schema to Database**

   ```bash
   # Option 1: Direct push (development)
   npm run prisma:push

   # Option 2: Create migration (production)
   npm run prisma:migrate
   ```

4. **Uncomment Type Exports**
   In `src/lib/prisma.ts`, uncomment the export lines after generation

5. **Seed Initial Data**
   Create badges, store items, and default settings

---

## 🎨 Design Decisions

### Why UUID over Auto-increment?

- ✅ Supabase Auth uses UUIDs
- ✅ Better for distributed systems
- ✅ No sequential ID leakage

### Why Separate Transaction Table?

- ✅ Complete audit trail
- ✅ Token history for users
- ✅ Support refunds/adjustments
- ✅ Analytics on earning patterns

### Why JSON in Badge Criteria?

- ✅ Flexible unlock requirements
- ✅ No schema changes for new badges
- ✅ Example: `{"streak": 5}` or `{"curations": 3, "responses": 15}`

### Why Two URLs for Newsletters?

- ✅ `publicUrl`: Shareable web version (guest access)
- ✅ `pdfUrl`: Downloadable formatted version
- ✅ Different use cases (social vs archive)

### Why Separate Membership Streaks?

- ✅ Track per-space participation
- ✅ Users can be active in some spaces but not others
- ✅ Space-specific leaderboards

---

## 🔄 Migration from Old Schema

The new schema is backward compatible with minor changes:

### Changed Fields

- `Space.creatorId` → `Space.leaderId` (better terminology)
- `Prompt.title` + `content` → `Prompt.question` (clearer purpose)
- Added `Prompt.order` for multiple prompts per week
- Added `Response.isSelected` for newsletter curation

### New Tables

- All Phase 1 tables are additions (no breaking changes)

### Migration Script

```typescript
// No migration needed if starting fresh
// If you have existing data, run:
await prisma.$executeRaw`
  ALTER TABLE spaces RENAME COLUMN creator_id TO leader_id;
  ALTER TABLE prompts ADD COLUMN "order" INTEGER DEFAULT 0;
  ALTER TABLE responses ADD COLUMN is_selected BOOLEAN DEFAULT false;
`;
```

---

## 📚 Additional Resources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/database/prisma)
- [Transaction Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide)

---

**Ready to build Monogram! 🚀**

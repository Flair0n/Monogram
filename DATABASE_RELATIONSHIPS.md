# 🗺️ Monogram Database Relationships

Visual guide to understanding how all tables connect.

---

## 📊 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MONOGRAM DATABASE                        │
│                    MVP + Phase 1 Complete Schema                 │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────┐
                              │   USER   │◄──────────────┐
                              │  (Core)  │               │
                              └────┬─────┘               │
                                   │                     │
                  ┌────────────────┼─────────────────┐   │
                  │                │                 │   │
                  ▼                ▼                 ▼   │
            ┌──────────┐     ┌──────────┐     ┌──────────┐
            │  SPACE   │     │ RESPONSE │     │SETTINGS  │
            │  (Core)  │     │  (Core)  │     │ (Config) │
            └────┬─────┘     └────┬─────┘     └──────────┘
                 │                │
       ┌─────────┼─────────┐      │
       │         │         │      │
       ▼         ▼         ▼      │
  ┌────────┐┌────────┐┌────────┐ │
  │MEMBERSHIP││PROMPT ││CURATOR │ │
  │ (Core) ││ (Core) ││ROTATION│ │
  └────────┘└────────┘└────────┘ │
       │         │         │      │
       │         └─────────┴──────┘
       │
       ▼
  ┌────────────┐
  │ NEWSLETTER │
  │   (Core)   │
  └────────────┘

─────────────────────────────────────────────────────────────────

                      ┌──────────┐
                      │   USER   │
                      │(Extended)│
                      └────┬─────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌────────────┐    ┌────────────┐    ┌────────────┐
  │TRANSACTION │    │ USER_BADGE │    │  PURCHASE  │
  │  (Phase 1) │    │ (Phase 1)  │    │ (Phase 1)  │
  └────────────┘    └─────┬──────┘    └─────┬──────┘
                          │                  │
                          ▼                  ▼
                    ┌────────────┐    ┌────────────┐
                    │   BADGE    │    │ STORE_ITEM │
                    │ (Phase 1)  │    │ (Phase 1)  │
                    └────────────┘    └────────────┘

                    ┌────────────┐
                    │ TOKEN_GIFT │
                    │ (Phase 1)  │
                    └────────────┘
```

---

## 🔗 Detailed Relationships

### Core System (MVP)

#### 1. User → Spaces (One-to-Many)

```
USER ──creates──> SPACE (as leader)
USER ──curates──> SPACE (as current curator)

A user can:
- Create multiple spaces (as leader)
- Be assigned as curator for multiple spaces
- Be a member of multiple spaces
```

#### 2. User → Memberships → Space (Many-to-Many)

```
USER ←──── MEMBERSHIP ────→ SPACE

Properties:
- role: MEMBER | CURATOR | ADMIN
- weeklyStreak: Per-space participation
- totalSubmissions: Responses in this space
```

#### 3. Space → Prompts (One-to-Many)

```
SPACE ──has──> PROMPT (weekly, up to 10)

Each prompt belongs to:
- One space
- One week number
- One curator (who created it)
- Has order (1-10 within week)
```

#### 4. Prompt → Responses (One-to-Many)

```
PROMPT ──receives──> RESPONSE (from members)

Constraints:
- One response per user per prompt
- Can include text + image + music
- Has draft/published state
- Has selected flag (for newsletter)
```

#### 5. Space → Newsletters (One-to-Many)

```
SPACE ──publishes──> NEWSLETTER (weekly)

Constraints:
- One newsletter per week per space
- Links to curator who set prompts
- Contains selected responses
```

#### 6. Space → Curator Rotations (History)

```
SPACE ──tracks──> CURATOR_ROTATION

Records:
- Who was curator each week
- Notification status
- Rotation history for analytics
```

---

### Gamification System (Phase 1)

#### 7. User → Transactions (Audit Trail)

```
USER ──has──> TRANSACTION (token changes)

Types:
- EARN_RESPONSE: +50 tokens per submission
- EARN_CURATOR: +100 tokens per curation
- EARN_STREAK: Bonus tokens for streaks
- EARN_BADGE: +100 tokens per badge
- SPEND_PURCHASE: Store purchases
- SPEND_GIFT: Sending gifts
```

#### 8. User → Badges (Many-to-Many)

```
USER ←──── USER_BADGE ────→ BADGE

Properties:
- earnedAt: When badge was unlocked
- isDisplayed: Show on profile
- displayOrder: Custom ordering
```

#### 9. User → Store Items (Many-to-Many)

```
USER ←──── PURCHASE ────→ STORE_ITEM

Properties:
- pricePaid: Token cost at purchase time
- isActive: Toggle item on/off
- purchasedAt: Purchase timestamp
```

#### 10. User → Token Gifts (Peer-to-Peer)

```
USER ──sends──> TOKEN_GIFT ──to──> USER

Properties:
- amount: Token quantity
- message: Optional gift note
- Creates two transactions (spend + earn)
```

---

## 🔄 Data Flow Examples

### Creating a Space and First Week

```
1. User creates space
   ├─> Creates SPACE record (leader_id = user.id)
   └─> Creates MEMBERSHIP record (role = ADMIN)

2. System assigns first curator
   ├─> Checks rotation_type (ROUND_ROBIN)
   ├─> Selects first eligible member
   ├─> Updates SPACE.current_curator_id
   └─> Creates CURATOR_ROTATION record

3. Curator creates prompts
   ├─> Creates 1-10 PROMPT records
   │   └─> Each with order 1-10
   └─> Sets is_published = true

4. Members submit responses
   ├─> Creates RESPONSE records
   ├─> Awards 50 tokens per response
   │   ├─> Updates USER.token_balance
   │   └─> Creates TRANSACTION record
   └─> Updates MEMBERSHIP.total_submissions
```

### Publishing Newsletter

```
1. Leader reviews responses
   ├─> Queries all RESPONSE for current week
   └─> Marks selected responses (is_selected = true)

2. Leader generates newsletter
   ├─> Creates NEWSLETTER record
   ├─> Generates public web version
   ├─> Generates PDF export
   └─> Sends emails to all members

3. Leader publishes
   ├─> Updates NEWSLETTER.is_published = true
   └─> Updates NEWSLETTER.published_at

4. System prepares next week
   ├─> Increments SPACE.current_week
   ├─> Assigns next curator
   └─> Sends notification to new curator
```

### Earning a Badge

```
1. User submits 5 consecutive weeks
   ├─> Each submission updates USER.last_active_date
   └─> Cron job calculates USER.current_streak

2. Streak reaches 5
   ├─> System checks badge criteria
   └─> Badge "5 Week Streak" matches

3. Badge awarded
   ├─> Creates USER_BADGE record
   ├─> Awards 100 bonus tokens
   │   ├─> Updates USER.token_balance
   │   └─> Creates TRANSACTION (EARN_BADGE)
   └─> Sends notification to user
```

### Making a Store Purchase

```
1. User browses store
   ├─> Queries STORE_ITEM (is_available = true)
   └─> Checks USER.token_balance

2. User purchases theme
   ├─> Validates sufficient tokens
   ├─> Creates PURCHASE record
   ├─> Deducts tokens from USER.token_balance
   ├─> Creates TRANSACTION (SPEND_PURCHASE)
   └─> If limited: Decrements STORE_ITEM.stock

3. User activates theme
   └─> Updates SETTINGS.active_theme_id
```

---

## 🎯 Key Indexes for Performance

### Most Queried Patterns

```sql
-- Get user's spaces
SELECT * FROM spaces
WHERE id IN (
  SELECT space_id FROM memberships WHERE user_id = ?
);
-- Uses: idx_memberships_user_id

-- Get week's prompts
SELECT * FROM prompts
WHERE space_id = ? AND week_number = ? AND is_published = true
ORDER BY order;
-- Uses: idx_prompts_space_id, idx_prompts_week_number

-- Get user's responses for a prompt
SELECT * FROM responses
WHERE prompt_id = ? AND user_id = ?;
-- Uses: unique(prompt_id, user_id)

-- Get token leaderboard
SELECT * FROM users
ORDER BY token_balance DESC
LIMIT 10;
-- Uses: idx_users_token_balance

-- Get user's transactions
SELECT * FROM transactions
WHERE user_id = ?
ORDER BY created_at DESC;
-- Uses: idx_transactions_user_id, idx_transactions_created_at
```

---

## 🔐 RLS Policy Summary

### Access Control Rules

| Table            | SELECT               | INSERT           | UPDATE           | DELETE           |
| ---------------- | -------------------- | ---------------- | ---------------- | ---------------- |
| **users**        | Own profile          | N/A              | Own profile      | N/A              |
| **spaces**       | Public OR member     | Leader creates   | Leader updates   | Leader deletes   |
| **memberships**  | Space members        | User joins       | N/A              | User leaves      |
| **prompts**      | Space members        | Curator creates  | Curator updates  | Curator deletes  |
| **responses**    | Space members        | User creates own | User updates own | User deletes own |
| **newsletters**  | Published OR members | Leader creates   | Leader updates   | Leader deletes   |
| **transactions** | Own only             | System only      | N/A              | N/A              |
| **badges**       | Public               | N/A              | N/A              | N/A              |
| **user_badges**  | Own only             | System only      | N/A              | N/A              |
| **store_items**  | Available items      | Admin only       | Admin only       | Admin only       |
| **purchases**    | Own only             | User purchases   | User toggles     | N/A              |
| **token_gifts**  | Sent/Received        | User sends       | N/A              | N/A              |
| **settings**     | Own only             | User creates     | User updates     | User deletes     |

---

## 📈 Scalability Considerations

### Current Design Supports:

- ✅ **10,000+ users** - UUID primary keys, indexed foreign keys
- ✅ **1,000+ spaces** - Efficient membership queries
- ✅ **100,000+ responses** - Partitionable by space/week
- ✅ **1,000,000+ transactions** - Time-series data with indexes
- ✅ **Real-time updates** - Supabase Realtime subscriptions ready

### Future Optimizations (if needed):

- **Partitioning**: Partition `responses` and `transactions` by date
- **Caching**: Redis for leaderboards and token balances
- **Archiving**: Move old newsletters to cold storage
- **CDN**: Store media files in CDN (already using Supabase Storage)
- **Read Replicas**: For analytics queries

---

## 🧪 Test Data Structure

### Minimal Test Scenario

```
1 Space: "Test Book Club"
├─> 5 Members (1 Leader, 4 Members)
├─> 1 Current Curator
├─> Week 1
│   ├─> 5 Prompts
│   └─> 20 Responses (4 per prompt)
└─> 1 Published Newsletter

Gamification:
├─> 6 Badges (seeded)
├─> 5 Store Items
├─> 100 Transactions (token awards)
└─> 10 User Badges earned
```

### Seed Script Template

```typescript
// Create test space
const space = await createSpace({
  name: "Test Book Club",
  description: "Testing space",
  leaderId: user1.id,
});

// Add members
for (const user of [user2, user3, user4, user5]) {
  await prisma.membership.create({
    data: { spaceId: space.id, userId: user.id },
  });
}

// Create prompts
const prompts = await createPrompts({
  spaceId: space.id,
  curatorId: user2.id,
  weekNumber: 1,
  prompts: Array.from({ length: 5 }, (_, i) => ({
    question: `Test question ${i + 1}`,
    order: i + 1,
  })),
});

// Submit responses
for (const prompt of prompts) {
  for (const user of [user1, user2, user3, user4]) {
    await submitResponse({
      promptId: prompt.id,
      userId: user.id,
      content: `Test response from ${user.name}`,
    });
  }
}
```

---

## 🎓 Learning Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Database Design Patterns](https://www.databasedesignbook.com/)

---

**Ready to build! 🚀**

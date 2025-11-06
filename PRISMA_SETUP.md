# Prisma Setup Guide for Monogram

## Overview

Prisma is configured to work seamlessly with Supabase PostgreSQL. This setup provides:
- Type-safe database queries
- Auto-completion in your IDE
- Automatic schema migrations
- Database introspection

## Quick Start

### 1. Install Dependencies (Already Done)

```powershell
npm install prisma @prisma/client
```

### 2. Configure Database URL

Update your `.env.local` with Supabase credentials:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
```

**Important:** 
- `DATABASE_URL` - Uses connection pooler (port 6543 for Supabase)
- `DIRECT_URL` - Direct connection (port 5432) for migrations

For Supabase, get the connection string from:
Dashboard → Settings → Database → Connection string (Direct connection)

### 3. Generate Prisma Client

```powershell
npm run prisma:generate
```

This creates the Prisma Client based on your schema.

### 4. Sync Schema with Database

**Option A: Push Schema (Recommended for Development)**
```powershell
npm run prisma:push
```

**Option B: Create Migration (Recommended for Production)**
```powershell
npm run prisma:migrate
```

## Using Prisma in Your Code

### Import Prisma Client

```typescript
import { prisma } from '@/lib/prisma';
import type { User, Space } from '@/lib/prisma';
```

### Example Queries

#### Create a Space
```typescript
const space = await prisma.space.create({
  data: {
    name: "Writing Circle",
    description: "A cozy space for writers",
    creatorId: userId,
    accessType: "PUBLIC",
  },
});
```

#### Find User with Relations
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    createdSpaces: true,
    memberships: {
      include: {
        space: true,
      },
    },
    settings: true,
  },
});
```

#### Get Space Members
```typescript
const members = await prisma.membership.findMany({
  where: { spaceId },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
  },
});
```

#### Create Response
```typescript
const response = await prisma.response.create({
  data: {
    promptId,
    userId,
    content: "My reflection for this week...",
    isDraft: false,
  },
});
```

#### Update Settings
```typescript
await prisma.settings.update({
  where: { userId },
  data: {
    theme: "DARK",
    emailNotifications: false,
  },
});
```

## Available Scripts

```powershell
# Generate Prisma Client (run after schema changes)
npm run prisma:generate

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Push schema changes to database (dev)
npm run prisma:push

# Pull schema from existing database
npm run prisma:pull

# Create and run migration (production)
npm run prisma:migrate

# Format schema file
npm run prisma:format
```

## Schema Overview

### Models

- **User** - User accounts (synced with Supabase Auth)
- **Space** - Collaborative writing spaces
- **Membership** - User-Space relationships with roles
- **Prompt** - Weekly writing prompts from curators
- **Response** - User responses to prompts
- **Settings** - User preferences and settings

### Enums

- **UserRole** - FREE, PREMIUM, ADMIN
- **AccessType** - PUBLIC, PRIVATE
- **MembershipRole** - MEMBER, CURATOR, ADMIN
- **Theme** - LIGHT, DARK, SYSTEM
- **LandingPage** - DASHBOARD, LAST_SPACE
- **ProfileVisibility** - PUBLIC, SPACES, PRIVATE

## Working with Supabase

### Sync with Existing Database

If you already ran the Supabase schema SQL:

```powershell
# Pull existing schema into Prisma
npm run prisma:pull

# Then generate client
npm run prisma:generate
```

### Using Both Supabase and Prisma

You can use both together:
- **Supabase Client** - For auth, realtime, storage
- **Prisma** - For type-safe database queries

```typescript
// Authentication with Supabase
const { data: { user } } = await supabase.auth.getUser();

// Database queries with Prisma
const userProfile = await prisma.user.findUnique({
  where: { id: user.id },
});
```

## Prisma Studio

Visual database editor at `http://localhost:5555`:

```powershell
npm run prisma:studio
```

Great for:
- Viewing data
- Editing records
- Testing queries
- Debugging

## Type Safety Benefits

### Auto-completion
```typescript
const space = await prisma.space.create({
  data: {
    // IDE suggests: name, description, creatorId, etc.
  }
});
```

### Type-safe Queries
```typescript
// TypeScript knows the exact shape of the result
const user: User & { createdSpaces: Space[] } = await prisma.user.findUnique({
  where: { id },
  include: { createdSpaces: true },
});
```

### Compile-time Errors
```typescript
// This will error at compile time
await prisma.user.findUnique({
  where: { invalidField: "value" } // ❌ Error
});
```

## Migration Workflow

### Development
```powershell
# Make schema changes in schema.prisma
# Push directly to database
npm run prisma:push
```

### Production
```powershell
# Create migration
npm run prisma:migrate

# Deploy migrations
npx prisma migrate deploy
```

## Best Practices

1. **Always generate after schema changes**
   ```powershell
   npm run prisma:generate
   ```

2. **Use transactions for related operations**
   ```typescript
   await prisma.$transaction([
     prisma.space.create({ data: spaceData }),
     prisma.membership.create({ data: membershipData }),
   ]);
   ```

3. **Select only needed fields**
   ```typescript
   const users = await prisma.user.findMany({
     select: { id: true, name: true, email: true },
   });
   ```

4. **Use pagination for large datasets**
   ```typescript
   const responses = await prisma.response.findMany({
     skip: page * pageSize,
     take: pageSize,
   });
   ```

5. **Handle errors gracefully**
   ```typescript
   try {
     await prisma.user.create({ data });
   } catch (error) {
     if (error.code === 'P2002') {
       // Unique constraint violation
     }
   }
   ```

## Troubleshooting

### "Can't reach database server"
- Check `DATABASE_URL` in `.env.local`
- Verify Supabase project is running
- Check firewall/network settings

### Schema out of sync
```powershell
# Reset and resync
npm run prisma:push --force-reset
```

### Client out of date
```powershell
# Regenerate client
npm run prisma:generate
```

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## Next Steps

1. ✅ Schema is already configured
2. Update `DATABASE_URL` in `.env.local`
3. Run `npm run prisma:generate`
4. Run `npm run prisma:push` to sync with database
5. Start using Prisma in your API routes
6. Test with Prisma Studio

Happy coding! 🚀

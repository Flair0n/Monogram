# Database Migrations

## How to Apply Migrations

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `add_spotify_response_type.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Using psql Command Line

```bash
psql $DATABASE_URL -f prisma/migrations/add_spotify_response_type.sql
```

### Option 3: Using Prisma

If you prefer to use Prisma's migration system:

```bash
# Generate a new migration based on schema changes
npx prisma migrate dev --name add_spotify_response_type

# Or push schema changes directly (for development)
npx prisma db push
```

## Current Migrations

- **add_spotify_response_type.sql** - Adds SPOTIFY to response_type enum and playlist_url to newsletters table

## Verification

After running the migration, verify it worked:

```sql
-- Check response_type enum values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'response_type')
ORDER BY enumsortorder;

-- Should return: TEXT, IMAGE, SPOTIFY

-- Check newsletters table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'newsletters';

-- Should include playlist_url column
```

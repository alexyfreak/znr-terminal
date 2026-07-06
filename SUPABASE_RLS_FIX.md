# Supabase RLS (Row Level Security) Fix for Shablon Creation

## Problem
When trying to create a new shablon (template), you're getting the error: "Shablon yaratishda xatolik" (Error creating shablon).

This is most likely caused by **Row Level Security (RLS) policies** in your Supabase database blocking INSERT operations.

## Solution: Add RLS Policy for Shablons Table

### Option 1: Disable RLS (Quick Fix - NOT RECOMMENDED for production)

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select the `shablons` table
4. Click on **Settings** (gear icon)
5. Toggle **"Enable Row Level Security"** to OFF

⚠️ **Warning**: This makes the table accessible to anyone with your API key. Only use for testing!

### Option 2: Add INSERT Policy (RECOMMENDED)

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Policies**
3. Find the `shablons` table
4. Click **"New Policy"**
5. Choose **"Create a policy from scratch"**
6. Configure the policy:

   **Policy Name**: `Allow authenticated users to insert shablons`
   
   **Target roles**: `authenticated`, `anon` (or just `anon` if you want to allow unauthenticated inserts)
   
   **Command**: `INSERT`
   
   **Policy definition (USING)**:
   ```sql
   true
   ```
   
   **WITH CHECK expression**:
   ```sql
   true
   ```

7. Click **"Save"**

### Option 3: Add Policy for Specific Users

If you want only logged-in users to create shablons:

```sql
-- Policy name: Allow logged-in users to insert shablons
-- Command: INSERT
-- Target roles: authenticated

-- WITH CHECK:
auth.uid() = author_id OR author_id IS NULL
```

This allows:
- Users to create shablons where they are the author
- Creating shablons without an author (for system templates)

## Verify the Fix

1. After adding the policy, rebuild your app:
   ```bash
   npm run build
   ```

2. Open the shablon builder (Ctrl+N)
3. Fill in all fields and click **Publish**
4. It should now work!

## Debug: Check Current Policies

To see existing policies on your `shablons` table:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** → `shablons`
3. Click **"RLS Policies"** tab
4. You should see at least one INSERT policy

## Still Not Working?

Run the app in dev mode to see detailed error logs:

```bash
npm run dev
```

Then try to publish a shablon and check the terminal output for errors starting with `[createShablon]`.

The error will show:
- Error code (e.g., `42501` for RLS policy violation)
- Error message
- Hint on how to fix it

Common error codes:
- **42501**: Permission denied (RLS policy blocking)
- **23502**: NOT NULL constraint violation (missing required field)
- **23505**: Unique constraint violation (duplicate entry)
- **42703**: Column does not exist (schema mismatch)

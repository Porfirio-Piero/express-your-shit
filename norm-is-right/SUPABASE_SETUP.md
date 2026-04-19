# Supabase Setup for Norm Is Always Right

## Quick Start (3 Steps)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project" (free tier)
3. Note your Project URL and Anon Key (Settings → API)

### Step 2: Configure Environment
Edit `.env.local` with your actual credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Create Database Table
In your Supabase project's SQL Editor, run:

```sql
-- Create the table for storing state
CREATE TABLE IF NOT EXISTS norm_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  predictions JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE norm_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (public access for this use case)
CREATE POLICY "Allow all operations" ON norm_state
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert default row
INSERT INTO norm_state (id, predictions, stats)
VALUES ('default', '[]'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
```

## Deploy to Vercel

Add these environment variables in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then redeploy.

## Verification

After setup, your app will:
- ✅ Sync predictions across devices
- ✅ Persist stats permanently
- ✅ Work even if localStorage is cleared

## Migration Notes

- Old Vercel Blob data is not migrated (wasn't working anyway)
- LocalStorage still works as fallback
- Supabase provides reliable cloud sync
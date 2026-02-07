# Supabase Database Setup Guide

This guide will help you set up Supabase for storing video generation records.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name (e.g., "monkey-do")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
5. Click "Create new project"
6. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll need two values:
   - **Project URL**: Found under "Project URL" (looks like `https://xxxxx.supabase.co`)
   - **Service Role Key**: Found under "Project API keys" → "service_role" key (⚠️ Keep this secret!)

## Step 3: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor** (in the left sidebar)
2. Click **New Query**
3. Copy and paste the contents of `server/supabase-setup.sql` into the editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 4: Add Credentials to Your .env File

Add these lines to your `.env` file in the project root:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important Notes:**
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-service-role-key-here` with your actual service role key
- The service role key has full access - never commit it to git!
- Make sure `.env` is in your `.gitignore` file

## Step 5: Verify the Setup

1. Restart your server:
   ```bash
   npm run server
   ```

2. You should see:
   ```
   ✅ Supabase client initialized
   ```

3. Test by making a video generation request:
   ```bash
   curl -X POST http://localhost:3001/api/test-airpods \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Test video"}'
   ```

4. Check the database:
   - Go to Supabase dashboard → **Table Editor**
   - Click on `video_generations` table
   - You should see your new record!

## Step 6: Test the API Endpoints

### Get all videos:
```bash
curl http://localhost:3001/api/videos
```

### Get a specific video by ID:
```bash
curl http://localhost:3001/api/videos/{video-id}
```

### Health check (shows Supabase status):
```bash
curl http://localhost:3001/health
```

## Database Schema

The `video_generations` table stores:

- `id` - UUID (auto-generated)
- `image_path` - Path to source image
- `prompt` - Text prompt used for generation
- `model` - Fal model used (default: minimax-video)
- `video_path` - Local path where video is saved
- `video_url` - Fal API URL for the video
- `duration` - Video duration in seconds (default: 2.5)
- `status` - Generation status (pending, processing, completed, failed)
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

## Troubleshooting

### "Supabase not configured" error
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are in your `.env` file
- Make sure there are no extra spaces or quotes around the values
- Restart your server after adding the variables

### "relation 'video_generations' does not exist"
- Make sure you ran the SQL migration in Step 3
- Check the SQL Editor for any error messages

### "permission denied for table video_generations"
- Make sure you're using the **service_role** key, not the anon key
- Check that RLS policies are set up correctly (the SQL script handles this)

### Can't see data in Table Editor
- Make sure you're looking at the correct project
- Try refreshing the page
- Check that the insert actually succeeded (check server logs)

## Security Notes

- The service role key has full database access - treat it like a password
- Never commit your `.env` file to version control
- In production, consider using environment variables from your hosting platform
- The current setup allows full access - adjust RLS policies for production use

## Next Steps

- Add user authentication if you want to track which user created each video
- Add indexes for any additional query patterns you need
- Set up database backups in Supabase dashboard
- Consider adding a `user_id` column if you add authentication later

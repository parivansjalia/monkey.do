# Testing Guide

## Quick Test (Without Supabase)

If you haven't set up Supabase yet, you can still test the basic video generation:

### 1. Start the Server
```bash
npm run server
```

### 2. Check Health (No Supabase)
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "supabase": "not configured"
}
```

### 3. Test Video Generation
```bash
curl -X POST http://localhost:3001/api/test-airpods \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A smooth animation of the AirPods case"}'
```

This should:
- Generate a video
- Save it to `public/videos/`
- Return a response (but no `recordId` since Supabase isn't configured)

---

## Full Test (With Supabase)

### Step 1: Verify Supabase Connection

1. Make sure your `.env` file has:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Restart your server:
   ```bash
   npm run server
   ```

   Look for: `✅ Supabase client initialized`

3. Check health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```

   Expected:
   ```json
   {
     "status": "ok",
     "supabase": "connected"
   }
   ```

### Step 2: Test Video Generation with Database

Generate a video (this will save to database):
```bash
curl -X POST http://localhost:3001/api/test-airpods \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test video generation"}'
```

**Expected Response:**
```json
{
  "success": true,
  "videoPath": "public/videos/airpods_1234567890.mp4",
  "videoUrl": "https://fal.media/files/...",
  "message": "AirPods image successfully converted to video!",
  "recordId": "uuid-here"
}
```

**Check Server Logs:**
You should see:
```
✅ Saved to database: uuid-here
```

### Step 3: Verify in Supabase Dashboard

1. Go to your Supabase dashboard
2. Click **Table Editor** in the sidebar
3. Click on `video_generations` table
4. You should see your new record with:
   - Image path
   - Prompt
   - Video path and URL
   - Timestamps

### Step 4: Test API Endpoints

#### Get All Videos
```bash
curl http://localhost:3001/api/videos
```

**Expected Response:**
```json
{
  "videos": [
    {
      "id": "uuid",
      "image_path": "public/airpods.jpg",
      "prompt": "Test video generation",
      "model": "fal-ai/minimax-video/image-to-video",
      "video_path": "public/videos/airpods_1234567890.mp4",
      "video_url": "https://fal.media/files/...",
      "duration": 2.5,
      "status": "completed",
      "created_at": "2024-...",
      "updated_at": "2024-..."
    }
  ]
}
```

#### Get Specific Video by ID
```bash
# Replace {id} with the actual UUID from the previous response
curl http://localhost:3001/api/videos/{id}
```

**Expected Response:**
```json
{
  "video": {
    "id": "uuid",
    "image_path": "public/airpods.jpg",
    ...
  }
}
```

### Step 5: Test General Image-to-Video Endpoint

```bash
curl -X POST http://localhost:3001/api/image-to-video \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "public/airpods.jpg",
    "prompt": "Another test video",
    "model": "fal-ai/minimax-video/image-to-video"
  }'
```

This should also save to the database.

---

## Troubleshooting Tests

### Test 1: Check if Supabase is configured
```bash
curl http://localhost:3001/health
```

**If you see `"supabase": "not configured"`:**
- Check your `.env` file exists
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Make sure there are no extra spaces or quotes
- Restart the server

### Test 2: Check database table exists
Go to Supabase → SQL Editor and run:
```sql
SELECT * FROM video_generations LIMIT 1;
```

If you get an error, run the migration from `server/supabase-setup.sql`

### Test 3: Test database connection directly
In Supabase → SQL Editor:
```sql
INSERT INTO video_generations (image_path, video_path, video_url, model, status)
VALUES ('test.jpg', 'test.mp4', 'https://test.com', 'test-model', 'completed')
RETURNING *;
```

If this works, the table is set up correctly.

### Test 4: Check server logs
When you make a request, check the server terminal for:
- `✅ Supabase client initialized` (on startup)
- `✅ Saved to database: uuid` (after video generation)
- Any error messages

---

## Complete Test Script

Save this as `test.sh` and run `chmod +x test.sh && ./test.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Supabase Integration"
echo ""

echo "1. Testing health endpoint..."
curl -s http://localhost:3001/health | jq .
echo ""

echo "2. Generating test video..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/test-airpods \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Automated test video"}')

echo "$RESPONSE" | jq .
echo ""

RECORD_ID=$(echo "$RESPONSE" | jq -r '.recordId')
if [ "$RECORD_ID" != "null" ] && [ -n "$RECORD_ID" ]; then
  echo "✅ Video saved to database with ID: $RECORD_ID"
  echo ""
  
  echo "3. Fetching all videos..."
  curl -s http://localhost:3001/api/videos | jq '.videos | length'
  echo ""
  
  echo "4. Fetching specific video..."
  curl -s http://localhost:3001/api/videos/$RECORD_ID | jq '.video.id'
  echo ""
  
  echo "✅ All tests passed!"
else
  echo "⚠️  No record ID returned - Supabase may not be configured"
fi
```

---

## What to Look For

✅ **Success Indicators:**
- Server shows "Supabase client initialized"
- Health endpoint shows `"supabase": "connected"`
- Video generation returns a `recordId`
- Server logs show "Saved to database"
- Records appear in Supabase Table Editor
- `/api/videos` endpoint returns your records

❌ **Failure Indicators:**
- Health shows `"supabase": "not configured"`
- No `recordId` in response
- Server logs show database errors
- `/api/videos` returns "Supabase not configured"
- 503 errors when accessing video endpoints

# Testing Steps - Verify airpods.jpg and Supabase Storage

## Prerequisites
- ✅ Supabase is set up and credentials are in `.env`
- ✅ SQL migration has been run
- ✅ Server is running

## Step-by-Step Test

### Step 1: Start the Server
```bash
npm run server
```

**Look for:**
```
✅ Supabase client initialized
Server running on http://localhost:3001
```

### Step 2: Generate Video from airpods.jpg
```bash
curl -X POST http://localhost:3001/api/test-airpods \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test video from airpods.jpg"}'
```

**What to check in the response:**
- ✅ `"success": true`
- ✅ `"videoUrl"` contains a URL (should start with `https://fal.media/...`)
- ✅ `"recordId"` is a UUID (not null)

**What to check in server logs:**
- ✅ `Converting airpods.jpg to video...`
- ✅ `Video generated successfully: https://fal.media/...`
- ✅ `✅ Saved to database: [uuid]`

### Step 3: Verify in Supabase Dashboard

1. Go to your Supabase dashboard
2. Click **Table Editor** → `video_generations`
3. Find your latest record (should be at the top)

**Verify these fields:**
- ✅ `image_path` = `"public/airpods.jpg"`
- ✅ `video_url` = URL from Fal (starts with `https://fal.media/...`)
- ✅ `prompt` = `"Test video from airpods.jpg"` (or your custom prompt)
- ✅ `model` = `"fal-ai/minimax-video/image-to-video"`
- ✅ `duration` = `2.5`
- ✅ `status` = `"completed"`
- ✅ `created_at` = current timestamp

### Step 4: Verify via API

**Get all videos:**
```bash
curl http://localhost:3001/api/videos
```

**Check the response:**
- Should include your new record
- `video_url` should match what you saw in Step 2
- `image_path` should be `"public/airpods.jpg"`

**Get specific video by ID:**
```bash
# Replace {recordId} with the UUID from Step 2 response
curl http://localhost:3001/api/videos/{recordId}
```

**Verify:**
- Returns the correct record
- `video_url` matches the Fal URL
- `image_path` is `"public/airpods.jpg"`

### Step 5: Verify the Video URL Works

Copy the `video_url` from Supabase and:
1. Open it in a browser
2. Or test with curl:
   ```bash
   curl -I "https://fal.media/files/..."
   ```
   Should return `200 OK` or redirect to the video

---

## Quick Test Script

Save this and run it:

```bash
#!/bin/bash

echo "🧪 Testing airpods.jpg → Supabase"
echo ""

echo "1. Generating video from airpods.jpg..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/test-airpods \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test verification"}')

echo "$RESPONSE" | jq .

VIDEO_URL=$(echo "$RESPONSE" | jq -r '.videoUrl')
RECORD_ID=$(echo "$RESPONSE" | jq -r '.recordId')

echo ""
echo "2. Checking response..."
if [ "$VIDEO_URL" != "null" ] && [ -n "$VIDEO_URL" ]; then
  echo "✅ Video URL received: $VIDEO_URL"
else
  echo "❌ No video URL in response"
  exit 1
fi

if [ "$RECORD_ID" != "null" ] && [ -n "$RECORD_ID" ]; then
  echo "✅ Record ID received: $RECORD_ID"
else
  echo "❌ No record ID - Supabase may not be configured"
  exit 1
fi

echo ""
echo "3. Fetching record from database..."
DB_RECORD=$(curl -s http://localhost:3001/api/videos/$RECORD_ID)

IMAGE_PATH=$(echo "$DB_RECORD" | jq -r '.video.image_path')
DB_VIDEO_URL=$(echo "$DB_RECORD" | jq -r '.video.video_url')

echo "$DB_RECORD" | jq .

echo ""
echo "4. Verifying data..."
if [ "$IMAGE_PATH" = "public/airpods.jpg" ]; then
  echo "✅ Correct image path: $IMAGE_PATH"
else
  echo "❌ Wrong image path: $IMAGE_PATH (expected: public/airpods.jpg)"
  exit 1
fi

if [ "$DB_VIDEO_URL" = "$VIDEO_URL" ]; then
  echo "✅ Video URL matches: $DB_VIDEO_URL"
else
  echo "❌ Video URL mismatch!"
  echo "   Response: $VIDEO_URL"
  echo "   Database: $DB_VIDEO_URL"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
echo "   Image: $IMAGE_PATH"
echo "   Video URL: $VIDEO_URL"
echo "   Record ID: $RECORD_ID"
```

---

## Expected Results

### ✅ Success Indicators:
- Server logs show "Converting airpods.jpg to video..."
- Response includes a `videoUrl` from Fal
- Response includes a `recordId` UUID
- Supabase record shows `image_path = "public/airpods.jpg"`
- Supabase record shows `video_url` matching the Fal URL
- Video URL is accessible (returns video file)

### ❌ Failure Indicators:
- No `recordId` in response → Supabase not configured
- `image_path` is different → Wrong endpoint used
- `video_url` is null/empty → Fal API error
- Can't find record in Supabase → Database insert failed

---

## Troubleshooting

**If no recordId:**
- Check `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Restart server after adding credentials
- Check server logs for Supabase errors

**If wrong image_path:**
- Make sure you're using `/api/test-airpods` endpoint
- Check that `public/airpods.jpg` exists

**If video_url is null:**
- Check Fal API key is set
- Check server logs for Fal API errors
- Verify the Fal API response structure

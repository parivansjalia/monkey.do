# Image to Video Backend Server

A simple TypeScript backend server that uses Fal's image-to-video API to convert images to videos.

## Setup

1. Get your Fal API key from [fal.ai](https://fal.ai)
2. (Optional) Set up Supabase database - see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
3. Create a `.env` file in the project root with:
   ```env
   FAL_KEY=your_fal_api_key_here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   Note: Supabase credentials are optional - the server will work without them, but won't save records to the database.

## Running the Server

```bash
npm run server
```

For development with auto-reload:
```bash
npm run server:dev
```

The server will start on `http://localhost:3001` (or the port specified in the `PORT` environment variable).

## Endpoints

### POST `/api/image-to-video`
Convert any image to video.

**Request Body:**
```json
{
  "imagePath": "public/airpods.jpg",
  "prompt": "Optional prompt describing the animation",
  "model": "fal-ai/minimax-video/image-to-video" // optional, defaults to minimax-video
}
```

**Response:**
```json
{
  "success": true,
  "videoPath": "public/videos/video_1234567890.mp4",
  "videoUrl": "https://fal.media/files/..."
}
```

### POST `/api/test-airpods`
Quick test endpoint that converts `public/airpods.jpg` to video.

**Request Body (optional):**
```json
{
  "prompt": "Optional custom prompt"
}
```

**Response:**
```json
{
  "success": true,
  "videoPath": "public/videos/airpods_1234567890.mp4",
  "videoUrl": "https://fal.media/files/...",
  "message": "AirPods image successfully converted to video!"
}
```

### GET `/health`
Health check endpoint. Returns Supabase connection status.

### GET `/api/videos`
Get all video generation records from the database (requires Supabase).

**Response:**
```json
{
  "videos": [
    {
      "id": "uuid",
      "image_path": "public/airpods.jpg",
      "prompt": "...",
      "video_path": "public/videos/...",
      "video_url": "https://...",
      "created_at": "2024-..."
    }
  ]
}
```

### GET `/api/videos/:id`
Get a specific video generation record by ID (requires Supabase).

## Testing

To test with the airpods.jpg file:

```bash
# Start the server
npm run server

# In another terminal, make a request:
curl -X POST http://localhost:3001/api/test-airpods \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A smooth animation of the AirPods case"}'
```

The video will be saved to `public/videos/` directory.

## Models

The server uses `fal-ai/minimax-video/image-to-video` by default, which is typically the cheapest option. You can specify other models like:
- `fal-ai/luma-dream-machine`
- `fal-ai/kling-video/v1/standard`

Check [fal.ai pricing](https://fal.ai/pricing) for current pricing information.

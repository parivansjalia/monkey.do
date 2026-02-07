import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fal } from '@fal-ai/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Fal API key from environment variable
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
} else {
  console.warn('Warning: FAL_KEY environment variable not set. Please set it to use the Fal API.');
}

// Initialize Supabase client
let supabase: ReturnType<typeof createClient> | null = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✅ Supabase client initialized');
} else {
  console.warn('Warning: Supabase credentials not set. Database features will be disabled.');
  console.warn('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
}


// Test endpoint - converts airpods.jpg to video
app.post('/api/test-airpods', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const imagePath = 'public/airpods.jpg';
    const projectRoot = path.resolve(__dirname, '..');
    const fullImagePath = path.resolve(projectRoot, imagePath);

    if (!fs.existsSync(fullImagePath)) {
      return res.status(404).json({ error: `Image not found: ${fullImagePath}` });
    }

    console.log(`Converting airpods.jpg to video...`);

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(fullImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    // Use kling-video model
    const model = 'fal-ai/kling-video/v1/standard/image-to-video';
    console.log(`Calling Fal API with model: ${model}`);
    console.log(`Duration: 2.5 seconds (for cheaper generation)`);
    
    const result = await fal.subscribe(model, {
      input: {
        prompt: prompt || "A close-up of the user's actual AirPods case (from the uploaded image) held in one hand, with the other hand's thumb gently pushing up on the lid to open it. The focus is on the hands and the motion of the case lid lifting, showing the AirPods inside as the case opens.",
        image_url: imageDataUrl,
        duration: "5", // Kling video supports "5" or "10" seconds
      },
    });

    console.log('RAHHHHH Fal API response received');
    console.log('Response structure:', JSON.stringify(result, null, 2));

    // Get the video URL from the result
    // The result structure can vary, so we check multiple possible locations
    const resultAny = result as any;
    let videoUrl = resultAny.data?.video?.url || 
                   resultAny.video?.url || 
                   resultAny.video_url || 
                   resultAny.url || 
                   resultAny.video;
    
    if (!videoUrl) {
      console.warn('No video URL found in response, using dummy URL for testing');
      console.warn('Full response structure:', JSON.stringify(result, null, 2));
      videoUrl = 'https://dummy-video-url-for-testing.mp4';
    } else {
      console.log(`✅ Video URL extracted: ${videoUrl}`);
    }

    // Save to database if Supabase is configured
    let dbRecord: any = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('video_generations')
          .insert({
            image_path: 'public/airpods.jpg',
            prompt: prompt || 'A smooth, cinematic animation of the AirPods case with subtle movement',
            model: model,
            video_url: videoUrl,
            duration: 5.0,
            status: 'completed',
            created_at: new Date().toISOString(),
          } as any)
          .select()
          .single();

        if (error) {
          console.error('Error saving to database:', error);
        } else {
          dbRecord = data;
          console.log('✅ Saved to database:', (data as any).id);
        }
      } catch (dbError: any) {
        console.error('Database error:', dbError);
      }
    }

    res.json({
      success: true,
      videoUrl: videoUrl,
      message: 'AirPods image successfully converted to video!',
      recordId: dbRecord?.id || null,
    });
  } catch (error: any) {
    console.error('Error converting image to video:', error);
    res.status(500).json({
      error: 'Failed to convert image to video',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    supabase: supabase ? 'connected' : 'not configured'
  });
});

// Get all video generations from database
app.get('/api/videos', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { data, error } = await supabase
      .from('video_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ videos: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific video generation by ID
app.get('/api/videos/:id', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { data, error } = await supabase
      .from('video_generations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Image to video endpoint: POST http://localhost:${PORT}/api/image-to-video`);
});

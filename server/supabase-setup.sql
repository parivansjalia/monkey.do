-- Supabase Database Setup for Video Generation
-- Run this SQL in your Supabase SQL Editor

-- Create the video_generations table
CREATE TABLE IF NOT EXISTS video_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_path TEXT NOT NULL,
  prompt TEXT,
  model TEXT NOT NULL DEFAULT 'fal-ai/minimax-video/image-to-video',
  video_path TEXT, -- Optional: for local file storage if needed
  video_url TEXT NOT NULL, -- Fal API video URL (primary storage)
  duration DECIMAL(4, 2) DEFAULT 2.5,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON video_generations(created_at DESC);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_video_generations_status ON video_generations(status);

-- Enable Row Level Security (RLS)
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to do everything
-- (This is safe because we're using SERVICE_ROLE_KEY which bypasses RLS)
CREATE POLICY "Service role can do everything" ON video_generations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a policy for authenticated users to read their own records
-- Uncomment if you want to add user authentication later
-- CREATE POLICY "Users can read their own records" ON video_generations
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_video_generations_updated_at
  BEFORE UPDATE ON video_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE video_generations IS 'Stores records of image-to-video generation requests';
COMMENT ON COLUMN video_generations.image_path IS 'Path to the source image file';
COMMENT ON COLUMN video_generations.video_path IS 'Optional local path where the video is saved (if downloaded)';
COMMENT ON COLUMN video_generations.video_url IS 'URL from Fal API where the video is hosted (primary storage)';
COMMENT ON COLUMN video_generations.duration IS 'Video duration in seconds';

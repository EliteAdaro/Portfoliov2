-- Snake Highscores table with security constraints
CREATE TABLE snake_highscores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(12) NOT NULL
    CHECK (char_length(name) >= 2)
    CHECK (name ~ '^[a-zA-Z0-9 _-]+$'),  -- Only safe characters
  score INT NOT NULL
    CHECK (score > 0)
    CHECK (score <= 3970)         -- Max possible score (20x20 grid)
    CHECK (score % 10 = 0),       -- Must be multiple of 10
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE snake_highscores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ scores (public leaderboard)
CREATE POLICY "Anyone can read scores"
  ON snake_highscores FOR SELECT
  USING (true);

-- Allow anyone to INSERT scores (anonymous play)
-- But NOT delete or update — scores are permanent
CREATE POLICY "Anyone can insert scores"
  ON snake_highscores FOR INSERT
  WITH CHECK (true);

-- NO update or delete policies = nobody can modify/remove scores via API

-- Index for fast leaderboard queries
CREATE INDEX idx_highscores_score ON snake_highscores (score DESC);

-- Rate limit: max 1 insert per IP per 30 seconds (via Supabase Edge Function if needed)
-- For now, client-side rate limiting is applied

-- Challenges Table for each daily challenge
CREATE TABLE IF NOT EXISTS challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  
  unsplash_id text NOT NULL,
  image_url text NOT NULL,
  photographer_name text NOT NULL,
  photographer_profile_url text NOT NULL,
  photo_description text,
  
  -- CLIP embedding
  embedding jsonb,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guesses Table for daily challenge
CREATE TABLE IF NOT EXISTS guesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  
  prompt text NOT NULL CHECK (char_length(prompt) <= 100),
  image_url text NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  
  attempt_number integer NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 3),
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, challenge_id, attempt_number)
);

-- 3. INDEXES for common access patterns
CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(date);
CREATE INDEX IF NOT EXISTS idx_guesses_user_challenge ON guesses(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_guesses_challenge_score ON guesses(challenge_id, score DESC);

-- 4. RLS to ensure user specific data is modified only by that user
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view their own guesses" ON guesses;
DROP POLICY IF EXISTS "Users can insert their own guesses" ON guesses;
DROP POLICY IF EXISTS "Users can view all guesses for leaderboard" ON guesses;

CREATE POLICY "Authenticated users can view challenges" 
  ON challenges 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Guesses policies
CREATE POLICY "Users can view their own guesses" 
  ON guesses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guesses" 
  ON guesses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all guesses for leaderboard"
  ON guesses 
  FOR SELECT
  TO authenticated
  USING (true);

-- Helper function to get user's best score for a challenge
CREATE OR REPLACE FUNCTION get_best_score(p_user_id uuid, p_challenge_id uuid)
RETURNS numeric AS $$
  SELECT max(score) 
  FROM guesses 
  WHERE user_id = p_user_id 
    AND challenge_id = p_challenge_id;
$$ LANGUAGE sql STABLE;
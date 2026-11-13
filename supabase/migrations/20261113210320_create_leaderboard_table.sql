/*
# Create global leaderboard for Neon Dodge

1. New Tables
- `leaderboard` — stores global high scores for Neon Dodge players
  - `id` (uuid, primary key)
  - `player_name` (text, not null, max 18 chars) — the player's display name
  - `score` (integer, not null) — the final score achieved
  - `difficulty` (text, not null) — which difficulty was played (easy/normal/hard/extreme)
  - `stage` (integer, not null) — highest stage reached
  - `level` (integer, not null) — highest level reached
  - `survival_time` (integer, not null) — seconds survived
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `leaderboard`.
- Grant SELECT and INSERT to `anon` + `authenticated` so the no-auth frontend can read the leaderboard and submit scores.
- Allow public SELECT (leaderboard is intentionally shared/global).
- Allow public INSERT (anyone can submit a score — scores are for fun, no prizes).
- No UPDATE or DELETE from the client side.

3. Indexes
- Index on `score DESC` for fast leaderboard queries.
- Index on `difficulty` for filtering by mode.
- Index on `created_at DESC` for recent scores.
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 18),
  score integer NOT NULL CHECK (score >= 0),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard', 'extreme')),
  stage integer NOT NULL DEFAULT 1,
  level integer NOT NULL DEFAULT 1,
  survival_time integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON leaderboard TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_leaderboard" ON leaderboard;
CREATE POLICY "public_read_leaderboard"
ON leaderboard FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_leaderboard" ON leaderboard;
CREATE POLICY "public_insert_leaderboard"
ON leaderboard FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON leaderboard (difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at_desc ON leaderboard (created_at DESC);

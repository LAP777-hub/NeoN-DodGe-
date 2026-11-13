import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  difficulty: string;
  stage: number;
  level: number;
  survival_time: number;
  created_at: string;
}

export async function fetchLeaderboard(
  difficulty: string | 'all',
  limit = 10,
): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from('leaderboard')
    .select('id, player_name, score, difficulty, stage, level, survival_time, created_at')
    .order('score', { ascending: false })
    .limit(limit);

  if (difficulty !== 'all') {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }

  return (data ?? []) as LeaderboardEntry[];
}

export async function submitScore(entry: {
  player_name: string;
  score: number;
  difficulty: string;
  stage: number;
  level: number;
  survival_time: number;
}): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert(entry)
    .select('id, player_name, score, difficulty, stage, level, survival_time, created_at')
    .maybeSingle();

  if (error) {
    console.error('Failed to submit score:', error);
    return null;
  }

  return data as LeaderboardEntry | null;
}

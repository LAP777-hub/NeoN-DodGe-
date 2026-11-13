import { useState, useEffect, useCallback } from 'react';
import { Trophy, Globe, Loader2, RefreshCw } from 'lucide-react';
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/supabase';
import type { DifficultyKey } from '@/game/types';

const DIFF_LABELS: Record<DifficultyKey | 'all', string> = {
  all: 'ALL',
  easy: 'EASY',
  normal: 'NORMAL',
  hard: 'HARD',
  extreme: 'EXTREME',
};

const DIFF_COLORS: Record<DifficultyKey | 'all', string> = {
  all: '#00f7ff',
  easy: '#39ff14',
  normal: '#00f7ff',
  hard: '#fbbf24',
  extreme: '#ff1744',
};

interface LeaderboardProps {
  currentDifficulty: DifficultyKey;
  refreshTrigger: number;
}

export default function Leaderboard({ currentDifficulty, refreshTrigger }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DifficultyKey | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeaderboard(filter, 10);
    setEntries(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load, refreshTrigger]);

  const filters: (DifficultyKey | 'all')[] = ['all', 'easy', 'normal', 'hard', 'extreme'];

  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-header">
        <div className="leaderboard-title">
          <Trophy size={20} className="trophy-icon" />
          <h3>GLOBAL LEADERBOARD</h3>
        </div>
        <button
          className="leaderboard-refresh"
          onClick={load}
          aria-label="Refresh leaderboard"
          type="button"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="leaderboard-filters">
        {filters.map((f) => (
          <button
            key={f}
            className={`lb-filter-btn ${filter === f ? 'active' : ''}`}
            style={filter === f ? { color: DIFF_COLORS[f], borderColor: DIFF_COLORS[f] } : {}}
            onClick={() => setFilter(f)}
            type="button"
          >
            {DIFF_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="leaderboard-list">
        {loading ? (
          <div className="leaderboard-loading">
            <Loader2 size={24} className="spin" />
            <span>Loading scores...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-empty">
            <Globe size={32} />
            <p>No scores yet. Be the first!</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const diff = entry.difficulty as DifficultyKey;
            return (
              <div key={entry.id} className={`lb-row ${i === 0 ? 'lb-row-top' : ''}`}>
                <span className={`lb-rank lb-rank-${i + 1}`}>
                  {i + 1}
                </span>
                <div className="lb-info">
                  <span className="lb-name">{entry.player_name}</span>
                  <div className="lb-meta">
                    <span
                      className="lb-diff-tag"
                      style={{ color: DIFF_COLORS[diff], borderColor: DIFF_COLORS[diff] }}
                    >
                      {DIFF_LABELS[diff]}
                    </span>
                    <span className="lb-stage">Stage {entry.stage}</span>
                    <span className="lb-time">{entry.survival_time}s</span>
                  </div>
                </div>
                <span className="lb-score">{entry.score.toLocaleString()}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

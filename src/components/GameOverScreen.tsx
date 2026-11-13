import { useEffect, useState } from 'react';
import { Skull, Trophy, RotateCcw, Home, Loader2, Send } from 'lucide-react';
import type { GameStats, DifficultyKey } from '@/game/types';
import { DIFFICULTIES } from '@/game/constants';
import { submitScore } from '@/lib/supabase';

interface GameOverScreenProps {
  stats: GameStats;
  difficulty: DifficultyKey;
  playerName: string;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onExit: () => void;
  onSubmitted: () => void;
}

export default function GameOverScreen({
  stats,
  difficulty,
  playerName,
  highScore,
  isNewHighScore,
  onRestart,
  onExit,
  onSubmitted,
}: GameOverScreenProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const finalScore = Math.floor(stats.score);

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    setSubmitError(false);

    const result = await submitScore({
      player_name: playerName,
      score: finalScore,
      difficulty,
      stage: stats.stage,
      level: stats.level,
      survival_time: Math.floor(stats.survivalTime),
    });

    setSubmitting(false);

    if (result) {
      setSubmitted(true);
      onSubmitted();
    } else {
      setSubmitError(true);
    }
  };

  // Auto-submit for high scores
  useEffect(() => {
    if (isNewHighScore && !submitted && !submitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewHighScore]);

  const diffConfig = DIFFICULTIES[difficulty];

  return (
    <div className="screen-overlay gameover-screen">
      <div className="overlay-card gameover-card">
        <div className="gameover-icon">
          <Skull size={40} />
        </div>

        <h2 className="gameover-title">GAME OVER</h2>
        <p className="gameover-subtitle">Your galaxy run has ended.</p>

        {isNewHighScore && (
          <div className="new-high-score-banner">
            <Trophy size={20} />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        <div className="gameover-stats-grid">
          <div className="gameover-stat-box">
            <small>FINAL SCORE</small>
            <strong className="stat-score">{finalScore.toLocaleString()}</strong>
          </div>
          <div className="gameover-stat-box">
            <small>HIGH SCORE</small>
            <strong>{highScore.toLocaleString()}</strong>
          </div>
          <div className="gameover-stat-box">
            <small>STAGE</small>
            <strong>{stats.stage}</strong>
          </div>
          <div className="gameover-stat-box">
            <small>LEVEL</small>
            <strong>{stats.level}</strong>
          </div>
          <div className="gameover-stat-box">
            <small>SURVIVAL</small>
            <strong>{Math.floor(stats.survivalTime)}s</strong>
          </div>
          <div className="gameover-stat-box">
            <small>MAX COMBO</small>
            <strong>x{stats.maxCombo}</strong>
          </div>
          <div className="gameover-stat-box">
            <small>NEAR MISSES</small>
            <strong>{stats.nearMisses}</strong>
          </div>
          <div className="gameover-stat-box">
            <small>MODE</small>
            <strong>{diffConfig.label}</strong>
          </div>
        </div>

        {/* Score submission */}
        <div className="submit-section">
          {submitted ? (
            <div className="submit-success">
              <Trophy size={16} />
              <span>Score submitted to global leaderboard!</span>
            </div>
          ) : submitting ? (
            <div className="submit-loading">
              <Loader2 size={16} className="spin" />
              <span>Submitting to leaderboard...</span>
            </div>
          ) : submitError ? (
            <div className="submit-row">
              <span className="submit-error-text">Failed to submit. Try again?</span>
              <button className="submit-retry-btn" onClick={handleSubmit} type="button">
                <Send size={14} /> RETRY
              </button>
            </div>
          ) : (
            <button className="submit-btn" onClick={handleSubmit} type="button">
              <Send size={14} />
              <span>SUBMIT TO LEADERBOARD</span>
            </button>
          )}
        </div>

        <div className="gameover-actions">
          <button className="primary-btn" onClick={onRestart} type="button">
            <RotateCcw size={18} />
            <span>PLAY AGAIN</span>
          </button>
          <button className="secondary-btn" onClick={onExit} type="button">
            <Home size={18} />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
}

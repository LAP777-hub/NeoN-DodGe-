import { Shield, Clock, Magnet, Sparkles, Gauge } from 'lucide-react';
import type { GameStats, DifficultyKey } from '@/game/types';
import { DIFFICULTIES, POWERUP_CONFIG } from '@/game/constants';
import type { PowerUpType } from '@/game/types';

interface HudProps {
  stats: GameStats;
  difficulty: DifficultyKey;
  playerName: string;
  avatarEmoji: string;
  activePowerUps: Partial<Record<PowerUpType, number>>;
  onExit: () => void;
}

const POWERUP_ICONS: Record<PowerUpType, typeof Shield> = {
  shield: Shield,
  slow: Clock,
  magnet: Magnet,
  doubleScore: Sparkles,
};

export default function Hud({
  stats,
  difficulty,
  playerName,
  avatarEmoji,
  activePowerUps,
  onExit,
}: HudProps) {
  const diffConfig = DIFFICULTIES[difficulty];

  return (
    <header className="game-hud">
      <div className="hud-left">
        <div className="hud-avatar">
          <span>{avatarEmoji}</span>
        </div>
        <div className="hud-player-info">
          <small className="hud-label">PILOT</small>
          <strong className="hud-player-name">{playerName}</strong>
        </div>
      </div>

      <div className="hud-center">
        <div className="hud-stat">
          <small>SCORE</small>
          <strong className="hud-score">{Math.floor(stats.score).toLocaleString()}</strong>
        </div>
        <div className="hud-stat">
          <small>COMBO</small>
          <strong className={stats.combo > 5 ? 'hud-combo-hot' : ''}>x{stats.combo}</strong>
        </div>
        <div className="hud-stat">
          <small>LEVEL</small>
          <strong>{stats.level}</strong>
        </div>
        <div className="hud-stat">
          <small>STAGE</small>
          <strong>{stats.stage}</strong>
        </div>
        <div className="hud-stat">
          <small>TIME</small>
          <strong>{Math.floor(stats.survivalTime)}s</strong>
        </div>
      </div>

      <div className="hud-right">
        <div className="hud-stat">
          <small>MODE</small>
          <strong className="hud-mode">{diffConfig.label}</strong>
        </div>

        {/* Active power-ups */}
        <div className="hud-powerups">
          {(Object.keys(activePowerUps) as PowerUpType[]).map((type) => {
            const time = activePowerUps[type] ?? 0;
            if (time <= 0) return null;
            const config = POWERUP_CONFIG[type];
            const Icon = POWERUP_ICONS[type];
            const pct = Math.min(time / config.duration, 1);
            return (
              <div key={type} className="hud-powerup" style={{ borderColor: config.color }}>
                <Icon size={14} style={{ color: config.color }} />
                <div className="hud-powerup-bar" style={{ width: `${pct * 100}%`, background: config.color }} />
              </div>
            );
          })}
        </div>

        <button className="hud-exit-btn" onClick={onExit} type="button" aria-label="Exit game">
          <Gauge size={16} />
        </button>
      </div>
    </header>
  );
}

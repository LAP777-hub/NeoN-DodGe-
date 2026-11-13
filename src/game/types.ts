export type DifficultyKey = 'easy' | 'normal' | 'hard' | 'extreme';

export type GameScreen = 'start' | 'playing' | 'paused' | 'gameover';

export interface DifficultyConfig {
  name: string;
  speed: number;
  spawn: number;
  score: number;
  label: string;
  description: string;
}

export type ObstacleType =
  | 'satellite'
  | 'kryptonite'
  | 'shootingStar'
  | 'rock'
  | 'rocket'
  | 'sun'
  | 'moon'
  | 'fireball';

export type PowerUpType = 'shield' | 'slow' | 'magnet' | 'doubleScore';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  glow: number;
  shieldTime: number;
  invincibleTime: number;
}

export interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  nearMissed: boolean;
  phase: number;
  horizontalSpeed: number;
  hue: number;
}

export interface PowerUp {
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  pulse: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  life: number;
  decay: number;
  color: string;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  layer: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  vy: number;
}

export interface GameStats {
  score: number;
  level: number;
  stage: number;
  survivalTime: number;
  combo: number;
  maxCombo: number;
  nearMisses: number;
  powerUpsCollected: number;
}

export interface ScoreEvent {
  id: number;
  message: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

import type { DifficultyConfig, DifficultyKey } from './types';

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 562;

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  easy: {
    name: 'easy',
    label: 'EASY',
    description: 'A gentle drift through the outer galaxy',
    speed: 0.7,
    spawn: 0.7,
    score: 0.75,
  },
  normal: {
    name: 'normal',
    label: 'NORMAL',
    description: 'Standard space hazard intensity',
    speed: 1.0,
    spawn: 1.0,
    score: 1.0,
  },
  hard: {
    name: 'hard',
    label: 'HARD',
    description: 'Dense asteroid fields and fast debris',
    speed: 1.75,
    spawn: 1.35,
    score: 1.5,
  },
  extreme: {
    name: 'extreme',
    label: 'EXTREME',
    description: 'Only the bravest pilots survive this chaos',
    speed: 3.5,
    spawn: 2.0,
    score: 2.5,
  },
};

export const PLAYER_WIDTH = 56;
export const PLAYER_HEIGHT = 56;
export const PLAYER_SPEED = 8;
export const PLAYER_Y = GAME_HEIGHT - 85;

export const POWERUP_TYPES = ['shield', 'slow', 'magnet', 'doubleScore'] as const;

export const POWERUP_CONFIG = {
  shield: {
    color: '#00f7ff',
    label: 'SHIELD',
    icon: 'shield',
    duration: 300,
    description: 'Absorbs one collision',
  },
  slow: {
    color: '#a5b4fc',
    label: 'SLOW MO',
    icon: 'clock',
    duration: 360,
    description: 'Slows all obstacles',
  },
  magnet: {
    color: '#fbbf24',
    label: 'MAGNET',
    icon: 'magnet',
    duration: 300,
    description: 'Pulls in nearby score bonuses',
  },
  doubleScore: {
    color: '#f472b6',
    label: '2X SCORE',
    icon: 'sparkles',
    duration: 360,
    description: 'Double score points',
  },
} as const;

export const COMBO_DECAY_RATE = 0.8;
export const COMBO_NEAR_MISS_BONUS = 25;
export const COMBO_OBSTACLE_PASSED = 1;

export const NEON_COLORS = {
  primary: '#00f7ff',
  secondary: '#ff00d4',
  accent: '#39ff14',
  warning: '#fbbf24',
  danger: '#ff1744',
  white: '#ffffff',
};

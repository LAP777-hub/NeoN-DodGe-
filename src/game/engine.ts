import type {
  Obstacle,
  ObstacleType,
  Player,
  PowerUp,
  PowerUpType,
  Particle,
  Star,
  FloatingText,
  DifficultyKey,
} from './types';
import { Sound } from './audio';

const OBSTACLE_DEFS: Record<
  ObstacleType,
  { size: number; speed: number; rotation: number }
> = {
  satellite: { size: 48, speed: 2.5, rotation: 0.035 },
  kryptonite: { size: 42, speed: 3.1, rotation: 0.07 },
  shootingStar: { size: 28, speed: 5.5, rotation: -0.02 },
  rock: { size: 45, speed: 3.6, rotation: 0.045 },
  rocket: { size: 34, speed: 5.8, rotation: 0 },
  sun: { size: 68, speed: 2.1, rotation: 0.012 },
  moon: { size: 52, speed: 2.5, rotation: 0.012 },
  fireball: { size: 40, speed: 6.2, rotation: 0.08 },
};

const OBSTACLE_TYPES = Object.keys(OBSTACLE_DEFS) as ObstacleType[];

export function createStarField(count: number, width: number, height: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.3,
      speed: Math.random() * 1.8 + 0.2,
      brightness: Math.random(),
      layer: Math.random(),
    });
  }
  return stars;
}

export function createPlayer(width: number, height: number): Player {
  return {
    x: width / 2 - 28,
    y: height - 85,
    width: 56,
    height: 56,
    speed: 8,
    glow: 0,
    shieldTime: 0,
    invincibleTime: 0,
  };
}

export function spawnObstacle(
  width: number,
  gameTime: number,
  difficultySpeed: number,
): Obstacle {
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  const def = OBSTACLE_DEFS[type];
  const size = def.size * (0.85 + Math.random() * 0.35);

  return {
    type,
    x: 20 + Math.random() * (width - size - 40),
    y: -size - 30,
    width: size,
    height: size,
    speed: (def.speed + Math.random() * 1.4 + Math.min(gameTime / 120, 3)) * difficultySpeed,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: def.rotation * (Math.random() > 0.5 ? 1 : -1),
    nearMissed: false,
    phase: Math.random() * Math.PI * 2,
    horizontalSpeed: type === 'shootingStar' ? (Math.random() > 0.5 ? 2.5 : -2.5) : 0,
    hue: Math.random() * 360,
  };
}

export function spawnPowerUp(width: number): PowerUp {
  const types: PowerUpType[] = ['shield', 'slow', 'magnet', 'doubleScore'];
  const type = types[Math.floor(Math.random() * types.length)];
  const size = 36;

  return {
    type,
    x: 20 + Math.random() * (width - size - 40),
    y: -size - 20,
    width: size,
    height: size,
    speed: 2.2,
    rotation: 0,
    rotationSpeed: 0.04,
    pulse: 0,
  };
}

export function createExplosion(x: number, y: number, color = '#00f7ff'): Particle[] {
  const particles: Particle[] = [];
  const colors = [color, '#ff00d4', '#fbbf24', '#ff1744', '#ffffff'];

  for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    particles.push({
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: Math.random() * 5 + 1,
      life: 1,
      decay: Math.random() * 0.035 + 0.018,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return particles;
}

export function createTrailParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + Math.random() * 10,
      dx: (Math.random() - 0.5) * 1,
      dy: Math.random() * 2 + 1,
      size: Math.random() * 3 + 1,
      life: 1,
      decay: 0.04,
      color: Math.random() > 0.5 ? '#00f7ff' : '#ff00d4',
    });
  }
  return particles;
}

export function createFloatingText(
  x: number,
  y: number,
  text: string,
  color: string,
): FloatingText {
  return {
    x,
    y,
    text,
    life: 1,
    color,
    vy: -1.5,
  };
}

export function checkCollision(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
  const padding = Math.min(9, b.width * 0.16);
  return (
    a.x + padding < b.x + b.width - padding &&
    a.x + a.width - padding > b.x + padding &&
    a.y + padding < b.y + b.height - padding &&
    a.y + a.height - padding > b.y + padding
  );
}

export function spawnAmbientParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 1,
      life: 1,
      decay: 0.03,
      color,
    });
  }
  return particles;
}

export function getDifficultyMultiplier(key: DifficultyKey): number {
  const mults: Record<DifficultyKey, number> = {
    easy: 1,
    normal: 1.5,
    hard: 2.5,
    extreme: 4,
  };
  return mults[key];
}

export { Sound, OBSTACLE_DEFS, OBSTACLE_TYPES };

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  DIFFICULTIES,
  PLAYER_SPEED,
  PLAYER_Y,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  POWERUP_CONFIG,
} from '@/game/constants';
import type {
  Player,
  Obstacle,
  PowerUp,
  Particle,
  Star,
  FloatingText,
  DifficultyKey,
  GameStats,
  PowerUpType,
} from '@/game/types';
import {
  createStarField,
  createPlayer,
  spawnObstacle,
  spawnPowerUp,
  createExplosion,
  createTrailParticles,
  createFloatingText,
  checkCollision,
  Sound,
} from '@/game/engine';
import {
  drawBackground,
  drawPlayer,
  drawObstacle,
  drawPowerUp,
  drawParticles,
  drawFloatingTexts,
} from '@/game/render';
import { initAudio } from '@/game/audio';

export interface GameCanvasHandle {
  start: () => void;
  pause: () => void;
  resume: () => void;
  exit: () => void;
  setMove: (dir: 'left' | 'right', active: boolean) => void;
}

interface GameCanvasProps {
  difficulty: DifficultyKey;
  playerName: string;
  avatarEmoji: string;
  avatarImage: HTMLImageElement | null;
  avatarLoaded: boolean;
  onStatsUpdate: (stats: GameStats) => void;
  onPowerUpsChange: (pus: Partial<Record<PowerUpType, number>>) => void;
  onGameOver: (stats: GameStats) => void;
  onExit: () => void;
  soundEnabled: boolean;
}

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(function GameCanvas(
  {
    difficulty,
    playerName,
    avatarEmoji,
    avatarImage,
    avatarLoaded,
    onStatsUpdate,
    onPowerUpsChange,
    onGameOver,
    onExit,
    soundEnabled,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game state refs
  const stateRef = useRef({
    running: false,
    paused: false,
    gameTime: 0,
    score: 0,
    level: 1,
    stage: 1,
    combo: 0,
    maxCombo: 0,
    nearMisses: 0,
    powerUpsCollected: 0,
    nearMissCooldown: 0,
    screenShake: 0,
    obstacleTimer: 0,
    powerUpTimer: 0,
    comboTimer: 0,
    lastTime: 0,
    animationFrame: 0,
    slowFactor: 1,
    doubleScoreTime: 0,
    magnetTime: 0,
    keyLeft: false,
    keyRight: false,
    exitRequested: false,
  });

  const playerRef = useRef<Player>(createPlayer(GAME_WIDTH, GAME_HEIGHT));
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const starsRef = useRef<Star[]>(createStarField(180, GAME_WIDTH, GAME_HEIGHT));
  const activePowerUpsRef = useRef<Partial<Record<PowerUpType, number>>>({});

  // Keep refs synced with props
  const propsRef = useRef({ difficulty, playerName, avatarEmoji, avatarImage, avatarLoaded, soundEnabled });
  propsRef.current = { difficulty, playerName, avatarEmoji, avatarImage, avatarLoaded, soundEnabled };

  // Callbacks ref to avoid stale closures
  const callbacksRef = useRef({ onStatsUpdate, onPowerUpsChange, onGameOver, onExit });
  callbacksRef.current = { onStatsUpdate, onPowerUpsChange, onGameOver, onExit };

  const emitStats = useCallback(() => {
    const s = stateRef.current;
    callbacksRef.current.onStatsUpdate({
      score: s.score,
      level: s.level,
      stage: s.stage,
      survivalTime: s.gameTime / 60,
      combo: s.combo,
      maxCombo: s.maxCombo,
      nearMisses: s.nearMisses,
      powerUpsCollected: s.powerUpsCollected,
    });
  }, []);

  const emitPowerUps = useCallback(() => {
    callbacksRef.current.onPowerUpsChange({ ...activePowerUpsRef.current });
  }, []);

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    s.paused = false;
    s.gameTime = 0;
    s.score = 0;
    s.level = 1;
    s.stage = 1;
    s.combo = 0;
    s.maxCombo = 0;
    s.nearMisses = 0;
    s.powerUpsCollected = 0;
    s.nearMissCooldown = 0;
    s.screenShake = 0;
    s.obstacleTimer = 0;
    s.powerUpTimer = 0;
    s.comboTimer = 0;
    s.slowFactor = 1;
    s.doubleScoreTime = 0;
    s.magnetTime = 0;
    s.keyLeft = false;
    s.keyRight = false;
    s.exitRequested = false;

    playerRef.current = createPlayer(GAME_WIDTH, GAME_HEIGHT);
    obstaclesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    activePowerUpsRef.current = {};

    emitStats();
    emitPowerUps();
  }, [emitStats, emitPowerUps]);

  const start = useCallback(() => {
    initAudio();
    resetGame();
    const s = stateRef.current;
    s.running = true;
    s.lastTime = performance.now();
    Sound.start();
    cancelAnimationFrame(s.animationFrame);
    s.animationFrame = requestAnimationFrame(gameLoop);
  }, [resetGame]);

  const gameLoop = useCallback((currentTime: number) => {
    const s = stateRef.current;
    if (!s.running) return;

    const deltaTime = Math.min((currentTime - s.lastTime) / 16.67, 2);
    s.lastTime = currentTime;

    if (!s.paused) {
      update(deltaTime);
    }
    draw();

    s.animationFrame = requestAnimationFrame(gameLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((deltaTime: number) => {
    const s = stateRef.current;
    const { difficulty: diff } = propsRef.current;
    const diffConfig = DIFFICULTIES[diff];
    const player = playerRef.current;

    s.gameTime += deltaTime;

    // --- Player movement ---
    const moveSpeed = PLAYER_SPEED * diffConfig.speed;
    if (s.keyLeft) {
      player.x -= moveSpeed * deltaTime;
      if (Math.random() < 0.018) Sound.move();
    }
    if (s.keyRight) {
      player.x += moveSpeed * deltaTime;
      if (Math.random() < 0.018) Sound.move();
    }
    player.x = Math.max(12, Math.min(GAME_WIDTH - player.width - 12, player.x));

    // --- Score ---
    const scoreGain = 0.035 * deltaTime * diffConfig.score * (s.doubleScoreTime > 0 ? 2 : 1);
    s.score += scoreGain;

    // --- Level / Stage ---
    const newLevel = Math.floor(s.gameTime / 45) + 1;
    if (newLevel > s.level) {
      s.level = newLevel;
      Sound.levelUp();
      floatingTextsRef.current.push(
        createFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `LEVEL ${s.level}`, '#00f7ff'),
      );
    }

    const newStage = Math.floor(s.gameTime / 90) + 1;
    if (newStage > s.stage) {
      s.stage = newStage;
      Sound.stageUp();
      floatingTextsRef.current.push(
        createFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `STAGE ${s.stage} — GALAXY DEEPENING`, '#ff00d4'),
      );
    }

    // --- Spawn obstacles ---
    s.obstacleTimer += deltaTime;
    const baseSpawnRate = Math.max(10, 55 - s.gameTime * 0.055);
    const spawnRate = baseSpawnRate / diffConfig.spawn;

    if (s.obstacleTimer >= spawnRate) {
      obstaclesRef.current.push(spawnObstacle(GAME_WIDTH, s.gameTime, diffConfig.speed));
      s.obstacleTimer = 0;
      if (diff === 'extreme' && Math.random() < 0.24) {
        obstaclesRef.current.push(spawnObstacle(GAME_WIDTH, s.gameTime, diffConfig.speed));
      }
    }

    // --- Spawn power-ups (every ~8-12 seconds) ---
    s.powerUpTimer += deltaTime;
    if (s.powerUpTimer >= 480 + Math.random() * 120) {
      powerUpsRef.current.push(spawnPowerUp(GAME_WIDTH));
      s.powerUpTimer = 0;
    }

    // --- Power-up timers ---
    s.nearMissCooldown -= deltaTime;
    s.comboTimer -= deltaTime;

    if (s.comboTimer <= 0 && s.combo > 0) {
      s.combo = 0;
    }

    // Tick active power-ups
    let powerUpsChanged = false;
    (Object.keys(activePowerUpsRef.current) as PowerUpType[]).forEach((type) => {
      const time = activePowerUpsRef.current[type] ?? 0;
      if (time > 0) {
        const newTime = time - deltaTime;
        if (newTime <= 0) {
          delete activePowerUpsRef.current[type];
          powerUpsChanged = true;
          if (type === 'slow') s.slowFactor = 1;
          if (type === 'doubleScore') s.doubleScoreTime = 0;
          if (type === 'magnet') s.magnetTime = 0;
        } else {
          activePowerUpsRef.current[type] = newTime;
        }
      }
    });

    // Player shield/invincible tick
    if (player.shieldTime > 0) player.shieldTime -= deltaTime;
    if (player.invincibleTime > 0) player.invincibleTime -= deltaTime;

    // --- Update obstacles ---
    const obstacles = obstaclesRef.current;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      const effectiveSpeed = s.slowFactor;

      obs.y += obs.speed * deltaTime * effectiveSpeed;
      obs.rotation += obs.rotationSpeed * deltaTime;

      if (obs.type === 'shootingStar') {
        obs.x += obs.horizontalSpeed * deltaTime;
      }
      if (obs.type === 'rocket') {
        obs.speed += 0.018 * deltaTime;
      }

      // Wrap horizontally
      if (obs.x < -obs.width) obs.x = GAME_WIDTH;
      if (obs.x > GAME_WIDTH) obs.x = -obs.width;

      // Collision
      if (checkCollision(player, obs)) {
        if (player.shieldTime > 0) {
          // Shield absorbs hit
          player.shieldTime = 0;
          player.invincibleTime = 60;
          delete activePowerUpsRef.current.shield;
          powerUpsChanged = true;
          particlesRef.current.push(...createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#00f7ff'));
          obstacles.splice(i, 1);
          Sound.shieldHit();
          s.screenShake = 8;
          floatingTextsRef.current.push(
            createFloatingText(player.x + player.width / 2, player.y - 20, 'SHIELD BROKEN!', '#00f7ff'),
          );
          continue;
        }

        if (player.invincibleTime > 0) {
          continue;
        }

        // Game over
        particlesRef.current.push(
          ...createExplosion(player.x + player.width / 2, player.y + player.height / 2),
        );
        s.screenShake = 18;
        Sound.collision();
        endGame();
        return;
      }

      // Near miss
      const nearBox = {
        x: obs.x - 17,
        y: obs.y - 17,
        width: obs.width + 34,
        height: obs.height + 34,
      };
      if (s.nearMissCooldown <= 0 && !obs.nearMissed && checkCollision(player, nearBox)) {
        obs.nearMissed = true;
        s.nearMissCooldown = 12;
        s.combo += 1;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.comboTimer = 90;
        s.nearMisses += 1;
        const bonus = 25 * diffConfig.score * (1 + s.combo * 0.1) * (s.doubleScoreTime > 0 ? 2 : 1);
        s.score += bonus;
        Sound.nearMiss();
        if (s.combo >= 3) Sound.combo(s.combo);
        floatingTextsRef.current.push(
          createFloatingText(
            obs.x + obs.width / 2,
            obs.y,
            `NEAR MISS +${Math.floor(bonus)}${s.combo > 1 ? ` x${s.combo}` : ''}`,
            s.combo >= 5 ? '#fbbf24' : '#00f7ff',
          ),
        );
      }

      // Remove off-screen
      if (obs.y > GAME_HEIGHT + 120) {
        obstacles.splice(i, 1);
        s.combo += 1;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.comboTimer = 90;
        s.score += 1 * diffConfig.score * (s.doubleScoreTime > 0 ? 2 : 1);
      }
    }

    // --- Update power-ups ---
    const powerUps = powerUpsRef.current;
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const pu = powerUps[i];
      pu.y += pu.speed * deltaTime * s.slowFactor;
      pu.rotation += pu.rotationSpeed * deltaTime;
      pu.pulse += deltaTime * 0.08;

      // Magnet pull
      if (s.magnetTime > 0) {
        const dx = player.x + player.width / 2 - (pu.x + pu.width / 2);
        const dy = player.y + player.height / 2 - (pu.y + pu.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          pu.x += (dx / dist) * 4 * deltaTime;
          pu.y += (dy / dist) * 4 * deltaTime;
        }
      }

      // Collect
      if (checkCollision(player, pu)) {
        const config = POWERUP_CONFIG[pu.type];
        activePowerUpsRef.current[pu.type] = config.duration;
        powerUpsChanged = true;
        s.powerUpsCollected += 1;

        if (pu.type === 'shield') player.shieldTime = config.duration;
        if (pu.type === 'slow') s.slowFactor = 0.4;
        if (pu.type === 'doubleScore') s.doubleScoreTime = config.duration;
        if (pu.type === 'magnet') s.magnetTime = config.duration;

        Sound.powerUp();
        particlesRef.current.push(
          ...createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, config.color),
        );
        floatingTextsRef.current.push(
          createFloatingText(pu.x + pu.width / 2, pu.y, config.label, config.color),
        );
        powerUps.splice(i, 1);
        continue;
      }

      // Remove off-screen
      if (pu.y > GAME_HEIGHT + 60) {
        powerUps.splice(i, 1);
      }
    }

    // --- Trail particles ---
    if (s.gameTime % 3 < 1) {
      particlesRef.current.push(
        ...createTrailParticles(player.x + player.width / 2, player.y + player.height),
      );
    }

    // --- Update particles ---
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.dx * deltaTime;
      p.y += p.dy * deltaTime;
      p.dy += 0.04 * deltaTime;
      p.life -= p.decay * deltaTime;
      p.size *= 0.985;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // --- Update floating texts ---
    const texts = floatingTextsRef.current;
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.y += t.vy * deltaTime;
      t.life -= 0.02 * deltaTime;
      if (t.life <= 0) texts.splice(i, 1);
    }

    // --- Screen shake ---
    if (s.screenShake > 0) s.screenShake -= 0.8 * deltaTime;

    // Emit updates (throttled — every ~6 frames)
    if (Math.floor(s.gameTime) % 6 === 0) {
      emitStats();
      if (powerUpsChanged) emitPowerUps();
    }
  }, [emitStats, emitPowerUps]);

  const endGame = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    s.paused = false;
    emitStats();
    emitPowerUps();
    callbacksRef.current.onGameOver({
      score: s.score,
      level: s.level,
      stage: s.stage,
      survivalTime: s.gameTime / 60,
      combo: s.combo,
      maxCombo: s.maxCombo,
      nearMisses: s.nearMisses,
      powerUpsCollected: s.powerUpsCollected,
    });
  }, [emitStats, emitPowerUps]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { playerName: pName, avatarEmoji: aEmoji, avatarImage: aImg, avatarLoaded: aLoaded } = propsRef.current;

    ctx.save();

    if (s.screenShake > 0) {
      const sx = (Math.random() - 0.5) * s.screenShake;
      const sy = (Math.random() - 0.5) * s.screenShake;
      ctx.translate(sx, sy);
    }

    drawBackground(ctx, GAME_WIDTH, GAME_HEIGHT, s.gameTime, starsRef.current);
    drawPlayer(ctx, playerRef.current, pName, aImg, aLoaded, aEmoji, s.gameTime);
    obstaclesRef.current.forEach((o) => drawObstacle(ctx, o));
    powerUpsRef.current.forEach((pu) => drawPowerUp(ctx, pu, s.gameTime));
    drawParticles(ctx, particlesRef.current);
    drawFloatingTexts(ctx, floatingTextsRef.current);

    ctx.restore();
  }, []);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.paused = true;
    Sound.pause();
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.paused = false;
    s.lastTime = performance.now();
    Sound.resume();
  }, []);

  const exit = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    s.paused = false;
    s.keyLeft = false;
    s.keyRight = false;
    cancelAnimationFrame(s.animationFrame);
    resetGame();
    callbacksRef.current.onExit();
  }, [resetGame]);

  const setMove = useCallback((dir: 'left' | 'right', active: boolean) => {
    const s = stateRef.current;
    if (dir === 'left') s.keyLeft = active;
    if (dir === 'right') s.keyRight = active;
  }, []);

  useImperativeHandle(ref, () => ({ start, pause, resume, exit, setMove }), [start, pause, resume, exit, setMove]);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        s.keyLeft = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        s.keyRight = true;
        e.preventDefault();
      }
      if (e.code === 'Space') {
        if (s.running) {
          if (s.paused) resume();
          else pause();
        }
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (s.running) exit();
      }
      if (e.key.toLowerCase() === 'p') {
        if (s.running) {
          if (s.paused) resume();
          else pause();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') s.keyLeft = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') s.keyRight = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [pause, resume, exit]);

  // Draw initial frame
  useEffect(() => {
    draw();
  }, [draw]);

  // Responsive canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const ratio = GAME_WIDTH / GAME_HEIGHT;
      let w = rect.width;
      let h = w / ratio;
      if (h > rect.height) {
        h = rect.height;
        w = h * ratio;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, []);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="game-canvas"
      />
    </div>
  );
});

export default GameCanvas;

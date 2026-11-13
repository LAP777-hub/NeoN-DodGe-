import type { Obstacle, Player, PowerUp, Particle, Star, FloatingText } from './types';
import { POWERUP_CONFIG } from './constants';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameTime: number,
  stars: Star[],
) {
  // Deep space gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#01030f');
  bg.addColorStop(0.45, '#08051e');
  bg.addColorStop(1, '#020207');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Nebula glow
  const nebula = ctx.createRadialGradient(
    width * 0.52, height * 0.28, 20,
    width * 0.52, height * 0.28, 650,
  );
  nebula.addColorStop(0, 'rgba(0,200,255,0.18)');
  nebula.addColorStop(0.35, 'rgba(0,247,255,0.06)');
  nebula.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, width, height);

  // Second nebula — warm
  const nebula2 = ctx.createRadialGradient(
    width * 0.2, height * 0.6, 20,
    width * 0.2, height * 0.6, 500,
  );
  nebula2.addColorStop(0, 'rgba(255,0,212,0.10)');
  nebula2.addColorStop(0.4, 'rgba(255,100,0,0.04)');
  nebula2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, width, height);

  // Moving stars
  stars.forEach((star) => {
    star.y += star.speed * 0.15;
    if (star.y > height) {
      star.y = -5;
      star.x = Math.random() * width;
    }

    const pulse = (Math.sin(gameTime * 0.08 + star.brightness * 10) + 1) / 2;
    ctx.globalAlpha = 0.25 + pulse * 0.6;
    ctx.fillStyle = star.layer > 0.7 ? '#a5f3fc' : '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Galaxy grid lines
  ctx.strokeStyle = 'rgba(0,247,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = -100; x < width + 100; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.sin(gameTime * 0.02 + x) * 25, height);
    ctx.stroke();
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  playerName: string,
  avatarImage: HTMLImageElement | null,
  avatarLoaded: boolean,
  avatarEmoji: string | null,
  gameTime: number,
) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  // Shield aura
  if (player.shieldTime > 0) {
    ctx.save();
    const pulse = (Math.sin(gameTime * 0.3) + 1) / 2;
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 30 + pulse * 20;
    ctx.strokeStyle = `rgba(0,247,255,${0.4 + pulse * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, player.width * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Invincibility blink
  if (player.invincibleTime > 0 && Math.floor(gameTime * 0.3) % 2 === 0) {
    return;
  }

  ctx.save();

  // Outer energy aura
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 35;
  ctx.fillStyle = 'rgba(0,247,255,0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Avatar circle clip
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.43, 0, Math.PI * 2);
  ctx.clip();

  if (avatarLoaded && avatarImage) {
    ctx.drawImage(
      avatarImage,
      player.x + player.width * 0.07,
      player.y + player.height * 0.07,
      player.width * 0.86,
      player.height * 0.86,
    );
  } else if (avatarEmoji) {
    ctx.font = `${player.width * 0.68}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avatarEmoji, cx, cy + 2);
  } else {
    ctx.fillStyle = '#00f7ff';
    ctx.beginPath();
    ctx.arc(cx, cy, player.width * 0.43, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(cx - player.width * 0.14, cy - player.height * 0.08, 3, 0, Math.PI * 2);
    ctx.arc(cx + player.width * 0.14, cy - player.height * 0.08, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Neon ring
  ctx.save();
  ctx.shadowColor = '#ff00d4';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#00f7ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.47, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Player name
  ctx.save();
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 8;
  ctx.fillText(playerName, cx, player.y - 10);
  ctx.restore();
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  const cx = obstacle.x + obstacle.width / 2;
  const cy = obstacle.y + obstacle.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(obstacle.rotation);

  switch (obstacle.type) {
    case 'satellite': drawSatellite(ctx, obstacle); break;
    case 'kryptonite': drawKryptonite(ctx, obstacle); break;
    case 'shootingStar': drawShootingStar(ctx, obstacle); break;
    case 'rock': drawRock(ctx, obstacle); break;
    case 'rocket': drawRocket(ctx, obstacle); break;
    case 'sun': drawSun(ctx, obstacle); break;
    case 'moon': drawMoon(ctx, obstacle); break;
    case 'fireball': drawFireball(ctx, obstacle); break;
  }

  ctx.restore();
}

function drawSatellite(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#00f7ff';
  ctx.lineWidth = 2;

  ctx.fillRect(-o.width * 0.62, -o.height * 0.18, o.width * 0.36, o.height * 0.36);
  ctx.strokeRect(-o.width * 0.62, -o.height * 0.18, o.width * 0.36, o.height * 0.36);
  ctx.fillRect(o.width * 0.26, -o.height * 0.18, o.width * 0.36, o.height * 0.36);
  ctx.strokeRect(o.width * 0.26, -o.height * 0.18, o.width * 0.36, o.height * 0.36);

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-o.width * 0.24, -o.height * 0.24, o.width * 0.48, o.height * 0.48);

  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#00f7ff';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -o.height * 0.24);
  ctx.lineTo(0, -o.height * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -o.height * 0.63, 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawKryptonite(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 32;

  const grad = ctx.createLinearGradient(0, -o.height / 2, 0, o.height / 2);
  grad.addColorStop(0, '#eaff00');
  grad.addColorStop(0.45, '#39ff14');
  grad.addColorStop(1, '#00a83b');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-o.width * 0.3, o.height * 0.5);
  ctx.lineTo(-o.width * 0.48, -o.height * 0.1);
  ctx.lineTo(-o.width * 0.18, -o.height * 0.53);
  ctx.lineTo(0, -o.height * 0.12);
  ctx.lineTo(o.width * 0.28, -o.height * 0.55);
  ctx.lineTo(o.width * 0.47, o.height * 0.3);
  ctx.lineTo(o.width * 0.08, o.height * 0.52);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#c7ff7c';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawShootingStar(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 28;

  const trail = ctx.createLinearGradient(-o.width * 3, 0, 0, 0);
  trail.addColorStop(0, 'rgba(255,255,255,0)');
  trail.addColorStop(1, '#ffffff');
  ctx.strokeStyle = trail;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-o.width * 3, o.height);
  ctx.lineTo(0, 0);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, o.width * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#8b7355';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#6b6258';
  ctx.strokeStyle = '#b6a48e';
  ctx.lineWidth = 2;

  const points = 9;
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 / points) * i;
    const radius = o.width * (0.36 + Math.sin(i * 9.17) * 0.09);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#49413a';
  ctx.beginPath();
  ctx.arc(-o.width * 0.15, -o.height * 0.1, o.width * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(o.width * 0.18, o.height * 0.16, o.width * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawRocket(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#ff1744';
  ctx.shadowBlur = 28;

  const flame = ctx.createLinearGradient(0, o.height * 0.25, 0, o.height * 0.85);
  flame.addColorStop(0, '#fff700');
  flame.addColorStop(0.35, '#ff7b00');
  flame.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-o.width * 0.18, o.height * 0.22);
  ctx.lineTo(0, o.height * 0.85);
  ctx.lineTo(o.width * 0.18, o.height * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(0, -o.height * 0.55);
  ctx.quadraticCurveTo(o.width * 0.42, -o.height * 0.18, o.width * 0.3, o.height * 0.35);
  ctx.lineTo(-o.width * 0.3, o.height * 0.35);
  ctx.quadraticCurveTo(-o.width * 0.42, -o.height * 0.18, 0, -o.height * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#00f7ff';
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, -o.height * 0.15, o.width * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawSun(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#ff9800';
  ctx.shadowBlur = 45;

  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, o.width / 2);
  grad.addColorStop(0, '#fffbd1');
  grad.addColorStop(0.35, '#ffd000');
  grad.addColorStop(0.72, '#ff7b00');
  grad.addColorStop(1, '#ff3c00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, o.width / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffb300';
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 / 10) * i;
    const inner = o.width * 0.53;
    const outer = o.width * 0.72;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
}

function drawMoon(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#a5b4fc';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, 0, o.width / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  const craters = [[-0.18, -0.15, 0.09], [0.15, -0.05, 0.12], [-0.05, 0.2, 0.07], [0.2, 0.22, 0.05]];
  craters.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x * o.width, y * o.height, r * o.width, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFireball(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.shadowColor = '#ff3d00';
  ctx.shadowBlur = 38;

  const trail = ctx.createLinearGradient(0, o.height * 0.2, 0, o.height * 1.8);
  trail.addColorStop(0, 'rgba(255,170,0,0.9)');
  trail.addColorStop(0.35, 'rgba(255,70,0,0.55)');
  trail.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = trail;
  ctx.beginPath();
  ctx.moveTo(-o.width * 0.3, o.height * 0.22);
  ctx.lineTo(0, o.height * 1.75);
  ctx.lineTo(o.width * 0.3, o.height * 0.22);
  ctx.closePath();
  ctx.fill();

  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, o.width / 2);
  grad.addColorStop(0, '#fffbd1');
  grad.addColorStop(0.3, '#ffea00');
  grad.addColorStop(0.65, '#ff6d00');
  grad.addColorStop(1, '#ff1744');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, o.width / 2, 0, Math.PI * 2);
  ctx.fill();
}

const POWERUP_ICONS: Record<string, string> = {
  shield: '🛡',
  slow: '⏱',
  magnet: '🧲',
  doubleScore: '✦',
};

export function drawPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUp, gameTime: number) {
  const cx = pu.x + pu.width / 2;
  const cy = pu.y + pu.height / 2;
  const config = POWERUP_CONFIG[pu.type];
  const pulse = (Math.sin(gameTime * 0.1 + pu.pulse) + 1) / 2;
  const radius = pu.width * 0.5 * (1 + pulse * 0.1);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(pu.rotation);

  // Outer glow ring
  ctx.shadowColor = config.color;
  ctx.shadowBlur = 25 + pulse * 15;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner fill
  ctx.shadowBlur = 0;
  ctx.fillStyle = `${config.color}22`;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Icon (no rotation)
  ctx.save();
  ctx.font = `${pu.width * 0.5}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = config.color;
  ctx.shadowBlur = 10;
  ctx.fillText(POWERUP_ICONS[pu.type] ?? '?', cx, cy + 1);
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  texts.forEach((t) => {
    ctx.save();
    ctx.globalAlpha = t.life;
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 10;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });
}

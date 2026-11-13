/**
 * Procedural audio engine using the Web Audio API.
 * No audio files — every sound is synthesized in real-time.
 * Also supports user-uploaded music tracks played via an HTMLAudioElement.
 */

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let _soundEnabled = true;

// Custom music track
let _musicAudio: HTMLAudioElement | null = null;
let _musicEnabled = true;
let _musicName: string | null = null;

function getCtx(): AudioContext | null {
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  audioContext = new Ctx();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.22;
  masterGain.connect(audioContext.destination);
  return audioContext;
}

export function initAudio() {
  getCtx();
}

export function setSoundEnabled(enabled: boolean) {
  _soundEnabled = enabled;
  if (masterGain) {
    masterGain.gain.value = enabled ? 0.22 : 0;
  }
}

export function isSoundEnabled() {
  return _soundEnabled;
}

// --- Custom music controls ---

export function setMusicEnabled(enabled: boolean) {
  _musicEnabled = enabled;
  if (_musicAudio) {
    if (enabled) {
      _musicAudio.play().catch(() => {});
    } else {
      _musicAudio.pause();
    }
  }
}

export function isMusicEnabled() {
  return _musicEnabled;
}

export function getMusicName() {
  return _musicName;
}

export function loadMusicFromFile(file: File): boolean {
  try {
    if (_musicAudio) {
      _musicAudio.pause();
      _musicAudio.src = '';
      _musicAudio = null;
    }

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.35;
    audio.crossOrigin = 'anonymous';

    _musicAudio = audio;
    _musicName = file.name;
    return true;
  } catch {
    return false;
  }
}

export function removeMusic() {
  if (_musicAudio) {
    _musicAudio.pause();
    _musicAudio.src = '';
    _musicAudio = null;
  }
  _musicName = null;
}

export function startMusic() {
  if (_musicAudio && _musicEnabled) {
    getCtx(); // ensure audio context is resumed (user gesture)
    _musicAudio.play().catch(() => {});
  }
}

export function pauseMusic() {
  if (_musicAudio) {
    _musicAudio.pause();
  }
}

export function stopMusic() {
  if (_musicAudio) {
    _musicAudio.pause();
    _musicAudio.currentTime = 0;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.08,
  slideTo: number | null = null,
) {
  if (!_soundEnabled) return;
  const ctx = getCtx();
  if (!ctx || !masterGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), ctx.currentTime + duration);
  }

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc.stop(ctx.currentTime + duration + 0.03);
}

function noise(duration: number, volume = 0.1, filterFreq = 800): AudioBufferSourceNode | null {
  const ctx = getCtx();
  if (!ctx || !masterGain) return null;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  source.start();
  return source;
}

export const Sound = {
  start() {
    tone(220, 0.12, 'sawtooth', 0.06, 440);
    setTimeout(() => tone(440, 0.12, 'triangle', 0.06, 880), 100);
    setTimeout(() => tone(880, 0.18, 'triangle', 0.05, 1200), 200);
  },

  move() {
    tone(330, 0.035, 'square', 0.018, 520);
  },

  spawn(type: string) {
    const freqs: Record<string, number> = {
      satellite: 220,
      kryptonite: 480,
      shootingStar: 900,
      rock: 150,
      rocket: 300,
      sun: 90,
      moon: 180,
      fireball: 620,
    };
    const f = freqs[type] ?? 300;
    tone(f, 0.06, 'sawtooth', 0.018, f * 0.65);
  },

  nearMiss() {
    tone(900, 0.07, 'sine', 0.06, 1500);
  },

  pause() {
    tone(520, 0.12, 'triangle', 0.05, 250);
  },

  resume() {
    tone(250, 0.12, 'triangle', 0.05, 700);
  },

  collision() {
    tone(110, 0.35, 'sawtooth', 0.12, 35);
    noise(0.4, 0.15, 400);
    setTimeout(() => {
      tone(55, 0.25, 'square', 0.08, 20);
      noise(0.3, 0.08, 200);
    }, 100);
  },

  levelUp() {
    tone(440, 0.1, 'triangle', 0.05);
    setTimeout(() => tone(660, 0.1, 'triangle', 0.05), 100);
    setTimeout(() => tone(880, 0.18, 'triangle', 0.06), 200);
  },

  stageUp() {
    tone(523, 0.1, 'sine', 0.05);
    setTimeout(() => tone(659, 0.1, 'sine', 0.05), 100);
    setTimeout(() => tone(784, 0.2, 'sine', 0.06), 200);
    setTimeout(() => tone(1047, 0.25, 'sine', 0.06), 320);
  },

  powerUp() {
    tone(600, 0.08, 'square', 0.05, 900);
    setTimeout(() => tone(900, 0.08, 'square', 0.05, 1300), 80);
    setTimeout(() => tone(1300, 0.12, 'triangle', 0.04, 1800), 160);
  },

  shieldHit() {
    tone(200, 0.15, 'sawtooth', 0.1, 80);
    noise(0.2, 0.08, 600);
  },

  combo(combo: number) {
    const base = 400 + Math.min(combo * 40, 800);
    tone(base, 0.06, 'triangle', 0.04, base * 1.3);
  },
};

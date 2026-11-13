import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas, { type GameCanvasHandle } from '@/components/GameCanvas';
import StartScreen from '@/components/StartScreen';
import Hud from '@/components/Hud';
import PauseScreen from '@/components/PauseScreen';
import GameOverScreen from '@/components/GameOverScreen';
import TouchControls from '@/components/TouchControls';
import type { GameScreen, DifficultyKey, GameStats, PowerUpType } from '@/game/types';
import {
  setSoundEnabled, initAudio,
  loadMusicFromFile, removeMusic as removeMusicTrack,
  startMusic, pauseMusic, stopMusic, setMusicEnabled,
} from '@/game/audio';

const AVATAR_EMOJIS = ['🧑‍🚀', '👩‍🚀', '🤖', '👽', '🦊', '🐱', '🐉', '🦅', '⚡', '🔥'];

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [difficulty, setDifficulty] = useState<DifficultyKey>('normal');
  const [playerName, setPlayerName] = useState('NEON PILOT');
  const [avatarEmoji, setAvatarEmoji] = useState('🧑‍🚀');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [musicEnabled, setMusicEnabledState] = useState(true);

  const [stats, setStats] = useState<GameStats>({
    score: 0, level: 1, stage: 1, survivalTime: 0,
    combo: 0, maxCombo: 0, nearMisses: 0, powerUpsCollected: 0,
  });
  const [activePowerUps, setActivePowerUps] = useState<Partial<Record<PowerUpType, number>>>({});
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const gameCanvasRef = useRef<GameCanvasHandle>(null);

  // Load persisted state
  useEffect(() => {
    const savedName = localStorage.getItem('neonDodgeName');
    if (savedName) setPlayerName(savedName);

    const savedEmoji = localStorage.getItem('neonDodgeEmoji');
    if (savedEmoji) setAvatarEmoji(savedEmoji);

    const savedDiff = localStorage.getItem('neonDodgeDifficulty') as DifficultyKey | null;
    if (savedDiff) setDifficulty(savedDiff);

    const savedHigh = Number(localStorage.getItem('neonDodgeHighScore')) || 0;
    setHighScore(savedHigh);

    const savedSound = localStorage.getItem('neonDodgeSound');
    if (savedSound !== null) {
      const enabled = savedSound === 'true';
      setSoundEnabledState(enabled);
      setSoundEnabled(enabled);
    }

    // Random emoji on first load
    if (!savedEmoji) {
      const random = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
      setAvatarEmoji(random);
      localStorage.setItem('neonDodgeEmoji', random);
    }
  }, []);

  // Detect mobile
  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth < 900 ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleStart = useCallback(() => {
    initAudio();
    setScreen('playing');
    setFinalStats(null);
    setIsNewHighScore(false);
    requestAnimationFrame(() => {
      gameCanvasRef.current?.start();
      startMusic();
    });
  }, []);

  const handlePause = useCallback(() => {
    gameCanvasRef.current?.pause();
    pauseMusic();
    setScreen('paused');
  }, []);

  const handleResume = useCallback(() => {
    gameCanvasRef.current?.resume();
    startMusic();
    setScreen('playing');
  }, []);

  const goToMainMenu = useCallback(() => {
    gameCanvasRef.current?.exit();
    stopMusic();
    setScreen('start');
  }, []);

  const handleGameOver = useCallback((gameStats: GameStats) => {
    stopMusic();
    setFinalStats(gameStats);
    const finalScore = Math.floor(gameStats.score);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('neonDodgeHighScore', String(finalScore));
      setIsNewHighScore(true);
    } else {
      setIsNewHighScore(false);
    }
    setScreen('gameover');
  }, [highScore]);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handlePowerUpsChange = useCallback((pus: Partial<Record<PowerUpType, number>>) => {
    setActivePowerUps(pus);
  }, []);

  const handleMove = useCallback((dir: 'left' | 'right', active: boolean) => {
    gameCanvasRef.current?.setMove(dir, active);
  }, []);

  const handleDifficultyChange = useCallback((d: DifficultyKey) => {
    setDifficulty(d);
    localStorage.setItem('neonDodgeDifficulty', d);
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setPlayerName(name);
    localStorage.setItem('neonDodgeName', name);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      localStorage.setItem('neonDodgeSound', String(next));
      return next;
    });
  }, []);

  const handleMusicUpload = useCallback((file: File) => {
    const success = loadMusicFromFile(file);
    if (success) {
      setMusicName(file.name);
      setMusicEnabledState(true);
      setMusicEnabled(true);
    }
  }, []);

  const handleMusicRemove = useCallback(() => {
    removeMusicTrack();
    setMusicName(null);
    setMusicEnabledState(false);
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicEnabledState((prev) => {
      const next = !prev;
      setMusicEnabled(next);
      return next;
    });
  }, []);

  const handleScoreSubmitted = useCallback(() => {
    setLeaderboardRefresh((r) => r + 1);
  }, []);

  const showGameUI = screen === 'playing' || screen === 'paused' || screen === 'gameover';

  return (
    <div className="app-root">
      {showGameUI && (
        <Hud
          stats={screen === 'gameover' && finalStats ? finalStats : stats}
          difficulty={difficulty}
          playerName={playerName}
          avatarEmoji={avatarEmoji}
          activePowerUps={activePowerUps}
          onExit={goToMainMenu}
        />
      )}

      <main className="game-main">
        {showGameUI && (
          <div className="canvas-wrapper">
            <GameCanvas
              ref={gameCanvasRef}
              difficulty={difficulty}
              playerName={playerName}
              avatarEmoji={avatarEmoji}
              avatarImage={null}
              avatarLoaded={false}
              onStatsUpdate={handleStatsUpdate}
              onPowerUpsChange={handlePowerUpsChange}
              onGameOver={handleGameOver}
              onExit={goToMainMenu}
              soundEnabled={soundEnabled}
            />
          </div>
        )}

        {screen === 'start' && (
          <StartScreen
            playerName={playerName}
            difficulty={difficulty}
            highScore={highScore}
            soundEnabled={soundEnabled}
            musicName={musicName}
            musicEnabled={musicEnabled}
            avatarEmoji={avatarEmoji}
            onStart={handleStart}
            onDifficultyChange={handleDifficultyChange}
            onToggleSound={handleToggleSound}
            onNameChange={handleNameChange}
            onMusicUpload={handleMusicUpload}
            onMusicRemove={handleMusicRemove}
            onToggleMusic={handleToggleMusic}
            leaderboardRefresh={leaderboardRefresh}
          />
        )}

        {screen === 'paused' && (
          <PauseScreen onResume={handleResume} onExit={goToMainMenu} />
        )}

        {screen === 'gameover' && finalStats && (
          <GameOverScreen
            stats={finalStats}
            difficulty={difficulty}
            playerName={playerName}
            highScore={highScore}
            isNewHighScore={isNewHighScore}
            onRestart={handleStart}
            onExit={goToMainMenu}
            onSubmitted={handleScoreSubmitted}
          />
        )}
      </main>

      {showGameUI && (
        <TouchControls
          onMove={handleMove}
          onPause={handlePause}
          onExit={goToMainMenu}
          visible={isMobile && (screen === 'playing' || screen === 'paused')}
        />
      )}
    </div>
  );
}

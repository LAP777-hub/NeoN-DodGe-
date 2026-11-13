import { useState, useEffect, useRef } from 'react';
import { Rocket, Volume2, VolumeX, Zap, User, Edit3, Check, Music, Upload, X, Play, Square } from 'lucide-react';
import { DIFFICULTIES } from '@/game/constants';
import type { DifficultyKey } from '@/game/types';
import Leaderboard from './Leaderboard';

interface StartScreenProps {
  playerName: string;
  difficulty: DifficultyKey;
  highScore: number;
  soundEnabled: boolean;
  musicName: string | null;
  musicEnabled: boolean;
  avatarEmoji: string;
  onStart: () => void;
  onDifficultyChange: (d: DifficultyKey) => void;
  onToggleSound: () => void;
  onNameChange: (name: string) => void;
  onMusicUpload: (file: File) => void;
  onMusicRemove: () => void;
  onToggleMusic: () => void;
  leaderboardRefresh: number;
}

export default function StartScreen({
  playerName,
  difficulty,
  highScore,
  soundEnabled,
  musicName,
  musicEnabled,
  avatarEmoji,
  onStart,
  onDifficultyChange,
  onToggleSound,
  onNameChange,
  onMusicUpload,
  onMusicRemove,
  onToggleMusic,
  leaderboardRefresh,
}: StartScreenProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingName]);

  const saveName = () => {
    const trimmed = nameInput.trim().slice(0, 18);
    if (trimmed) {
      onNameChange(trimmed);
    } else {
      setNameInput(playerName);
    }
    setEditingName(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onMusicUpload(file);
    }
    // Reset so same file can be selected again
    e.target.value = '';
  };

  const diffKeys = Object.keys(DIFFICULTIES) as DifficultyKey[];

  return (
    <div className="screen-overlay start-screen">
      <div className="screen-content start-layout">
        {/* Left column — game card */}
        <div className="game-card">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-orbit">
              <div className="logo-core">
                <Zap size={28} fill="currentColor" />
              </div>
            </div>
            <h1 className="game-title">NeoN-DodGe</h1>
            <p className="game-subtitle">GALAXY SURVIVAL</p>
          </div>

          {/* Profile */}
          <div className="profile-section">
            <div className="profile-avatar">
              <span>{avatarEmoji}</span>
            </div>
            <div className="profile-info">
              <span className="profile-label">PILOT</span>
              {editingName ? (
                <div className="name-edit-row">
                  <input
                    ref={inputRef}
                    className="name-input"
                    value={nameInput}
                    maxLength={18}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveName();
                      if (e.key === 'Escape') {
                        setNameInput(playerName);
                        setEditingName(false);
                      }
                    }}
                    onBlur={saveName}
                  />
                  <button className="name-save-btn" onClick={saveName} type="button">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="name-display-row">
                  <strong className="profile-name">{playerName}</strong>
                  <button
                    className="name-edit-btn"
                    onClick={() => {
                      setNameInput(playerName);
                      setEditingName(true);
                    }}
                    type="button"
                    aria-label="Edit name"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="difficulty-section">
            <label className="section-label">
              <User size={14} /> DIFFICULTY
            </label>
            <div className="difficulty-grid">
              {diffKeys.map((key) => {
                const d = DIFFICULTIES[key];
                const active = difficulty === key;
                const colorMap: Record<DifficultyKey, string> = {
                  easy: '#39ff14',
                  normal: '#00f7ff',
                  hard: '#fbbf24',
                  extreme: '#ff1744',
                };
                const color = colorMap[key];
                return (
                  <button
                    key={key}
                    className={`diff-btn ${active ? 'diff-btn-active' : ''}`}
                    style={active ? { borderColor: color, color, boxShadow: `0 0 20px ${color}44` } : {}}
                    onClick={() => onDifficultyChange(key)}
                    type="button"
                  >
                    <span className="diff-btn-label">{d.label}</span>
                    {key === 'extreme' && <Zap size={10} fill="currentColor" />}
                  </button>
                );
              })}
            </div>
            <p className="diff-description">{DIFFICULTIES[difficulty].description}</p>
          </div>

          {/* Music upload section */}
          <div className="music-section">
            <label className="section-label">
              <Music size={14} /> MUSIC
            </label>
            {musicName ? (
              <div className="music-loaded">
                <div className="music-info">
                  <Music size={16} className="music-icon-active" />
                  <span className="music-name" title={musicName}>{musicName}</span>
                </div>
                <div className="music-controls">
                  <button
                    className="music-play-btn"
                    onClick={onToggleMusic}
                    type="button"
                    aria-label={musicEnabled ? 'Pause music' : 'Play music'}
                  >
                    {musicEnabled ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                  <button
                    className="music-remove-btn"
                    onClick={onMusicRemove}
                    type="button"
                    aria-label="Remove music"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="music-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload size={16} />
                <span>UPLOAD YOUR SONG</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* High score */}
          <div className="high-score-section">
            <span className="high-score-label">HIGH SCORE</span>
            <strong className="high-score-value">{highScore.toLocaleString()}</strong>
          </div>

          {/* Start button */}
          <button className="start-button" onClick={onStart} type="button">
            <Rocket size={20} />
            <span>LAUNCH</span>
          </button>

          {/* Sound toggle */}
          <button className="sound-toggle" onClick={onToggleSound} type="button">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>

          {/* Controls hint */}
          <div className="controls-hint">
            <div className="control-key">
              <span className="key-badge">←</span>
              <span className="key-badge">→</span>
              <span>MOVE</span>
            </div>
            <div className="control-key">
              <span className="key-badge">SPACE</span>
              <span>PAUSE</span>
            </div>
            <div className="control-key">
              <span className="key-badge">ESC</span>
              <span>MAIN MENU</span>
            </div>
            <div className="control-key mobile-only">
              <span>Touch controls on mobile</span>
            </div>
          </div>
        </div>

        {/* Right column — leaderboard */}
        <Leaderboard currentDifficulty={difficulty} refreshTrigger={leaderboardRefresh} />
      </div>
    </div>
  );
}

import { Pause, Play, Home } from 'lucide-react';

interface PauseScreenProps {
  onResume: () => void;
  onExit: () => void;
}

export default function PauseScreen({ onResume, onExit }: PauseScreenProps) {
  return (
    <div className="screen-overlay pause-screen">
      <div className="overlay-card pause-card">
        <div className="pause-icon">
          <Pause size={36} fill="currentColor" />
        </div>
        <h2 className="pause-title">GAME PAUSED</h2>
        <p className="pause-hint">Press SPACE or tap to continue</p>
        <div className="pause-actions">
          <button className="primary-btn" onClick={onResume} type="button">
            <Play size={18} fill="currentColor" />
            <span>RESUME</span>
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

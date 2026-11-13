import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Home } from 'lucide-react';

interface TouchControlsProps {
  onMove: (direction: 'left' | 'right', active: boolean) => void;
  onPause: () => void;
  onExit: () => void;
  visible: boolean;
}

export default function TouchControls({ onMove, onPause, onExit, visible }: TouchControlsProps) {
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);

  const handlePress = useCallback(
    (dir: 'left' | 'right', active: boolean) => {
      onMove(dir, active);
    },
    [onMove],
  );

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const bind = (el: HTMLButtonElement, dir: 'left' | 'right') => {
      const start = (e: TouchEvent | PointerEvent) => {
        e.preventDefault();
        handlePress(dir, true);
      };
      const end = (e: TouchEvent | PointerEvent) => {
        e.preventDefault();
        handlePress(dir, false);
      };
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
      el.addEventListener('touchcancel', end, { passive: false });
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointerleave', end);
      el.addEventListener('pointercancel', end);
    };

    bind(left, 'left');
    bind(right, 'right');

    return () => {
      // cleanup is handled by component unmount
    };
  }, [handlePress]);

  if (!visible) return null;

  return (
    <div className="touch-controls">
      <button
        ref={leftRef}
        className="touch-btn touch-btn-left"
        aria-label="Move left"
        type="button"
      >
        <ChevronLeft size={32} strokeWidth={3} />
      </button>

      <div className="touch-center-btns">
        <button
          className="touch-btn touch-btn-pause"
          onClick={onPause}
          aria-label="Pause"
          type="button"
        >
          <Pause size={20} strokeWidth={3} />
        </button>

        <button
          className="touch-btn touch-btn-home"
          onClick={onExit}
          aria-label="Back to main menu"
          type="button"
        >
          <Home size={20} strokeWidth={3} />
        </button>
      </div>

      <button
        ref={rightRef}
        className="touch-btn touch-btn-right"
        aria-label="Move right"
        type="button"
      >
        <ChevronRight size={32} strokeWidth={3} />
      </button>
    </div>
  );
}

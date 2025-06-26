
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface LetterTileProps {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
  onLetterChange: (letter: string) => void;
  onStateChange: (state: 'unknown' | 'absent' | 'present' | 'correct') => void;
}

const LetterTile = ({ letter, state, onLetterChange, onStateChange }: LetterTileProps) => {
  const [isActive, setIsActive] = useState(false);

  const getStateStyles = () => {
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500 shadow-lg';
      case 'present':
        return 'bg-yellow-500 text-white border-yellow-500 shadow-lg';
      case 'absent':
        return 'bg-slate-400 text-white border-slate-400 shadow-lg';
      default:
        return 'bg-white border-slate-300 text-slate-700 hover:border-slate-400';
    }
  };

  const cycleState = () => {
    const states: Array<'unknown' | 'absent' | 'present' | 'correct'> = ['unknown', 'absent', 'present', 'correct'];
    const currentIndex = states.indexOf(state);
    const nextState = states[(currentIndex + 1) % states.length];
    onStateChange(nextState);
  };

  const getButtonText = () => {
    if (state === 'unknown') return 'Tap';
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <div className="flex flex-col items-center" style={{ marginBottom: 'clamp(0.5rem, 2vw, 2rem)' }}>
      <Input
        value={letter}
        onChange={() => {}} // Disabled - letters are set from the main word input
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`text-center font-bold uppercase border-2 transition-all duration-200 ${getStateStyles()} ${
          isActive ? 'ring-2 ring-blue-300 ring-offset-2' : ''
        }`}
        style={{
          width: 'clamp(32px, 8vw, 64px)',
          height: 'clamp(32px, 8vw, 64px)',
          fontSize: 'clamp(0.875rem, 3vw, 1.5rem)'
        }}
        maxLength={1}
        readOnly
      />
      <button
        onClick={cycleState}
        className="text-slate-500 hover:text-slate-700 transition-colors duration-200 text-center"
        style={{
          marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)',
          fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)',
          maxWidth: 'clamp(32px, 8vw, 64px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default LetterTile;

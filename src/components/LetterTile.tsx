
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

  return (
    <div className="relative mb-8">
      <Input
        value={letter}
        onChange={() => {}} // Disabled - letters are set from the main word input
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold uppercase border-2 transition-all duration-200 ${getStateStyles()} ${
          isActive ? 'ring-2 ring-blue-300 ring-offset-2' : ''
        }`}
        maxLength={1}
        readOnly
      />
      <button
        onClick={cycleState}
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200 whitespace-nowrap"
      >
        {state === 'unknown' ? 'Click to set' : state}
      </button>
    </div>
  );
};

export default LetterTile;

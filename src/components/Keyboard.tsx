
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface KeyboardProps {
  excludedLetters: Set<string>;
  onLetterExclude: (letter: string) => void;
  onLetterInclude: (letter: string) => void;
}

const Keyboard = ({ excludedLetters, onLetterExclude, onLetterInclude }: KeyboardProps) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const toggleLetter = (letter: string) => {
    if (excludedLetters.has(letter)) {
      onLetterInclude(letter);
    } else {
      onLetterExclude(letter);
    }
  };

  const clearAll = () => {
    excludedLetters.forEach(letter => onLetterInclude(letter));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.25rem, 2vw, 0.75rem)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-700" style={{ fontSize: 'clamp(0.75rem, 3vw, 1.125rem)' }}>
          Exclude Letters
        </h3>
        <Button 
          onClick={clearAll}
          variant="outline" 
          size="sm"
          className="transition-colors"
          style={{ 
            fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
            padding: 'clamp(0.125rem, 1vw, 0.25rem) clamp(0.25rem, 2vw, 0.5rem)',
            height: 'clamp(20px, 4vw, 32px)'
          }}
        >
          Clear All
        </Button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.125rem, 1vw, 0.5rem)' }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center" style={{ gap: 'clamp(0.125rem, 0.5vw, 0.25rem)' }}>
            {row.map((letter) => (
              <Button
                key={letter}
                onClick={() => toggleLetter(letter)}
                variant={excludedLetters.has(letter) ? "default" : "outline"}
                size="sm"
                className={`p-0 font-semibold transition-all duration-200 ${
                  excludedLetters.has(letter) 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'hover:bg-slate-100'
                }`}
                style={{ 
                  width: 'clamp(20px, 4vw, 32px)',
                  height: 'clamp(20px, 4vw, 32px)',
                  fontSize: 'clamp(0.625rem, 2vw, 0.75rem)'
                }}
              >
                {excludedLetters.has(letter) ? (
                  <X style={{ width: 'clamp(8px, 2vw, 12px)', height: 'clamp(8px, 2vw, 12px)' }} />
                ) : (
                  letter
                )}
              </Button>
            ))}
          </div>
        ))}
      </div>
      
      {excludedLetters.size > 0 && (
        <div className="text-slate-600 text-center" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)' }}>
          Excluded: {Array.from(excludedLetters).sort().join(', ')}
        </div>
      )}
    </div>
  );
};

export default Keyboard;

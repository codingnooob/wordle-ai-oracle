
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-700">Exclude Letters</h3>
        <Button 
          onClick={clearAll}
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          Clear All
        </Button>
      </div>
      
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((letter) => (
              <Button
                key={letter}
                onClick={() => toggleLetter(letter)}
                variant={excludedLetters.has(letter) ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 text-sm font-semibold transition-all duration-200 ${
                  excludedLetters.has(letter) 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'hover:bg-slate-100'
                }`}
              >
                {excludedLetters.has(letter) ? (
                  <X className="h-3 w-3" />
                ) : (
                  letter
                )}
              </Button>
            ))}
          </div>
        ))}
      </div>
      
      {excludedLetters.size > 0 && (
        <div className="text-sm text-slate-600 text-center">
          Excluded: {Array.from(excludedLetters).sort().join(', ')}
        </div>
      )}
    </div>
  );
};

export default Keyboard;

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PositionExclusionProps {
  wordLength: number;
  guessData: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>;
  positionExclusions: Map<string, Set<number>>;
  onPositionExclusionChange: (letter: string, position: number, excluded: boolean) => void;
}

const PositionExclusion = ({ 
  wordLength, 
  guessData, 
  positionExclusions, 
  onPositionExclusionChange 
}: PositionExclusionProps) => {
  // Get all present letters from current guess
  const presentLetters = guessData
    .filter(tile => tile.state === 'present' && tile.letter.trim() !== '')
    .map(tile => tile.letter.toUpperCase());
  
  // Get unique present letters
  const uniquePresentLetters = Array.from(new Set(presentLetters));
  
  // Don't render if no present letters
  if (uniquePresentLetters.length === 0) {
    return null;
  }

  // Get positions where each present letter currently appears (automatically excluded)
  const getCurrentPositions = (letter: string): Set<number> => {
    const positions = new Set<number>();
    guessData.forEach((tile, index) => {
      if (tile.letter.toUpperCase() === letter && tile.state === 'present') {
        positions.add(index);
      }
    });
    return positions;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-muted-foreground">Exclude positions</h3>
        <p className="text-sm text-muted-foreground">Click positions to exclude for present letters</p>
      </div>
      
      <div className="space-y-3">
        {uniquePresentLetters.map(letter => {
          const currentPositions = getCurrentPositions(letter);
          const manualExclusions = positionExclusions.get(letter) || new Set();
          const allExcluded = new Set([...currentPositions, ...manualExclusions]);
          
          return (
            <div key={letter} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground min-w-[20px]">{letter}:</span>
                <div className="flex gap-1">
                  {Array.from({ length: wordLength }, (_, index) => {
                    const isCurrentPosition = currentPositions.has(index);
                    const isManuallyExcluded = manualExclusions.has(index);
                    const isExcluded = allExcluded.has(index);
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={`
                          w-8 h-8 p-0 text-xs font-medium transition-colors
                          ${isExcluded 
                            ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-700 dark:text-yellow-300' 
                            : 'hover:bg-muted'
                          }
                          ${isCurrentPosition 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'cursor-pointer'
                          }
                        `}
                        onClick={() => {
                          if (!isCurrentPosition) {
                            onPositionExclusionChange(letter, index, !isManuallyExcluded);
                          }
                        }}
                        disabled={isCurrentPosition}
                        title={
                          isCurrentPosition 
                            ? `Position ${index + 1} (current position - cannot toggle)`
                            : isManuallyExcluded 
                              ? `Position ${index + 1} (manually excluded - click to include)`
                              : `Position ${index + 1} (click to exclude)`
                        }
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Yellow positions are excluded. Current positions (from your guess) cannot be toggled.
      </p>
    </div>
  );
};

export default PositionExclusion;
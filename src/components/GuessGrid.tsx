
import LetterTile from '@/components/LetterTile';

interface GuessGridProps {
  guessData: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>;
  onStateChange: (index: number, state: 'unknown' | 'absent' | 'present' | 'correct') => void;
}

const GuessGrid = ({ guessData, onStateChange }: GuessGridProps) => {
  return (
    <div 
      className="flex justify-center flex-wrap"
      style={{ 
        gap: 'clamp(0.125rem, 1vw, 0.5rem)',
        marginBottom: 'clamp(1rem, 4vw, 3rem)'
      }}
    >
      {guessData.map((tile, index) => (
        <LetterTile
          key={index}
          letter={tile.letter}
          state={tile.state}
          onLetterChange={() => {}} // Disabled since we use the word input now
          onStateChange={(state) => onStateChange(index, state)}
        />
      ))}
    </div>
  );
};

export default GuessGrid;

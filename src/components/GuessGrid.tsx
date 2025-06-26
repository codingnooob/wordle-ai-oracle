
import LetterTile from '@/components/LetterTile';

interface GuessGridProps {
  guessData: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>;
  onStateChange: (index: number, state: 'unknown' | 'absent' | 'present' | 'correct') => void;
}

const GuessGrid = ({ guessData, onStateChange }: GuessGridProps) => {
  return (
    <div className="flex gap-3 sm:gap-4 justify-center flex-wrap mb-12">
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

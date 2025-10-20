
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface WordLengthSelectorProps {
  wordLength: number;
  setWordLength: (length: number) => void;
  onLengthChange: () => void;
}

const WordLengthSelector = ({ wordLength, setWordLength, onLengthChange }: WordLengthSelectorProps) => {
  const lengths = [3, 4, 5, 6, 7, 8, 9, 10];

  const handleLengthChange = (length: number) => {
    setWordLength(length);
    onLengthChange();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
      <Label className="font-semibold text-slate-700" style={{ fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
        Word Length
      </Label>
      <div className="flex flex-wrap" style={{ gap: 'clamp(0.125rem, 1vw, 0.5rem)' }}>
        {lengths.map((length) => (
          <Button
            key={length}
            variant={wordLength === length ? "default" : "outline"}
            size="sm"
            onClick={() => handleLengthChange(length)}
            className={`transition-all duration-200 ${
              wordLength === length 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
            style={{ 
              minWidth: 'clamp(24px, 5vw, 40px)',
              height: 'clamp(24px, 5vw, 36px)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
            }}
          >
            {length}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WordLengthSelector;

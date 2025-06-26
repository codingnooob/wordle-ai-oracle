
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface WordLengthSelectorProps {
  wordLength: number;
  setWordLength: (length: number) => void;
  onLengthChange: () => void;
}

const WordLengthSelector = ({ wordLength, setWordLength, onLengthChange }: WordLengthSelectorProps) => {
  const lengths = [3, 4, 5, 6, 7, 8];

  const handleLengthChange = (length: number) => {
    setWordLength(length);
    onLengthChange();
  };

  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold text-slate-700">Word Length</Label>
      <div className="flex flex-wrap gap-2">
        {lengths.map((length) => (
          <Button
            key={length}
            variant={wordLength === length ? "default" : "outline"}
            size="sm"
            onClick={() => handleLengthChange(length)}
            className={`min-w-[40px] transition-all duration-200 ${
              wordLength === length 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            {length}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WordLengthSelector;


import { Input } from '@/components/ui/input';

interface WordInputProps {
  value: string;
  onChange: (value: string) => void;
  wordLength: number;
}

const WordInput = ({ value, onChange, wordLength }: WordInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase().slice(0, wordLength);
    onChange(upperValue);
  };

  return (
    <div>
      <label htmlFor="word-input" className="block text-sm font-medium text-slate-600 mb-2">
        Type your word:
      </label>
      <Input
        id="word-input"
        value={value}
        onChange={handleChange}
        placeholder={`Enter ${wordLength}-letter word`}
        className="text-center text-lg font-semibold uppercase tracking-wider"
        maxLength={wordLength}
      />
    </div>
  );
};

export default WordInput;

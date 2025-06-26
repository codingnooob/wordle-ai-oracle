
import React from 'react';
import { Input } from '@/components/ui/input';
import { SecurityUtils } from '@/utils/security/securityUtils';

interface WordInputProps {
  value: string;
  onChange: (value: string) => void;
  wordLength: number;
}

const WordInput = ({ value, onChange, wordLength }: WordInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Security: Validate and sanitize input
    const validation = SecurityUtils.validateWordInput(input);
    
    if (validation.isValid) {
      // Limit to word length
      const limitedInput = validation.sanitized.slice(0, wordLength);
      onChange(limitedInput);
    } else if (input === '') {
      // Allow empty input for clearing
      onChange('');
    }
    // Invalid inputs are silently rejected for security
  };

  return (
    <div className="space-y-2">
      <label htmlFor="word-input" className="block text-sm font-medium text-slate-700">
        Enter your {wordLength}-letter guess
      </label>
      <Input
        id="word-input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={`${'_'.repeat(wordLength)}`}
        maxLength={wordLength}
        className="text-center text-lg font-mono uppercase tracking-wider"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
};

export default WordInput;

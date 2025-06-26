
import { useState, useEffect } from 'react';
import WordInput from '@/components/WordInput';
import GuessGrid from '@/components/GuessGrid';
import Keyboard from '@/components/Keyboard';
import AnalysisControls from '@/components/AnalysisControls';
import MLStatusIndicator from '@/components/MLStatusIndicator';
import { useMLStatus } from '@/hooks/useMLStatus';
import { mlWordleAnalyzer } from '@/utils/mlWordleAnalyzer';

interface WordleBoardProps {
  wordLength: number;
  guessData: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>;
  setGuessData: (data: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>) => void;
  setSolutions: (solutions: Array<{word: string, probability: number}>) => void;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
}

const WordleBoard = ({ wordLength, guessData, setGuessData, setSolutions, analyzing, setAnalyzing }: WordleBoardProps) => {
  const [wordInput, setWordInput] = useState('');
  const [excludedLetters, setExcludedLetters] = useState<Set<string>>(new Set());
  const { mlStatus, cacheStatus } = useMLStatus();

  useEffect(() => {
    // Initialize guess data when word length changes
    const newGuessData = Array(wordLength).fill(null).map(() => ({
      letter: '',
      state: 'unknown' as const
    }));
    setGuessData(newGuessData);
    setWordInput('');
    setExcludedLetters(new Set());
  }, [wordLength, setGuessData]);

  const handleWordInputChange = (value: string) => {
    setWordInput(value);
    
    // Update guess data with the typed letters
    const newGuessData = [...guessData];
    for (let i = 0; i < wordLength; i++) {
      newGuessData[i] = {
        ...newGuessData[i],
        letter: value[i] || ''
      };
    }
    setGuessData(newGuessData);
  };

  const updateState = (index: number, state: 'unknown' | 'absent' | 'present' | 'correct') => {
    const newGuessData = [...guessData];
    newGuessData[index] = { ...newGuessData[index], state };
    setGuessData(newGuessData);
  };

  const handleLetterExclude = (letter: string) => {
    setExcludedLetters(prev => new Set([...prev, letter]));
  };

  const handleLetterInclude = (letter: string) => {
    setExcludedLetters(prev => {
      const newSet = new Set(prev);
      newSet.delete(letter);
      return newSet;
    });
  };

  const handleAnalyze = async () => {
    const hasValidInput = guessData.every(tile => tile.letter.trim() !== '' && tile.state !== 'unknown');
    if (!hasValidInput) return;

    setAnalyzing(true);
    try {
      console.log('Starting real ML analysis for guess:', guessData);
      console.log('Excluded letters:', Array.from(excludedLetters));
      
      // Use real ML analyzer
      const solutions = await mlWordleAnalyzer.analyzeGuess(guessData, wordLength, excludedLetters);
      setSolutions(solutions);
      
      console.log('Real ML Analysis complete:', solutions);
    } catch (error) {
      console.error('Real ML Analysis failed:', error);
      setSolutions([]);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearBoard = () => {
    const newGuessData = Array(wordLength).fill(null).map(() => ({
      letter: '',
      state: 'unknown' as const
    }));
    setGuessData(newGuessData);
    setSolutions([]);
    setWordInput('');
    setExcludedLetters(new Set());
  };

  // Updated validation: ALL tiles must have letters AND ALL tiles must have a state other than 'unknown'
  const hasValidInput = guessData.every(tile => tile.letter.trim() !== '' && tile.state !== 'unknown');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-700">Enter your guess</h2>
          <MLStatusIndicator mlStatus={mlStatus} cacheStatus={cacheStatus} />
        </div>
        
        <div className="space-y-4">
          <WordInput
            value={wordInput}
            onChange={handleWordInputChange}
            wordLength={wordLength}
          />
          
          <GuessGrid
            guessData={guessData}
            onStateChange={updateState}
          />
        </div>
      </div>

      <Keyboard
        excludedLetters={excludedLetters}
        onLetterExclude={handleLetterExclude}
        onLetterInclude={handleLetterInclude}
      />

      <AnalysisControls
        onAnalyze={handleAnalyze}
        onClear={clearBoard}
        analyzing={analyzing}
        hasValidInput={hasValidInput}
      />
    </div>
  );
};

export default WordleBoard;


import { useState, useEffect } from 'react';
import LetterTile from '@/components/LetterTile';
import { Button } from '@/components/ui/button';
import { wordleAnalyzer } from '@/utils/wordleAnalyzer';
import { Sparkles, RotateCcw } from 'lucide-react';

interface WordleBoardProps {
  wordLength: number;
  guessData: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>;
  setGuessData: (data: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>) => void;
  setSolutions: (solutions: Array<{word: string, probability: number}>) => void;
}

const WordleBoard = ({ wordLength, guessData, setGuessData, setSolutions }: WordleBoardProps) => {
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // Initialize guess data when word length changes
    const newGuessData = Array(wordLength).fill(null).map(() => ({
      letter: '',
      state: 'unknown' as const
    }));
    setGuessData(newGuessData);
  }, [wordLength, setGuessData]);

  const updateLetter = (index: number, letter: string) => {
    const newGuessData = [...guessData];
    newGuessData[index] = { ...newGuessData[index], letter: letter.toUpperCase() };
    setGuessData(newGuessData);
  };

  const updateState = (index: number, state: 'unknown' | 'absent' | 'present' | 'correct') => {
    const newGuessData = [...guessData];
    newGuessData[index] = { ...newGuessData[index], state };
    setGuessData(newGuessData);
  };

  const handleAnalyze = async () => {
    const hasValidInput = guessData.some(tile => tile.letter.trim() !== '');
    if (!hasValidInput) return;

    setAnalyzing(true);
    try {
      // Clear any existing history and analyze just the current guess
      wordleAnalyzer.clearHistory();
      wordleAnalyzer.addGuess(guessData);
      
      // Analyze current state (now async)
      const solutions = await wordleAnalyzer.analyzeCurrentState(wordLength);
      setSolutions(solutions);
      
      console.log('Analysis complete:', solutions);
    } catch (error) {
      console.error('Analysis failed:', error);
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
    wordleAnalyzer.clearHistory();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-700">Enter your guess</h2>
        </div>
        
        <div className="flex gap-2 justify-center flex-wrap">
          {guessData.map((tile, index) => (
            <LetterTile
              key={index}
              letter={tile.letter}
              state={tile.state}
              onLetterChange={(letter) => updateLetter(index, letter)}
              onStateChange={(state) => updateState(index, state)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <Button 
          onClick={handleAnalyze}
          disabled={analyzing || !guessData.some(tile => tile.letter.trim() !== '')}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {analyzing ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Find Solutions
            </>
          )}
        </Button>
        
        <Button 
          onClick={clearBoard}
          variant="outline"
          className="px-6 py-2 font-medium hover:bg-slate-50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default WordleBoard;

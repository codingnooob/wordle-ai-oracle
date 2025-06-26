import { useState, useEffect } from 'react';
import LetterTile from '@/components/LetterTile';
import Keyboard from '@/components/Keyboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mlWordleAnalyzer } from '@/utils/mlWordleAnalyzer';
import { Sparkles, RotateCcw, Brain } from 'lucide-react';

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
  const [mlStatus, setMlStatus] = useState({ isTraining: false, dataSize: 0 });
  const [cacheStatus, setCacheStatus] = useState<{ cached: boolean; age?: string; size?: number }>({ cached: false });

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

  useEffect(() => {
    // Check ML training status and cache status periodically
    const statusInterval = setInterval(() => {
      const status = mlWordleAnalyzer.getTrainingStatus();
      setMlStatus(status);
      
      // Get cache status if available
      if (typeof (mlWordleAnalyzer as any).getCacheStatus === 'function') {
        const cache = (mlWordleAnalyzer as any).getCacheStatus();
        setCacheStatus(cache);
      }
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  const handleWordInputChange = (value: string) => {
    const upperValue = value.toUpperCase().slice(0, wordLength);
    setWordInput(upperValue);
    
    // Update guess data with the typed letters
    const newGuessData = [...guessData];
    for (let i = 0; i < wordLength; i++) {
      newGuessData[i] = {
        ...newGuessData[i],
        letter: upperValue[i] || ''
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
    const hasValidInput = guessData.some(tile => tile.letter.trim() !== '');
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-700">Enter your guess</h2>
          <div className="text-xs text-slate-500 space-y-1">
            {mlStatus.dataSize > 0 && (
              <div>Real ML trained on {mlStatus.dataSize.toLocaleString()} words</div>
            )}
            {cacheStatus.cached && (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                Cached ({cacheStatus.age}, {cacheStatus.size?.toLocaleString()} words)
              </div>
            )}
            {!cacheStatus.cached && mlStatus.dataSize > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Live scraping active
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="word-input" className="block text-sm font-medium text-slate-600 mb-2">
              Type your word:
            </label>
            <Input
              id="word-input"
              value={wordInput}
              onChange={(e) => handleWordInputChange(e.target.value)}
              placeholder={`Enter ${wordLength}-letter word`}
              className="text-center text-lg font-semibold uppercase tracking-wider"
              maxLength={wordLength}
            />
          </div>
          
          <div className="flex gap-2 justify-center flex-wrap">
            {guessData.map((tile, index) => (
              <LetterTile
                key={index}
                letter={tile.letter}
                state={tile.state}
                onLetterChange={() => {}} // Disabled since we use the word input now
                onStateChange={(state) => updateState(index, state)}
              />
            ))}
          </div>
        </div>
      </div>

      <Keyboard
        excludedLetters={excludedLetters}
        onLetterExclude={handleLetterExclude}
        onLetterInclude={handleLetterInclude}
      />

      <div className="flex gap-3 justify-center flex-wrap">
        <Button 
          onClick={handleAnalyze}
          disabled={analyzing || !guessData.some(tile => tile.letter.trim() !== '')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {analyzing ? (
            <>
              <Brain className="mr-2 h-4 w-4 animate-pulse" />
              Real AI Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Real AI Predict
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

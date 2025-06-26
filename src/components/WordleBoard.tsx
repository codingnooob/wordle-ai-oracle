
import { useState, useEffect } from 'react';
import LetterTile from '@/components/LetterTile';
import { Button } from '@/components/ui/button';
import { wordleAnalyzer } from '@/utils/wordleAnalyzer';
import { Sparkles, History, RotateCcw } from 'lucide-react';

interface WordleBoardProps {
  wordLength: number;
  guessData: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>;
  setGuessData: (data: Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>) => void;
  setSolutions: (solutions: Array<{word: string, probability: number}>) => void;
}

const WordleBoard = ({ wordLength, guessData, setGuessData, setSolutions }: WordleBoardProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [persistentMode, setPersistentMode] = useState(false);
  const [guessHistory, setGuessHistory] = useState<any[]>([]);

  useEffect(() => {
    // Initialize guess data when word length changes
    const newGuessData = Array(wordLength).fill(null).map(() => ({
      letter: '',
      state: 'unknown' as const
    }));
    setGuessData(newGuessData);
  }, [wordLength, setGuessData]);

  useEffect(() => {
    // Update history display
    setGuessHistory(wordleAnalyzer.getHistory());
  }, [analyzing]);

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
      // Add current guess to analyzer
      wordleAnalyzer.addGuess(guessData);
      
      // Analyze current state
      const solutions = wordleAnalyzer.analyzeCurrentState(wordLength);
      setSolutions(solutions);
      
      // Update history display
      setGuessHistory(wordleAnalyzer.getHistory());
      
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
  };

  const togglePersistentMode = () => {
    const newMode = !persistentMode;
    setPersistentMode(newMode);
    wordleAnalyzer.setPersistentMode(newMode);
    setGuessHistory(wordleAnalyzer.getHistory());
  };

  const clearHistory = () => {
    wordleAnalyzer.clearHistory();
    setGuessHistory([]);
    setSolutions([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-700">Enter your guess</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={persistentMode ? "default" : "outline"}
              size="sm"
              onClick={togglePersistentMode}
              className="text-xs"
            >
              <History className="mr-1 h-3 w-3" />
              Persistent Mode
            </Button>
            {guessHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Clear History ({guessHistory.length})
              </Button>
            )}
          </div>
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

      {persistentMode && guessHistory.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-600">Previous Guesses:</h3>
          <div className="space-y-1">
            {guessHistory.slice(0, -1).map((history, historyIndex) => (
              <div key={historyIndex} className="flex gap-1 justify-center">
                {history.guess.map((tile: any, tileIndex: number) => (
                  <div
                    key={tileIndex}
                    className={`w-8 h-8 text-xs font-bold uppercase border-2 flex items-center justify-center rounded ${
                      tile.state === 'correct' ? 'bg-green-500 text-white border-green-500' :
                      tile.state === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                      tile.state === 'absent' ? 'bg-slate-400 text-white border-slate-400' :
                      'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {tile.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

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
          Clear
        </Button>
      </div>
    </div>
  );
};

export default WordleBoard;

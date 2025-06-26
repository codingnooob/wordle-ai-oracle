
import { useState } from 'react';
import WordleBoard from '@/components/WordleBoard';
import WordLengthSelector from '@/components/WordLengthSelector';
import SolutionsList from '@/components/SolutionsList';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [wordLength, setWordLength] = useState(5);
  const [guessData, setGuessData] = useState<Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>>([]);
  const [solutions, setSolutions] = useState<Array<{word: string, probability: number}>>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Wordle Solver
          </h1>
          <p className="text-slate-600 text-lg">
            Enter your guess and let AI find the most likely solutions
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <WordLengthSelector 
                wordLength={wordLength} 
                setWordLength={setWordLength}
                onLengthChange={() => {
                  setGuessData([]);
                  setSolutions([]);
                }}
              />
            </Card>
            
            <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <WordleBoard 
                wordLength={wordLength}
                guessData={guessData}
                setGuessData={setGuessData}
                setSolutions={setSolutions}
              />
            </Card>
          </div>
          
          <div>
            <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm h-fit">
              <SolutionsList solutions={solutions} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

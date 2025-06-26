
import { useState, useEffect } from 'react';
import WordleBoard from '@/components/WordleBoard';
import WordLengthSelector from '@/components/WordLengthSelector';
import SolutionsList from '@/components/SolutionsList';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { mlTrainingService } from '@/utils/ml/mlTrainingService';

const Index = () => {
  const [wordLength, setWordLength] = useState(5);
  const [guessData, setGuessData] = useState<Array<{letter: string, state: 'unknown' | 'absent' | 'present' | 'correct'}>>([]);
  const [solutions, setSolutions] = useState<Array<{word: string, probability: number}>>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // Start continuous scraping immediately when the page loads
    console.log('🚀 Starting continuous ML training on page load...');
    mlTrainingService.startBackgroundTraining();

    // Cleanup on unmount
    return () => {
      mlTrainingService.stopBackgroundTraining();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
              Wordle Solver
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Enter your guess and let AI find the most likely solutions
            </p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card className="p-4 sm:p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <WordLengthSelector 
                  wordLength={wordLength} 
                  setWordLength={setWordLength}
                  onLengthChange={() => {
                    setGuessData([]);
                    setSolutions([]);
                    setAnalyzing(false);
                  }}
                />
              </Card>
              
              <Card className="p-4 sm:p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <WordleBoard 
                  wordLength={wordLength}
                  guessData={guessData}
                  setGuessData={setGuessData}
                  setSolutions={setSolutions}
                  analyzing={analyzing}
                  setAnalyzing={setAnalyzing}
                />
              </Card>
            </div>
            
            <div>
              <Card className="p-4 sm:p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm h-fit">
                <SolutionsList solutions={solutions} analyzing={analyzing} />
              </Card>
            </div>
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;

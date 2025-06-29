
import { useState, useEffect } from 'react';
import WordleBoard from '@/components/WordleBoard';
import WordLengthSelector from '@/components/WordLengthSelector';
import SolutionsList from '@/components/SolutionsList';
import Header from '@/components/Header';
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
      <Header />
      
      <div className="w-full" style={{ padding: 'clamp(0.25rem, 2vw, 1rem)' }}>
        <div className="mx-auto" style={{ 
          maxWidth: 'clamp(280px, 95vw, 1200px)',
          paddingLeft: 'clamp(0.25rem, 2vw, 1rem)',
          paddingRight: 'clamp(0.25rem, 2vw, 1rem)'
        }}>
          <div className="text-center" style={{ marginBottom: 'clamp(0.5rem, 3vw, 2rem)' }}>
            <h1 className="font-bold text-slate-800" style={{ 
              fontSize: 'clamp(1.125rem, 4vw, 2.25rem)',
              marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
            }}>
              Wordle AI Oracle
            </h1>
            <p className="text-slate-600" style={{ fontSize: 'clamp(0.75rem, 2vw, 1.125rem)' }}>
              Enter your guess and let AI find the most likely solutions
            </p>
          </div>
          
          <div className="grid xl:grid-cols-2" style={{ gap: 'clamp(0.25rem, 2vw, 1.5rem)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.25rem, 2vw, 1.5rem)' }}>
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm" style={{ padding: 'clamp(0.5rem, 3vw, 1.5rem)' }}>
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
              
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm" style={{ padding: 'clamp(0.5rem, 3vw, 1.5rem)' }}>
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
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm h-fit" style={{ padding: 'clamp(0.5rem, 3vw, 1.5rem)' }}>
                <SolutionsList solutions={solutions} analyzing={analyzing} />
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;

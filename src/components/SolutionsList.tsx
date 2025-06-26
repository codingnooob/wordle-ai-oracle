
import { Trophy, Target, Brain, Zap, AlertCircle } from 'lucide-react';

interface SolutionsListProps {
  solutions: Array<{word: string, probability: number}>;
  analyzing: boolean;
}

const SolutionsList = ({ solutions, analyzing }: SolutionsListProps) => {
  const getIcon = (index: number) => {
    const iconSize = { width: 'clamp(12px, 3vw, 20px)', height: 'clamp(12px, 3vw, 20px)' };
    if (index === 0) return <Trophy style={iconSize} className="text-yellow-500" />;
    if (index === 1) return <Target style={iconSize} className="text-orange-500" />;
    return <Brain style={iconSize} className="text-purple-500" />;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600 bg-green-50';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-50';
    if (probability >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-purple-600 bg-purple-50';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 3vw, 1rem)' }}>
      <h2 className="font-semibold text-slate-700 flex items-center" style={{ 
        fontSize: 'clamp(0.875rem, 3vw, 1.25rem)',
        gap: 'clamp(0.25rem, 1vw, 0.5rem)'
      }}>
        <Brain style={{ width: 'clamp(12px, 3vw, 20px)', height: 'clamp(12px, 3vw, 20px)' }} className={`text-purple-500 ${analyzing ? 'animate-pulse' : ''}`} />
        ML Predictions
        {analyzing && (
          <span className="text-slate-500 font-normal" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
            - AI Thinking...
          </span>
        )}
      </h2>
      
      {analyzing ? (
        <div className="text-center text-slate-500" style={{ 
          paddingTop: 'clamp(1rem, 4vw, 2rem)',
          paddingBottom: 'clamp(1rem, 4vw, 2rem)'
        }}>
          <Brain style={{ 
            width: 'clamp(24px, 6vw, 48px)', 
            height: 'clamp(24px, 6vw, 48px)',
            margin: '0 auto',
            marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)'
          }} className="text-purple-400 animate-pulse" />
          <p className="font-medium" style={{ fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
            AI is analyzing your guess...
          </p>
          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
            This may take a few seconds
          </p>
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center text-slate-500" style={{ 
          paddingTop: 'clamp(1rem, 4vw, 2rem)',
          paddingBottom: 'clamp(1rem, 4vw, 2rem)'
        }}>
          <AlertCircle style={{ 
            width: 'clamp(24px, 6vw, 48px)', 
            height: 'clamp(24px, 6vw, 48px)',
            margin: '0 auto',
            marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)'
          }} className="text-slate-300" />
          <p className="font-medium" style={{ fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
            No predictions found
          </p>
          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
            Try adjusting your guess or excluded letters
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.25rem, 2vw, 0.75rem)',
          maxHeight: 'clamp(256px, 50vh, 384px)'
        }}>
          {solutions.map((solution, index) => (
            <div 
              key={solution.word} 
              className="flex items-center justify-between bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-200 shadow-sm rounded-lg"
              style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)' }}
            >
              <div className="flex items-center" style={{ gap: 'clamp(0.25rem, 2vw, 0.75rem)' }}>
                {getIcon(index)}
                <span className="font-mono font-semibold text-slate-700 uppercase tracking-wider" style={{ 
                  fontSize: 'clamp(0.875rem, 3vw, 1.125rem)'
                }}>
                  {solution.word}
                </span>
              </div>
              <div className={`rounded-full font-medium ${getProbabilityColor(solution.probability)}`} style={{ 
                padding: 'clamp(0.125rem, 1vw, 0.25rem) clamp(0.5rem, 2vw, 0.75rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
              }}>
                {solution.probability.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolutionsList;

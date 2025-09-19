
import { Trophy, Target, Brain, Zap, AlertCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SolutionsListProps {
  solutions: Array<{word: string, probability: number}>;
  analyzing: boolean;
}

const SolutionsList = ({ solutions, analyzing }: SolutionsListProps) => {
  const [displayCount, setDisplayCount] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const displayedSolutions = solutions.slice(0, displayCount);
  const hasMore = solutions.length > displayCount;
  
  const handleShowMore = async () => {
    setLoadingMore(true);
    // Simulate slight delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setDisplayCount(prev => Math.min(prev + 15, solutions.length));
    setLoadingMore(false);
  };

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
        <div>
          <div className="overflow-y-auto" style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(0.25rem, 2vw, 0.75rem)',
            maxHeight: 'clamp(256px, 50vh, 384px)'
          }}>
            {displayedSolutions.map((solution, index) => (
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
          
          {/* Results count and Show More button */}
          {solutions.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="text-slate-500 text-center" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                Showing {displayedSolutions.length} of {solutions.length} predictions
              </div>
              
              {hasMore && (
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                    padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)'
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Brain style={{ width: 'clamp(12px, 3vw, 16px)', height: 'clamp(12px, 3vw, 16px)' }} className="animate-pulse" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown style={{ width: 'clamp(12px, 3vw, 16px)', height: 'clamp(12px, 3vw, 16px)' }} />
                      Show More ({Math.min(15, solutions.length - displayCount)} more)
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolutionsList;

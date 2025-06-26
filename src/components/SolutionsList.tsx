
import { Trophy, Target, Brain, Zap, AlertCircle } from 'lucide-react';

interface SolutionsListProps {
  solutions: Array<{word: string, probability: number}>;
  analyzing: boolean;
}

const SolutionsList = ({ solutions, analyzing }: SolutionsListProps) => {
  const getIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Target className="h-5 w-5 text-orange-500" />;
    return <Brain className="h-5 w-5 text-purple-500" />;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600 bg-green-50';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-50';
    if (probability >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-purple-600 bg-purple-50';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
        <Brain className={`h-5 w-5 text-purple-500 ${analyzing ? 'animate-pulse' : ''}`} />
        ML Predictions
        {analyzing && <span className="text-sm text-slate-500 font-normal">- AI Thinking...</span>}
      </h2>
      
      {analyzing ? (
        <div className="text-center py-8 text-slate-500">
          <Brain className="h-12 w-12 mx-auto mb-3 text-purple-400 animate-pulse" />
          <p className="text-lg font-medium">AI is analyzing your guess...</p>
          <p className="text-sm">This may take a few seconds</p>
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No predictions found</p>
          <p className="text-sm">Try adjusting your guess or excluded letters</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {solutions.map((solution, index) => (
            <div 
              key={solution.word} 
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {getIcon(index)}
                <span className="font-mono text-lg font-semibold text-slate-700 uppercase tracking-wider">
                  {solution.word}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProbabilityColor(solution.probability)}`}>
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

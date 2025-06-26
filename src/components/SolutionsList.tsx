
import { Trophy, Target, Zap } from 'lucide-react';

interface SolutionsListProps {
  solutions: Array<{word: string, probability: number}>;
}

const SolutionsList = ({ solutions }: SolutionsListProps) => {
  const getIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Target className="h-5 w-5 text-orange-500" />;
    return <Zap className="h-5 w-5 text-blue-500" />;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-50';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-50';
    if (probability >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-500" />
        AI Solutions
      </h2>
      
      {solutions.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Target className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>Enter your guess and click "Find Solutions" to see AI predictions</p>
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


import { Button } from '@/components/ui/button';
import { Brain, RotateCcw } from 'lucide-react';

interface AnalysisControlsProps {
  onAnalyze: () => void;
  onClear: () => void;
  analyzing: boolean;
  hasValidInput: boolean;
}

const AnalysisControls = ({ onAnalyze, onClear, analyzing, hasValidInput }: AnalysisControlsProps) => {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <Button 
        onClick={onAnalyze}
        disabled={analyzing || !hasValidInput}
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
        onClick={onClear}
        variant="outline"
        className="px-6 py-2 font-medium hover:bg-slate-50"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
};

export default AnalysisControls;

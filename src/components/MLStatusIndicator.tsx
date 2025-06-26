
interface MLStatusIndicatorProps {
  mlStatus: { isTraining: boolean; dataSize: number };
  cacheStatus: { cached: boolean; age?: string; size?: number; totalScraped?: number };
}

const MLStatusIndicator = ({ mlStatus, cacheStatus }: MLStatusIndicatorProps) => {
  const handleClearCache = () => {
    if (typeof (window as any).mlTrainingService !== 'undefined') {
      (window as any).mlTrainingService.clearCache();
    } else {
      // Fallback: clear cache directly
      localStorage.removeItem('ml_scraped_data');
      console.log('🗑️ Cache cleared manually');
    }
    // Force a page refresh to trigger new scraping
    window.location.reload();
  };

  const formatWordCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const getCorpusUtilization = (): string => {
    if (cacheStatus.totalScraped && cacheStatus.size && cacheStatus.totalScraped > 0) {
      const percentage = ((cacheStatus.size / cacheStatus.totalScraped) * 100).toFixed(1);
      return `${percentage}% of corpus`;
    }
    return '';
  };

  return (
    <div className="text-xs text-slate-500 space-y-1">
      {mlStatus.dataSize > 0 && (
        <div className="flex items-center justify-between">
          <span>
            Full corpus ML trained on {formatWordCount(mlStatus.dataSize)} words
            {cacheStatus.totalScraped && cacheStatus.totalScraped > mlStatus.dataSize && (
              <span className="text-blue-600 ml-1">
                ({getCorpusUtilization()} • {formatWordCount(cacheStatus.totalScraped)} available)
              </span>
            )}
          </span>
          <button
            onClick={handleClearCache}
            className="ml-2 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            title="Clear cache and refresh full corpus"
          >
            🔄 Refresh
          </button>
        </div>
      )}
      {cacheStatus.cached && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          Full corpus cached ({cacheStatus.age}, {formatWordCount(cacheStatus.size || 0)} words)
          {cacheStatus.totalScraped && (
            <span className="text-blue-600">
              • {formatWordCount(cacheStatus.totalScraped)} total available
            </span>
          )}
        </div>
      )}
      {!cacheStatus.cached && mlStatus.dataSize > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Live full corpus scraping (30s intervals)
        </div>
      )}
      {!cacheStatus.cached && mlStatus.dataSize === 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          Initializing full corpus ML training...
        </div>
      )}
    </div>
  );
};

export default MLStatusIndicator;

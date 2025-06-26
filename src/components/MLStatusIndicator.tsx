
interface MLStatusIndicatorProps {
  mlStatus: { isTraining: boolean; dataSize: number };
  cacheStatus: { cached: boolean; age?: string; size?: number };
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

  return (
    <div className="text-xs text-slate-500 space-y-1">
      {mlStatus.dataSize > 0 && (
        <div className="flex items-center justify-between">
          <span>Real ML trained on {mlStatus.dataSize.toLocaleString()} words</span>
          <button
            onClick={handleClearCache}
            className="ml-2 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            title="Clear cache and refresh data"
          >
            🔄 Refresh
          </button>
        </div>
      )}
      {cacheStatus.cached && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          Cached ({cacheStatus.age}, {cacheStatus.size?.toLocaleString()} words)
        </div>
      )}
      {!cacheStatus.cached && mlStatus.dataSize > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Live scraping active (30s intervals)
        </div>
      )}
      {!cacheStatus.cached && mlStatus.dataSize === 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          Initializing ML training...
        </div>
      )}
    </div>
  );
};

export default MLStatusIndicator;

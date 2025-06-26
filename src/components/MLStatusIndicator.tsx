
interface MLStatusIndicatorProps {
  mlStatus: { isTraining: boolean; dataSize: number };
  cacheStatus: { cached: boolean; age?: string; size?: number };
}

const MLStatusIndicator = ({ mlStatus, cacheStatus }: MLStatusIndicatorProps) => {
  return (
    <div className="text-xs text-slate-500 space-y-1">
      {mlStatus.dataSize > 0 && (
        <div>Real ML trained on {mlStatus.dataSize.toLocaleString()} words</div>
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
          Live scraping active (5s intervals)
        </div>
      )}
    </div>
  );
};

export default MLStatusIndicator;

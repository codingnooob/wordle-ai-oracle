
import { useState, useEffect } from 'react';
import { mlWordleAnalyzer } from '@/utils/mlWordleAnalyzer';

export const useMLStatus = () => {
  const [mlStatus, setMlStatus] = useState({ isTraining: false, dataSize: 0 });
  const [cacheStatus, setCacheStatus] = useState<{ cached: boolean; age?: string; size?: number }>({ cached: false });

  useEffect(() => {
    // Check ML training status and cache status very frequently (every 2 seconds)
    const statusInterval = setInterval(() => {
      const status = mlWordleAnalyzer.getTrainingStatus();
      setMlStatus(status);
      
      // Get cache status if available
      if (typeof (mlWordleAnalyzer as any).getCacheStatus === 'function') {
        const cache = (mlWordleAnalyzer as any).getCacheStatus();
        setCacheStatus(cache);
      }
    }, 2000);

    return () => clearInterval(statusInterval);
  }, []);

  return { mlStatus, cacheStatus };
};

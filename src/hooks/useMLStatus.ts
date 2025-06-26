
import { useState, useEffect } from 'react';
import { mlWordleAnalyzer } from '@/utils/mlWordleAnalyzer';
import { mlTrainingService } from '@/utils/ml/mlTrainingService';

export const useMLStatus = () => {
  const [mlStatus, setMlStatus] = useState({ isTraining: false, dataSize: 0 });
  const [cacheStatus, setCacheStatus] = useState<{ cached: boolean; age?: string; size?: number }>({ cached: false });

  useEffect(() => {
    // Expose mlTrainingService globally for manual cache clearing
    (window as any).mlTrainingService = mlTrainingService;

    // Check ML training status and cache status more frequently (every 1 second for better responsiveness)
    const statusInterval = setInterval(() => {
      const status = mlWordleAnalyzer.getTrainingStatus();
      setMlStatus(status);
      
      // Get cache status if available
      if (typeof (mlWordleAnalyzer as any).getCacheStatus === 'function') {
        const cache = (mlWordleAnalyzer as any).getCacheStatus();
        setCacheStatus(cache);
      }
    }, 1000); // Increased frequency to 1 second for better real-time updates

    return () => {
      clearInterval(statusInterval);
      // Clean up global reference
      delete (window as any).mlTrainingService;
    };
  }, []);

  return { mlStatus, cacheStatus };
};

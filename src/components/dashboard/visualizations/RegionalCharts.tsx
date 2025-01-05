import { useState, useEffect } from 'react';
import { ChartConfig, RegionalData } from './types';
import { cn } from '@/lib/utils';

interface RegionalChartsProps {
  config: ChartConfig;
  data: RegionalData[];
  className?: string;
}

export const RegionalCharts = ({ 
  config,
  data,
  className 
}: RegionalChartsProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const [localData, setLocalData] = useState<RegionalData[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      const cached = localStorage.getItem('regional-charts');
      if (cached) {
        try {
          setLocalData(JSON.parse(cached));
        } catch (err) {
          setError(new Error('Failed to load cached data'));
        }
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      setLocalData(data);
    };

    // Check initial network status
    if (!navigator.onLine) {
      handleOffline();
    }

    // Add event listeners for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cache data for offline use
    try {
      localStorage.setItem('regional-charts', JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to cache regional charts data');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [data]);

  if (error) {
    return (
      <div role="alert" className="text-red-500">
        Error loading chart data: {error.message}
      </div>
    );
  }

  const displayData = isOffline ? localData : data;

  return (
    <div 
      className={cn(
        'p-4 rounded-lg',
        config.darkMode ? 'bg-gray-800 text-white' : 'bg-white',
        isOffline && 'opacity-75',
        className
      )}
      role="region"
      aria-label={`${config.title} Chart`}
    >
      {isOffline && (
        <div className="text-sm text-yellow-500 mb-2">
          Offline mode - showing cached data
        </div>
      )}
      {/* Chart implementation */}
      {/* Add your preferred charting library implementation here */}
    </div>
  );
}; 



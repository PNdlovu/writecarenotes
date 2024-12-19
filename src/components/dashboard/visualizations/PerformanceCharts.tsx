import { useState, useEffect } from 'react';
import { ChartConfig, PerformanceData } from './types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PerformanceChartsProps {
  config: ChartConfig;
  data: PerformanceData;
  className?: string;
}

const MetricCard = ({ 
  label, 
  value, 
  target, 
  className 
}: { 
  label: string;
  value: number;
  target?: number;
  className?: string;
}) => {
  const percentage = target ? (value / target) * 100 : value;
  const status = target ? (
    percentage >= 100 ? 'success' :
    percentage >= 75 ? 'warning' : 'danger'
  ) : 'info';

  return (
    <div className={cn('p-4 rounded-lg bg-white', className)}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          'text-sm',
          status === 'success' && 'text-green-600',
          status === 'warning' && 'text-yellow-600',
          status === 'danger' && 'text-red-600'
        )}>
          {value}{target ? `/${target}` : '%'}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          status === 'success' && 'bg-green-200',
          status === 'warning' && 'bg-yellow-200',
          status === 'danger' && 'bg-red-200'
        )}
      />
    </div>
  );
};

export const PerformanceCharts = ({ config, data, className }: PerformanceChartsProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const [localData, setLocalData] = useState<PerformanceData>(data);

  useEffect(() => {
    if (!navigator.onLine) {
      const cached = localStorage.getItem('performance-data');
      if (cached) {
        setLocalData(JSON.parse(cached));
      }
      setIsOffline(true);
    } else {
      setLocalData(data);
      localStorage.setItem('performance-data', JSON.stringify(data));
    }
  }, [data]);

  return (
    <div className={cn(
      'space-y-6 p-4 rounded-lg',
      config.darkMode ? 'bg-gray-800 text-white' : 'bg-white',
      isOffline && 'opacity-75',
      className
    )}>
      {isOffline && (
        <div className="text-sm text-yellow-500 mb-2">
          Offline mode - showing cached data
        </div>
      )}

      <div role="region" aria-label="Staffing Metrics">
        <h3 className="text-lg font-semibold mb-4">Staffing Performance</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Staff to Resident Ratio"
            value={localData.staffingRatio}
            target={data.targetResponseTime}
          />
          <MetricCard
            label="Response Time"
            value={localData.avgResponseTime}
            target={data.targetResponseTime}
          />
        </div>
      </div>

      <div role="region" aria-label="Quality Metrics">
        <h3 className="text-lg font-semibold mb-4">Quality Indicators</h3>
        <div className="space-y-4">
          {localData.metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.name}
              value={metric.value}
              target={metric.target}
            />
          ))}
        </div>
      </div>

      {localData.trends && (
        <div role="region" aria-label="Performance Trends">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <div className="h-64">
            {/* Implement trend chart here using your preferred charting library */}
          </div>
        </div>
      )}

      <div role="region" aria-label="Quality Score">
        <h3 className="text-lg font-semibold mb-4">Overall Quality Score</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Quality Score</span>
            <span className="font-semibold">{localData.qualityScore}%</span>
          </div>
          <Progress 
            value={localData.qualityScore} 
            className={cn(
              'h-3',
              localData.qualityScore >= 90 ? 'bg-green-500' :
              localData.qualityScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
            )}
          />
        </div>
      </div>
    </div>
  );
}; 



import { useState, useEffect } from 'react';
import { ChartConfig, MetricData, LocaleConfig } from './types';
import { cn } from '@/lib/utils';

interface DashboardMetricsProps {
  config: ChartConfig;
  metrics: MetricData[];
  locale: LocaleConfig;
  className?: string;
}

export const DashboardMetrics = ({ config, metrics, locale, className }: DashboardMetricsProps) => {
  const [localMetrics, setLocalMetrics] = useState(metrics);
  const [isOffline, setIsOffline] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale.language, {
      style: 'currency',
      currency: locale.currency
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale.language, {
      timeZone: locale.timezone,
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  useEffect(() => {
    // Offline support
    if (!navigator.onLine) {
      const cached = localStorage.getItem('dashboard-metrics');
      if (cached) {
        setLocalMetrics(JSON.parse(cached));
      }
      setIsOffline(true);
    } else {
      setLocalMetrics(metrics);
      localStorage.setItem('dashboard-metrics', JSON.stringify(metrics));
    }
  }, [metrics]);

  return (
    <div className={cn(
      'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
      config.darkMode ? 'text-white' : '',
      className
    )}>
      {localMetrics.map((metric) => (
        <div 
          key={metric.id}
          className={cn(
            'p-4 rounded-lg',
            config.darkMode ? 'bg-gray-800' : 'bg-white',
            'shadow-sm'
          )}
          role="region"
          aria-label={metric.name}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{metric.name}</h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs',
              metric.status === 'success' ? 'bg-green-100 text-green-800' :
              metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            )}>
              {metric.status}
            </span>
          </div>
          
          <div className="text-2xl font-bold mb-2">
            {metric.validation?.schema.type === 'currency' 
              ? formatCurrency(metric.value)
              : metric.value}
          </div>

          {metric.trend && (
            <div className={cn(
              'text-sm',
              metric.trend > 0 ? 'text-green-600' :
              metric.trend < 0 ? 'text-red-600' :
              'text-gray-600'
            )}>
              {metric.trend > 0 ? '↑' : metric.trend < 0 ? '↓' : '→'}
              {Math.abs(metric.trend)}%
            </div>
          )}

          {metric.description && (
            <p className="text-sm text-gray-500 mt-2">
              {metric.description}
            </p>
          )}

          {metric.target && (
            <div className="mt-2">
              <div className="text-sm text-gray-500 mb-1">
                Target: {metric.target}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className={cn(
                    'h-full rounded-full',
                    metric.value >= metric.target ? 'bg-green-500' :
                    metric.value >= metric.target * 0.75 ? 'bg-yellow-500' :
                    'bg-red-500'
                  )}
                  style={{ width: `${(metric.value / metric.target) * 100}%` }}
                />
              </div>
            </div>
          )}

          {metric.audit && (
            <div className="text-xs text-gray-500 mt-2">
              Last updated: {formatDate(new Date(metric.audit[0].timestamp))}
            </div>
          )}
        </div>
      ))}

      {isOffline && (
        <div className="col-span-full text-sm text-yellow-500">
          Offline mode - showing cached data
        </div>
      )}
    </div>
  );
}; 



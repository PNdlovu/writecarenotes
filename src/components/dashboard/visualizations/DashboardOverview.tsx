import { useState, useEffect } from 'react';
import { ChartConfig, MetricData, LocaleConfig } from './types';
import { cn } from '@/lib/utils';

interface DashboardOverviewProps {
  config: ChartConfig;
  metrics: MetricData[];
  locale: LocaleConfig;
  className?: string;
}

export const DashboardOverview = ({ config, metrics, locale, className }: DashboardOverviewProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn(
      'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
      config.darkMode ? 'text-white' : '',
      className
    )}>
      {isOffline && (
        <div className="col-span-full text-sm text-yellow-500 bg-yellow-50 p-2 rounded">
          Offline mode - showing cached data
        </div>
      )}

      {localMetrics.map((metric) => (
        <div 
          key={metric.id}
          className={cn(
            'p-4 rounded-lg shadow-sm',
            config.darkMode ? 'bg-gray-800' : 'bg-white'
          )}
          role="region"
          aria-label={metric.name}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{metric.name}</h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs',
              getStatusColor(metric.status)
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
              'text-sm flex items-center gap-1',
              metric.trend > 0 ? 'text-green-600' :
              metric.trend < 0 ? 'text-red-600' :
              'text-gray-600'
            )}>
              {metric.trend > 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : metric.trend < 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
              <span>{Math.abs(metric.trend)}%</span>
            </div>
          )}

          {metric.description && (
            <p className={cn(
              'text-sm mt-2',
              config.darkMode ? 'text-gray-300' : 'text-gray-500'
            )}>
              {metric.description}
            </p>
          )}

          {metric.audit && (
            <div className={cn(
              'text-xs mt-2',
              config.darkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Last updated: {formatDate(new Date(metric.audit[0].timestamp))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 



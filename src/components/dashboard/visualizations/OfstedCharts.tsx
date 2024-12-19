import { useState, useEffect } from 'react';
import { ChartConfig, OfstedMetrics, OfstedRating } from './types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OfstedChartsProps {
  config: ChartConfig;
  metrics: OfstedMetrics;
  className?: string;
}

const getRatingColor = (rating: 1 | 2 | 3 | 4) => {
  switch (rating) {
    case 1: return 'bg-green-500'; // Outstanding
    case 2: return 'bg-blue-500';  // Good
    case 3: return 'bg-yellow-500'; // Requires Improvement
    case 4: return 'bg-red-500';   // Inadequate
    default: return 'bg-gray-500';
  }
};

const getRatingText = (rating: 1 | 2 | 3 | 4) => {
  switch (rating) {
    case 1: return 'Outstanding';
    case 2: return 'Good';
    case 3: return 'Requires Improvement';
    case 4: return 'Inadequate';
    default: return 'Not Rated';
  }
};

const RatingIndicator = ({ 
  label, 
  rating,
  className 
}: { 
  label: string; 
  rating: 1 | 2 | 3 | 4;
  className?: string;
}) => (
  <div className={cn('flex items-center justify-between p-2', className)}>
    <span className="text-sm font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <div className={cn(
        'px-3 py-1 rounded-full text-white text-sm',
        getRatingColor(rating)
      )}>
        {getRatingText(rating)}
      </div>
    </div>
  </div>
);

export const OfstedCharts = ({ config, metrics, className }: OfstedChartsProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const [localMetrics, setLocalMetrics] = useState<OfstedMetrics>(metrics);

  useEffect(() => {
    // Handle offline support
    if (!navigator.onLine) {
      const cached = localStorage.getItem('ofsted-metrics');
      if (cached) {
        setLocalMetrics(JSON.parse(cached));
      }
      setIsOffline(true);
    } else {
      setLocalMetrics(metrics);
      localStorage.setItem('ofsted-metrics', JSON.stringify(metrics));
    }
  }, [metrics]);

  const { currentRating, complianceStatus } = localMetrics;

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

      <div role="region" aria-label="Overall Ofsted Rating">
        <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
        <RatingIndicator 
          label="Overall Rating"
          rating={currentRating.overall}
          className="bg-gray-100 rounded-lg"
        />
      </div>

      <div role="region" aria-label="Category Ratings">
        <h3 className="text-lg font-semibold mb-4">Category Ratings</h3>
        <div className="space-y-2">
          <RatingIndicator 
            label="Effectiveness"
            rating={currentRating.categories.effectiveness}
          />
          <RatingIndicator 
            label="Leadership"
            rating={currentRating.categories.leadership}
          />
          <RatingIndicator 
            label="Care"
            rating={currentRating.categories.care}
          />
          <RatingIndicator 
            label="Responsiveness"
            rating={currentRating.categories.responsiveness}
          />
          <RatingIndicator 
            label="Safety"
            rating={currentRating.categories.safety}
          />
        </div>
      </div>

      <div role="region" aria-label="Compliance Status">
        <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(complianceStatus).map(([key, value]) => (
            <div 
              key={key}
              className={cn(
                'p-3 rounded-lg',
                value ? 'bg-green-100' : 'bg-red-100',
                config.darkMode && (value ? 'bg-green-900' : 'bg-red-900')
              )}
            >
              <span className="capitalize">{key}</span>
              <div className={cn(
                'text-sm font-medium',
                value ? 'text-green-700' : 'text-red-700',
                config.darkMode && 'text-white'
              )}>
                {value ? 'Compliant' : 'Non-Compliant'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div role="region" aria-label="Inspection Details">
        <h3 className="text-lg font-semibold mb-4">Inspection Information</h3>
        <div className="space-y-2 text-sm">
          <p>Last Inspection: {new Date(currentRating.lastInspection).toLocaleDateString()}</p>
          {currentRating.nextInspectionDue && (
            <p>Next Inspection Due: {new Date(currentRating.nextInspectionDue).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {currentRating.improvementActions && currentRating.improvementActions.length > 0 && (
        <div role="region" aria-label="Improvement Actions">
          <h3 className="text-lg font-semibold mb-4">Improvement Actions</h3>
          <ul className="list-disc pl-5 space-y-2">
            {currentRating.improvementActions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};



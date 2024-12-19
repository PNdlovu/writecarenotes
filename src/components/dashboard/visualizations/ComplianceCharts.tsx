import { useEffect, useState } from 'react';
import { ChartConfig, ComplianceMetrics } from './types';
import { Progress, ProgressProps } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ComplianceBarProps extends ProgressProps {
  label: string;
  value: number;
  animationState: string;
}

const ComplianceBar = ({ label, value, animationState, ...props }: ComplianceBarProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}%</span>
    </div>
    <Progress 
      value={value}
      {...props}
      className={cn(
        'transition-all duration-500',
        animationState === 'complete' && 'scale-100',
        animationState === 'loading' && 'scale-95',
        props.className
      )}
    />
  </div>
);

export const ComplianceCharts = ({
  config,
  metrics,
}: {
  config: ChartConfig;
  metrics: ComplianceMetrics;
}) => {
  const [animationState, setAnimationState] = useState('idle');
  const [localMetrics, setLocalMetrics] = useState<ComplianceMetrics>(metrics);

  useEffect(() => {
    // Handle offline support
    if (!navigator.onLine) {
      const cached = localStorage.getItem('compliance-metrics');
      if (cached) {
        setLocalMetrics(JSON.parse(cached));
      }
    } else {
      setLocalMetrics(metrics);
      localStorage.setItem('compliance-metrics', JSON.stringify(metrics));
    }

    // Animation sequence
    setAnimationState('loading');
    const timer = setTimeout(() => {
      setAnimationState('complete');
    }, 500);
    return () => clearTimeout(timer);
  }, [metrics]);

  const complianceData = [
    { key: 'cqc', label: 'CQC Compliance', value: metrics.cqc },
    { key: 'ciw', label: 'CIW Compliance', value: metrics.ciw },
    { key: 'rqia', label: 'RQIA Compliance', value: metrics.rqia },
    { key: 'careInspectorate', label: 'Care Inspectorate', value: metrics.careInspectorate },
    { key: 'hiqa', label: 'HIQA Compliance', value: metrics.hiqa },
  ];

  return (
    <div 
      className={cn(
        'space-y-4 p-4 rounded-lg',
        config.darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      )}
      role="region"
      aria-label="Compliance Metrics"
    >
      {complianceData.map(({ key, label, value }) => 
        value !== undefined && (
          <ComplianceBar
            key={key}
            label={label}
            value={value}
            animationState={animationState}
            aria-label={`${label} progress indicator`}
          />
        )
      )}
    </div>
  );
}; 



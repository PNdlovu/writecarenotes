'use client';

import { useEffect, useState } from 'react';
import { ChartConfig, ComplianceMetrics } from './types';
import { Progress, ProgressProps } from '@/components/ui/Progress';
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
  metrics = [],
  locale,
}: {
  config: ChartConfig;
  metrics: any[];
  locale?: {
    language: string;
    region: string;
    currency: string;
    timezone: string;
  };
}) => {
  const [animationState, setAnimationState] = useState('idle');
  const [localMetrics, setLocalMetrics] = useState<ComplianceMetrics>({
    cqc: 0,
    ciw: 0,
    rqia: 0,
    careInspectorate: 0,
    hiqa: 0
  });

  useEffect(() => {
    // Handle offline support
    if (!navigator.onLine) {
      const cached = localStorage.getItem('compliance-metrics');
      if (cached) {
        setLocalMetrics(JSON.parse(cached));
      }
    } else {
      // If metrics array is empty, use default values
      const metricsData = metrics.length > 0 ? metrics[0] : localMetrics;
      setLocalMetrics(metricsData);
      localStorage.setItem('compliance-metrics', JSON.stringify(metricsData));
    }

    // Animation sequence
    setAnimationState('loading');
    const timer = setTimeout(() => {
      setAnimationState('complete');
    }, 500);
    return () => clearTimeout(timer);
  }, [metrics]);

  // Filter compliance data based on region
  const complianceData = [
    { key: 'cqc', label: 'CQC Compliance', value: localMetrics.cqc ?? 0, regions: ['ENGLAND'] },
    { key: 'ciw', label: 'CIW Compliance', value: localMetrics.ciw ?? 0, regions: ['WALES'] },
    { key: 'rqia', label: 'RQIA Compliance', value: localMetrics.rqia ?? 0, regions: ['NIRELAND'] },
    { key: 'careInspectorate', label: 'Care Inspectorate', value: localMetrics.careInspectorate ?? 0, regions: ['SCOTLAND'] },
    { key: 'hiqa', label: 'HIQA Compliance', value: localMetrics.hiqa ?? 0, regions: ['IRELAND'] },
  ].filter(item => !locale?.region || item.regions.includes(locale.region));

  return (
    <div 
      className={cn(
        'space-y-4 p-4 rounded-lg',
        config.darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      )}
      role="region"
      aria-label="Compliance Metrics"
    >
      {complianceData.map(({ key, label, value }) => (
        <ComplianceBar
          key={key}
          label={label}
          value={value}
          animationState={animationState}
          aria-label={`${label} progress indicator`}
        />
      ))}
    </div>
  );
};

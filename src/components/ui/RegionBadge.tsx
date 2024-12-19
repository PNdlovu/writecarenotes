'use client';

import { Badge } from './badge';
import { useTheme } from '@/features/theme/ThemeProvider';

interface RegionBadgeProps {
  region?: string;
  className?: string;
}

export function RegionBadge({ region, className = '' }: RegionBadgeProps) {
  const { colors } = useTheme();
  const regionKey = (region?.toLowerCase() || 'england') as keyof typeof colors;
  const regionColors = colors[regionKey] || colors.england;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
      style={{
        backgroundColor: regionColors.primary,
        color: '#FFFFFF',
        border: `2px solid ${regionColors.secondary}`,
      }}
    >
      {region || 'England'}
    </div>
  );
}

export function CareLevelBadge({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const { colors } = useTheme();
  const color = colors.careLevel[level];

  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: color,
        color: '#FFFFFF',
      }}
    >
      {level}
    </div>
  );
}

export function StatusBadge({ status }: { status: 'ACTIVE' | 'DISCHARGED' | 'TEMPORARY' | 'ADMITTED' }) {
  const { colors } = useTheme();
  const color = colors.status[status];

  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: color,
        color: '#FFFFFF',
      }}
    >
      {status}
    </div>
  );
}

/**
 * @writecarenotes.com
 * @fileoverview Badge components for regions and care levels
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Collection of badge components for displaying region information,
 * care levels, and status indicators with appropriate styling.
 */

'use client';

import React from 'react';
import { Badge } from './Badge/Badge';
import { useTheme } from '@/features/theme/ThemeProvider';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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

interface CareLevelBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const careLevelSizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1",
};

const careLevelColors = {
  LOW: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-100' },
  MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-100' },
  HIGH: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-100' },
};

export function CareLevelBadge({ 
  level, 
  showLabel = true, 
  size = 'md', 
  className 
}: CareLevelBadgeProps) {
  const { bg, text } = careLevelColors[level];
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium",
        careLevelSizes[size],
        bg,
        text,
        className
      )}
      role="status"
      aria-label={`Care Level: ${level.toLowerCase()}`}
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          level === 'HIGH' ? 'bg-red-400' : 'bg-current'
        )} />
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          level === 'HIGH' ? 'bg-red-500' : 'bg-current'
        )} />
      </span>
      {showLabel && level}
    </span>
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

'use client';

import React from 'react';

interface DocumentBadgeProps {
  label: string;
  count?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const DocumentBadge = React.forwardRef<HTMLSpanElement, DocumentBadgeProps>(
  ({ label, count, variant = 'default', className = '' }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
        case 'warning':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
        case 'error':
          return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
        case 'info':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      }
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantStyles()} ${className}`}
      >
        {label}
        {count !== undefined && (
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-800">
            {count}
          </span>
        )}
      </span>
    );
  }
);

DocumentBadge.displayName = 'DocumentBadge'; 



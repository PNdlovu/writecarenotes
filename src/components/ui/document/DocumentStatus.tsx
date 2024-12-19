'use client';

import React from 'react';
import { DocumentMetadata } from '@/types/documents';

interface DocumentStatusProps {
  status: DocumentMetadata['status'];
  className?: string;
}

export const DocumentStatus = React.forwardRef<HTMLSpanElement, DocumentStatusProps>(
  ({ status, className = '' }, ref) => {
    const getStatusColor = () => {
      switch (status) {
        case 'DRAFT':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
        case 'PUBLISHED':
          return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
        case 'ARCHIVED':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'DRAFT':
          return (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          );
        case 'PUBLISHED':
          return (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case 'ARCHIVED':
          return (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor()} ${className}`}
      >
        <span className="mr-1">{getStatusIcon()}</span>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  }
);

DocumentStatus.displayName = 'DocumentStatus'; 



'use client';

import React from 'react';

interface DocumentIconProps {
  fileType: string;
  className?: string;
}

export const DocumentIcon = React.forwardRef<HTMLDivElement, DocumentIconProps>(
  ({ fileType, className = '' }, ref) => {
    const getIconPath = () => {
      switch (fileType.toLowerCase()) {
        case 'pdf':
          return (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          );
        case 'doc':
        case 'docx':
          return (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          );
        case 'xls':
        case 'xlsx':
          return (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          );
        case 'jpg':
        case 'jpeg':
        case 'png':
          return (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          );
        default:
          return (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          );
      }
    };

    const getIconColor = () => {
      switch (fileType.toLowerCase()) {
        case 'pdf':
          return 'text-red-500 dark:text-red-400';
        case 'doc':
        case 'docx':
          return 'text-blue-500 dark:text-blue-400';
        case 'xls':
        case 'xlsx':
          return 'text-green-500 dark:text-green-400';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'text-purple-500 dark:text-purple-400';
        default:
          return 'text-gray-500 dark:text-gray-400';
      }
    };

    return (
      <div ref={ref} className={className}>
        <svg
          className={`w-full h-full ${getIconColor()}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${fileType.toUpperCase()} file`}
        >
          {getIconPath()}
        </svg>
      </div>
    );
  }
);

DocumentIcon.displayName = 'DocumentIcon'; 



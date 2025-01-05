'use client';

import React from 'react';
import { useTranslation } from 'next-i18next';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@prisma/client';

interface DocumentMetadataProps {
  document: Document & {
    createdBy?: { name: string };
    tags?: { name: string; color: string }[];
  };
  className?: string;
}

export const DocumentMetadata = React.forwardRef<HTMLDivElement, DocumentMetadataProps>(
  ({ document, className = '' }, ref) => {
    const { t } = useTranslation('documents');

    return (
      <div ref={ref} className={`py-4 ${className}`}>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {document.title}
            </h1>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('lastModified', {
                  time: formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })
                })}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {document.createdBy?.name || t('unknown')}
              </span>
            </div>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
                />
              </svg>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${document.status === 'DRAFT' 
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
                }`}
            >
              {t(`status.${document.status.toLowerCase()}`)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {t('version', { version: document.version })}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

DocumentMetadata.displayName = 'DocumentMetadata';



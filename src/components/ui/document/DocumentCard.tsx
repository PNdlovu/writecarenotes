'use client';

import React from 'react';
import { Document } from '@/types/documents';
import { DocumentIcon } from './DocumentIcon';
import { DocumentStatus } from './DocumentStatus';
import { DocumentActions } from './DocumentActions';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
  onAction?: (action: string) => void;
  className?: string;
}

export const DocumentCard = React.forwardRef<HTMLDivElement, DocumentCardProps>(
  ({ document, onClick, onAction, className = '' }, ref) => {
    const { metadata, stats } = document;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer ${className}`}
      >
        <div className="flex items-start space-x-4">
          <DocumentIcon fileType={metadata.fileType} className="w-10 h-10" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {metadata.title}
              </h3>
              <DocumentStatus status={metadata.status} />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Updated {formatDistanceToNow(new Date(metadata.updatedAt), { addSuffix: true })}
            </p>
            {metadata.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {metadata.description}
              </p>
            )}
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{metadata.fileType.toUpperCase()}</span>
              <span>{(metadata.fileSize / 1024).toFixed(1)} KB</span>
              <span>{stats.viewCount} views</span>
            </div>
          </div>
          <DocumentActions
            document={document}
            onAction={onAction}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    );
  }
);

DocumentCard.displayName = 'DocumentCard';



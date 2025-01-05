'use client';

import React from 'react';
import { Document } from '@/types/documents';
import { useTranslation } from 'next-i18next';

interface DocumentActionsProps {
  document: Document;
  onAction?: (action: string) => void;
  className?: string;
}

export const DocumentActions = React.forwardRef<HTMLDivElement, DocumentActionsProps>(
  ({ document, onAction, className = '' }, ref) => {
    const { t } = useTranslation('documents');
    const { permissions } = document;

    const actions = [
      {
        id: 'view',
        label: t('view'),
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ),
        show: permissions.canView,
      },
      {
        id: 'edit',
        label: t('edit'),
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        ),
        show: permissions.canEdit,
      },
      {
        id: 'share',
        label: t('share'),
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        ),
        show: permissions.canShare,
      },
      {
        id: 'delete',
        label: t('delete'),
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
        show: permissions.canDelete,
      },
    ];

    return (
      <div ref={ref} className={`flex items-center space-x-2 ${className}`}>
        {actions
          .filter((action) => action.show)
          .map((action) => (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                onAction?.(action.id);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={action.label}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
      </div>
    );
  }
);

DocumentActions.displayName = 'DocumentActions'; 



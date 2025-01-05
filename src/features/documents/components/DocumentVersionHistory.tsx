'use client';

import React from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Dialog } from '@/components/ui/Dialog/Dialog';

interface Version {
  id: string;
  version: number;
  createdAt: string;
  createdBy?: {
    name: string;
  };
}

interface DocumentVersionHistoryProps {
  documentId: string;
  open: boolean;
  onClose: () => void;
}

export const DocumentVersionHistory = React.forwardRef<HTMLDivElement, DocumentVersionHistoryProps>(
  ({ documentId, open, onClose }, ref) => {
    const { t } = useTranslation('documents');

    // Fetch version history
    const { data: versions, isLoading } = useQuery<Version[]>(
      ['documentVersions', documentId],
      async () => {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        if (!response.ok) throw new Error('Failed to fetch versions');
        return response.json();
      },
      { enabled: open }
    );

    const handleRestore = async (versionId: string) => {
      try {
        const response = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to restore version');
        onClose();
      } catch (error) {
        console.error('Error restoring version:', error);
      }
    };

    const handleCompare = (versionId: string) => {
      window.open(`/documents/${documentId}/compare/${versionId}`, '_blank');
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('versionHistory')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : !versions?.length ? (
                <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                  {t('noVersionsFound')}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {versions.map((version) => (
                    <li 
                      key={version.id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('versionNumber', { number: version.version })}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('modifiedBy', { user: version.createdBy?.name })}
                          {' • '}
                          {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCompare(version.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                          aria-label={t('compareVersion', { number: version.version })}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRestore(version.id)}
                          className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                          aria-label={t('restoreVersion', { number: version.version })}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
);

DocumentVersionHistory.displayName = 'DocumentVersionHistory';



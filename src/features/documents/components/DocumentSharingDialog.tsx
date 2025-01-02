'use client';

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Document } from '@prisma/client';
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from "@/components/ui/Form/Label";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";

interface Share {
  id: string;
  user: {
    email: string;
  };
  permission: 'VIEW' | 'EDIT' | 'MANAGE';
}

interface DocumentSharingDialogProps {
  document: Document;
  open: boolean;
  onClose: () => void;
}

export const DocumentSharingDialog = React.forwardRef<HTMLDivElement, DocumentSharingDialogProps>(
  ({ document, open, onClose }, ref) => {
    const { t } = useTranslation('documents');
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'VIEW' | 'EDIT' | 'MANAGE'>('VIEW');

    // Fetch current shares
    const { data: shares, isLoading } = useQuery<Share[]>(
      ['documentShares', document.id],
      async () => {
        const response = await fetch(`/api/documents/${document.id}/shares`);
        if (!response.ok) throw new Error('Failed to fetch shares');
        return response.json();
      },
      { enabled: open }
    );

    // Add share mutation
    const addShare = useMutation(
      async () => {
        const response = await fetch(`/api/documents/${document.id}/shares`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, permission }),
        });
        if (!response.ok) throw new Error('Failed to add share');
        return response.json();
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['documentShares', document.id]);
          setEmail('');
          showToast(t('shareAdded'), 'success');
        },
        onError: () => {
          showToast(t('errorAddingShare'), 'error');
        },
      }
    );

    // Remove share mutation
    const removeShare = useMutation(
      async (shareId: string) => {
        const response = await fetch(`/api/documents/${document.id}/shares/${shareId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove share');
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['documentShares', document.id]);
          showToast(t('shareRemoved'), 'success');
        },
        onError: () => {
          showToast(t('errorRemovingShare'), 'error');
        },
      }
    );

    const handleAddShare = () => {
      if (!email) return;
      addShare.mutate();
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('shareDocument')}
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

            <div className="p-6">
              <div className="space-y-6">
                {/* Add new share */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder={t('email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      aria-label={t('email')}
                    />
                  </div>
                  <Select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as 'VIEW' | 'EDIT' | 'MANAGE')}
                    className="w-full sm:w-32"
                    aria-label={t('permission')}
                  >
                    <option value="VIEW">{t('view')}</option>
                    <option value="EDIT">{t('edit')}</option>
                    <option value="MANAGE">{t('manage')}</option>
                  </Select>
                  <Button
                    onClick={handleAddShare}
                    disabled={!email}
                    className="w-full sm:w-auto"
                    aria-label={t('addShare')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('add')}
                  </Button>
                </div>

                {/* Current shares */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {t('currentShares')}
                  </h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : !shares?.length ? (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                      {t('noShares')}
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {shares.map((share) => (
                        <li
                          key={share.id}
                          className="py-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {share.user.email}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              {t(`permission.${share.permission.toLowerCase()}`)}
                            </span>
                          </div>
                          <button
                            onClick={() => removeShare.mutate(share.id)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            aria-label={t('removeShare')}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
);

DocumentSharingDialog.displayName = 'DocumentSharingDialog';



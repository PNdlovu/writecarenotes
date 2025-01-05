'use client';

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@prisma/client';
import { useToast } from '@/hooks/useToast';
import { Dialog } from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Switch } from '@/components/ui/Switch';

interface DocumentSecurityDialogProps {
  document: Document;
  open: boolean;
  onClose: () => void;
}

export const DocumentSecurityDialog = React.forwardRef<HTMLDivElement, DocumentSecurityDialogProps>(
  ({ document, open, onClose }, ref) => {
    const { t } = useTranslation('documents');
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState({
      isEncrypted: document.isEncrypted || false,
      password: '',
      watermark: document.watermark || '',
      expiryDate: document.expiryDate || '',
      trackDownloads: document.trackDownloads || false,
      retentionPeriod: document.retentionPeriod || '',
    });

    // Update security settings mutation
    const updateSecurity = useMutation(
      async () => {
        const response = await fetch(`/api/documents/${document.id}/security`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update security settings');
        return response.json();
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['document', document.id]);
          showToast(t('securitySettingsUpdated'), 'success');
          onClose();
        },
        onError: () => {
          showToast(t('errorUpdatingSecuritySettings'), 'error');
        },
      }
    );

    const handleSave = () => {
      updateSecurity.mutate();
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('documentSecurity')}
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
                {/* Encryption */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('enableEncryption')}
                  </label>
                  <Switch
                    checked={settings.isEncrypted}
                    onCheckedChange={(checked) => setSettings({ ...settings, isEncrypted: checked })}
                    aria-label={t('enableEncryption')}
                  />
                </div>

                {settings.isEncrypted && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('password')}
                    </label>
                    <Input
                      type="password"
                      value={settings.password}
                      onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                      className="w-full"
                      aria-label={t('password')}
                    />
                  </div>
                )}

                {/* Watermark */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('watermark')}
                  </label>
                  <Input
                    type="text"
                    value={settings.watermark}
                    onChange={(e) => setSettings({ ...settings, watermark: e.target.value })}
                    className="w-full"
                    aria-label={t('watermark')}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('watermarkHelp')}
                  </p>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('expiryDate')}
                  </label>
                  <Input
                    type="datetime-local"
                    value={settings.expiryDate}
                    onChange={(e) => setSettings({ ...settings, expiryDate: e.target.value })}
                    className="w-full"
                    aria-label={t('expiryDate')}
                  />
                </div>

                {/* Download Tracking */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('trackDownloads')}
                  </label>
                  <Switch
                    checked={settings.trackDownloads}
                    onCheckedChange={(checked) => setSettings({ ...settings, trackDownloads: checked })}
                    aria-label={t('trackDownloads')}
                  />
                </div>

                {/* Retention Period */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('retentionPeriod')}
                  </label>
                  <Select
                    value={settings.retentionPeriod}
                    onChange={(e) => setSettings({ ...settings, retentionPeriod: e.target.value })}
                    className="w-full"
                    aria-label={t('retentionPeriod')}
                  >
                    <option value="">{t('noRetention')}</option>
                    <option value="30d">{t('30days')}</option>
                    <option value="90d">{t('90days')}</option>
                    <option value="180d">{t('180days')}</option>
                    <option value="1y">{t('1year')}</option>
                    <option value="7y">{t('7years')}</option>
                  </Select>
                </div>

                {/* Compliance Warning */}
                {settings.retentionPeriod && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t('retentionWarning')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
);

DocumentSecurityDialog.displayName = 'DocumentSecurityDialog';



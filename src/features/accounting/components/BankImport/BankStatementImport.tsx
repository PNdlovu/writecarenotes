/**
 * @fileoverview Bank Statement Import Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Component for importing and processing bank statements with format detection
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useDropzone } from 'react-dropzone';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { BankTransaction, ImportFormat } from '../../types/accounting';

interface BankStatementImportProps {
  accountId: string;
  organizationId: string;
  onImportComplete: (transactions: BankTransaction[]) => void;
  onCancel: () => void;
}

export const BankStatementImport: React.FC<BankStatementImportProps> = ({
  accountId,
  organizationId,
  onImportComplete,
  onCancel
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency, formatDate } = useRegionalCompliance();
  const { accounts } = useAccountingStore();
  const { isOnline } = useOfflineSync();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importFormat, setImportFormat] = useState<ImportFormat>('CSV');
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Get account details
  const account = accounts.find(a => a.id === accountId);

  // File drop handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsProcessing(true);
      setError(null);

      const file = acceptedFiles[0];
      if (!file) return;

      // Detect file format
      const format = detectFileFormat(file);
      setImportFormat(format);

      // Read file content
      const content = await readFileContent(file);

      // Parse content based on format
      const parsedTransactions = await parseContent(content, format);
      setTransactions(parsedTransactions);

    } catch (error) {
      console.error('Error processing file:', error);
      setError(t('bankImport.errors.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/x-ofx': ['.ofx'],
      'application/qif': ['.qif']
    },
    maxFiles: 1
  });

  // Detect file format based on content or extension
  const detectFileFormat = (file: File): ImportFormat => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ofx':
        return 'OFX';
      case 'qif':
        return 'QIF';
      default:
        return 'CSV';
    }
  };

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // Parse content based on format
  const parseContent = async (content: string, format: ImportFormat): Promise<BankTransaction[]> => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('format', format);
    formData.append('accountId', accountId);
    formData.append('organizationId', organizationId);

    const response = await fetch('/api/accounting/bank-import/parse', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to parse bank statement');
    }

    return response.json();
  };

  // Handle column mapping changes
  const handleMappingChange = (field: string, value: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle import submission
  const handleImport = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/accounting/bank-import/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactions,
          mappings,
          accountId,
          organizationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process import');
      }

      const processedTransactions = await response.json();
      onImportComplete(processedTransactions);
    } catch (error) {
      console.error('Error processing import:', error);
      setError(t('bankImport.errors.importFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center text-red-600">
        {t('bankImport.errors.accountNotFound')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {t('bankImport.title')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {account.code} - {account.name}
        </p>
      </div>

      {!transactions.length ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-gray-600">
              {isDragActive
                ? t('bankImport.dropHere')
                : t('bankImport.dragAndDrop')}
            </div>
            <div className="text-sm text-gray-500">
              {t('bankImport.supportedFormats')}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {t('bankImport.columnMapping')}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                {['date', 'description', 'amount', 'reference'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700">
                      {t(`bankImport.fields.${field}`)}
                    </label>
                    <select
                      value={mappings[field] || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">{t('common.select')}</option>
                      {Object.keys(transactions[0] || {}).map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bankImport.preview.date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bankImport.preview.description')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bankImport.preview.reference')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bankImport.preview.amount')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length > 5 && (
              <div className="px-6 py-4 text-sm text-gray-500">
                {t('bankImport.preview.showing', { count: transactions.length })}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('bankImport.errors.title')}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        {transactions.length > 0 && (
          <button
            type="button"
            onClick={handleImport}
            disabled={isProcessing || !isOnline}
            className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? t('common.processing') : t('bankImport.import')}
          </button>
        )}
      </div>
    </div>
  );
}; 
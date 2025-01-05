/**
 * @fileoverview Reconciliation Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Form component for bank statement reconciliation with matching and variance tracking
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { 
  Account, 
  JournalEntry,
  ReconciliationItem,
  reconciliationSchema 
} from '../../types/accounting';

interface ReconciliationFormProps {
  accountId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  organizationId: string;
  onSubmit: (data: ReconciliationItem[]) => Promise<void>;
  onCancel: () => void;
}

export const ReconciliationForm: React.FC<ReconciliationFormProps> = ({
  accountId,
  period,
  organizationId,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency, formatDate } = useRegionalCompliance();
  const { accounts, journalEntries } = useAccountingStore();
  const { isOnline, queueOfflineEntry } = useOfflineSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // Get account details
  const account = useMemo(() => 
    accounts.find(a => a.id === accountId),
    [accounts, accountId]
  );

  // Get relevant journal entries
  const accountEntries = useMemo(() => 
    journalEntries.filter(entry => 
      entry.accountId === accountId &&
      new Date(entry.date) >= period.startDate &&
      new Date(entry.date) <= period.endDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [journalEntries, accountId, period]
  );

  // Calculate totals
  const totals = useMemo(() => {
    const selectedTotal = accountEntries
      .filter(entry => selectedEntries.has(entry.id))
      .reduce((sum, entry) => sum + entry.amount, 0);

    const unselectedTotal = accountEntries
      .filter(entry => !selectedEntries.has(entry.id))
      .reduce((sum, entry) => sum + entry.amount, 0);

    const variance = bankBalance - (selectedTotal + unselectedTotal);

    return {
      selectedTotal,
      unselectedTotal,
      variance
    };
  }, [accountEntries, selectedEntries, bankBalance]);

  const toggleEntry = (entryId: string) => {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const reconciliationItems = accountEntries.map(entry => ({
        journalEntryId: entry.id,
        isReconciled: selectedEntries.has(entry.id),
        accountId,
        organizationId,
        reconciliationDate: new Date(),
        bankBalance,
        variance: totals.variance
      }));

      if (!isOnline) {
        await queueOfflineEntry('reconciliation', reconciliationItems);
        return;
      }

      await onSubmit(reconciliationItems);
    } catch (error) {
      console.error('Failed to submit reconciliation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center text-red-600">
        {t('reconciliation.errors.accountNotFound')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {t('reconciliation.title')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {account.code} - {account.name}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {t('reconciliation.period')} {formatDate(period.startDate)} - {formatDate(period.endDate)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('reconciliation.fields.bankBalance')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={bankBalance}
              onChange={(e) => setBankBalance(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('reconciliation.fields.bookBalance')}
          </label>
          <div className="mt-2 text-lg font-semibold">
            {formatCurrency(totals.selectedTotal + totals.unselectedTotal)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('reconciliation.fields.variance')}
          </label>
          <div className={`mt-2 text-lg font-semibold ${Math.abs(totals.variance) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totals.variance)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={selectedEntries.size === accountEntries.length}
                  onChange={() => {
                    if (selectedEntries.size === accountEntries.length) {
                      setSelectedEntries(new Set());
                    } else {
                      setSelectedEntries(new Set(accountEntries.map(e => e.id)));
                    }
                  }}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.fields.date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.fields.reference')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.fields.description')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.fields.amount')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accountEntries.map((entry) => (
              <tr
                key={entry.id}
                className={`hover:bg-gray-50 ${selectedEntries.has(entry.id) ? 'bg-blue-50' : ''}`}
                onClick={() => toggleEntry(entry.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => toggleEntry(entry.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.reference}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {entry.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(entry.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {t('reconciliation.total')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                {formatCurrency(totals.selectedTotal + totals.unselectedTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || Math.abs(totals.variance) >= 0.01}
          className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
}; 
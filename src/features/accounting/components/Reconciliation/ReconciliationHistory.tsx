/**
 * @fileoverview Reconciliation History Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Component for displaying reconciliation history with filtering and sorting
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { ReconciliationItem } from '../../types/accounting';

interface ReconciliationHistoryProps {
  accountId: string;
  organizationId: string;
  onReconciliationSelect?: (reconciliation: ReconciliationItem) => void;
}

export const ReconciliationHistory: React.FC<ReconciliationHistoryProps> = ({
  accountId,
  organizationId,
  onReconciliationSelect
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency, formatDate } = useRegionalCompliance();
  const { accounts } = useAccountingStore();
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
    endDate: new Date().toISOString().split('T')[0], // Today
    page: 1,
    limit: 10
  });

  // Get account details
  const account = accounts.find(a => a.id === accountId);

  // Fetch reconciliation history
  const fetchReconciliations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        organizationId,
        accountId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });

      const response = await fetch(`/api/accounting/reconciliation?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reconciliation history');
      }

      const data = await response.json();
      setReconciliations(data.reconciliations);
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      setError(t('reconciliation.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, [filters, accountId, organizationId]);

  const handleDateFilterChange = (field: 'startDate' | 'endDate') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  if (!account) {
    return (
      <div className="text-center text-red-600">
        {t('reconciliation.errors.accountNotFound')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('reconciliation.history.title')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {account.code} - {account.name}
        </p>
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('reconciliation.history.filters.startDate')}
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={handleDateFilterChange('startDate')}
            className="mt-1 block rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('reconciliation.history.filters.endDate')}
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={handleDateFilterChange('endDate')}
            className="mt-1 block rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.history.fields.date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.history.fields.entries')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.history.fields.bankBalance')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.history.fields.bookBalance')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reconciliation.history.fields.variance')}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reconciliations.map((reconciliation) => (
              <tr
                key={reconciliation.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onReconciliationSelect?.(reconciliation)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(reconciliation.reconciliationDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reconciliation.journalEntry.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(reconciliation.bankBalance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(reconciliation.journalEntry.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={reconciliation.variance === 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(reconciliation.variance)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReconciliationSelect?.(reconciliation);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {t('common.view')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reconciliations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('reconciliation.history.noRecords')}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          {t('common.showing')} {reconciliations.length} {t('common.records')}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            {t('common.previous')}
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={reconciliations.length < filters.limit}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
}; 
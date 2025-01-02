/**
 * @fileoverview Balance Sheet Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Balance Sheet component with regional support and offline capabilities
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { Account, AccountType } from '../../types/accounting';

interface BalanceSheetProps {
  date: Date;
  organizationId: string;
}

interface BalanceSheetSection {
  title: string;
  accounts: Account[];
  total: number;
}

export const BalanceSheet: React.FC<BalanceSheetProps> = ({
  date,
  organizationId
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency, formatDate } = useRegionalCompliance();
  const { accounts } = useAccountingStore();

  // Filter accounts by organization and active status
  const organizationAccounts = useMemo(() => 
    accounts.filter(account => 
      account.organizationId === organizationId && 
      account.isActive
    ),
    [accounts, organizationId]
  );

  // Calculate section totals
  const sections = useMemo(() => {
    const assets = organizationAccounts.filter(
      account => account.type === AccountType.ASSET
    );
    const liabilities = organizationAccounts.filter(
      account => account.type === AccountType.LIABILITY
    );
    const equity = organizationAccounts.filter(
      account => account.type === AccountType.EQUITY
    );

    const calculateTotal = (accounts: Account[]) =>
      accounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      assets: {
        title: t('statements.sections.assets'),
        accounts: assets,
        total: calculateTotal(assets)
      },
      liabilities: {
        title: t('statements.sections.liabilities'),
        accounts: liabilities,
        total: calculateTotal(liabilities)
      },
      equity: {
        title: t('statements.sections.equity'),
        accounts: equity,
        total: calculateTotal(equity)
      }
    };
  }, [organizationAccounts, t]);

  const renderSection = (section: BalanceSheetSection) => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                {t('accounts.fields.code')}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {t('accounts.fields.name')}
              </th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                {t('accounts.fields.balance')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {section.accounts.map(account => (
              <tr key={account.id}>
                <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                  {account.code}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                  {account.name}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-sm text-right text-gray-500">
                  {formatCurrency(account.balance)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={2} className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {t('statements.total')}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-right text-gray-900">
                {formatCurrency(section.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const totalLiabilitiesAndEquity = sections.liabilities.total + sections.equity.total;

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {t('statements.balanceSheet')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('statements.asOf')} {formatDate(date)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {renderSection(sections.assets)}
        {renderSection(sections.liabilities)}
        {renderSection(sections.equity)}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('statements.totalAssets')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(sections.assets.total)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('statements.totalLiabilitiesEquity')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(totalLiabilitiesAndEquity)}
            </dd>
          </div>
        </dl>

        {Math.abs(sections.assets.total - totalLiabilitiesAndEquity) > 0.01 && (
          <div className="mt-4 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('statements.outOfBalance')}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {t('statements.difference')}: {formatCurrency(Math.abs(sections.assets.total - totalLiabilitiesAndEquity))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
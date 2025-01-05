/**
 * @fileoverview Income Statement Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Income Statement component with regional support and offline capabilities
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { Account, AccountType, AccountCategory } from '../../types/accounting';

interface IncomeStatementProps {
  startDate: Date;
  endDate: Date;
  organizationId: string;
}

interface IncomeStatementSection {
  title: string;
  accounts: Account[];
  total: number;
}

export const IncomeStatement: React.FC<IncomeStatementProps> = ({
  startDate,
  endDate,
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
    const revenues = organizationAccounts.filter(
      account => account.type === AccountType.REVENUE
    );
    const operatingExpenses = organizationAccounts.filter(
      account => 
        account.type === AccountType.EXPENSE && 
        account.category === AccountCategory.OPERATING_EXPENSE
    );
    const administrativeExpenses = organizationAccounts.filter(
      account => 
        account.type === AccountType.EXPENSE && 
        account.category === AccountCategory.ADMINISTRATIVE_EXPENSE
    );
    const financialExpenses = organizationAccounts.filter(
      account => 
        account.type === AccountType.EXPENSE && 
        account.category === AccountCategory.FINANCIAL_EXPENSE
    );

    const calculateTotal = (accounts: Account[]) =>
      accounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      revenues: {
        title: t('statements.sections.revenues'),
        accounts: revenues,
        total: calculateTotal(revenues)
      },
      operatingExpenses: {
        title: t('statements.sections.operatingExpenses'),
        accounts: operatingExpenses,
        total: calculateTotal(operatingExpenses)
      },
      administrativeExpenses: {
        title: t('statements.sections.administrativeExpenses'),
        accounts: administrativeExpenses,
        total: calculateTotal(administrativeExpenses)
      },
      financialExpenses: {
        title: t('statements.sections.financialExpenses'),
        accounts: financialExpenses,
        total: calculateTotal(financialExpenses)
      }
    };
  }, [organizationAccounts, t]);

  const renderSection = (section: IncomeStatementSection) => (
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

  const totalExpenses = sections.operatingExpenses.total + 
    sections.administrativeExpenses.total + 
    sections.financialExpenses.total;

  const netIncome = sections.revenues.total - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {t('statements.incomeStatement')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('statements.period')} {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {renderSection(sections.revenues)}
        {renderSection(sections.operatingExpenses)}
        {renderSection(sections.administrativeExpenses)}
        {renderSection(sections.financialExpenses)}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('statements.totalRevenues')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(sections.revenues.total)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('statements.totalExpenses')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(totalExpenses)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('statements.netIncome')}
            </dt>
            <dd className={`mt-1 text-lg font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}; 
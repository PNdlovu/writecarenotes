/**
 * @fileoverview Chart of Accounts Table Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Hierarchical display of the chart of accounts with regional support
 * and offline capabilities
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { Account, AccountType } from '../../types/accounting';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';

interface ChartOfAccountsTableProps {
  onAccountSelect?: (account: Account) => void;
  onAccountEdit?: (account: Account) => void;
}

interface AccountNode extends Account {
  children: AccountNode[];
  level: number;
  isExpanded?: boolean;
}

export const ChartOfAccountsTable: React.FC<ChartOfAccountsTableProps> = ({
  onAccountSelect,
  onAccountEdit
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency } = useRegionalCompliance();
  const { accounts } = useAccountingStore();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  // Build account hierarchy
  const accountHierarchy = useMemo(() => {
    const accountMap = new Map<string, AccountNode>();
    const rootAccounts: AccountNode[] = [];

    // First pass: Create nodes
    accounts.forEach(account => {
      accountMap.set(account.id, {
        ...account,
        children: [],
        level: 0,
        isExpanded: expandedAccounts.has(account.id)
      });
    });

    // Second pass: Build hierarchy
    accounts.forEach(account => {
      const node = accountMap.get(account.id)!;
      if (account.parentId && accountMap.has(account.parentId)) {
        const parent = accountMap.get(account.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        rootAccounts.push(node);
      }
    });

    // Sort accounts by type and code
    const sortAccounts = (accounts: AccountNode[]) => {
      accounts.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return a.code.localeCompare(b.code);
      });
      accounts.forEach(account => {
        if (account.children.length > 0) {
          sortAccounts(account.children);
        }
      });
    };

    sortAccounts(rootAccounts);
    return rootAccounts;
  }, [accounts, expandedAccounts]);

  // Flatten hierarchy for display
  const flattenedAccounts = useMemo(() => {
    const flattened: AccountNode[] = [];
    
    const flatten = (accounts: AccountNode[]) => {
      accounts.forEach(account => {
        flattened.push(account);
        if (account.children.length > 0 && expandedAccounts.has(account.id)) {
          flatten(account.children);
        }
      });
    };

    flatten(accountHierarchy);
    return flattened;
  }, [accountHierarchy, expandedAccounts]);

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET:
        return 'text-blue-600';
      case AccountType.LIABILITY:
        return 'text-red-600';
      case AccountType.EQUITY:
        return 'text-green-600';
      case AccountType.REVENUE:
        return 'text-purple-600';
      case AccountType.EXPENSE:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('accounts.fields.code')}
            </TableHeader>
            <TableHeader scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('accounts.fields.name')}
            </TableHeader>
            <TableHeader scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('accounts.fields.type')}
            </TableHeader>
            <TableHeader scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('accounts.fields.balance')}
            </TableHeader>
            <TableHeader scope="col" className="relative px-6 py-3">
              <span className="sr-only">{t('common.actions')}</span>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {flattenedAccounts.map((account) => (
            <TableRow
              key={account.id}
              className={`hover:bg-gray-50 ${!account.isActive ? 'text-gray-400' : ''}`}
            >
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center">
                  <div style={{ marginLeft: `${account.level * 1.5}rem` }} className="flex items-center">
                    {account.children.length > 0 && (
                      <Button
                        onClick={() => toggleExpand(account.id)}
                        className="mr-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedAccounts.has(account.id) ? '▼' : '▶'}
                      </Button>
                    )}
                    <span>{account.code}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {account.name}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`${getAccountTypeColor(account.type)}`}>
                  {t(`accounts.types.${account.type.toLowerCase()}`)}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {formatCurrency(account.balance)}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  onClick={() => onAccountSelect?.(account)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  {t('common.view')}
                </Button>
                {account.isActive && (
                  <Button
                    onClick={() => onAccountEdit?.(account)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {t('common.edit')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 
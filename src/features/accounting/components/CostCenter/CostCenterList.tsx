/**
 * @fileoverview Cost Center List Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Hierarchical display of cost centers with budget tracking
 */

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { CostCenter } from '../../types/accounting';

interface CostCenterListProps {
  organizationId: string;
  onCostCenterSelect?: (costCenter: CostCenter) => void;
  onCostCenterEdit?: (costCenter: CostCenter) => void;
}

interface CostCenterNode extends CostCenter {
  children: CostCenterNode[];
  level: number;
  isExpanded?: boolean;
  actualSpend: number;
}

export const CostCenterList: React.FC<CostCenterListProps> = ({
  organizationId,
  onCostCenterSelect,
  onCostCenterEdit
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency } = useRegionalCompliance();
  const { costCenters, journalEntries } = useAccountingStore();
  const [expandedCostCenters, setExpandedCostCenters] = useState<Set<string>>(new Set());

  // Calculate actual spend for each cost center
  const calculateActualSpend = (costCenterId: string): number => {
    return journalEntries
      .filter(entry => entry.costCenterId === costCenterId)
      .reduce((total, entry) => total + entry.amount, 0);
  };

  // Build cost center hierarchy
  const costCenterHierarchy = useMemo(() => {
    const costCenterMap = new Map<string, CostCenterNode>();
    const rootCostCenters: CostCenterNode[] = [];

    // First pass: Create nodes
    costCenters
      .filter(cc => cc.organizationId === organizationId)
      .forEach(cc => {
        costCenterMap.set(cc.id, {
          ...cc,
          children: [],
          level: 0,
          isExpanded: expandedCostCenters.has(cc.id),
          actualSpend: calculateActualSpend(cc.id)
        });
      });

    // Second pass: Build hierarchy
    costCenters
      .filter(cc => cc.organizationId === organizationId)
      .forEach(cc => {
        const node = costCenterMap.get(cc.id)!;
        if (cc.parentId && costCenterMap.has(cc.parentId)) {
          const parent = costCenterMap.get(cc.parentId)!;
          node.level = parent.level + 1;
          parent.children.push(node);
        } else {
          rootCostCenters.push(node);
        }
      });

    // Sort cost centers by code
    const sortCostCenters = (costCenters: CostCenterNode[]) => {
      costCenters.sort((a, b) => a.code.localeCompare(b.code));
      costCenters.forEach(cc => {
        if (cc.children.length > 0) {
          sortCostCenters(cc.children);
        }
      });
    };

    sortCostCenters(rootCostCenters);
    return rootCostCenters;
  }, [costCenters, organizationId, expandedCostCenters, journalEntries]);

  // Flatten hierarchy for display
  const flattenedCostCenters = useMemo(() => {
    const flattened: CostCenterNode[] = [];
    
    const flatten = (costCenters: CostCenterNode[]) => {
      costCenters.forEach(cc => {
        flattened.push(cc);
        if (cc.children.length > 0 && expandedCostCenters.has(cc.id)) {
          flatten(cc.children);
        }
      });
    };

    flatten(costCenterHierarchy);
    return flattened;
  }, [costCenterHierarchy, expandedCostCenters]);

  const toggleExpand = (costCenterId: string) => {
    setExpandedCostCenters(prev => {
      const next = new Set(prev);
      if (next.has(costCenterId)) {
        next.delete(costCenterId);
      } else {
        next.add(costCenterId);
      }
      return next;
    });
  };

  const getBudgetUtilizationColor = (actualSpend: number, budgetLimit: number) => {
    const utilization = (actualSpend / budgetLimit) * 100;
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('costCenters.fields.code')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('costCenters.fields.name')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('costCenters.fields.budgetLimit')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('costCenters.fields.actualSpend')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('costCenters.fields.remaining')}
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">{t('common.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {flattenedCostCenters.map((cc) => (
            <tr
              key={cc.id}
              className={`hover:bg-gray-50 ${!cc.isActive ? 'text-gray-400' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center">
                  <div style={{ marginLeft: `${cc.level * 1.5}rem` }} className="flex items-center">
                    {cc.children.length > 0 && (
                      <button
                        onClick={() => toggleExpand(cc.id)}
                        className="mr-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedCostCenters.has(cc.id) ? '▼' : '▶'}
                      </button>
                    )}
                    <span>{cc.code}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {cc.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {formatCurrency(cc.budgetLimit)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={getBudgetUtilizationColor(cc.actualSpend, cc.budgetLimit)}>
                  {formatCurrency(cc.actualSpend)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {formatCurrency(cc.budgetLimit - cc.actualSpend)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onCostCenterSelect?.(cc)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  {t('common.view')}
                </button>
                {cc.isActive && (
                  <button
                    onClick={() => onCostCenterEdit?.(cc)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {t('common.edit')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 
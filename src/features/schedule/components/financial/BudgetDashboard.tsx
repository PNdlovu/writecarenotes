import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface BudgetStats {
  totalBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  overtimeCost: number;
  regularCost: number;
  premiumCost: number;
  departmentBreakdown: {
    department: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
}

interface CostForecast {
  period: string;
  projectedCost: number;
  actualCost?: number;
  variance?: number;
}

export const BudgetDashboard: React.FC = () => {
  const { data: budgetStats } = useQuery<BudgetStats>(
    ['budget', 'stats'],
    () => scheduleAPI.getBudgetStats(),
  );

  const { data: costForecast } = useQuery<CostForecast[]>(
    ['budget', 'forecast'],
    () => scheduleAPI.getCostForecast(),
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const getPercentage = (value: number, total: number) =>
    ((value / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Budget</h4>
          <div className="text-2xl font-semibold">
            {budgetStats && formatCurrency(budgetStats.totalBudget)}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Allocated: {budgetStats && formatCurrency(budgetStats.allocatedBudget)}
          </div>
          <div className="mt-1 text-sm text-green-600">
            Remaining: {budgetStats && formatCurrency(budgetStats.remainingBudget)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Cost Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Regular</span>
              <span>{budgetStats && formatCurrency(budgetStats.regularCost)}</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Overtime</span>
              <span>{budgetStats && formatCurrency(budgetStats.overtimeCost)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Premium</span>
              <span>{budgetStats && formatCurrency(budgetStats.premiumCost)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Budget Utilization</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Allocated</span>
                <span>
                  {budgetStats &&
                    getPercentage(budgetStats.allocatedBudget, budgetStats.totalBudget)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      budgetStats &&
                      getPercentage(budgetStats.allocatedBudget, budgetStats.totalBudget)
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Spent</span>
                <span>
                  {budgetStats &&
                    getPercentage(
                      budgetStats.regularCost +
                        budgetStats.overtimeCost +
                        budgetStats.premiumCost,
                      budgetStats.totalBudget
                    )}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      budgetStats &&
                      getPercentage(
                        budgetStats.regularCost +
                          budgetStats.overtimeCost +
                          budgetStats.premiumCost,
                        budgetStats.totalBudget
                      )
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Department Breakdown</h3>
          <div className="space-y-4">
            {budgetStats?.departmentBreakdown.map((dept) => (
              <div key={dept.department} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{dept.department}</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(dept.remaining)} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${getPercentage(dept.spent, dept.allocated)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>
                    {formatCurrency(dept.spent)} / {formatCurrency(dept.allocated)}
                  </span>
                  <span>{getPercentage(dept.spent, dept.allocated)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Forecast</h3>
          <div className="space-y-4">
            {costForecast?.map((forecast) => (
              <div key={forecast.period} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{forecast.period}</span>
                  {forecast.variance && (
                    <span
                      className={`text-sm ${
                        forecast.variance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {forecast.variance > 0 ? '+' : ''}
                      {formatCurrency(forecast.variance)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div>Projected: {formatCurrency(forecast.projectedCost)}</div>
                    {forecast.actualCost && (
                      <div>Actual: {formatCurrency(forecast.actualCost)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

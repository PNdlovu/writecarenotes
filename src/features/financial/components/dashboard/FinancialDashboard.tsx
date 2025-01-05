import React from 'react';
import { useFinancial } from '../../hooks/useFinancial';
import { formatCurrency } from '../../utils/formatters';

interface FinancialDashboardProps {
  tenantId: string;
}

export function FinancialDashboard({ tenantId }: FinancialDashboardProps) {
  const {
    settings,
    summary,
    loading,
    error,
    refreshSummary
  } = useFinancial(tenantId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        {error.message}
      </div>
    );
  }

  if (!summary || !settings) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
        No financial data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Financial Overview
        </h1>
        <button
          onClick={() => refreshSummary()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(summary.totalRevenue, settings.currency)}
            </div>
            <p className="text-sm text-gray-500">
              Annual projection
            </p>
          </div>
        </div>

        {/* Occupancy Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Occupancy Rate</h3>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {summary.occupancyRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">
              Current occupancy
            </p>
          </div>
        </div>

        {/* Outstanding Payments Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Outstanding</h3>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(summary.outstandingPayments, settings.currency)}
            </div>
            <p className="text-sm text-gray-500">
              Pending payments
            </p>
          </div>
        </div>

        {/* Revenue Per Bed Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue Per Bed</h3>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(summary.revenuePerBed, settings.currency)}
            </div>
            <p className="text-sm text-gray-500">
              Annual average
            </p>
          </div>
        </div>
      </div>

      {/* Funding Breakdown */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Funding Breakdown</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(summary.fundingBreakdown).map(([type, count]) => (
              <div key={type}>
                <div className="text-2xl font-semibold text-gray-900">
                  {count}
                </div>
                <div className="text-sm text-gray-500">
                  {type.split(/(?=[A-Z])/).join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 



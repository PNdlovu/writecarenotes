import React from 'react';
import { FinancialSummary, RegionalFormat } from '../types/financial.types';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

interface AccessibleFinancialSummaryProps {
  summary: FinancialSummary;
  regionalFormat: RegionalFormat;
}

export const AccessibleFinancialSummary: React.FC<AccessibleFinancialSummaryProps> = ({
  summary,
  regionalFormat
}) => {
  const {
    currency,
    dateFormat,
    numberFormat
  } = regionalFormat;

  return (
    <div
      role="region"
      aria-label="Financial Summary"
      className="financial-summary"
    >
      <h2 id="summary-title" className="text-xl font-bold mb-4">
        Financial Summary
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Section */}
        <section
          aria-labelledby="revenue-title"
          className="p-4 bg-white rounded-lg shadow"
        >
          <h3 id="revenue-title" className="text-lg font-semibold mb-2">
            Revenue
          </h3>
          <dl>
            <div className="flex justify-between mb-2">
              <dt className="text-gray-600">Total Revenue</dt>
              <dd aria-label={`Total Revenue: ${formatCurrency(summary.totalRevenue, currency)}`}>
                {formatCurrency(summary.totalRevenue, currency)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Revenue per Bed</dt>
              <dd aria-label={`Revenue per Bed: ${formatCurrency(summary.revenuePerBed, currency)}`}>
                {formatCurrency(summary.revenuePerBed, currency)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Payments Section */}
        <section
          aria-labelledby="payments-title"
          className="p-4 bg-white rounded-lg shadow"
        >
          <h3 id="payments-title" className="text-lg font-semibold mb-2">
            Payments
          </h3>
          <dl>
            <div className="flex justify-between mb-2">
              <dt className="text-gray-600">Outstanding</dt>
              <dd aria-label={`Outstanding Payments: ${formatCurrency(summary.outstandingPayments, currency)}`}>
                {formatCurrency(summary.outstandingPayments, currency)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Average Payment Time</dt>
              <dd aria-label={`Average Payment Time: ${summary.averagePaymentTime} days`}>
                {summary.averagePaymentTime} days
              </dd>
            </div>
          </dl>
        </section>

        {/* Compliance Section */}
        <section
          aria-labelledby="compliance-title"
          className="p-4 bg-white rounded-lg shadow"
        >
          <h3 id="compliance-title" className="text-lg font-semibold mb-2">
            Compliance
          </h3>
          <dl>
            <div className="flex justify-between mb-2">
              <dt className="text-gray-600">Compliance Score</dt>
              <dd 
                aria-label={`Compliance Score: ${summary.complianceScore}%`}
                className={`font-semibold ${
                  (summary.complianceScore || 0) >= 90 ? 'text-green-600' :
                  (summary.complianceScore || 0) >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}
              >
                {summary.complianceScore}%
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Last Audit</dt>
              <dd aria-label={`Last Audit: ${formatDate(summary.lastAuditDate, dateFormat)}`}>
                {formatDate(summary.lastAuditDate, dateFormat)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Funding Breakdown */}
      <section
        aria-labelledby="funding-title"
        className="mt-6 p-4 bg-white rounded-lg shadow"
      >
        <h3 id="funding-title" className="text-lg font-semibold mb-4">
          Funding Breakdown
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(summary.fundingBreakdown).map(([type, amount]) => (
            <div
              key={type}
              className="text-center p-3 bg-gray-50 rounded"
              aria-label={`${type.replace('_', ' ')} funding: ${formatCurrency(amount, currency)}`}
            >
              <dt className="text-sm text-gray-600 mb-1">
                {type.replace('_', ' ')}
              </dt>
              <dd className="text-lg font-semibold">
                {formatCurrency(amount, currency)}
              </dd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};



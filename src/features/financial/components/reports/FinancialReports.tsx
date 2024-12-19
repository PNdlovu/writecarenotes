import React, { useState } from 'react';
import { useFinancial } from '../../hooks/useFinancial';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ExportService } from '../../services/exportService';

interface FinancialReportsProps {
  tenantId: string;
  region?: string;
}

type ReportPeriod = 'monthly' | 'quarterly' | 'annual';
type ReportType = 'revenue' | 'funding' | 'occupancy' | 'compliance';

const exportService = new ExportService();

const REGULATORY_BODIES = {
  'GB-ENG': 'CQC',
  'GB-WLS': 'CIW',
  'GB-SCT': 'Care Inspectorate',
  'GB-NIR': 'RQIA',
  'IE': 'HIQA'
};

export function FinancialReports({ tenantId, region = 'GB-ENG' }: FinancialReportsProps) {
  const { summary, settings, loading, error } = useFinancial(tenantId);
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [reportType, setReportType] = useState<ReportType>('revenue');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!summary || !settings) return;

    try {
      setExporting(true);
      const blob = await exportService.exportReport(summary, settings, reportType, period);
      exportService.downloadReport(blob, reportType, period);
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setExporting(false);
    }
  };

  const renderComplianceReport = () => {
    if (!summary || !settings) return null;

    const regulatoryBody = REGULATORY_BODIES[region as keyof typeof REGULATORY_BODIES];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Regulatory Body</h3>
          <p className="mt-2 text-xl font-semibold text-gray-900">{regulatoryBody}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Financial Compliance Score</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {summary.complianceScore ? `${summary.complianceScore}%` : 'N/A'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Last Audit Date</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {summary.lastAuditDate ? formatDate(summary.lastAuditDate) : 'No audit recorded'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Requirements</h3>
          <div className="space-y-4">
            {summary.complianceChecklist?.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`mt-1 w-4 h-4 rounded-full ${item.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="font-medium text-gray-900">{item.requirement}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  {item.dueDate && (
                    <p className="text-sm text-gray-500">Due: {formatDate(item.dueDate)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
      {/* Report Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
          >
            <option value="revenue">Revenue Analysis</option>
            <option value="funding">Funding Breakdown</option>
            <option value="occupancy">Occupancy Trends</option>
            <option value="compliance">Regulatory Compliance</option>
          </select>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {reportType === 'revenue' && 'Revenue Analysis'}
            {reportType === 'funding' && 'Funding Breakdown'}
            {reportType === 'occupancy' && 'Occupancy Trends'}
            {reportType === 'compliance' && 'Regulatory Compliance Report'}
          </h2>
        </div>

        <div className="p-6">
          {reportType === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {formatCurrency(summary.totalRevenue, settings.currency)}
                  </p>
                  <p className="text-sm text-gray-500">Annual projection</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Revenue Per Bed</h3>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {formatCurrency(summary.revenuePerBed, settings.currency)}
                  </p>
                  <p className="text-sm text-gray-500">Annual average</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Outstanding</h3>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {formatCurrency(summary.outstandingPayments, settings.currency)}
                  </p>
                  <p className="text-sm text-gray-500">Pending payments</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Paid Invoices</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {summary.paidInvoices}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Average Payment Time</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {Math.round(summary.averagePaymentTime)} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'funding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.fundingBreakdown).map(([type, count]) => (
                  <div key={type} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      {type.split(/(?=[A-Z])/).join(' ')}
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-500">
                      {((count / Object.values(summary.fundingBreakdown).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportType === 'occupancy' && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Current Occupancy Rate</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {summary.occupancyRate.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {reportType === 'compliance' && renderComplianceReport()}
        </div>
      </div>

      {/* Export Controls */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>
    </div>
  );
} 



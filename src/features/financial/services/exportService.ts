import { FinancialSummary, FinancialSettings } from '../types/financial.types';
import { formatCurrency, formatDate } from '../utils/formatters';

type ReportPeriod = 'monthly' | 'quarterly' | 'annual';
type ReportType = 'revenue' | 'funding' | 'occupancy';

export class ExportService {
  private generateRevenueReport(
    summary: FinancialSummary,
    settings: FinancialSettings,
    period: ReportPeriod
  ): string {
    const lines = [
      'Revenue Analysis Report',
      `Generated on: ${formatDate(new Date())}`,
      `Period: ${period}`,
      '',
      'Financial Overview',
      '-----------------',
      `Total Revenue: ${formatCurrency(summary.totalRevenue, settings.currency)}`,
      `Revenue Per Bed: ${formatCurrency(summary.revenuePerBed, settings.currency)}`,
      `Outstanding Payments: ${formatCurrency(summary.outstandingPayments, settings.currency)}`,
      '',
      'Payment Statistics',
      '-----------------',
      `Paid Invoices: ${summary.paidInvoices}`,
      `Average Payment Time: ${Math.round(summary.averagePaymentTime)} days`,
    ];

    return lines.join('\n');
  }

  private generateFundingReport(
    summary: FinancialSummary,
    settings: FinancialSettings,
    period: ReportPeriod
  ): string {
    const total = Object.values(summary.fundingBreakdown).reduce((a, b) => a + b, 0);
    
    const lines = [
      'Funding Breakdown Report',
      `Generated on: ${formatDate(new Date())}`,
      `Period: ${period}`,
      '',
      'Funding Distribution',
      '-------------------',
    ];

    Object.entries(summary.fundingBreakdown).forEach(([type, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      lines.push(`${type.split(/(?=[A-Z])/).join(' ')}: ${count} (${percentage}%)`);
    });

    return lines.join('\n');
  }

  private generateOccupancyReport(
    summary: FinancialSummary,
    settings: FinancialSettings,
    period: ReportPeriod
  ): string {
    const lines = [
      'Occupancy Trends Report',
      `Generated on: ${formatDate(new Date())}`,
      `Period: ${period}`,
      '',
      'Occupancy Statistics',
      '-------------------',
      `Current Occupancy Rate: ${summary.occupancyRate.toFixed(1)}%`,
      `Revenue Per Bed: ${formatCurrency(summary.revenuePerBed, settings.currency)}`,
    ];

    return lines.join('\n');
  }

  async exportReport(
    summary: FinancialSummary,
    settings: FinancialSettings,
    reportType: ReportType,
    period: ReportPeriod
  ): Promise<Blob> {
    let content: string;

    switch (reportType) {
      case 'revenue':
        content = this.generateRevenueReport(summary, settings, period);
        break;
      case 'funding':
        content = this.generateFundingReport(summary, settings, period);
        break;
      case 'occupancy':
        content = this.generateOccupancyReport(summary, settings, period);
        break;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    return blob;
  }

  downloadReport(blob: Blob, reportType: ReportType, period: ReportPeriod): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${period}-${formatDate(new Date())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
} 



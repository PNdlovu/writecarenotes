import { 
  PayrollPeriod,
  PayrollEntry,
  PayrollSettings,
  PayrollStatus,
  PayrollReport,
  PayrollReportType,
  ReportFormat,
  PayrollCalculation
} from '../types';
import { TimeEntry } from '../../timesheet/types';
import { Employee } from '../../hr/types';
import { HMRCAdapter } from '../../financial/services/accounting/hmrc';
import { TenantContext } from '../../multi-tenant/types';
import { TenantStorage } from '../../multi-tenant/storage';
import { TenantContext } from '@/lib/multi-tenant/types';
import { PayrollCalculator } from './payroll-calculator';
import { RegionalPayrollConfig } from './regional-config';
import { PayrollOfflineSync } from './offline-sync';
import { 
  PayrollData, 
  Region, 
  TaxYear, 
  PayrollSummary,
  PayrollChangeType,
  PayrollChange,
  EmployeeRates
} from '../types';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';
import { PayrollLogger } from './payroll-logger';
import { PayrollMetrics } from '../monitoring';
import { validatePayrollCalculation, validateEmployeeRates } from '../validation';
import { PayrollCalculationError, ValidationError } from '../errors';
import { getAccessibilityConfig, formatCurrency, getPayrollSummaryAria } from '../accessibility';

export class PayrollService {
  private readonly calculator: PayrollCalculator;
  private readonly regionalConfig: RegionalPayrollConfig;
  private readonly offlineSync: PayrollOfflineSync;
  private readonly logger: PayrollLogger;
  private readonly metrics: PayrollMetrics;

  constructor(
    private readonly tenantContext: TenantContext,
    storage: IndexedDBStorage
  ) {
    this.calculator = new PayrollCalculator(tenantContext);
    this.regionalConfig = new RegionalPayrollConfig(tenantContext);
    this.offlineSync = new PayrollOfflineSync(tenantContext, storage);
    this.logger = new PayrollLogger(tenantContext);
    this.metrics = new PayrollMetrics(tenantContext);
  }

  async createPayrollPeriod(startDate: Date, endDate: Date, settings: PayrollSettings): Promise<PayrollPeriod> {
    // Validate tenant limits
    await this.validateTenantLimits();

    // Create new payroll period
    const period: PayrollPeriod = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
      status: PayrollStatus.DRAFT,
      totalGrossPay: 0,
      totalDeductions: 0,
      totalNetPay: 0,
      employeeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: this.tenantContext.tenant.id
    };

    // Save to database with tenant context
    await prisma.payrollPeriod.create({
      data: {
        ...period,
        organization: {
          connect: { tenantId: this.tenantContext.tenant.id }
        }
      }
    });

    return period;
  }

  private async validateTenantLimits() {
    // Get current employee count
    const employeeCount = await prisma.staff.count({
      where: {
        organizationId: this.tenantContext.tenant.id,
        status: 'ACTIVE'
      }
    });

    // Check against tenant limits
    if (employeeCount >= this.tenantContext.tenant.limits.maxEmployees) {
      throw new Error('Employee limit reached for this tenant');
    }

    // Check if payroll feature is enabled
    if (!this.tenantContext.tenant.features.payroll.enabled) {
      throw new Error('Payroll feature not enabled for this tenant');
    }
  }

  async processPayroll(periodId: string): Promise<PayrollPeriod> {
    // Get payroll period with tenant context
    const period = await prisma.payrollPeriod.findFirst({
      where: {
        id: periodId,
        organizationId: this.tenantContext.tenant.id
      }
    });

    if (!period) {
      throw new Error('Payroll period not found');
    }

    try {
      // Update status
      await this.updatePayrollStatus(periodId, PayrollStatus.PROCESSING);

      // Get all employees for this tenant
      const employees = await prisma.employee.findMany({
        where: {
          organizationId: this.tenantContext.tenant.id,
          status: 'ACTIVE'
        }
      });

      // Process each employee
      let totalGrossPay = 0;
      let totalDeductions = 0;
      let totalNetPay = 0;

      for (const employee of employees) {
        const entry = await this.processEmployeePayroll(period, employee);
        totalGrossPay += entry.grossPay;
        totalDeductions += entry.deductions.reduce((sum, d) => sum + d.amount, 0);
        totalNetPay += entry.netPay;
      }

      // Update period totals
      const updatedPeriod = await prisma.payrollPeriod.update({
        where: {
          id: periodId,
          organizationId: this.tenantContext.tenant.id
        },
        data: {
          totalGrossPay,
          totalDeductions,
          totalNetPay,
          employeeCount: employees.length,
          status: PayrollStatus.READY_FOR_REVIEW,
          updatedAt: new Date()
        }
      });

      // Cache results for offline access
      await this.tenantStorage.setCacheValue(
        this.tenantContext.tenant.id,
        `payroll:${periodId}`,
        updatedPeriod
      );

      return updatedPeriod;
    } catch (error) {
      await this.updatePayrollStatus(periodId, PayrollStatus.FAILED);
      throw error;
    }
  }

  async approvePayroll(periodId: string): Promise<PayrollPeriod> {
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId }
    });

    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (period.status !== PayrollStatus.READY_FOR_REVIEW) {
      throw new Error('Payroll period is not ready for approval');
    }

    // Update status
    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.APPROVED,
        updatedAt: new Date()
      }
    });

    // Submit to HMRC if real-time information is enabled
    const settings = await this.getPayrollSettings();
    if (settings.hmrcSettings.sendRealTimeInformation) {
      await this.submitToHMRC(periodId);
    }

    return updatedPeriod;
  }

  async generateReport(periodId: string, type: PayrollReportType, format: ReportFormat): Promise<PayrollReport> {
    // Validate tenant has reporting feature
    if (!this.tenantContext.tenant.features.payroll.modules.reporting) {
      throw new Error('Reporting module not enabled for this tenant');
    }

    const period = await prisma.payrollPeriod.findFirst({
      where: {
        id: periodId,
        organizationId: this.tenantContext.tenant.id
      },
      include: {
        entries: true
      }
    });

    if (!period) {
      throw new Error('Payroll period not found');
    }

    // Generate report with tenant branding
    const reportData = await this.generateReportData(period, type);
    const brandedReport = this.applyTenantBranding(reportData);

    // Create report record
    const report: PayrollReport = {
      id: crypto.randomUUID(),
      periodId,
      type,
      format,
      data: brandedReport,
      generatedAt: new Date()
    };

    // Save to database
    await prisma.payrollReport.create({
      data: {
        ...report,
        period: {
          connect: { id: periodId }
        }
      }
    });

    return report;
  }

  private applyTenantBranding(reportData: any): any {
    const { branding } = this.tenantContext.tenant;
    
    return {
      ...reportData,
      branding: {
        logo: branding.logo,
        colors: branding.colors,
        fonts: branding.fonts
      },
      organizationName: this.tenantContext.tenant.name,
      generatedAt: new Date().toLocaleString(
        this.tenantContext.tenant.settings.defaultLanguage,
        { timeZone: this.tenantContext.tenant.settings.defaultTimezone }
      )
    };
  }

  async calculatePayroll(
    employeeId: string,
    grossPay: number,
    region: Region,
    taxYear: TaxYear,
    rates?: EmployeeRates
  ): Promise<PayrollSummary> {
    const timer = this.metrics.startCalculation();
    
    try {
      // Validate inputs
      validatePayrollCalculation({
        employeeId,
        grossPay,
        region,
        taxYear,
        rates
      });

      if (rates) {
        validateEmployeeRates(rates);
      }

      // Get tax bands for the region
      const taxBands = await this.regionalConfig.getTaxBands(region, taxYear);
      
      // Calculate payroll using the calculator
      const summary = await this.calculator.calculatePayrollSummary(
        grossPay,
        taxBands,
        rates
      );

      // Store the calculation for offline access
      const payrollData: PayrollData = {
        id: `${employeeId}_${Date.now()}`,
        employeeId,
        summary,
        region,
        taxYear,
        lastModified: Date.now()
      };

      await this.offlineSync.storePayrollData(payrollData);

      // Queue the change for syncing
      const change: PayrollChange = {
        entityId: payrollData.id,
        type: PayrollChangeType.PAYMENT,
        method: 'POST',
        data: payrollData
      };

      await this.offlineSync.queueChange(change);

      // Log success
      this.logger.info('Payroll calculated successfully', {
        employeeId,
        region,
        taxYear,
        grossPay
      });

      // Record metrics
      const processingTime = timer();
      this.metrics.recordProcessingTime('calculation', processingTime);

      // Add accessibility information
      const config = getAccessibilityConfig(region);
      summary.aria = getPayrollSummaryAria(summary, config);
      summary.formattedGrossPay = formatCurrency(summary.grossPay, config);
      summary.formattedNetPay = formatCurrency(summary.netPay, config);
      summary.deductions = summary.deductions.map(d => ({
        ...d,
        formattedAmount: formatCurrency(d.amount, config)
      }));

      return summary;
    } catch (error) {
      // Log error
      this.logger.error('Failed to calculate payroll', error as Error, {
        employeeId,
        region,
        taxYear,
        grossPay
      });

      // Record error metrics
      this.metrics.recordCalculationError(error instanceof PayrollCalculationError ? 'calculation' : 'validation');

      throw error;
    }
  }

  async getStoredPayroll(id: string): Promise<PayrollData | null> {
    try {
      const data = await this.offlineSync.getPayrollData(id);
      
      if (data) {
        // Add accessibility formatting
        const config = getAccessibilityConfig(data.region);
        data.summary.aria = getPayrollSummaryAria(data.summary, config);
        data.summary.formattedGrossPay = formatCurrency(data.summary.grossPay, config);
        data.summary.formattedNetPay = formatCurrency(data.summary.netPay, config);
      }

      return data;
    } catch (error) {
      this.logger.error('Failed to retrieve stored payroll', error as Error, { id });
      throw error;
    }
  }

  async getTranslations(region: Region): Promise<Record<string, string>> {
    try {
      return await this.regionalConfig.getTranslations(region);
    } catch (error) {
      this.logger.error('Failed to get translations', error as Error, { region });
      throw error;
    }
  }

  async syncChanges(): Promise<void> {
    const timer = this.metrics.startCalculation();
    
    try {
      await this.offlineSync.processSyncQueue();
      
      // Record success metrics
      const processingTime = timer();
      this.metrics.recordProcessingTime('sync', processingTime);
      this.metrics.recordSyncAttempt(true);
      
      this.logger.info('Changes synced successfully');
    } catch (error) {
      this.metrics.recordSyncAttempt(false);
      this.logger.error('Failed to sync changes', error as Error);
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        this.regionalConfig.clearCache(),
        this.offlineSync.clearCache()
      ]);
      
      this.logger.info('Cache cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear cache', error as Error);
      throw error;
    }
  }

  private async processEmployeePayroll(period: PayrollPeriod, employee: Employee): Promise<PayrollEntry> {
    // Get time entries for the period
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: period.startDate,
          lte: period.endDate
        }
      }
    });

    // Get employee rates
    const rates = await this.getEmployeeRates(employee.id);

    // Calculate pay
    const grossPay = this.calculator.calculateGrossPay(timeEntries, rates);
    const deductions = this.calculator.calculateDeductions(grossPay, employee);
    const netPay = this.calculator.calculateNetPay(grossPay, deductions);

    // Create payroll entry
    const entry: PayrollEntry = {
      id: crypto.randomUUID(),
      periodId: period.id,
      employeeId: employee.id,
      regularHours: this.calculateRegularHours(timeEntries),
      overtimeHours: this.calculateOvertimeHours(timeEntries),
      holidayHours: this.calculateHolidayHours(timeEntries),
      sickHours: this.calculateSickHours(timeEntries),
      grossPay,
      deductions,
      netPay,
      paymentMethod: employee.paymentMethod,
      paymentStatus: 'PENDING'
    };

    // Save to database
    await prisma.payrollEntry.create({
      data: entry
    });

    return entry;
  }

  async submitToHMRC(periodId: string): Promise<void> {
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        entries: true
      }
    });

    if (!period) {
      throw new Error('Payroll period not found');
    }

    // Prepare RTI submission data
    const rtiData = await this.prepareRTIData(period);

    // Submit to HMRC
    try {
      await this.hmrcAdapter.submitPayrollReturn(rtiData);
    } catch (error) {
      throw new Error('Failed to submit RTI to HMRC: ' + error.message);
    }
  }

  private async updatePayrollStatus(periodId: string, status: PayrollStatus): Promise<void> {
    await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status,
        updatedAt: new Date()
      }
    });
  }

  private calculateRegularHours(timeEntries: TimeEntry[]): number {
    return timeEntries.reduce((sum, entry) => sum + (entry.regularHours || 0), 0);
  }

  private calculateOvertimeHours(timeEntries: TimeEntry[]): number {
    return timeEntries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);
  }

  private calculateHolidayHours(timeEntries: TimeEntry[]): number {
    return timeEntries.reduce((sum, entry) => sum + (entry.holidayHours || 0), 0);
  }

  private calculateSickHours(timeEntries: TimeEntry[]): number {
    return timeEntries.reduce((sum, entry) => sum + (entry.sickHours || 0), 0);
  }

  private async getEmployeeRates(employeeId: string): Promise<any> {
    // Implementation to get employee-specific rates
    return prisma.employeeRates.findUnique({
      where: { employeeId }
    });
  }

  private async getPayrollSettings(): Promise<PayrollSettings> {
    // Implementation to get organization's payroll settings
    return prisma.payrollSettings.findFirst();
  }

  private async generateReportData(period: PayrollPeriod, type: PayrollReportType): Promise<any> {
    // Implementation to generate report data based on type
    switch (type) {
      case PayrollReportType.PAYSLIPS:
        return this.generatePayslips(period);
      case PayrollReportType.SUMMARY:
        return this.generateSummary(period);
      case PayrollReportType.TAX:
        return this.generateTaxReport(period);
      default:
        throw new Error('Unsupported report type');
    }
  }

  private async prepareRTIData(period: PayrollPeriod): Promise<any> {
    // Implementation to prepare RTI data for HMRC submission
    return {
      // RTI data structure
    };
  }
}

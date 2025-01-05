import { PayrollProviderFactory } from '../integrations/providerFactory';
import { ThirdPartyPayrollService, ProviderConfig, PayrollIntegrationResult } from '../integrations/types';
import { prisma } from '@/lib/db';
import { Payroll } from '../types';

export class PayrollIntegrationService {
  private provider: ThirdPartyPayrollService | null = null;
  private config: ProviderConfig | null = null;

  async initialize(organizationId: string): Promise<void> {
    // Fetch organization's payroll provider configuration
    const orgConfig = await prisma.organizationSettings.findFirst({
      where: { organizationId, module: 'payroll' }
    });

    if (!orgConfig || !orgConfig.settings) {
      throw new Error('No payroll provider configured for organization');
    }

    this.config = orgConfig.settings as ProviderConfig;
    this.provider = await PayrollProviderFactory.createProvider(this.config);
  }

  async submitPayroll(payroll: Payroll): Promise<PayrollIntegrationResult> {
    if (!this.provider) {
      throw new Error('Payroll provider not initialized');
    }

    try {
      // Submit to third-party provider
      const result = await this.provider.submitPayroll(payroll);

      // Store the integration result
      await prisma.payrollIntegration.create({
        data: {
          payrollId: payroll.id,
          provider: this.config!.provider,
          providerReference: result.providerReference,
          status: result.success ? 'SUCCESS' : 'FAILED',
          error: result.error,
          details: result.details
        }
      });

      return result;
    } catch (error: any) {
      // Log the error and store the failed attempt
      console.error('Payroll submission error:', error);
      await prisma.payrollIntegration.create({
        data: {
          payrollId: payroll.id,
          provider: this.config!.provider,
          status: 'FAILED',
          error: error.message
        }
      });

      throw error;
    }
  }

  async syncEmployees(organizationId: string): Promise<PayrollIntegrationResult> {
    if (!this.provider) {
      throw new Error('Payroll provider not initialized');
    }

    try {
      const result = await this.provider.syncEmployees();

      if (result.success && result.details?.employees) {
        // Update local employee records with provider data
        await this.updateEmployeeRecords(organizationId, result.details.employees);
      }

      return result;
    } catch (error: any) {
      console.error('Employee sync error:', error);
      throw error;
    }
  }

  async generatePayslips(payrollId: string): Promise<PayrollIntegrationResult> {
    if (!this.provider) {
      throw new Error('Payroll provider not initialized');
    }

    try {
      const result = await this.provider.generatePayslips(payrollId);

      if (result.success) {
        // Store payslip references
        await this.storePayslipReferences(payrollId, result.details?.payslips);
      }

      return result;
    } catch (error: any) {
      console.error('Payslip generation error:', error);
      throw error;
    }
  }

  private async updateEmployeeRecords(organizationId: string, providerEmployees: any[]): Promise<void> {
    // Update local employee records with data from provider
    for (const employee of providerEmployees) {
      await prisma.employee.upsert({
        where: {
          organizationId_providerReference: {
            organizationId,
            providerReference: employee.id
          }
        },
        update: {
          providerData: employee
        },
        create: {
          organizationId,
          providerReference: employee.id,
          providerData: employee
        }
      });
    }
  }

  private async storePayslipReferences(payrollId: string, payslips: any[]): Promise<void> {
    if (!payslips) return;

    await prisma.payslip.createMany({
      data: payslips.map(payslip => ({
        payrollId,
        employeeId: payslip.employeeId,
        providerReference: payslip.id,
        url: payslip.url,
        generatedAt: new Date()
      }))
    });
  }
}



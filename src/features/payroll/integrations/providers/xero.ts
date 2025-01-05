import { TokenSet } from 'openid-client';
import { XeroClient } from 'xero-node';
import {
  ThirdPartyPayrollService,
  ProviderConfig,
  PayrollIntegrationResult,
  PayrollStatus
} from '../types';
import { Payroll } from '../../types';

export class XeroPayrollService implements ThirdPartyPayrollService {
  private client: XeroClient | null = null;
  private config: ProviderConfig | null = null;
  private tokenSet: TokenSet | null = null;

  async connect(config: ProviderConfig): Promise<boolean> {
    try {
      this.config = config;
      this.client = new XeroClient({
        clientId: config.credentials.clientId!,
        clientSecret: config.credentials.clientSecret!,
        grantType: 'client_credentials',
        scope: 'payroll.employees payroll.payslips payroll.settings',
      });

      this.tokenSet = await this.client.getClientCredentialsToken();
      return true;
    } catch (error) {
      console.error('Xero connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.tokenSet = null;
  }

  async validateConnection(): Promise<boolean> {
    if (!this.client || !this.tokenSet) {
      return false;
    }
    try {
      await this.client.refreshToken();
      return true;
    } catch {
      return false;
    }
  }

  async submitPayroll(payroll: Payroll): Promise<PayrollIntegrationResult> {
    if (!this.client) {
      return { success: false, error: 'Not connected to Xero' };
    }

    try {
      // Transform our payroll data to Xero's format
      const xeroPayroll = this.transformToXeroPayroll(payroll);
      
      // Submit to Xero
      const response = await this.client.payrollAPI.createPayRun({
        payRun: xeroPayroll
      });

      return {
        success: true,
        providerReference: response.body.payRuns[0].payRunID,
        details: response.body
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: error.response?.body
      };
    }
  }

  async getPayrollStatus(providerReference: string): Promise<PayrollStatus> {
    if (!this.client) {
      throw new Error('Not connected to Xero');
    }

    try {
      const response = await this.client.payrollAPI.getPayRun({
        payRunID: providerReference
      });

      // Map Xero status to our status enum
      switch (response.body.payRuns[0].status) {
        case 'DRAFT':
          return PayrollStatus.PENDING;
        case 'POSTED':
          return PayrollStatus.COMPLETED;
        case 'FAILED':
          return PayrollStatus.FAILED;
        default:
          return PayrollStatus.PROCESSING;
      }
    } catch (error) {
      console.error('Error getting payroll status:', error);
      throw error;
    }
  }

  async syncEmployees(): Promise<PayrollIntegrationResult> {
    if (!this.client) {
      return { success: false, error: 'Not connected to Xero' };
    }

    try {
      const response = await this.client.payrollAPI.getEmployees();
      return {
        success: true,
        details: {
          employees: response.body.employees
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: error.response?.body
      };
    }
  }

  async submitTaxFiling(period: string): Promise<PayrollIntegrationResult> {
    if (!this.client) {
      return { success: false, error: 'Not connected to Xero' };
    }

    try {
      // Submit tax filing to Xero
      const response = await this.client.payrollAPI.createEmployerPaymentSummary({
        period
      });

      return {
        success: true,
        providerReference: response.body.employerPaymentSummary.id,
        details: response.body
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: error.response?.body
      };
    }
  }

  async getTaxFilingStatus(reference: string): Promise<PayrollStatus> {
    if (!this.client) {
      throw new Error('Not connected to Xero');
    }

    try {
      const response = await this.client.payrollAPI.getEmployerPaymentSummary({
        id: reference
      });

      // Map Xero EPS status to our status enum
      switch (response.body.employerPaymentSummary.status) {
        case 'ACCEPTED':
          return PayrollStatus.COMPLETED;
        case 'REJECTED':
          return PayrollStatus.FAILED;
        default:
          return PayrollStatus.PROCESSING;
      }
    } catch (error) {
      console.error('Error getting tax filing status:', error);
      throw error;
    }
  }

  async generatePayslips(payrollId: string): Promise<PayrollIntegrationResult> {
    if (!this.client) {
      return { success: false, error: 'Not connected to Xero' };
    }

    try {
      const response = await this.client.payrollAPI.getPaySlips({
        payRunID: payrollId
      });

      return {
        success: true,
        details: {
          payslips: response.body.paySlips
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: error.response?.body
      };
    }
  }

  async downloadReports(type: string, period: string): Promise<Buffer> {
    if (!this.client) {
      throw new Error('Not connected to Xero');
    }

    try {
      const response = await this.client.payrollAPI.getPayrollReport({
        reportType: type,
        payrollCalendarID: period
      });

      return response.body as Buffer;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  private transformToXeroPayroll(payroll: Payroll): any {
    // Transform our payroll model to Xero's expected format
    return {
      payRunPeriodStartDate: payroll.startDate,
      payRunPeriodEndDate: payroll.endDate,
      payRunStatus: 'DRAFT',
      paymentDate: new Date(),
      payRunType: 'SCHEDULED',
      calendarType: this.mapPayPeriodToXero(payroll.period)
    };
  }

  private mapPayPeriodToXero(period: string): string {
    const periodMap: Record<string, string> = {
      WEEKLY: 'WEEKLY',
      BIWEEKLY: 'FORTNIGHTLY',
      MONTHLY: 'MONTHLY'
    };
    return periodMap[period] || 'WEEKLY';
  }
}



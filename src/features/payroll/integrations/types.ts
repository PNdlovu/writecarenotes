import { PayrollCalculation, Payroll } from '../types';

export interface PayrollProvider {
  name: string;
  apiVersion: string;
  region: string[];
}

export interface PayrollIntegrationResult {
  success: boolean;
  providerReference?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface ThirdPartyPayrollService {
  // Connection management
  connect(config: ProviderConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  validateConnection(): Promise<boolean>;

  // Core payroll operations
  submitPayroll(payroll: Payroll): Promise<PayrollIntegrationResult>;
  getPayrollStatus(providerReference: string): Promise<PayrollStatus>;
  syncEmployees(): Promise<PayrollIntegrationResult>;
  
  // Tax and compliance
  submitTaxFiling(period: string): Promise<PayrollIntegrationResult>;
  getTaxFilingStatus(reference: string): Promise<PayrollStatus>;
  
  // Reports and documents
  generatePayslips(payrollId: string): Promise<PayrollIntegrationResult>;
  downloadReports(type: string, period: string): Promise<Buffer>;
}

export interface ProviderConfig {
  provider: string;
  credentials: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    [key: string]: string | undefined;
  };
  settings: {
    environment: 'sandbox' | 'production';
    region: string;
    [key: string]: any;
  };
}

export enum PayrollStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}



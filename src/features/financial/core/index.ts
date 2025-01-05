// Export all types
export * from './types';

// Export all utilities
export * from './utils/formatters';
export * from './utils/validation';

// Export all constants
export * from './constants';

// Export interfaces that define core functionality
export interface FinancialProvider {
  tenantId: string;
  currency: string;
  region: string;
}

export interface AccountingProvider {
  tenantId: string;
  fiscalYear: {
    start: Date;
    end: Date;
  };
  settings: {
    currency: string;
    locale: string;
  };
}

// Export core hooks for providers
export { useFinancialProvider } from './hooks/useFinancialProvider';
export { useAccountingProvider } from './hooks/useAccountingProvider';

// Export core contexts
export { FinancialContext } from './contexts/FinancialContext';
export { AccountingContext } from './contexts/AccountingContext'; 



import { useState, useEffect } from 'react';
import { AccountingProvider } from '../';
import { FinancialError } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface UseAccountingProviderOptions {
  tenantId: string;
  fiscalYear?: {
    start: Date;
    end: Date;
  };
  settings?: {
    currency?: string;
    locale?: string;
  };
}

interface UseAccountingProviderResult extends AccountingProvider {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
}

const getCurrentFiscalYear = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), 0, 1), // January 1st
    end: new Date(now.getFullYear(), 11, 31)  // December 31st
  };
};

export function useAccountingProvider({
  tenantId,
  fiscalYear = getCurrentFiscalYear(),
  settings = {
    currency: DEFAULT_CURRENCY.code,
    locale: 'en-GB'
  }
}: UseAccountingProviderOptions): UseAccountingProviderResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Validate currency
  if (!SUPPORTED_CURRENCIES[settings.currency as keyof typeof SUPPORTED_CURRENCIES]) {
    throw new FinancialError(
      `Unsupported currency: ${settings.currency}`,
      'VALIDATION_ERROR'
    );
  }

  // Validate fiscal year
  if (fiscalYear.start > fiscalYear.end) {
    throw new FinancialError(
      'Fiscal year start date must be before end date',
      'VALIDATION_ERROR'
    );
  }

  const initialize = async () => {
    try {
      setIsLoading(true);
      
      // Here you would typically:
      // 1. Load accounting settings from API
      // 2. Initialize chart of accounts
      // 3. Load fiscal year data
      // 4. Set up accounting period
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize accounting provider'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, [tenantId]); // Re-initialize if tenant changes

  return {
    tenantId,
    fiscalYear,
    settings,
    isInitialized,
    isLoading,
    error,
    initialize
  };
} 



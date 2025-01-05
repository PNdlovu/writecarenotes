import { useState, useEffect } from 'react';
import { FinancialProvider } from '../';
import { FinancialError } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface UseFinancialProviderOptions {
  tenantId: string;
  currency?: string;
  region?: string;
}

interface UseFinancialProviderResult extends FinancialProvider {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
}

export function useFinancialProvider({
  tenantId,
  currency = DEFAULT_CURRENCY.code,
  region = 'UK'
}: UseFinancialProviderOptions): UseFinancialProviderResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Validate currency
  if (!SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]) {
    throw new FinancialError(
      `Unsupported currency: ${currency}`,
      'VALIDATION_ERROR'
    );
  }

  const initialize = async () => {
    try {
      setIsLoading(true);
      
      // Here you would typically:
      // 1. Load tenant settings from API
      // 2. Initialize required services
      // 3. Set up event listeners
      // 4. Load initial data
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize financial provider'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, [tenantId]); // Re-initialize if tenant changes

  return {
    tenantId,
    currency,
    region,
    isInitialized,
    isLoading,
    error,
    initialize
  };
} 



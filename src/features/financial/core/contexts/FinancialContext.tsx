import React, { createContext, useContext } from 'react';
import { FinancialProvider } from '../';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface FinancialContextValue extends FinancialProvider {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const defaultContext: FinancialContextValue = {
  tenantId: '',
  currency: DEFAULT_CURRENCY.code,
  region: 'UK',
  isInitialized: false,
  isLoading: true,
  error: null
};

export const FinancialContext = createContext<FinancialContextValue>(defaultContext);

interface FinancialProviderProps {
  children: React.ReactNode;
  tenantId: string;
  currency?: string;
  region?: string;
}

export function FinancialContextProvider({
  children,
  tenantId,
  currency = DEFAULT_CURRENCY.code,
  region = 'UK'
}: FinancialProviderProps) {
  // Validate currency
  if (!SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const value: FinancialContextValue = {
    tenantId,
    currency,
    region,
    isInitialized: true,
    isLoading: false,
    error: null
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancialContext() {
  const context = useContext(FinancialContext);
  
  if (!context) {
    throw new Error('useFinancialContext must be used within a FinancialContextProvider');
  }
  
  return context;
} 



import React, { createContext, useContext } from 'react';
import { AccountingProvider } from '../';
import { DEFAULT_CURRENCY } from '../constants';

interface AccountingContextValue extends AccountingProvider {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const defaultContext: AccountingContextValue = {
  tenantId: '',
  fiscalYear: {
    start: new Date(new Date().getFullYear(), 0, 1), // January 1st
    end: new Date(new Date().getFullYear(), 11, 31)  // December 31st
  },
  settings: {
    currency: DEFAULT_CURRENCY.code,
    locale: 'en-GB'
  },
  isInitialized: false,
  isLoading: true,
  error: null
};

export const AccountingContext = createContext<AccountingContextValue>(defaultContext);

interface AccountingProviderProps {
  children: React.ReactNode;
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

export function AccountingContextProvider({
  children,
  tenantId,
  fiscalYear = defaultContext.fiscalYear,
  settings = defaultContext.settings
}: AccountingProviderProps) {
  const value: AccountingContextValue = {
    tenantId,
    fiscalYear,
    settings: {
      ...defaultContext.settings,
      ...settings
    },
    isInitialized: true,
    isLoading: false,
    error: null
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccountingContext() {
  const context = useContext(AccountingContext);
  
  if (!context) {
    throw new Error('useAccountingContext must be used within an AccountingContextProvider');
  }
  
  return context;
} 



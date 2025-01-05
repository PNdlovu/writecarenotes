import { useContext } from 'react';
import { TenantContext } from '../tenantContext';
import { TenantContextType } from './types';

export function useTenantContext(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
} 
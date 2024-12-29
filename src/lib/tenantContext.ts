import { createContext } from 'react';
import { TenantContextType } from './multi-tenant/types';

export const TenantContext = createContext<TenantContextType | null>(null); 
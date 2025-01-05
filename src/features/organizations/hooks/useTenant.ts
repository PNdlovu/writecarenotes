'use client'

import { useContext, createContext } from 'react'
import { Tenant } from '../types/tenant.types'
import { TenantService } from '../services/tenantService'

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
})

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}



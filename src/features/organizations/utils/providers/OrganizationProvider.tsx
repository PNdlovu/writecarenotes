'use client'

import { ReactNode } from 'react'
import { OrganizationContext, useOrganizationContext } from '../hooks/useOrganizationContext'

interface OrganizationProviderProps {
  children: ReactNode
  organizationId: string
}

export function OrganizationProvider({ children, organizationId }: OrganizationProviderProps) {
  const context = useOrganizationContext(organizationId)

  return (
    <OrganizationContext.Provider value={context}>
      {children}
    </OrganizationContext.Provider>
  )
}



'use client'

import { useContext } from 'react'
import { OrganizationContext } from '../utils/providers/OrganizationProvider'

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}



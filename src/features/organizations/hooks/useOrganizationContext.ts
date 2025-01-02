'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Organization } from '../types'
import { organizationService } from '../services/organizationService'
import { OrganizationAnalyticsService } from '../services/analyticsService'
import type { OrganizationMetrics, CareHomeMetricsSummary } from '../services/analytics/types'

export interface OrganizationContextType {
  organization: Organization | null
  isLoading: boolean
  error: Error | null
  metrics: OrganizationMetrics | null
  careHomeMetrics: CareHomeMetricsSummary[]
  refetch: () => Promise<void>
  updateOrganization: (data: Partial<Organization>) => Promise<void>
  updateSettings: (settings: Organization['settings']) => Promise<void>
  addCareHome: (careHomeId: string) => Promise<void>
  removeCareHome: (careHomeId: string) => Promise<void>
}

export const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  isLoading: true,
  error: null,
  metrics: null,
  careHomeMetrics: [],
  refetch: async () => {},
  updateOrganization: async () => {},
  updateSettings: async () => {},
  addCareHome: async () => {},
  removeCareHome: async () => {},
})

export function useOrganizationContext(organizationId: string) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(null)
  const [careHomeMetrics, setCareHomeMetrics] = useState<CareHomeMetricsSummary[]>([])

  const analyticsService = new OrganizationAnalyticsService()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [org, orgMetrics, careHomes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}`).then(res => res.json()),
        analyticsService.getOrganizationMetrics(organizationId),
        analyticsService.getCareHomeMetrics(organizationId),
      ])

      if (!org) {
        throw new Error('Organization not found')
      }

      setOrganization(org)
      setMetrics(orgMetrics)
      setCareHomeMetrics(careHomes)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [organizationId])

  const updateOrganization = async (data: Partial<Organization>) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const updated = await response.json()
      setOrganization(updated)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateSettings = async (settings: Organization['settings']) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      const updated = await response.json()
      setOrganization(updated)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const addCareHome = async (careHomeId: string) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/care-homes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ careHomeId }),
      })
      const updated = await response.json()
      setOrganization(updated)
      await fetchData() // Refresh metrics
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const removeCareHome = async (careHomeId: string) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/care-homes/${careHomeId}`, {
        method: 'DELETE',
      })
      const updated = await response.json()
      setOrganization(updated)
      await fetchData() // Refresh metrics
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return {
    organization,
    isLoading,
    error,
    metrics,
    careHomeMetrics,
    refetch: fetchData,
    updateOrganization,
    updateSettings,
    addCareHome,
    removeCareHome,
  }
}



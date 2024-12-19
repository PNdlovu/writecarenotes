'use client'

import { useState, useEffect } from 'react'
import { OrganizationAnalyticsService } from '../services/analyticsService'
import type { OrganizationMetrics, CareHomeMetricsSummary } from '../repositories/analyticsRepository'

export function useOrganizationAnalytics(organizationId: string) {
  const [data, setData] = useState<{
    metrics: OrganizationMetrics
    careHomes: CareHomeMetricsSummary[]
    compliance: {
      categoryScores: Record<string, number>
      riskAreas: { name: string; count: number }[]
      trendsLastMonth: {
        improvement: number
        decline: number
        unchanged: number
      }
    }
    historicalData: {
      date: Date
      metrics: OrganizationMetrics
    }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const analyticsService = new OrganizationAnalyticsService()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const report = await analyticsService.generateAnalyticsReport(organizationId)
      setData(report)
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

  const refresh = () => {
    return fetchData()
  }

  return {
    data,
    isLoading,
    error,
    refresh,
  }
}



/**
 * @fileoverview Organization Analytics Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod'
import { DateRange } from '@/features/financial/core/types'

export interface PerformanceMetrics {
  bedOccupancy: number
  staffUtilization: number
  satisfactionScore: number
  qualityScore: number
  incidentRate: number
  complianceRate: number
  staffTurnover: number
  averageStayDuration: number
  readmissionRate: number
  timeseriesData: Array<{
    timestamp: Date
    metrics: {
      bedOccupancy: number
      staffUtilization: number
      satisfactionScore: number
      qualityScore: number
    }
  }>
}

export interface ResourceMetrics {
  staffing: {
    total: number
    byRole: Record<string, number>
    byShift: Record<string, number>
    vacancies: number
    sickLeave: number
    training: {
      completed: number
      pending: number
      expired: number
    }
  }
  facilities: {
    totalBeds: number
    occupiedBeds: number
    maintenanceRequests: number
    equipmentUtilization: number
  }
  supplies: {
    stockLevels: Record<string, number>
    reorderPoints: Record<string, number>
    wastage: number
    costs: number
  }
}

export interface FinancialMetrics {
  revenue: {
    total: number
    byService: Record<string, number>
    byRegion: Record<string, number>
    trends: Array<{
      month: string
      amount: number
    }>
  }
  expenses: {
    total: number
    byCategory: Record<string, number>
    byFacility: Record<string, number>
    trends: Array<{
      month: string
      amount: number
    }>
  }
  kpis: {
    occupancyRate: number
    revenuePerBed: number
    staffCostRatio: number
    operatingMargin: number
  }
}

export interface ComplianceMetrics {
  overall: {
    score: number
    violations: number
    criticalIssues: number
    improvements: number
  }
  byCategory: Record<string, {
    score: number
    issues: number
  }>
  training: {
    completion: number
    upcoming: number
    overdue: number
  }
  audits: Array<{
    date: Date
    type: string
    score: number
    findings: number
  }>
}

export interface OrganizationAnalytics {
  period: DateRange
  performance: PerformanceMetrics
  resources: ResourceMetrics
  financial: FinancialMetrics
  compliance: ComplianceMetrics
  metadata: {
    generatedAt: Date
    dataCompleteness: number
    dataSources: string[]
  }
}

// Zod schema for validation
export const analyticsSchema = z.object({
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  performance: z.object({
    bedOccupancy: z.number(),
    staffUtilization: z.number(),
    satisfactionScore: z.number(),
    qualityScore: z.number(),
    incidentRate: z.number(),
    complianceRate: z.number(),
    staffTurnover: z.number(),
    averageStayDuration: z.number(),
    readmissionRate: z.number(),
    timeseriesData: z.array(z.object({
      timestamp: z.date(),
      metrics: z.object({
        bedOccupancy: z.number(),
        staffUtilization: z.number(),
        satisfactionScore: z.number(),
        qualityScore: z.number()
      })
    }))
  }),
  resources: z.object({
    staffing: z.object({
      total: z.number(),
      byRole: z.record(z.string(), z.number()),
      byShift: z.record(z.string(), z.number()),
      vacancies: z.number(),
      sickLeave: z.number(),
      training: z.object({
        completed: z.number(),
        pending: z.number(),
        expired: z.number()
      })
    }),
    facilities: z.object({
      totalBeds: z.number(),
      occupiedBeds: z.number(),
      maintenanceRequests: z.number(),
      equipmentUtilization: z.number()
    }),
    supplies: z.object({
      stockLevels: z.record(z.string(), z.number()),
      reorderPoints: z.record(z.string(), z.number()),
      wastage: z.number(),
      costs: z.number()
    })
  }),
  financial: z.object({
    revenue: z.object({
      total: z.number(),
      byService: z.record(z.string(), z.number()),
      byRegion: z.record(z.string(), z.number()),
      trends: z.array(z.object({
        month: z.string(),
        amount: z.number()
      }))
    }),
    expenses: z.object({
      total: z.number(),
      byCategory: z.record(z.string(), z.number()),
      byFacility: z.record(z.string(), z.number()),
      trends: z.array(z.object({
        month: z.string(),
        amount: z.number()
      }))
    }),
    kpis: z.object({
      occupancyRate: z.number(),
      revenuePerBed: z.number(),
      staffCostRatio: z.number(),
      operatingMargin: z.number()
    })
  }),
  compliance: z.object({
    overall: z.object({
      score: z.number(),
      violations: z.number(),
      criticalIssues: z.number(),
      improvements: z.number()
    }),
    byCategory: z.record(z.string(), z.object({
      score: z.number(),
      issues: z.number()
    })),
    training: z.object({
      completion: z.number(),
      upcoming: z.number(),
      overdue: z.number()
    }),
    audits: z.array(z.object({
      date: z.date(),
      type: z.string(),
      score: z.number(),
      findings: z.number()
    }))
  }),
  metadata: z.object({
    generatedAt: z.date(),
    dataCompleteness: z.number(),
    dataSources: z.array(z.string())
  })
}) 



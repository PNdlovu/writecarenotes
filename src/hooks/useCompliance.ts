import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRegional } from '@/contexts/RegionalContext'
import type { ComplianceData, RegionalStandards } from '@/types/compliance'
import { thresholds } from '@/config/thresholds'
import { notifications } from '@/config/notifications'

interface ComplianceStats {
  overall_score: number
  category_scores: Record<string, number>
  improvement_areas: string[]
  upcoming_deadlines: {
    item: string
    deadline: Date
    type: string
  }[]
  recent_changes: {
    item: string
    date: Date
    change: string
    user: string
  }[]
}

interface ComplianceFilters {
  status?: 'met' | 'partially_met' | 'not_met'
  category?: string
  priority?: 'high' | 'medium' | 'low'
  deadline?: Date
  assignee?: string
}

export function useCompliance() {
  const { data: session } = useSession()
  const { settings, validateRegionalCompliance } = useRegional()
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Enhanced fetch compliance data with filters
  const fetchComplianceData = useCallback(async (filters?: ComplianceFilters) => {
    try {
      setLoading(true)
      const queryParams = filters ? `?${new URLSearchParams(filters as any)}` : ''
      const response = await fetch(`/api/compliance/data${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch compliance data')
      const data = await response.json()
      setComplianceData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate detailed compliance statistics
  const calculateStats = useCallback((data: ComplianceData): ComplianceStats => {
    const categoryScores: Record<string, number> = {}
    const improvementAreas: string[] = []
    const upcomingDeadlines: { item: string; deadline: Date; type: string }[] = []
    const recentChanges: { item: string; date: Date; change: string; user: string }[] = []

    // Calculate category scores
    Object.entries(data.standards).forEach(([category, standards]) => {
      const score = calculateComplianceScore(standards)
      categoryScores[category] = score
      if (score < thresholds.compliance.warning) {
        improvementAreas.push(category)
      }
    })

    // Calculate overall score
    const overall_score = Object.values(categoryScores).reduce(
      (acc, score) => acc + score,
      0
    ) / Object.keys(categoryScores).length

    // Get upcoming deadlines
    data.standards.improvements.forEach(improvement => {
      if (!improvement.status.includes('completed')) {
        upcomingDeadlines.push({
          item: improvement.area,
          deadline: improvement.deadline,
          type: 'improvement'
        })
      }
    })

    // Track recent changes
    data.standards.inspections.forEach(inspection => {
      inspection.findings.forEach(finding => {
        recentChanges.push({
          item: finding.area,
          date: inspection.date,
          change: `Inspection finding: ${finding.rating}/5`,
          user: 'Inspector'
        })
      })
    })

    return {
      overall_score,
      category_scores: categoryScores,
      improvement_areas: improvementAreas,
      upcoming_deadlines: upcomingDeadlines.sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ),
      recent_changes: recentChanges.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }
  }, [])

  // Enhanced compliance score calculation
  const calculateComplianceScore = useCallback((standards: RegionalStandards) => {
    const weights = {
      met: 1,
      partially_met: 0.5,
      not_met: 0
    }

    const totalRequirements = standards.standards.length
    const weightedSum = standards.standards.reduce((sum, standard) => {
      return sum + weights[standard.compliance_status]
    }, 0)

    return (weightedSum / totalRequirements) * 100
  }, [])

  // Get compliance status with detailed info
  const getComplianceStatus = useCallback((score: number) => {
    const status = {
      level: score >= thresholds.compliance.critical ? 'compliant' :
             score >= thresholds.compliance.warning ? 'at_risk' :
             score >= thresholds.compliance.minimum ? 'non_compliant' : 'critical',
      description: '',
      required_actions: [] as string[],
      notification_level: 'low' as 'critical' | 'high' | 'medium' | 'low'
    }

    if (status.level === 'compliant') {
      status.description = 'Meeting all regulatory requirements'
      status.required_actions = ['Continue monitoring', 'Maintain documentation']
      status.notification_level = 'low'
    } else if (status.level === 'at_risk') {
      status.description = 'Some areas need attention'
      status.required_actions = ['Review non-compliant areas', 'Create action plan']
      status.notification_level = 'medium'
    } else if (status.level === 'non_compliant') {
      status.description = 'Significant improvements needed'
      status.required_actions = ['Immediate action required', 'Schedule review']
      status.notification_level = 'high'
    } else {
      status.description = 'Critical compliance issues'
      status.required_actions = ['Urgent intervention needed', 'Report to management']
      status.notification_level = 'critical'
    }

    return status
  }, [])

  // Enhanced update compliance item
  const updateComplianceItem = useCallback(async (
    itemId: string,
    updates: Partial<RegionalStandards>,
    evidence?: File[]
  ) => {
    try {
      const formData = new FormData()
      formData.append('updates', JSON.stringify(updates))
      if (evidence) {
        evidence.forEach(file => formData.append('evidence', file))
      }

      const response = await fetch(`/api/compliance/items/${itemId}`, {
        method: 'PATCH',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to update compliance item')
      
      // Validate against regional requirements
      const validationResult = await validateRegionalCompliance(updates)
      if (!validationResult) {
        throw new Error('Failed regional compliance validation')
      }

      await fetchComplianceData()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }, [fetchComplianceData, validateRegionalCompliance])

  // Schedule compliance review with notifications
  const scheduleComplianceReview = useCallback(async (
    standardId: string,
    date: Date,
    reviewers: string[],
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    try {
      const response = await fetch('/api/compliance/reviews/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          standardId,
          reviewDate: date,
          reviewers,
          priority,
          notification_settings: notifications.roles.manager
        }),
      })

      if (!response.ok) throw new Error('Failed to schedule compliance review')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }, [])

  // Generate compliance report
  const generateReport = useCallback(async (
    type: 'full' | 'summary' | 'improvement' | 'regulatory',
    dateRange?: { start: Date; end: Date },
    format: 'pdf' | 'excel' | 'html' = 'pdf'
  ) => {
    try {
      const response = await fetch('/api/compliance/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          dateRange,
          format,
          regional_settings: settings
        }),
      })

      if (!response.ok) throw new Error('Failed to generate report')
      const blob = await response.blob()
      return blob
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [settings])

  // Initial data fetch and stats calculation
  useEffect(() => {
    if (session) {
      fetchComplianceData().then(() => {
        if (complianceData) {
          const calculatedStats = calculateStats(complianceData)
          setStats(calculatedStats)
        }
      })
    }
  }, [session, fetchComplianceData, complianceData, calculateStats])

  return {
    complianceData,
    stats,
    loading,
    error,
    calculateComplianceScore,
    getComplianceStatus,
    updateComplianceItem,
    scheduleComplianceReview,
    generateReport,
    refreshData: fetchComplianceData,
  }
}



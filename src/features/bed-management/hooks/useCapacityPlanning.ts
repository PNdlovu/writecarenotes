import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import bedManagementRepository from '../repositories/bedManagementRepository'
import { Wing, Room, BedStatus, CareLevel } from '../types'
import { calculateRoomOccupancy } from '../utils/bedAssignmentUtils'

export const useCapacityPlanning = (wingId?: string) => {
    const queryClient = useQueryClient()
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week')

    // Get current occupancy data
    const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery(
        ['bed-management', 'occupancy', wingId],
        () => wingId ? bedManagementRepository.getWingCapacityStats(wingId) : null,
        {
            enabled: !!wingId,
            refetchInterval: 300000, // Refresh every 5 minutes
        }
    )

    // Get projected admissions and discharges
    const { data: projectedChanges, isLoading: isLoadingProjections } = useQuery(
        ['bed-management', 'projections', wingId, timeframe],
        () => bedManagementRepository.getProjectedChanges(wingId, timeframe),
        {
            enabled: !!wingId,
        }
    )

    // Calculate occupancy by care level
    const occupancyByCareLevel = useMemo(() => {
        if (!occupancyData?.beds) return null

        return Object.values(CareLevel).reduce((acc, level) => {
            const bedsForCareLevel = occupancyData.beds.filter(
                bed => bed.currentResident?.careLevel === level
            )
            
            acc[level] = {
                total: bedsForCareLevel.length,
                occupied: bedsForCareLevel.filter(b => b.status === BedStatus.OCCUPIED).length
            }
            return acc
        }, {} as Record<CareLevel, { total: number; occupied: number }>)
    }, [occupancyData])

    // Calculate optimal bed allocations based on waiting list and current residents
    const { data: optimizedAllocation } = useQuery(
        ['bed-management', 'optimization', wingId],
        () => bedManagementRepository.getOptimalBedAllocation(wingId),
        {
            enabled: !!wingId,
            refetchInterval: 3600000, // Refresh every hour
        }
    )

    // Generate capacity alerts
    const capacityAlerts = useMemo(() => {
        if (!occupancyData || !projectedChanges) return []

        const alerts = []

        // Check current capacity
        if (occupancyData.available < 2) {
            alerts.push({
                type: 'warning',
                message: 'Low bed availability',
                details: `Only ${occupancyData.available} beds available`
            })
        }

        // Check projected capacity issues
        const projectedAvailable = occupancyData.available + 
            projectedChanges.discharges.length - 
            projectedChanges.admissions.length

        if (projectedAvailable < 0) {
            alerts.push({
                type: 'critical',
                message: 'Projected capacity shortage',
                details: `Shortage of ${Math.abs(projectedAvailable)} beds in next ${timeframe}`
            })
        }

        return alerts
    }, [occupancyData, projectedChanges, timeframe])

    return {
        occupancyData,
        occupancyByCareLevel,
        projectedChanges,
        optimizedAllocation,
        capacityAlerts,
        timeframe,
        setTimeframe,
        isLoading: isLoadingOccupancy || isLoadingProjections
    }
}

export default useCapacityPlanning



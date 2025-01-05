/**
 * @fileoverview Care Plan Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CarePlanService from '../services/carePlanService'
import type {
    CarePlan,
    CarePlanTemplate,
    CarePlanProgress,
    CarePlanReview,
    CarePlanStatus
} from '../types'

interface UseCarePlanProps {
    careHomeId: string
    serviceUserId?: string
}

export function useCarePlan({ careHomeId, serviceUserId }: UseCarePlanProps) {
    const queryClient = useQueryClient()
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

    // Queries
    const carePlansQuery = useQuery({
        queryKey: ['carePlans', careHomeId, serviceUserId],
        queryFn: () => serviceUserId 
            ? CarePlanService.getCarePlansByServiceUser(serviceUserId)
            : CarePlanService.getDueReviews(careHomeId)
    })

    const selectedPlanQuery = useQuery({
        queryKey: ['carePlan', selectedPlanId],
        queryFn: () => selectedPlanId ? CarePlanService.getCarePlan(selectedPlanId) : null,
        enabled: !!selectedPlanId
    })

    const templatesQuery = useQuery({
        queryKey: ['carePlanTemplates'],
        queryFn: () => CarePlanService.getTemplates()
    })

    // Mutations
    const createPlanMutation = useMutation({
        mutationFn: ({ data, templateId }: { data: Omit<CarePlan, 'id'>, templateId?: string }) => 
            CarePlanService.createCarePlan(data, templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carePlans'] })
        }
    })

    const updatePlanMutation = useMutation({
        mutationFn: ({ id, data, userId }: { id: string, data: Partial<CarePlan>, userId: string }) =>
            CarePlanService.updateCarePlan(id, data, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['carePlans'] })
            queryClient.invalidateQueries({ queryKey: ['carePlan', variables.id] })
        }
    })

    const recordProgressMutation = useMutation({
        mutationFn: (data: Omit<CarePlanProgress, 'id'>) =>
            CarePlanService.recordProgress(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['carePlan', variables.carePlanId] })
        }
    })

    const conductReviewMutation = useMutation({
        mutationFn: (data: Omit<CarePlanReview, 'id'>) =>
            CarePlanService.conductReview(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['carePlan', variables.carePlanId] })
            queryClient.invalidateQueries({ queryKey: ['carePlans'] })
        }
    })

    const approvePlanMutation = useMutation({
        mutationFn: ({ id, userId, notes }: { id: string, userId: string, notes?: string }) =>
            CarePlanService.approveCarePlan(id, userId, notes),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['carePlan', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['carePlans'] })
        }
    })

    // Helper functions
    const selectPlan = useCallback((id: string | null) => {
        setSelectedPlanId(id)
    }, [])

    const createPlan = useCallback(async (
        data: Omit<CarePlan, 'id'>,
        templateId?: string
    ) => {
        return createPlanMutation.mutateAsync({ data, templateId })
    }, [createPlanMutation])

    const updatePlan = useCallback(async (
        id: string,
        data: Partial<CarePlan>,
        userId: string
    ) => {
        return updatePlanMutation.mutateAsync({ id, data, userId })
    }, [updatePlanMutation])

    const recordProgress = useCallback(async (data: Omit<CarePlanProgress, 'id'>) => {
        return recordProgressMutation.mutateAsync(data)
    }, [recordProgressMutation])

    const conductReview = useCallback(async (data: Omit<CarePlanReview, 'id'>) => {
        return conductReviewMutation.mutateAsync(data)
    }, [conductReviewMutation])

    const approvePlan = useCallback(async (
        id: string,
        userId: string,
        notes?: string
    ) => {
        return approvePlanMutation.mutateAsync({ id, userId, notes })
    }, [approvePlanMutation])

    return {
        // Queries
        carePlans: carePlansQuery.data ?? [],
        selectedPlan: selectedPlanQuery.data,
        templates: templatesQuery.data ?? [],
        isLoading: carePlansQuery.isLoading || selectedPlanQuery.isLoading || templatesQuery.isLoading,
        isError: carePlansQuery.isError || selectedPlanQuery.isError || templatesQuery.isError,
        error: carePlansQuery.error || selectedPlanQuery.error || templatesQuery.error,

        // Mutations
        createPlan,
        updatePlan,
        recordProgress,
        conductReview,
        approvePlan,
        isMutating: createPlanMutation.isPending || updatePlanMutation.isPending || 
                    recordProgressMutation.isPending || conductReviewMutation.isPending || 
                    approvePlanMutation.isPending,

        // Actions
        selectPlan,
        selectedPlanId,

        // Mutation States
        createPlanStatus: createPlanMutation.status,
        updatePlanStatus: updatePlanMutation.status,
        recordProgressStatus: recordProgressMutation.status,
        conductReviewStatus: conductReviewMutation.status,
        approvePlanStatus: approvePlanMutation.status
    }
}



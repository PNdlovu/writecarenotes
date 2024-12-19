import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CarePlanService from '../services/carePlanService'
import type { CarePlan, CarePlanReview } from '../types'

interface UseCarePlanReviewProps {
    careHomeId: string
}

export function useCarePlanReview({ careHomeId }: UseCarePlanReviewProps) {
    const queryClient = useQueryClient()

    // Queries
    const dueReviewsQuery = useQuery({
        queryKey: ['carePlanDueReviews', careHomeId],
        queryFn: () => CarePlanService.getDueReviews(careHomeId)
    })

    // Mutations
    const conductReviewMutation = useMutation({
        mutationFn: (data: Omit<CarePlanReview, 'id'>) =>
            CarePlanService.conductReview(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['carePlan', variables.carePlanId] })
            queryClient.invalidateQueries({ queryKey: ['carePlanDueReviews'] })
        }
    })

    const approvePlanMutation = useMutation({
        mutationFn: ({ id, userId, notes }: { id: string, userId: string, notes?: string }) =>
            CarePlanService.approveCarePlan(id, userId, notes),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['carePlan', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['carePlanDueReviews'] })
        }
    })

    // Helper functions
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

    const getDueReviewsByPriority = useCallback((plans: CarePlan[]) => {
        return plans.reduce((acc, plan) => {
            const daysUntilDue = Math.ceil(
                (new Date(plan.nextReviewDate).getTime() - new Date().getTime()) / 
                (1000 * 60 * 60 * 24)
            )

            if (daysUntilDue < 0) {
                acc.overdue.push(plan)
            } else if (daysUntilDue <= 7) {
                acc.dueThisWeek.push(plan)
            } else if (daysUntilDue <= 30) {
                acc.dueThisMonth.push(plan)
            } else {
                acc.upcoming.push(plan)
            }

            return acc
        }, {
            overdue: [] as CarePlan[],
            dueThisWeek: [] as CarePlan[],
            dueThisMonth: [] as CarePlan[],
            upcoming: [] as CarePlan[]
        })
    }, [])

    return {
        // Queries
        dueReviews: dueReviewsQuery.data ?? [],
        dueReviewsByPriority: getDueReviewsByPriority(dueReviewsQuery.data ?? []),
        isLoading: dueReviewsQuery.isLoading,
        isError: dueReviewsQuery.isError,
        error: dueReviewsQuery.error,

        // Actions
        conductReview,
        approvePlan,

        // Mutation States
        isMutating: conductReviewMutation.isPending || approvePlanMutation.isPending,
        conductReviewStatus: conductReviewMutation.status,
        approvePlanStatus: approvePlanMutation.status
    }
}



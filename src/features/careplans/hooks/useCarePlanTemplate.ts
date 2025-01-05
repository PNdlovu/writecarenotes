import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CarePlanService from '../services/carePlanService'
import type { CarePlanTemplate } from '../types'

interface UseCarePlanTemplateProps {
    careLevel?: string
}

export function useCarePlanTemplate({ careLevel }: UseCarePlanTemplateProps = {}) {
    const queryClient = useQueryClient()

    // Queries
    const templatesQuery = useQuery({
        queryKey: ['carePlanTemplates', careLevel],
        queryFn: () => CarePlanService.getTemplates(careLevel)
    })

    const getTemplate = useCallback(async (id: string) => {
        return CarePlanService.getTemplate(id)
    }, [])

    // Mutations
    const createTemplateMutation = useMutation({
        mutationFn: (data: Omit<CarePlanTemplate, 'id'>) =>
            CarePlanService.createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carePlanTemplates'] })
        }
    })

    const createTemplate = useCallback(async (data: Omit<CarePlanTemplate, 'id'>) => {
        return createTemplateMutation.mutateAsync(data)
    }, [createTemplateMutation])

    return {
        // Queries
        templates: templatesQuery.data ?? [],
        isLoading: templatesQuery.isLoading,
        isError: templatesQuery.isError,
        error: templatesQuery.error,

        // Actions
        getTemplate,
        createTemplate,

        // Mutation States
        isCreating: createTemplateMutation.isPending,
        createTemplateStatus: createTemplateMutation.status
    }
}



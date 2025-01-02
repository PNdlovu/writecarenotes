/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base category hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook for managing knowledge base categories with optimistic updates
 * and offline support.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryService } from '../services/categoryService'
import { type Category } from '../types'
import { useToast } from '@/components/ui/UseToast'
import { useKBSync } from './useKBSync'

const categoryService = new CategoryService()

export function useCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { trackChange } = useKBSync()

  // Fetch categories
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: () => categoryService.getCategories()
  })

  // Create category
  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: (newCategory) => {
      queryClient.setQueryData(
        ['kb-categories'],
        (old: Category[]) => [...old, newCategory]
      )
      toast({
        title: 'Category created',
        description: 'Your category has been created successfully.'
      })
      trackChange({
        type: 'create',
        entityType: 'category',
        entityId: newCategory.id,
        data: newCategory
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create category. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Update category
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryService.updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['kb-categories'] })
      
      const previousCategories = queryClient.getQueryData(['kb-categories'])
      
      queryClient.setQueryData(
        ['kb-categories'],
        (old: Category[]) => old.map(category =>
          category.id === id ? { ...category, ...data } : category
        )
      )

      return { previousCategories }
    },
    onSuccess: (updatedCategory) => {
      toast({
        title: 'Category updated',
        description: 'Your changes have been saved successfully.'
      })
      trackChange({
        type: 'update',
        entityType: 'category',
        entityId: updatedCategory.id,
        data: updatedCategory
      })
    },
    onError: (error, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['kb-categories'], context.previousCategories)
      }
      toast({
        title: 'Error',
        description: 'Failed to update category. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Delete category
  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: (_, categoryId) => {
      queryClient.setQueryData(
        ['kb-categories'],
        (old: Category[]) => old.filter(category => category.id !== categoryId)
      )
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.'
      })
      trackChange({
        type: 'delete',
        entityType: 'category',
        entityId: categoryId
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Move category
  const moveMutation = useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId?: string }) =>
      categoryService.moveCategory(id, newParentId),
    onSuccess: (movedCategory) => {
      queryClient.invalidateQueries({ queryKey: ['kb-categories'] })
      toast({
        title: 'Category moved',
        description: 'The category has been moved successfully.'
      })
      trackChange({
        type: 'update',
        entityType: 'category',
        entityId: movedCategory.id,
        data: movedCategory
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to move category. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Reorder categories
  const reorderMutation = useMutation({
    mutationFn: ({
      parentId,
      orderedIds
    }: {
      parentId: string | null
      orderedIds: string[]
    }) => categoryService.reorderCategories(parentId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-categories'] })
      toast({
        title: 'Categories reordered',
        description: 'The categories have been reordered successfully.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reorder categories. Please try again.',
        variant: 'destructive'
      })
    }
  })

  return {
    categories,
    isLoading,
    error,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    moveCategory: moveMutation.mutate,
    reorderCategories: reorderMutation.mutate
  }
}

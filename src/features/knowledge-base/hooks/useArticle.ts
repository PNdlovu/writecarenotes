/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base article hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook for managing knowledge base articles with offline support
 * and optimistic updates.
 */

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArticleService } from '../services/articleService'
import { type Article, type ArticleStatus } from '../types'
import { useToast } from '@/components/ui/UseToast'
import { useKBSync } from './useKBSync'

const articleService = new ArticleService()

export function useArticle(id?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { trackChange } = useKBSync()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch article
  const {
    data: article,
    isLoading,
    error
  } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleService.getArticle(id!),
    enabled: !!id
  })

  // Create article
  const createMutation = useMutation({
    mutationFn: articleService.createArticle,
    onSuccess: (newArticle) => {
      queryClient.setQueryData(['article', newArticle.id], newArticle)
      toast({
        title: 'Article created',
        description: 'Your article has been created successfully.'
      })
      trackChange({
        type: 'create',
        entityType: 'article',
        entityId: newArticle.id,
        data: newArticle
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create article. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Update article
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Article> }) =>
      articleService.updateArticle(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['article', id] })

      // Snapshot the previous value
      const previousArticle = queryClient.getQueryData(['article', id])

      // Optimistically update
      queryClient.setQueryData(['article', id], (old: Article) => ({
        ...old,
        ...data
      }))

      return { previousArticle }
    },
    onSuccess: (updatedArticle) => {
      toast({
        title: 'Article updated',
        description: 'Your changes have been saved successfully.'
      })
      trackChange({
        type: 'update',
        entityType: 'article',
        entityId: updatedArticle.id,
        data: updatedArticle
      })
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', variables.id], context.previousArticle)
      }
      toast({
        title: 'Error',
        description: 'Failed to update article. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Delete article
  const deleteMutation = useMutation({
    mutationFn: articleService.deleteArticle,
    onSuccess: (_, articleId) => {
      queryClient.removeQueries({ queryKey: ['article', articleId] })
      toast({
        title: 'Article deleted',
        description: 'The article has been deleted successfully.'
      })
      trackChange({
        type: 'delete',
        entityType: 'article',
        entityId: articleId
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete article. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Update article status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ArticleStatus }) =>
      articleService.updateStatus(id, status),
    onSuccess: (updatedArticle) => {
      queryClient.setQueryData(['article', updatedArticle.id], updatedArticle)
      toast({
        title: 'Status updated',
        description: `Article status changed to ${updatedArticle.status}.`
      })
      trackChange({
        type: 'update',
        entityType: 'article',
        entityId: updatedArticle.id,
        data: { status: updatedArticle.status }
      })
    }
  })

  // Track article view
  useEffect(() => {
    if (id && !isEditing) {
      articleService.trackView(id).catch(console.error)
    }
  }, [id, isEditing])

  // Helper functions
  const startEditing = useCallback(() => setIsEditing(true), [])
  const stopEditing = useCallback(() => setIsEditing(false), [])

  return {
    article,
    isLoading,
    error,
    isEditing,
    startEditing,
    stopEditing,
    createArticle: createMutation.mutate,
    updateArticle: updateMutation.mutate,
    deleteArticle: deleteMutation.mutate,
    updateStatus: updateStatusMutation.mutate
  }
}

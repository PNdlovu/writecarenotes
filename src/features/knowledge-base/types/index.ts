/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base type definitions
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the Knowledge Base module including articles,
 * categories, search, and sync functionality.
 */

import { type Region } from '@/types/regional'

export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived'
export type ArticleType = 'guide' | 'documentation' | 'tutorial' | 'faq'
export type ArticleAccess = 'public' | 'organization' | 'role-based'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  summary: string
  type: ArticleType
  status: ArticleStatus
  access: ArticleAccess
  categoryId: string
  tags: string[]
  regions: Region[]
  version: number
  metadata: ArticleMetadata
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  createdBy: string
  updatedBy: string
}

export interface ArticleMetadata {
  readTime: number
  viewCount: number
  likeCount: number
  relatedArticles: string[]
  prerequisites?: string[]
  targetAudience?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface ArticleVersion {
  id: string
  articleId: string
  version: number
  content: string
  title: string
  summary: string
  changeDescription: string
  createdAt: Date
  createdBy: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  parentId?: string
  order: number
  metadata: CategoryMetadata
  regions: Region[]
  createdAt: Date
  updatedAt: Date
}

export interface CategoryMetadata {
  articleCount: number
  subcategoryCount: number
  icon?: string
  color?: string
}

export interface SearchQuery {
  term: string
  filters: SearchFilters
  pagination: PaginationOptions
  sort: SortOptions
}

export interface SearchFilters {
  categories?: string[]
  tags?: string[]
  types?: ArticleType[]
  status?: ArticleStatus[]
  regions?: Region[]
  access?: ArticleAccess[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface SortOptions {
  field: 'relevance' | 'date' | 'views' | 'likes'
  order: 'asc' | 'desc'
}

export interface SearchResults {
  items: SearchResultItem[]
  total: number
  page: number
  limit: number
  filters: SearchFilters
}

export interface SearchResultItem {
  id: string
  title: string
  slug: string
  summary: string
  type: ArticleType
  category: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
  score: number
  highlights: {
    title?: string[]
    content?: string[]
    summary?: string[]
  }
  metadata: {
    readTime: number
    viewCount: number
    likeCount: number
  }
}

export interface SyncState {
  lastSync: Date
  status: 'idle' | 'syncing' | 'error'
  pendingChanges: number
  error?: string
}

export interface OfflineArticle extends Article {
  syncStatus: 'synced' | 'pending' | 'conflict'
  localUpdatedAt: Date
}

export interface ArticleConflict {
  articleId: string
  localVersion: Article
  remoteVersion: Article
  conflictType: 'content' | 'metadata' | 'both'
  resolvedBy?: string
  resolvedAt?: Date
}

/**
 * @writecarenotes.com
 * @fileoverview Knowledge base type definitions
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * TypeScript type definitions for the knowledge base module.
 */

// Article types
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ArticleMetadata {
  tags?: string[];
  readingTime?: number;
  wordCount?: number;
  customFields?: Record<string, any>;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  status: ArticleStatus;
  views: number;
  metadata?: ArticleMetadata;
  categoryId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category?: Category;
  author?: User;
  comments?: Comment[];
  reactions?: Reaction[];
  history?: ArticleHistory[];
  activities?: Activity[];
}

// Category types
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  parentId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  parent?: Category;
  children?: Category[];
  articles?: Article[];
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  articleId: string;
  authorId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  article?: Article;
  author?: User;
  parent?: Comment;
  replies?: Comment[];
}

// Reaction types
export type ReactionType = 'LIKE' | 'HELPFUL' | 'BOOKMARK';

export interface Reaction {
  id: string;
  type: ReactionType;
  articleId: string;
  userId: string;
  createdAt: Date;

  // Relations
  article?: Article;
  user?: User;
}

// History types
export interface ArticleHistory {
  id: string;
  articleId: string;
  editorId: string;
  title: string;
  content: string;
  categoryId: string;
  status: ArticleStatus;
  metadata?: ArticleMetadata;
  createdAt: Date;

  // Relations
  article?: Article;
  editor?: User;
}

// Activity types
export type ActivityType = 'VIEW' | 'EDIT' | 'COMMENT' | 'REACT' | 'EXPORT';

export interface Activity {
  id: string;
  type: ActivityType;
  articleId: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;

  // Relations
  article?: Article;
  user?: User;
}

// Search types
export interface SearchQuery {
  q: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: ArticleMetadata;
  createdAt: Date;
  updatedAt: Date;
  relevance: number;
}

// Export types
export type ExportFormat = 'PDF' | 'WORD' | 'MARKDOWN' | 'HTML';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeComments?: boolean;
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  error: string;
}

// Stats types
export interface ArticleStats {
  views: number;
  totalComments: number;
  totalReactions: number;
  revisionCount: number;
  reactions: {
    like: number;
    helpful: number;
    bookmark: number;
  };
  commentTrends: Array<{
    date: string;
    count: number;
  }>;
}

// Breadcrumb types
export interface Breadcrumb {
  id: string;
  name: string;
  slug: string;
}

// User reference type (to be imported from user types)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
} 
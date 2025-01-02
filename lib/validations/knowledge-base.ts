/**
 * @writecarenotes.com
 * @fileoverview Knowledge base validation schemas
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Zod validation schemas for knowledge base module.
 */

import { z } from 'zod';

// Enums
export const ArticleStatus = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'SCHEDULED'
]);

export const ArticleFormat = z.enum([
  'PDF',
  'WORD',
  'MARKDOWN',
  'HTML'
]);

export const ReactionType = z.enum([
  'LIKE',
  'HELPFUL',
  'BOOKMARK'
]);

// Base schemas
const MetadataSchema = z.object({
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  scheduledPublishDate: z.string().datetime().optional(),
  publishedAt: z.string().datetime().optional()
}).strict();

const DateRangeSchema = z.object({
  start: z.date().optional(),
  end: z.date().optional()
}).strict();

// Article schemas
export const CreateArticleSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Title contains invalid characters'),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content cannot exceed 50,000 characters'),
  excerpt: z.string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional(),
  categoryId: z.string().uuid(),
  status: ArticleStatus.optional(),
  metadata: MetadataSchema.optional()
}).strict();

export const UpdateArticleSchema = CreateArticleSchema.partial();

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  parentId: z.string().uuid().optional()
}).strict();

export const UpdateCategorySchema = CreateCategorySchema.partial();

// Comment schemas
export const CreateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  articleId: z.string().uuid(),
  parentId: z.string().uuid().optional()
}).strict();

export const UpdateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
}).strict();

// Reaction schema
export const ReactionSchema = z.object({
  type: ReactionType,
  articleId: z.string().uuid()
}).strict();

// Search schemas
export const SearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query too long'),
  category: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort: z.enum(['relevance', 'date', 'views']).default('relevance'),
  dateRange: DateRangeSchema.optional()
}).strict();

// Export schema
export const ExportSchema = z.object({
  articleId: z.string().uuid(),
  format: ArticleFormat,
  includeMetadata: z.boolean().default(true)
}).strict();

// Activity schema
export const ActivitySchema = z.object({
  type: z.enum([
    'VIEW',
    'SEARCH',
    'COMMENT',
    'REACT',
    'EXPORT'
  ]),
  articleId: z.string().uuid(),
  metadata: z.record(z.string(), z.any()).optional()
}).strict();

// Response schemas
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  pages: z.number().int().positive()
}).strict();

export const ErrorResponseSchema = z.object({
  error: z.union([
    z.string(),
    z.array(z.object({
      code: z.string(),
      message: z.string(),
      path: z.array(z.string())
    }))
  ])
}).strict();

// Utility types
export type ArticleStatus = z.infer<typeof ArticleStatus>;
export type ArticleFormat = z.infer<typeof ArticleFormat>;
export type ReactionType = z.infer<typeof ReactionType>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type UpdateComment = z.infer<typeof UpdateCommentSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
export type Search = z.infer<typeof SearchSchema>;
export type Export = z.infer<typeof ExportSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>; 
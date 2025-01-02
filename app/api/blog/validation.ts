/**
 * @writecarenotes.com
 * @fileoverview Blog validation schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Zod validation schemas for blog posts, comments, and related data.
 */

import { z } from 'zod';
import { PostStatus, CategoryType, Region, RegulatoryBody } from './types';

// Post validation schema
export const postSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long (max 200 characters)'),
  content: z.string()
    .min(1, 'Content is required'),
  excerpt: z.string()
    .max(500, 'Excerpt is too long (max 500 characters)')
    .optional(),
  featuredImage: z.string()
    .url('Featured image must be a valid URL')
    .optional(),
  status: z.nativeEnum(PostStatus),
  region: z.array(z.nativeEnum(Region))
    .min(1, 'At least one region is required'),
  regulatoryBodies: z.array(z.nativeEnum(RegulatoryBody))
    .optional(),
  categoryIds: z.array(z.string())
    .min(1, 'At least one category is required'),
  tags: z.array(z.string())
    .optional(),
  metadata: z.record(z.unknown())
    .optional(),
});

// Comment validation schema
export const commentSchema = z.object({
  postId: z.string()
    .min(1, 'Post ID is required'),
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment is too long (max 1000 characters)'),
  authorId: z.string()
    .min(1, 'Author ID is required'),
});

// Query parameters schema
export const querySchema = z.object({
  page: z.string()
    .optional()
    .transform(Number)
    .default('1'),
  limit: z.string()
    .optional()
    .transform(Number)
    .default('12'),
  search: z.string()
    .optional(),
  category: z.nativeEnum(CategoryType)
    .optional(),
  region: z.nativeEnum(Region)
    .optional(),
  regulatory: z.nativeEnum(RegulatoryBody)
    .optional(),
  status: z.nativeEnum(PostStatus)
    .optional(),
}); 
/**
 * @writecarenotes.com
 * @fileoverview Knowledge base utility functions
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utility functions for the knowledge base module including slug generation,
 * text processing, and data formatting.
 */

import slugify from 'slugify';
import { type Metadata } from '@/types';

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
}

/**
 * Generate an excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Truncate to maxLength
  if (text.length <= maxLength) return text;
  
  // Find the last complete word
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Extract metadata from content
 */
export function extractMetadata(content: string): Metadata {
  const metadata: Metadata = {
    tags: [],
    readingTime: 0,
    wordCount: 0,
    customFields: {}
  };

  // Remove HTML tags and get plain text
  const text = content.replace(/<[^>]*>/g, '');
  
  // Calculate word count
  const words = text.trim().split(/\s+/);
  metadata.wordCount = words.length;
  
  // Calculate reading time (assuming 200 words per minute)
  metadata.readingTime = Math.ceil(metadata.wordCount / 200);
  
  // Extract hashtags
  const hashtags = text.match(/#[\w-]+/g);
  if (hashtags) {
    metadata.tags = hashtags.map(tag => tag.substring(1));
  }

  return metadata;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(date);
  } else if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Build breadcrumb trail for category
 */
export async function buildCategoryBreadcrumbs(categoryId: string) {
  const breadcrumbs = [];
  let currentId = categoryId;

  while (currentId) {
    const category = await prisma.knowledgeBaseCategory.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true
      }
    });

    if (!category) break;

    breadcrumbs.unshift({
      id: category.id,
      name: category.name,
      slug: category.slug
    });

    currentId = category.parentId;
  }

  return breadcrumbs;
}

/**
 * Calculate article popularity score
 */
export function calculatePopularityScore(article: any): number {
  const now = new Date();
  const publishedDate = new Date(article.createdAt);
  const ageInDays = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

  // Weights for different factors
  const weights = {
    views: 1,
    likes: 2,
    helpful: 3,
    comments: 4,
    recency: 0.5
  };

  // Calculate base score
  let score = 0;
  score += (article.views || 0) * weights.views;
  score += (article._count?.reactions || 0) * weights.likes;
  score += (article._count?.comments || 0) * weights.comments;

  // Apply time decay
  const recencyBonus = Math.exp(-ageInDays / 30) * weights.recency;
  score *= (1 + recencyBonus);

  return score;
}

/**
 * Parse and validate search query
 */
export function parseSearchQuery(query: string): {
  terms: string[];
  tags: string[];
  category?: string;
} {
  const parts = query.toLowerCase().split(' ');
  const result = {
    terms: [],
    tags: [],
    category: undefined
  };

  parts.forEach(part => {
    if (part.startsWith('#')) {
      result.tags.push(part.substring(1));
    } else if (part.startsWith('category:')) {
      result.category = part.substring(9);
    } else if (part.trim()) {
      result.terms.push(part.trim());
    }
  });

  return result;
}

/**
 * Generate unique slug
 */
export async function generateUniqueSlug(
  title: string,
  model: 'article' | 'category'
): Promise<string> {
  let slug = generateSlug(title);
  let counter = 0;
  let isUnique = false;

  while (!isUnique) {
    const currentSlug = counter === 0 ? slug : `${slug}-${counter}`;
    
    const existing = model === 'article'
      ? await prisma.knowledgeBaseArticle.findUnique({
          where: { slug: currentSlug }
        })
      : await prisma.knowledgeBaseCategory.findUnique({
          where: { slug: currentSlug }
        });

    if (!existing) {
      isUnique = true;
      slug = currentSlug;
    } else {
      counter++;
    }
  }

  return slug;
} 

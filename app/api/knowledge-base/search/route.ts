/**
 * @writecarenotes.com
 * @fileoverview Knowledge base search API
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoint for searching knowledge base articles with advanced features.
 */

import { NextResponse } from 'next/server';
import { elasticsearch } from '@/lib/services/elasticsearch';
import { cache } from '@/lib/services/cache';
import { logger } from '@/lib/services/logger';
import { searchRateLimiter } from '@/lib/middleware/rate-limit';
import { SearchSchema } from '@/lib/validations/knowledge-base';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await searchRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Start performance tracking
    const startTime = performance.now();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const tags = searchParams.getAll('tags[]');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'relevance';

    const validatedParams = SearchSchema.parse({
      query,
      category,
      tags,
      page,
      limit,
      sort
    });

    // Try to get cached results
    const cacheKey = `search:${JSON.stringify(validatedParams)}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      logger.info('Search cache hit', {
        query,
        duration: performance.now() - startTime
      });
      
      return NextResponse.json(cached);
    }

    // Perform search
    const { results, total, suggestions } = await elasticsearch.searchArticles({
      query: validatedParams.query,
      filters: {
        category: validatedParams.category,
        tags: validatedParams.tags,
        status: 'PUBLISHED'
      },
      page: validatedParams.page,
      limit: validatedParams.limit,
      sort: validatedParams.sort
    });

    // Log search activity
    await prisma.knowledgeBaseActivity.create({
      data: {
        type: 'SEARCH',
        metadata: {
          query: validatedParams.query,
          filters: {
            category: validatedParams.category,
            tags: validatedParams.tags
          },
          resultsCount: results.length
        }
      }
    });

    const response = {
      results,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        pages: Math.ceil(total / validatedParams.limit)
      },
      suggestions,
      timing: {
        took: performance.now() - startTime
      }
    };

    // Cache results
    await cache.set(cacheKey, response, {
      ttl: 5 * 60, // 5 minutes
      invalidateOn: ['article:update', 'article:delete']
    });

    logger.info('Search completed', {
      query,
      resultsCount: results.length,
      duration: performance.now() - startTime
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    logger.error('Search failed', { error });
    
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await searchRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const startTime = performance.now();
    const json = await request.json();

    // Validate request body
    const validatedBody = SearchSchema.parse(json);

    // Try to get cached results
    const cacheKey = `search:${JSON.stringify(validatedBody)}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      logger.info('Search cache hit', {
        query: validatedBody.query,
        duration: performance.now() - startTime
      });
      
      return NextResponse.json(cached);
    }

    // Perform search with advanced options
    const { results, total, suggestions } = await elasticsearch.searchArticles({
      query: validatedBody.query,
      filters: {
        category: validatedBody.category,
        tags: validatedBody.tags,
        status: 'PUBLISHED',
        dateRange: validatedBody.dateRange
      },
      page: validatedBody.page,
      limit: validatedBody.limit,
      sort: validatedBody.sort
    });

    // Log search activity
    await prisma.knowledgeBaseActivity.create({
      data: {
        type: 'SEARCH',
        metadata: {
          query: validatedBody.query,
          filters: {
            category: validatedBody.category,
            tags: validatedBody.tags,
            dateRange: validatedBody.dateRange
          },
          resultsCount: results.length
        }
      }
    });

    const response = {
      results,
      pagination: {
        page: validatedBody.page,
        limit: validatedBody.limit,
        total,
        pages: Math.ceil(total / validatedBody.limit)
      },
      suggestions,
      timing: {
        took: performance.now() - startTime
      }
    };

    // Cache results
    await cache.set(cacheKey, response, {
      ttl: 5 * 60, // 5 minutes
      invalidateOn: ['article:update', 'article:delete']
    });

    logger.info('Advanced search completed', {
      query: validatedBody.query,
      resultsCount: results.length,
      duration: performance.now() - startTime
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    logger.error('Advanced search failed', { error });
    
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 

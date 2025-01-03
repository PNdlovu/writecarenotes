/**
 * @writecarenotes.com
 * @fileoverview Blog API route handler
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main API route handler for blog posts including listing, filtering,
 * and creating new posts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { querySchema, postSchema } from './validation';
import { Post } from './types';

/**
 * GET /api/blog
 * Get blog posts with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Build filter conditions
    const where: any = {
      status: query.status || 'PUBLISHED',
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.categories = {
        some: { type: query.category },
      };
    }

    if (query.region) {
      where.region = {
        has: query.region,
      };
    }

    if (query.regulatory) {
      where.regulatoryBodies = {
        has: query.regulatory,
      };
    }

    // Get total count for pagination
    const total = await prisma.post.count({ where });

    // Get paginated posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog
 * Create a new blog post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check authorization
    if (!['ADMIN', 'AUTHOR', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = postSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        categories: {
          connect: validatedData.categoryIds.map(id => ({ id })),
        },
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid post data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 

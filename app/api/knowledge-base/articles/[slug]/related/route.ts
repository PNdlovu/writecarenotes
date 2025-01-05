/**
 * @writecarenotes.com
 * @fileoverview Related articles API route
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API route for fetching related articles based on category and tags.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Props {
  params: { slug: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        categoryId: true,
        metadata: true
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Get articles in the same category with similar tags
    const relatedArticles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        id: { not: article.id },
        categoryId: article.categoryId,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: limit
    });

    // Sort by relevance (number of matching tags)
    const articleTags = article.metadata?.tags || [];
    const sortedArticles = relatedArticles.sort((a, b) => {
      const aTags = a.metadata?.tags || [];
      const bTags = b.metadata?.tags || [];
      const aMatches = aTags.filter(tag => articleTags.includes(tag)).length;
      const bMatches = bTags.filter(tag => articleTags.includes(tag)).length;
      return bMatches - aMatches;
    });

    return NextResponse.json(sortedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related articles' },
      { status: 500 }
    );
  }
} 
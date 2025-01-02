/**
 * @writecarenotes.com
 * @fileoverview Article statistics API route
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API route for fetching article statistics including views, reactions,
 * comments, and other engagement metrics.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Props {
  params: { slug: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        views: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
            history: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Get reaction counts by type
    const reactionsByType = await prisma.knowledgeBaseReaction.groupBy({
      by: ['type'],
      where: { articleId: article.id },
      _count: true
    });

    // Get comment trends
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentComments = await prisma.knowledgeBaseComment.groupBy({
      by: ['createdAt'],
      where: {
        articleId: article.id,
        createdAt: {
          gte: lastWeek
        }
      },
      _count: true
    });

    // Format reaction counts
    const reactions = reactionsByType.reduce((acc, curr) => ({
      ...acc,
      [curr.type.toLowerCase()]: curr._count
    }), {
      like: 0,
      helpful: 0,
      bookmark: 0
    });

    // Format comment trends
    const commentTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = recentComments.find(c => 
        c.createdAt.toISOString().split('T')[0] === dateStr
      )?._count || 0;
      return { date: dateStr, count };
    }).reverse();

    return NextResponse.json({
      views: article.views,
      totalComments: article._count.comments,
      totalReactions: article._count.reactions,
      revisionCount: article._count.history,
      reactions,
      commentTrends
    });
  } catch (error) {
    console.error('Error fetching article stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Props) {
  try {
    // Increment view count
    const article = await prisma.knowledgeBaseArticle.update({
      where: { slug: params.slug },
      data: {
        views: {
          increment: 1
        }
      },
      select: {
        views: true
      }
    });

    return NextResponse.json({ views: article.views });
  } catch (error) {
    console.error('Error updating article views:', error);
    return NextResponse.json(
      { error: 'Failed to update article views' },
      { status: 500 }
    );
  }
} 
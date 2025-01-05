/**
 * @writecarenotes.com
 * @fileoverview Article history API routes
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for managing article version history and revisions.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface Props {
  params: { slug: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const [history, total] = await Promise.all([
      prisma.knowledgeBaseArticleHistory.findMany({
        where: { articleId: article.id },
        include: {
          editor: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.knowledgeBaseArticleHistory.count({
        where: { articleId: article.id }
      })
    ]);

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching article history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        content: true,
        categoryId: true,
        status: true,
        metadata: true
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Create history entry
    const history = await prisma.knowledgeBaseArticleHistory.create({
      data: {
        articleId: article.id,
        editorId: session.user.id,
        title: article.title,
        content: article.content,
        categoryId: article.categoryId,
        status: article.status,
        metadata: article.metadata
      },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error creating article history:', error);
    return NextResponse.json(
      { error: 'Failed to create article history' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get('historyId');

    if (!historyId) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      );
    }

    const history = await prisma.knowledgeBaseArticleHistory.findUnique({
      where: { id: historyId },
      include: { article: true }
    });

    if (!history) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    // Restore article to this version
    const updatedArticle = await prisma.knowledgeBaseArticle.update({
      where: { id: history.articleId },
      data: {
        title: history.title,
        content: history.content,
        categoryId: history.categoryId,
        status: history.status,
        metadata: history.metadata,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error restoring article version:', error);
    return NextResponse.json(
      { error: 'Failed to restore article version' },
      { status: 500 }
    );
  }
} 
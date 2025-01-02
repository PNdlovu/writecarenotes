/**
 * @writecarenotes.com
 * @fileoverview Admin API for knowledge base articles
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Admin API endpoints for managing knowledge base articles.
 */

import { NextResponse } from 'next/server';
import { adminKnowledgeBase } from '@/lib/services/admin/knowledge-base';
import { CreateArticleSchema, UpdateArticleSchema } from '@/lib/validations/knowledge-base';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'updatedAt';
    const order = searchParams.get('order') || 'desc';

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        ...(status && { status }),
        ...(category && { categoryId: category })
      },
      include: {
        category: true,
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
            reactions: true,
            history: true
          }
        }
      },
      orderBy: {
        [sort]: order
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.knowledgeBaseArticle.count({
      where: {
        ...(status && { status }),
        ...(category && { categoryId: category })
      }
    });

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const data = CreateArticleSchema.parse(json);

    const article = await adminKnowledgeBase.createArticle({
      ...data,
      authorId: session.user.id
    });

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { ids, data } = json;

    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json(
        { error: 'Article IDs are required' },
        { status: 400 }
      );
    }

    const updateData = UpdateArticleSchema.partial().parse(data);
    const count = await adminKnowledgeBase.bulkUpdateArticles(ids, updateData);

    return NextResponse.json({ count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating articles:', error);
    return NextResponse.json(
      { error: 'Failed to update articles' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll('ids[]');

    if (!ids.length) {
      return NextResponse.json(
        { error: 'Article IDs are required' },
        { status: 400 }
      );
    }

    // Delete articles
    await prisma.knowledgeBaseArticle.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    // Remove from Elasticsearch
    await Promise.all(
      ids.map(id => elasticsearch.removeArticle(id))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting articles:', error);
    return NextResponse.json(
      { error: 'Failed to delete articles' },
      { status: 500 }
    );
  }
} 
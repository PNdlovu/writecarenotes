/**
 * @writecarenotes.com
 * @fileoverview Article reactions API routes
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for managing article reactions (likes, helpful, etc.).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Validation schema for reactions
const reactionSchema = z.object({
  type: z.enum(['LIKE', 'HELPFUL', 'BOOKMARK'])
});

interface Props {
  params: { slug: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
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

    const reactions = await prisma.knowledgeBaseReaction.groupBy({
      by: ['type'],
      where: { articleId: article.id },
      _count: true
    });

    // Get user's reactions if authenticated
    const session = await auth();
    let userReactions = null;
    
    if (session?.user) {
      userReactions = await prisma.knowledgeBaseReaction.findMany({
        where: {
          articleId: article.id,
          userId: session.user.id
        },
        select: { type: true }
      });
    }

    return NextResponse.json({
      reactions: reactions.reduce((acc, curr) => ({
        ...acc,
        [curr.type]: curr._count
      }), {}),
      userReactions: userReactions?.map(r => r.type) || []
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
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
      select: { id: true }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const json = await request.json();
    const { type } = reactionSchema.parse(json);

    // Check if reaction already exists
    const existingReaction = await prisma.knowledgeBaseReaction.findFirst({
      where: {
        articleId: article.id,
        userId: session.user.id,
        type
      }
    });

    if (existingReaction) {
      // Remove reaction if it exists
      await prisma.knowledgeBaseReaction.delete({
        where: { id: existingReaction.id }
      });
      return NextResponse.json({ removed: true });
    }

    // Create new reaction
    await prisma.knowledgeBaseReaction.create({
      data: {
        type,
        articleId: article.id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ added: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Error managing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to manage reaction' },
      { status: 500 }
    );
  }
} 
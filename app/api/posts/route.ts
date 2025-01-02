import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryType, Region, RegulatoryBody } from '@/features/blog/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const search = searchParams.get('search');
    const category = searchParams.get('category') as CategoryType;
    const region = searchParams.get('region') as Region;
    const regulatory = searchParams.get('regulatory') as RegulatoryBody;

    // Build filter conditions
    const where: any = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.categories = {
        some: { type: category },
      };
    }

    if (region && region !== 'all') {
      where.regions = {
        has: region,
      };
    }

    if (regulatory && regulatory !== 'all') {
      where.regulatoryBodies = {
        has: regulatory,
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
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 
/**
 * @writecarenotes.com
 * @fileoverview Admin API for knowledge base analytics
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Admin API endpoints for knowledge base analytics and reporting.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const period = searchParams.get('period') || 'week';
    const categoryId = searchParams.get('category');

    // Get date range
    const now = new Date();
    const startDate = new Date(now);
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get overall stats
    const [
      totalArticles,
      totalViews,
      totalComments,
      totalReactions
    ] = await Promise.all([
      prisma.knowledgeBaseArticle.count({
        where: {
          ...(categoryId && { categoryId })
        }
      }),
      prisma.knowledgeBaseArticle.aggregate({
        where: {
          ...(categoryId && { categoryId })
        },
        _sum: {
          views: true
        }
      }),
      prisma.knowledgeBaseComment.count({
        where: {
          article: {
            ...(categoryId && { categoryId })
          }
        }
      }),
      prisma.knowledgeBaseReaction.count({
        where: {
          article: {
            ...(categoryId && { categoryId })
          }
        }
      })
    ]);

    // Get activity trends
    const activities = await prisma.knowledgeBaseActivity.groupBy({
      by: ['type', 'createdAt'],
      where: {
        createdAt: {
          gte: startDate
        },
        article: {
          ...(categoryId && { categoryId })
        }
      },
      _count: true
    });

    // Get popular articles
    const popularArticles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        ...(categoryId && { categoryId })
      },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 10
    });

    // Get category distribution
    const categoryDistribution = await prisma.knowledgeBaseArticle.groupBy({
      by: ['categoryId'],
      where: {
        ...(categoryId && { categoryId })
      },
      _count: true
    });

    // Get search analytics
    const searchAnalytics = await prisma.knowledgeBaseActivity.groupBy({
      by: ['metadata'],
      where: {
        type: 'SEARCH',
        createdAt: {
          gte: startDate
        }
      },
      _count: true,
      having: {
        _count: {
          gt: 5
        }
      },
      orderBy: {
        _count: 'desc'
      },
      take: 10
    });

    // Process activity trends
    const trends = activities.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          views: 0,
          reactions: 0,
          comments: 0,
          searches: 0
        };
      }
      
      switch (curr.type) {
        case 'VIEW':
          acc[date].views += curr._count;
          break;
        case 'REACT':
          acc[date].reactions += curr._count;
          break;
        case 'COMMENT':
          acc[date].comments += curr._count;
          break;
        case 'SEARCH':
          acc[date].searches += curr._count;
          break;
      }
      
      return acc;
    }, {} as Record<string, {
      views: number;
      reactions: number;
      comments: number;
      searches: number;
    }>);

    return NextResponse.json({
      overview: {
        totalArticles,
        totalViews: totalViews._sum.views || 0,
        totalComments,
        totalReactions,
        averageViewsPerArticle: totalArticles 
          ? (totalViews._sum.views || 0) / totalArticles 
          : 0
      },
      trends: Object.entries(trends).map(([date, stats]) => ({
        date,
        ...stats
      })),
      popularArticles,
      categoryDistribution: await Promise.all(
        categoryDistribution.map(async cat => {
          const category = await prisma.knowledgeBaseCategory.findUnique({
            where: { id: cat.categoryId },
            select: { name: true }
          });
          return {
            category: category?.name || 'Unknown',
            count: cat._count
          };
        })
      ),
      searchAnalytics: searchAnalytics.map(item => ({
        query: item.metadata.query,
        count: item._count
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
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
    const { type, dateRange, format = 'json' } = json;

    // Generate custom report
    const data = await generateReport(type, dateRange);

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${type}-${new Date().toISOString()}.csv"`
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateReport(type: string, dateRange: { start: Date; end: Date }) {
  // Implementation depends on report type
  switch (type) {
    case 'article-performance':
      return prisma.knowledgeBaseArticle.findMany({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end
          }
        },
        select: {
          title: true,
          views: true,
          _count: {
            select: {
              comments: true,
              reactions: true
            }
          },
          createdAt: true,
          updatedAt: true
        }
      });

    case 'user-engagement':
      return prisma.knowledgeBaseActivity.groupBy({
        by: ['userId', 'type'],
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end
          }
        },
        _count: true
      });

    // Add more report types as needed
    default:
      throw new Error('Invalid report type');
  }
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => JSON.stringify(item[header])).join(',')
  );

  return [
    headers.join(','),
    ...rows
  ].join('\n');
} 

/**
 * @writecarenotes.com
 * @fileoverview Admin service for knowledge base management
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Admin service for managing knowledge base articles, including publishing,
 * scheduling, and analytics.
 */

import { prisma } from '@/lib/prisma';
import { elasticsearch } from '@/lib/services/elasticsearch';
import { generateUniqueSlug, extractMetadata } from '@/lib/utils/knowledge-base';
import { Article, ArticleStatus } from '@/types/knowledge-base';
import { Prisma } from '@prisma/client';

export const adminKnowledgeBase = {
  /**
   * Create a new article with advanced options
   */
  async createArticle(data: {
    title: string;
    content: string;
    excerpt?: string;
    categoryId: string;
    status?: ArticleStatus;
    metadata?: Record<string, any>;
    scheduledPublishDate?: Date;
  }): Promise<Article> {
    const slug = await generateUniqueSlug(data.title, 'article');
    const extractedMetadata = extractMetadata(data.content);

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || extractedMetadata.excerpt,
        categoryId: data.categoryId,
        status: data.status || 'DRAFT',
        metadata: {
          ...extractedMetadata,
          ...data.metadata,
          scheduledPublishDate: data.scheduledPublishDate?.toISOString()
        }
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Index in Elasticsearch if published
    if (article.status === 'PUBLISHED') {
      await elasticsearch.indexArticle(article);
    }

    return article;
  },

  /**
   * Update article with version control
   */
  async updateArticle(
    slug: string,
    data: Partial<Article>,
    createVersion = true
  ): Promise<Article> {
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug },
      include: {
        category: true
      }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Create version if needed
    if (createVersion) {
      await prisma.knowledgeBaseArticleHistory.create({
        data: {
          articleId: article.id,
          title: article.title,
          content: article.content,
          categoryId: article.categoryId,
          status: article.status,
          metadata: article.metadata
        }
      });
    }

    // Update article
    const updatedArticle = await prisma.knowledgeBaseArticle.update({
      where: { slug },
      data: {
        ...data,
        metadata: {
          ...article.metadata,
          ...data.metadata
        }
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Update Elasticsearch index
    if (updatedArticle.status === 'PUBLISHED') {
      await elasticsearch.indexArticle(updatedArticle);
    } else {
      await elasticsearch.removeArticle(updatedArticle.id);
    }

    return updatedArticle;
  },

  /**
   * Bulk operations on articles
   */
  async bulkUpdateArticles(
    articleIds: string[],
    data: Partial<Article>
  ): Promise<number> {
    const result = await prisma.knowledgeBaseArticle.updateMany({
      where: {
        id: { in: articleIds }
      },
      data
    });

    // Reindex affected articles
    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        id: { in: articleIds },
        status: 'PUBLISHED'
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    await Promise.all(
      articles.map(article => elasticsearch.indexArticle(article))
    );

    return result.count;
  },

  /**
   * Get article analytics
   */
  async getArticleAnalytics(slug: string, period: 'day' | 'week' | 'month' = 'week') {
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug },
      include: {
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
      throw new Error('Article not found');
    }

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
    }

    // Get activity trends
    const activities = await prisma.knowledgeBaseActivity.groupBy({
      by: ['type', 'createdAt'],
      where: {
        articleId: article.id,
        createdAt: {
          gte: startDate
        }
      },
      _count: true
    });

    // Process trends
    const trends = activities.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          views: 0,
          reactions: 0,
          comments: 0
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
      }
      
      return acc;
    }, {} as Record<string, { views: number; reactions: number; comments: number; }>);

    return {
      totalViews: article.views,
      totalComments: article._count.comments,
      totalReactions: article._count.reactions,
      revisionCount: article._count.history,
      trends
    };
  },

  /**
   * Schedule article publishing
   */
  async scheduleArticle(slug: string, publishDate: Date): Promise<Article> {
    const article = await prisma.knowledgeBaseArticle.update({
      where: { slug },
      data: {
        metadata: {
          scheduledPublishDate: publishDate.toISOString()
        }
      }
    });

    // Add to publishing queue
    // Implementation depends on your task queue system (e.g., Bull)

    return article;
  },

  /**
   * Get scheduled articles
   */
  async getScheduledArticles(): Promise<Article[]> {
    return prisma.knowledgeBaseArticle.findMany({
      where: {
        status: 'DRAFT',
        metadata: {
          path: ['scheduledPublishDate'],
          not: null
        }
      },
      orderBy: {
        metadata: {
          path: ['scheduledPublishDate']
        }
      }
    });
  },

  /**
   * Publish scheduled articles
   */
  async publishScheduledArticles(): Promise<number> {
    const now = new Date();
    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        status: 'DRAFT',
        metadata: {
          path: ['scheduledPublishDate'],
          lte: now.toISOString()
        }
      }
    });

    if (!articles.length) return 0;

    await this.bulkUpdateArticles(
      articles.map(a => a.id),
      {
        status: 'PUBLISHED',
        metadata: {
          publishedAt: now.toISOString()
        }
      }
    );

    return articles.length;
  }
}; 
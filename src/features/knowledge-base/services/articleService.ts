/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base article service
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing knowledge base articles including CRUD operations,
 * version control, and offline support.
 */

import { type Article, type ArticleVersion, type ArticleStatus } from '../types'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/utils/slug'
import { getRegion } from '@/hooks/use-region'

export class ArticleService {
  /**
   * Create a new article
   */
  async createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Article> {
    const slug = createSlug(data.title)
    
    return await prisma.article.create({
      data: {
        ...data,
        slug,
        version: 1,
        metadata: {
          readTime: this.calculateReadTime(data.content),
          viewCount: 0,
          likeCount: 0,
          relatedArticles: []
        }
      }
    })
  }

  /**
   * Update an existing article
   */
  async updateArticle(
    id: string,
    data: Partial<Article>,
    createVersion = true
  ): Promise<Article> {
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) throw new Error('Article not found')

    // Create a new version if requested
    if (createVersion) {
      await this.createVersion(article)
    }

    // Update the article
    return await prisma.article.update({
      where: { id },
      data: {
        ...data,
        version: createVersion ? article.version + 1 : article.version,
        slug: data.title ? createSlug(data.title) : article.slug,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Get article by ID
   */
  async getArticle(id: string): Promise<Article | null> {
    return await prisma.article.findUnique({
      where: { id },
      include: {
        category: true
      }
    })
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    return await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true
      }
    })
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<void> {
    await prisma.article.delete({ where: { id } })
  }

  /**
   * Update article status
   */
  async updateStatus(id: string, status: ArticleStatus): Promise<Article> {
    return await prisma.article.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'published' ? new Date() : undefined
      }
    })
  }

  /**
   * Get article version history
   */
  async getVersions(articleId: string): Promise<ArticleVersion[]> {
    return await prisma.articleVersion.findMany({
      where: { articleId },
      orderBy: { version: 'desc' }
    })
  }

  /**
   * Get specific version of an article
   */
  async getVersion(articleId: string, version: number): Promise<ArticleVersion | null> {
    return await prisma.articleVersion.findUnique({
      where: {
        articleId_version: {
          articleId,
          version
        }
      }
    })
  }

  /**
   * Restore article to a specific version
   */
  async restoreVersion(articleId: string, version: number): Promise<Article> {
    const targetVersion = await this.getVersion(articleId, version)
    if (!targetVersion) throw new Error('Version not found')

    return await this.updateArticle(articleId, {
      title: targetVersion.title,
      content: targetVersion.content,
      summary: targetVersion.summary
    })
  }

  /**
   * Track article view
   */
  async trackView(id: string): Promise<void> {
    await prisma.article.update({
      where: { id },
      data: {
        metadata: {
          update: {
            viewCount: {
              increment: 1
            }
          }
        }
      }
    })
  }

  /**
   * Toggle article like
   */
  async toggleLike(id: string, userId: string): Promise<boolean> {
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) throw new Error('Article not found')

    const hasLiked = await prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId: id,
          userId
        }
      }
    })

    if (hasLiked) {
      await prisma.articleLike.delete({
        where: {
          articleId_userId: {
            articleId: id,
            userId
          }
        }
      })
      return false
    } else {
      await prisma.articleLike.create({
        data: {
          articleId: id,
          userId
        }
      })
      return true
    }
  }

  /**
   * Get related articles
   */
  async getRelatedArticles(id: string): Promise<Article[]> {
    const article = await this.getArticle(id)
    if (!article) throw new Error('Article not found')

    return await prisma.article.findMany({
      where: {
        OR: [
          { categoryId: article.categoryId },
          { tags: { hasSome: article.tags } }
        ],
        NOT: { id: article.id },
        status: 'published'
      },
      take: 5,
      orderBy: {
        metadata: {
          viewCount: 'desc'
        }
      }
    })
  }

  private async createVersion(article: Article): Promise<ArticleVersion> {
    return await prisma.articleVersion.create({
      data: {
        articleId: article.id,
        version: article.version,
        title: article.title,
        content: article.content,
        summary: article.summary,
        changeDescription: 'Article updated'
      }
    })
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }
}

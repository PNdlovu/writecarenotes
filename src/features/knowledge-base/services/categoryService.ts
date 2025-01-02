/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base category service
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing knowledge base categories including CRUD operations
 * and tree structure management.
 */

import { prisma } from '@/lib/prisma'
import { type Category } from '../types'
import { createSlug } from '@/utils/slug'

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: {
    name: string
    description?: string
    parentId?: string
  }): Promise<Category> {
    const slug = createSlug(data.name)
    
    // Get max order in the same level
    const maxOrder = await prisma.category.aggregate({
      where: { parentId: data.parentId },
      _max: { order: true }
    })

    return await prisma.category.create({
      data: {
        ...data,
        slug,
        order: (maxOrder._max.order || 0) + 1,
        metadata: {
          articleCount: 0,
          subcategoryCount: 0
        }
      }
    })
  }

  /**
   * Update a category
   */
  async updateCategory(
    id: string,
    data: Partial<Category>
  ): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug: data.name ? createSlug(data.name) : undefined,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    // Get all descendant categories
    const descendants = await this.getDescendants(id)
    const descendantIds = descendants.map(d => d.id)

    // Move articles to parent category or uncategorized
    const category = await prisma.category.findUnique({
      where: { id },
      include: { parent: true }
    })

    await prisma.$transaction([
      // Update articles
      prisma.article.updateMany({
        where: { categoryId: { in: [id, ...descendantIds] } },
        data: { categoryId: category?.parentId || 'uncategorized' }
      }),
      // Delete descendants
      prisma.category.deleteMany({
        where: { id: { in: descendantIds } }
      }),
      // Delete the category
      prisma.category.delete({
        where: { id }
      })
    ])
  }

  /**
   * Move a category to a new parent
   */
  async moveCategory(
    id: string,
    newParentId?: string
  ): Promise<Category> {
    // Prevent circular references
    if (newParentId) {
      const descendants = await this.getDescendants(id)
      if (descendants.some(d => d.id === newParentId)) {
        throw new Error('Cannot move category to its descendant')
      }
    }

    // Get max order in new parent
    const maxOrder = await prisma.category.aggregate({
      where: { parentId: newParentId },
      _max: { order: true }
    })

    return await prisma.category.update({
      where: { id },
      data: {
        parentId: newParentId,
        order: (maxOrder._max.order || 0) + 1
      }
    })
  }

  /**
   * Reorder categories
   */
  async reorderCategories(
    parentId: string | null,
    orderedIds: string[]
  ): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { order: index + 1 }
        })
      )
    )
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' }
      ]
    })
  }

  /**
   * Get category by ID
   */
  async getCategory(id: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { id }
    })
  }

  /**
   * Update category metadata
   */
  async updateMetadata(id: string): Promise<void> {
    const [articleCount, subcategories] = await Promise.all([
      prisma.article.count({
        where: { categoryId: id }
      }),
      prisma.category.findMany({
        where: { parentId: id }
      })
    ])

    await prisma.category.update({
      where: { id },
      data: {
        metadata: {
          articleCount,
          subcategoryCount: subcategories.length
        }
      }
    })
  }

  /**
   * Get all descendant categories
   */
  private async getDescendants(
    categoryId: string,
    descendants: Category[] = []
  ): Promise<Category[]> {
    const children = await prisma.category.findMany({
      where: { parentId: categoryId }
    })

    for (const child of children) {
      descendants.push(child)
      await this.getDescendants(child.id, descendants)
    }

    return descendants
  }
}

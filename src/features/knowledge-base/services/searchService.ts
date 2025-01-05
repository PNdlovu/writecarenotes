/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base search service
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for handling knowledge base search functionality including
 * full-text search, filters, and suggestions.
 */

import { elasticSearch, KB_INDEX } from '@/lib/elasticsearch'
import { 
  type SearchQuery, 
  type SearchResults, 
  type SearchFilters,
  type PaginationOptions,
  type SortOptions 
} from '../types'

export class SearchService {
  /**
   * Perform a search query
   */
  async search(query: SearchQuery): Promise<SearchResults> {
    const { term, filters, pagination, sort } = query
    const { page = 1, limit = 20 } = pagination || {}

    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: term,
                fields: ['title^3', 'content^1', 'summary^2'],
                type: 'best_fields',
                fuzziness: 'AUTO'
              }
            }
          ],
          filter: [
            { term: { status: 'PUBLISHED' } }
          ]
        }
      },
      highlight: {
        fields: {
          title: { number_of_fragments: 0 },
          content: { number_of_fragments: 3, fragment_size: 150 },
          summary: { number_of_fragments: 1 }
        }
      },
      _source: [
        'id',
        'title',
        'slug',
        'summary',
        'categoryId',
        'tags',
        'metadata',
        'createdAt',
        'updatedAt'
      ],
      from: (page - 1) * limit,
      size: limit,
      sort: [
        sort.field === 'relevance' 
          ? { _score: sort.order }
          : { [sort.field]: sort.order }
      ]
    }

    // Add filters
    if (filters.category) {
      searchBody.query.bool.filter.push({
        term: { 'category.id': filters.category }
      })
    }

    if (filters.tags?.length) {
      searchBody.query.bool.filter.push({
        terms: { tags: filters.tags }
      })
    }

    const result = await elasticSearch.search({
      index: KB_INDEX,
      body: searchBody
    })

    return {
      items: result.hits.hits.map(hit => ({
        ...hit._source,
        score: hit._score,
        highlights: hit.highlight
      })),
      total: result.hits.total.value,
      page,
      limit
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(term: string): Promise<string[]> {
    if (!term) return []

    const result = await elasticSearch.search({
      index: KB_INDEX,
      body: {
        suggest: {
          title_suggest: {
            prefix: term,
            completion: {
              field: 'title_suggest',
              size: 5,
              skip_duplicates: true
            }
          }
        },
        _source: false
      }
    })

    return result.suggest.title_suggest[0].options.map(
      option => option.text
    )
  }

  /**
   * Reindex all articles
   */
  async reindexAll(): Promise<void> {
    // Delete existing index
    await elasticSearch.indices.delete({
      index: KB_INDEX,
      ignore_unavailable: true
    })

    // Create new index with mapping
    await elasticSearch.indices.create({
      index: KB_INDEX,
      body: {
        mappings: this.getIndexMapping()
      }
    })

    // Fetch all articles
    const articles = await prisma.article.findMany({
      include: {
        category: true
      }
    })

    // Index articles in batches
    const batchSize = 100
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize)
      const body = batch.flatMap(article => [
        { index: { _index: KB_INDEX, _id: article.id } },
        this.transformArticleForIndexing(article)
      ])

      await elasticSearch.bulk({ body })
    }
  }

  /**
   * Index a single article
   */
  async indexArticle(articleId: string): Promise<void> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        category: true
      }
    })

    if (!article) throw new Error('Article not found')

    await elasticSearch.index({
      index: KB_INDEX,
      id: article.id,
      body: this.transformArticleForIndexing(article)
    })
  }

  private getIndexMapping() {
    return {
      properties: {
        title: {
          type: 'text',
          analyzer: 'english',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        title_suggest: {
          type: 'completion'
        },
        content: {
          type: 'text',
          analyzer: 'english'
        },
        summary: {
          type: 'text',
          analyzer: 'english'
        },
        slug: { type: 'keyword' },
        type: { type: 'keyword' },
        status: { type: 'keyword' },
        access: { type: 'keyword' },
        tags: { type: 'keyword' },
        regions: { type: 'keyword' },
        category: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            slug: { type: 'keyword' }
          }
        },
        metadata: {
          properties: {
            readTime: { type: 'integer' },
            viewCount: { type: 'integer' },
            likeCount: { type: 'integer' }
          }
        },
        updatedAt: { type: 'date' }
      }
    }
  }

  private transformArticleForIndexing(article: any) {
    return {
      title: article.title,
      title_suggest: article.title,
      content: article.content,
      summary: article.summary,
      slug: article.slug,
      type: article.type,
      status: article.status,
      access: article.access,
      tags: article.tags,
      regions: article.regions,
      category: {
        id: article.category.id,
        name: article.category.name,
        slug: article.category.slug
      },
      metadata: article.metadata,
      updatedAt: article.updatedAt
    }
  }
}

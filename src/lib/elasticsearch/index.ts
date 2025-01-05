/**
 * @writecarenotes.com
 * @fileoverview Elasticsearch configuration and client
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Elasticsearch client configuration and index mappings.
 */

import { Client } from '@elastic/elasticsearch'

// Initialize Elasticsearch client
export const elasticSearch = new Client({
  node: 'http://localhost:9200'
})

// Knowledge base index name
export const KB_INDEX = 'knowledge_base'

// Knowledge base index mapping
export const KB_MAPPING = {
  mappings: {
    properties: {
      title: {
        type: 'text',
        analyzer: 'english',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          }
        }
      },
      title_suggest: {
        type: 'completion',
        analyzer: 'simple',
        preserve_separators: true,
        preserve_position_increments: true,
        max_input_length: 50
      },
      slug: {
        type: 'keyword'
      },
      summary: {
        type: 'text',
        analyzer: 'english'
      },
      content: {
        type: 'text',
        analyzer: 'english'
      },
      type: {
        type: 'keyword'
      },
      access: {
        type: 'keyword'
      },
      status: {
        type: 'keyword'
      },
      categoryId: {
        type: 'keyword'
      },
      category: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text' },
          slug: { type: 'keyword' }
        }
      },
      tags: {
        type: 'keyword'
      },
      author: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text' },
          avatar: { type: 'keyword' }
        }
      },
      metadata: {
        properties: {
          readTime: { type: 'integer' },
          wordCount: { type: 'integer' }
        }
      },
      views: {
        type: 'integer'
      },
      likes: {
        type: 'integer'
      },
      createdAt: {
        type: 'date'
      },
      updatedAt: {
        type: 'date'
      }
    }
  },
  settings: {
    analysis: {
      analyzer: {
        english: {
          tokenizer: 'standard',
          filter: [
            'english_possessive_stemmer',
            'lowercase',
            'english_stop',
            'english_stemmer'
          ]
        }
      },
      filter: {
        english_stop: {
          type: 'stop',
          stopwords: '_english_'
        },
        english_stemmer: {
          type: 'stemmer',
          language: 'english'
        },
        english_possessive_stemmer: {
          type: 'stemmer',
          language: 'possessive_english'
        }
      }
    }
  }
}

/**
 * Initialize Elasticsearch index
 */
export async function initializeIndex() {
  try {
    const indexExists = await elasticSearch.indices.exists({
      index: KB_INDEX
    })

    if (!indexExists) {
      await elasticSearch.indices.create({
        index: KB_INDEX,
        body: KB_MAPPING
      })
    }
  } catch (error) {
    console.error('Failed to initialize Elasticsearch index:', error)
    throw error
  }
}

/**
 * Index an article
 */
export async function indexArticle(article: any) {
  try {
    await elasticSearch.index({
      index: KB_INDEX,
      id: article.id,
      body: {
        ...article,
        title_suggest: {
          input: [
            article.title,
            ...article.title.split(' '),
            ...article.tags
          ]
        }
      }
    })
  } catch (error) {
    console.error('Failed to index article:', error)
    throw error
  }
}

/**
 * Remove an article from the index
 */
export async function removeArticle(articleId: string) {
  try {
    await elasticSearch.delete({
      index: KB_INDEX,
      id: articleId
    })
  } catch (error) {
    console.error('Failed to remove article from index:', error)
    throw error
  }
}

/**
 * Reindex all articles
 */
export async function reindexAll(articles: any[]) {
  try {
    const operations = articles.flatMap(article => [
      { index: { _index: KB_INDEX, _id: article.id } },
      {
        ...article,
        title_suggest: {
          input: [
            article.title,
            ...article.title.split(' '),
            ...article.tags
          ]
        }
      }
    ])

    await elasticSearch.bulk({
      refresh: true,
      body: operations
    })
  } catch (error) {
    console.error('Failed to reindex articles:', error)
    throw error
  }
}

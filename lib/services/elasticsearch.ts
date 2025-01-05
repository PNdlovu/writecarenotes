/**
 * @writecarenotes.com
 * @fileoverview Elasticsearch service for knowledge base
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Elasticsearch service for indexing and searching knowledge base articles.
 */

import { Client } from '@elastic/elasticsearch';
import { Article, SearchResult } from '@/types/knowledge-base';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || ''
  }
});

const INDEX_NAME = 'knowledge_base_articles';

export const elasticsearch = {
  /**
   * Initialize Elasticsearch index with proper mappings
   */
  async initializeIndex() {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    
    if (!exists) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball']
                }
              }
            }
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'custom_analyzer',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              content: {
                type: 'text',
                analyzer: 'custom_analyzer'
              },
              excerpt: {
                type: 'text',
                analyzer: 'custom_analyzer'
              },
              slug: {
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
                  name: { type: 'text' },
                  slug: { type: 'keyword' }
                }
              },
              metadata: {
                properties: {
                  tags: { type: 'keyword' },
                  customFields: { type: 'object' }
                }
              },
              createdAt: {
                type: 'date'
              },
              updatedAt: {
                type: 'date'
              }
            }
          }
        }
      });
    }
  },

  /**
   * Index or update an article
   */
  async indexArticle(article: Article) {
    await client.index({
      index: INDEX_NAME,
      id: article.id,
      body: {
        ...article,
        suggest: {
          input: [
            article.title,
            ...(article.metadata?.tags || [])
          ]
        }
      }
    });
  },

  /**
   * Remove an article from the index
   */
  async removeArticle(articleId: string) {
    await client.delete({
      index: INDEX_NAME,
      id: articleId
    });
  },

  /**
   * Search articles with advanced features
   */
  async searchArticles({
    query,
    filters = {},
    page = 1,
    limit = 10,
    sort = 'relevance'
  }: {
    query: string;
    filters?: {
      category?: string;
      tags?: string[];
      status?: string;
      dateRange?: {
        start?: Date;
        end?: Date;
      };
    };
    page?: number;
    limit?: number;
    sort?: 'relevance' | 'date' | 'views';
  }): Promise<{
    results: SearchResult[];
    total: number;
    suggestions: string[];
  }> {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'content', 'excerpt^2', 'metadata.tags^2'],
          fuzziness: 'AUTO'
        }
      }
    ];

    // Add filters
    if (filters.category) {
      must.push({ term: { 'category.slug': filters.category } });
    }
    if (filters.tags?.length) {
      must.push({ terms: { 'metadata.tags': filters.tags } });
    }
    if (filters.status) {
      must.push({ term: { status: filters.status } });
    }
    if (filters.dateRange) {
      const range: any = {};
      if (filters.dateRange.start) {
        range.gte = filters.dateRange.start.toISOString();
      }
      if (filters.dateRange.end) {
        range.lte = filters.dateRange.end.toISOString();
      }
      if (Object.keys(range).length) {
        must.push({ range: { updatedAt: range } });
      }
    }

    // Determine sort order
    const sortConfig = sort === 'relevance' 
      ? [{ _score: 'desc' }]
      : sort === 'date'
      ? [{ updatedAt: 'desc' }]
      : [{ views: 'desc' }];

    const response = await client.search({
      index: INDEX_NAME,
      body: {
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: { must }
        },
        sort: sortConfig,
        highlight: {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 3
            }
          }
        },
        suggest: {
          text: query,
          title_suggestions: {
            term: {
              field: 'title'
            }
          },
          tag_suggestions: {
            term: {
              field: 'metadata.tags'
            }
          }
        }
      }
    });

    // Process suggestions
    const suggestions = new Set<string>();
    if (response.suggest) {
      ['title_suggestions', 'tag_suggestions'].forEach(suggester => {
        response.suggest[suggester]?.forEach(suggestion => {
          suggestion.options?.forEach(option => {
            suggestions.add(option.text);
          });
        });
      });
    }

    return {
      results: response.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source,
        relevance: hit._score,
        highlights: hit.highlight
      })) as SearchResult[],
      total: response.hits.total.value,
      suggestions: Array.from(suggestions)
    };
  },

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        suggest: {
          title_suggestions: {
            prefix: query,
            completion: {
              field: 'suggest',
              fuzzy: {
                fuzziness: 2
              },
              size: 5
            }
          }
        }
      }
    });

    return response.suggest.title_suggestions[0].options.map(
      option => option.text
    );
  },

  /**
   * Reindex all articles
   */
  async reindexAll(articles: Article[]) {
    await client.indices.delete({
      index: INDEX_NAME,
      ignore_unavailable: true
    });

    await this.initializeIndex();

    const operations = articles.flatMap(article => [
      { index: { _index: INDEX_NAME, _id: article.id } },
      article
    ]);

    await client.bulk({
      refresh: true,
      operations
    });
  }
}; 

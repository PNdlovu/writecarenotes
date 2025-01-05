# Knowledge Base Services Documentation

## Overview

The knowledge base module uses several core services to provide advanced functionality:

- Elasticsearch service for full-text search
- Redis-based caching service
- Background job processing with Bull
- Structured logging service

## Services

### Elasticsearch Service (`elasticsearch.ts`)

Handles article indexing and searching with advanced features:

```typescript
// Initialize index
await elasticsearch.initializeIndex();

// Index an article
await elasticsearch.indexArticle(article);

// Search articles
const results = await elasticsearch.searchArticles({
  query: 'search term',
  filters: {
    category: 'category-id',
    tags: ['tag1', 'tag2'],
    status: 'PUBLISHED'
  },
  page: 1,
  limit: 10,
  sort: 'relevance'
});

// Get suggestions
const suggestions = await elasticsearch.getSuggestions('search term');
```

Features:
- Custom analyzer with stopwords and snowball stemming
- Field boosting (title^3, excerpt^2)
- Fuzzy matching
- Highlighting
- Suggestions
- Advanced filtering

### Cache Service (`cache.ts`)

Redis-based caching with advanced features:

```typescript
// Simple get/set
await cache.set('key', value, { ttl: 300 });
const value = await cache.get('key');

// Remember pattern
const value = await cache.remember(
  'key',
  300,
  async () => {
    return expensiveOperation();
  }
);

// Cache tags
const userCache = await cache.tags(['user', userId]);
await userCache.set('profile', profile);
await userCache.get('profile');

// Cache invalidation
await cache.invalidate('article:update');
```

Features:
- TTL support
- Cache tags
- Invalidation triggers
- Remember pattern
- Health checks

### Queue Service (`queue.ts`)

Background job processing using Bull:

```typescript
// Add indexing job
await queueHelpers.addIndexingJob(articleId, 'index');

// Add export job
await queueHelpers.addExportJob(articleId, 'pdf', userId);

// Add notification job
await queueHelpers.addNotificationJob('ARTICLE_PUBLISHED', userId, {
  articleId
});

// Get queue status
const status = await queueHelpers.getQueueStatus();
```

Features:
- Multiple queues (indexing, export, notification, cleanup)
- Job prioritization
- Retry with exponential backoff
- Job monitoring
- Scheduled jobs

### Logger Service (`logger.ts`)

Structured logging with context:

```typescript
// Basic logging
logger.info('Operation completed');
logger.error('Operation failed', { error });

// With context
logger.info('User action', {
  userId,
  action: 'view_article',
  articleId
});

// Performance tracking
const result = await logger.trackOperation(
  'search_articles',
  'knowledge-base',
  async () => {
    return searchOperation();
  }
);
```

Features:
- Log levels (debug, info, warn, error)
- Structured JSON output
- Error tracking
- Performance monitoring
- Environment awareness

## Best Practices

### Elasticsearch

1. **Indexing**
   - Index articles asynchronously using the queue
   - Use bulk operations for multiple articles
   - Include all searchable fields
   - Set proper boost values

2. **Searching**
   - Use filters for exact matches
   - Use query for full-text search
   - Consider pagination limits
   - Monitor search performance

### Caching

1. **Keys**
   - Use consistent naming patterns
   - Include version in keys
   - Consider data dependencies
   - Set appropriate TTL

2. **Invalidation**
   - Use specific triggers
   - Avoid mass invalidation
   - Consider cache warming
   - Monitor cache hit rates

### Queue Processing

1. **Jobs**
   - Keep job data small
   - Set appropriate timeouts
   - Handle failures gracefully
   - Monitor queue health

2. **Concurrency**
   - Set proper concurrency limits
   - Use job priorities
   - Implement rate limiting
   - Monitor job completion rates

### Logging

1. **Messages**
   - Be specific and concise
   - Include relevant context
   - Structure data consistently
   - Use appropriate log levels

2. **Performance**
   - Log timing information
   - Track operation success/failure
   - Monitor error rates
   - Set up alerts

## Configuration

### Environment Variables

```env
# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# Redis
REDIS_URL=redis://localhost:6379

# Queue
QUEUE_PREFIX=knowledge-base
MAX_CONCURRENT_JOBS=5

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## Monitoring

The services provide various monitoring endpoints:

```typescript
// Cache health
const cacheHealth = await cache.ping();

// Queue status
const queueStatus = await queueHelpers.getQueueStatus();

// Search index status
const indexStatus = await elasticsearch.getIndexStatus();
```

## Error Handling

Each service implements comprehensive error handling:

1. **Elasticsearch**
   - Connection errors
   - Index errors
   - Query errors
   - Timeout errors

2. **Cache**
   - Connection errors
   - Serialization errors
   - Key conflicts
   - Memory limits

3. **Queue**
   - Job failures
   - Stalled jobs
   - Queue errors
   - Worker errors

4. **Logger**
   - Write errors
   - Format errors
   - Transport errors
   - Rate limits

## Support

For service-related issues:
1. Check the logs for detailed error information
2. Monitor service health endpoints
3. Review job queues for failures
4. Contact the Write Care Notes team for support 
# Knowledge Base API Documentation

## Overview

The Knowledge Base API is an enterprise-grade system for managing and serving documentation, articles, and guides. It features advanced search capabilities, caching, rate limiting, and background job processing.

## Features

- Full-text search with Elasticsearch
- Redis-based caching
- Rate limiting
- Background job processing
- Activity tracking
- Version control
- Export functionality
- Analytics and reporting

## Base URL

```
/api/knowledge-base
```

## Authentication

All endpoints require authentication. Admin endpoints require the user to have the `ADMIN` role.

## Rate Limiting

- Search: 60 requests per minute
- Admin: 300 requests per minute
- Default: 100 requests per 15 minutes

## Endpoints

### Articles

#### GET /articles
Get a list of articles with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `sort` (optional): Sort field (updatedAt, views)
- `order` (optional): Sort order (asc, desc)

Response:
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "status": "string",
      "views": "number",
      "category": {
        "id": "uuid",
        "name": "string"
      },
      "author": {
        "id": "uuid",
        "name": "string"
      },
      "_count": {
        "comments": "number",
        "reactions": "number"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

#### GET /articles/[slug]
Get a single article by slug.

Response:
```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "content": "string",
  "excerpt": "string",
  "status": "string",
  "views": "number",
  "metadata": {
    "tags": ["string"],
    "customFields": {}
  },
  "category": {
    "id": "uuid",
    "name": "string"
  },
  "author": {
    "id": "uuid",
    "name": "string"
  },
  "_count": {
    "comments": "number",
    "reactions": "number",
    "history": "number"
  }
}
```

### Search

#### GET /search
Search articles with advanced filtering.

Query Parameters:
- `q`: Search query
- `category` (optional): Filter by category ID
- `tags[]` (optional): Filter by tags
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort by (relevance, date, views)

Response:
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "excerpt": "string",
      "highlights": {
        "content": ["string"]
      },
      "relevance": "number"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  },
  "suggestions": ["string"],
  "timing": {
    "took": "number"
  }
}
```

### Comments

#### GET /articles/[slug]/comments
Get comments for an article.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

Response:
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "string",
      "author": {
        "id": "uuid",
        "name": "string"
      },
      "createdAt": "string",
      "replies": [
        {
          "id": "uuid",
          "content": "string",
          "author": {
            "id": "uuid",
            "name": "string"
          },
          "createdAt": "string"
        }
      ]
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### Admin Endpoints

#### POST /admin/knowledge-base/articles
Create a new article.

Request Body:
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string (optional)",
  "categoryId": "uuid",
  "status": "string (optional)",
  "metadata": {
    "tags": ["string"],
    "customFields": {},
    "scheduledPublishDate": "string (optional)"
  }
}
```

#### PATCH /admin/knowledge-base/articles/[slug]
Update an article.

Request Body: Same as POST but all fields optional.

#### GET /admin/knowledge-base/analytics
Get analytics data.

Query Parameters:
- `period`: Time period (day, week, month, year)
- `category` (optional): Filter by category ID

Response:
```json
{
  "overview": {
    "totalArticles": "number",
    "totalViews": "number",
    "totalComments": "number",
    "totalReactions": "number",
    "averageViewsPerArticle": "number"
  },
  "trends": [
    {
      "date": "string",
      "views": "number",
      "reactions": "number",
      "comments": "number",
      "searches": "number"
    }
  ],
  "popularArticles": [
    {
      "id": "uuid",
      "title": "string",
      "views": "number",
      "_count": {
        "comments": "number",
        "reactions": "number"
      }
    }
  ],
  "categoryDistribution": [
    {
      "category": "string",
      "count": "number"
    }
  ],
  "searchAnalytics": [
    {
      "query": "string",
      "count": "number"
    }
  ]
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "string" | {
    "code": "string",
    "message": "string",
    "path": ["string"]
  }[]
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Caching

- Search results are cached for 5 minutes
- Article lists are cached for 5 minutes
- Individual articles are cached for 10 minutes
- Cache is invalidated on article updates and deletions

## Background Jobs

The system uses background jobs for:
- Elasticsearch indexing
- Article exports
- Notifications
- Cleanup tasks

## Monitoring

The system provides monitoring through:
- Structured logging
- Performance tracking
- Queue status monitoring
- Rate limit tracking

## Best Practices

1. **Search**
   - Use specific search terms
   - Utilize filters for better results
   - Consider pagination for large result sets

2. **Caching**
   - Cache keys are based on query parameters
   - Cache invalidation is automatic
   - Consider cache warming for popular content

3. **Rate Limiting**
   - Implement exponential backoff
   - Monitor rate limit headers
   - Cache responses client-side

4. **Error Handling**
   - Always check error responses
   - Implement retry logic with backoff
   - Log and monitor error rates

## Support

For API support, please contact the Write Care Notes team. 
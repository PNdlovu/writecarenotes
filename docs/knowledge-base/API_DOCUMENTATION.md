# Knowledge Base API Documentation

## API Overview

The Knowledge Base API provides endpoints for managing articles, categories, and search functionality within the Write Care Notes knowledge base system.

## Base URL
```
https://api.writecarenotes.com/v1/kb
```

## Authentication

All API requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Articles

#### List Articles
```http
GET /articles
```

Query Parameters:
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `category` (string): Filter by category
- `tags` (string[]): Filter by tags
- `status` (string): Filter by status

Response:
```typescript
{
  items: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    tags: string[];
    status: string;
    updatedAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

#### Get Article
```http
GET /articles/:id
```

Response:
```typescript
{
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}
```

#### Create Article
```http
POST /articles
```

Request Body:
```typescript
{
  title: string;
  content: string;
  category: string;
  tags?: string[];
  status?: 'draft' | 'review' | 'published';
}
```

#### Update Article
```http
PUT /articles/:id
```

Request Body:
```typescript
{
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: string;
}
```

### Categories

#### List Categories
```http
GET /categories
```

Response:
```typescript
{
  items: Array<{
    id: string;
    name: string;
    description: string;
    parentId?: string;
    articleCount: number;
  }>;
}
```

#### Create Category
```http
POST /categories
```

Request Body:
```typescript
{
  name: string;
  description: string;
  parentId?: string;
}
```

### Search

#### Search Articles
```http
GET /search
```

Query Parameters:
- `q` (string): Search query
- `category` (string): Filter by category
- `tags` (string[]): Filter by tags
- `page` (number): Page number
- `limit` (number): Items per page

Response:
```typescript
{
  items: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    tags: string[];
    score: number;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

## Error Responses

All error responses follow this format:
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

Common Error Codes:
- `KB001`: Invalid input
- `KB002`: Resource not found
- `KB003`: Permission denied
- `KB004`: Version conflict
- `KB005`: Rate limit exceeded

## Rate Limits

- 1000 requests per hour per API key
- Search endpoints: 100 requests per minute
- Burst limit: 50 requests per second

## Versioning

The API uses semantic versioning. The current version is v1.
Breaking changes will be released as new API versions.

## Best Practices

1. Use appropriate HTTP methods
2. Include error handling
3. Implement pagination for large result sets
4. Cache responses when appropriate
5. Use compression for large payloads

## Examples

### JavaScript/TypeScript

```typescript
// Fetch an article
async function getArticle(id: string) {
  const response = await fetch(`/api/kb/articles/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  
  return response.json();
}

// Search articles
async function searchArticles(query: string) {
  const response = await fetch(`/api/kb/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

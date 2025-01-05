# Blog API Documentation

## Base URL

```
/api/blog
```

## Authentication

All endpoints require authentication via Next-Auth session unless specified otherwise.

## Endpoints

### List Posts

```http
GET /api/blog
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `search` (optional): Search term
- `category` (optional): Category type
- `region` (optional): Region filter
- `regulatory` (optional): Regulatory body filter
- `status` (optional): Post status filter

Response:
```typescript
{
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Get Single Post

```http
GET /api/blog/{slug}
```

Parameters:
- `slug`: Post slug (URL-friendly identifier)

Response:
```typescript
Post
```

### Create Post

```http
POST /api/blog
```

Required Role: ADMIN, EDITOR, or AUTHOR

Request Body:
```typescript
{
  title: string;          // 1-200 characters
  content: string;        // Required
  excerpt?: string;       // Max 500 characters
  featuredImage?: string; // Valid URL
  status: PostStatus;     // DRAFT | PUBLISHED | ARCHIVED
  region: Region[];       // At least one region
  regulatoryBodies?: RegulatoryBody[];
  categoryIds: string[];  // At least one category
  tags?: string[];
  metadata?: Record<string, unknown>;
}
```

Response:
```typescript
Post
```

### Update Post

```http
PATCH /api/blog/{slug}
```

Required Role: ADMIN, EDITOR, or Post Author

Request Body: Same as POST, all fields optional

Response:
```typescript
Post
```

### Delete Post

```http
DELETE /api/blog/{slug}
```

Required Role: ADMIN or Post Author

Response:
```typescript
{
  message: string;
}
```

### List Comments

```http
GET /api/blog/comments
```

Query Parameters:
- `postId`: ID of the post

Response:
```typescript
Comment[]
```

### Create Comment

```http
POST /api/blog/comments
```

Required Role: Any authenticated user

Request Body:
```typescript
{
  postId: string;
  content: string;  // 1-1000 characters
}
```

Response:
```typescript
Comment
```

### Moderate Comment

```http
PATCH /api/blog/comments
```

Required Role: ADMIN or EDITOR

Request Body:
```typescript
{
  id: string;
  status: CommentStatus;  // APPROVED | REJECTED
}
```

Response:
```typescript
Comment
```

### Delete Comment

```http
DELETE /api/blog/comments
```

Required Role: ADMIN or Comment Author

Query Parameters:
- `id`: Comment ID

Response:
```typescript
{
  message: string;
}
```

## Error Responses

All endpoints return consistent error responses:

```typescript
{
  error: string;
  details?: unknown;
  status: number;
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Data Types

### Post Status

```typescript
enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
```

### Category Type

```typescript
enum CategoryType {
  REGULATION = 'REGULATION',
  BEST_PRACTICE = 'BEST_PRACTICE',
  NEWS = 'NEWS',
  TRAINING = 'TRAINING',
  WEBINAR = 'WEBINAR',
  CASE_STUDY = 'CASE_STUDY',
  INTERVIEW = 'INTERVIEW',
}
```

### Region

```typescript
enum Region {
  ENGLAND = 'ENGLAND',
  WALES = 'WALES',
  SCOTLAND = 'SCOTLAND',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND',
}
```

### Regulatory Body

```typescript
enum RegulatoryBody {
  CQC = 'CQC',
  OFSTED = 'OFSTED',
  CIW = 'CIW',
  CARE_INSPECTORATE = 'CARE_INSPECTORATE',
  HIQA = 'HIQA',
  RQIA = 'RQIA',
}
```

### Comment Status

```typescript
enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

## Rate Limiting

- 100 requests per minute per IP for GET endpoints
- 20 requests per minute per IP for POST/PATCH/DELETE endpoints

## Caching

- GET responses are cached for 5 minutes
- Cache is invalidated on POST/PATCH/DELETE operations
- Cache headers include ETag for conditional requests

## Examples

### Creating a Post

```typescript
const createPost = async (data) => {
  const response = await fetch('/api/blog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Best Practices in Care Home Management',
      content: '...',
      excerpt: 'A guide to implementing best practices...',
      region: ['ENGLAND', 'WALES'],
      regulatoryBodies: ['CQC', 'CIW'],
      categoryIds: ['cat1', 'cat2'],
      status: 'DRAFT',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### Updating a Post

```typescript
const updatePost = async (slug, data) => {
  const response = await fetch(`/api/blog/${slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### Moderating Comments

```typescript
const moderateComment = async (commentId, status) => {
  const response = await fetch('/api/blog/comments', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: commentId,
      status,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
``` 
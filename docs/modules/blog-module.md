# Blog Module Documentation

## Overview

The Blog Module is a comprehensive system for managing care home-related blog posts, supporting multiple regions and regulatory bodies across the UK and Ireland. It provides features for creating, editing, and moderating blog content with a focus on care home best practices, regulations, and industry insights.

## Features

- Multi-region content management (England, Wales, Scotland, Northern Ireland, Ireland)
- Regulatory body compliance (CQC, OFSTED, CIW, Care Inspectorate, HIQA, RQIA)
- Rich text editing with image uploads
- Comment system with moderation
- Category-based organization
- Role-based access control
- Offline support
- SEO optimization

## Architecture

### Directory Structure

```
├── app/
│   ├── api/blog/
│   │   ├── [slug]/
│   │   │   └── route.ts           # Single post operations
│   │   ├── comments/
│   │   │   └── route.ts           # Comment operations
│   │   ├── route.ts               # Main blog API
│   │   ├── types.ts               # Type definitions
│   │   └── validation.ts          # Validation schemas
│   └── blog/
│       ├── [slug]/
│       │   ├── edit/
│       │   │   └── page.tsx       # Edit post page
│       │   └── page.tsx           # Single post view
│       ├── create/
│       │   └── page.tsx           # Create post page
│       └── page.tsx               # Blog listing page
└── src/
    └── features/blog/
        ├── components/
        │   ├── CommentForm.tsx    # Comment submission form
        │   ├── CommentList.tsx    # Comments display
        │   ├── Editor.tsx         # Rich text editor
        │   ├── EditorToolbar.tsx  # Editor controls
        │   ├── PostCard.tsx       # Post preview card
        │   ├── PostEditor.tsx     # Post editing interface
        │   ├── PostForm.tsx       # Post creation/editing form
        │   └── PostList.tsx       # Posts listing
        ├── hooks/
        │   └── useImageUpload.ts  # Image upload handling
        └── services/
            └── imageService.ts     # Image processing
```

### Data Models

#### Post
```typescript
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: PostStatus;
  region: Region[];
  regulatoryBodies?: RegulatoryBody[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  authorId: string;
  categories: Category[];
  comments: Comment[];
  metadata?: Record<string, unknown>;
}
```

#### Comment
```typescript
interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  postId: string;
  author: User;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Posts

- `GET /api/blog` - List posts with filtering and pagination
- `POST /api/blog` - Create new post
- `GET /api/blog/[slug]` - Get single post
- `PATCH /api/blog/[slug]` - Update post
- `DELETE /api/blog/[slug]` - Delete post

### Comments

- `GET /api/blog/comments` - List comments for a post
- `POST /api/blog/comments` - Create new comment
- `PATCH /api/blog/comments` - Moderate comment
- `DELETE /api/blog/comments` - Delete comment

## Authentication & Authorization

### User Roles

- `ADMIN` - Full access to all features
- `EDITOR` - Can create, edit, and moderate content
- `AUTHOR` - Can create and edit own content
- `USER` - Can read and comment

### Permissions Matrix

| Action              | ADMIN | EDITOR | AUTHOR | USER |
|--------------------|-------|---------|---------|------|
| View Posts         | ✅    | ✅      | ✅      | ✅   |
| Create Posts       | ✅    | ✅      | ✅      | ❌   |
| Edit Any Post      | ✅    | ✅      | ❌      | ❌   |
| Edit Own Posts     | ✅    | ✅      | ✅      | ❌   |
| Delete Posts       | ✅    | ❌      | ❌      | ❌   |
| Moderate Comments  | ✅    | ✅      | ❌      | ❌   |
| Comment            | ✅    | ✅      | ✅      | ✅   |

## Validation

All data validation is handled using Zod schemas:

- `postSchema` - Validates post creation/updates
- `commentSchema` - Validates comment submissions
- `querySchema` - Validates API query parameters

## Regional Support

### Regions
- England (en-GB)
- Wales (cy-GB, en-GB)
- Scotland (gd-GB, en-GB)
- Northern Ireland (en-GB)
- Ireland (ga-IE, en-IE)

### Regulatory Bodies
- CQC (England)
- OFSTED (England)
- CIW (Wales)
- Care Inspectorate (Scotland)
- HIQA (Ireland)
- RQIA (Northern Ireland)

## Offline Support

The blog module implements offline-first architecture:

1. Data is cached in IndexedDB
2. Changes are queued when offline
3. Background sync when online
4. Conflict resolution handling

## SEO Optimization

- Dynamic metadata generation
- OpenGraph tags
- Structured data for blog posts
- Sitemap generation
- RSS feed support

## Error Handling

All API endpoints implement consistent error responses:

```typescript
{
  error: string;
  details?: unknown;
  status: number;
}
```

Common error scenarios:
- 400: Invalid input data
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 500: Server error

## Usage Examples

### Creating a Post

```typescript
const response = await fetch('/api/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Best Practices in Care Home Management',
    content: '...',
    region: ['ENGLAND', 'WALES'],
    regulatoryBodies: ['CQC', 'CIW'],
    categoryIds: ['cat1', 'cat2'],
    status: 'DRAFT',
  }),
});
```

### Moderating Comments

```typescript
const response = await fetch('/api/blog/comments', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'comment-id',
    status: 'APPROVED',
  }),
});
```

## Testing

The module includes:
- Unit tests for components
- Integration tests for API endpoints
- E2E tests for critical flows
- Accessibility tests

## Performance Considerations

- Image optimization
- Lazy loading of comments
- Pagination of posts
- Caching strategies
- SSR for initial page load
- ISR for static pages

## Security Measures

- Input sanitization
- CSRF protection
- Rate limiting
- Content validation
- Role-based access
- XSS prevention

## Future Enhancements

1. Advanced search functionality
2. AI-powered content moderation
3. Analytics dashboard
4. Newsletter integration
5. Social media sharing
6. Content scheduling
7. Version history
8. Multi-language support 
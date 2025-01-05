# Knowledge Base Module Structure

## Directory Structure

```
src/
├── features/
│   └── knowledge-base/
│       ├── components/                 # UI Components
│       │   ├── article/
│       │   │   ├── ArticleEditor.tsx   # Rich text editor for articles
│       │   │   ├── ArticleView.tsx     # Article display component
│       │   │   ├── ArticleHistory.tsx  # Version history viewer
│       │   │   └── ArticleMeta.tsx     # Metadata display/editor
│       │   ├── category/
│       │   │   ├── CategoryTree.tsx    # Hierarchical category viewer
│       │   │   └── CategoryEdit.tsx    # Category editor
│       │   ├── search/
│       │   │   ├── SearchBar.tsx       # Search input with suggestions
│       │   │   └── SearchResults.tsx   # Search results display
│       │   └── common/
│       │       ├── TagInput.tsx        # Tag management component
│       │       └── StatusBadge.tsx     # Article status indicator
│       │
│       ├── services/                   # Business Logic Layer
│       │   ├── article/
│       │   │   ├── articleService.ts   # Article CRUD operations
│       │   │   ├── versionService.ts   # Version control logic
│       │   │   └── validationService.ts# Article validation rules
│       │   ├── category/
│       │   │   └── categoryService.ts  # Category management
│       │   ├── search/
│       │   │   ├── searchService.ts    # Search functionality
│       │   │   └── indexService.ts     # Search indexing
│       │   └── sync/
│       │       ├── syncService.ts      # Offline sync management
│       │       └── conflictService.ts  # Conflict resolution
│       │
│       ├── hooks/                      # React Custom Hooks
│       │   ├── useArticle.ts           # Article management hook
│       │   ├── useCategory.ts          # Category operations
│       │   ├── useSearch.ts            # Search functionality
│       │   └── useSync.ts              # Offline sync state
│       │
│       ├── store/                      # State Management
│       │   ├── articleSlice.ts         # Article state
│       │   ├── categorySlice.ts        # Category state
│       │   ├── searchSlice.ts          # Search state
│       │   └── syncSlice.ts            # Sync state
│       │
│       ├── types/                      # TypeScript Definitions
│       │   ├── article.ts              # Article related types
│       │   ├── category.ts             # Category related types
│       │   ├── search.ts               # Search related types
│       │   └── sync.ts                 # Sync related types
│       │
│       ├── utils/                      # Utility Functions
│       │   ├── formatters.ts           # Data formatting
│       │   ├── validators.ts           # Input validation
│       │   ├── search.ts              # Search helpers
│       │   └── sync.ts                # Sync helpers
│       │
│       └── api/                        # API Integration
│           ├── endpoints.ts            # API endpoint definitions
│           ├── client.ts              # API client configuration
│           └── transforms.ts          # Data transformation
│
├── i18n/                              # Internationalization
│   └── knowledge-base/
│       ├── en/                        # English translations
│       │   └── kb.json
│       └── ga/                        # Irish translations
│           └── kb.json
│
└── public/                            # Static Assets
    └── knowledge-base/
        ├── icons/                     # Module specific icons
        └── images/                    # Module specific images
```

## Core Components

### 1. Article Management

```typescript
// types/article.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  version: number;
  status: ArticleStatus;
  metadata: ArticleMetadata;
}

// services/article/articleService.ts
export class ArticleService {
  async create(data: CreateArticleDTO): Promise<Article>;
  async update(id: string, data: UpdateArticleDTO): Promise<Article>;
  async delete(id: string): Promise<void>;
  async getVersion(id: string, version: number): Promise<Article>;
  async restore(id: string, version: number): Promise<Article>;
}
```

### 2. Category Management

```typescript
// types/category.ts
export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  metadata: CategoryMetadata;
}

// services/category/categoryService.ts
export class CategoryService {
  async create(data: CreateCategoryDTO): Promise<Category>;
  async update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  async delete(id: string): Promise<void>;
  async move(id: string, newParentId: string): Promise<Category>;
}
```

### 3. Search System

```typescript
// types/search.ts
export interface SearchQuery {
  term: string;
  filters: SearchFilters;
  pagination: PaginationOptions;
}

// services/search/searchService.ts
export class SearchService {
  async search(query: SearchQuery): Promise<SearchResults>;
  async suggest(term: string): Promise<string[]>;
  async reindex(): Promise<void>;
}
```

### 4. Offline Sync

```typescript
// types/sync.ts
export interface SyncState {
  lastSync: Date;
  pendingChanges: Change[];
  conflicts: Conflict[];
}

// services/sync/syncService.ts
export class SyncService {
  async sync(): Promise<void>;
  async queueChange(change: Change): Promise<void>;
  async resolveConflict(conflict: Conflict, resolution: Resolution): Promise<void>;
}
```

## State Management

```typescript
// store/articleSlice.ts
export const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setArticle: (state, action) => {},
    updateArticle: (state, action) => {},
    deleteArticle: (state, action) => {},
    setVersion: (state, action) => {},
  }
});

// store/searchSlice.ts
export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setResults: (state, action) => {},
    setSuggestions: (state, action) => {},
    setFilters: (state, action) => {},
  }
});
```

## Custom Hooks

```typescript
// hooks/useArticle.ts
export function useArticle(id?: string) {
  const article = useSelector(selectArticle(id));
  const dispatch = useDispatch();

  return {
    article,
    create: (data: CreateArticleDTO) => {},
    update: (data: UpdateArticleDTO) => {},
    delete: () => {},
    restore: (version: number) => {},
  };
}

// hooks/useSearch.ts
export function useSearch() {
  const results = useSelector(selectSearchResults);
  const dispatch = useDispatch();

  return {
    results,
    search: (query: SearchQuery) => {},
    suggest: (term: string) => {},
    clearResults: () => {},
  };
}
```

## API Integration

```typescript
// api/endpoints.ts
export const KB_API = {
  articles: {
    create: '/api/kb/articles',
    update: (id: string) => `/api/kb/articles/${id}`,
    delete: (id: string) => `/api/kb/articles/${id}`,
    version: (id: string, version: number) => 
      `/api/kb/articles/${id}/versions/${version}`,
  },
  search: {
    query: '/api/kb/search',
    suggest: '/api/kb/suggest',
  },
};

// api/client.ts
export const kbClient = createApiClient({
  baseURL: '/api/kb',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Internationalization

```json
// i18n/knowledge-base/en/kb.json
{
  "article": {
    "create": "Create Article",
    "edit": "Edit Article",
    "delete": "Delete Article",
    "status": {
      "draft": "Draft",
      "review": "In Review",
      "published": "Published"
    }
  },
  "search": {
    "placeholder": "Search knowledge base...",
    "noResults": "No articles found",
    "filters": {
      "category": "Filter by category",
      "tags": "Filter by tags"
    }
  }
}
```

This structure provides:
- Clear separation of concerns
- Modular and maintainable code
- Type safety with TypeScript
- Efficient state management
- Comprehensive offline support
- Internationalization ready
- Scalable architecture

Would you like me to elaborate on any specific part of the module structure?

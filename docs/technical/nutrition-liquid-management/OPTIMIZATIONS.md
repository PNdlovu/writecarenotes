# Performance Optimization Guide

## Table of Contents
1. [Database Optimizations](#database-optimizations)
2. [API Optimizations](#api-optimizations)
3. [UI Optimizations](#ui-optimizations)
4. [Monitoring and Metrics](#monitoring-and-metrics)
5. [Best Practices](#best-practices)

## Database Optimizations

### DataLoader Implementation
DataLoader is used for efficient batch loading and caching of database queries:

```typescript
const mealPlanLoader = new DataLoader(async (ids: string[]) => {
  const mealPlans = await prisma.mealPlan.findMany({
    where: { id: { in: ids } }
  })
  return ids.map(id => mealPlans.find(plan => plan.id === id))
})
```

Usage:
```typescript
// Instead of multiple individual queries
const mealPlan = await dbOptimizer.getMealPlan(id)
```

### Query Optimization
The DatabaseOptimizer class provides methods for optimizing database queries:

```typescript
// Optimized query with caching
const results = await dbOptimizer.optimizeQuery(
  'cache-key',
  () => prisma.mealPlan.findMany(),
  { ttl: 300 }
)
```

### Pagination Strategies

#### Offset Pagination
```typescript
const { data, total, hasMore } = await dbOptimizer.getPaginatedResults(
  prisma.mealPlan,
  page,
  pageSize
)
```

#### Cursor Pagination
```typescript
const { data, nextCursor } = await dbOptimizer.getCursorPaginatedResults(
  prisma.mealPlan,
  cursor,
  limit
)
```

### Transaction Management
```typescript
await dbOptimizer.withTransaction(async (tx) => {
  // Transaction operations
}, 3) // With 3 retries
```

## API Optimizations

### Rate Limiting
Rate limiting is implemented to prevent API abuse:

```typescript
export default apiOptimizer.createOptimizedHandler(
  handler,
  {
    rateLimit: true, // 100 requests per 15 minutes
    cache: true,
    compress: true
  }
)
```

### Response Caching
Automatic caching of API responses:

```typescript
// Cache configuration
const API_CACHE_TTL = 300 // 5 minutes
const STALE_WHILE_REVALIDATE = 60 // 1 minute

// Usage in API route
export default apiOptimizer.createOptimizedHandler(
  handler,
  { cache: true }
)
```

### Batch Operations
Handling multiple operations in a single request:

```typescript
await apiOptimizer.handleBatchRequest(req, res, {
  getMealPlan: async (data) => {
    return await prisma.mealPlan.findUnique(data)
  },
  // Other handlers
})
```

### Error Handling
Automatic retry logic for failed operations:

```typescript
const result = await apiOptimizer.withRetry(
  async () => {
    // Operation that might fail
  },
  {
    retries: 3,
    backoff: 300
  }
)
```

## UI Optimizations

### Virtual List
Efficient rendering of large lists:

```typescript
function MealPlanList({ items }) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll
  } = useVirtualList({
    items,
    rowHeight: 50,
    containerHeight: 400
  })

  return (
    <div onScroll={onScroll} style={{ height: totalHeight }}>
      <div style={{ transform: `translateY(${offsetY}px)` }}>
        {visibleItems.map(item => (
          <MealPlanItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  )
}
```

### Lazy Loading
Component and image lazy loading:

```typescript
function LazyLoadedSection() {
  const { elementRef, isVisible } = useLazyLoad()

  return (
    <div ref={elementRef}>
      {isVisible && <ExpensiveComponent />}
    </div>
  )
}
```

### Form Input Optimization
Debounced form inputs:

```typescript
function SearchForm() {
  const searchInput = useFormInput('')

  return (
    <input
      value={searchInput.value}
      onChange={searchInput.onChange}
    />
  )
}
```

### Performance Monitoring
Component render time measurement:

```typescript
const OptimizedComponent = performanceUtils.measureRenderTime(
  MyComponent
)
```

## Monitoring and Metrics

### Database Metrics
Monitor database performance:

```typescript
const stats = await dbOptimizer.getStats()
console.log({
  memoryUsage: stats.memoryUsage,
  keyCount: stats.keyCount,
  hitRate: stats.hitRate
})
```

### API Metrics
Track API performance:

```typescript
const metrics = performanceMonitor.getMetrics('api_request')
console.log({
  averageDuration: metrics.averageDuration,
  p95Duration: metrics.p95Duration
})
```

### UI Performance
Monitor component performance:

```typescript
// Component render times
const metrics = performanceMonitor.getMetrics('component_render')

// Memory usage
const { memoryUsage } = performance.memory
```

## Best Practices

### Database
1. Use DataLoader for N+1 query prevention
2. Implement appropriate indexes
3. Use cursor pagination for large datasets
4. Keep transactions short and focused
5. Regularly maintain and analyze query performance

### API
1. Enable caching for read-heavy endpoints
2. Use compression for large responses
3. Implement rate limiting
4. Handle batch operations efficiently
5. Use appropriate error handling and retry strategies

### UI
1. Virtualize large lists
2. Implement lazy loading
3. Debounce frequent updates
4. Optimize component re-renders
5. Use appropriate image optimization

## Implementation Examples

### Database Query Optimization
```typescript
// Bad
const meals = await Promise.all(
  ids.map(id => prisma.meal.findUnique({ where: { id } }))
)

// Good
const meals = await dbOptimizer.getMealPlan(ids)
```

### API Response Optimization
```typescript
// Bad
app.get('/api/meals', async (req, res) => {
  const meals = await prisma.meal.findMany()
  res.json(meals)
})

// Good
app.get('/api/meals', apiOptimizer.createOptimizedHandler(
  async (req, res) => {
    const meals = await prisma.meal.findMany()
    res.json(meals)
  },
  {
    cache: true,
    compress: true
  }
))
```

### UI Render Optimization
```typescript
// Bad
function MealList({ meals }) {
  return (
    <div>
      {meals.map(meal => (
        <MealItem key={meal.id} {...meal} />
      ))}
    </div>
  )
}

// Good
function MealList({ meals }) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll
  } = useVirtualList({
    items: meals,
    rowHeight: 50,
    containerHeight: 400
  })

  return (
    <div onScroll={onScroll} style={{ height: totalHeight }}>
      <div style={{ transform: `translateY(${offsetY}px)` }}>
        {visibleItems.map(meal => (
          <MealItem key={meal.id} {...meal} />
        ))}
      </div>
    </div>
  )
}
```

## Performance Checklist

### Database
- [ ] Implemented DataLoader for batch loading
- [ ] Optimized queries with appropriate indexes
- [ ] Using cursor pagination for large datasets
- [ ] Implemented query caching
- [ ] Regular maintenance scheduled

### API
- [ ] Rate limiting configured
- [ ] Response caching enabled
- [ ] Compression implemented
- [ ] Batch operations supported
- [ ] Error handling with retries

### UI
- [ ] Virtual scrolling for large lists
- [ ] Lazy loading implemented
- [ ] Form inputs optimized
- [ ] Image optimization configured
- [ ] Performance monitoring active

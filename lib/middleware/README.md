# Knowledge Base Middleware Documentation

## Overview

The knowledge base module uses several middleware components to handle:

- Rate limiting
- Authentication
- Error handling
- Request validation
- Performance monitoring

## Middleware Components

### Rate Limiter (`rate-limit.ts`)

Redis-based rate limiting middleware:

```typescript
// Create custom rate limiter
const customLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  keyPrefix: 'custom:',
  skipFailedRequests: true
});

// Use in route handler
export async function GET(request: Request) {
  const rateLimitResponse = await customLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Handle request
}
```

Predefined Limiters:
- `defaultRateLimiter`: 100 requests per 15 minutes
- `strictRateLimiter`: 30 requests per minute
- `searchRateLimiter`: 60 searches per minute
- `adminRateLimiter`: 300 requests per minute

Features:
- Window-based limiting
- IP-based tracking
- Custom error responses
- Skip options for failed/successful requests
- Rate limit headers
- Redis-based storage

### Authentication (`auth.ts`)

Session-based authentication middleware:

```typescript
// Get current session
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

// Check admin role
if (session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}
```

Features:
- Session management
- Role-based access control
- Token validation
- Session persistence
- Secure cookie handling

### Error Handler (`error-handler.ts`)

Centralized error handling middleware:

```typescript
try {
  // Operation that might fail
} catch (error) {
  return errorHandler(error, {
    module: 'knowledge-base',
    operation: 'search'
  });
}
```

Features:
- Error classification
- Structured error responses
- Logging integration
- Status code mapping
- Development mode details

### Request Validator (`validator.ts`)

Zod-based request validation middleware:

```typescript
// Validate request body
const validatedBody = SearchSchema.parse(json);

// Validate query parameters
const validatedParams = SearchSchema.parse({
  query,
  category,
  tags,
  page,
  limit,
  sort
});
```

Features:
- Schema validation
- Type inference
- Custom error messages
- Nested validation
- Optional fields

### Performance Monitor (`performance.ts`)

Request performance monitoring middleware:

```typescript
// Track operation timing
const startTime = performance.now();

// Perform operation

logger.info('Operation completed', {
  duration: performance.now() - startTime
});
```

Features:
- Operation timing
- Resource usage tracking
- Performance metrics
- Threshold alerts
- Timing headers

## Best Practices

### Rate Limiting

1. **Configuration**
   - Set appropriate limits
   - Consider different endpoints
   - Use custom error messages
   - Monitor rate limit hits

2. **Client Handling**
   - Check rate limit headers
   - Implement backoff
   - Cache responses
   - Handle errors gracefully

### Authentication

1. **Security**
   - Validate all requests
   - Check appropriate roles
   - Use secure sessions
   - Implement CSRF protection

2. **Performance**
   - Cache session data
   - Minimize token size
   - Use efficient validation
   - Monitor auth failures

### Error Handling

1. **Response Format**
   - Use consistent structure
   - Include helpful messages
   - Protect sensitive data
   - Set correct status codes

2. **Logging**
   - Log error details
   - Include request context
   - Track error rates
   - Set up alerts

### Validation

1. **Schemas**
   - Define strict types
   - Use custom messages
   - Handle edge cases
   - Validate thoroughly

2. **Performance**
   - Cache compiled schemas
   - Validate efficiently
   - Handle large payloads
   - Monitor validation time

### Monitoring

1. **Metrics**
   - Track response times
   - Monitor error rates
   - Check resource usage
   - Set up alerts

2. **Analysis**
   - Review performance data
   - Identify bottlenecks
   - Track trends
   - Optimize based on data

## Configuration

### Environment Variables

```env
# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Authentication
AUTH_SECRET=your-secret-key
AUTH_COOKIE_NAME=session
AUTH_COOKIE_SECURE=true

# Error Handling
ERROR_LOGGING_LEVEL=info
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Performance
PERFORMANCE_THRESHOLD=1000
ENABLE_TIMING_HEADERS=true
```

## Monitoring

The middleware provides monitoring through:

1. **Rate Limiting**
   - Rate limit hits
   - Request distribution
   - Block events
   - Client patterns

2. **Authentication**
   - Auth failures
   - Session metrics
   - Role distribution
   - Token usage

3. **Error Handling**
   - Error rates
   - Error types
   - Resolution time
   - Impact metrics

4. **Validation**
   - Validation failures
   - Schema usage
   - Performance metrics
   - Data patterns

5. **Performance**
   - Response times
   - Resource usage
   - Bottlenecks
   - Optimization opportunities

## Error Handling

Each middleware component handles errors appropriately:

1. **Rate Limiting**
   - Too many requests
   - Redis errors
   - Configuration issues
   - Client identification

2. **Authentication**
   - Invalid tokens
   - Expired sessions
   - Role mismatches
   - Cookie issues

3. **Validation**
   - Schema violations
   - Type mismatches
   - Missing fields
   - Format errors

4. **Performance**
   - Timeout errors
   - Resource limits
   - Bottleneck issues
   - Threshold breaches

## Support

For middleware-related issues:
1. Check the logs for error details
2. Monitor performance metrics
3. Review configuration
4. Contact the Write Care Notes team for support 
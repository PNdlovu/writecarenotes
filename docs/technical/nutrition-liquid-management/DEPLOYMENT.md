# Nutrition and Liquid Management Deployment Guide

## Overview
This guide provides instructions for deploying and maintaining the Nutrition and Liquid Management module.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Steps](#deployment-steps)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js (v18.x or later)
- PostgreSQL (v14.x or later)
- Redis (v6.x or later)
- Docker (optional)

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nutrition_db
SHADOW_DATABASE_URL=postgresql://user:password@localhost:5432/nutrition_shadow_db

# Authentication
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=http://localhost:3000

# API Keys
OPENAI_API_KEY=your-openai-api-key

# Feature Flags
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_BATCH_OPERATIONS=true

# Performance
CACHE_TTL=3600
MAX_BATCH_SIZE=100
```

## Environment Setup

### Development Environment
1. Install dependencies:
```bash
npm install
```

2. Setup development database:
```bash
npx prisma migrate dev
```

3. Start development server:
```bash
npm run dev
```

### Production Environment
1. Build the application:
```bash
npm run build
```

2. Run database migrations:
```bash
npx prisma migrate deploy
```

3. Start production server:
```bash
npm start
```

## Database Setup

### Initial Setup
1. Create databases:
```sql
CREATE DATABASE nutrition_db;
CREATE DATABASE nutrition_shadow_db;
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

3. Seed initial data:
```bash
npx prisma db seed
```

### Backup and Recovery
1. Backup database:
```bash
pg_dump -U user nutrition_db > backup.sql
```

2. Restore database:
```bash
psql -U user nutrition_db < backup.sql
```

## Deployment Steps

### Manual Deployment
1. Pull latest changes:
```bash
git pull origin main
```

2. Install dependencies:
```bash
npm install --production
```

3. Build application:
```bash
npm run build
```

4. Run migrations:
```bash
npx prisma migrate deploy
```

5. Restart application:
```bash
pm2 restart nutrition-app
```

### Docker Deployment
1. Build image:
```bash
docker build -t nutrition-app .
```

2. Run container:
```bash
docker run -d \
  --name nutrition-app \
  -p 3000:3000 \
  --env-file .env \
  nutrition-app
```

## Monitoring

### Application Metrics
- Response times
- Error rates
- Active users
- Memory usage
- CPU usage

### Database Metrics
- Connection pool
- Query performance
- Index usage
- Table sizes

### Logging
```typescript
// Log levels
ERROR: Critical errors
WARN: Potential issues
INFO: Important events
DEBUG: Debugging information
```

### Alerts
1. Error rate exceeds threshold
2. Response time above 500ms
3. Memory usage above 80%
4. Database connections near limit

## Troubleshooting

### Common Issues

#### Slow Performance
1. Check database indexes
2. Verify cache hit rates
3. Monitor API response times
4. Check resource usage

#### Database Connection Issues
1. Verify connection string
2. Check max connections
3. Monitor connection pool
4. Review SSL settings

#### Memory Leaks
1. Monitor heap usage
2. Check for memory-intensive queries
3. Review component lifecycle
4. Analyze garbage collection

### Recovery Procedures

#### Database Recovery
1. Stop application
2. Restore from backup
3. Run migrations
4. Verify data integrity
5. Restart application

#### Application Recovery
1. Check error logs
2. Rollback deployment
3. Clear cache
4. Restart services
5. Verify functionality

## Performance Optimization

### Caching Strategy
```typescript
// Redis cache configuration
const cacheConfig = {
  ttl: 3600, // 1 hour
  maxSize: 1000,
  invalidation: 'LRU'
}
```

### Query Optimization
1. Use indexes effectively
2. Implement pagination
3. Optimize joins
4. Cache frequent queries

### Bundle Optimization
1. Code splitting
2. Tree shaking
3. Lazy loading
4. Image optimization

## Security Measures

### Authentication
1. JWT tokens
2. Rate limiting
3. Session management
4. Role-based access

### Data Protection
1. Input validation
2. SQL injection prevention
3. XSS protection
4. CSRF tokens

## Maintenance

### Regular Tasks
1. Database cleanup
2. Log rotation
3. Cache invalidation
4. Security updates

### Backup Schedule
1. Daily database backups
2. Weekly full backups
3. Monthly archives
4. Yearly retention

# Bed Management Module

## Overview
The Bed Management Module is a comprehensive solution for managing beds in care homes across multiple regions. It handles bed allocation, transfers, maintenance, and provides detailed analytics and reporting capabilities.

## Core Features

### 1. Bed Allocation
- Optimal bed finding based on care level, priority, and special requirements
- Waitlist management with priority-based queuing
- Real-time bed status tracking
- Support for different bed types and features

### 2. Bed Transfers
- Multi-step transfer workflow (request → approve → execute)
- Transfer request validation
- Automatic notifications
- Complete transfer history tracking

### 3. Bed Maintenance
- Scheduled and emergency maintenance tracking
- Maintenance task assignment
- Overdue maintenance alerts
- Maintenance history and reporting

### 4. Analytics & Reporting
- Occupancy statistics
- Transfer analytics
- Maintenance metrics
- Waitlist analytics
- Custom date range reporting

### 5. Notifications
- Real-time transfer request notifications
- Maintenance due alerts
- Waitlist match notifications
- Status change updates

### 6. Audit Trail
- Complete action history
- User activity tracking
- Change tracking with before/after states
- Filtered audit log access

## Technical Architecture

### Services
- `BedAllocationService`: Handles bed assignments and waitlist
- `BedTransferService`: Manages transfer workflows
- `BedMaintenanceService`: Controls maintenance scheduling and execution
- `BedAnalyticsService`: Provides statistical analysis
- `BedNotificationService`: Handles notifications
- `BedAuditService`: Manages audit logging

### Repositories
- `BedRepository`: Core bed data operations
- `WaitlistRepository`: Waitlist entry management

### API Routes
- `/api/beds/[bedId]/transfer`
- `/api/beds/[bedId]/maintenance`
- `/api/beds/waitlist`
- `/api/beds/analytics`
- `/api/beds/audit`

## Security

### Authentication
- All endpoints require authentication
- Role-based access control (RBAC)
- Tenant isolation

### Data Protection
- Input validation using Zod
- SQL injection prevention
- Cross-tenant data access prevention

## Getting Started

### Installation
```bash
npm install
```

### Configuration
1. Set up environment variables
2. Configure database connection
3. Set up authentication

### Running Tests
```bash
npm run test
```

## Documentation
- [INTEGRATION.md](./INTEGRATION.md): Integration guide
- [WORKFLOW.md](./WORKFLOW.md): Detailed workflows
- [CHANGELOG.md](./CHANGELOG.md): Version history

## Performance Optimization
- Efficient caching strategies
- Optimized database queries
- Batch processing for waitlist

## Dependencies
- NextAuth: Authentication
- Prisma: Database ORM
- Zod: Schema validation
- Jest: Testing framework

## Best Practices
1. Always use types and interfaces
2. Follow SOLID principles
3. Implement proper error handling
4. Write comprehensive tests
5. Document code changes
6. Use proper logging

## Maintenance
- Regular dependency updates
- Performance monitoring
- Security audits
- Database optimization

## Support
For issues and feature requests, please contact the development team.

# On-Call Management System

A comprehensive, enterprise-ready on-call management system for care homes. Built with React, TypeScript, and Material-UI.

## Features

- 📱 Mobile-first design with responsive UI
- 🔄 Real-time updates via WebSocket
- 📶 Offline support with background sync
- 🔔 Push notifications for urgent calls
- 📊 Performance monitoring and analytics
- ♿ WCAG 2.1 compliant accessibility
- 🔒 Enterprise-grade security
- 🌍 Multi-region support

## Architecture

### Core Components

- `OnCallDashboard`: Main dashboard component
- `NewCallForm`: Form for creating new on-call records
- `StaffAssignmentDialog`: Staff assignment workflow
- `CallDetailsView`: Detailed view of call records

### Services

- `OnCallService`: Core business logic
- `OnCallAPI`: REST API integration
- `OnCallStorage`: IndexedDB-based offline storage
- `NotificationService`: Real-time notifications
- `PerformanceMonitor`: Performance tracking

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```env
   NEXT_PUBLIC_API_BASE_URL=your_api_url
   NEXT_PUBLIC_SOCKET_URL=your_socket_url
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run cypress
```

### Performance Testing
```bash
npm run lighthouse
```

## Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy to your hosting platform:
   ```bash
   npm run deploy
   ```

## Monitoring

The system includes comprehensive performance monitoring:

- API call latency
- Page load times
- Record creation/update times
- Notification delivery times
- Offline sync performance

Access the monitoring dashboard at `/monitoring`.

## Security

- All API calls are authenticated
- Data is encrypted at rest and in transit
- Regular security audits
- GDPR compliant data handling

## Accessibility

- WCAG 2.1 AA compliant
- Screen reader optimized
- Keyboard navigation support
- High contrast mode support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

Copyright © 2025 Phibu Cloud Solutions Ltd. All rights reserved.

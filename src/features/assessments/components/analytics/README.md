# Analytics Module

## Overview
The Analytics module provides real-time monitoring, insights, and performance metrics for assessments. It includes features for tracking events, displaying alerts, and customizing analytics settings.

## Directory Structure
```
analytics/
├── __tests__/                    # Component tests
│   └── AnalyticsDashboard.test.tsx
├── components/                   # Reusable components
│   ├── AlertsPanel.tsx          # Displays active alerts
│   ├── InsightsPanel.tsx        # Shows analytics insights
│   ├── PerformanceMonitor.tsx   # Real-time performance metrics
│   └── SettingsDialog.tsx       # Analytics settings configuration
├── hooks/                       # Custom hooks
│   ├── useAnalytics.ts         # Analytics data management
│   └── usePerformance.ts       # Performance metrics handling
└── types/                      # Type definitions
    └── index.ts                # Analytics-specific types
```

## API Endpoints
Located in `app/api/assessments/analytics`:
- `GET /api/assessments/analytics` - Fetch analytics data
- `POST /api/assessments/analytics` - Track analytics events
- `GET /api/assessments/analytics/performance` - Get performance metrics

## Components

### AnalyticsDashboard
Main dashboard component that integrates all analytics features.
```tsx
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
```

### AlertsPanel
Displays and manages analytics alerts.
```tsx
import { AlertsPanel } from './components/analytics/AlertsPanel';
```

### InsightsPanel
Shows analytics insights and trends.
```tsx
import { InsightsPanel } from './components/analytics/InsightsPanel';
```

### PerformanceMonitor
Real-time performance monitoring component.
```tsx
import { PerformanceMonitor } from './components/analytics/PerformanceMonitor';
```

## Services

### AlertService
Manages analytics alerts and notifications.
```typescript
import { AlertService } from '@/features/assessments/services/analytics';
```

### SettingsService
Handles user-configurable analytics settings.
```typescript
import { SettingsService } from '@/features/assessments/services/analytics';
```

### AggregationService
Provides data aggregation and insights generation.
```typescript
import { AggregationService } from '@/features/assessments/services/analytics';
```

## Usage Example
```tsx
import { AnalyticsDashboard } from '@/features/assessments/components/analytics';
import { useAssessmentContext } from '@/features/assessments/context';

export function AssessmentAnalytics() {
  const { assessments } = useAssessmentContext();
  
  return (
    <div>
      <h1>Assessment Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
}
```

## Testing
- Component tests are in `__tests__` directory
- API tests are in `app/api/assessments/analytics/__tests__`
- Run tests with `npm test`

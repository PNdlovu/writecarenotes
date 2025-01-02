# Write Care Notes - Incident Management Module

## Overview
The incident management module provides comprehensive functionality for handling care home incidents, investigations, and reporting. It supports regulatory compliance across multiple regions and provides offline capabilities.

## Core Features
- Incident creation and management
- Investigation handling
- Regulatory compliance reporting
- Multi-region support
- Offline capabilities
- Document management
- Timeline tracking

## Module Structure
```
src/features/incidents/
├── components/      # React components
├── hooks/          # Custom React hooks
├── services/       # Business logic services
├── types/          # TypeScript types and interfaces
└── utils/          # Utility functions and constants

app/api/incidents/  # API routes
├── route.ts        # Main incident endpoints
├── [incidentId]/   # Individual incident operations
└── investigation/  # Investigation endpoints
```

## API Endpoints

### Main Endpoints
- `GET /api/incidents` - List incidents with filtering and pagination
- `POST /api/incidents` - Create a new incident

### Individual Incident Endpoints
- `GET /api/incidents/[id]` - Get incident details
- `PATCH /api/incidents/[id]` - Update incident
- `DELETE /api/incidents/[id]` - Delete incident

### Investigation Endpoints
- `POST /api/incidents/[id]/investigation` - Create investigation

## Components

### IncidentForm
Form component for creating and editing incidents with validation and offline support.

### IncidentList
List component with sorting, filtering, and pagination capabilities.

### IncidentDetails
Detailed view of an incident with tabs for different sections.

### InvestigationForm
Form for managing incident investigations.

### ReportGenerator
Component for generating various types of incident reports.

## Services

### incidentService
Core service for basic incident operations.

### advancedIncidentService
Advanced features including analytics and trend analysis.

### incidentManagementService
Enterprise-level service with full regulatory compliance.

## Getting Started

1. Import required components:
```typescript
import { 
  IncidentForm, 
  IncidentList, 
  IncidentDetails 
} from '@/features/incidents/components';
```

2. Use the components in your pages:
```typescript
const IncidentsPage = () => {
  return (
    <IncidentList
      onViewIncident={(id) => {}}
      onEditIncident={(id) => {}}
      pagination={{
        page: 1,
        pageSize: 10,
        total: 0,
      }}
      onPageChange={() => {}}
    />
  );
};
```

## Configuration
See [constants.ts](../src/features/incidents/utils/constants.ts) for configurable values.

## Contributing
Please read our [Contributing Guide](./CONTRIBUTING.md) before making a pull request.

## Changelog
See [CHANGELOG.md](./CHANGELOG.md) for a list of changes. 
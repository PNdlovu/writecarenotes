# Activities API Documentation

## Overview

The Activities API provides comprehensive functionality for managing care home activities with enterprise-grade features including multi-tenancy, offline support, regional compliance, and extensive monitoring.

## Key Features

- **Multi-tenancy**: Full isolation between organizations and care homes
- **Offline Support**: Robust sync mechanism with conflict resolution
- **Regional Compliance**: Region-specific data handling and formatting
- **Enterprise Features**: Monitoring, audit logging, and compliance checks

## Authentication

All API endpoints require Bearer token authentication:

```http
Authorization: Bearer <token>
```

## Endpoints

### List Activities

```http
GET /api/organizations/{organizationId}/care-homes/{careHomeId}/activities
```

Lists activities with optional filtering.

#### Query Parameters

- `startDate` (optional): ISO 8601 datetime
- `endDate` (optional): ISO 8601 datetime
- `type` (optional): PHYSICAL | SOCIAL | CREATIVE | COGNITIVE | SPIRITUAL
- `status` (optional): SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED

#### Response

```json
[
  {
    "id": "uuid",
    "title": "Morning Exercise",
    "type": "PHYSICAL",
    "status": "SCHEDULED",
    "startTime": "2024-12-29T08:00:00Z",
    "endTime": "2024-12-29T09:00:00Z",
    "participants": [...]
  }
]
```

### Get Analytics

```http
GET /api/organizations/{organizationId}/care-homes/{careHomeId}/activities/analytics
```

Retrieves comprehensive activity statistics.

#### Query Parameters

- `startDate` (optional): ISO 8601 datetime
- `endDate` (optional): ISO 8601 datetime
- `category` (optional): Activity type filter
- `timezone` (optional): IANA timezone string

#### Response

```json
{
  "total": "125",
  "completed": "100",
  "inProgress": "15",
  "scheduled": "8",
  "cancelled": "2",
  "participantCount": "450",
  "byCategory": {
    "PHYSICAL": "50",
    "SOCIAL": "30",
    "CREATIVE": "25",
    "COGNITIVE": "15",
    "SPIRITUAL": "5"
  },
  "averageDuration": "45",
  "completionRate": "80.00",
  "complianceRate": "95.50"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `400`: Invalid parameters
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Resource not found
- `500`: Server error

Error responses include details:

```json
{
  "error": "Invalid request parameters",
  "details": {
    "field": "startDate",
    "message": "Must be a valid ISO 8601 datetime"
  }
}
```

## Regional Support

The API handles regional requirements:

- Date/time formatting based on region
- Number formatting (decimal/thousand separators)
- Regional compliance rules
- Timezone-aware operations

Example regional headers:

```http
Content-Language: en-GB
Vary: Accept-Language
```

## Offline Support

The API supports offline operations through:

1. **Sync Protocol**:
   ```http
   ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
   Last-Modified: Wed, 29 Dec 2024 04:30:00 GMT
   ```

2. **Conflict Resolution**:
   - Version tracking
   - Server-wins strategy
   - Conflict audit logging

## Rate Limiting

Rate limits are enforced per organization:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1640750400
```

## Monitoring

The API provides monitoring through:

1. **Response Headers**:
   ```http
   X-Request-ID: 7b34f116-b29f-4146-b2f8-1551cedd92fa
   X-Runtime: 0.125
   ```

2. **Telemetry Integration**:
   - OpenTelemetry traces
   - Metrics collection
   - Error tracking

## Compliance

The API enforces compliance through:

1. **Data Validation**:
   - Schema validation
   - Business rule validation
   - Regional compliance checks

2. **Audit Logging**:
   - All operations logged
   - Compliance violations tracked
   - User actions recorded

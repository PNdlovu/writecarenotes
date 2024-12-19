# Organization API Documentation

## Overview
The Organization API provides endpoints for managing organizations within the Write Care Notes platform. It supports multi-tenant operations, care home management, analytics, and follows REST principles.

## Base URL
```
/api/organizations
```

## Authentication
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Get Organization
```http
GET /api/organizations/{id}
```

Retrieves organization details by ID.

#### Parameters
- `id` (path, required): Organization ID

#### Response
```typescript
{
  id: string
  name: string
  slug: string
  status: OrganizationStatus
  settings: OrganizationSettings
  contactDetails: {
    email: string
    phone: string
    address: object
  }
  careHomes: CareHome[]
}
```

### Get Organization by Slug
```http
GET /api/organizations/slug/{slug}
```

Retrieves organization details by slug.

#### Parameters
- `slug` (path, required): Organization slug

#### Response
Same as Get Organization

### List Organizations
```http
GET /api/organizations
```

Retrieves a list of organizations with optional filtering and pagination.

#### Query Parameters
- `status` (optional): Filter by organization status
- `skip` (optional): Number of records to skip
- `take` (optional): Number of records to take

#### Response
```typescript
Organization[]
```

### Create Organization
```http
POST /api/organizations
```

Creates a new organization.

#### Request Body
```typescript
{
  name: string
  slug: string
  settings: OrganizationSettings
  status?: OrganizationStatus
  contactDetails: {
    email: string
    phone: string
    address: object
  }
}
```

### Update Organization
```http
PUT /api/organizations/{id}
```

Updates an existing organization.

#### Parameters
- `id` (path, required): Organization ID

#### Request Body
```typescript
{
  name?: string
  settings?: OrganizationSettings
  status?: OrganizationStatus
  contactDetails?: {
    email: string
    phone: string
    address: object
  }
}
```

### Delete Organization
```http
DELETE /api/organizations/{id}
```

Deletes an organization.

#### Parameters
- `id` (path, required): Organization ID

### Add Care Home
```http
POST /api/organizations/{id}/care-homes
```

Adds a care home to an organization.

#### Parameters
- `id` (path, required): Organization ID
- `careHomeId` (body, required): ID of the care home to add

## Analytics Endpoints

### Get Organization Metrics
```http
GET /api/organizations/{id}/metrics
```

Retrieves analytics metrics for an organization.

#### Parameters
- `id` (path, required): Organization ID

#### Response
```typescript
{
  totalCareHomes: number
  totalResidents: number
  totalStaff: number
  averageOccupancy: number
  complianceScore: number
}
```

### Get Care Home Metrics
```http
GET /api/organizations/{id}/care-homes/metrics
```

Retrieves metrics for all care homes in an organization.

#### Parameters
- `id` (path, required): Organization ID

#### Response
```typescript
{
  careHomeId: string
  careHomeName: string
  metrics: {
    residents: number
    staff: number
    occupancy: number
    compliance: number
  }
}[]
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": { ... }
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Organization not found"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions"
}

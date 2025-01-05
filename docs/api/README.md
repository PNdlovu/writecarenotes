# WriteCare Notes API Documentation

## Overview

The WriteCare Notes API is a RESTful service that provides access to care home management functionality. The API supports multi-tenancy, versioning, and regional compliance requirements.

## Authentication

All API requests require authentication using JWT tokens. Tokens can be obtained through the authentication endpoints.

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## API Versioning

The API supports versioning through the URL path:

```
/api/v1/resource
/api/v2/resource
```

## Multi-Tenancy

Organization context is required for all requests. This can be provided through:

1. Subdomain: `organization.writecarenotes.com`
2. Custom domain: `care.organization.com`
3. Header: `x-organization-id: org_123`

## Regional Support

Regional settings are determined by:

1. Organization settings
2. User preferences
3. Request headers

Example:
```http
GET /api/residents
Accept-Language: cy
x-regulatory-body: CIW
```

## Endpoints

### Organizations

```http
# Create organization
POST /api/organizations

# Get organization
GET /api/organizations/{id}

# Update organization
PUT /api/organizations/{id}

# Delete organization
DELETE /api/organizations/{id}
```

### Users

```http
# Create user
POST /api/users

# Get user
GET /api/users/{id}

# Update user
PUT /api/users/{id}

# Delete user
DELETE /api/users/{id}
```

### Residents

```http
# Create resident
POST /api/residents

# Get resident
GET /api/residents/{id}

# Update resident
PUT /api/residents/{id}

# Delete resident
DELETE /api/residents/{id}
```

### Documents

```http
# Create document
POST /api/documents

# Get document
GET /api/documents/{id}

# Update document
PUT /api/documents/{id}

# Delete document
DELETE /api/documents/{id}
```

## Rate Limiting

API requests are rate limited based on:

- Organization subscription plan
- Endpoint type
- User role

Example limits:
```
Basic: 100 requests/minute
Professional: 1000 requests/minute
Enterprise: 10000 requests/minute
```

## Error Handling

All errors follow the standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "Additional information"
    }
  }
}
```

Common error codes:
- `AUTH_REQUIRED`: Authentication required
- `INVALID_CREDENTIALS`: Invalid credentials
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Permission denied
- `RATE_LIMITED`: Rate limit exceeded
- `VALIDATION_ERROR`: Invalid input data

## Data Models

### Organization
```typescript
interface Organization {
  id: string;
  name: string;
  type: 'CareHome' | 'DomiciliaryCare';
  status: 'Active' | 'Suspended' | 'Inactive';
  settings: {
    theme: ThemeSettings;
    features: FeatureFlags;
    compliance: ComplianceSettings;
    subscription: SubscriptionPlan;
  };
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  settings: UserSettings;
}
```

### Resident
```typescript
interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  organizationId: string;
  roomNumber?: string;
  status: ResidentStatus;
  careNeeds: CareNeeds;
}
```

## Webhooks

Webhooks can be configured for real-time notifications:

```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["resident.created", "document.signed"],
  "secret": "your-webhook-secret"
}
```

## SDK Support

Official SDKs are available for:

- JavaScript/TypeScript
- Python
- C#
- Java

Example (TypeScript):
```typescript
import { WriteCareClient } from '@writecare/sdk';

const client = new WriteCareClient({
  apiKey: 'your-api-key',
  organizationId: 'your-org-id'
});

const residents = await client.residents.list();
``` 
/**
 * @writecarenotes.com
 * @fileoverview Domiciliary Care API Endpoints
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoint documentation for the domiciliary care module, covering both desktop
 * and future mobile/tablet requirements.
 */

# Domiciliary Care API Endpoints

## Core Endpoints

### Client Management

#### Create Client
```typescript
POST /api/domiciliary/clients
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": string,
  "firstName": string,
  "lastName": string,
  "dateOfBirth": string,
  "nhsNumber": string?,
  "gender": Gender,
  "address": Address,
  "telephone": string?,
  "mobile": string?,
  "email": string?,
  "keySafeCode": string?,
  "accessNotes": string?,
  "directions": string?
}

Response: 201 Created
{
  "id": string,
  "status": "ENQUIRY",
  ...client details
}
```

#### Get Client
```typescript
GET /api/domiciliary/clients/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": string,
  "status": ClientStatus,
  ...client details,
  "carePackages": CarePackage[],
  "contacts": Contact[],
  "documents": Document[]
}
```

#### Update Client
```typescript
PUT /api/domiciliary/clients/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  ...updateable client fields
}

Response: 200 OK
{
  ...updated client details
}
```

### Care Package Management

#### Create Care Package
```typescript
POST /api/domiciliary/clients/{clientId}/packages
Content-Type: application/json
Authorization: Bearer {token}

{
  "startDate": string,
  "endDate": string?,
  "fundingType": FundingType,
  "weeklyHours": number,
  "costPerHour": number,
  "visitSchedules": VisitSchedule[],
  "careTasks": CareTask[],
  "medications": Medication[]
}

Response: 201 Created
{
  "id": string,
  "status": "DRAFT",
  ...package details
}
```

#### Get Care Package
```typescript
GET /api/domiciliary/packages/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": string,
  "status": PackageStatus,
  ...package details,
  "visits": Visit[],
  "reviews": Review[]
}
```

### Visit Management

#### Create Visit Schedule
```typescript
POST /api/domiciliary/packages/{packageId}/schedules
Content-Type: application/json
Authorization: Bearer {token}

{
  "dayOfWeek": number,
  "timeSlot": TimeSlot,
  "duration": number,
  "staffRequired": number,
  "tasks": string[],
  "skillsRequired": string[]
}

Response: 201 Created
{
  "id": string,
  ...schedule details
}
```

#### Get Staff Schedule
```typescript
GET /api/domiciliary/staff/{staffId}/schedule
Query Parameters:
  - date: string (YYYY-MM-DD)
  - range: number (days)
Authorization: Bearer {token}

Response: 200 OK
{
  "visits": Visit[],
  "availability": Availability[],
  "territory": Territory
}
```

## Desktop-Specific Endpoints

### Management Features

#### Dashboard Analytics
```typescript
GET /api/domiciliary/dashboard
Query Parameters:
  - period: string
  - metrics: string[]
Authorization: Bearer {token}

Response: 200 OK
{
  "clientMetrics": {
    "total": number,
    "active": number,
    "pending": number
  },
  "visitMetrics": {
    "scheduled": number,
    "completed": number,
    "missed": number
  },
  "staffMetrics": {
    "available": number,
    "onDuty": number,
    "utilization": number
  },
  "complianceMetrics": {
    "overdueReviews": number,
    "pendingTraining": number,
    "expiringDBS": number
  }
}
```

#### Route Optimization
```typescript
POST /api/domiciliary/routes/optimize
Content-Type: application/json
Authorization: Bearer {token}

{
  "date": string,
  "staff": string[],
  "visits": string[],
  "constraints": {
    "maxTravelTime": number,
    "breakRequirements": BreakRule[],
    "skillRequirements": boolean
  }
}

Response: 200 OK
{
  "routes": StaffRoute[],
  "unassignedVisits": Visit[],
  "warnings": Warning[]
}
```

#### Bulk Operations
```typescript
POST /api/domiciliary/bulk/reschedule
Content-Type: application/json
Authorization: Bearer {token}

{
  "visits": string[],
  "newDate": string,
  "keepTime": boolean,
  "notifyStaff": boolean,
  "notifyClients": boolean
}

Response: 200 OK
{
  "updated": number,
  "failed": number,
  "notifications": {
    "staff": number,
    "clients": number
  }
}
```

### Reporting

#### Generate Reports
```typescript
POST /api/domiciliary/reports/generate
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": ReportType,
  "period": {
    "start": string,
    "end": string
  },
  "filters": ReportFilter[],
  "format": "PDF" | "EXCEL" | "CSV"
}

Response: 200 OK
{
  "id": string,
  "url": string,
  "expiresAt": string
}
```

#### Compliance Reports
```typescript
GET /api/domiciliary/compliance/report
Query Parameters:
  - framework: string (CQC|CIW|RQIA|CI|HIQA)
  - period: string
Authorization: Bearer {token}

Response: 200 OK
{
  "overview": {
    "compliant": number,
    "partial": number,
    "nonCompliant": number
  },
  "categories": {
    [key: string]: {
      "status": ComplianceStatus,
      "evidence": Evidence[],
      "actions": Action[]
    }
  }
}
```

### Document Management

#### Upload Document
```typescript
POST /api/domiciliary/documents
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
  - file: File
  - type: DocumentType
  - entityType: string
  - entityId: string
  - tags: string[]

Response: 201 Created
{
  "id": string,
  "url": string,
  ...document details
}
```

#### Document Search
```typescript
GET /api/domiciliary/documents/search
Query Parameters:
  - query: string
  - type: DocumentType[]
  - dateRange: string
  - tags: string[]
Authorization: Bearer {token}

Response: 200 OK
{
  "total": number,
  "documents": Document[],
  "facets": {
    "types": TypeCount[],
    "tags": TagCount[]
  }
}
```

## Security Endpoints

### Audit Trail
```typescript
GET /api/domiciliary/audit
Query Parameters:
  - entityType: string
  - entityId: string
  - action: AuditAction[]
  - dateRange: string
  - user: string
Authorization: Bearer {token}

Response: 200 OK
{
  "total": number,
  "entries": AuditEntry[],
  "summary": {
    "actions": ActionCount[],
    "users": UserCount[]
  }
}
```

### Access Control
```typescript
POST /api/domiciliary/access/check
Content-Type: application/json
Authorization: Bearer {token}

{
  "resource": string,
  "action": string,
  "context": {
    "organizationId": string,
    "entityId": string
  }
}

Response: 200 OK
{
  "allowed": boolean,
  "restrictions": Restriction[]
}
```

## Notes

1. Authentication:
   - All endpoints require Bearer token authentication
   - Token must include appropriate scopes
   - Role-based access control enforced

2. Rate Limiting:
   - Standard rate limits apply
   - Bulk operations have lower limits
   - Report generation is throttled

3. Error Handling:
   - Standard HTTP status codes
   - Detailed error messages
   - Validation errors include field details

4. Pagination:
   - List endpoints support pagination
   - Default page size: 20
   - Maximum page size: 100

5. Caching:
   - GET requests may be cached
   - Cache headers included
   - ETags supported

6. Versioning:
   - Current version: v1
   - Version in URL path
   - Deprecation notices included 
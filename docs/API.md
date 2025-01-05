# Care Module API Documentation

## Core APIs

### Care Management

#### Create Care Record
```typescript
POST /api/care/records
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "person": {
    "name": "John Doe",
    "dateOfBirth": "2010-01-01",
    "careType": "childrens",
    // ... other person fields
  },
  "careDetails": {
    // Care type specific details
  }
}
```

#### Update Care Record
```typescript
PUT /api/care/records/:id
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "updates": {
    // Fields to update
  }
}
```

#### Get Care Record
```typescript
GET /api/care/records/:id
Authorization: Bearer <token>
X-Region: ENGLAND
```

### Staff Management

#### Register Staff
```typescript
POST /api/staff
Content-Type: application/json
Authorization: Bearer <token>

{
  "staff": {
    "name": "Jane Smith",
    "qualifications": ["Level 3 Diploma"],
    "dbs": {
      "number": "123456",
      "issueDate": "2023-01-01"
    },
    // ... other staff fields
  }
}
```

#### Update Staff Record
```typescript
PUT /api/staff/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "updates": {
    // Fields to update
  }
}
```

### Facility Management

#### Register Facility
```typescript
POST /api/facilities
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "facility": {
    "name": "Care Home Name",
    "type": "childrens",
    "registration": {
      "number": "SC123456",
      "issueDate": "2023-01-01"
    },
    // ... other facility fields
  }
}
```

#### Update Facility
```typescript
PUT /api/facilities/:id
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "updates": {
    // Fields to update
  }
}
```

## Validation APIs

### Care Validation
```typescript
POST /api/validate/care
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "person": {
    // Person details
  },
  "careType": "childrens",
  "region": "ENGLAND"
}
```

### Staff Validation
```typescript
POST /api/validate/staff
Content-Type: application/json
Authorization: Bearer <token>

{
  "staff": {
    // Staff details
  },
  "careType": "childrens"
}
```

### Facility Validation
```typescript
POST /api/validate/facility
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "facility": {
    // Facility details
  },
  "careType": "childrens",
  "region": "ENGLAND"
}
```

## Reporting APIs

### Generate Care Report
```typescript
POST /api/reports/care/:id
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "reportType": "full" | "summary" | "compliance",
  "dateRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}
```

### Generate Staff Report
```typescript
POST /api/reports/staff/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "reportType": "qualifications" | "training" | "compliance",
  "dateRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}
```

### Generate Facility Report
```typescript
POST /api/reports/facility/:id
Content-Type: application/json
Authorization: Bearer <token>
X-Region: ENGLAND

{
  "reportType": "compliance" | "inspection" | "maintenance",
  "dateRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}
```

## Security APIs

### Access Control
```typescript
POST /api/security/access
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user123",
  "resource": "care_records",
  "action": "read",
  "careType": "childrens",
  "region": "ENGLAND"
}
```

### Audit Log
```typescript
GET /api/security/audit
Authorization: Bearer <token>
X-Region: ENGLAND

Query Parameters:
- userId: string
- resource: string
- action: string
- startDate: string
- endDate: string
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "timestamp": "2023-12-27T12:00:00Z",
    "requestId": "req_123"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      // Additional error details
    }
  },
  "metadata": {
    "timestamp": "2023-12-27T12:00:00Z",
    "requestId": "req_123"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Authentication failed |
| AUTH_002 | Invalid token |
| AUTH_003 | Token expired |
| PERM_001 | Insufficient permissions |
| PERM_002 | Region access denied |
| VAL_001 | Validation failed |
| VAL_002 | Missing required fields |
| REG_001 | Registration required |
| REG_002 | Invalid registration |

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| /api/care/* | 100 requests/minute |
| /api/staff/* | 50 requests/minute |
| /api/facilities/* | 50 requests/minute |
| /api/validate/* | 200 requests/minute |
| /api/reports/* | 20 requests/minute |

## Best Practices

1. **Authentication**
   - Always include Authorization header
   - Refresh tokens before expiry
   - Use secure connection (HTTPS)

2. **Error Handling**
   - Handle all error responses
   - Implement proper retry logic
   - Log failed requests

3. **Data Validation**
   - Validate data before sending
   - Handle validation errors gracefully
   - Use proper data types

4. **Security**
   - Never send sensitive data in URL
   - Implement proper CORS policies
   - Follow least privilege principle

5. **Performance**
   - Implement caching where appropriate
   - Batch requests when possible
   - Monitor API usage

# Write Care Notes API Documentation

## API Overview
RESTful API for integrating Write Care Notes with enterprise systems and third-party applications.

## Authentication

### OAuth 2.0
```json
POST /oauth/token
{
    "grant_type": "client_credentials",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
}
```

### API Keys
- Production API Key
- Development API Key
- Sandbox Environment

## Endpoints

### Care Plans

#### List Care Plans
```http
GET /api/v1/care-plans
Authorization: Bearer {token}
```

#### Create Care Plan
```http
POST /api/v1/care-plans
Content-Type: application/json
Authorization: Bearer {token}

{
    "resident_id": "string",
    "plan_type": "string",
    "start_date": "date",
    "review_date": "date",
    "details": {}
}
```

### Residents

#### List Residents
```http
GET /api/v1/residents
Authorization: Bearer {token}
```

#### Create Resident
```http
POST /api/v1/residents
Content-Type: application/json
Authorization: Bearer {token}

{
    "first_name": "string",
    "last_name": "string",
    "date_of_birth": "date",
    "nhs_number": "string",
    "room_number": "string"
}
```

### Audits

#### List Audits
```http
GET /api/v1/audits
Authorization: Bearer {token}
```

#### Create Audit
```http
POST /api/v1/audits
Content-Type: application/json
Authorization: Bearer {token}

{
    "audit_type": "string",
    "auditor": "string",
    "date": "date",
    "findings": {}
}
```

## Webhooks

### Event Types
- care_plan.created
- care_plan.updated
- resident.admitted
- resident.discharged
- audit.completed

### Webhook Format
```json
{
    "event": "string",
    "timestamp": "datetime",
    "data": {}
}
```

## Data Models

### Care Plan
```typescript
interface CarePlan {
    id: string;
    resident_id: string;
    plan_type: string;
    start_date: Date;
    review_date: Date;
    details: {
        personal_care: object;
        medication: object;
        nutrition: object;
        mobility: object;
    };
    created_at: Date;
    updated_at: Date;
}
```

### Resident
```typescript
interface Resident {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    nhs_number: string;
    room_number: string;
    admission_date: Date;
    care_plans: CarePlan[];
    created_at: Date;
    updated_at: Date;
}
```

## Rate Limits
- Standard: 1000 requests/hour
- Enterprise: 10000 requests/hour
- Burst: 100 requests/minute

## Error Handling

### Error Codes
```json
{
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "429": "Too Many Requests",
    "500": "Internal Server Error"
}
```

### Error Response
```json
{
    "error": {
        "code": "string",
        "message": "string",
        "details": {}
    }
}
```

## Integration Examples

### Node.js
```javascript
const WriteCareSdk = require('writecare-node');
const client = new WriteCareSdk({
    apiKey: 'YOUR_API_KEY',
    environment: 'production'
});
```

### Python
```python
from writecare import WriteCareClient
client = WriteCareClient(
    api_key='YOUR_API_KEY',
    environment='production'
)
```

### C#
```csharp
using WriteCare.Client;
var client = new WriteCareClient(
    apiKey: "YOUR_API_KEY",
    environment: "production"
);
```

## Security

### Data Protection
- TLS 1.3 required
- Data encryption in transit
- API key rotation
- IP whitelisting
- Audit logging

### Compliance
- GDPR compliant
- NHS Data Security
- ISO 27001
- Cyber Essentials Plus

## Best Practices

### Performance
- Use compression
- Implement caching
- Batch requests
- Pagination
- Rate limiting

### Integration
- Error handling
- Retry logic
- Logging
- Monitoring
- Alerting

## Support

### Developer Resources
- SDK Documentation
- Code Examples
- Postman Collection
- OpenAPI Spec
- Integration Guide

### Contact
- API Support: api@writecarenotes.com
- Developer Portal: developers.writecarenotes.com
- Status Page: status.writecarenotes.com 
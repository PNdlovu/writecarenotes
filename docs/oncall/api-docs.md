# OnCall Module API Documentation

## Overview

The OnCall API provides programmatic access to call management, staff scheduling, recording management, and compliance tracking functionalities.

## Authentication

### Bearer Token
```http
Authorization: Bearer <your_token>
```

### API Keys
```http
X-API-Key: <your_api_key>
```

## Base URL
```
https://api.writecarenotes.com/v1/oncall
```

## Endpoints

### Call Management

#### Create Call
```http
POST /calls
```

**Request Body:**
```json
{
  "phoneNumber": "+447700900000",
  "region": "england",
  "priority": "normal",
  "metadata": {
    "caller_name": "John Doe",
    "location": "Ward A"
  }
}
```

**Response:**
```json
{
  "id": "call_123",
  "phoneNumber": "+447700900000",
  "region": "england",
  "priority": "normal",
  "status": "pending",
  "startTime": "2024-03-21T10:00:00Z",
  "metadata": {
    "caller_name": "John Doe",
    "location": "Ward A"
  },
  "createdAt": "2024-03-21T10:00:00Z",
  "updatedAt": "2024-03-21T10:00:00Z"
}
```

#### Update Call
```http
PATCH /calls/{call_id}
```

**Request Body:**
```json
{
  "status": "active",
  "metadata": {
    "assigned_staff": "staff_123"
  }
}
```

#### List Calls
```http
GET /calls
```

**Query Parameters:**
```
region: string
status: string
startDate: ISO8601
endDate: ISO8601
page: number
limit: number
```

### Staff Scheduling

#### Create Schedule
```http
POST /schedules
```

**Request Body:**
```json
{
  "staffId": "staff_123",
  "type": "regular",
  "startTime": "2024-03-21T09:00:00Z",
  "endTime": "2024-03-21T17:00:00Z",
  "metadata": {
    "location": "Main Building",
    "notes": "Coverage for evening shift"
  }
}
```

#### Update Schedule
```http
PATCH /schedules/{schedule_id}
```

**Request Body:**
```json
{
  "status": "completed",
  "metadata": {
    "handover_notes": "All tasks completed"
  }
}
```

#### List Schedules
```http
GET /schedules
```

**Query Parameters:**
```
staffId: string
status: string
startDate: ISO8601
endDate: ISO8601
page: number
limit: number
```

### Recording Management

#### Create Recording
```http
POST /recordings
```

**Request Body:**
```json
{
  "callId": "call_123",
  "url": "https://storage.example.com/recordings/1.mp3",
  "duration": 300,
  "metadata": {
    "format": "mp3",
    "size": "2.5MB"
  }
}
```

#### Update Recording
```http
PATCH /recordings/{recording_id}
```

**Request Body:**
```json
{
  "status": "completed",
  "duration": 360
}
```

#### List Recordings
```http
GET /recordings
```

**Query Parameters:**
```
callId: string
status: string
minDuration: number
maxDuration: number
page: number
limit: number
```

### Compliance Management

#### Create Compliance Record
```http
POST /compliance
```

**Request Body:**
```json
{
  "callId": "call_123",
  "region": "england",
  "regulatoryBody": "CQC",
  "checkType": "recording_retention",
  "details": {
    "retentionPeriod": "7 years",
    "encryptionLevel": "AES-256",
    "accessControls": ["role_based", "mfa_required"]
  }
}
```

#### Update Compliance Record
```http
PATCH /compliance/{compliance_id}
```

**Request Body:**
```json
{
  "status": "compliant",
  "details": {
    "lastChecked": "2024-03-21T10:00:00Z",
    "checkedBy": "compliance_officer_123"
  }
}
```

#### List Compliance Records
```http
GET /compliance
```

**Query Parameters:**
```
region: string
regulatoryBody: string
status: string
checkType: string
page: number
limit: number
```

## Error Handling

### Error Codes
```json
{
  "400": "Bad Request - Invalid parameters",
  "401": "Unauthorized - Invalid credentials",
  "403": "Forbidden - Insufficient permissions",
  "404": "Not Found - Resource doesn't exist",
  "409": "Conflict - Resource already exists",
  "422": "Unprocessable Entity - Validation failed",
  "429": "Too Many Requests - Rate limit exceeded",
  "500": "Internal Server Error",
  "503": "Service Unavailable"
}
```

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "Specific error details"
    }
  }
}
```

## Rate Limiting

### Limits
- 1000 requests per minute per API key
- 10,000 requests per hour per API key
- 100,000 requests per day per API key

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1616321400
```

## Webhooks

### Available Events
```json
{
  "call.created": "New call created",
  "call.updated": "Call status updated",
  "schedule.created": "New schedule created",
  "schedule.updated": "Schedule updated",
  "recording.created": "New recording created",
  "recording.completed": "Recording completed",
  "compliance.checked": "Compliance check completed",
  "compliance.violated": "Compliance violation detected"
}
```

### Webhook Format
```json
{
  "event": "call.created",
  "timestamp": "2024-03-21T10:00:00Z",
  "data": {
    "id": "call_123",
    "type": "call",
    "attributes": {
      // Event specific data
    }
  }
}
```

## Data Types

### Call
```typescript
interface Call {
  id: string;
  phoneNumber: string;
  region: Region;
  priority: Priority;
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  metadata: Record<string, any>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Schedule
```typescript
interface Schedule {
  id: string;
  staffId: string;
  type: ScheduleType;
  status: ScheduleStatus;
  startTime: Date;
  endTime: Date;
  metadata: Record<string, any>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Recording
```typescript
interface Recording {
  id: string;
  callId: string;
  url: string;
  duration: number;
  status: RecordingStatus;
  metadata: Record<string, any>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Compliance
```typescript
interface Compliance {
  id: string;
  callId: string;
  region: Region;
  regulatoryBody: string;
  status: ComplianceStatus;
  checkType: string;
  details: Record<string, any>;
  organizationId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## SDK Examples

### Node.js
```javascript
const { OnCallClient } = require('@writecarenotes/oncall');

const client = new OnCallClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create a call
const call = await client.calls.create({
  phoneNumber: '+447700900000',
  region: 'england',
  priority: 'normal'
});

// Update a schedule
const schedule = await client.schedules.update('schedule_123', {
  status: 'completed'
});
```

### Python
```python
from writecarenotes.oncall import OnCallClient

client = OnCallClient(
    api_key='your_api_key',
    environment='production'
)

# Create a recording
recording = client.recordings.create(
    call_id='call_123',
    url='https://storage.example.com/recordings/1.mp3',
    duration=300
)

# List compliance records
compliance_records = client.compliance.list(
    region='england',
    regulatory_body='CQC',
    status='compliant'
)
```

## Best Practices

1. **Authentication**
   - Rotate API keys regularly
   - Use environment variables
   - Implement key expiration
   - Monitor key usage
   - Revoke compromised keys

2. **Error Handling**
   - Implement retries
   - Handle rate limits
   - Log errors
   - Validate input
   - Handle timeouts

3. **Performance**
   - Use pagination
   - Implement caching
   - Batch requests
   - Optimize queries
   - Monitor response times

4. **Security**
   - Use HTTPS
   - Validate input
   - Sanitize output
   - Rate limit
   - Audit access

## Support

### Contact
- API Support: api-support@writecarenotes.com
- Documentation: docs@writecarenotes.com
- Emergency: +44 800 123 4567

### Resources
- API Status: status.writecarenotes.com
- Developer Portal: developers.writecarenotes.com
- API Console: console.writecarenotes.com
- GitHub: github.com/writecarenotes 
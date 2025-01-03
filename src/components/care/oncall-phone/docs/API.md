/**
 * @writecarenotes.com
 * @fileoverview On-Call Phone System API Documentation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

# On-Call Phone System API Documentation

## Core APIs

### Call Management

#### Handle Incoming Call
\`\`\`typescript
POST /api/calls/incoming
Content-Type: application/json

{
    "callerId": string,
    "timestamp": string,
    "priority": "emergency" | "urgent" | "normal" | "low"
}

Response: {
    "callId": string,
    "status": "routed" | "voicemail" | "failed",
    "routedTo": string | null,
    "recordingStarted": boolean
}
\`\`\`

#### End Call
\`\`\`typescript
POST /api/calls/{callId}/end
Content-Type: application/json

{
    "duration": number,
    "outcome": "completed" | "dropped" | "failed",
    "notes": string
}

Response: {
    "recordingUrl": string,
    "transcription": string | null,
    "duration": number
}
\`\`\`

### Schedule Management

#### Create Schedule
\`\`\`typescript
POST /api/schedules
Content-Type: application/json

{
    "staffId": string,
    "phoneNumber": string,
    "startTime": string,
    "endTime": string,
    "type": "primary" | "backup" | "emergency",
    "backupStaffId": string | null,
    "backupPhoneNumber": string | null
}

Response: {
    "scheduleId": string,
    "status": "active" | "pending",
    "conflicts": Array<{
        "type": string,
        "details": string
    }>
}
\`\`\`

#### Get Current Schedule
\`\`\`typescript
GET /api/schedules/current

Response: {
    "schedule": {
        "id": string,
        "staffId": string,
        "phoneNumber": string,
        "startTime": string,
        "endTime": string,
        "type": string,
        "backup": {
            "staffId": string | null,
            "phoneNumber": string | null
        }
    } | null
}
\`\`\`

### Recording Management

#### Start Recording
\`\`\`typescript
POST /api/recordings/start
Content-Type: application/json

{
    "callId": string,
    "format": "mp3" | "wav",
    "channelType": "mixed" | "separate"
}

Response: {
    "recordingId": string,
    "status": "started" | "failed",
    "error": string | null
}
\`\`\`

#### Stop Recording
\`\`\`typescript
POST /api/recordings/{recordingId}/stop

Response: {
    "url": string,
    "duration": number,
    "size": number,
    "format": string
}
\`\`\`

### Compliance APIs

#### Generate Audit Report
\`\`\`typescript
POST /api/compliance/audit
Content-Type: application/json

{
    "startDate": string,
    "endDate": string,
    "type": "CQC" | "Ofsted" | "Internal",
    "format": "pdf" | "csv" | "json"
}

Response: {
    "reportId": string,
    "url": string,
    "metrics": {
        "totalCalls": number,
        "averageResponseTime": number,
        "complianceScore": number
    }
}
\`\`\`

#### Get Call Records
\`\`\`typescript
GET /api/compliance/calls?startDate={date}&endDate={date}&type={type}

Response: {
    "records": Array<{
        "id": string,
        "timestamp": string,
        "duration": number,
        "type": string,
        "outcome": string,
        "compliance": {
            "recorded": boolean,
            "transcribed": boolean,
            "documented": boolean
        }
    }>,
    "pagination": {
        "total": number,
        "page": number,
        "pageSize": number
    }
}
\`\`\`

### Staff APIs

#### Update Availability
\`\`\`typescript
POST /api/staff/{staffId}/availability
Content-Type: application/json

{
    "available": boolean,
    "reason": string | null,
    "until": string | null
}

Response: {
    "status": "updated" | "failed",
    "currentSchedule": {
        "affected": boolean,
        "backup": string | null
    }
}
\`\`\`

#### Get Staff Schedule
\`\`\`typescript
GET /api/staff/{staffId}/schedule?month={YYYY-MM}

Response: {
    "schedules": Array<{
        "id": string,
        "type": string,
        "startTime": string,
        "endTime": string,
        "isBackup": boolean
    }>,
    "statistics": {
        "totalHours": number,
        "oncallCount": number,
        "backupCount": number
    }
}
\`\`\`

## Webhook APIs

### Call Status Updates
\`\`\`typescript
POST /webhooks/calls/status
Content-Type: application/json

{
    "callId": string,
    "status": "initiated" | "ringing" | "connected" | "completed" | "failed",
    "timestamp": string,
    "details": {
        "duration": number | null,
        "errorCode": string | null,
        "errorMessage": string | null
    }
}

Response: {
    "received": boolean,
    "processed": boolean
}
\`\`\`

### Recording Status
\`\`\`typescript
POST /webhooks/recordings/status
Content-Type: application/json

{
    "recordingId": string,
    "status": "started" | "completed" | "failed",
    "url": string | null,
    "error": string | null
}

Response: {
    "received": boolean,
    "processed": boolean
}
\`\`\`

## Error Handling

### Error Response Format
\`\`\`typescript
{
    "error": {
        "code": string,
        "message": string,
        "details": any,
        "timestamp": string,
        "requestId": string
    }
}
\`\`\`

### Common Error Codes
- \`INVALID_REQUEST\`: Request validation failed
- \`UNAUTHORIZED\`: Authentication required
- \`FORBIDDEN\`: Insufficient permissions
- \`NOT_FOUND\`: Resource not found
- \`CONFLICT\`: Resource conflict
- \`INTERNAL_ERROR\`: Server error

## Rate Limits

### Default Limits
- Authentication: 100 requests/minute
- Call Management: 300 requests/minute
- Schedule Management: 100 requests/minute
- Recording Management: 200 requests/minute
- Compliance APIs: 50 requests/minute

### Headers
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1616161616
\`\`\`

## Authentication

### Bearer Token
\`\`\`
Authorization: Bearer <token>
\`\`\`

### API Key
\`\`\`
X-API-Key: <api_key>
\`\`\`

## Versioning

### Version Header
\`\`\`
Accept: application/json; version=1.0
\`\`\`

### URL Versioning
\`\`\`
/api/v1/calls
/api/v2/calls
\`\`\` 
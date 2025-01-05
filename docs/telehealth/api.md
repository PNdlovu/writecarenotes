# Write Care Notes - Telehealth API Reference

## Overview

This document provides detailed API documentation for the Write Care Notes Telehealth module. The API follows REST principles and uses JSON for request/response payloads.

## Authentication

All API requests must include an authentication token in the Authorization header:

```http
Authorization: Bearer <your_token>
```

### Obtaining a Token

```http
POST /api/auth/token
Content-Type: application/json

{
  "clientId": "your_client_id",
  "clientSecret": "your_client_secret",
  "grantType": "client_credentials"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "scope": "telehealth.full"
}
```

## API Endpoints

### Consultations

#### Create Consultation

```http
POST /api/telehealth/consultations
Content-Type: application/json

{
  "patientId": "patient-123",
  "providerId": "provider-456",
  "type": "ROUTINE",
  "scheduledTime": "2024-03-21T14:30:00Z",
  "duration": 30,
  "metadata": {
    "priority": "normal",
    "department": "general",
    "notes": "Follow-up consultation"
  }
}
```

Response:
```json
{
  "id": "consultation-789",
  "status": "SCHEDULED",
  "patientId": "patient-123",
  "providerId": "provider-456",
  "type": "ROUTINE",
  "scheduledTime": "2024-03-21T14:30:00Z",
  "duration": 30,
  "metadata": {
    "priority": "normal",
    "department": "general",
    "notes": "Follow-up consultation"
  },
  "createdAt": "2024-03-20T10:15:00Z",
  "updatedAt": "2024-03-20T10:15:00Z"
}
```

#### Get Consultation

```http
GET /api/telehealth/consultations/{consultationId}
```

Response:
```json
{
  "id": "consultation-789",
  "status": "SCHEDULED",
  "patientId": "patient-123",
  "providerId": "provider-456",
  "type": "ROUTINE",
  "scheduledTime": "2024-03-21T14:30:00Z",
  "duration": 30,
  "metadata": {
    "priority": "normal",
    "department": "general",
    "notes": "Follow-up consultation"
  },
  "createdAt": "2024-03-20T10:15:00Z",
  "updatedAt": "2024-03-20T10:15:00Z"
}
```

#### List Consultations

```http
GET /api/telehealth/consultations?status=SCHEDULED&from=2024-03-01&to=2024-03-31
```

Response:
```json
{
  "items": [
    {
      "id": "consultation-789",
      "status": "SCHEDULED",
      "patientId": "patient-123",
      "providerId": "provider-456",
      "type": "ROUTINE",
      "scheduledTime": "2024-03-21T14:30:00Z",
      "duration": 30,
      "metadata": {
        "priority": "normal",
        "department": "general",
        "notes": "Follow-up consultation"
      },
      "createdAt": "2024-03-20T10:15:00Z",
      "updatedAt": "2024-03-20T10:15:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

#### Update Consultation

```http
PATCH /api/telehealth/consultations/{consultationId}
Content-Type: application/json

{
  "status": "CANCELLED",
  "metadata": {
    "cancellationReason": "Patient request"
  }
}
```

Response:
```json
{
  "id": "consultation-789",
  "status": "CANCELLED",
  "patientId": "patient-123",
  "providerId": "provider-456",
  "type": "ROUTINE",
  "scheduledTime": "2024-03-21T14:30:00Z",
  "duration": 30,
  "metadata": {
    "priority": "normal",
    "department": "general",
    "notes": "Follow-up consultation",
    "cancellationReason": "Patient request"
  },
  "createdAt": "2024-03-20T10:15:00Z",
  "updatedAt": "2024-03-20T11:30:00Z"
}
```

### Video Sessions

#### Create Video Session

```http
POST /api/telehealth/video-sessions
Content-Type: application/json

{
  "consultationId": "consultation-789",
  "participants": [
    {
      "id": "provider-456",
      "role": "PROVIDER",
      "permissions": ["AUDIO", "VIDEO", "SHARE_SCREEN"]
    },
    {
      "id": "patient-123",
      "role": "PATIENT",
      "permissions": ["AUDIO", "VIDEO"]
    }
  ],
  "config": {
    "quality": "HD",
    "recording": true,
    "maxDuration": 3600
  }
}
```

Response:
```json
{
  "id": "session-123",
  "status": "CREATED",
  "consultationId": "consultation-789",
  "participants": [
    {
      "id": "provider-456",
      "role": "PROVIDER",
      "permissions": ["AUDIO", "VIDEO", "SHARE_SCREEN"],
      "status": "INVITED"
    },
    {
      "id": "patient-123",
      "role": "PATIENT",
      "permissions": ["AUDIO", "VIDEO"],
      "status": "INVITED"
    }
  ],
  "config": {
    "quality": "HD",
    "recording": true,
    "maxDuration": 3600
  },
  "createdAt": "2024-03-21T14:25:00Z",
  "updatedAt": "2024-03-21T14:25:00Z"
}
```

#### Join Video Session

```http
POST /api/telehealth/video-sessions/{sessionId}/join
Content-Type: application/json

{
  "participantId": "provider-456",
  "deviceInfo": {
    "type": "desktop",
    "browser": "chrome",
    "version": "122.0.0"
  }
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "iceServers": [
    {
      "urls": ["stun:stun.writecarenotes.com:3478"],
      "username": "user",
      "credential": "pass"
    }
  ],
  "participant": {
    "id": "provider-456",
    "role": "PROVIDER",
    "permissions": ["AUDIO", "VIDEO", "SHARE_SCREEN"],
    "status": "JOINED"
  },
  "session": {
    "id": "session-123",
    "status": "ACTIVE",
    "participants": [
      {
        "id": "provider-456",
        "role": "PROVIDER",
        "status": "JOINED"
      },
      {
        "id": "patient-123",
        "role": "PATIENT",
        "status": "INVITED"
      }
    ]
  }
}
```

#### End Video Session

```http
POST /api/telehealth/video-sessions/{sessionId}/end
Content-Type: application/json

{
  "reason": "COMPLETED"
}
```

Response:
```json
{
  "id": "session-123",
  "status": "ENDED",
  "endedAt": "2024-03-21T15:30:00Z",
  "reason": "COMPLETED",
  "duration": 3600,
  "recording": {
    "status": "PROCESSING",
    "estimatedAvailability": "2024-03-21T15:35:00Z"
  }
}
```

### Health Monitoring

#### Start Monitoring

```http
POST /api/telehealth/monitoring
Content-Type: application/json

{
  "patientId": "patient-123",
  "deviceId": "device-789",
  "metrics": [
    "HEART_RATE",
    "BLOOD_PRESSURE",
    "TEMPERATURE"
  ],
  "config": {
    "interval": 300,
    "alertThresholds": {
      "HEART_RATE": {
        "min": 60,
        "max": 100
      },
      "TEMPERATURE": {
        "min": 36.5,
        "max": 37.5
      }
    }
  }
}
```

Response:
```json
{
  "id": "monitoring-456",
  "status": "ACTIVE",
  "patientId": "patient-123",
  "deviceId": "device-789",
  "metrics": [
    "HEART_RATE",
    "BLOOD_PRESSURE",
    "TEMPERATURE"
  ],
  "config": {
    "interval": 300,
    "alertThresholds": {
      "HEART_RATE": {
        "min": 60,
        "max": 100
      },
      "TEMPERATURE": {
        "min": 36.5,
        "max": 37.5
      }
    }
  },
  "startedAt": "2024-03-21T14:00:00Z"
}
```

#### Submit Reading

```http
POST /api/telehealth/monitoring/{monitoringId}/readings
Content-Type: application/json

{
  "metric": "HEART_RATE",
  "value": 75,
  "unit": "BPM",
  "timestamp": "2024-03-21T14:05:00Z",
  "metadata": {
    "quality": "HIGH",
    "position": "SITTING"
  }
}
```

Response:
```json
{
  "id": "reading-789",
  "monitoringId": "monitoring-456",
  "metric": "HEART_RATE",
  "value": 75,
  "unit": "BPM",
  "timestamp": "2024-03-21T14:05:00Z",
  "metadata": {
    "quality": "HIGH",
    "position": "SITTING"
  },
  "status": "VALIDATED",
  "alerts": []
}
```

#### Get Readings

```http
GET /api/telehealth/monitoring/{monitoringId}/readings?metric=HEART_RATE&from=2024-03-21T00:00:00Z&to=2024-03-21T23:59:59Z
```

Response:
```json
{
  "items": [
    {
      "id": "reading-789",
      "monitoringId": "monitoring-456",
      "metric": "HEART_RATE",
      "value": 75,
      "unit": "BPM",
      "timestamp": "2024-03-21T14:05:00Z",
      "metadata": {
        "quality": "HIGH",
        "position": "SITTING"
      },
      "status": "VALIDATED",
      "alerts": []
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

### Documents

#### Create Document

```http
POST /api/telehealth/documents
Content-Type: application/json

{
  "type": "PRESCRIPTION",
  "consultationId": "consultation-789",
  "content": {
    "medications": [
      {
        "name": "Medication A",
        "dosage": "10mg",
        "frequency": "twice daily",
        "duration": "7 days"
      }
    ],
    "instructions": "Take with food",
    "prescribedBy": "Dr. Smith"
  },
  "metadata": {
    "urgent": false,
    "department": "general"
  }
}
```

Response:
```json
{
  "id": "document-123",
  "type": "PRESCRIPTION",
  "consultationId": "consultation-789",
  "status": "DRAFT",
  "content": {
    "medications": [
      {
        "name": "Medication A",
        "dosage": "10mg",
        "frequency": "twice daily",
        "duration": "7 days"
      }
    ],
    "instructions": "Take with food",
    "prescribedBy": "Dr. Smith"
  },
  "metadata": {
    "urgent": false,
    "department": "general"
  },
  "createdAt": "2024-03-21T15:45:00Z",
  "updatedAt": "2024-03-21T15:45:00Z"
}
```

#### Sign Document

```http
POST /api/telehealth/documents/{documentId}/sign
Content-Type: application/json

{
  "signerId": "provider-456",
  "method": "DIGITAL",
  "certificate": {
    "type": "NHS_SMART_CARD",
    "id": "nhs-123"
  }
}
```

Response:
```json
{
  "id": "document-123",
  "status": "SIGNED",
  "signature": {
    "signerId": "provider-456",
    "method": "DIGITAL",
    "timestamp": "2024-03-21T15:50:00Z",
    "certificate": {
      "type": "NHS_SMART_CARD",
      "id": "nhs-123",
      "verified": true
    }
  },
  "updatedAt": "2024-03-21T15:50:00Z"
}
```

### Health Check

#### Get Health Status

```http
GET /api/telehealth/health
```

Response:
```json
{
  "status": "HEALTHY",
  "version": "1.0.0",
  "timestamp": "2024-03-21T16:00:00Z",
  "region": "UK_CQC",
  "components": {
    "api": {
      "status": "HEALTHY",
      "latency": 45
    },
    "video": {
      "status": "HEALTHY",
      "latency": 120
    },
    "monitoring": {
      "status": "HEALTHY",
      "latency": 78
    },
    "database": {
      "status": "HEALTHY",
      "latency": 15
    }
  },
  "metrics": {
    "requestRate": 150,
    "errorRate": 0.01,
    "responseTime": {
      "p50": 85,
      "p95": 150,
      "p99": 200
    }
  }
}
```

## WebSocket Events

### Connection

```javascript
const ws = new WebSocket('wss://api.writecarenotes.com/telehealth/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'AUTH',
    token: 'your_token'
  }));
};
```

### Event Types

#### Video Session Events

```javascript
// Participant joined
{
  "type": "VIDEO_PARTICIPANT_JOINED",
  "sessionId": "session-123",
  "participant": {
    "id": "patient-123",
    "role": "PATIENT",
    "status": "JOINED"
  },
  "timestamp": "2024-03-21T14:35:00Z"
}

// Participant left
{
  "type": "VIDEO_PARTICIPANT_LEFT",
  "sessionId": "session-123",
  "participant": {
    "id": "patient-123",
    "role": "PATIENT",
    "status": "LEFT"
  },
  "timestamp": "2024-03-21T15:30:00Z"
}

// Connection quality
{
  "type": "VIDEO_QUALITY",
  "sessionId": "session-123",
  "participantId": "patient-123",
  "metrics": {
    "bitrate": 500000,
    "packetLoss": 0.01,
    "latency": 150
  },
  "timestamp": "2024-03-21T14:40:00Z"
}
```

#### Monitoring Events

```javascript
// New reading
{
  "type": "MONITORING_READING",
  "monitoringId": "monitoring-456",
  "reading": {
    "metric": "HEART_RATE",
    "value": 75,
    "unit": "BPM",
    "timestamp": "2024-03-21T14:05:00Z"
  }
}

// Alert triggered
{
  "type": "MONITORING_ALERT",
  "monitoringId": "monitoring-456",
  "alert": {
    "metric": "HEART_RATE",
    "value": 110,
    "threshold": 100,
    "severity": "HIGH",
    "timestamp": "2024-03-21T14:10:00Z"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "scheduledTime",
      "reason": "Must be in the future"
    },
    "requestId": "req-123",
    "timestamp": "2024-03-21T16:15:00Z"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request parameters
- `AUTHORIZATION_ERROR`: Invalid or missing authentication
- `PERMISSION_ERROR`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RATE_LIMIT_ERROR`: Too many requests
- `COMPLIANCE_ERROR`: Operation violates compliance rules
- `TECHNICAL_ERROR`: Internal server error

### Rate Limiting

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1711036800
```

## Support

### Technical Support
- Email: support@writecarenotes.com
- Phone: +44 800 123 4567
- Hours: 24/7

### Documentation
- Integration Guide: https://docs.writecarenotes.com/integration
- SDK Reference: https://docs.writecarenotes.com/sdk
- Compliance Guide: https://docs.writecarenotes.com/compliance

### Community
- GitHub: https://github.com/writecarenotes
- Discord: https://discord.gg/writecarenotes
- Stack Overflow: https://stackoverflow.com/questions/tagged/writecarenotes 
# Telehealth API Documentation

## Overview
The Telehealth API provides endpoints for managing remote medical consultations, video sessions, document management, and analytics in a care home setting.

## Base URL
```
/api/telehealth
```

## Authentication
All endpoints require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Create Consultation
Create a new remote consultation request.

**POST** `/consultations`

**Request Body:**
```json
{
  "careHomeId": "string",
  "data": {
    "residentId": "string",
    "type": "GP" | "PHARMACIST" | "SPECIALIST",
    "urgency": "ROUTINE" | "URGENT" | "EMERGENCY",
    "reason": "string",
    "preferredTime": "string (optional)",
    "participants": [
      {
        "id": "string",
        "role": "GP" | "PHARMACIST" | "SPECIALIST" | "CARE_STAFF" | "RESIDENT",
        "name": "string",
        "email": "string (optional)"
      }
    ]
  }
}
```

**Response:** (201 Created)
```json
{
  "id": "string",
  "status": "PENDING",
  "createdAt": "string (ISO date)",
  ...request data
}
```

### Initiate Video Session
Start a video consultation session.

**POST** `/video-sessions`

**Request Body:**
```json
{
  "consultationId": "string",
  "participants": [
    {
      "id": "string",
      "role": "string"
    }
  ]
}
```

**Response:** (201 Created)
```json
{
  "id": "string",
  "roomId": "string",
  "status": "WAITING",
  "participants": [
    {
      "id": "string",
      "role": "string",
      "connectionStatus": "DISCONNECTED",
      "audioEnabled": false,
      "videoEnabled": false
    }
  ]
}
```

### Upload Document
Upload a document related to a consultation.

**POST** `/documents`

**Headers:**
```
Content-Type: application/pdf | image/jpeg | ...
```

**Request Body:**
```json
{
  "consultationId": "string (optional)",
  "residentId": "string",
  "type": "PRESCRIPTION" | "LAB_RESULT" | "MEDICAL_RECORD" | "CONSENT_FORM" | "OTHER",
  "title": "string",
  "content": "base64 string"
}
```

**Response:** (201 Created)
```json
{
  "id": "string",
  "status": "DRAFT",
  "createdAt": "string (ISO date)",
  ...request data
}
```

### Generate Report
Generate a usage report for telehealth services.

**POST** `/reports`

**Request Body:**
```json
{
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "period": "DAILY" | "WEEKLY" | "MONTHLY"
}
```

**Response:** (200 OK)
```json
{
  "id": "string",
  "period": "string",
  "metrics": {
    "consultations": {
      "totalConsultations": number,
      "averageDuration": number,
      "completionRate": number,
      "cancellationRate": number,
      "byType": {
        [key: string]: number
      },
      "byUrgency": {
        [key: string]: number
      }
    },
    "providers": [
      {
        "providerId": "string",
        "consultationCount": number,
        "averageRating": number,
        "responseTime": number,
        "completionRate": number,
        "specialties": string[]
      }
    ],
    "technicalStats": {
      "videoQuality": {
        "averageBitrate": number,
        "averageFrameRate": number,
        "disconnections": number
      },
      "documentStats": {
        "totalDocuments": number,
        "signedDocuments": number,
        "averageSigningTime": number
      }
    }
  }
}
```

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional information
}
```

### Common Error Codes
- `INVALID_INPUT`: Request validation failed
- `UNAUTHORIZED`: Access denied
- `NOT_FOUND`: Requested resource not found
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
API requests are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per user

## Security
- All endpoints require authentication
- Data is encrypted in transit (HTTPS)
- Sensitive data is encrypted at rest
- Access logs are maintained for audit purposes
- HIPAA compliance is enforced

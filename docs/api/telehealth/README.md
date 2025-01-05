# Write Care Notes - Telehealth API Documentation

## Overview

The Telehealth API provides secure, compliant video consultations and document management for healthcare providers and children's services across the UK and Ireland.

## Features

- Remote consultations
- Video sessions
- Document management
- Offline support
- Multi-region compliance
- GDPR compliance
- Performance monitoring
- Network quality optimization

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_token>
```

## Regional Support

Specify the region in request headers:

```http
x-region: GB  # England
x-region: WLS # Wales
x-region: SCT # Scotland
x-region: NIR # Northern Ireland
x-region: IRL # Republic of Ireland
```

## Service Type

Specify the service type for appropriate regulatory compliance:

```http
x-service-type: children    # For Ofsted regulated services
x-service-type: adult-care  # For CQC/CIW/RQIA/HIQA regulated services
```

## Language Support

Specify preferred language:

```http
accept-language: en-GB  # British English
accept-language: cy     # Welsh
accept-language: gd     # Scottish Gaelic
accept-language: ga     # Irish
```

## Performance Monitoring

All responses include performance monitoring headers:

```http
X-Response-Time: <milliseconds>
X-Network-Quality: high|medium|low
X-Video-Quality: 1080p|720p|480p
```

## Endpoints

### Create Consultation

```http
POST /api/telehealth/consultation
```

Creates a new telehealth consultation.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
x-region: <region_code>
x-service-type: <service_type>
accept-language: <language_code>
```

#### Request Body
```json
{
  "careHomeId": "string",
  "data": {
    "type": "routine|emergency|followup",
    "patientId": "string",
    "scheduledTime": "2024-12-30T10:00:00Z",
    "duration": 30,
    "participants": [
      {
        "id": "string",
        "role": "doctor|nurse|caregiver|family|social_worker"
      }
    ],
    "notes": "string",
    "safeguardingConcerns": {
      "identified": boolean,
      "details": "string",
      "actionRequired": boolean
    }
  }
}
```

#### Response
```json
{
  "id": "string",
  "status": "scheduled",
  "joinUrl": "string",
  "createdAt": "2024-12-30T10:00:00Z",
  "videoSettings": {
    "quality": "1080p|720p|480p",
    "bandwidth": "number",
    "optimizations": ["string"]
  },
  "metadata": {
    "region": "GB",
    "careHomeId": "string",
    "type": "routine",
    "regulatoryBody": "OFSTED|CQC|CIW|RQIA|HIQA"
  }
}
```

### Initialize Video Session

```http
POST /api/telehealth/video-session
```

Initializes a video consultation session.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
x-region: <region_code>
accept-language: <language_code>
```

#### Request Body
```json
{
  "consultationId": "string",
  "participants": [
    {
      "id": "string",
      "role": "string",
      "name": "string"
    }
  ]
}
```

#### Response
```json
{
  "id": "string",
  "status": "active",
  "sessionToken": "string",
  "participants": [
    {
      "id": "string",
      "connectionStatus": "connected|waiting|disconnected"
    }
  ]
}
```

### Upload Document

```http
POST /api/telehealth/document
```

Uploads a document related to a consultation.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
x-region: <region_code>
accept-language: <language_code>
```

#### Request Body
```json
{
  "consultationId": "string",
  "residentId": "string",
  "type": "prescription|notes|report",
  "title": "string",
  "content": "base64_string"
}
```

#### Response
```json
{
  "id": "string",
  "status": "processed",
  "url": "string",
  "metadata": {
    "type": "string",
    "title": "string",
    "uploadedBy": "string",
    "timestamp": "2024-12-30T10:00:00Z"
  }
}
```

### Health Check

```http
GET /api/telehealth/health
```

Checks the health status of the telehealth service.

#### Response
```json
{
  "service": "telehealth",
  "status": "healthy|degraded|unhealthy",
  "region": "GB",
  "timestamp": "2024-12-30T10:00:00Z",
  "components": {
    "video": {
      "healthy": true,
      "latency": 150
    },
    "telehealth": {
      "healthy": true,
      "latency": 50
    }
  },
  "version": "1.0.0"
}
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "error": "string",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `INVALID_REQUEST`: Request validation failed
- `UNAUTHORIZED`: Authentication failed
- `FORBIDDEN`: Permission denied
- `NOT_FOUND`: Resource not found
- `COMPLIANCE_ERROR`: Regional compliance check failed
- `SERVICE_ERROR`: Internal service error

## Rate Limiting

- Consultations: 100 requests per minute
- Video Sessions: 50 requests per minute
- Documents: 100 requests per minute

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Offline Support

The API supports offline operations through:
1. Service Worker caching
2. IndexedDB for offline data storage
3. Request queuing for offline operations
4. Background sync when online
5. Conflict resolution
6. Offline-first architecture

## GDPR Compliance

All responses include GDPR compliance headers:
```http
X-Data-Processing-Basis: legitimate-interest|consent
X-Data-Retention-Period: 7-years|30-days
X-Data-Protection-Officer: dpo@writecarenotes.com
```

## Regional Compliance

Each region has specific compliance requirements:

### England - Children's Services (Ofsted)
- Mandatory safeguarding checks
- Enhanced DBS verification
- Session recording requirements
- 25-year data retention
- Incident reporting protocols
- Multi-agency collaboration support

### England - Adult Care (CQC)
- Video quality requirements
- Session recording rules
- 7-year data retention
- Care plan integration

### Wales (CIW)
- Welsh language support
- Specific consent requirements
- Documentation standards
- Bilingual reporting

### Scotland (Care Inspectorate)
- Scottish healthcare guidelines
- Remote consultation protocols
- Data protection requirements
- Local authority integration

### Northern Ireland (RQIA)
- Cross-border consultation rules
- Specific documentation requirements
- Patient consent protocols
- All-Ireland compatibility

### Republic of Ireland (HIQA)
- Irish healthcare standards
- Data protection requirements
- Language support requirements
- Cross-border care support

## Performance Optimization

The API automatically optimizes video quality based on network conditions:

### Network Quality Tiers
```json
{
  "high": {
    "video": "1080p",
    "fps": 30,
    "bandwidth": "4mbps"
  },
  "medium": {
    "video": "720p",
    "fps": 25,
    "bandwidth": "2mbps"
  },
  "low": {
    "video": "480p",
    "fps": 20,
    "bandwidth": "1mbps"
  }
}
```

### Monitoring Metrics
- Response time
- Network latency
- Video quality
- Connection stability
- Bandwidth usage
- Error rates

## Testing

The API includes comprehensive testing:

### Unit Tests
- API endpoint validation
- Compliance checks
- Data validation
- Error handling

### Integration Tests
- Multi-region support
- Language handling
- Offline capabilities
- Performance monitoring

### E2E Tests
- Video consultation flow
- Document management
- Offline synchronization
- Cross-browser compatibility

## Security & Compliance

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Multi-factor authentication support
- Session management

### Data Protection
- End-to-end encryption
- At-rest encryption
- GDPR compliance
- Regional data protection

### Audit & Monitoring
- Comprehensive audit logs
- Real-time monitoring
- Performance metrics
- Compliance alerts 
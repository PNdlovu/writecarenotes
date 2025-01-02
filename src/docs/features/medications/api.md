# Medication Management API Documentation

## Overview
The Medication Management API provides comprehensive endpoints for managing medications in care homes across the UK and Ireland. This API supports multi-tenancy, role-based access control, and regional compliance requirements.

## Authentication
All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Base URL
```
https://api.wsapp.com/v1/medications
```

## Endpoints

### Medication Management

#### List Medications
```http
GET /medications
```

Query Parameters:
- `residentId` (string, optional): Filter by resident
- `careHomeId` (string, optional): Filter by care home
- `active` (boolean, optional): Filter by active status

Response:
```json
{
  "medications": [
    {
      "id": "string",
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "active": boolean,
      "residentId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "pageSize": number
  }
}
```

#### Get Medication
```http
GET /medications/{id}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "dosage": "string",
  "frequency": "string",
  "active": boolean,
  "residentId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Create Medication
```http
POST /medications
```

Request Body:
```json
{
  "name": "string",
  "dosage": "string",
  "frequency": "string",
  "residentId": "string",
  "startDate": "datetime",
  "endDate": "datetime",
  "instructions": "string"
}
```

#### Update Medication
```http
PUT /medications/{id}
```

Request Body:
```json
{
  "dosage": "string",
  "frequency": "string",
  "active": boolean,
  "instructions": "string"
}
```

### Administration

#### Record Administration
```http
POST /medications/{id}/administrations
```

Request Body:
```json
{
  "scheduledTime": "datetime",
  "actualTime": "datetime",
  "status": "GIVEN | MISSED | REFUSED",
  "notes": "string"
}
```

### Analytics

#### Get Resident Analytics
```http
GET /analytics/resident/{residentId}
```

Response:
```json
{
  "medications": {
    "total": number,
    "active": number,
    "prn": number
  },
  "administrations": {
    "compliance": number,
    "missed": number,
    "refused": number
  },
  "trends": {
    "weekly": [],
    "monthly": []
  }
}
```

### Safety

#### Check Interactions
```http
GET /safety/interactions
```

Query Parameters:
- `medications` (array): List of medication IDs

Response:
```json
{
  "interactions": [
    {
      "severity": "LOW | MEDIUM | HIGH",
      "description": "string",
      "medications": ["string"],
      "recommendations": ["string"]
    }
  ]
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input
- `SUBSCRIPTION_ERROR`: Subscription limit reached
- `INTEGRATION_ERROR`: External service error

## Rate Limiting
- Basic tier: 100 requests/minute
- Professional tier: 1000 requests/minute
- Enterprise tier: Customizable

## Webhooks
Configure webhooks to receive real-time updates:

```http
POST /webhooks
```

Request Body:
```json
{
  "url": "string",
  "events": ["MEDICATION_CREATED", "ADMINISTRATION_RECORDED"],
  "secret": "string"
}
```

## Best Practices
1. Use appropriate HTTP methods
2. Include error handling
3. Implement retry logic
4. Cache responses when appropriate
5. Use webhook events for real-time updates

## Support
For API support, contact:
- Email: api-support@wsapp.com
- Documentation: https://docs.wsapp.com/api/medications
- Status: https://status.wsapp.com

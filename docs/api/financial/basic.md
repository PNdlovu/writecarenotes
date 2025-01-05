# Financial Module API Documentation

## Overview

The Financial Module provides a comprehensive set of APIs for managing financial operations within the WriteNotes platform. This includes currency operations, financial reporting, and regulatory compliance across different regions.

## Base URL

```
https://api.writecarenotes.com/financial/v1
```

## Authentication

All API requests require authentication using either OAuth 2.0 or API keys. Include the authentication token in the Authorization header:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Parameters

All endpoints accept the following common parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | string | The ID of the organization |
| locale | string | The locale for formatting (e.g., en-GB, en-IE) |
| currency | string | The preferred currency for responses |

## Endpoints

### Currency Operations

#### Get Exchange Rate

```http
GET /currency/rate
  ?from=GBP
  &to=EUR
```

Response:
```json
{
  "from": "GBP",
  "to": "EUR",
  "rate": 1.17,
  "timestamp": "2024-03-21T10:00:00Z"
}
```

#### Convert Amount

```http
POST /currency/convert
Content-Type: application/json

{
  "amount": 1000.00,
  "from": "GBP",
  "to": "EUR"
}
```

Response:
```json
{
  "original": {
    "amount": 1000.00,
    "currency": "GBP"
  },
  "converted": {
    "amount": 1170.00,
    "currency": "EUR"
  },
  "rate": 1.17,
  "timestamp": "2024-03-21T10:00:00Z"
}
```

### Financial Reports

#### Generate Report

```http
POST /reports/generate
Content-Type: application/json

{
  "type": "financial_summary",
  "period": "2024-03",
  "format": "pdf",
  "template": "regulatory"
}
```

Response:
```json
{
  "id": "report_123",
  "status": "processing",
  "estimated_completion": "2024-03-21T10:05:00Z",
  "download_url": null
}
```

#### Get Report Status

```http
GET /reports/status/report_123
```

Response:
```json
{
  "id": "report_123",
  "status": "completed",
  "download_url": "https://api.writecarenotes.com/financial/v1/reports/download/report_123",
  "expires_at": "2024-03-22T10:00:00Z"
}
```

### Charts and Analytics

#### Get Transaction Volume

```http
GET /charts/volume
  ?period=2024-03
  &granularity=daily
```

Response:
```json
{
  "period": "2024-03",
  "granularity": "daily",
  "data": [
    {
      "date": "2024-03-01",
      "volume": 15000.00,
      "currency": "GBP",
      "count": 45
    }
  ]
}
```

#### Get Performance Metrics

```http
GET /charts/performance
  ?metric=conversion_rate
  &period=2024-Q1
```

Response:
```json
{
  "metric": "conversion_rate",
  "period": "2024-Q1",
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "value": 98.5,
      "unit": "percentage"
    }
  ]
}
```

## Error Handling

The API uses standard HTTP response codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

Error Response Format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Rate Limits

- Standard tier: 100 requests per minute
- Enterprise tier: 1000 requests per minute

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1616789000
```

## Webhooks

Register webhooks to receive real-time updates:

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["report.completed", "rate.updated"],
  "secret": "your_webhook_secret"
}
```

## Support

For API support, contact:
- Email: api-support@writecarenotes.com
- Documentation: https://docs.writecarenotes.com/api
- Status Page: https://status.writecarenotes.com 
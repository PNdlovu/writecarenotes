# Financial Module API Documentation

## Overview

The Financial Module provides comprehensive APIs for managing financial operations in care homes across the UK and Ireland. This module supports multi-currency operations, regulatory compliance, and detailed reporting capabilities.

## Base URL

```
/api/financial/[organizationId]
```

## Authentication

All endpoints require authentication using a valid session token. Include the token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

## Endpoints

### Currency Operations

#### Get Financial Report

```http
GET /currency/reports
```

Generates a detailed financial report based on specified parameters.

**Query Parameters:**
- `period` (string, optional): Report period in YYYY-MM format. Defaults to current month.
- `granularity` (string, optional): Data granularity - 'hour', 'day', 'week', 'month'. Defaults to 'day'.
- `metrics` (string[], optional): Specific metrics to include. Defaults to all.
- `format` (string, optional): Output format - 'json', 'csv', 'pdf'. Defaults to 'json'.
- `template` (string, optional): Report template - 'default', 'detailed', 'regulatory'. Defaults to 'default'.
- `locale` (string, optional): Locale for formatting. Defaults to 'en-GB'.

**Response Example:**
```json
{
  "summary": {
    "totalTransactions": 1000,
    "totalVolume": 50000,
    "successRate": 0.98,
    "averageLatency": 150,
    "errorRate": 0.02
  },
  "trends": {
    "volumeByPeriod": {
      "2024-03-01": 1000,
      "2024-03-02": 1500
    }
  }
}
```

#### Get Chart Data

```http
GET /currency/charts
```

Generates chart data for financial metrics visualization.

**Query Parameters:**
- `metric` (string, required): Type of chart - 'volume', 'transactions', 'errors', 'performance', 'regional'
- `period` (string, optional): Data period in YYYY-MM format. Defaults to current month.
- `granularity` (string, optional): Data granularity - 'hour', 'day', 'week', 'month'. Defaults to 'day'.
- `type` (string, optional): Chart type - 'line', 'bar', 'pie', 'doughnut'. Defaults to 'line'.
- `limit` (number, optional): Limit for data points. Defaults to 10.

**Response Example:**
```json
{
  "type": "line",
  "labels": ["2024-03-01", "2024-03-02"],
  "datasets": [{
    "label": "Conversion Volume",
    "data": [1000, 1500],
    "borderColor": "#4CAF50",
    "fill": false
  }]
}
```

### Regulatory Compliance

#### Get Regulatory Report

```http
GET /currency/reports/regulatory/[body]
```

Generates regulatory compliance reports for specific regulatory bodies.

**Path Parameters:**
- `body` (string): Regulatory body - 'cqc', 'ciw', 'ci', 'rqia', 'hiqa'

**Query Parameters:**
- Same as Financial Report endpoint
- `includeAudit` (boolean, optional): Include audit trail. Defaults to false.

**Response Example:**
```json
{
  "compliance": {
    "status": "compliant",
    "issues": [],
    "lastAudit": "2024-03-20",
    "regulatoryBody": "CQC"
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Default limit: 100 requests per minute per organization
- Burst limit: 200 requests per minute
- Headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Caching

- Chart data is cached for 5 minutes
- Reports are cached for 1 minute
- Cache can be bypassed using `no-cache` header

## Best Practices

1. **Pagination**
   - Use `limit` and `offset` parameters for large datasets
   - Default limit is 100 items per page

2. **Error Handling**
   - Always check response status codes
   - Implement exponential backoff for rate limits

3. **Performance**
   - Use appropriate granularity for date ranges
   - Request only needed metrics
   - Implement client-side caching

4. **Security**
   - Keep authentication tokens secure
   - Validate all input data
   - Monitor for suspicious activity

## Examples

### Generating a Monthly Report

```javascript
const response = await fetch('/api/financial/org-123/currency/reports?period=2024-03&format=pdf&template=detailed', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const report = await response.blob();
```

### Fetching Chart Data

```javascript
const response = await fetch('/api/financial/org-123/currency/charts?metric=volume&type=line&period=2024-03', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const chartData = await response.json();
```

## Support

For API support, contact:
- Email: api-support@writecarenotes.com
- Documentation: https://docs.writecarenotes.com/api
- Status: https://status.writecarenotes.com 
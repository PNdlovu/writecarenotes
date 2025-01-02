# Financial Module API Reference

## Core APIs

### Financial Summary

#### Get Financial Summary
```http
GET /api/financial/[organizationId]/summary
```

**Parameters**
- `organizationId`: string (required) - Organization identifier

**Response**
```typescript
{
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    currency: string;
    period: string;
    lastUpdated: string;
  }
}
```

### Transactions

#### Create Transaction
```http
POST /api/financial/[organizationId]/transactions
```

**Request Body**
```typescript
{
  amount: number;
  currency: string;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  description?: string;
  residentId?: string;
  metadata?: Record<string, any>;
}
```

#### List Transactions
```http
GET /api/financial/[organizationId]/transactions
```

**Query Parameters**
- `from`: string (YYYY-MM-DD)
- `to`: string (YYYY-MM-DD)
- `type`: 'INCOME' | 'EXPENSE'
- `category`: string
- `residentId`: string
- `page`: number
- `limit`: number

### Currency Operations

#### Get Exchange Rates
```http
GET /api/financial/[organizationId]/currency
```

**Query Parameters**
- `base`: string (default: 'GBP')
- `symbols`: string[] (comma-separated)

#### Convert Currency
```http
POST /api/financial/[organizationId]/currency
```

**Request Body**
```typescript
{
  amount: number;
  from: string;
  to: string;
  date?: string;
}
```

### Regulatory Reporting

#### Generate Report
```http
GET /api/financial/[organizationId]/regulatory/[region]/report
```

**Query Parameters**
- `period`: string (YYYY-MM)
- `format`: 'pdf' | 'csv'
- `template`: string
- `language`: string

**Response**
```typescript
{
  id: string;
  status: 'completed' | 'processing' | 'failed';
  regulatoryBody: string;
  period: string;
  format: string;
  language: string;
  metadata: {
    organizationName: string;
    registrationNumber: string;
    complianceStatus: string;
    transactionCount: number;
    totalAmount: number;
    residentCount: number;
  }
}
```

#### Compliance Check
```http
POST /api/financial/[organizationId]/regulatory/[region]/compliance
```

**Request Body**
```typescript
{
  checkType: string;
  period: string;
  metadata?: Record<string, any>;
}
```

## Error Handling

### Error Types

#### ValidationError (400)
```typescript
{
  error: string;
  details: {
    field: string;
    expected: string;
    received?: string;
  };
  timestamp: string;
}
```

#### ComplianceError (422)
```typescript
{
  error: string;
  details: {
    checks: Array<{
      name: string;
      status: 'passed' | 'failed';
      details: string;
    }>;
  };
  timestamp: string;
}
```

#### AuthorizationError (401/403)
```typescript
{
  error: string;
  timestamp: string;
}
```

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| Standard endpoints | 100/minute |
| Report generation | 10/minute |
| Compliance checks | 20/minute |

## Headers

### Required Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
Accept-Language: en-GB
```

### Optional Headers
```http
X-Organization-ID: <org_id>
X-Correlation-ID: <correlation_id>
```

## Webhooks

### Transaction Webhook
```http
POST <webhook_url>
```

**Payload**
```typescript
{
  event: 'transaction.created' | 'transaction.updated' | 'transaction.deleted';
  data: {
    id: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    timestamp: string;
  };
  metadata: Record<string, any>;
}
```

### Report Webhook
```http
POST <webhook_url>
```

**Payload**
```typescript
{
  event: 'report.completed' | 'report.failed';
  data: {
    id: string;
    type: string;
    status: string;
    downloadUrl?: string;
    error?: string;
  };
  timestamp: string;
}
```

## Best Practices

1. Always specify the language preference
2. Use appropriate error handling
3. Implement retry logic for failed requests
4. Cache responses where appropriate
5. Use webhooks for long-running operations
6. Include correlation IDs for request tracking
7. Validate input before sending requests
8. Handle rate limits appropriately

## Support

For API support:
- Email: api-support@writecarenotes.com
- Status: status.writecarenotes.com
- Documentation: docs.writecarenotes.com/api/financial 
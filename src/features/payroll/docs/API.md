# Payroll API Documentation

## Overview
The payroll API provides endpoints for managing payroll calculations, payments, and related operations for care homes across the UK and Ireland.

## Base URL
```
/api/payroll
```

## Authentication
All endpoints require authentication using a JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

## Endpoints

### Calculate Payroll
Calculate payroll for a specific period.

```http
POST /api/payroll/[periodId]/calculate
```

#### Request Body
```typescript
{
  staffId: string;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  sickHours: number;
  nightHours: number;
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE';
  bankAccount?: {
    accountNumber: string;
    sortCode: string;
    accountName: string;
  };
  notes?: string;
}
```

#### Response
```typescript
{
  data: {
    id: string;
    grossPay: number;
    netPay: number;
    deductions: {
      type: string;
      amount: number;
      statutory: boolean;
    }[];
    adjustments: {
      type: string;
      amount: number;
      reason: string;
    }[];
    paymentStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
  }
}
```

### Process Payment
Process payment for a calculated payroll entry.

```http
POST /api/payroll/[periodId]/entries/[entryId]/process
```

#### Request Body
```typescript
{
  paymentDate: string;
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE';
  bankAccount?: {
    accountNumber: string;
    sortCode: string;
    accountName: string;
  };
}
```

#### Response
```typescript
{
  data: {
    id: string;
    paymentStatus: 'PROCESSED' | 'FAILED';
    paymentReference: string;
    processedAt: string;
    error?: string;
  }
}
```

### Get Payroll Summary
Get summary of a payroll period.

```http
GET /api/payroll/[periodId]/summary
```

#### Response
```typescript
{
  data: {
    id: string;
    startDate: string;
    endDate: string;
    status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PROCESSED';
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    employeeCount: number;
    currency: string;
    region: string;
  }
}
```

### Get Payroll Entries
Get all entries for a payroll period.

```http
GET /api/payroll/[periodId]/entries
```

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status
- `sortBy`: Sort field
- `sortOrder`: Sort direction ('asc' or 'desc')

#### Response
```typescript
{
  data: {
    entries: Array<{
      id: string;
      staffId: string;
      grossPay: number;
      netPay: number;
      paymentStatus: string;
      processedAt?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }
}
```

### Update Payroll Entry
Update a specific payroll entry.

```http
PATCH /api/payroll/[periodId]/entries/[entryId]
```

#### Request Body
```typescript
{
  regularHours?: number;
  overtimeHours?: number;
  holidayHours?: number;
  sickHours?: number;
  nightHours?: number;
  notes?: string;
}
```

#### Response
```typescript
{
  data: {
    id: string;
    // Updated entry details
  }
}
```

### Get Tax Calculation
Calculate tax for given parameters.

```http
POST /api/payroll/tax/calculate
```

#### Request Body
```typescript
{
  annualSalary: number;
  region: string;
  taxYear: string;
  taxCode?: string;
  niCategory?: string;
}
```

#### Response
```typescript
{
  data: {
    grossPay: number;
    incomeTax: number;
    nationalInsurance: number;
    netPay: number;
    taxCode: string;
    taxYear: string;
  }
}
```

## Error Handling

### Error Response Format
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Common Error Codes
- `INVALID_REQUEST`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Data validation failed
- `COMPLIANCE_ERROR`: Compliance check failed
- `PAYMENT_ERROR`: Payment processing failed
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting
- 100 requests per minute per API key
- Rate limit headers included in response:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1640995200
  ```

## Webhooks

### Payment Status Updates
```http
POST /api/payroll/webhook/payment-status
```

#### Payload
```typescript
{
  type: 'PAYMENT_STATUS_UPDATE';
  data: {
    entryId: string;
    status: 'PROCESSED' | 'FAILED';
    timestamp: string;
    reference: string;
    error?: string;
  };
}
```

## Testing
Test API keys are available for sandbox environment:
```
BACS_API_KEY_TEST=test_bacs_key
SEPA_API_KEY_TEST=test_sepa_key
``` 
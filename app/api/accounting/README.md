# Accounting API Documentation

## Overview
This directory contains the API routes for Write Care Notes' accounting module, providing enterprise-grade financial management capabilities for care homes across the UK and Ireland.

## Authentication
All routes require:
- Valid JWT token
- Organization context
- Appropriate permissions

## Route Structure

### Ledger Operations

#### Account Management
```http
GET /api/accounting/ledger/accounts
```
- Query Parameters:
  - `type`: AccountType
  - `isActive`: boolean
  - `search`: string
- Returns: Paginated list of accounts with balances

```http
POST /api/accounting/ledger/accounts
```
- Body:
  ```typescript
  {
    code: string;
    name: string;
    type: AccountType;
    parentId?: string;
    description?: string;
  }
  ```
- Returns: Created account

#### Journal Entries
```http
GET /api/accounting/ledger/entries
```
- Query Parameters:
  - `startDate`: ISO date
  - `endDate`: ISO date
  - `status`: JournalEntryStatus
  - `accountId`: string
- Returns: Paginated list of journal entries

```http
POST /api/accounting/ledger/entries
```
- Body:
  ```typescript
  {
    date: Date;
    reference: string;
    description: string;
    lines: Array<{
      accountId: string;
      debit?: number;
      credit?: number;
      description?: string;
      costCenterId?: string;
    }>;
  }
  ```
- Returns: Created journal entry

### Financial Statements

#### Balance Sheet
```http
GET /api/accounting/statements/balance-sheet
```
- Query Parameters:
  - `asOf`: ISO date (defaults to current date)
  - `organizationId`: string (required)
- Returns:
  ```typescript
  {
    asOf: Date;
    balanceSheet: {
      assets: {
        current: Array<AccountBalance>;
        fixed: Array<AccountBalance>;
        total: number;
      };
      liabilities: {
        current: Array<AccountBalance>;
        longTerm: Array<AccountBalance>;
        total: number;
      };
      equity: {
        items: Array<AccountBalance>;
        total: number;
      };
    };
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
  }
  ```

#### Income Statement
```http
GET /api/accounting/statements/income-statement
```
- Query Parameters:
  - `startDate`: ISO date (defaults to start of year)
  - `endDate`: ISO date (defaults to current date)
  - `organizationId`: string (required)
- Returns:
  ```typescript
  {
    period: {
      startDate: Date;
      endDate: Date;
    };
    incomeStatement: {
      revenue: {
        items: Array<AccountBalance>;
        total: number;
      };
      expenses: {
        items: Array<AccountBalance>;
        total: number;
      };
      grossProfit: number;
      netIncome: number;
    };
  }
  ```

### Tax Management

#### VAT Returns
```http
GET /api/accounting/vat-returns
```
- Query Parameters:
  - `startDate`: ISO date
  - `endDate`: ISO date
  - `status`: VATReturnStatus
- Returns: List of VAT returns

```http
POST /api/accounting/vat-returns
```
- Body:
  ```typescript
  {
    periodStart: Date;
    periodEnd: Date;
  }
  ```
- Returns: Generated VAT return

### Error Responses
All routes follow standard HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

### Response Format
```typescript
// Success Response
{
  data: T;
  metadata?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
    };
  };
}

// Error Response
{
  error: string;
  details?: any;
  code?: string;
}
```

## Regional Support
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England: HMRC MTD integration
- 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales: Bilingual support
- 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland: Scottish accounting standards
- 🇮🇪 Ireland: Revenue Online Service
- 🇬🇧 Northern Ireland: Dual compliance 
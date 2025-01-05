# Financial Module API Routes

## API Structure
```
app/api/financial/
├── residents/                           # Resident Financial Management
│   ├── [residentId]/
│   │   ├── route.ts                    # GET, PUT resident financial profile
│   │   ├── charges/route.ts            # POST, GET resident charges
│   │   ├── statements/route.ts         # GET statements
│   │   ├── transactions/route.ts       # POST, GET transactions
│   │   └── pocket-money/route.ts       # GET, POST pocket money transactions
│   └── bulk/route.ts                   # POST bulk operations
│
├── operations/                          # Care Home Operations
│   ├── revenue/
│   │   ├── route.ts                    # GET, POST revenue entries
│   │   ├── forecasting/route.ts        # GET revenue forecasts
│   │   └── analysis/route.ts           # GET revenue analysis
│   ├── expenses/
│   │   ├── route.ts                    # GET, POST expenses
│   │   ├── suppliers/route.ts          # GET, POST supplier management
│   │   └── purchase-orders/route.ts    # GET, POST purchase orders
│   └── cost-centers/route.ts           # GET, POST cost center operations
│
├── banking/                            # Banking & Treasury
│   ├── accounts/route.ts              # GET, POST bank accounts
│   ├── reconciliation/route.ts        # POST reconciliation
│   ├── statements/route.ts            # GET bank statements
│   └── transactions/route.ts          # GET, POST banking transactions
│
├── accounts/                          # Accounts Management
│   ├── receivable/
│   │   ├── route.ts                  # GET, POST receivables
│   │   ├── invoices/route.ts         # GET, POST invoices
│   │   └── collections/route.ts      # GET, POST collections
│   └── payable/
│       ├── route.ts                  # GET, POST payables
│       ├── invoices/route.ts         # GET, POST supplier invoices
│       └── payments/route.ts         # GET, POST payments
│
├── payroll/                          # Payroll Integration
│   ├── salaries/route.ts            # GET, POST salary processing
│   ├── agency/route.ts              # GET, POST agency staff payments
│   ├── benefits/route.ts            # GET, POST benefits
│   └── pensions/route.ts            # GET, POST pension contributions
│
├── compliance/                       # Compliance & Reporting
│   ├── regulatory/
│   │   ├── cqc/route.ts            # GET, POST CQC reports
│   │   ├── hmrc/route.ts           # GET, POST HMRC submissions
│   │   └── vat/route.ts            # GET, POST VAT returns
│   └── audit/route.ts              # GET audit trails
│
├── local-authority/                 # Local Authority Management
│   ├── contracts/route.ts          # GET, POST LA contracts
│   ├── rates/route.ts             # GET, POST rate cards
│   ├── funding/route.ts           # GET, POST funding details
│   └── nhs/route.ts              # GET, POST NHS funding
│
├── multi-site/                    # Multi-Site Operations
│   ├── consolidation/route.ts    # GET consolidated reports
│   ├── transfers/route.ts        # POST inter-company transfers
│   └── shared-services/route.ts  # GET, POST shared services
│
├── planning/                     # Financial Planning
│   ├── budgets/route.ts         # GET, POST budgets
│   ├── forecasts/route.ts       # GET, POST forecasts
│   └── investments/route.ts     # GET, POST investment analysis
│
├── integrations/                # External Integrations
│   ├── accounting/
│   │   ├── sage/route.ts       # Sage integration
│   │   ├── quickbooks/route.ts # QuickBooks integration
│   │   └── xero/route.ts       # Xero integration
│   └── banking/
│       ├── open-banking/route.ts # Open banking operations
│       └── payment-gateway/route.ts # Payment processing
│
└── analytics/                   # Analytics & BI
    ├── financial/route.ts      # GET financial analytics
    ├── operational/route.ts    # GET operational insights
    └── reports/
        ├── standard/route.ts   # GET standard reports
        └── custom/route.ts     # POST, GET custom reports
```

## API Endpoints Documentation

### Resident Financial Management

#### GET /api/financial/residents/[residentId]
- Get resident's financial profile
- Query Parameters:
  - `includeTransactions`: boolean
  - `period`: string (YYYY-MM)

#### POST /api/financial/residents/[residentId]/charges
- Create new resident charge
- Body:
```typescript
{
  amount: number;
  description: string;
  category: ChargeCategory;
  date: string;
  recurring?: boolean;
}
```

### Care Home Operations

#### GET /api/financial/operations/revenue
- Get revenue data
- Query Parameters:
  - `startDate`: string
  - `endDate`: string
  - `groupBy`: 'day' | 'week' | 'month'

#### POST /api/financial/operations/expenses
- Create new expense entry
- Body:
```typescript
{
  amount: number;
  category: ExpenseCategory;
  supplier?: string;
  costCenter: string;
  date: string;
  description: string;
}
```

### Banking & Treasury

#### POST /api/financial/banking/reconciliation
- Perform bank reconciliation
- Body:
```typescript
{
  accountId: string;
  statementDate: string;
  transactions: BankTransaction[];
}
```

### Local Authority Management

#### POST /api/financial/local-authority/contracts
- Create new LA contract
- Body:
```typescript
{
  localAuthorityId: string;
  startDate: string;
  endDate: string;
  rateCard: RateCard;
  terms: ContractTerms;
}
```

## Security & Authentication

All routes require:
- Valid JWT token
- Appropriate role permissions
- Organization context
- Audit logging

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Bulk operations: 20 requests per minute
- Report generation: 10 requests per minute

## Response Format

Success Response:
```typescript
{
  success: true;
  data: T;
  metadata?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}
```

Error Response:
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Versioning

- Current version: v1
- Version in URL: /api/v1/financial/...
- Version in header: X-API-Version: 1.0

## Implementation Notes

1. All routes should implement:
   - Input validation
   - Error handling
   - Audit logging
   - Rate limiting
   - Cache control

2. Security considerations:
   - RBAC checks
   - Data encryption
   - Request sanitization
   - XSS protection

3. Performance optimization:
   - Response caching
   - Bulk operations
   - Pagination
   - Query optimization

## Testing Requirements

Each route should have:
- Unit tests
- Integration tests
- Load tests
- Security tests
- Compliance checks 
# Write Care Notes - Accounting Module

## Overview
The accounting module provides enterprise-grade financial management capabilities for care homes across the UK and Ireland. It supports multi-currency transactions, regional tax compliance, and comprehensive audit logging.

## Core Services

### 1. Ledger Operations (`services/ledger`)
- **AccountService**: Manages the chart of accounts
  - Account creation and management
  - Balance calculations
  - Hierarchical account structure
  - Account validation

- **JournalService**: Handles financial transactions
  - Double-entry bookkeeping
  - Transaction validation
  - Journal entry management
  - Posting and voiding entries

### 2. Tax Management (`services/tax`)
- **VATCalculator**: Regional tax compliance
  - UK VAT rates (20%, 5%, 0%)
  - Ireland VAT rates (23%, 13.5%, 0%)
  - VAT return generation
  - VAT number validation

### 3. Audit Logging (`services/audit`)
- **AuditLogger**: Compliance tracking
  - Comprehensive activity logging
  - User action tracking
  - Entity history
  - Compliance reporting

## Financial Statements

### Balance Sheet
- Assets (Current & Fixed)
- Liabilities (Current & Long-term)
- Equity
- Real-time balance calculations

### Income Statement
- Revenue tracking
- Expense management
- Profit calculations
- Period-based reporting

## Regional Compliance

### United Kingdom
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England: HMRC MTD compliance
- 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales: Bilingual support
- 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland: Scottish accounting standards
- 🇬🇧 Northern Ireland: UK/EU dual compliance

### Ireland
- 🇮🇪 Revenue Online Service integration
- Irish GAAP compliance
- EUR currency support
- Irish VAT rates

## API Structure
Refer to `/app/api/accounting/README.md` for detailed API documentation.

## Type Definitions

### Account Types
\`\`\`typescript
type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
type AccountCategory = 'CURRENT' | 'FIXED' | 'LONG_TERM';
\`\`\`

### Journal Entry Types
\`\`\`typescript
type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOID';
interface JournalEntryLine {
  accountId: string;
  debit?: number;
  credit?: number;
  description?: string;
  costCenterId?: string;
}
\`\`\`

### Audit Types
\`\`\`typescript
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'POST' | 'VOID';
type AuditEntityType = 'ACCOUNT' | 'JOURNAL_ENTRY' | 'VAT_RETURN' | 'RECONCILIATION' | 'COST_CENTER';
\`\`\`

## Security

### Data Protection
- Row-level security
- Tenant isolation
- Audit logging
- Encryption at rest

### Access Control
- Role-based permissions
- Action-based authorization
- Organization-level isolation
- User activity tracking

## Best Practices

### Transaction Management
1. Always use double-entry bookkeeping
2. Validate transactions before posting
3. Use appropriate account types
4. Include proper documentation
5. Maintain audit trail

### Compliance
1. Follow regional tax rules
2. Maintain proper documentation
3. Regular reconciliation
4. Proper audit logging
5. Data retention policies

## Error Handling
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Dependencies
- Prisma ORM
- Next.js API Routes
- TypeScript
- Date-fns for date handling
- Decimal.js for precise calculations 
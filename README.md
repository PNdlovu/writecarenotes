# WriteCareNotes - Accounting Module

## Overview

The accounting module is part of the WriteCareNotes platform, designed specifically for care homes in the UK and Ireland. It provides comprehensive financial management capabilities with support for regional compliance requirements and offline functionality.

## Features

- **Multi-Region Support**
  - Compliance with UK and Ireland accounting standards
  - Region-specific VAT handling
  - Multi-currency support
  - Localized date and number formatting

- **Bank Integration**
  - Import bank statements (CSV, OFX, QIF formats)
  - Automatic transaction matching
  - Reconciliation workflow
  - Bank statement parsing and validation

- **Journal Entries**
  - Double-entry accounting
  - Draft and posted states
  - Audit trail
  - Attachment support

- **Offline Capabilities**
  - Work without internet connection
  - Automatic synchronization
  - Conflict resolution
  - Data persistence

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string
   - Set up authentication secrets

3. Initialize the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Routes

### Bank Import
- `POST /api/accounting/bank-import/parse`
  - Parse bank statements in various formats
  - Validate transaction data
  - Return structured transaction data

- `POST /api/accounting/bank-import/process`
  - Process validated transactions
  - Create bank transaction records
  - Match with existing journal entries
  - Create reconciliation records

### Journal Entries
- `GET /api/accounting/journal-entries`
- `POST /api/accounting/journal-entries`
- `PUT /api/accounting/journal-entries/[id]`
- `DELETE /api/accounting/journal-entries/[id]`

### Accounts
- `GET /api/accounting/accounts`
- `POST /api/accounting/accounts`
- `PUT /api/accounting/accounts/[id]`
- `DELETE /api/accounting/accounts/[id]`

### Cost Centers
- `GET /api/accounting/cost-centers`
- `POST /api/accounting/cost-centers`
- `PUT /api/accounting/cost-centers/[id]`
- `DELETE /api/accounting/cost-centers/[id]`

### VAT Returns
- `GET /api/accounting/vat-returns`
- `POST /api/accounting/vat-returns`
- `PUT /api/accounting/vat-returns/[id]`
- `DELETE /api/accounting/vat-returns/[id]`

## Database Schema

The module uses PostgreSQL with the following main tables:
- `Account`
- `CostCenter`
- `JournalEntry`
- `JournalEntryLine`
- `BankTransaction`
- `Reconciliation`
- `VATReturn`
- `AuditLog`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

Copyright © 2024 Write Care Notes Ltd. All rights reserved.

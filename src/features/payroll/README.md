# Payroll Module

## Overview
The payroll module handles all payroll-related functionality for care homes across the UK and Ireland. It supports regional tax calculations, care-specific allowances, and compliance with local regulations.

## Features
- Regional tax calculations (UK & Ireland)
- Care qualification allowances
- Night shift premiums
- Multi-currency support
- Offline capability
- Compliance tracking
- Audit logging

## Directory Structure
```
src/features/payroll/
├── api/           # API routes and handlers
├── components/    # React components
├── lib/          # Core utilities and calculations
├── services/     # Business logic services
├── types/        # TypeScript types and interfaces
├── utils/        # Helper functions
└── workers/      # Background processing
```

## Key Components

### PayrollCalculator
Main component for calculating staff pay, including:
- Basic salary calculations
- Tax deductions
- National Insurance contributions
- Care-specific allowances

### TaxCalculator
Handles tax calculations for different regions:
- England & Wales rates
- Scottish rates
- Northern Ireland rates
- Irish rates (PAYE & PRSI)

### CareAllowances
Manages care-specific allowances:
- Qualification-based allowances (NVQ, SVQ, QQI)
- Night shift premiums
- Regional variations

## Configuration
The module uses environment variables for configuration:
```env
BACS_API_KEY=your_bacs_api_key
SEPA_API_KEY=your_sepa_api_key
```

## Usage
```typescript
import { PayrollCalculator } from '@/features/payroll/components/PayrollCalculator';

// Basic usage
<PayrollCalculator />

// With custom configuration
<PayrollCalculator 
  region="ENGLAND"
  currency="GBP"
  taxYear="2024-2025"
/>
```

## API Routes

### Calculate Payroll
```http
POST /api/payroll/[periodId]/calculate
```

### Process Payment
```http
POST /api/payroll/[periodId]/process
```

### Get Payroll Summary
```http
GET /api/payroll/[periodId]/summary
```

## Testing
Run tests using:
```bash
npm test src/features/payroll
```

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Regional Support
See [REGIONAL_SUPPORT.md](./docs/REGIONAL_SUPPORT.md) for region-specific details.

## Compliance
See [COMPLIANCE.md](./docs/COMPLIANCE.md) for compliance requirements.

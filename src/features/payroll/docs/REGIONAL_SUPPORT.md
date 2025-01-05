# Regional Support

## Overview
The payroll module supports different tax systems, qualification frameworks, and compliance requirements across the UK and Ireland.

## Supported Regions

### England
- Tax System: PAYE
- National Insurance: Standard UK NI rates
- Qualifications:
  - NVQ Level 2 in Health and Social Care
  - NVQ Level 3 in Health and Social Care
  - NVQ Level 4 in Health and Social Care
- Regulatory Body: CQC

### Wales
- Tax System: PAYE (Welsh Rate)
- National Insurance: Standard UK NI rates
- Qualifications:
  - QCF Level 2 in Health and Social Care
  - QCF Level 3 in Health and Social Care
  - QCF Level 4 in Health and Social Care
- Regulatory Body: CIW

### Scotland
- Tax System: Scottish Rate of Income Tax (SRIT)
- National Insurance: Standard UK NI rates
- Qualifications:
  - SVQ Level 2 in Social Services
  - SVQ Level 3 in Social Services
  - SVQ Level 4 in Social Services
- Regulatory Body: Care Inspectorate

### Northern Ireland
- Tax System: PAYE
- National Insurance: Standard UK NI rates
- Qualifications:
  - NVQ Level 2 in Health and Social Care
  - NVQ Level 3 in Health and Social Care
  - NVQ Level 4 in Health and Social Care
- Regulatory Body: RQIA

### Republic of Ireland
- Tax System: PAYE (Irish)
- Social Insurance: PRSI
- Qualifications:
  - QQI Level 5 in Healthcare Support
  - QQI Level 6 in Healthcare Support
  - QQI Level 7 in Healthcare Management
- Regulatory Body: HIQA

## Tax Year Periods

### UK Regions
- Tax Year: 6 April to 5 April
- Weekly periods: 1-52/53
- Monthly periods: 1-12

### Ireland
- Tax Year: 1 January to 31 December
- Weekly periods: 1-52
- Monthly periods: 1-12

## Payment Methods

### UK Regions
- BACS (primary)
- CHAPS (urgent)
- Faster Payments

### Ireland
- SEPA Credit Transfer
- SEPA Instant Credit Transfer

## Currency Support
- GBP (£) for UK regions
- EUR (€) for Ireland

## Night Shift Premiums

### England & Wales
- Weekday nights: +15%
- Weekend nights: +20%

### Scotland
- All nights: +17.5%

### Northern Ireland
- All nights: +15%

### Ireland
- Weekday nights: +20%
- Weekend nights: +25%

## Qualification Allowances

### UK Regions
- Level 2: +£0.50/hour
- Level 3: +£1.00/hour
- Level 4: +£1.50/hour

### Ireland
- Level 5: +€0.75/hour
- Level 6: +€1.25/hour
- Level 7: +€2.00/hour

## Implementation Details

### Tax Calculation
```typescript
const calculator = new TaxCalculator(region);
const result = calculator.calculatePayPeriodTax(salary, period);
```

### Allowance Calculation
```typescript
const allowanceCalc = new CareAllowanceCalculator(region);
const allowances = allowanceCalc.calculateAllowances(qualifications, hours);
```

### Currency Formatting
```typescript
const formatter = new RegionalCurrencyFormatter(region);
const formattedAmount = formatter.format(amount);
```

## Compliance Requirements
Each region has specific compliance requirements. See [COMPLIANCE.md](./COMPLIANCE.md) for details. 
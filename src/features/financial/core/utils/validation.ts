import { MonetaryAmount, FinancialError } from '../types';

/**
 * Validate a monetary amount
 */
export function validateMonetaryAmount(amount: MonetaryAmount): void {
  if (amount.amount < 0) {
    throw new FinancialError(
      'Amount cannot be negative',
      'VALIDATION_ERROR',
      { amount }
    );
  }

  if (!amount.currency) {
    throw new FinancialError(
      'Currency is required',
      'VALIDATION_ERROR',
      { amount }
    );
  }
}

/**
 * Validate a date range
 */
export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate > endDate) {
    throw new FinancialError(
      'Start date must be before end date',
      'VALIDATION_ERROR',
      { startDate, endDate }
    );
  }
}

/**
 * Validate a tenant ID
 */
export function validateTenantId(tenantId: string): void {
  if (!tenantId) {
    throw new FinancialError(
      'Tenant ID is required',
      'VALIDATION_ERROR'
    );
  }
}

/**
 * Ensure amounts balance (debits = credits)
 */
export function validateBalancedTransaction(
  debits: MonetaryAmount[],
  credits: MonetaryAmount[]
): void {
  const totalDebits = debits.reduce((sum, amount) => sum + amount.amount, 0);
  const totalCredits = credits.reduce((sum, amount) => sum + amount.amount, 0);

  if (totalDebits !== totalCredits) {
    throw new FinancialError(
      'Transaction is not balanced',
      'VALIDATION_ERROR',
      { totalDebits, totalCredits }
    );
  }
}

/**
 * Validate currency codes match
 */
export function validateCurrencyMatch(amounts: MonetaryAmount[]): void {
  const currencies = new Set(amounts.map(amount => amount.currency));
  
  if (currencies.size > 1) {
    throw new FinancialError(
      'All amounts must be in the same currency',
      'VALIDATION_ERROR',
      { currencies: Array.from(currencies) }
    );
  }
}

/**
 * Validate a reference number format
 */
export function validateReferenceNumber(reference: string, prefix: string): void {
  const pattern = new RegExp(`^${prefix}-\\d{8}-\\d{4}$`);
  
  if (!pattern.test(reference)) {
    throw new FinancialError(
      'Invalid reference number format',
      'VALIDATION_ERROR',
      { reference, expectedFormat: `${prefix}-YYYYMMDD-NNNN` }
    );
  }
} 



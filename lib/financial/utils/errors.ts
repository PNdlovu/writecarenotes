export type FinancialErrorCode =
  | 'RESIDENT_FINANCIAL_UPDATE_FAILED'
  | 'RESIDENT_FINANCIAL_NOT_FOUND'
  | 'RESIDENT_FINANCIAL_FETCH_FAILED'
  | 'FUNDING_SOURCE_ADD_FAILED'
  | 'FUNDING_SOURCE_UPDATE_FAILED'
  | 'FUNDING_PERIOD_OVERLAP'
  | 'FUNDING_CALCULATION_FAILED'
  | 'CONTRIBUTION_CALCULATION_FAILED'
  | 'FUNDING_HISTORY_FETCH_FAILED'
  | 'INVALID_PAYMENT_DETAILS';

export class FinancialError extends Error {
  constructor(
    message: string,
    public code: FinancialErrorCode,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FinancialError';
  }
}

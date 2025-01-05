import { FinancialErrorCode } from '../types/financial.types';

export class FinancialError extends Error {
  constructor(
    message: string,
    public code: FinancialErrorCode,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'FinancialError';
    Object.setPrototypeOf(this, FinancialError.prototype);
  }
} 



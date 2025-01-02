import { Region, TaxYear, NICategory } from '../lib/types';

export interface PayrollFormData {
  employeeId: string;
  grossPay: number;
  region: Region;
  taxYear: TaxYear;
  niCategory: NICategory;
  taxCode: string;
  pensionContribution: number;
}

export interface PayrollCalculationResult {
  grossPay: number;
  formattedGrossPay: string;
  netPay: number;
  formattedNetPay: string;
  deductions: PayrollDeduction[];
  aria: string;
}

export interface PayrollDeduction {
  type: string;
  amount: number;
  formattedAmount: string;
}



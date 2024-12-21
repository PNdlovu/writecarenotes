import { 
  PayrollCalculation,
  PayrollDeduction,
  DeductionType,
  EmployeeRates,
  PayrollSummary,
  NICategory
} from '../types';
import { TimeEntry } from '../../timesheet/types';
import { Employee } from '../../hr/types';
import { RegionalPayrollConfig } from './regional-config';
import { PrismaClient } from '@prisma/client';

export class PayrollCalculator implements PayrollCalculation {
  private regionalConfig: RegionalPayrollConfig;
  private readonly NI_CATEGORY_RATES: Record<NICategory, number> = {
    A: 1.0,   // Standard rate
    B: 0.85,  // Married women's reduced rate
    C: 0,     // Pension age
    H: 0.85,  // Apprentice under 25
    J: 0.95,  // Deferred rate
    M: 0.90,  // Under 21
    Z: 0.95   // Deferred rate under 21
  };

  constructor(region: string, organizationId: string) {
    this.regionalConfig = new RegionalPayrollConfig(region, organizationId);
  }

  async calculateEmployeePayroll(employee: Employee): Promise<any> {
    const grossPay = employee.salary / 12; // Monthly salary
    const taxableIncome = await this.calculateTaxableIncome(grossPay, employee.taxCode);
    const incomeTax = await this.calculateIncomeTax(taxableIncome);
    const nationalInsurance = await this.calculateNationalInsurance(grossPay, employee.niCategory);
    const deductions = await this.calculateDeductions(grossPay, employee);
    const netPay = this.calculateNetPay(grossPay, deductions);

    return {
      success: true,
      calculations: {
        employeeId: employee.id,
        grossPay: Math.round(grossPay * 100) / 100,
        taxableIncome: Math.round(taxableIncome * 100) / 100,
        incomeTax: Math.round(incomeTax * 100) / 100,
        nationalInsurance: Math.round(nationalInsurance * 100) / 100,
        netPay: Math.round(netPay * 100) / 100,
        deductions,
        periodStart: new Date(),
        periodEnd: new Date()
      }
    };
  }

  private async calculateTaxableIncome(grossPay: number, taxCode: string): Promise<number> {
    const isKCode = taxCode.startsWith('K');
    const numericPart = parseInt(taxCode.replace(/[^\d]/g, ''));
    const taxRates = await this.regionalConfig.getTaxRates('england');
    
    if (isKCode) {
      // K codes mean add to income
      return grossPay + (numericPart * 10 / 12);
    } else {
      // Standard tax codes mean deduct from income
      const monthlyAllowance = (numericPart * 10) / 12;
      return Math.max(0, grossPay - monthlyAllowance);
    }
  }

  async calculatePayrollTotals(prisma: PrismaClient): Promise<any> {
    const employees = await prisma.employee.findMany();
    let totalGross = 0;
    let totalNet = 0;
    let totalTax = 0;
    let totalNI = 0;

    for (const employee of employees) {
      const result = await this.calculateEmployeePayroll(employee);
      if (result.success) {
        totalGross += result.calculations.grossPay;
        totalNet += result.calculations.netPay;
        
        const tax = result.calculations.deductions.find(
          (d: PayrollDeduction) => d.type === DeductionType.TAX
        );
        const ni = result.calculations.deductions.find(
          (d: PayrollDeduction) => d.type === DeductionType.NATIONAL_INSURANCE
        );

        if (tax) totalTax += tax.amount;
        if (ni) totalNI += ni.amount;
      }
    }

    return {
      totalGross: Math.round(totalGross * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalNI: Math.round(totalNI * 100) / 100
    };
  }

  async calculatePayrollSummary(periodId: string): Promise<PayrollSummary> {
    const transactions = await prisma.payrollTransaction.findMany({
      where: { periodId }
    });

    const summary = {
      totalEmployees: 0,
      totalGross: 0,
      totalNet: 0,
      totalTax: 0,
      totalNI: 0,
      transactionCount: transactions.length,
      categories: {
        salary: 0,
        bonus: 0,
        tax: 0,
        ni: 0
      }
    };

    for (const transaction of transactions) {
      switch (transaction.type) {
        case 'SALARY':
          summary.categories.salary += transaction.amount;
          summary.totalGross += transaction.amount;
          break;
        case 'BONUS':
          summary.categories.bonus += transaction.amount;
          summary.totalGross += transaction.amount;
          break;
        case 'TAX':
          summary.categories.tax += Math.abs(transaction.amount);
          summary.totalTax += Math.abs(transaction.amount);
          break;
        case 'NI':
          summary.categories.ni += Math.abs(transaction.amount);
          summary.totalNI += Math.abs(transaction.amount);
          break;
      }
    }

    summary.totalNet = summary.totalGross - (summary.totalTax + summary.totalNI);
    summary.totalEmployees = await prisma.employee.count({
      where: { periodId }
    });

    return summary;
  }

  calculateGrossPay(timeEntries: TimeEntry[], rates: EmployeeRates): number {
    let totalPay = 0;

    for (const entry of timeEntries) {
      // Regular hours
      if (entry.regularHours) {
        totalPay += entry.regularHours * rates.hourlyRate;
      }

      // Overtime hours
      if (entry.overtimeHours) {
        const overtimeRate = rates.overtimeRate || rates.hourlyRate * 1.5;
        totalPay += entry.overtimeHours * overtimeRate;
      }

      // Holiday hours
      if (entry.holidayHours) {
        const holidayRate = rates.holidayRate || rates.hourlyRate * 2;
        totalPay += entry.holidayHours * holidayRate;
      }

      // Sick hours
      if (entry.sickHours) {
        const sickRate = rates.sickPayRate || rates.hourlyRate;
        totalPay += entry.sickHours * sickRate;
      }
    }

    return Math.round(totalPay * 100) / 100; // Round to 2 decimal places
  }

  async calculateDeductions(grossPay: number, employee: Employee): Promise<PayrollDeduction[]> {
    const deductions: PayrollDeduction[] = [];

    // Calculate Income Tax
    const incomeTax = await this.calculateIncomeTax(grossPay);
    if (incomeTax > 0) {
      deductions.push({
        type: DeductionType.TAX,
        amount: incomeTax,
        description: 'Income Tax'
      });
    }

    // Calculate National Insurance
    const ni = await this.calculateNationalInsurance(grossPay, employee.niCategory);
    if (ni > 0) {
      deductions.push({
        type: DeductionType.NATIONAL_INSURANCE,
        amount: ni,
        description: 'National Insurance Contribution'
      });
    }

    // Calculate Pension (if applicable)
    if (employee.pensionScheme) {
      const pension = this.calculatePension(grossPay, employee.pensionContributionPercentage || 5);
      deductions.push({
        type: DeductionType.PENSION,
        amount: pension,
        description: 'Pension Contribution'
      });
    }

    // Calculate Student Loan (if applicable)
    if (employee.hasStudentLoan) {
      const studentLoan = this.calculateStudentLoan(grossPay);
      deductions.push({
        type: DeductionType.STUDENT_LOAN,
        amount: studentLoan,
        description: 'Student Loan Repayment'
      });
    }

    return deductions;
  }

  calculateNetPay(grossPay: number, deductions: PayrollDeduction[]): number {
    const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    return Math.round((grossPay - totalDeductions) * 100) / 100;
  }

  async calculateIncomeTax(grossPay: number): Promise<number> {
    const taxRates = await this.regionalConfig.getTaxRates('england');
    const monthlyPersonalAllowance = taxRates.personalAllowance / 12;
    const taxableIncome = Math.max(0, grossPay - monthlyPersonalAllowance);
    
    let tax = 0;
    
    for (const band of taxRates.bands) {
      const bandIncome = Math.min(
        Math.max(0, taxableIncome - (band.threshold - taxRates.personalAllowance) / 12),
        ((band.threshold + band.width || Infinity) - band.threshold) / 12
      );
      tax += bandIncome * (band.rate / 100);
    }
    
    return Math.round(tax * 100) / 100;
  }

  async calculateNationalInsurance(grossPay: number, niCategory: string = 'A'): Promise<number> {
    const niRates = await this.regionalConfig.getNIRates();
    const weeklyPay = grossPay * 12 / 52;
    const categoryRate = this.NI_CATEGORY_RATES[niCategory as NICategory] || 1;
    
    let ni = 0;
    
    if (weeklyPay > niRates.primaryThreshold) {
      const band1Earnings = Math.min(weeklyPay, niRates.upperEarningsLimit) - niRates.primaryThreshold;
      ni += band1Earnings * niRates.primaryRate * categoryRate;
      
      if (weeklyPay > niRates.upperEarningsLimit) {
        const band2Earnings = weeklyPay - niRates.upperEarningsLimit;
        ni += band2Earnings * niRates.upperRate * categoryRate;
      }
    }
    
    return Math.round((ni * 52 / 12) * 100) / 100;
  }

  private calculatePension(grossPay: number, contributionPercentage: number): number {
    return Math.round((grossPay * contributionPercentage / 100) * 100) / 100;
  }

  private calculateStudentLoan(grossPay: number): number {
    const annualThreshold = 27295; // Plan 2 threshold
    const monthlyThreshold = annualThreshold / 12;
    
    if (grossPay > monthlyThreshold) {
      return Math.round((grossPay - monthlyThreshold) * 0.09 * 100) / 100;
    }
    
    return 0;
  }

  calculateEmergencyTax(grossPay: number): number {
    // Basic rate tax on all income as emergency measure
    return Math.round(grossPay * 0.20 * 100) / 100;
  }

  adjustTaxCode(currentCode: string, adjustment: number): string {
    const isKCode = currentCode.startsWith('K');
    const numericPart = parseInt(currentCode.replace(/[^\d]/g, ''));
    const suffix = currentCode.replace(/[\dK]/g, '');
    
    const newNumeric = Math.max(0, numericPart + adjustment);
    
    return `${isKCode ? 'K' : ''}${newNumeric}${suffix}`;
  }
}

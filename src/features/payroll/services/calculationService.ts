import { PayrollCalculation, TaxRegion } from '../types';
import { TaxConfigService } from './taxConfigService';

export class PayrollCalculationService {
  private readonly taxConfigService: TaxConfigService;

  constructor() {
    this.taxConfigService = new TaxConfigService();
  }

  calculateBasicPay(hoursWorked: number, hourlyRate: number): number {
    return hoursWorked * hourlyRate;
  }

  calculateOvertimePay(overtimeHours: number, overtimeRate: number): number {
    return overtimeHours * overtimeRate;
  }

  calculateTax(annualSalary: number, region: TaxRegion = TaxRegion.UK): number {
    const taxYear = this.taxConfigService.getCurrentTaxYear();
    const config = this.taxConfigService.getConfig(region, taxYear);

    if (!config) {
      throw new Error(`Tax configuration not found for region ${region} and tax year ${taxYear}`);
    }

    const personalAllowance = this.taxConfigService.calculatePersonalAllowance(config, annualSalary);
    let remainingSalary = Math.max(0, annualSalary - personalAllowance);
    let totalTax = 0;
    let previousThreshold = 0;

    for (const bracket of config.brackets) {
      if (bracket.threshold <= personalAllowance) {
        continue;
      }

      const adjustedThreshold = Math.max(bracket.threshold - personalAllowance, 0);
      const taxableAmount = Math.min(
        Math.max(0, remainingSalary),
        bracket.threshold - previousThreshold
      );

      totalTax += taxableAmount * bracket.rate;
      remainingSalary -= taxableAmount;
      previousThreshold = bracket.threshold;

      if (remainingSalary <= 0) break;
    }

    return totalTax;
  }

  calculateNationalInsurance(weeklySalary: number, region: TaxRegion = TaxRegion.UK): number {
    const taxYear = this.taxConfigService.getCurrentTaxYear();
    const config = this.taxConfigService.getConfig(region, taxYear);

    if (!config || !config.nationalInsurance) {
      // For Ireland, which uses PRSI instead
      if (region === TaxRegion.IRELAND) {
        return this.calculateIrishPRSI(weeklySalary);
      }
      return 0;
    }

    let ni = 0;
    let remainingSalary = weeklySalary;
    let previousThreshold = 0;

    for (const threshold of config.nationalInsurance.employeeThresholds) {
      const taxableAmount = Math.min(
        Math.max(0, remainingSalary),
        threshold.threshold - previousThreshold
      );

      ni += taxableAmount * threshold.rate;
      remainingSalary -= taxableAmount;
      previousThreshold = threshold.threshold;

      if (remainingSalary <= 0) break;
    }

    return ni;
  }

  private calculateIrishPRSI(weeklySalary: number): number {
    // Irish PRSI Class A rates
    if (weeklySalary <= 352) {
      return 0;
    }
    return weeklySalary * 0.04; // 4% standard rate
  }

  calculateNetPay(calculation: PayrollCalculation & { region?: TaxRegion }): {
    basicPay: number;
    overtimePay: number;
    totalDeductions: number;
    tax: number;
    nationalInsurance: number;
    netPay: number;
  } {
    const region = calculation.region || TaxRegion.UK;
    const basicPay = this.calculateBasicPay(calculation.hoursWorked, calculation.hourlyRate);
    const overtimePay = this.calculateOvertimePay(calculation.overtimeHours, calculation.overtimeRate);
    const grossPay = basicPay + overtimePay;

    // Calculate annual equivalent for tax
    const annualizedPay = grossPay * 52;
    const weeklyTax = this.calculateTax(annualizedPay, region) / 52;
    const nationalInsurance = this.calculateNationalInsurance(grossPay, region);

    const totalDeductions = calculation.deductions.reduce(
      (total, deduction) => total + deduction.amount,
      0
    );

    const netPay = grossPay - weeklyTax - nationalInsurance - totalDeductions;

    return {
      basicPay,
      overtimePay,
      totalDeductions,
      tax: weeklyTax,
      nationalInsurance,
      netPay
    };
  }
}



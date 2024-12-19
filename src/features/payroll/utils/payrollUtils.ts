import { PayPeriod } from '../types';

export function calculatePayPeriodDates(period: PayPeriod, referenceDate: Date = new Date()) {
  const date = new Date(referenceDate);
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case PayPeriod.WEEKLY:
      // Start from Monday of the current week
      startDate = new Date(date.setDate(date.getDate() - date.getDay() + 1));
      endDate = new Date(date.setDate(date.getDate() + 6));
      break;

    case PayPeriod.BIWEEKLY:
      // Start from Monday of the current week, for two weeks
      startDate = new Date(date.setDate(date.getDate() - date.getDay() + 1));
      endDate = new Date(date.setDate(date.getDate() + 13));
      break;

    case PayPeriod.MONTHLY:
      // Start from first day of the current month
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      break;

    default:
      throw new Error('Invalid pay period');
  }

  return { startDate, endDate };
}

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency
  }).format(amount);
}

export function calculateProRata(
  annualSalary: number,
  startDate: Date,
  endDate: Date
): number {
  const daysInYear = 365;
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  
  const periodDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / millisecondsInDay
  );
  
  return (annualSalary / daysInYear) * periodDays;
}

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // 0 is Sunday, 6 is Saturday
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}



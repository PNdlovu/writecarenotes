import { Currency, RegionalFormat } from '../types/financial.types';

/**
 * Format a number as currency with regional settings
 * @param amount - The amount to format
 * @param currency - The currency configuration
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency.code, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a percentage with regional settings
 * @param value - The value to format as percentage
 * @param format - Regional format settings
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  format: RegionalFormat,
  decimals: number = 1
): string {
  return new Intl.NumberFormat(format.numberFormat, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a date according to regional settings
 * @param date - The date to format
 * @param format - Date format string or regional settings
 * @returns Formatted date string
 */
export function formatDate(date: Date | null, format: string): string {
  if (!date) return 'N/A';
  
  try {
    return new Intl.DateTimeFormat(format, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a number with regional settings
 * @param value - The number to format
 * @param format - Regional format settings
 * @returns Formatted number string
 */
export function formatNumber(value: number, format: RegionalFormat): string {
  return new Intl.NumberFormat(format.numberFormat, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a monetary amount for screen readers
 * @param amount - The amount to format
 * @param currency - The currency configuration
 * @returns Accessible formatted string
 */
export function formatMonetaryValueForScreenReader(
  amount: number,
  currency: Currency
): string {
  const formatted = formatCurrency(amount, currency);
  return `${amount} ${currency.name}`;
}



import { Currency, MonetaryAmount } from '../types';

/**
 * Format a monetary amount according to the locale and currency
 */
export function formatCurrency(
  amount: number | MonetaryAmount,
  currency: string | Currency = 'GBP',
  locale: string = 'en-GB'
): string {
  const value = typeof amount === 'number' ? amount : amount.amount;
  const currencyCode = typeof currency === 'string' ? currency : currency.code;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

/**
 * Format a date according to the locale and format
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale: string = 'en-GB'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format,
  }).format(dateObj);
}

/**
 * Format a percentage value
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a period range
 */
export function formatPeriod(
  startDate: Date | string,
  endDate: Date | string,
  locale: string = 'en-GB'
): string {
  return `${formatDate(startDate, 'short', locale)} - ${formatDate(endDate, 'short', locale)}`;
} 



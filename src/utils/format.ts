/**
 * @writecarenotes.com
 * @fileoverview Utility functions for formatting values
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Collection of utility functions for formatting various types of values
 * including bytes, dates, times, and numbers. Used across the application
 * for consistent data presentation.
 */

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${BYTE_UNITS[i]}`;
}

/**
 * Format a date into a relative time string
 */
export function formatDistanceToNow(date: number | Date): string {
  const now = Date.now();
  const timestamp = date instanceof Date ? date.getTime() : date;
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 30) return 'just now';
  if (seconds < 60) return 'less than a minute ago';
  if (seconds < 120) return '1 minute ago';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 120) return '1 hour ago';

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  if (hours < 48) return 'yesterday';

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weeks ago`;
  if (weeks < 8) return '1 month ago';

  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} months ago`;
  if (months < 24) return '1 year ago';

  const years = Math.floor(months / 12);
  return `${years} years ago`;
}

/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format a date according to the user's locale
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(undefined, options).format(d);
}

/**
 * Format a time duration in milliseconds to a human readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format a file size in bytes to a human readable string
 */
export function formatFileSize(bytes: number): string {
  return formatBytes(bytes, 1);
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a currency value
 */
export function formatCurrency(
  value: number,
  currency = 'GBP',
  locale = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phone: string): string {
  // UK format: +44 (0) 1234 567890
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(?:44|0)?(\d{4})(\d{6})$/);
  
  if (match) {
    return `+44 (0) ${match[1]} ${match[2]}`;
  }
  
  return phone;
} 
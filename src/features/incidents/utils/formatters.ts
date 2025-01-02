/**
 * @writecarenotes.com
 * @fileoverview Date and time formatting utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utility functions for formatting dates, times, and other data
 * in the incident management system. Implements localization
 * support and consistent formatting across the application.
 */

/**
 * Format a date to a localized string
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a time to a localized string
 */
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date and time to a localized string
 */
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format a duration in minutes to a human-readable string
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
}; 
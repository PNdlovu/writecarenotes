/**
 * @writecarenotes.com
 * @fileoverview Export service for medication data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for exporting medication data to various formats,
 * with support for transaction history and stock reports.
 */

import { format } from 'date-fns';
import type { StockTransaction, StockLevel } from '../types';

export class ExportService {
  /**
   * Convert array to CSV string
   */
  private arrayToCSV(
    items: any[],
    columns: { key: string; header: string }[]
  ): string {
    // Add headers
    const headers = columns.map(col => col.header).join(',');
    
    // Convert data to CSV rows
    const rows = items.map(item => 
      columns
        .map(col => {
          const value = this.getNestedValue(item, col.key);
          return this.formatCSVValue(value);
        })
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Get nested object value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => 
      current ? current[key] : undefined, obj
    );
  }

  /**
   * Format value for CSV
   */
  private formatCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return format(value, 'yyyy-MM-dd HH:mm:ss');
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value}"`;
    }
    return String(value);
  }

  /**
   * Download CSV file
   */
  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export transaction history to CSV
   */
  exportTransactions(transactions: StockTransaction[]): void {
    const columns = [
      { key: 'transactionDate', header: 'Date' },
      { key: 'type', header: 'Type' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'batchNumber', header: 'Batch Number' },
      { key: 'stockLevelBefore', header: 'Stock Before' },
      { key: 'stockLevelAfter', header: 'Stock After' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'receivedBy', header: 'Received By' },
      { key: 'adjustedBy', header: 'Adjusted By' },
      { key: 'witness', header: 'Witness' },
      { key: 'reason', header: 'Reason' },
      { key: 'notes', header: 'Notes' }
    ];

    const csv = this.arrayToCSV(transactions, columns);
    const filename = `medication_transactions_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
    this.downloadCSV(csv, filename);
  }

  /**
   * Export expiring stock to CSV
   */
  exportExpiringStock(stock: StockLevel[]): void {
    const columns = [
      { key: 'medicationId', header: 'Medication ID' },
      { key: 'batchNumber', header: 'Batch Number' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'expiryDate', header: 'Expiry Date' },
      { key: 'reorderLevel', header: 'Reorder Level' },
      { key: 'criticalLevel', header: 'Critical Level' },
      { key: 'lastUpdated', header: 'Last Updated' }
    ];

    const csv = this.arrayToCSV(stock, columns);
    const filename = `expiring_stock_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
    this.downloadCSV(csv, filename);
  }
} 



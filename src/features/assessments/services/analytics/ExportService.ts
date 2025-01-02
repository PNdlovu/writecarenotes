import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface ExportOptions {
  format: 'csv' | 'json';
  filename?: string;
  includeTimestamp?: boolean;
}

export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportData(data: any[], options: ExportOptions): Promise<void> {
    const timestamp = options.includeTimestamp 
      ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}`
      : '';
    
    const filename = options.filename 
      ? `${options.filename}${timestamp}`
      : `analytics_export${timestamp}`;

    if (options.format === 'csv') {
      await this.exportToCsv(data, filename);
    } else {
      await this.exportToJson(data, filename);
    }
  }

  private async exportToCsv(data: any[], filename: string): Promise<void> {
    if (!data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle special cases
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          if (value instanceof Date) {
            return format(value, 'yyyy-MM-dd HH:mm:ss');
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  private async exportToJson(data: any[], filename: string): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);
  }

  async exportChart(chartElement: HTMLElement, filename: string): Promise<void> {
    try {
      // Convert chart SVG to image
      const svgData = new XMLSerializer().serializeToString(
        chartElement.querySelector('svg')
      );
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Set canvas size to match SVG
      const svgSize = chartElement.getBoundingClientRect();
      canvas.width = svgSize.width;
      canvas.height = svgSize.height;

      // Create image from SVG
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          // Convert canvas to blob and save
          canvas.toBlob(blob => {
            if (blob) {
              saveAs(blob, `${filename}.png`);
              resolve();
            } else {
              reject(new Error('Failed to create image blob'));
            }
          }, 'image/png');
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
      });
    } catch (error) {
      console.error('Failed to export chart:', error);
      throw error;
    }
  }
}

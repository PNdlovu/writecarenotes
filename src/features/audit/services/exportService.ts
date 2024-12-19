/**
 * @fileoverview Audit export service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AuditLogEntry } from '../types/audit.types';
import { ExportOptions, ExportField } from '../types/export.types';
import { format } from 'date-fns';
import PDFDocument from 'pdfkit';

export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportData(logs: AuditLogEntry[], options: ExportOptions): Promise<Buffer> {
    switch (options.format) {
      case 'CSV':
        return this.exportToCSV(logs, options);
      case 'JSON':
        return this.exportToJSON(logs, options);
      case 'PDF':
        return this.exportToPDF(logs, options);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private async exportToCSV(logs: AuditLogEntry[], options: ExportOptions): Promise<Buffer> {
    const { customization, csvOptions = {} } = options;
    const { delimiter = ',', includeHeaders = true, quoteStrings = true } = csvOptions;
    const fields = customization.fields;

    // Generate headers
    const headers = includeHeaders
      ? fields.map(f => f.label).join(delimiter)
      : '';

    // Generate rows
    const rows = logs.map(log => {
      return fields
        .map(field => {
          const value = this.formatValue(log[field.key], field, customization.dateFormat);
          return quoteStrings && typeof value === 'string'
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(delimiter);
    });

    // Combine headers and rows
    const csvContent = [
      ...(includeHeaders ? [headers] : []),
      ...rows,
    ].join('\n');

    return Buffer.from(csvContent);
  }

  private async exportToJSON(logs: AuditLogEntry[], options: ExportOptions): Promise<Buffer> {
    const { customization } = options;
    const fields = customization.fields;

    const formattedLogs = logs.map(log => {
      const formattedLog: Record<string, any> = {};
      fields.forEach(field => {
        formattedLog[field.key] = this.formatValue(
          log[field.key],
          field,
          customization.dateFormat
        );
      });
      return formattedLog;
    });

    return Buffer.from(JSON.stringify({
      title: customization.title,
      subtitle: customization.subtitle,
      generatedAt: new Date().toISOString(),
      data: formattedLogs,
    }, null, 2));
  }

  private async exportToPDF(logs: AuditLogEntry[], options: ExportOptions): Promise<Buffer> {
    const { customization, pdfOptions = {} } = options;
    const {
      pageSize = 'A4',
      orientation = 'portrait',
      margins = { top: 50, bottom: 50, left: 50, right: 50 },
      headerOnEveryPage = true,
      footerOnEveryPage = true,
    } = pdfOptions;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: pageSize,
        layout: orientation,
        margins: margins,
      });

      // Collect PDF data chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add header
      this.addPDFHeader(doc, customization);

      // Add table headers
      const fields = customization.fields;
      const colWidths = this.calculateColumnWidths(fields, doc.page.width - margins.left - margins.right);
      let y = doc.y;

      // Draw header row
      fields.forEach((field, i) => {
        const x = margins.left + colWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
        doc.text(field.label, x, y, { width: colWidths[i], align: 'left' });
      });

      doc.moveDown();
      y = doc.y;

      // Draw horizontal line
      doc.moveTo(margins.left, y)
         .lineTo(doc.page.width - margins.right, y)
         .stroke();
      doc.moveDown();

      // Add rows
      logs.forEach((log, index) => {
        // Check if we need a new page
        if (doc.y > doc.page.height - margins.bottom - 50) {
          doc.addPage();
          if (headerOnEveryPage) {
            this.addPDFHeader(doc, customization);
          }
          doc.y = margins.top;
        }

        // Draw row
        fields.forEach((field, i) => {
          const x = margins.left + colWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
          const value = this.formatValue(log[field.key], field, customization.dateFormat);
          doc.text(String(value), x, doc.y, { width: colWidths[i], align: 'left' });
        });

        doc.moveDown();
      });

      // Add footer on each page if enabled
      if (footerOnEveryPage) {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          this.addPDFFooter(doc, i + 1, pages.count);
        }
      }

      // Finalize PDF
      doc.end();
    });
  }

  private formatValue(
    value: any,
    field: ExportField,
    dateFormat: string = 'PPpp'
  ): string {
    if (value === null || value === undefined) return '';
    if (field.format) return field.format(value);
    if (value instanceof Date) return format(value, dateFormat);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private calculateColumnWidths(fields: ExportField[], totalWidth: number): number[] {
    const minWidth = 50;
    const weights = {
      timestamp: 2,
      entityType: 1.5,
      entityId: 1.5,
      action: 1,
      status: 1,
      default: 1,
    };

    const totalWeight = fields.reduce(
      (sum, field) => sum + (weights[field.key as keyof typeof weights] || weights.default),
      0
    );

    return fields.map(field => {
      const weight = weights[field.key as keyof typeof weights] || weights.default;
      return Math.max(minWidth, (totalWidth * weight) / totalWeight);
    });
  }

  private addPDFHeader(doc: PDFKit.PDFDocument, customization: ExportOptions['customization']): void {
    const { title, subtitle } = customization;
    
    doc.fontSize(20)
       .text(title || 'Audit Log Report', { align: 'center' })
       .moveDown(0.5)
       .fontSize(12)
       .text(subtitle || '', { align: 'center' })
       .moveDown();
  }

  private addPDFFooter(doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number): void {
    doc.fontSize(10)
       .text(
         `Page ${pageNumber} of ${totalPages}`,
         doc.page.margins.left,
         doc.page.height - doc.page.margins.bottom - 20,
         { align: 'center' }
       );
  }
} 



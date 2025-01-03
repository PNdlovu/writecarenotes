/**
 * @fileoverview Export Templates Handler
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handles generation of CSV and PDF exports for financial reports
 */

import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

interface ExportOptions {
  title: string;
  period: string;
  organizationId: string;
  format: 'csv' | 'pdf';
  template?: string;
  locale?: string;
}

export async function generateExport(data: any, options: ExportOptions): Promise<Buffer> {
  switch (options.format) {
    case 'csv':
      return generateCSV(data, options);
    case 'pdf':
      return generatePDF(data, options);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

async function generateCSV(data: any, options: ExportOptions): Promise<Buffer> {
  try {
    const fields = getFieldsForTemplate(options.template);
    const parser = new Parser({ fields });
    const csv = parser.parse(flattenData(data));
    return Buffer.from(csv);
  } catch (error) {
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
}

async function generatePDF(data: any, options: ExportOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add header
      doc.fontSize(18)
         .text(options.title, { align: 'center' })
         .moveDown();

      doc.fontSize(12)
         .text(`Period: ${options.period}`)
         .text(`Generated: ${new Date().toLocaleString(options.locale)}`)
         .moveDown();

      // Add content based on template
      addPDFContent(doc, data, options.template);

      doc.end();
    } catch (error) {
      reject(new Error(`Failed to generate PDF: ${error.message}`));
    }
  });
}

function getFieldsForTemplate(template = 'default'): string[] {
  const templates = {
    default: [
      'period',
      'totalTransactions',
      'totalVolume',
      'successRate',
      'averageLatency',
      'errorRate',
    ],
    detailed: [
      'period',
      'totalTransactions',
      'totalVolume',
      'successRate',
      'averageLatency',
      'errorRate',
      'uniqueUsers',
      'topCurrencyPairs',
      'volumeByRegion',
      'errorsByType',
    ],
    regulatory: [
      'period',
      'totalTransactions',
      'complianceRate',
      'rateLimitBreaches',
      'auditLog',
      'regulatoryBody',
      'complianceStatus',
    ],
  };

  return templates[template] || templates.default;
}

function flattenData(data: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenData(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

function addPDFContent(doc: PDFKit.PDFDocument, data: any, template = 'default'): void {
  const fields = getFieldsForTemplate(template);

  fields.forEach(field => {
    const value = data[field];
    if (value !== undefined) {
      if (typeof value === 'object') {
        doc.text(`${formatFieldName(field)}:`)
           .moveDown(0.5);
        Object.entries(value).forEach(([k, v]) => {
          doc.text(`  ${k}: ${v}`, { indent: 20 });
        });
      } else {
        doc.text(`${formatFieldName(field)}: ${value}`);
      }
      doc.moveDown(0.5);
    }
  });
}

function formatFieldName(field: string): string {
  return field
    .split(/(?=[A-Z])|[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 

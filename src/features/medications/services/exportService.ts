/**
 * @fileoverview Export Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { format, parseISO } from 'date-fns';
import type { Medication, StockHistory, MedicationOrder } from '../types';
import { 
  analyzeCorrelations, 
  analyzeSeasonality, 
  detectAnomalies,
  forecastDemand 
} from './medicationAnalytics';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  sections: ('usage' | 'forecast' | 'analysis' | 'orders')[];
  dateRange?: { from: Date; to: Date };
}

interface ExportStyles {
  header: {
    fontSize: number;
    bold: boolean;
    color: string;
    fillColor: string;
  };
  subheader: {
    fontSize: number;
    bold: boolean;
    color: string;
    fillColor: string;
  };
  cell: {
    fontSize: number;
    color: string;
  };
  alert: {
    color: string;
    fillColor: string;
  };
  warning: {
    color: string;
    fillColor: string;
  };
  success: {
    color: string;
    fillColor: string;
  };
}

const defaultStyles: ExportStyles = {
  header: {
    fontSize: 14,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#0F52BA',
  },
  subheader: {
    fontSize: 12,
    bold: true,
    color: '#000000',
    fillColor: '#F0F4F5',
  },
  cell: {
    fontSize: 10,
    color: '#000000',
  },
  alert: {
    color: '#FFFFFF',
    fillColor: '#DA291C',
  },
  warning: {
    color: '#000000',
    fillColor: '#FFB81C',
  },
  success: {
    color: '#FFFFFF',
    fillColor: '#00A499',
  },
};

/**
 * Generates CSV content
 */
function generateCSV(data: string[][]): string {
  return data.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') 
        ? `"${cell}"`
        : cell
    ).join(',')
  ).join('\n');
}

/**
 * Formats stock history for export
 */
function formatStockHistory(history: StockHistory[]): string[][] {
  const headers = ['Date', 'Type', 'Quantity', 'Balance', 'User'];
  const rows = history.map(entry => [
    format(parseISO(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    entry.type,
    entry.quantity.toString(),
    entry.balance.toString(),
    entry.user,
  ]);
  return [headers, ...rows];
}

/**
 * Formats orders for export
 */
function formatOrders(orders: MedicationOrder[]): string[][] {
  const headers = ['Order Date', 'Quantity', 'Status', 'Notes', 'Ordered By'];
  const rows = orders.map(order => [
    format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss'),
    order.quantity.toString(),
    order.status,
    order.notes || '',
    order.orderedBy,
  ]);
  return [headers, ...rows];
}

/**
 * Formats analytics for export
 */
function formatAnalytics(medication: Medication): string[][] {
  const seasonality = analyzeSeasonality(medication.stockHistory || []);
  const forecast = forecastDemand(medication.stockHistory || [], 30);
  const anomalies = detectAnomalies(
    (medication.stockHistory || [])
      .filter(entry => entry.type === 'OUT')
      .map(entry => ({
        date: parseISO(entry.timestamp),
        value: entry.quantity,
      }))
  );

  const headers = ['Metric', 'Value'];
  const rows = [
    ['Seasonality Strength', seasonality.seasonalityStrength.toFixed(2)],
    ['Peak Usage Months', Object.entries(seasonality.patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([month]) => month)
      .join(', ')
    ],
    ['30-Day Forecast', forecast[29].forecast.toString()],
    ['Forecast Confidence', `${(forecast[29].confidence * 100).toFixed(1)}%`],
    ['Anomalies Detected', anomalies.filter(a => a.isAnomaly).length.toString()],
  ];

  return [headers, ...rows];
}

function formatExcelWorksheet(worksheet: any, data: string[][], styles: ExportStyles) {
  // Set column widths
  const maxLengths = data[0].map((_, colIndex) => 
    Math.max(...data.map(row => row[colIndex]?.toString().length || 0))
  );
  maxLengths.forEach((length, i) => {
    worksheet['!cols'] = worksheet['!cols'] || [];
    worksheet['!cols'][i] = { wch: Math.min(50, Math.max(10, length + 2)) };
  });

  // Apply styles
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    for (let colIndex = 0; colIndex < data[rowIndex].length; colIndex++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      worksheet[cellRef].s = rowIndex === 0 ? {
        font: {
          bold: styles.header.bold,
          sz: styles.header.fontSize,
          color: { rgb: styles.header.color.replace('#', '') },
        },
        fill: {
          fgColor: { rgb: styles.header.fillColor.replace('#', '') },
        },
        alignment: { vertical: 'center', horizontal: 'center' },
      } : {
        font: {
          sz: styles.cell.fontSize,
          color: { rgb: styles.cell.color.replace('#', '') },
        },
        alignment: { vertical: 'center', horizontal: 'left' },
      };
    }
  }

  return worksheet;
}

function createPDFContent(sections: Record<string, string[][]>, styles: ExportStyles) {
  const content: any[] = [];

  Object.entries(sections).forEach(([name, data]) => {
    // Add section header
    content.push({
      text: name.toUpperCase(),
      style: 'sectionHeader',
      margin: [0, 10, 0, 5],
    });

    // Add table
    content.push({
      table: {
        headerRows: 1,
        widths: Array(data[0].length).fill('*'),
        body: data,
      },
      layout: {
        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) return styles.header.fillColor;
          return rowIndex % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        },
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#E5E7EB',
        vLineColor: () => '#E5E7EB',
      },
    });

    content.push({ text: '', margin: [0, 10] });
  });

  return content;
}

/**
 * Exports medication data in the specified format
 */
export async function exportMedicationData(
  medication: Medication,
  options: ExportOptions
): Promise<Blob> {
  const sections: Record<string, string[][]> = {};

  if (options.sections.includes('usage')) {
    sections.usage = formatStockHistory(medication.stockHistory || []);
  }

  if (options.sections.includes('orders')) {
    sections.orders = formatOrders(medication.orders || []);
  }

  if (options.sections.includes('analysis')) {
    sections.analysis = formatAnalytics(medication);
  }

  if (options.format === 'xlsx') {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    Object.entries(sections).forEach(([name, data]) => {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      formatExcelWorksheet(worksheet, data, defaultStyles);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  if (options.format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Add header
    doc.setFillColor(defaultStyles.header.fillColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(16);
    doc.text('Medication Report', 10, 15);

    // Add metadata
    doc.setTextColor('#000000');
    doc.setFontSize(10);
    doc.text([
      `Medication: ${medication.name}`,
      `Generated: ${format(new Date(), 'PPpp')}`,
      `Tenant: ${medication.tenantId}`,
    ], 10, 30);

    // Add content
    const content = createPDFContent(sections, defaultStyles);
    doc.autoTable({
      startY: 50,
      content,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      headStyles: {
        fillColor: [15, 82, 186],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
      },
    });

    return doc.output('blob');
  }

  // CSV format (default)
  const content = Object.entries(sections).map(([name, data]) => 
    `${name.toUpperCase()}\n${generateCSV(data)}\n\n`
  ).join('');

  return new Blob([content], { type: 'text/csv' });
} 



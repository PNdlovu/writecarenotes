import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ReportMetrics } from '../types/reports';
import { format } from 'date-fns';

interface ExportOptions {
  title: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const exportToPDF = (data: ReportMetrics, options: ExportOptions) => {
  const doc = new jsPDF();
  const { title, dateRange } = options;
  
  // Add title and date range
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(12);
  doc.text(
    `Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
    20,
    30
  );

  // Add summary metrics
  doc.setFontSize(14);
  doc.text('Summary', 20, 45);
  doc.setFontSize(10);
  doc.text([
    `Total Administrations: ${data.totalAdministrations}`,
    `Compliance Rate: ${(data.complianceRate * 100).toFixed(1)}%`,
    `Missed Doses: ${data.missedDoses}`,
    `Late Doses: ${data.lateDoses}`,
  ], 20, 55);

  // Add comparison if available
  if (data.comparison) {
    doc.setFontSize(14);
    doc.text('Previous Period Comparison', 20, 100);
    doc.setFontSize(10);
    doc.text([
      `Total Administrations: ${data.comparison.totalAdministrations}`,
      `Compliance Rate: ${(data.comparison.complianceRate * 100).toFixed(1)}%`,
      `Missed Doses: ${data.comparison.missedDoses}`,
      `Late Doses: ${data.comparison.lateDoses}`,
    ], 20, 110);
  }

  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

export const exportToExcel = (data: ReportMetrics, options: ExportOptions) => {
  const { title, dateRange } = options;
  
  // Prepare data for Excel
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Metric', 'Current Period', 'Previous Period'],
    ['Total Administrations', data.totalAdministrations, data.comparison?.totalAdministrations || ''],
    ['Compliance Rate', `${(data.complianceRate * 100).toFixed(1)}%`, data.comparison ? `${(data.comparison.complianceRate * 100).toFixed(1)}%` : ''],
    ['Missed Doses', data.missedDoses, data.comparison?.missedDoses || ''],
    ['Late Doses', data.lateDoses, data.comparison?.lateDoses || ''],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet([
    [`${title} - Summary`],
    [`Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`],
    [''],
    ...summaryData
  ]);
  
  // Daily trends sheet
  const trendsData = data.dailyTrend.map(day => [
    day.date,
    day.total,
    day.missed,
    day.late,
    `${(day.compliance * 100).toFixed(1)}%`
  ]);
  
  const trendsSheet = XLSX.utils.aoa_to_sheet([
    ['Date', 'Total', 'Missed', 'Late', 'Compliance'],
    ...trendsData
  ]);
  
  // Add sheets to workbook
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Daily Trends');
  
  // Save the Excel file
  XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};



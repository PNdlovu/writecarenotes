/**
 * @fileoverview Excel Report Generator
 * @version 1.0.0
 * @created 2024-03-21
 */

import ExcelJS from 'exceljs';
import { ReportData } from '../reporting';
import { ReportTemplate, TemplateSection } from '../templates';
import { formatDate, formatNumber } from '../utils';

export class ExcelGenerator {
  private static instance: ExcelGenerator;

  private constructor() {}

  public static getInstance(): ExcelGenerator {
    if (!ExcelGenerator.instance) {
      ExcelGenerator.instance = new ExcelGenerator();
    }
    return ExcelGenerator.instance;
  }

  /**
   * Generate an Excel report
   */
  public async generateExcel(
    reportData: ReportData,
    template: ReportTemplate
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Care Home Management System';
    workbook.lastModifiedBy = 'Care Home Management System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Add summary sheet
    await this.addSummarySheet(workbook, reportData, template);

    // Add section sheets
    for (const section of template.sections) {
      await this.addSectionSheet(workbook, section, reportData);
    }

    // Generate buffer
    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  /**
   * Add summary sheet to workbook
   */
  private async addSummarySheet(
    workbook: ExcelJS.Workbook,
    reportData: ReportData,
    template: ReportTemplate
  ) {
    const sheet = workbook.addWorksheet('Summary');

    // Add title
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = template.name;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add description
    sheet.mergeCells('A2:E2');
    const descCell = sheet.getCell('A2');
    descCell.value = template.description;
    descCell.alignment = { horizontal: 'center' };

    // Add generation time
    sheet.mergeCells('A3:E3');
    const timeCell = sheet.getCell('A3');
    timeCell.value = `Generated on: ${new Date().toLocaleString()}`;
    timeCell.alignment = { horizontal: 'center' };

    // Add report sections summary
    sheet.addRow([]);
    sheet.addRow(['Report Sections']);
    template.sections.forEach((section, index) => {
      sheet.addRow([
        `${index + 1}. ${section.title}`,
        `Type: ${section.type}`,
        `Layout: ${section.layout}`
      ]);
    });

    // Add basic styling
    this.styleSheet(sheet);
  }

  /**
   * Add a section sheet to workbook
   */
  private async addSectionSheet(
    workbook: ExcelJS.Workbook,
    section: TemplateSection,
    reportData: ReportData
  ) {
    const sheet = workbook.addWorksheet(section.title);

    // Add section title
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = section.title;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    sheet.addRow([]);

    switch (section.type) {
      case 'metrics':
        await this.addMetricsData(sheet, section, reportData);
        break;
      case 'health':
        await this.addHealthData(sheet, section, reportData);
        break;
      case 'trends':
        await this.addTrendsData(sheet, section, reportData);
        break;
      case 'anomalies':
        await this.addAnomaliesData(sheet, section, reportData);
        break;
      case 'incidents':
        await this.addIncidentsData(sheet, section, reportData);
        break;
    }

    // Add basic styling
    this.styleSheet(sheet);
  }

  /**
   * Add metrics data to sheet
   */
  private async addMetricsData(
    sheet: ExcelJS.Worksheet,
    section: TemplateSection,
    reportData: ReportData
  ) {
    // Add headers
    sheet.addRow(['Metric', 'Current Value', 'Threshold', 'Status']);

    // Add data
    section.metrics?.forEach(metric => {
      const data = reportData.data.metrics[metric];
      if (data && data.length > 0) {
        const latest = data[data.length - 1];
        sheet.addRow([
          metric,
          formatNumber(latest.value),
          formatNumber(latest.threshold),
          latest.value >= latest.threshold ? 'OK' : 'Warning'
        ]);
      }
    });

    // Add conditional formatting
    const dataRange = sheet.getColumn(4);
    dataRange.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: cell.value === 'OK' ? '00FF00' : 'FFFF00' }
        };
      }
    });
  }

  /**
   * Add health data to sheet
   */
  private async addHealthData(
    sheet: ExcelJS.Worksheet,
    section: TemplateSection,
    reportData: ReportData
  ) {
    // Add headers
    sheet.addRow(['Component', 'Health Score', 'Status', 'Last Updated']);

    // Add data
    reportData.data.healthScores
      .filter(h => section.components?.includes(h.component))
      .forEach(health => {
        sheet.addRow([
          health.component,
          formatNumber(health.score),
          health.status,
          formatDate(health.lastUpdated)
        ]);
      });

    // Add conditional formatting
    const statusRange = sheet.getColumn(3);
    statusRange.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        const color = {
          healthy: '00FF00',
          warning: 'FFFF00',
          critical: 'FF0000'
        }[cell.value as string] || 'FFFFFF';

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        };
      }
    });
  }

  /**
   * Add trends data to sheet
   */
  private async addTrendsData(
    sheet: ExcelJS.Worksheet,
    section: TemplateSection,
    reportData: ReportData
  ) {
    // Add headers
    sheet.addRow(['Component', 'Timestamp', 'Score', 'Status']);

    // Add data
    Object.entries(reportData.data.trends)
      .filter(([component]) => section.components?.includes(component))
      .forEach(([component, trends]) => {
        trends.forEach(trend => {
          sheet.addRow([
            component,
            formatDate(trend.timestamp),
            formatNumber(trend.score),
            trend.status
          ]);
        });
      });

    // Add conditional formatting
    const statusRange = sheet.getColumn(4);
    statusRange.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        const color = {
          healthy: '00FF00',
          warning: 'FFFF00',
          critical: 'FF0000'
        }[cell.value as string] || 'FFFFFF';

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        };
      }
    });
  }

  /**
   * Add anomalies data to sheet
   */
  private async addAnomaliesData(
    sheet: ExcelJS.Worksheet,
    section: TemplateSection,
    reportData: ReportData
  ) {
    // Add headers
    sheet.addRow(['Metric', 'Value', 'Expected', 'Deviation', 'Severity', 'Time']);

    // Add data
    reportData.data.anomalies.forEach(anomaly => {
      const deviation = ((anomaly.value - anomaly.expectedValue) / anomaly.expectedValue) * 100;
      sheet.addRow([
        anomaly.metric,
        formatNumber(anomaly.value),
        formatNumber(anomaly.expectedValue),
        `${formatNumber(deviation)}%`,
        anomaly.severity,
        formatDate(anomaly.timestamp)
      ]);
    });

    // Add conditional formatting
    const severityRange = sheet.getColumn(5);
    severityRange.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        const color = {
          low: '00FF00',
          medium: 'FFFF00',
          high: 'FF0000'
        }[cell.value as string] || 'FFFFFF';

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        };
      }
    });
  }

  /**
   * Add incidents data to sheet
   */
  private async addIncidentsData(
    sheet: ExcelJS.Worksheet,
    section: TemplateSection,
    reportData: ReportData
  ) {
    // Add headers
    sheet.addRow(['Type', 'Description', 'Severity', 'Status', 'Time']);

    // Add data
    reportData.data.incidents.forEach(incident => {
      sheet.addRow([
        incident.type,
        incident.description,
        incident.severity,
        incident.status,
        formatDate(incident.timestamp)
      ]);
    });

    // Add conditional formatting
    const severityRange = sheet.getColumn(3);
    severityRange.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        const color = {
          low: '00FF00',
          medium: 'FFFF00',
          high: 'FF0000'
        }[cell.value as string] || 'FFFFFF';

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        };
      }
    });
  }

  /**
   * Apply basic styling to a worksheet
   */
  private styleSheet(sheet: ExcelJS.Worksheet) {
    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = Math.max(
        ...sheet.getColumn(column.number).values.map(v => 
          v ? v.toString().length : 0
        )
      ) + 2;
    });

    // Style headers
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0E0E0' }
    };

    // Add borders
    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  }
} 

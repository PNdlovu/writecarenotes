/**
 * @fileoverview PDF Report Generator
 * @version 1.0.0
 * @created 2024-03-21
 */

import PDFDocument from 'pdfkit';
import { ReportData } from '../reporting';
import { ReportTemplate, TemplateSection } from '../templates';
import { formatDate, formatNumber } from '../utils';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export class PDFGenerator {
  private static instance: PDFGenerator;
  private chartRenderer: ChartJSNodeCanvas;

  private constructor() {
    this.chartRenderer = new ChartJSNodeCanvas({
      width: 800,
      height: 400,
      backgroundColour: 'white'
    });
  }

  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  /**
   * Generate a PDF report
   */
  public async generatePDF(
    reportData: ReportData,
    template: ReportTemplate
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: template.name,
        Author: 'Care Home Management System',
        Subject: template.description,
        Keywords: 'report, metrics, health, monitoring'
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => Buffer.concat(chunks));

    // Add header
    await this.addHeader(doc, template);

    // Add sections
    for (const section of template.sections) {
      await this.addSection(doc, section, reportData);
    }

    // Add footer
    this.addFooter(doc, reportData);

    doc.end();
    return Buffer.concat(chunks);
  }

  /**
   * Add header to the PDF
   */
  private async addHeader(doc: PDFKit.PDFDocument, template: ReportTemplate) {
    if (template.branding?.logo) {
      doc.image(template.branding.logo, 50, 45, { width: 50 });
      doc.moveDown();
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(template.name, { align: 'center' })
      .moveDown()
      .fontSize(12)
      .text(template.description, { align: 'center' })
      .moveDown()
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);
  }

  /**
   * Add a section to the PDF
   */
  private async addSection(
    doc: PDFKit.PDFDocument,
    section: TemplateSection,
    reportData: ReportData
  ) {
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(section.title)
      .moveDown();

    switch (section.type) {
      case 'metrics':
        await this.addMetricsSection(doc, section, reportData);
        break;
      case 'health':
        await this.addHealthSection(doc, section, reportData);
        break;
      case 'trends':
        await this.addTrendsSection(doc, section, reportData);
        break;
      case 'anomalies':
        await this.addAnomaliesSection(doc, section, reportData);
        break;
      case 'incidents':
        await this.addIncidentsSection(doc, section, reportData);
        break;
    }

    doc.moveDown(2);
  }

  /**
   * Add metrics section
   */
  private async addMetricsSection(
    doc: PDFKit.PDFDocument,
    section: TemplateSection,
    reportData: ReportData
  ) {
    if (section.layout === 'chart' && section.chartType) {
      const chartData = this.prepareChartData(section, reportData);
      const chartBuffer = await this.generateChart(
        section.chartType,
        chartData,
        section.title
      );
      doc.image(chartBuffer, { fit: [500, 300], align: 'center' });
    } else {
      const table = this.createTable(doc, ['Metric', 'Value', 'Threshold']);
      section.metrics?.forEach(metric => {
        const data = reportData.data.metrics[metric];
        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          table.addRow([
            metric,
            formatNumber(latest.value),
            formatNumber(latest.threshold)
          ]);
        }
      });
    }
  }

  /**
   * Add health section
   */
  private async addHealthSection(
    doc: PDFKit.PDFDocument,
    section: TemplateSection,
    reportData: ReportData
  ) {
    if (section.layout === 'chart' && section.chartType === 'radar') {
      const healthData = reportData.data.healthScores.filter(h =>
        section.components?.includes(h.component)
      );
      const chartBuffer = await this.generateRadarChart(healthData);
      doc.image(chartBuffer, { fit: [500, 300], align: 'center' });
    } else {
      const table = this.createTable(doc, ['Component', 'Score', 'Status']);
      reportData.data.healthScores
        .filter(h => section.components?.includes(h.component))
        .forEach(health => {
          table.addRow([
            health.component,
            formatNumber(health.score),
            health.status
          ]);
        });
    }
  }

  /**
   * Add trends section
   */
  private async addTrendsSection(
    doc: PDFKit.PDFDocument,
    section: TemplateSection,
    reportData: ReportData
  ) {
    if (section.layout === 'chart') {
      const trendsData = Object.entries(reportData.data.trends)
        .filter(([component]) => section.components?.includes(component))
        .map(([component, trends]) => ({
          component,
          data: trends
        }));

      const chartBuffer = await this.generateTrendsChart(
        trendsData,
        section.chartType || 'line'
      );
      doc.image(chartBuffer, { fit: [500, 300], align: 'center' });
    }
  }

  /**
   * Add anomalies section
   */
  private async addAnomaliesSection(
    doc: PDFKit.PDFDocument,
    section: TemplateSection,
    reportData: ReportData
  ) {
    const table = this.createTable(doc, [
      'Metric',
      'Value',
      'Expected',
      'Severity',
      'Time'
    ]);

    reportData.data.anomalies.forEach(anomaly => {
      table.addRow([
        anomaly.metric,
        formatNumber(anomaly.value),
        formatNumber(anomaly.expectedValue),
        anomaly.severity,
        formatDate(anomaly.timestamp)
      ]);
    });
  }

  /**
   * Add incidents section
   */
  private async addIncidentsSection(
    doc: PDFKit.PDFDocument,
    section: TemplateSection,
    reportData: ReportData
  ) {
    const table = this.createTable(doc, [
      'Type',
      'Description',
      'Severity',
      'Time'
    ]);

    reportData.data.incidents.forEach(incident => {
      table.addRow([
        incident.type,
        incident.description,
        incident.severity,
        formatDate(incident.timestamp)
      ]);
    });
  }

  /**
   * Add footer to the PDF
   */
  private addFooter(doc: PDFKit.PDFDocument, reportData: ReportData) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .text(
          `Report ID: ${reportData.id} | Generated: ${new Date().toLocaleString()} | Page ${
            i + 1
          } of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }
  }

  /**
   * Create a table in the PDF
   */
  private createTable(doc: PDFKit.PDFDocument, headers: string[]) {
    const table = {
      headers,
      rows: [] as string[][],
      addRow(row: string[]) {
        this.rows.push(row);
      },
      draw() {
        const columnWidth = 400 / headers.length;
        
        // Draw headers
        doc
          .font('Helvetica-Bold')
          .fontSize(10);
        
        headers.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), doc.y, {
            width: columnWidth,
            align: 'left'
          });
        });
        
        doc.moveDown();
        
        // Draw rows
        doc.font('Helvetica').fontSize(10);
        this.rows.forEach(row => {
          const rowHeight = row.reduce((height, cell) => {
            const cellHeight = doc.heightOfString(cell, {
              width: columnWidth,
              align: 'left'
            });
            return Math.max(height, cellHeight);
          }, 0);

          row.forEach((cell, i) => {
            doc.text(cell, 50 + (i * columnWidth), doc.y, {
              width: columnWidth,
              align: 'left'
            });
          });
          
          doc.moveDown();
        });
      }
    };

    return table;
  }

  /**
   * Generate a chart using Chart.js
   */
  private async generateChart(
    type: string,
    data: any,
    title: string
  ): Promise<Buffer> {
    const configuration = {
      type,
      data,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          }
        }
      }
    };

    return this.chartRenderer.renderToBuffer(configuration);
  }

  /**
   * Prepare chart data from metrics
   */
  private prepareChartData(section: TemplateSection, reportData: ReportData) {
    const datasets = section.metrics?.map(metric => {
      const data = reportData.data.metrics[metric];
      return {
        label: metric,
        data: data.map(d => d.value),
        borderColor: this.getRandomColor(),
        fill: false
      };
    });

    return {
      labels: reportData.data.metrics[section.metrics?.[0] || '']?.map(d =>
        formatDate(d.timestamp)
      ),
      datasets: datasets || []
    };
  }

  /**
   * Generate a random color for charts
   */
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
} 

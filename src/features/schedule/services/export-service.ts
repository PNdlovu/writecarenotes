import { HandoverSession } from '../types/handover';
import { HandoverReport } from './reporting-service';
import { Parser } from 'json2csv';
import { create as createXMLBuilder } from 'xmlbuilder2';
import JSZip from 'jszip';

interface ExportOptions {
  format: 'csv' | 'xml' | 'json' | 'zip';
  sections?: ('tasks' | 'quality' | 'staff' | 'compliance')[];
  includeAttachments?: boolean;
  dateFormat?: string;
}

export class ExportService {
  async exportReport(report: HandoverReport, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(report, options);
      case 'xml':
        return this.exportToXML(report, options);
      case 'json':
        return this.exportToJSON(report, options);
      case 'zip':
        return this.exportToZip(report, options);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private async exportToCSV(report: HandoverReport, options: ExportOptions): Promise<Blob> {
    const sections = options.sections || ['tasks', 'quality', 'staff', 'compliance'];
    const csvData: Record<string, any>[] = [];

    if (sections.includes('tasks')) {
      Object.entries(report.tasks.byCategory).forEach(([category, count]) => {
        csvData.push({
          type: 'task',
          category,
          count,
          completionRate: `${(count / report.tasks.total * 100).toFixed(1)}%`,
        });
      });
    }

    if (sections.includes('quality')) {
      csvData.push({
        type: 'quality',
        passed: report.quality.passed,
        failed: report.quality.failed,
        pending: report.quality.pending,
        criticalIssues: report.quality.criticalIssues,
      });
    }

    if (sections.includes('staff')) {
      Object.entries(report.staff.completionRates).forEach(([staffId, rate]) => {
        csvData.push({
          type: 'staff',
          staffId,
          completionRate: `${(rate * 100).toFixed(1)}%`,
          tasksAssigned: report.staff.tasksPerStaff[staffId],
          qualityChecks: report.staff.qualityCheckContribution[staffId],
        });
      });
    }

    if (sections.includes('compliance')) {
      csvData.push({
        type: 'compliance',
        overallCompliance: `${(report.compliance.overallCompliance * 100).toFixed(1)}%`,
        criticalViolations: report.compliance.criticalViolations.length,
        missingDocuments: report.compliance.missingDocumentation.length,
      });
    }

    const parser = new Parser({
      fields: Object.keys(csvData[0] || {}),
    });

    const csv = parser.parse(csvData);
    return new Blob([csv], { type: 'text/csv' });
  }

  private async exportToXML(report: HandoverReport, options: ExportOptions): Promise<Blob> {
    const sections = options.sections || ['tasks', 'quality', 'staff', 'compliance'];
    const xmlObj = {
      handoverReport: {
        '@timestamp': report.generatedAt.toISOString(),
        '@sessionId': report.sessionId,
        period: {
          start: report.period.start.toISOString(),
          end: report.period.end.toISOString(),
        },
      },
    };

    if (sections.includes('tasks')) {
      xmlObj.handoverReport.tasks = {
        '@total': report.tasks.total,
        '@completed': report.tasks.completed,
        categories: {
          category: Object.entries(report.tasks.byCategory).map(([name, count]) => ({
            '@name': name,
            '@count': count,
          })),
        },
      };
    }

    if (sections.includes('quality')) {
      xmlObj.handoverReport.quality = {
        '@passed': report.quality.passed,
        '@failed': report.quality.failed,
        '@pending': report.quality.pending,
        '@criticalIssues': report.quality.criticalIssues,
        categories: {
          category: Object.entries(report.quality.byCategory).map(([name, count]) => ({
            '@name': name,
            '@count': count,
          })),
        },
      };
    }

    if (sections.includes('staff')) {
      xmlObj.handoverReport.staff = {
        '@total': report.staff.totalStaff,
        member: Object.entries(report.staff.completionRates).map(([staffId, rate]) => ({
          '@id': staffId,
          '@completionRate': rate,
          '@tasksAssigned': report.staff.tasksPerStaff[staffId],
          '@qualityChecks': report.staff.qualityCheckContribution[staffId],
        })),
      };
    }

    if (sections.includes('compliance')) {
      xmlObj.handoverReport.compliance = {
        '@overallCompliance': report.compliance.overallCompliance,
        criticalViolations: {
          violation: report.compliance.criticalViolations,
        },
        missingDocuments: {
          document: report.compliance.missingDocumentation,
        },
      };
    }

    const xml = createXMLBuilder(xmlObj).end({ prettyPrint: true });
    return new Blob([xml], { type: 'application/xml' });
  }

  private async exportToJSON(report: HandoverReport, options: ExportOptions): Promise<Blob> {
    const sections = options.sections || ['tasks', 'quality', 'staff', 'compliance'];
    const filteredReport: Partial<HandoverReport> = {
      sessionId: report.sessionId,
      period: report.period,
      generatedAt: report.generatedAt,
    };

    sections.forEach(section => {
      filteredReport[section] = report[section];
    });

    return new Blob([JSON.stringify(filteredReport, null, 2)], {
      type: 'application/json',
    });
  }

  private async exportToZip(report: HandoverReport, options: ExportOptions): Promise<Blob> {
    const zip = new JSZip();

    // Add report in all formats
    const csv = await this.exportToCSV(report, options);
    const xml = await this.exportToXML(report, options);
    const json = await this.exportToJSON(report, options);

    zip.file('report.csv', csv);
    zip.file('report.xml', xml);
    zip.file('report.json', json);

    // Add README
    zip.file(
      'README.txt',
      `Handover Report Export
Generated: ${report.generatedAt.toISOString()}
Session ID: ${report.sessionId}
Period: ${report.period.start.toISOString()} - ${report.period.end.toISOString()}

This archive contains:
- report.csv: CSV format of the report
- report.xml: XML format of the report
- report.json: JSON format of the report
${options.includeAttachments ? '- attachments/: Directory containing report attachments' : ''}`
    );

    return zip.generateAsync({ type: 'blob' });
  }
}

import { CareHomeService } from './CareHomeService';
import { TenantService } from './TenantService';
import type { CareHomeWithRelations } from '../types/carehome.types';
import { ComplianceReport } from '../types/compliance';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';

type ExportFormat = 'csv' | 'xlsx' | 'json';

interface ExportOptions {
  format: ExportFormat;
  includeRelations?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fields?: string[];
}

export class DataExportService {
  constructor(
    private careHomeService: CareHomeService,
    private tenantService: TenantService
  ) {}

  async exportCareHomeData(
    careHomeId: string,
    options: ExportOptions
  ): Promise<Blob> {
    const data = await this.gatherExportData(careHomeId, options);
    return this.formatExport(data, options.format);
  }

  async exportComplianceReport(
    careHomeId: string,
    format: ExportFormat
  ): Promise<Blob> {
    const report = await this.careHomeService.validateRegionalCompliance(careHomeId);
    return this.formatExport(this.flattenComplianceReport(report), format);
  }

  private async gatherExportData(
    careHomeId: string,
    options: ExportOptions
  ): Promise<any> {
    const careHome = await this.careHomeService.getCareHomeDetails(careHomeId);
    
    if (!options.includeRelations) {
      const { residents, staff, ...basicData } = careHome;
      return basicData;
    }

    if (options.dateRange) {
      const metrics = await this.careHomeService.getOperationalMetrics(
        careHomeId,
        options.dateRange
      );
      return { ...careHome, metrics };
    }

    return careHome;
  }

  private formatExport(data: any, format: ExportFormat): Blob {
    switch (format) {
      case 'csv':
        return this.exportToCsv(data);
      case 'xlsx':
        return this.exportToXlsx(data);
      case 'json':
        return new Blob(
          [JSON.stringify(data, null, 2)],
          { type: 'application/json' }
        );
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToCsv(data: any): Blob {
    const parser = new Parser({
      flatten: true
    });
    const csv = parser.parse(data);
    return new Blob([csv], { type: 'text/csv' });
  }

  private exportToXlsx(data: any): Blob {
    const worksheet = XLSX.utils.json_to_sheet(
      Array.isArray(data) ? data : [data]
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });
    
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  private flattenComplianceReport(report: ComplianceReport): any {
    return {
      careHomeId: report.careHomeId,
      region: report.region,
      timestamp: report.timestamp,
      overallStatus: report.overallStatus,
      criticalIssuesCount: report.criticalIssues.length,
      recommendationsCount: report.recommendations.length,
      nextReviewDate: report.nextReviewDate,
      regulations: report.regulations.map(reg => ({
        regulationId: reg.regulationId,
        status: reg.status,
        evidenceCount: reg.evidence.length,
        gapsCount: reg.gaps.length,
        actionRequired: reg.actionRequired,
        dueDate: reg.dueDate
      }))
    };
  }
}



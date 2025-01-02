/**
 * @fileoverview Report Template System
 * @version 1.0.0
 * @created 2024-03-21
 */

import { ComponentHealth, HealthTrend } from './health';

export interface TemplateSection {
  id: string;
  title: string;
  type: 'metrics' | 'health' | 'trends' | 'anomalies' | 'incidents' | 'custom';
  layout: 'table' | 'chart' | 'grid' | 'list';
  chartType?: 'line' | 'bar' | 'radar' | 'calendar' | 'bubble' | 'sunburst';
  metrics?: string[];
  components?: string[];
  timeRange?: {
    start: number;
    end: number;
  };
  customOptions?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'compliance' | 'performance' | 'incident' | 'financial' | 'custom';
  sections: TemplateSection[];
  layout: {
    columns: number;
    spacing: number;
  };
  branding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts?: {
      heading: string;
      body: string;
    };
  };
}

// Predefined templates
export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  'daily-summary': {
    id: 'daily-summary',
    name: 'Daily Summary Report',
    description: 'Overview of key metrics and health scores for the past 24 hours',
    type: 'performance',
    sections: [
      {
        id: 'health-overview',
        title: 'System Health Overview',
        type: 'health',
        layout: 'grid',
        components: ['residents', 'staff', 'medication', 'clinical', 'compliance']
      },
      {
        id: 'key-metrics',
        title: 'Key Performance Metrics',
        type: 'metrics',
        layout: 'chart',
        chartType: 'line',
        metrics: [
          'residents.occupancy',
          'staff.ratio',
          'medication.errors',
          'clinical.incidents'
        ]
      },
      {
        id: 'anomalies',
        title: 'Detected Anomalies',
        type: 'anomalies',
        layout: 'table'
      }
    ],
    layout: {
      columns: 2,
      spacing: 16
    }
  },
  'compliance-report': {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'Detailed compliance metrics and regulatory requirements',
    type: 'compliance',
    sections: [
      {
        id: 'compliance-scores',
        title: 'Compliance Scores',
        type: 'health',
        layout: 'chart',
        chartType: 'radar',
        components: ['cqc', 'documentation', 'training', 'medication']
      },
      {
        id: 'compliance-trends',
        title: 'Compliance Trends',
        type: 'trends',
        layout: 'chart',
        chartType: 'calendar',
        metrics: [
          'compliance.cqc',
          'compliance.documentation',
          'compliance.training'
        ]
      },
      {
        id: 'incidents',
        title: 'Compliance Incidents',
        type: 'incidents',
        layout: 'table'
      }
    ],
    layout: {
      columns: 1,
      spacing: 24
    }
  },
  'financial-report': {
    id: 'financial-report',
    name: 'Financial Performance Report',
    description: 'Financial metrics and cost analysis',
    type: 'financial',
    sections: [
      {
        id: 'revenue-metrics',
        title: 'Revenue Metrics',
        type: 'metrics',
        layout: 'chart',
        chartType: 'line',
        metrics: [
          'financial.revenue',
          'financial.occupancy_revenue',
          'financial.additional_services'
        ]
      },
      {
        id: 'cost-breakdown',
        title: 'Cost Breakdown',
        type: 'metrics',
        layout: 'chart',
        chartType: 'sunburst',
        metrics: [
          'financial.staff_costs',
          'financial.operational_costs',
          'financial.medication_costs',
          'financial.maintenance_costs'
        ]
      },
      {
        id: 'financial-trends',
        title: 'Financial Trends',
        type: 'trends',
        layout: 'chart',
        chartType: 'line',
        metrics: [
          'financial.profit_margin',
          'financial.cost_per_resident',
          'financial.revenue_per_resident'
        ]
      }
    ],
    layout: {
      columns: 2,
      spacing: 16
    }
  }
};

export class TemplateEngine {
  private static instance: TemplateEngine;

  private constructor() {}

  public static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  /**
   * Get a predefined template
   */
  public getTemplate(templateId: string): ReportTemplate | undefined {
    return REPORT_TEMPLATES[templateId];
  }

  /**
   * Create a custom template
   */
  public createTemplate(template: Omit<ReportTemplate, 'id'>): ReportTemplate {
    const id = crypto.randomUUID();
    const newTemplate = { ...template, id };
    REPORT_TEMPLATES[id] = newTemplate;
    return newTemplate;
  }

  /**
   * Update an existing template
   */
  public updateTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>
  ): ReportTemplate | undefined {
    const template = REPORT_TEMPLATES[templateId];
    if (!template) return undefined;

    const updatedTemplate = { ...template, ...updates };
    REPORT_TEMPLATES[templateId] = updatedTemplate;
    return updatedTemplate;
  }

  /**
   * Delete a template
   */
  public deleteTemplate(templateId: string): boolean {
    if (!REPORT_TEMPLATES[templateId]) return false;
    delete REPORT_TEMPLATES[templateId];
    return true;
  }

  /**
   * Get all available templates
   */
  public getAllTemplates(): ReportTemplate[] {
    return Object.values(REPORT_TEMPLATES);
  }

  /**
   * Get templates by type
   */
  public getTemplatesByType(type: ReportTemplate['type']): ReportTemplate[] {
    return Object.values(REPORT_TEMPLATES).filter(t => t.type === type);
  }

  /**
   * Validate a template
   */
  public validateTemplate(template: ReportTemplate): boolean {
    // Basic validation
    if (!template.name || !template.type || !template.sections) return false;

    // Validate sections
    return template.sections.every(section => {
      if (!section.id || !section.type || !section.layout) return false;

      switch (section.type) {
        case 'metrics':
          return Array.isArray(section.metrics) && section.metrics.length > 0;
        case 'health':
          return Array.isArray(section.components) && section.components.length > 0;
        case 'trends':
          return section.timeRange && section.timeRange.start < section.timeRange.end;
        case 'custom':
          return true; // Custom sections can have any valid configuration
        default:
          return true;
      }
    });
  }

  /**
   * Clone a template
   */
  public cloneTemplate(templateId: string, newName?: string): ReportTemplate | undefined {
    const template = REPORT_TEMPLATES[templateId];
    if (!template) return undefined;

    return this.createTemplate({
      ...template,
      name: newName || `${template.name} (Copy)`,
      description: `Copy of ${template.description}`
    });
  }
} 
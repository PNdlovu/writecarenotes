import { 
  QualityMetric,
  QualityInspection,
  ImprovementPlan,
  QualityAudit,
  QualityMetricType,
  InspectionStatus,
  ComplianceLevel
} from '../types';
import { api } from '@/lib/api';
import { AuditService } from '@/features/audit/services/auditService';
import { NotificationService } from '@/features/notifications/services/notificationService';

export class QualityManagementService {
  private static instance: QualityManagementService;
  private auditService: AuditService;
  private notificationService: NotificationService;

  private constructor() {
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
  }

  public static getInstance(): QualityManagementService {
    if (!QualityManagementService.instance) {
      QualityManagementService.instance = new QualityManagementService();
    }
    return QualityManagementService.instance;
  }

  // Quality Metrics Management
  async recordMetric(metric: Omit<QualityMetric, 'id'>): Promise<QualityMetric> {
    const response = await api.post<QualityMetric>('/api/quality/metrics', metric);
    
    if (metric.actionRequired) {
      await this.notificationService.sendNotification({
        type: 'QUALITY_METRIC_ALERT',
        title: `Quality Metric Below Target: ${metric.type}`,
        message: `Current value: ${metric.value}, Target: ${metric.target}`,
        priority: 'HIGH',
        recipients: ['QUALITY_TEAM', 'MANAGEMENT']
      });
    }

    await this.auditService.logActivity(
      'QUALITY',
      metric.careHomeId,
      'RECORD_METRIC',
      'SYSTEM',
      'SYSTEM',
      { metricType: metric.type }
    );

    return response.data;
  }

  async getMetrics(
    careHomeId: string,
    type?: QualityMetricType,
    startDate?: Date,
    endDate?: Date
  ): Promise<QualityMetric[]> {
    const params = new URLSearchParams({
      careHomeId,
      ...(type && { type }),
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() })
    });

    const response = await api.get<QualityMetric[]>(`/api/quality/metrics?${params}`);
    return response.data;
  }

  // Inspections Management
  async scheduleInspection(inspection: Omit<QualityInspection, 'id'>): Promise<QualityInspection> {
    const response = await api.post<QualityInspection>('/api/quality/inspections', inspection);
    
    await this.notificationService.sendNotification({
      type: 'INSPECTION_SCHEDULED',
      title: `New Inspection Scheduled: ${inspection.inspectionType}`,
      message: `Scheduled for: ${inspection.scheduledDate}`,
      priority: 'MEDIUM',
      recipients: ['MANAGEMENT', 'STAFF']
    });

    await this.auditService.logActivity(
      'QUALITY',
      inspection.careHomeId,
      'SCHEDULE_INSPECTION',
      inspection.inspector,
      'SYSTEM'
    );

    return response.data;
  }

  async updateInspectionStatus(
    id: string,
    status: InspectionStatus,
    findings?: QualityInspection['findings']
  ): Promise<QualityInspection> {
    const response = await api.put<QualityInspection>(`/api/quality/inspections/${id}/status`, {
      status,
      findings
    });

    if (findings?.some(f => f.compliance === ComplianceLevel.NON_COMPLIANT)) {
      await this.notificationService.sendNotification({
        type: 'INSPECTION_NON_COMPLIANCE',
        title: 'Non-Compliance Found in Inspection',
        message: 'Immediate attention required for non-compliant areas',
        priority: 'HIGH',
        recipients: ['MANAGEMENT', 'QUALITY_TEAM']
      });
    }

    return response.data;
  }

  async getInspections(
    careHomeId: string,
    status?: InspectionStatus
  ): Promise<QualityInspection[]> {
    const params = new URLSearchParams({
      careHomeId,
      ...(status && { status })
    });
    const response = await api.get<QualityInspection[]>(`/api/quality/inspections?${params}`);
    return response.data;
  }

  // Improvement Plans Management
  async createImprovementPlan(plan: Omit<ImprovementPlan, 'id'>): Promise<ImprovementPlan> {
    const response = await api.post<ImprovementPlan>('/api/quality/improvement-plans', plan);
    
    await this.notificationService.sendNotification({
      type: 'IMPROVEMENT_PLAN_CREATED',
      title: `New Improvement Plan: ${plan.title}`,
      message: `Priority: ${plan.priority}, Target Date: ${plan.targetDate}`,
      priority: plan.priority === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      recipients: ['MANAGEMENT', 'QUALITY_TEAM']
    });

    await this.auditService.logActivity(
      'QUALITY',
      plan.careHomeId,
      'CREATE_IMPROVEMENT_PLAN',
      plan.responsiblePerson,
      'SYSTEM'
    );

    return response.data;
  }

  async updateImprovementPlan(
    id: string,
    updates: Partial<ImprovementPlan>
  ): Promise<ImprovementPlan> {
    const response = await api.put<ImprovementPlan>(`/api/quality/improvement-plans/${id}`, updates);
    
    if (updates.status === 'COMPLETED') {
      await this.notificationService.sendNotification({
        type: 'IMPROVEMENT_PLAN_COMPLETED',
        title: `Improvement Plan Completed: ${response.data.title}`,
        message: 'Review outcomes and maintain improvements',
        priority: 'MEDIUM',
        recipients: ['MANAGEMENT', 'QUALITY_TEAM']
      });
    }

    return response.data;
  }

  async getImprovementPlans(careHomeId: string): Promise<ImprovementPlan[]> {
    const response = await api.get<ImprovementPlan[]>(`/api/quality/improvement-plans/${careHomeId}`);
    return response.data;
  }

  // Quality Audits Management
  async conductAudit(audit: Omit<QualityAudit, 'id'>): Promise<QualityAudit> {
    const response = await api.post<QualityAudit>('/api/quality/audits', audit);
    
    const criticalFindings = audit.findings.filter(f => 
      f.compliance === ComplianceLevel.NON_COMPLIANT && f.risk === 'HIGH'
    );

    if (criticalFindings.length > 0) {
      await this.notificationService.sendNotification({
        type: 'CRITICAL_AUDIT_FINDINGS',
        title: 'Critical Issues Found in Audit',
        message: `${criticalFindings.length} critical findings require immediate attention`,
        priority: 'HIGH',
        recipients: ['MANAGEMENT', 'QUALITY_TEAM']
      });
    }

    await this.auditService.logActivity(
      'QUALITY',
      audit.careHomeId,
      'CONDUCT_AUDIT',
      audit.auditor,
      'SYSTEM'
    );

    return response.data;
  }

  async getAudits(
    careHomeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<QualityAudit[]> {
    const params = new URLSearchParams({
      careHomeId,
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() })
    });
    const response = await api.get<QualityAudit[]>(`/api/quality/audits?${params}`);
    return response.data;
  }

  // Analytics and Reporting
  async generateQualityReport(
    careHomeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const response = await api.post('/api/quality/reports/generate', {
      careHomeId,
      startDate,
      endDate
    });
    return response.data;
  }

  async getQualityTrends(
    careHomeId: string,
    metricTypes: QualityMetricType[],
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  ): Promise<any> {
    const response = await api.get('/api/quality/analytics/trends', {
      params: {
        careHomeId,
        metricTypes: metricTypes.join(','),
        period
      }
    });
    return response.data;
  }

  async getBenchmarkData(
    careHomeId: string,
    metricType: QualityMetricType
  ): Promise<any> {
    const response = await api.get('/api/quality/analytics/benchmark', {
      params: {
        careHomeId,
        metricType
      }
    });
    return response.data;
  }
}

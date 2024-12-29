import { HandoverSession, HandoverTask, Staff } from '../types/handover';
import { ComplianceService } from './compliance-service';

interface TaskMetrics {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  byStaff: Record<string, number>;
  averageCompletionTime: number;
}

interface QualityMetrics {
  totalChecks: number;
  passed: number;
  failed: number;
  pending: number;
  byCategory: Record<string, number>;
  criticalIssues: number;
}

interface StaffMetrics {
  totalStaff: number;
  tasksPerStaff: Record<string, number>;
  completionRates: Record<string, number>;
  qualityCheckContribution: Record<string, number>;
}

interface ComplianceMetrics {
  overallCompliance: number;
  byRegulation: Record<string, number>;
  missingDocumentation: string[];
  criticalViolations: string[];
}

export interface HandoverReport {
  sessionId: string;
  period: {
    start: Date;
    end: Date;
  };
  department: string;
  tasks: TaskMetrics;
  quality: QualityMetrics;
  staff: StaffMetrics;
  compliance: ComplianceMetrics;
  generatedAt: Date;
  generatedBy: Staff;
}

export class ReportingService {
  private complianceService: ComplianceService;

  constructor() {
    this.complianceService = new ComplianceService();
  }

  async generateSessionReport(session: HandoverSession): Promise<HandoverReport> {
    const taskMetrics = this.calculateTaskMetrics(session.tasks);
    const qualityMetrics = this.calculateQualityMetrics(session.qualityChecks);
    const staffMetrics = this.calculateStaffMetrics(session);
    const complianceMetrics = await this.calculateComplianceMetrics(session);

    return {
      sessionId: session.id,
      period: {
        start: session.startTime,
        end: session.endTime,
      },
      department: session.department,
      tasks: taskMetrics,
      quality: qualityMetrics,
      staff: staffMetrics,
      compliance: complianceMetrics,
      generatedAt: new Date(),
      generatedBy: session.incomingStaff[0], // Assuming the first incoming staff member
    };
  }

  async generatePeriodReport(sessions: HandoverSession[], startDate: Date, endDate: Date): Promise<HandoverReport[]> {
    return Promise.all(sessions.map(session => this.generateSessionReport(session)));
  }

  private calculateTaskMetrics(tasks: HandoverTask[]): TaskMetrics {
    const byPriority: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byStaff: Record<string, number> = {};
    let totalCompletionTime = 0;
    let completedTasks = 0;

    tasks.forEach(task => {
      // Priority counts
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

      // Category counts
      byCategory[task.category] = (byCategory[task.category] || 0) + 1;

      // Staff counts
      if (task.assignedTo) {
        byStaff[task.assignedTo.id] = (byStaff[task.assignedTo.id] || 0) + 1;
      }

      // Completion time calculation
      if (task.status === 'COMPLETED' && task.completedAt) {
        const completionTime = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
        totalCompletionTime += completionTime;
        completedTasks++;
      }
    });

    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      byPriority,
      byCategory,
      byStaff,
      averageCompletionTime: completedTasks ? totalCompletionTime / completedTasks : 0,
    };
  }

  private calculateQualityMetrics(checks: any[]): QualityMetrics {
    const byCategory: Record<string, number> = {};
    let criticalIssues = 0;

    checks.forEach(check => {
      byCategory[check.category] = (byCategory[check.category] || 0) + 1;
      if (check.status === 'FAILED' && check.critical) {
        criticalIssues++;
      }
    });

    return {
      totalChecks: checks.length,
      passed: checks.filter(c => c.status === 'PASSED').length,
      failed: checks.filter(c => c.status === 'FAILED').length,
      pending: checks.filter(c => c.status === 'PENDING').length,
      byCategory,
      criticalIssues,
    };
  }

  private calculateStaffMetrics(session: HandoverSession): StaffMetrics {
    const allStaff = [...session.outgoingStaff, ...session.incomingStaff];
    const tasksPerStaff: Record<string, number> = {};
    const completionRates: Record<string, number> = {};
    const qualityCheckContribution: Record<string, number> = {};

    allStaff.forEach(staff => {
      const staffTasks = session.tasks.filter(t => t.assignedTo?.id === staff.id);
      tasksPerStaff[staff.id] = staffTasks.length;
      
      const completedTasks = staffTasks.filter(t => t.status === 'COMPLETED').length;
      completionRates[staff.id] = staffTasks.length ? completedTasks / staffTasks.length : 0;

      const qualityChecks = session.qualityChecks.filter(c => c.checkedBy?.id === staff.id).length;
      qualityCheckContribution[staff.id] = qualityChecks;
    });

    return {
      totalStaff: allStaff.length,
      tasksPerStaff,
      completionRates,
      qualityCheckContribution,
    };
  }

  private async calculateComplianceMetrics(session: HandoverSession): Promise<ComplianceMetrics> {
    const complianceResult = await this.complianceService.validateSession(session);
    const regulationResults = await this.complianceService.validateRegulations(session);

    const byRegulation: Record<string, number> = {};
    regulationResults.forEach(result => {
      byRegulation[result.regulation] = result.complianceScore;
    });

    return {
      overallCompliance: complianceResult.score,
      byRegulation,
      missingDocumentation: complianceResult.missingDocuments || [],
      criticalViolations: complianceResult.criticalViolations || [],
    };
  }
}

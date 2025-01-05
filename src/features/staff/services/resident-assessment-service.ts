import { prisma } from '@/lib/prisma';
import { StaffMetricsService } from './monitoring-service';
import { AuditService } from './audit-service';

interface Assessment {
  id: string;
  residentId: string;
  type: 'INITIAL' | 'PERIODIC' | 'CHANGE_CONDITION';
  assessor: string;
  dateTime: Date;
  categories: AssessmentCategory[];
  recommendations: string[];
  careplanUpdates: boolean;
  nextReviewDate: Date;
}

interface AssessmentCategory {
  name: string;
  score: number;
  notes: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  triggers: string[];
}

export class ResidentAssessmentService {
  private static readonly ASSESSMENT_CATEGORIES = [
    'MOBILITY',
    'NUTRITION',
    'SKIN_INTEGRITY',
    'FALLS_RISK',
    'COGNITIVE_FUNCTION',
    'BEHAVIOR',
    'COMMUNICATION',
    'PERSONAL_CARE',
    'MEDICATION_MANAGEMENT',
    'SOCIAL_ENGAGEMENT',
  ];

  private static readonly RISK_THRESHOLDS = {
    LOW: { min: 0, max: 3 },
    MEDIUM: { min: 4, max: 7 },
    HIGH: { min: 8, max: 10 },
  };

  static async createAssessment(
    organizationId: string,
    data: Omit<Assessment, 'id'>
  ): Promise<Assessment> {
    try {
      // Validate categories
      this.validateCategories(data.categories);

      // Create assessment
      const assessment = await prisma.assessment.create({
        data: {
          ...data,
          organizationId,
        },
      });

      // Handle high-risk areas
      const highRiskCategories = data.categories.filter(c => c.riskLevel === 'HIGH');
      if (highRiskCategories.length > 0) {
        await this.handleHighRiskAreas(assessment, highRiskCategories);
      }

      // Update care plan if needed
      if (data.careplanUpdates) {
        await this.updateCarePlan(assessment);
      }

      // Schedule next review
      await this.scheduleNextReview(assessment);

      // Log audit trail
      await AuditService.log({
        action: 'ASSESSMENT_CREATED',
        module: 'assessments',
        entityId: assessment.id,
        entityType: 'assessment',
        details: {
          type: data.type,
          highRiskAreas: highRiskCategories.map(c => c.name),
        },
      });

      return assessment;
    } catch (error) {
      StaffMetricsService.trackError(error as Error, {
        metadata: { operation: 'create_assessment' },
      });
      throw error;
    }
  }

  static async generateAssessmentReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAssessments: number;
    byType: Record<string, number>;
    highRiskAreas: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    averageScores: Record<string, number>;
    careplanUpdateRate: number;
    reviewComplianceRate: number;
  }> {
    try {
      const assessments = await prisma.assessment.findMany({
        where: {
          organizationId,
          dateTime: { gte: startDate, lte: endDate },
        },
      });

      const totalAssessments = assessments.length;
      const byType = this.groupBy(assessments, 'type');

      // Calculate high risk areas
      const allCategories = assessments.flatMap(a => a.categories);
      const highRiskCategories = allCategories.filter(c => c.riskLevel === 'HIGH');
      const highRiskAreas = this.ASSESSMENT_CATEGORIES.map(category => {
        const count = highRiskCategories.filter(c => c.name === category).length;
        return {
          category,
          count,
          percentage: (count / totalAssessments) * 100,
        };
      }).filter(area => area.count > 0);

      // Calculate average scores
      const averageScores = this.ASSESSMENT_CATEGORIES.reduce((acc, category) => {
        const scores = allCategories
          .filter(c => c.name === category)
          .map(c => c.score);
        acc[category] = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
        return acc;
      }, {} as Record<string, number>);

      // Calculate care plan update rate
      const careplanUpdateRate =
        (assessments.filter(a => a.careplanUpdates).length / totalAssessments) * 100;

      // Calculate review compliance rate
      const reviewComplianceRate = await this.calculateReviewCompliance(
        organizationId,
        startDate,
        endDate
      );

      return {
        totalAssessments,
        byType,
        highRiskAreas,
        averageScores,
        careplanUpdateRate,
        reviewComplianceRate,
      };
    } catch (error) {
      StaffMetricsService.trackError(error as Error, {
        metadata: { operation: 'generate_assessment_report' },
      });
      throw error;
    }
  }

  static async trackProgressOverTime(
    residentId: string,
    category: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    dateTime: Date;
    score: number;
    riskLevel: string;
    triggers: string[];
  }>> {
    try {
      const assessments = await prisma.assessment.findMany({
        where: {
          residentId,
          dateTime: { gte: startDate, lte: endDate },
        },
        orderBy: { dateTime: 'asc' },
      });

      return assessments.map(assessment => {
        const categoryData = assessment.categories.find(c => c.name === category);
        return {
          dateTime: assessment.dateTime,
          score: categoryData?.score || 0,
          riskLevel: categoryData?.riskLevel || 'LOW',
          triggers: categoryData?.triggers || [],
        };
      });
    } catch (error) {
      StaffMetricsService.trackError(error as Error, {
        metadata: { operation: 'track_progress' },
      });
      throw error;
    }
  }

  private static validateCategories(categories: AssessmentCategory[]): void {
    for (const category of categories) {
      // Validate category name
      if (!this.ASSESSMENT_CATEGORIES.includes(category.name)) {
        throw new Error(`Invalid category name: ${category.name}`);
      }

      // Validate score range
      if (category.score < 0 || category.score > 10) {
        throw new Error(`Invalid score for ${category.name}: ${category.score}`);
      }

      // Validate risk level
      const threshold = this.RISK_THRESHOLDS[category.riskLevel];
      if (!threshold) {
        throw new Error(`Invalid risk level: ${category.riskLevel}`);
      }

      if (category.score < threshold.min || category.score > threshold.max) {
        throw new Error(
          `Score ${category.score} does not match risk level ${category.riskLevel}`
        );
      }
    }
  }

  private static async handleHighRiskAreas(
    assessment: Assessment,
    highRiskCategories: AssessmentCategory[]
  ): Promise<void> {
    // Create notifications for each high-risk area
    const notifications = highRiskCategories.map(category => ({
      type: 'HIGH_RISK_ASSESSMENT',
      recipient: 'CARE_MANAGER',
      organizationId: assessment.organizationId,
      status: 'pending',
      details: {
        residentId: assessment.residentId,
        category: category.name,
        score: category.score,
        triggers: category.triggers,
      },
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // Create tasks for immediate action
    const tasks = highRiskCategories.map(category => ({
      title: `Review high-risk assessment - ${category.name}`,
      description: `Resident ${assessment.residentId} scored high risk in ${category.name}. Review and implement immediate safeguards.`,
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      assignedTo: assessment.assessor,
      status: 'pending',
      assessmentId: assessment.id,
    }));

    await prisma.task.createMany({
      data: tasks,
    });
  }

  private static async updateCarePlan(assessment: Assessment): Promise<void> {
    // Get current care plan
    const carePlan = await prisma.carePlan.findFirst({
      where: { residentId: assessment.residentId, status: 'active' },
    });

    if (!carePlan) {
      throw new Error('No active care plan found');
    }

    // Create care plan revision
    await prisma.carePlanRevision.create({
      data: {
        carePlanId: carePlan.id,
        assessmentId: assessment.id,
        revisionDate: assessment.dateTime,
        revisor: assessment.assessor,
        changes: assessment.categories.map(category => ({
          area: category.name,
          changes: category.triggers,
          riskLevel: category.riskLevel,
        })),
      },
    });

    // Update care plan status
    await prisma.carePlan.update({
      where: { id: carePlan.id },
      data: { lastReviewDate: assessment.dateTime },
    });
  }

  private static async scheduleNextReview(assessment: Assessment): Promise<void> {
    await prisma.scheduledAssessment.create({
      data: {
        residentId: assessment.residentId,
        dueDate: assessment.nextReviewDate,
        type: 'PERIODIC',
        status: 'scheduled',
        previousAssessmentId: assessment.id,
      },
    });
  }

  private static async calculateReviewCompliance(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const scheduledReviews = await prisma.scheduledAssessment.count({
      where: {
        dueDate: { gte: startDate, lte: endDate },
        resident: { organizationId },
      },
    });

    const completedReviews = await prisma.assessment.count({
      where: {
        organizationId,
        dateTime: { gte: startDate, lte: endDate },
        type: 'PERIODIC',
      },
    });

    return scheduledReviews > 0
      ? (completedReviews / scheduledReviews) * 100
      : 100;
  }

  private static groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}



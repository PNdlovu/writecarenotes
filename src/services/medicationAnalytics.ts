import { MedicationHistory, MedicationAlert } from '@/hooks/useMedicationManagement';
import { differenceInDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export interface AdherenceMetrics {
  rate: number;
  completedSteps: number;
  totalSteps: number;
  missedSteps: number;
  lastCompletedDate: Date | null;
}

export interface AlertMetrics {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recentAlerts: MedicationAlert[];
}

export interface TrendData {
  date: Date;
  value: number;
  type: string;
}

export class MedicationAnalytics {
  private history: MedicationHistory[];
  private alerts: MedicationAlert[];

  constructor(history: MedicationHistory[], alerts: MedicationAlert[]) {
    this.history = history;
    this.alerts = alerts;
  }

  calculateAdherence(medicationId?: string): AdherenceMetrics {
    const relevantHistory = medicationId
      ? this.history.filter(h => h.medicationId === medicationId)
      : this.history;

    const completedSteps = relevantHistory.filter(h => 
      (h.newValue as any)?.completed === true
    ).length;

    const totalSteps = relevantHistory.filter(h =>
      h.type === 'TITRATION' || h.type === 'TAPERING'
    ).length;

    const missedSteps = relevantHistory.filter(h =>
      isWithinInterval(h.changeDate, {
        start: startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        end: endOfDay(new Date())
      }) && !(h.newValue as any)?.completed
    ).length;

    const lastCompleted = relevantHistory
      .filter(h => (h.newValue as any)?.completed === true)
      .sort((a, b) => b.changeDate.getTime() - a.changeDate.getTime())[0]?.changeDate || null;

    return {
      rate: totalSteps ? (completedSteps / totalSteps) * 100 : 0,
      completedSteps,
      totalSteps,
      missedSteps,
      lastCompletedDate: lastCompleted,
    };
  }

  analyzeAlerts(medicationId?: string): AlertMetrics {
    const relevantAlerts = medicationId
      ? this.alerts.filter(a => a.medicationIds.includes(medicationId))
      : this.alerts;

    const byType = relevantAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = relevantAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentAlerts = relevantAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    return {
      total: relevantAlerts.length,
      byType,
      bySeverity,
      recentAlerts,
    };
  }

  generateTrends(medicationId?: string, days: number = 30): TrendData[] {
    const relevantHistory = medicationId
      ? this.history.filter(h => h.medicationId === medicationId)
      : this.history;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const trends: TrendData[] = [];

    // Group history by date
    const historyByDate = relevantHistory.reduce((acc, entry) => {
      const date = startOfDay(entry.changeDate).getTime();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<number, MedicationHistory[]>);

    // Calculate daily completion rates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayHistory = historyByDate[startOfDay(date).getTime()] || [];
      
      const completed = dayHistory.filter(h => (h.newValue as any)?.completed).length;
      const total = dayHistory.length;

      trends.push({
        date,
        value: total ? (completed / total) * 100 : 0,
        type: 'adherence',
      });
    }

    return trends;
  }

  getInsights(medicationId?: string): string[] {
    const insights: string[] = [];
    const adherence = this.calculateAdherence(medicationId);
    const alerts = this.analyzeAlerts(medicationId);

    // Adherence insights
    if (adherence.rate < 80) {
      insights.push('Adherence rate is below target (80%). Consider reviewing the schedule.');
    }
    if (adherence.missedSteps > 0) {
      insights.push(`${adherence.missedSteps} missed steps in the last 30 days.`);
    }

    // Alert insights
    if (alerts.bySeverity['ERROR'] > 0) {
      insights.push(`${alerts.bySeverity['ERROR']} critical alerts require attention.`);
    }
    if (alerts.bySeverity['WARNING'] > 2) {
      insights.push('Multiple warnings detected. Review medication compatibility.');
    }

    return insights;
  }
}



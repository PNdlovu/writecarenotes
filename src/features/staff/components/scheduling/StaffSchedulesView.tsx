'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/UseToast';
import { Button } from '@/components/ui/Button';
import { ShiftCalendar } from '@/features/schedule';
import { MonitoringService } from '../../services/monitoring-service';
import { SchedulingOptimizer } from '../../services/scheduling-optimizer';

interface StaffSchedulesViewProps {
  startDate: Date;
  endDate: Date;
}

export function StaffSchedulesView({ startDate, endDate }: StaffSchedulesViewProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [specializedCareStatus, setSpecializedCareStatus] = useState<any>(null);

  const {
    schedules,
    isLoading,
    isError,
    error,
    refetch,
    updateSchedule,
  } = useScheduling();

  const handleOptimizeSchedule = async () => {
    try {
      const result = await SchedulingOptimizer.optimizeSchedule(
        session!.user!.organizationId,
        startDate,
        endDate,
        {
          maxHoursPerWeek: 40,
          minRestBetweenShifts: 8,
          certificationRequirements: {
            'MORNING': ['CPR', 'FIRST_AID'],
            'EVENING': ['CPR', 'FIRST_AID'],
            'NIGHT': ['CPR', 'FIRST_AID', 'NIGHT_CARE'],
          },
        }
      );

      setOptimizationResult(result);
      
      if (result.conflicts.length > 0) {
        toast({
          title: 'Schedule Optimization Complete',
          description: `Found ${result.conflicts.length} conflicts that need attention.`,
          variant: 'warning',
        });
      } else {
        toast({
          title: 'Schedule Optimization Complete',
          description: `Optimization score: ${result.score.toFixed(1)}`,
        });
      }

      MonitoringService.trackEvent({
        category: 'scheduling',
        action: 'optimize_schedule',
        metadata: {
          score: result.score,
          conflicts: result.conflicts.length,
        },
      });
    } catch (err) {
      console.error('Failed to optimize schedule:', err);
      MonitoringService.trackError(err as Error, {
        metadata: { operation: 'optimize_schedule' },
      });
      
      toast({
        title: 'Optimization Failed',
        description: 'Failed to optimize the schedule. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (session?.user?.organizationId && schedules) {
      loadAnalytics();
      checkCompliance();
      validateSpecializedCare();
    }
  }, [session?.user?.organizationId, schedules]);

  const loadAnalytics = async () => {
    try {
      const analyticsData = await AnalyticsService.getSchedulingAnalytics(
        session!.user!.organizationId,
        startDate,
        endDate
      );

      setAnalytics(analyticsData);

      MonitoringService.trackEvent({
        category: 'scheduling',
        action: 'view_analytics',
        metadata: {
          totalShifts: analyticsData.totalShifts,
          unassignedShifts: analyticsData.unassignedShifts,
        },
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
      MonitoringService.trackError(err as Error, {
        metadata: { operation: 'load_analytics' },
      });
    }
  };

  const checkCompliance = async () => {
    try {
      const [staffingCompliance, trainingCompliance] = await Promise.all([
        ComplianceService.checkStaffingCompliance(
          session!.user!.organizationId,
          startDate,
          startDate.getHours() >= 20 || startDate.getHours() < 8 ? 'NIGHT' : 'DAY'
        ),
        ComplianceService.checkTrainingCompliance(
          session!.user!.organizationId
        ),
      ]);

      setComplianceStatus({ staffing: staffingCompliance, training: trainingCompliance });

      if (!staffingCompliance.isCompliant || !trainingCompliance.isCompliant) {
        toast({
          title: 'Compliance Issues Detected',
          description: 'There are staffing or training compliance issues that need attention.',
          variant: 'warning',
        });
      }
    } catch (err) {
      console.error('Failed to check compliance:', err);
      MonitoringService.trackError(err as Error, {
        metadata: { operation: 'check_compliance' },
      });
    }
  };

  const validateSpecializedCare = async () => {
    try {
      const [validation, careReport] = await Promise.all([
        SpecializedCareService.validateSpecializedCareStaffing(
          session!.user!.organizationId,
          startDate
        ),
        SpecializedCareService.generateCareReport(
          session!.user!.organizationId,
          new Date(startDate.setDate(startDate.getDate() - 7)), // Last 7 days
          startDate
        ),
      ]);

      setSpecializedCareStatus({ validation, report: careReport });

      if (!validation.isValid) {
        toast({
          title: 'Specialized Care Staffing Gaps',
          description: `Found ${validation.gaps.length} staffing gaps in specialized care coverage.`,
          variant: 'warning',
        });
      }
    } catch (err) {
      console.error('Failed to validate specialized care:', err);
      MonitoringService.trackError(err as Error, {
        metadata: { operation: 'validate_specialized_care' },
      });
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading schedules..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to load schedules"
        message={error?.message || 'An unexpected error occurred'}
        retry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Schedules</h2>
        <Button onClick={handleOptimizeSchedule}>
          Optimize Schedule
        </Button>
      </div>

      <ShiftCalendar />

      {optimizationResult && optimizationResult.conflicts.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-yellow-800">Schedule Conflicts</h3>
          <ul className="mt-2 space-y-2">
            {optimizationResult.conflicts.map((conflict: any, index: number) => (
              <li key={index} className="text-sm text-yellow-700">
                {conflict.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

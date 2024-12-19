import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QualityManagementService } from '../services/qualityManagementService';
import {
  QualityMetric,
  QualityInspection,
  ImprovementPlan,
  QualityAudit,
  QualityMetricType,
  InspectionStatus
} from '../types';
import { useToast } from '@/components/ui/toast';

interface UseQualityProps {
  careHomeId: string;
}

export function useQuality({ careHomeId }: UseQualityProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qualityService = QualityManagementService.getInstance();
  const [selectedMetricType, setSelectedMetricType] = useState<QualityMetricType>();
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Queries
  const metricsQuery = useQuery({
    queryKey: ['qualityMetrics', careHomeId, selectedMetricType, dateRange],
    queryFn: () => qualityService.getMetrics(
      careHomeId,
      selectedMetricType,
      dateRange.start,
      dateRange.end
    )
  });

  const inspectionsQuery = useQuery({
    queryKey: ['qualityInspections', careHomeId],
    queryFn: () => qualityService.getInspections(careHomeId)
  });

  const improvementPlansQuery = useQuery({
    queryKey: ['improvementPlans', careHomeId],
    queryFn: () => qualityService.getImprovementPlans(careHomeId)
  });

  const auditsQuery = useQuery({
    queryKey: ['qualityAudits', careHomeId, dateRange],
    queryFn: () => qualityService.getAudits(
      careHomeId,
      dateRange.start,
      dateRange.end
    )
  });

  // Mutations
  const recordMetricMutation = useMutation({
    mutationFn: (metric: Omit<QualityMetric, 'id'>) =>
      qualityService.recordMetric(metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityMetrics', careHomeId] });
      toast({
        title: 'Success',
        description: 'Quality metric recorded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record quality metric',
        variant: 'destructive',
      });
    }
  });

  const scheduleInspectionMutation = useMutation({
    mutationFn: (inspection: Omit<QualityInspection, 'id'>) =>
      qualityService.scheduleInspection(inspection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityInspections', careHomeId] });
      toast({
        title: 'Success',
        description: 'Inspection scheduled successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to schedule inspection',
        variant: 'destructive',
      });
    }
  });

  const createImprovementPlanMutation = useMutation({
    mutationFn: (plan: Omit<ImprovementPlan, 'id'>) =>
      qualityService.createImprovementPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['improvementPlans', careHomeId] });
      toast({
        title: 'Success',
        description: 'Improvement plan created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create improvement plan',
        variant: 'destructive',
      });
    }
  });

  const conductAuditMutation = useMutation({
    mutationFn: (audit: Omit<QualityAudit, 'id'>) =>
      qualityService.conductAudit(audit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityAudits', careHomeId] });
      toast({
        title: 'Success',
        description: 'Audit conducted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to conduct audit',
        variant: 'destructive',
      });
    }
  });

  // Helper functions
  const recordMetric = useCallback(async (metric: Omit<QualityMetric, 'id'>) => {
    return recordMetricMutation.mutateAsync(metric);
  }, [recordMetricMutation]);

  const scheduleInspection = useCallback(async (inspection: Omit<QualityInspection, 'id'>) => {
    return scheduleInspectionMutation.mutateAsync(inspection);
  }, [scheduleInspectionMutation]);

  const createImprovementPlan = useCallback(async (plan: Omit<ImprovementPlan, 'id'>) => {
    return createImprovementPlanMutation.mutateAsync(plan);
  }, [createImprovementPlanMutation]);

  const conductAudit = useCallback(async (audit: Omit<QualityAudit, 'id'>) => {
    return conductAuditMutation.mutateAsync(audit);
  }, [conductAuditMutation]);

  // Analytics functions
  const getQualityTrends = useCallback(async (
    metricTypes: QualityMetricType[],
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  ) => {
    return qualityService.getQualityTrends(careHomeId, metricTypes, period);
  }, [careHomeId, qualityService]);

  const getBenchmarkData = useCallback(async (metricType: QualityMetricType) => {
    return qualityService.getBenchmarkData(careHomeId, metricType);
  }, [careHomeId, qualityService]);

  return {
    // Queries
    metrics: metricsQuery.data ?? [],
    inspections: inspectionsQuery.data ?? [],
    improvementPlans: improvementPlansQuery.data ?? [],
    audits: auditsQuery.data ?? [],
    isLoading: metricsQuery.isLoading || inspectionsQuery.isLoading || 
               improvementPlansQuery.isLoading || auditsQuery.isLoading,
    error: metricsQuery.error || inspectionsQuery.error || 
           improvementPlansQuery.error || auditsQuery.error,

    // Actions
    recordMetric,
    scheduleInspection,
    createImprovementPlan,
    conductAudit,
    setSelectedMetricType,
    setDateRange,
    getQualityTrends,
    getBenchmarkData,

    // Mutation States
    isRecordingMetric: recordMetricMutation.isPending,
    isSchedulingInspection: scheduleInspectionMutation.isPending,
    isCreatingPlan: createImprovementPlanMutation.isPending,
    isConductingAudit: conductAuditMutation.isPending
  };
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { assessmentApi } from '@/api/assessments/assessmentApi';
import { analyticsApi } from '@/api/assessments/analyticsApi';
import type { Assessment, AnalyticsData, PerformanceData } from '../types';
import { AlertService, SettingsService, AggregationService, ExportService } from '../services/analytics';

interface AssessmentContextType {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  loading: boolean;
  error: Error | null;
  analytics: OfflineAnalytics;
  alertService: AlertService;
  settingsService: SettingsService;
  aggregationService: AggregationService;
  exportService: ExportService;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  createAssessment: (data: Partial<Assessment>) => Promise<Assessment>;
  updateAssessment: (id: string, data: Partial<Assessment>) => Promise<Assessment>;
  deleteAssessment: (id: string) => Promise<void>;
  syncAssessments: () => Promise<void>;
  exportAssessment: (id: string, format: 'pdf' | 'csv') => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const analytics = OfflineAnalytics.getInstance();
  const alertService = AlertService.getInstance();
  const settingsService = SettingsService.getInstance();
  const aggregationService = AggregationService.getInstance();
  const exportService = ExportService.getInstance();

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    try {
      setLoading(true);
      // Load assessments from IndexedDB or other storage
      const loadedAssessments = await analytics.getAssessments();
      setAssessments(loadedAssessments);
      
      // Track analytics event
      analytics.trackEvent('assessments_loaded', {
        count: loadedAssessments.length,
        timestamp: new Date()
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load assessments'));
      alertService.addAlert({
        type: 'error',
        message: 'Failed to load assessments',
        metric: 'data_load',
        value: 0,
        threshold: 1
      });
    } finally {
      setLoading(false);
    }
  }

  async function createAssessment(data: Partial<Assessment>): Promise<Assessment> {
    try {
      const newAssessment: Assessment = {
        id: crypto.randomUUID(),
        title: data.title || 'New Assessment',
        description: data.description || '',
        type: data.type || 'general',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        data: data.data || {},
      };

      const savedAssessment = await analytics.createAssessment(newAssessment);
      setAssessments(prev => [...prev, savedAssessment]);

      analytics.trackEvent('assessment_created', {
        assessmentId: savedAssessment.id,
        type: savedAssessment.type,
        timestamp: new Date()
      });

      return savedAssessment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create assessment');
      setError(error);
      alertService.addAlert({
        type: 'error',
        message: 'Failed to create assessment',
        metric: 'create_operation',
        value: 0,
        threshold: 1
      });
      throw error;
    }
  }

  async function updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment> {
    try {
      const updatedAssessment = await analytics.updateAssessment(id, {
        ...data,
        updatedAt: new Date()
      });

      setAssessments(prev => 
        prev.map(assessment => 
          assessment.id === id ? updatedAssessment : assessment
        )
      );

      if (currentAssessment?.id === id) {
        setCurrentAssessment(updatedAssessment);
      }

      analytics.trackEvent('assessment_updated', {
        assessmentId: id,
        type: updatedAssessment.type,
        timestamp: new Date()
      });

      return updatedAssessment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update assessment');
      setError(error);
      alertService.addAlert({
        type: 'error',
        message: 'Failed to update assessment',
        metric: 'update_operation',
        value: 0,
        threshold: 1
      });
      throw error;
    }
  }

  async function deleteAssessment(id: string): Promise<void> {
    try {
      await analytics.deleteAssessment(id);
      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
      
      if (currentAssessment?.id === id) {
        setCurrentAssessment(null);
      }

      analytics.trackEvent('assessment_deleted', {
        assessmentId: id,
        timestamp: new Date()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete assessment');
      setError(error);
      alertService.addAlert({
        type: 'error',
        message: 'Failed to delete assessment',
        metric: 'delete_operation',
        value: 0,
        threshold: 1
      });
      throw error;
    }
  }

  async function syncAssessments(): Promise<void> {
    try {
      setLoading(true);
      await analytics.syncAssessments();
      await loadAssessments(); // Reload after sync

      analytics.trackEvent('assessments_synced', {
        count: assessments.length,
        timestamp: new Date()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync assessments');
      setError(error);
      alertService.addAlert({
        type: 'error',
        message: 'Failed to sync assessments',
        metric: 'sync_operation',
        value: 0,
        threshold: 1
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function exportAssessment(id: string, format: 'pdf' | 'csv'): Promise<void> {
    try {
      const assessment = assessments.find(a => a.id === id);
      if (!assessment) throw new Error('Assessment not found');

      if (format === 'csv') {
        await exportService.exportData([assessment], {
          format: 'csv',
          filename: `assessment_${id}`,
          includeTimestamp: true
        });
      } else {
        // Handle PDF export
        // Implementation depends on PDF generation library
      }

      analytics.trackEvent('assessment_exported', {
        assessmentId: id,
        format,
        timestamp: new Date()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to export assessment');
      setError(error);
      alertService.addAlert({
        type: 'error',
        message: 'Failed to export assessment',
        metric: 'export_operation',
        value: 0,
        threshold: 1
      });
      throw error;
    }
  }

  const value = {
    assessments,
    currentAssessment,
    loading,
    error,
    analytics,
    alertService,
    settingsService,
    aggregationService,
    exportService,
    setCurrentAssessment,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    syncAssessments,
    exportAssessment
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}

/**
 * @fileoverview Assessment hook for managing assessment state
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Assessment, AssessmentStatus, AssessmentSection } from '../types/assessment.types';
import * as assessmentApi from '../api/assessments';

interface UseAssessmentProps {
  residentId: string;
  initialAssessment?: Assessment;
}

export function useAssessment({ residentId, initialAssessment }: UseAssessmentProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(initialAssessment || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { data: session } = useSession();
  const router = useRouter();

  // Get request context for audit logging
  const getContext = useCallback(() => {
    if (!session?.user) {
      throw new Error('User must be authenticated');
    }

    return {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      ip: window.location.hostname, // This is a simplification
      userAgent: navigator.userAgent,
    };
  }, [session]);

  const fetchAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assessmentApi.getAssessmentById(
        residentId,
        assessmentId,
        getContext()
      );
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch assessment'));
    } finally {
      setLoading(false);
    }
  }, [residentId, getContext]);

  const updateSection = useCallback(async (
    assessmentId: string,
    sectionId: string,
    updates: Partial<AssessmentSection>
  ) => {
    if (!assessment) return;

    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    try {
      const updated = await assessmentApi.updateAssessment(
        residentId,
        assessmentId,
        { sections: updatedSections },
        getContext()
      );
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update section'));
    }
  }, [assessment, residentId, getContext]);

  const updateStatus = useCallback(async (
    assessmentId: string,
    status: AssessmentStatus
  ) => {
    try {
      const updated = await assessmentApi.updateAssessment(
        residentId,
        assessmentId,
        {
          status,
          ...(status === 'COMPLETED' ? {
            completedAt: new Date(),
            completedBy: session?.user?.id
          } : {})
        },
        getContext()
      );
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update status'));
    }
  }, [residentId, session, getContext]);

  const exportAssessment = useCallback(async (
    assessmentId: string,
    format: 'PDF' | 'CSV'
  ) => {
    try {
      const blob = await assessmentApi.exportAssessment(
        residentId,
        assessmentId,
        format,
        getContext()
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-${assessmentId}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to export assessment'));
    }
  }, [residentId, getContext]);

  return {
    assessment,
    loading,
    error,
    fetchAssessment,
    updateSection,
    updateStatus,
    exportAssessment
  };
}



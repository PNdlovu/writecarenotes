import { useState, useEffect } from 'react';
import type { Assessment } from '../types';

export function useAssessmentList(residentId: string, filters: {
  type: string;
  startDate: Date | null;
  endDate: Date | null;
}) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          type: filters.type,
          ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
          ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        });

        const response = await fetch(
          `/api/residents/${residentId}/assessments?${queryParams}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }

        const data = await response.json();
        setAssessments(data.assessments);
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [residentId, filters]);

  return { assessments, loading };
}



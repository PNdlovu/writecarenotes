import { useState, useEffect } from 'react';
import { assessmentApi } from '../api/assessment-service';
import type { Assessment } from '../types';

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await assessmentApi.getAssessments();
      setAssessments(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assessments,
    isLoading,
    error,
    refetch: fetchAssessments,
  };
}

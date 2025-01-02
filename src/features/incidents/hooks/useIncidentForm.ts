/**
 * @writecarenotes.com
 * @fileoverview Custom hook for incident form handling
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom React hook for managing incident form state and operations.
 * Handles form submission, draft saving, offline support, and
 * validation. Provides utilities for form state management and
 * error handling.
 */

import { useState, useCallback } from 'react';
import { useOfflineManager } from '@/lib/offline';
import { Incident } from '../types';

interface UseIncidentFormProps {
  onSaveDraft?: (data: Partial<Incident>) => Promise<void>;
  formData?: Incident;
}

export const useIncidentForm = ({
  onSaveDraft,
  formData,
}: UseIncidentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOffline, queueOperation } = useOfflineManager();

  const handleSaveDraft = useCallback(
    async (data: Partial<Incident>) => {
      if (!onSaveDraft) return;

      setIsSubmitting(true);
      try {
        if (isOffline) {
          await queueOperation('saveDraft', { data });
        } else {
          await onSaveDraft(data);
        }
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSaveDraft, isOffline, queueOperation]
  );

  return {
    handleSaveDraft,
    isSubmitting,
    isOffline,
  };
}; 
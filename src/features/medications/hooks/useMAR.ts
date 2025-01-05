import { useState, useCallback } from 'react';
import { MAREntry, MedicationStatus } from '../types/mar';

interface UseMARReturn {
  entries: MAREntry[];
  loading: boolean;
  error: Error | null;
  updateStatus: (entryId: string, status: MedicationStatus, notes?: string) => Promise<void>;
  getEntries: (medicationId: string, startDate: string, endDate: string) => Promise<void>;
}

export const useMAR = (residentId: string): UseMARReturn => {
  const [entries, setEntries] = useState<MAREntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = useCallback(async (
    entryId: string,
    status: MedicationStatus,
    notes?: string
  ) => {
    setLoading(true);
    try {
      // In a real application, this would make an API call
      setEntries(prev =>
        prev.map(entry =>
          entry.id === entryId
            ? {
                ...entry,
                status,
                notes,
                administeredAt: status === 'GIVEN' ? new Date().toISOString() : undefined,
                administeredBy: status === 'GIVEN'
                  ? { id: 'staff-id', name: 'Staff Name' } // This should come from authentication context
                  : undefined,
              }
            : entry
        )
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEntries = useCallback(async (
    medicationId: string,
    startDate: string,
    endDate: string
  ) => {
    setLoading(true);
    try {
      // In a real application, this would make an API call
      // For now, we'll just simulate some data
      const mockEntries: MAREntry[] = [
        {
          id: '1',
          medicationId,
          scheduledTime: startDate,
          status: 'SCHEDULED',
        },
        // Add more mock entries as needed
      ];
      setEntries(mockEntries);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    updateStatus,
    getEntries,
  };
};



import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string | null;
  prescribedBy: string;
  requiresWitness: boolean;
  isControlled: boolean;
  barcode?: string;
  administrations: Administration[];
}

interface Administration {
  id: string;
  scheduledTime: string;
  givenAt?: string;
  status: 'PENDING' | 'GIVEN' | 'MISSED' | 'LATE';
  photoUrl?: string;
  signature: string;
  checklist: Record<string, boolean>;
  notes?: string;
}

export function useMedications(residentId: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMedications = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      }

      const response = await fetch(
        `/api/residents/${residentId}/medications?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }

      const data = await response.json();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch medications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [residentId, toast]);

  const recordAdministration = useCallback(async (
    medicationId: string,
    data: FormData
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/residents/${residentId}/medications/${medicationId}/administrations`,
        {
          method: 'POST',
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record administration');
      }

      const result = await response.json();
      
      // Update local state
      setMedications(prev => 
        prev.map(med => {
          if (med.id === medicationId) {
            return {
              ...med,
              administrations: [...med.administrations, result],
            };
          }
          return med;
        })
      );

      toast({
        title: 'Success',
        description: 'Medication administration recorded successfully',
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to record administration',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [residentId, toast]);

  return {
    medications,
    loading,
    error,
    fetchMedications,
    recordAdministration,
  };
}



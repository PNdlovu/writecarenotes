import { useState, useCallback } from 'react';
import type { MAREntry, UseMARChartProps } from '@/types/mar';

export function useMARChart({ residentId, month, medications = [] }: UseMARChartProps) {
  const [entries, setEntries] = useState<MAREntry[]>(medications || []);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MAREntry | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleAdminister = useCallback(async (medication: MAREntry) => {
    try {
      setIsUpdating(true);
      const today = new Date().toISOString().split('T')[0];
      setEntries(current => 
        current.map(entry => 
          entry.id === medication.id 
            ? {
                ...entry,
                administrations: {
                  ...entry.administrations,
                  [today]: { status: 'GIVEN' }
                }
              }
            : entry
        )
      );
    } catch (error) {
      console.error('Error administering medication:', error);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleWitness = useCallback(async (medicationId: string, witnessId: string) => {
    // Implement witness logic
  }, []);

  const handleSecondCheck = useCallback(async (medicationId: string, checkerId: string) => {
    // Implement second check logic
  }, []);

  const generateReport = useCallback(() => {
    if (!entries || entries.length === 0) {
      return {
        totalMedications: 0,
        administered: 0,
        missed: 0,
        refused: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    return {
      totalMedications: entries.length,
      administered: entries.filter(e => e.administrations[today]?.status === 'GIVEN').length,
      missed: entries.filter(e => e.administrations[today]?.status === 'MISSED').length,
      refused: entries.filter(e => e.administrations[today]?.status === 'REFUSED').length,
    };
  }, [entries]);

  return {
    entries,
    isLoadingEntries,
    isUpdating,
    selectedEntry,
    setSelectedEntry,
    isAdminModalOpen,
    setIsAdminModalOpen,
    handleAdminister,
    handleWitness,
    handleSecondCheck,
    generateReport,
  };
}



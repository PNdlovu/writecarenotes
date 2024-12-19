import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface MedicationAdminParams {
  medicationId: string;
  scheduledTime?: string;
  status: 'COMPLETED' | 'MISSED' | 'REFUSED' | 'HELD' | 'UNAVAILABLE' | 'LATE';
  notes?: string;
  painLevel?: number;
  reason?: string;
  witnessId?: string;
}

export function useMedicationAdmin() {
  const [isAdminPINOpen, setIsAdminPINOpen] = useState(false);
  const [isWitnessPINOpen, setIsWitnessPINOpen] = useState(false);
  const [currentAdminParams, setCurrentAdminParams] = useState<MedicationAdminParams | null>(null);
  const [adminPIN, setAdminPIN] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMedicationAdmin = async (params: MedicationAdminParams) => {
    setCurrentAdminParams(params);
    setIsAdminPINOpen(true);
  };

  const handleAdminPINSubmit = async (pin: string) => {
    setAdminPIN(pin);
    
    if (currentAdminParams?.witnessId) {
      setIsWitnessPINOpen(true);
    } else {
      await submitAdministration(pin);
    }
  };

  const handleWitnessPINSubmit = async (witnessPin: string) => {
    if (!adminPIN || !currentAdminParams) return;
    await submitAdministration(adminPIN, witnessPin);
  };

  const submitAdministration = async (adminPin: string, witnessPin?: string) => {
    if (!currentAdminParams) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/medications/administration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentAdminParams,
          adminPIN: adminPin,
          ...(witnessPin && { witnessPIN: witnessPin }),
          administeredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record administration');
      }

      toast({
        title: 'Medication administered successfully',
        description: 'The medication administration has been recorded.',
      });

      // Reset state
      setCurrentAdminParams(null);
      setAdminPIN(null);
      setIsAdminPINOpen(false);
      setIsWitnessPINOpen(false);
    } catch (error) {
      toast({
        title: 'Error recording administration',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAdministration = () => {
    setCurrentAdminParams(null);
    setAdminPIN(null);
    setIsAdminPINOpen(false);
    setIsWitnessPINOpen(false);
  };

  return {
    handleMedicationAdmin,
    handleAdminPINSubmit,
    handleWitnessPINSubmit,
    cancelAdministration,
    isAdminPINOpen,
    isWitnessPINOpen,
    isLoading,
  };
}



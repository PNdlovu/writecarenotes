import React, { createContext, useContext, ReactNode } from 'react';
import { useMedicationManagement, MedicationAlert, MedicationHistory } from '@/hooks/useMedicationManagement';

interface MedicationContextType {
  alerts: MedicationAlert[];
  history: MedicationHistory[];
  addAlert: (alert: Omit<MedicationAlert, 'id' | 'timestamp'>) => string;
  recordHistory: (entry: Omit<MedicationHistory, 'id'>) => Promise<string>;
  exportSchedule: (medicationId: string) => Promise<any>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export function MedicationProvider({ children }: { children: ReactNode }) {
  const medicationManagement = useMedicationManagement();

  return (
    <MedicationContext.Provider value={medicationManagement}>
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedicationContext() {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedicationContext must be used within a MedicationProvider');
  }
  return context;
}



import { Region } from './nearMiss';

export type MedicationFrequency = 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'PRN';

export type MedicationStatus = 'GIVEN' | 'MISSED' | 'REFUSED' | 'HELD' | 'NOT_AVAILABLE';

export type MedicationUnit = 'ML' | 'MG' | 'TABLETS' | 'CAPSULES' | 'PUFFS';

export interface LiquidMeasurement {
  measuredAmount: number;
  unit: MedicationUnit;
  checkedBy?: string;
  checkTime?: string;
  notes?: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  frequency: MedicationFrequency;
  time: string;
  dosage: number;
  unit: MedicationUnit;
  instructions?: string;
  requiresWitness: boolean;
  requiresSecondCheck: boolean;
  requiresLiquidMeasurement: boolean;
}

export interface MAREntry {
  id: string;
  medicationName: string;
  dosage: string;
  route: string;
  time: string;
  specialInstructions?: string;
  administrations: Record<string, {
    status: MedicationStatus;
    notes?: string;
  }>;
  barcode?: string;
}

export interface MedicationRequirements {
  requiresWitness: boolean;
  requiresSecondCheck: boolean;
  requiresLiquidMeasurement: boolean;
  requiresControlledDrugCheck: boolean;
  specialInstructions?: string[];
}

export interface MARValidationRule {
  type: 'WITNESS' | 'SECOND_CHECK' | 'LIQUID_MEASUREMENT' | 'CONTROLLED_DRUG' | 'TIME_WINDOW';
  condition: (entry: MAREntry) => boolean;
  message: string;
}

export interface MARChartProps {
  residentId: string;
  medications: MAREntry[];
}

export interface UseMARChartProps {
  residentId: string;
  month: Date;
  medications: MAREntry[];
}



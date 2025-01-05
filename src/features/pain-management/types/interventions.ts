/**
 * @fileoverview Pain Intervention Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { MedicationId } from '@/features/medications/types/mar';

export type InterventionType =
  | 'PHARMACOLOGICAL'
  | 'PHYSICAL_THERAPY'
  | 'HEAT_THERAPY'
  | 'COLD_THERAPY'
  | 'POSITIONING'
  | 'RELAXATION'
  | 'DISTRACTION';

export type InterventionEffectiveness = 
  | 'NONE'
  | 'MILD'
  | 'MODERATE'
  | 'SIGNIFICANT'
  | 'COMPLETE';

export interface PainIntervention {
  id: string;
  residentId: string;
  type: InterventionType;
  medication?: MedicationId;
  details: string;
  startedAt: Date;
  duration: number; // in minutes
  effectiveness: InterventionEffectiveness;
  sideEffects?: string[];
  notes?: string;
  performedBy: string;
} 
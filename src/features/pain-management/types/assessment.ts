/**
 * @fileoverview Pain Assessment Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { MedicationId } from '@/features/medications/types/mar';

export type PainScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PainType = 
  | 'ACUTE'
  | 'CHRONIC'
  | 'BREAKTHROUGH'
  | 'NEUROPATHIC'
  | 'NOCICEPTIVE'
  | 'MIXED';

export type PainLocation =
  | 'HEAD'
  | 'NECK'
  | 'CHEST'
  | 'BACK_UPPER'
  | 'BACK_LOWER'
  | 'LIMB_UPPER'
  | 'LIMB_LOWER'
  | 'JOINT';

export type PainCharacteristic =
  | 'SHARP'
  | 'DULL'
  | 'BURNING'
  | 'THROBBING'
  | 'SHOOTING'
  | 'ACHING';

export interface PainAssessment {
  id: string;
  residentId: string;
  score: PainScore;
  type: PainType;
  location: PainLocation;
  characteristics: PainCharacteristic[];
  triggers?: string[];
  alleviatingFactors?: string[];
  assessedAt: Date;
  assessedBy: string;
  medications?: MedicationId[];
} 
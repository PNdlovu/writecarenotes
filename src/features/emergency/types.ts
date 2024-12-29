/**
 * @fileoverview Emergency types and enums
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export enum EmergencyType {
  MEDICAL = 'medical',
  FIRE = 'fire',
  SECURITY = 'security',
  NATURAL_DISASTER = 'natural-disaster',
  POWER_OUTAGE = 'power-outage',
  OTHER = 'other'
}

export interface EmergencyAccess {
  id: string;
  type: EmergencyType;
  description: string;
  startTime: Date;
  endTime?: Date;
  authorizedBy: string;
  createdAt: Date;
  updatedAt: Date;
} 
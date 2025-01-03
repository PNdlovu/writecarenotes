/**
 * @writecarenotes.com
 * @fileoverview Resident type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for resident-related data structures and enums.
 */

export type ResidentStatus = 'ACTIVE' | 'DISCHARGED' | 'TEMPORARY' | 'HOSPITAL' | 'DECEASED';

export type CareType = 'RESIDENTIAL' | 'NURSING' | 'DEMENTIA' | 'RESPITE' | 'PALLIATIVE' | 'DUAL' | 'SPECIALIST';

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nhsNumber: string;
  roomNumber: string;
  admissionDate: string;
  careHomeId: string;
  status: ResidentStatus;
  careType: CareType;
  dietaryRequirements: string[];
  mobilityLevel: string;
  socialPreferences: string;
  careLevel: string;
  createdAt: string;
  updatedAt: string;
} 
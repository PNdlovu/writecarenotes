/**
 * @writecarenotes.com
 * @fileoverview Territory type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for territory-related data structures.
 */

import type { Client } from '../clients/types';
import type { StaffMember } from '../staff/types';

export interface Territory {
  id: string;
  name: string;
  staff: StaffMember[];
  clients: Client[];
  area: number;
  averageTravelTime: number;
} 
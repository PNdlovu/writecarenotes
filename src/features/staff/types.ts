/**
 * @writecarenotes.com
 * @fileoverview Staff type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for staff-related data structures.
 */

import type { Location } from '../clients/types';

export interface StaffMember {
  id: string;
  name: string;
  location: Location;
} 
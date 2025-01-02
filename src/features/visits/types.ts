/**
 * @writecarenotes.com
 * @fileoverview Visit type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for visit-related data structures.
 */

import type { Client } from '../clients/types';

export interface Visit {
  id: string;
  client: Client;
  scheduledTime: string;
} 
/**
 * @fileoverview Activity types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export interface Activity {
  id: string;
  name: string;
  startTime: string | Date;
  endTime: string | Date;
  status: ActivityStatus;
  description?: string;
  location?: string;
  participants?: string[];
  organizerId: string;
  organizationId: string;
}

export type ActivityStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'; 



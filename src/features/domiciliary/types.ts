/**
 * @writecarenotes.com
 * @fileoverview Type definitions for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the domiciliary care module including
 * visit types, staff types, and related interfaces.
 */

export type EventName = 
  | 'visit_filter_date_changed'
  | 'visit_filter_status_changed'
  | 'visit_filter_staff_changed'
  | 'visit_filter_location_changed'
  | 'visit_filters_cleared';

export interface Visit {
  id: string;
  clientId: string;
  carePlanId: string;
  scheduledTime: Date;
  duration: number;
  staffAssigned: string[];
  tasks: VisitTask[];
  status: VisitStatus;
  location: VisitLocation;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface VisitStatus {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  reason?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface VisitLocation {
  latitude: number;
  longitude: number;
  address?: string;
  radius?: number;
} 
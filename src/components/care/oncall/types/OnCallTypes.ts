/**
 * @writecarenotes.com
 * @fileoverview On-Call Types and Interfaces
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions and interfaces for the On-Call management system.
 * Includes types for records, staff, regions, and analytics data.
 */

export interface OnCallRecord {
    id: string;
    careHomeId: string;
    staffId?: string;
    startTime: Date;
    endTime: Date;
    status: OnCallStatus;
    notes?: string;
    region: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum OnCallStatus {
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    regions: string[];
    qualifications: string[];
    availability: StaffAvailability[];
    maxWeeklyHours: number;
    currentWeeklyHours: number;
}

export interface StaffAvailability {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
}

export interface Region {
    id: string;
    name: string;
    code: string;
    timezone: string;
    minimumStaffQualifications: string[];
    regulatoryBody: RegulatoryBody;
    contactDetails: RegionContactDetails;
}

export enum RegulatoryBody {
    CQC = 'CQC',
    CIW = 'CIW',
    RQIA = 'RQIA',
    CARE_INSPECTORATE = 'CARE_INSPECTORATE',
    HIQA = 'HIQA'
}

export interface RegionContactDetails {
    emergencyPhone: string;
    email: string;
    address: string;
}

export interface AnalyticsData {
    totalCalls: number;
    averageResponseTime: number;
    staffUtilization: StaffUtilization[];
    incidentsByType: Record<string, number>;
    regionalBreakdown: RegionalBreakdown[];
    timeOfDayDistribution: TimeDistribution[];
}

export interface StaffUtilization {
    staffId: string;
    staffName: string;
    totalHours: number;
    callsHandled: number;
    averageResponseTime: number;
}

export interface RegionalBreakdown {
    region: string;
    totalCalls: number;
    averageResponseTime: number;
    activeStaff: number;
}

export interface TimeDistribution {
    hour: number; // 0-23
    callCount: number;
    averageResponseTime: number;
}

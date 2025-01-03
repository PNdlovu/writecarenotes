/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert API Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the Smart Care Alert API, including
 * request/response types and shared interfaces across the system.
 */

// Supported Regions
export type Region = 'england' | 'wales' | 'scotland' | 'northernIreland' | 'ireland';

// Alert Types
export type AlertPriority = 'emergency' | 'urgent' | 'routine' | 'assistance';
export type AlertStatus = 'active' | 'acknowledged' | 'inProgress' | 'resolved' | 'escalated';
export type AlertType = 'nurse-call' | 'fall' | 'wandering' | 'assistance' | 'emergency' | 'medication';

// Alert Management Types
export interface CreateAlertRequest {
    residentId: string;
    type: AlertType;
    priority: AlertPriority;
    location: string;
    details?: string;
    region: Region;
}

export interface AlertResponse {
    alertId: string;
    residentId: string;
    type: AlertType;
    priority: AlertPriority;
    status: AlertStatus;
    location: string;
    details?: string;
    createdAt: string;
    respondedAt?: string;
    resolvedAt?: string;
    assignedTo?: string;
    region: Region;
}

export interface UpdateAlertRequest {
    status?: AlertStatus;
    details?: string;
    assignedTo?: string;
    priority?: AlertPriority;
}

export interface AlertEscalationRequest {
    reason: string;
    newPriority: AlertPriority;
    escalatedBy: string;
    notifyStaff?: string[];
}

// Staff Management Types
export interface StaffAssignmentRequest {
    staffId: string;
    alertIds: string[];
    region: Region;
}

export interface StaffStatusUpdate {
    status: 'available' | 'busy' | 'offline' | 'break';
    location?: string;
    untilTime?: string;
    reason?: string;
}

export interface StaffAlertResponse {
    alerts: AlertResponse[];
    statistics: {
        total: number;
        emergency: number;
        urgent: number;
        routine: number;
        responseTime: number;
    };
}

// Compliance Types
export interface ComplianceReport {
    reportId: string;
    period: {
        start: string;
        end: string;
    };
    metrics: {
        totalAlerts: number;
        averageResponseTime: number;
        escalationRate: number;
        complianceScore: number;
        byPriority: {
            emergency: {
                count: number;
                avgResponse: number;
            };
            urgent: {
                count: number;
                avgResponse: number;
            };
            routine: {
                count: number;
                avgResponse: number;
            };
        };
    };
    region: Region;
}

export interface RegionalRequirements {
    region: Region;
    responseTimeThresholds: {
        emergency: number; // minutes
        urgent: number;
        routine: number;
    };
    escalationRules: {
        automatic: boolean;
        timeThreshold: number;
        notificationLevels: string[];
    };
    staffingRequirements: {
        minimumStaff: number;
        qualifications: string[];
        trainingRequired: string[];
    };
    reportingRequirements: {
        frequency: 'daily' | 'weekly' | 'monthly';
        format: string[];
        retention: number; // days
    };
}

// Analytics Types
export interface AnalyticsOverview {
    period: {
        start: string;
        end: string;
    };
    summary: {
        totalAlerts: number;
        resolvedAlerts: number;
        escalatedAlerts: number;
        averageResponseTime: number;
    };
    byType: {
        [key in AlertType]: number;
    };
    byPriority: {
        [key in AlertPriority]: number;
    };
    byStatus: {
        [key in AlertStatus]: number;
    };
    trends: {
        date: string;
        count: number;
        responseTime: number;
    }[];
}

export interface StaffPerformanceMetrics {
    staffId: string;
    metrics: {
        totalAlerts: number;
        responseTime: number;
        resolutionTime: number;
        escalationRate: number;
        satisfactionScore: number;
    };
    byPriority: {
        [key in AlertPriority]: {
            count: number;
            avgResponse: number;
        };
    };
    trends: {
        date: string;
        alerts: number;
        performance: number;
    }[];
}

// Error Types
export interface APIError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    region?: Region;
}

// Webhook Types
export interface AlertWebhook {
    alertId: string;
    type: AlertType;
    status: AlertStatus;
    timestamp: string;
    details: {
        residentId: string;
        location: string;
        priority: AlertPriority;
        assignedTo?: string;
    };
    region: Region;
} 
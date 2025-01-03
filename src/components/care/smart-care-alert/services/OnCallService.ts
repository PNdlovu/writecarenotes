/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing Smart Care Alert functionality including
 * alert handling, staff assignment, and notification management.
 */

import { SmartCareAlertRecord } from '../types/SmartCareAlertTypes';
import { OnCallStaffService } from '../../../../app/api/oncall/services/StaffService';
import { OnCallComplianceService } from '../../../../app/api/oncall/services/ComplianceService';

export class SmartCareAlertService {
    private static instance: SmartCareAlertService;
    private staffService: OnCallStaffService;
    private complianceService: OnCallComplianceService;

    private constructor() {
        this.staffService = OnCallStaffService.getInstance();
        this.complianceService = OnCallComplianceService.getInstance();
    }

    public static getInstance(): SmartCareAlertService {
        if (!SmartCareAlertService.instance) {
            SmartCareAlertService.instance = new SmartCareAlertService();
        }
        return SmartCareAlertService.instance;
    }

    public async handleAlert(alert: SmartCareAlertRecord): Promise<void> {
        // Get available staff for the alert's region
        const availableStaff = await this.staffService.listAvailableOnCallStaff({
            region: alert.region,
            date: new Date(),
            qualifications: alert.requiredQualifications
        });

        if (availableStaff.length === 0) {
            // No available staff, escalate the alert
            await this.escalateAlert(alert);
            return;
        }

        // Assign the alert to the first available staff member
        const assignedStaff = availableStaff[0];
        await this.staffService.updateOnCallAvailability(assignedStaff.id, 'busy');

        // TODO: Implement alert assignment and notification logic
        console.log(`Alert ${alert.id} assigned to staff member ${assignedStaff.id}`);
    }

    private async escalateAlert(alert: SmartCareAlertRecord): Promise<void> {
        // TODO: Implement alert escalation logic
        console.log(`Alert ${alert.id} escalated due to no available staff`);
    }
}

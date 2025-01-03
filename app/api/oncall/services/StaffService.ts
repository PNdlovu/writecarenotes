/**
 * @writecarenotes.com
 * @fileoverview On-Call Staff Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing on-call specific staff functionality.
 * Extends core staff management with on-call specific features.
 */

import { StaffMember, Region, StaffStatus, Schedule } from '../types';
import { StaffRepository } from '../repositories/StaffRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { StaffManagement } from '../../../../src/features/staff/services/staffManagement';

export class OnCallStaffService {
    private static instance: OnCallStaffService;
    private staffRepository: StaffRepository;
    private scheduleRepository: ScheduleRepository;
    private staffManagement: StaffManagement;

    private constructor() {
        this.staffRepository = StaffRepository.getInstance();
        this.scheduleRepository = ScheduleRepository.getInstance();
        this.staffManagement = new StaffManagement();
    }

    public static getInstance(): OnCallStaffService {
        if (!OnCallStaffService.instance) {
            OnCallStaffService.instance = new OnCallStaffService();
        }
        return OnCallStaffService.instance;
    }

    /**
     * Updates staff on-call availability status
     */
    public async updateOnCallAvailability(staffId: string, status: StaffStatus): Promise<StaffMember> {
        const staff = await this.staffRepository.getStaffMemberById(staffId);
        if (!staff) {
            throw new Error('Staff member not found');
        }

        // Update on-call specific status
        const updatedStaff = await this.staffRepository.updateAvailability(staffId, status);
        if (!updatedStaff) {
            throw new Error('Failed to update staff availability');
        }

        // Update core staff profile with availability info
        await this.staffManagement.upsertStaffProfile({
            organizationId: staff.organizationId,
            userId: staffId,
            role: 'on_call',
            notes: `On-call status updated to ${status}`
        }, staffId);

        await this.notifyStaffUpdate(staffId, { status });
        return updatedStaff;
    }

    /**
     * Gets staff on-call schedule
     */
    public async getOnCallSchedule(staffId: string): Promise<{
        staff: StaffMember;
        schedules: Schedule[];
    }> {
        const staff = await this.staffRepository.getStaffMemberById(staffId);
        if (!staff) {
            throw new Error('Staff member not found');
        }

        const schedules = await this.scheduleRepository.listSchedules({
            staffId,
            startDate: new Date()
        });

        return {
            staff,
            schedules
        };
    }

    /**
     * Gets regional qualifications required for on-call duty
     */
    public async getOnCallQualifications(region: Region): Promise<string[]> {
        const qualifications = await this.staffRepository.getQualifications(region);
        return qualifications.map(q => q.code);
    }

    /**
     * Lists staff available for on-call duty
     */
    public async listAvailableOnCallStaff(params: {
        region: Region;
        date?: Date;
        qualifications?: string[];
    }): Promise<StaffMember[]> {
        const staff = await this.staffRepository.getAvailableStaff(params);

        // If qualifications specified, validate them
        if (params.qualifications?.length) {
            const validStaff = await Promise.all(
                staff.map(async (member) => {
                    const isQualified = await this.validateOnCallQualifications(member.id, params.region);
                    return isQualified ? member : null;
                })
            );
            return validStaff.filter((member): member is StaffMember => member !== null);
        }

        return staff;
    }

    /**
     * Validates staff qualifications for on-call duty
     */
    private async validateOnCallQualifications(staffId: string, region: Region): Promise<boolean> {
        return this.staffRepository.validateQualifications(staffId, region);
    }

    /**
     * Notifies staff of on-call related updates
     */
    private async notifyStaffUpdate(staffId: string, update: {
        status?: StaffStatus;
        [key: string]: any;
    }): Promise<void> {
        // TODO: Implement notification logic
        console.log(`Notifying staff ${staffId} about on-call update:`, update);
    }
} 
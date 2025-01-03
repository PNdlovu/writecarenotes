/**
 * @writecarenotes.com
 * @fileoverview Schedule Service for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing on-call schedules in the On-Call Phone System.
 * Handles staff scheduling, availability, and rotation management.
 */

import { Schedule, StaffMember, Region, ScheduleStatus } from '../types';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { StaffRepository } from '../repositories/StaffRepository';

export class ScheduleService {
    private static instance: ScheduleService;
    private scheduleRepository: ScheduleRepository;
    private staffRepository: StaffRepository;

    private constructor() {
        this.scheduleRepository = ScheduleRepository.getInstance();
        this.staffRepository = StaffRepository.getInstance();
    }

    public static getInstance(): ScheduleService {
        if (!ScheduleService.instance) {
            ScheduleService.instance = new ScheduleService();
        }
        return ScheduleService.instance;
    }

    public async createSchedule(schedule: {
        staffId: string;
        startTime: Date;
        endTime: Date;
        region: Region;
        backupStaffId?: string;
    }): Promise<Schedule> {
        // Validate staff exists and is qualified
        const staff = await this.staffRepository.getStaffMemberById(schedule.staffId);
        if (!staff) {
            throw new Error('Staff member not found');
        }

        if (schedule.backupStaffId) {
            const backupStaff = await this.staffRepository.getStaffMemberById(schedule.backupStaffId);
            if (!backupStaff) {
                throw new Error('Backup staff member not found');
            }
        }

        // Create schedule
        const newSchedule = await this.scheduleRepository.createSchedule({
            ...schedule,
            isOnCall: true,
            status: 'pending',
            organizationId: 'TODO' // Get from context
        });

        // Notify staff
        await this.notifyStaff(schedule.staffId, newSchedule);
        if (schedule.backupStaffId) {
            await this.notifyStaff(schedule.backupStaffId, newSchedule);
        }

        return newSchedule;
    }

    public async getCurrentSchedule(region: Region): Promise<Schedule> {
        const schedule = await this.scheduleRepository.getCurrentSchedule(region);
        if (!schedule) {
            throw new Error('No active schedule found');
        }
        return schedule;
    }

    public async listSchedules(filters?: {
        staffId?: string;
        startTime?: Date;
        endTime?: Date;
        region?: Region;
        status?: ScheduleStatus;
    }): Promise<Schedule[]> {
        return this.scheduleRepository.listSchedules(filters);
    }

    public async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> {
        const schedule = await this.scheduleRepository.getScheduleById(scheduleId);
        if (!schedule) {
            throw new Error('Schedule not found');
        }

        // Validate updates
        if (!(await this.validateSchedule({ ...schedule, ...updates }))) {
            throw new Error('Invalid schedule updates');
        }

        const updatedSchedule = await this.scheduleRepository.updateSchedule(scheduleId, updates);
        if (!updatedSchedule) {
            throw new Error('Failed to update schedule');
        }

        return updatedSchedule;
    }

    public async getAvailableStaff(date: Date, region: Region): Promise<StaffMember[]> {
        return this.staffRepository.getAvailableStaff({ region, date });
    }

    private async validateSchedule(schedule: Schedule): Promise<boolean> {
        // Check for overlapping schedules
        const overlapping = await this.scheduleRepository.listSchedules({
            region: schedule.region,
            startTime: schedule.startTime,
            endTime: schedule.endTime
        });

        return overlapping.length === 0;
    }

    private async notifyStaff(staffId: string, schedule: Schedule): Promise<void> {
        // TODO: Implement notification logic
        console.log(`Notifying staff ${staffId} about schedule ${schedule.id}`);
    }
} 
/**
 * @writecarenotes.com
 * @fileoverview Schedule Repository for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository for managing schedule records in the database.
 */

import { BaseRepository } from './BaseRepository';
import { Schedule, ScheduleStatus, Region } from '../types';

export class ScheduleRepository extends BaseRepository<Schedule> {
    protected tableName = 'schedules';
    private static instance: ScheduleRepository;

    private constructor() {
        super();
    }

    public static getInstance(): ScheduleRepository {
        if (!ScheduleRepository.instance) {
            ScheduleRepository.instance = new ScheduleRepository();
        }
        return ScheduleRepository.instance;
    }

    public async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
        return this.create(schedule);
    }

    public async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> {
        return this.update(scheduleId, updates);
    }

    public async getScheduleById(scheduleId: string): Promise<Schedule | null> {
        return this.findById(scheduleId);
    }

    public async listSchedules(filters?: {
        staffId?: string;
        startDate?: Date;
        endDate?: Date;
        region?: Region;
        status?: ScheduleStatus;
    }): Promise<Schedule[]> {
        return this.findMany(filters || {});
    }

    public async getCurrentSchedule(region: Region): Promise<Schedule | null> {
        const now = new Date();
        const schedules = await this.findMany({
            region,
            status: 'active',
            startDate: now,
            endDate: now
        });
        return schedules[0] || null;
    }

    public async deleteSchedule(scheduleId: string): Promise<void> {
        return this.delete(scheduleId);
    }
} 
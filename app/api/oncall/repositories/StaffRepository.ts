/**
 * @writecarenotes.com
 * @fileoverview Staff Repository for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository for managing staff records in the database.
 */

import { BaseRepository } from './BaseRepository';
import { StaffMember, StaffStatus, Region, Qualification } from '../types';

export class StaffRepository extends BaseRepository<StaffMember> {
    protected tableName = 'staff';
    private static instance: StaffRepository;

    private constructor() {
        super();
    }

    public static getInstance(): StaffRepository {
        if (!StaffRepository.instance) {
            StaffRepository.instance = new StaffRepository();
        }
        return StaffRepository.instance;
    }

    public async createStaffMember(staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember> {
        return this.create(staff);
    }

    public async updateStaffMember(staffId: string, updates: Partial<StaffMember>): Promise<StaffMember> {
        return this.update(staffId, updates);
    }

    public async getStaffMemberById(staffId: string): Promise<StaffMember | null> {
        return this.findById(staffId);
    }

    public async listStaffMembers(filters?: {
        status?: StaffStatus;
        region?: Region;
        qualifications?: string[];
    }): Promise<StaffMember[]> {
        return this.findMany(filters || {});
    }

    public async updateAvailability(staffId: string, status: StaffStatus): Promise<StaffMember> {
        return this.update(staffId, { status });
    }

    public async getQualifications(region: Region): Promise<Qualification[]> {
        // TODO: Implement qualifications retrieval
        throw new Error('Not implemented');
    }

    public async validateQualifications(staffId: string, region: Region): Promise<boolean> {
        // TODO: Implement qualifications validation
        throw new Error('Not implemented');
    }

    public async getAvailableStaff(params: {
        region: Region;
        date?: Date;
        qualifications?: string[];
    }): Promise<StaffMember[]> {
        return this.findMany({
            ...params,
            status: 'available'
        });
    }
} 
/**
 * @writecarenotes.com
 * @fileoverview On-Call API Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core API service for managing on-call operations across different
 * care home types and regions. Implements enterprise-grade features
 * including offline support, sync management, and error handling.
 */

import axios from 'axios';
import { OnCallRecord, Staff, Region } from '../components/care/oncall/types/OnCallTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_VERSION = 'v1';

class OnCallAPI {
    private static instance: OnCallAPI;
    private baseURL: string;

    private constructor() {
        this.baseURL = `${API_BASE_URL}/api/${API_VERSION}/oncall`;
    }

    public static getInstance(): OnCallAPI {
        if (!OnCallAPI.instance) {
            OnCallAPI.instance = new OnCallAPI();
        }
        return OnCallAPI.instance;
    }

    // Records endpoints
    async getActiveRecords(careHomeId: string): Promise<OnCallRecord[]> {
        try {
            const response = await axios.get(`${this.baseURL}/records`, {
                params: { careHomeId }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async getOrganizationRecords(organizationId: string): Promise<OnCallRecord[]> {
        try {
            const response = await axios.get(`${this.baseURL}/organization/${organizationId}/records`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async createRecord(record: Partial<OnCallRecord>): Promise<OnCallRecord> {
        try {
            const response = await axios.post(`${this.baseURL}/records`, record);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async updateRecord(recordId: string, updates: Partial<OnCallRecord>): Promise<OnCallRecord> {
        try {
            const response = await axios.patch(`${this.baseURL}/records/${recordId}`, updates);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Staff endpoints
    async getAvailableStaff(region: string): Promise<Staff[]> {
        try {
            const response = await axios.get(`${this.baseURL}/staff/available`, {
                params: { region }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async getOrganizationStaff(organizationId: string): Promise<Staff[]> {
        try {
            const response = await axios.get(`${this.baseURL}/organization/${organizationId}/staff`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async assignStaff(recordId: string, staffId: string): Promise<OnCallRecord> {
        try {
            const response = await axios.post(`${this.baseURL}/records/${recordId}/assign`, {
                staffId
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Region endpoints
    async getRegionConfig(region: string): Promise<Region> {
        try {
            const response = await axios.get(`${this.baseURL}/regions/${region}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Analytics endpoints
    async getAnalytics(region: string, startDate: Date, endDate: Date): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/analytics`, {
                params: {
                    region,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async getOrganizationTrends(organizationId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/organization/${organizationId}/trends`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async getComplianceIssues(organizationId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/organization/${organizationId}/compliance/issues`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async getComplianceTrends(organizationId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/organization/${organizationId}/compliance/trends`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    private handleError(error: any): void {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message;
            console.error('API Error:', message);
            throw new Error(message);
        }
        throw error;
    }
}

export default OnCallAPI; 
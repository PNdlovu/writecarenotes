/**
 * @fileoverview Staff Cost Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST, PUT } from '../routes/[organizationId]/staff-cost/route';
import { StaffCost } from '../models/StaffCost';
import { ValidationError } from '../utils/errors';

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      organizationId: 'test-org-id',
    },
  })),
}));

describe('Staff Cost API Routes', () => {
  const mockOrganizationId = 'test-org-id';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/financial/[organizationId]/staff-cost', () => {
    test('creates agency staff cost record successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'agency-costs',
          agencyName: 'Test Agency',
          staffType: 'nurse',
          hourlyRate: 25,
          hoursWorked: 40,
          totalCost: 1000,
          periodStart: '2024-03-21T00:00:00Z',
          periodEnd: '2024-03-28T00:00:00Z',
          department: 'Nursing',
          costCenter: 'Ward A',
        },
      });

      const response = await POST(req, { params: { organizationId: mockOrganizationId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('type', 'agency-costs');
      expect(data).toHaveProperty('totalCost', 1000);
    });

    test('creates staffing ratios record successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'staffing-ratios',
          shiftType: 'day',
          staffType: 'carer',
          residentsPerStaff: 6,
          minimumStaffRequired: 3,
          periodStart: '2024-03-21T00:00:00Z',
          periodEnd: '2024-03-28T00:00:00Z',
          department: 'Care',
          costCenter: 'Floor 1',
        },
      });

      const response = await POST(req, { params: { organizationId: mockOrganizationId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('type', 'staffing-ratios');
      expect(data).toHaveProperty('residentsPerStaff', 6);
    });

    test('validates required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'agency-costs',
          // Missing required fields
        },
      });

      const response = await POST(req, { params: { organizationId: mockOrganizationId } });
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/financial/[organizationId]/staff-cost/[staffCostId]', () => {
    test('updates agency staff costs successfully', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          type: 'agency-costs',
          hourlyRate: 30,
          hoursWorked: 45,
          totalCost: 1350,
        },
      });

      const response = await PUT(req, {
        params: {
          organizationId: mockOrganizationId,
          staffCostId: 'test-staff-cost-id',
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('hourlyRate', 30);
    });

    test('updates staffing ratios successfully', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          type: 'staffing-ratios',
          residentsPerStaff: 5,
          minimumStaffRequired: 4,
        },
      });

      const response = await PUT(req, {
        params: {
          organizationId: mockOrganizationId,
          staffCostId: 'test-staff-cost-id',
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('residentsPerStaff', 5);
    });

    test('validates update type', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          type: 'invalid-type',
        },
      });

      const response = await PUT(req, {
        params: {
          organizationId: mockOrganizationId,
          staffCostId: 'test-staff-cost-id',
        },
      });
      expect(response.status).toBe(400);
    });
  });

  describe('StaffCost Model', () => {
    test('calculates total cost for agency staff', () => {
      const staffCost = new StaffCost({
        type: 'agency-costs',
        hourlyRate: 25,
        hoursWorked: 40,
      });

      expect(staffCost.calculatedTotalCost).toBe(1000);
    });

    test('validates data against schema', async () => {
      const invalidStaffCost = new StaffCost({
        type: 'agency-costs',
        hourlyRate: -25, // Invalid negative value
      });

      await expect(invalidStaffCost.save()).rejects.toThrow();
    });
  });
}); 
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { setupTestData, clearTestData, testOrg, testCareHome, testUser, mockRequest } from './setup';
import { GET } from '@/app/api/organizations/[id]/care-homes/[careHomeId]/activities/analytics/route';

describe('Activities Analytics API', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await clearTestData();
  });

  test('returns correct analytics for valid request', async () => {
    const request = mockRequest({
      url: `http://localhost:3000/api/organizations/${testOrg.id}/care-homes/${testCareHome.id}/activities/analytics`
    });

    const response = await GET(request, {
      params: {
        id: testOrg.id,
        careHomeId: testCareHome.id
      },
      region: 'UK',
      user: testUser
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      total: '2',
      completed: '1',
      scheduled: '1',
      inProgress: '0',
      cancelled: '0',
      participantCount: '2'
    });
  });

  test('handles invalid organization ID', async () => {
    const request = mockRequest({
      url: 'http://localhost:3000/api/organizations/invalid-id/care-homes/${testCareHome.id}/activities/analytics'
    });

    const response = await GET(request, {
      params: {
        id: 'invalid-id',
        careHomeId: testCareHome.id
      },
      region: 'UK',
      user: testUser
    });

    expect(response.status).toBe(400);
  });

  test('filters by date range', async () => {
    const request = mockRequest({
      url: `http://localhost:3000/api/organizations/${testOrg.id}/care-homes/${testCareHome.id}/activities/analytics?startDate=2024-12-29T00:00:00Z&endDate=2024-12-29T23:59:59Z`
    });

    const response = await GET(request, {
      params: {
        id: testOrg.id,
        careHomeId: testCareHome.id
      },
      region: 'UK',
      user: testUser
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total).toBe('1');
  });

  test('checks compliance', async () => {
    const request = mockRequest({
      url: `http://localhost:3000/api/organizations/${testOrg.id}/care-homes/${testCareHome.id}/activities/analytics`
    });

    const response = await GET(request, {
      params: {
        id: testOrg.id,
        careHomeId: testCareHome.id
      },
      region: 'UK',
      user: testUser
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('complianceRate');
    expect(parseFloat(data.complianceRate)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(data.complianceRate)).toBeLessThanOrEqual(100);
  });

  test('handles regional formatting', async () => {
    const request = mockRequest({
      url: `http://localhost:3000/api/organizations/${testOrg.id}/care-homes/${testCareHome.id}/activities/analytics`
    });

    // Test UK format
    const ukResponse = await GET(request, {
      params: {
        id: testOrg.id,
        careHomeId: testCareHome.id
      },
      region: 'UK',
      user: testUser
    });

    const ukData = await ukResponse.json();
    expect(ukResponse.headers.get('Content-Language')).toBe('en-GB');

    // Test EU format
    const euResponse = await GET(request, {
      params: {
        id: testOrg.id,
        careHomeId: testCareHome.id
      },
      region: 'EU',
      user: testUser
    });

    const euData = await euResponse.json();
    expect(euResponse.headers.get('Content-Language')).toBe('en-EU');

    // Numbers should be formatted differently
    expect(ukData.completionRate).not.toBe(euData.completionRate);
  });
});

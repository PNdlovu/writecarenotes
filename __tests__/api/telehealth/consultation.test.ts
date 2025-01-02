/**
 * @fileoverview Telehealth Consultation API Tests
 * @version 1.0.0
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/telehealth/consultation/route';

// Mock dependencies
jest.mock('@/lib/telemetry');
jest.mock('@/lib/metrics');
jest.mock('@/lib/alerts');
jest.mock('@/lib/video');
jest.mock('@/lib/compliance');
jest.mock('@/features/telehealth/services/enhancedTelehealth');

describe('Telehealth Consultation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/telehealth/consultation', () => {
    it('should create a consultation successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB',
          'accept-language': 'en-GB'
        },
        body: {
          careHomeId: 'test-care-home',
          data: {
            type: 'routine',
            patientId: 'test-patient',
            scheduledTime: '2024-12-30T10:00:00Z',
            duration: 30,
            participants: [
              { id: 'doctor-1', role: 'doctor' }
            ]
          }
        }
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('status', 'scheduled');
    });

    it('should handle Ofsted regulated services correctly', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB',
          'accept-language': 'en-GB',
          'x-service-type': 'children'
        },
        body: {
          careHomeId: 'test-care-home',
          data: {
            type: 'routine',
            patientId: 'test-patient',
            scheduledTime: '2024-12-30T10:00:00Z'
          }
        }
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.headers.get('X-Regulatory-Body')).toBe('OFSTED');
      expect(response.headers.get('X-Data-Retention-Period')).toBe('25-years');
    });

    it('should handle network quality adjustments', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB'
        },
        body: {
          careHomeId: 'test-care-home',
          data: { type: 'routine' }
        }
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.videoSettings).toBeDefined();
      expect(data.videoSettings.quality).toBeDefined();
    });

    it('should enforce regional compliance', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'WLS',
          'accept-language': 'cy'
        },
        body: {
          careHomeId: 'test-care-home',
          data: { type: 'routine' }
        }
      });

      const response = await POST(req);
      
      expect(response.headers.get('Content-Language')).toBe('cy');
      expect(response.headers.get('X-Region')).toBe('WLS');
    });

    it('should handle rate limiting', async () => {
      // Create multiple requests
      const requests = Array(150).fill(null).map(() => 
        createMocks({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-region': 'GB'
          },
          body: {
            careHomeId: 'test-care-home',
            data: { type: 'routine' }
          }
        })
      );

      const responses = await Promise.all(
        requests.map(({ req }) => POST(req))
      );

      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('should record performance metrics', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB'
        },
        body: {
          careHomeId: 'test-care-home',
          data: { type: 'routine' }
        }
      });

      const response = await POST(req);
      
      expect(performanceMetrics.record).toHaveBeenCalled();
    });

    it('should handle offline mode gracefully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB',
          'x-offline': 'true'
        },
        body: {
          careHomeId: 'test-care-home',
          data: { type: 'routine' }
        }
      });

      const response = await POST(req);
      
      expect(response.headers.get('X-Offline-Queue')).toBe('true');
      expect(response.status).toBe(202);
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB'
        },
        body: {
          // Missing required fields
        }
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_REQUEST');
    });

    it('should handle compliance violations', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-region': 'GB'
        },
        body: {
          careHomeId: 'test-care-home',
          data: {
            type: 'routine',
            // Add data that would trigger a compliance violation
          }
        }
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('details');
    });
  });
}); 
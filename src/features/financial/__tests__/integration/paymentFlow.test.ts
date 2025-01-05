import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { RobustPaymentService } from '../../services/robustPaymentService';
import { PaymentProviderFactory } from '../../providers';
import { AuditService } from '../../audit/auditService';
import { SLAService } from '../../sla/slaService';
import { TenancyService } from '../../tenancy/tenancyService';
import { TestDatabase } from '../../../testing/utils/testDatabase';
import { MockPaymentProvider } from '../../../testing/mocks/mockPaymentProvider';
import { config } from '@/config';

describe('Payment Flow Integration Tests', () => {
  let db: TestDatabase;
  let paymentService: RobustPaymentService;
  let auditService: AuditService;
  let slaService: SLAService;
  let tenancyService: TenancyService;

  beforeAll(async () => {
    // Set up test database
    db = new TestDatabase();
    await db.setup();

    // Initialize services
    paymentService = new RobustPaymentService();
    auditService = new AuditService({
      retentionPeriod: 1,
      batchSize: 10,
      alertThresholds: {
        errorCount: 5,
        timeWindow: 60000
      }
    }, config.redis.url);

    slaService = new SLAService({
      name: 'test-sla',
      description: 'Test SLA',
      metrics: {
        availability: 99.9,
        responseTime: 1000,
        errorRate: 0.1,
        recoveryTime: 5
      }
    }, config.redis.url);

    tenancyService = new TenancyService(config.redis.url);

    // Start services
    await Promise.all([
      paymentService.start(),
      slaService.start(),
      tenancyService.start()
    ]);
  });

  afterAll(async () => {
    // Clean up
    await Promise.all([
      paymentService.stop(),
      slaService.stop(),
      tenancyService.stop()
    ]);
    await db.cleanup();
  });

  describe('Successful Payment Flow', () => {
    test('should process payment through primary provider', async () => {
      // Setup test tenant
      const tenantId = 'test-tenant';
      await tenancyService.getTenantConfig(tenantId);

      // Create payment request
      const request = {
        amount: 1000,
        currency: 'GBP',
        description: 'Test payment',
        idempotencyKey: `test-${Date.now()}`,
        metadata: {
          orderId: 'test-order'
        }
      };

      // Process payment
      const response = await paymentService.processPayment({
        ...request,
        preferredProvider: 'STRIPE'
      });

      // Verify payment
      expect(response.status).toBe('succeeded');
      expect(response.amount).toBe(request.amount);

      // Verify audit log
      const auditEvents = await auditService.queryEvents({
        tenantId,
        types: ['PAYMENT_CREATED', 'PAYMENT_COMPLETED']
      });
      expect(auditEvents.events).toHaveLength(2);

      // Verify SLA metrics
      const slaReport = await slaService.generateReport(
        new Date(Date.now() - 3600000),
        new Date()
      );
      expect(slaReport.metrics.responseTime.breaches).toBe(0);
    });
  });

  describe('Failover Scenarios', () => {
    test('should failover to backup provider when primary fails', async () => {
      // Mock primary provider failure
      const mockProvider = new MockPaymentProvider('STRIPE');
      mockProvider.simulateFailure(true);
      PaymentProviderFactory.registerProvider('STRIPE', mockProvider);

      const request = {
        amount: 2000,
        currency: 'GBP',
        description: 'Failover test payment',
        idempotencyKey: `failover-${Date.now()}`,
        metadata: {
          orderId: 'failover-order'
        }
      };

      // Process payment
      const response = await paymentService.processPayment({
        ...request,
        preferredProvider: 'STRIPE'
      });

      // Verify failover
      expect(response.status).toBe('succeeded');
      expect(response.paymentMethod).not.toBe('STRIPE');

      // Verify audit trail
      const auditEvents = await auditService.queryEvents({
        types: ['PROVIDER_CHANGED']
      });
      expect(auditEvents.events).toHaveLength(1);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = Array(20).fill(null).map((_, i) => ({
        amount: 100,
        currency: 'GBP',
        description: `Rate limit test ${i}`,
        idempotencyKey: `rate-${Date.now()}-${i}`,
        metadata: {
          orderId: `rate-order-${i}`
        }
      }));

      // Send requests in parallel
      const results = await Promise.allSettled(
        requests.map(req => paymentService.processPayment({
          ...req,
          preferredProvider: 'STRIPE'
        }))
      );

      // Verify some requests were rate limited
      const rejected = results.filter(r => r.status === 'rejected');
      expect(rejected.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-tenant Isolation', () => {
    test('should enforce tenant limits and isolation', async () => {
      // Setup test tenants
      const tenant1 = 'test-tenant-1';
      const tenant2 = 'test-tenant-2';

      // Configure different limits
      await Promise.all([
        tenancyService.getTenantConfig(tenant1),
        tenancyService.getTenantConfig(tenant2)
      ]);

      // Process payments for both tenants
      const [response1, response2] = await Promise.all([
        paymentService.processPayment({
          amount: 1000,
          currency: 'GBP',
          description: 'Tenant 1 payment',
          idempotencyKey: `tenant1-${Date.now()}`,
          metadata: { tenantId: tenant1 }
        }),
        paymentService.processPayment({
          amount: 2000,
          currency: 'GBP',
          description: 'Tenant 2 payment',
          idempotencyKey: `tenant2-${Date.now()}`,
          metadata: { tenantId: tenant2 }
        })
      ]);

      // Verify isolation
      expect(response1.metadata.tenantId).toBe(tenant1);
      expect(response2.metadata.tenantId).toBe(tenant2);

      // Verify usage tracking
      const [usage1, usage2] = await Promise.all([
        tenancyService.getTenantUsage(tenant1),
        tenancyService.getTenantUsage(tenant2)
      ]);

      expect(usage1.transactions.count).toBe(1);
      expect(usage2.transactions.count).toBe(1);
    });
  });

  describe('Compliance and Audit', () => {
    test('should maintain complete audit trail', async () => {
      const paymentId = `audit-${Date.now()}`;
      const request = {
        amount: 3000,
        currency: 'GBP',
        description: 'Audit test payment',
        idempotencyKey: paymentId,
        metadata: {
          orderId: 'audit-order'
        }
      };

      // Process payment
      await paymentService.processPayment(request);

      // Verify audit trail
      const events = await auditService.queryEvents({
        resourceId: paymentId
      });

      // Check all required events are present
      const eventTypes = events.events.map(e => e.type);
      expect(eventTypes).toContain('PAYMENT_CREATED');
      expect(eventTypes).toContain('PAYMENT_COMPLETED');

      // Verify event details
      const createEvent = events.events.find(e => e.type === 'PAYMENT_CREATED');
      expect(createEvent?.metadata.amount).toBe(request.amount);
      expect(createEvent?.metadata.currency).toBe(request.currency);
    });
  });
});



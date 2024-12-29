import { performance } from 'perf_hooks';
import { ActivitySyncService } from '../services/sync-service';
import { setupTestData, clearTestData, testOrg, testCareHome } from './setup';
import { ActivityType, ActivityStatus } from '../types';
import { prisma } from '@/lib/prisma';

async function runBenchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 1
) {
  const times: number[] = [];
  
  console.log(`\nRunning benchmark: ${name}`);
  console.log(`Iterations: ${iterations}`);
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

  console.log(`Results:
  Average: ${avg.toFixed(2)}ms
  Min: ${min.toFixed(2)}ms
  Max: ${max.toFixed(2)}ms
  P95: ${p95.toFixed(2)}ms
  `);

  return { avg, min, max, p95 };
}

async function benchmarkSyncService() {
  const syncService = new ActivitySyncService(testOrg.id, testCareHome.id);

  // Benchmark offline storage
  await runBenchmark(
    'Offline Storage - 1000 activities',
    async () => {
      const activities = Array.from({ length: 1000 }, (_, i) => ({
        id: `bench-activity-${i}`,
        title: `Benchmark Activity ${i}`,
        type: ActivityType.PHYSICAL,
        status: ActivityStatus.SCHEDULED,
        startTime: new Date(),
        endTime: new Date(),
        organizationId: testOrg.id,
        careHomeId: testCareHome.id
      }));

      await syncService.saveOfflineActivities(activities);
      await syncService.getOfflineActivities();
      await syncService.clearOfflineData();
    },
    5
  );

  // Benchmark sync operations
  await runBenchmark(
    'Sync - 100 pending changes',
    async () => {
      const changes = Array.from({ length: 100 }, (_, i) => ({
        id: `bench-change-${i}`,
        type: 'create' as const,
        data: {
          title: `Benchmark Change ${i}`,
          type: ActivityType.PHYSICAL,
          status: ActivityStatus.SCHEDULED,
          startTime: new Date(),
          endTime: new Date(),
          organizationId: testOrg.id,
          careHomeId: testCareHome.id
        }
      }));

      for (const change of changes) {
        await syncService.enqueuePendingChange(change.type, change.id, change.data);
      }

      await syncService.syncPendingChanges();
    },
    3
  );
}

async function benchmarkAnalytics() {
  // Create test data
  const activities = Array.from({ length: 1000 }, (_, i) => ({
    id: `bench-analytics-${i}`,
    title: `Benchmark Activity ${i}`,
    type: ActivityType.PHYSICAL,
    status: ActivityStatus.COMPLETED,
    startTime: new Date(),
    endTime: new Date(),
    organizationId: testOrg.id,
    careHomeId: testCareHome.id,
    durationMinutes: 60
  }));

  await prisma.activity.createMany({ data: activities });

  // Benchmark analytics queries
  await runBenchmark(
    'Analytics - Full stats calculation',
    async () => {
      await Promise.all([
        prisma.activity.count({
          where: { organizationId: testOrg.id, careHomeId: testCareHome.id }
        }),
        prisma.activity.groupBy({
          by: ['status'],
          where: { organizationId: testOrg.id, careHomeId: testCareHome.id },
          _count: true
        }),
        prisma.activityParticipant.groupBy({
          by: ['activityId'],
          where: {
            activity: { organizationId: testOrg.id, careHomeId: testCareHome.id }
          },
          _count: true
        }),
        prisma.activity.groupBy({
          by: ['category'],
          where: { organizationId: testOrg.id, careHomeId: testCareHome.id },
          _count: true
        })
      ]);
    },
    10
  );

  // Cleanup
  await prisma.activity.deleteMany({
    where: {
      id: { startsWith: 'bench-analytics-' }
    }
  });
}

async function runAllBenchmarks() {
  try {
    await setupTestData();
    
    console.log('Starting benchmarks...\n');
    
    await benchmarkSyncService();
    await benchmarkAnalytics();
    
    console.log('\nBenchmarks completed successfully.');
  } catch (error) {
    console.error('Benchmark error:', error);
  } finally {
    await clearTestData();
  }
}

// Run benchmarks if called directly
if (require.main === module) {
  runAllBenchmarks().catch(console.error);
}

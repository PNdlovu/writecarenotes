import { prisma } from '@/lib/prisma';
import { ActivityType, ActivityStatus } from '../types';

export const testOrg = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Organization'
};

export const testCareHome = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  name: 'Test Care Home',
  organizationId: testOrg.id
};

export const testUser = {
  id: 'a1b2c3d4-e5f6-4321-8901-abcdef123456',
  email: 'test@example.com',
  organizationId: testOrg.id
};

export async function setupTestData() {
  // Clear existing test data
  await clearTestData();

  // Create test organization
  await prisma.organization.create({
    data: testOrg
  });

  // Create test care home
  await prisma.careHome.create({
    data: testCareHome
  });

  // Create test user
  await prisma.user.create({
    data: testUser
  });

  // Create test activities
  const activities = [
    {
      id: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
      title: 'Morning Exercise',
      description: 'Daily morning exercise routine',
      type: ActivityType.PHYSICAL,
      status: ActivityStatus.COMPLETED,
      startTime: new Date('2024-12-29T08:00:00Z'),
      endTime: new Date('2024-12-29T09:00:00Z'),
      organizationId: testOrg.id,
      careHomeId: testCareHome.id,
      durationMinutes: 60
    },
    {
      id: '2b3c4d5e-6f78-90ab-cdef-123456789012',
      title: 'Art Class',
      description: 'Weekly art session',
      type: ActivityType.CREATIVE,
      status: ActivityStatus.SCHEDULED,
      startTime: new Date('2024-12-30T14:00:00Z'),
      endTime: new Date('2024-12-30T15:30:00Z'),
      organizationId: testOrg.id,
      careHomeId: testCareHome.id,
      durationMinutes: 90
    }
  ];

  await prisma.activity.createMany({
    data: activities
  });

  // Create test participants
  const participants = [
    {
      id: 'p1a2b3c4-d5e6-7890-abcd-ef1234567890',
      activityId: activities[0].id,
      userId: testUser.id,
      status: 'ATTENDED',
      consentDate: new Date('2024-12-28T00:00:00Z')
    },
    {
      id: 'p2b3c4d5-e6f7-8901-bcde-f12345678901',
      activityId: activities[1].id,
      userId: testUser.id,
      status: 'CONFIRMED',
      consentDate: new Date('2024-12-28T00:00:00Z')
    }
  ];

  await prisma.activityParticipant.createMany({
    data: participants
  });
}

export async function clearTestData() {
  await prisma.activityParticipant.deleteMany({
    where: {
      activity: {
        organizationId: testOrg.id
      }
    }
  });

  await prisma.activity.deleteMany({
    where: {
      organizationId: testOrg.id
    }
  });

  await prisma.user.deleteMany({
    where: {
      organizationId: testOrg.id
    }
  });

  await prisma.careHome.deleteMany({
    where: {
      organizationId: testOrg.id
    }
  });

  await prisma.organization.deleteMany({
    where: {
      id: testOrg.id
    }
  });
}

export function mockRequest(overrides = {}) {
  return {
    method: 'GET',
    url: 'http://localhost:3000/api/test',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    ...overrides
  };
}

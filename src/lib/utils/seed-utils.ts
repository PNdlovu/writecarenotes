import { PrismaClient } from '@prisma/client';
import { MOCK_FACILITIES, MOCK_COMPLIANCE_DATA, MOCK_TASKS, MOCK_ACTIVITIES } from '../mock-data/facility-data';

export async function seedDevelopmentData(prisma: PrismaClient) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Attempting to seed development data in production!');
    return;
  }

  try {
    // Similar seeding logic as in prisma/seed.ts
    // This can be used for development/testing environments
  } catch (error) {
    console.error('Error seeding development data:', error);
    throw error;
  }
}

export async function clearDevelopmentData(prisma: PrismaClient) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Attempting to clear data in production!');
    return;
  }

  try {
    await prisma.$transaction([
      prisma.activity.deleteMany(),
      prisma.task.deleteMany(),
      prisma.complianceDocument.deleteMany(),
      prisma.complianceHistory.deleteMany(),
      prisma.complianceRequirement.deleteMany(),
      prisma.compliance.deleteMany(),
      prisma.facility.deleteMany(),
      prisma.organization.deleteMany(),
    ]);
  } catch (error) {
    console.error('Error clearing development data:', error);
    throw error;
  }
} 



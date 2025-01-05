import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Care Home'
      }
    });
    console.log('Created organization:', org);

    // Create a test account
    const account = await prisma.account.create({
      data: {
        organizationId: org.id,
        code: '1000',
        name: 'Cash Account',
        type: 'ASSET',
        category: 'Current Assets',
        description: 'Main cash account',
        createdBy: 'system'
      }
    });
    console.log('Created account:', account);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
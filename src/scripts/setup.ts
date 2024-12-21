import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create initial organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Demo Care Home',
        type: 'CARE_HOME',
        status: 'ACTIVE',
        settings: {},
      },
    })

    // Create admin user
    const hashedPassword = await hash('admin123', 10)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin User',
        organization: {
          connect: { id: organization.id },
        },
      },
    })

    // Create staff record for admin
    await prisma.staff.create({
      data: {
        userId: adminUser.id,
        organizationId: organization.id,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('Initial setup completed successfully!')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

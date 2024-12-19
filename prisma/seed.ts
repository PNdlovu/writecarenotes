import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const password = await hash('password123', 12)

  const users = [
    {
      name: 'Admin User',
      email: 'admin@writecarenotes.com',
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
    },
    {
      name: 'Staff User',
      email: 'staff@writecarenotes.com',
      role: UserRole.STAFF,
      emailVerified: new Date(),
    },
    {
      name: 'Nurse User',
      email: 'nurse@writecarenotes.com',
      role: UserRole.NURSE,
      emailVerified: new Date(),
    }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        hashedPassword: password,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

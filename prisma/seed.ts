import { PrismaClient, UserRole, CareHomeType, Region, RegulatoryBody } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123', 12)

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { code: 'CARE_GROUP_1' },
    update: {},
    create: {
      name: 'Care Group One',
      code: 'CARE_GROUP_1',
      type: 'CARE_GROUP',
      address: '123 Care Street, London',
      phone: '020 1234 5678',
      email: 'info@caregroupone.com',
      website: 'www.caregroupone.com',
      region: Region.ENGLAND,
      regulatoryBody: RegulatoryBody.CQC,
    },
  })

  // Create care homes
  const careHome = await prisma.careHome.upsert({
    where: { id: 'ch1' },
    update: {},
    create: {
      id: 'ch1',
      name: 'Sunshine Care Home',
      type: CareHomeType.RESIDENTIAL,
      capacity: 50,
      address: '456 Care Lane, Manchester',
      phone: '0161 876 5432',
      email: 'info@sunshinecare.com',
      organizationId: organization.id,
    },
  })

  // Create users with different roles
  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@writecarenotes.com',
      role: UserRole.SUPER_ADMIN,
      organizationId: organization.id,
    },
    {
      name: 'Care Home Manager',
      email: 'manager@writecarenotes.com',
      role: UserRole.MANAGER,
      organizationId: organization.id,
      careHomeId: careHome.id,
    },
    {
      name: 'Staff Nurse',
      email: 'nurse@writecarenotes.com',
      role: UserRole.NURSE,
      organizationId: organization.id,
      careHomeId: careHome.id,
    },
    {
      name: 'Care Staff',
      email: 'staff@writecarenotes.com',
      role: UserRole.STAFF,
      organizationId: organization.id,
      careHomeId: careHome.id,
    }
  ]

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        hashedPassword: password,
        emailVerified: new Date(),
      },
    })

    // Create staff profile for care home staff
    if (user.careHomeId) {
      await prisma.staff.upsert({
        where: { userId: createdUser.id },
        update: {},
        create: {
          userId: createdUser.id,
          organizationId: organization.id,
          careHomeId: careHome.id,
          position: user.role.toString(),
          startDate: new Date(),
          qualifications: ['Care Certificate'],
          isActive: true,
        },
      })
    }
  }

  // Create residents
  const residents = [
    {
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1945-06-15'),
      nhsNumber: 'NHS123456789',
      roomNumber: '101',
      admissionDate: new Date('2023-01-15'),
    },
    {
      firstName: 'Mary',
      lastName: 'Johnson',
      dateOfBirth: new Date('1940-03-22'),
      nhsNumber: 'NHS987654321',
      roomNumber: '102',
      admissionDate: new Date('2023-02-20'),
    }
  ]

  for (const resident of residents) {
    await prisma.resident.upsert({
      where: { id: `${resident.firstName.toLowerCase()}-${resident.lastName.toLowerCase()}` },
      update: {},
      create: {
        ...resident,
        careHomeId: careHome.id,
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

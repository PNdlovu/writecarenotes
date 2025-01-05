import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Organization } from '../types/organization.types'

/**
 * Get organization from the current request context
 */
export async function getOrganizationFromRequest(): Promise<Organization | null> {
  const headersList = headers()
  const organizationId = headersList.get('x-organization-id')
  if (!organizationId) {
    return null
  }
  return getOrganization(organizationId)
}

/**
 * Get organization by ID with related data
 */
export async function getOrganization(organizationId: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      users: true,
      settings: true,
      compliance: true,
    },
  })
}



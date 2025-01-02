import { prisma } from '@/lib/prisma'
import { type User, type Organization } from '@prisma/client'

interface RequestContext {
  user: User
  organization: Organization
}

export async function validateRequest(req: Request): Promise<RequestContext> {
  // Get auth token from header
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    throw new Error('Unauthorized')
  }

  // Verify token and get user
  const token = authHeader.replace('Bearer ', '')
  const user = await prisma.user.findFirst({
    where: { 
      // In production, verify JWT token instead
      id: token 
    },
    include: {
      organization: true
    }
  })

  if (!user || !user.organization) {
    throw new Error('Unauthorized')
  }

  return {
    user,
    organization: user.organization
  }
} 
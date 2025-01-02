import { prisma } from '@/lib/prisma'
import { type User } from '@prisma/client'

interface SyncOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entityId: string
  data: any
  timestamp: number
  version: number
}

export async function handleOfflineSync(
  req: Request,
  user: User,
  entityType: string
) {
  const operations: SyncOperation[] = await req.json()

  const results = await Promise.all(
    operations.map(async (op) => {
      try {
        // Get current entity state
        const current = await prisma[entityType].findUnique({
          where: { id: op.entityId }
        })

        // Check for conflicts
        if (current && current.version > op.version) {
          return {
            status: 'CONFLICT',
            entityId: op.entityId,
            serverVersion: current.version
          }
        }

        // Apply operation
        switch (op.type) {
          case 'CREATE':
            await prisma[entityType].create({
              data: {
                ...op.data,
                version: 1,
                syncStatus: 'SYNCED'
              }
            })
            break

          case 'UPDATE':
            await prisma[entityType].update({
              where: { id: op.entityId },
              data: {
                ...op.data,
                version: current ? current.version + 1 : 1,
                syncStatus: 'SYNCED'
              }
            })
            break

          case 'DELETE':
            await prisma[entityType].delete({
              where: { id: op.entityId }
            })
            break
        }

        return {
          status: 'SUCCESS',
          entityId: op.entityId
        }
      } catch (error) {
        console.error(`Sync error for ${entityType}:${op.entityId}:`, error)
        return {
          status: 'ERROR',
          entityId: op.entityId,
          error: error.message
        }
      }
    })
  )

  return Response.json({ results })
} 
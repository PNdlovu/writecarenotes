import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BedService } from '../services/bedService'
import type { Bed, BedOccupancyStats } from '../types/bed.types'

export function useBedManagement(bedId?: string) {
  const { data: session } = useSession()
  const [bed, setBed] = useState<Bed | null>(null)
  const [stats, setStats] = useState<BedOccupancyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const service = BedService.getInstance()
        const context = {
          userId: session.user.id,
          tenantId: session.user.tenantId,
          careHomeId: session.user.careHomeId,
          region: session.user.region,
          language: session.user.language
        }

        // Fetch bed details if bedId is provided
        if (bedId) {
          const bedData = await service.getBed(bedId, context)
          setBed(bedData)
        }

        // Always fetch occupancy stats
        const statsData = await service.getOccupancyStats(context)
        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, bedId])

  const assignResident = async (
    bedId: string,
    residentId: string,
    admissionDate: Date
  ) => {
    if (!session?.user) return

    try {
      const service = BedService.getInstance()
      const context = {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        careHomeId: session.user.careHomeId,
        region: session.user.region,
        language: session.user.language
      }

      const updatedBed = await service.assignResident(
        bedId,
        residentId,
        admissionDate,
        context
      )

      setBed(updatedBed)
      
      // Refresh stats after assignment
      const statsData = await service.getOccupancyStats(context)
      setStats(statsData)

      return updatedBed
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    }
  }

  const reserveBed = async (
    bedId: string,
    residentId: string,
    expectedArrivalDate: Date
  ) => {
    if (!session?.user) return

    try {
      const service = BedService.getInstance()
      const context = {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        careHomeId: session.user.careHomeId,
        region: session.user.region,
        language: session.user.language
      }

      const updatedBed = await service.reserveBed(
        bedId,
        residentId,
        expectedArrivalDate,
        context
      )

      setBed(updatedBed)
      
      // Refresh stats after reservation
      const statsData = await service.getOccupancyStats(context)
      setStats(statsData)

      return updatedBed
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    }
  }

  const dischargeBed = async (bedId: string) => {
    if (!session?.user) return

    try {
      const service = BedService.getInstance()
      const context = {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        careHomeId: session.user.careHomeId,
        region: session.user.region,
        language: session.user.language
      }

      const updatedBed = await service.dischargeBed(bedId, context)
      setBed(updatedBed)
      
      // Refresh stats after discharge
      const statsData = await service.getOccupancyStats(context)
      setStats(statsData)

      return updatedBed
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    }
  }

  return {
    bed,
    stats,
    loading,
    error,
    assignResident,
    reserveBed,
    dischargeBed
  }
}



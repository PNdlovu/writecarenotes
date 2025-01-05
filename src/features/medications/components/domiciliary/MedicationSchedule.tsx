/**
 * @writecarenotes.com
 * @fileoverview Domiciliary medication schedule component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying and managing medication schedules in domiciliary care.
 * Provides interface for viewing scheduled medications and their status.
 */

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DomiciliaryMedication } from './DomiciliaryMedication'

type MedicationSchedule = {
  id: string
  visitId: string
  clientId: string
  medicationId: string
  scheduledTime: Date
  status: string
  medication: {
    name: string
    dosage: string
    route: string
  }
  administration?: {
    id: string
    status: string
    administeredAt: Date
    notes?: string
    witness?: string
  }
}

type Props = {
  visitId: string
  staffId: string
  onRefresh: () => void
}

export function MedicationSchedule({ visitId, staffId, onRefresh }: Props) {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/staff/domiciliary/medications/schedules?visitId=${visitId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch medication schedules')
      }
      const data = await response.json()
      setSchedules(data)
    } catch (error) {
      console.error('Error fetching medication schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    setSelectedSchedule(null)
    fetchSchedules()
    onRefresh()
  }

  if (isLoading) {
    return <MedicationScheduleSkeleton />
  }

  return (
    <div className="space-y-4">
      {schedules.map(schedule => (
        <Card key={schedule.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{schedule.medication.name}</span>
              <Badge
                variant={
                  schedule.status === 'COMPLETED'
                    ? 'success'
                    : schedule.status === 'MISSED'
                    ? 'destructive'
                    : 'default'
                }
              >
                {schedule.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Scheduled for {format(new Date(schedule.scheduledTime), 'HH:mm')}
                </p>
                <p className="text-sm">
                  {schedule.medication.dosage} - {schedule.medication.route}
                </p>
              </div>

              {schedule.administration ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Administration Details</p>
                  <div className="text-sm text-gray-500">
                    <p>
                      Status: {schedule.administration.status}
                      {schedule.administration.witness &&
                        ` (Witnessed by ${schedule.administration.witness})`}
                    </p>
                    <p>
                      Time:{' '}
                      {format(
                        new Date(schedule.administration.administeredAt),
                        'HH:mm'
                      )}
                    </p>
                    {schedule.administration.notes && (
                      <p>Notes: {schedule.administration.notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedSchedule(schedule.id)}
                    disabled={schedule.status === 'COMPLETED'}
                  >
                    Record Administration
                  </Button>
                </div>
              )}

              {selectedSchedule === schedule.id && (
                <DomiciliaryMedication
                  scheduleId={schedule.id}
                  staffId={staffId}
                  medicationName={schedule.medication.name}
                  dosage={schedule.medication.dosage}
                  route={schedule.medication.route}
                  scheduledTime={schedule.scheduledTime}
                  onComplete={handleComplete}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No medications scheduled for this visit
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function MedicationScheduleSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
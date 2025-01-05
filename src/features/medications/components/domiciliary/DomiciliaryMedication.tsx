/**
 * @writecarenotes.com
 * @fileoverview Domiciliary medication administration extension component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Extension component for medication administration in domiciliary care.
 * Adds location verification, offline support, and visit-specific features
 * to the core medication administration component.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, WifiOff } from 'lucide-react'
import { MedicationAdministration } from '../MedicationAdministration'
import { locationVerificationSchema } from '../../services/domiciliaryMedicationExtension'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

type Props = {
  scheduleId: string
  staffId: string
  visitId: string
  medicationName: string
  dosage: string
  route: string
  scheduledTime: Date
  onComplete: () => void
}

export function DomiciliaryMedication({
  scheduleId,
  staffId,
  visitId,
  medicationName,
  dosage,
  route,
  scheduledTime,
  onComplete,
}: Props) {
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false)
  const [locationVerified, setLocationVerified] = useState(false)
  const { getCurrentPosition } = useGeolocation()
  const { isOnline } = useNetworkStatus()

  const verifyLocation = async () => {
    try {
      setIsVerifyingLocation(true)
      const position = await getCurrentPosition()
      
      const response = await fetch('/api/staff/domiciliary/medications/verify-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Location verification failed')
      }

      setLocationVerified(true)
    } catch (error) {
      console.error('Error verifying location:', error)
    } finally {
      setIsVerifyingLocation(false)
    }
  }

  const handleComplete = () => {
    // If offline, store in IndexedDB for later sync
    if (!isOnline) {
      // Implement offline storage logic
    }
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Medication Administration</span>
          {!isOnline && (
            <Badge variant="warning" className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              Offline Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!locationVerified && (
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>Please verify your location before administering medication</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={verifyLocation}
                  disabled={isVerifyingLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isVerifyingLocation ? 'Verifying...' : 'Verify Location'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Use core medication administration component */}
          <MedicationAdministration
            scheduleId={scheduleId}
            staffId={staffId}
            medicationName={medicationName}
            dosage={dosage}
            route={route}
            scheduledTime={scheduledTime}
            disabled={!locationVerified}
            offlineEnabled={true}
            onComplete={handleComplete}
            // Add domiciliary-specific props
            visitId={visitId}
            requiresLocationVerification={true}
            isLocationVerified={locationVerified}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function DomiciliaryMedicationSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
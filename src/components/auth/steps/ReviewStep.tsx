/**
 * @writecarenotes.com
 * @fileoverview Review step component for user registration
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A form component for reviewing and confirming registration details.
 * Features include:
 * - Display of all entered information
 * - Confirmation of details
 * - Final submission handling
 * - Error display
 */

'use client'

import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface ReviewStepProps {
  data: {
    email: string
    firstName: string
    lastName: string
    organization: string
    region: string
    serviceType: string
    operatingHours: {
      twentyFourHour: boolean
      weekends: boolean
      bankHolidays: boolean
    }
    subscription: string
    dataMigration: boolean
  }
  onSubmit: () => void
  onBack: () => void
}

const REGIONS = {
  ENGLAND: 'England (CQC)',
  WALES: 'Wales (CIW)',
  SCOTLAND: 'Scotland (Care Inspectorate)',
  BELFAST: 'Northern Ireland (RQIA)',
  DUBLIN: 'Ireland (HIQA)',
}

const SERVICE_TYPES = {
  DOMICILIARY_CARE: 'Domiciliary Care',
  ELDERLY_RESIDENTIAL: 'Residential Care',
  ELDERLY_NURSING: 'Nursing Care',
  ELDERLY_DEMENTIA: 'Dementia Care',
  SUPPORTED_LIVING: 'Supported Living',
}

export function ReviewStep({ data, onSubmit, onBack }: ReviewStepProps) {
  return (
    <Card className="p-6 rounded-xl bg-white shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Review Your Details</h2>
          <p className="text-sm text-gray-500">Please review your information before submitting</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium">{data.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">First Name</span>
                <p className="font-medium">{data.firstName}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Name</span>
                <p className="font-medium">{data.lastName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Organization Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Organization Name</span>
                <p className="font-medium">{data.organization}</p>
              </div>
              <div>
                <span className="text-gray-500">Region</span>
                <p className="font-medium">{REGIONS[data.region as keyof typeof REGIONS]}</p>
              </div>
              <div>
                <span className="text-gray-500">Service Type</span>
                <p className="font-medium">{SERVICE_TYPES[data.serviceType as keyof typeof SERVICE_TYPES]}</p>
              </div>
            </div>
          </div>

          {data.serviceType === 'DOMICILIARY_CARE' && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Operating Hours</h3>
              <div className="space-y-1 text-sm">
                {data.operatingHours.twentyFourHour && (
                  <p className="text-gray-700">✓ 24/7 Service</p>
                )}
                {data.operatingHours.weekends && (
                  <p className="text-gray-700">✓ Weekend Service</p>
                )}
                {data.operatingHours.bankHolidays && (
                  <p className="text-gray-700">✓ Bank Holiday Service</p>
                )}
                {!data.operatingHours.twentyFourHour && !data.operatingHours.weekends && !data.operatingHours.bankHolidays && (
                  <p className="text-gray-500">Standard business hours</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Subscription Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Plan</span>
                <p className="font-medium capitalize">{data.subscription}</p>
              </div>
              <div>
                <span className="text-gray-500">Data Migration</span>
                <p className="font-medium">{data.dataMigration ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1 border-gray-200 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            className="flex-1 bg-[#34B5B5] hover:opacity-90"
          >
            Submit
          </Button>
        </div>
      </div>
    </Card>
  )
}

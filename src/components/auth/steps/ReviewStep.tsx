'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ReviewStepProps {
  formData: {
    email: string
    firstName: string
    lastName: string
    organization: string
    region: string
    careGroup: string
    subscription: string
    dataMigration: boolean
  }
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
}

export function ReviewStep({ formData, onBack, onSubmit, isLoading }: ReviewStepProps) {
  const getRegionLabel = (value: string) => {
    const regions = {
      'england': 'England (CQC)',
      'wales': 'Wales (CIW)',
      'scotland': 'Scotland (Care Inspectorate)',
      'northern-ireland': 'Northern Ireland (RQIA)',
      'ireland': 'Ireland (HIQA)',
    }
    return regions[value as keyof typeof regions] || value
  }

  const getSubscriptionLabel = (value: string) => {
    const plans = {
      'starter': 'Starter Plan',
      'professional': 'Professional Plan',
      'enterprise': 'Enterprise Plan',
    }
    return plans[value as keyof typeof plans] || value
  }

  const getCareGroupLabel = (value: string) => {
    const groups = {
      'barchester': 'Barchester Healthcare',
      'bupa': 'BUPA Care Homes',
      'four-seasons': 'Four Seasons Health Care',
      'independent': 'Independent Care Home',
    }
    return groups[value as keyof typeof groups] || value
  }

  return (
    <Card className="p-6 rounded-xl bg-white shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Information</h3>
          
          <dl className="space-y-4">
            <div className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">Account Details</dt>
              <dd className="text-sm text-gray-900">{formData.email}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">Personal Information</dt>
              <dd className="text-sm text-gray-900">
                {formData.firstName} {formData.lastName}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">Care Home</dt>
              <dd className="text-sm text-gray-900">{formData.organization}</dd>
              <dd className="text-sm text-gray-600">{getRegionLabel(formData.region)}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">Care Home Group</dt>
              <dd className="text-sm text-gray-900">{getCareGroupLabel(formData.careGroup)}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">Subscription</dt>
              <dd className="text-sm text-gray-900">{getSubscriptionLabel(formData.subscription)}</dd>
              <dd className="text-sm text-gray-600">
                {formData.dataMigration ? 'Including data migration assistance' : 'No data migration required'}
              </dd>
            </div>
          </dl>
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
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 bg-[#34B5B5] hover:opacity-90"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

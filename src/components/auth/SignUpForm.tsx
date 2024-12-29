/**
 * WriteCareNotes.com
 * @fileoverview Sign Up Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { AccountStep } from './steps/AccountStep'
import { PersonalStep } from './steps/PersonalStep'
import { OrganizationStep } from './steps/OrganizationStep'
import { SubscriptionStep } from './steps/SubscriptionStep'
import { ReviewStep } from './steps/ReviewStep'
import Link from 'next/link'

interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  organization: string
  region: string
  careGroup: string
  subscription: string
  dataMigration: boolean
}

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organization: '',
    region: '',
    careGroup: 'independent',
    subscription: 'starter',
    dataMigration: false,
  })
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan')

  const handleNext = (data: Partial<SignUpData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        careGroup: formData.careGroup || 'independent',
        subscription: formData.subscription || 'starter',
        dataMigration: formData.dataMigration || false,
      }

      console.log('Submitting signup data:', payload)

      const response = await fetch('/api/auth/dev-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Signup error:', data)
        throw new Error(data.error || data.details || 'Failed to create account')
      }

      // Show success message
      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      })

      // Redirect to signin page
      router.push('/auth/signin')
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Error creating account",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalSteps = 5

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <AccountStep
            onNext={(data) => handleNext({ ...data })}
          />
        )
      case 2:
        return (
          <PersonalStep
            onNext={(data) => handleNext({ ...data })}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <OrganizationStep
            onNext={(data) => handleNext({ ...data })}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <SubscriptionStep
            onNext={(data) => handleNext({ ...data })}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <ReviewStep
            formData={formData as Required<SignUpData>}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 max-w-[440px] mx-auto">
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </p>
      </div>

      {renderStep()}

      <div className="text-sm text-center text-muted-foreground">
        By creating an account, you agree to our{' '}
        <Link
          href="/terms-of-service"
          className="font-medium text-[#34B5B5] hover:underline"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy-policy"
          className="font-medium text-[#34B5B5] hover:underline"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}

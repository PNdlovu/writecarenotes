/**
 * @writecarenotes.com
 * @fileoverview Multi-step sign up form component
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A multi-step registration form that guides users through the account creation process.
 * Includes steps for account details, personal information, organization setup,
 * subscription selection, and final review.
 */

'use client'

import { useState } from 'react'
import { AccountStep } from './steps/AccountStep'
import { PersonalStep } from './steps/PersonalStep'
import { OrganizationStep } from './steps/OrganizationStep'
import { SubscriptionStep } from './steps/SubscriptionStep'
import { ReviewStep } from './steps/ReviewStep'

interface SignUpData {
  email: string
  password: string
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

export function SignUpForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<SignUpData>>({})

  const handleAccountStep = (data: Pick<SignUpData, 'email' | 'password'>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  const handlePersonalStep = (data: Pick<SignUpData, 'firstName' | 'lastName'>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(3)
  }

  const handleOrganizationStep = (data: Pick<SignUpData, 'organization' | 'region' | 'serviceType' | 'operatingHours'>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(4)
  }

  const handleSubscriptionStep = (data: Pick<SignUpData, 'subscription' | 'dataMigration'>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(5)
  }

  const handleReviewStep = async () => {
    try {
      // Submit registration data
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      // Handle successful registration
      // Redirect to dashboard or show success message
    } catch (error) {
      // Handle registration error
      console.error('Registration error:', error)
    }
  }

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {step === 1 && (
        <AccountStep onNext={handleAccountStep} />
      )}
      {step === 2 && (
        <PersonalStep onNext={handlePersonalStep} onBack={handleBack} />
      )}
      {step === 3 && (
        <OrganizationStep onNext={handleOrganizationStep} onBack={handleBack} />
      )}
      {step === 4 && (
        <SubscriptionStep onNext={handleSubscriptionStep} onBack={handleBack} />
      )}
      {step === 5 && (
        <ReviewStep data={formData as SignUpData} onSubmit={handleReviewStep} onBack={handleBack} />
      )}
    </div>
  )
}

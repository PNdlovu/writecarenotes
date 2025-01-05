'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Label } from '@/components/ui/Form/Label'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Form/Select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/Form/RadioGroup"

const ORGANIZATIONS = [
  {
    label: 'Care Home Groups',
    options: [
      { value: 'barchester', label: 'Barchester Healthcare', description: 'Over 200 care homes across the UK' },
      { value: 'bupa', label: 'BUPA Care Homes', description: 'Leading healthcare provider' },
      { value: 'four-seasons', label: 'Four Seasons Health Care', description: 'Quality care services' },
      { value: 'independent', label: 'Independent Care Home', description: 'Single location or small group' },
    ]
  }
]

const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small care homes',
    features: [
      'Up to 50 residents',
      'Basic care planning',
      'Medication management',
      'Standard reports'
    ],
    price: '£99/month'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for medium-sized facilities',
    features: [
      'Up to 150 residents',
      'Advanced care planning',
      'Electronic MAR charts',
      'Custom reports',
      'Staff management'
    ],
    price: '£199/month'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large care home groups',
    features: [
      'Unlimited residents',
      'Full feature access',
      'Priority support',
      'Custom integrations',
      'Multi-site management'
    ],
    price: 'Custom pricing'
  }
]

const subscriptionSchema = z.object({
  organization: z.string().min(1, 'Please select an organization'),
  subscription: z.string().min(1, 'Please select a subscription plan'),
  dataMigration: z.boolean().optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionStepProps {
  onNext: (data: { careGroup: string; subscription: string; dataMigration: boolean }) => void
  onBack: () => void
}

export function SubscriptionStep({ onNext, onBack }: SubscriptionStepProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    organization: 'independent',
    subscription: 'starter',
    dataMigration: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({})

  const validateField = (field: keyof SubscriptionFormData, value: any) => {
    try {
      if (field === 'dataMigration') return // Optional field
      subscriptionSchema.shape[field].parse(value)
      setErrors(prev => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path.includes(field))
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }))
        }
      }
    }
  }

  const handleChange = (field: keyof SubscriptionFormData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validData = subscriptionSchema.parse(formData)
      onNext({
        careGroup: validData.organization,
        subscription: validData.subscription,
        dataMigration: validData.dataMigration || false,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SubscriptionFormData, string>> = {}
        error.errors.forEach(err => {
          const [field] = err.path
          newErrors[field as keyof SubscriptionFormData] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <Card className="p-6 rounded-xl bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Organization Selection */}
          <div className="space-y-2">
            <Label 
              htmlFor="organization"
              className="text-sm font-medium text-gray-700"
            >
              Care Home Group
            </Label>
            <Select 
              value={formData.organization} 
              onValueChange={(value) => handleChange('organization')(value)}
            >
              <SelectTrigger
                className={cn(
                  "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md h-auto",
                  errors.organization ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
                )}
              >
                <SelectValue>
                  {formData.organization ? (
                    <div className="py-0.5">
                      <div className="font-medium">
                        {ORGANIZATIONS.flatMap(g => g.options).find(o => o.value === formData.organization)?.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ORGANIZATIONS.flatMap(g => g.options).find(o => o.value === formData.organization)?.description}
                      </div>
                    </div>
                  ) : (
                    "Select your organization"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] bg-white border border-gray-200 shadow-lg overflow-hidden"
                position="popper"
                sideOffset={5}
              >
                {ORGANIZATIONS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">
                      {group.label}
                    </SelectLabel>
                    {group.options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="px-3 py-2.5 cursor-pointer data-[highlighted]:bg-[#F0F9FF] data-[highlighted]:text-[#34B5B5] focus:bg-[#F0F9FF] focus:text-[#34B5B5]"
                      >
                        <div className="space-y-0.5">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.organization && (
              <p className="text-sm text-red-500">
                {errors.organization}
              </p>
            )}
          </div>

          {/* Subscription Plans */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Subscription Plan
            </Label>
            <RadioGroup
              value={formData.subscription}
              onValueChange={(value) => handleChange('subscription')(value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {SUBSCRIPTION_PLANS.map((plan) => (
                <label
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col p-4 border rounded-lg cursor-pointer",
                    formData.subscription === plan.id
                      ? "border-[#34B5B5] bg-[#F0F9FF]"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="sr-only"
                  />
                  <div className="flex flex-col h-full">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>
                    <ul className="space-y-2 flex-grow mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-[#34B5B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="font-semibold text-gray-900">{plan.price}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
            {errors.subscription && (
              <p className="text-sm text-red-500">
                {errors.subscription}
              </p>
            )}
          </div>

          {/* Data Migration Option */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Data Migration
            </Label>
            <RadioGroup
              value={formData.dataMigration ? "yes" : "no"}
              onValueChange={(value) => handleChange('dataMigration')(value === "yes")}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <label
                className={cn(
                  "relative flex flex-col p-4 border rounded-lg cursor-pointer",
                  formData.dataMigration
                    ? "border-[#34B5B5] bg-[#F0F9FF]"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <RadioGroupItem
                  value="yes"
                  id="migration-yes"
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">Yes, I need data migration</h3>
                  <p className="text-sm text-gray-500">
                    We'll help you migrate data from your existing system
                  </p>
                </div>
              </label>
              <label
                className={cn(
                  "relative flex flex-col p-4 border rounded-lg cursor-pointer",
                  !formData.dataMigration
                    ? "border-[#34B5B5] bg-[#F0F9FF]"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <RadioGroupItem
                  value="no"
                  id="migration-no"
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">No, I'll start fresh</h3>
                  <p className="text-sm text-gray-500">
                    Start with a clean slate in the new system
                  </p>
                </div>
              </label>
            </RadioGroup>
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
            type="submit" 
            className="flex-1 bg-[#34B5B5] hover:opacity-90"
          >
            Continue
          </Button>
        </div>
      </form>
    </Card>
  )
}

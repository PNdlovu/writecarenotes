'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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
} from "@/components/ui/select"

const REGIONS = [
  {
    label: 'United Kingdom',
    options: [
      { value: 'ENGLAND', label: 'England', description: 'Care Quality Commission (CQC)' },
      { value: 'WALES', label: 'Wales', description: 'Care Inspectorate Wales (CIW)' },
      { value: 'SCOTLAND', label: 'Scotland', description: 'Care Inspectorate' },
      { value: 'BELFAST', label: 'Northern Ireland', description: 'RQIA' },
    ]
  },
  {
    label: 'Ireland',
    options: [
      { value: 'DUBLIN', label: 'Ireland', description: 'Health Information and Quality Authority (HIQA)' },
    ]
  }
]

const organizationSchema = z.object({
  organization: z.string().min(2, 'Organization name must be at least 2 characters'),
  region: z.string().refine(val => ['ENGLAND', 'WALES', 'SCOTLAND', 'BELFAST', 'DUBLIN'].includes(val), {
    message: "Please select a valid region"
  }),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationStepProps {
  onNext: (data: { organization: string; region: string }) => void
  onBack: () => void
}

export function OrganizationStep({ onNext, onBack }: OrganizationStepProps) {
  const [formData, setFormData] = useState<Partial<OrganizationFormData>>({
    organization: '',
    region: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormData, string>>>({})

  const validateField = (field: keyof OrganizationFormData, value: string) => {
    try {
      organizationSchema.shape[field].parse(value)
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

  const handleChange = (field: keyof OrganizationFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validData = organizationSchema.parse(formData)
      onNext(validData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof OrganizationFormData, string>> = {}
        error.errors.forEach(err => {
          const [field] = err.path
          newErrors[field as keyof OrganizationFormData] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <Card className="p-6 rounded-xl bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="organization" 
              className="text-sm font-medium text-gray-700"
            >
              Care Home Name
            </Label>
            <Input
              id="organization"
              placeholder="Your Care Home Name"
              value={formData.organization}
              onChange={(e) => handleChange('organization')(e.target.value)}
              className={cn(
                "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md",
                errors.organization ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
              )}
              aria-invalid={!!errors.organization}
              aria-describedby={errors.organization ? "organization-error" : undefined}
            />
            {errors.organization && (
              <p id="organization-error" className="text-sm text-red-500">
                {errors.organization}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="region"
              className="text-sm font-medium text-gray-700"
            >
              Region
            </Label>
            <Select 
              value={formData.region} 
              onValueChange={(value) => handleChange('region')(value)}
            >
              <SelectTrigger
                className={cn(
                  "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md h-auto",
                  errors.region ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
                )}
              >
                <SelectValue>
                  {formData.region ? (
                    <div className="py-0.5">
                      <div className="font-medium">
                        {REGIONS.flatMap(g => g.options).find(o => o.value === formData.region)?.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {REGIONS.flatMap(g => g.options).find(o => o.value === formData.region)?.description}
                      </div>
                    </div>
                  ) : (
                    "Select your region"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] bg-white border border-gray-200 shadow-lg overflow-hidden"
                position="popper"
                sideOffset={5}
              >
                {REGIONS.map((group) => (
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
            {errors.region && (
              <p id="region-error" className="text-sm text-red-500">
                {errors.region}
              </p>
            )}
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

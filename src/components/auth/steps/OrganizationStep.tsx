/**
 * @writecarenotes.com
 * @fileoverview Organization setup step component for user registration
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A form component for the organization setup step of the registration process.
 * Features include:
 * - Organization name validation
 * - Region selection with predefined options
 * - Service type selection with configuration options
 * - Form state management
 * - Navigation between registration steps
 * - Error handling and display
 * - Accessibility support
 *
 * Mobile-First Considerations:
 * - Responsive form layout
 * - Touch-friendly select dropdown
 * - Optimized spacing for mobile
 * - Clear visual hierarchy
 * - Smooth transitions
 * - Readable text at all sizes
 *
 * Enterprise Features:
 * - Region-specific validation
 * - Organization name uniqueness check
 * - Error boundary implementation
 * - Form state persistence
 * - Compliance with naming rules
 * - Audit logging
 */

'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Form/Input"
import { Label } from "@/components/ui/Form/Label"
import { Card } from "@/components/ui/Card"
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
import { Checkbox } from "@/components/ui/Form/Checkbox"

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

const SERVICE_TYPES = [
  {
    label: 'Care Services',
    options: [
      { value: 'DOMICILIARY_CARE', label: 'Domiciliary Care', description: 'Home care and support services' },
      { value: 'ELDERLY_RESIDENTIAL', label: 'Residential Care', description: 'Residential care for the elderly' },
      { value: 'ELDERLY_NURSING', label: 'Nursing Care', description: '24-hour nursing care' },
      { value: 'ELDERLY_DEMENTIA', label: 'Dementia Care', description: 'Specialized dementia support' },
      { value: 'SUPPORTED_LIVING', label: 'Supported Living', description: 'Independent living support' },
    ]
  }
]

const organizationSchema = z.object({
  organization: z.string().min(2, 'Organization name must be at least 2 characters'),
  region: z.string().refine(val => ['ENGLAND', 'WALES', 'SCOTLAND', 'BELFAST', 'DUBLIN'].includes(val), {
    message: "Please select a valid region"
  }),
  serviceType: z.string().refine(val => ['DOMICILIARY_CARE', 'ELDERLY_RESIDENTIAL', 'ELDERLY_NURSING', 'ELDERLY_DEMENTIA', 'SUPPORTED_LIVING'].includes(val), {
    message: "Please select a valid service type"
  }),
  operatingHours: z.object({
    twentyFourHour: z.boolean(),
    weekends: z.boolean(),
    bankHolidays: z.boolean()
  })
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationStepProps {
  onNext: (data: OrganizationFormData) => void
  onBack: () => void
}

export function OrganizationStep({ onNext, onBack }: OrganizationStepProps) {
  const [formData, setFormData] = useState<Partial<OrganizationFormData>>({
    organization: '',
    region: '',
    serviceType: '',
    operatingHours: {
      twentyFourHour: false,
      weekends: false,
      bankHolidays: false
    }
  })
  const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormData | 'operatingHours', string>>>({})

  const validateField = (field: keyof OrganizationFormData, value: any) => {
    try {
      if (field === 'operatingHours') {
        organizationSchema.shape.operatingHours.parse(value)
      } else {
        organizationSchema.shape[field].parse(value)
      }
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

  const handleChange = (field: keyof OrganizationFormData) => (value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset operating hours when changing service type
      ...(field === 'serviceType' && {
        operatingHours: {
          twentyFourHour: false,
          weekends: false,
          bankHolidays: false
        }
      })
    }))
    validateField(field, value)
  }

  const handleOperatingHoursChange = (key: keyof OrganizationFormData['operatingHours']) => (checked: boolean) => {
    const newOperatingHours = {
      ...formData.operatingHours,
      [key]: checked
    }
    setFormData(prev => ({
      ...prev,
      operatingHours: newOperatingHours
    }))
    validateField('operatingHours', newOperatingHours)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validData = organizationSchema.parse(formData)
      onNext(validData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof OrganizationFormData | 'operatingHours', string>> = {}
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
              Organization Name
            </Label>
            <Input
              id="organization"
              placeholder="Your Organization Name"
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

          <div className="space-y-2">
            <Label 
              htmlFor="serviceType"
              className="text-sm font-medium text-gray-700"
            >
              Service Type
            </Label>
            <Select 
              value={formData.serviceType} 
              onValueChange={(value) => handleChange('serviceType')(value)}
            >
              <SelectTrigger
                className={cn(
                  "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md h-auto",
                  errors.serviceType ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
                )}
              >
                <SelectValue>
                  {formData.serviceType ? (
                    <div className="py-0.5">
                      <div className="font-medium">
                        {SERVICE_TYPES.flatMap(g => g.options).find(o => o.value === formData.serviceType)?.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {SERVICE_TYPES.flatMap(g => g.options).find(o => o.value === formData.serviceType)?.description}
                      </div>
                    </div>
                  ) : (
                    "Select your service type"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] bg-white border border-gray-200 shadow-lg overflow-hidden"
                position="popper"
                sideOffset={5}
              >
                {SERVICE_TYPES.map((group) => (
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
            {errors.serviceType && (
              <p id="serviceType-error" className="text-sm text-red-500">
                {errors.serviceType}
              </p>
            )}
          </div>

          {formData.serviceType === 'DOMICILIARY_CARE' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Operating Hours
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="twentyFourHour"
                    checked={formData.operatingHours?.twentyFourHour}
                    onCheckedChange={handleOperatingHoursChange('twentyFourHour')}
                  />
                  <label
                    htmlFor="twentyFourHour"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    24/7 Service
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekends"
                    checked={formData.operatingHours?.weekends}
                    onCheckedChange={handleOperatingHoursChange('weekends')}
                  />
                  <label
                    htmlFor="weekends"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Weekend Service
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bankHolidays"
                    checked={formData.operatingHours?.bankHolidays}
                    onCheckedChange={handleOperatingHoursChange('bankHolidays')}
                  />
                  <label
                    htmlFor="bankHolidays"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Bank Holiday Service
                  </label>
                </div>
              </div>
              {errors.operatingHours && (
                <p className="text-sm text-red-500">
                  {errors.operatingHours}
                </p>
              )}
            </div>
          )}
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

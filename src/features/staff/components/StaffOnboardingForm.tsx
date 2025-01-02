import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form/Input'
import { Label } from '@/components/ui/Form/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Form/Textarea'
import { Checkbox } from '@/components/ui/Form/Checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/Form/RadioGroup'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { Progress } from '@/components/ui/Progress'
import { StaffRole, RegulatoryBody } from '@prisma/client'
import { useOfflineMutation } from '@/hooks/useOfflineMutation'
import { staffRoleLabels, regulatoryQualifications } from '@/config/constants'
import { createStaffSchema } from '@/lib/validation/staffSchema'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useRegion } from '@/hooks/useRegion'

/**
 * Form schema for staff member registration with regional qualification requirements
 */
const staffFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(StaffRole),
  phone: z.string().optional(),
  regulatoryBody: z.nativeEnum(RegulatoryBody),
  qualificationNumber: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  department: z.string().optional(),
  isFullTime: z.boolean().optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }),
  cqcNumber: z.string().optional(),
  dbsNumber: z.string().optional(),
})

type StaffFormValues = z.infer<typeof staffFormSchema>

interface StaffOnboardingFormProps {
  facilityId: string
  currentStep: number
  totalSteps: number
  onComplete?: () => void
}

/**
 * StaffOnboardingForm Component
 * 
 * Handles the registration of staff members during facility onboarding.
 * Supports offline functionality and regional regulatory requirements.
 * 
 * @param {string} facilityId - The ID of the facility being onboarded
 * @param {number} currentStep - Current step in the onboarding process
 * @param {number} totalSteps - Total number of onboarding steps
 * @param {function} onComplete - Optional callback to execute after successful submission
 */
export function StaffOnboardingForm({ facilityId, currentStep, totalSteps, onComplete }: StaffOnboardingFormProps) {
  const t = useTranslations('StaffOnboarding')
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const region = useRegion()

  // Initialize form with validation
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(createStaffSchema(region)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: StaffRole.CARE_WORKER,
      qualifications: [],
      isFullTime: true,
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    },
  })

  // Offline-capable mutation for staff registration
  const { mutate: registerStaff } = useOfflineMutation({
    mutationFn: async (values: StaffFormValues) => {
      const response = await fetch('/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          ...values,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to register staff member')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['facility', facilityId, 'staff'])
      toast({
        title: t('success.title'),
        description: t('success.description'),
      })
      router.push(`/facility/${facilityId}/onboarding/compliance`)
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message || t('error.description'),
        variant: 'destructive',
      })
    },
    offlineOptions: {
      queue: 'staff-registration',
      retry: true,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await registerStaff(form.getValues())
      if (onComplete) {
        onComplete()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        <LanguageSwitcher />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.firstName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.lastName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.phone')}</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.role')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('placeholders.selectRole')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(staffRoleLabels).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${label}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="regulatoryBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.regulatoryBody')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.selectRegulator')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(RegulatoryBody).map((body) => (
                        <SelectItem key={body} value={body}>
                          {t(`regulators.${body}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualificationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.qualificationNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {region === 'england' && (
            <>
              <FormField
                control={form.control}
                name="cqcNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('regionalRequirements.england.cqcNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dbsNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('regionalRequirements.england.dbs')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="space-y-2">
            <FormLabel>{t('fields.emergencyContact')}</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={t('placeholders.emergencyName')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={t('placeholders.relationship')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="tel" placeholder={t('placeholders.emergencyPhone')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('buttons.submitting') : t('buttons.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}



import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@/components/ui/Card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/Button/Button'
import { useToast } from '@/components/ui/UseToast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Icons } from '@/components/ui/Icons'
import { formatCurrency } from '@/lib/formatting'
import { Badge } from '@/components/ui/Badge/Badge'

// Form schema matching API validation
const payrollEntrySchema = z.object({
  regularHours: z.number().min(0).max(168), // Max hours in a week
  overtimeHours: z.number().min(0),
  holidayHours: z.number().min(0),
  sickHours: z.number().min(0),
  nightHours: z.number().min(0),
  qualificationAllowances: z.array(z.object({
    type: z.enum(['NVQ2', 'NVQ3', 'QCF2', 'QCF3', 'SVQ2', 'SVQ3', 'QQI5']),
    amount: z.number()
  })).optional(),
  specialDutyHours: z.object({
    dementiaCare: z.number().min(0),
    palliativeCare: z.number().min(0),
    medicationSupervision: z.number().min(0)
  }).optional(),
  agencyDetails: z.object({
    agency: z.string().optional(),
    reference: z.string().optional(),
    markupPercentage: z.number().min(0).max(100).optional(),
    invoiceNumber: z.string().optional()
  }).optional(),
  regionalAllowances: z.object({
    londonWeighting: z.boolean().optional(),
    outerLondon: z.boolean().optional(),
    scottishIslands: z.boolean().optional(),
    channelIslands: z.boolean().optional()
  }).optional(),
  bankHolidayHours: z.number().min(0).optional(),
  sleepInShifts: z.number().min(0).optional(),
  oncallHours: z.number().min(0).optional(),
  bankAccount: z.object({
    accountNumber: z.string(),
    sortCode: z.string(),
    accountName: z.string()
  }).optional(),
  pensionDetails: z.object({
    scheme: z.enum(['NEST', 'NOW_PENSIONS', 'PEOPLES_PENSION', 'SMART_PENSION', 'OTHER']),
    employeeContribution: z.number().min(0).max(100),
    employerContribution: z.number().min(0).max(100),
    optOut: z.boolean().optional(),
    optOutDate: z.date().optional()
  }).optional(),
  salarySacrifice: z.array(z.object({
    type: z.enum(['CHILDCARE', 'CYCLE_TO_WORK', 'ELECTRIC_CAR', 'ADDITIONAL_PENSION']),
    amount: z.number().min(0),
    startDate: z.date(),
    endDate: z.date().optional()
  })).optional(),
  benefits: z.array(z.object({
    type: z.enum(['HEALTH_INSURANCE', 'LIFE_INSURANCE', 'DENTAL_COVER', 'GYM_MEMBERSHIP']),
    provider: z.string(),
    monthlyValue: z.number().min(0),
    employeeContribution: z.number().min(0)
  })).optional(),
  hmrcReporting: z.object({
    taxCode: z.string(),
    studentLoanPlan: z.enum(['PLAN_1', 'PLAN_2', 'PLAN_4', 'POSTGRAD']).optional(),
    payrollId: z.string(),
    niNumber: z.string()
  }).optional()
})

interface PayrollEntryProps {
  staffMember: {
    id: string
    name: string
    role: string
    department: string
    hourlyRate: number
    region: string
    employmentType: 'permanent' | 'bank' | 'agency'
    qualifications: Array<{
      type: string
      validUntil: Date
    }>
  }
  onSubmit: (data: z.infer<typeof payrollEntrySchema>) => Promise<void>
}

export function PayrollEntry({ staffMember, onSubmit }: PayrollEntryProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof payrollEntrySchema>>({
    resolver: zodResolver(payrollEntrySchema),
    defaultValues: {
      regularHours: 0,
      overtimeHours: 0,
      holidayHours: 0,
      sickHours: 0,
      nightHours: 0
    }
  })

  const handleSubmit = async (data: z.infer<typeof payrollEntrySchema>) => {
    try {
      setIsCalculating(true)
      await onSubmit(data)
      toast({
        title: 'Success',
        description: 'Payroll entry has been saved',
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save payroll entry',
        variant: 'destructive'
      })
    } finally {
      setIsCalculating(false)
    }
  }

  // Enhanced pay calculation with all allowances
  const calculateEstimatedPay = () => {
    const values = form.getValues()
    
    // Base hours calculation
    const baseHours = 
      values.regularHours +
      values.overtimeHours * 1.5 +
      values.holidayHours +
      values.sickHours
    
    // Night shift premium (typically 20-30% extra)
    const nightPremium = values.nightHours * (staffMember.hourlyRate * 0.25)
    
    // Special duty allowances
    const specialDutyPay = values.specialDutyHours ? (
      (values.specialDutyHours.dementiaCare * 2) +
      (values.specialDutyHours.palliativeCare * 2.5) +
      (values.specialDutyHours.medicationSupervision * 1.5)
    ) : 0

    // Bank holiday premium (double time)
    const bankHolidayPay = (values.bankHolidayHours || 0) * staffMember.hourlyRate * 2

    // Sleep-in shift allowance (fixed rate per shift)
    const sleepInPay = (values.sleepInShifts || 0) * 35 // £35 per sleep-in shift

    // On-call allowance
    const onCallPay = (values.oncallHours || 0) * (staffMember.hourlyRate * 0.15)

    // Regional allowances
    let regionalPremium = 0
    if (values.regionalAllowances) {
      if (values.regionalAllowances.londonWeighting) regionalPremium += baseHours * 3.5 // £3.50/hr
      if (values.regionalAllowances.outerLondon) regionalPremium += baseHours * 2.5 // £2.50/hr
      if (values.regionalAllowances.scottishIslands) regionalPremium += baseHours * 1.5 // £1.50/hr
      if (values.regionalAllowances.channelIslands) regionalPremium += baseHours * 2.0 // £2.00/hr
    }

    // Agency markup if applicable
    let totalPay = (baseHours * staffMember.hourlyRate) + 
                   nightPremium + 
                   specialDutyPay + 
                   bankHolidayPay + 
                   sleepInPay + 
                   onCallPay + 
                   regionalPremium

    if (staffMember.employmentType === 'agency' && values.agencyDetails?.markupPercentage) {
      totalPay *= (1 + values.agencyDetails.markupPercentage / 100)
    }

    // Deduct pension contributions
    if (values.pensionDetails && !values.pensionDetails.optOut) {
      const employeeContribution = totalPay * (values.pensionDetails.employeeContribution / 100)
      totalPay -= employeeContribution
    }

    // Deduct salary sacrifice
    if (values.salarySacrifice) {
      const totalSacrifice = values.salarySacrifice.reduce((total, sacrifice) => {
        return total + sacrifice.amount
      }, 0)
      totalPay -= totalSacrifice
    }

    // Deduct benefit contributions
    if (values.benefits) {
      const totalBenefitContributions = values.benefits.reduce((total, benefit) => {
        return total + benefit.employeeContribution
      }, 0)
      totalPay -= totalBenefitContributions
    }

    return totalPay
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight" role="heading">
            Payroll Entry for {staffMember.name}
          </h2>
          <p className="text-muted-foreground">
            {staffMember.role} - {staffMember.department}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="hours" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="hours" className="text-lg py-3">
              <Icons.clock className="w-4 h-4 mr-2" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="allowances" className="text-lg py-3">
              <Icons.plus className="w-4 h-4 mr-2" />
              Allowances
            </TabsTrigger>
            <TabsTrigger value="deductions" className="text-lg py-3">
              <Icons.minus className="w-4 h-4 mr-2" />
              Deductions
            </TabsTrigger>
            <TabsTrigger value="benefits" className="text-lg py-3">
              <Icons.heart className="w-4 h-4 mr-2" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-lg py-3">
              <Icons.wallet className="w-4 h-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hours">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="regularHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>Standard working hours</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overtimeHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overtime Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>Hours at 1.5x rate</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nightHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Night Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>Hours between 20:00-06:00</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="holidayHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Holiday Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>Paid holiday time</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sickHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sick Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>Paid sick leave</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Special Duty Hours</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="specialDutyHours.dementiaCare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dementia Care</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              className="text-lg p-6"
                            />
                          </FormControl>
                          <FormDescription>£2/hr extra</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialDutyHours.palliativeCare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Palliative Care</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              className="text-lg p-6"
                            />
                          </FormControl>
                          <FormDescription>£2.50/hr extra</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialDutyHours.medicationSupervision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Supervision</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              className="text-lg p-6"
                            />
                          </FormControl>
                          <FormDescription>£1.50/hr extra</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Qualification Allowances */}
                {staffMember.qualifications?.length > 0 && (
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="text-lg font-semibold mb-2">Qualification Allowances</h3>
                    <ul className="space-y-2">
                      {staffMember.qualifications.map(qual => (
                        <li key={qual.type} className="flex justify-between items-center">
                          <span>{qual.type}</span>
                          <Badge variant="secondary">
                            Valid until {new Date(qual.validUntil).toLocaleDateString()}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg bg-muted p-4">
                  <div className="text-lg font-semibold">
                    Estimated Gross Pay: {formatCurrency(calculateEstimatedPay(), 'GBP')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Before tax and deductions
                  </p>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="allowances">
            <Form {...form}>
              <form className="space-y-6">
                {/* Bank Holiday & Special Shifts */}
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="bankHolidayHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Holiday Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>Double time rate</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sleepInShifts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep-in Shifts</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>£35 per shift</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="oncallHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>On-call Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="text-lg p-6"
                          />
                        </FormControl>
                        <FormDescription>15% of hourly rate</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Regional Allowances */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Regional Allowances</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="regionalAllowances.londonWeighting"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel>London Weighting</FormLabel>
                            <FormDescription>£3.50/hr additional</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="regionalAllowances.outerLondon"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel>Outer London</FormLabel>
                            <FormDescription>£2.50/hr additional</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Agency Details if applicable */}
                {staffMember.employmentType === 'agency' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Agency Details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="agencyDetails.agency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="text-lg p-6" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="agencyDetails.reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency Reference</FormLabel>
                            <FormControl>
                              <Input {...field} className="text-lg p-6" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="agencyDetails.markupPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency Markup %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="text-lg p-6"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="agencyDetails.invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input {...field} className="text-lg p-6" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="deductions">
            <Form {...form}>
              <form className="space-y-6">
                {/* Pension Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pension Auto-Enrollment</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pensionDetails.scheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pension Scheme</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full p-2 border rounded">
                              <option value="NEST">NEST</option>
                              <option value="NOW_PENSIONS">NOW Pensions</option>
                              <option value="PEOPLES_PENSION">The People's Pension</option>
                              <option value="SMART_PENSION">Smart Pension</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pensionDetails.employeeContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Contribution %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              className="text-lg p-6"
                            />
                          </FormControl>
                          <FormDescription>Minimum 5% including tax relief</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pensionDetails.employerContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Contribution %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              className="text-lg p-6"
                            />
                          </FormControl>
                          <FormDescription>Minimum 3% required</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Salary Sacrifice */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Salary Sacrifice Schemes</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {['CHILDCARE', 'CYCLE_TO_WORK', 'ELECTRIC_CAR', 'ADDITIONAL_PENSION'].map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name={`salarySacrifice.${type}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{type.replace('_', ' ')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="text-lg p-6"
                              />
                            </FormControl>
                            <FormDescription>Monthly sacrifice amount</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* HMRC Reporting */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">HMRC Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="hmrcReporting.taxCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Code</FormLabel>
                          <FormControl>
                            <Input {...field} className="text-lg p-6" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hmrcReporting.studentLoanPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Loan Plan</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full p-2 border rounded">
                              <option value="">None</option>
                              <option value="PLAN_1">Plan 1</option>
                              <option value="PLAN_2">Plan 2</option>
                              <option value="PLAN_4">Plan 4 (Scotland)</option>
                              <option value="POSTGRAD">Postgraduate Loan</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hmrcReporting.niNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National Insurance Number</FormLabel>
                          <FormControl>
                            <Input {...field} className="text-lg p-6" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="benefits">
            <Form {...form}>
              <form className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employee Benefits</h3>
                  {['HEALTH_INSURANCE', 'LIFE_INSURANCE', 'DENTAL_COVER', 'GYM_MEMBERSHIP'].map((type) => (
                    <div key={type} className="grid gap-4 md:grid-cols-3 p-4 border rounded">
                      <FormField
                        control={form.control}
                        name={`benefits.${type}.provider`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <FormControl>
                              <Input {...field} className="text-lg p-6" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`benefits.${type}.monthlyValue`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Value</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="text-lg p-6"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`benefits.${type}.employeeContribution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee Contribution</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="text-lg p-6"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="payment">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankAccount.accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="text-lg p-6"
                            placeholder="Enter account name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccount.sortCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="text-lg p-6"
                            placeholder="XX-XX-XX"
                            maxLength={6}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccount.accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="text-lg p-6"
                            placeholder="Enter account number"
                            maxLength={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => form.reset()}
        >
          Clear
        </Button>
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto"
          disabled={isCalculating}
          onClick={form.handleSubmit(handleSubmit)}
        >
          {isCalculating ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Save Entry'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 
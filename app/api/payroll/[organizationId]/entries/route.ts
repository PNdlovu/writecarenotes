import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TaxCalculator } from '@/features/payroll/lib/tax-calculator'
import { PaymentProcessor } from '@/features/payroll/lib/payment-processor'
import { CareAllowanceCalculator } from '@/features/payroll/lib/care-allowances'
import { validateRequest } from '@/lib/auth'
import { validateRegionalCompliance } from '@/lib/compliance'
import { createAuditLog } from '@/lib/audit'
import { PayrollStatus, PaymentMethod, PaymentStatus } from '@prisma/client'

// Initialize payment processor
const paymentProcessor = new PaymentProcessor({
  bacsApiKey: process.env.BACS_API_KEY || '',
  sepaApiKey: process.env.SEPA_API_KEY || '',
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'test'
})

// Validation schema
const PayrollEntrySchema = z.object({
  staffId: z.string().cuid(),
  regularHours: z.number().min(0),
  overtimeHours: z.number().min(0),
  holidayHours: z.number().min(0),
  sickHours: z.number().min(0),
  nightHours: z.number().min(0),
  paymentMethod: z.nativeEnum(PaymentMethod).default('BANK_TRANSFER'),
  bankAccount: z.object({
    accountNumber: z.string(),
    sortCode: z.string(),
    accountName: z.string()
  }).optional(),
  notes: z.string().optional()
})

export async function GET(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user, organization } = await validateRequest(req)
    const { organizationId } = params

    // Get query parameters
    const searchParams = new URL(req.url).searchParams
    const query = {
      staffId: searchParams.get('staffId'),
      includeDeductions: searchParams.get('includeDeductions') === 'true',
      includeAdjustments: searchParams.get('includeAdjustments') === 'true',
      periodId: searchParams.get('periodId')
    }

    if (!query.periodId) {
      return NextResponse.json(
        { error: 'Missing periodId query parameter' },
        { status: 400 }
      )
    }

    // Get payroll entries
    const entries = await prisma.payrollEntry.findMany({
      where: {
        periodId: query.periodId,
        ...(query.staffId ? { staffId: query.staffId } : {}),
        organizationId
      },
      include: {
        staff: true,
        ...(query.includeDeductions ? { deductions: true } : {}),
        ...(query.includeAdjustments ? { adjustments: true } : {})
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error in GET /api/payroll/entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user, organization } = await validateRequest(req)
    const { organizationId } = params
    const searchParams = new URL(req.url).searchParams
    const periodId = searchParams.get('periodId')

    if (!periodId) {
      return NextResponse.json(
        { error: 'Missing periodId query parameter' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validatedData = PayrollEntrySchema.parse(body)

    // Get staff member details
    const staff = await prisma.staff.findUnique({
      where: { id: validatedData.staffId },
      include: {
        department: true,
        payrollSettings: true
      }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Calculate pay components
    const taxCalculator = new TaxCalculator(staff.region)
    const careAllowanceCalculator = new CareAllowanceCalculator(staff.department.type)

    const totalHours = 
      validatedData.regularHours +
      validatedData.overtimeHours +
      validatedData.holidayHours +
      validatedData.sickHours +
      validatedData.nightHours

    const baseRate = staff.payrollSettings?.hourlyRate || 0
    const overtimeRate = baseRate * 1.5
    const nightRate = baseRate * 1.25

    const grossPay = 
      (validatedData.regularHours * baseRate) +
      (validatedData.overtimeHours * overtimeRate) +
      (validatedData.holidayHours * baseRate) +
      (validatedData.sickHours * baseRate) +
      (validatedData.nightHours * nightRate)

    const taxYear = getCurrentTaxYear(staff.region)
    const taxPeriod = getCurrentTaxPeriod(new Date())

    const taxDeductions = await taxCalculator.calculateDeductions({
      grossPay,
      taxYear,
      taxPeriod,
      taxCode: staff.payrollSettings?.taxCode || 'BASIC',
      studentLoan: staff.payrollSettings?.hasStudentLoan || false
    })

    const careAllowance = await careAllowanceCalculator.calculate({
      hoursWorked: totalHours,
      department: staff.department.type
    })

    // Create payroll entry
    const payrollEntry = await prisma.payrollEntry.create({
      data: {
        ...validatedData,
        periodId,
        organizationId,
        grossPay,
        netPay: grossPay - taxDeductions.total + careAllowance,
        taxDeductions: {
          create: {
            incomeTax: taxDeductions.incomeTax,
            nationalInsurance: taxDeductions.nationalInsurance,
            studentLoan: taxDeductions.studentLoan,
            total: taxDeductions.total
          }
        },
        adjustments: {
          create: {
            type: 'CARE_ALLOWANCE',
            amount: careAllowance,
            description: 'Care staff allowance'
          }
        },
        status: PayrollStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdBy: user.id
      }
    })

    // Create audit log
    await createAuditLog({
      type: 'PAYROLL',
      action: 'CREATE_ENTRY',
      resourceId: payrollEntry.id,
      organizationId,
      userId: user.id,
      metadata: {
        staffId: staff.id,
        periodId,
        grossPay,
        netPay: payrollEntry.netPay
      }
    })

    return NextResponse.json(payrollEntry, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/payroll/entries:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getCurrentTaxYear(region: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // UK tax year starts in April
  return region === 'UK' && month < 3 ? `${year-1}-${year}` : `${year}-${year+1}`
}

function getCurrentTaxPeriod(startDate: Date): number {
  return Math.floor((startDate.getMonth() + 1) / 3)
}

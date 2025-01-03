import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { handleOfflineSync } from '@/lib/offline'
import { validateRegionalCompliance } from '@/lib/compliance'
import { createAuditLog } from '@/lib/audit'
import { PayrollStatus, PaymentMethod, Region } from '@prisma/client'
import { z } from 'zod'

// Validation schema
const PayrollPeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  currency: z.string().default('GBP'),
  paymentMethod: z.nativeEnum(PaymentMethod).default('BANK_TRANSFER'),
  notes: z.string().optional()
})

export async function GET(req: Request) {
  try {
    // Validate request and get user context
    const { user, organization } = await validateRequest(req)
    
    // Handle offline sync request
    const isOfflineSync = req.headers.get('x-offline-sync')
    if (isOfflineSync) {
      return handleOfflineSync(req, user, 'payroll')
    }

    // Get query parameters
    const searchParams = new URL(req.url).searchParams
    const query = {
      status: searchParams.get('status') as PayrollStatus,
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      includeEntries: searchParams.get('includeEntries') === 'true',
      includeDeductions: searchParams.get('includeDeductions') === 'true'
    }

    // Build where clause
    const where = {
      orgId: organization.id,
      ...(query.status && { status: query.status }),
      ...(query.startDate && query.endDate && {
        startDate: { gte: new Date(query.startDate) },
        endDate: { lte: new Date(query.endDate) }
      })
    }

    // Fetch payroll periods with proper tenant isolation
    const payrollPeriods = await prisma.payrollPeriod.findMany({
      where,
      include: {
        ...(query.includeEntries && {
          entries: {
            include: {
              ...(query.includeDeductions && {
                deductions: true
              })
            }
          }
        })
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Create audit log
    await createAuditLog({
      action: 'PAYROLL_LIST_VIEWED',
      userId: user.id,
      orgId: organization.id,
      details: { query }
    })

    return NextResponse.json({ data: payrollPeriods })
  } catch (error) {
    console.error('Payroll GET error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Validate request and get user context
    const { user, organization } = await validateRequest(req)
    
    // Parse and validate request body
    const body = await req.json()
    const data = PayrollPeriodSchema.parse(body)

    // Validate regional compliance
    const complianceResult = await validateRegionalCompliance({
      type: 'PAYROLL_CREATE',
      data: body,
      region: organization.region
    })

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 422 }
      )
    }

    // Get organization's payroll settings
    const settings = await prisma.payrollSettings.findUnique({
      where: { orgId: organization.id }
    })

    if (!settings) {
      return NextResponse.json(
        { error: 'Payroll settings not found' },
        { status: 404 }
      )
    }

    // Create payroll period
    const payrollPeriod = await prisma.payrollPeriod.create({
      data: {
        ...data,
        orgId: organization.id,
        region: organization.region,
        currency: settings.currency,
        status: PayrollStatus.DRAFT,
        complianceStatus: complianceResult.status,
        // Set initial sync status
        version: 1,
        syncStatus: 'SYNCED'
      }
    })

    // Create audit log
    await createAuditLog({
      action: 'PAYROLL_PERIOD_CREATED',
      userId: user.id,
      orgId: organization.id,
      details: { payrollPeriodId: payrollPeriod.id }
    })

    return NextResponse.json({ data: payrollPeriod }, { status: 201 })
  } catch (error) {
    console.error('Payroll POST error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 

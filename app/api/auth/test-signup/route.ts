import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { CareHomeType, Region } from '@prisma/client'
import { organizationService } from '@/features/organizations/services/organizationService'
import { OrganizationType, RegulatoryBody } from '@/features/organizations/types/organization.types'

// Simplified test schema
const testSchema = z.object({
  step: z.enum(['org', 'user', 'staff']),
  data: z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    organization: z.string().min(2).optional(),
    region: z.string().optional(),
  })
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Test endpoint received:', body)

    const { step, data } = testSchema.parse(body)

    switch (step) {
      case 'org': {
        try {
          // Create organization using the service
          const org = await organizationService.createOrganization({
            name: data.organization!,
            type: OrganizationType.SINGLE_SITE,
            region: data.region as Region,
            regulatoryBody: getRegulatoryBody(data.region as Region),
            settings: {
              regional: {
                timezone: 'Europe/London',
                language: 'en',
                dateFormat: 'DD/MM/YYYY',
                currency: 'GBP',
              }
            },
            contactDetails: {
              primary: {
                name: 'Primary Contact',
                email: 'contact@example.com',
                phone: '0123456789',
                role: 'Manager'
              },
              billing: {
                name: 'Billing Contact',
                email: 'billing@example.com',
                phone: '0123456789',
                address: {
                  line1: 'Address Line 1',
                  city: 'City',
                  county: 'County',
                  postcode: 'Postcode',
                  country: 'United Kingdom'
                }
              },
              emergency: {
                name: 'Emergency Contact',
                email: 'emergency@example.com',
                phone: '0123456789',
                available24x7: true
              }
            }
          })
          console.log('Created organization:', org)
          return NextResponse.json({ success: true, org })
        } catch (error) {
          console.error('Organization creation error:', error)
          return NextResponse.json({ 
            error: 'Organization creation failed', 
            details: error instanceof Error ? error.message : String(error) 
          }, { status: 500 })
        }
      }

      case 'user': {
        try {
          const user = await prisma.user.create({
            data: {
              email: data.email!,
              password: await hash(data.password!, 10),
              name: `${data.firstName} ${data.lastName}`,
              role: 'REGISTERED_MANAGER',
              orgId: data.organization!, // Pass org ID in organization field
            }
          })
          console.log('Created user:', user)
          return NextResponse.json({ success: true, user })
        } catch (error) {
          console.error('User creation error:', error)
          return NextResponse.json({ 
            error: 'User creation failed', 
            details: error instanceof Error ? error.message : String(error) 
          }, { status: 500 })
        }
      }

      case 'staff': {
        try {
          const staff = await prisma.staff.create({
            data: {
              userId: data.email!, // Pass user ID in email field
              orgId: data.organization!, // Pass org ID in organization field
              position: 'Registered Manager',
              department: 'Management',
            }
          })
          console.log('Created staff:', staff)
          return NextResponse.json({ success: true, staff })
        } catch (error) {
          console.error('Staff creation error:', error)
          return NextResponse.json({ 
            error: 'Staff creation failed', 
            details: error instanceof Error ? error.message : String(error) 
          }, { status: 500 })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }
  } catch (error) {
    console.error('Test endpoint error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Test endpoint error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

function getRegulatoryBody(region: Region): RegulatoryBody {
  switch (region) {
    case Region.ENGLAND:
      return RegulatoryBody.CQC
    case Region.WALES:
      return RegulatoryBody.CIW
    case Region.SCOTLAND:
      return RegulatoryBody.CARE_INSPECTORATE
    case Region.NORTHERN_IRELAND:
      return RegulatoryBody.RQIA
    case Region.IRELAND:
      return RegulatoryBody.HIQA
    default:
      return RegulatoryBody.CQC
  }
}

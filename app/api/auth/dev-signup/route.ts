import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  organization: z.string().min(2),
  region: z.string().transform(val => val.toUpperCase()).refine(val => ['ENGLAND', 'WALES', 'SCOTLAND', 'BELFAST', 'DUBLIN'].includes(val), {
    message: "Region must be one of: ENGLAND, WALES, SCOTLAND, BELFAST, DUBLIN"
  }),
  careGroup: z.string().optional().default('independent'),
  subscription: z.string().optional().default('starter'),
  dataMigration: z.boolean().optional().default(false),
})

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json()
    
    console.log('Received signup data:', body)

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate data with defaults
    const data = signupSchema.parse({
      ...body,
      careGroup: body.careGroup || 'independent',
      subscription: body.subscription || 'starter',
      dataMigration: body.dataMigration || false
    })

    console.log('Validated data:', data)

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (exists) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    try {
      // Create organization first
      const organization = await prisma.organization.create({
        data: {
          name: data.organization,
          type: 'RESIDENTIAL_CARE' as CareHomeType,  // Explicitly type as CareHomeType
          region: data.region as Region,  // Explicitly type as Region
        }
      })

      console.log('Created organization:', organization)

      // Create user with organization
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: await hash(data.password, 10),
          name: `${data.firstName} ${data.lastName}`,
          role: 'REGISTERED_MANAGER',  // Set as manager for dev signup
          orgId: organization.id,
        }
      })

      console.log('Created user:', user)

      // Create staff record with department
      await prisma.staff.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          position: 'Registered Manager',
          department: 'Management',  // Required field
        }
      })

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
          }
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ 
          error: 'Database error',
          details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

  } catch (error) {
    console.error('Signup error:', error instanceof Error ? error.stack : error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while creating your account',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

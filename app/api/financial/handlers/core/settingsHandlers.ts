/**
 * @fileoverview Core Financial Settings Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Core handlers for financial settings management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import { financialSettingsSchema } from '../../validation/core/schemas';
import { REGIONS } from '../../constants/regions';
import { REGULATORY_BODIES } from '../../constants/regulatoryBodies';

const logger = new Logger('financial-settings');

export async function handleGetSettings(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId === params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.organizationSettings.findUnique({
      where: { organizationId: params.organizationId },
      include: {
        offlineSettings: true,
        auditSettings: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    // Enrich with regional and regulatory information
    const region = REGIONS[settings.region];
    const regulatoryBody = REGULATORY_BODIES[settings.region][settings.regulatoryBody];

    return NextResponse.json({
      ...settings,
      region,
      regulatoryBody,
    });
  } catch (error) {
    logger.error('Failed to fetch settings', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function handleUpdateSettings(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId === params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const validatedData = financialSettingsSchema.parse(data);

    // Verify regulatory body is valid for the region
    const regulatoryBody = REGULATORY_BODIES[validatedData.region][validatedData.regulatoryBody];
    if (!regulatoryBody) {
      return NextResponse.json(
        { error: 'Invalid regulatory body for region' },
        { status: 400 }
      );
    }

    // Update settings with audit trail
    const settings = await prisma.$transaction(async (tx) => {
      const updated = await tx.organizationSettings.update({
        where: { organizationId: params.organizationId },
        data: {
          region: validatedData.region,
          regulatoryBody: validatedData.regulatoryBody,
          currency: validatedData.currency,
          taxRate: validatedData.taxRate,
          billingCycle: validatedData.billingCycle,
          paymentTerms: validatedData.paymentTerms,
          autoInvoicing: validatedData.autoInvoicing,
          offlineSettings: {
            upsert: {
              create: validatedData.offlineSupport,
              update: validatedData.offlineSupport,
            },
          },
          auditSettings: {
            upsert: {
              create: validatedData.audit,
              update: validatedData.audit,
            },
          },
          updatedById: session.user.id,
        },
        include: {
          offlineSettings: true,
          auditSettings: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          organizationId: params.organizationId,
          userId: session.user.id,
          action: 'UPDATE_SETTINGS',
          resourceType: 'FINANCIAL_SETTINGS',
          resourceId: updated.id,
          details: {
            region: validatedData.region,
            regulatoryBody: validatedData.regulatoryBody,
            changes: validatedData,
          },
        },
      });

      return updated;
    });

    return NextResponse.json(settings);
  } catch (error) {
    logger.error('Failed to update settings', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 

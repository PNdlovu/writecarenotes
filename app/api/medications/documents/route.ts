/**
 * @writecarenotes.com
 * @fileoverview Medication Documentation API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for medication documentation including MAR charts,
 * consent forms, prescriptions, and other regulatory documents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { documentationService } from '@/features/medications/services/documentationService';
import { marService } from '@/features/medications/services/marService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const documentQuerySchema = z.object({
  residentId: z.string(),
  type: z.enum(['MAR', 'CONSENT', 'PRESCRIPTION', 'PROTOCOL']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

const documentGenerationSchema = z.object({
  residentId: z.string(),
  type: z.enum(['MAR', 'CONSENT', 'PRESCRIPTION', 'PROTOCOL']),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  medications: z.array(z.string()).optional(),
  format: z.enum(['PDF', 'EXCEL']).optional(),
  includeSignatures: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedParams = documentQuerySchema.parse(searchParams);

    let documents;
    switch (validatedParams.type) {
      case 'MAR':
        documents = await marService.getMarCharts(validatedParams);
        break;
      default:
        documents = await documentationService.getDocuments(validatedParams);
    }

    return NextResponse.json(documents);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = documentGenerationSchema.parse(data);

    const document = await documentationService.generateDocument({
      ...validatedData,
      generatedBy: user.id,
    });

    await createAuditLog({
      action: 'document.generate',
      entityType: 'resident',
      entityId: validatedData.residentId,
      performedBy: user.id,
      details: { ...validatedData, documentId: document.id },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { documentId, action } = await req.json();
    
    if (!documentId || !action) {
      return new NextResponse('Document ID and action are required', { status: 400 });
    }

    let result;
    switch (action) {
      case 'sign':
        result = await documentationService.signDocument(documentId, user.id);
        break;
      case 'archive':
        result = await documentationService.archiveDocument(documentId, user.id);
        break;
      default:
        return new NextResponse('Invalid action', { status: 400 });
    }

    await createAuditLog({
      action: `document.${action}`,
      entityType: 'document',
      entityId: documentId,
      performedBy: user.id,
      details: { action, result },
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
} 
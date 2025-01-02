/**
 * @fileoverview Telehealth Document Upload API Route
 * @version 1.0.0
 * @created 2024-12-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentManagementService } from '@/features/telehealth/services/documentManagement';
import { SecurityService } from '@/features/telehealth/services/security';
import { validateRequestBody } from '@/lib/api';
import { TelehealthServiceError } from '@/features/telehealth/services/enhancedTelehealth';

const documentService = new DocumentManagementService();
const securityService = new SecurityService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consultationId, residentId, type, title, content } = validateRequestBody(
      body,
      ['residentId', 'type', 'title', 'content']
    );
    const user = (req as any).user; // TODO: Update with your auth implementation

    await securityService.validateAccess(
      user.id,
      user.role,
      'document',
      'create'
    );

    const document = await documentService.createDocument({
      consultationId,
      residentId,
      type,
      title,
      content: Buffer.from(content),
      mimeType: req.headers.get('content-type') || 'application/octet-stream',
      createdBy: user.id,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Telehealth API Error:', error);

    if (error instanceof TelehealthServiceError) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
} 
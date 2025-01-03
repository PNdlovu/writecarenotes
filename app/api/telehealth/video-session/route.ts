/**
 * @fileoverview Telehealth Video Session API Route
 * @version 1.0.0
 * @created 2024-12-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { VideoConsultationService } from '@/features/telehealth/services/videoConsultation';
import { SecurityService } from '@/features/telehealth/services/security';
import { validateRequestBody } from '@/lib/api';
import { TelehealthServiceError } from '@/features/telehealth/services/enhancedTelehealth';
import { rateLimit } from '@/lib/api/rateLimit';
import { validateRegionalCompliance } from '@/lib/compliance';
import { auditLog } from '@/lib/audit';
import { i18n } from '@/lib/i18n';
import { CacheControl } from '@/lib/cache';

const videoService = new VideoConsultationService();
const securityService = new SecurityService();

// Rate limit: 50 video sessions per minute
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 250
});

export async function POST(req: NextRequest) {
  try {
    // 1. Enterprise Features
    const rateLimitResult = await limiter.check(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }

    // 2. Regional & Language Support
    const region = req.headers.get('x-region') || 'GB';
    const language = req.headers.get('accept-language') || 'en-GB';
    const i18nInstance = await i18n.getTranslator(language);

    // 3. Request Processing
    const body = await req.json();
    const { consultationId, participants } = validateRequestBody(body, [
      'consultationId',
      'participants',
    ]);
    const user = (req as any).user;

    // 4. Compliance Validation
    const complianceResult = await validateRegionalCompliance({
      region,
      action: 'telehealth.video-session.create',
      data: { consultationId, participants }
    });

    if (!complianceResult.valid) {
      return NextResponse.json({
        error: i18nInstance.t('compliance.validation.failed'),
        details: complianceResult.errors
      }, { status: 422 });
    }

    // 5. Access Control
    await securityService.validateAccess(
      user.id,
      user.role,
      'video-session',
      'create'
    );

    // 6. Core Business Logic
    const session = await videoService.initializeSession(
      consultationId,
      participants,
      { region, language }
    );

    // 7. Audit Trail
    await auditLog.create({
      action: 'telehealth.video-session.created',
      userId: user.id,
      resourceId: session.id,
      metadata: {
        region,
        consultationId,
        participantCount: participants.length
      }
    });

    // 8. Response
    const response = NextResponse.json(session, { 
      status: 201,
      headers: {
        'Cache-Control': CacheControl.NoStore,
        'Content-Language': language,
        'X-Region': region
      }
    });

    // 9. GDPR Compliance Headers
    response.headers.set('X-Data-Processing-Basis', 'consent');
    response.headers.set('X-Data-Retention-Period', '30-days');
    response.headers.set('X-Data-Protection-Officer', 'dpo@writecarenotes.com');

    return response;

  } catch (error) {
    console.error('Telehealth API Error:', error);

    if (error instanceof TelehealthServiceError) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
      }, { 
        status: 400,
        headers: {
          'X-Error-Code': error.code
        }
      });
    }

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
} 

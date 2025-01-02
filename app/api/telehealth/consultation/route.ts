/**
 * @fileoverview Telehealth Consultation API Route
 * @version 1.0.0
 * @created 2024-12-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnhancedTelehealth } from '@/features/telehealth/services/enhancedTelehealth';
import { SecurityService } from '@/features/telehealth/services/security';
import { validateRequestBody } from '@/lib/api';
import { TelehealthServiceError } from '@/features/telehealth/services/enhancedTelehealth';
import { rateLimit } from '@/lib/api/rateLimit';
import { validateRegionalCompliance } from '@/lib/compliance';
import { auditLog } from '@/lib/audit';
import { i18n } from '@/lib/i18n';
import { CacheControl } from '@/lib/cache';
import { telemetry } from '@/lib/telemetry';
import { performanceMetrics } from '@/lib/metrics';
import { complianceAlert } from '@/lib/alerts';
import { videoQuality } from '@/lib/video';

const telehealthService = new EnhancedTelehealth();
const securityService = new SecurityService();

// Rate limit: 100 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  try {
    // 1. Performance & Network Check
    const networkQuality = await videoQuality.checkConnection();
    telemetry.recordNetworkQuality(networkQuality);

    // 2. Rate Limiting
    const rateLimitResult = await limiter.check(req);
    if (!rateLimitResult.success) {
      telemetry.recordRateLimitExceeded(requestId);
      return NextResponse.json({ error: 'Too many requests' }, { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }

    // 3. Regional & Language Support
    const region = req.headers.get('x-region') || 'GB';
    const language = req.headers.get('accept-language') || 'en-GB';
    const i18nInstance = await i18n.getTranslator(language);
    const isOfstedRegulated = req.headers.get('x-service-type') === 'children';

    // 4. Request Processing
    const body = await req.json();
    const { careHomeId, data } = validateRequestBody(body, ['careHomeId', 'data']);
    const user = (req as any).user;

    // 5. Compliance Validation
    const complianceResult = await validateRegionalCompliance({
      region,
      action: 'telehealth.consultation.create',
      data: { careHomeId, ...data },
      serviceType: isOfstedRegulated ? 'ofsted' : 'adult-care',
      regulators: isOfstedRegulated ? ['OFSTED'] : ['CQC', 'CIW', 'RQIA', 'HIQA']
    });

    if (!complianceResult.valid) {
      // Alert on compliance violations
      await complianceAlert.send({
        type: 'compliance_violation',
        region,
        details: complianceResult.errors,
        serviceType: isOfstedRegulated ? 'ofsted' : 'adult-care'
      });

      return NextResponse.json({
        error: i18nInstance.t('compliance.validation.failed'),
        details: complianceResult.errors
      }, { status: 422 });
    }

    // 6. Access Control
    await securityService.validateAccess(
      user.id,
      user.role,
      'consultation',
      'create'
    );

    // 7. Video Quality Adjustment
    const videoSettings = videoQuality.getOptimalSettings(networkQuality);

    // 8. Core Business Logic
    const consultation = await telehealthService.facilitateRemoteConsultations(
      careHomeId,
      {
        ...data,
        region,
        language,
        videoSettings,
        isOfstedRegulated
      }
    );

    // 9. Audit Trail
    await auditLog.create({
      action: 'telehealth.consultation.created',
      userId: user.id,
      resourceId: consultation.id,
      metadata: {
        region,
        careHomeId,
        consultationType: data.type,
        serviceType: isOfstedRegulated ? 'ofsted' : 'adult-care',
        networkQuality,
        videoSettings
      }
    });

    // 10. Performance Metrics
    const endTime = performance.now();
    performanceMetrics.record('consultation_creation', endTime - startTime, {
      region,
      success: true,
      networkQuality: networkQuality.score
    });

    // 11. Response
    const response = NextResponse.json(consultation, { 
      status: 201,
      headers: {
        'Cache-Control': CacheControl.Private,
        'Content-Language': language,
        'X-Region': region,
        'X-Request-ID': requestId
      }
    });

    // 12. Compliance Headers
    const retentionPeriod = isOfstedRegulated ? '25-years' : '7-years';
    response.headers.set('X-Data-Processing-Basis', 'legitimate-interest');
    response.headers.set('X-Data-Retention-Period', retentionPeriod);
    response.headers.set('X-Data-Protection-Officer', 'dpo@writecarenotes.com');
    response.headers.set('X-Regulatory-Body', isOfstedRegulated ? 'OFSTED' : 'CQC,CIW,RQIA,HIQA');

    return response;

  } catch (error) {
    // Record error metrics
    const endTime = performance.now();
    performanceMetrics.record('consultation_creation', endTime - startTime, {
      region: req.headers.get('x-region') || 'GB',
      success: false,
      error: error.code || 'UNKNOWN_ERROR'
    });

    console.error('Telehealth API Error:', error);

    if (error instanceof TelehealthServiceError) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
      }, { 
        status: 400,
        headers: {
          'X-Error-Code': error.code,
          'X-Request-ID': requestId
        }
      });
    }

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { 
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    });
  }
} 
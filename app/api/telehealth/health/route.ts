/**
 * @fileoverview Telehealth Service Health Check
 * @version 1.0.0
 * @created 2024-12-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { VideoConsultationService } from '@/features/telehealth/services/videoConsultation';
import { EnhancedTelehealth } from '@/features/telehealth/services/enhancedTelehealth';
import { CacheControl } from '@/lib/cache';

const videoService = new VideoConsultationService();
const telehealthService = new EnhancedTelehealth();

export async function GET(req: NextRequest) {
  try {
    const region = req.headers.get('x-region') || 'GB';
    
    // Check core services
    const [videoStatus, telehealthStatus] = await Promise.all([
      videoService.checkHealth(),
      telehealthService.checkHealth()
    ]);

    const isHealthy = videoStatus.healthy && telehealthStatus.healthy;

    const status = {
      service: 'telehealth',
      status: isHealthy ? 'healthy' : 'degraded',
      region,
      timestamp: new Date().toISOString(),
      components: {
        video: videoStatus,
        telehealth: telehealthStatus
      },
      version: '1.0.0'
    };

    return NextResponse.json(status, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': CacheControl.NoCache,
        'X-Region': region
      }
    });

  } catch (error) {
    console.error('Health Check Error:', error);

    return NextResponse.json({
      service: 'telehealth',
      status: 'unhealthy',
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': CacheControl.NoCache
      }
    });
  }
} 
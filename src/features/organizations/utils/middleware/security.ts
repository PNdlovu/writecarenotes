/**
 * WriteCareNotes.com
 * @fileoverview Security Headers Middleware
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';

export function securityHeaders(req: Request) {
  const headers = new Headers();

  // Security Headers
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'origin-when-cross-origin');
  headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy
  headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests",
  ].join('; '));

  // Feature Policy
  headers.set('Feature-Policy', [
    "camera 'none'",
    "microphone 'none'",
    "geolocation 'none'",
    "payment 'none'",
    "usb 'none'",
  ].join('; '));

  return headers;
} 
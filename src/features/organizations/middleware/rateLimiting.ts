/**
 * WriteCareNotes.com
 * @fileoverview Rate Limiting Middleware
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { RateLimitError } from '@/lib/errors';
import { tenantContext } from '@/lib/tenant';

const RATE_LIMITS = {
  'BASIC': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  'PROFESSIONAL': {
    windowMs: 15 * 60 * 1000,
    max: 300
  },
  'ENTERPRISE': {
    windowMs: 15 * 60 * 1000,
    max: 1000
  }
};

// In-memory store for rate limiting
// In production, use Redis or similar
const store = new Map<string, { count: number; resetTime: number }>();

export async function rateLimiter(req: Request) {
  try {
    const context = tenantContext.getContext();
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const key = `${context.tenantId}:${ip}`;
    
    // Get rate limit based on subscription plan
    const plan = context.subscription.plan.toUpperCase();
    const limit = RATE_LIMITS[plan] || RATE_LIMITS.BASIC;
    
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    // Clean up old entries
    for (const [storedKey, data] of store.entries()) {
      if (data.resetTime < windowStart) {
        store.delete(storedKey);
      }
    }
    
    // Get or create rate limit entry
    const entry = store.get(key) || { count: 0, resetTime: now + limit.windowMs };
    
    // Check if limit exceeded
    if (entry.count >= limit.max) {
      throw new RateLimitError('Rate limit exceeded');
    }
    
    // Update count
    entry.count++;
    store.set(key, entry);
    
    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.max.toString());
    headers.set('X-RateLimit-Remaining', (limit.max - entry.count).toString());
    headers.set('X-RateLimit-Reset', entry.resetTime.toString());
    
    return { headers };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { 'Retry-After': '900' } } // 15 minutes
      );
    }
    throw error;
  }
} 
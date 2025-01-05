import { CachedMedication } from './types';
import { createHash } from 'crypto';

/**
 * Creates a deterministic hash of an object
 */
export function hashObject(obj: any): string {
  const sortedObj = sortObjectDeep(obj);
  const stringified = JSON.stringify(sortedObj);
  return createHash('sha256').update(stringified).digest('hex');
}

/**
 * Sorts an object's keys recursively for consistent hashing
 */
function sortObjectDeep(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectDeep);
  }

  return Object.keys(obj)
    .sort()
    .reduce((sorted: any, key: string) => {
      sorted[key] = sortObjectDeep(obj[key]);
      return sorted;
    }, {});
}

/**
 * Checks if cached data is stale
 */
export function isDataStale(cached: CachedMedication): boolean {
  if (!cached.expiresAt) return true;
  return new Date() > new Date(cached.expiresAt);
}

/**
 * Calculates exponential backoff time for retries
 */
export function calculateBackoff(retryCount: number, baseDelay = 1000): number {
  const maxDelay = 1000 * 60 * 5; // 5 minutes
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  // Add jitter
  return delay * (0.5 + Math.random());
}

/**
 * Gets network information
 */
export function getNetworkInfo(): {
  type: string;
  effectiveType: string;
  downlink: number;
} {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return {
      type: conn.type,
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
    };
  }
  return {
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
  };
}

/**
 * Generates a unique device ID
 */
export function generateDeviceId(): string {
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const timestamp = Date.now();
  
  return hashObject({
    platform,
    userAgent,
    screenResolution,
    timestamp,
  });
}

/**
 * Compresses data for storage
 */
export async function compressData(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const compressed = await compress(encoder.encode(jsonString));
  return btoa(String.fromCharCode(...compressed));
}

/**
 * Decompresses stored data
 */
export async function decompressData(compressed: string): Promise<any> {
  const binaryString = atob(compressed);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decompressed = await decompress(bytes);
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decompressed));
}

/**
 * Compresses a Uint8Array using CompressionStream
 */
async function compress(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  const output = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    output.push(value);
  }
  return new Uint8Array(output.flat());
}

/**
 * Decompresses a Uint8Array using DecompressionStream
 */
async function decompress(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  const output = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    output.push(value);
  }
  return new Uint8Array(output.flat());
}



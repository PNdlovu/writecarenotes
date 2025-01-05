/**
 * @writecarenotes.com
 * @fileoverview Cache service for application-wide caching
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Provides in-memory caching functionality with TTL support
 */

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const expiry = options.ttl ? Date.now() + options.ttl : null;
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

export const cacheService = new CacheService(); 




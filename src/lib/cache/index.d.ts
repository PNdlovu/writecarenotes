/**
 * @writecarenotes.com
 * @fileoverview Type declarations for cache service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  namespace?: string;
  compression?: boolean;
}

export class CacheService<T> {
  constructor(namespace: string);
  set(key: string, value: T, options?: CacheOptions): Promise<void>;
  get<R = T>(key: string): Promise<R | null>;
  delete(key: string): Promise<void>;
  clear(namespace?: string): Promise<void>;
  clearByTag(tag: string): Promise<void>;
} 
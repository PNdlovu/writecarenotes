/**
 * @fileoverview Cache utility for server-side caching
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class Cache {
  private store: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, value: T, ttl = this.defaultTTL): void {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new Cache();
export default cache; 




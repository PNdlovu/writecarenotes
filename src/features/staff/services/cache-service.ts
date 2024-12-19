import { redis } from '@/lib/redis';

export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds
  private static readonly PREFIX = 'staff:';

  static async get<T>(key: string): Promise<T | null> {
    const cachedData = await redis.get(this.PREFIX + key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  static async set(key: string, data: any, ttl = this.DEFAULT_TTL): Promise<void> {
    await redis.setex(this.PREFIX + key, ttl, JSON.stringify(data));
  }

  static async delete(key: string): Promise<void> {
    await redis.del(this.PREFIX + key);
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(this.PREFIX + pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  // Specific cache methods for staff module
  static async getStaffSchedules(organizationId: string, startDate: string, endDate: string) {
    return this.get(`schedules:${organizationId}:${startDate}:${endDate}`);
  }

  static async setStaffSchedules(organizationId: string, startDate: string, endDate: string, data: any) {
    await this.set(`schedules:${organizationId}:${startDate}:${endDate}`, data);
  }

  static async invalidateStaffSchedules(organizationId: string) {
    await this.invalidatePattern(`schedules:${organizationId}:*`);
  }

  static async getTrainingData(organizationId: string) {
    return this.get(`training:${organizationId}`);
  }

  static async setTrainingData(organizationId: string, data: any) {
    await this.set(`training:${organizationId}`, data);
  }

  static async invalidateTrainingData(organizationId: string) {
    await this.delete(`training:${organizationId}`);
  }
}



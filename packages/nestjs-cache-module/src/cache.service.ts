// cache.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Optional } from '@nestjs/common';
import * as Redis from 'ioredis';
import { CACHE_MODULE_OPTIONS, CacheServiceOptions } from './cache.options';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis.Redis;
  private prefix: string;

  constructor(@Inject(CACHE_MODULE_OPTIONS) @Optional() private options?: CacheServiceOptions) {
    this.prefix = this.options?.keyPrefix || '';

    if (this.options?.redisUrl) {
      // If redisUrl is provided, use it to create the Redis client
      this.client = new Redis.Redis(this.options.redisUrl, this.options.redisOptions);
    } else {
      // Otherwise, use redisOptions or default to localhost
      const redisOptions = this.options?.redisOptions || {};
      this.client = new Redis.Redis(redisOptions);
    }
  }

  onModuleInit() {
    // Optional initialization logic
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    const redisKey = this.getKey(key);
    if (ttl) {
      await this.client.set(redisKey, serializedValue, 'EX', ttl);
    } else {
      await this.client.set(redisKey, serializedValue);
    }
  }

  /**
   * Retrieves a value from the cache. If the key is not found and a callback is provided,
   * the callback will be executed to obtain the value, which is then stored in the cache with the provided TTL.
   *
   * @param key - The cache key.
   * @param callback - Optional async function to compute the value if not found.
   * @param ttl - Time-to-live in seconds for the cached value if the callback is used.
   * @returns The cached value or the result of the callback.
   */
  async get<T>(
    key: string,
    callback?: () => Promise<T>,
    ttl?: number,
  ): Promise<T | null> {
    const redisKey = this.getKey(key);
    const cachedValue = await this.client.get(redisKey);
    if (cachedValue) {
      return JSON.parse(cachedValue) as T;
    } else if (callback && ttl !== undefined) {
      const result = await callback();
      await this.set(key, result, ttl);
      return result;
    } else {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    const redisKey = this.getKey(key);
    await this.client.del(redisKey);
  }

  async keys(pattern: string): Promise<string[]> {
    const redisPattern = this.getKey(pattern);
    return await this.client.keys(redisPattern);
  }

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }
}

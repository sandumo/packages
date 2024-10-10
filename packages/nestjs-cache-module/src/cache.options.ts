import * as Redis from 'ioredis';

// cache.service.ts (or cache.interfaces.ts if you have one)
export interface CacheServiceOptions {
  redisOptions?: Redis.RedisOptions;
  redisUrl?: string;
  keyPrefix?: string;
}

export const CACHE_MODULE_OPTIONS = Symbol('CACHE_MODULE_OPTIONS');


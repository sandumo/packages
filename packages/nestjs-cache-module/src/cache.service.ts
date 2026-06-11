// cache.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Optional } from '@nestjs/common';
import * as Redis from 'ioredis';
import { CACHE_MODULE_OPTIONS, CacheServiceOptions } from './cache.options';

export type ProcessStatus = 'running' | 'cached' | 'not_found' | 'error';

export interface ProcessStatusResult {
  status: ProcessStatus;
  expiresIn?: number;
  error?: string;
}

interface ProcessMetadata {
  __meta: {
    status: 'running' | 'error';
    startTime: number;
    error?: string;
  };
}

interface InFlightProcess<T> {
  promise: Promise<T>;
  startTime: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis.Redis;
  private prefix: string;
  private inFlightProcesses: Map<string, InFlightProcess<any>> = new Map();

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
   * @param ignore - Whether to ignore the cached value if the callback is used.
   * @returns The cached value or the result of the callback.
   */
  async get<T>(
    key: string,
    callback?: () => Promise<T>,
    ttl?: number,
    ignore?: boolean,
  ): Promise<T | null> {
    const redisKey = this.getKey(key);
    let cachedValue = null;

    if (!ignore) {
      cachedValue = await this.client.get(redisKey);
    }

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

  async command(command: string, ...args: string[]): Promise<any> {
    return await this.client.call(command, ...args);
  }

  /**
   * Executes a callback under a specific key with process deduplication.
   * If another call is made with the same key while the process is running,
   * it will wait for the same process instead of triggering the callback again.
   * The result is cached for the specified TTL in seconds.
   * Works across multiple app instances using Redis for state coordination.
   *
   * @param key - The cache key for this process.
   * @param callback - The async function to execute if not cached or running.
   * @param ttl - Time-to-live in seconds for the cached result.
   * @returns The result of the callback or cached value.
   */
  async processOnce<T>(key: string, callback: () => Promise<T>, ttl: number): Promise<T> {
    // First, check if we already have this process running locally
    const localInFlight = this.inFlightProcesses.get(key);
    if (localInFlight) {
      return await localInFlight.promise;
    }

    // Use the existing get method to check cache and handle metadata
    const cachedData = await this.get<T | ProcessMetadata>(key);

    if (cachedData) {
      // Check if it's metadata (process running or error)
      if (this.isProcessMetadata(cachedData)) {
        if (cachedData.__meta.status === 'error') {
          throw new Error(cachedData.__meta.error || 'Process failed');
        }
        // Process is running in another instance, wait for it
        return await this.waitForProcess<T>(key, ttl);
      }
      // It's actual cached data
      return cachedData as T;
    }

    // Try to claim the process execution using SET NX (set if not exists)
    const redisKey = this.getKey(key);
    const metadata: ProcessMetadata = {
      __meta: {
        status: 'running',
        startTime: Date.now(),
      },
    };

    // Use SET with NX (only set if not exists) and EX (expiry) options
    // This provides distributed locking - only one instance will succeed
    const lockTtl = Math.max(ttl, 300); // At least 5 minutes for long-running processes
    const claimed = await this.client.set(
      redisKey,
      JSON.stringify(metadata),
      'EX',
      lockTtl,
      'NX'
    );

    if (!claimed) {
      // Another instance claimed it, wait for the result
      return await this.waitForProcess<T>(key, ttl);
    }

    // We claimed it, execute the process
    const processPromise = this.executeProcess(key, callback, ttl);

    // Track locally to deduplicate within this instance
    this.inFlightProcesses.set(key, {
      promise: processPromise,
      startTime: Date.now(),
    });

    return await processPromise;
  }

  /**
   * Helper method to check if data is process metadata
   */
  private isProcessMetadata(data: any): data is ProcessMetadata {
    return data && typeof data === 'object' && '__meta' in data;
  }

  /**
   * Executes the process and handles success/error states
   */
  private async executeProcess<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    try {
      const result = await callback();
      // Store the actual result with the specified TTL
      await this.set(key, result, ttl);
      // Clean up local tracking
      this.inFlightProcesses.delete(key);
      return result;
    } catch (error) {
      // Store error state in Redis so other instances know it failed
      const errorMetadata: ProcessMetadata = {
        __meta: {
          status: 'error',
          startTime: Date.now(),
          error: error instanceof Error ? error.message : String(error),
        },
      };
      // Store error with a short TTL (10 seconds) so retries can happen soon
      await this.set(key, errorMetadata, 10);
      // Clean up local tracking
      this.inFlightProcesses.delete(key);
      throw error;
    }
  }

  /**
   * Waits for a process running in another instance to complete
   */
  private async waitForProcess<T>(key: string, maxWaitTime: number): Promise<T> {
    const startTime = Date.now();
    const maxWait = maxWaitTime * 1000; // Convert to milliseconds
    const pollInterval = 100; // Poll every 100ms

    while (Date.now() - startTime < maxWait) {
      await this.sleep(pollInterval);

      const data = await this.get<T | ProcessMetadata>(key);

      if (!data) {
        // Process disappeared, might have been deleted or expired
        throw new Error('Process state lost');
      }

      if (this.isProcessMetadata(data)) {
        if (data.__meta.status === 'error') {
          throw new Error(data.__meta.error || 'Process failed');
        }
        // Still running, continue waiting
        continue;
      }

      // Got the actual result
      return data as T;
    }

    throw new Error('Timeout waiting for process to complete');
  }

  /**
   * Helper method to sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the current status of a process/cache entry.
   * Checks both Redis state (for distributed processes) and local state.
   *
   * @param key - The cache key to check.
   * @returns Status information including whether it's running, cached, or not found.
   */
  async getProcessStatus(key: string): Promise<ProcessStatusResult> {
    const redisKey = this.getKey(key);

    // Check Redis for the value or metadata
    const data = await this.get<any>(key);

    if (!data) {
      return {
        status: 'not_found',
      };
    }

    // Check if it's process metadata
    if (this.isProcessMetadata(data)) {
      if (data.__meta.status === 'error') {
        return {
          status: 'error',
          error: data.__meta.error,
        };
      }
      return {
        status: 'running',
      };
    }

    // It's cached data, get TTL
    const ttl = await this.client.ttl(redisKey);
    return {
      status: 'cached',
      expiresIn: ttl > 0 ? ttl : undefined,
    };
  }

  /**
   * Scans the cache for keys matching a pattern.
   * @param pattern - The pattern to match.
   * @param count - The number of keys to return per page.
   * @returns The keys that match the pattern.
   */
  async scan(pattern: string, count = 100): Promise<string[]> {
    const redisPattern = this.getKey(pattern);
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, batch] = await this.command(
        'SCAN',
        cursor,
        'MATCH',
        redisPattern,
        'COUNT',
        String(count),
      );

      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');

    return keys;
  }

  /**
   * Unlinks keys matching a pattern.
   * @param pattern - The pattern to match.
   * @param batchSize - The number of keys to unlink per batch.
   * @returns The number of keys deleted.
   */
  async unlink(pattern: string, batchSize = 100): Promise<number> {
    const keys = await this.scan(pattern);

    let deleted = 0;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const count = await this.command('UNLINK', ...batch);
      deleted += Number(count);
    }

    return deleted;
  }
}

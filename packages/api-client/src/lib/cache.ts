import { config } from './config';

class Cache {
  private storage: any = {};

  private formatKey(key: any[]): string {
    return key.map(k => JSON.stringify(k)).join('.');
  }

  set(key: any[], value: any) {
    this.storage[this.formatKey(key)] = value;
  }

  async get<T>(key: any, callback?: () => Promise<T>): Promise<T | null> {
    let result = this.storage[this.formatKey(key)];

    if (!result && callback) {
      result = await callback();

      if (result) {
        this.set(key, result);
      }
    }

    return result || null;
  }

  remove(key: any[]) {
    delete this.storage[this.formatKey(key)];
    config.queryClient.invalidateQueries(key);
  }

  invalidate(key: any[]) {
    delete this.storage[this.formatKey(key)];
    config.queryClient.invalidateQueries(key);
  }
}

export const cache = new Cache();

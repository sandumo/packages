class Config {
  _queryClient: any;

  get queryClient(): any {
    return this._queryClient;
  }

  set queryClient(queryClient: any) {
    this._queryClient = queryClient;
  }
}

export const config = new Config();

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

type RequestOptions = {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  queryParams?: Record<string, string>;
  body?: Record<string, any>;
}

function request({
  method,
  path,
  queryParams,
  body,
}: RequestOptions) {

  // axios[method](path, {

}

export function getQueryKey(path: string) {
  return path.split('/').filter(part => !!part);
}

export function toFormData(data: Record<string, any>) {
  const formData = new FormData();

  for (const key in data) {
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        formData.append(key, item);
      }
    } else if (data[key] && typeof data[key] === 'object') {
      Object.keys(data[key]).forEach(subKey => {
        if (subKey) {
          formData.append(`${key}[${subKey}]`, data[key][subKey]);
        }
      });
    } else {
      let value = data[key];

      if (value === null || value === undefined) {
        value = '';
      }

      formData.append(key, value);
    }
  }

  return formData;
}

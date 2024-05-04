
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

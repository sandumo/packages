import { BaseSyntheticEvent, FormEvent } from 'react';

export default function handleSubmit<T extends Record<string, any>>(handler: (data: T) => Promise<void> | void): (event: FormEvent<HTMLFormElement>) => Promise<void> {
  return async (event: FormEvent<HTMLFormElement>) => {
    // console.log('[x] epta got here');

    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const files = formData.getAll('files');

    // const targetData = new FormData(event.target);

    const e = event as BaseSyntheticEvent;

    // console.log('[x] event', event);

    const data = Object.fromEntries((new FormData(event.currentTarget) as any).entries()) as Record<string, any>;

    const resultData: Record<string, any> = {};

    for (const key in data) {
      const keyParts = key.split(':');

      if (keyParts.length === 2) {
        const [_key, type] = keyParts;

        if (type === 'json') {
          resultData[_key] = JSON.parse(data[key]);
        } else {
          resultData[_key] = data[key];
        }
      } else {
        resultData[key] = data[key];
      }
    }

    for (const [name, file] of Object.values(e.target.elements).map((e: any) => [e.name, e.files])) {
      if (file) {
        if (file instanceof FileList) {
          resultData[name] = Array.from(file);
        } else {
          resultData[name] = file;
        }
      }
    }

    // console.log('[x] files', Object.values(e.target.elements).map((e: any) => [e.name, e.files]));

    await handler(resultData as T);
  };
}

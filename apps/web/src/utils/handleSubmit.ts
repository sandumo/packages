import { FormEvent } from 'react';

export default function handleSubmit<T extends Record<string, any>>(handler: (data: T) => Promise<void>): (event: FormEvent<HTMLFormElement>) => Promise<void> {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, any>;

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
    await handler(resultData as T);
  };
}

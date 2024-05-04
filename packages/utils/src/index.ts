export * from './types';

/**
 * Generate an array of numbers
 * @param start Number to start from
 * @param end Number to end at
 * @returns Array of numbers from start to end
 */
export function range(start: number, end: number) { return Array.from({ length: end - start }, (_, i) => start + i); }

/**
 * Wait for a given amount of time
 * @param ms Number of milliseconds to wait
 */
export function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

/**
 * Generate a random string
 * @param length Length of the string to generate
 * @returns Random string
 */
export function randomStringFromLength(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export const setCookie = (
  name: string,
  value: string,
  exdays: number = 1,
  domain = '',
  path = '/',
) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  const cookie = `${name}=${value};${expires};${
    domain !== '' ? `domain=${domain};` : ''
  }path=${path}`;
  document.cookie = cookie;
};

export const getCookie = (cname: string): string => {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export const getQueryParams = () => new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop as string),
});

/**
 * Get a random number of a given length
 * @param length Length of the number to generate
 * @returns Random number
 */
export const getRandomNumberOfLenght = (length: number) => Math.floor(Math.random() * (10 ** length));

type NormalizedTextOptions = {
  replaceMultipleSpacesWithSingleSpace?: boolean;
}

const defaultNormalizedTextOptions: NormalizedTextOptions = {
  replaceMultipleSpacesWithSingleSpace: true,
};

/**
 * Normalize a string: lowercase, remove diacritics, replace special characters with their spaces
 */
export const normalizeText = (
  text: string,
  options: NormalizedTextOptions = defaultNormalizedTextOptions,
) => {
  let result = text;

  result = result
    .toLowerCase()
    .replace('ă', 'a')
    .replace('â', 'a')
    .replace('î', 'i')
    .replace('ș', 's')
    .replace('ț', 't')
    .replace(/[^a-z0-9]/g, ' ');

  if (options.replaceMultipleSpacesWithSingleSpace) {
    result = result.replace(/\s+/g, ' ');
  }

  return result.trim();
};

export * from './hash';
// export { default as pick } from 'lodash.pick';
// export { default as omit } from 'lodash.omit';

export function omit<T extends Record<string, any>, K extends string[]>(object?: T, ...keys: K): Pick<T, Exclude<keyof T, K[number]>> {
  if (!object) return object as any;

  const result = { ...object };

  keys.forEach((key) => {
    delete result[key as any];
  });

  return result;
}

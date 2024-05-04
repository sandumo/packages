export function hash(value: any) {
  if (value === undefined) return 0;

  const str = JSON.stringify(value);

  let hash = 0, i, chr;

  if (str.length === 0) return hash;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}

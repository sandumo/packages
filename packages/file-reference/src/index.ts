export class FileReference {
  name: string;
  path: string;
  size: number;
  type: string;
}

const eptaToFile = (value: any) => {
  if (value instanceof File) {
    return value;
  }

  const blob = new Blob([JSON.stringify(value)], { type: 'application/file-reference' });

  return new File([blob], value?.name || 'file.json', { type: 'application/file-reference' });
};

import { useState } from 'react';

type FileUploadChildrenProps = {
  props: Record<string, any>;
  input: React.ReactNode;
  previewUrl: string | null;
  file: File | null;
  reset: () => void;
}

type FileUploadProps = {
  name?: string;
  onFilePick?: (file: File) => void;
  children: ({ props, input, previewUrl }: FileUploadChildrenProps) => JSX.Element;
}

export default function FileUpload({ name, children, onFilePick }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return children({
    props: {
      component: 'label',
    },
    previewUrl,
    file,
    reset,
    input: (
      <input
        name={name}
        type="file"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setFile(e.target.files?.[0]);
            onFilePick?.(e.target.files?.[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files?.[0]));
          }
        }}
      />
    ),
  });
}

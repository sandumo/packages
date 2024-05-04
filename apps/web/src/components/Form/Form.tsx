import { Box } from '@mui/material';
import { handleSubmit } from '@utils';

type FormProps<T extends Record<string, any>> = {
  children: React.ReactNode;
  onSubmit: (data: T) => Promise<void>;
}

export default function Form<T extends Record<string, any>>({ children, onSubmit }: FormProps<T>) {
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {children}
    </Box>
  );
}

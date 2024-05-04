import { Box } from '@mui/material';

interface Props {
  children?: React.ReactNode;
  fullWidth?: boolean;
  grayBackground?: boolean;
  footer?: boolean;
}

export const ExampleLayout = ({
  children,
  grayBackground = false,
}: Props) => {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      ...(grayBackground ? { bgcolor: '#F4F5FA' } : {}),
    }}>
      {children}
    </Box>
  );
};

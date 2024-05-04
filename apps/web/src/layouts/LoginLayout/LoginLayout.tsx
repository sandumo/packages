import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

type LoginLayoutProps = {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      overflow: 'hidden',
      minHeight: '100vh',
      '@media (pointer:none), (pointer:coarse)': {
        minHeight: '100dvh',
      },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 4,
    }}>
      {children}
    </Box>
  );
}

import { Link } from '@components';
import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

export default function ErrorLayout({ children }: PropsWithChildren<{}>) {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',

      alignItems: 'center',
      justifyContent: 'center',

      '& > *:not(:last-child)': {
        // marginRight: 6,
        marginBottom: 2,
      },

      flexDirection: 'column',
    }}>
      <Box sx={{ fontSize: 32 }}>
        {children}
      </Box>

      {/* <Box>|</Box> */}

      <Box>
        <Link href="/" sx={{ color: 'primary.main', '&:hover': { color: 'primary.main' } }}>Go home</Link>
      </Box>
    </Box>
  );
}

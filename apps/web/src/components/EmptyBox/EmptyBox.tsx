import { Box } from '@mui/material';

interface EmptyBoxProps {
  children?: React.ReactNode;
}

export default function EmptyBox({ children }: EmptyBoxProps) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: '0px 0px 8px rgba(17, 24, 40, 0.16)',

      // minHeight: 100,
      py: 7,
      px: 4,
      backgroundImage: theme => `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%23${theme.palette.primary.main.slice(1)}' stroke-width='2' stroke-dasharray='16%2c 12' stroke-dashoffset='10' stroke-linecap='round'/%3e%3c/svg%3e");`,
    }}>
      {children}
    </Box>
  );
}

import { Box, SxProps, Typography } from '@mui/material';

interface DashboardCardProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  titleSx?: SxProps;
}

export default function DashboardCard({ title, actions, children, titleSx = {} }: DashboardCardProps) {
  return (
    <Box sx={{
      // filter: 'drop-shadow(0px 0px 8px rgba(17, 24, 40, 0.16))',
      // boxShadow: 6,

      border: 1,
      borderColor: '#00000010',
      backgroundColor: 'background.paper',
      borderRadius: 1,
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 4,
        height: 56,
      }}>
        <Typography variant="h6" sx={titleSx}>{title}</Typography>
        {actions ? <Box>{actions}</Box> : null}

      </Box>
      <Box sx={{ px: 4, pb: 4 }}>
        {children}
      </Box>
    </Box>
  );
}

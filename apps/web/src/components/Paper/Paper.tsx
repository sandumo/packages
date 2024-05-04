import { SxProps, Paper as MuiPaper } from '@mui/material';

interface PaperProps {
  children: React.ReactNode;
  sx?: SxProps;
}

export default function Paper({ children, sx = {} }: PaperProps) {
  return <MuiPaper sx={{ boxShadow: 6, ...sx }}>{children}</MuiPaper>;
}

import { Box } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ textAlign: 'center', fontSize: 12, color: 'text.disabled', py: 4 }}>
      Jobber &copy; {new Date().getFullYear()}
    </Box>
  );
}

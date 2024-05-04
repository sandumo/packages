import Typography from '@components/Typography';
import CloudDownloadIcon from '@icons/CloudDownloadIcon';
import { Box } from '@mui/material';

export default function UploadComponent() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: '0px 0px 8px rgba(17, 24, 40, 0.16)',
      py: 7,
      px: 4,
      border: '1px solid #BDBDBD',
      width: '100%',
    }}>
      <CloudDownloadIcon sx={{ color: 'grey.500', fontSize: 60, mb: 1 }} />
      <Typography sx={{ fontSize: '17px', mb: 2 }}>Încarcă un fișier</Typography>
      <Typography sx={{ fontSize: '13px', textAlign: 'center' }}>Formatele posibile .png (max 20MB)</Typography>
    </Box>
  );
}
